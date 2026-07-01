import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const outputPath = resolve('src/generated/productManifest.ts');
const storeConfigSlug = '__tanjamol_store_config__';
const summaryColumns = [
  'id',
  'slug',
  'title',
  'category',
  'price',
  'price_label',
  'old_price',
  'badge',
  'image',
  'stock',
  'is_visible',
  'sort_order',
  'created_at',
  'updated_at',
].join(',');

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separator = trimmed.indexOf('=');
    if (separator <= 0) return;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (process.env[key]) return;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  });
}

function mapProduct(row) {
  const image = row.image || '';

  return {
    id: row.id || row.slug || '',
    slug: row.slug || row.id || '',
    title: row.title || '',
    category: row.category || '',
    price: Number(row.price || 0),
    priceLabel: row.price_label || `${Number(row.price || 0).toLocaleString('fr-MA')} درهم`,
    oldPrice: row.old_price || '',
    badge: row.badge || '',
    image,
    gallery: image ? [image] : [],
    description: '',
    stock: row.stock ?? 0,
    delivery: '',
    reviewsEnabled: true,
    manualReviewsEnabled: true,
    showRelated: true,
    showPolicies: true,
    details: [],
    specs: [],
    variantOptions: [],
    variants: [],
    isVisible: row.is_visible ?? true,
    isDraft: false,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

function writeManifest(products) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, [
    "import type { Product } from '../storefrontRuntime';",
    '',
    'export const productManifest = (',
    JSON.stringify(products, null, 2),
    ') satisfies Product[];',
    '',
  ].join('\n'), 'utf8');
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (!existsSync(outputPath)) writeManifest([]);
  console.warn('Skipping product manifest generation: Supabase env is not configured.');
  process.exit(0);
}

const url = new URL('/rest/v1/products', supabaseUrl);
url.searchParams.set('select', summaryColumns);
url.searchParams.set('slug', `neq.${storeConfigSlug}`);
url.searchParams.set('is_visible', 'eq.true');
url.searchParams.set('order', 'sort_order.asc,updated_at.desc');

const response = await fetch(url, {
  headers: {
    apikey: supabaseAnonKey,
    authorization: `Bearer ${supabaseAnonKey}`,
  },
});

if (!response.ok) {
  throw new Error(`Failed to fetch product manifest: ${response.status} ${await response.text()}`);
}

const rows = await response.json();
const products = rows.map(mapProduct).filter(product => product.slug && product.title && product.isVisible !== false);
writeManifest(products);
console.log(`Generated product manifest with ${products.length} products.`);
