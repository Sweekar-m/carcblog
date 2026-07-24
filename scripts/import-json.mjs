import fs from 'fs';
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

const jsonPath = 'D:/scraper/founders scarapper/output/founders.json';

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

async function runImport() {
  console.log("=== STARTING IMPORT FROM FOUNDERS.JSON ===");
  await client.connect();

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const items = JSON.parse(rawData);
  console.log(`Loaded ${items.length} startup records from JSON.`);

  // Truncate tables for a fresh sync
  await client.query(`TRUNCATE public.founder_startups, public.founders, public.startups RESTART IDENTITY CASCADE;`);

  const usedStartupSlugs = new Set();
  const usedFounderSlugs = new Set();

  const startupNameToId = new Map();
  const founderKeyToId = new Map();

  const startupRecords = [];
  const founderRecordsMap = new Map(); // key -> founder record
  const linkPairs = [];

  for (const item of items) {
    const companyName = item.company_name?.trim();
    if (!companyName) continue;

    const normCompanyName = companyName.toLowerCase();
    if (startupNameToId.has(normCompanyName)) continue;

    let baseSlug = slugify(companyName) || 'startup';
    let slug = baseSlug;
    let counter = 1;
    while (usedStartupSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    usedStartupSlugs.add(slug);

    startupRecords.push({
      normCompanyName,
      name: companyName,
      slug,
      website: item.company_url?.trim() || null,
      description: item.description?.trim() || null,
      industry: item.industry?.trim() || null,
      country: item.country?.trim() || null,
      city: item.city?.trim() || null
    });
    startupNameToId.set(normCompanyName, true);

    // Process founders
    if (Array.isArray(item.founders)) {
      for (const f of item.founders) {
        const founderName = f.name?.trim();
        if (!founderName) continue;

        const linkedinUrl = f.linkedin?.trim() || null;
        const twitterUrl = f.twitter?.trim() || null;
        const email = f.email?.trim() || null;
        const phone = f.phone?.trim() || null;
        const jobTitle = f.title?.trim() || 'Founder';

        const normLinkedin = linkedinUrl ? linkedinUrl.toLowerCase().replace(/\/$/, '') : null;
        const founderKey = normLinkedin || founderName.toLowerCase();

        if (!founderRecordsMap.has(founderKey)) {
          let baseFSlug = slugify(founderName) || 'founder';
          let fSlug = baseFSlug;
          let fCounter = 1;
          while (usedFounderSlugs.has(fSlug)) {
            fSlug = `${baseFSlug}-${fCounter++}`;
          }
          usedFounderSlugs.add(fSlug);

          founderRecordsMap.set(founderKey, {
            founderKey,
            name: founderName,
            slug: fSlug,
            job_title: jobTitle,
            linkedin_url: linkedinUrl,
            twitter_url: twitterUrl,
            email,
            phone,
            country: item.country?.trim() || null,
            city: item.city?.trim() || null
          });
        }

        linkPairs.push({
          founderKey,
          normCompanyName,
          jobTitle
        });
      }
    }
  }

  // 1. Insert Startups in chunks of 200
  console.log(`Inserting ${startupRecords.length} startups...`);
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

  // 2. Insert Founders in chunks of 200
  const founderRecords = Array.from(founderRecordsMap.values());
  console.log(`Inserting ${founderRecords.length} founders...`);
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

  // 3. Insert Founder-Startup links in chunks of 200
  console.log(`Inserting founder-startup relationships...`);
  const validLinkRecords = [];
  const linkSet = new Set();

  for (const lp of linkPairs) {
    const founderId = founderKeyToId.get(lp.founderKey);
    const startupId = startupNameToId.get(lp.normCompanyName);

    if (!founderId || !startupId || founderId === true || startupId === true) continue;

    const dedupeKey = `${founderId}|||${startupId}`;
    if (!linkSet.has(dedupeKey)) {
      linkSet.add(dedupeKey);
      validLinkRecords.push({
        founderId,
        startupId,
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
      VALUES ${valueTuples.join(', ')};
    `;

    await client.query(query, params);
  }

  console.log("=== IMPORT COMPLETE ===");
  console.log(`Summary:
  - Startups Inserted: ${startupRecords.length}
  - Founders Inserted: ${founderRecords.length}
  - Links Inserted: ${validLinkRecords.length}`);

  await client.end();
}

runImport().catch(err => {
  console.error("IMPORT ERROR:", err);
  process.exit(1);
});
