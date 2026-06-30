create table if not exists public.order_number_counter (
  id text primary key default 'global',
  last_value bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.order_number_counter enable row level security;

insert into public.order_number_counter (id, last_value)
values ('global', (select count(*) from public.orders))
on conflict (id) do update
set
  last_value = greatest(public.order_number_counter.last_value, excluded.last_value),
  updated_at = now();

create or replace function public.create_storefront_order(order_payload jsonb)
returns table(order_number text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_created_at timestamptz := now();
  v_counter bigint;
  v_name text := trim(coalesce(order_payload->>'customer_name', order_payload->>'name', ''));
  v_phone text := trim(coalesce(order_payload->>'phone', ''));
  v_address text := trim(coalesce(order_payload->>'address', ''));
  v_note text := nullif(trim(coalesce(order_payload->>'note', '')), '');
  v_source text := coalesce(order_payload->>'source', 'storefront');
  v_status text := coalesce(order_payload->>'status', 'new');
  v_total numeric := coalesce((order_payload->>'total')::numeric, 0);
  v_items jsonb := coalesce(order_payload->'items', '[]'::jsonb);
  v_item jsonb;
  v_item_count integer := 0;
  v_item_slug text;
  v_item_title text;
  v_item_variant text;
  v_item_price numeric;
  v_item_quantity integer;
  v_item_image text;
begin
  if length(v_name) not between 2 and 120 then
    raise exception 'Invalid customer name' using errcode = '22023';
  end if;

  if v_phone !~ '^[0-9+() .-]{6,30}$' then
    raise exception 'Invalid phone number' using errcode = '22023';
  end if;

  if length(v_address) not between 3 and 500 then
    raise exception 'Invalid address' using errcode = '22023';
  end if;

  if coalesce(length(v_note), 0) > 1000 then
    raise exception 'Invalid note' using errcode = '22023';
  end if;

  if v_source not in ('product-page', 'cart', 'storefront', 'direct-product') then
    raise exception 'Invalid source' using errcode = '22023';
  end if;

  if v_status not in ('new', 'whatsapp') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;

  if v_total <= 0 or v_total >= 1000000 then
    raise exception 'Invalid total' using errcode = '22023';
  end if;

  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) < 1 or jsonb_array_length(v_items) > 50 then
    raise exception 'Invalid order items' using errcode = '22023';
  end if;

  loop
    insert into public.order_number_counter (id, last_value)
    values ('global', (select count(*) from public.orders))
    on conflict (id) do nothing;

    update public.order_number_counter
    set last_value = last_value + 1,
        updated_at = now()
    where id = 'global'
    returning last_value into v_counter;

    v_order_number := 'TM-' || to_char(timezone('Africa/Casablanca', v_created_at), 'YYMMDD') || '-' || v_counter::text;
    exit when not exists (select 1 from public.orders where orders.order_number = v_order_number);
  end loop;

  insert into public.orders (
    id,
    order_number,
    customer_name,
    phone,
    address,
    note,
    source,
    status,
    customer_message_status,
    customer_message_sent_at,
    total,
    created_at
  ) values (
    v_order_id,
    v_order_number,
    v_name,
    v_phone,
    v_address,
    v_note,
    v_source,
    v_status,
    null,
    null,
    v_total,
    v_created_at
  );

  for v_item in select * from jsonb_array_elements(v_items)
  loop
    v_item_count := v_item_count + 1;
    v_item_slug := trim(coalesce(v_item->>'product_slug', v_item->>'slug', ''));
    v_item_title := trim(coalesce(v_item->>'title', ''));
    v_item_variant := nullif(trim(coalesce(v_item->>'variant', '')), '');
    v_item_price := coalesce((v_item->>'price')::numeric, 0);
    v_item_quantity := coalesce((v_item->>'quantity')::integer, 0);
    v_item_image := coalesce(v_item->>'image', '');

    if length(v_item_slug) not between 1 and 180 then
      raise exception 'Invalid item slug' using errcode = '22023';
    end if;

    if length(v_item_title) not between 1 and 300 then
      raise exception 'Invalid item title' using errcode = '22023';
    end if;

    if coalesce(length(v_item_variant), 0) > 300 then
      raise exception 'Invalid item variant' using errcode = '22023';
    end if;

    if v_item_price < 0 or v_item_price >= 1000000 then
      raise exception 'Invalid item price' using errcode = '22023';
    end if;

    if v_item_quantity not between 1 and 99 then
      raise exception 'Invalid item quantity' using errcode = '22023';
    end if;

    if coalesce(length(v_item_image), 0) > 1200 then
      raise exception 'Invalid item image' using errcode = '22023';
    end if;

    insert into public.order_items (
      order_id,
      product_slug,
      title,
      variant,
      price,
      quantity,
      image,
      created_at
    ) values (
      v_order_id,
      v_item_slug,
      v_item_title,
      v_item_variant,
      v_item_price,
      v_item_quantity,
      nullif(v_item_image, ''),
      v_created_at
    );
  end loop;

  if v_item_count = 0 then
    raise exception 'Invalid order items' using errcode = '22023';
  end if;

  return query select v_order_number, v_created_at;
end;
$$;

revoke all on function public.create_storefront_order(jsonb) from public;
grant execute on function public.create_storefront_order(jsonb) to anon, authenticated;
