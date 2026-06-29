import { readFileSync } from 'node:fs';

function readEnvFile(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          const separator = line.indexOf('=');
          return [line.slice(0, separator), line.slice(separator + 1)];
        }),
    );
  } catch {
    return {};
  }
}

const backupDir = process.argv.find(arg => arg.startsWith('--backup-dir='))?.split('=').slice(1).join('=');
if (!backupDir) {
  console.error('Usage: node scripts/rollback-r2-image-migration.mjs --backup-dir=backups/r2-migration-...');
  process.exit(1);
}

const env = { ...readEnvFile('.env.local'), ...process.env };
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabaseAccessToken = env.MIGRATION_SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseApiKey = env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

function headers(extra = {}) {
  return {
    apikey: supabaseApiKey,
    authorization: `Bearer ${supabaseAccessToken}`,
    ...extra,
  };
}

async function supabasePatch(path, body) {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: headers({ 'content-type': 'application/json', prefer: 'return=minimal' }),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Rollback failed (${response.status}): ${await response.text()}`);
}

const products = JSON.parse(readFileSync(`${backupDir}/products-backup.json`, 'utf8'));
const settings = JSON.parse(readFileSync(`${backupDir}/store-settings-backup.json`, 'utf8'));

for (const product of products) {
  await supabasePatch(`products?id=eq.${encodeURIComponent(product.id)}`, product);
}

for (const row of settings) {
  await supabasePatch(`store_settings?id=eq.${encodeURIComponent(row.id)}`, row);
}

console.log(`Rollback complete from ${backupDir}`);
