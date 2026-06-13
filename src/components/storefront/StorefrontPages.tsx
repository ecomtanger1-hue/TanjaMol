import { useEffect, useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { Copy, Grid3X3, Home, MapPin, Menu, MessageCircle, Phone, Search, ShoppingCart, UserRound, X } from 'lucide-react';
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
  type Category,
  type CartItem,
  type CollectionId,
  type Product,
  type StoreSettings,
  type StoredOrder,
} from '../../storefrontRuntime';
import { TanjaMallLogo } from '../brand/TanjaMallLogo';
import { ProductCard } from './ProductCard';
import { AdminSidebar } from '../admin/AdminLayout';
import { getCurrentRoute } from '../../lib/routing';

type StoreActions = {
  cartCount: number;
  products: Product[];
  settings: StoreSettings;
  categories: Category[];
  onNavigate: (route: string) => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenProduct: (slug: string) => void;
  onAddToCart: (item: CartItem) => void;
  onOrderProduct: (item: CartItem) => void;
  onPlaceOrder: (items: CartItem[], source: string, event: FormEvent<HTMLFormElement>) => void;
};

type ListingSort = 'newest' | 'price-asc' | 'price-desc' | 'availability';

const listingLabels = {
  home: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
  products: '\u0645\u0646\u062a\u062c\u0627\u062a',
  searchLabel: '\u0627\u0644\u0628\u062d\u062b \u062f\u0627\u062e\u0644 \u0647\u0630\u0647 \u0627\u0644\u0642\u0627\u0626\u0645\u0629',
  searchPlaceholder: '\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0646\u062a\u062c',
  sortLabel: '\u062a\u0631\u062a\u064a\u0628',
  newest: '\u0627\u0644\u0623\u062d\u062f\u062b',
  priceAsc: '\u0627\u0644\u0633\u0639\u0631: \u0645\u0646 \u0627\u0644\u0623\u0642\u0644',
  priceDesc: '\u0627\u0644\u0633\u0639\u0631: \u0645\u0646 \u0627\u0644\u0623\u0639\u0644\u0649',
  availability: '\u0627\u0644\u0645\u062a\u0648\u0641\u0631 \u0623\u0648\u0644\u0627',
  visible: '\u0645\u0639\u0631\u0648\u0636',
  from: '\u0645\u0646',
  clearSearch: '\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b',
  loadMore: '\u0639\u0631\u0636 \u0645\u0646\u062a\u062c\u0627\u062a \u0623\u0643\u062b\u0631',
  noResultsTitle: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c \u0645\u0637\u0627\u0628\u0642\u0629',
  noResultsCopy: '\u062c\u0631\u0628 \u0643\u0644\u0645\u0629 \u0623\u062e\u0631\u0649 \u0623\u0648 \u0627\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b \u0644\u0631\u0624\u064a\u0629 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a.',
};

const listingPageSize = 8;

function listingProductDateValue(product: Product) {
  const value = Date.parse(product.createdAt || product.updatedAt || '');
  return Number.isFinite(value) ? value : 0;
}

function sortListingProducts(products: Product[], sort: ListingSort) {
  const sorted = products.map((product, index) => ({ product, index }));
  const unwrap = (rows: typeof sorted) => rows.map(row => row.product);
  if (sort === 'price-asc') return unwrap(sorted.sort((a, b) => a.product.price - b.product.price));
  if (sort === 'price-desc') return unwrap(sorted.sort((a, b) => b.product.price - a.product.price));
  if (sort === 'availability') {
    return unwrap(sorted.sort((a, b) => {
      const aStock = a.product.stock ?? 0;
      const bStock = b.product.stock ?? 0;
      return Number(bStock > 0) - Number(aStock > 0) || bStock - aStock;
    }));
  }
  return unwrap(sorted.sort((a, b) => listingProductDateValue(b.product) - listingProductDateValue(a.product) || a.index - b.index));
}

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
  const route = getCurrentRoute();
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

export function SiteFooter({ categories: footerCategories = categories, onNavigate }: { categories?: Category[]; onNavigate: (route: string) => void }) {
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
          {footerCategories.slice(0, 5).map(category => (
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
  const activeCategory = props.categories.find(category => category.id === props.categoryId) || props.categories[0] || categories[0];
  const listedProducts = productsForCategory(props.products, activeCategory.id, props.categories);

  return (
    <ProductListingPage
      {...props}
      title={activeCategory.title}
      products={listedProducts}
      showCount
    />
  );
}

export function CollectionPage(props: StoreActions & { collectionId: CollectionId }) {
  const title = collectionTitle(props.collectionId);
  const listedProducts = productsForCollection(props.products, props.collectionId);

  return (
    <ProductListingPage
      {...props}
      title={title}
      products={listedProducts}
      showCount={props.collectionId !== 'all'}
      columns="lg:grid-cols-4"
    />
  );
}

function ProductListingPage({
  title,
  products,
  showCount = false,
  columns = 'lg:grid-cols-3',
  ...props
}: StoreActions & {
  title: string;
  products: Product[];
  showCount?: boolean;
  columns?: string;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ListingSort>('newest');
  const [visibleCount, setVisibleCount] = useState(listingPageSize);
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    setQuery('');
    setSort('newest');
    setVisibleCount(listingPageSize);
  }, [title]);

  useEffect(() => {
    setVisibleCount(listingPageSize);
  }, [query, sort, products]);

  const filteredProducts = useMemo(() => {
    const searched = normalizedQuery
      ? products.filter(product => [product.title, product.category, product.badge, product.description].join(' ').toLowerCase().includes(normalizedQuery))
      : products;
    return sortListingProducts(searched, sort);
  }, [normalizedQuery, products, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleProducts.length < filteredProducts.length;

  return (
    <PageShell cartCount={props.cartCount} categories={props.categories} onNavigate={props.onNavigate} onOpenCart={props.onOpenCart} onOpenSearch={props.onOpenSearch}>
      <main className="overflow-x-hidden">
        <section className="bg-[var(--tm-header)] text-white">
          <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">
            <div className="tm-breadcrumb text-xs sm:text-sm">
              <button type="button" onClick={() => props.onNavigate('#/')} className="tm-breadcrumb-link">{listingLabels.home}</button>
              <span className="tm-breadcrumb-dot" />
              <span className="tm-breadcrumb-current">{title}</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="tm-panel-white mb-3 grid gap-3 p-3 sm:mb-4 sm:gap-4 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-heading text-xl font-black leading-tight text-[#17201b] sm:text-3xl">{title}</h1>
              </div>
              {showCount ? <p className="tm-num shrink-0 text-xs font-black text-[#68736c] sm:text-sm">{filteredProducts.length} {'\u0645\u0646\u062a\u062c'}</p> : null}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_128px] gap-2 sm:gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="grid gap-1">
                <span className="sr-only md:not-sr-only md:text-xs md:font-black md:text-[#65716a]">{listingLabels.searchLabel}</span>
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  className="tm-field min-h-[44px] bg-[var(--tm-surface-soft)] text-sm"
                  type="search"
                  placeholder={listingLabels.searchPlaceholder}
                />
              </label>
              <label className="grid gap-1">
                <span className="sr-only md:not-sr-only md:text-xs md:font-black md:text-[#65716a]">{listingLabels.sortLabel}</span>
                <select
                  value={sort}
                  onChange={event => setSort(event.target.value as ListingSort)}
                  className="tm-field min-h-[44px] bg-[var(--tm-surface-soft)] text-sm"
                  aria-label={listingLabels.sortLabel}
                >
                  <option value="newest">{listingLabels.newest}</option>
                  <option value="price-asc">{listingLabels.priceAsc}</option>
                  <option value="price-desc">{listingLabels.priceDesc}</option>
                  <option value="availability">{listingLabels.availability}</option>
                </select>
              </label>
            </div>

            <div className="hidden flex-wrap items-center justify-between gap-2 text-xs font-black text-[#68736c] sm:flex">
              {showCount ? <p className="tm-num">{listingLabels.visible}: {visibleProducts.length} {listingLabels.from} {filteredProducts.length}</p> : <span />}
              {query.trim() ? <button type="button" onClick={() => setQuery('')} className="tm-press min-h-[34px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">{listingLabels.clearSearch}</button> : null}
            </div>
          </div>

          <div className="min-w-0">
            {visibleProducts.length ? (
              <>
                <ProductGrid {...props} products={visibleProducts} columns={columns} />
                {hasMore ? (
                  <div className="mt-5 grid place-items-center">
                    <button type="button" onClick={() => setVisibleCount(current => current + listingPageSize)} className="tm-press tm-button-dark px-6 text-sm">
                      {listingLabels.loadMore}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="tm-panel-white mt-5 p-6 text-center">
                <p className="tm-heading font-heading text-2xl font-black">{listingLabels.noResultsTitle}</p>
                <p className="tm-copy tm-text-muted mx-auto mt-2 max-w-[420px] text-sm font-semibold leading-7">{listingLabels.noResultsCopy}</p>
                <button type="button" onClick={() => setQuery('')} className="tm-press tm-button-secondary mt-5 px-5 text-sm">{listingLabels.clearSearch}</button>
              </div>
            )}
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
    <PageShell cartCount={props.cartCount} categories={props.categories} onNavigate={props.onNavigate} onOpenCart={props.onOpenCart} onOpenSearch={props.onOpenSearch}>
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

type OrderStatus = StoredOrder['status'];
type OrderFilter = 'all' | OrderStatus;
type OrderSort = 'newest' | 'oldest' | 'total-high' | 'total-low';

type OrderActionProps = {
  onNavigate: (route: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
};

const orderStatusMeta: Record<OrderStatus, { label: string; tone: string }> = {
  new: { label: 'جديد', tone: 'bg-[#e9f6ef] text-[#17623a]' },
  whatsapp: { label: 'بانتظار التأكيد', tone: 'bg-[#fff3df] text-[#9a5a00]' },
  confirmed: { label: 'مؤكد', tone: 'bg-[#e9f6ef] text-[#17623a]' },
  delivery: { label: 'في التوصيل', tone: 'bg-[#eaf1ff] text-[#22559c]' },
  done: { label: 'مكتمل', tone: 'bg-[#eef3ef] text-[#65716a]' },
};

const orderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: 'new', label: 'جديد' },
  { value: 'whatsapp', label: 'بانتظار التأكيد' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'delivery', label: 'في التوصيل' },
  { value: 'done', label: 'مكتمل' },
];

const orderFilters: Array<{ value: OrderFilter; label: string }> = [
  { value: 'all', label: 'كل الطلبات' },
  { value: 'new', label: 'جديدة' },
  { value: 'whatsapp', label: 'بانتظار التأكيد' },
  { value: 'confirmed', label: 'مؤكدة' },
  { value: 'delivery', label: 'في التوصيل' },
  { value: 'done', label: 'مكتملة' },
];

const orderWhatsappSentKey = 'tanjamall.admin.orderWhatsappStatusSent.v1';
const orderWhatsappSentEvent = 'tanjamall-admin-order-whatsapp-sent';

function orderDate(order: StoredOrder) {
  return new Intl.DateTimeFormat('ar-MA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(order.createdAt));
}

function orderRelative(order: StoredOrder) {
  const created = new Date(order.createdAt).getTime();
  const hours = Math.max(0, Math.round((Date.now() - created) / 36e5));
  if (hours < 1) return 'الآن';
  if (hours < 24) return `منذ ${hours} س`;
  return orderDate(order);
}

function orderItemsSummary(order: StoredOrder) {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  if (!order.items.length) return 'بدون منتجات';
  return `${count.toLocaleString('fr-MA')} قطعة · ${order.items[0].title}${order.items.length > 1 ? ` +${order.items.length - 1}` : ''}`;
}

function normalizeOrderText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeWhatsappPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `212${digits.slice(1)}`;
  if (digits.startsWith('212')) return digits;
  if (digits.length === 9) return `212${digits}`;
  return digits;
}

function orderProductsMessage(order: StoredOrder) {
  return order.items.map((item, index) => {
    const variant = item.variant ? ` - ${item.variant}` : '';
    return `${index + 1}. ${item.title}${variant} x ${item.quantity}`;
  }).join('\n');
}

function customerWhatsappMessage(order: StoredOrder, settings: StoreSettings) {
  const storeName = settings.storeName || defaultSettings.storeName;
  const greeting = `مرحبا ${order.name}، معك فريق ${storeName}.`;
  const statusCopy: Record<OrderStatus, string> = {
    new: `توصلنا بطلبك رقم ${order.id}. المرجو تأكيد العنوان والمنتجات لكي نكمل التحضير.`,
    whatsapp: `توصلنا بطلبك رقم ${order.id}. هل تؤكد لنا الطلب والعنوان من فضلك؟`,
    confirmed: `تم تأكيد طلبك رقم ${order.id}. سنحضره للتوصيل ونتواصل معك إذا احتجنا أي توضيح.`,
    delivery: `طلبك رقم ${order.id} في طريقه للتوصيل. المرجو إبقاء الهاتف قريبا منك.`,
    done: `نتمنى أن يكون طلبك رقم ${order.id} وصل بخير. شكرا لثقتك في ${storeName}.`,
  };
  const details = [
    greeting,
    statusCopy[order.status],
    '',
    'ملخص الطلب:',
    orderProductsMessage(order),
    '',
    `المجموع: ${order.total.toLocaleString('fr-MA')} درهم`,
    `العنوان: ${order.address}`,
  ];

  return details.filter(Boolean).join('\n');
}

function buildCustomerWhatsappUrl(order: StoredOrder, settings: StoreSettings) {
  const phone = normalizeWhatsappPhone(order.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(customerWhatsappMessage(order, settings))}`;
}

function readOrderWhatsappSentMap() {
  try {
    return JSON.parse(localStorage.getItem(orderWhatsappSentKey) || '{}') as Record<string, OrderStatus>;
  } catch {
    return {};
  }
}

function writeOrderWhatsappSentStatus(orderId: string, status: OrderStatus) {
  const next = { ...readOrderWhatsappSentMap(), [orderId]: status };
  localStorage.setItem(orderWhatsappSentKey, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(orderWhatsappSentEvent, { detail: { orderId, status } }));
}

function useOrderWhatsappSent(order: StoredOrder) {
  const [sentStatus, setSentStatus] = useState<OrderStatus | undefined>(() => readOrderWhatsappSentMap()[order.id]);

  useEffect(() => {
    setSentStatus(readOrderWhatsappSentMap()[order.id]);

    const onSent = (event: Event) => {
      const detail = (event as CustomEvent<{ orderId: string; status: OrderStatus }>).detail;
      if (detail?.orderId === order.id) setSentStatus(detail.status);
    };

    window.addEventListener(orderWhatsappSentEvent, onSent);
    return () => window.removeEventListener(orderWhatsappSentEvent, onSent);
  }, [order.id, order.status]);

  return {
    isSentForCurrentStatus: sentStatus === order.status,
    markSent: () => {
      writeOrderWhatsappSentStatus(order.id, order.status);
      setSentStatus(order.status);
    },
  };
}

function stopAction(event: MouseEvent<HTMLElement>) {
  event.stopPropagation();
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = orderStatusMeta[status];
  return <span className={`inline-flex min-h-[30px] items-center rounded-md px-2.5 text-xs font-black ${meta.tone}`}>{meta.label}</span>;
}

function OrderStatusSelect({ order, onUpdateOrderStatus, compact = false }: {
  order: StoredOrder;
  compact?: boolean;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}) {
  return (
    <label className={compact ? 'min-w-0' : 'col-span-2 min-w-0 sm:col-span-1 sm:min-w-[154px]'}>
      <span className="sr-only">حالة الطلب</span>
      <select
        value={order.status}
        onClick={stopAction}
        onChange={event => onUpdateOrderStatus(order.id, event.target.value as OrderStatus)}
        aria-label={`تغيير حالة الطلب ${order.id}`}
        className={`min-h-[42px] w-full rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-2 text-xs font-black text-[#17201b] outline-none focus:border-[#b45309] ${compact ? 'text-center' : ''}`}
      >
        {orderStatusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function OrderQuickActions({ order, settings, onNavigate, onUpdateOrderStatus, compact = false }: {
  order: StoredOrder;
  settings: StoreSettings;
  compact?: boolean;
} & OrderActionProps) {
  const { isSentForCurrentStatus, markSent } = useOrderWhatsappSent(order);
  const buttonBase = compact
    ? 'tm-admin-press grid min-h-[42px] place-items-center rounded-md px-3 text-xs font-black'
    : 'tm-admin-press inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md px-3 text-xs font-black';
  const whatsappUrl = buildCustomerWhatsappUrl(order, settings);
  const whatsappStateClass = isSentForCurrentStatus
    ? 'border-[#a8d7bd] bg-[#e9f6ef] text-[#17623a]'
    : 'border-[#ff9900] bg-[#fff3df] text-[#9a5a00] shadow-[0_14px_30px_-24px_rgba(255,153,0,0.95)]';
  const whatsappLabel = isSentForCurrentStatus ? 'واتساب مرسل' : 'إرسال واتساب';

  return (
    <div className={`grid min-w-0 gap-2 ${compact ? 'grid-cols-[1fr_1fr_minmax(112px,1.15fr)]' : 'grid-cols-2 sm:grid-cols-[repeat(2,max-content)_minmax(154px,1fr)]'}`} onClick={stopAction}>
      <a href={`tel:${order.phone}`} className={`${buttonBase} border border-[#cfd8d1] bg-white text-[#17201b]`} aria-label={`اتصال ب ${order.name}`}>
        <Phone className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
        {!compact ? 'اتصال' : null}
      </a>
      <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={markSent} className={`${buttonBase} border ${whatsappStateClass}`} aria-label={`${whatsappLabel} إلى ${order.name}`} title={whatsappLabel}>
        <MessageCircle className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
        {!compact ? whatsappLabel : null}
      </a>
      <OrderStatusSelect order={order} onUpdateOrderStatus={onUpdateOrderStatus} compact={compact} />
    </div>
  );
}

function sortOrders(orders: StoredOrder[], sort: OrderSort) {
  const next = [...orders];
  if (sort === 'oldest') return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (sort === 'total-high') return next.sort((a, b) => b.total - a.total);
  if (sort === 'total-low') return next.sort((a, b) => a.total - b.total);
  return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function AdminOrdersPage({
  orders,
  settings,
  onNavigate,
  onUpdateOrderStatus,
}: {
  orders: StoredOrder[];
  settings: StoreSettings;
} & OrderActionProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [sort, setSort] = useState<OrderSort>('newest');
  const normalizedQuery = normalizeOrderText(query);
  const pendingOrders = orders.filter(order => order.status === 'new' || order.status === 'whatsapp');
  const todayOrders = orders.filter(order => new Date(order.createdAt).toDateString() === new Date().toDateString());
  const confirmedOrders = orders.filter(order => order.status === 'confirmed' || order.status === 'delivery');
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const visibleOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (!normalizedQuery) return true;
      const haystack = normalizeOrderText(`${order.id} ${order.name} ${order.phone} ${order.address} ${order.note || ''} ${order.items.map(item => `${item.title} ${item.variant || ''}`).join(' ')}`);
      return haystack.includes(normalizedQuery);
    });

    return sortOrders(filtered, sort);
  }, [filter, normalizedQuery, orders, sort]);

  return (
    <AdminShell
      title="الطلبات"
      eyebrow="إدارة الطلبات"
      onNavigate={onNavigate}
      actions={
        <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press hidden min-h-[38px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black sm:inline-flex">
          فتح المتجر
        </button>
      }
    >
      <section className="grid grid-cols-2 gap-2 sm:gap-3">
        {[
          ['بانتظار التأكيد', pendingOrders.length.toLocaleString('fr-MA')],
          ['طلبات اليوم', todayOrders.length.toLocaleString('fr-MA')],
          ['قيد التنفيذ', confirmedOrders.length.toLocaleString('fr-MA')],
          ['المداخيل', `${totalRevenue.toLocaleString('fr-MA')} درهم`],
        ].map(([label, value]) => (
          <article key={label} className="tm-admin-surface grid min-h-[92px] content-between rounded-md bg-white p-3 sm:min-h-[104px] sm:p-4">
            <p className="text-xs font-extrabold leading-5 text-[#65716a]">{label}</p>
            <p className="tm-admin-num mt-2 break-words font-heading text-xl font-black leading-tight text-[#17201b] sm:text-2xl">{value}</p>
          </article>
        ))}
      </section>

      <section className="tm-admin-surface overflow-hidden rounded-md bg-white">
        <div className="grid gap-3 border-b border-[#dfe5df] p-3 sm:p-4 xl:grid-cols-[minmax(280px,1fr)_190px_190px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65716a]" aria-hidden="true" strokeWidth={2.35} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="بحث بالاسم، الهاتف، العنوان أو المنتج"
              className="min-h-[44px] w-full rounded-md border border-[#cfd8d1] bg-[#fbfaf6] pr-9 pl-3 text-base font-bold outline-none focus:border-[#b45309] sm:text-sm"
              type="search"
            />
          </label>
          <select value={filter} onChange={event => setFilter(event.target.value as OrderFilter)} className="min-h-[44px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-black outline-none focus:border-[#b45309]">
            {orderFilters.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={sort} onChange={event => setSort(event.target.value as OrderSort)} className="min-h-[44px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-black outline-none focus:border-[#b45309]">
            <option value="newest">الأحدث أولا</option>
            <option value="oldest">الأقدم أولا</option>
            <option value="total-high">الأعلى قيمة</option>
            <option value="total-low">الأقل قيمة</option>
          </select>
        </div>

        <div className="grid gap-3 p-3 md:hidden">
          {visibleOrders.map(order => (
            <article key={order.id} className="rounded-md bg-[#fbfaf6] p-3 shadow-[inset_0_0_0_1px_rgba(23,32,27,0.08)]">
              <button type="button" onClick={() => onNavigate(`#/admin/orders/${order.id}`)} className="tm-admin-press w-full rounded-md bg-white p-3 text-right">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="tm-admin-num font-heading text-lg font-black">{order.id}</p>
                    <p className="mt-1 truncate text-sm font-black text-[#17201b]">{order.name}</p>
                    <p className="tm-admin-num mt-1 text-sm font-bold text-[#65716a]">{order.phone}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="tm-admin-num font-heading text-xl font-black text-[#b45309]">{order.total.toLocaleString('fr-MA')} درهم</p>
                    <p className="mt-1 text-xs font-black text-[#65716a]">{orderRelative(order)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-xs font-bold text-[#65716a]">{orderItemsSummary(order)}</span>
                </div>
              </button>
              <div className="mt-2">
                <OrderQuickActions order={order} settings={settings} onNavigate={onNavigate} onUpdateOrderStatus={onUpdateOrderStatus} compact />
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-[#f4f7f4] text-xs font-black text-[#65716a]">
              <tr>
                <th className="px-4 py-3 text-right">الطلب</th>
                <th className="px-4 py-3 text-right">العميل</th>
                <th className="px-4 py-3 text-right">المنتجات</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">الوقت</th>
                <th className="px-4 py-3 text-right">المجموع</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map(order => (
                <tr key={order.id} className="border-t border-[#e4e9e4] align-middle">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onNavigate(`#/admin/orders/${order.id}`)} className="tm-admin-press rounded-md px-2 py-1 text-right">
                      <span className="tm-admin-num block font-heading text-base font-black">{order.id}</span>
                      <span className="block text-xs font-bold text-[#65716a]">{order.source}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-black">{order.name}</p>
                    <button type="button" onClick={() => onNavigate(`#/admin/customers/${encodeURIComponent(order.phone)}`)} className="tm-admin-num mt-1 text-xs font-bold text-[#b45309]">{order.phone}</button>
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-xs font-bold leading-5 text-[#65716a]">{orderItemsSummary(order)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <p className="font-black">{orderRelative(order)}</p>
                    <p className="text-xs font-bold text-[#65716a]">{orderDate(order)}</p>
                  </td>
                  <td className="tm-admin-num px-4 py-3 font-heading text-lg font-black text-[#b45309]">{order.total.toLocaleString('fr-MA')} درهم</td>
                  <td className="px-4 py-3">
                    <OrderQuickActions order={order} settings={settings} onNavigate={onNavigate} onUpdateOrderStatus={onUpdateOrderStatus} />
                  </td>
                </tr>
              ))}
              {!visibleOrders.length ? (
                <tr className="border-t border-[#e4e9e4]">
                  <td colSpan={7} className="px-4 py-10 text-center font-bold text-[#65716a]">لا توجد طلبات مطابقة.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {!orders.length ? <div className="p-3"><EmptyAdmin title="لا توجد طلبات بعد" copy="عندما يصل طلب جديد سيظهر هنا مع أزرار الاتصال، واتساب، والتأكيد." /></div> : null}
      </section>
    </AdminShell>
  );
}

export function AdminOrderDetailPage({
  order,
  settings,
  onNavigate,
  onUpdateOrderStatus,
}: {
  order?: StoredOrder;
  settings: StoreSettings;
} & OrderActionProps) {
  if (!order) return <AdminShell title="الطلب" onNavigate={onNavigate}><EmptyAdmin title="الطلب غير موجود" copy="ربما تم تحديث القائمة أو حذف الطلب من قاعدة البيانات." /></AdminShell>;

  return (
    <AdminShell
      title={order.id}
      eyebrow="تفاصيل الطلب"
      onNavigate={onNavigate}
      actions={<OrderStatusBadge status={order.status} />}
    >
      <section className="grid min-w-0 gap-4 overflow-x-hidden xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid min-w-0 gap-4">
          <article className="tm-admin-surface min-w-0 rounded-md bg-white p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black text-[#65716a]">المجموع</p>
                <p className="tm-admin-num mt-1 break-words font-heading text-3xl font-black text-[#b45309] sm:text-4xl">{order.total.toLocaleString('fr-MA')} درهم</p>
              </div>
              <div className="grid gap-2 sm:text-left">
                <p className="text-sm font-black text-[#17201b]">{orderDate(order)}</p>
                <p className="text-xs font-bold text-[#65716a]">{orderRelative(order)} · {order.source}</p>
              </div>
            </div>
            <div className="mt-4 grid min-w-0 gap-2 sm:flex sm:flex-wrap">
              <OrderQuickActions order={order} settings={settings} onNavigate={onNavigate} onUpdateOrderStatus={onUpdateOrderStatus} />
              <button type="button" onClick={() => navigator.clipboard?.writeText(`${order.name}\n${order.phone}\n${order.address}`).catch(() => undefined)} className="tm-admin-press inline-flex min-h-[40px] min-w-0 items-center justify-center gap-2 rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">
                <Copy className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
                نسخ بيانات العميل
              </button>
            </div>
          </article>

          <article className="tm-admin-surface min-w-0 rounded-md bg-white p-3 sm:p-4">
            <h2 className="font-heading text-2xl font-black leading-tight">المنتجات</h2>
            <div className="mt-4 grid gap-3">
            {order.items.map(item => (
              <div key={`${item.id}-${item.variant || ''}`} className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-md bg-[#fbfaf6] p-2 shadow-[inset_0_0_0_1px_rgba(23,32,27,0.08)] sm:grid-cols-[72px_minmax(0,1fr)]">
                <img src={item.image} alt={item.title} className="h-16 w-16 rounded-md object-cover sm:h-[72px] sm:w-[72px]" loading="lazy" decoding="async" />
                <div className="min-w-0">
                  <p className="break-words font-heading text-sm font-black leading-6 sm:text-base">{item.title}</p>
                  {item.variant ? <p className="mt-1 text-xs font-bold text-[#65716a]">{item.variant}</p> : null}
                  <p className="tm-admin-num mt-2 break-words text-sm font-black text-[#b45309]">{item.quantity} x {item.priceLabel}</p>
                </div>
              </div>
            ))}
            </div>
          </article>
        </div>

        <aside className="tm-admin-surface min-w-0 rounded-md bg-white p-3 sm:p-4 xl:sticky xl:top-[84px] xl:self-start">
          <h2 className="font-heading text-2xl font-black">العميل</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-[#65716a]">
            <div className="grid grid-cols-[36px_1fr] items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#fff3df] text-[#b45309]"><UserRound className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} /></span>
              <p className="font-black text-[#17201b]">{order.name}</p>
            </div>
            <div className="grid grid-cols-[36px_1fr] items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#fff3df] text-[#b45309]"><Phone className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} /></span>
              <button className="tm-admin-num text-right font-black text-[#b45309]" type="button" onClick={() => onNavigate(`#/admin/customers/${encodeURIComponent(order.phone)}`)}>{order.phone}</button>
            </div>
            <div className="grid grid-cols-[36px_1fr] items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#fff3df] text-[#b45309]"><MapPin className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} /></span>
              <p className="leading-6">{order.address}</p>
            </div>
            {order.note ? (
              <div className="rounded-md bg-[#fbfaf6] p-3 text-[#17201b] shadow-[inset_0_0_0_1px_rgba(23,32,27,0.08)]">
                {order.note}
              </div>
            ) : null}
          </div>
          <div className="mt-5 min-w-0 border-t border-[#dfe5df] pt-4">
            <OrderQuickActions order={order} settings={settings} onNavigate={onNavigate} onUpdateOrderStatus={onUpdateOrderStatus} />
          </div>
        </aside>
      </section>
    </AdminShell>
  );
}

export function AdminCustomerDetailPage({
  phone,
  orders,
  settings,
  onNavigate,
  onUpdateOrderStatus,
}: {
  phone: string;
  orders: StoredOrder[];
  settings: StoreSettings;
} & OrderActionProps) {
  const customerOrders = orders.filter(order => order.phone === phone);
  const latest = customerOrders[0];
  const customerTotal = customerOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <AdminShell title="العميل" eyebrow="سجل العميل" onNavigate={onNavigate}>
      <section className="grid gap-4">
        <article className="tm-admin-surface rounded-md bg-white p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-black">{latest?.name || phone}</h2>
              <p className="tm-admin-num mt-2 font-bold text-[#65716a]">{phone}</p>
              {latest?.address ? <p className="mt-2 max-w-[720px] font-bold leading-6 text-[#65716a]">{latest.address}</p> : null}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <div className="rounded-md bg-[#fbfaf6] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(23,32,27,0.08)]">
                <p className="text-xs font-black text-[#65716a]">الطلبات</p>
                <p className="tm-admin-num font-heading text-2xl font-black">{customerOrders.length.toLocaleString('fr-MA')}</p>
              </div>
              <div className="rounded-md bg-[#fbfaf6] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(23,32,27,0.08)]">
                <p className="text-xs font-black text-[#65716a]">المجموع</p>
                <p className="tm-admin-num font-heading text-2xl font-black text-[#b45309]">{customerTotal.toLocaleString('fr-MA')}</p>
              </div>
            </div>
          </div>
        </article>
        <AdminOrdersPageContent orders={customerOrders} settings={settings} onNavigate={onNavigate} onUpdateOrderStatus={onUpdateOrderStatus} />
      </section>
    </AdminShell>
  );
}

export function AdminSettingsPage({
  settings,
  products,
  onSave,
  onNavigate,
}: {
  settings: StoreSettings;
  products: Product[];
  onSave: (settings: StoreSettings) => void;
  onNavigate: (route: string) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);
  const managedCategories = draft.categories?.length ? draft.categories : categories;
  const heroProducts = products.filter(product => !product.isDraft && product.isVisible !== false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const updateCategory = (index: number, updates: Partial<Category>) => {
    setSaved(false);
    setDraft(current => {
      const nextCategories = (current.categories?.length ? current.categories : categories).map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, ...updates } : category
      );
      return { ...current, categories: nextCategories };
    });
  };

  const addCategory = () => {
    const id = `category-${Date.now().toString(36)}`;
    setSaved(false);
    setDraft(current => ({
      ...current,
      categories: [
        ...(current.categories?.length ? current.categories : categories),
        {
          id,
          title: 'قسم جديد',
          count: '0 منتج',
          image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80',
        },
      ],
    }));
  };

  const removeCategory = (index: number) => {
    if (managedCategories.length <= 1) return;
    setSaved(false);
    setDraft(current => ({
      ...current,
      categories: (current.categories?.length ? current.categories : categories).filter((_, categoryIndex) => categoryIndex !== index),
    }));
  };

  const saveDraft = () => {
    const cleanedCategories = managedCategories
      .map(category => ({
        ...category,
        id: category.id.trim(),
        title: category.title.trim(),
        image: category.image.trim(),
        count: category.count.trim(),
      }))
      .filter(category => category.id && category.title);

    onSave({
      ...draft,
      categories: cleanedCategories.length ? cleanedCategories : categories,
      heroProductSlug: draft.heroProductSlug || '',
    });
    setSaved(true);
  };

  return (
    <AdminShell title="الإعدادات" onNavigate={onNavigate}>
      <form onSubmit={event => { event.preventDefault(); saveDraft(); }} className="grid gap-4 rounded-md bg-white p-4 shadow-[0_10px_30px_rgba(23,32,27,0.08)] sm:p-5">
        <section className="grid gap-4 md:grid-cols-2">
          <SettingsInput label="اسم المتجر" value={draft.storeName} onChange={storeName => { setSaved(false); setDraft(current => ({ ...current, storeName })); }} />
          <SettingsInput label="رقم واتساب" value={draft.whatsappNumber} onChange={whatsappNumber => { setSaved(false); setDraft(current => ({ ...current, whatsappNumber })); }} />
          <SettingsInput label="رقم الهاتف" value={draft.phone} onChange={phone => { setSaved(false); setDraft(current => ({ ...current, phone })); }} />
          <SettingsInput label="المدينة" value={draft.city} onChange={city => { setSaved(false); setDraft(current => ({ ...current, city })); }} />
          <SettingsInput label="مدة التوصيل" value={draft.deliveryText} onChange={deliveryText => { setSaved(false); setDraft(current => ({ ...current, deliveryText })); }} />
          <SettingsInput label="العنوان" value={draft.address} onChange={address => { setSaved(false); setDraft(current => ({ ...current, address })); }} />
        </section>

        <section className="grid gap-2 rounded-md border border-[#dfe5df] bg-[#fbfaf6] p-3">
          <label className="grid gap-1">
            <span className="text-xs font-black text-[#65716a]">منتج الهيرو في الصفحة الرئيسية</span>
            <select value={draft.heroProductSlug || ''} onChange={event => { setSaved(false); setDraft(current => ({ ...current, heroProductSlug: event.target.value })); }} className="min-h-[44px] rounded-md border border-[#cfd8d1] bg-white px-3 text-sm font-bold outline-none focus:border-[#b45309]">
              <option value="">اختيار تلقائي</option>
              {heroProducts.map(product => <option key={product.slug} value={product.slug}>{product.title}</option>)}
            </select>
          </label>
        </section>

        <section className="grid gap-3 rounded-md border border-[#dfe5df] bg-[#fbfaf6] p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#17201b]">إدارة الأقسام</p>
            <button type="button" onClick={addCategory} className="tm-press min-h-[36px] rounded-md bg-[#ff9900] px-3 text-xs font-black text-[#131921]">إضافة قسم</button>
          </div>
          <div className="grid gap-3">
            {managedCategories.map((category, index) => (
              <article key={`${category.id}-${index}`} className="grid gap-2 rounded-md border border-[#dfe5df] bg-white p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_auto] md:items-end">
                <SettingsInput label="اسم القسم" value={category.title} onChange={title => updateCategory(index, { title })} />
                <SettingsInput label="رابط الصورة" value={category.image} onChange={image => updateCategory(index, { image })} />
                <button type="button" onClick={() => removeCategory(index)} disabled={managedCategories.length <= 1} className="tm-admin-press min-h-[44px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00] disabled:cursor-not-allowed disabled:opacity-45">حذف</button>
              </article>
            ))}
          </div>
        </section>

        <button type="submit" className="min-h-[48px] rounded-md bg-[#ff9900] px-5 font-black text-[#131921]">حفظ</button>
        {saved ? <p className="text-sm font-black text-[#b45309]">تم الحفظ</p> : null}
      </form>
    </AdminShell>
  );
}

function PageShell({ cartCount, categories: footerCategories, onNavigate, onOpenCart, onOpenSearch, children }: { cartCount: number; categories?: Category[]; onNavigate: (route: string) => void; onOpenCart: () => void; onOpenSearch: () => void; children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-[var(--tm-bg)] pb-[calc(76px+env(safe-area-inset-bottom))] pt-16 text-[var(--tm-ink)] md:pb-0">
      <SiteHeader cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart} onOpenSearch={onOpenSearch} />
      {children}
      <SiteFooter categories={footerCategories} onNavigate={onNavigate} />
      <MobileNav cartCount={cartCount} onNavigate={onNavigate} onOpenCart={onOpenCart} onOpenSearch={onOpenSearch} />
    </div>
  );
}

function MobileNav({ cartCount, onNavigate, onOpenCart, onOpenSearch }: { cartCount: number; onNavigate: (route: string) => void; onOpenCart: () => void; onOpenSearch: () => void }) {
  const route = getCurrentRoute();
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

function AdminShell({
  title,
  eyebrow,
  actions,
  onNavigate,
  children,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  onNavigate: (route: string) => void;
  children: ReactNode;
}) {
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
              <div className="min-w-0">
                {eyebrow ? <p className="text-xs font-black text-[#b45309]">{eyebrow}</p> : null}
                <h1 className="truncate font-heading text-2xl font-black sm:text-3xl">{title}</h1>
              </div>
              {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : (
                <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press min-h-[42px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-extrabold">فتح المتجر</button>
              )}
            </div>
          </header>
          <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function AdminOrdersPageContent({
  orders,
  settings,
  onNavigate,
  onUpdateOrderStatus,
}: {
  orders: StoredOrder[];
  settings: StoreSettings;
} & OrderActionProps) {
  return (
    <section className="grid gap-3">
      {orders.map(order => (
        <article key={order.id} className="tm-admin-surface grid gap-3 rounded-md bg-white p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <button type="button" onClick={() => onNavigate(`#/admin/orders/${order.id}`)} className="tm-admin-press rounded-md text-right">
            <div className="flex flex-wrap items-center gap-2">
              <p className="tm-admin-num font-heading text-xl font-black">{order.id}</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-2 text-sm font-bold text-[#65716a]">{orderItemsSummary(order)}</p>
            <p className="tm-admin-num mt-1 text-sm font-black text-[#b45309]">{order.total.toLocaleString('fr-MA')} درهم · {orderDate(order)}</p>
          </button>
          <OrderQuickActions order={order} settings={settings} onNavigate={onNavigate} onUpdateOrderStatus={onUpdateOrderStatus} compact />
        </article>
      ))}
      {!orders.length ? <EmptyAdmin title="لا توجد طلبات لهذا العميل" copy="سيظهر سجل العميل هنا بعد أول طلب." /> : null}
    </section>
  );
}

function EmptyAdmin({ title, copy }: { title: string; copy?: string }) {
  return (
    <div className="tm-admin-surface rounded-md bg-white p-6 text-center">
      <p className="font-heading text-2xl font-black">{title}</p>
      {copy ? <p className="mx-auto mt-2 max-w-[460px] text-sm font-bold leading-6 text-[#65716a]">{copy}</p> : null}
    </div>
  );
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
