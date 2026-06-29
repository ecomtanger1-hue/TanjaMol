-- Add the admin-only canceled order status to the live orders table.
-- Run in Supabase Dashboard > SQL Editor if tanjamol-live-schema.sql was already applied before this change.

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('new', 'whatsapp', 'confirmed', 'delivery', 'done', 'canceled'));

alter table public.orders
  drop constraint if exists orders_customer_message_status_check;

alter table public.orders
  add constraint orders_customer_message_status_check
  check (customer_message_status is null or customer_message_status in ('new', 'whatsapp', 'confirmed', 'delivery', 'done', 'canceled'));
