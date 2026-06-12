import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { categories } from '../../../storefrontRuntime';
import type { Product, ProductDetailBlock, ProductVariant, ProductVariantOption } from '../../../storefrontRuntime';
import { AdminSidebar } from '../../admin/AdminLayout';
import { TanjaMallLogo } from '../../brand/TanjaMallLogo';

type AddProductProps = {
  product?: Product;
  products: Product[];
  onBack: () => void;
  onOpenDashboard: () => void;
  onOpenProduct: (slug: string) => void;
  onCreateProduct: (product: Product, previousSlug?: string) => void;
};

type SpecDraft = {
  id: string;
  label: string;
  value: string;
};

type DetailDraft = ProductDetailBlock;
type VariantOptionDraft = ProductVariantOption;

const fallbackImage = 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=85';

const navItems = [
  { label: 'لوحة التحكم', icon: 'dashboard' },
  { label: 'المنتجات', icon: 'box' },
  { label: 'الطلبات', icon: 'orders' },
  { label: 'الزوار', icon: 'users' },
  { label: 'الإعدادات', icon: 'settings' },
] as const;

const uploadInputId = 'tm-product-gallery-upload';
const JoditBlockEditor = lazy(() => import('./JoditBlockEditor').then(module => ({ default: module.JoditBlockEditor })));

const commonColors = [
  { label: 'أسود', color: '#111827' },
  { label: 'أبيض', color: '#ffffff' },
  { label: 'رمادي', color: '#6b7280' },
  { label: 'فضي', color: '#b8beb9' },
  { label: 'أحمر', color: '#dc2626' },
  { label: 'أزرق', color: '#2563eb' },
  { label: 'أخضر', color: '#16a34a' },
  { label: 'أصفر', color: '#facc15' },
  { label: 'برتقالي', color: '#f97316' },
  { label: 'وردي', color: '#ec4899' },
  { label: 'بنفسجي', color: '#7c3aed' },
  { label: 'بني', color: '#92400e' },
  { label: 'ذهبي', color: '#d4af37' },
  { label: 'بيج', color: '#d6b98c' },
  { label: 'شفاف', color: '#f8fafc' },
];

const detailColorTemplates = [
  { id: 'clean', label: 'نظيف وواضح', backgroundColor: '#f8fafc', textColor: '#17201b' },
  { id: 'warm', label: 'دافئ ومريح', backgroundColor: '#fff3df', textColor: '#3b2710' },
  { id: 'fresh', label: 'منعش', backgroundColor: '#e8f7ef', textColor: '#0f3d2e' },
  { id: 'premium', label: 'فاخر', backgroundColor: '#131921', textColor: '#ffffff' },
  { id: 'rose', label: 'ناعم', backgroundColor: '#fff1f2', textColor: '#4a1d2f' },
  { id: 'sand', label: 'هادئ', backgroundColor: '#f7ecd9', textColor: '#2f261c' },
  { id: 'blue', label: 'تقني', backgroundColor: '#eef6ff', textColor: '#12314d' },
  { id: 'contrast', label: 'قوي', backgroundColor: '#fff7ed', textColor: '#9a3412' },
];

const commonVariantTypes = [
  { type: 'color', label: 'اللون', supportsColor: true, examples: ['أسود', 'أبيض', 'أحمر'] },
  { type: 'size', label: 'المقاس', examples: ['S', 'M', 'L'] },
  { type: 'material', label: 'الخامة', examples: ['قطن', 'جلد', 'معدن'] },
  { type: 'capacity', label: 'السعة', examples: ['250ml', '500ml', '1L'] },
  { type: 'style', label: 'النمط', examples: ['كلاسيكي', 'عصري'] },
  { type: 'scent', label: 'الرائحة', examples: ['ورد', 'فانيلا'] },
  { type: 'bundle', label: 'الحزمة', examples: ['قطعة', 'قطعتان'] },
] as const;
const initialDetails: DetailDraft[] = [
  {
    id: 'detail-1',
    title: 'شاشة وتنبيهات تساعدك طوال اليوم',
    text: 'اكتب النص الكامل لهذا البلوك. سيظهر بجانب الصورة في صفحة المنتج بنفس الاتجاه المحدد هنا.',
    mediaUrl: '',
    mediaType: 'image',
    reverse: false,
  },
  {
    id: 'detail-2',
    title: 'بطارية مناسبة للاستعمال اليومي',
    text: 'أضف تفاصيل إضافية عن المنتج، ويمكنك استخدام صورة أو فيديو مع النص.',
    mediaUrl: '',
    mediaType: 'image',
    reverse: true,
  },
];

const initialSpecs: SpecDraft[] = [
  { id: 'spec-1', label: 'الشحن', value: '24 إلى 48 ساعة داخل طنجة' },
  { id: 'spec-2', label: 'الدفع', value: 'الدفع عند الاستلام' },
  { id: 'spec-3', label: 'الضمان', value: 'استبدال خلال 7 أيام' },
  { id: 'spec-4', label: 'المحتوى', value: 'ساعة، شاحن، كتيب استعمال' },
];

function makeSlug(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || `product-${Date.now().toString().slice(-6)}`;
}

function parsePrice(value: string) {
  const number = Number(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function priceLabel(value: string) {
  const parsed = parsePrice(value);
  return parsed ? `${parsed} درهم` : value.trim() || '0 درهم';
}

function makeVariantSku(name: string, index: number) {
  const suffix = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 18)
    .toUpperCase();

  return `TM-${suffix || 'VAR'}-${index + 1}`;
}

function generateVariantsFromOptions(groups: VariantOptionDraft[], current: ProductVariant[], defaultPrice: string) {
  const rows = groups.flatMap(group => {
    const groupLabel = group.label.trim();
    if (!groupLabel) return [];

    return group.values
      .map(value => ({ groupId: group.id, valueId: value.id, groupLabel, valueLabel: value.label.trim() }))
      .filter(row => row.valueLabel);
  });

  if (!rows.length) return [];

  const usedExistingIds = new Set<string>();

  return rows.map((row, index) => {
    const stableId = `variant-${row.groupId}-${row.valueId}`;
    const optionValues = { [row.groupLabel]: row.valueLabel };
    const findUnused = (matcher: (variant: ProductVariant) => boolean) =>
      current.find(variant => !usedExistingIds.has(variant.id) && matcher(variant));
    const existing = findUnused(variant => variant.id === stableId)
      ?? findUnused(variant => variant.optionValues?.[row.groupLabel] === row.valueLabel && Object.keys(variant.optionValues || {}).length === 1)
      ?? findUnused(variant => !variant.optionValues && variant.name === row.valueLabel)
      ?? findUnused(variant => variant.optionValues?.[row.groupLabel] === row.valueLabel);
    if (existing) usedExistingIds.add(existing.id);

    return {
      id: existing?.id || stableId,
      name: row.valueLabel,
      sku: existing?.sku || makeVariantSku(row.valueLabel, index),
      priceLabel: existing?.priceLabel || priceLabel(defaultPrice),
      stock: existing?.stock ?? 10,
      enabled: existing?.enabled ?? true,
      image: existing?.image,
      optionValues,
    };
  });
}

function inferVariantOptionsFromVariants(variants: ProductVariant[]): VariantOptionDraft[] {
  if (!variants.length) return [];
  const grouped = new Map<string, Set<string>>();
  variants.forEach(variant => {
    if (!variant.optionValues || !Object.keys(variant.optionValues).length) {
      if (!grouped.has('النوع')) grouped.set('النوع', new Set());
      grouped.get('النوع')?.add(variant.name);
      return;
    }
    Object.entries(variant.optionValues).forEach(([label, value]) => {
      if (!grouped.has(label)) grouped.set(label, new Set());
      grouped.get(label)?.add(value);
    });
  });

  return Array.from(grouped.entries()).map(([label, values], groupIndex) => ({
    id: `option-${Date.now()}-${groupIndex}`,
    type: 'custom',
    label,
    values: Array.from(values).map((value, index) => ({
      id: `value-${Date.now()}-${groupIndex}-${index}`,
      label: value,
    })),
  }));
}

type UploadFileSource = FileList | File[] | null;

function normalizeUploadFiles(files: UploadFileSource) {
  return files ? Array.from(files) : [];
}

function isInlineImageDataUrl(value: string) {
  return /^data:image\//i.test(value.trim());
}

function dataUrlToFile(dataUrl: string, index: number) {
  const [header, body] = dataUrl.split(',');
  const mime = header.match(/^data:([^;]+);base64$/i)?.[1] || 'image/jpeg';
  const extension = mime.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'jpg';
  const binary = atob(body || '');
  const bytes = new Uint8Array(binary.length);
  for (let byteIndex = 0; byteIndex < binary.length; byteIndex += 1) {
    bytes[byteIndex] = binary.charCodeAt(byteIndex);
  }

  return new File([bytes], `embedded-image-${index + 1}.${extension}`, { type: mime });
}

async function uploadProductFiles(files: UploadFileSource, folder: string) {
  const fileArray = normalizeUploadFiles(files);
  if (!fileArray.length) return [];

  const { uploadProductImages } = await import('../../../lib/supabaseStorage');
  const uploadedImages = await uploadProductImages(fileArray, folder);
  if (uploadedImages.length !== fileArray.length) {
    throw new Error('Product image upload did not return every uploaded image URL.');
  }

  return uploadedImages;
}

async function replaceInlineImages(product: Product, folder: string) {
  const inlineImages = [
    ...product.gallery,
    ...(product.details || []).map(detail => detail.mediaUrl),
    ...(product.variants || []).map(variant => variant.image || ''),
    ...(product.variantOptions || []).flatMap(option => option.values.map(value => value.image || '')),
  ].filter(isInlineImageDataUrl);

  const uniqueInlineImages = Array.from(new Set(inlineImages));
  if (!uniqueInlineImages.length) return product;

  const uploadedImages = await uploadProductFiles(uniqueInlineImages.map(dataUrlToFile), `${folder}-embedded`);
  const replacements = new Map(uniqueInlineImages.map((image, index) => [image, uploadedImages[index]]));
  const replace = (value: string) => replacements.get(value) || value;

  return {
    ...product,
    image: replace(product.image),
    gallery: product.gallery.map(replace),
    details: product.details?.map(detail => ({
      ...detail,
      mediaUrl: isInlineImageDataUrl(detail.mediaUrl) ? replace(detail.mediaUrl) : detail.mediaUrl,
    })),
    variants: product.variants?.map(variant => ({
      ...variant,
      image: variant.image && isInlineImageDataUrl(variant.image) ? replace(variant.image) : variant.image,
    })),
    variantOptions: product.variantOptions?.map(option => ({
      ...option,
      values: option.values.map(value => ({
        ...value,
        image: value.image && isInlineImageDataUrl(value.image) ? replace(value.image) : value.image,
      })),
    })),
  };
}

export const TanjaMolAddProductPage = ({
  product,
  products,
  onBack,
  onOpenDashboard,
  onOpenProduct,
  onCreateProduct,
}: AddProductProps) => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const detailHistoryRef = useRef<DetailDraft[][]>([]);
  const detailFutureRef = useRef<DetailDraft[][]>([]);
  const originalSlug = product?.slug;
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(categories[0]?.title || '');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('');
  const [delivery, setDelivery] = useState('');
  const [badge, setBadge] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [variantOptions, setVariantOptions] = useState<VariantOptionDraft[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [details, setDetails] = useState<DetailDraft[]>([]);
  const [activeDetail, setActiveDetail] = useState(0);
  const [specs, setSpecs] = useState<SpecDraft[]>([]);
  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [manualReviewsEnabled, setManualReviewsEnabled] = useState(true);
  const [showRelated, setShowRelated] = useState(true);
  const [showPolicies, setShowPolicies] = useState(true);
  const [rating, setRating] = useState('');
  const [reviewCount, setReviewCount] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!product) {
      setTitle('');
      setSlug('');
      setCategory(categories[0]?.title || '');
      setShortDescription('');
      setPrice('');
      setOldPrice('');
      setStock('');
      setDelivery('');
      setBadge('');
      setGallery([]);
      setVariantsEnabled(false);
      setVariantOptions([]);
      setVariants([]);
      setDetails([]);
      setActiveDetail(0);
      detailHistoryRef.current = [];
      detailFutureRef.current = [];
      setSpecs([]);
      setReviewsEnabled(true);
      setManualReviewsEnabled(true);
      setShowRelated(true);
      setShowPolicies(true);
      setRating('');
      setReviewCount('');
      setUploadError('');
      setUploadingImages(false);
      setPublishing(false);
      return;
    }

    setTitle(product.title);
    setSlug(product.slug);
    setCategory(product.category);
    setShortDescription(product.description);
    setPrice(product.priceLabel);
    setOldPrice(product.oldPrice);
    setStock(String(product.stock ?? 0));
    setDelivery(product.delivery || '');
    setBadge(product.badge);
    setGallery(product.gallery?.length ? product.gallery : [product.image || fallbackImage]);
    const enabledVariants = product.variants?.filter(variant => variant.enabled) ?? [];
    setVariantsEnabled(product.variantsEnabled ?? Boolean(product.variantOptions?.length && enabledVariants.length));
    const nextVariantOptions = product.variantOptions?.length ? product.variantOptions : inferVariantOptionsFromVariants(product.variants || []);
    setVariantOptions(nextVariantOptions);
    setVariants(product.variants?.length ? generateVariantsFromOptions(nextVariantOptions, product.variants, product.priceLabel) : []);
    setDetails(product.details?.length ? product.details : initialDetails);
    detailHistoryRef.current = [];
    detailFutureRef.current = [];
    setSpecs(product.specs?.length ? product.specs.map(([label, value], index) => ({ id: `spec-${index + 1}`, label, value })) : initialSpecs);
    setReviewsEnabled(product.reviewsEnabled ?? true);
    setManualReviewsEnabled(product.manualReviewsEnabled ?? true);
    setShowRelated(product.showRelated ?? true);
    setShowPolicies(product.showPolicies ?? true);
    setRating(product.rating ? String(product.rating) : '4.8');
    setReviewCount(product.reviewCount ? String(product.reviewCount) : '127');
    setUploadError('');
    setUploadingImages(false);
    setPublishing(false);
  }, [product]);

  const cleanGallery = gallery.map(item => item.trim()).filter(Boolean);
  const readinessItems = [
    title.trim().length > 2 && slug.trim().length > 2,
    category.trim().length > 0,
    parsePrice(price) > 0,
    cleanGallery.length > 0,
    !variantsEnabled || variants.some(variant => variant.enabled),
    details.some(detail => detail.text.trim()),
    specs.some(spec => spec.label.trim() && spec.value.trim()),
  ];
  const readiness = Math.round((readinessItems.filter(Boolean).length / readinessItems.length) * 100);
  const basicSummary = title.trim() ? `${title.trim()} · ${category}` : 'اسم المنتج والقسم والرابط';
  const coreSummary = title.trim() ? `${title.trim()} · ${category} · ${priceLabel(price)}` : basicSummary;
  const gallerySummary = cleanGallery.length ? `${cleanGallery.length} صورة مضافة` : 'أضف صورة واحدة على الأقل';
  const variantsSummary = variantsEnabled ? `${variantOptions.length} نوع · ${variants.length} قيمة` : 'المتغيرات غير مفعلة';
  const detailsSummary = details.length ? `${details.length} بلوك مصور` : 'أضف بلوكات الشرح المصور';
  const specsSummary = `${specs.filter(spec => spec.label.trim() && spec.value.trim()).length} مواصفة`;
  const reviewsSummary = reviewsEnabled ? `مفعلة · ${rating} من ${reviewCount} تقييم` : 'التقييمات مخفية';
  const visibilitySummary = [
    reviewsEnabled ? 'تقييمات' : '',
    showRelated ? 'منتجات مقترحة' : '',
    showPolicies ? 'سياسات' : '',
  ].filter(Boolean).join(' · ') || 'كل عناصر الظهور مخفية';

  const previewProduct = useMemo<Product>(() => ({
    id: slug || makeSlug(title),
    slug: slug || makeSlug(title),
    title,
    category,
    price: parsePrice(price),
    priceLabel: priceLabel(price),
    oldPrice: oldPrice.trim(),
    badge,
    image: cleanGallery[0] || fallbackImage,
    gallery: cleanGallery.length ? cleanGallery : [fallbackImage],
    description: shortDescription,
    stock: Number(stock) || 0,
    delivery,
    reviewsEnabled,
    manualReviewsEnabled,
    rating: Number(rating) || 4.8,
    reviewCount: Number(reviewCount) || 0,
    showRelated,
    showPolicies,
    details: details.map((detail, index) => ({ ...detail, reverse: detail.reverse ?? index % 2 === 1 })),
    specs: specs.filter(spec => spec.label.trim() && spec.value.trim()).map(spec => [spec.label, spec.value] as [string, string]),
    variantsEnabled,
    variantOptions: variantsEnabled ? variantOptions.filter(group => group.label.trim() && group.values.some(value => value.label.trim())) : [],
    variants: variantsEnabled ? variants : [],
  }), [badge, category, cleanGallery, delivery, details, manualReviewsEnabled, oldPrice, price, rating, reviewCount, reviewsEnabled, shortDescription, showPolicies, showRelated, slug, specs, stock, title, variantOptions, variants, variantsEnabled]);

  const addVariant = () => {
    const index = variants.length + 1;
    setVariants(current => [...current, {
      id: `variant-${Date.now()}`,
      name: `خيار ${index}`,
      sku: `TM-NEW-${index}`,
      priceLabel: priceLabel(price),
      stock: 10,
      enabled: true,
    }]);
  };

  const syncVariantOptions = (updater: (current: VariantOptionDraft[]) => VariantOptionDraft[]) => {
    setVariantOptions(current => {
      const next = updater(current);
      setVariants(currentVariants => generateVariantsFromOptions(next, currentVariants, price));
      return next;
    });
  };

  const addVariantOptionType = (type: string) => {
    const selected = commonVariantTypes.find(item => item.type === type);
    const label = selected?.label || 'نوع مخصص';
    syncVariantOptions(current => [...current, { id: `option-${Date.now()}`, type, label, values: [] }]);
  };

  const updateVariantOption = (id: string, next: Partial<VariantOptionDraft>) => {
    syncVariantOptions(current => current.map(group => group.id === id ? { ...group, ...next } : group));
  };

  const removeVariantOption = (id: string) => {
    syncVariantOptions(current => current.filter(group => group.id !== id));
  };

  const addVariantOptionValue = (groupId: string) => {
    syncVariantOptions(current => current.map(group => group.id === groupId ? { ...group, values: [...group.values, { id: `value-${Date.now()}`, label: '' }] } : group));
  };

  const updateVariantOptionValue = (groupId: string, valueId: string, next: Partial<VariantOptionDraft['values'][number]>) => {
    syncVariantOptions(current => current.map(group => group.id === groupId ? { ...group, values: group.values.map(value => value.id === valueId ? { ...value, ...next } : value) } : group));
  };

  const updateColorVariantValue = (groupId: string, valueId: string, label: string) => {
    const pickedColor = commonColors.find(color => color.label === label);
    updateVariantOptionValue(groupId, valueId, { label, color: pickedColor?.color });
  };

  const isCommonColorValue = (label: string) => commonColors.some(color => color.label === label);

  const removeVariantOptionValue = (groupId: string, valueId: string) => {
    syncVariantOptions(current => current.map(group => group.id === groupId ? { ...group, values: group.values.filter(value => value.id !== valueId) } : group));
  };

  const updateVariant = (id: string, next: Partial<ProductVariant>) => {
    setVariants(current => current.map(variant => variant.id === id ? { ...variant, ...next } : variant));
  };

  const removeVariant = (id: string) => {
    setVariants(current => current.length > 1 ? current.filter(variant => variant.id !== id) : current);
  };

  const setDetailsWithHistory = (updater: (current: DetailDraft[]) => DetailDraft[]) => {
    setDetails(current => {
      const next = updater(current);
      if (next === current) return current;
      detailHistoryRef.current = [...detailHistoryRef.current.slice(-39), current];
      detailFutureRef.current = [];
      return next;
    });
  };

  const undoDetailChange = () => {
    setDetails(current => {
      const previous = detailHistoryRef.current.pop();
      if (!previous) return current;
      detailFutureRef.current = [...detailFutureRef.current.slice(-39), current];
      setActiveDetail(index => Math.min(index, Math.max(0, previous.length - 1)));
      return previous;
    });
  };

  const redoDetailChange = () => {
    setDetails(current => {
      const next = detailFutureRef.current.pop();
      if (!next) return current;
      detailHistoryRef.current = [...detailHistoryRef.current.slice(-39), current];
      setActiveDetail(index => Math.min(index, Math.max(0, next.length - 1)));
      return next;
    });
  };

  const addDetailBlock = () => {
    const index = details.length + 1;
    setDetailsWithHistory(current => [...current, {
      id: `detail-${Date.now()}`,
      title: `بلوك ${index}`,
      text: '',
      mediaUrl: '',
      mediaType: 'image',
      reverse: index % 2 === 0,
    }]);
    setActiveDetail(details.length);
  };

  const updateDetail = (id: string, next: Partial<DetailDraft>) => {
    setDetailsWithHistory(current => current.map(detail => detail.id === id ? { ...detail, ...next } : detail));
  };

  const updateDetailRichText = (id: string, richTextHtml: string, text: string) => {
    setDetails(current => current.map(detail => detail.id === id ? { ...detail, richTextHtml, text } : detail));
  };

  const duplicateDetail = (detail: DetailDraft) => {
    setDetailsWithHistory(current => [...current, { ...detail, id: `detail-${Date.now()}` }]);
    setActiveDetail(details.length);
  };

  const deleteDetail = (id: string) => {
    setDetailsWithHistory(current => current.length > 1 ? current.filter(item => item.id !== id) : current);
    setActiveDetail(index => Math.max(0, Math.min(index, details.length - 2)));
  };

  const moveDetail = (id: string, direction: -1 | 1) => {
    setDetailsWithHistory(current => {
      const index = current.findIndex(detail => detail.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      setActiveDetail(nextIndex);
      return next;
    });
  };

  const addSpec = () => {
    setSpecs(current => [...current, { id: `spec-${Date.now()}`, label: '', value: '' }]);
  };

  const updateSpec = (id: string, next: Partial<SpecDraft>) => {
    setSpecs(current => current.map(spec => spec.id === id ? { ...spec, ...next } : spec));
  };

  const removeSpec = (id: string) => {
    setSpecs(current => current.length > 1 ? current.filter(spec => spec.id !== id) : current);
  };

  const handleImageUpload = async (files: FileList | null) => {
    const fileArray = normalizeUploadFiles(files);
    if (!fileArray.length) return;

    setUploadError('');
    setUploadingImages(true);
    try {
      const nextImages = await uploadProductFiles(fileArray, slug || makeSlug(title || 'product'));
      setGallery(current => [...current.filter(Boolean), ...nextImages]);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to upload images to Supabase Storage', error);
      setUploadError('تعذر رفع الصور. تأكد من إعداد Supabase Storage ثم حاول مرة أخرى.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleBlockImageUpload = async (detailId: string, files: UploadFileSource) => {
    const fileArray = normalizeUploadFiles(files);
    if (!fileArray.length) return;

    setUploadError('');
    setUploadingImages(true);
    try {
      const nextImages = await uploadProductFiles(fileArray, slug || makeSlug(title || 'product'));
      const selectedImage = nextImages[0];
      if (!selectedImage) return;

      setGallery(current => [...current.filter(Boolean), ...nextImages]);
      updateDetail(detailId, { mediaUrl: selectedImage, mediaType: 'image' });
    } catch (error) {
      console.error('Failed to upload detail image to Supabase Storage', error);
      setUploadError('تعذر رفع صورة التفاصيل. تأكد من إعداد Supabase Storage ثم حاول مرة أخرى.');
    } finally {
      setUploadingImages(false);
    }
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || parsePrice(price) <= 0) {
      event.currentTarget.reportValidity();
      return;
    }

    setUploadError('');
    setPublishing(true);
    try {
      const productToPublish = await replaceInlineImages(previewProduct, slug || makeSlug(title || 'product'));
      setGallery(productToPublish.gallery);
      setDetails(productToPublish.details || []);
      setVariants(productToPublish.variants || []);
      setVariantOptions(productToPublish.variantOptions || []);
      onCreateProduct(productToPublish, originalSlug);
      setPublishedProduct(productToPublish);
    } catch (error) {
      console.error('Failed to prepare product images for publish', error);
      setUploadError('تعذر تجهيز صور المنتج للنشر. أعد رفع الصور أو تحقق من Supabase Storage.');
    } finally {
      setPublishing(false);
    }
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const submitTrigger = target.closest('button[type="submit"]');
    if (submitTrigger || tagName === 'textarea' || target.isContentEditable) return;
    if (tagName === 'input' || tagName === 'select') {
      event.preventDefault();
      target.blur();
    }
  };

  return (
    <form dir="rtl" onSubmit={submitProduct} onKeyDown={handleFormKeyDown} className="min-h-screen w-full bg-[#f4f2eb] text-[#17201b]">
      <div className="grid min-h-screen lg:grid-cols-[76px_minmax(0,1fr)]">
        <AdminRail onOpenDashboard={onOpenDashboard} />

        <main className="min-w-0 lg:col-start-2 lg:row-start-1">
          <header className="sticky top-0 z-30 border-b border-[#d9dfd8] bg-[#f8f7f1]/96">
            <div className="mx-auto flex min-h-[66px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <h1 className="truncate font-heading text-[22px] font-black leading-none sm:text-[26px]">{product ? 'تعديل منتج' : 'إضافة منتج جديد'}</h1>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={onBack} className="tm-admin-press min-h-[38px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">
                  رجوع
                </button>
                <button type="button" onClick={() => setDraftSaved(true)} className="tm-admin-press min-h-[38px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">
                  حفظ مسودة
                </button>
                <button type="submit" disabled={publishing || uploadingImages} className="tm-admin-press min-h-[38px] rounded-md bg-[#ff9900] px-3 text-xs font-black text-[#131921] shadow-[0_14px_30px_-22px_rgba(255,153,0,0.9)] disabled:cursor-not-allowed disabled:opacity-60">
                  نشر المنتج
                </button>
              </div>
            </div>

            <div className="border-t border-[#e3e6df] bg-white/62">
              <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
                <span className="tm-admin-num text-xs font-black text-[#b45309]">{readiness}%</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#dfe6df]">
                  <div className="h-full rounded-full bg-[#ff9900]" style={{ width: `${readiness}%` }} />
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1600px] gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <AdminSection title="البيانات الأساسية والسعر" badge="مطلوب" summary={coreSummary} status={title.trim() && slug.trim() && parsePrice(price) > 0 ? 'done' : 'missing'}>
              <div className="grid gap-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <TextField label="اسم المنتج" value={title} onChange={value => {
                    setTitle(value);
                    if (!slug) setSlug(makeSlug(value));
                  }} required />
                  <TextField label="الرابط المختصر" value={slug} onChange={value => setSlug(makeSlug(value))} required />
                  <label className="grid gap-1">
                    <span className="text-xs font-black text-[#65716a]">القسم</span>
                    <select value={category} onChange={event => setCategory(event.target.value)} className="min-h-[42px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-bold outline-none focus:border-[#b45309]">
                      {categories.map(item => <option key={item.id} value={item.title}>{item.title}</option>)}
                    </select>
                  </label>
                  <TextField label="شارة المنتج" value={badge} onChange={setBadge} />
                  <label className="grid gap-1 lg:col-span-2">
                    <span className="text-xs font-black text-[#65716a]">وصف قصير بجانب السعر</span>
                    <textarea value={shortDescription} onChange={event => setShortDescription(event.target.value)} className="min-h-[88px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 py-3 text-[14px] font-semibold leading-7 outline-none focus:border-[#b45309]" />
                  </label>
                </div>

                <div className="grid gap-4 border-t border-[#e3e6df] pt-4 sm:grid-cols-2 xl:grid-cols-4">
                  <TextField label="السعر الحالي" value={price} onChange={setPrice} numeric />
                  <TextField label="السعر قبل التخفيض" value={oldPrice} onChange={setOldPrice} numeric />
                  <TextField label="المخزون" value={stock} onChange={setStock} numeric />
                  <TextField label="مدة التوصيل" value={delivery} onChange={setDelivery} numeric />
                </div>
              </div>
            </AdminSection>

            <AdminSection title="معرض المنتج" summary={gallerySummary} status={cleanGallery.length ? 'done' : 'missing'} defaultOpen={false} action={
              <>
                <input id={uploadInputId} ref={uploadInputRef} type="file" accept="image/*" multiple disabled={uploadingImages || publishing} className="sr-only" onChange={event => void handleImageUpload(event.target.files)} />
                <label htmlFor={uploadInputId} aria-disabled={uploadingImages || publishing} className={`tm-admin-press inline-grid min-h-[36px] place-items-center rounded-md bg-[#131921] px-3 text-xs font-black text-white ${uploadingImages || publishing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                  رفع صور
                </label>
              </>
            }>
              {uploadError ? (
                <div className="rounded-md bg-[#fff1d5] px-3 py-2 text-sm font-black text-[#9a5a00]" role="alert">
                  {uploadError}
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {gallery.map((image, index) => (
                  <div key={`${image}-${index}`} className="rounded-md border border-dashed border-[#bfcac1] bg-[#fbfaf6] p-3 text-right">
                    <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-[#eef3ef] text-sm font-black text-[#65716a]">
                      <img src={image} alt={`صورة المنتج ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-black">{index === 0 ? 'الصورة الرئيسية' : `صورة ${index + 1}`}</p>
                      <button type="button" onClick={() => setGallery(current => current.length > 1 ? current.filter((_, imageIndex) => imageIndex !== index) : current)} className="tm-admin-press min-h-[30px] rounded-md bg-[#fff1d5] px-2 text-xs font-black text-[#9a5a00]">
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
                <label htmlFor={uploadInputId} aria-disabled={uploadingImages || publishing} className={`tm-admin-press grid min-h-[180px] place-items-center rounded-md border border-dashed border-[#bfcac1] bg-[#fbfaf6] p-3 text-sm font-black text-[#65716a] ${uploadingImages || publishing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                  إضافة صور
                </label>
              </div>
            </AdminSection>

            <AdminSection title="المتغيرات" summary={variantsSummary} status={variantsEnabled && variants.some(variant => variant.enabled) ? 'done' : 'neutral'} defaultOpen={false} action={
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-extrabold">
                  <input type="checkbox" checked={variantsEnabled} onChange={event => setVariantsEnabled(event.target.checked)} className="h-4 w-4 accent-[#ff9900]" />
                  تفعيل المتغيرات
                </label>
                <select
                  value=""
                  onChange={event => {
                    if (!event.target.value) return;
                    addVariantOptionType(event.target.value);
                    event.currentTarget.value = '';
                  }}
                  className="min-h-[36px] rounded-md bg-[#ff9900] px-3 text-xs font-black text-[#131921] outline-none"
                  aria-label="إضافة نوع متغير"
                >
                  <option value="">إضافة نوع</option>
                  {commonVariantTypes.map(type => <option key={type.type} value={type.type}>{type.label}</option>)}
                  <option value="custom">نوع مخصص</option>
                </select>
              </div>
            }>
              <div className="grid gap-4">
                {variantOptions.map(group => {
                  const typeConfig = commonVariantTypes.find(item => item.type === group.type);
                  const supportsColor = Boolean(typeConfig && 'supportsColor' in typeConfig && typeConfig.supportsColor);
                  const groupLabel = group.label.trim();
                  const groupVariants = variants.filter(variant => {
                    if (!groupLabel) return true;
                    const optionValue = variant.optionValues?.[groupLabel];
                    return Boolean(optionValue) || group.values.some(value => value.label.trim() && variant.name.includes(value.label.trim()));
                  });
                  const variantRows: Array<{
                    id: string;
                    variant?: ProductVariant;
                    value?: VariantOptionDraft['values'][number];
                    valueLabel: string;
                  }> = groupVariants.map(variant => {
                    const valueLabel = groupLabel ? variant.optionValues?.[groupLabel] : '';
                    const matchedValue = group.values.find(value => value.label === valueLabel) || group.values.find(value => value.label.trim() && variant.name.includes(value.label.trim()));
                    return { id: matchedValue?.id || variant.id, variant, value: matchedValue, valueLabel: valueLabel || matchedValue?.label || variant.name };
                  });
                  const valueOnlyRows: Array<{
                    id: string;
                    variant?: ProductVariant;
                    value?: VariantOptionDraft['values'][number];
                    valueLabel: string;
                  }> = group.values
                    .filter(value => !variantRows.some(row => row.value?.id === value.id))
                    .map(value => ({ id: value.id, value, valueLabel: value.label }));
                  const rows = [...variantRows, ...valueOnlyRows];
                  const rowSpan = Math.max(rows.length, 1);

                  return (
                    <article key={group.id} className="overflow-hidden rounded-md border border-[#dfe5df] bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1180px] table-fixed text-sm">
                          <thead className="bg-[#f4f7f4] text-xs font-black text-[#65716a]">
                            <tr>
                              <th className="whitespace-nowrap px-3 py-3 text-right">نوع المتغير</th>
                              <th className="whitespace-nowrap px-3 py-3 text-right">القيمة</th>
                              {supportsColor ? <th className="px-4 py-3 text-right">اللون</th> : null}
                              <th className="whitespace-nowrap px-3 py-3 text-right">SKU</th>
                              <th className="whitespace-nowrap px-3 py-3 text-right">السعر</th>
                              <th className="whitespace-nowrap px-3 py-3 text-right">المخزون</th>
                              <th className="whitespace-nowrap px-3 py-3 text-right">الصورة</th>
                              <th className="whitespace-nowrap px-3 py-3 text-right">الحالة</th>
                              <th className="whitespace-nowrap px-3 py-3 text-right">إجراء</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.length ? rows.map((row, rowIndex) => {
                              const valueIndex = row.value ? group.values.findIndex(value => value.id === row.value?.id) : rowIndex;
                              return (
                                <tr key={row.id} className="border-t border-[#e4e9e4] bg-white">
                                  {rowIndex === 0 ? (
                                    <td rowSpan={rowSpan} className="w-[150px] align-top px-3 py-3">
                                      <div className="grid gap-2">
                                        <input
                                          value={group.label}
                                          onChange={event => updateVariantOption(group.id, { label: event.target.value })}
                                          className="w-[130px] rounded-md bg-[#fbfaf6] px-3 py-2 text-sm font-black text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309]"
                                        />
                                        <button type="button" onClick={() => addVariantOptionValue(group.id)} className="tm-admin-press min-h-[32px] rounded-md bg-[#131921] px-3 text-xs font-black text-white">إضافة قيمة</button>
                                        <button type="button" onClick={() => removeVariantOption(group.id)} className="tm-admin-press min-h-[32px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">حذف النوع</button>
                                      </div>
                                    </td>
                                  ) : null}
                                  <td className="w-[170px] px-3 py-3">
                                    {supportsColor && row.value ? (
                                      <div className="grid gap-2">
                                        <select
                                          value={isCommonColorValue(row.value.label) ? row.value.label : 'other'}
                                          onChange={event => {
                                            if (event.target.value === 'other') {
                                              updateVariantOptionValue(group.id, row.value!.id, { label: '', color: row.value!.color || '#17201b' });
                                              return;
                                            }
                                            updateColorVariantValue(group.id, row.value!.id, event.target.value);
                                          }}
                                          className="w-full rounded-md bg-[#fbfaf6] px-3 py-2 text-sm font-black text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309]"
                                        >
                                          <option value="">اختر لونا</option>
                                          {commonColors.map(color => <option key={color.label} value={color.label}>{color.label}</option>)}
                                          <option value="other">أخرى</option>
                                        </select>
                                        {!isCommonColorValue(row.value.label) ? (
                                          <input
                                            value={row.value.label}
                                            onChange={event => updateVariantOptionValue(group.id, row.value!.id, { label: event.target.value })}
                                            placeholder="اكتب اللون"
                                            className="w-full rounded-md bg-white px-3 py-2 text-sm font-black text-[#17201b] outline-none ring-1 ring-[#dfe5df] focus:ring-[#b45309]"
                                          />
                                        ) : null}
                                      </div>
                                    ) : (
                                      <input
                                        value={row.value?.label ?? row.valueLabel}
                                        onChange={event => {
                                          if (row.value) {
                                            updateVariantOptionValue(group.id, row.value.id, { label: event.target.value });
                                            return;
                                          }
                                          if (row.variant) updateVariant(row.variant.id, { name: event.target.value });
                                        }}
                                        placeholder={typeConfig?.examples[valueIndex] || 'قيمة'}
                                        className="w-full rounded-md bg-[#fbfaf6] px-3 py-2 text-sm font-black text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309]"
                                      />
                                    )}
                                  </td>
                                  {supportsColor ? (
                                    <td className="w-[82px] px-3 py-3">
                                      <div className="flex items-center">
                                        <input
                                          type="color"
                                          value={row.value?.color || '#17201b'}
                                          onChange={event => row.value ? updateVariantOptionValue(group.id, row.value.id, { color: event.target.value }) : undefined}
                                          disabled={!row.value}
                                          className="h-10 w-11 rounded-md border border-[#cfd8d1] bg-white p-1"
                                          aria-label={`لون ${valueIndex + 1}`}
                                        />
                                      </div>
                                    </td>
                                  ) : null}
                                  <td className="w-[130px] px-3 py-3">
                                    <input value={row.variant?.sku || ''} disabled={!row.variant} onChange={event => row.variant ? updateVariant(row.variant.id, { sku: event.target.value }) : undefined} className="tm-admin-num w-full rounded-md bg-[#fbfaf6] px-3 py-2 text-sm font-black text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309] disabled:text-[#9aa39c]" />
                                  </td>
                                  <td className="w-[112px] px-3 py-3">
                                    <input value={row.variant?.priceLabel || ''} disabled={!row.variant} onChange={event => row.variant ? updateVariant(row.variant.id, { priceLabel: event.target.value }) : undefined} className="tm-admin-num w-full rounded-md bg-[#fbfaf6] px-3 py-2 text-sm font-black text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309] disabled:text-[#9aa39c]" />
                                  </td>
                                  <td className="w-[86px] px-3 py-3">
                                    <input value={row.variant ? String(row.variant.stock) : ''} disabled={!row.variant} onChange={event => row.variant ? updateVariant(row.variant.id, { stock: Number(event.target.value) || 0 }) : undefined} className="tm-admin-num w-full rounded-md bg-[#fbfaf6] px-3 py-2 text-sm font-black text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309] disabled:text-[#9aa39c]" />
                                  </td>
                                  <td className="w-[150px] px-3 py-3">
                                    <input value={row.variant?.image || ''} disabled={!row.variant} onChange={event => row.variant ? updateVariant(row.variant.id, { image: event.target.value }) : undefined} placeholder="رابط الصورة" className="w-full rounded-md bg-[#fbfaf6] px-3 py-2 text-sm font-bold text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309] disabled:text-[#9aa39c]" />
                                  </td>
                                  <td className="w-[96px] px-3 py-3">
                                    <label className={`flex min-h-[38px] w-[82px] items-center justify-center gap-2 rounded-md px-2.5 text-xs font-black ${row.variant?.enabled ? 'bg-[#fff3df] text-[#b45309]' : 'bg-[#eef3ef] text-[#65716a]'}`}>
                                      <input type="checkbox" checked={row.variant?.enabled ?? false} disabled={!row.variant} onChange={event => row.variant ? updateVariant(row.variant.id, { enabled: event.target.checked }) : undefined} className="h-4 w-4 accent-[#ff9900]" />
                                      مفعل
                                    </label>
                                  </td>
                                  <td className="w-[76px] px-3 py-3">
                                    <button type="button" onClick={() => row.value ? removeVariantOptionValue(group.id, row.value.id) : row.variant ? removeVariant(row.variant.id) : undefined} className="tm-admin-press min-h-[34px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">
                                      حذف
                                    </button>
                                  </td>
                                </tr>
                              );
                            }) : (
                              <tr>
                                <td className="w-[150px] align-top px-3 py-3">
                                  <div className="grid gap-2">
                                    <input
                                      value={group.label}
                                      onChange={event => updateVariantOption(group.id, { label: event.target.value })}
                                      className="w-[130px] rounded-md bg-[#fbfaf6] px-3 py-2 text-sm font-black text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309]"
                                    />
                                    <button type="button" onClick={() => addVariantOptionValue(group.id)} className="tm-admin-press min-h-[32px] rounded-md bg-[#131921] px-3 text-xs font-black text-white">إضافة قيمة</button>
                                    <button type="button" onClick={() => removeVariantOption(group.id)} className="tm-admin-press min-h-[32px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">حذف النوع</button>
                                  </div>
                                </td>
                                <td colSpan={supportsColor ? 8 : 7} className="px-3 py-3">
                                  <button type="button" onClick={() => addVariantOptionValue(group.id)} className="tm-admin-press min-h-[42px] w-full rounded-md border border-dashed border-[#bfcac1] bg-[#fbfaf6] px-3 text-sm font-black text-[#65716a]">
                                    أضف أول قيمة
                                  </button>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  );
                })}
              </div>
            </AdminSection>

            <AdminSection title="تفاصيل المنتج المصورة" summary={detailsSummary} status={details.some(detail => detail.text.trim()) ? 'done' : 'missing'} defaultOpen={false} action={<button type="button" onClick={addDetailBlock} className="tm-admin-press min-h-[36px] rounded-md bg-[#ff9900] px-3 text-xs font-black text-[#131921]">إضافة بلوك</button>}>
              <div className="rounded-md border border-[#dfe5df] bg-[#fbfaf6] p-3">
                <div className="grid gap-4">
                  {details.map((detail, index) => (
                    <article key={detail.id} className="rounded-md border border-[#dfe5df] bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <p className="font-heading text-base font-black">بلوك {index + 1}</p>
                          <span className="rounded-md bg-[#fff3df] px-2 py-1 text-xs font-black text-[#b45309]">{detail.reverse ? 'نص يسار، صورة يمين' : 'صورة يسار، نص يمين'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => updateDetail(detail.id, { reverse: !detail.reverse })} className="tm-admin-press min-h-[32px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">تبديل</button>
                          <button type="button" onClick={() => moveDetail(detail.id, -1)} className="tm-admin-press min-h-[32px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">فوق</button>
                          <button type="button" onClick={() => moveDetail(detail.id, 1)} className="tm-admin-press min-h-[32px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">تحت</button>
                          <button type="button" onClick={() => duplicateDetail(detail)} className="tm-admin-press min-h-[32px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">نسخ</button>
                          <button type="button" onClick={() => deleteDetail(detail.id)} className="tm-admin-press min-h-[32px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">حذف</button>
                        </div>
                      </div>

                      <div className={`mt-3 grid items-start gap-3 lg:[direction:ltr] ${detail.reverse ? 'lg:grid-cols-[minmax(0,1fr)_280px]' : 'lg:grid-cols-[280px_minmax(0,1fr)]'}`}>
                        <div className={`grid self-start gap-2 ${detail.reverse ? 'lg:col-start-2' : 'lg:col-start-1'} lg:row-start-1`}>
                          <div className="grid h-[260px] place-items-center overflow-hidden rounded-md bg-[#eef3ef] text-sm font-black text-[#65716a]">
                            {detail.mediaUrl ? <img src={detail.mediaUrl} alt={detail.title} className="h-full w-full object-contain" /> : 'وسائط البلوك'}
                          </div>
                          <BlockMediaPicker
                            detailId={detail.id}
                            value={detail.mediaUrl}
                            gallery={gallery}
                            onFocus={() => setActiveDetail(index)}
                            onSelect={mediaUrl => updateDetail(detail.id, { mediaUrl, mediaType: 'image' })}
                            onUrlChange={mediaUrl => updateDetail(detail.id, { mediaUrl })}
                            onUpload={files => void handleBlockImageUpload(detail.id, files)}
                            uploadDisabled={uploadingImages || publishing}
                          />
                        </div>
                        <div className={`grid self-start gap-3 ${detail.reverse ? 'lg:col-start-1' : 'lg:col-start-2'} lg:row-start-1 lg:[direction:rtl]`}>
                          <DetailColorTemplatePicker
                            detail={detail}
                            onChange={next => updateDetail(detail.id, next)}
                          />
                          <Suspense fallback={<div className="grid min-h-[280px] place-items-center rounded-md border border-[#dfe5df] bg-[#fbfaf6] text-sm font-black text-[#65716a]">جار تحميل محرر النص...</div>}>
                            <JoditBlockEditor
                              detail={detail}
                              folder={slug || makeSlug(title || 'product')}
                              onChange={(html, text) => updateDetailRichText(detail.id, html, text)}
                            />
                          </Suspense>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </AdminSection>

            <AdminSection title="المواصفات" summary={specsSummary} status={specs.some(spec => spec.label.trim() && spec.value.trim()) ? 'done' : 'missing'} defaultOpen={false} action={<button type="button" onClick={addSpec} className="tm-admin-press min-h-[36px] rounded-md bg-[#ff9900] px-3 text-xs font-black text-[#131921]">إضافة مواصفة</button>}>
              <div className="grid gap-3">
                {specs.map(spec => (
                  <div key={spec.id} className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_80px]">
                    <input value={spec.label} onChange={event => updateSpec(spec.id, { label: event.target.value })} className="min-h-[40px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-bold outline-none focus:border-[#b45309]" placeholder="العنوان" />
                    <input value={spec.value} onChange={event => updateSpec(spec.id, { value: event.target.value })} className="min-h-[40px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-semibold outline-none focus:border-[#b45309]" placeholder="القيمة" />
                    <button type="button" onClick={() => removeSpec(spec.id)} className="tm-admin-press min-h-[40px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">حذف</button>
                  </div>
                ))}
              </div>
            </AdminSection>

            <AdminSection title="التقييمات" summary={reviewsSummary} status={reviewsEnabled ? 'done' : 'neutral'} defaultOpen={false}>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="متوسط التقييم" value={rating} onChange={setRating} numeric />
                <TextField label="عدد التقييمات" value={reviewCount} onChange={setReviewCount} numeric />
              </div>
            </AdminSection>

            <AdminSection title="إعدادات الظهور" summary={visibilitySummary} status="neutral" defaultOpen={false}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {([
                  ['إظهار التقييمات', reviewsEnabled, setReviewsEnabled],
                  ['السماح بتقييمات يدوية', manualReviewsEnabled, setManualReviewsEnabled],
                  ['إظهار المنتجات المقترحة', showRelated, setShowRelated],
                  ['إظهار سياسات المتجر', showPolicies, setShowPolicies],
                ] as Array<[string, boolean, (value: boolean) => void]>).map(([label, checked, setter]) => (
                  <label key={label} className="flex min-h-[44px] items-center gap-3 rounded-md border border-[#dfe5df] bg-[#fbfaf6] px-3 text-sm font-extrabold">
                    <input type="checkbox" checked={checked} onChange={event => setter(event.target.checked)} className="h-4 w-4 accent-[#ff9900]" />
                    {label}
                  </label>
                ))}
              </div>
            </AdminSection>

            <AdminSection title="معاينة مصغرة" status="neutral" defaultOpen={false}>
              <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-[#eef3ef] text-sm font-black text-[#65716a]">
                  <img src={previewProduct.image} alt={previewProduct.title} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-[#fff3df] px-2.5 py-1 text-xs font-black text-[#b45309]">{badge}</span>
                    <span className="rounded-md bg-[#fff1d5] px-2.5 py-1 text-xs font-black text-[#9a5a00]">COD</span>
                  </div>
                  <h3 className="mt-3 font-heading text-xl font-black">{title}</h3>
                  <p className="mt-2 max-w-[62ch] text-sm font-semibold leading-7 text-[#65716a]">{shortDescription}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <p className="tm-admin-num font-heading text-2xl font-black text-[#b45309]">{priceLabel(price)}</p>
                    <button type="submit" disabled={publishing || uploadingImages} className="tm-admin-press min-h-[40px] rounded-md bg-[#ff9900] px-4 text-sm font-black text-[#131921] disabled:cursor-not-allowed disabled:opacity-60">اطلب الآن</button>
                  </div>
                  <p className="mt-3 text-xs font-bold leading-5 text-[#65716a]">المنتجات الحالية في المتجر: {products.length}</p>
                </div>
              </div>
            </AdminSection>

            {draftSaved ? <div className="fixed bottom-4 left-4 z-[70] rounded-md bg-[#131921] px-4 py-3 text-sm font-black text-white shadow-[0_18px_48px_-22px_rgba(23,32,27,0.65)]" role="status">تم حفظ المسودة</div> : null}
          </div>
        </main>
      </div>

      {publishedProduct ? (
        <PublishModal
          product={publishedProduct}
          onDashboard={() => {
            setPublishedProduct(null);
            onOpenDashboard();
          }}
          onView={() => {
            setPublishedProduct(null);
            onOpenProduct(publishedProduct.slug);
          }}
        />
      ) : null}
    </form>
  );
};

function DetailColorTemplatePicker({
  detail,
  onChange,
}: {
  detail: DetailDraft;
  onChange: (next: Partial<DetailDraft>) => void;
}) {
  const backgroundColor = detail.backgroundColor || '#f8fafc';
  const textColor = detail.textColor || '#17201b';
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const activeTemplate = detailColorTemplates.find(template =>
    template.backgroundColor.toLowerCase() === backgroundColor.toLowerCase()
    && template.textColor.toLowerCase() === textColor.toLowerCase()
  );

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div ref={pickerRef} className="relative rounded-md border border-[#dfe5df] bg-[#fbfaf6] p-2">
      <div className="relative">
        <button type="button" onClick={() => setIsOpen(current => !current)} className="tm-admin-press flex min-h-[46px] w-full cursor-pointer items-center justify-between gap-3 rounded-md bg-white px-3 text-right shadow-[0_0_0_1px_rgba(19,25,33,0.08)]">
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid h-8 w-12 overflow-hidden rounded-md border border-[#dfe5df] bg-white">
              <span style={{ backgroundColor }} />
              <span style={{ backgroundColor: textColor }} />
            </span>
            <span className="grid min-w-0">
              <span className="text-xs font-black text-[#65716a]">ستايل النص</span>
              <span className="truncate text-sm font-black text-[#17201b]">{activeTemplate?.label || 'إعداد يدوي'}</span>
            </span>
          </span>
          <span className="text-xs font-black text-[#b45309]">{isOpen ? 'إغلاق' : 'اختيار'}</span>
        </button>

        {isOpen ? <div className="absolute right-0 z-[90] mt-2 w-full rounded-lg border border-[#dfe5df] bg-white p-3 shadow-[0_22px_55px_-30px_rgba(19,25,33,0.45)]">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {detailColorTemplates.map(template => {
              const selected = template.id === activeTemplate?.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    onChange({ backgroundColor: template.backgroundColor, textColor: template.textColor });
                    setIsOpen(false);
                  }}
                  className={`tm-admin-press overflow-hidden rounded-md border p-2 text-right ${selected ? 'border-[#ff9900] ring-2 ring-[#ff9900]/20' : 'border-[#dfe5df]'}`}
                  style={{ backgroundColor: template.backgroundColor, color: template.textColor }}
                >
                  <span className="block text-xs font-black opacity-80">{template.label}</span>
                  <span className="mt-1 block font-heading text-base font-black leading-6">عنوان واضح</span>
                  <span className="mt-1 block text-xs font-bold leading-5 opacity-75">نص مريح للقراءة داخل البلوك</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid gap-2 rounded-md bg-[#f8fafc] p-2 sm:grid-cols-[1fr_1fr_auto]">
            <label className="flex min-h-[40px] items-center justify-between gap-3 rounded-md bg-white px-3 text-xs font-black text-[#17201b]">
              خلفية النص
              <input
                type="color"
                value={backgroundColor}
                onChange={event => onChange({ backgroundColor: event.target.value })}
                className="h-7 w-10 cursor-pointer rounded border border-[#dfe5df] bg-white"
              />
            </label>
            <label className="flex min-h-[40px] items-center justify-between gap-3 rounded-md bg-white px-3 text-xs font-black text-[#17201b]">
              لون النص
              <input
                type="color"
                value={textColor}
                onChange={event => onChange({ textColor: event.target.value })}
                className="h-7 w-10 cursor-pointer rounded border border-[#dfe5df] bg-white"
              />
            </label>
            <button
              type="button"
              onClick={() => onChange({ backgroundColor: '', textColor: '' })}
              className="tm-admin-press min-h-[40px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black text-[#65716a]"
            >
              افتراضي
            </button>
          </div>
        </div> : null}
      </div>
    </div>
  );
}

function AdminSection({
  title,
  badge,
  summary,
  status = 'neutral',
  action,
  defaultOpen = true,
  children,
}: {
  title: string;
  badge?: string;
  summary?: string;
  status?: 'done' | 'missing' | 'neutral';
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const statusLabel = status === 'done' ? 'جاهز' : status === 'missing' ? 'يحتاج إكمال' : 'اختياري';
  const statusClass =
    status === 'done' ? 'bg-[#fff3df] text-[#b45309]' :
    status === 'missing' ? 'bg-[#fff1d5] text-[#9a5a00]' :
    'bg-[#eef3ef] text-[#65716a]';

  return (
    <section className={`tm-admin-surface rounded-md bg-white transition-shadow ${isOpen ? 'overflow-visible shadow-[0_16px_44px_-32px_rgba(19,25,33,0.45)]' : 'overflow-hidden'}`}>
      <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
        <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen(current => !current)} className="tm-admin-press flex min-h-[42px] min-w-0 items-center gap-3 rounded-md px-1 text-right">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#eef3ef] text-[#131921] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <AdminIcon name="chevron" />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-base font-black leading-tight sm:text-lg">{title}</span>
              {badge ? <span className="rounded-md bg-[#fff3df] px-3 py-1 text-xs font-black text-[#b45309]">{badge}</span> : null}
              <span className={`rounded-md px-2.5 py-1 text-[11px] font-black ${statusClass}`}>{statusLabel}</span>
            </span>
          </span>
        </button>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {isOpen ? <div className="border-t border-[#e4e9e4] p-3 sm:p-4">{children}</div> : null}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  numeric = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-black text-[#65716a]">{label}</span>
      <input required={required} value={value} onChange={event => onChange(event.target.value)} className={`${numeric ? 'tm-admin-num' : ''} min-h-[42px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-bold outline-none focus:border-[#b45309]`} />
    </label>
  );
}

function TableInput({
  value,
  onChange,
  numeric = false,
  bold = false,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
  bold?: boolean;
  placeholder?: string;
}) {
  return (
    <td className="px-3 py-3">
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={`${numeric ? 'tm-admin-num' : ''} ${bold ? 'font-black' : 'font-bold'} w-full rounded-md bg-[#fbfaf6] px-2 py-2 text-[#17201b] outline-none focus:ring-1 focus:ring-[#b45309]`} />
    </td>
  );
}

function BlockMediaPicker({
  detailId,
  value,
  gallery,
  onFocus,
  onSelect,
  onUrlChange,
  onUpload,
  uploadDisabled = false,
}: {
  detailId: string;
  value: string;
  gallery: string[];
  onFocus: () => void;
  onSelect: (mediaUrl: string) => void;
  onUrlChange: (mediaUrl: string) => void;
  onUpload: (files: File[]) => void;
  uploadDisabled?: boolean;
}) {
  const inputId = `tm-block-upload-${detailId}`;
  const imageOptions = gallery.map(item => item.trim()).filter(Boolean);
  const selectedIndex = imageOptions.findIndex(item => item === value);
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div ref={pickerRef} className="relative z-10 grid gap-2 focus-within:z-[95]">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_96px]">
        <div className="relative grid gap-1">
          <span className="text-[11px] font-black text-[#65716a]">اختيار من الصور المرفوعة</span>
          <button
            type="button"
            onFocus={onFocus}
            onClick={() => {
              onFocus();
              setIsOpen(current => !current);
            }}
            className="tm-admin-press flex min-h-[36px] items-center justify-between gap-2 rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-2 text-right text-xs font-bold outline-none focus:border-[#b45309]"
          >
            <span>{selectedIndex >= 0 ? `صورة ${selectedIndex + 1}` : 'اختر صورة'}</span>
            <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}><AdminIcon name="chevron" /></span>
          </button>

          {isOpen ? (
            <div className="absolute left-0 right-0 top-full z-[100] mt-1 grid max-h-[260px] gap-2 overflow-auto rounded-md border border-[#dfe5df] bg-white p-2 shadow-[0_18px_44px_-24px_rgba(23,32,27,0.45)]">
              {imageOptions.length > 0 ? imageOptions.map((image, imageIndex) => (
                <button
                  key={`${imageIndex}-${image.slice(0, 32)}`}
                  type="button"
                  onClick={() => {
                    onSelect(image);
                    setIsOpen(false);
                  }}
                  className={`tm-admin-press grid min-h-[46px] grid-cols-[46px_minmax(0,1fr)] items-center gap-2 rounded-md p-1 text-right ${image === value ? 'bg-[#fff3df] text-[#b45309]' : 'bg-[#fbfaf6] text-[#17201b] hover:bg-[#eef3ef]'}`}
                >
                  <img src={image} alt={`صورة ${imageIndex + 1}`} className="h-[46px] w-[46px] rounded object-cover" />
                  <span className="text-xs font-black">صورة {imageIndex + 1}</span>
                </button>
              )) : (
                <div className="rounded-md bg-[#fbfaf6] p-3 text-xs font-bold text-[#65716a]">لا توجد صور مرفوعة بعد</div>
              )}
            </div>
          ) : null}
        </div>

        <label htmlFor={inputId} aria-disabled={uploadDisabled} className={`tm-admin-press mt-[17px] grid min-h-[36px] place-items-center rounded-md bg-[#131921] px-3 text-xs font-black text-white ${uploadDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
          رفع جديد
        </label>
        <input id={inputId} type="file" accept="image/*" disabled={uploadDisabled} className="sr-only" onChange={event => {
          const files = Array.from(event.currentTarget.files || []);
          onFocus();
          if (files.length) onUpload(files);
          event.currentTarget.value = '';
        }} />
      </div>

      <input
        value={value}
        onFocus={onFocus}
        onChange={event => onUrlChange(event.target.value)}
        placeholder="رابط صورة أو فيديو"
        className="min-h-[36px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-2 text-xs font-bold outline-none focus:border-[#b45309]"
      />
    </div>
  );
}

function AdminRail({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return <AdminSidebar onNavigate={route => {
    if (route === '#/admin') {
      onOpenDashboard();
      return;
    }
    window.location.hash = route;
  }} />;

  return (
    <aside className="hidden border-l border-[#2f3a47] bg-[#131921] text-white lg:col-start-1 lg:row-start-1 lg:block">
      <div className="sticky top-0 flex h-screen flex-col items-center gap-4 py-4">
        <button type="button" onClick={onOpenDashboard} className="tm-admin-press">
          <TanjaMallLogo iconOnly />
        </button>
        <button type="button" title="فتح القائمة" aria-label="فتح القائمة" className="tm-admin-press grid h-10 w-10 place-items-center rounded-md bg-white/10 text-white/82 hover:bg-white/14 hover:text-white">
          <AdminIcon name="menu" />
        </button>
        <nav className="mt-3 flex flex-1 flex-col items-center gap-2">
          {navItems.map((item, index) => (
            <button key={item.label} type="button" title={item.label} aria-label={item.label} onClick={index === 0 ? onOpenDashboard : undefined} className={`tm-admin-press grid h-10 w-10 place-items-center rounded-md ${index === 1 ? 'bg-white text-[#131921]' : 'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white'}`}>
              <AdminIcon name={item.icon} />
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function PublishModal({
  product,
  onDashboard,
  onView,
}: {
  product: Product;
  onDashboard: () => void;
  onView: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#131921]/70 p-4" role="dialog" aria-modal="true" onClick={onDashboard}>
      <div className="w-full max-w-[460px] rounded-lg bg-[#fffdf8] p-5 text-right shadow-[0_24px_80px_rgba(0,0,0,0.28)]" onClick={event => event.stopPropagation()}>
        <p className="font-heading text-3xl font-black">تم نشر المنتج</p>
        <p className="mt-3 text-sm font-bold leading-7 text-[#5f6861]">{product.title} أصبح منشورا في المتجر.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onDashboard} className="tm-admin-press min-h-[48px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-black">
            الذهاب للوحة التحكم
          </button>
          <button type="button" onClick={onView} className="tm-admin-press min-h-[48px] rounded-md bg-[#ff9900] px-4 text-sm font-black text-[#131921]">
            مشاهدة المنتج
          </button>
        </div>
      </div>
    </div>
  );
}

const iconPaths = {
  dashboard: 'M4 5.5h6v6H4zM14 5.5h6v4h-6zM14 13.5h6v5h-6zM4 15.5h6v3H4z',
  box: 'M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z M12 12 4.6 7.8 M12 12l7.4-4.2 M12 12v8.2',
  orders: 'M7 3.8h10v16.4H7z M9.8 8h4.8 M9.8 12h4.8 M9.8 16h3',
  users: 'M8.5 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z M3.8 19.2c.6-3 2.4-5 4.7-5s4.1 2 4.7 5 M15.7 10.8a2.7 2.7 0 1 0 0-5.4 M14.8 14.1c2 .2 3.5 2 3.9 5.1',
  settings: 'M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z M12 3.6v2.1 M12 18.3v2.1 M4.8 6.4l1.5 1.5 M17.7 16.1l1.5 1.5 M3.6 12h2.1 M18.3 12h2.1 M4.8 17.6l1.5-1.5 M17.7 7.9l1.5-1.5',
  menu: 'M5 7h14 M5 12h14 M5 17h14',
  chevron: 'M6 9l6 6 6-6',
} as const;

function AdminIcon({ name }: { name: keyof typeof iconPaths }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}
