import { orderTotal, type CartItem, type Product, type StoredOrder } from '../storefrontRuntime';

type MetaPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Lead'
  | 'Search';

type MetaPixelParams = Record<string, string | number | boolean | string[] | Array<Record<string, string | number>>>;
type MetaPixelOptions = {
  eventID?: string;
};

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    __tmMetaPixelBasePageView?: boolean;
    __tmMetaPixelInitializedId?: string;
  }
}

const META_PIXEL_ID = '1024192293463169';
const CURRENCY = 'MAD';
const LEAD_EVENT_IDS_KEY = 'tanjamall.meta.leadEventIds.v1';

let initializedPixelId = '';
let lastPageView = '';
let lastViewContent = '';

function shouldTrack() {
  return Boolean(META_PIXEL_ID) && typeof window !== 'undefined';
}

function ensureMetaPixel() {
  if (!shouldTrack() || !META_PIXEL_ID) return false;
  if (!initializedPixelId && window.__tmMetaPixelInitializedId === META_PIXEL_ID && window.fbq) {
    initializedPixelId = META_PIXEL_ID;
  }

  if (initializedPixelId === META_PIXEL_ID && window.fbq) return true;

  if (!window.fbq) {
    const fbq: Fbq = function metaPixelQueue(...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }

      fbq.queue?.push(args);
    };

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    window.fbq = fbq;
    window._fbq = fbq;
  }

  const hasMetaPixelScript = document.getElementById('meta-pixel-script') || Array.from(document.scripts).some(script => script.src.includes('connect.facebook.net') && script.src.includes('fbevents.js'));

  if (!hasMetaPixelScript) {
    const script = document.createElement('script');
    script.id = 'meta-pixel-script';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  if (initializedPixelId !== META_PIXEL_ID) {
    window.fbq('init', META_PIXEL_ID);
    initializedPixelId = META_PIXEL_ID;
  }

  return true;
}

function track(event: MetaPixelEvent, params?: MetaPixelParams, options?: MetaPixelOptions) {
  if (!ensureMetaPixel()) return;
  window.fbq?.('track', event, params, options);
}

function readTrackedLeadEventIds() {
  try {
    const raw = window.localStorage.getItem(LEAD_EVENT_IDS_KEY);
    const value = raw ? JSON.parse(raw) as unknown : [];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function hasTrackedLeadEvent(eventId: string) {
  return readTrackedLeadEventIds().includes(eventId);
}

function rememberTrackedLeadEvent(eventId: string) {
  try {
    const next = [eventId, ...readTrackedLeadEventIds().filter(item => item !== eventId)].slice(0, 50);
    window.localStorage.setItem(LEAD_EVENT_IDS_KEY, JSON.stringify(next));
  } catch {
    // Tracking should never block the order flow.
  }
}

function cartContents(items: CartItem[]) {
  return items.map(item => ({
    id: item.id,
    quantity: item.quantity,
    item_price: item.price,
  }));
}

function itemParams(item: CartItem) {
  return {
    content_ids: [item.id],
    content_name: item.title,
    content_type: 'product',
    contents: cartContents([item]),
    currency: CURRENCY,
    value: item.price * item.quantity,
  };
}

export function trackPageView(route: string) {
  if (route.startsWith('#/tm-office-07')) return;

  const currentPage = `${window.location.pathname}${window.location.search}${route}`;
  if (lastPageView === currentPage) return;

  lastPageView = currentPage;
  if (window.__tmMetaPixelBasePageView) {
    window.__tmMetaPixelBasePageView = false;
    ensureMetaPixel();
    return;
  }

  track('PageView');
}

export function trackViewContent(product: Product | undefined) {
  if (!product) return;

  const currentContent = product.slug;
  if (lastViewContent === currentContent) return;

  lastViewContent = currentContent;
  track('ViewContent', {
    content_ids: [product.id],
    content_name: product.title,
    content_category: product.category,
    content_type: 'product',
    currency: CURRENCY,
    value: product.price,
  });
}

export function trackAddToCart(item: CartItem) {
  track('AddToCart', itemParams(item));
}

export function trackInitiateCheckout(items: CartItem[]) {
  if (!items.length) return;

  track('InitiateCheckout', {
    content_ids: items.map(item => item.id),
    content_type: 'product',
    contents: cartContents(items),
    currency: CURRENCY,
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value: orderTotal(items),
  });
}

export function trackLead(order: StoredOrder) {
  const eventID = `lead-${order.id}`;
  if (hasTrackedLeadEvent(eventID)) return;

  track('Lead', {
    content_ids: order.items.map(item => item.id),
    content_type: 'product',
    contents: cartContents(order.items),
    currency: CURRENCY,
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    order_id: order.id,
    value: order.total,
  }, { eventID });
  rememberTrackedLeadEvent(eventID);
}

export function clearTrackedLeadForTesting(orderId: string) {
  const eventID = `lead-${orderId}`;
  try {
    window.localStorage.setItem(LEAD_EVENT_IDS_KEY, JSON.stringify(readTrackedLeadEventIds().filter(item => item !== eventID)));
  } catch {
    // Testing helper only.
  }
}

export function trackSearch(query: string) {
  const searchString = query.trim();
  if (!searchString) return;

  track('Search', { search_string: searchString });
}
