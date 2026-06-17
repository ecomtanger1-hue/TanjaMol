# TanjaMol Storefront

Arabic COD storefront prototype for TanjaMol.

## Local testing

```bash
npm install
npm run dev
```

Open:

- Storefront: http://127.0.0.1:5173/#/
- Product page: http://127.0.0.1:5173/#/product/smart-watch

## Production check

```bash
npm run build
npm run preview
```

## Meta Pixel

Create a Pixel in Meta Events Manager, then set this environment variable before deploying:

```bash
VITE_META_PIXEL_ID=your-meta-pixel-id
```

The storefront tracks PageView, ViewContent, Search, AddToCart, InitiateCheckout, and Purchase events. Admin pages are excluded from tracking.

## Supabase Storage

Product, gallery, detail-block, variant, and inline editor images upload to the public `product-images` bucket in Supabase Storage.

If uploads show a Storage setup error, run `supabase/storage-setup.sql` in the Supabase SQL editor for the live project. Then verify it locally:

```bash
npm run storage:check
```

## Cloudflare Pages

Use these settings when creating the Cloudflare Pages project:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `24`

The `public/_headers` file adds basic browser security headers and long-lived caching for built assets. The `public/_redirects` file keeps client-side routes loading through `index.html`.
