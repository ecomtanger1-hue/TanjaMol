create or replace function public.tanjamol_next_order_number(order_created_at timestamptz)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_counter bigint;
  v_order_number text;
  v_created_at timestamptz := coalesce(order_created_at, now());
begin
  loop
    insert into public.order_number_counter (id, last_value)
    values ('global', (select count(*) from public.orders))
    on conflict (id) do nothing;

    update public.order_number_counter
    set last_value = greatest(last_value, (select count(*) from public.orders)) + 1,
        updated_at = now()
    where id = 'global'
    returning last_value into v_counter;

    v_order_number := 'TM-' || to_char(timezone('Africa/Casablanca', v_created_at), 'YYMMDD') || '-' || v_counter::text;
    exit when not exists (select 1 from public.orders where orders.order_number = v_order_number);
  end loop;

  return v_order_number;
end;
$$;

create or replace function public.tanjamol_assign_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_number is null or new.order_number !~ '^TM-[0-9]{6}-[0-9]+$' then
    new.order_number := public.tanjamol_next_order_number(new.created_at);
  end if;

  return new;
end;
$$;

revoke execute on function public.tanjamol_next_order_number(timestamptz) from public, anon, authenticated;
revoke execute on function public.tanjamol_assign_order_number() from public, anon, authenticated;

drop trigger if exists tanjamol_assign_order_number_before_insert on public.orders;
create trigger tanjamol_assign_order_number_before_insert
before insert on public.orders
for each row execute function public.tanjamol_assign_order_number();

update public.order_number_counter
set last_value = greatest(last_value, (select count(*) from public.orders)),
    updated_at = now()
where id = 'global';

insert into public.order_number_counter (id, last_value)
values ('global', (select count(*) from public.orders))
on conflict (id) do nothing;

drop policy if exists "orders_public_insert" on public.orders;
drop policy if exists orders_public_insert on public.orders;
create policy "orders_public_insert"
on public.orders for insert
to anon, authenticated
with check (
  order_number ~ '^TM-[0-9]{6}-[0-9]+$'
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
