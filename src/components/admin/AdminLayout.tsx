import type { ReactNode } from 'react';
import { BarChart3, LayoutDashboard, Package, Settings, ShoppingBag, Store, Users } from 'lucide-react';

type AdminShellProps = {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  onNavigate?: (route: string) => void;
};

const adminNav = [
  { label: 'لوحة التحكم', route: '#/admin', icon: LayoutDashboard },
  { label: 'المنتجات', route: '#/admin/products', icon: Package },
  { label: 'الطلبات', route: '#/admin/orders', icon: ShoppingBag },
  { label: 'الزوار', route: '#/admin', icon: Users, active: false },
  { label: 'التقارير', route: '#/admin', icon: BarChart3, active: false },
  { label: 'الإعدادات', route: '#/admin/settings', icon: Settings },
];

function defaultNavigate(route: string) {
  window.location.hash = route;
}

function isActive(route: string, currentRoute: string) {
  if (route === '#/admin') return currentRoute === '#/admin';
  return currentRoute.startsWith(route);
}

export function AdminSidebar({ onNavigate = defaultNavigate }: { onNavigate?: (route: string) => void }) {
  const currentRoute = window.location.hash || '#/admin';

  return (
    <aside className="group/admin-sidebar fixed bottom-0 right-0 top-0 z-50 hidden w-[76px] overflow-hidden border-l border-[#173226] bg-[#102118] text-white transition-[width,box-shadow] duration-200 ease-out lg:block lg:hover:w-[188px] lg:hover:shadow-[-22px_0_44px_-32px_rgba(16,33,24,0.8)]">
      <div className="flex h-full w-[188px] flex-col bg-[#102118] px-3 py-5">
        <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press flex min-h-[48px] items-center gap-3 rounded-md px-1 text-right">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#00a66c] font-heading text-lg font-black">TM</span>
          <span className="min-w-0 opacity-0 transition-opacity duration-150 group-hover/admin-sidebar:opacity-100">
            <span className="block whitespace-nowrap font-heading text-lg font-black leading-none">TanjaMol</span>
            <span className="mt-1 block whitespace-nowrap text-xs font-bold text-white/58">إدارة المتجر</span>
          </span>
        </button>

        <nav className="mt-8 grid gap-1 text-sm font-extrabold">
          {adminNav.map(item => {
            const Icon = item.icon;
            const active = item.active === false ? false : isActive(item.route, currentRoute);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.route)}
                aria-current={active ? 'page' : undefined}
                className={`tm-admin-press grid min-h-[46px] w-11 grid-cols-[44px_1fr] items-center overflow-hidden rounded-md text-right transition-[width,background-color,color] duration-200 ease-out group-hover/admin-sidebar:w-full ${active ? 'bg-white text-[#102118]' : 'text-white/72 hover:bg-white/10 hover:text-white'}`}
              >
                <span className="grid h-11 w-11 place-items-center">
                  <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={2.4} />
                </span>
                <span className="truncate pl-3 opacity-0 transition-opacity duration-150 group-hover/admin-sidebar:opacity-100">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press mt-auto grid min-h-[46px] w-11 grid-cols-[44px_1fr] items-center overflow-hidden rounded-md text-right text-white/72 transition-[width,background-color,color] duration-200 ease-out hover:bg-white/10 hover:text-white group-hover/admin-sidebar:w-full">
          <span className="grid h-11 w-11 place-items-center">
            <Store className="h-5 w-5" aria-hidden="true" strokeWidth={2.4} />
          </span>
          <span className="truncate pl-3 opacity-0 transition-opacity duration-150 group-hover/admin-sidebar:opacity-100">فتح المتجر</span>
        </button>
      </div>
    </aside>
  );
}

export function AdminShell({ title, eyebrow, actions, children, onNavigate = defaultNavigate }: AdminShellProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f2eb] text-[#17201b]">
      <AdminSidebar onNavigate={onNavigate} />
      <main className="min-w-0 lg:pr-[76px]">
        <header className="sticky top-0 z-30 border-b border-[#d9dfd8] bg-[#f8f7f1]/94">
          <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              {eyebrow ? <p className="text-xs font-black text-[#0f7d55]">{eyebrow}</p> : null}
              <h1 className="truncate font-heading text-2xl font-black sm:text-3xl">{title}</h1>
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </div>
        </header>
        <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
