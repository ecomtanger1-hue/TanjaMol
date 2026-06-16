const HASH_ROUTE_PREFIX = '#/';
const TRACKING_QUERY_KEYS = new Set([
  'fbclid',
  'gclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'msclkid',
  'ttclid',
]);

function getRouteSearch(pathname: string, search: string) {
  if (!search || pathname === '/') return '';

  const params = new URLSearchParams(search);
  for (const key of Array.from(params.keys())) {
    if (key.startsWith('utm_') || TRACKING_QUERY_KEYS.has(key)) {
      params.delete(key);
    }
  }

  const normalized = params.toString();
  return normalized ? `?${normalized}` : '';
}

export function routeToPath(route: string) {
  if (!route || route === '#') return '/';
  if (route.startsWith(HASH_ROUTE_PREFIX)) return route.slice(1) || '/';
  if (route.startsWith('/')) return route;
  return `/${route.replace(/^#+\/?/, '')}`;
}

export function getCurrentRoute() {
  const { hash, pathname, search } = window.location;
  if (hash.startsWith(HASH_ROUTE_PREFIX)) return hash;
  return `#${pathname || '/'}${getRouteSearch(pathname || '/', search)}`;
}

export function replaceLegacyHashRoute() {
  const { hash } = window.location;
  if (!hash.startsWith(HASH_ROUTE_PREFIX)) return false;

  window.history.replaceState(null, '', routeToPath(hash));
  return true;
}

export function navigateToRoute(route: string, replace = false) {
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method](null, '', routeToPath(route));
  window.dispatchEvent(new PopStateEvent('popstate'));
}
