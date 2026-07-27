import fs from 'fs';
import path from 'path';

// Load .env BEFORE any other imports
const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    process.env[match[1]] = value.trim();
  }
});

async function main() {
  const { runFullSearchIndexing } = await import('../src/features/search/indexer');
  console.log("=== CARCBLOG SEARCH INDEXER CLI ===");
  const provider = (process.argv[2] || process.env.SEARCH_PROVIDER || 'local').toLowerCase() as any;
  await runFullSearchIndexing(provider);
  console.log("=== INDEXING COMPLETED ===");
}

main().catch(err => {
  console.error("Fatal indexing error:", err);
  process.exit(1);
});
