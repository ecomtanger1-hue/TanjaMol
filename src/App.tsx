import { useEffect, useLayoutEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { CODTangerArabicStoreLanding } from './components/storefront/CODTangerArabicStoreLanding';
import { TanjaMolArabicCODProductPage } from './components/product/TanjaMolArabicCODProductPage';
import { TanjaMolAdminProductDashboard } from './components/magicpath/tanja-mol-admin-product-dashboard/TanjaMolAdminProductDashboard';
import { TanjaMolAddProductPage } from './components/magicpath/tanja-mol-add-product-page/TanjaMolAddProductPage';
import { AdminProductsPage } from './components/admin/AdminProductsPage';
import {
  AdminCustomerDetailPage,
  AdminLogin,
  AdminOrderDetailPage,
  AdminOrdersPage,
  AdminSettingsPage,
  CartPopup,
  CategoryPage,
  InfoPage,
  NotFoundPage,
  SearchResultsPage,
} from './components/storefront/StorefrontPages';
import {
  buildWhatsAppOrderUrl,
  cartItemFromProduct,
  defaultSettings,
  orderTotal,
  parseCategoryId,
  parseOrderForm,
  parseProductSlug,
  parseSearchQuery,
  productRoute,
  products as seedProducts,
  searchProducts,
  type CartItem,
  type OrderDraft,
  type Product,
  type StoreSettings,
  type StoredOrder,
} from './storefrontRuntime';

const CART_KEY = 'tanjamol.cart.v1';
const ORDERS_KEY = 'tanjamol.orders.v1';
const ADMIN_PRODUCTS_KEY = 'tanjamol.admin.products.v1';
const ADMIN_DELETED_PRODUCTS_KEY = 'tanjamol.admin.deletedProducts.v1';
const ADMIN_HIDDEN_PRODUCTS_KEY = 'tanjamol.admin.hiddenProducts.v1';
const SETTINGS_KEY = 'tanjamol.settings.v1';
const ADMIN_AUTH_KEY = 'tanjamol.admin.auth.v1';

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
  window.setTimeout(scroll, 80);
  window.setTimeout(scroll, 240);
}

function getRoute() {
  return window.location.hash || '#/';
}

export function App() {
  const [route, setRoute] = useState(getRoute);
  const [customProducts, setCustomProducts] = useState<Product[]>(() => readStored<Product[]>(ADMIN_PRODUCTS_KEY, []));
  const [deletedProductSlugs, setDeletedProductSlugs] = useState<string[]>(() => readStored<string[]>(ADMIN_DELETED_PRODUCTS_KEY, []));
  const [hiddenProductSlugs, setHiddenProductSlugs] = useState<string[]>(() => readStored<string[]>(ADMIN_HIDDEN_PRODUCTS_KEY, []));
  const [cart, setCart] = useState<CartItem[]>(() => readStored<CartItem[]>(CART_KEY, []));
  const [orders, setOrders] = useState<StoredOrder[]>(() => readStored<StoredOrder[]>(ORDERS_KEY, []));
  const [settings, setSettings] = useState<StoreSettings>(() => ({ ...defaultSettings, ...readStored<Partial<StoreSettings>>(SETTINGS_KEY, {}) }));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [directItem, setDirectItem] = useState<CartItem | null>(null);
  const [notice, setNotice] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => readStored<boolean>(ADMIN_AUTH_KEY, false));

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

    const onRouteChange = () => {
      setRoute(getRoute());
      setDirectItem(null);
      setIsCartOpen(false);
      setIsSearchOpen(false);
      scrollToPageTop();
    };

    window.addEventListener('hashchange', onRouteChange);
    window.addEventListener('popstate', onRouteChange);
    return () => {
      window.removeEventListener('hashchange', onRouteChange);
      window.removeEventListener('popstate', onRouteChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const productSlug = parseProductSlug(route);
  const categoryId = parseCategoryId(route);
  const searchQuery = parseSearchQuery(route);
  const adminProducts = useMemo(() => {
    const deleted = new Set(deletedProductSlugs);
    const customSlugs = new Set(customProducts.map(product => product.slug));

    return [
      ...customProducts.filter(product => !deleted.has(product.slug)),
      ...seedProducts.filter(product => !deleted.has(product.slug) && !customSlugs.has(product.slug)),
    ];
  }, [customProducts, deletedProductSlugs]);
  const storefrontProducts = useMemo(() => {
    const hidden = new Set(hiddenProductSlugs);
    return adminProducts.filter(product => !hidden.has(product.slug));
  }, [adminProducts, hiddenProductSlugs]);
  const activeProduct = productSlug ? storefrontProducts.find(product => product.slug === productSlug) : undefined;

  const navigate = (nextRoute: string) => {
    window.history.pushState(null, '', nextRoute);
    setRoute(nextRoute);
    setDirectItem(null);
    setIsCartOpen(false);
    setIsSearchOpen(false);
    scrollToPageTop();
  };

  useLayoutEffect(() => {
    scrollToPageTop();
  }, [route]);

  const addToCart = (item: CartItem) => {
    setCart(current => {
      const existing = current.find(cartItem => cartItem.id === item.id && cartItem.variant === item.variant);
      if (existing) {
        return current.map(cartItem => cartItem === existing ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem);
      }

      return [...current, item];
    });
    setDirectItem(null);
    setIsCartOpen(false);
    setNotice('تمت الإضافة للسلة');
  };

  const orderProduct = (item: CartItem) => {
    setDirectItem(item);
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, variant: string | undefined, nextQuantity: number) => {
    if (directItem?.id === id && directItem.variant === variant) {
      setDirectItem(current => current ? { ...current, quantity: Math.max(1, nextQuantity) } : current);
      return;
    }

    setCart(current => current.flatMap(item => {
      if (item.id !== id || item.variant !== variant) return [item];
      if (nextQuantity < 1) return [];
      return [{ ...item, quantity: nextQuantity }];
    }));
  };

  const removeCartItem = (id: string, variant: string | undefined) => {
    setCart(current => current.filter(item => item.id !== id || item.variant !== variant));
  };

  const submitOrderDraft = (draft: OrderDraft) => {
    if (!draft.items.length) return;

    const order: StoredOrder = {
      ...draft,
      id: `TM-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: 'whatsapp',
      total: orderTotal(draft.items),
    };
    const nextOrders = [order, ...readStored<StoredOrder[]>(ORDERS_KEY, [])];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(nextOrders));
    setOrders(nextOrders);
    void import('./lib/supabaseOrders').then(({ saveOrderToSupabase }) => saveOrderToSupabase(order)).catch(error => {
      console.error('Failed to save order to Supabase', error);
    });

    if (draft.source === 'cart') setCart([]);
    setDirectItem(null);
    setIsCartOpen(false);
    const whatsappUrl = buildWhatsAppOrderUrl(order, settings);
    const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    if (opened) {
      setNotice('تم فتح واتساب');
      return;
    }

    navigator.clipboard?.writeText(whatsappUrl).catch(() => undefined);
    setNotice('لم يفتح واتساب تلقائيا. تم نسخ رابط الطلب');
  };

  const placeOrder = (draft: OrderDraft) => {
    submitOrderDraft(draft);
  };

  const placeOrderFromForm = (items: CartItem[], source: string, event: FormEvent<HTMLFormElement>) => {
    const draft = parseOrderForm(event, source, items);
    if (draft) submitOrderDraft(draft);
  };

  const commonProps = {
    cartCount,
    products: storefrontProducts,
    settings,
    onNavigate: navigate,
    onOpenCart: () => {
      setDirectItem(null);
      setIsCartOpen(true);
    },
    onOpenSearch: () => {
      setIsSearchOpen(true);
      setIsCartOpen(false);
    },
    onOpenProduct: (slug: string) => navigate(productRoute(slug)),
    onAddToCart: addToCart,
    onOrderProduct: orderProduct,
    onPlaceOrder: placeOrderFromForm,
  };

  const saveProduct = (product: Product, previousSlug = product.slug) => {
    setCustomProducts(current => {
      const next = [product, ...current.filter(item => item.slug !== product.slug && item.slug !== previousSlug)];
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setDeletedProductSlugs(current => {
      const next = current.filter(slug => slug !== product.slug && slug !== previousSlug);
      localStorage.setItem(ADMIN_DELETED_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setHiddenProductSlugs(current => {
      const next = current.filter(slug => slug !== product.slug);
      localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setNotice('تم نشر المنتج');
  };

  const deleteProduct = (product: Product) => {
    const confirmed = window.confirm(`حذف "${product.title}" من الإدارة والمتجر؟`);
    if (!confirmed) return;

    setCustomProducts(current => {
      const next = current.filter(item => item.slug !== product.slug);
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setDeletedProductSlugs(current => {
      const next = Array.from(new Set([...current, product.slug]));
      localStorage.setItem(ADMIN_DELETED_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setHiddenProductSlugs(current => {
      const next = current.filter(slug => slug !== product.slug);
      localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setNotice('تم حذف المنتج');
  };

  const toggleProductVisibility = (slug: string) => {
    setHiddenProductSlugs(current => {
      const isHidden = current.includes(slug);
      const next = isHidden ? current.filter(item => item !== slug) : [...current, slug];
      localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(next));
      setNotice(isHidden ? 'تم إظهار المنتج' : 'تم إخفاء المنتج');
      return next;
    });
  };

  const renderedPage = useMemo(() => {
    if (route === '#/admin/login') {
      return <AdminLogin onLogin={() => { setIsAdminLoggedIn(true); navigate('#/admin'); }} />;
    }

    if (route.startsWith('#/admin') && !isAdminLoggedIn) {
      return <AdminLogin onLogin={() => { setIsAdminLoggedIn(true); navigate(route); }} />;
    }

    if (route === '#/admin') {
      return (
        <TanjaMolAdminProductDashboard
          products={adminProducts}
          orders={orders}
          onAddProduct={() => navigate('#/admin/products/new')}
          onOpenProducts={() => navigate('#/admin/products')}
          onOpenStorefront={() => navigate('#/')}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onOpenOrders={() => navigate('#/admin/orders')}
          onOpenSettings={() => navigate('#/admin/settings')}
        />
      );
    }

    if (route === '#/admin/products') {
      return (
        <AdminProductsPage
          products={adminProducts}
          orders={orders}
          hiddenSlugs={hiddenProductSlugs}
          onNavigate={navigate}
          onDeleteProduct={deleteProduct}
          onToggleVisibility={toggleProductVisibility}
        />
      );
    }

    if (route.startsWith('#/admin/products/') && route.endsWith('/edit')) {
      const slug = decodeURIComponent(route.replace('#/admin/products/', '').replace('/edit', ''));
      const editProduct = adminProducts.find(product => product.slug === slug);
      if (!editProduct) {
        return (
          <AdminProductsPage
            products={adminProducts}
            orders={orders}
            hiddenSlugs={hiddenProductSlugs}
            onNavigate={navigate}
            onDeleteProduct={deleteProduct}
            onToggleVisibility={toggleProductVisibility}
          />
        );
      }

      return (
        <TanjaMolAddProductPage
          key={`edit-${editProduct.slug}`}
          product={editProduct}
          products={adminProducts}
          onBack={() => navigate('#/admin/products')}
          onOpenDashboard={() => navigate('#/admin')}
          onOpenProduct={(nextSlug) => navigate(productRoute(nextSlug))}
          onCreateProduct={saveProduct}
        />
      );
    }

    if (route === '#/admin/products/new') {
      return (
        <TanjaMolAddProductPage
          key="new-product"
          products={adminProducts}
          onBack={() => navigate('#/admin/products')}
          onOpenDashboard={() => navigate('#/admin')}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onCreateProduct={saveProduct}
        />
      );
    }

    if (route === '#/admin/orders') return <AdminOrdersPage orders={orders} onNavigate={navigate} />;

    if (route.startsWith('#/admin/orders/')) {
      const id = decodeURIComponent(route.replace('#/admin/orders/', ''));
      return <AdminOrderDetailPage order={orders.find(order => order.id === id)} onNavigate={navigate} />;
    }

    if (route.startsWith('#/admin/customers/')) {
      const phone = decodeURIComponent(route.replace('#/admin/customers/', ''));
      return <AdminCustomerDetailPage phone={phone} orders={orders} onNavigate={navigate} />;
    }

    if (route === '#/admin/settings') {
      return <AdminSettingsPage settings={settings} onSave={setSettings} onNavigate={navigate} />;
    }

    if (productSlug) {
      if (!activeProduct) {
        return <NotFoundPage cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} />;
      }

      return (
        <TanjaMolArabicCODProductPage
          key={activeProduct.id}
          product={activeProduct}
          products={storefrontProducts}
          cartCount={cartCount}
          onOpenCart={() => {
            setDirectItem(null);
            setIsCartOpen(true);
          }}
          onOpenSearch={commonProps.onOpenSearch}
          onAddToCart={addToCart}
          onOrderProduct={orderProduct}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onPlaceOrder={placeOrder}
        />
      );
    }

    if (categoryId) return <CategoryPage categoryId={categoryId} {...commonProps} />;
    if (route.startsWith('#/search')) return <SearchResultsPage query={searchQuery} {...commonProps} />;
    if (route === '#/about') return <InfoPage page="about" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} settings={settings} />;
    if (route === '#/contact') return <InfoPage page="contact" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} settings={settings} />;
    if (route === '#/faq') return <InfoPage page="faq" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} settings={settings} />;
    if (route === '#/shipping') return <InfoPage page="shipping" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} settings={settings} />;
    if (route === '#/returns') return <InfoPage page="returns" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} settings={settings} />;
    if (route === '#/privacy') return <InfoPage page="privacy" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} settings={settings} />;
    if (route === '#/terms') return <InfoPage page="terms" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} settings={settings} />;

    if (route === '#/' || route === '') {
      return (
        <CODTangerArabicStoreLanding
          products={storefrontProducts}
          cartCount={cartCount}
          onOpenCart={commonProps.onOpenCart}
          onOpenSearch={commonProps.onOpenSearch}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onAddToCart={addToCart}
          onOrderProduct={orderProduct}
          onPlaceOrder={placeOrder}
          onNavigate={navigate}
        />
      );
    }

    return <NotFoundPage cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} />;
  }, [activeProduct, adminProducts, cartCount, categoryId, commonProps, hiddenProductSlugs, isAdminLoggedIn, orders, productSlug, route, searchQuery, settings, storefrontProducts]);

  return (
    <>
      {renderedPage}
      <CartPopup
        open={isCartOpen}
        cart={cart}
        directItem={directItem}
        onClose={() => {
          setIsCartOpen(false);
          setDirectItem(null);
        }}
        onQuantityChange={updateQuantity}
        onRemove={removeCartItem}
        onPlaceOrder={placeOrderFromForm}
      />
      <SearchPanel
        open={isSearchOpen}
        products={storefrontProducts}
        onClose={() => setIsSearchOpen(false)}
        onOpenProduct={(slug) => navigate(productRoute(slug))}
      />
      <Notice message={notice} />
    </>
  );
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function SearchPanel({
  open,
  products,
  onClose,
  onOpenProduct,
}: {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onOpenProduct: (slug: string) => void;
}) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => query.trim() ? searchProducts(products, query).slice(0, 8) : [], [products, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    window.setTimeout(() => document.getElementById('tm-search-panel-input')?.focus(), 60);
  }, [open]);

  if (!open) return null;

  return (
    <div dir="rtl" className="tm-modal-backdrop fixed inset-0 z-[90] bg-[#102118]/46 px-4 pt-20" role="dialog" aria-modal="true" aria-label="البحث" onClick={onClose}>
      <div className="tm-panel tm-panel-pop mx-auto w-full max-w-[720px] p-3 sm:p-4" onClick={event => event.stopPropagation()}>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="tm-search-panel-input">بحث</label>
          <input
            id="tm-search-panel-input"
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="tm-field h-12 flex-1 bg-[var(--tm-surface-white)] text-right"
            placeholder="ابحث عن منتج"
            type="search"
          />
          <button type="button" onClick={onClose} className="tm-press tm-button-secondary px-4 text-sm" aria-label="إغلاق البحث">
            إغلاق
          </button>
        </div>

        {query.trim() ? (
          <div className="tm-stagger-list mt-3 grid max-h-[62vh] gap-2 overflow-y-auto">
            {results.length ? results.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProduct(product.slug);
                }}
                className="tm-press tm-stagger-item tm-panel-white grid grid-cols-[64px_1fr_auto] items-center gap-3 p-2 text-right"
                style={{ '--tm-stagger-delay': `${Math.min(index, 7) * 38}ms` } as CSSProperties}
                aria-label={`فتح ${product.title}`}
              >
                <img src={product.image} alt={product.title} className="h-16 w-16 rounded-md object-cover" loading="lazy" decoding="async" width="128" height="128" sizes="64px" />
                <span className="min-w-0">
                  <span className="tm-text-ink block truncate font-heading text-base font-black">{product.title}</span>
                  <span className="tm-text-muted mt-1 block text-xs font-bold">{product.category}</span>
                </span>
                <span className="tm-num tm-price-text whitespace-nowrap font-heading text-lg font-black">{product.priceLabel}</span>
              </button>
            )) : (
              <div className="tm-panel-white tm-text-muted p-4 text-center text-sm font-bold">لا توجد نتائج مطابقة</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Notice({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="tm-toast-slide fixed inset-x-0 top-4 z-[100] mx-auto w-fit max-w-[90vw] rounded-md bg-[#102118] px-4 py-3 text-sm font-black text-white shadow-[0_18px_48px_-22px_rgba(23,32,27,0.65)]" role="status">
      {message}
    </div>
  );
}
