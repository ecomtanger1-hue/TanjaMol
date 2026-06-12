insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
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
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);
