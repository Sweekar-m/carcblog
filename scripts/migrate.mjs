import fs from 'fs';
import path from 'path';
import pg from 'pg';

// Parse .env file
const envFilePath = path.join(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envFilePath)) {
  const envFile = fs.readFileSync(envFilePath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      envVars[match[1]] = value.trim();
    }
  });
}

const databaseUrl = envVars.DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL is missing in environment or .env file.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    const targetFile = process.argv[2];
    let migrationFiles = [];

    if (targetFile) {
      const fullPath = path.isAbsolute(targetFile) ? targetFile : path.join(process.cwd(), targetFile);
      if (!fs.existsSync(fullPath)) {
        console.error(`ERROR: Specified migration file not found: ${fullPath}`);
        process.exit(1);
      }
      migrationFiles = [fullPath];
    } else {
      const migrationsDir = path.join(process.cwd(), 'db/migrations');
      if (fs.existsSync(migrationsDir)) {
        migrationFiles = fs.readdirSync(migrationsDir)
          .filter(f => f.endsWith('.sql'))
          .sort()
          .map(f => path.join(migrationsDir, f));
      }
    }

    if (migrationFiles.length === 0) {
      console.log("No migration files found to apply.");
      return;
    }

    console.log(`=== EXECUTING DATABASE MIGRATIONS (${migrationFiles.length} file(s)) ===`);
    for (const file of migrationFiles) {
      const relativeName = path.relative(process.cwd(), file);
      console.log(`Applying: ${relativeName}...`);
      const sql = fs.readFileSync(file, 'utf8');
      await client.query(sql);
      console.log(`✓ Successfully applied ${relativeName}`);
    }
    console.log("=== ALL MIGRATIONS APPLIED SUCCESSFULLY ===");
  } catch (err) {
    console.error("Migration error:", err.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
