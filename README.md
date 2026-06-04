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

## Cloudflare Pages

Use these settings when creating the Cloudflare Pages project:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `24`

The `public/_headers` file adds basic browser security headers and long-lived caching for built assets. The `public/_redirects` file keeps client-side routes loading through `index.html`.
