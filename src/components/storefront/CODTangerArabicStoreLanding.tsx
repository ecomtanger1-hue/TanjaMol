import { useEffect, useState } from 'react';
import { Grid3X3, Home, Menu, PackageSearch, Search, ShoppingCart, X } from 'lucide-react';
import { categories, categoryRoute, type CartItem, type OrderDraft, type Product } from '../../storefrontRuntime';
import { TanjaMallLogo } from '../brand/TanjaMallLogo';
import { ProductCard as StoreProductCard } from './ProductCard';
import { MobileMenuDrawer, SiteFooter } from './StorefrontPages';

type StorefrontProps = {
  cartCount: number;
  products: Product[];
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenProduct: (slug: string) => void;
  onAddToCart: (item: CartItem) => void;
  onOrderProduct: (item: CartItem) => void;
  onPlaceOrder: (draft: OrderDraft) => void;
  onNavigate?: (route: string) => void;
};

const trustItems = ['الدفع عند الاستلام', 'تأكيد الطلب بالهاتف', 'توصيل داخل طنجة', 'استبدال حسب الحالة'];
const policies = [['التوصيل', 'يتم توصيل الطلبات داخل طنجة خلال 24 إلى 48 ساعة حسب المنطقة وتوقيت تأكيد الطلب.'], ['التأكيد', 'يتواصل فريقنا مع العميل قبل الإرسال لتأكيد المنتج واللون والكمية والعنوان.'], ['الدفع', 'لا تحتاج إلى بطاقة بنكية أو دفع مسبق. الدفع يتم عند استلام الطلب.'], ['الاستبدال', 'يمكن طلب الاستبدال خلال 7 أيام إذا وصل المنتج مختلفا أو به عيب واضح.']];
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToPageTop() {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) activeElement.blur();

  const scroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.getElementById('root')?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.querySelector('#root > div')?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };
  scroll();
  window.requestAnimationFrame(scroll);
  window.setTimeout(scroll, 40);
  window.setTimeout(scroll, 160);
  window.setTimeout(scroll, 360);
  window.setTimeout(scroll, 720);
}

function ProductCard({
  product,
  onOpenProduct,
  compact = false,
}: {
  product: Product;
  onOpenProduct: (slug: string) => void;
  compact?: boolean;
}) {
  const openProduct = () => {
    onOpenProduct(product.slug);
    scrollToPageTop();
  };

  return <article className="tm-lift tm-surface overflow-hidden rounded-lg bg-[#fffdf8]">
    <button type="button" onClick={openProduct} className="block w-full text-right">
      <div className="relative">
        <img src={product.image} alt={product.title} className={`tm-image w-full object-cover ${compact ? 'h-[148px]' : 'h-[160px] sm:h-[220px] lg:h-[250px]'}`} loading="lazy" decoding="async" width="640" height="640" sizes="(max-width: 768px) 50vw, 25vw" />
        <span className="absolute right-2 top-2 rounded-md bg-[#fffdf8] px-2 py-1 text-[10px] font-black text-[#17201b] shadow-[0_8px_22px_rgba(23,32,27,0.16)] sm:right-3 sm:top-3 sm:px-3 sm:py-2 sm:text-xs">
          {product.badge}
        </span>
      </div>
      <div className={compact ? 'p-2.5' : 'p-3 sm:p-4'}>
        <p className="text-xs font-extrabold text-[#ff9900]">{product.category}</p>
        <h3 className="tm-heading mt-1 line-clamp-2 min-h-[42px] text-center font-heading text-base font-black leading-tight text-[#17201b] sm:min-h-[54px] sm:text-xl">
          {product.title}
        </h3>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="tm-num font-heading text-lg font-black text-[#b45309] sm:text-2xl">{product.priceLabel}</p>
            <p className="tm-num text-[11px] font-bold text-[#9a9f9b] line-through sm:text-sm">{product.oldPrice}</p>
          </div>
          <span className="tm-press min-h-[44px] rounded-md bg-[#ff9900] px-3 py-3 text-xs font-extrabold text-[#131921] sm:px-4 sm:text-sm">{'\u0627\u0637\u0644\u0628\u0647'}</span>
        </div>
      </div>
    </button>
  </article>;
}
export const CODTangerArabicStoreLanding = ({
  cartCount,
  products,
  onOpenCart,
  onOpenSearch,
  onOpenProduct,
  onAddToCart,
  onOrderProduct,
  onNavigate,
}: StorefrontProps) => {
  const newArrivals = products.slice(8, 12);
  const featuredProduct = products[0];
  const shortcutCategories = categories.slice(0, 6);
  const navigate = onNavigate || ((route: string) => { window.location.hash = route; });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openCategories = () => scrollToSection('categories');
  const bottomItemClass = 'tm-press tm-touch rounded-md bg-[var(--tm-surface-tint)] px-2 py-2 text-center text-xs font-black text-[var(--tm-ink-muted)]';

  useEffect(() => {
    const section = window.sessionStorage.getItem('tm-open-section');
    const legacyCategories = window.sessionStorage.getItem('tm-open-categories');
    if (!section && legacyCategories !== '1') return;
    window.sessionStorage.removeItem('tm-open-section');
    window.sessionStorage.removeItem('tm-open-categories');
    window.setTimeout(() => scrollToSection(section || 'categories'), 80);
  }, []);

  return <div dir="rtl" className="min-h-screen w-full overflow-x-hidden bg-[var(--tm-bg)] pb-24 pt-16 text-[var(--tm-ink)] md:pb-0">
    <header className="tm-site-header fixed inset-x-0 top-0 z-50 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)]" style={{ background: 'var(--tm-header-alpha)' }}>
      <nav className="mx-auto grid min-h-[64px] w-full max-w-[1180px] grid-cols-[44px_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:flex lg:justify-between lg:px-8">
        <button type="button" aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(value => !value)} className="tm-press tm-touch grid h-11 w-11 place-items-center rounded-md bg-white/10 lg:hidden">
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" strokeWidth={2.4} /> : <Menu className="h-6 w-6" aria-hidden="true" strokeWidth={2.4} />}
        </button>

                <button type="button" onClick={() => scrollToSection('top')} className="tm-press mx-auto min-w-0 text-center lg:mx-0 lg:text-right">
          <TanjaMallLogo compact subtitle={"\u0645\u062a\u062c\u0631 \u0637\u0646\u062c\u0629 \u0644\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645"} textClassName="text-white" />
        </button>

        <div className="hidden items-center gap-7 text-sm font-semibold text-white/82 lg:flex">
          <button type="button" onClick={openCategories} className="tm-press tm-touch rounded-md px-2">{'\u0627\u0644\u0623\u0642\u0633\u0627\u0645'}</button>
          <button type="button" onClick={() => scrollToSection('products')} className="tm-press tm-touch rounded-md px-2">{'\u0627\u0644\u0623\u0643\u062b\u0631 \u0637\u0644\u0628\u0627'}</button>
          <button type="button" onClick={() => scrollToSection('new-arrivals')} className="tm-press tm-touch rounded-md px-2">{'\u0648\u0635\u0644 \u062d\u062f\u064a\u062b\u0627'}</button>
          <button type="button" onClick={() => scrollToSection('policies')} className="tm-press tm-touch rounded-md px-2">{'\u0627\u0644\u062a\u0648\u0635\u064a\u0644'}</button>
          <button type="button" onClick={() => scrollToSection('policies')} className="tm-press tm-touch rounded-md px-2">{'\u0627\u0644\u0623\u0633\u0626\u0644\u0629'}</button>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenSearch} className="tm-press tm-touch hidden items-center gap-2 rounded-md bg-white/10 px-4 text-sm font-extrabold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)] sm:inline-flex">
            <Search className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
            بحث
          </button>
          <button type="button" onClick={onOpenCart} className="tm-press tm-icon-button relative h-11 w-11" aria-label={`السلة، ${cartCount} منتج`}>
            <ShoppingCart className="h-5 w-5" aria-hidden="true" strokeWidth={2.4} />
            <span key={cartCount} aria-live="polite" className="tm-num tm-cart-count-pop absolute -left-2 -top-2 inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-xs text-white" style={{ background: 'var(--tm-brand)' }}>
              {cartCount}
            </span>
          </button>
        </div>
      </nav>
      <MobileMenuDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onNavigate={navigate} />
    </header>

    <main id="top">
      <section className="bg-[var(--tm-surface-white)] px-4 pb-4 pt-4 sm:px-6 lg:hidden">
        <div className="mx-auto flex w-full max-w-[1180px] justify-center">
          <button
            type="button"
            onClick={onOpenSearch}
            className="tm-press tm-touch tm-panel-white flex w-full items-center gap-3 px-4 py-3 text-right transition-[box-shadow,transform] duration-200 sm:max-w-[620px] lg:min-h-[58px] lg:max-w-[760px] lg:rounded-xl lg:px-5"
            aria-label="بحث عن منتج"
          >
            <span className="min-w-0 flex-1 text-sm font-bold text-[#68736c] sm:text-base lg:text-lg">ابحث عن منتج</span>
            <Search className="h-6 w-6 shrink-0 text-[#6f7b74] lg:h-7 lg:w-7" aria-hidden="true" strokeWidth={2.5} />
          </button>
        </div>
      </section>

      <section id="categories" className="scroll-mt-20 bg-[var(--tm-surface-white)]">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="flex gap-4 overflow-x-auto px-4 py-4 sm:px-6 lg:justify-center lg:gap-8 lg:overflow-visible lg:px-8 lg:py-6">
            {shortcutCategories.map(category => (
              <button key={category.id} type="button" onClick={() => navigate(categoryRoute(category.id))} className="tm-press w-[88px] shrink-0 text-center sm:w-[96px] lg:w-[116px]">
                <span className="relative mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-[#fff7ed] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_10px_24px_rgba(23,32,27,0.08)] sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                  <img src={category.image} alt={category.title} className="h-full w-full object-cover outline outline-1 outline-offset-[-1px] outline-[rgba(0,0,0,0.1)]" loading="lazy" decoding="async" width="160" height="160" sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px" />
                </span>
                <span className="mt-2 block min-h-[34px] whitespace-normal break-words text-xs font-black leading-tight text-[#17201b] sm:text-sm lg:mt-3 lg:min-h-0 lg:truncate lg:text-[15px]">{category.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--tm-bg)] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="tm-shell-dark mx-auto grid w-full max-w-[1180px] gap-4 overflow-hidden rounded-lg p-4 text-white sm:p-6 lg:grid-cols-[1fr_430px] lg:items-center lg:gap-8 lg:rounded-2xl lg:p-8">
          <div className="hidden min-w-0 lg:block">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#b45309]">الدفع عند الاستلام</p>
            <h1 className="tm-heading mt-3 max-w-[680px] font-heading text-[34px] font-black leading-[1.12] [text-wrap:balance] sm:text-5xl lg:text-6xl">
              عروض طنجة اليوم
            </h1>
            <p className="mt-3 max-w-[580px] text-sm font-bold leading-7 text-white/78 [text-wrap:pretty] sm:text-base lg:text-lg">
              خصومات على الإلكترونيات والمنزل والعناية
            </p>
            <div className="mt-5 flex flex-wrap gap-2 lg:gap-3">
              {trustItems.slice(0, 3).map(item => <span key={item} className="rounded-md bg-white/10 px-3 py-2 text-xs font-black text-white/88 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] lg:px-4">{item}</span>)}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => scrollToSection('products')} className="tm-press tm-button-primary px-5 text-sm">
                تسوق الآن
              </button>
              <button type="button" onClick={() => featuredProduct && onOpenProduct(featuredProduct.slug)} className="tm-press tm-touch rounded-md bg-white/12 px-5 text-sm font-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)]">
                عرض المنتج
              </button>
            </div>
          </div>
          <div className="tm-mobile-hero-stage lg:hidden" aria-label="عروض متجر TanjaMall">
            <div className="tm-mobile-hero-slide tm-mobile-hero-intro rounded-lg bg-[#131921] p-5 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#b45309]">TanjaMall</p>
              <h1 className="mt-4 font-heading text-[2rem] font-black leading-tight text-white">متجر طنجة</h1>
              <div className="mt-5 grid gap-2.5 text-sm font-black">
                <span className="tm-mobile-hero-slogan rounded-md bg-white/10 px-4 py-3 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">الدفع عند الاستلام</span>
                <span className="tm-mobile-hero-slogan rounded-md bg-white/10 px-4 py-3 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">توصيل سريع داخل طنجة</span>
                <span className="tm-mobile-hero-slogan rounded-md bg-white/10 px-4 py-3 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">تأكيد الطلب قبل الإرسال</span>
              </div>
              <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
                <span className="h-2 w-6 rounded-full bg-[#ffb84d]" />
                <span className="h-2 w-2 rounded-full bg-white/32" />
              </div>
            </div>
          {featuredProduct ? (
            <button type="button" onClick={() => onOpenProduct(featuredProduct.slug)} className="tm-mobile-hero-slide tm-mobile-hero-product tm-press relative block overflow-hidden rounded-lg bg-white/8 text-right shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_18px_44px_rgba(0,0,0,0.22)]">
              <img src={featuredProduct.image} alt={featuredProduct.title} className="absolute inset-0 h-full w-full object-cover outline outline-1 outline-offset-[-1px] outline-[rgba(255,255,255,0.1)]" fetchPriority="high" decoding="sync" width="760" height="760" sizes="100vw" />
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,25,33,0.04),rgba(19,25,33,0.68))]" />
              <span className="absolute bottom-4 right-4 left-4">
                <span className="mb-2 inline-flex rounded-md bg-white px-3 py-1 text-xs font-black text-[#17201b]">{featuredProduct.badge}</span>
                <span className="block line-clamp-2 font-heading text-2xl font-black text-white">{featuredProduct.title}</span>
                <span className="tm-num mt-2 block font-heading text-2xl font-black text-[#ffb84d]">{featuredProduct.priceLabel}</span>
              </span>
            </button>
          ) : null}
          </div>
          {featuredProduct ? (
            <button type="button" onClick={() => onOpenProduct(featuredProduct.slug)} className="tm-press relative hidden min-h-[260px] overflow-hidden rounded-lg bg-white/8 text-right shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_18px_44px_rgba(0,0,0,0.22)] lg:block lg:min-h-[360px] lg:rounded-xl">
              <img src={featuredProduct.image} alt={featuredProduct.title} className="absolute inset-0 h-full w-full object-cover outline outline-1 outline-offset-[-1px] outline-[rgba(255,255,255,0.1)]" fetchPriority="high" decoding="sync" width="760" height="760" sizes="(max-width: 1024px) 100vw, 430px" />
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,25,33,0.04),rgba(19,25,33,0.68))]" />
              <span className="absolute bottom-4 right-4 left-4">
                <span className="mb-2 inline-flex rounded-md bg-white px-3 py-1 text-xs font-black text-[#17201b]">{featuredProduct.badge}</span>
                <span className="block line-clamp-2 font-heading text-2xl font-black text-white">{featuredProduct.title}</span>
                <span className="tm-num mt-2 block font-heading text-2xl font-black text-[#ffb84d]">{featuredProduct.priceLabel}</span>
              </span>
            </button>
          ) : null}
        </div>
      </section>

      <section id="products" className="scroll-mt-20 bg-[var(--tm-surface-white)] py-6 sm:py-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-extrabold text-[#f59e0b]">الأكثر طلبا</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {products.slice(0, 8).map(product => <StoreProductCard key={product.id} product={product} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} onOrderProduct={onOrderProduct} />)}
          </div>

          <div className="mt-5 text-center">
              <button type="button" className="tm-press tm-button-dark px-7 text-base">
              عرض كل المنتجات
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#fff7ed] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto grid w-full max-w-[1180px] gap-5 overflow-hidden rounded-lg bg-[#131921] p-5 text-white sm:p-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="text-sm font-extrabold text-[#ffb84d]">الدفع عند الاستلام</p>
            <h2 className="tm-heading mt-2 font-heading text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">اطلب الآن وادفع عند وصول المنتج</h2>
            <p className="tm-copy mt-4 max-w-[680px] text-base font-semibold leading-8 text-white/74 sm:text-lg">لا تحتاج إلى بطاقة بنكية. نؤكد الطلب عبر الواتساب ثم نرسله إلى عنوانك في أسرع وقت.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['24-48h', 'مدة التوصيل'], ['0 DH', 'دفع مسبق'], ['7 أيام', 'استبدال'], ['طنجة', 'نطاق الخدمة']].map(([value, label]) => <div key={label} className="rounded-md bg-white/10 p-4 text-center">
              <p className="tm-num font-heading text-2xl font-black">{value}</p>
              <p className="mt-1 text-xs font-bold text-white/70">{label}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section id="new-arrivals" className="mx-auto w-full max-w-[1180px] scroll-mt-20 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-[#b45309]">وصل حديثا</p>
          </div>
          <button type="button" className="tm-press tm-button-dark hidden px-5 text-sm sm:block">
            عرض الجديد
          </button>
        </div>
        <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
          {newArrivals.map(product => <div key={product.id} className="w-[72vw] flex-none snap-start lg:w-auto">
            <StoreProductCard product={product} compact onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} onOrderProduct={onOrderProduct} />
          </div>)}
        </div>
      </section>

      <section id="policies" className="bg-[#fffdf7] scroll-mt-20 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto grid w-full max-w-[1180px] gap-4 lg:grid-cols-[260px_1fr] lg:gap-6">
          <div>
            <p className="text-sm font-extrabold text-[#b45309]">قبل الطلب</p>
          </div>
          <div className="grid gap-3">
            {policies.map(([title, copy]) => <details key={title} className="tm-panel-white px-4 py-3 open:bg-[var(--tm-surface-tint)]">
              <summary className="cursor-pointer font-heading text-lg font-black">{title}</summary>
              <p className="tm-copy mt-2 text-sm font-semibold leading-7 text-[#5f6861]">{copy}</p>
            </details>)}
          </div>
        </div>
      </section>
    </main>

    <SiteFooter onNavigate={navigate} />

    <div className="sticky bottom-0 z-40 bg-[var(--tm-surface-white)]/96 px-3 pt-2 shadow-[0_-12px_30px_rgba(23,32,27,0.14),0_0_0_1px_rgba(0,0,0,0.06)] md:hidden" style={{
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
    }}>
      <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-2">
        <button type="button" onClick={() => scrollToSection('top')} className={`${bottomItemClass} tm-nav-active`} aria-current="page">
          <Home className="mx-auto mb-1 h-5 w-5 text-white" aria-hidden="true" strokeWidth={2.4} />
          {'\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629'}
        </button>
        <button type="button" onClick={openCategories} className={bottomItemClass}>
          <Grid3X3 className="mx-auto mb-1 h-5 w-5 text-[#b45309]" aria-hidden="true" strokeWidth={2.4} />
          {'\u0627\u0644\u0623\u0642\u0633\u0627\u0645'}
        </button>
        <button type="button" onClick={onOpenCart} className={bottomItemClass} aria-label={`السلة، ${cartCount} منتج`}>
          <span className="relative mx-auto mb-1 block h-5 w-5">
            <ShoppingCart className="h-5 w-5 text-[#b45309]" aria-hidden="true" strokeWidth={2.4} />
            {cartCount ? <span key={cartCount} aria-live="polite" className="tm-num tm-cart-count-pop absolute -left-2 -top-2 min-w-4 rounded-full px-1 text-[10px] leading-4 text-white" style={{ background: 'var(--tm-brand)' }}>{cartCount}</span> : null}
          </span>
        </button>
        <button type="button" onClick={() => scrollToSection('products')} className={bottomItemClass}>
          <PackageSearch className="mx-auto mb-1 h-5 w-5 text-[#b45309]" aria-hidden="true" strokeWidth={2.4} />
          {'\u0627\u0637\u0644\u0628'}
        </button>
      </div>
    </div>
  </div>;
};
