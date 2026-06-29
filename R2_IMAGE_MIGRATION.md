# TanjaMall R2 Image Migration

This moves product images away from Supabase Storage while leaving products, orders, settings, and admin auth in Supabase.

## Cloudflare Setup

1. In Cloudflare, make sure `tanjamall.com` is active in your account.
2. Run:

```powershell
npm.cmd run r2:setup
```

3. When Wrangler asks for secrets, provide:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `MIGRATION_UPLOAD_SECRET`, a long random private value
4. In Cloudflare dashboard, connect the R2 bucket `tanjamall-product-images` to the custom domain:

```text
images.tanjamall.com
```

5. Add the deployed Worker upload URL to the website environment:

```text
VITE_R2_UPLOAD_ENDPOINT=https://<your-worker-url>/upload
```

The browser never receives R2 secret keys. Admin uploads authenticate through the existing Supabase admin session.

## Migration Dry Run

Dry run creates backups and a URL report without changing Supabase:

```powershell
npm.cmd run r2:migrate:dry-run
```

For a complete scan, provide an admin access token or service role key in the shell:

```powershell
$env:MIGRATION_SUPABASE_ACCESS_TOKEN='paste-admin-access-token'
npm.cmd run r2:migrate:dry-run
```

## One Product Test

After Cloudflare and the Worker are ready, migrate one product first:

```powershell
$env:MIGRATION_SUPABASE_ACCESS_TOKEN='paste-admin-access-token'
$env:MIGRATION_UPLOAD_SECRET='same-secret-set-on-worker'
$env:R2_UPLOAD_ENDPOINT='https://<your-worker-url>/upload'
npm.cmd run r2:migrate -- --only-slug=product-slug
```

To make the one-product test touch only that product and skip category/settings images:

```powershell
npm.cmd run r2:migrate -- --only-slug=product-slug --products-only
```

Open that product page and verify all images load from `https://images.tanjamall.com/`.

## Full Migration

Only run this after the one-product test works:

```powershell
$env:MIGRATION_SUPABASE_ACCESS_TOKEN='paste-admin-access-token'
$env:MIGRATION_UPLOAD_SECRET='same-secret-set-on-worker'
$env:R2_UPLOAD_ENDPOINT='https://<your-worker-url>/upload'
npm.cmd run r2:migrate
```

The script:
- writes backups under `backups/r2-migration-*`
- skips external URLs and local `product-media/...` images
- compresses/resizes downloaded Supabase images before R2 upload
- leaves any failed image URL unchanged
- does not delete Supabase Storage files

## Rollback

If anything looks wrong, restore the JSON backup:

```powershell
$env:MIGRATION_SUPABASE_ACCESS_TOKEN='paste-admin-access-token'
npm.cmd run r2:rollback -- --backup-dir=backups/r2-migration-YYYY-MM-DD...
```

Do not delete old Supabase Storage files until the site has been stable for a while.
