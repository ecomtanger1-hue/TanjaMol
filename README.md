# TanjaMall Storefront

Arabic COD storefront/admin app for TanjaMall.

## Local Testing

```bash
npm.cmd install
npm.cmd run dev
```

Open:

- Storefront: http://127.0.0.1:5173/#/
- Admin: http://127.0.0.1:5173/#/admin

## Production Check

```bash
npm.cmd run encoding:check
npm.cmd run build
npm.cmd run preview
```

## Meta Pixel

Current live Meta Pixel dataset ID:

```bash
1024192293463169
```

The base snippet is installed in `index.html`, and runtime event helpers live in `src/lib/metaPixel.ts`. Keep both synchronized if the pixel/dataset changes.

The storefront tracks PageView, ViewContent, Search, AddToCart, InitiateCheckout, and Purchase events. Admin routes are excluded from tracking.

The site uses strict framing protection (`X-Frame-Options: DENY` and `frame-ancestors 'none'`). This can prevent Meta's visual Event Setup Tool from attaching to the site, but coded pixel events still work and are the preferred tracking path.

## Supabase

The app uses Supabase for:

- admin login/session restore
- products, draft/visibility state, gallery/detail metadata
- orders and order items
- store settings/categories/hero product
- public product image storage

## Supabase Storage

Product, gallery, detail-block, variant, and inline editor images upload to the public `product-images` bucket in Supabase Storage.

If uploads show a Storage setup error, run `supabase/storage-setup.sql` in the Supabase SQL editor for the live project. Then verify it locally:

```bash
npm.cmd run storage:check
```

## Cloudflare Pages

Use these settings when creating the Cloudflare Pages project:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `24`

The `public/_headers` file adds basic browser security headers and long-lived caching for built assets. The `public/_redirects` file keeps client-side routes loading through `index.html`.
