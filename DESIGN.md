# TanjaMall Design Context

## Visual Register

This is product UI for a practical COD store. The design should feel warm, direct, trustworthy, and operational. The admin is a working surface, not a landing page. The storefront should show actual products clearly and make ordering feel simple.

## Current System

Use the existing CSS variables in `src/index.css` before adding new hard-coded colors:

- `--tm-brand`
- `--tm-brand-strong`
- `--tm-brand-soft`
- `--tm-header`
- `--tm-ink`
- `--tm-muted`
- `--tm-surface`
- `--tm-surface-soft`
- `--tm-surface-tint`
- `--tm-surface-white`
- `--tm-border`
- `--tm-border-strong`
- `--tm-focus`
- `--tm-warning`
- `--tm-warning-soft`
- `--tm-shadow-sm`
- `--tm-shadow-md`
- `--tm-shadow-lg`
- `--tm-shadow-brand`
- `--tm-shadow-border`
- `--tm-shadow-control`

Admin and component aliases:

- `--tm-selection-bg`
- `--tm-selection-fg`
- `--tm-admin-shadow-card`
- `--tm-admin-image-outline`
- `--tm-admin-press-scale`

When a new repeated value appears, prefer adding a semantic token over copying another hex value. Keep token additions small and obvious.

## Mobile Admin Rules

- Treat mobile admin as a primary workflow, not a squeezed desktop view.
- Keep the bottom deck navigation available only on admin mobile surfaces.
- Leave enough bottom padding so fixed navigation never covers buttons or form controls.
- Aim for 44px touch targets for important actions and compact controls.
- Keep order actions in a single compact row when space allows: status, call, WhatsApp, copy.
- Icon-only controls need accessible labels and visible focus states.
- Avoid nested cards. Use cards for repeated items, not as wrappers around every section.

## Desktop Admin Rules

- Preserve the existing desktop sidebar and table workflows unless the task explicitly changes them.
- Keep desktop dense and operational, with clear scan lines and predictable action placement.
- Do not trade working desktop tables for decorative mobile-first layouts.

## Storefront Rules

- Use real product imagery whenever possible.
- Keep price, variants, delivery, COD, and submit actions clear on mobile.
- Do not imply that customers must submit orders through WhatsApp.
- After order submission, show a clear success state and do not fake success if Supabase save fails.

## Arabic And RTL

- Arabic content must remain UTF-8.
- Avoid broad PowerShell rewrites on Arabic-heavy files.
- Patch exact lines or use narrow UTF-8-safe Node edits when needed.
- Keep Arabic labels short enough for mobile controls, especially order statuses.
- Use RTL-aware spacing, wrapping, and alignment.

## Accessibility

- Do not remove visible focus behavior.
- Prefer semantic buttons, links, labels, and form controls.
- Placeholder text should not be the only label for important fields.
- Icon-only actions need `aria-label` or an equivalent accessible name.

## Performance

- Keep heavy editors lazy-loaded.
- Delay rich text editor loading until the editor section is opened or needed.
- Add safe `loading`, `decoding`, and dimensions to preview images where practical.
- Do not lazy-load priority hero images that affect the first meaningful view.

## Avoid

- Gradient text, decorative glass panels, side-stripe card accents, and generic SaaS metric templates.
- One-note palettes dominated by a single hue.
- Huge redesigns hidden inside small bug or polish requests.
- Product variant table mobile redesign unless explicitly requested.
