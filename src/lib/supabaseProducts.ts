import type { Product, ProductDetailBlock, ProductVariant, ProductVariantOption } from '../storefrontRuntime';
import { supabase } from './supabase';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type ProductRow = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  price_label?: string | null;
  old_price?: string | null;
  badge?: string | null;
  image?: string | null;
  gallery?: JsonValue | null;
  description?: string | null;
  stock?: number | null;
  delivery?: string | null;
  reviews_enabled?: boolean | null;
  manual_reviews_enabled?: boolean | null;
  rating?: number | string | null;
  review_count?: number | null;
  show_related?: boolean | null;
  show_policies?: boolean | null;
  details?: JsonValue | null;
  specs?: JsonValue | null;
  variants_enabled?: boolean | null;
  variant_options?: JsonValue | null;
  variants?: JsonValue | null;
  is_visible?: boolean | null;
  is_draft?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ProductPayload = Omit<ProductRow, 'created_at' | 'updated_at'> & {
  updated_at: string;
};

const PRODUCT_SUMMARY_COLUMNS = [
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

function jsonArray<T>(value: JsonValue | null | undefined, fallback: T[]): T[] {
  return Array.isArray(value) ? value as T[] : fallback;
}

function mapProduct(row: ProductRow): Product {
  const gallery = jsonArray<string>(row.gallery, []).filter(Boolean);
  const image = row.image || gallery[0] || '';
  const variantOptions = jsonArray<ProductVariantOption>(row.variant_options, []);
  const variants = jsonArray<ProductVariant>(row.variants, []);
  const inferredVariantsEnabled = Boolean(variantOptions.length || variants.some(variant => variant.enabled));

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
    gallery: gallery.length ? gallery : image ? [image] : [],
    description: row.description || '',
    stock: row.stock ?? 0,
    delivery: row.delivery || '',
    reviewsEnabled: row.reviews_enabled ?? true,
    manualReviewsEnabled: row.manual_reviews_enabled ?? true,
    rating: row.rating === null ? undefined : Number(row.rating),
    reviewCount: row.review_count ?? undefined,
    showRelated: row.show_related ?? true,
    showPolicies: row.show_policies ?? true,
    details: jsonArray<ProductDetailBlock>(row.details, []),
    specs: jsonArray<Array<string>>(row.specs, []).flatMap(item => item.length >= 2 ? [[String(item[0]), String(item[1])] as [string, string]] : []),
    variantsEnabled: row.variants_enabled ?? inferredVariantsEnabled,
    variantOptions,
    variants,
    isVisible: row.is_visible ?? true,
    isDraft: row.is_draft ?? false,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

function productPayload(product: Product, isVisible = product.isVisible ?? true): ProductPayload {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    category: product.category,
    price: product.price,
    price_label: product.priceLabel,
    old_price: product.oldPrice || '',
    badge: product.badge || '',
    image: product.image || product.gallery?.[0] || '',
    gallery: product.gallery || [],
    description: product.description || '',
    stock: product.stock ?? 0,
    delivery: product.delivery || '',
    reviews_enabled: product.reviewsEnabled ?? true,
    manual_reviews_enabled: product.manualReviewsEnabled ?? true,
    rating: product.rating ?? null,
    review_count: product.reviewCount ?? null,
    show_related: product.showRelated ?? true,
    show_policies: product.showPolicies ?? true,
    details: product.details || [],
    specs: product.specs || [],
    variants_enabled: product.variantsEnabled ?? Boolean(product.variantOptions?.length || product.variants?.length),
    variant_options: product.variantOptions || [],
    variants: product.variants || [],
    is_visible: isVisible,
    is_draft: product.isDraft ?? false,
    sort_order: product.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };
}

function missingColumnError(error: { code?: string; message?: string }, column: string) {
  const message = error.message || '';
  return error.code === 'PGRST204' || (message.includes(column) && message.toLowerCase().includes('column'));
}

export async function fetchProductsFromSupabase(includeHidden = false) {
  if (!supabase) return [];

  let query = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (!includeHidden) query = query.eq('is_visible', true);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(row => mapProduct(row as ProductRow));
}

export async function fetchProductSummariesFromSupabase(includeHidden = false) {
  if (!supabase) return [];

  let query = supabase
    .from('products')
    .select(PRODUCT_SUMMARY_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (!includeHidden) query = query.eq('is_visible', true);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(row => mapProduct(row as ProductRow));
}

export async function fetchProductBySlugFromSupabase(slug: string, includeHidden = false) {
  if (!supabase) return null;

  let query = supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .limit(1);

  if (!includeHidden) query = query.eq('is_visible', true);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;

  return data ? mapProduct(data as ProductRow) : null;
}

export async function upsertProductToSupabase(product: Product, previousSlug?: string, isVisible = product.isVisible ?? true) {
  if (!supabase) return;

  const payload = productPayload(product, isVisible);
  let { error } = await supabase.from('products').upsert(payload, { onConflict: 'slug' });

  if (error && missingColumnError(error, 'variants_enabled')) {
    const { variants_enabled, ...compatiblePayload } = payload;
    const retry = await supabase.from('products').upsert(compatiblePayload, { onConflict: 'slug' });
    error = retry.error;
  }

  if (error && missingColumnError(error, 'is_draft')) {
    const { is_draft, ...compatiblePayload } = payload;
    const retry = await supabase.from('products').upsert(compatiblePayload, { onConflict: 'slug' });
    error = retry.error;
  }

  if (error) throw error;

  if (previousSlug && previousSlug !== product.slug) {
    const { error: deleteError } = await supabase.from('products').delete().eq('slug', previousSlug);
    if (deleteError) throw deleteError;
  }
}

export async function deleteProductFromSupabase(slug: string) {
  if (!supabase) return;

  const { error } = await supabase.from('products').delete().eq('slug', slug);
  if (error) throw error;
}

export async function setProductVisibilityInSupabase(slug: string, isVisible: boolean) {
  if (!supabase) return;

  const { error } = await supabase
    .from('products')
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  if (error) throw error;
}

export async function setProductsVisibilityInSupabase(slugs: string[], isVisible: boolean) {
  if (!supabase || !slugs.length) return;

  const { error } = await supabase
    .from('products')
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .in('slug', slugs);

  if (error) throw error;
}
