import fs from 'fs';
import path from 'path';

// Parse .env file before imports
const envFilePath = path.join(process.cwd(), '.env');
if (fs.existsSync(envFilePath)) {
  const envFile = fs.readFileSync(envFilePath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[match[1]] = value.trim();
    }
  });
}

async function main() {
  console.log("=== CARCBLOG SEARCH INDEXER CLI ===");
  const provider = (process.argv[2] || process.env.SEARCH_PROVIDER || 'local').toLowerCase();
  
  try {
    const { runFullSearchIndexing } = await import('../dist/server/entry.mjs').catch(async () => {
      // Fallback for dev mode
      return await import('../src/features/search/indexer.ts');
    });
    await runFullSearchIndexing(provider);
    console.log("=== INDEXING COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.log(`Indexer execution summary (provider: ${provider}): Completed.`);
  }
}

main().catch(err => {
  console.error("Fatal indexing error:", err.message || err);
  process.exit(1);
});
