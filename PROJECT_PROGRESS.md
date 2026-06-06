# TanjaMol Project Progress

Last updated: 2026-06-06

## Current Live Setup

- Main live URL: https://tanjamall.com/
- `www` redirect: https://www.tanjamall.com/ redirects to https://tanjamall.com/
- Temporary Pages URL: https://tanjamol.pages.dev/
- Hosting: Cloudflare Pages
- Repository: https://github.com/ecomtanger1-hue/TanjaMol
- Production branch: `main`
- Framework/build settings:
  - Framework preset: React (Vite)
  - Build command: `npm run build`
  - Build output directory: `dist`

## Cloudflare Work Completed

- Prepared the Vite app for Cloudflare Pages.
- Switched Vite asset base to root hosting.
- Added Cloudflare Pages headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restrictions for camera, microphone, and geolocation
- Added caching rules:
  - long cache for built assets
  - shorter cache for product media
  - no cache for `index.html`
- Added SPA fallback routing through `public/_redirects`.
- Removed the old GitHub Pages deploy dependency and script.
- Confirmed the deployed site loads correctly.

## Custom Domain Work Completed

- Domain purchased from Namecheap: `tanjamall.com`
- Domain was connected to Cloudflare using Cloudflare nameservers:
  - `annalise.ns.cloudflare.com`
  - `rocky.ns.cloudflare.com`
- Cloudflare zone status became active/protected.
- Added `tanjamall.com` as a Cloudflare Pages custom domain.
- Added `www.tanjamall.com` as a Cloudflare Pages custom domain.
- Confirmed both domain versions load the site.
- Created a 301 redirect from `www.tanjamall.com` to `tanjamall.com`.
- Final canonical customer URL: https://tanjamall.com/

## Supabase Work Completed

- Created a Supabase project for TanjaMol.
- Added these database tables:
  - `admin_users`
  - `products`
  - `orders`
  - `order_items`
  - `store_settings`
- Enabled row-level security.
- Added policies so:
  - public visitors can read visible products
  - public visitors can create orders and order items
  - only admins can read/manage orders
  - only admins can manage products/settings
- Created an admin user in Supabase Auth.
- Added that user to `public.admin_users`.

## App Integration Completed

- Installed `@supabase/supabase-js`.
- Added local and Cloudflare environment variable support:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Added `.env.example`.
- Added `.env.local` locally, and ignored it in Git.
- Added Supabase client setup in `src/lib/supabase.ts`.
- Added live order saving to Supabase:
  - customers still continue to WhatsApp as before
  - orders still save locally as a fallback
  - orders also save to Supabase in the background
- Added real Supabase admin login:
  - removed the old fake `admin/admin` login behavior
  - admin login now uses Supabase email/password
- Added admin order loading from Supabase after login.

## Verified

- `npm run build` passes.
- Cloudflare deployment succeeded.
- Live site loads at https://tanjamall.com/
- `www.tanjamall.com` redirects to `tanjamall.com`.
- Live order saving to Supabase was tested.
- Admin login was connected to Supabase.
- Admin orders view can read Supabase orders.
- Test orders were cleaned up from Supabase.

## Important Notes

- The Supabase anon key is public by design, but the service role key must never be added to the frontend or Git.
- `.env.local` contains local Supabase values and is intentionally ignored.
- Products are still mostly code/browser based for now.
- Product migration to Supabase was intentionally postponed because the storefront may still need design/content changes.
- The public/domain brand has changed from `TanjaMol` toward `TanjaMall`, but the site UI/content may still need a separate brand-name update.

## Git Commits

- `7cb8ec6` Prepare storefront for Cloudflare Pages
- `45a5be6` Add Supabase client setup
- `8d706c4` Save customer orders to Supabase
- `c35fe2f` Use Supabase admin login and orders

## Next Phase When Ready

Recommended next phase:

1. Move products into Supabase.
2. Load storefront products from Supabase.
3. Connect admin product add/edit/hide/delete to Supabase.
4. Move store settings to Supabase.
5. Add image upload support through Supabase Storage or another media workflow.
6. Update visible branding from TanjaMol to TanjaMall where appropriate.

Current safe pause point:

- Keep improving the storefront design/content in code.
- Orders and admin order viewing are already backed by Supabase.
- Product backend migration can wait until the site direction is more settled.
