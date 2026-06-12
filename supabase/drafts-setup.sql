alter table public.products
add column if not exists is_draft boolean not null default false;

drop policy if exists "products_public_visible_read" on public.products;
create policy "products_public_visible_read"
on public.products for select
using (
  (is_visible = true and coalesce(is_draft, false) = false)
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
