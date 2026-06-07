import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { categories, categoryRoute, parseOrderForm, type CartItem, type OrderDraft, type Product, type ProductVariant } from '../../storefrontRuntime';
import { ProductDetailMedia, ProductDetailRichText, ProductDetailTitle } from './ProductDetailRichText';
import { ProductCard } from '../storefront/ProductCard';
import { SiteFooter, SiteHeader } from '../storefront/StorefrontPages';
const gallery = [{
  src: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=85',
  alt: 'ساعة ذكية سوداء على مكتب مرتب'
}, {
  src: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=80',
  alt: 'ساعة ذكية تعرض شاشة النشاط'
}, {
  src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  alt: 'تفاصيل حزام الساعة الذكية'
}, {
  src: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  alt: 'هاتف وساعة ذكية للاستعمال اليومي'
}];
const colors = [{
  name: 'أسود',
  value: '#17201b'
}, {
  name: 'فضي',
  value: '#b8beb9'
}, {
  name: 'أخضر',
  value: '#0f7d55'
}];
const getPriceFromLabel = (label: string, fallback: number) => {
  const match = label.replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : fallback;
};
const specs = [['الشحن', 'من 1 إلى 2 أيام داخل طنجة'], ['الدفع', 'الدفع عند الاستلام'], ['الضمان', 'استبدال خلال 7 أيام'], ['المحتوى', 'ساعة، شاحن، كتيب استعمال']];
const relatedProducts = [{
  title: 'سماعات بلوتوث صغيرة',
  price: '169 درهم',
  image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=700&q=80'
}, {
  title: 'شاحن سريع متعدد المنافذ',
  price: '99 درهم',
  image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80'
}, {
  title: 'حامل هاتف للمكتب',
  price: '79 درهم',
  image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=700&q=80'
}];
type ProductPageProps = {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onAddToCart: (item: CartItem) => void;
  onOrderProduct?: (item: CartItem) => void;
  onOpenProduct?: (slug: string) => void;
  onPlaceOrder: (draft: OrderDraft) => void;
  product?: Product;
  products?: Product[];
};

export const TanjaMolArabicCODProductPage = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onAddToCart,
  onOrderProduct,
  onOpenProduct,
  onPlaceOrder,
  product,
  products = [],
}: ProductPageProps) => {
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [added, setAdded] = useState(false);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const productTitle = product?.title ?? 'ساعة ذكية مقاومة للماء ببطارية طويلة';
  const productCategory = product?.category ?? 'الإلكترونيات';
  const productDescription = product?.description ?? 'تتبع النشاط والمكالمات والتنبيهات اليومية، مناسبة للاستعمال في الخدمة، الرياضة، والتنقل داخل المدينة.';
  const productPriceLabel = product?.priceLabel ?? '249 درهم';
  const productOldPrice = product?.oldPrice ?? '360 درهم';
  const productBadge = product?.badge ?? 'متوفر الآن';
  const productGallery = (product?.gallery?.length ? product.gallery : gallery.map(image => image.src)).map((src, index) => ({
    src,
    alt: index === 0 ? productTitle : `${productTitle} - ${index + 1}`,
  }));
  const productSpecs = product?.specs?.length ? product.specs : specs;
  const productDetails = product?.details?.length ? product.details : [];
  const showReviews = product?.reviewsEnabled ?? true;
  const showRelated = product?.showRelated ?? true;
  const showPolicies = product?.showPolicies ?? true;
  const activeCategory = categories.find(category => category.title === productCategory || productCategory.includes(category.title.split(' ')[0]));
  const fallbackVariants: ProductVariant[] = colors.map(color => ({
    id: color.name,
    name: color.name,
    sku: color.name,
    priceLabel: productPriceLabel,
    stock: product?.stock ?? 99,
    enabled: true,
    optionValues: { اللون: color.name },
  }));
  const fallbackVariantOptions = [{
    id: 'fallback-color',
    type: 'color',
    label: 'اللون',
    values: colors.map(color => ({ id: color.name, label: color.name, color: color.value })),
  }];
  const variantOptions = product?.variantOptions?.filter(option => option.label.trim() && option.values.some(value => value.label.trim())) ?? [];
  const visibleVariantOptions = variantOptions.length ? variantOptions : fallbackVariantOptions;
  const productVariants = (product?.variants?.filter(variant => variant.enabled) ?? []).length
    ? product!.variants!.filter(variant => variant.enabled)
    : fallbackVariants;
  const getGroupVariants = (group: typeof visibleVariantOptions[number]) => productVariants.filter(variant => {
    const optionValue = variant.optionValues?.[group.label];
    return Boolean(optionValue) || group.values.some(value => value.label.trim() && variant.name === value.label.trim());
  });
  const getGroupVariantValue = (group: typeof visibleVariantOptions[number], variant: ProductVariant) => variant.optionValues?.[group.label] || variant.name;
  const selectedVariants = visibleVariantOptions.map(group => {
    const groupVariants = getGroupVariants(group);
    const selectedId = selectedVariantIds[group.id];
    return groupVariants.find(variant => variant.id === selectedId) ?? groupVariants.find(variant => variant.stock > 0) ?? groupVariants[0];
  }).filter(Boolean) as ProductVariant[];
  const selectedVariantLabel = visibleVariantOptions.map(group => {
    const selected = selectedVariants.find(variant => getGroupVariants(group).some(groupVariant => groupVariant.id === variant.id));
    return selected ? `${group.label}: ${getGroupVariantValue(group, selected)}` : '';
  }).filter(Boolean).join('، ');
  const selectedPriceVariant = selectedVariants.find(variant => variant.priceLabel && variant.priceLabel !== productPriceLabel) ?? selectedVariants[0];
  const selectedImageVariant = selectedVariants.find(variant => variant.image);
  const selectedVariantPriceLabel = selectedPriceVariant?.priceLabel || productPriceLabel;
  const selectedVariantPrice = getPriceFromLabel(selectedVariantPriceLabel, product?.price ?? 249);
  const variantOptionLabels = visibleVariantOptions.map(option => option.label).filter(Boolean);
  const variantPickerLabel = variantOptionLabels.length ? variantOptionLabels.join(' / ') : 'الاختيار';
  const getVariantColor = (group: typeof visibleVariantOptions[number], variant: ProductVariant) => {
    if (group.type !== 'color' && !group.label.includes('لون')) return undefined;
    const colorLabel = getGroupVariantValue(group, variant);
    return group.values.find(value => value.label === colorLabel)?.color ?? colors.find(color => color.name === variant.name || color.name === colorLabel)?.value;
  };
  const getVariantLabel = (group: typeof visibleVariantOptions[number], variant: ProductVariant) => getGroupVariantValue(group, variant);

  useEffect(() => {
    const nextSelected: Record<string, string> = {};
    visibleVariantOptions.forEach(group => {
      const groupVariants = getGroupVariants(group);
      const firstAvailable = groupVariants.find(variant => variant.stock > 0) ?? groupVariants[0];
      if (firstAvailable) nextSelected[group.id] = firstAvailable.id;
    });
    setSelectedVariantIds(nextSelected);
    setSelectedImage(0);
    setQuantity(1);
    setShowOrderForm(false);
  }, [product?.id]);

  const goHome = (sectionId?: string) => {
    window.location.hash = '#/';
    if (sectionId) {
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };
  const navigate = (route: string) => {
    window.location.hash = route;
  };

  const goCategory = () => {
    window.location.hash = activeCategory ? categoryRoute(activeCategory.id) : '#/';
  };

  const orderItem: CartItem = {
    id: product?.id ?? 'smart-watch',
    slug: product?.slug ?? 'smart-watch',
    title: productTitle,
    price: selectedVariantPrice,
    priceLabel: selectedVariantPriceLabel,
    quantity,
    image: selectedImageVariant?.image ?? product?.image ?? productGallery[0].src,
    variant: selectedVariantLabel,
  };

  const relatedItems = products.filter(item => item.id !== orderItem.id).slice(0, relatedProducts.length);

  const selectMobileImage = (index: number) => {
    setSelectedImage(index);
    const target = mobileGalleryRef.current?.children[index] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    const draft = parseOrderForm(event, 'product-page', [orderItem]);
    if (draft) onPlaceOrder(draft);
  };
  const addProduct = () => {
    onAddToCart(orderItem);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  };

  const scrollToOrder = () => {
    setShowOrderForm(true);
    window.setTimeout(() => {
      const form = document.getElementById('product-order-details');
      const panel = document.getElementById('product-order-form');
      const target = form || panel;

      if (!target) return;

      const headerOffset = 84;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    }, 80);
  };

  useEffect(() => {
    if (window.sessionStorage.getItem('tm-open-product-order') !== '1') return;
    window.sessionStorage.removeItem('tm-open-product-order');
    window.setTimeout(scrollToOrder, 120);
  }, [product?.id]);

  return <div dir="rtl" className="min-h-screen w-full overflow-x-hidden bg-[#f7f5ef] pb-[calc(96px+env(safe-area-inset-bottom))] pt-16 text-[#17201b] md:pb-0">
    <SiteHeader cartCount={cartCount} onNavigate={navigate} onOpenCart={onOpenCart} onOpenSearch={onOpenSearch} />

      <main>
        <section className="bg-[#131921] text-white">
          <div className="mx-auto w-full max-w-[1180px] px-4 pb-5 pt-4 sm:px-6 lg:px-8 lg:pb-7">
            <div className="tm-breadcrumb text-xs sm:text-sm">
              <button type="button" onClick={() => goHome()} className="tm-breadcrumb-link">{'\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629'}</button>
              <span className="tm-breadcrumb-dot" />
              <button type="button" onClick={goCategory} className="tm-breadcrumb-link">{productCategory}</button>
              <span className="tm-breadcrumb-dot" />
              <span className="tm-breadcrumb-current min-w-0 truncate text-white">{productTitle}</span>
            </div>
          </div>
        </section>

        <section className="bg-[#131921] text-white">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1.12fr)_500px] lg:gap-7 lg:px-8 lg:pb-14">
            <div className="min-w-0">
              <div className="md:hidden">
                <div id="tm-product-mobile-gallery" ref={mobileGalleryRef} className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4" onScroll={event => {
                const itemWidth = event.currentTarget.scrollWidth / productGallery.length;
                const nextIndex = Math.min(productGallery.length - 1, Math.round(Math.abs(event.currentTarget.scrollLeft) / itemWidth));
                setSelectedImage(nextIndex);
              }}>
                  {productGallery.map((image, index) => (
                    <button key={image.src} type="button" onClick={() => selectMobileImage(index)} className="tm-press flex-none snap-center rounded-lg" aria-label={`عرض الصورة ${index + 1}`}>
                      <img src={image.src} alt={image.alt} className="tm-image h-[320px] w-[82vw] max-w-[360px] rounded-lg object-cover sm:h-[390px]" fetchPriority={index === 0 ? 'high' : undefined} loading={index === 0 ? 'eager' : 'lazy'} decoding={index === 0 ? 'sync' : 'async'} width="720" height="780" sizes="82vw" />
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 pb-1" aria-label="صور المنتج">
                  {productGallery.map((image, index) => <button key={image.src} type="button" aria-label={`الصورة ${index + 1}`} aria-controls="tm-product-mobile-gallery" aria-current={selectedImage === index ? 'true' : undefined} onClick={() => selectMobileImage(index)} className="tm-press tm-dot-hit tm-touch grid place-items-center rounded-full">
                    <span className={`tm-gallery-dot ${selectedImage === index ? 'is-active' : ''}`} />
                  </button>)}
                </div>
              </div>

              <div className="hidden grid-cols-[92px_minmax(0,1fr)] gap-4 md:grid">
                <div className="grid content-start gap-3">
                  {productGallery.map((image, index) => <button key={image.src} type="button" aria-label={`عرض الصورة ${index + 1}`} onClick={() => setSelectedImage(index)} className={`tm-press overflow-hidden rounded-lg border bg-white/10 p-1 ${selectedImage === index ? 'border-[#ffb84d]' : 'border-white/16'}`}>
                      <img src={image.src} alt={image.alt} className="tm-image h-[82px] w-full rounded-md object-cover" loading={index === 0 ? 'eager' : 'lazy'} decoding={index === 0 ? 'sync' : 'async'} width="184" height="164" sizes="92px" />
                    </button>)}
                </div>
                <img src={productGallery[selectedImage]?.src ?? productGallery[0].src} alt={productGallery[selectedImage]?.alt ?? productGallery[0].alt} className="tm-image h-[600px] w-full rounded-lg object-cover" fetchPriority="high" decoding="sync" width="1040" height="1200" sizes="58vw" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-extrabold text-white md:text-sm">
                <div className="rounded-md bg-white/10 px-3 py-3">تأكيد بالهاتف</div>
                <div className="rounded-md bg-white/10 px-3 py-3">دفع عند الباب</div>
                <div className="rounded-md bg-white/10 px-3 py-3">توصيل محلي</div>
              </div>

              <div className="mt-4 hidden max-w-[680px] gap-2 md:grid md:grid-cols-1">
                {[['التوصيل', 'داخل طنجة خلال 24 إلى 48 ساعة حسب المنطقة وتوقيت تأكيد الطلب.'], ['تأكيد الطلب', 'نتصل بك قبل الإرسال للتأكد من اللون، الكمية، والعنوان.'], ['الدفع', 'الدفع عند الاستلام فقط، بدون بطاقة بنكية وبدون دفع مسبق.'], ['الاستبدال', 'يمكن طلب الاستبدال خلال 7 أيام إذا وصل المنتج مختلفا أو به عيب.']].map(([title, copy]) => <details key={title} className="rounded-md border border-white/10 bg-white/[0.07] px-3 py-2.5 text-white/88 open:bg-white/[0.12]">
                    <summary className="cursor-pointer text-sm font-extrabold">{title}</summary>
                    <p className="tm-copy mt-2 text-xs font-semibold leading-6 text-white/62">{copy}</p>
                  </details>)}
              </div>

            </div>

            <aside id="product-order-form" className="tm-surface-strong rounded-lg bg-[#fffdf8] p-4 text-[#17201b] sm:p-5 lg:sticky lg:top-[88px] lg:self-start">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tm-ui-label rounded-md bg-[#fff3df] px-3 py-1.5 text-xs text-[#b45309]">{productBadge}</span>
                <span className="tm-ui-label rounded-md bg-[#fff1d5] px-3 py-1.5 text-xs text-[#9a5a00]">COD</span>
              </div>

              <h1 className="tm-page-title tm-product-title mt-3 break-words">
                {productTitle}
              </h1>
              <p className="tm-body-copy mt-2 text-sm text-[#5f6861] sm:text-base">
                {productDescription}
              </p>

              <div className="mt-4 flex items-center border-y border-[#dde6df] py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="tm-num tm-price text-3xl text-[#b45309] sm:text-[2.15rem]">{selectedVariantPriceLabel}</p>
                  <p className="tm-num text-sm font-semibold text-[#939a95] line-through">{productOldPrice}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {visibleVariantOptions.map(group => {
                  const groupVariants = getGroupVariants(group);
                  if (!groupVariants.length) return null;
                  const selectedId = selectedVariantIds[group.id] ?? groupVariants[0]?.id;
                  const isColorGroup = group.type === 'color' || groupVariants.some(variant => Boolean(getVariantColor(group, variant)));
                  const selectedVariant = groupVariants.find(variant => variant.id === selectedId) ?? groupVariants[0];
                  const selectedLabel = selectedVariant ? getVariantLabel(group, selectedVariant) : '';
                  return (
                    <div key={group.id} className={`tm-variant-group ${isColorGroup ? 'tm-variant-group-color' : ''}`}>
                      <div className="tm-variant-heading">
                        <p className="tm-variant-label">{group.label}</p>
                        {isColorGroup && selectedLabel ? <p className="tm-variant-selected-name">{selectedLabel}</p> : null}
                      </div>
                      <div className={`tm-variant-row ${isColorGroup ? 'tm-variant-row-colors' : ''}`}>
                        {groupVariants.map(variant => {
                          const variantColor = getVariantColor(group, variant);
                          const isSelected = selectedId === variant.id;
                          const isSoldOut = variant.stock <= 0;
                          const label = getVariantLabel(group, variant);
                          return <button key={variant.id} type="button" disabled={isSoldOut} aria-label={`${group.label}: ${label}`} title={label} aria-pressed={isSelected} onClick={() => setSelectedVariantIds(current => ({ ...current, [group.id]: variant.id }))} className={`tm-press tm-touch tm-ui-label tm-variant-choice ${isColorGroup ? 'tm-variant-swatch' : 'tm-variant-pill'} ${isSelected ? 'is-selected border-[#b45309] bg-[#fff3df] text-[#b45309]' : 'border-[#d9e1dc] bg-white text-[#17201b]'} ${isSoldOut ? 'cursor-not-allowed opacity-45' : ''}`}>
                            {isColorGroup ? <span className="tm-variant-color-dot" style={{ backgroundColor: variantColor || '#d9e1dc' }} /> : <span>{label}</span>}
                          </button>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <p className="tm-ui-label mb-2 text-sm">الكمية</p>
                <div className="flex w-fit items-center overflow-hidden rounded-md border border-[var(--tm-border)] bg-[var(--tm-surface-white)]">
                  <button className="tm-press tm-touch tm-button-label grid place-items-center text-lg" type="button" aria-label="تقليل الكمية" onClick={() => setQuantity(value => Math.max(1, value - 1))}>-</button>
                  <span className="tm-num tm-ui-label grid h-11 w-14 place-items-center border-x border-[var(--tm-border)] text-lg">{quantity}</span>
                  <button className="tm-press tm-touch tm-button-label grid place-items-center text-lg" type="button" aria-label="زيادة الكمية" onClick={() => setQuantity(value => value + 1)}>+</button>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <button className="tm-press tm-order-cta tm-button-primary px-5 text-base" type="button" onClick={scrollToOrder}>
                  اطلب الآن
                </button>
                <button className={`tm-press tm-secondary-label relative overflow-hidden px-5 text-sm ${added ? 'tm-add-button-added tm-button-dark' : 'tm-button-secondary'}`} type="button" onClick={addProduct} aria-live="polite" aria-label={added ? `تمت إضافة ${productTitle} للسلة` : `أضف ${productTitle} للسلة`}>
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {added ? <Check className="h-4 w-4" aria-hidden="true" strokeWidth={3} /> : null}
                    {added ? 'تمت الإضافة' : 'أضف للسلة'}
                  </span>
                  {added ? <span className="tm-add-spark" aria-hidden="true" /> : null}
                  {added ? <span className="tm-add-fly" aria-hidden="true" /> : null}
                </button>
              </div>

              {showOrderForm ? (
                <form id="product-order-details" className="tm-panel-white mt-4 grid gap-3 p-3" onSubmit={submitOrder}>
                  <div>
                    <p className="tm-modal-title">معلومات الطلب</p>
                    <p className="tm-small-copy tm-text-muted mt-1">نؤكد التفاصيل على واتساب قبل الإرسال. لا يوجد دفع مسبق.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <label className="grid gap-1" htmlFor="product-order-name">
                      <span className="tm-field-label">الاسم الكامل *</span>
                      <input id="product-order-name" required name="name" className="tm-field" autoComplete="name" />
                    </label>
                    <label className="grid gap-1" htmlFor="product-order-phone">
                      <span className="tm-field-label">رقم الهاتف *</span>
                      <input id="product-order-phone" required name="phone" className="tm-field" inputMode="tel" autoComplete="tel" />
                    </label>
                  </div>
                  <label className="grid gap-1" htmlFor="product-order-address">
                    <span className="tm-field-label">الحي أو العنوان داخل طنجة *</span>
                    <input id="product-order-address" required name="address" className="tm-field" autoComplete="street-address" />
                    <span className="tm-field-help">مثال: الحي، الشارع، أو نقطة قريبة يعرفها المندوب.</span>
                  </label>
                  <button className="tm-press tm-button-primary px-5 text-base" type="submit">إرسال الطلب عبر واتساب</button>
                </form>
              ) : (
                <div className="tm-body-copy tm-panel-white mt-3 px-3 py-2.5 text-sm leading-7 text-[var(--tm-ink-soft)]">
                  اختر {variantPickerLabel} والكمية، ثم اضغط اطلب الآن لملء بياناتك. سنراجع الطلب معك على واتساب قبل التوصيل.
                </div>
              )}

              <div className="mt-3 grid gap-2 text-sm font-bold text-[var(--tm-ink-soft)]">
                <div className="flex items-center justify-between rounded-md bg-[var(--tm-surface-tint)] px-3 py-2.5">
                  <span>موعد التأكيد</span>
                  <span className="tm-price-text">خلال 15 دقيقة</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-[var(--tm-surface-tint)] px-3 py-2.5">
                  <span>التوصيل داخل طنجة</span>
                  <span className="tm-price-text">24 إلى 48 ساعة</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-[#f7f5ef] py-10 sm:py-14 lg:py-16">
          <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 sm:px-6 lg:px-8">
            <details className="tm-surface rounded-lg bg-white p-4 open:bg-[#fffdf8] sm:p-5 lg:p-7" open>
              <summary className="cursor-pointer font-heading text-xl font-black sm:text-2xl">تفاصيل المنتج</summary>
              {productDetails.length ? <div className="mt-6 grid gap-4 lg:gap-6">
                {productDetails.map((detail, index) => <article key={detail.id} dir="ltr" className="tm-panel-white grid gap-4 overflow-hidden rounded-lg bg-[#f8fafc] lg:min-h-[320px] lg:grid-cols-2 lg:items-stretch lg:gap-6">
                  <div dir="rtl" className={`order-1 flex flex-col justify-center p-5 lg:p-7 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                    <ProductDetailTitle detail={detail} />
                    <ProductDetailRichText detail={detail} />
                  </div>
                  <figure className={`order-2 min-h-[220px] overflow-hidden ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                    <ProductDetailMedia detail={detail} src={detail.mediaUrl || productGallery[(index + 1) % productGallery.length]?.src || productGallery[0].src} className="tm-image h-full min-h-[220px] w-full object-cover lg:min-h-[320px]" />
                  </figure>
                </article>)}
              </div> : null}
              <div className={productDetails.length ? 'hidden' : 'lg:hidden'}>
                <p className="tm-body-copy tm-text-muted mt-3 max-w-[860px] text-sm sm:text-base">
                  {productDescription}
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <figure className="tm-panel-white overflow-hidden rounded-lg bg-[#f8fafc]">
                    <img src={(productGallery[1] ?? productGallery[0]).src} alt={(productGallery[1] ?? productGallery[0]).alt} className="tm-image h-[220px] w-full object-cover md:h-[260px]" loading="lazy" decoding="async" width="640" height="520" sizes="(max-width: 768px) 100vw, 33vw" />
                    <figcaption className="tm-compact-label px-4 py-3 text-sm text-[#17201b]">صور تفصيلية للمنتج</figcaption>
                  </figure>
                  <figure className="tm-panel-white overflow-hidden rounded-lg bg-[#f8fafc]">
                    <img src={(productGallery[2] ?? productGallery[0]).src} alt={(productGallery[2] ?? productGallery[0]).alt} className="tm-image h-[220px] w-full object-cover md:h-[260px]" loading="lazy" decoding="async" width="640" height="520" sizes="(max-width: 768px) 100vw, 33vw" />
                    <figcaption className="tm-compact-label px-4 py-3 text-sm text-[#17201b]">الخامة والحزام من قرب</figcaption>
                  </figure>
                  <button type="button" className="tm-press relative min-h-[260px] overflow-hidden rounded-lg bg-[#131921] text-right text-white" aria-label="عرض فيديو طريقة استعمال المنتج">
                    <img src={(productGallery[3] ?? productGallery[0]).src} alt="معاينة فيديو شرح المنتج" className="tm-image absolute inset-0 h-full w-full object-cover opacity-45" loading="lazy" decoding="async" width="640" height="520" sizes="(max-width: 768px) 100vw, 33vw" />
                    <span className="absolute inset-0 bg-[#131921]/35" />
                    <span className="relative z-10 flex h-full min-h-[260px] flex-col justify-end p-5">
                      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white text-[#131921]">
                        <span className="mr-1 h-0 w-0 border-y-[9px] border-r-[15px] border-y-transparent border-r-[#131921]" />
                      </span>
                      <span className="tm-heading font-heading text-2xl font-black">فيديو طريقة الاستعمال</span>
                      <span className="tm-copy mt-2 text-sm font-semibold leading-7 text-white/78">شاهد التشغيل، الحجم على اليد، والتنبيهات اليومية قبل تأكيد الطلب.</span>
                    </span>
                  </button>
                </div>
              </div>

              <div className={productDetails.length ? 'hidden' : 'mt-7 hidden gap-5 lg:grid'}>
                <article dir="ltr" className="grid min-h-[320px] grid-cols-2 items-stretch gap-6">
                  <figure className="tm-panel-white overflow-hidden rounded-lg bg-[#f8fafc]">
                    <img src={(productGallery[1] ?? productGallery[0]).src} alt={(productGallery[1] ?? productGallery[0]).alt} className="tm-image h-full min-h-[320px] w-full object-cover" loading="lazy" decoding="async" width="900" height="640" sizes="50vw" />
                  </figure>
                  <div dir="rtl" className="flex flex-col justify-center rounded-lg bg-[#f8fafc] p-7">
                    <p className="tm-kicker tm-price-text">استعمال يومي واضح</p>
                    <h3 className="tm-heading mt-2 font-heading text-3xl font-black">شاشة وتنبيهات تساعدك طوال اليوم</h3>
                    <p className="tm-body-copy tm-text-muted mt-3 text-base">
                      شاشة واضحة، تنبيهات المكالمات والرسائل، وقياس سريع للخطوات والنشاط. مناسبة للاستعمال في الخدمة، الرياضة، والتنقل داخل المدينة بدون تعقيد.
                    </p>
                  </div>
                </article>

                <article dir="ltr" className="grid min-h-[320px] grid-cols-2 items-stretch gap-6">
                  <div dir="rtl" className="flex flex-col justify-center rounded-lg bg-[#fff7e6] p-7">
                    <p className="tm-kicker text-[#9a5a00]">راحة في اللبس</p>
                    <h3 className="tm-heading mt-2 font-heading text-3xl font-black">حزام خفيف وخامة مناسبة للحركة</h3>
                    <p className="tm-body-copy tm-text-muted mt-3 text-base">
                      الحزام مريح للاستعمال الطويل، والخامة مناسبة للاستعمال اليومي. التفاصيل القريبة تساعد الزبون يرى الحجم، الملمس، وطريقة الثبات قبل تأكيد الطلب.
                    </p>
                  </div>
                  <figure className="tm-panel-white overflow-hidden rounded-lg bg-[#f8fafc]">
                    <img src={(productGallery[2] ?? productGallery[0]).src} alt={(productGallery[2] ?? productGallery[0]).alt} className="tm-image h-full min-h-[320px] w-full object-cover" loading="lazy" decoding="async" width="900" height="640" sizes="50vw" />
                  </figure>
                </article>

                <article dir="ltr" className="grid min-h-[320px] grid-cols-2 items-stretch gap-6">
                  <button dir="rtl" type="button" className="tm-press relative overflow-hidden rounded-lg bg-[#131921] text-right text-white" aria-label="عرض فيديو طريقة استعمال المنتج">
                    <img src={(productGallery[3] ?? productGallery[0]).src} alt="معاينة فيديو شرح المنتج" className="tm-image absolute inset-0 h-full w-full object-cover opacity-45" loading="lazy" decoding="async" width="900" height="640" sizes="50vw" />
                    <span className="absolute inset-0 bg-[#131921]/35" />
                    <span className="relative z-10 flex h-full min-h-[320px] flex-col justify-end p-7">
                      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white text-[#131921]">
                        <span className="mr-1 h-0 w-0 border-y-[9px] border-r-[15px] border-y-transparent border-r-[#131921]" />
                      </span>
                      <span className="tm-heading font-heading text-3xl font-black">فيديو طريقة الاستعمال</span>
                    </span>
                  </button>
                  <div dir="rtl" className="flex flex-col justify-center rounded-lg bg-[#fff7ed] p-7">
                    <p className="tm-kicker tm-price-text">قبل تأكيد الطلب</p>
                    <h3 className="tm-heading mt-2 font-heading text-3xl font-black">مساحة جاهزة لفيديو أو شرح مصور</h3>
                    <p className="tm-body-copy tm-text-muted mt-3 text-base">
                      يمكن استعمال هذه المساحة لعرض فيديو قصير، خطوات التشغيل، أو صور تفصيلية إضافية. الهدف أن يحصل الزبون على كل المعلومات المهمة دون الابتعاد عن مسار الطلب.
                    </p>
                  </div>
                </article>
              </div>
            </details>

            <details className="tm-surface rounded-lg bg-white p-4 open:bg-[#fffdf8] sm:p-5 lg:p-6" open>
              <summary className="cursor-pointer font-heading text-xl font-black sm:text-2xl">المواصفات</summary>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {productSpecs.map(([label, value]) => <div key={label} className="rounded-md bg-[#f8fafc] px-4 py-3 text-sm">
                    <span className="block font-extrabold text-[#17201b]">{label}</span>
                    <span className="mt-1 block font-bold leading-6 text-[#5f6861]">{value}</span>
                  </div>)}
              </div>
            </details>

            {showReviews ? <section className="tm-surface rounded-lg bg-white p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="tm-kicker text-[#f59e0b]">قبل الطلب</p>
                </div>
                <div className="w-fit rounded-md bg-[#17201b] px-4 py-3 text-center text-white">
                  <p className="font-heading text-xl font-black">لا دفع مسبق</p>
                  <p className="text-xs font-bold text-white/70">القرار النهائي بعد التأكيد</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {['اسألنا على اللون أو الكمية قبل الإرسال، ونؤكد معك التفاصيل على واتساب.', 'إذا كان المنتج مختلفا أو فيه عيب واضح، يمكن مراجعة الاستبدال حسب الحالة.'].map((note, index) => <article key={note} className="tm-panel-white rounded-md bg-[#fffdf8] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-heading text-lg font-black">{index === 0 ? 'تأكيد التفاصيل' : 'الاستبدال'}</p>
                      <p className="text-sm font-extrabold text-[#b45309]">مهم</p>
                    </div>
                    <p className="tm-copy text-sm font-semibold leading-7 text-[#5f6861]">{note}</p>
                    <p className="mt-3 text-xs font-bold text-[#8a938d]">نؤكدها معك قبل التوصيل</p>
                  </article>)}
              </div>
            </section> : null}

            {showPolicies ? <aside className="tm-surface rounded-lg bg-[#131921] p-4 text-white sm:p-5">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {['لا تحتاج بطاقة بنكية', 'نتصل بك لتأكيد التفاصيل', 'الدفع فقط عند الاستلام', 'إمكانية الاستبدال حسب الحالة'].map(item => <div key={item} className="flex min-h-[54px] items-center gap-3 rounded-md bg-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ffb84d]" />
                    <span className="text-sm font-bold">{item}</span>
                  </div>)}
              </div>
            </aside> : null}
          </div>
        </section>

        {showRelated ? <section className="bg-white py-6 sm:py-8 lg:py-10">
          <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="tm-kicker text-[#b45309]">منتجات مناسبة معها</p>
              </div>
              <button className="tm-press hidden min-h-[44px] rounded-md bg-[#17201b] px-5 font-extrabold text-white sm:block" type="button">
                عرض الكل
              </button>
            </div>

            <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
              {relatedItems.map((item) => <div key={item.id} className="w-[72vw] flex-none snap-start md:w-auto">
                <ProductCard
                  product={item}
                  compact
                  onOpenProduct={onOpenProduct || ((slug) => { window.location.hash = `#/product/${slug}`; })}
                  onAddToCart={onAddToCart}
                  onOrderProduct={onOrderProduct || ((cartItem) => onAddToCart(cartItem))}
                />
              </div>)}
              {false && relatedProducts.map((product, index) => <article key={product.title} className="tm-lift tm-surface w-[72vw] flex-none snap-start overflow-hidden rounded-lg bg-[#fffdf8] md:w-auto">
                  <img src={product.image} alt={product.title} className="tm-image h-[170px] w-full object-cover md:h-[230px]" loading="lazy" decoding="async" width="640" height="640" sizes="(max-width: 768px) 72vw, 33vw" />
                  <div className="p-4">
                    <h3 className="tm-product-card-title line-clamp-2 min-h-[48px] text-xl">{product.title}</h3>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="tm-num font-heading text-2xl font-black text-[#b45309]">{product.price}</p>
                      <button className="tm-press min-h-[44px] rounded-md bg-[#ff9900] px-4 text-sm font-extrabold text-[#131921]" type="button" onClick={() => { const item = relatedItems[index]; if (item) onAddToCart({ id: item.id, slug: item.slug, title: item.title, price: item.price, priceLabel: item.priceLabel, quantity: 1, image: item.image }); }}>أضف</button>
                    </div>
                  </div>
                </article>)}
            </div>
          </div>
        </section> : null}
      </main>

      <SiteFooter onNavigate={(nextRoute) => { window.location.hash = nextRoute; }} />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 bg-transparent px-4 py-3 md:hidden" style={{
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
    }}>
        <div className="tm-surface pointer-events-auto mx-auto flex max-w-[520px] items-center gap-3 rounded-lg bg-white/95 p-2 shadow-[0_18px_48px_-22px_rgba(23,32,27,0.65)]">
          <div className="min-w-0 flex-1">
            <p className="tm-num font-heading text-xl font-black text-[#b45309]">{selectedVariantPriceLabel}</p>
            <p className="truncate text-xs font-bold text-[#68736c]">الدفع عند الاستلام داخل طنجة</p>
            {selectedVariantLabel ? <p className="mt-0.5 truncate text-[11px] font-extrabold text-[#17201b]">{selectedVariantLabel}</p> : null}
          </div>
          <button className="tm-press tm-order-cta min-h-[50px] overflow-hidden rounded-md bg-[#ff9900] px-5 text-sm font-black text-[#131921] shadow-[0_16px_34px_-18px_rgba(255,153,0,0.95)]" type="button" onClick={scrollToOrder}>
            اطلب الآن
          </button>
        </div>
      </div>
    </div>;
};
