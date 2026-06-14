# TanjaMall Project Map

Use this map before editing. The goal is to find the smallest relevant code path, fix it directly, run the right checks, and avoid broad rewrites.

## Main Entry Points

- `src/App.tsx`
  App state, routing, admin login, cart state, order submission orchestration, settings save orchestration, product save/delete/hide flows.

- `src/storefrontRuntime.ts`
  Shared storefront types, default products/categories/settings, route helpers, filtering helpers, WhatsApp order helper legacy code.

- `supabase/tanjamol-live-schema.sql`
  Local snapshot of live Supabase schema and RLS policies. Update it when live database shape or policies change.

## Storefront UI

- `src/components/storefront/CODTangerArabicStoreLanding.tsx`
  Homepage, hero product display, homepage category strip, storefront product sections.

- `src/components/product/TanjaMolArabicCODProductPage.tsx`
  Product detail page, variant selection, quantity controls, product-page order form, sticky mobile order bar.

- `src/components/storefront/ProductCard.tsx`
  Product listing cards used across storefront grids.

- `src/components/storefront/StorefrontPages.tsx`
  Large mixed file. Contains cart popup, category/search/info pages, admin orders pages, admin settings page, shared admin shell pieces.
  Prefer focused edits here and search by component/function name before patching.

- `src/components/product/ProductDetailRichText.tsx`
  Product media/rich text rendering blocks.

## Admin UI

- `src/components/admin/AdminLayout.tsx`
  Admin sidebar/nav shell.

- `src/components/admin/AdminProductsPage.tsx`
  Admin product table/listing and product management entry points.

- `src/components/magicpath/tanja-mol-add-product-page/TanjaMolAddProductPage.tsx`
  Add/edit product form, draft/publish UI, category selector, product fields, product media/editor controls.

- `src/components/magicpath/tanja-mol-add-product-page/JoditBlockEditor.tsx`
  Rich text/block editor used by product form.

- `src/components/magicpath/tanja-mol-admin-product-dashboard/TanjaMolAdminProductDashboard.tsx`
  Admin dashboard metrics and product/order summary cards.

## Supabase Helpers

- `src/lib/supabase.ts`
  Supabase client setup.

- `src/lib/supabaseProducts.ts`
  Product fetch/save/delete mapping between app product objects and Supabase product rows.

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

- Draft product behavior is wrong:
  Check `TanjaMolAddProductPage.tsx` draft/autosave logic, `saveProduct` in `src/App.tsx`, and `is_draft` / `is_visible` mapping in `src/lib/supabaseProducts.ts`.

- Category does not show:
  Check `AdminSettingsPage` in `src/components/storefront/StorefrontPages.tsx`, `src/lib/supabaseSettings.ts`, `getStoreCategories` in `src/storefrontRuntime.ts`, and homepage rendering in `CODTangerArabicStoreLanding.tsx`.

- Hero product does not change:
  Check `AdminSettingsPage` hero dropdown, `src/lib/supabaseSettings.ts` `heroProductSlug`, and `getHomepageSections` in `CODTangerArabicStoreLanding.tsx`.

- Arabic text looks corrupted:
  Run `npm.cmd run encoding:check`. Fix the exact flagged line. Do not use broad PowerShell rewrites on Arabic-heavy files.

- Mobile layout overflow:
  Start with the component rendering the visible screen. Search for fixed widths, `grid-cols`, `min-w`, `overflow`, product image sizes, and long unbroken text.

- Blank page after refreshing a clean URL:
  Check `vite.config.ts` `base` first. Cloudflare Pages uses `public/_redirects` to serve `index.html` for SPA routes, so production assets must be root-relative (`base: '/'`). A relative base (`'./'`) makes refreshed routes like `/admin/products` look for chunks under `/admin/assets/...` and the app can load as a white page.

## Data Flows

Customer order flow:

`Product/Cart form` -> `src/App.tsx submitOrderDraft` -> `src/lib/supabaseOrders.ts` -> `public.orders` + `public.order_items` -> `src/lib/supabaseAdmin.ts fetchAdminOrders` -> admin orders UI.

Settings/category/hero flow:

`AdminSettingsPage` -> `src/App.tsx saveStoreSettings` -> `src/lib/supabaseSettings.ts` -> `public.store_settings` -> `fetchStoreSettingsFromSupabase` -> `getStoreCategories` / homepage hero rendering.

Product draft/publish flow:

`TanjaMolAddProductPage` -> `src/App.tsx saveProduct` -> `src/lib/supabaseProducts.ts` -> `public.products` -> storefront product filtering.

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
