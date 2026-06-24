import type { ProductDetailBlock } from '../storefrontRuntime';

const legacyStarterTitles = [
  'شاشة وتنبيهات تساعدك طوال اليوم',
  'بطارية مناسبة للاستعمال اليومي',
];

const legacyStarterTexts = [
  'اكتب النص الكامل لهذا البلوك. سيظهر بجانب الصورة في صفحة المنتج بنفس الاتجاه المحدد هنا.',
  'أضف تفاصيل إضافية عن المنتج، ويمكنك استخدام صورة أو فيديو مع النص.',
];

export function isPlaceholderDetailTitle(value = '') {
  const title = value.trim();
  return /^بلوك\s+\d+$/.test(title) || legacyStarterTitles.includes(title);
}

function isLegacyStarterText(value = '') {
  return legacyStarterTexts.includes(value.replace(/\s+/g, ' ').trim());
}

function richTextHasLegacyStarter(html = '') {
  const normalizedHtml = html.replace(/\s+/g, ' ');
  return legacyStarterTexts.some(text => normalizedHtml.includes(text));
}

export function cleanProductDetailBlock(detail: ProductDetailBlock, index = 0): ProductDetailBlock {
  const text = isLegacyStarterText(detail.text) ? '' : detail.text;
  const richTextHtml = richTextHasLegacyStarter(detail.richTextHtml) ? '' : detail.richTextHtml;

  return {
    ...detail,
    title: isPlaceholderDetailTitle(detail.title) ? '' : detail.title,
    text,
    richTextHtml,
    reverse: detail.reverse ?? index % 2 === 1,
  };
}

export function hasProductDetailContent(detail: ProductDetailBlock) {
  const cleanDetail = cleanProductDetailBlock(detail);
  return Boolean(
    cleanDetail.title?.trim() ||
    cleanDetail.text?.trim() ||
    cleanDetail.richTextHtml?.trim() ||
    cleanDetail.mediaUrl?.trim()
  );
}

export function cleanProductDetails(details: ProductDetailBlock[] = []) {
  return details
    .map((detail, index) => cleanProductDetailBlock(detail, index))
    .filter(hasProductDetailContent);
}
