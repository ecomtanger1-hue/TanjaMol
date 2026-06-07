# Storefront Polish Notes

## Context

Current project folder:

`C:\Users\SAEED\Documents\TanjaMol 2\Tanjamolstore`

Skill used for this polish sequence:

`$make-interfaces-feel-better`

Skill file:

`C:\Users\SAEED\Documents\TanjaMol 2\.agents\skills\make-interfaces-feel-better\SKILL.md`

Related ecommerce guidance:

`storefront-best-practices`

Standing instruction from the user:

Do not chase screenshot/cropping quirks. Fix real layout, spacing, behavior, responsiveness, and interaction issues only.

## Original Suggestion List

### Motion polish

| Before | After |
| --- | --- |
| Mobile menu opens well, but the icon simply swaps between menu and close | Cross-fade/scale the two icons so it feels like one control transforming |
| Add-to-cart feedback is improved, but still mostly button-local | Add a tiny directional â€œaddedâ€ motion toward the cart count, then pulse the cart count once |
| Hero slideshow stops after limited loops | Keep that calm behavior, but add manual dots/arrows so customers can control it |

### Surfaces and depth

| Before | After |
| --- | --- |
| Some cards still rely on visible borders | Replace more borders with soft layered shadows where the background is light |
| Product cards, cart items, and menu buttons use similar radius but not always concentric | Standardize nested radius: outer card slightly larger, inner image/button slightly smaller |
| Mobile cart drawer and search panel feel functional but could feel more premium | Add slightly more dimensional surface shadow and cleaner edge separation |

### Typography

| Before | After |
| --- | --- |
| Arabic product titles can become dense in cards | Tune line height and max lines per context: tighter for cards, more breathing room on product page |
| Some labels and headings use very heavy weights everywhere | Reserve the heaviest weight for section titles/prices; use slightly lighter weight for helper labels |
| Long category/product names are truncated in places | Use smarter truncation only where needed, and avoid cropping important first words |

### Interaction details

| Before | After |
| --- | --- |
| Most buttons have press feedback | Audit every customer-facing button/icon so all use the same `scale(0.96)` feel |
| Search opens cleanly | Animate result rows in subtly only after typing, not when opening empty search |
| Gallery dots work | Make active dot transition width/color smoothly and keep touch target bigger than the visible dot |

### Image treatment

| Before | After |
| --- | --- |
| Images mostly look fine, but edge treatment varies | Add consistent subtle `1px` image outline: black/10 on light, white/10 on dark |
| Hero/product images dominate correctly | Add consistent loading skeleton/background color so image loading feels intentional |

### Performance and polish

| Before | After |
| --- | --- |
| CSS has many transition utilities and animations | Continue replacing broad transitions with exact properties only |
| Some staged animations use keyframes | Keep keyframes only for staged moments; use transitions for hover/open/close states |
| Reduced-motion support exists | Expand it to cover every decorative motion, especially add-to-cart and hero effects |

## Work Completed

### Motion polish

- Homepage now uses the same shared header as the rest of the storefront.
- Mobile menu icon now transitions between menu and close instead of hard-swapping.
- Mobile hero has calmer motion and manual slide dots.
- Add-to-cart feedback has a clearer added-state motion.
- Product-card add-to-cart uses the same added feedback motion as the product page.

### Surfaces and depth

- Added shared shadow/ring tokens for card and panel depth.
- Improved depth for `tm-card`, `tm-panel`, `tm-panel-white`, badges, secondary buttons, and icon buttons.
- Product detail blocks and review notes use shared surface treatment instead of flat borders.
- Cart item images use the shared subtle image outline.

### Typography

- Added shared typography utilities:
  - `tm-kicker`
  - `tm-product-card-title`
  - `tm-compact-label`
- Applied better wrapping and weight choices across homepage, product cards, search/info/cart text, product details, and rich product blocks.
- Reduced overly-heavy supporting paragraph text in several customer-facing areas.
- Corrected main product page title wrapping:
  - It must not use balanced wrapping.
  - It should fill the first line naturally and only wrap leftover words onto the second line.

## Current Stopping Point

We stopped right before:

`Interaction details`

That is the next phase to do in a new chat.

## Next Phase: Interaction Details

Recommended prompt for the next chat:

â€œUse `STOREFRONT_POLISH_NOTES.md` and continue with the `Interaction details` phase. Backup first, do not publish unless I ask, and do not chase screenshot/cropping quirks.â€

Expected scope:

- Audit customer-facing buttons/icons for consistent press feedback.
- Make search result rows enter subtly only after typing.
- Improve gallery dot transitions while keeping the touch target larger than the visible dot.
- Keep changes customer-facing only unless explicitly told otherwise.
- Build and provide local preview link.

## Remaining Later Phases

- Image treatment.
- Performance and polish.
- Admin/dashboard polish as a separate phase after storefront approval.

## Local Preview

[http://127.0.0.1:5173/TanjaMol/](http://127.0.0.1:5173/TanjaMol/)

