import fs from 'fs';
import path from 'path';
import pg from 'pg';

const envFile = fs.readFileSync('.env', 'utf8');
const envVars: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[match[1]] = value.trim();
  }
});

const dbUrl = envVars.DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("No DATABASE_URL found in .env");
  process.exit(1);
}

const jsonPath = 'D:/scraper/investors/data/openvc_investors.json';

function slugify(text: string): string {
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

interface OpenVCItem {
  investor_name?: string;
  investor_type?: string;
  profile_url?: string;
  target_geography?: string[];
  first_check?: string;
  investment_stage?: string;
  solicitation_policy?: string;
  thesis?: string;
  value_add?: string;
  reply_rate?: string;
  website?: string;
  application_url?: string | null;
  linkedin_urls?: string[];
  team_members?: Array<{ name: string; profile_url?: string; linkedin_url?: string }>;
}

async function runImport() {
  console.log("=== STARTING INVESTORS DATA IMPORT ===");
  if (!fs.existsSync(jsonPath)) {
    console.error(`Source file not found at: ${jsonPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(jsonPath, 'utf8');
  const rawData: OpenVCItem[] = JSON.parse(fileContent);
  console.log(`Loaded ${rawData.length} entries from ${jsonPath}`);

  const { Client } = pg;
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const usedSlugs = new Map<string, number>();
  let insertedCount = 0;
  let skippedCount = 0;

  const BATCH_SIZE = 100;
  let batchValues: any[][] = [];

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    const rawName = item.investor_name?.trim();

    if (!rawName) {
      skippedCount++;
      console.log(`[SKIP] Index ${i}: Missing investor name`);
      continue;
    }

    let baseSlug = slugify(rawName);
    if (!baseSlug) baseSlug = `investor-${i + 1}`;

    let slug = baseSlug;
    if (usedSlugs.has(baseSlug)) {
      const count = usedSlugs.get(baseSlug)! + 1;
      usedSlugs.set(baseSlug, count);
      slug = `${baseSlug}-${count}`;
    } else {
      usedSlugs.set(baseSlug, 1);
    }

    const name = rawName;
    const investor_type = item.investor_type?.trim() || null;
    const website = item.website?.trim() || null;
    const profile_url = item.profile_url?.trim() || null;
    const application_url = item.application_url?.trim() || null;
    const thesis = item.thesis?.trim() || null;
    const value_add = item.value_add?.trim() || null;
    const first_check = item.first_check?.trim() || null;
    const investment_stage = item.investment_stage?.trim() || null;
    const solicitation_policy = item.solicitation_policy?.trim() || null;
    const reply_rate = item.reply_rate?.trim() || null;
    const target_geography = Array.isArray(item.target_geography) && item.target_geography.length > 0 ? item.target_geography : null;
    const linkedin_urls = Array.isArray(item.linkedin_urls) && item.linkedin_urls.length > 0 ? item.linkedin_urls : null;
    const team_members = Array.isArray(item.team_members) && item.team_members.length > 0 ? JSON.stringify(item.team_members) : null;

    batchValues.push([
      name,
      slug,
      investor_type,
      website,
      profile_url,
      application_url,
      thesis,
      value_add,
      first_check,
      investment_stage,
      solicitation_policy,
      reply_rate,
      target_geography,
      linkedin_urls,
      team_members,
    ]);

    if (batchValues.length >= BATCH_SIZE || i === rawData.length - 1) {
      if (batchValues.length > 0) {
        let valuePlaceholders: string[] = [];
        let flatParams: any[] = [];
        let paramIdx = 1;

        for (const row of batchValues) {
          const rowPlaceholders: string[] = [];
          for (const val of row) {
            rowPlaceholders.push(`$${paramIdx++}`);
            flatParams.push(val);
          }
          valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
        }

        const query = `
          INSERT INTO public.investors (
            name, slug, investor_type, website, profile_url, application_url,
            thesis, value_add, first_check, investment_stage, solicitation_policy,
            reply_rate, target_geography, linkedin_urls, team_members
          ) VALUES ${valuePlaceholders.join(', ')}
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            investor_type = EXCLUDED.investor_type,
            website = EXCLUDED.website,
            profile_url = EXCLUDED.profile_url,
            application_url = EXCLUDED.application_url,
            thesis = EXCLUDED.thesis,
            value_add = EXCLUDED.value_add,
            first_check = EXCLUDED.first_check,
            investment_stage = EXCLUDED.investment_stage,
            solicitation_policy = EXCLUDED.solicitation_policy,
            reply_rate = EXCLUDED.reply_rate,
            target_geography = EXCLUDED.target_geography,
            linkedin_urls = EXCLUDED.linkedin_urls,
            team_members = EXCLUDED.team_members,
            updated_at = NOW();
        `;

        try {
          await client.query(query, flatParams);
          insertedCount += batchValues.length;
          console.log(`Progress: Processed ${insertedCount}/${rawData.length} investors...`);
        } catch (err: any) {
          console.error(`Batch insertion failed for items around ${i}:`, err.message);
          skippedCount += batchValues.length;
        }

        batchValues = [];
      }
    }
  }

  await client.end();
  console.log("\n=== IMPORT COMPLETE ===");
  console.log(`Successfully inserted/updated: ${insertedCount} investors`);
  console.log(`Skipped: ${skippedCount} investors`);
}

runImport().catch(err => {
  console.error("Fatal error during import:", err);
  process.exit(1);
});
