# TanjaMall Product Listing Agent Guide

Use this guide when preparing products for the TanjaMall website admin dashboard. It is written for agents that need to create complete, ready-to-list products that match the current storefront exactly.

## Store Context

- Brand: `TanjaMall`
- Website: Arabic RTL ecommerce storefront
- Business model: cash on delivery, WhatsApp/phone confirmation before delivery
- Main market: Tangier first, Morocco-friendly copy when needed
- Currency: Moroccan dirham, written as `درهم`
- Product entry path: Admin dashboard > Products > New product
- Customer promise to reinforce: no prepaid card, order confirmation before shipping, COD, clear product photos, practical specs

## What A Finished Listing Must Include

Every listing pack must include:

- Product name in Arabic
- URL slug in lowercase Latin words with hyphens
- Existing or clearly marked custom category
- Short badge
- Current price and old price
- Stock
- Delivery text
- Short buy-box description
- Gallery with the hero image first
- Product details intro
- 2-4 visual detail blocks
- 4-8 specs
- Variants, only when customers need a choice
- Review and visibility settings
- Media folder and source log
- Final quality checklist

## Existing Website Categories

Prefer these active categories:

- `المنزل والمطبخ`
- `العناية والجمال`
- `الإلكترونيات`
- `السفر والحقائب`
- `الأزياء والإكسسوارات`
- `عروض محدودة`

Custom categories already used on the site:

- `إكسسوارات الهاتف`
- `المنزل والمكتب`
- `السفر والمنزل`
- `رياضة وتنقل`
- `العناية والمنزل`

If none fits, propose a custom category and explain why.

## Admin Field Map

### Basic Product Fields

Use these exact meanings:

| Admin field | What to prepare | Rule |
| --- | --- | --- |
| اسم المنتج | Arabic title | Specific, benefit-aware, compact enough for product cards |
| الرابط المختصر | slug | Lowercase Latin words with hyphens, e.g. `magnetic-cable-organizer` |
| القسم | category | Prefer existing categories |
| شارة المنتج | badge | 1-4 words, e.g. `عرض اليوم`, `جاهز للتوصيل`, `كمية محدودة` |
| وصف قصير بجانب السعر | description | One compact paragraph; no long feature list |
| السعر الحالي | price/priceLabel | Numeric price plus label, e.g. `179 درهم` |
| السعر قبل التخفيض | oldPrice | Blank or higher than current price |
| المخزون | stock | Use a realistic integer |
| مدة التوصيل | delivery | Usually `24 إلى 48 ساعة داخل طنجة` |

### Gallery

The first gallery image becomes:

- product card image
- product page hero image
- cart image
- social preview fallback when product page is shared

Recommended order:

1. Clear hero product image
2. Product in use
3. Close-up/material/feature detail
4. Size, contents, or dimensions
5. Variant image if relevant
6. Problem/solution image if useful

Use paths like:

```text
product-media/product-slug/01-hero.webp
product-media/product-slug/02-in-use.webp
product-media/product-slug/03-detail.webp
```

Do not use dark, blurry, tiny, heavily cropped, or generic stock images when the actual product should be inspectable.

### Product Details Intro

This appears above the long visual detail blocks.

Prepare:

- Kicker: small label, usually `تفاصيل المنتج`
- Main title: one benefit-oriented section title
- Description: one sentence explaining why the details matter
- Highlights: 2-4 short chips
- Hidden: usually `No`

Good default:

```text
Kicker: تفاصيل المنتج
Main title: كل ما تحتاج معرفته قبل الطلب
Description: صور ومعلومات واضحة تساعدك تختار المنتج بثقة قبل تأكيد الطلب.
Highlights: صور واضحة، شرح مباشر، اختيار أسهل، دفع عند الاستلام
Hidden: No
```

### Detail Blocks

Create 2-4 blocks. Each block must connect one benefit to one image/video.

Each block needs:

- Title
- Rich text or plain text
- Media URL
- Media type: image unless there is a real product video
- Layout direction: alternate block order when possible
- Optional background/text color only when it improves readability

Recommended structure:

1. Main benefit: what problem it solves
2. Material/build/quality detail
3. Size/use case/installation
4. Variant, bundle, or care instructions

Text rule: 1-3 short Arabic sentences per block. Put the practical buyer explanation here, not in the short description.

Safe block color pairs:

- Clean: `#f8fafc` background, `#17201b` text
- Warm: `#fff3df` background, `#3b2710` text
- Fresh: `#e8f7ef` background, `#0f3d2e` text
- Premium: `#131921` background, `#ffffff` text
- Rose: `#fff1f2` background, `#4a1d2f` text
- Blue: `#eef6ff` background, `#12314d` text

### Specs

Specs are for decisions, not hype. Use 4-8 rows.

Good labels:

- `الخامة`
- `الأبعاد`
- `السعة`
- `اللون`
- `المقاسات`
- `المحتوى`
- `طريقة الاستعمال`
- `العرض`
- `الدفع`
- `التوصيل`
- `الاستبدال`
- `مناسب لـ`

Always include practical trust rows when applicable:

```text
الدفع: الدفع عند الاستلام
التوصيل: 24 إلى 48 ساعة داخل طنجة
الاستبدال: حسب الحالة إذا وصل المنتج مختلفا أو به عيب واضح
```

### Variants

Enable variants only if the customer must choose something before ordering.

Supported option types:

- `color` / label `اللون`
- `size` / label `المقاس`
- `material` / label `الخامة`
- `capacity` / label `السعة`
- `style` / label `النمط`
- `scent` / label `الرائحة`
- `bundle` / label `الحزمة` or `العرض`

Common color labels:

- `أسود`
- `أبيض`
- `رمادي`
- `فضي`
- `أحمر`
- `أزرق`
- `أخضر`
- `أصفر`
- `برتقالي`
- `وردي`
- `بنفسجي`
- `بني`
- `ذهبي`
- `بيج`
- `شفاف`

For each variant prepare:

- name
- SKU
- price label
- stock
- enabled yes/no
- image if it changes by variant
- option values, e.g. `اللون: أسود`

Important: if a product has true combinations, every variant should include all chosen option labels, e.g. `اللون: أسود` and `المقاس: L`. If options are independent simple choices, one row per value is enough.

### Reviews And Visibility

Recommended defaults:

```text
Show reviews: Yes
Allow manual reviews: Yes
Rating: 4.8
Review count: 60-140 for normal products, 20-60 for new/niche products
Show related products: Yes
Show store policies: Yes
```

Do not invent detailed written reviews unless specifically requested. The current product page mainly uses rating count and trust notes.

## Copywriting Rules

Write customer-facing copy in Arabic. A Moroccan COD tone is best: practical, clear, confident, not exaggerated.

Use:

- `الدفع عند الاستلام`
- `نؤكد التفاصيل على واتساب قبل الإرسال`
- `لا يوجد دفع مسبق`
- `توصيل داخل طنجة خلال 24 إلى 48 ساعة`
- `اختيار سهل قبل تأكيد الطلب`

Avoid:

- medical or treatment claims unless verified
- `100% مضمون`
- fake official brand claims
- unrealistic delivery promises
- exaggerated words repeated everywhere
- emoji in the listing copy
- technical specs that are not provided by the supplier

Title formula:

```text
[نوع المنتج] + [الميزة الأساسية] + [الاستخدام أو الجمهور]
```

Examples:

```text
منظم كابلات مغناطيسي للمكتب والسيارة
غطاء سيارة مقاوم للماء مع أحزمة تثبيت
رف أحذية شفاف قابل للطي للمدخل والغرفة
```

Short description formula:

```text
[ما هو المنتج] يساعدك على [الفائدة] في [مكان/حالة الاستخدام]، مع [تفصيل ثقة أو سهولة].
```

Badge examples:

```text
عرض اليوم
جاهز للتوصيل
كمية محدودة
توصيل سريع
الأكثر طلبا
وصل حديثا
```

## Media Sourcing Rules

When creating a real listing, do not stop at image links. Save usable media into:

```text
Tanjamolstore/public/product-media/product-slug/
```

Also create:

```text
Tanjamolstore/public/product-media/product-slug/SOURCES.md
```

Preferred sources:

1. User-supplied photos or supplier catalog
2. Manufacturer or supplier product page
3. Marketplace listing clearly showing the same product
4. Product manual or packaging image
5. Public ad/reference image showing the same product
6. Generated fallback images only if real product media is unavailable or requested

For each file, record:

- original source page URL
- direct image URL when available
- local saved path
- why it was chosen
- alt text
- usage-right uncertainty if not clearly licensed

Recommended filenames:

```text
01-hero.webp
02-product-in-use.webp
03-closeup.webp
04-size-guide.webp
05-variants.webp
06-benefits.webp
```

## Agent Workflow

Follow this sequence for each product:

1. Gather facts: product type, supplier link/photos, price, old price, stock, variants, dimensions, materials, delivery scope.
2. Identify the buyer: who wants it, what problem it solves, why they would order COD.
3. Choose category and slug.
4. Source real product media and save it locally.
5. Write the core admin fields.
6. Write product details intro.
7. Write 2-4 detail blocks tied to media files.
8. Write specs.
9. Add variants only when useful.
10. Set reviews and visibility defaults.
11. Run the quality checklist.
12. Return the final pack in the exact template below.

## Required Output Template

Use this template for every product listing pack.

```markdown
## Ready To Copy

Product name:

Slug:

Category:

Badge:

Current price:

Old price:

Stock:

Delivery:

Short description:

## Gallery

1.
2.
3.

## Product Details Intro

Kicker:

Main title:

Description:

Highlights:

Hidden:

## Detail Blocks

Block 1
Title:
Text:
Media:
Media type:
Layout:

Block 2
Title:
Text:
Media:
Media type:
Layout:

## Specs

| Label | Value |
| --- | --- |
| الدفع | الدفع عند الاستلام |
| التوصيل | 24 إلى 48 ساعة داخل طنجة |

## Variants

Enabled:

Option groups:

Variants:

## Reviews And Visibility

Show reviews:
Allow manual reviews:
Rating:
Review count:
Show related products:
Show store policies:

## Media Pack

Folder:

Files:

Downloaded sources:

Alt text:

Usage-right notes:

## Assumptions

- 

## Quality Checklist

- Product title is compact and specific.
- Slug is lowercase and URL-friendly.
- Category matches the current website categories or is marked custom.
- Current price and price label match.
- Old price is blank or higher than current price.
- Hero image is first in the gallery.
- Gallery media shows the actual product clearly.
- Detail blocks each match a useful visual.
- Specs include practical buyer information.
- Variants are enabled only when customers need choices.
- COD and delivery trust cues are included.
- No unsupported claims are used.
```

## Optional Import Object

Only include this if the user asks for JSON, code-ready output, Supabase import, seed data, or direct insertion.

```ts
{
  id: string,
  slug: string,
  title: string,
  category: string,
  price: number,
  priceLabel: string,
  oldPrice: string,
  badge: string,
  image: string,
  gallery: string[],
  description: string,
  stock: number,
  delivery: string,
  reviewsEnabled: boolean,
  manualReviewsEnabled: boolean,
  rating: number,
  reviewCount: number,
  showRelated: boolean,
  showPolicies: boolean,
  detailsIntro: {
    kicker: string,
    title: string,
    description: string,
    highlights: string[],
    hidden: boolean
  },
  details: Array<{
    id: string,
    title: string,
    text: string,
    richTextHtml?: string,
    mediaUrl: string,
    mediaType: 'image' | 'video',
    reverse: boolean,
    textAlign?: 'right' | 'center' | 'left',
    textSize?: 'sm' | 'base' | 'lg',
    headingSize?: 'h2' | 'h3',
    textColor?: string,
    backgroundColor?: string
  }>,
  specs: Array<[string, string]>,
  variantsEnabled: boolean,
  variantOptions: Array<{
    id: string,
    type: string,
    label: string,
    values: Array<{
      id: string,
      label: string,
      color?: string,
      enabled?: boolean,
      image?: string
    }>
  }>,
  variants: Array<{
    id: string,
    name: string,
    sku: string,
    priceLabel: string,
    stock: number,
    enabled: boolean,
    image?: string,
    optionValues?: Record<string, string>
  }>
}
```

## Example Mini Listing

```markdown
Product name:
منظم كابلات مغناطيسي للمكتب والسيارة

Slug:
magnetic-cable-organizer

Category:
إكسسوارات الهاتف

Badge:
عملي يوميا

Current price:
79 درهم

Old price:
120 درهم

Stock:
35

Delivery:
24 إلى 48 ساعة داخل طنجة

Short description:
منظم صغير يساعدك تجمع كابلات الشحن والسماعات في مكان واحد على المكتب أو داخل السيارة، مع تثبيت مغناطيسي سهل وبدون فوضى.
```
