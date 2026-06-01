import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  categories,
  categoryRoute,
  defaultSettings,
  orderTotal,
  parseOrderForm,
  productRoute,
  productsForCategory,
  searchProducts,
  searchRoute,
  type CartItem,
  type Product,
  type StoreSettings,
  type StoredOrder,
} from '../../storefrontRuntime';
import { ProductCard } from './ProductCard';

type StoreActions = {
  cartCount: number;
  products: Product[];
  settings: StoreSettings;
  onNavigate: (route: string) => void;
  onOpenCart: () => void;
  onOpenProduct: (slug: string) => void;
  onAddToCart: (item: CartItem) => void;
  onOrderProduct: (item: CartItem) => void;
  onPlaceOrder: (items: CartItem[], source: string, event: FormEvent<HTMLFormElement>) => void;
};

export function SiteHeader({
  cartCount,
  onNavigate,
  onOpenCart,
}: {
  cartCount: number;
  onNavigate: (route: string) => void;
  onOpenCart: () => void;
}) {
  const [query, setQuery] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (value) onNavigate(searchRoute(value));
  };
  const openCategories = () => {
    window.sessionStorage.setItem('tm-open-categories', '1');
    onNavigate('#/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#102118]/96 text-white shadow-[0_14px_36px_rgba(16,33,24,0.2)] backdrop-blur">
      <nav className="mx-auto flex min-h-[64px] w-full max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => onNavigate('#/')} className="tm-press flex min-w-0 items-center gap-3 text-right">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#00a66c] font-heading text-lg font-black">T</span>
          <span className="hidden font-heading text-xl font-black leading-none min-[360px]:inline sm:text-2xl">TanjaMol</span>
        </button>

        <div className="hidden items-center gap-6 text-sm font-bold text-white/82 lg:flex">
          <button type="button" onClick={() => onNavigate('#/')}>الرئيسية</button>
          <button type="button" onClick={openCategories}>الأقسام</button>
          <button type="button" onClick={() => onNavigate('#/about')}>من نحن</button>
          <button type="button" onClick={() => onNavigate('#/contact')}>تواصل</button>
        </div>

        <form onSubmit={submit} className="hidden min-w-[310px] lg:block">
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="min-h-[42px] w-full rounded-md bg-white/10 px-4 text-sm font-bold text-white outline-none placeholder:text-white/54 focus:bg-white/14"
            placeholder="بحث"
            type="search"
          />
        </form>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onNavigate('#/search')} className="tm-press min-h-[44px] rounded-md bg-white/10 px-3 text-sm font-black text-white lg:hidden">
            بحث
          </button>
          <button type="button" onClick={onOpenCart} className="tm-press relative min-h-[44px] rounded-md bg-white px-4 text-sm font-black text-[#102118]">
            السلة
            <span aria-live="polite" className="tm-num mr-2 inline-flex min-w-5 justify-center rounded-full bg-[#00a66c] px-1.5 py-0.5 text-xs text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter({ onNavigate }: { onNavigate: (route: string) => void }) {
  const links = [
    ['من نحن', '#/about'],
    ['تواصل معنا', '#/contact'],
    ['الأسئلة', '#/faq'],
    ['التوصيل', '#/shipping'],
    ['الاستبدال', '#/returns'],
    ['الخصوصية', '#/privacy'],
    ['الشروط', '#/terms'],
  ];

  return (
    <footer className="bg-[#102118] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 lg:grid-cols-[1.1fr_0.9fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#00a66c] font-heading text-xl font-black">T</span>
            <p className="font-heading text-2xl font-black">TanjaMol</p>
          </div>
          <p className="mt-4 max-w-[360px] text-sm font-semibold leading-7 text-white/68">
            منتجات مختارة، طلب عبر واتساب، ودفع عند الاستلام داخل طنجة.
          </p>
        </div>
        <nav className="grid gap-2 text-sm font-semibold text-white/72">
          {links.map(([label, route]) => (
            <button key={route} type="button" onClick={() => onNavigate(route)} className="tm-press text-right">
              {label}
            </button>
          ))}
        </nav>
        <div className="grid content-start gap-2 text-sm font-semibold text-white/72">
          {categories.slice(0, 5).map(category => (
            <button key={category.id} type="button" onClick={() => onNavigate(categoryRoute(category.id))} className="tm-press text-right">
              {category.title}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-[1180px] flex-col gap-3 border-t border-white/10 pt-5 text-xs font-bold text-white/54 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 TanjaMol</p>
        <p>الدفع عند الاستلام داخل طنجة</p>
      </div>
    </footer>
  );
}

export function CategoryPage(props: StoreActions & { categoryId: string | null }) {
  const activeCategory = categories.find(category => category.id === props.categoryId) || categories[0];
  const listedProducts = productsForCategory(props.products, activeCategory.id);

  return (
    <PageShell cartCount={props.cartCount} onNavigate={props.onNavigate} onOpenCart={props.onOpenCart}>
      <main className="overflow-x-hidden">
        <section className="bg-[#102118] text-white">
          <div className="mx-auto grid max-w-[1180px] gap-5 px-4 py-6 sm:px-6 sm:py-9 lg:grid-cols-[1fr_360px] lg:px-8">
            <div>
              <p className="tm-eyebrow text-[#7de7bd]">الرئيسية / الأقسام</p>
              <h1 className="tm-page-title mt-3 max-w-[720px] break-words">{activeCategory.title}</h1>
            </div>
            <div className="grid grid-cols-2 gap-2 self-end sm:gap-3">
              {[activeCategory.count, '24-48h توصيل', '0 DH دفع مسبق', 'تأكيد واتساب'].map(item => (
                <div key={item} className="tm-ui-label rounded-lg bg-white/10 p-3 text-center text-sm sm:p-4 sm:text-xl">{item}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-2 rounded-lg bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)] sm:flex-row sm:items-center sm:justify-between">
              <p className="font-heading text-xl font-black">{listedProducts.length} منتج</p>
              <p className="text-sm font-bold leading-6 text-[#68736c]">اختيارات متاحة للطلب مع تأكيد واتساب والدفع عند الاستلام.</p>
            </div>
            <ProductGrid {...props} products={listedProducts} />
          </div>
        </section>
      </main>
    </PageShell>
  );
}

export function SearchResultsPage(props: StoreActions & { query: string }) {
  const [query, setQuery] = useState(props.query);
  const results = useMemo(() => searchProducts(props.products, props.query), [props.products, props.query]);

  useEffect(() => setQuery(props.query), [props.query]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onNavigate(query.trim() ? searchRoute(query) : '#/search');
  };

  return (
    <PageShell cartCount={props.cartCount} onNavigate={props.onNavigate} onOpenCart={props.onOpenCart}>
      <main className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="rounded-lg bg-[#102118] p-4 text-white shadow-[0_22px_58px_rgba(16,33,24,0.2)] sm:p-7">
          <p className="tm-eyebrow text-[#7de7bd]">نتائج البحث</p>
          <h1 className="tm-page-title mt-2">{props.query ? `نتائج البحث عن "${props.query}"` : 'البحث'}</h1>
          <form onSubmit={submit} className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <span className="sr-only">بحث</span>
              <input className="min-h-[52px] w-full rounded-md border border-white/16 bg-white px-4 pl-24 text-base font-medium text-[#17201b] outline-none sm:min-h-[56px] sm:text-lg" value={query} onChange={event => setQuery(event.target.value)} type="search" />
              <span className="tm-ui-label absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-[#e9f8ef] px-2.5 py-1 text-[11px] text-[#0f7d55] sm:left-4 sm:text-xs">{results.length} نتيجة</span>
            </label>
            <button className="tm-button-label min-h-[52px] rounded-md bg-[#00a66c] px-7 text-base text-white sm:min-h-[56px]" type="submit">بحث</button>
          </form>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[270px_1fr]">
          <aside className="hidden h-fit rounded-lg bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)] lg:block">
            <h2 className="font-heading text-xl font-black">اقتراحات</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {['ساعة', 'شاحن', 'سماعات', 'منظم', 'عروض اليوم'].map(item => (
                <button key={item} onClick={() => props.onNavigate(searchRoute(item))} className="min-h-[38px] rounded-md bg-[#f2f7f4] px-3 text-sm font-black text-[#253129]" type="button">{item}</button>
              ))}
            </div>
          </aside>
          <div className="min-w-0">
            <div className="hidden items-center justify-between rounded-lg bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)] lg:flex">
              <p className="font-heading text-xl font-black">{results.length} منتج</p>
              <p className="text-sm font-bold text-[#68736c]">نتائج مطابقة للكلمات التي كتبتها</p>
            </div>
            <ProductGrid {...props} products={results} columns="lg:grid-cols-4" />
          </div>
        </section>
      </main>
    </PageShell>
  );
}

export function InfoPage({
  page,
  cartCount,
  onNavigate,
  onOpenCart,
  settings,
}: {
  page: string;
  cartCount: number;
  onNavigate: (route: string) => void;
  onOpenCart: () => void;
  settings: StoreSettings;
}) {
  const data = infoPages[page] || infoPages.about;

  return (
    <PageShell cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart}>
      <main>
        <section className="bg-[#102118] px-4 py-10 text-white sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-[1180px]">
            <p className="text-sm font-extrabold text-[#7de7bd]">{data.eyebrow}</p>
            <h1 className="mt-3 max-w-[780px] font-heading text-[38px] font-black leading-tight sm:text-5xl lg:text-6xl">{data.title}</h1>
            {data.copy ? <p className="mt-4 max-w-[680px] text-base font-semibold leading-8 text-white/74 sm:text-lg sm:leading-9">{data.copy}</p> : null}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-4 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {data.blocks.map(block => (
            <article key={block.title} className="rounded-lg bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)] sm:p-5">
              <h2 className="font-heading text-2xl font-black">{block.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-8 text-[#5f6861] sm:text-base">{block.text.replace('{city}', settings.city)}</p>
            </article>
          ))}
        </section>
      </main>
    </PageShell>
  );
}

export function NotFoundPage({ cartCount, onNavigate, onOpenCart }: { cartCount: number; onNavigate: (route: string) => void; onOpenCart: () => void }) {
  return (
    <PageShell cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart}>
      <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-[#102118] px-4 py-12 text-center text-white">
        <section className="max-w-[680px]">
          <p className="tm-num font-heading text-8xl font-black text-[#00d084]">404</p>
          <h1 className="mt-4 font-heading text-4xl font-black sm:text-6xl">الصفحة غير موجودة</h1>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => onNavigate('#/')} className="min-h-[52px] rounded-md bg-[#00a66c] px-6 text-base font-black text-white">الرئيسية</button>
            <button type="button" onClick={() => onNavigate(categoryRoute(categories[0].id))} className="min-h-[52px] rounded-md bg-white/12 px-6 text-base font-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]">الأقسام</button>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

export function CartPopup({
  open,
  cart,
  directItem,
  onClose,
  onQuantityChange,
  onRemove,
  onPlaceOrder,
}: {
  open: boolean;
  cart: CartItem[];
  directItem: CartItem | null;
  onClose: () => void;
  onQuantityChange: (id: string, variant: string | undefined, quantity: number) => void;
  onRemove: (id: string, variant: string | undefined) => void;
  onPlaceOrder: (items: CartItem[], source: string, event: FormEvent<HTMLFormElement>) => void;
}) {
  const items = directItem ? [directItem] : cart;
  const total = orderTotal(items);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector = 'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])';

    document.body.style.overflow = 'hidden';

    const focusFirstControl = window.setTimeout(() => {
      const dialog = document.querySelector<HTMLElement>('[data-cart-dialog]');
      dialog?.querySelector<HTMLElement>(focusableSelector)?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = document.querySelector<HTMLElement>('[data-cart-dialog]');
      if (!dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
        .filter(element => !element.hasAttribute('disabled') && element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusFirstControl);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#102118]/72 p-3 text-[#17201b] backdrop-blur sm:p-5" role="dialog" aria-modal="true" aria-labelledby="tm-cart-title" aria-describedby="tm-cart-summary" dir="rtl" data-cart-dialog>
      <section className="flex h-[calc(100vh-24px)] max-h-[820px] w-full max-w-[440px] flex-col overflow-hidden rounded-lg bg-[#fffdf8] shadow-[0_34px_90px_rgba(0,0,0,0.34)]">
        <header className="flex items-center justify-between gap-3 border-b border-[#dfe6df] px-4 py-3">
          <div>
            <h2 id="tm-cart-title" className="tm-modal-title">إتمام الطلب</h2>
            <p className="tm-num tm-small-copy mt-1 text-[#68736c]">{items.length} منتج</p>
          </div>
          <button aria-label="إغلاق" onClick={onClose} className="tm-button-label grid h-11 w-11 place-items-center rounded-md bg-[#f2f7f4] text-xl" type="button">×</button>
        </header>

        <div className="flex-1 overflow-auto p-3 sm:p-4">
          {items.length > 0 ? (
            <div className="grid gap-2">
              {items.map(item => (
                <article key={`${item.id}-${item.variant || ''}`} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg bg-white p-2.5 shadow-[0_8px_24px_rgba(23,32,27,0.08)]">
                  <img src={item.image} alt={item.title} className="h-16 w-16 rounded-md object-cover" />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="tm-card-title line-clamp-2 text-sm">{item.title}</h2>
                        {item.variant ? <p className="tm-small-copy mt-1 text-[#68736c]">{item.variant}</p> : null}
                      </div>
                      {!directItem ? <button aria-label="حذف المنتج" onClick={() => onRemove(item.id, item.variant)} className="tm-button-label grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#fff1d5] text-sm text-[#9a5a00]" type="button">×</button> : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-md border border-[#d9e1dc]">
                        <button aria-label="تقليل الكمية" className="tm-button-label grid h-11 w-11 place-items-center" type="button" onClick={() => onQuantityChange(item.id, item.variant, item.quantity - 1)}>-</button>
                        <span className="tm-num tm-ui-label grid h-11 w-10 place-items-center border-x border-[#d9e1dc] text-sm">{item.quantity}</span>
                        <button aria-label="زيادة الكمية" className="tm-button-label grid h-11 w-11 place-items-center" type="button" onClick={() => onQuantityChange(item.id, item.variant, item.quantity + 1)}>+</button>
                      </div>
                      <p className="tm-num tm-price text-lg text-[#0f7d55]">{item.price * item.quantity} درهم</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="tm-section-title">السلة فارغة</p>
                <button onClick={onClose} className="tm-button-label mt-4 min-h-[44px] rounded-md bg-[#102118] px-5 text-sm text-white" type="button">متابعة التسوق</button>
              </div>
            </div>
          )}

          <form id="tm-cart-order-form" className="mt-4 grid gap-3 rounded-lg bg-white p-3 shadow-[0_8px_24px_rgba(23,32,27,0.08)]" onSubmit={event => onPlaceOrder(items, directItem ? 'direct-product' : 'cart', event)}>
            <h2 className="tm-modal-title">معلومات العميل</h2>
            <input required name="name" className="min-h-[44px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-base font-medium outline-none focus:border-[#0f7d55]" placeholder="الاسم الكامل" autoComplete="name" />
            <input required name="phone" className="min-h-[44px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-base font-medium outline-none focus:border-[#0f7d55]" placeholder="رقم الهاتف" inputMode="tel" autoComplete="tel" />
            <input required name="address" className="min-h-[44px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-base font-medium outline-none focus:border-[#0f7d55]" placeholder="العنوان داخل طنجة" autoComplete="street-address" />
            <textarea name="note" className="tm-body-copy min-h-[70px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 py-2 text-sm outline-none focus:border-[#0f7d55]" placeholder="ملاحظة اختيارية" />
          </form>
        </div>

        <footer className="border-t border-[#dfe6df] bg-white p-3 sm:p-4" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div id="tm-cart-summary" className="mb-3 grid gap-1 text-sm font-medium">
            <div className="flex justify-between"><span>المجموع التقريبي</span><span className="tm-num tm-price text-lg text-[#0f7d55]">{total} درهم</span></div>
            <div className="flex justify-between text-[#68736c]"><span>التوصيل</span><span>يؤكد في واتساب</span></div>
            <p className="text-xs leading-5 text-[#68736c]">لا يوجد دفع مسبق. نؤكد تفاصيل الطلب معك قبل الإرسال.</p>
          </div>
          <button form="tm-cart-order-form" disabled={items.length === 0} className="tm-button-label min-h-[54px] w-full rounded-md bg-[#00a66c] px-5 text-base text-white shadow-[0_16px_34px_-18px_rgba(0,166,108,0.95)] disabled:opacity-45" type="submit">إرسال الطلب عبر واتساب</button>
          <button onClick={onClose} className="tm-secondary-label mt-2 min-h-[44px] w-full rounded-md bg-[#f2f7f4] px-5 text-sm text-[#253129]" type="button">متابعة التسوق</button>
        </footer>
      </section>
    </div>
  );
}

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-[#102118] px-4 text-[#17201b]">
      <form onSubmit={event => { event.preventDefault(); onLogin(); }} className="w-full max-w-[420px] rounded-lg bg-[#fffdf8] p-5 shadow-[0_34px_90px_rgba(0,0,0,0.34)]">
        <p className="font-heading text-3xl font-black">دخول الإدارة</p>
        <div className="mt-5 grid gap-3">
          <input className="min-h-[48px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-4 font-bold outline-none focus:border-[#0f7d55]" placeholder="اسم المستخدم" defaultValue="admin" />
          <input className="min-h-[48px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-4 font-bold outline-none focus:border-[#0f7d55]" placeholder="كلمة المرور" type="password" defaultValue="admin" />
          <button className="min-h-[50px] rounded-md bg-[#00a66c] px-5 font-black text-white" type="submit">دخول</button>
        </div>
      </form>
    </main>
  );
}

export function AdminOrdersPage({ orders, onNavigate }: { orders: StoredOrder[]; onNavigate: (route: string) => void }) {
  return (
    <AdminShell title="الطلبات" onNavigate={onNavigate}>
      <section className="grid gap-3">
        {orders.length ? orders.map(order => (
          <button key={order.id} onClick={() => onNavigate(`#/admin/orders/${order.id}`)} className="tm-admin-press grid gap-3 rounded-md bg-white p-4 text-right shadow-[0_10px_30px_rgba(23,32,27,0.08)] sm:grid-cols-[1fr_auto]" type="button">
            <div>
              <p className="font-heading text-xl font-black">{order.id}</p>
              <p className="mt-1 text-sm font-bold text-[#65716a]">{order.name}، {order.phone}</p>
            </div>
            <div className="text-right sm:text-left">
              <p className="tm-admin-num font-heading text-2xl font-black text-[#0f7d55]">{order.total} درهم</p>
              <p className="text-xs font-black text-[#65716a]">{order.status}</p>
            </div>
          </button>
        )) : <EmptyAdmin title="لا توجد طلبات" />}
      </section>
    </AdminShell>
  );
}

export function AdminOrderDetailPage({ order, onNavigate }: { order?: StoredOrder; onNavigate: (route: string) => void }) {
  if (!order) return <AdminShell title="الطلب" onNavigate={onNavigate}><EmptyAdmin title="الطلب غير موجود" /></AdminShell>;

  return (
    <AdminShell title={order.id} onNavigate={onNavigate}>
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <article className="rounded-md bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)]">
          <h2 className="font-heading text-2xl font-black">المنتجات</h2>
          <div className="mt-4 grid gap-3">
            {order.items.map(item => (
              <div key={`${item.id}-${item.variant || ''}`} className="grid grid-cols-[64px_1fr] gap-3 rounded-md bg-[#fbfaf6] p-2">
                <img src={item.image} alt={item.title} className="h-16 w-16 rounded-md object-cover" />
                <div>
                  <p className="font-heading text-base font-black">{item.title}</p>
                  <p className="tm-admin-num mt-1 text-sm font-black text-[#0f7d55]">{item.quantity} x {item.priceLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <aside className="rounded-md bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)]">
          <h2 className="font-heading text-2xl font-black">العميل</h2>
          <div className="mt-4 grid gap-2 text-sm font-bold text-[#65716a]">
            <p>{order.name}</p>
            <button className="text-right text-[#0f7d55]" type="button" onClick={() => onNavigate(`#/admin/customers/${encodeURIComponent(order.phone)}`)}>{order.phone}</button>
            <p>{order.address}</p>
            {order.note ? <p>{order.note}</p> : null}
          </div>
          <p className="tm-admin-num mt-5 border-t border-[#dfe5df] pt-4 font-heading text-3xl font-black text-[#0f7d55]">{order.total} درهم</p>
        </aside>
      </section>
    </AdminShell>
  );
}

export function AdminCustomerDetailPage({ phone, orders, onNavigate }: { phone: string; orders: StoredOrder[]; onNavigate: (route: string) => void }) {
  const customerOrders = orders.filter(order => order.phone === phone);
  const latest = customerOrders[0];

  return (
    <AdminShell title="العميل" onNavigate={onNavigate}>
      <section className="grid gap-4">
        <article className="rounded-md bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)]">
          <h2 className="font-heading text-2xl font-black">{latest?.name || phone}</h2>
          <p className="mt-2 font-bold text-[#65716a]">{phone}</p>
          {latest?.address ? <p className="mt-2 font-bold text-[#65716a]">{latest.address}</p> : null}
        </article>
        <AdminOrdersPageContent orders={customerOrders} onNavigate={onNavigate} />
      </section>
    </AdminShell>
  );
}

export function AdminSettingsPage({
  settings,
  onSave,
  onNavigate,
}: {
  settings: StoreSettings;
  onSave: (settings: StoreSettings) => void;
  onNavigate: (route: string) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  return (
    <AdminShell title="الإعدادات" onNavigate={onNavigate}>
      <form onSubmit={event => { event.preventDefault(); onSave(draft); setSaved(true); }} className="grid gap-4 rounded-md bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)] sm:p-5">
        <SettingsInput label="اسم المتجر" value={draft.storeName} onChange={storeName => setDraft(current => ({ ...current, storeName }))} />
        <SettingsInput label="رقم واتساب" value={draft.whatsappNumber} onChange={whatsappNumber => setDraft(current => ({ ...current, whatsappNumber }))} />
        <SettingsInput label="رقم الهاتف" value={draft.phone} onChange={phone => setDraft(current => ({ ...current, phone }))} />
        <SettingsInput label="المدينة" value={draft.city} onChange={city => setDraft(current => ({ ...current, city }))} />
        <SettingsInput label="مدة التوصيل" value={draft.deliveryText} onChange={deliveryText => setDraft(current => ({ ...current, deliveryText }))} />
        <SettingsInput label="العنوان" value={draft.address} onChange={address => setDraft(current => ({ ...current, address }))} />
        <button type="submit" className="min-h-[48px] rounded-md bg-[#00a66c] px-5 font-black text-white">حفظ</button>
        {saved ? <p className="text-sm font-black text-[#0f7d55]">تم الحفظ</p> : null}
      </form>
    </AdminShell>
  );
}

function PageShell({ cartCount, onNavigate, onOpenCart, children }: { cartCount: number; onNavigate: (route: string) => void; onOpenCart: () => void; children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-[#f7f5ef] pb-[calc(76px+env(safe-area-inset-bottom))] text-[#17201b] md:pb-0">
      <SiteHeader cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart} />
      {children}
      <SiteFooter onNavigate={onNavigate} />
      <MobileNav cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart} />
    </div>
  );
}

function MobileNav({ cartCount, onNavigate, onOpenCart }: { cartCount: number; onNavigate: (route: string) => void; onOpenCart: () => void }) {
  const openCategories = () => {
    window.sessionStorage.setItem('tm-open-categories', '1');
    onNavigate('#/');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/96 px-3 pt-2 shadow-[0_-12px_30px_rgba(23,32,27,0.14),0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur md:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
      <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-2">
        <button type="button" onClick={() => onNavigate('#/')} className="tm-press tm-ui-label min-h-[52px] rounded-md bg-[#f5f2ea] px-2 py-2 text-center text-xs text-[#253129]"><span className="block font-heading text-base text-[#0f7d55]">T</span>الرئيسية</button>
        <button type="button" onClick={openCategories} className="tm-press tm-ui-label min-h-[52px] rounded-md bg-[#f5f2ea] px-2 py-2 text-center text-xs text-[#253129]"><span className="block font-heading text-base text-[#0f7d55]">6</span>الأقسام</button>
        <button type="button" onClick={onOpenCart} className="tm-press tm-ui-label min-h-[52px] rounded-md bg-[#f5f2ea] px-2 py-2 text-center text-xs text-[#253129]"><span className="tm-num block font-heading text-base text-[#0f7d55]" aria-live="polite">{cartCount}</span>السلة</button>
        <button type="button" onClick={() => onNavigate('#/search')} className="tm-press tm-ui-label min-h-[52px] rounded-md bg-[#f5f2ea] px-2 py-2 text-center text-xs text-[#253129]"><span className="block font-heading text-base text-[#0f7d55]">بحث</span>اطلب</button>
      </div>
    </div>
  );
}

function ProductGrid({ products, columns = 'lg:grid-cols-3', ...props }: StoreActions & { products: Product[]; columns?: string }) {
  if (!products.length) {
    return (
      <div className="mt-5 rounded-lg bg-white p-6 text-center shadow-[0_10px_30px_rgba(23,32,27,0.08)]">
        <p className="font-heading text-2xl font-black">لا توجد منتجات هنا حاليا</p>
        <p className="mx-auto mt-2 max-w-[420px] text-sm font-bold leading-7 text-[#68736c]">جرّب البحث بكلمة مختلفة أو ارجع للأقسام الرئيسية لاختيار منتج آخر.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => props.onNavigate('#/')} className="min-h-[46px] rounded-md bg-[#102118] px-5 text-sm font-black text-white">الرئيسية</button>
          <button type="button" onClick={() => { window.sessionStorage.setItem('tm-open-categories', '1'); props.onNavigate('#/'); }} className="min-h-[46px] rounded-md bg-[#f2f7f4] px-5 text-sm font-black text-[#253129]">تصفح الأقسام</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid w-full max-w-full grid-cols-[repeat(2,minmax(0,1fr))] gap-2.5 sm:gap-4 lg:mt-5 ${columns}`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} onOpenProduct={props.onOpenProduct} onAddToCart={props.onAddToCart} onOrderProduct={props.onOrderProduct} />
      ))}
    </div>
  );
}

function AdminShell({ title, onNavigate, children }: { title: string; onNavigate: (route: string) => void; children: React.ReactNode }) {
  const nav = [
    ['لوحة التحكم', '#/admin'],
    ['إضافة منتج', '#/admin/products/new'],
    ['الطلبات', '#/admin/orders'],
    ['الإعدادات', '#/admin/settings'],
    ['المتجر', '#/'],
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f2eb] text-[#17201b]">
      <div className="grid min-h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-l border-[#d9dfd8] bg-[#102118] text-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col px-4 py-5">
            <button type="button" onClick={() => onNavigate('#/')} className="flex items-center gap-3 px-2 text-right">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-[#00a66c] font-heading text-lg font-black">TM</span>
              <span className="font-heading text-xl font-black">TanjaMol</span>
            </button>
            <nav className="mt-8 grid gap-1 text-sm font-extrabold">
              {nav.map(([label, route]) => (
                <button key={route} type="button" onClick={() => onNavigate(route)} className="min-h-[42px] rounded-md px-3 text-right text-white/72 transition-colors hover:bg-white/10 hover:text-white">
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>
        <main className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#d9dfd8] bg-[#f8f7f1]/94 backdrop-blur">
            <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <h1 className="truncate font-heading text-2xl font-black sm:text-3xl">{title}</h1>
              <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press min-h-[42px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-extrabold">فتح المتجر</button>
            </div>
          </header>
          <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function AdminOrdersPageContent({ orders, onNavigate }: { orders: StoredOrder[]; onNavigate: (route: string) => void }) {
  return (
    <section className="grid gap-3">
      {orders.map(order => (
        <button key={order.id} onClick={() => onNavigate(`#/admin/orders/${order.id}`)} className="rounded-md bg-white p-4 text-right shadow-[0_10px_30px_rgba(23,32,27,0.08)]" type="button">
          <p className="font-heading text-xl font-black">{order.id}</p>
          <p className="mt-1 text-sm font-bold text-[#65716a]">{order.total} درهم</p>
        </button>
      ))}
    </section>
  );
}

function EmptyAdmin({ title }: { title: string }) {
  return <div className="rounded-md bg-white p-6 text-center font-heading text-2xl font-black shadow-[0_10px_30px_rgba(23,32,27,0.08)]">{title}</div>;
}

function SettingsInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-black text-[#65716a]">{label}</span>
      <input value={value} onChange={event => onChange(event.target.value)} className="min-h-[44px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-bold outline-none focus:border-[#0f7d55]" />
    </label>
  );
}

const infoPages: Record<string, { eyebrow: string; title: string; copy?: string; blocks: Array<{ title: string; text: string }> }> = {
  about: {
    eyebrow: 'TanjaMol',
    title: 'شراء سريع، تأكيد إنساني، ودفع عند الباب.',
    copy: 'TanjaMol يجمع منتجات عملية للبيت، الهاتف، السفر، والجمال في تجربة طلب واضحة.',
    blocks: [
      { title: 'الفكرة', text: 'اختيار المنتج، إرسال الطلب عبر واتساب، ثم الدفع عند الاستلام.' },
      { title: 'المدينة', text: 'نخدم {city} بمنتجات مختارة ومسار طلب بسيط.' },
    ],
  },
  contact: {
    eyebrow: 'تواصل معنا',
    title: 'نحن قريبون على واتساب.',
    blocks: [
      { title: 'واتساب', text: defaultSettings.whatsappNumber },
      { title: 'الهاتف', text: defaultSettings.phone },
      { title: 'العنوان', text: '{city}' },
    ],
  },
  faq: {
    eyebrow: 'الأسئلة',
    title: 'أسئلة متكررة',
    blocks: [
      { title: 'كيف أطلب؟', text: 'اختر المنتج، اضغط اطلب الآن، ثم أرسل الطلب عبر واتساب.' },
      { title: 'هل أحتاج حساب؟', text: 'لا. الطلب يتم بدون إنشاء حساب.' },
      { title: 'كيف أدفع؟', text: 'الدفع عند الاستلام فقط.' },
      { title: 'متى يصل الطلب؟', text: 'غالبا خلال 24 إلى 48 ساعة داخل {city}.' },
    ],
  },
  shipping: {
    eyebrow: 'التوصيل',
    title: 'التوصيل داخل طنجة',
    blocks: [
      { title: 'المدة', text: 'غالبا خلال 24 إلى 48 ساعة حسب المنطقة وتوقيت تأكيد الطلب.' },
      { title: 'التأكيد', text: 'لا يرسل الطلب قبل تأكيده على واتساب.' },
    ],
  },
  returns: {
    eyebrow: 'الاستبدال',
    title: 'سياسة الاستبدال',
    blocks: [
      { title: 'الحالات المقبولة', text: 'يمكن طلب الاستبدال إذا وصل المنتج مختلفا أو به عيب واضح.' },
      { title: 'المدة', text: 'يراجع الطلب خلال 7 أيام من الاستلام.' },
    ],
  },
  privacy: {
    eyebrow: 'الخصوصية',
    title: 'سياسة الخصوصية',
    blocks: [
      { title: 'البيانات', text: 'نستخدم الاسم، الهاتف، والعنوان لمعالجة الطلب والتوصيل.' },
      { title: 'واتساب', text: 'تتم محادثات التأكيد عبر واتساب.' },
    ],
  },
  terms: {
    eyebrow: 'الشروط',
    title: 'شروط الاستخدام',
    blocks: [
      { title: 'قبول الطلب', text: 'إرسال الطلب عبر واتساب لا يعني أنه مؤكد مباشرة. يتم التأكيد بعد مراجعة المنتج والعنوان.' },
      { title: 'الأسعار والتوفر', text: 'يتم تأكيد السعر النهائي والتوفر في محادثة واتساب قبل الإرسال.' },
    ],
  },
};
