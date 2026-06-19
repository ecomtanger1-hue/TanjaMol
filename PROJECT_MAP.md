# TanjaMall Project Map

Use this map before editing. The goal is to find the smallest relevant code path, fix it directly, run the right checks, and avoid broad rewrites.

## Main Entry Points

- `src/App.tsx`
  App state, routing, admin login/session restore, cart/direct-order state, order submission orchestration, settings save orchestration, product save/delete/hide/draft flows, and Meta Pixel event triggers.

- `src/storefrontRuntime.ts`
  Shared storefront types, default products/categories/settings, route helpers, filtering helpers, WhatsApp order helper legacy code.

- `src/lib/metaPixel.ts`
  Meta Pixel helper. Current live pixel ID is `1024192293463169`. Tracks PageView, ViewContent, Search, AddToCart, InitiateCheckout, and Purchase. Admin routes are skipped.

- `index.html`
  Contains the Meta Pixel base snippet in the document head and the noscript fallback in the body. Keep this synchronized with `src/lib/metaPixel.ts` when changing datasets.

- `public/_headers`
  Cloudflare Pages security/cache headers. `X-Frame-Options: DENY` and `frame-ancestors 'none'` protect against framing/clickjacking; they can interfere with Meta's visual Event Setup Tool, but do not block coded pixel events.

- `supabase/tanjamol-live-schema.sql`
  Local snapshot of live Supabase schema and RLS policies. Update it when live database shape or policies change.

## Storefront UI

- `src/components/storefront/CODTangerArabicStoreLanding.tsx`
  Homepage, hero product display, homepage category strip, storefront product sections.

- `src/components/product/TanjaMolArabicCODProductPage.tsx`
  Product detail page, gallery, rich detail sections, editable details intro rendering, variant selection, quantity controls, always-visible product-page order form, and mobile sticky order strip that appears after the user scrolls past the order form.

- `src/components/storefront/ProductCard.tsx`
  Product listing cards used across storefront grids.

- `src/components/storefront/StorefrontPages.tsx`
  Large mixed file. Contains cart popup, category/search/info pages, admin orders pages, admin settings page, shared admin shell pieces.
  Prefer focused edits here and search by component/function name before patching.

- `src/components/product/ProductDetailRichText.tsx`
  Product media/rich text rendering blocks. Responsible for sanitizing and rendering editor HTML without leaking editor-only black backgrounds or inline container artifacts.

## Admin UI

- `src/components/admin/AdminLayout.tsx`
  Older admin sidebar/nav shell. The active admin experience is now primarily the shadcn admin shell below.

- `src/components/admin-shadcn/ShadcnAdminShell.tsx`
  Active admin shell/sidebar/header for dashboard, orders, products, settings, and login routes.

- `src/components/admin-shadcn/ShadcnAdminLogin.tsx`
  Active Supabase admin login screen.

- `src/components/admin-shadcn/ShadcnAdminDashboard.tsx`
  Active admin dashboard metrics and recent order/product summaries.

- `src/components/admin-shadcn/ShadcnAdminOrders.tsx`
  Active admin orders, order detail, and customer detail views. Mobile order cards are grouped by date, with today's orders shown at the top by current sorting.

- `src/components/admin-shadcn/ShadcnAdminProductsPage.tsx`
  Active admin product list/table.

- `src/components/admin-shadcn/ShadcnAdminSettingsPage.tsx`
  Active store settings/category/hero product admin page.

- `src/components/admin/AdminProductsPage.tsx`
  Older admin product table/listing. Keep in mind it may not be the route currently rendered.

- `src/components/magicpath/tanja-mol-add-product-page/TanjaMolAddProductPage.tsx`
  Add/edit product form, draft/publish UI, category selector, product fields, gallery/media upload controls, editable product details intro with hide toggle, detail blocks, and editor controls.

- `src/components/magicpath/tanja-mol-add-product-page/JoditBlockEditor.tsx`
  Rich text/block editor used by product form. Styling is tuned for a softer admin theme and product-detail output defaults: Noto Sans Arabic/Cairo-friendly sizing, readable line-height, neutral editor background, and no black text container artifacts.

- `src/components/magicpath/tanja-mol-admin-product-dashboard/TanjaMolAdminProductDashboard.tsx`
  Legacy/MagicPath dashboard source. Check active `admin-shadcn` components before editing dashboard UI.

## Supabase Helpers

- `src/lib/supabase.ts`
  Supabase client setup.

- `src/lib/supabaseProducts.ts`
  Product fetch/save/delete mapping between app product objects and Supabase product rows, including gallery, detail blocks, details intro, draft/visibility state, and a safeguard that prevents accidentally collapsing an existing multi-image gallery to one image during partial saves.

- `src/lib/supabaseOrders.ts`
  Public/customer order insert path. Check this when customer order submission fails.

- `src/lib/supabaseAdmin.ts`
  Admin order fetch/update path, including WhatsApp sent status tracking.

- `src/lib/supabaseSettings.ts`
  Store settings save/load path, categories, hero product slug, legacy settings fallback.

- `src/lib/supabaseStorage.ts`
  Product media upload/storage helpers.

- `src/lib/routing.ts`
  Clean URL/hash route conversion helpers.

## Common Problem Paths

- Customer order does not appear in dashboard:
  Check `src/App.tsx` order submit flow, `src/lib/supabaseOrders.ts`, `orders_public_insert` policy in `supabase/tanjamol-live-schema.sql`, then admin fetch in `src/lib/supabaseAdmin.ts`.

- WhatsApp button/status is wrong:
  Check `OrderQuickActions` in `src/components/storefront/StorefrontPages.tsx`, `markOrderCustomerMessageSent` in `src/App.tsx`, and `markAdminOrderCustomerMessageSent` in `src/lib/supabaseAdmin.ts`.

- Product saves locally only:
  Check `saveProduct` in `src/App.tsx`, `src/lib/supabaseProducts.ts`, Supabase product columns/RLS policies, and storage upload errors if media is involved.

- Product gallery shrinks to one image after editing:
  Check the gallery merge guard in `saveProduct` in `src/App.tsx`, then the `gallery` mapping in `src/lib/supabaseProducts.ts`, then the add/edit page gallery draft state in `TanjaMolAddProductPage.tsx`.

- Draft product behavior is wrong:
  Check `TanjaMolAddProductPage.tsx` draft/autosave logic, `saveProduct` in `src/App.tsx`, and `is_draft` / `is_visible` mapping in `src/lib/supabaseProducts.ts`.

- Product details/intro disappear:
  Check `detailsIntro.hidden` and detail block state in `TanjaMolAddProductPage.tsx`, Supabase mapping in `src/lib/supabaseProducts.ts`, and rendering conditions in `TanjaMolArabicCODProductPage.tsx`.

- Product detail rich text looks like editor output instead of premium page content:
  Check `JoditBlockEditor.tsx` defaults, then `ProductDetailRichText.tsx` renderer styles/sanitization, and finally the product detail section layout in `TanjaMolArabicCODProductPage.tsx`.

- Category does not show:
  Check `AdminSettingsPage` in `src/components/storefront/StorefrontPages.tsx`, `src/lib/supabaseSettings.ts`, `getStoreCategories` in `src/storefrontRuntime.ts`, and homepage rendering in `CODTangerArabicStoreLanding.tsx`.

- Hero product does not change:
  Check `AdminSettingsPage` hero dropdown, `src/lib/supabaseSettings.ts` `heroProductSlug`, and `getHomepageSections` in `CODTangerArabicStoreLanding.tsx`.

- Arabic text looks corrupted:
  Run `npm.cmd run encoding:check`. Fix the exact flagged line. Do not use broad PowerShell rewrites on Arabic-heavy files.

- Mobile layout overflow:
  Start with the component rendering the visible screen. Search for fixed widths, `grid-cols`, `min-w`, `overflow`, product image sizes, and long unbroken text.

- Mobile product order strip behavior is wrong:
  Check `TanjaMolArabicCODProductPage.tsx`. The main order form should be visible immediately after quantity selection. The bottom sticky strip should appear only after scrolling past the order form into product description/details.

- Meta Pixel is not detected:
  Check `index.html` base snippet, `src/lib/metaPixel.ts` pixel ID and event helpers, and live network requests to `connect.facebook.net`. Meta's visual Event Setup Tool can be blocked by `X-Frame-Options: DENY`; coded events can still work.

- Blank page after refreshing a clean URL:
  Check `vite.config.ts` `base` first. Cloudflare Pages uses `public/_redirects` to serve `index.html` for SPA routes, so production assets must be root-relative (`base: '/'`). A relative base (`'./'`) makes refreshed routes like `/admin/products` look for chunks under `/admin/assets/...` and the app can load as a white page.

## Data Flows

Customer order flow:

`Product/Cart form` -> `src/App.tsx submitOrderDraft` -> `src/lib/supabaseOrders.ts` -> `public.orders` + `public.order_items` -> `src/lib/supabaseAdmin.ts fetchAdminOrders` -> admin orders UI.

Product page direct order flow:

`TanjaMolArabicCODProductPage.tsx quantity + visible order form` -> `src/App.tsx submitDirectOrder` / `submitOrderDraft` -> `src/lib/supabaseOrders.ts` -> `trackInitiateCheckout` before submission and `trackPurchase` after successful order creation.

Settings/category/hero flow:

`AdminSettingsPage` -> `src/App.tsx saveStoreSettings` -> `src/lib/supabaseSettings.ts` -> `public.store_settings` -> `fetchStoreSettingsFromSupabase` -> `getStoreCategories` / homepage hero rendering.

Product draft/publish flow:

`TanjaMolAddProductPage` -> `src/App.tsx saveProduct` -> `src/lib/supabaseProducts.ts` -> `public.products` -> storefront product filtering.

Product details flow:

`TanjaMolAddProductPage details intro + detail blocks + JoditBlockEditor` -> `src/App.tsx saveProduct` -> `src/lib/supabaseProducts.ts` JSON mapping -> `TanjaMolArabicCODProductPage` -> `ProductDetailRichText`.

Meta Pixel flow:

`index.html base PageView snippet` -> `src/lib/metaPixel.ts ensureMetaPixel` -> `src/App.tsx route/cart/order triggers` -> Meta Events Manager. Avoid duplicate first PageView by keeping `window.__tmMetaPixelBasePageView` coordination intact.

Admin WhatsApp status flow:

`OrderQuickActions` -> `src/App.tsx markOrderCustomerMessageSent` -> `src/lib/supabaseAdmin.ts` -> `customer_message_status` + `customer_message_sent_at` on `public.orders`.

## Checks And Publishing

- Fast Arabic safety check: `npm.cmd run encoding:check`
- Production build: `npm.cmd run build`
- Storage check when media uploads fail: `npm.cmd run storage:check`
- Publish flow is GitHub `main` -> Cloudflare Pages.
- If the user says no preview/browser check, do not run one. Build and deployment status checks are still okay unless they say otherwise.

## Editing Discipline

- Read before editing. Search by function/component name and inspect the nearby code path.
- Keep changes scoped to the reported behavior.
- Use `apply_patch` for manual edits.
- If a file contains Arabic and patch matching is hard, use a narrow UTF-8-safe Node edit or Unicode escapes, then immediately run `npm.cmd run encoding:check`.
- Before commit, review `git diff --stat` and a focused diff for touched files.
