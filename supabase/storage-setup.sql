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
grant execute on function public.tanjamol_is_admin() to anon, authenticated;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.tanjamol_is_admin()
);

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.tanjamol_is_admin()
)
with check (
  bucket_id = 'product-images'
  and public.tanjamol_is_admin()
);

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.tanjamol_is_admin()
);
