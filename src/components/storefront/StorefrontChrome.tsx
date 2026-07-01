import { useState } from 'react';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { categories, categoryRoute, type Category } from '../../storefrontRuntime';
import { getCurrentRoute } from '../../lib/routing';
import { TanjaMallLogo } from '../brand/TanjaMallLogo';

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
            منتجات مختارة، طلب عبر واتساب، ودفع عند الاستلام داخل المغرب.
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
        <p>الدفع عند الاستلام داخل المغرب</p>
      </div>
    </footer>
  );
}
