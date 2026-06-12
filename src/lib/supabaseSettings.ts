import type { StoreSettings } from '../storefrontRuntime';
import { defaultSettings } from '../storefrontRuntime';
import { supabase } from './supabase';

type SettingsRow = {
  id: string | number;
  store_name: string | null;
  whatsapp_number: string | null;
  phone: string | null;
  city: string | null;
  delivery_text: string | null;
  address: string | null;
  updated_at: string | null;
};

function mapSettings(row: SettingsRow): StoreSettings {
  return {
    storeName: row.store_name || defaultSettings.storeName,
    whatsappNumber: row.whatsapp_number || defaultSettings.whatsappNumber,
    phone: row.phone || defaultSettings.phone,
    city: row.city || defaultSettings.city,
    deliveryText: row.delivery_text || defaultSettings.deliveryText,
    address: row.address || defaultSettings.address,
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
    updated_at: new Date().toISOString(),
  };
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
  return data ? mapSettings(data as SettingsRow) : null;
}

export async function saveStoreSettingsToSupabase(settings: StoreSettings) {
  if (!supabase) return;

  const { error } = await supabase.from('store_settings').upsert({
    id: 'main',
    ...settingsPayload(settings),
  });

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
      const { error: insertError } = await supabase.from('store_settings').insert(settingsPayload(settings));
      if (insertError) throw insertError;
      return;
    }

    const { error: updateError } = await supabase
      .from('store_settings')
      .update(settingsPayload(settings))
      .eq('id', existingId);

    if (updateError) throw updateError;
    return;
  }

  if (error) throw error;
}
