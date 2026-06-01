import { useEffect, useLayoutEffect, useMemo, useState, type FormEvent } from 'react';
import { CODTangerArabicStoreLanding } from './components/storefront/CODTangerArabicStoreLanding';
import { TanjaMolArabicCODProductPage } from './components/product/TanjaMolArabicCODProductPage';
import { TanjaMolAdminProductDashboard } from './components/magicpath/tanja-mol-admin-product-dashboard/TanjaMolAdminProductDashboard';
import { TanjaMolAddProductPage } from './components/magicpath/tanja-mol-add-product-page/TanjaMolAddProductPage';
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
  type CartItem,
  type OrderDraft,
  type Product,
  type StoreSettings,
  type StoredOrder,
} from './storefrontRuntime';

const CART_KEY = 'tanjamol.cart.v1';
const ORDERS_KEY = 'tanjamol.orders.v1';
const ADMIN_PRODUCTS_KEY = 'tanjamol.admin.products.v1';
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
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => {
    const customProducts = readStored<Product[]>(ADMIN_PRODUCTS_KEY, []);
    const customSlugs = new Set(customProducts.map(product => product.slug));
    return [...customProducts, ...seedProducts.filter(product => !customSlugs.has(product.slug))];
  });
  const [cart, setCart] = useState<CartItem[]>(() => readStored<CartItem[]>(CART_KEY, []));
  const [orders, setOrders] = useState<StoredOrder[]>(() => readStored<StoredOrder[]>(ORDERS_KEY, []));
  const [settings, setSettings] = useState<StoreSettings>(() => ({ ...defaultSettings, ...readStored<Partial<StoreSettings>>(SETTINGS_KEY, {}) }));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [directItem, setDirectItem] = useState<CartItem | null>(null);
  const [notice, setNotice] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => readStored<boolean>(ADMIN_AUTH_KEY, false));

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

    const onRouteChange = () => {
      setRoute(getRoute());
      setDirectItem(null);
      setIsCartOpen(false);
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
  const activeProduct = catalogProducts.find(product => product.slug === productSlug) || catalogProducts[0];

  const navigate = (nextRoute: string) => {
    window.history.pushState(null, '', nextRoute);
    setRoute(nextRoute);
    setDirectItem(null);
    setIsCartOpen(false);
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
    setIsCartOpen(true);
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
    products: catalogProducts,
    settings,
    onNavigate: navigate,
    onOpenCart: () => {
      setDirectItem(null);
      setIsCartOpen(true);
    },
    onOpenProduct: (slug: string) => navigate(productRoute(slug)),
    onAddToCart: addToCart,
    onOrderProduct: orderProduct,
    onPlaceOrder: placeOrderFromForm,
  };

  const saveProduct = (product: Product) => {
    setCatalogProducts(current => {
      const next = [product, ...current.filter(item => item.slug !== product.slug)];
      const customProducts = next.filter(item => !seedProducts.some(seed => seed.slug === item.slug));
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(customProducts));
      return next;
    });
    setNotice('تم نشر المنتج');
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
          products={catalogProducts}
          orders={orders}
          onAddProduct={() => navigate('#/admin/products/new')}
          onOpenStorefront={() => navigate('#/')}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onOpenOrders={() => navigate('#/admin/orders')}
          onOpenSettings={() => navigate('#/admin/settings')}
        />
      );
    }

    if (route === '#/admin/products/new') {
      return (
        <TanjaMolAddProductPage
          products={catalogProducts}
          onBack={() => navigate('#/admin')}
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
      return (
        <TanjaMolArabicCODProductPage
          key={activeProduct.id}
          product={activeProduct}
          products={catalogProducts}
          cartCount={cartCount}
          onOpenCart={() => {
            setDirectItem(null);
            setIsCartOpen(true);
          }}
          onAddToCart={addToCart}
          onOrderProduct={orderProduct}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onPlaceOrder={placeOrder}
        />
      );
    }

    if (categoryId) return <CategoryPage categoryId={categoryId} {...commonProps} />;
    if (route.startsWith('#/search')) return <SearchResultsPage query={searchQuery} {...commonProps} />;
    if (route === '#/about') return <InfoPage page="about" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} settings={settings} />;
    if (route === '#/contact') return <InfoPage page="contact" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} settings={settings} />;
    if (route === '#/faq') return <InfoPage page="faq" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} settings={settings} />;
    if (route === '#/shipping') return <InfoPage page="shipping" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} settings={settings} />;
    if (route === '#/returns') return <InfoPage page="returns" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} settings={settings} />;
    if (route === '#/privacy') return <InfoPage page="privacy" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} settings={settings} />;
    if (route === '#/terms') return <InfoPage page="terms" cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} settings={settings} />;

    if (route === '#/' || route === '') {
      return (
        <CODTangerArabicStoreLanding
          products={catalogProducts}
          cartCount={cartCount}
          onOpenCart={commonProps.onOpenCart}
          onOpenSearch={() => navigate('#/search')}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onAddToCart={addToCart}
          onOrderProduct={orderProduct}
          onPlaceOrder={placeOrder}
          onNavigate={navigate}
        />
      );
    }

    return <NotFoundPage cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} />;
  }, [activeProduct, cartCount, catalogProducts, categoryId, commonProps, isAdminLoggedIn, orders, productSlug, route, searchQuery, settings]);

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

function Notice({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="tm-ui-label fixed inset-x-0 top-4 z-[100] mx-auto w-fit max-w-[90vw] rounded-md bg-[#102118] px-4 py-3 text-sm text-white shadow-[0_18px_48px_-22px_rgba(23,32,27,0.65)]" role="status">
      {message}
    </div>
  );
}
