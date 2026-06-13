import type { StoreSettings } from '../storefrontRuntime';
import { defaultSettings } from '../storefrontRuntime';
import { supabase } from './supabase';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type SettingsRow = {
  id: string | number;
  store_name: string | null;
  whatsapp_number: string | null;
  phone: string | null;
  city: string | null;
  delivery_text: string | null;
  address: string | null;
  categories?: JsonValue | null;
  hero_product_slug?: string | null;
  updated_at: string | null;
};

type StoreConfig = Pick<StoreSettings, 'categories' | 'heroProductSlug'>;

const STORE_CONFIG_PRODUCT_SLUG = '__tanjamol_store_config__';

function normalizeCategories(value: JsonValue | undefined | null) {
  if (!Array.isArray(value)) return undefined;

  const categories = value.flatMap(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const row = item as Record<string, JsonValue>;
    const id = typeof row.id === 'string' ? row.id.trim() : '';
    const title = typeof row.title === 'string' ? row.title.trim() : '';
    const image = typeof row.image === 'string' ? row.image.trim() : '';
    const count = typeof row.count === 'string' ? row.count.trim() : '';
    if (!id || !title) return [];
    return [{ id, title, image, count }];
  });

  return categories.length ? categories : undefined;
}

function parseStoreConfig(value: string | null | undefined): StoreConfig {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as { categories?: JsonValue; heroProductSlug?: unknown };
    return {
      categories: normalizeCategories(parsed.categories),
      heroProductSlug: typeof parsed.heroProductSlug === 'string' ? parsed.heroProductSlug : undefined,
    };
  } catch {
    return {};
  }
}

function mapSettings(row: SettingsRow): StoreSettings {
  return {
    storeName: row.store_name || defaultSettings.storeName,
    whatsappNumber: row.whatsapp_number || defaultSettings.whatsappNumber,
    phone: row.phone || defaultSettings.phone,
    city: row.city || defaultSettings.city,
    deliveryText: row.delivery_text || defaultSettings.deliveryText,
    address: row.address || defaultSettings.address,
    categories: normalizeCategories(row.categories),
    heroProductSlug: row.hero_product_slug || undefined,
  };
}

function legacyIntegerIdError(error: { code?: string; message?: string }) {
  return error.code === '22P02' || (error.message || '').includes('invalid input syntax for type integer');
}

function settingsPayload(settings: StoreSettings) {
  return {
    store_name: settings.storeName,
    whatsapp_number: settings.whatsappNumber,
    phone: settings.phone,
    city: settings.city,
    delivery_text: settings.deliveryText,
    address: settings.address,
    categories: settings.categories || [],
    hero_product_slug: settings.heroProductSlug || '',
    updated_at: new Date().toISOString(),
  };
}

function legacySettingsPayload(settings: StoreSettings) {
  const { categories, hero_product_slug, ...payload } = settingsPayload(settings);
  void categories;
  void hero_product_slug;
  return payload;
}

function missingSettingsColumnError(error: { code?: string; message?: string }) {
  const message = error.message || '';
  return message.includes('categories') || message.includes('hero_product_slug');
}

async function fetchStoreConfigFromSupabase(): Promise<StoreConfig> {
  if (!supabase) return {};

  const { data, error } = await supabase
    .from('products')
    .select('description')
    .eq('slug', STORE_CONFIG_PRODUCT_SLUG)
    .maybeSingle();

  if (error) return {};

  return parseStoreConfig((data as { description?: string | null } | null)?.description);
}

async function saveStoreConfigToSupabase(settings: StoreSettings) {
  if (!supabase) return;

  const config = JSON.stringify({
    categories: settings.categories || [],
    heroProductSlug: settings.heroProductSlug || '',
  });

  const { error } = await supabase.from('products').upsert({
    id: STORE_CONFIG_PRODUCT_SLUG,
    slug: STORE_CONFIG_PRODUCT_SLUG,
    title: 'TanjaMall store configuration',
    category: 'settings',
    price: 0,
    price_label: '0',
    old_price: '',
    badge: '',
    image: '',
    gallery: [],
    description: config,
    stock: 0,
    delivery: '',
    is_visible: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'slug' });

  if (error) throw error;
}

export async function fetchStoreSettingsFromSupabase() {
  if (!supabase) return null;

  let { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'main')
    .maybeSingle();

  if (error && legacyIntegerIdError(error)) {
    const fallback = await supabase
      .from('store_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;
  const settings = data ? mapSettings(data as SettingsRow) : null;
  const config = await fetchStoreConfigFromSupabase();

  if (!settings) return Object.keys(config).length ? { ...defaultSettings, ...config } : null;

  return {
    ...settings,
    categories: settings.categories?.length ? settings.categories : config.categories,
    heroProductSlug: settings.heroProductSlug || config.heroProductSlug,
  };
}

export async function saveStoreSettingsToSupabase(settings: StoreSettings) {
  if (!supabase) return;
  let shouldUseConfigFallback = false;

  let { error } = await supabase.from('store_settings').upsert({
    id: 'main',
    ...settingsPayload(settings),
  });

  if (error && missingSettingsColumnError(error)) {
    shouldUseConfigFallback = true;
    const retry = await supabase.from('store_settings').upsert({
      id: 'main',
      ...legacySettingsPayload(settings),
    });

    if (retry.error && !legacyIntegerIdError(retry.error)) throw retry.error;
    error = retry.error;
    await saveStoreConfigToSupabase(settings);
  }

  if (error && legacyIntegerIdError(error)) {
    const { data: existing, error: readError } = await supabase
      .from('store_settings')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readError) throw readError;

    const existingId = (existing as Pick<SettingsRow, 'id'> | null)?.id;
    if (existingId === undefined || existingId === null) {
      const { error: insertError } = await supabase.from('store_settings').insert(legacySettingsPayload(settings));
      if (insertError) throw insertError;
      await saveStoreConfigToSupabase(settings);
      return;
    }

    const { error: updateError } = await supabase
      .from('store_settings')
      .update(shouldUseConfigFallback ? legacySettingsPayload(settings) : settingsPayload(settings))
      .eq('id', existingId);

    if (updateError) throw updateError;
    if (shouldUseConfigFallback) await saveStoreConfigToSupabase(settings);
    return;
  }

  if (error) throw error;
}
