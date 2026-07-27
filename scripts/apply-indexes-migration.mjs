import fs from 'fs';
import path from 'path';
import pg from 'pg';

const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
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

const databaseUrl = envVars.DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Applying directory performance indexes migration (003_add_directory_indexes.sql)...");
    const sql = fs.readFileSync(path.join(process.cwd(), 'db/migrations/003_add_directory_indexes.sql'), 'utf8');
    await client.query(sql);
    console.log("Directory performance indexes created successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
