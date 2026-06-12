import type { StoredOrder } from '../storefrontRuntime';
import { supabase } from './supabase';

type SupabaseOrderItem = {
  product_slug: string;
  title: string;
  variant: string | null;
  price: number | string;
  quantity: number;
  image: string | null;
};

type SupabaseOrder = {
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  source: string;
  status: StoredOrder['status'];
  total: number | string;
  created_at: string;
  order_items?: SupabaseOrderItem[];
};

export async function signInAdmin(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  await fetchAdminOrders();
}

export async function restoreAdminSession() {
  if (!supabase) return false;

  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;

  try {
    await fetchAdminOrders();
    return true;
  } catch {
    await supabase.auth.signOut();
    return false;
  }
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function fetchAdminOrders(): Promise<StoredOrder[]> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('orders')
    .select('order_number, customer_name, phone, address, note, source, status, total, created_at, order_items(product_slug, title, variant, price, quantity, image)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapSupabaseOrder);
}

export async function updateAdminOrderStatus(orderNumber: string, status: StoredOrder['status']) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_number', orderNumber);

  if (error) throw error;
}

function mapSupabaseOrder(order: SupabaseOrder): StoredOrder {
  return {
    id: order.order_number,
    name: order.customer_name,
    phone: order.phone,
    address: order.address,
    note: order.note || '',
    source: order.source,
    status: order.status,
    total: Number(order.total),
    createdAt: order.created_at,
    items: (order.order_items || []).map(item => ({
      id: item.product_slug,
      slug: item.product_slug,
      title: item.title,
      price: Number(item.price),
      priceLabel: `${Number(item.price).toLocaleString('fr-MA')} درهم`,
      quantity: item.quantity,
      image: item.image || '',
      variant: item.variant || undefined,
    })),
  };
}
