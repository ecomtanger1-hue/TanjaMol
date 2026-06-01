import { type FormEvent, useEffect, useState } from 'react';
import { categories, categoryRoute, parseOrderForm, type CartItem, type OrderDraft, type Product } from '../../storefrontRuntime';
import { ProductCard } from '../storefront/ProductCard';
import { SiteFooter } from '../storefront/StorefrontPages';
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
  onAddToCart,
  onOrderProduct,
  onOpenProduct,
  onPlaceOrder,
  product,
  products = [],
}: ProductPageProps) => {
  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
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

  useEffect(() => {
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

  const goCategory = () => {
    window.location.hash = activeCategory ? categoryRoute(activeCategory.id) : '#/';
  };

  const orderItem: CartItem = {
    id: product?.id ?? 'smart-watch',
    slug: product?.slug ?? 'smart-watch',
    title: productTitle,
    price: product?.price ?? 249,
    priceLabel: productPriceLabel,
    quantity,
    image: product?.image ?? productGallery[0].src,
    variant: selectedColor,
  };

  const relatedItems = products.filter(item => item.id !== orderItem.id).slice(0, relatedProducts.length);

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    const draft = parseOrderForm(event, 'product-page', [orderItem]);
    if (draft) onPlaceOrder(draft);
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

  return <div dir="rtl" className="min-h-screen w-full overflow-x-hidden bg-[#f7f5ef] pb-[calc(96px+env(safe-area-inset-bottom))] text-[#17201b] md:pb-0">
      <header className="sticky top-0 z-40 bg-[#102118]/95 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
        <nav className="mx-auto flex min-h-[64px] w-full max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div role="button" tabIndex={0} onClick={() => goHome()} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') goHome(); }} className="tm-press flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#00a66c] font-heading text-lg font-black">TM</div>
            <div className="min-w-0">
              <p className="font-heading text-xl font-black leading-tight">TanjaMol</p>
              <p className="hidden truncate text-xs font-semibold text-white/68 sm:block">توصيل داخل طنجة والدفع عند الاستلام</p>
            </div>
          </div>
          <button className="tm-press min-h-[44px] rounded-md bg-white px-4 text-sm font-extrabold text-[#102118]" type="button" onClick={onOpenCart}>
            {'\u0627\u0644\u0633\u0644\u0629'} {cartCount}
          </button>
        </nav>
      </header>

      <main>
        <section className="bg-[#102118] text-white">
          <div className="mx-auto w-full max-w-[1180px] px-4 pb-5 pt-4 sm:px-6 lg:px-8 lg:pb-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/68">
              <button type="button" onClick={() => goHome()} className="tm-press text-white/68 hover:text-white">{'\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629'}</button>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <button type="button" onClick={goCategory} className="tm-press text-white/68 hover:text-white">{productCategory}</button>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="max-w-[62vw] truncate text-white">{productTitle}</span>
            </div>
          </div>
        </section>

        <section className="bg-[#102118] text-white">
          <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-7 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_430px] lg:gap-9 lg:px-8 lg:pb-16">
            <div className="min-w-0">
              <div className="md:hidden">
                <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4" onScroll={event => {
                const itemWidth = event.currentTarget.scrollWidth / productGallery.length;
                const nextIndex = Math.min(productGallery.length - 1, Math.round(Math.abs(event.currentTarget.scrollLeft) / itemWidth));
                setSelectedImage(nextIndex);
              }}>
                  {productGallery.map((image, index) => <img key={image.src} src={image.src} alt={image.alt} onClick={() => setSelectedImage(index)} className="tm-image h-[320px] w-[82vw] max-w-[360px] flex-none snap-center rounded-lg object-cover sm:h-[390px]" fetchPriority={index === 0 ? 'high' : undefined} loading={index === 0 ? 'eager' : 'lazy'} sizes="82vw" />)}
                </div>
                <div className="flex items-center justify-center gap-2 pb-1" aria-label="صور المنتج">
                  {productGallery.map((image, index) => <button key={image.src} type="button" aria-label={`الصورة ${index + 1}`} onClick={() => setSelectedImage(index)} className={`tm-press h-2.5 rounded-full ${selectedImage === index ? 'w-6 bg-[#00d084]' : 'w-2.5 bg-white/38'}`} />)}
                </div>
              </div>

              <div className="hidden grid-cols-[92px_minmax(0,1fr)] gap-4 md:grid">
                <div className="grid content-start gap-3">
                  {productGallery.map((image, index) => <button key={image.src} type="button" aria-label={`عرض الصورة ${index + 1}`} onClick={() => setSelectedImage(index)} className={`tm-press overflow-hidden rounded-lg border bg-white/10 p-1 ${selectedImage === index ? 'border-[#00d084]' : 'border-white/16'}`}>
                      <img src={image.src} alt={image.alt} className="tm-image h-[82px] w-full rounded-md object-cover" loading={index === 0 ? 'eager' : 'lazy'} sizes="92px" />
                    </button>)}
                </div>
                <img src={productGallery[selectedImage]?.src ?? productGallery[0].src} alt={productGallery[selectedImage]?.alt ?? productGallery[0].alt} className="tm-image h-[560px] w-full rounded-lg object-cover" fetchPriority="high" sizes="54vw" />
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
                <span className="tm-ui-label rounded-md bg-[#e9f8ef] px-3 py-1.5 text-xs text-[#0f7d55]">{productBadge}</span>
                <span className="tm-ui-label rounded-md bg-[#fff1d5] px-3 py-1.5 text-xs text-[#9a5a00]">COD</span>
              </div>

              <h1 className="tm-page-title mt-4 break-words">
                {productTitle}
              </h1>
              <p className="tm-body-copy mt-3 text-sm text-[#5f6861] sm:text-base">
                {productDescription}
              </p>

              <div className="mt-5 flex items-end justify-between gap-4 border-y border-[#dde6df] py-4">
                <div>
                  <p className="tm-num tm-price text-4xl text-[#0f7d55]">{productPriceLabel}</p>
                  <p className="tm-num text-sm font-semibold text-[#939a95] line-through">{productOldPrice}</p>
                </div>
                <div className="text-left">
                  <p className="tm-ui-label text-xs text-[#5f6861]">واتساب</p>
                  <p className="tm-small-copy text-[#8a938d]">تأكيد قبل الإرسال</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="tm-ui-label text-sm">اللون</p>
                  <p className="tm-small-copy text-[#6b746d]">{selectedColor}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {colors.map(color => <button key={color.name} type="button" aria-pressed={selectedColor === color.name} onClick={() => setSelectedColor(color.name)} className={`tm-press tm-ui-label flex min-h-[46px] items-center justify-center gap-2 rounded-md border px-3 text-sm ${selectedColor === color.name ? 'border-[#0f7d55] bg-[#e9f8ef] text-[#0f7d55]' : 'border-[#d9e1dc] bg-white text-[#17201b]'}`}>
                    
                      <span className="h-3.5 w-3.5 rounded-full" style={{
                    backgroundColor: color.value
                  }} />
                      {color.name}
                    </button>)}
                </div>
              </div>

              <div className="mt-5">
                <p className="tm-ui-label mb-2 text-sm">الكمية</p>
                <div className="flex w-fit items-center overflow-hidden rounded-md border border-[#d9e1dc] bg-white">
                  <button className="tm-press tm-button-label grid h-11 w-12 place-items-center text-lg" type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))}>-</button>
                  <span className="tm-num tm-ui-label grid h-11 w-14 place-items-center border-x border-[#d9e1dc] text-lg">{quantity}</span>
                  <button className="tm-press tm-button-label grid h-11 w-12 place-items-center text-lg" type="button" onClick={() => setQuantity(value => value + 1)}>+</button>
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                <button className="tm-press tm-order-cta tm-button-label min-h-[52px] rounded-md bg-[#00a66c] px-5 text-base text-white shadow-[0_18px_38px_-22px_rgba(0,166,108,0.95)]" type="button" onClick={scrollToOrder}>
                  اطلب الآن
                </button>
                <button className="tm-press tm-secondary-label min-h-[48px] rounded-md bg-[#f2f7f4] px-5 text-sm text-[#253129]" type="button" onClick={() => onAddToCart(orderItem)}>
                  أضف للسلة
                </button>
              </div>

              {showOrderForm ? (
                <form id="product-order-details" className="mt-5 grid gap-3 rounded-md border border-[#d9e1dc] bg-white p-3" onSubmit={submitOrder}>
                  <div>
                    <p className="tm-modal-title">معلومات الطلب</p>
                    <p className="tm-small-copy mt-1 text-[#68736c]">نؤكد التفاصيل على واتساب قبل الإرسال. لا يوجد دفع مسبق.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <input required name="name" className="min-h-[48px] rounded-md border border-[#d9e1dc] bg-white px-4 text-base font-medium outline-none focus:border-[#0f7d55]" placeholder="الاسم الكامل" autoComplete="name" />
                    <input required name="phone" className="min-h-[48px] rounded-md border border-[#d9e1dc] bg-white px-4 text-base font-medium outline-none focus:border-[#0f7d55]" placeholder="رقم الهاتف" inputMode="tel" autoComplete="tel" />
                  </div>
                  <input required name="address" className="min-h-[48px] rounded-md border border-[#d9e1dc] bg-white px-4 text-base font-medium outline-none focus:border-[#0f7d55]" placeholder="الحي أو العنوان داخل طنجة" autoComplete="street-address" />
                  <button className="tm-press tm-button-label min-h-[52px] rounded-md bg-[#00a66c] px-5 text-base text-white shadow-[0_18px_38px_-22px_rgba(0,166,108,0.95)]" type="submit">إرسال الطلب عبر واتساب</button>
                </form>
              ) : (
                <div className="tm-body-copy mt-4 rounded-md border border-[#d9e1dc] bg-white px-3 py-3 text-sm text-[#4e5851]">
                  اختر اللون والكمية، ثم اضغط اطلب الآن لملء بياناتك. سنراجع الطلب معك على واتساب قبل التوصيل.
                </div>
              )}

              <div className="mt-4 grid gap-2 text-sm font-bold text-[#4e5851]">
                <div className="flex items-center justify-between rounded-md bg-[#f2f7f4] px-3 py-3">
                  <span>موعد التأكيد</span>
                  <span className="text-[#0f7d55]">خلال 15 دقيقة</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-[#f2f7f4] px-3 py-3">
                  <span>التوصيل داخل طنجة</span>
                  <span className="text-[#0f7d55]">24 إلى 48 ساعة</span>
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
                {productDetails.map((detail, index) => <article key={detail.id} dir="ltr" className="grid gap-4 overflow-hidden rounded-lg bg-[#f2f7f4] lg:min-h-[320px] lg:grid-cols-2 lg:items-stretch lg:gap-6">
                  {index % 2 === 0 ? <figure className="min-h-[220px] overflow-hidden">
                    <img src={detail.mediaUrl || productGallery[(index + 1) % productGallery.length]?.src || productGallery[0].src} alt={detail.title} className="tm-image h-full min-h-[220px] w-full object-cover lg:min-h-[320px]" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" />
                  </figure> : null}
                  <div dir="rtl" className="flex flex-col justify-center p-5 lg:p-7">
                    <p className="text-sm font-extrabold text-[#0f7d55]">تفاصيل المنتج</p>
                    <h3 className="tm-heading mt-2 font-heading text-2xl font-black lg:text-3xl">{detail.title}</h3>
                    <p className="tm-copy mt-3 whitespace-pre-line text-sm font-semibold leading-8 text-[#5f6861] lg:text-base">{detail.text}</p>
                  </div>
                  {index % 2 === 1 ? <figure className="min-h-[220px] overflow-hidden">
                    <img src={detail.mediaUrl || productGallery[(index + 1) % productGallery.length]?.src || productGallery[0].src} alt={detail.title} className="tm-image h-full min-h-[220px] w-full object-cover lg:min-h-[320px]" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" />
                  </figure> : null}
                </article>)}
              </div> : null}
              <div className={productDetails.length ? 'hidden' : 'lg:hidden'}>
                <p className="tm-copy mt-3 max-w-[860px] text-sm font-semibold leading-7 text-[#5f6861] sm:text-base">
                  {productDescription}
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <figure className="overflow-hidden rounded-lg bg-[#f2f7f4]">
                    <img src={(productGallery[1] ?? productGallery[0]).src} alt={(productGallery[1] ?? productGallery[0]).alt} className="tm-image h-[220px] w-full object-cover md:h-[260px]" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" />
                    <figcaption className="px-4 py-3 text-sm font-extrabold text-[#17201b]">صور تفصيلية للمنتج</figcaption>
                  </figure>
                  <figure className="overflow-hidden rounded-lg bg-[#f2f7f4]">
                    <img src={(productGallery[2] ?? productGallery[0]).src} alt={(productGallery[2] ?? productGallery[0]).alt} className="tm-image h-[220px] w-full object-cover md:h-[260px]" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" />
                    <figcaption className="px-4 py-3 text-sm font-extrabold text-[#17201b]">الخامة والحزام من قرب</figcaption>
                  </figure>
                  <button type="button" className="tm-press relative min-h-[260px] overflow-hidden rounded-lg bg-[#102118] text-right text-white">
                    <img src={(productGallery[3] ?? productGallery[0]).src} alt="معاينة فيديو شرح المنتج" className="tm-image absolute inset-0 h-full w-full object-cover opacity-45" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" />
                    <span className="absolute inset-0 bg-[#102118]/35" />
                    <span className="relative z-10 flex h-full min-h-[260px] flex-col justify-end p-5">
                      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white text-[#102118]">
                        <span className="mr-1 h-0 w-0 border-y-[9px] border-r-[15px] border-y-transparent border-r-[#102118]" />
                      </span>
                      <span className="font-heading text-2xl font-black">فيديو طريقة الاستعمال</span>
                      <span className="mt-2 text-sm font-semibold leading-7 text-white/78">شاهد التشغيل، الحجم على اليد، والتنبيهات اليومية قبل تأكيد الطلب.</span>
                    </span>
                  </button>
                </div>
              </div>

              <div className={productDetails.length ? 'hidden' : 'mt-7 hidden gap-5 lg:grid'}>
                <article dir="ltr" className="grid min-h-[320px] grid-cols-2 items-stretch gap-6">
                  <figure className="overflow-hidden rounded-lg bg-[#f2f7f4]">
                    <img src={(productGallery[1] ?? productGallery[0]).src} alt={(productGallery[1] ?? productGallery[0]).alt} className="tm-image h-full min-h-[320px] w-full object-cover" loading="lazy" sizes="50vw" />
                  </figure>
                  <div dir="rtl" className="flex flex-col justify-center rounded-lg bg-[#f2f7f4] p-7">
                    <p className="text-sm font-extrabold text-[#0f7d55]">استعمال يومي واضح</p>
                    <h3 className="tm-heading mt-2 font-heading text-3xl font-black">شاشة وتنبيهات تساعدك طوال اليوم</h3>
                    <p className="tm-copy mt-3 text-base font-semibold leading-8 text-[#5f6861]">
                      شاشة واضحة، تنبيهات المكالمات والرسائل، وقياس سريع للخطوات والنشاط. مناسبة للاستعمال في الخدمة، الرياضة، والتنقل داخل المدينة بدون تعقيد.
                    </p>
                  </div>
                </article>

                <article dir="ltr" className="grid min-h-[320px] grid-cols-2 items-stretch gap-6">
                  <div dir="rtl" className="flex flex-col justify-center rounded-lg bg-[#fff7e6] p-7">
                    <p className="text-sm font-extrabold text-[#9a5a00]">راحة في اللبس</p>
                    <h3 className="tm-heading mt-2 font-heading text-3xl font-black">حزام خفيف وخامة مناسبة للحركة</h3>
                    <p className="tm-copy mt-3 text-base font-semibold leading-8 text-[#5f6861]">
                      الحزام مريح للاستعمال الطويل، والخامة مناسبة للاستعمال اليومي. التفاصيل القريبة تساعد الزبون يرى الحجم، الملمس، وطريقة الثبات قبل تأكيد الطلب.
                    </p>
                  </div>
                  <figure className="overflow-hidden rounded-lg bg-[#f2f7f4]">
                    <img src={(productGallery[2] ?? productGallery[0]).src} alt={(productGallery[2] ?? productGallery[0]).alt} className="tm-image h-full min-h-[320px] w-full object-cover" loading="lazy" sizes="50vw" />
                  </figure>
                </article>

                <article dir="ltr" className="grid min-h-[320px] grid-cols-2 items-stretch gap-6">
                  <button dir="rtl" type="button" className="tm-press relative overflow-hidden rounded-lg bg-[#102118] text-right text-white">
                    <img src={(productGallery[3] ?? productGallery[0]).src} alt="معاينة فيديو شرح المنتج" className="tm-image absolute inset-0 h-full w-full object-cover opacity-45" loading="lazy" sizes="50vw" />
                    <span className="absolute inset-0 bg-[#102118]/35" />
                    <span className="relative z-10 flex h-full min-h-[320px] flex-col justify-end p-7">
                      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white text-[#102118]">
                        <span className="mr-1 h-0 w-0 border-y-[9px] border-r-[15px] border-y-transparent border-r-[#102118]" />
                      </span>
                      <span className="font-heading text-3xl font-black">فيديو طريقة الاستعمال</span>
                    </span>
                  </button>
                  <div dir="rtl" className="flex flex-col justify-center rounded-lg bg-[#eef6f1] p-7">
                    <p className="text-sm font-extrabold text-[#0f7d55]">قبل تأكيد الطلب</p>
                    <h3 className="tm-heading mt-2 font-heading text-3xl font-black">مساحة جاهزة لفيديو أو شرح مصور</h3>
                    <p className="tm-copy mt-3 text-base font-semibold leading-8 text-[#5f6861]">
                      يمكن استعمال هذه المساحة لعرض فيديو قصير، خطوات التشغيل، أو صور تفصيلية إضافية. الهدف أن يحصل الزبون على كل المعلومات المهمة دون الابتعاد عن مسار الطلب.
                    </p>
                  </div>
                </article>
              </div>
            </details>

            <details className="tm-surface rounded-lg bg-white p-4 open:bg-[#fffdf8] sm:p-5 lg:p-6" open>
              <summary className="cursor-pointer font-heading text-xl font-black sm:text-2xl">المواصفات</summary>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {productSpecs.map(([label, value]) => <div key={label} className="rounded-md bg-[#f2f7f4] px-4 py-3 text-sm">
                    <span className="block font-extrabold text-[#17201b]">{label}</span>
                    <span className="mt-1 block font-bold leading-6 text-[#5f6861]">{value}</span>
                  </div>)}
              </div>
            </details>

            {showReviews ? <section className="tm-surface rounded-lg bg-white p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-[#f59e0b]">قبل الطلب</p>
                  <h2 className="tm-heading mt-1 font-heading text-2xl font-black sm:text-3xl">ملاحظات تساعدك تختار بثقة</h2>
                </div>
                <div className="w-fit rounded-md bg-[#17201b] px-4 py-3 text-center text-white">
                  <p className="font-heading text-xl font-black">لا دفع مسبق</p>
                  <p className="text-xs font-bold text-white/70">القرار النهائي بعد التأكيد</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {['اسألنا على اللون أو الكمية قبل الإرسال، ونؤكد معك التفاصيل على واتساب.', 'إذا كان المنتج مختلفا أو فيه عيب واضح، يمكن مراجعة الاستبدال حسب الحالة.'].map((note, index) => <article key={note} className="rounded-md border border-[#dde6df] bg-[#fffdf8] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-heading text-lg font-black">{index === 0 ? 'تأكيد التفاصيل' : 'الاستبدال'}</p>
                      <p className="text-sm font-extrabold text-[#0f7d55]">مهم</p>
                    </div>
                    <p className="tm-copy text-sm font-semibold leading-7 text-[#5f6861]">{note}</p>
                    <p className="mt-3 text-xs font-bold text-[#8a938d]">نؤكدها معك قبل التوصيل</p>
                  </article>)}
              </div>
            </section> : null}

            {showPolicies ? <aside className="tm-surface rounded-lg bg-[#102118] p-4 text-white sm:p-5">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {['لا تحتاج بطاقة بنكية', 'نتصل بك لتأكيد التفاصيل', 'الدفع فقط عند الاستلام', 'إمكانية الاستبدال حسب الحالة'].map(item => <div key={item} className="flex min-h-[54px] items-center gap-3 rounded-md bg-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#00d084]" />
                    <span className="text-sm font-bold">{item}</span>
                  </div>)}
              </div>
            </aside> : null}
          </div>
        </section>

        {showRelated ? <section className="bg-white py-10 sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold text-[#0f7d55]">منتجات مناسبة معها</p>
                <h2 className="tm-heading mt-1 font-heading text-3xl font-black sm:text-4xl">اختيارات تكمل الطلب</h2>
              </div>
              <button className="tm-press hidden min-h-[44px] rounded-md bg-[#17201b] px-5 font-extrabold text-white sm:block" type="button">
                عرض الكل
              </button>
            </div>

            <div className="-mx-4 mt-7 flex snap-x gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
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
                  <img src={product.image} alt={product.title} className="tm-image h-[170px] w-full object-cover md:h-[230px]" loading="lazy" sizes="(max-width: 768px) 72vw, 33vw" />
                  <div className="p-4">
                    <h3 className="tm-heading line-clamp-2 min-h-[48px] font-heading text-xl font-black">{product.title}</h3>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="tm-num font-heading text-2xl font-black text-[#0f7d55]">{product.price}</p>
                      <button className="tm-press min-h-[44px] rounded-md bg-[#00a66c] px-4 text-sm font-extrabold text-white" type="button" onClick={() => { const item = relatedItems[index]; if (item) onAddToCart({ id: item.id, slug: item.slug, title: item.title, price: item.price, priceLabel: item.priceLabel, quantity: 1, image: item.image }); }}>أضف</button>
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
            <p className="tm-num tm-price text-xl text-[#0f7d55]">{productPriceLabel}</p>
            <p className="truncate text-xs font-medium text-[#68736c]">الدفع عند الاستلام داخل طنجة</p>
          </div>
          <button className="tm-press tm-order-cta tm-button-label min-h-[50px] overflow-hidden rounded-md bg-[#00a66c] px-5 text-sm text-white shadow-[0_16px_34px_-18px_rgba(0,166,108,0.95)]" type="button" onClick={scrollToOrder}>
            اطلب الآن
          </button>
        </div>
      </div>
    </div>;
};
