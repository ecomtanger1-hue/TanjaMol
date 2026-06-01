import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { categories } from '../../../storefrontRuntime';
import type { Product, ProductDetailBlock, ProductVariant } from '../../../storefrontRuntime';

type AddProductProps = {
  products: Product[];
  onBack: () => void;
  onOpenDashboard: () => void;
  onOpenProduct: (slug: string) => void;
  onCreateProduct: (product: Product) => void;
};

type SpecDraft = {
  id: string;
  label: string;
  value: string;
};

type DetailDraft = ProductDetailBlock;

const fallbackImage = 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=85';

const navItems = [
  { label: 'لوحة التحكم', icon: 'dashboard' },
  { label: 'المنتجات', icon: 'box' },
  { label: 'الطلبات', icon: 'orders' },
  { label: 'الزوار', icon: 'users' },
  { label: 'الإعدادات', icon: 'settings' },
] as const;

const toolbar = ['B', 'I', 'U', 'H2', '18px', 'يمين', 'وسط', 'يسار', 'قائمة', 'جدول', 'رابط', 'صورة', 'فيديو'];
const uploadInputId = 'tm-product-gallery-upload';

const initialVariants: ProductVariant[] = [
  { id: 'variant-1', name: 'أسود', sku: 'TM-WATCH-BLK', priceLabel: '249 درهم', stock: 18, enabled: true },
  { id: 'variant-2', name: 'فضي', sku: 'TM-WATCH-SLV', priceLabel: '249 درهم', stock: 12, enabled: true },
  { id: 'variant-3', name: 'أخضر', sku: 'TM-WATCH-GRN', priceLabel: '259 درهم', stock: 8, enabled: true },
];

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

function readFiles(files: FileList | null): Promise<string[]> {
  if (!files?.length) return Promise.resolve([]);

  return Promise.all(Array.from(files).map(file => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  })));
}

export const TanjaMolAddProductPage = ({
  products,
  onBack,
  onOpenDashboard,
  onOpenProduct,
  onCreateProduct,
}: AddProductProps) => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('ساعة ذكية مقاومة للماء');
  const [slug, setSlug] = useState('smart-waterproof-watch');
  const [category, setCategory] = useState(categories[2]?.title || categories[0]?.title || 'الإلكترونيات');
  const [shortDescription, setShortDescription] = useState('تتبع النشاط والمكالمات والتنبيهات اليومية، مناسبة للاستعمال في العمل والرياضة والتنقل داخل المدينة.');
  const [price, setPrice] = useState('249 درهم');
  const [oldPrice, setOldPrice] = useState('360 درهم');
  const [stock, setStock] = useState('38');
  const [delivery, setDelivery] = useState('24 إلى 48 ساعة');
  const [badge, setBadge] = useState('متوفر الآن');
  const [gallery, setGallery] = useState<string[]>([fallbackImage]);
  const [variantsEnabled, setVariantsEnabled] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [details, setDetails] = useState<DetailDraft[]>(initialDetails);
  const [activeDetail, setActiveDetail] = useState(0);
  const [specs, setSpecs] = useState<SpecDraft[]>(initialSpecs);
  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [manualReviewsEnabled, setManualReviewsEnabled] = useState(true);
  const [showRelated, setShowRelated] = useState(true);
  const [showPolicies, setShowPolicies] = useState(true);
  const [rating, setRating] = useState('4.8');
  const [reviewCount, setReviewCount] = useState('127');
  const [draftSaved, setDraftSaved] = useState(false);
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);

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

  const previewProduct = useMemo<Product>(() => ({
    id: slug || makeSlug(title),
    slug: slug || makeSlug(title),
    title,
    category,
    price: parsePrice(price),
    priceLabel: priceLabel(price),
    oldPrice: oldPrice.trim() || priceLabel(price),
    badge,
    image: cleanGallery[0] || fallbackImage,
    gallery: cleanGallery.length ? cleanGallery : [fallbackImage],
    description: shortDescription,
    stock: Number(stock) || 0,
    delivery,
    reviewsEnabled,
    manualReviewsEnabled,
    showRelated,
    showPolicies,
    details: details.map((detail, index) => ({ ...detail, reverse: detail.reverse ?? index % 2 === 1 })),
    specs: specs.filter(spec => spec.label.trim() && spec.value.trim()).map(spec => [spec.label, spec.value] as [string, string]),
    variants: variantsEnabled ? variants : [],
  }), [badge, category, cleanGallery, delivery, details, manualReviewsEnabled, oldPrice, price, reviewsEnabled, shortDescription, showPolicies, showRelated, slug, specs, stock, title, variants, variantsEnabled]);

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

  const updateVariant = (id: string, next: Partial<ProductVariant>) => {
    setVariants(current => current.map(variant => variant.id === id ? { ...variant, ...next } : variant));
  };

  const removeVariant = (id: string) => {
    setVariants(current => current.length > 1 ? current.filter(variant => variant.id !== id) : current);
  };

  const addDetailBlock = () => {
    const index = details.length + 1;
    setDetails(current => [...current, {
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
    setDetails(current => current.map(detail => detail.id === id ? { ...detail, ...next } : detail));
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
    const nextImages = await readFiles(files);
    if (!nextImages.length) return;
    setGallery(current => [...current.filter(Boolean), ...nextImages]);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
  };

  const handleBlockImageUpload = async (detailId: string, files: FileList | null) => {
    const nextImages = await readFiles(files);
    const selectedImage = nextImages[0];
    if (!selectedImage) return;

    setGallery(current => [...current.filter(Boolean), ...nextImages]);
    updateDetail(detailId, { mediaUrl: selectedImage, mediaType: 'image' });
  };

  const applyEditorAction = (action: string) => {
    const active = details[activeDetail];
    if (!active) return;
    const wrappers: Record<string, [string, string]> = {
      B: ['**', '**'],
      I: ['_', '_'],
      U: ['<u>', '</u>'],
    };
    const [start, end] = wrappers[action] || ['', ''];
    const suffix = action === 'جدول' ? '\n\n| الميزة | التفاصيل |\n| --- | --- |\n| مثال | اكتب هنا |\n' : action === 'قائمة' ? '\n- نقطة مهمة\n- نقطة ثانية\n' : action === 'رابط' ? ' [رابط](https://example.com)' : action === 'صورة' ? '\n[صورة إضافية]\n' : action === 'فيديو' ? '\n[فيديو شرح]\n' : '';
    updateDetail(active.id, { text: `${start}${active.text}${end}${suffix}` });
  };

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || parsePrice(price) <= 0) {
      event.currentTarget.reportValidity();
      return;
    }
    onCreateProduct(previewProduct);
    setPublishedProduct(previewProduct);
  };

  return (
    <form dir="rtl" onSubmit={submitProduct} className="min-h-screen w-full bg-[#f4f2eb] text-[#17201b]">
      <div className="grid min-h-screen lg:grid-cols-[76px_minmax(0,1fr)]">
        <AdminRail onOpenDashboard={onOpenDashboard} />

        <main className="min-w-0 lg:col-start-2 lg:row-start-1">
          <header className="sticky top-0 z-30 border-b border-[#d9dfd8] bg-[#f8f7f1]/96 backdrop-blur">
            <div className="mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-[11px] font-black text-[#6a746d]">المنتجات / إضافة منتج</p>
                <h1 className="mt-1 truncate font-heading text-[26px] font-black leading-none sm:text-[30px]">إضافة منتج جديد</h1>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => setDraftSaved(true)} className="tm-admin-press min-h-[40px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-extrabold">
                  حفظ مسودة
                </button>
                <button type="submit" className="tm-admin-press min-h-[40px] rounded-md bg-[#00a66c] px-4 text-sm font-black text-white shadow-[0_14px_30px_-22px_rgba(0,166,108,0.9)]">
                  نشر المنتج
                </button>
              </div>
            </div>

            <div className="border-t border-[#e3e6df] bg-white/62">
              <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
                <span className="tm-admin-num text-xs font-black text-[#0f7d55]">{readiness}%</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#dfe6df]">
                  <div className="h-full rounded-full bg-[#00a66c]" style={{ width: `${readiness}%` }} />
                </div>
                <span className="text-xs font-black text-[#66736b]">جاهزية النشر</span>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1280px] gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <AdminSection title="البيانات الأساسية" badge="مطلوب">
              <div className="grid gap-4 lg:grid-cols-2">
                <TextField label="اسم المنتج" value={title} onChange={value => {
                  setTitle(value);
                  if (!slug) setSlug(makeSlug(value));
                }} required />
                <TextField label="الرابط المختصر" value={slug} onChange={value => setSlug(makeSlug(value))} required />
                <label className="grid gap-1">
                  <span className="text-xs font-black text-[#65716a]">القسم</span>
                  <select value={category} onChange={event => setCategory(event.target.value)} className="min-h-[42px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-bold outline-none focus:border-[#0f7d55]">
                    {categories.map(item => <option key={item.id} value={item.title}>{item.title}</option>)}
                  </select>
                </label>
                <TextField label="شارة المنتج" value={badge} onChange={setBadge} />
                <label className="grid gap-1 lg:col-span-2">
                  <span className="text-xs font-black text-[#65716a]">وصف قصير بجانب السعر</span>
                  <textarea value={shortDescription} onChange={event => setShortDescription(event.target.value)} className="min-h-[88px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 py-3 text-[14px] font-semibold leading-7 outline-none focus:border-[#0f7d55]" />
                </label>
              </div>
            </AdminSection>

            <AdminSection title="السعر والمخزون والتوصيل">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TextField label="السعر الحالي" value={price} onChange={setPrice} numeric />
                <TextField label="السعر قبل التخفيض" value={oldPrice} onChange={setOldPrice} numeric />
                <TextField label="المخزون" value={stock} onChange={setStock} numeric />
                <TextField label="مدة التوصيل" value={delivery} onChange={setDelivery} numeric />
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {['الدفع عند الاستلام', 'تأكيد بالهاتف', 'توصيل داخل طنجة'].map(item => (
                  <label key={item} className="flex min-h-[42px] items-center gap-3 rounded-md border border-[#dfe5df] bg-[#fbfaf6] px-3 text-sm font-extrabold">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#00a66c]" />
                    {item}
                  </label>
                ))}
              </div>
            </AdminSection>

            <AdminSection title="معرض المنتج" action={
              <>
                <input id={uploadInputId} ref={uploadInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={event => void handleImageUpload(event.target.files)} />
                <label htmlFor={uploadInputId} className="tm-admin-press inline-grid min-h-[36px] cursor-pointer place-items-center rounded-md bg-[#102118] px-3 text-xs font-black text-white">
                  رفع صور
                </label>
              </>
            }>
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
                <label htmlFor={uploadInputId} className="tm-admin-press grid min-h-[180px] cursor-pointer place-items-center rounded-md border border-dashed border-[#bfcac1] bg-[#fbfaf6] p-3 text-sm font-black text-[#65716a]">
                  إضافة صور
                </label>
              </div>
            </AdminSection>

            <AdminSection title="المتغيرات" action={
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-extrabold">
                  <input type="checkbox" checked={variantsEnabled} onChange={event => setVariantsEnabled(event.target.checked)} className="h-4 w-4 accent-[#00a66c]" />
                  تفعيل المتغيرات
                </label>
                <button type="button" onClick={addVariant} className="tm-admin-press min-h-[36px] rounded-md bg-[#00a66c] px-3 text-xs font-black text-white">
                  إضافة متغير
                </button>
              </div>
            }>
              <div className="overflow-x-auto rounded-md border border-[#dfe5df]">
                <table className="w-full min-w-[850px] text-sm">
                  <thead className="bg-[#f4f7f4] text-xs font-black text-[#65716a]">
                    <tr>
                      {['الاسم', 'SKU', 'السعر', 'المخزون', 'الصورة', 'الحالة', ''].map(head => <th key={head} className="px-4 py-3 text-right">{head}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map(variant => (
                      <tr key={variant.id} className="border-t border-[#e4e9e4] bg-white">
                        <TableInput value={variant.name} onChange={value => updateVariant(variant.id, { name: value })} bold />
                        <TableInput value={variant.sku} onChange={value => updateVariant(variant.id, { sku: value })} numeric />
                        <TableInput value={variant.priceLabel} onChange={value => updateVariant(variant.id, { priceLabel: value })} numeric bold />
                        <TableInput value={String(variant.stock)} onChange={value => updateVariant(variant.id, { stock: Number(value) || 0 })} numeric />
                        <TableInput value={variant.image || ''} onChange={value => updateVariant(variant.id, { image: value })} placeholder="رابط الصورة" />
                        <td className="px-3 py-3">
                          <label className="flex items-center gap-2 rounded-md bg-[#e7f8ee] px-2.5 py-2 text-xs font-black text-[#0f7d55]">
                            <input type="checkbox" checked={variant.enabled} onChange={event => updateVariant(variant.id, { enabled: event.target.checked })} className="h-4 w-4 accent-[#00a66c]" />
                            مفعل
                          </label>
                        </td>
                        <td className="px-3 py-3">
                          <button type="button" onClick={() => removeVariant(variant.id)} className="tm-admin-press min-h-[34px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminSection>

            <AdminSection title="تفاصيل المنتج المصورة" action={<button type="button" onClick={addDetailBlock} className="tm-admin-press min-h-[36px] rounded-md bg-[#00a66c] px-3 text-xs font-black text-white">إضافة بلوك</button>}>
              <div className="rounded-md border border-[#dfe5df] bg-[#fbfaf6] p-3">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#dfe5df] pb-3">
                  {toolbar.map(tool => (
                    <button key={tool} type="button" onClick={() => applyEditorAction(tool)} className={`tm-admin-press min-h-[32px] rounded px-2.5 text-xs font-black ${tool === 'B' ? 'bg-[#102118] text-white' : 'bg-white text-[#4e5a52] hover:bg-[#eef3ef]'}`}>
                      {tool}
                    </button>
                  ))}
                  <input className="min-h-[32px] w-24 rounded-md border border-[#cfd8d1] bg-white px-2 text-xs font-bold outline-none focus:border-[#0f7d55]" defaultValue="#17201b" />
                </div>

                <div className="mt-4 grid gap-4">
                  {details.map((detail, index) => (
                    <article key={detail.id} className="rounded-md border border-[#dfe5df] bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <p className="font-heading text-base font-black">بلوك {index + 1}</p>
                          <span className="rounded-md bg-[#e7f8ee] px-2 py-1 text-xs font-black text-[#0f7d55]">{detail.reverse ? 'نص يسار، صورة يمين' : 'صورة يسار، نص يمين'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => updateDetail(detail.id, { reverse: !detail.reverse })} className="tm-admin-press min-h-[32px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">تبديل</button>
                          <button type="button" onClick={() => setDetails(current => [...current, { ...detail, id: `detail-${Date.now()}` }])} className="tm-admin-press min-h-[32px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">نسخ</button>
                          <button type="button" onClick={() => setDetails(current => current.length > 1 ? current.filter(item => item.id !== detail.id) : current)} className="tm-admin-press min-h-[32px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">حذف</button>
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
                          />
                        </div>
                        <div className={`grid self-start gap-3 ${detail.reverse ? 'lg:col-start-1' : 'lg:col-start-2'} lg:row-start-1 lg:[direction:rtl]`}>
                          <input value={detail.title} onFocus={() => setActiveDetail(index)} onChange={event => updateDetail(detail.id, { title: event.target.value })} className="min-h-[40px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-black outline-none focus:border-[#0f7d55]" />
                          <textarea value={detail.text} onFocus={() => setActiveDetail(index)} onChange={event => updateDetail(detail.id, { text: event.target.value })} className="min-h-[170px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-4 py-3 text-[15px] font-semibold leading-8 outline-none focus:border-[#0f7d55]" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </AdminSection>

            <AdminSection title="المواصفات" action={<button type="button" onClick={addSpec} className="tm-admin-press min-h-[36px] rounded-md bg-[#00a66c] px-3 text-xs font-black text-white">إضافة مواصفة</button>}>
              <div className="grid gap-3">
                {specs.map(spec => (
                  <div key={spec.id} className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_80px]">
                    <input value={spec.label} onChange={event => updateSpec(spec.id, { label: event.target.value })} className="min-h-[40px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-bold outline-none focus:border-[#0f7d55]" placeholder="العنوان" />
                    <input value={spec.value} onChange={event => updateSpec(spec.id, { value: event.target.value })} className="min-h-[40px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-semibold outline-none focus:border-[#0f7d55]" placeholder="القيمة" />
                    <button type="button" onClick={() => removeSpec(spec.id)} className="tm-admin-press min-h-[40px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">حذف</button>
                  </div>
                ))}
              </div>
            </AdminSection>

            <AdminSection title="التقييمات">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="متوسط التقييم" value={rating} onChange={setRating} numeric />
                <TextField label="عدد التقييمات" value={reviewCount} onChange={setReviewCount} numeric />
              </div>
            </AdminSection>

            <AdminSection title="إعدادات الظهور" defaultOpen={false}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {([
                  ['إظهار التقييمات', reviewsEnabled, setReviewsEnabled],
                  ['السماح بتقييمات يدوية', manualReviewsEnabled, setManualReviewsEnabled],
                  ['إظهار المنتجات المقترحة', showRelated, setShowRelated],
                  ['إظهار سياسات المتجر', showPolicies, setShowPolicies],
                ] as Array<[string, boolean, (value: boolean) => void]>).map(([label, checked, setter]) => (
                  <label key={label} className="flex min-h-[44px] items-center gap-3 rounded-md border border-[#dfe5df] bg-[#fbfaf6] px-3 text-sm font-extrabold">
                    <input type="checkbox" checked={checked} onChange={event => setter(event.target.checked)} className="h-4 w-4 accent-[#00a66c]" />
                    {label}
                  </label>
                ))}
              </div>
            </AdminSection>

            <AdminSection title="معاينة مصغرة" defaultOpen={false}>
              <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-[#eef3ef] text-sm font-black text-[#65716a]">
                  <img src={previewProduct.image} alt={previewProduct.title} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-[#e9f8ef] px-2.5 py-1 text-xs font-black text-[#0f7d55]">{badge}</span>
                    <span className="rounded-md bg-[#fff1d5] px-2.5 py-1 text-xs font-black text-[#9a5a00]">COD</span>
                  </div>
                  <h3 className="mt-3 font-heading text-xl font-black">{title}</h3>
                  <p className="mt-2 max-w-[62ch] text-sm font-semibold leading-7 text-[#65716a]">{shortDescription}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <p className="tm-admin-num font-heading text-2xl font-black text-[#0f7d55]">{priceLabel(price)}</p>
                    <button type="submit" className="tm-admin-press min-h-[40px] rounded-md bg-[#00a66c] px-4 text-sm font-black text-white">اطلب الآن</button>
                  </div>
                  <p className="mt-3 text-xs font-bold leading-5 text-[#65716a]">المنتجات الحالية في المتجر: {products.length}</p>
                </div>
              </div>
            </AdminSection>

            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={onBack} className="tm-admin-press min-h-[42px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-extrabold">
                العودة إلى لوحة التحكم
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setDraftSaved(true)} className="tm-admin-press min-h-[42px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-extrabold">
                  حفظ مسودة
                </button>
                <button type="submit" className="tm-admin-press min-h-[42px] rounded-md bg-[#00a66c] px-4 text-sm font-black text-white">
                  نشر المنتج
                </button>
              </div>
            </div>

            {draftSaved ? <div className="fixed bottom-4 left-4 z-[70] rounded-md bg-[#102118] px-4 py-3 text-sm font-black text-white shadow-[0_18px_48px_-22px_rgba(23,32,27,0.65)]" role="status">تم حفظ المسودة</div> : null}
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

function AdminSection({
  title,
  badge,
  action,
  defaultOpen = true,
  children,
}: {
  title: string;
  badge?: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="tm-admin-surface rounded-md bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setIsOpen(current => !current)} className="tm-admin-press flex min-h-[38px] items-center gap-3 text-right">
          <span className={`grid h-8 w-8 place-items-center rounded-md bg-[#eef3ef] text-[#102118] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <AdminIcon name="chevron" />
          </span>
          <span className="font-heading text-[22px] font-black leading-tight">{title}</span>
          {badge ? <span className="rounded-md bg-[#e7f8ee] px-3 py-1 text-xs font-black text-[#0f7d55]">{badge}</span> : null}
        </button>
        {action ? <div>{action}</div> : null}
      </div>
      {isOpen ? <div className="mt-4">{children}</div> : null}
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
      <input required={required} value={value} onChange={event => onChange(event.target.value)} className={`${numeric ? 'tm-admin-num' : ''} min-h-[42px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-bold outline-none focus:border-[#0f7d55]`} />
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
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={`${numeric ? 'tm-admin-num' : ''} ${bold ? 'font-black' : 'font-bold'} w-full rounded-md bg-[#fbfaf6] px-2 py-2 text-[#17201b] outline-none focus:ring-1 focus:ring-[#0f7d55]`} />
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
}: {
  detailId: string;
  value: string;
  gallery: string[];
  onFocus: () => void;
  onSelect: (mediaUrl: string) => void;
  onUrlChange: (mediaUrl: string) => void;
  onUpload: (files: FileList | null) => void;
}) {
  const inputId = `tm-block-upload-${detailId}`;
  const imageOptions = gallery.map(item => item.trim()).filter(Boolean);
  const selectedIndex = imageOptions.findIndex(item => item === value);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid gap-2">
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
            className="tm-admin-press flex min-h-[36px] items-center justify-between gap-2 rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-2 text-right text-xs font-bold outline-none focus:border-[#0f7d55]"
          >
            <span>{selectedIndex >= 0 ? `صورة ${selectedIndex + 1}` : 'اختر صورة'}</span>
            <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}><AdminIcon name="chevron" /></span>
          </button>

          {isOpen ? (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 grid max-h-[190px] gap-2 overflow-auto rounded-md border border-[#dfe5df] bg-white p-2 shadow-[0_18px_44px_-24px_rgba(23,32,27,0.45)]">
              {imageOptions.length > 0 ? imageOptions.map((image, imageIndex) => (
                <button
                  key={`${imageIndex}-${image.slice(0, 32)}`}
                  type="button"
                  onClick={() => {
                    onSelect(image);
                    setIsOpen(false);
                  }}
                  className={`tm-admin-press grid min-h-[46px] grid-cols-[46px_minmax(0,1fr)] items-center gap-2 rounded-md p-1 text-right ${image === value ? 'bg-[#e7f8ee] text-[#0f7d55]' : 'bg-[#fbfaf6] text-[#17201b] hover:bg-[#eef3ef]'}`}
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

        <label htmlFor={inputId} className="tm-admin-press mt-[17px] grid min-h-[36px] cursor-pointer place-items-center rounded-md bg-[#102118] px-3 text-xs font-black text-white">
          رفع جديد
        </label>
        <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={event => {
          onFocus();
          onUpload(event.target.files);
          event.currentTarget.value = '';
        }} />
      </div>

      <input
        value={value}
        onFocus={onFocus}
        onChange={event => onUrlChange(event.target.value)}
        placeholder="رابط صورة أو فيديو"
        className="min-h-[36px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-2 text-xs font-bold outline-none focus:border-[#0f7d55]"
      />
    </div>
  );
}

function AdminRail({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return (
    <aside className="hidden border-l border-[#1f3528] bg-[#102118] text-white lg:col-start-1 lg:row-start-1 lg:block">
      <div className="sticky top-0 flex h-screen flex-col items-center gap-4 py-4">
        <button type="button" onClick={onOpenDashboard} className="grid h-11 w-11 place-items-center rounded-md bg-[#00a66c] font-heading text-lg font-black">TM</button>
        <button type="button" title="فتح القائمة" aria-label="فتح القائمة" className="tm-admin-press grid h-10 w-10 place-items-center rounded-md bg-white/10 text-white/82 hover:bg-white/14 hover:text-white">
          <AdminIcon name="menu" />
        </button>
        <nav className="mt-3 flex flex-1 flex-col items-center gap-2">
          {navItems.map((item, index) => (
            <button key={item.label} type="button" title={item.label} aria-label={item.label} onClick={index === 0 ? onOpenDashboard : undefined} className={`tm-admin-press grid h-10 w-10 place-items-center rounded-md ${index === 1 ? 'bg-white text-[#102118]' : 'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white'}`}>
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
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#102118]/70 p-4 backdrop-blur" role="dialog" aria-modal="true">
      <div className="w-full max-w-[460px] rounded-lg bg-[#fffdf8] p-5 text-right shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <p className="font-heading text-3xl font-black">تم نشر المنتج</p>
        <p className="mt-3 text-sm font-bold leading-7 text-[#5f6861]">{product.title} أصبح منشورا في المتجر.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onDashboard} className="tm-admin-press min-h-[48px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-black">
            الذهاب للوحة التحكم
          </button>
          <button type="button" onClick={onView} className="tm-admin-press min-h-[48px] rounded-md bg-[#00a66c] px-4 text-sm font-black text-white">
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
