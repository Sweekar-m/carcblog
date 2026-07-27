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

const dbUrl = envVars.DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("No DATABASE_URL found in .env");
  process.exit(1);
}

const { Client } = pg;
const client = new Client({ connectionString: dbUrl });

async function run() {
  await client.connect();
  console.log("Connected to database. Applying 002_create_investors.sql...");
  
  const sql = fs.readFileSync('db/migrations/002_create_investors.sql', 'utf8');
  await client.query(sql);
  
  console.log("Successfully created public.investors table, RLS policies, and indexes!");
  await client.end();
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
