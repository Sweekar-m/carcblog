import fs from 'fs';
import readline from 'readline';
import pg from 'pg';

const envFile = fs.readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[match[1]] = value.trim();
  }
});

const foundersPath = 'D:/scraper/founders scarapper/output/founders_clean.csv';
const startupsPath = 'D:/scraper/founders scarapper/output/startups_clean.csv';

const { Client } = pg;
const client = new Client({ connectionString: envVars.DATABASE_URL });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function runImport() {
  console.log("=== STARTING FAST BATCH IMPORT ===");
  await client.connect();

  // Clear existing directory tables for a clean import
  await client.query(`TRUNCATE public.founder_startups, public.founders, public.startups RESTART IDENTITY CASCADE;`);

  const failedRows = [];
  const usedStartupSlugs = new Set();
  const usedFounderSlugs = new Set();

  const startupNameToId = new Map();
  const founderKeyToId = new Map();

  // -------------------------------------------------------------
  // Phase 1: Parse & Batch Insert Startups
  // -------------------------------------------------------------
  console.log("\n--- Phase 1: Importing Startups from startups_clean.csv ---");
  const startupsStream = fs.createReadStream(startupsPath, { encoding: 'utf8' });
  const rlStartups = readline.createInterface({ input: startupsStream, crlfDelay: Infinity });

  let sHeader = null;
  let multiLineBuffer = '';
  const startupRecords = [];

  for await (const line of rlStartups) {
    if (!line.trim() && !multiLineBuffer) continue;
    if (multiLineBuffer) multiLineBuffer += '\n' + line;
    else multiLineBuffer = line;

    const totalQuotes = (multiLineBuffer.match(/"/g) || []).length;
    if (totalQuotes % 2 !== 0) continue;

    const parsed = parseCSVLine(multiLineBuffer);
    multiLineBuffer = '';

    if (!sHeader) {
      sHeader = parsed;
      continue;
    }

    const companyName = parsed[0]?.trim();
    const companyUrl = parsed[1]?.trim() || null;
    const description = parsed[2]?.trim() || null;
    const industry = parsed[3]?.trim() || null;
    const country = parsed[4]?.trim() || null;
    const city = parsed[5]?.trim() || null;
    // NOTE: parsed[6] ('founders' embedded column in startups_clean.csv) is IGNORED entirely!

    if (!companyName) {
      failedRows.push({ source: 'startups', reason: 'Missing company_name', row: parsed });
      continue;
    }

    const normName = companyName.toLowerCase();
    if (startupNameToId.has(normName)) continue;

    let baseSlug = slugify(companyName) || 'startup';
    let slug = baseSlug;
    let counter = 1;
    while (usedStartupSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    usedStartupSlugs.add(slug);

    startupRecords.push({
      normName,
      name: companyName,
      slug,
      website: companyUrl,
      description,
      industry,
      country,
      city
    });

    // Mark as mapped placeholder
    startupNameToId.set(normName, true);
  }

  // Batch insert startups in chunks of 200
  const CHUNK_SIZE = 200;
  for (let i = 0; i < startupRecords.length; i += CHUNK_SIZE) {
    const chunk = startupRecords.slice(i, i + CHUNK_SIZE);
    const valueTuples = [];
    const params = [];
    let pIdx = 1;

    chunk.forEach(r => {
      valueTuples.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);
      params.push(r.name, r.slug, r.website, r.description, r.industry, r.country, r.city);
    });

    const query = `
      INSERT INTO public.startups (name, slug, website, description, industry, country, city)
      VALUES ${valueTuples.join(', ')}
      RETURNING id, name;
    `;

    const res = await client.query(query, params);
    res.rows.forEach(row => {
      startupNameToId.set(row.name.toLowerCase(), row.id);
    });
  }

  console.log(`Phase 1 Complete: Successfully inserted ${startupRecords.length} startups.`);

  // -------------------------------------------------------------
  // Phase 2: Parse & Batch Insert Founders and Links
  // -------------------------------------------------------------
  console.log("\n--- Phase 2: Importing Founders and Links from founders_clean.csv ---");
  const foundersStream = fs.createReadStream(foundersPath, { encoding: 'utf8' });
  const rlFounders = readline.createInterface({ input: foundersStream, crlfDelay: Infinity });

  let fHeader = null;
  const founderRecords = [];
  const linkPairs = [];

  for await (const line of rlFounders) {
    if (!line.trim()) continue;
    const parsed = parseCSVLine(line);

    if (!fHeader) {
      fHeader = parsed;
      continue;
    }

    const companyName = parsed[0]?.trim();
    const founderName = parsed[1]?.trim();
    const jobTitle = parsed[2]?.trim() || null;
    const linkedinUrl = parsed[3]?.trim() || null;
    const twitterUrl = parsed[4]?.trim() || null;
    const email = parsed[5]?.trim() || null;
    const phone = parsed[6]?.trim() || null;
    const country = parsed[7]?.trim() || null;
    const city = parsed[8]?.trim() || null;

    if (!founderName) {
      failedRows.push({ source: 'founders', reason: 'Missing founder_name', row: parsed });
      continue;
    }

    if (!companyName) {
      failedRows.push({ source: 'founders', reason: 'Missing company_name', row: parsed });
      continue;
    }

    const normCompanyName = companyName.toLowerCase();
    const startupId = startupNameToId.get(normCompanyName);

    if (!startupId || startupId === true) {
      failedRows.push({ source: 'founders', reason: `Startup name "${companyName}" not found in startups table`, row: parsed });
      continue;
    }

    const normLinkedin = linkedinUrl ? linkedinUrl.toLowerCase().replace(/\/$/, '') : null;
    const founderKey = normLinkedin || founderName.toLowerCase();

    if (!founderKeyToId.has(founderKey)) {
      let baseSlug = slugify(founderName) || 'founder';
      let slug = baseSlug;
      let counter = 1;
      while (usedFounderSlugs.has(slug)) {
        slug = `${baseSlug}-${counter++}`;
      }
      usedFounderSlugs.add(slug);

      founderRecords.push({
        founderKey,
        name: founderName,
        slug,
        job_title: jobTitle,
        linkedin_url: linkedinUrl,
        twitter_url: twitterUrl,
        email,
        phone,
        country,
        city
      });
      founderKeyToId.set(founderKey, true); // temporary mark
    }

    linkPairs.push({
      founderKey,
      startupId,
      jobTitle
    });
  }

  // Batch insert Founders in chunks of 200
  for (let i = 0; i < founderRecords.length; i += CHUNK_SIZE) {
    const chunk = founderRecords.slice(i, i + CHUNK_SIZE);
    const valueTuples = [];
    const params = [];
    let pIdx = 1;

    chunk.forEach(r => {
      valueTuples.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);
      params.push(r.name, r.slug, r.job_title, r.linkedin_url, r.twitter_url, r.email, r.phone, r.country, r.city);
    });

    const query = `
      INSERT INTO public.founders (name, slug, job_title, linkedin_url, twitter_url, email, phone, country, city)
      VALUES ${valueTuples.join(', ')}
      RETURNING id, name, linkedin_url;
    `;

    const res = await client.query(query, params);
    res.rows.forEach(row => {
      const normL = row.linkedin_url ? row.linkedin_url.toLowerCase().replace(/\/$/, '') : null;
      const key = normL || row.name.toLowerCase();
      founderKeyToId.set(key, row.id);
    });
  }

  console.log(`Phase 2 Complete: Successfully inserted ${founderRecords.length} unique founders.`);

  // -------------------------------------------------------------
  // Phase 3: Batch Insert Links into founder_startups
  // -------------------------------------------------------------
  console.log("\n--- Phase 3: Inserting Founder-Startup Links ---");
  const validLinkRecords = [];
  const linkSet = new Set();

  for (const lp of linkPairs) {
    const founderId = founderKeyToId.get(lp.founderKey);
    if (!founderId || founderId === true) continue;

    const dedupeKey = `${founderId}|||${lp.startupId}`;
    if (!linkSet.has(dedupeKey)) {
      linkSet.add(dedupeKey);
      validLinkRecords.push({
        founderId,
        startupId: lp.startupId,
        jobTitle: lp.jobTitle
      });
    }
  }

  for (let i = 0; i < validLinkRecords.length; i += CHUNK_SIZE) {
    const chunk = validLinkRecords.slice(i, i + CHUNK_SIZE);
    const valueTuples = [];
    const params = [];
    let pIdx = 1;

    chunk.forEach(r => {
      valueTuples.push(`($${pIdx++}, $${pIdx++}, $${pIdx++})`);
      params.push(r.founderId, r.startupId, r.jobTitle);
    });

    const query = `
      INSERT INTO public.founder_startups (founder_id, startup_id, job_title)
      VALUES ${valueTuples.join(', ')}
      ON CONFLICT (founder_id, startup_id) DO NOTHING;
    `;

    await client.query(query, params);
  }

  console.log(`Phase 3 Complete: Successfully inserted ${validLinkRecords.length} founder-startup links.`);

  console.log("\n=== IMPORT SUMMARY ===");
  console.log(`- Startups imported: ${startupRecords.length}`);
  console.log(`- Unique Founders created: ${founderRecords.length}`);
  console.log(`- Founder-Startup Links created: ${validLinkRecords.length}`);
  console.log(`- Failed / Skipped Rows: ${failedRows.length}`);

  if (failedRows.length > 0) {
    console.log(`- Sample failed row reason: ${failedRows[0].reason}`);
  }

  await client.end();
}

runImport().catch(console.error);
