import type { ReactNode } from 'react';
import { BarChart3, Boxes, Home, LogOut, Package, Settings, ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  route: string;
  icon: typeof BarChart3;
};

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', route: '#/admin', icon: Home },
  { label: 'الطلبات', route: '#/admin/orders', icon: ShoppingBag },
  { label: 'المنتجات', route: '#/admin/products', icon: Package },
  { label: 'الإعدادات', route: '#/admin/settings', icon: Settings },
];

type ShadcnAdminShellProps = {
  title: string;
  description?: ReactNode;
  route: string;
  children: ReactNode;
  actions?: ReactNode;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
};

export function ShadcnAdminShell({ title, description, route, children, actions, onNavigate, onLogout }: ShadcnAdminShellProps) {
  return (
    <div className="dark min-h-screen bg-zinc-950 text-zinc-50">
      <aside className="group/shadcn-sidebar fixed inset-y-0 right-0 z-30 hidden w-20 overflow-hidden border-l border-white/10 bg-zinc-950/95 px-3 py-5 backdrop-blur transition-[width,box-shadow] duration-200 hover:w-64 hover:shadow-[-22px_0_44px_-32px_rgba(0,0,0,0.8)] lg:block">
        <div className="flex h-full w-56 flex-col">
          <button
            type="button"
            onClick={() => onNavigate('#/admin')}
            className="flex min-h-12 w-full items-center gap-3 rounded-lg px-2 text-right"
            title="TanjaMall"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-orange-500 text-zinc-950">
              <Boxes className="size-5" />
            </span>
            <span className="min-w-0 opacity-0 transition-opacity duration-150 group-hover/shadcn-sidebar:opacity-100">
              <span className="block text-sm font-black">TanjaMall</span>
              <span className="block text-xs text-zinc-400">لوحة الإدارة</span>
            </span>
          </button>

          <nav className="mt-8 grid gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = route === item.route || (item.route !== '#/admin' && route.startsWith(item.route));
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                  title={item.label}
                  className={cn(
                    'grid min-h-11 w-11 grid-cols-[44px_1fr] items-center overflow-hidden rounded-md text-sm font-bold text-zinc-300 transition-[width,background-color,color] duration-200 hover:bg-white/10 hover:text-white group-hover/shadcn-sidebar:w-full',
                    active && 'bg-orange-500 text-zinc-950 hover:bg-orange-400 hover:text-zinc-950',
                  )}
                >
                  <span className="grid size-11 place-items-center">
                    <Icon className="size-4" />
                  </span>
                  <span className="truncate opacity-0 transition-opacity duration-150 group-hover/shadcn-sidebar:opacity-100">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <Button
            type="button"
            variant="outline"
            className="mt-auto grid min-h-11 w-11 grid-cols-[44px_1fr] justify-start overflow-hidden border-white/10 bg-white/5 px-0 text-zinc-100 transition-[width,background-color,color] duration-200 hover:bg-white/10 group-hover/shadcn-sidebar:w-full"
            onClick={() => onNavigate('#/')}
            title="فتح المتجر"
          >
            <span className="grid size-11 place-items-center">
              <Store className="size-4" />
            </span>
            <span className="truncate text-right opacity-0 transition-opacity duration-150 group-hover/shadcn-sidebar:opacity-100">فتح المتجر</span>
          </Button>
        </div>
      </aside>

      <main className="min-h-screen pb-28 transition-[margin] duration-200 lg:mr-20 lg:pb-10">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/85 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-normal md:text-3xl">{title}</h1>
              {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
            </div>
            {actions || onLogout ? (
              <div className="flex flex-wrap gap-2">
                {actions}
                {onLogout ? (
                  <Button type="button" variant="outline" className="border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/20" onClick={onLogout}>
                    <LogOut className="size-4" />
                    تسجيل الخروج
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-2xl backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = route === item.route || (item.route !== '#/admin' && route.startsWith(item.route));
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={cn(
                  'grid min-h-[58px] place-items-center gap-1 rounded-lg border border-white/10 bg-white/5 text-[11px] font-black text-zinc-300',
                  active && 'border-orange-500 bg-orange-500 text-zinc-950',
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
