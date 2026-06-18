import type { ReactNode } from 'react';
import { LayoutDashboard, Package, Settings, ShoppingBag, Store } from 'lucide-react';
import { TanjaMallLogo } from '../brand/TanjaMallLogo';
import { getCurrentRoute, navigateToRoute } from '../../lib/routing';

type AdminShellProps = {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  onNavigate?: (route: string) => void;
};

const adminNav = [
  { label: '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645', route: '#/admin', icon: LayoutDashboard },
  { label: '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a', route: '#/admin/products', icon: Package },
  { label: '\u0627\u0644\u0637\u0644\u0628\u0627\u062a', route: '#/admin/orders', icon: ShoppingBag },
  { label: '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a', route: '#/admin/settings', icon: Settings },
];

const adminMobileNav = [
  adminNav[0],
  adminNav[2],
  adminNav[1],
  adminNav[3],
];

function defaultNavigate(route: string) {
  navigateToRoute(route);
}

function isActive(route: string, currentRoute: string) {
  if (route === '#/admin') return currentRoute === '#/admin';
  return currentRoute.startsWith(route);
}

export function AdminSidebar({ onNavigate = defaultNavigate }: { onNavigate?: (route: string) => void }) {
  const currentRoute = getCurrentRoute();

  return (
    <aside className="group/admin-sidebar fixed bottom-0 right-0 top-0 z-50 hidden w-[76px] overflow-hidden border-l border-[#59665c] bg-[#3f4a43] text-white transition-[width,box-shadow] duration-200 ease-out lg:block lg:hover:w-[188px] lg:hover:shadow-[-22px_0_44px_-32px_rgba(19,25,33,0.5)]">
      <div className="flex h-full w-[188px] flex-col bg-[#3f4a43] px-3 py-5">
        <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press flex min-h-[48px] items-center gap-3 rounded-md px-1 text-right">
          <TanjaMallLogo compact subtitle={"\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u062a\u062c\u0631"} textClassName="text-lg opacity-0 transition-opacity duration-150 group-hover/admin-sidebar:opacity-100" />
        </button>

        <nav className="mt-8 grid gap-1 text-sm font-extrabold">
          {adminNav.map(item => {
            const Icon = item.icon;
            const active = isActive(item.route, currentRoute);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.route)}
                aria-current={active ? 'page' : undefined}
                className={`tm-admin-press grid min-h-[46px] w-11 grid-cols-[44px_1fr] items-center overflow-hidden rounded-md text-right transition-[width,background-color,color] duration-200 ease-out group-hover/admin-sidebar:w-full ${active ? 'bg-[#fbfaf6] text-[#17201b]' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
              >
                <span className="grid h-11 w-11 place-items-center">
                  <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={2.4} />
                </span>
                <span className="truncate pl-3 opacity-0 transition-opacity duration-150 group-hover/admin-sidebar:opacity-100">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press mt-auto grid min-h-[46px] w-11 grid-cols-[44px_1fr] items-center overflow-hidden rounded-md text-right text-white/75 transition-[width,background-color,color] duration-200 ease-out hover:bg-white/10 hover:text-white group-hover/admin-sidebar:w-full">
          <span className="grid h-11 w-11 place-items-center">
            <Store className="h-5 w-5" aria-hidden="true" strokeWidth={2.4} />
          </span>
          <span className="truncate pl-3 opacity-0 transition-opacity duration-150 group-hover/admin-sidebar:opacity-100">فتح المتجر</span>
        </button>
      </div>
    </aside>
  );
}

export function AdminMobileDeck({ onNavigate = defaultNavigate }: { onNavigate?: (route: string) => void }) {
  const currentRoute = getCurrentRoute();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d8ded8] bg-[#f8f7f1]/96 px-3 pt-2 shadow-[0_-16px_34px_-24px_rgba(23,32,27,0.42)] backdrop-blur lg:hidden"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      aria-label="Admin mobile navigation"
    >
      <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-2">
        {adminMobileNav.map(item => {
          const Icon = item.icon;
          const active = isActive(item.route, currentRoute);

          return (
            <button
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
              aria-current={active ? 'page' : undefined}
              className={`tm-admin-press grid min-h-[54px] content-center justify-items-center gap-1 rounded-md px-1 text-[11px] font-black leading-tight transition-colors ${active ? 'bg-[#3f4a43] text-white shadow-[0_12px_24px_-18px_rgba(19,25,33,0.55)]' : 'bg-white text-[#65716a] shadow-[inset_0_0_0_1px_rgba(23,32,27,0.08)]'}`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-[#ffb84d]' : 'text-[#b45309]'}`} aria-hidden="true" strokeWidth={2.35} />
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function AdminShell({ title, eyebrow, actions, children, onNavigate = defaultNavigate }: AdminShellProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f2eb] pb-[calc(88px+env(safe-area-inset-bottom))] text-[#17201b] lg:pb-0">
      <AdminSidebar onNavigate={onNavigate} />
      <AdminMobileDeck onNavigate={onNavigate} />
      <main className="min-w-0 lg:pr-[76px]">
        <header className="sticky top-0 z-30 border-b border-[#d9dfd8] bg-[#f8f7f1]/94">
          <div className="mx-auto flex min-h-[60px] max-w-[1360px] items-center justify-between gap-3 px-3 sm:min-h-[64px] sm:px-6 lg:px-8">
            <div className="min-w-0">
              {eyebrow ? <p className="text-xs font-black text-[#b45309]">{eyebrow}</p> : null}
              <h1 className="truncate font-heading text-lg font-black sm:text-2xl">{title}</h1>
            </div>
            {actions ? <div className="flex min-w-0 shrink-0 items-center justify-end gap-2">{actions}</div> : null}
          </div>
        </header>
        <div className="mx-auto grid max-w-[1360px] gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
