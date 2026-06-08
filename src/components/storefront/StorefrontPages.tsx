import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Grid3X3, Home, Menu, Search, ShoppingCart, X } from 'lucide-react';
import {
  categories,
  categoryRoute,
  collectionTitle,
  defaultSettings,
  orderTotal,
  parseOrderForm,
  productRoute,
  productsForCollection,
  productsForCategory,
  searchProducts,
  searchRoute,
  type CartItem,
  type CollectionId,
  type Product,
  type StoreSettings,
  type StoredOrder,
} from '../../storefrontRuntime';
import { TanjaMallLogo } from '../brand/TanjaMallLogo';
import { ProductCard } from './ProductCard';
import { AdminSidebar } from '../admin/AdminLayout';

type StoreActions = {
  cartCount: number;
  products: Product[];
  settings: StoreSettings;
  onNavigate: (route: string) => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenProduct: (slug: string) => void;
  onAddToCart: (item: CartItem) => void;
  onOrderProduct: (item: CartItem) => void;
  onPlaceOrder: (items: CartItem[], source: string, event: FormEvent<HTMLFormElement>) => void;
};

export function SiteHeader({
  cartCount,
  onNavigate,
  onOpenCart,
  onOpenSearch,
}: {
  cartCount: number;
  onNavigate: (route: string) => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const route = window.location.hash || '#/';
  const navButtonClass = (active = false) => `tm-press rounded-md px-2 py-2 ${active ? 'bg-white/14 text-white' : 'text-white/82 hover:bg-white/10 hover:text-white'}`;

  const openCategories = () => {
    window.sessionStorage.setItem('tm-open-categories', '1');
    onNavigate('#/');
  };

  return (
    <header className="tm-site-header fixed inset-x-0 top-0 z-50 text-white shadow-[0_14px_36px_rgba(19,25,33,0.2)]" style={{ background: 'var(--tm-header-alpha)' }}>
      <nav className="mx-auto grid min-h-[64px] w-full max-w-[1180px] grid-cols-[44px_1fr_44px] items-center gap-3 px-4 sm:px-6 lg:flex lg:justify-between lg:px-8">
        <button type="button" aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(value => !value)} className="tm-press tm-touch grid h-11 w-11 place-items-center rounded-md bg-white/10 lg:hidden">
          <span className={`tm-menu-icon-toggle ${mobileMenuOpen ? 'is-open' : ''}`} aria-hidden="true">
            <Menu className="tm-menu-icon tm-menu-icon-menu h-6 w-6" strokeWidth={2.4} />
            <X className="tm-menu-icon tm-menu-icon-close h-6 w-6" strokeWidth={2.4} />
          </span>
        </button>

        <button type="button" onClick={() => onNavigate('#/')} className="tm-press mx-auto min-w-0 text-center lg:mx-0 lg:text-right">
          <TanjaMallLogo compact textClassName="text-white text-xl sm:text-2xl" />
        </button>

        <div className="hidden items-center gap-2 text-sm font-bold lg:flex">
          <button type="button" onClick={() => onNavigate('#/')} className={navButtonClass(route === '#/' || route === '')} aria-current={route === '#/' || route === '' ? 'page' : undefined}>الرئيسية</button>
          <button type="button" onClick={openCategories} className={navButtonClass(route.startsWith('#/category'))}>الأقسام</button>
          <button type="button" onClick={() => onNavigate('#/about')} className={navButtonClass(route === '#/about')} aria-current={route === '#/about' ? 'page' : undefined}>من نحن</button>
          <button type="button" onClick={() => onNavigate('#/contact')} className={navButtonClass(route === '#/contact')} aria-current={route === '#/contact' ? 'page' : undefined}>تواصل</button>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenSearch} className="tm-press tm-touch hidden items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)] lg:inline-flex" aria-label="فتح البحث">
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
      <MobileMenuDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onNavigate={onNavigate} />
    </header>
  );
}

export function MobileMenuDrawer({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}) {
  if (!open) return null;

  const goHomeSection = (sectionId?: string) => {
    if (sectionId) window.sessionStorage.setItem('tm-open-section', sectionId);
    onClose();
    onNavigate('#/');
    window.setTimeout(() => {
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
    window.setTimeout(() => {
      if (sectionId) document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 260);
  };

  const items = [
    ['الرئيسية', () => goHomeSection()],
    ['الأقسام', () => goHomeSection('categories')],
    ['الأكثر طلبا', () => goHomeSection('products')],
    ['وصل حديثا', () => goHomeSection('new-arrivals')],
    ['التوصيل', () => goHomeSection('policies')],
    ['تواصل معنا', () => { onClose(); onNavigate('#/contact'); }],
  ] as const;

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-[80] text-[#17201b] lg:hidden" role="dialog" aria-modal="true" aria-label="القائمة" onClick={onClose}>
      <aside className="tm-mobile-menu-panel pointer-events-auto absolute right-0 top-0 w-max max-w-[calc(100vw-1.5rem)] rounded-bl-lg py-3 pl-5 pr-3" dir="rtl" onClick={event => event.stopPropagation()}>
        <nav className="grid w-max max-w-full gap-1.5 text-sm font-black [justify-items:right]">
          {items.map(([label, action]) => (
            <button key={label} type="button" onClick={action} className="tm-press tm-button-secondary w-full min-w-[126px] bg-[var(--tm-surface-white)] px-3.5 text-right leading-none shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_10px_28px_rgba(0,0,0,0.18)]">
              {label}
            </button>
          ))}
        </nav>
      </aside>
    </div>
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
    <footer className="bg-[var(--tm-header)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 lg:grid-cols-[1.1fr_0.9fr_1fr]">
        <div>
          <TanjaMallLogo textClassName="text-white text-2xl" />
          <p className="tm-copy mt-4 max-w-[360px] text-sm font-semibold leading-7 text-white/68">
            منتجات مختارة، طلب عبر واتساب، ودفع عند الاستلام داخل طنجة.
          </p>
        </div>
        <nav className="grid gap-2 text-sm font-semibold text-white/72">
          {links.map(([label, route]) => (
            <button key={route} type="button" onClick={() => onNavigate(route)} className="tm-press tm-touch rounded-md px-2 text-right">
              {label}
            </button>
          ))}
        </nav>
        <div className="grid content-start gap-2 text-sm font-semibold text-white/72">
          {categories.slice(0, 5).map(category => (
            <button key={category.id} type="button" onClick={() => onNavigate(categoryRoute(category.id))} className="tm-press tm-touch rounded-md px-2 text-right">
              {category.title}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-[1180px] flex-col gap-3 border-t border-white/10 pt-5 text-xs font-bold text-white/54 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 TanjaMall</p>
        <p>الدفع عند الاستلام داخل طنجة</p>
      </div>
    </footer>
  );
}

export function CategoryPage(props: StoreActions & { categoryId: string | null }) {
  const activeCategory = categories.find(category => category.id === props.categoryId) || categories[0];
  const listedProducts = productsForCategory(props.products, activeCategory.id);

  return (
    <PageShell cartCount={props.cartCount} onNavigate={props.onNavigate} onOpenCart={props.onOpenCart} onOpenSearch={props.onOpenSearch}>
      <main className="overflow-x-hidden">
        <section className="bg-[var(--tm-header)] text-white">
          <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">
            <div className="tm-breadcrumb text-xs sm:text-sm">
              <button type="button" onClick={() => props.onNavigate('#/')} className="tm-breadcrumb-link">الرئيسية</button>
              <span className="tm-breadcrumb-dot" />
              <span className="tm-breadcrumb-current">{activeCategory.title}</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <ProductGrid {...props} products={listedProducts} />
          </div>
        </section>
      </main>
    </PageShell>
  );
}

export function CollectionPage(props: StoreActions & { collectionId: CollectionId }) {
  const title = collectionTitle(props.collectionId);
  const listedProducts = productsForCollection(props.products, props.collectionId);

  return (
    <PageShell cartCount={props.cartCount} onNavigate={props.onNavigate} onOpenCart={props.onOpenCart} onOpenSearch={props.onOpenSearch}>
      <main className="overflow-x-hidden">
        <section className="bg-[var(--tm-header)] text-white">
          <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">
            <div className="tm-breadcrumb text-xs sm:text-sm">
              <button type="button" onClick={() => props.onNavigate('#/')} className="tm-breadcrumb-link">Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</button>
              <span className="tm-breadcrumb-dot" />
              <span className="tm-breadcrumb-current">{title}</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="tm-panel-white mb-4 flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-heading text-2xl font-black text-[#17201b] sm:text-3xl">{title}</h1>
            {props.collectionId !== 'all' ? <p className="tm-num text-sm font-black text-[#68736c]">{listedProducts.length} {'\u0645\u0646\u062a\u062c'}</p> : null}
          </div>
          <div className="min-w-0">
            <ProductGrid {...props} products={listedProducts} columns="lg:grid-cols-4" />
          </div>
        </section>
      </main>
    </PageShell>
  );
}

export function SearchResultsPage(props: StoreActions & { query: string }) {
  const [query, setQuery] = useState(props.query);
  const results = useMemo(() => props.query.trim() ? searchProducts(props.products, props.query) : [], [props.products, props.query]);

  useEffect(() => setQuery(props.query), [props.query]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onNavigate(query.trim() ? searchRoute(query) : '#/search');
  };

  return (
    <PageShell cartCount={props.cartCount} onNavigate={props.onNavigate} onOpenCart={props.onOpenCart} onOpenSearch={props.onOpenSearch}>
      <main className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="tm-shell-dark rounded-lg p-4 text-white sm:p-7">
          <div className="tm-breadcrumb text-sm">
            <button type="button" onClick={() => props.onNavigate('#/')} className="tm-breadcrumb-link">الرئيسية</button>
            <span className="tm-breadcrumb-dot" />
            <span className="tm-breadcrumb-current">نتائج البحث</span>
          </div>
          <h1 className="tm-heading mt-2 font-heading text-[32px] font-black leading-tight sm:text-5xl">{props.query ? `نتائج البحث عن "${props.query}"` : 'البحث'}</h1>
          <form onSubmit={submit} className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <span className="sr-only">بحث</span>
              <input className="min-h-[52px] w-full rounded-md border border-white/16 bg-white px-4 pl-24 text-base font-bold text-[#17201b] outline-none sm:min-h-[56px] sm:text-lg" value={query} onChange={event => setQuery(event.target.value)} type="search" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-[#fff3df] px-2.5 py-1 text-[11px] font-black text-[#b45309] sm:left-4 sm:text-xs">{results.length} نتيجة</span>
            </label>
            <button className="tm-press tm-button-primary px-7 text-base sm:min-h-[56px]" type="submit">بحث</button>
          </form>
        </section>

        {props.query.trim() ? <section className="mt-5 grid gap-5">
          <div className="min-w-0">
            <div className="tm-panel-white hidden items-center justify-between p-4 lg:flex">
              <p className="font-heading text-xl font-black">{results.length} منتج</p>
              <p className="tm-copy tm-text-muted text-sm font-semibold">نتائج مطابقة للكلمات التي كتبتها</p>
            </div>
            <ProductGrid {...props} products={results} columns="lg:grid-cols-4" />
          </div>
        </section> : null}
      </main>
    </PageShell>
  );
}

export function InfoPage({
  page,
  cartCount,
  onNavigate,
  onOpenCart,
  onOpenSearch,
  settings,
}: {
  page: string;
  cartCount: number;
  onNavigate: (route: string) => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  settings: StoreSettings;
}) {
  const data = infoPages[page] || infoPages.about;

  return (
    <PageShell cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart} onOpenSearch={onOpenSearch}>
      <main>
        <section className="bg-[var(--tm-header)] px-4 py-10 text-white sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-[1180px]">
            <div className="tm-breadcrumb text-sm">
              <button type="button" onClick={() => onNavigate('#/')} className="tm-breadcrumb-link">الرئيسية</button>
              <span className="tm-breadcrumb-dot" />
              <span className="tm-breadcrumb-current">{data.eyebrow}</span>
            </div>
            <h1 className="tm-heading mt-3 max-w-[780px] font-heading text-[38px] font-black leading-tight sm:text-5xl lg:text-6xl">{data.title}</h1>
            {data.copy ? <p className="tm-body-copy mt-4 max-w-[680px] text-base text-white/74 sm:text-lg">{data.copy}</p> : null}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-4 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {data.blocks.map(block => (
            <article key={block.title} className="tm-panel-white p-4 sm:p-5">
              <h2 className="tm-heading font-heading text-2xl font-black">{block.title}</h2>
              <p className="tm-copy tm-text-muted mt-2 text-sm font-semibold leading-8 sm:text-base">{block.text.replace('{city}', settings.city)}</p>
            </article>
          ))}
        </section>
      </main>
    </PageShell>
  );
}

export function NotFoundPage({ cartCount, onNavigate, onOpenCart, onOpenSearch }: { cartCount: number; onNavigate: (route: string) => void; onOpenCart: () => void; onOpenSearch: () => void }) {
  return (
    <PageShell cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart} onOpenSearch={onOpenSearch}>
      <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-[var(--tm-header)] px-4 py-12 text-center text-white">
        <section className="max-w-[680px]">
          <p className="tm-num font-heading text-8xl font-black text-[#ffb84d]">404</p>
          <h1 className="tm-heading mt-4 font-heading text-4xl font-black sm:text-6xl">الصفحة غير موجودة</h1>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => onNavigate('#/')} className="tm-press tm-button-primary px-6 text-base">الرئيسية</button>
            <button type="button" onClick={() => onNavigate(categoryRoute(categories[0].id))} className="tm-press tm-button-secondary bg-white/12 px-6 text-base text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]">الأقسام</button>
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
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyWidth = document.body.style.width;
    const focusableSelector = 'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])';

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'relative';
    document.body.style.width = '100%';

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
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.width = previousBodyWidth;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="tm-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center bg-[#131921]/72 p-3 text-[#17201b] sm:p-5 lg:justify-end" role="dialog" aria-modal="true" aria-labelledby="tm-cart-title" aria-describedby={items.length > 0 ? 'tm-cart-summary' : 'tm-cart-empty'} dir="rtl" data-cart-dialog onClick={onClose}>
      <section className={`tm-cart-drawer tm-panel flex w-full max-w-[440px] flex-col overflow-hidden ${items.length > 0 ? 'h-[calc(100vh-24px)] max-h-[820px]' : 'max-h-[calc(100vh-24px)]'}`} onClick={event => event.stopPropagation()}>
        <header className="flex items-center justify-between gap-3 border-b border-[var(--tm-border)] px-4 py-3">
          <div>
            <h2 id="tm-cart-title" className="font-heading text-2xl font-black">إتمام الطلب</h2>
            <p className="tm-num tm-text-muted mt-1 text-xs font-bold">{items.length} منتج</p>
          </div>
          <button aria-label="إغلاق السلة" onClick={onClose} className="tm-press tm-icon-button bg-[var(--tm-surface-tint)] text-xl font-black" type="button">×</button>
        </header>

        <div className={`${items.length > 0 ? 'flex-1 overflow-auto' : ''} p-3 sm:p-4`}>
          {items.length > 0 ? (
            <div className="grid gap-2">
              {items.map((item) => (
                <article key={`${item.id}-${item.variant || ''}`} className="tm-panel-white grid grid-cols-[64px_minmax(0,1fr)] gap-3 p-2.5">
                  <img src={item.image} alt={item.title} className="tm-image h-16 w-16 rounded-md object-cover" loading="lazy" decoding="async" width="128" height="128" />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="tm-product-card-title line-clamp-2 text-sm">{item.title}</h2>
                        {item.variant ? <p className="tm-text-muted mt-1 text-xs font-bold">{item.variant}</p> : null}
                        <p className="tm-num mt-1 text-[11px] font-black text-[#68736c]">{item.priceLabel} x {item.quantity}</p>
                      </div>
                      {!directItem ? <button aria-label={`حذف ${item.title} من السلة`} onClick={() => onRemove(item.id, item.variant)} className="tm-press tm-icon-button shrink-0 bg-[var(--tm-warning-soft)] text-sm font-black text-[var(--tm-warning)]" type="button">×</button> : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-md border border-[var(--tm-border)]">
                        <button aria-label="تقليل الكمية" className="tm-press tm-touch grid place-items-center font-black" type="button" onClick={() => onQuantityChange(item.id, item.variant, item.quantity - 1)}>-</button>
                        <span className="tm-num grid h-11 w-10 place-items-center border-x border-[#d9e1dc] text-sm font-black">{item.quantity}</span>
                        <button aria-label="زيادة الكمية" className="tm-press tm-touch grid place-items-center font-black" type="button" onClick={() => onQuantityChange(item.id, item.variant, item.quantity + 1)}>+</button>
                      </div>
                      <p className="tm-num tm-price-text font-heading text-lg font-black">{item.price * item.quantity} {'\u062f\u0631\u0647\u0645'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[112px] place-items-center py-3 text-center">
              <div>
            <p id="tm-cart-empty" className="tm-heading font-heading text-xl font-black">السلة فارغة</p>
                <button onClick={onClose} className="tm-press tm-button-dark mt-3 px-5 text-sm" type="button">متابعة التسوق</button>
              </div>
            </div>
          )}

          {items.length > 0 ? <form id="tm-cart-order-form" className="tm-panel-white mt-4 grid scroll-mt-24 gap-3 p-3" onSubmit={event => onPlaceOrder(items, directItem ? 'direct-product' : 'cart', event)}>
            <div>
              <h2 className="tm-heading font-heading text-xl font-black">معلومات العميل</h2>
              <p id="tm-cart-form-help" className="tm-field-help">اكتب بيانات واضحة حتى نؤكد الطلب عبر واتساب قبل التوصيل.</p>
            </div>
            <label className="grid gap-1" htmlFor="tm-cart-name">
              <span className="tm-field-label">الاسم الكامل *</span>
              <input id="tm-cart-name" required name="name" className="tm-field bg-[var(--tm-surface-soft)]" autoComplete="name" enterKeyHint="next" aria-describedby="tm-cart-form-help" />
            </label>
            <label className="grid gap-1" htmlFor="tm-cart-phone">
              <span className="tm-field-label">رقم الهاتف *</span>
              <input id="tm-cart-phone" required name="phone" className="tm-field bg-[var(--tm-surface-soft)]" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" aria-describedby="tm-cart-form-help" />
            </label>
            <label className="grid gap-1" htmlFor="tm-cart-address">
              <span className="tm-field-label">العنوان داخل طنجة *</span>
              <input id="tm-cart-address" required name="address" className="tm-field bg-[var(--tm-surface-soft)]" autoComplete="address-line1" enterKeyHint="next" aria-describedby="tm-cart-form-help" />
            </label>
            <label className="grid gap-1" htmlFor="tm-cart-note">
              <span className="tm-field-label">ملاحظة اختيارية</span>
              <textarea id="tm-cart-note" name="note" enterKeyHint="send" className="min-h-[76px] rounded-md border border-[var(--tm-border-strong)] bg-[var(--tm-surface-soft)] px-3 py-2 text-sm font-semibold leading-6 outline-none focus:border-[var(--tm-brand-strong)]" aria-describedby="tm-cart-form-help" />
            </label>
          </form> : null}
        </div>

        {items.length > 0 ? <footer className="border-t border-[var(--tm-border)] bg-[var(--tm-surface-white)] p-3 sm:p-4" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div id="tm-cart-summary" className="mb-3 grid gap-1 text-sm font-bold">
            <div className="flex justify-between"><span>المجموع</span><span className="tm-num tm-price-text font-heading text-lg font-black">{total} {'\u062f\u0631\u0647\u0645'}</span></div>
            <p className="tm-copy tm-text-muted text-xs leading-5">لا يوجد دفع مسبق. نؤكد تفاصيل الطلب معك قبل الإرسال.</p>
          </div>
          <button form="tm-cart-order-form" disabled={items.length === 0} className="tm-press tm-button-primary min-h-[52px] w-full px-5 text-base" type="submit">إرسال الطلب عبر واتساب</button>
          <button onClick={onClose} className="tm-press tm-button-secondary mt-2 w-full px-5 text-sm" type="button">متابعة التسوق</button>
        </footer> : null}
      </section>
    </div>
  );
}

export function AdminLogin({
  error,
  loading,
  onLogin,
}: {
  error: string;
  loading: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    await onLogin(email, password);
    setSubmitting(false);
  };

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-[#131921] px-4 text-[#17201b]">
      <form onSubmit={submit} className="w-full max-w-[420px] rounded-lg bg-[#fffdf8] p-5 shadow-[0_34px_90px_rgba(0,0,0,0.34)]">
        <p className="font-heading text-3xl font-black">دخول الإدارة</p>
        <div className="mt-5 grid gap-3">
          <input className="min-h-[48px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-4 font-bold outline-none focus:border-[#b45309]" placeholder="البريد الإلكتروني" type="email" value={email} onChange={event => setEmail(event.target.value)} required disabled={loading || submitting} />
          <input className="min-h-[48px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-4 font-bold outline-none focus:border-[#b45309]" placeholder="كلمة المرور" type="password" value={password} onChange={event => setPassword(event.target.value)} required disabled={loading || submitting} />
          <button className="min-h-[50px] rounded-md bg-[#ff9900] px-5 font-black text-[#131921] disabled:opacity-60" type="submit" disabled={loading || submitting}>{loading || submitting ? 'جار التحقق' : 'دخول'}</button>
          {error ? <p className="rounded-md bg-[#fff1d5] px-3 py-2 text-sm font-black text-[#9a5a00]">{error}</p> : null}
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
              <p className="tm-admin-num font-heading text-2xl font-black text-[#b45309]">{order.total} درهم</p>
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
                  <p className="tm-admin-num mt-1 text-sm font-black text-[#b45309]">{item.quantity} x {item.priceLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <aside className="rounded-md bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)]">
          <h2 className="font-heading text-2xl font-black">العميل</h2>
          <div className="mt-4 grid gap-2 text-sm font-bold text-[#65716a]">
            <p>{order.name}</p>
            <button className="text-right text-[#b45309]" type="button" onClick={() => onNavigate(`#/admin/customers/${encodeURIComponent(order.phone)}`)}>{order.phone}</button>
            <p>{order.address}</p>
            {order.note ? <p>{order.note}</p> : null}
          </div>
          <p className="tm-admin-num mt-5 border-t border-[#dfe5df] pt-4 font-heading text-3xl font-black text-[#b45309]">{order.total} درهم</p>
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
        <button type="submit" className="min-h-[48px] rounded-md bg-[#ff9900] px-5 font-black text-[#131921]">حفظ</button>
        {saved ? <p className="text-sm font-black text-[#b45309]">تم الحفظ</p> : null}
      </form>
    </AdminShell>
  );
}

function PageShell({ cartCount, onNavigate, onOpenCart, onOpenSearch, children }: { cartCount: number; onNavigate: (route: string) => void; onOpenCart: () => void; onOpenSearch: () => void; children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-[var(--tm-bg)] pb-[calc(76px+env(safe-area-inset-bottom))] pt-16 text-[var(--tm-ink)] md:pb-0">
      <SiteHeader cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart} onOpenSearch={onOpenSearch} />
      {children}
      <SiteFooter onNavigate={onNavigate} />
      <MobileNav cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart} onOpenSearch={onOpenSearch} />
    </div>
  );
}

function MobileNav({ cartCount, onNavigate, onOpenCart, onOpenSearch }: { cartCount: number; onNavigate: (route: string) => void; onOpenCart: () => void; onOpenSearch: () => void }) {
  const route = window.location.hash || '#/';
  const isHome = route === '#/' || route === '';
  const isSearch = route.startsWith('#/search');
  const openCategories = () => {
    window.sessionStorage.setItem('tm-open-categories', '1');
    onNavigate('#/');
  };
  const itemClass = (active: boolean) => `tm-press tm-touch rounded-md px-2 py-2 text-center text-xs font-black ${active ? 'tm-nav-active' : 'bg-[var(--tm-surface-tint)] text-[var(--tm-ink-muted)]'}`;
  const iconClass = (active: boolean) => `mx-auto mb-1 h-5 w-5 ${active ? 'text-white' : 'text-[#b45309]'}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--tm-surface-white)]/96 px-3 pt-2 shadow-[0_-12px_30px_rgba(23,32,27,0.14),0_0_0_1px_rgba(0,0,0,0.06)] md:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
      <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-2">
        <button type="button" onClick={() => onNavigate('#/')} className={itemClass(isHome)} aria-current={isHome ? 'page' : undefined}>
          <Home className={iconClass(isHome)} aria-hidden="true" strokeWidth={2.4} />
          الرئيسية
        </button>
        <button type="button" onClick={openCategories} className={itemClass(false)}>
          <Grid3X3 className={iconClass(false)} aria-hidden="true" strokeWidth={2.4} />
          الأقسام
        </button>
        <button type="button" onClick={onOpenCart} className={itemClass(false)} aria-label={`السلة، ${cartCount} منتج`}>
          <span className="relative mx-auto mb-1 block h-5 w-5">
            <ShoppingCart className="h-5 w-5 text-[#b45309]" aria-hidden="true" strokeWidth={2.4} />
            {cartCount ? <span key={cartCount} aria-live="polite" className="tm-num tm-cart-count-pop absolute -left-2 -top-2 min-w-4 rounded-full px-1 text-[10px] leading-4 text-white" style={{ background: 'var(--tm-brand)' }}>{cartCount}</span> : null}
          </span>
        </button>
        <button type="button" onClick={onOpenSearch} className={itemClass(isSearch)} aria-current={isSearch ? 'page' : undefined}>
          <Search className={iconClass(isSearch)} aria-hidden="true" strokeWidth={2.4} />
          بحث
        </button>
      </div>
    </div>
  );
}

function ProductGrid({ products, columns = 'lg:grid-cols-3', ...props }: StoreActions & { products: Product[]; columns?: string }) {
  if (!products.length) {
    return (
      <div className="tm-panel-white mt-5 p-6 text-center">
        <p className="tm-heading font-heading text-2xl font-black">لا توجد منتجات هنا حاليا</p>
        <p className="tm-copy tm-text-muted mx-auto mt-2 max-w-[420px] text-sm font-semibold leading-7">جرّب البحث بكلمة مختلفة أو ارجع للأقسام الرئيسية لاختيار منتج آخر.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => props.onNavigate('#/')} className="tm-press tm-button-dark px-5 text-sm">الرئيسية</button>
          <button type="button" onClick={() => { window.sessionStorage.setItem('tm-open-categories', '1'); props.onNavigate('#/'); }} className="tm-press tm-button-secondary px-5 text-sm">تصفح الأقسام</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid w-full max-w-full grid-cols-[repeat(2,minmax(0,1fr))] gap-2.5 sm:gap-4 lg:mt-5 ${columns}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} imagePriority={index < 2} onOpenProduct={props.onOpenProduct} onAddToCart={props.onAddToCart} onOrderProduct={props.onOrderProduct} />
      ))}
    </div>
  );
}

function AdminShell({ title, onNavigate, children }: { title: string; onNavigate: (route: string) => void; children: ReactNode }) {
  const nav = [
    ['لوحة التحكم', '#/admin'],
    ['إضافة منتج', '#/admin/products/new'],
    ['الطلبات', '#/admin/orders'],
    ['الإعدادات', '#/admin/settings'],
    ['المتجر', '#/'],
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f2eb] text-[#17201b]">
      <AdminSidebar onNavigate={onNavigate} />
      <div className="grid min-h-screen lg:grid-cols-[76px_minmax(0,1fr)]">
        <aside className="hidden">
          <div className="sticky top-0 flex h-screen flex-col px-4 py-5">
            <button type="button" onClick={() => onNavigate('#/')} className="flex items-center gap-3 px-2 text-right">
              <TanjaMallLogo textClassName="text-xl" />
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
        <main className="min-w-0 lg:col-start-2">
          <header className="sticky top-0 z-30 border-b border-[#d9dfd8] bg-[#f8f7f1]/94">
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
      <input value={value} onChange={event => onChange(event.target.value)} className="min-h-[44px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-bold outline-none focus:border-[#b45309]" />
    </label>
  );
}

const infoPages: Record<string, { eyebrow: string; title: string; copy?: string; blocks: Array<{ title: string; text: string }> }> = {
  about: {
    eyebrow: 'TanjaMall',
    title: 'شراء سريع، تأكيد إنساني، ودفع عند الباب.',
    copy: 'TanjaMall يجمع منتجات عملية للبيت، الهاتف، السفر، والجمال في تجربة طلب واضحة.',
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
