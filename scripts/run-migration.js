import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Parse .env manually to get database URL
const envPath = '.env';
if (!fs.existsSync(envPath)) {
  console.error('.env file not found.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const processEnv = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    processEnv[key] = value;
  }
});

const connectionString = processEnv.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

async function runMigration() {
  console.log('Connecting to PostgreSQL database...');
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected successfully. Reading migration file...');

    const migrationSql = fs.readFileSync('articles-migration.sql', 'utf8');
    console.log('Running migration...');
    
    await client.query(migrationSql);
    console.log('Migration completed successfully! Articles table created/verified.');
  } catch (err) {
    console.error('Error executing migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
