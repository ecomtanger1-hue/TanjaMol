import type { StoredOrder } from '../storefrontRuntime';
import { supabase } from './supabase';

export async function saveOrderToSupabase(order: StoredOrder) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const orderId = crypto.randomUUID();
  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    order_number: order.id,
    customer_name: order.name,
    phone: order.phone,
    address: order.address,
    note: order.note || null,
    source: order.source,
    status: order.status,
    customer_message_status: null,
    customer_message_sent_at: null,
    total: order.total,
    created_at: order.createdAt,
  });

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase.from('order_items').insert(
    order.items.map(item => ({
      order_id: orderId,
      product_slug: item.slug,
      title: item.title,
      variant: item.variant || null,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
  );

  if (itemsError) throw itemsError;
}
