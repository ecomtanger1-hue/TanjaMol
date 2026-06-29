import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { CODTangerArabicStoreLanding } from './components/storefront/CODTangerArabicStoreLanding';
import { TanjaMolArabicCODProductPage } from './components/product/TanjaMolArabicCODProductPage';
import {
  CartPopup,
  CategoryPage,
  CollectionPage,
  InfoPage,
  NotFoundPage,
  SearchResultsPage,
} from './components/storefront/StorefrontPages';
import {
  cartItemFromProduct,
  categories as defaultCategories,
  defaultSettings,
  getStoreCategories,
  orderTotal,
  parseCategoryId,
  parseCollectionId,
  parseOrderForm,
  parseProductSlug,
  parseSearchQuery,
  productRoute,
  products as seedProducts,
  searchProducts,
  type CartItem,
  type Category,
  type OrderDraft,
  type Product,
  type StoreSettings,
  type StoredOrder,
} from './storefrontRuntime';
import { getCurrentRoute, replaceLegacyHashRoute, routeToPath } from './lib/routing';
import { trackAddToCart, trackInitiateCheckout, trackPageView, trackPurchase, trackSearch, trackViewContent } from './lib/metaPixel';
import { TanjaMallLogo } from './components/brand/TanjaMallLogo';
import { hasProductDetailContent } from './lib/productDetails';
import { saveOrderToSupabase } from './lib/supabaseOrders';

const TanjaMolAddProductPage = lazy(() => import('./components/magicpath/tanja-mol-add-product-page/TanjaMolAddProductPage').then(module => ({
  default: module.TanjaMolAddProductPage,
})));

const ShadcnAdminDashboard = lazy(() => import('./components/admin-shadcn/ShadcnAdminDashboard').then(module => ({
  default: module.ShadcnAdminDashboard,
})));

const ShadcnAdminProductsPage = lazy(() => import('./components/admin-shadcn/ShadcnAdminProductsPage').then(module => ({
  default: module.ShadcnAdminProductsPage,
})));

const ShadcnAdminOrdersPage = lazy(() => import('./components/admin-shadcn/ShadcnAdminOrders').then(module => ({
  default: module.ShadcnAdminOrdersPage,
})));

const ShadcnAdminOrderDetailPage = lazy(() => import('./components/admin-shadcn/ShadcnAdminOrders').then(module => ({
  default: module.ShadcnAdminOrderDetailPage,
})));

const ShadcnAdminCustomerDetailPage = lazy(() => import('./components/admin-shadcn/ShadcnAdminOrders').then(module => ({
  default: module.ShadcnAdminCustomerDetailPage,
})));

const ShadcnAdminSettingsPage = lazy(() => import('./components/admin-shadcn/ShadcnAdminSettingsPage').then(module => ({
  default: module.ShadcnAdminSettingsPage,
})));

const ShadcnAdminLogin = lazy(() => import('./components/admin-shadcn/ShadcnAdminLogin').then(module => ({
  default: module.ShadcnAdminLogin,
})));

const CART_KEY = 'tanjamol.cart.v1';
const ORDERS_KEY = 'tanjamol.orders.v1';
const ADMIN_PRODUCTS_KEY = 'tanjamol.admin.products.v1';
const ADMIN_DELETED_PRODUCTS_KEY = 'tanjamol.admin.deletedProducts.v1';
const ADMIN_HIDDEN_PRODUCTS_KEY = 'tanjamol.admin.hiddenProducts.v1';
const SETTINGS_KEY = 'tanjamol.settings.v1';
const STOREFRONT_PRODUCTS_CACHE_KEY = 'tanjamall.storefront.products.cache.v1';
const STOREFRONT_PRODUCTS_CACHE_MAX_AGE_MS = 1000 * 60 * 60;

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
  return getCurrentRoute();
}

function cleanText(value: string, maxLength: number) {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function absoluteAssetUrl(src: string) {
  if (!src) return window.location.origin;
  if (src.startsWith('data:')) return src;
  try {
    return new URL(src, window.location.origin).href;
  } catch {
    return window.location.origin;
  }
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  const [attribute, rawValue] = selector.startsWith('meta[')
    ? selector.replace(/^meta\[|\]$/g, '').split('=')
    : ['rel', selector.replace(/^link\[rel="|"?\]$/g, '')];
  const value = rawValue?.replace(/^"|"$/g, '');
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;

  if (!element) {
    element = document.createElement(selector.startsWith('meta[') ? 'meta' : 'link');
    if (attribute && value) element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, nextValue]) => element?.setAttribute(key, nextValue));
}

function upsertJsonLd(id: string, data: Record<string, unknown> | null) {
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }

  const script = (existing ?? document.createElement('script')) as HTMLScriptElement;
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

function applyPageSeo(product: Product | undefined, settings: StoreSettings, categories: Category[] = defaultCategories) {
  const storeName = settings.storeName || defaultSettings.storeName;
  const baseUrl = window.location.origin;
  const defaultDescription = `TanjaMol COD store in Tanger with cash on delivery and fast local confirmation.`;

  if (!product) {
    document.title = `${storeName} | COD Tanger`;
    upsertMeta('meta[name="description"]', { name: 'description', content: defaultDescription });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: storeName });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: defaultDescription });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: baseUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: absoluteAssetUrl('/tanjamall-icon.svg') });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: storeName });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: defaultDescription });
    upsertMeta('link[rel="canonical"]', { rel: 'canonical', href: baseUrl });
    upsertJsonLd('tm-product-jsonld', null);
    upsertJsonLd('tm-breadcrumb-jsonld', null);
    return;
  }

  const productUrl = `${baseUrl}${routeToPath(productRoute(product.slug))}`;
  const title = cleanText(`${product.title} | ${storeName}`, 62);
  const description = cleanText(product.description || `${product.title} available from ${storeName} with cash on delivery in Tanger.`, 158);
  const image = absoluteAssetUrl(product.image || product.gallery?.[0] || '/tanjamall-icon.svg');
  const category = categories.find(item => item.title === product.category || product.category.includes(item.title.split(' ')[0]));
  const categoryUrl = category ? `${baseUrl}${routeToPath(`#/category/${encodeURIComponent(category.id)}`)}` : baseUrl;
  const sku = product.variants?.find(variant => variant.enabled && variant.sku)?.sku || product.slug;
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().slice(0, 10);

  document.title = title;
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'product' });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: productUrl });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
  upsertMeta('link[rel="canonical"]', { rel: 'canonical', href: productUrl });

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    image: (product.gallery?.length ? product.gallery : [product.image]).filter(Boolean).map(absoluteAssetUrl),
    sku,
    brand: {
      '@type': 'Brand',
      name: storeName,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'MAD',
      price: product.price,
      availability: product.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  if (product.reviewsEnabled && product.rating && product.reviewCount) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  upsertJsonLd('tm-product-jsonld', productJsonLd);
  upsertJsonLd('tm-breadcrumb-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: storeName, item: baseUrl },
      { '@type': 'ListItem', position: 2, name: product.category, item: categoryUrl },
      { '@type': 'ListItem', position: 3, name: product.title, item: productUrl },
    ],
  });
}

export function App() {
  const [route, setRoute] = useState(getRoute);
  const [customProducts, setCustomProducts] = useState<Product[]>(() => readStored<Product[]>(ADMIN_PRODUCTS_KEY, []));
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(() => readStorefrontProductsCache());
  const [productDetailsBySlug, setProductDetailsBySlug] = useState<Record<string, Product>>({});
  const [loadingProductSlug, setLoadingProductSlug] = useState<string | null>(null);
  const [missingProductSlugs, setMissingProductSlugs] = useState<string[]>([]);
  const [deletedProductSlugs, setDeletedProductSlugs] = useState<string[]>(() => readStored<string[]>(ADMIN_DELETED_PRODUCTS_KEY, []));
  const [hiddenProductSlugs, setHiddenProductSlugs] = useState<string[]>(() => readStored<string[]>(ADMIN_HIDDEN_PRODUCTS_KEY, []));
  const [cart, setCart] = useState<CartItem[]>(() => readStored<CartItem[]>(CART_KEY, []));
  const [orders, setOrders] = useState<StoredOrder[]>(() => readStored<StoredOrder[]>(ORDERS_KEY, []));
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const storedSettings = readStored<Partial<StoreSettings>>(SETTINGS_KEY, {});
    return {
      ...defaultSettings,
      ...storedSettings,
      storeName: !storedSettings.storeName || storedSettings.storeName === 'TanjaMol' ? defaultSettings.storeName : storedSettings.storeName,
      whatsappNumber: !storedSettings.whatsappNumber || storedSettings.whatsappNumber === '212600000000' ? defaultSettings.whatsappNumber : storedSettings.whatsappNumber,
    };
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [directItem, setDirectItem] = useState<CartItem | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<StoredOrder | null>(null);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(() => getRoute().startsWith('#/tm-office-07'));
  const [isAdminDataReady, setIsAdminDataReady] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    replaceLegacyHashRoute();

    const onRouteChange = () => {
      replaceLegacyHashRoute();
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
    let active = true;

    void import('./lib/supabaseProducts')
      .then(({ fetchProductSummariesFromSupabase }) => fetchProductSummariesFromSupabase(false))
      .then(productsFromSupabase => {
        if (!active) return;
        setRemoteProducts(productsFromSupabase);
        writeStorefrontProductsCache(productsFromSupabase);
      })
      .catch(error => {
        console.error('Failed to load Supabase storefront products', error);
        if (active) setRemoteProducts(current => current ?? []);
      });

    void import('./lib/supabaseSettings')
      .then(({ fetchStoreSettingsFromSupabase }) => fetchStoreSettingsFromSupabase())
      .then(settingsFromSupabase => {
        if (active && settingsFromSupabase) setSettings(current => ({ ...current, ...settingsFromSupabase }));
      })
      .catch(error => {
        console.error('Failed to load Supabase storefront settings', error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!route.startsWith('#/tm-office-07')) {
      setIsAdminLoading(false);
      return;
    }

    if (isAdminLoggedIn) {
      return;
    }

    let active = true;
    setIsAdminLoading(true);
    setIsAdminDataReady(false);

    void import('./lib/supabaseAdmin')
      .then(async ({ restoreAdminSession }) => {
        const restored = await restoreAdminSession();
        if (!active) return;
        setIsAdminLoggedIn(restored);
        if (!restored) setIsAdminDataReady(false);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsAdminLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdminLoggedIn, route]);

  useEffect(() => {
    if (!isAdminLoggedIn || isAdminDataReady) return;

    let active = true;
    setIsAdminDataReady(false);
    setIsAdminLoading(true);

    void Promise.all([
      import('./lib/supabaseAdmin').then(({ fetchAdminOrders }) => fetchAdminOrders()),
      import('./lib/supabaseProducts').then(({ fetchProductsFromSupabase }) => fetchProductsFromSupabase(true)),
    ])
      .then(([nextOrders, nextProducts]) => {
        if (!active) return;
        setOrders(nextOrders);
        setRemoteProducts(nextProducts);
        setProductDetailsBySlug(Object.fromEntries(nextProducts.map(product => [product.slug, product])));
        setIsAdminDataReady(true);
      })
      .catch(error => {
        console.error('Failed to load admin data', error);
        if (active) {
          setRemoteProducts([]);
          setIsAdminDataReady(true);
          setNotice('تم تسجيل الدخول، لكن تعذر تحميل بيانات الإدارة');
        }
      })
      .finally(() => {
        if (active) setIsAdminLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdminDataReady, isAdminLoggedIn]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeCategories = useMemo(() => getStoreCategories(settings), [settings]);
  const productSlug = parseProductSlug(route);
  const categoryId = parseCategoryId(route);
  const collectionId = parseCollectionId(route);
  const searchQuery = parseSearchQuery(route);
  const cachedProductDetail = productSlug ? productDetailsBySlug[productSlug] : undefined;
  const isKnownMissingProduct = productSlug ? missingProductSlugs.includes(productSlug) : false;
  const localAdminProducts = useMemo(() => {
    const deleted = new Set(deletedProductSlugs);
    const customSlugs = new Set(customProducts.map(product => product.slug));

    return [
      ...customProducts.filter(product => !deleted.has(product.slug)),
      ...seedProducts.filter(product => !deleted.has(product.slug) && !customSlugs.has(product.slug)),
    ];
  }, [customProducts, deletedProductSlugs]);
  const adminProducts = remoteProducts ?? [];
  const effectiveHiddenProductSlugs = useMemo(() => (
    remoteProducts !== null
      ? remoteProducts.filter(product => product.isVisible === false && !product.isDraft).map(product => product.slug)
      : hiddenProductSlugs
  ), [hiddenProductSlugs, remoteProducts]);
  const storefrontProducts = useMemo(() => {
    const hidden = new Set(effectiveHiddenProductSlugs);
    return adminProducts.filter(product => !product.isDraft && !hidden.has(product.slug) && product.isVisible !== false);
  }, [adminProducts, effectiveHiddenProductSlugs]);
  const activeProduct = productSlug
    ? cachedProductDetail && !cachedProductDetail.isDraft && cachedProductDetail.isVisible !== false && !effectiveHiddenProductSlugs.includes(cachedProductDetail.slug)
      ? cachedProductDetail
      : storefrontProducts.find(product => product.slug === productSlug)
    : undefined;

  useEffect(() => {
    if (!productSlug || cachedProductDetail || isKnownMissingProduct) return;

    let active = true;
    setLoadingProductSlug(productSlug);

    void import('./lib/supabaseProducts')
      .then(({ fetchProductBySlugFromSupabase }) => fetchProductBySlugFromSupabase(productSlug, false))
      .then(product => {
        if (!active) return;

        if (!product) {
          setMissingProductSlugs(current => current.includes(productSlug) ? current : [...current, productSlug]);
          return;
        }

        setProductDetailsBySlug(current => ({ ...current, [product.slug]: product }));
        setRemoteProducts(current => {
          if (!current) return current;
          const exists = current.some(item => item.slug === product.slug);
          return exists
            ? current.map(item => item.slug === product.slug ? product : item)
            : [product, ...current];
        });
      })
      .catch(error => {
        console.error('Failed to load Supabase product details', error);
      })
      .finally(() => {
        if (active) setLoadingProductSlug(current => current === productSlug ? null : current);
      });

    return () => {
      active = false;
    };
  }, [cachedProductDetail, isKnownMissingProduct, productSlug]);

  useEffect(() => {
    applyPageSeo(activeProduct, settings, activeCategories);
  }, [activeCategories, activeProduct, settings]);

  useEffect(() => {
    trackPageView(route);
  }, [route]);

  useEffect(() => {
    trackViewContent(activeProduct);
  }, [activeProduct]);

  useEffect(() => {
    if (route.startsWith('#/search')) trackSearch(searchQuery);
  }, [route, searchQuery]);

  const navigate = (nextRoute: string) => {
    window.history.pushState(null, '', routeToPath(nextRoute));
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
    trackAddToCart(item);
    setSubmittedOrder(null);
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
    trackInitiateCheckout([item]);
    setSubmittedOrder(null);
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

  const saveSubmittedOrder = async (order: StoredOrder) => {
    if (!order.items.length || isOrderSubmitting) return null;

    setIsOrderSubmitting(true);
    try {
      await saveOrderToSupabase(order);

      const nextOrders = [order, ...readStored<StoredOrder[]>(ORDERS_KEY, [])];
      localStorage.setItem(ORDERS_KEY, JSON.stringify(nextOrders));
      setOrders(nextOrders);

      if (order.source === 'cart') setCart([]);
      setDirectItem(null);
      setSubmittedOrder(order);
      setIsCartOpen(true);
      setNotice('تم استلام طلبك');
      trackPurchase(order);
      return order;
    } catch (error) {
      console.error('Failed to save order to Supabase', error);
      setNotice('تعذر إرسال الطلب. المرجو المحاولة مرة أخرى.');
      return null;
    } finally {
      setIsOrderSubmitting(false);
    }
  };

  const submitOrderDraft = async (draft: OrderDraft) => {
    if (!draft.items.length || isOrderSubmitting) return null;

    const order: StoredOrder = {
      ...draft,
      id: `TM-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      total: orderTotal(draft.items),
    };
    return saveSubmittedOrder(order);
  };

  const placeOrder = (draft: OrderDraft) => {
    trackInitiateCheckout(draft.items);
    return submitOrderDraft(draft);
  };

  const placePreparedOrder = (order: StoredOrder) => {
    trackInitiateCheckout(order.items);
    return saveSubmittedOrder(order);
  };

  const placeOrderFromForm = (items: CartItem[], source: string, event: FormEvent<HTMLFormElement>) => {
    const draft = parseOrderForm(event, source, items);
    if (!draft) return Promise.resolve(null);
    trackInitiateCheckout(draft.items);
    return submitOrderDraft(draft);
  };

  const updateOrderStatus = (orderId: string, status: StoredOrder['status']) => {
    const previousOrders = orders;
    const nextOrders = orders.map(order => order.id === orderId ? {
      ...order,
      status,
      customerMessageStatus: undefined,
      customerMessageSentAt: undefined,
    } : order);
    setOrders(nextOrders);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(nextOrders));
    setNotice('تم تحديث حالة الطلب');

    void import('./lib/supabaseAdmin')
      .then(({ updateAdminOrderStatus }) => updateAdminOrderStatus(orderId, status))
      .catch(error => {
        console.error('Failed to update order status', error);
        setOrders(previousOrders);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(previousOrders));
        setNotice('تعذر تحديث حالة الطلب');
      });
  };

  const markOrderCustomerMessageSent = (orderId: string, status: StoredOrder['status']) => {
    const previousOrders = orders;
    const sentAt = new Date().toISOString();
    const nextOrders = orders.map(order => order.id === orderId ? {
      ...order,
      status,
      customerMessageStatus: status,
      customerMessageSentAt: sentAt,
    } : order);
    setOrders(nextOrders);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(nextOrders));

    void import('./lib/supabaseAdmin')
      .then(({ markAdminOrderCustomerMessageSent }) => markAdminOrderCustomerMessageSent(orderId, status))
      .catch(error => {
        console.error('Failed to mark customer message sent', error);
        setOrders(previousOrders);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(previousOrders));
        setNotice('تعذر حفظ حالة رسالة واتساب');
      });
  };

  const loginAdmin = async (email: string, password: string) => {
    setAdminLoginError('');
    setIsAdminLoading(true);
    setIsAdminDataReady(false);
    try {
      const { signInAdmin } = await import('./lib/supabaseAdmin');
      await signInAdmin(email, password);
      setIsAdminLoggedIn(true);
      navigate('#/tm-office-07');
    } catch {
      setAdminLoginError('بيانات الدخول غير صحيحة أو الحساب ليس مديراً');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const logoutAdmin = async () => {
    setIsAdminLoading(true);
    try {
      const { signOutAdmin } = await import('./lib/supabaseAdmin');
      await signOutAdmin();
    } catch (error) {
      console.error('Failed to sign out admin', error);
    } finally {
      setIsAdminLoggedIn(false);
      setIsAdminDataReady(false);
      setIsAdminLoading(false);
      setAdminLoginError('');
      navigate('#/tm-office-07/login');
    }
  };

  const commonProps = {
    cartCount,
    products: storefrontProducts,
    settings,
    categories: activeCategories,
    onNavigate: navigate,
    onOpenCart: () => {
      setSubmittedOrder(null);
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

  const saveStoreSettings = (nextSettings: StoreSettings) => {
    setSettings(nextSettings);
    void import('./lib/supabaseSettings')
      .then(({ saveStoreSettingsToSupabase }) => saveStoreSettingsToSupabase(nextSettings))
      .then(() => setNotice('تم حفظ إعدادات المتجر'))
      .catch(error => {
        console.error('Failed to save store settings to Supabase', error);
        setNotice('تم حفظ الإعدادات محليا');
      });
  };

  const saveProduct = async (product: Product, previousSlug = product.slug, options?: { isDraft?: boolean; silent?: boolean }) => {
    const previousProduct = adminProducts.find(item => item.slug === previousSlug || item.slug === product.slug);
    const isDraft = options?.isDraft ?? false;
    const previousDetails = previousProduct?.details ?? [];
    const incomingDetails = product.details ?? [];
    const previousGallery = previousProduct?.gallery?.filter(Boolean) ?? [];
    const incomingGallery = product.gallery?.filter(Boolean) ?? [];
    const protectedProduct = previousProduct && !isDraft ? {
      ...product,
      details: previousDetails.some(hasProductDetailContent) && !incomingDetails.some(hasProductDetailContent)
        ? previousDetails
        : product.details,
      gallery: previousGallery.length > 1 && incomingGallery.length <= 1
        ? previousGallery
        : product.gallery,
      image: previousGallery.length > 1 && incomingGallery.length <= 1
        ? previousProduct.image || previousGallery[0] || product.image
        : product.image,
    } : product;
    const isVisible = isDraft
      ? false
      : previousProduct?.isDraft
        ? true
        : previousProduct?.isVisible ?? !effectiveHiddenProductSlugs.includes(previousSlug);
    const nextProduct = { ...protectedProduct, isDraft, isVisible };

    try {
      const { upsertProductToSupabase } = await import('./lib/supabaseProducts');
      await upsertProductToSupabase(nextProduct, previousSlug, isVisible);
    } catch (error) {
      console.error('Failed to save product to Supabase', error);
      if (!options?.silent) setNotice(isDraft ? 'تعذر حفظ المسودة في قاعدة البيانات' : 'تعذر حفظ المنتج في قاعدة البيانات');
      throw error;
    }

    setCustomProducts(current => {
      const next = [nextProduct, ...current.filter(item => item.slug !== product.slug && item.slug !== previousSlug)];
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setRemoteProducts(current => [nextProduct, ...(current ?? []).filter(item => item.slug !== product.slug && item.slug !== previousSlug)]);
    setProductDetailsBySlug(current => {
      const next = { ...current, [nextProduct.slug]: nextProduct };
      if (previousSlug !== nextProduct.slug) delete next[previousSlug];
      return next;
    });
    setMissingProductSlugs(current => current.filter(slug => slug !== product.slug && slug !== previousSlug));
    setDeletedProductSlugs(current => {
      const next = current.filter(slug => slug !== product.slug && slug !== previousSlug);
      localStorage.setItem(ADMIN_DELETED_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setHiddenProductSlugs(current => {
      const next = current.filter(slug => slug !== product.slug && slug !== previousSlug);
      localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    if (!options?.silent) setNotice(isDraft ? 'تم حفظ المسودة' : 'تم نشر المنتج');
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
    setRemoteProducts(current => (current ?? []).filter(item => item.slug !== product.slug));
    setProductDetailsBySlug(current => {
      const next = { ...current };
      delete next[product.slug];
      return next;
    });
    setMissingProductSlugs(current => current.includes(product.slug) ? current : [...current, product.slug]);
    setNotice('تم حذف المنتج');

    void import('./lib/supabaseProducts')
      .then(({ deleteProductFromSupabase }) => deleteProductFromSupabase(product.slug))
      .catch(error => {
        console.error('Failed to delete product from Supabase', error);
        setNotice('تم حذف المنتج محليا فقط');
      });
  };

  const deleteProducts = (productsToDelete: Product[]) => {
    const slugs = productsToDelete.map(product => product.slug);
    if (!slugs.length) return;

    setCustomProducts(current => {
      const next = current.filter(item => !slugs.includes(item.slug));
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setDeletedProductSlugs(current => {
      const next = Array.from(new Set([...current, ...slugs]));
      localStorage.setItem(ADMIN_DELETED_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setHiddenProductSlugs(current => {
      const next = current.filter(slug => !slugs.includes(slug));
      localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
    setRemoteProducts(current => (current ?? []).filter(product => !slugs.includes(product.slug)));
    setProductDetailsBySlug(current => {
      const next = { ...current };
      slugs.forEach(slug => delete next[slug]);
      return next;
    });
    setMissingProductSlugs(current => Array.from(new Set([...current, ...slugs])));
    setNotice('تم حذف المنتجات المحددة');

    void Promise.all(slugs.map(slug => import('./lib/supabaseProducts').then(({ deleteProductFromSupabase }) => deleteProductFromSupabase(slug))))
      .catch(error => {
        console.error('Failed to delete selected products from Supabase', error);
        setNotice('تم حذف المنتجات محليا فقط');
      });
  };

  const toggleProductVisibility = (slug: string) => {
    const isCurrentlyHidden = effectiveHiddenProductSlugs.includes(slug);
    setHiddenProductSlugs(current => {
      const next = isCurrentlyHidden ? current.filter(item => item !== slug) : Array.from(new Set([...current, slug]));
      localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(next));
      setNotice(isCurrentlyHidden ? 'تم إظهار المنتج' : 'تم إخفاء المنتج');
      return next;
    });
    setRemoteProducts(current => (current ?? []).map(product => product.slug === slug ? { ...product, isVisible: isCurrentlyHidden } : product));
    setProductDetailsBySlug(current => {
      const product = current[slug];
      return product ? { ...current, [slug]: { ...product, isVisible: isCurrentlyHidden } } : current;
    });
    if (isCurrentlyHidden) setMissingProductSlugs(current => current.filter(item => item !== slug));

    void import('./lib/supabaseProducts')
      .then(({ setProductVisibilityInSupabase }) => setProductVisibilityInSupabase(slug, isCurrentlyHidden))
      .catch(error => {
        console.error('Failed to update product visibility in Supabase', error);
        setNotice('تم تغيير الظهور محليا فقط');
      });
  };

  const hideProducts = (slugs: string[]) => {
    setHiddenProductSlugs(current => {
      const next = Array.from(new Set([...current, ...slugs]));
      localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(next));
      setNotice('تم إخفاء المنتجات المحددة');
      return next;
    });
    setRemoteProducts(current => (current ?? []).map(product => slugs.includes(product.slug) ? { ...product, isVisible: false } : product));
    setProductDetailsBySlug(current => {
      const next = { ...current };
      slugs.forEach(slug => {
        if (next[slug]) next[slug] = { ...next[slug], isVisible: false };
      });
      return next;
    });
    void import('./lib/supabaseProducts')
      .then(({ setProductsVisibilityInSupabase }) => setProductsVisibilityInSupabase(slugs, false))
      .catch(error => {
        console.error('Failed to hide products in Supabase', error);
        setNotice('تم إخفاء المنتجات محليا فقط');
      });
  };

  const showProducts = (slugs: string[]) => {
    setHiddenProductSlugs(current => {
      const selected = new Set(slugs);
      const next = current.filter(slug => !selected.has(slug));
      localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(next));
      setNotice('تم إظهار المنتجات المحددة');
      return next;
    });
    setRemoteProducts(current => (current ?? []).map(product => slugs.includes(product.slug) ? { ...product, isVisible: true } : product));
    setProductDetailsBySlug(current => {
      const next = { ...current };
      slugs.forEach(slug => {
        if (next[slug]) next[slug] = { ...next[slug], isVisible: true };
      });
      return next;
    });
    setMissingProductSlugs(current => current.filter(slug => !slugs.includes(slug)));
    void import('./lib/supabaseProducts')
      .then(({ setProductsVisibilityInSupabase }) => setProductsVisibilityInSupabase(slugs, true))
      .catch(error => {
        console.error('Failed to show products in Supabase', error);
        setNotice('تم إظهار المنتجات محليا فقط');
      });
  };

  const syncProductsToSupabase = async () => {
    try {
      const { fetchProductsFromSupabase, upsertProductToSupabase } = await import('./lib/supabaseProducts');
      const productsToSync = adminProducts.length ? adminProducts : localAdminProducts;
      const hiddenDuringSync = adminProducts.length ? effectiveHiddenProductSlugs : hiddenProductSlugs;

      if (!productsToSync.length) {
        setNotice('No products to sync');
        return;
      }

      for (const [index, product] of productsToSync.entries()) {
        const isVisible = product.isVisible ?? !hiddenDuringSync.includes(product.slug);
        await upsertProductToSupabase({ ...product, sortOrder: product.sortOrder ?? index, isVisible }, undefined, isVisible);
      }

      const nextProducts = await fetchProductsFromSupabase(true);
      setRemoteProducts(nextProducts);
      setProductDetailsBySlug(Object.fromEntries(nextProducts.map(product => [product.slug, product])));
      setNotice('تمت مزامنة المنتجات');
    } catch (error) {
      console.error('Failed to sync products to Supabase', error);
      setNotice('تعذرت مزامنة المنتجات');
    }
  };

  const renderedPage = useMemo(() => {
    if (route === '#/tm-office-07/login') {
      return <ShadcnAdminLogin error={adminLoginError} loading={isAdminLoading} onLogin={loginAdmin} />;
    }

    const isAdminRouteLoading = route.startsWith('#/tm-office-07') && (isAdminLoading || (isAdminLoggedIn && !isAdminDataReady));

    if (isAdminRouteLoading) {
      return <AdminRouteLoading />;
    }

    if (route.startsWith('#/tm-office-07') && !isAdminLoggedIn) {
      return <ShadcnAdminLogin error={adminLoginError} loading={false} onLogin={loginAdmin} />;
    }

    if (route === '#/tm-office-07') {
      return (
        <ShadcnAdminDashboard
          products={adminProducts}
          orders={orders}
          hiddenSlugs={effectiveHiddenProductSlugs}
          route={route}
          onNavigate={navigate}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onLogout={logoutAdmin}
        />
      );
    }

    if (route === '#/tm-office-07/products') {
      return (
        <ShadcnAdminProductsPage
          products={adminProducts}
          orders={orders}
          hiddenSlugs={effectiveHiddenProductSlugs}
          route={route}
          onNavigate={navigate}
          onDeleteProduct={deleteProduct}
          onDeleteProducts={deleteProducts}
          onHideProducts={hideProducts}
          onShowProducts={showProducts}
          onSyncProducts={syncProductsToSupabase}
          onToggleVisibility={toggleProductVisibility}
        />
      );
    }

    if (route.startsWith('#/tm-office-07/products/') && route.endsWith('/edit')) {
      const slug = decodeURIComponent(route.replace('#/tm-office-07/products/', '').replace('/edit', ''));
      const editProduct = adminProducts.find(product => product.slug === slug);
      if (!editProduct) {
        return (
          <ShadcnAdminProductsPage
            products={adminProducts}
            orders={orders}
            hiddenSlugs={effectiveHiddenProductSlugs}
            route="#/tm-office-07/products"
            onNavigate={navigate}
            onDeleteProduct={deleteProduct}
            onDeleteProducts={deleteProducts}
            onHideProducts={hideProducts}
            onShowProducts={showProducts}
            onSyncProducts={syncProductsToSupabase}
            onToggleVisibility={toggleProductVisibility}
          />
        );
      }

      return (
        <TanjaMolAddProductPage
          key={`edit-${editProduct.slug}`}
          product={editProduct}
          products={adminProducts}
          categories={activeCategories}
          onBack={() => navigate('#/tm-office-07/products')}
          onOpenDashboard={() => navigate('#/tm-office-07')}
          onOpenProduct={(nextSlug) => navigate(productRoute(nextSlug))}
          onCreateProduct={saveProduct}
        />
      );
    }

    if (route === '#/tm-office-07/products/new') {
      return (
        <TanjaMolAddProductPage
          key="new-product"
          products={adminProducts}
          categories={activeCategories}
          onBack={() => navigate('#/tm-office-07/products')}
          onOpenDashboard={() => navigate('#/tm-office-07')}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onCreateProduct={saveProduct}
        />
      );
    }

    if (route === '#/tm-office-07/orders') {
      return (
        <ShadcnAdminOrdersPage
          orders={orders}
          settings={settings}
          route={route}
          onNavigate={navigate}
          onUpdateOrderStatus={updateOrderStatus}
          onMarkCustomerMessageSent={markOrderCustomerMessageSent}
        />
      );
    }

    if (route.startsWith('#/tm-office-07/orders/')) {
      return (
        <ShadcnAdminOrderDetailPage
          orders={orders}
          settings={settings}
          route={route}
          onNavigate={navigate}
          onUpdateOrderStatus={updateOrderStatus}
          onMarkCustomerMessageSent={markOrderCustomerMessageSent}
        />
      );
    }

    if (route.startsWith('#/tm-office-07/customers/')) {
      return (
        <ShadcnAdminCustomerDetailPage
          orders={orders}
          settings={settings}
          route={route}
          onNavigate={navigate}
          onUpdateOrderStatus={updateOrderStatus}
          onMarkCustomerMessageSent={markOrderCustomerMessageSent}
        />
      );
    }

    if (route === '#/tm-office-07/settings') {
      return <ShadcnAdminSettingsPage settings={settings} products={adminProducts} route={route} onSave={saveStoreSettings} onNavigate={navigate} />;
    }

    if (productSlug) {
      if (activeProduct && !cachedProductDetail && !isKnownMissingProduct) {
        return <ProductRouteLoading />;
      }

      if (!activeProduct) {
        if (loadingProductSlug === productSlug || (remoteProducts === null && !isKnownMissingProduct)) {
          return <ProductRouteLoading />;
        }

        return <NotFoundPage cartCount={cartCount} onNavigate={navigate} onOpenCart={commonProps.onOpenCart} onOpenSearch={commonProps.onOpenSearch} />;
      }

      return (
        <TanjaMolArabicCODProductPage
          key={activeProduct.id}
          product={activeProduct}
          products={storefrontProducts}
          categories={activeCategories}
          settings={settings}
          cartCount={cartCount}
          onOpenCart={() => {
            setSubmittedOrder(null);
            setDirectItem(null);
            setIsCartOpen(true);
          }}
          onOpenSearch={commonProps.onOpenSearch}
          onAddToCart={addToCart}
          onOrderProduct={orderProduct}
          onOpenProduct={(slug) => navigate(productRoute(slug))}
          onPlaceOrder={placeOrder}
          onPlacePreparedOrder={placePreparedOrder}
          isOrderSubmitting={isOrderSubmitting}
        />
      );
    }

    if (categoryId) return <CategoryPage categoryId={categoryId} {...commonProps} />;
    if (collectionId) return <CollectionPage collectionId={collectionId} {...commonProps} />;
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
          settings={settings}
          categories={activeCategories}
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
  }, [activeCategories, activeProduct, adminProducts, cachedProductDetail, cartCount, categoryId, collectionId, commonProps, effectiveHiddenProductSlugs, isAdminDataReady, isAdminLoading, isAdminLoggedIn, isKnownMissingProduct, isOrderSubmitting, loadingProductSlug, markOrderCustomerMessageSent, orders, productSlug, remoteProducts, route, searchQuery, settings, storefrontProducts]);

  return (
    <>
      <Suspense fallback={route.startsWith('#/tm-office-07') ? <AdminRouteLoading /> : null}>
        {renderedPage}
      </Suspense>
      <CartPopup
        open={isCartOpen}
        cart={cart}
        directItem={directItem}
        submittedOrder={submittedOrder}
        submitting={isOrderSubmitting}
        onClose={() => {
          setIsCartOpen(false);
          setDirectItem(null);
          setSubmittedOrder(null);
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

function AdminRouteLoading() {
  return (
    <main dir="rtl" className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[80px_minmax(0,1fr)]">
        <aside className="hidden border-l border-white/10 bg-zinc-950/95 px-3 py-5 lg:block">
          <TanjaMallLogo compact iconOnly className="justify-center" />
          <div className="mt-10 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => <SkeletonBlock key={index} className="h-11 w-11 bg-white/10" />)}
          </div>
        </aside>
        <section className="min-w-0">
          <div className="border-b border-white/10 bg-zinc-950/85 px-4 py-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-2">
                <SkeletonBlock className="h-7 w-36 bg-white/12" />
                <SkeletonBlock className="h-3 w-52 bg-white/8" />
              </div>
              <SkeletonBlock className="h-11 w-28 bg-orange-400/25" />
            </div>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-3 md:p-6 lg:p-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-white/10 bg-zinc-900/70 p-4">
                <SkeletonBlock className="h-3 w-24 bg-white/10" />
                <SkeletonBlock className="mt-4 h-8 w-20 bg-white/16" />
              </div>
            ))}
            <div className="rounded-lg border border-white/10 bg-zinc-900/70 p-4 md:col-span-3">
              <SkeletonBlock className="h-5 w-32 bg-white/12" />
              <div className="mt-5 grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="h-14 bg-white/8" />)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProductRouteLoading() {
  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-[var(--tm-bg)] pb-24 pt-16 text-[var(--tm-ink)]">
      <div className="fixed inset-x-0 top-0 z-20 bg-[var(--tm-header-alpha)] px-4 py-2.5 shadow-[0_14px_36px_rgba(19,25,33,0.2)]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          <SkeletonBlock className="h-11 w-11 bg-white/16" />
          <TanjaMallLogo compact className="text-white" textClassName="text-xl text-white" />
          <SkeletonBlock className="h-11 w-11 bg-white/16" />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:px-8 lg:py-8">
        <section className="grid gap-4">
          <div className="overflow-hidden rounded-lg bg-white shadow-[0_18px_46px_-28px_rgba(23,32,27,0.42)]">
            <SkeletonBlock className="h-[320px] rounded-none bg-[#ece7dc] sm:h-[420px] lg:h-[600px]" />
          </div>
          <div className="hidden grid-cols-4 gap-3 md:grid">
            {Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="h-24 bg-white/80" />)}
          </div>
        </section>

        <aside className="rounded-lg bg-[#fffdf8] p-4 shadow-[0_18px_46px_-28px_rgba(23,32,27,0.42)] ring-1 ring-black/[0.06] sm:p-5 lg:self-start">
          <SkeletonBlock className="h-4 w-24 bg-[#fff3df]" />
          <SkeletonBlock className="mt-4 h-9 w-4/5 bg-[#e8e1d5]" />
          <SkeletonBlock className="mt-3 h-5 w-full bg-[#eee8dd]" />
          <SkeletonBlock className="mt-2 h-5 w-2/3 bg-[#eee8dd]" />
          <div className="mt-5 flex items-center justify-between gap-3">
            <SkeletonBlock className="h-12 w-32 bg-[#ff9900]/35" />
            <SkeletonBlock className="h-12 w-36 bg-white" />
          </div>
          <div className="mt-5 grid gap-3 rounded-md bg-white p-3 ring-1 ring-black/[0.06]">
            <SkeletonBlock className="h-5 w-32 bg-[#e8e1d5]" />
            {Array.from({ length: 3 }).map((_, index) => <SkeletonBlock key={index} className="h-12 bg-[#f7f5ef]" />)}
            <SkeletonBlock className="h-12 bg-[#ff9900]/55" />
          </div>
        </aside>

        <section className="grid gap-4 lg:col-span-2">
          <div className="mx-auto grid w-full max-w-[760px] justify-items-center gap-3 text-center">
            <SkeletonBlock className="h-4 w-28 bg-[#fff3df]" />
            <SkeletonBlock className="h-9 w-3/4 bg-[#e8e1d5]" />
            <SkeletonBlock className="h-5 w-full max-w-[620px] bg-[#eee8dd]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-lg bg-white shadow-[0_12px_34px_-24px_rgba(23,32,27,0.45)] ring-1 ring-black/[0.05]">
                <SkeletonBlock className="h-40 rounded-none bg-[#ece7dc]" />
                <div className="grid gap-2 p-3">
                  <SkeletonBlock className="h-5 w-4/5 bg-[#e8e1d5]" />
                  <SkeletonBlock className="h-4 w-2/3 bg-[#eee8dd]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md ${className}`} />;
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function readStorefrontProductsCache() {
  try {
    const value = localStorage.getItem(STOREFRONT_PRODUCTS_CACHE_KEY);
    if (!value) return null;

    const cache = JSON.parse(value) as { savedAt?: number; products?: Product[] };
    if (!cache.savedAt || !Array.isArray(cache.products)) return null;
    if (Date.now() - cache.savedAt > STOREFRONT_PRODUCTS_CACHE_MAX_AGE_MS) {
      localStorage.removeItem(STOREFRONT_PRODUCTS_CACHE_KEY);
      return null;
    }

    return cache.products.filter(product => product?.slug && product?.title && product.isVisible !== false);
  } catch {
    localStorage.removeItem(STOREFRONT_PRODUCTS_CACHE_KEY);
    return null;
  }
}

function writeStorefrontProductsCache(products: Product[]) {
  try {
    localStorage.setItem(STOREFRONT_PRODUCTS_CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      products: products.filter(product => product.isVisible !== false),
    }));
  } catch {
    localStorage.removeItem(STOREFRONT_PRODUCTS_CACHE_KEY);
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
  const [hasTyped, setHasTyped] = useState(false);
  const results = useMemo(() => query.trim() ? searchProducts(products, query).slice(0, 8) : [], [products, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setHasTyped(false);
    window.setTimeout(() => document.getElementById('tm-search-panel-input')?.focus(), 60);
  }, [open]);

  if (!open) return null;

  return (
    <div dir="rtl" className="tm-modal-backdrop fixed inset-0 z-[90] bg-[#131921]/46 px-4 pt-20" role="dialog" aria-modal="true" aria-label="البحث" onClick={onClose}>
      <div className="tm-panel tm-panel-pop mx-auto w-full max-w-[720px] p-3 sm:p-4" onClick={event => event.stopPropagation()}>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="tm-search-panel-input">بحث</label>
          <input
            id="tm-search-panel-input"
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setHasTyped(true);
            }}
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
                className={`tm-press tm-panel-white grid grid-cols-[64px_1fr_auto] items-center gap-3 p-2 text-right ${hasTyped ? 'tm-search-result-row' : ''}`}
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
    <div className="tm-toast-slide fixed inset-x-0 top-4 z-[100] mx-auto w-fit max-w-[90vw] rounded-md bg-[#131921] px-4 py-3 text-sm font-black text-white shadow-[0_18px_48px_-22px_rgba(23,32,27,0.65)]" role="status">
      {message}
    </div>
  );
}
