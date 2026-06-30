import type { StoredOrder } from '../storefrontRuntime';
import { publicSupabase } from './supabase';

type CreateStorefrontOrderRow = {
  order_number: string;
  created_at: string;
};

function isMissingOrderFunctionError(error: { code?: string; message?: string }) {
  return error.code === 'PGRST202' || (error.message || '').includes('create_storefront_order');
}

async function saveOrderWithDirectInsert(order: StoredOrder) {
  if (!publicSupabase) throw new Error('Supabase is not configured.');

  const orderId = crypto.randomUUID();
  const { error: orderError } = await publicSupabase.from('orders').insert({
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

  const { error: itemsError } = await publicSupabase.from('order_items').insert(
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
  return order;
}

export async function saveOrderToSupabase(order: StoredOrder): Promise<StoredOrder> {
  if (!publicSupabase) throw new Error('Supabase is not configured.');

  const { data, error } = await publicSupabase.rpc('create_storefront_order', {
    order_payload: {
      customer_name: order.name,
      phone: order.phone,
      address: order.address,
      note: order.note || null,
      source: order.source,
      status: order.status,
      total: order.total,
      items: order.items.map(item => ({
        product_slug: item.slug,
        title: item.title,
        variant: item.variant || null,
        price: item.price,
        quantity: item.quantity,
        image: item.image || null,
      })),
    },
  });

  if (error) {
    if (isMissingOrderFunctionError(error)) return saveOrderWithDirectInsert(order);
    throw error;
  }

  const savedOrder = (Array.isArray(data) ? data[0] : data) as CreateStorefrontOrderRow | undefined;
  if (!savedOrder?.order_number || !savedOrder.created_at) {
    throw new Error('Supabase did not return an order number.');
  }

  return {
    ...order,
    id: savedOrder.order_number,
    createdAt: savedOrder.created_at,
  };
}
