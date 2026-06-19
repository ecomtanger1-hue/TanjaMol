# TanjaMall Project Progress

Last updated: 2026-06-19

## Current Live Setup

- Main live URL: https://tanjamall.com/
- `www` redirect: https://www.tanjamall.com/ redirects to https://tanjamall.com/
- Temporary Pages URL: https://tanjamol.pages.dev/
- Hosting: Cloudflare Pages
- Repository: https://github.com/ecomtanger1-hue/TanjaMol
- Production branch: `main`
- Framework/build settings:
  - Framework preset: Vite
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Node.js version: `24`

## Cloudflare Work Completed

- Prepared the Vite app for Cloudflare Pages.
- Switched Vite asset base to root hosting.
- Added SPA fallback routing through `public/_redirects`.
- Added Cloudflare Pages headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restrictions for camera, microphone, and geolocation
  - `Strict-Transport-Security`
  - `Cross-Origin-Opener-Policy`
  - `Cross-Origin-Resource-Policy`
  - CSP in report-only mode
- Added caching rules:
  - long cache for built assets
  - shorter cache for product media
  - no cache for `index.html`
- Removed the old GitHub Pages deploy dependency and script.
- Confirmed the deployed site loads correctly on the custom domain.

## Domain Work Completed

- Domain purchased from Namecheap: `tanjamall.com`
- Domain connected to Cloudflare using Cloudflare nameservers:
  - `annalise.ns.cloudflare.com`
  - `rocky.ns.cloudflare.com`
- Cloudflare zone status became active/protected.
- Added `tanjamall.com` and `www.tanjamall.com` as Cloudflare Pages custom domains.
- Created a 301 redirect from `www.tanjamall.com` to `tanjamall.com`.
- Final canonical customer URL: https://tanjamall.com/

## Supabase Work Completed

- Created a Supabase project for TanjaMall/TanjaMol.
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
- Created an admin user in Supabase Auth and added that user to `public.admin_users`.
- Added public Supabase Storage bucket support for product images through `product-images`.

## App Integration Completed

- Installed `@supabase/supabase-js`.
- Added local and Cloudflare environment variable support:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Added `.env.example`.
- Added `.env.local` locally, and ignored it in Git.
- Added Supabase client setup in `src/lib/supabase.ts`.
- Added Supabase-backed customer orders and admin order loading.
- Added real Supabase admin login and session restore.
- Added Supabase-backed product fetch/save/delete/hide/draft flows.
- Added Supabase-backed store settings, categories, and homepage hero product selection.
- Added product media upload helpers for gallery, detail blocks, variants, and editor images.
- Added active shadcn-style admin dashboard, products, orders, order detail, customer detail, settings, and login pages.

## Storefront/Product UX Completed

- Product page now uses a premium full-width product details layout instead of collapsible detail cards.
- Product details intro is editable from the add/edit product page and can be hidden without leaving blank space.
- Product detail blocks support image/text sections and rich text output tuned for mobile and desktop.
- Product detail editor defaults were tuned for cleaner Arabic output:
  - soft admin/editor background
  - readable text color in admin mode
  - no black text-container artifacts
  - wider, more even line height for product detail copy
- Product page order form is always visible after quantity selection.
- Product page add-to-cart/order buttons before the form were removed.
- Mobile bottom order strip now appears only after the customer scrolls past the order form into the description/details area.
- Mobile admin orders cards were redesigned and grouped by date, with today's orders shown first by current sorting.
- Product gallery save flow includes a guard to avoid accidentally collapsing an existing multi-image gallery to one image during partial saves.

## Meta Pixel Completed

- Current live Meta Pixel dataset ID: `1024192293463169`.
- Base Meta Pixel snippet is installed in `index.html`.
- Runtime helper is in `src/lib/metaPixel.ts`.
- Coded browser events currently include:
  - `PageView`
  - `ViewContent`
  - `Search`
  - `AddToCart`
  - `InitiateCheckout`
  - `Purchase`
- Admin routes are excluded from tracking.
- Events Manager confirmed active/processed events after deployment.
- Note: the site security headers can block Meta's visual Event Setup Tool from attaching its overlay. The coded events still work and are preferred for ads.

## Verified

- `npm.cmd run encoding:check` is the fast Arabic safety check.
- `npm.cmd run build` is the production build check.
- Cloudflare deployments have succeeded from GitHub `main`.
- Live site loads at https://tanjamall.com/
- `www.tanjamall.com` redirects to `tanjamall.com`.
- Live order saving to Supabase has been tested.
- Admin login is connected to Supabase.
- Admin orders view reads Supabase orders.
- Meta Pixel requests and events have been observed on the live site.

## Important Notes

- The Supabase anon key is public by design, but the service role key must never be added to the frontend or Git.
- `.env.local` contains local Supabase values and is intentionally ignored.
- Preserve Arabic text as UTF-8. Run `npm.cmd run encoding:check` after Arabic copy/UI edits.
- The visible brand is now primarily `TanjaMall`, while some internal folders/files still use `TanjaMol`.
- `X-Frame-Options: DENY` and `frame-ancestors 'none'` should not be loosened permanently. If Meta's visual Event Setup Tool is ever required, treat any security-header change as temporary and revert immediately afterward.

## Current Safe Pause Point

- Products, settings, orders, admin login, product media, product page detail content, and Meta Pixel tracking are all connected.
- Next improvements can be scoped to polish, analytics refinements, content/listing work, or Supabase schema documentation refreshes.
