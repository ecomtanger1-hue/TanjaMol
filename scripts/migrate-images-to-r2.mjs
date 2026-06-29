import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const STORE_CONFIG_SLUG = '__tanjamol_store_config__';
const DEFAULT_PUBLIC_IMAGE_BASE_URL = 'https://images.tanjamall.com';
const MAX_IMAGE_EDGE = 1600;
const IMAGE_QUALITY = 82;

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

const fileEnv = readEnvFile('.env.local');
const env = { ...fileEnv, ...process.env };
const args = new Set(process.argv.slice(2));
const live = args.has('--live');
const productsOnly = args.has('--products-only');
const onlySlug = process.argv.find(arg => arg.startsWith('--only-slug='))?.split('=').slice(1).join('=');
const limit = Number(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || 0);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabaseAccessToken = env.MIGRATION_SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseApiKey = env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const uploadEndpoint = env.R2_UPLOAD_ENDPOINT || env.VITE_R2_UPLOAD_ENDPOINT;
const migrationSecret = env.MIGRATION_UPLOAD_SECRET;
const publicImageBaseUrl = (env.R2_PUBLIC_IMAGE_BASE_URL || DEFAULT_PUBLIC_IMAGE_BASE_URL).replace(/\/$/, '');
const hasAdminReadWriteToken = Boolean(env.MIGRATION_SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

if (live && !uploadEndpoint) {
  console.error('Missing R2_UPLOAD_ENDPOINT or VITE_R2_UPLOAD_ENDPOINT.');
  process.exit(1);
}

if (live && !migrationSecret && !supabaseAccessToken) {
  console.error('Live migration needs MIGRATION_UPLOAD_SECRET or MIGRATION_SUPABASE_ACCESS_TOKEN.');
  process.exit(1);
}

if (live && !hasAdminReadWriteToken) {
  console.error('Live migration needs MIGRATION_SUPABASE_ACCESS_TOKEN, SUPABASE_ACCESS_TOKEN, or SUPABASE_SERVICE_ROLE_KEY so hidden/draft products can be backed up and updated safely.');
  process.exit(1);
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: supabaseApiKey,
    authorization: `Bearer ${supabaseAccessToken}`,
    ...extra,
  };
}

async function supabaseRest(path, options = {}) {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers: supabaseHeaders(options.headers || {}),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(value);
}

function isSupabaseStorageUrl(value) {
  if (!isHttpUrl(value)) return false;
  try {
    const url = new URL(value);
    return url.hostname.includes('supabase') && url.pathname.includes('/storage/v1/object/');
  } catch {
    return false;
  }
}

function classifyUrl(value) {
  if (!value || typeof value !== 'string') return 'missing';
  if (value.startsWith(publicImageBaseUrl)) return 'already-r2';
  if (isSupabaseStorageUrl(value)) return 'supabase';
  if (isHttpUrl(value)) return 'external';
  return 'local';
}

function walkStrings(value, visitor) {
  if (typeof value === 'string') {
    visitor(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(item => walkStrings(item, visitor));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => walkStrings(item, visitor));
  }
}

function replaceStrings(value, replacements) {
  if (typeof value === 'string') {
    let next = value;
    for (const [oldUrl, newUrl] of replacements) next = next.split(oldUrl).join(newUrl);
    return next;
  }
  if (Array.isArray(value)) return value.map(item => replaceStrings(item, replacements));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceStrings(item, replacements)]));
  }
  return value;
}

function safeSegment(value) {
  return String(value || 'image')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';
}

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  const type = response.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`Not an image (${type || 'unknown type'})`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, type };
}

async function optimizeImage({ buffer, type }) {
  if (type === 'image/svg+xml' || type === 'image/gif') {
    return { buffer, type, extension: type === 'image/gif' ? 'gif' : 'svg' };
  }

  const optimized = await sharp(buffer, { animated: false })
    .rotate()
    .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: IMAGE_QUALITY })
    .toBuffer();

  if (optimized.length >= buffer.length) {
    const extension = type === 'image/png' ? 'png' : type === 'image/jpeg' ? 'jpg' : 'webp';
    return { buffer, type, extension };
  }

  return { buffer: optimized, type: 'image/webp', extension: 'webp' };
}

async function uploadToR2({ buffer, type, extension }, sourceUrl, folder) {
  const formData = new FormData();
  const hash = createHash('sha1').update(sourceUrl).digest('hex').slice(0, 16);
  formData.append('folder', folder);
  formData.append('file', new Blob([buffer], { type }), `${hash}.${extension}`);

  const headers = {};
  if (migrationSecret) headers['x-migration-secret'] = migrationSecret;
  else headers.authorization = `Bearer ${supabaseAccessToken}`;

  const response = await fetch(uploadEndpoint, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) throw new Error(`R2 upload failed (${response.status}): ${await response.text()}`);
  const data = await response.json();
  if (!data.url) throw new Error('R2 upload response did not include url.');
  return data.url;
}

async function verifyUrl(url) {
  const head = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (head?.ok) return true;
  const get = await fetch(url, { headers: { range: 'bytes=0-0' } }).catch(() => null);
  return Boolean(get?.ok || get?.status === 206);
}

async function main() {
  const products = await supabaseRest('products?select=*');
  const settings = await supabaseRest('store_settings?select=*');
  const selectedProducts = products
    .filter(product => !onlySlug || product.slug === onlySlug)
    .slice(0, limit || undefined);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join('backups', `r2-migration-${timestamp}`);
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(join(backupDir, 'products-backup.json'), JSON.stringify(products, null, 2));
  writeFileSync(join(backupDir, 'store-settings-backup.json'), JSON.stringify(settings, null, 2));

  const found = new Map();
  const counters = { supabase: 0, external: 0, local: 0, alreadyR2: 0, missing: 0, duplicate: 0, failed: 0, migrated: 0 };
  const selectedSettings = productsOnly ? [] : settings;
  const scanRows = [...selectedProducts, ...selectedSettings];

  for (const row of scanRows) {
    walkStrings(row, value => {
      const kind = classifyUrl(value);
      if (kind === 'supabase') {
        counters.supabase += 1;
        if (found.has(value)) counters.duplicate += 1;
        else found.set(value, { url: value, newUrl: '', error: '' });
      } else if (kind === 'external') counters.external += 1;
      else if (kind === 'local') counters.local += 1;
      else if (kind === 'already-r2') counters.alreadyR2 += 1;
      else counters.missing += 1;
    });
  }

  console.log(JSON.stringify({
    mode: live ? 'live' : 'dry-run',
    productsScanned: selectedProducts.length,
    settingsRowsScanned: selectedSettings.length,
    uniqueSupabaseUrls: found.size,
    counters,
    backupDir,
  }, null, 2));

  if (!live) {
    writeFileSync(join(backupDir, 'dry-run-url-list.json'), JSON.stringify([...found.values()], null, 2));
    console.log('Dry run complete. No Supabase records were changed.');
    return;
  }

  const replacements = new Map();
  for (const entry of found.values()) {
    try {
      const downloaded = await downloadImage(entry.url);
      const optimized = await optimizeImage(downloaded);
      const newUrl = await uploadToR2(optimized, entry.url, `migrated/${safeSegment(onlySlug || 'all-products')}`);
      if (!await verifyUrl(newUrl)) throw new Error('Uploaded R2 URL was not reachable.');
      entry.newUrl = newUrl;
      replacements.set(entry.url, newUrl);
      counters.migrated += 1;
      console.log(`Migrated: ${entry.url} -> ${newUrl}`);
    } catch (error) {
      entry.error = error instanceof Error ? error.message : String(error);
      counters.failed += 1;
      console.warn(`Skipped: ${entry.url} (${entry.error})`);
    }
  }

  writeFileSync(join(backupDir, 'url-replacements.json'), JSON.stringify([...found.values()], null, 2));

  if (replacements.size) {
    for (const product of selectedProducts) {
      const replaced = replaceStrings(product, replacements);
      const payload = {
        image: replaced.image || '',
        gallery: replaced.gallery || [],
        details: replaced.details || [],
        variants: replaced.variants || [],
        variant_options: replaced.variant_options || [],
        data: replaced.data || {},
        description: product.slug === STORE_CONFIG_SLUG ? replaced.description : product.description,
        updated_at: new Date().toISOString(),
      };
      await supabaseRest(`products?id=eq.${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
        body: JSON.stringify(payload),
      });
    }

    for (const row of selectedSettings) {
      const replaced = replaceStrings(row, replacements);
      await supabaseRest(`store_settings?id=eq.${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
        body: JSON.stringify({ categories: replaced.categories || [], updated_at: new Date().toISOString() }),
      });
    }
  }

  console.log(JSON.stringify({ counters, backupDir }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
