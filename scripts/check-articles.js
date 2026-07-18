import pg from 'pg';
import fs from 'fs';

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

async function checkArticles() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM public.articles');
    console.log(`Found ${res.rows.length} articles in Supabase:`);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error querying articles:', err);
  } finally {
    await client.end();
  }
}

checkArticles();
