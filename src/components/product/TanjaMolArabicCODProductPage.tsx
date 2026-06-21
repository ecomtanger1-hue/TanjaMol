import { type FormEvent, useEffect, useRef, useState } from 'react';
import { categories as defaultCategories, categoryRoute, defaultProductDetailsIntro, parseOrderForm, type CartItem, type Category, type OrderDraft, type Product, type ProductVariant } from '../../storefrontRuntime';
import { ProductDetailMedia, ProductDetailRichText, ProductDetailTitle } from './ProductDetailRichText';
import { ProductCard } from '../storefront/ProductCard';
import { SiteFooter, SiteHeader } from '../storefront/StorefrontPages';
import { navigateToRoute } from '../../lib/routing';
import { trackInitiateCheckout } from '../../lib/metaPixel';
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
  onPlaceOrder: (draft: OrderDraft) => Promise<unknown>;
  isOrderSubmitting?: boolean;
  product?: Product;
  products?: Product[];
  categories: Category[];
};

export const TanjaMolArabicCODProductPage = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onAddToCart,
  onOrderProduct,
  onOpenProduct,
  onPlaceOrder,
  isOrderSubmitting = false,
  product,
  products = [],
  categories,
}: ProductPageProps) => {
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStickyOrderBar, setShowStickyOrderBar] = useState(false);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const productTitle = product?.title ?? 'ساعة ذكية مقاومة للماء ببطارية طويلة';
  const productCategory = product?.category ?? 'الإلكترونيات';
  const productDescription = product?.description ?? 'تتبع النشاط والمكالمات والتنبيهات اليومية، مناسبة للاستعمال في الخدمة، الرياضة، والتنقل داخل المدينة.';
  const productPriceLabel = product?.priceLabel ?? '249 درهم';
  const productOldPrice = product?.oldPrice?.trim() ?? '360 درهم';
  const productBadge = product?.badge ?? 'متوفر الآن';
  const productGallery = (product?.gallery?.length ? product.gallery : gallery.map(image => image.src)).map((src, index) => ({
    src,
    alt: index === 0 ? productTitle : `${productTitle} - ${index + 1}`,
  }));
  const productSpecs = product?.specs?.length ? product.specs : specs;
  const productDetails = product?.details?.length ? product.details : [];
  const productDetailsIntro = {
    ...defaultProductDetailsIntro,
    ...(product?.detailsIntro || {}),
    highlights: product?.detailsIntro
      ? (product.detailsIntro.highlights || []).filter(Boolean)
      : defaultProductDetailsIntro.highlights,
  };
  const showProductDetailsIntro = productDetails.length > 0 && !productDetailsIntro.hidden;
  const showReviews = product?.reviewsEnabled ?? true;
  const productRating = product?.rating ?? 4.8;
  const productReviewCount = product?.reviewCount ?? 127;
  const showRelated = product?.showRelated ?? true;
  const showPolicies = product?.showPolicies ?? true;
  const categoryList = categories.length ? categories : defaultCategories;
  const activeCategory = categoryList.find(category => category.title === productCategory || productCategory.includes(category.title.split(' ')[0]));
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
  const enabledProductVariants = product?.variants?.filter(variant => variant.enabled) ?? [];
  const hasRealVariants = Boolean(product && product.variantsEnabled !== false && variantOptions.length && enabledProductVariants.length);
  const visibleVariantOptions = hasRealVariants ? variantOptions : product ? [] : fallbackVariantOptions;
  const productVariants = hasRealVariants ? enabledProductVariants : product ? [] : fallbackVariants;
  const activeVariantGroups = visibleVariantOptions.map(group => ({
    ...group,
    values: group.values.filter(value => value.label.trim()),
  })).filter(group => group.values.length);
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
  const hasCombinationVariants = productVariants.some(variant =>
    activeVariantGroups.every(group => Boolean(variant.optionValues?.[group.label]))
  );
  const getOptionValueLabel = (value: typeof activeVariantGroups[number]['values'][number]) => value.label.trim();
  const variantMatchesValue = (
    variant: ProductVariant,
    group: typeof activeVariantGroups[number],
    value: typeof activeVariantGroups[number]['values'][number],
  ) => {
    const label = getOptionValueLabel(value);
    return variant.optionValues?.[group.label] === label || variant.name === label;
  };
  const getValueVariant = (
    group: typeof activeVariantGroups[number],
    value: typeof activeVariantGroups[number]['values'][number] | undefined,
  ) => {
    if (!value) return undefined;
    return productVariants.find(variant => variantMatchesValue(variant, group, value));
  };
  const getSelectedValue = (group: typeof activeVariantGroups[number]) => {
    const selectedId = selectedVariantIds[group.id];
    return group.values.find(value => value.id === selectedId) ?? group.values.find(value => {
      const variant = getValueVariant(group, value);
      return !variant || variant.stock > 0;
    }) ?? group.values[0];
  };
  const resolvedSelectedValues = activeVariantGroups.map(group => ({
    group,
    value: getSelectedValue(group),
  })).filter(item => Boolean(item.value));
  const getSelectionLabels = (
    overrideGroup?: typeof activeVariantGroups[number],
    overrideValue?: typeof activeVariantGroups[number]['values'][number],
  ) => new Map(resolvedSelectedValues.map(({ group, value }) => [
    group.label,
    overrideGroup?.id === group.id && overrideValue ? getOptionValueLabel(overrideValue) : getOptionValueLabel(value),
  ]));
  const findCombinationVariant = (
    overrideGroup?: typeof activeVariantGroups[number],
    overrideValue?: typeof activeVariantGroups[number]['values'][number],
  ) => {
    const labels = getSelectionLabels(overrideGroup, overrideValue);
    return productVariants.find(variant =>
      activeVariantGroups.every(group => variant.optionValues?.[group.label] === labels.get(group.label))
    );
  };
  const isResolvedValueAvailable = (
    group: typeof activeVariantGroups[number],
    value: typeof activeVariantGroups[number]['values'][number],
  ) => {
    if (hasCombinationVariants) return Boolean(findCombinationVariant(group, value)?.stock);
    const variant = getValueVariant(group, value);
    return !variant || variant.stock > 0;
  };
  const resolvedCombinationVariant = hasCombinationVariants ? findCombinationVariant() : undefined;
  const resolvedValueVariants = resolvedSelectedValues.map(({ group, value }) => getValueVariant(group, value)).filter(Boolean) as ProductVariant[];
  const resolvedVariantLabel = resolvedSelectedValues.map(({ group, value }) => `${group.label}: ${getOptionValueLabel(value)}`).filter(Boolean).join('، ');
  const resolvedPriceVariant = resolvedCombinationVariant ?? resolvedValueVariants.find(variant => variant.priceLabel && variant.priceLabel !== productPriceLabel) ?? resolvedValueVariants[0];
  const resolvedImageVariant = resolvedCombinationVariant?.image ? resolvedCombinationVariant : resolvedValueVariants.find(variant => variant.image);
  const resolvedVariantPriceLabel = resolvedPriceVariant?.priceLabel || productPriceLabel;
  const resolvedVariantPrice = getPriceFromLabel(resolvedVariantPriceLabel, product?.price ?? 249);
  const resolvedVariantStock = hasRealVariants
    ? resolvedCombinationVariant?.stock ?? (resolvedValueVariants.length ? Math.min(...resolvedValueVariants.map(variant => variant.stock)) : product?.stock ?? 0)
    : product?.stock ?? 99;
  const isResolvedSoldOut = resolvedVariantStock <= 0;
  const getResolvedValueColor = (
    group: typeof activeVariantGroups[number],
    value: typeof activeVariantGroups[number]['values'][number],
  ) => {
    if (group.type !== 'color' && !group.label.includes('\u0644\u0648\u0646')) return undefined;
    const label = getOptionValueLabel(value);
    const variant = getValueVariant(group, value);
    return value.color ?? colors.find(color => color.name === variant?.name || color.name === label)?.value;
  };

  useEffect(() => {
    const nextSelected: Record<string, string> = {};
    activeVariantGroups.forEach(group => {
      const firstAvailable = group.values.find(value => isResolvedValueAvailable(group, value)) ?? group.values[0];
      if (firstAvailable) nextSelected[group.id] = firstAvailable.id;
    });
    setSelectedVariantIds(nextSelected);
    setSelectedImage(0);
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (resolvedVariantStock > 0 && quantity > resolvedVariantStock) {
      setQuantity(resolvedVariantStock);
    }
  }, [quantity, resolvedVariantStock]);

  useEffect(() => {
    if (!resolvedImageVariant?.image) return;
    const nextImageIndex = productGallery.findIndex(image => image.src === resolvedImageVariant.image);
    if (nextImageIndex >= 0) setSelectedImage(nextImageIndex);
  }, [resolvedImageVariant?.image, product?.id]);

  const goHome = (sectionId?: string) => {
    navigateToRoute('#/');
    if (sectionId) {
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };
  const navigate = (route: string) => {
    navigateToRoute(route);
  };

  const goCategory = () => {
    navigateToRoute(activeCategory ? categoryRoute(activeCategory.id) : '#/');
  };

  const orderItem: CartItem = {
    id: product?.id ?? 'smart-watch',
    slug: product?.slug ?? 'smart-watch',
    title: productTitle,
    price: resolvedVariantPrice,
    priceLabel: resolvedVariantPriceLabel,
    quantity,
    image: resolvedImageVariant?.image ?? product?.image ?? productGallery[0].src,
    variant: resolvedVariantLabel,
  };

  const relatedItems = products.filter(item => item.id !== orderItem.id).slice(0, relatedProducts.length);

  const selectMobileImage = (index: number) => {
    setSelectedImage(index);
    const target = mobileGalleryRef.current?.children[index] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    const draft = parseOrderForm(event, 'product-page', [orderItem]);
    if (draft) {
      trackInitiateCheckout([orderItem]);
      void onPlaceOrder(draft);
    }
  };

  const scrollToOrderForm = () => {
    trackInitiateCheckout([orderItem]);
    const target = document.getElementById('product-order-form');
    if (!target) return;

    const headerOffset = 84;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  };

  useEffect(() => {
    const updateStickyOrderBar = () => {
      const orderForm = document.getElementById('product-order-form');
      const description = document.getElementById('product-description-section');
      if (!orderForm || !description) {
        setShowStickyOrderBar(false);
        return;
      }

      const formIsPast = orderForm.getBoundingClientRect().bottom <= 0;
      const descriptionHasStarted = description.getBoundingClientRect().top <= window.innerHeight * 0.85;
      setShowStickyOrderBar(formIsPast && descriptionHasStarted);
    };

    updateStickyOrderBar();
    window.addEventListener('scroll', updateStickyOrderBar, { passive: true });
    window.addEventListener('resize', updateStickyOrderBar);

    return () => {
      window.removeEventListener('scroll', updateStickyOrderBar);
      window.removeEventListener('resize', updateStickyOrderBar);
    };
  }, [product?.id]);

  return <div dir="rtl" className={`min-h-screen w-full overflow-x-hidden bg-[#f7f5ef] pt-16 text-[#17201b] ${showStickyOrderBar ? 'pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-0' : ''}`}>
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
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-3 px-4 pb-8 sm:px-6 md:gap-5 lg:grid-cols-[minmax(0,1.12fr)_500px] lg:gap-7 lg:px-8 lg:pb-14">
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
                <img src={productGallery[selectedImage]?.src ?? productGallery[0].src} alt={productGallery[selectedImage]?.alt ?? productGallery[0].alt} className="tm-image h-[600px] w-full rounded-lg object-cover" fetchPriority="high" loading="eager" decoding="sync" width="1040" height="1200" sizes="58vw" />
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
                  <p className="tm-num tm-price text-3xl text-[#b45309] sm:text-[2.15rem]">{resolvedVariantPriceLabel}</p>
                  {productOldPrice ? <p className="tm-num text-sm font-semibold text-[#939a95] line-through">{productOldPrice}</p> : null}
                </div>
                {showReviews ? <div className="mr-auto text-left">
                  <p className="tm-num text-sm font-black text-[#17201b]">{productRating}/5</p>
                  <p className="text-xs font-bold text-[#68736c]">{productReviewCount} {'\u062a\u0642\u064a\u064a\u0645'}</p>
                </div> : null}
              </div>

              <div className="mt-4 grid gap-3">
                {activeVariantGroups.map(group => {
                  const selectedId = selectedVariantIds[group.id] ?? group.values[0]?.id;
                  const isColorGroup = group.type === 'color' || group.values.some(value => Boolean(getResolvedValueColor(group, value)));
                  const selectedValue = group.values.find(value => value.id === selectedId) ?? group.values[0];
                  const selectedLabel = selectedValue ? getOptionValueLabel(selectedValue) : '';
                  return (
                    <div key={group.id} className={`tm-variant-group ${isColorGroup ? 'tm-variant-group-color' : ''}`}>
                      <div className="tm-variant-heading">
                        <p className="tm-variant-label">{group.label}</p>
                        {isColorGroup && selectedLabel ? <p className="tm-variant-selected-name">{selectedLabel}</p> : null}
                      </div>
                      <div className={`tm-variant-row ${isColorGroup ? 'tm-variant-row-colors' : ''}`}>
                        {group.values.map(value => {
                          const variantColor = getResolvedValueColor(group, value);
                          const isSelected = selectedId === value.id;
                          const isSoldOut = !isResolvedValueAvailable(group, value);
                          const label = getOptionValueLabel(value);
                          return <button key={value.id} type="button" disabled={isSoldOut} aria-label={`${group.label}: ${label}`} title={label} aria-pressed={isSelected} onClick={() => setSelectedVariantIds(current => ({ ...current, [group.id]: value.id }))} className={`tm-press tm-touch tm-ui-label tm-variant-choice ${isColorGroup ? 'tm-variant-swatch' : 'tm-variant-pill'} ${isSelected ? 'is-selected border-[#b45309] bg-[#fff3df] text-[#b45309]' : 'border-[#d9e1dc] bg-white text-[#17201b]'} ${isSoldOut ? 'cursor-not-allowed opacity-45' : ''}`}>
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
                  <button className="tm-press tm-touch tm-button-label grid place-items-center text-lg" type="button" aria-label="زيادة الكمية" disabled={isResolvedSoldOut || quantity >= resolvedVariantStock} onClick={() => setQuantity(value => Math.min(resolvedVariantStock, value + 1))}>+</button>
                </div>
              </div>

              <form id="product-order-details" className="tm-panel-white mt-4 grid scroll-mt-24 gap-3 p-3" onSubmit={submitOrder}>
                  <div>
                    <p className="tm-modal-title">معلومات الطلب</p>
                    <p className="tm-small-copy tm-text-muted mt-1">نؤكد التفاصيل بالاتصال أو واتساب قبل الإرسال. لا يوجد دفع مسبق.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <label className="grid gap-1" htmlFor="product-order-name">
                      <span className="tm-field-label">الاسم الكامل *</span>
                      <input id="product-order-name" required name="name" className="tm-field" autoComplete="name" enterKeyHint="next" />
                    </label>
                    <label className="grid gap-1" htmlFor="product-order-phone">
                      <span className="tm-field-label">رقم الهاتف *</span>
                      <input id="product-order-phone" required name="phone" className="tm-field" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" />
                    </label>
                  </div>
                  <label className="grid gap-1" htmlFor="product-order-address">
                    <span className="tm-field-label">العنوان</span>
                    <input id="product-order-address" required name="address" className="tm-field" autoComplete="address-line1" enterKeyHint="send" />
                  </label>
                  <button className="tm-press tm-button-primary min-h-[52px] px-5 text-base disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isResolvedSoldOut || isOrderSubmitting}>
                    {isResolvedSoldOut ? '\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631 \u062d\u0627\u0644\u064a\u0627' : isOrderSubmitting ? '\u062c\u0627\u0631\u064a \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628...' : '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628'}
                  </button>
              </form>

              <div className="mt-3 grid gap-2 text-sm font-bold text-[var(--tm-ink-soft)]">
                <div className="flex items-center justify-between rounded-md bg-[var(--tm-surface-tint)] px-3 py-2.5">
                  <span>التوصيل داخل طنجة</span>
                  <span className="tm-price-text">24 إلى 48 ساعة</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="product-description-section" className="bg-[#f7f5ef] py-9 sm:py-12 lg:py-16">
          <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 sm:px-6 lg:px-10 xl:px-12">
            {productDetails.length ? <section className="grid gap-6 lg:gap-10">
              {showProductDetailsIntro ? <>
                <div className="mx-auto grid max-w-[760px] gap-2 text-center">
                  <p className="tm-kicker text-[#b45309]">{productDetailsIntro.kicker}</p>
                  <h2 className="tm-heading font-heading text-3xl font-black leading-tight text-[var(--tm-ink)] sm:text-4xl lg:text-5xl">{productDetailsIntro.title}</h2>
                  <p className="tm-copy mx-auto max-w-[620px] text-sm font-semibold leading-7 text-[var(--tm-muted)] sm:text-base lg:text-lg">
                    {productDetailsIntro.description}
                  </p>
                </div>

                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
                  {productDetailsIntro.highlights.map(item => (
                    <span key={item} className="shrink-0 rounded-full bg-white/75 px-4 py-2 text-xs font-black text-[var(--tm-ink-soft)] shadow-[0_12px_34px_-24px_rgba(23,32,27,0.45)] ring-1 ring-black/[0.04] backdrop-blur sm:text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </> : null}

              <div className="grid w-full gap-7 sm:gap-9 lg:gap-12">
                {productDetails.map((detail, index) => {
                  const reverse = detail.reverse ?? index % 2 === 1;
                  const desktopColumns = reverse
                    ? 'lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] xl:grid-cols-[minmax(0,1fr)_minmax(460px,560px)]'
                    : 'lg:grid-cols-[minmax(420px,520px)_minmax(0,1fr)] xl:grid-cols-[minmax(460px,560px)_minmax(0,1fr)]';
                  return <article key={detail.id} dir="ltr" className={`grid gap-4 lg:min-h-[280px] ${desktopColumns} lg:items-center lg:gap-10 xl:min-h-[320px] xl:gap-12`}>
                    <div dir="rtl" className={`order-2 flex min-w-0 flex-col justify-center px-1 sm:px-2 lg:w-full lg:px-0 ${reverse ? 'lg:order-1 lg:justify-self-end' : 'lg:order-2 lg:justify-self-start'}`}>
                      <div className="min-w-0 lg:w-full lg:max-w-[780px]">
                        {detail.title?.trim() ? <ProductDetailTitle detail={detail} /> : null}
                        <ProductDetailRichText detail={detail} />
                      </div>
                    </div>
                    <figure className={`relative order-1 h-auto min-h-[260px] overflow-hidden rounded-[22px] bg-white shadow-[0_28px_70px_-40px_rgba(23,32,27,0.55)] outline outline-1 outline-[rgba(0,0,0,0.1)] sm:min-h-[340px] lg:h-[280px] lg:min-h-0 lg:rounded-[28px] xl:h-[320px] ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
                      <ProductDetailMedia detail={detail} src={detail.mediaUrl || productGallery[(index + 1) % productGallery.length]?.src || productGallery[0].src} className="h-full min-h-[260px] w-full object-cover sm:min-h-[340px] lg:min-h-0 xl:min-h-0" />
                      <span className="tm-num absolute left-4 top-4 grid h-10 min-w-10 place-items-center rounded-full bg-[#131921]/92 px-3 text-sm font-black text-white shadow-[0_12px_30px_-18px_rgba(19,25,33,0.8)] backdrop-blur">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </figure>
                  </article>;
                })}
              </div>
            </section> : null}

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
                  onOpenProduct={onOpenProduct || ((slug) => navigateToRoute(`#/product/${slug}`))}
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

      <SiteFooter categories={categoryList} onNavigate={navigateToRoute} />

      {showStickyOrderBar ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 bg-transparent px-3 py-3 md:hidden" style={{
          paddingBottom: 'max(14px, env(safe-area-inset-bottom))'
        }}>
          <div className="tm-mobile-order-bar pointer-events-auto mx-auto flex max-w-[520px] items-center gap-3 rounded-lg p-2">
            <div className="min-w-0 flex-1">
              <p className="tm-num font-heading text-xl font-black text-[#b45309]">{resolvedVariantPriceLabel}</p>
              <p className="truncate text-[11px] font-extrabold text-[#68736c]">{'\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645'}</p>
            </div>
            <button className="tm-press tm-order-cta min-h-[52px] min-w-[138px] overflow-hidden rounded-md bg-[#ff9900] px-5 text-sm font-black text-[#131921] shadow-[0_16px_34px_-18px_rgba(255,153,0,0.95)] disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={isResolvedSoldOut} onClick={scrollToOrderForm}>
              {isResolvedSoldOut ? '\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631' : '\u0627\u0637\u0644\u0628 \u0627\u0644\u0622\u0646'}
            </button>
          </div>
        </div>
      ) : null}
    </div>;
};
