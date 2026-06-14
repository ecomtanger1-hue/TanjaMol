# TanjaMall Product Context

register: product

## Purpose

TanjaMall is a cash-on-delivery ecommerce store focused on fast mobile shopping and practical admin operations. The storefront captures orders into the dashboard first, then the admin confirms and updates the customer manually by WhatsApp or phone.

## Primary Users

- Customers: mostly mobile shoppers who need a clear product page, simple checkout, COD trust cues, and a confirmation that their order was received.
- Admin/operator: manages orders, products, categories, hero product, settings, and customer follow-up from both desktop and phone.

## Core Workflow

1. Customer browses products and submits an order on the site.
2. Supabase is the source of truth for products, settings, categories, orders, and order status.
3. A new order starts in the dashboard as `new`.
4. Admin contacts the customer through the order WhatsApp action or phone call.
5. Admin updates order status through reversible status controls.
6. WhatsApp sent state tracks whether the current status message has been sent.

## Product Priorities

- Mobile-first admin work: orders, products, and settings must be manageable from a phone.
- Dashboard-first COD: customers should not be required to submit the order through WhatsApp.
- Fast recovery: product drafts should preserve work during refreshes or connection drops.
- Operational clarity: order status, customer contact, totals, and products should be visible without hunting.
- Arabic and RTL are first-class requirements.

## Non-Negotiables

- Do not introduce local-only product saves as a success path.
- Do not bypass Supabase for order or product persistence unless explicitly scoped as cache/fallback.
- Preserve reversible admin status changes.
- Preserve WhatsApp as an admin communication tool, not the customer order submission path.
- Preserve Arabic UTF-8. Run the encoding check before publishing UI or copy changes.
- Keep edits scoped. Avoid unrelated redesigns, schema changes, or broad rewrites.
- If the user asks for no preview/browser check, run builds only and publish through `main`.

## Storefront Goals

- Product-first browsing with real images, clear price, variants, quantity, delivery/COD details, and simple order submission.
- Customer success state must clearly show order number, total, COD note, and that the store will contact them to confirm.
- Mobile purchase controls should stay reachable and should not hide important content.

## Admin Goals

- Admin dashboard should be dense but readable, with mobile bottom deck navigation for quick movement.
- Orders should make the next action obvious: status, WhatsApp, call, copy details.
- Product list should support search, filters, sorting, visibility, edit, delete, and selection without forcing desktop tables on phone.
- Settings should support categories, hero product, and store information cleanly on phone and desktop.

## Avoid

- Marketing-style admin screens that slow down repeated work.
- Nested cards and low-value helper text where a label plus value is enough.
- Hidden destructive actions or one-click irreversible state changes.
- Broad token or palette rewrites during small fixes.
