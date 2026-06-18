-- TanjaMol/TanjaMall live Supabase setup
-- Run once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  title text not null,
  category text not null,
  price numeric not null default 0,
  price_label text not null default '0 درهم',
  old_price text not null default '',
  badge text not null default '',
  image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  description text not null default '',
  stock integer not null default 0,
  delivery text not null default '',
  reviews_enabled boolean not null default true,
  manual_reviews_enabled boolean not null default true,
  rating numeric,
  review_count integer,
  show_related boolean not null default true,
  show_policies boolean not null default true,
  details jsonb not null default '[]'::jsonb,
  specs jsonb not null default '[]'::jsonb,
  variants_enabled boolean,
  variant_options jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  data jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  is_draft boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists id text;
alter table public.products alter column id drop default;
alter table public.products alter column id type text using id::text;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists title text;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists price numeric default 0;
alter table public.products add column if not exists price_label text default '0 درهم';
alter table public.products add column if not exists old_price text default '';
alter table public.products add column if not exists badge text default '';
alter table public.products add column if not exists image text default '';
alter table public.products add column if not exists gallery jsonb default '[]'::jsonb;
alter table public.products add column if not exists description text default '';
alter table public.products add column if not exists stock integer default 0;
alter table public.products add column if not exists delivery text default '';
alter table public.products add column if not exists reviews_enabled boolean default true;
alter table public.products add column if not exists manual_reviews_enabled boolean default true;
alter table public.products add column if not exists rating numeric;
alter table public.products add column if not exists review_count integer;
alter table public.products add column if not exists show_related boolean default true;
alter table public.products add column if not exists show_policies boolean default true;
alter table public.products add column if not exists details jsonb default '[]'::jsonb;
alter table public.products add column if not exists specs jsonb default '[]'::jsonb;
alter table public.products add column if not exists variants_enabled boolean;
alter table public.products add column if not exists variant_options jsonb default '[]'::jsonb;
alter table public.products add column if not exists variants jsonb default '[]'::jsonb;
alter table public.products add column if not exists data jsonb default '{}'::jsonb;
alter table public.products add column if not exists is_visible boolean default true;
alter table public.products add column if not exists is_draft boolean default false;
alter table public.products add column if not exists sort_order integer default 0;
alter table public.products add column if not exists created_at timestamptz default now();
alter table public.products add column if not exists updated_at timestamptz default now();
update public.products
set id = coalesce(nullif(id, ''), nullif(slug, ''), gen_random_uuid()::text)
where id is null or id = '';
alter table public.products alter column id set not null;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and contype = 'p'
  ) then
    alter table public.products add primary key (id);
  end if;
end;
$$;
create unique index if not exists products_slug_key on public.products(slug);

create table if not exists public.store_settings (
  id text primary key default 'main',
  store_name text not null default 'TanjaMall',
  whatsapp_number text not null default '212708012888',
  phone text not null default '06 00 00 00 00',
  city text not null default 'طنجة',
  delivery_text text not null default '24 إلى 48 ساعة',
  address text not null default 'طنجة',
  categories jsonb not null default '[]'::jsonb,
  hero_product_slug text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.store_settings add column if not exists id text;
alter table public.store_settings alter column id drop default;
alter table public.store_settings alter column id type text using id::text;
alter table public.store_settings alter column id set default 'main';
alter table public.store_settings add column if not exists store_name text default 'TanjaMall';
alter table public.store_settings add column if not exists whatsapp_number text default '212708012888';
alter table public.store_settings add column if not exists phone text default '06 00 00 00 00';
alter table public.store_settings add column if not exists city text default 'طنجة';
alter table public.store_settings add column if not exists delivery_text text default '24 إلى 48 ساعة';
alter table public.store_settings add column if not exists address text default 'طنجة';
alter table public.store_settings add column if not exists categories jsonb default '[]'::jsonb;
alter table public.store_settings add column if not exists hero_product_slug text default '';
alter table public.store_settings add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (select 1 from public.store_settings) then
    update public.store_settings
    set id = 'main'
    where id = (select id from public.store_settings order by updated_at desc nulls last limit 1);
    delete from public.store_settings where id <> 'main';
  else
    insert into public.store_settings (id) values ('main');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.store_settings'::regclass
      and contype = 'p'
  ) then
    alter table public.store_settings add primary key (id);
  end if;
end;
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  note text,
  source text not null default 'storefront',
  status text not null default 'new',
  customer_message_status text,
  customer_message_sent_at timestamptz,
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.orders
  alter column status set default 'new',
  add column if not exists customer_message_status text,
  add column if not exists customer_message_sent_at timestamptz;

alter table public.orders
  drop constraint if exists orders_customer_message_status_check;

alter table public.orders
  add constraint orders_customer_message_status_check
  check (customer_message_status is null or customer_message_status in ('new', 'whatsapp', 'confirmed', 'delivery', 'done'));

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  title text not null,
  variant text,
  price numeric not null default 0,
  quantity integer not null default 1,
  image text,
  created_at timestamptz not null default now()
);

create or replace function public.tanjamol_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.tanjamol_touch_updated_at();

drop trigger if exists store_settings_touch_updated_at on public.store_settings;
create trigger store_settings_touch_updated_at
before update on public.store_settings
for each row execute function public.tanjamol_touch_updated_at();

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "admin_users_read_own" on public.admin_users;
drop policy if exists admin_users_read_own on public.admin_users;
create policy "admin_users_read_own"
on public.admin_users for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "products_public_visible_read" on public.products;
drop policy if exists "Public can read visible products" on public.products;
create policy "products_public_visible_read"
on public.products for select
using (is_visible = true and coalesce(is_draft, false) = false);

drop policy if exists "products_admin_manage" on public.products;
drop policy if exists products_admin_manage on public.products;
drop policy if exists "Admins can manage products" on public.products;
create policy "products_admin_manage"
on public.products for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "settings_public_read" on public.store_settings;
create policy "settings_public_read"
on public.store_settings for select
using (true);

drop policy if exists "settings_admin_manage" on public.store_settings;
drop policy if exists settings_admin_manage on public.store_settings;
drop policy if exists "Admins can update store settings" on public.store_settings;
create policy "settings_admin_manage"
on public.store_settings for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "orders_public_insert" on public.orders;
drop policy if exists orders_public_insert on public.orders;
drop policy if exists "Public can create orders" on public.orders;
create policy "orders_public_insert"
on public.orders for insert
to anon, authenticated
with check (
  order_number ~ '^TM-[0-9]{4,}$'
  and length(trim(customer_name)) between 2 and 120
  and phone ~ '^[0-9+() .-]{6,30}$'
  and length(trim(address)) between 3 and 500
  and coalesce(length(note), 0) <= 1000
  and source in ('product-page', 'cart', 'storefront', 'direct-product')
  and status in ('new', 'whatsapp')
  and customer_message_status is null
  and customer_message_sent_at is null
  and total > 0
  and total < 1000000
  and created_at >= now() - interval '15 minutes'
  and created_at <= now() + interval '5 minutes'
);

drop policy if exists "orders_admin_manage" on public.orders;
drop policy if exists orders_admin_read on public.orders;
drop policy if exists orders_admin_update on public.orders;
drop policy if exists "Admins can read orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
create policy "orders_admin_read"
on public.orders for select
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

create policy "orders_admin_update"
on public.orders for update
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "order_items_public_insert" on public.order_items;
drop policy if exists order_items_public_insert on public.order_items;
drop policy if exists "Public can create order items" on public.order_items;
create policy "order_items_public_insert"
on public.order_items for insert
to anon, authenticated
with check (
  length(trim(product_slug)) between 1 and 180
  and length(trim(title)) between 1 and 300
  and coalesce(length(variant), 0) <= 300
  and price >= 0
  and price < 1000000
  and quantity between 1 and 99
  and coalesce(length(image), 0) <= 1200
  and created_at >= now() - interval '15 minutes'
  and created_at <= now() + interval '5 minutes'
);

drop policy if exists "order_items_admin_manage" on public.order_items;
drop policy if exists order_items_admin_read on public.order_items;
drop policy if exists "Admins can read order items" on public.order_items;
create policy "order_items_admin_read"
on public.order_items for select
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create or replace function public.tanjamol_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  );
$$;

revoke all on function public.tanjamol_is_admin() from public;
revoke execute on function public.tanjamol_is_admin() from anon, authenticated;

drop policy if exists "product_images_public_read" on storage.objects;

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
)
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);
