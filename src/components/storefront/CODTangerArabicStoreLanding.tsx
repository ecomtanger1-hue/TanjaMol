import { useEffect } from 'react';
import { categories, categoryRoute, type CartItem, type OrderDraft, type Product } from '../../storefrontRuntime';
import { ProductCard as StoreProductCard } from './ProductCard';
import { SiteFooter } from './StorefrontPages';

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
        <img src={product.image} alt={product.title} className={`tm-image w-full object-cover ${compact ? 'h-[148px]' : 'h-[160px] sm:h-[220px] lg:h-[250px]'}`} loading="lazy" sizes="(max-width: 768px) 50vw, 25vw" />
        <span className="tm-ui-label absolute right-2 top-2 rounded-md bg-[#fffdf8] px-2 py-1 text-[10px] text-[#17201b] shadow-[0_8px_22px_rgba(23,32,27,0.16)] sm:right-3 sm:top-3 sm:px-3 sm:py-2 sm:text-xs">
          {product.badge}
        </span>
      </div>
      <div className={compact ? 'p-2.5' : 'p-3 sm:p-4'}>
        <p className="tm-eyebrow text-[#00a66c]">{product.category}</p>
        <h3 className="tm-card-title mt-1 line-clamp-2 min-h-[44px] text-center text-[#17201b] sm:min-h-[54px]">
          {product.title}
        </h3>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="tm-num tm-price text-lg text-[#0f7d55] sm:text-2xl">{product.priceLabel}</p>
            <p className="tm-num text-[11px] font-semibold text-[#9a9f9b] line-through sm:text-sm">{product.oldPrice}</p>
          </div>
          <span className="tm-press tm-button-label min-h-[44px] rounded-md bg-[#00a66c] px-3 py-3 text-xs text-white sm:px-4 sm:text-sm">{'\u0627\u0637\u0644\u0628\u0647'}</span>
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
  const navigate = onNavigate || ((route: string) => { window.location.hash = route; });
  const openCategories = () => scrollToSection('categories');

  useEffect(() => {
    if (window.sessionStorage.getItem('tm-open-categories') !== '1') return;
    window.sessionStorage.removeItem('tm-open-categories');
    window.setTimeout(() => scrollToSection('categories'), 80);
  }, []);

  return <div dir="rtl" className="min-h-screen w-full overflow-x-hidden bg-[#f7f5ef] pb-24 text-[#17201b] md:pb-0">
    <header className="sticky top-0 z-40 bg-[#102118]/96 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
      <nav className="mx-auto flex min-h-[64px] w-full max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" aria-label="فتح الأقسام" onClick={() => scrollToSection('categories')} className="tm-press grid h-11 w-11 place-items-center rounded-md bg-white/10 lg:hidden">
          <span className="grid gap-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
          </span>
        </button>

        <button type="button" onClick={() => scrollToSection('top')} className="tm-press flex min-w-0 items-center gap-3 text-right">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#00a66c] font-heading text-lg font-black shadow-[0_10px_28px_rgba(0,166,108,0.32)]">
            T
          </div>
          <div className="min-w-0">
            <p className="font-heading text-2xl font-black leading-none">TanjaMol</p>
            <p className="mt-1 hidden text-xs font-semibold text-white/70 sm:block">متجر طنجة للدفع عند الاستلام</p>
          </div>
        </button>

        <div className="hidden items-center gap-7 text-sm font-semibold text-white/82 lg:flex">
          <button type="button" onClick={openCategories} className="tm-press">{'\u0627\u0644\u0623\u0642\u0633\u0627\u0645'}</button>
          <button type="button" onClick={() => scrollToSection('products')} className="tm-press">{'\u0627\u0644\u0623\u0643\u062b\u0631 \u0637\u0644\u0628\u0627'}</button>
          <button type="button" onClick={() => scrollToSection('new-arrivals')} className="tm-press">{'\u0648\u0635\u0644 \u062d\u062f\u064a\u062b\u0627'}</button>
          <button type="button" onClick={() => scrollToSection('policies')} className="tm-press">{'\u0627\u0644\u062a\u0648\u0635\u064a\u0644'}</button>
          <button type="button" onClick={() => scrollToSection('policies')} className="tm-press">{'\u0627\u0644\u0623\u0633\u0626\u0644\u0629'}</button>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenSearch} className="tm-press tm-button-label hidden min-h-[44px] rounded-md bg-white/10 px-4 text-sm text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)] sm:block">
            بحث
          </button>
          <button type="button" onClick={onOpenCart} className="tm-press tm-button-label relative min-h-[44px] rounded-md bg-white px-4 text-sm text-[#102118] shadow-[0_14px_35px_rgba(0,0,0,0.18)]" aria-label={`السلة، ${cartCount} منتج`}>
            السلة
            <span aria-live="polite" className="tm-num mr-2 inline-flex min-w-5 justify-center rounded-full bg-[#00a66c] px-1.5 py-0.5 text-xs text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>
    </header>

    <main id="top">
      <section className="relative overflow-hidden bg-[#102118] text-white">
        <div className="absolute inset-0 opacity-32">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2200&q=85" alt="" className="h-full w-full object-cover" fetchPriority="high" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,24,0.78),rgba(16,33,24,0.94))] lg:bg-[linear-gradient(90deg,rgba(16,33,24,0.96)_0%,rgba(16,33,24,0.82)_46%,rgba(16,33,24,0.42)_100%)]" />

        <div className="relative mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-8 px-4 pb-10 pt-7 sm:px-6 sm:pb-12 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-10 lg:px-8 lg:pb-16 lg:pt-16">
          <div className="max-w-[760px]">
            <div className="tm-surface mb-5 inline-flex max-w-full items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 backdrop-blur sm:px-4">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#00d084]" />
              <span className="tm-ui-label text-xs sm:text-sm">توصيل داخل طنجة والدفع عند الباب</span>
            </div>
            <h1 className="tm-display-title max-w-[720px] break-words">
              كل يوم عروض مختارة في TanjaMol
            </h1>
            <p className="tm-body-copy mt-5 max-w-[620px] text-base text-white/84 sm:text-lg">
              تسوق منتجات المنزل، الجمال، الهاتف، والسفر. اطلب المنتج، نؤكد التفاصيل بالهاتف، وتدفع عند الاستلام داخل طنجة.
            </p>
            <div className="mt-7 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:gap-4 lg:mt-9">
              <button type="button" onClick={() => scrollToSection('products')} className="tm-press tm-button-label min-h-[54px] rounded-md bg-[#00a66c] px-6 py-4 text-base text-white shadow-[0_18px_40px_rgba(0,166,108,0.34)] sm:text-lg">
                تصفح عروض اليوم
              </button>
              <button type="button" onClick={() => scrollToSection('categories')} className="tm-press tm-button-label min-h-[54px] rounded-md bg-white/14 px-6 py-4 text-base text-white shadow-[0_0_0_1px_rgba(255,255,255,0.24)] backdrop-blur sm:text-lg">
                استعرض الأقسام
              </button>
            </div>
            <div className="mt-7 grid max-w-[700px] grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
              {[['24-48h', 'توصيل محلي'], ['0 DH', 'دفع مسبق'], ['+400', 'طلب مؤكد']].map(([value, label]) => <div key={label} className="tm-surface rounded-lg bg-white/10 p-3 text-center backdrop-blur sm:p-5">
                <p className="tm-num font-heading text-xl font-black sm:text-3xl">{value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-5 text-white/72 sm:text-sm">{label}</p>
              </div>)}
            </div>
          </div>

          <aside className="tm-surface-strong hidden gap-3 self-end rounded-lg bg-white p-4 text-[#17201b] lg:grid">
            <div className="grid grid-cols-[1.25fr_0.75fr] gap-3">
              <img src={products[0].image} alt={products[0].title} className="tm-image h-[230px] w-full rounded-md object-cover sm:h-[270px]" fetchPriority="high" />
              <div className="grid gap-3">
                <img src={products[1].image} alt={products[1].title} className="tm-image h-full min-h-[108px] rounded-md object-cover" loading="lazy" />
                <img src={products[2].image} alt={products[2].title} className="tm-image h-full min-h-[108px] rounded-md object-cover" loading="lazy" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md bg-[#f2f7f4] px-4 py-3">
              <span className="tm-ui-label text-sm text-[#253129]">عروض جاهزة للطلب</span>
              <span className="tm-num tm-price text-2xl text-[#0f7d55]">8+</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#fffdf7] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {trustItems.map(item => <div key={item} className="tm-surface tm-ui-label rounded-lg bg-white px-3 py-3 text-center text-sm text-[#253129]">
            {item}
          </div>)}
        </div>
      </section>

      <section id="categories" className="mx-auto w-full max-w-[1180px] scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="tm-eyebrow text-[#00a66c]">الأقسام</p>
            <h2 className="tm-section-title mt-2">ابدأ من القسم المناسب</h2>
          </div>
          <button type="button" className="tm-press tm-button-label hidden min-h-[46px] rounded-md bg-[#17201b] px-5 text-sm text-white sm:block">
            عرض كل الأقسام
          </button>
        </div>

        <div className="-mx-4 mt-7 flex gap-3 overflow-x-auto px-4 pb-3 md:hidden">
          {categories.map(category => <button key={category.id} type="button" onClick={() => navigate(categoryRoute(category.id))} className="tm-press w-[calc((100vw-64px)/3)] min-w-[calc((100vw-64px)/3)] cursor-pointer">
            <div className="relative aspect-square overflow-hidden rounded-full bg-[#eaf4ef]">
              <img src={category.image} alt={category.title} className="h-full w-full object-cover" loading="lazy" sizes="33vw" />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#102118]/72 to-transparent" />
            </div>
            <h3 className="tm-ui-label mt-2 line-clamp-2 text-center text-xs">{category.title}</h3>
          </button>)}
        </div>

        <div className="mt-8 hidden grid-cols-2 gap-4 md:grid lg:grid-cols-6">
          {categories.map(category => <button key={category.id} type="button" onClick={() => navigate(categoryRoute(category.id))} className="tm-lift tm-surface overflow-hidden rounded-lg bg-white text-right">
            <img src={category.image} alt={category.title} className="tm-image h-[145px] w-full object-cover" loading="lazy" sizes="16vw" />
            <div className="p-4 text-center">
              <h3 className="tm-card-title">{category.title}</h3>
            </div>
          </button>)}
        </div>
      </section>

      <section id="products" className="bg-white scroll-mt-24 py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="tm-eyebrow text-[#f59e0b]">الأكثر طلبا</p>
              <h2 className="tm-section-title mt-2">منتجات يطلبها عملاء طنجة كثيرا</h2>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {products.slice(0, 8).map(product => <StoreProductCard key={product.id} product={product} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} onOrderProduct={onOrderProduct} />)}
          </div>

          <div className="mt-7 text-center">
            <button type="button" className="tm-press tm-button-label min-h-[52px] rounded-md bg-[#17201b] px-7 text-base text-white">
              عرض كل المنتجات
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#eaf4ef] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto grid w-full max-w-[1180px] gap-5 overflow-hidden rounded-lg bg-[#102118] p-5 text-white sm:p-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="tm-eyebrow text-[#7de7bd]">الدفع عند الاستلام</p>
            <h2 className="tm-section-title mt-2">اطلب الآن وادفع عند وصول المنتج</h2>
            <p className="tm-body-copy mt-4 max-w-[680px] text-base text-white/74 sm:text-lg">لا تحتاج إلى بطاقة بنكية. نؤكد الطلب عبر الواتساب ثم نرسله إلى عنوانك في أسرع وقت.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['24-48h', 'مدة التوصيل'], ['0 DH', 'دفع مسبق'], ['7 أيام', 'استبدال'], ['طنجة', 'نطاق الخدمة']].map(([value, label]) => <div key={label} className="rounded-md bg-white/10 p-4 text-center">
              <p className="tm-num tm-price text-2xl">{value}</p>
              <p className="tm-small-copy mt-1 text-white/70">{label}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section id="new-arrivals" className="mx-auto w-full max-w-[1180px] scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="tm-eyebrow text-[#0f7d55]">وصل حديثا</p>
            <h2 className="tm-section-title mt-2">اختيارات جديدة لهذا الأسبوع</h2>
          </div>
          <button type="button" className="tm-press tm-button-label hidden min-h-[46px] rounded-md bg-[#17201b] px-5 text-sm text-white sm:block">
            عرض الجديد
          </button>
        </div>
        <div className="-mx-4 mt-7 flex snap-x gap-3 overflow-x-auto px-4 pb-3 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
          {newArrivals.map(product => <div key={product.id} className="w-[72vw] flex-none snap-start lg:w-auto">
            <StoreProductCard product={product} compact onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} onOrderProduct={onOrderProduct} />
          </div>)}
        </div>
      </section>

      <section id="policies" className="bg-[#fffdf7] scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto grid w-full max-w-[1180px] gap-5 lg:grid-cols-[360px_1fr] lg:gap-8">
          <div>
            <p className="tm-eyebrow text-[#0f7d55]">قبل الطلب</p>
            <h2 className="tm-section-title mt-2">معلومات مهمة بشكل مختصر</h2>
            <p className="tm-body-copy mt-4 text-base text-[#5f6861]">
              هذه النقاط تساعد العميل على اتخاذ القرار بسرعة دون الابتعاد عن المنتجات.
            </p>
          </div>
          <div className="grid gap-3">
            {policies.map(([title, copy]) => <details key={title} className="tm-surface rounded-md bg-white px-4 py-3 open:bg-[#f2f7f4]">
              <summary className="tm-ui-label cursor-pointer text-lg">{title}</summary>
              <p className="tm-body-copy mt-2 text-sm text-[#5f6861]">{copy}</p>
            </details>)}
          </div>
        </div>
      </section>
    </main>

    <SiteFooter onNavigate={navigate} />

    <div className="sticky bottom-0 z-40 bg-white/96 px-3 pt-2 shadow-[0_-12px_30px_rgba(23,32,27,0.14),0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur md:hidden" style={{
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
    }}>
      <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-2">
        <button type="button" onClick={() => scrollToSection('top')} className="tm-press min-h-[52px] rounded-md bg-[#f5f2ea] px-2 py-2 text-center text-xs font-black text-[#253129]"><span className="tm-num block font-heading text-base text-[#0f7d55]">T</span>{'\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629'}</button>
        <button type="button" onClick={openCategories} className="tm-press min-h-[52px] rounded-md bg-[#f5f2ea] px-2 py-2 text-center text-xs font-black text-[#253129]"><span className="tm-num block font-heading text-base text-[#0f7d55]">6</span>{'\u0627\u0644\u0623\u0642\u0633\u0627\u0645'}</button>
        <button type="button" onClick={onOpenCart} className="tm-press min-h-[52px] rounded-md bg-[#f5f2ea] px-2 py-2 text-center text-xs font-black text-[#253129]"><span className="tm-num block font-heading text-base text-[#0f7d55]" aria-live="polite">{cartCount}</span>{'\u0627\u0644\u0633\u0644\u0629'}</button>
        <button type="button" onClick={() => scrollToSection('products')} className="tm-press min-h-[52px] rounded-md bg-[#f5f2ea] px-2 py-2 text-center text-xs font-black text-[#253129]"><span className="tm-num block font-heading text-base text-[#0f7d55]">COD</span>{'\u0627\u0637\u0644\u0628'}</button>
      </div>
    </div>
  </div>;
};
