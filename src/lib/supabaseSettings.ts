import type { StoreSettings } from '../storefrontRuntime';
import { defaultSettings } from '../storefrontRuntime';
import { supabase } from './supabase';

type SettingsRow = {
  id: string;
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

export async function fetchStoreSettingsFromSupabase() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'main')
    .maybeSingle();

  if (error) throw error;
  return data ? mapSettings(data as SettingsRow) : null;
}

export async function saveStoreSettingsToSupabase(settings: StoreSettings) {
  if (!supabase) return;

  const { error } = await supabase.from('store_settings').upsert({
    id: 'main',
    store_name: settings.storeName,
    whatsapp_number: settings.whatsappNumber,
    phone: settings.phone,
    city: settings.city,
    delivery_text: settings.deliveryText,
    address: settings.address,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}
