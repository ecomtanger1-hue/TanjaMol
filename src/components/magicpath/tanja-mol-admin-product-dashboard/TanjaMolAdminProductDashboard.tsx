import { AlertTriangle, EyeOff, ImageOff, PackagePlus, ShoppingBag, Store, Wallet } from 'lucide-react';
import type { CartItem, Product, StoredOrder } from '../../../storefrontRuntime';
import { productRoute } from '../../../storefrontRuntime';
import { AdminShell } from '../../admin/AdminLayout';
import { navigateToRoute } from '../../../lib/routing';

type DashboardProps = {
  products: Product[];
  orders: StoredOrder[];
  hiddenSlugs?: string[];
  onAddProduct: () => void;
  onOpenProducts?: () => void;
  onOpenStorefront: () => void;
  onOpenProduct: (slug: string) => void;
  onOpenOrders?: () => void;
  onOpenSettings?: () => void;
};

function orderTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function productRevenue(product: Product, orders: StoredOrder[]) {
  return orders.reduce((sum, order) => {
    const productItems = order.items.filter(item => item.slug === product.slug || item.id === product.id);
    return sum + productItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
  }, 0);
}

function productOrders(product: Product, orders: StoredOrder[]) {
  return orders.reduce((sum, order) => sum + order.items.filter(item => item.slug === product.slug || item.id === product.id).reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
}

function needsDetails(product: Product) {
  return !product.details?.some(detail => detail.title.trim() && detail.text.trim() && detail.mediaUrl.trim());
}

function needsImages(product: Product) {
  return !product.image || (product.gallery?.filter(Boolean).length || 0) < 2;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ar-MA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

export const TanjaMallAdminProductDashboard = ({
  products,
  orders,
  hiddenSlugs = [],
  onAddProduct,
  onOpenProducts,
  onOpenStorefront,
  onOpenProduct,
  onOpenOrders,
}: DashboardProps) => {
  const hiddenSet = new Set(hiddenSlugs);
  const revenue = orders.reduce((sum, order) => sum + (order.total || orderTotal(order.items)), 0);
  const visibleProducts = products.filter(product => !hiddenSet.has(product.slug));
  const hiddenProducts = products.filter(product => hiddenSet.has(product.slug));
  const lowStockProducts = products.filter(product => (product.stock ?? 0) > 0 && (product.stock ?? 0) < 10);
  const outOfStockProducts = products.filter(product => (product.stock ?? 0) <= 0);
  const productsMissingImages = products.filter(needsImages);
  const productsMissingDetails = products.filter(needsDetails);
  const attentionProducts = products
    .map(product => {
      const issues = [
        hiddenSet.has(product.slug) ? 'مخفي' : '',
        needsImages(product) ? 'صور ناقصة' : '',
        needsDetails(product) ? 'تفاصيل ناقصة' : '',
        (product.stock ?? 0) <= 0 ? 'نفد المخزون' : (product.stock ?? 0) < 10 ? 'مخزون منخفض' : '',
      ].filter(Boolean);

      return { product, issues };
    })
    .filter(row => row.issues.length)
    .slice(0, 6);
  const topProducts = [...products]
    .sort((a, b) => productRevenue(b, orders) - productRevenue(a, orders))
    .slice(0, 5);
  const recentOrders = [...orders].slice(0, 6);

  const metrics = [
    {
      label: 'الطلبات',
      value: orders.length.toLocaleString('fr-MA'),
      icon: ShoppingBag,
      onClick: onOpenOrders,
    },
    {
      label: 'المداخيل',
      value: `${revenue.toLocaleString('fr-MA')} درهم`,
      icon: Wallet,
      onClick: onOpenOrders,
    },
    {
      label: 'المنتجات الظاهرة',
      value: visibleProducts.length.toLocaleString('fr-MA'),
      icon: Store,
      onClick: onOpenProducts,
    },
    {
      label: 'تحتاج انتباها',
      value: String(lowStockProducts.length + outOfStockProducts.length + productsMissingImages.length + productsMissingDetails.length),
      icon: AlertTriangle,
      onClick: onOpenProducts,
    },
  ];

  return (
    <AdminShell
      title="لوحة التحكم"
      eyebrow="إدارة المتجر"
      onNavigate={navigateToRoute}
      actions={
        <>
          <button type="button" onClick={onOpenStorefront} className="tm-admin-press hidden min-h-[44px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black sm:inline-flex">
            فتح المتجر
          </button>
          <button type="button" onClick={onAddProduct} className="tm-admin-press inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#ff9900] px-3 text-xs font-black text-[#131921]">
            <PackagePlus className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
            إضافة منتج
          </button>
        </>
      }
    >
      <section className="grid grid-cols-2 gap-2 sm:gap-3">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <button key={metric.label} type="button" onClick={metric.onClick} className="tm-admin-press tm-admin-surface min-h-[96px] rounded-md bg-white p-3 text-right sm:min-h-[112px] sm:p-4">
              <span className="grid h-full content-between gap-3">
                <span className="flex items-start justify-between gap-2">
                  <span className="block text-xs font-extrabold leading-5 text-[#65716a]">{metric.label}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#fff3df] text-[#b45309] sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" strokeWidth={2.35} />
                  </span>
                </span>
                <span className="tm-admin-num block break-words font-heading text-xl font-black leading-tight text-[#17201b] sm:text-2xl">
                  {metric.value}
                </span>
              </span>
            </button>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <article className="tm-admin-surface rounded-md bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#dfe5df] p-4">
            <h2 className="font-heading text-lg font-black">منتجات تحتاج مراجعة</h2>
            <button type="button" onClick={onOpenProducts} className="tm-admin-press min-h-[44px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">كل المنتجات</button>
          </div>
          <div className="grid divide-y divide-[#e4e9e4]">
            {attentionProducts.map(({ product, issues }) => (
              <button key={product.slug} type="button" onClick={() => onOpenProduct(product.slug)} className="tm-admin-press grid grid-cols-[48px_minmax(0,1fr)] gap-3 p-3 text-right sm:flex sm:items-center">
                <img src={product.image} alt={product.title} className="h-12 w-12 rounded-md object-cover" loading="lazy" decoding="async" width="96" height="96" />
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-heading text-sm font-black leading-5 sm:truncate">{product.title}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {issues.map(issue => <span key={issue} className="rounded-md bg-[#fff1d5] px-2 py-1 text-[11px] font-black text-[#9a5a00]">{issue}</span>)}
                  </span>
                </span>
                <span className="tm-admin-num col-start-2 text-xs font-black text-[#65716a] sm:shrink-0">{product.stock ?? 0} في المخزون</span>
              </button>
            ))}
            {!attentionProducts.length ? (
              <div className="grid min-h-[180px] place-items-center p-6 text-center">
                <div>
                  <p className="font-heading text-lg font-black">كل المنتجات مرتبة</p>
                  <p className="mt-1 text-sm font-bold text-[#65716a]">لا توجد عناصر تحتاج مراجعة الآن.</p>
                </div>
              </div>
            ) : null}
          </div>
        </article>

        <article className="tm-admin-surface rounded-md bg-[#131921] p-4 text-white">
          <h2 className="font-heading text-lg font-black">صحة الكتالوج</h2>
          <div className="mt-4 grid gap-2">
            {[
              ['مخزون منخفض', lowStockProducts.length, 'أقل من 10'],
              ['نفد المخزون', outOfStockProducts.length, 'غير قابل للبيع'],
              ['صور ناقصة', productsMissingImages.length, 'معرض غير مكتمل'],
              ['تفاصيل ناقصة', productsMissingDetails.length, 'قسم التفاصيل'],
              ['منتجات مخفية', hiddenProducts.length, 'غير ظاهرة للعملاء'],
            ].map(([label, value, hint]) => (
              <button key={label} type="button" onClick={onOpenProducts} className="tm-admin-press flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-3 text-right">
                <span>
                  <span className="block text-sm font-black">{label}</span>
                  <span className="text-xs font-bold text-white/58">{hint}</span>
                </span>
                <span className="tm-admin-num font-heading text-2xl font-black text-[#ffb84d]">{value}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className="tm-admin-surface overflow-hidden rounded-md bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#dfe5df] p-4">
            <h2 className="font-heading text-lg font-black">آخر الطلبات</h2>
            <button type="button" onClick={onOpenOrders} className="tm-admin-press min-h-[44px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">فتح الطلبات</button>
          </div>
          <div className="grid gap-2 p-3 md:hidden">
            {recentOrders.map(order => (
              <button key={order.id} type="button" onClick={() => navigateToRoute(`#/tm-office-07/orders/${encodeURIComponent(order.id)}`)} className="tm-admin-press rounded-md bg-[#fbfaf6] p-3 text-right shadow-[inset_0_0_0_1px_rgba(23,32,27,0.08)]">
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="tm-admin-num block font-heading text-base font-black">{order.id}</span>
                    <span className="mt-1 block break-words text-sm font-bold">{order.name}</span>
                    <span className="mt-1 block text-xs font-bold text-[#65716a]">{formatDate(order.createdAt)}</span>
                  </span>
                  <span className="tm-admin-num shrink-0 text-left font-heading text-base font-black text-[#b45309]">{(order.total || orderTotal(order.items)).toLocaleString('fr-MA')} درهم</span>
                </span>
                <span className="mt-2 block text-xs font-bold text-[#65716a]">{order.items.length} منتجات</span>
              </button>
            ))}
            {!recentOrders.length ? (
              <div className="px-4 py-8 text-center font-bold text-[#65716a]">لا توجد طلبات بعد.</div>
            ) : null}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-[#f4f7f4] text-xs font-black text-[#65716a]">
                <tr>
                  <th className="px-4 py-3 text-right">الطلب</th>
                  <th className="px-4 py-3 text-right">الزبون</th>
                  <th className="px-4 py-3 text-right">المنتجات</th>
                  <th className="px-4 py-3 text-right">المبلغ</th>
                  <th className="px-4 py-3 text-right">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-t border-[#e4e9e4]">
                    <td className="tm-admin-num px-4 py-3 font-black">{order.id}</td>
                    <td className="px-4 py-3 font-bold">{order.name}</td>
                    <td className="px-4 py-3 font-bold text-[#65716a]">{order.items.length}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{(order.total || orderTotal(order.items)).toLocaleString('fr-MA')} درهم</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#65716a]">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {!recentOrders.length ? (
                  <tr className="border-t border-[#e4e9e4]">
                    <td colSpan={5} className="px-4 py-8 text-center font-bold text-[#65716a]">لا توجد طلبات بعد.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="tm-admin-surface rounded-md bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-black">أفضل المنتجات</h2>
            <button type="button" onClick={onOpenProducts} className="tm-admin-press min-h-[44px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">إدارة</button>
          </div>
          <div className="mt-3 grid gap-2">
            {topProducts.map(product => {
              const ordersCount = productOrders(product, orders);
              const revenueTotal = productRevenue(product, orders);
              return (
                <button key={product.slug} type="button" onClick={() => onOpenProduct(product.slug)} className="tm-admin-press grid grid-cols-[48px_minmax(0,1fr)] gap-3 rounded-md border border-[#dfe5df] bg-[#fbfaf6] p-3 text-right sm:flex sm:items-center">
                  <img src={product.image} alt={product.title} className="h-12 w-12 rounded-md object-cover" loading="lazy" decoding="async" width="96" height="96" />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words font-heading text-sm font-black leading-5 sm:truncate">{product.title}</span>
                    <span className="tm-admin-num mt-1 block text-xs font-bold text-[#65716a]">{ordersCount} طلب</span>
                  </span>
                  <span className="tm-admin-num col-start-2 break-words font-heading text-sm font-black text-[#b45309] sm:shrink-0 sm:text-base">{revenueTotal.toLocaleString('fr-MA')} درهم</span>
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={onOpenProducts} className="tm-admin-press tm-admin-surface flex items-center justify-between rounded-md bg-white p-4 text-right">
          <span>
            <span className="block font-heading text-base font-black">إدارة المنتجات</span>
            <span className="text-xs font-bold text-[#65716a]">{products.length} منتج</span>
          </span>
          <Store className="h-5 w-5 text-[#b45309]" aria-hidden="true" strokeWidth={2.35} />
        </button>
        <button type="button" onClick={onOpenProducts} className="tm-admin-press tm-admin-surface flex items-center justify-between rounded-md bg-white p-4 text-right">
          <span>
            <span className="block font-heading text-base font-black">المنتجات المخفية</span>
            <span className="text-xs font-bold text-[#65716a]">{hiddenProducts.length} منتج</span>
          </span>
          <EyeOff className="h-5 w-5 text-[#b45309]" aria-hidden="true" strokeWidth={2.35} />
        </button>
        <button type="button" onClick={onOpenProducts} className="tm-admin-press tm-admin-surface flex items-center justify-between rounded-md bg-white p-4 text-right">
          <span>
            <span className="block font-heading text-base font-black">صور ناقصة</span>
            <span className="text-xs font-bold text-[#65716a]">{productsMissingImages.length} منتج</span>
          </span>
          <ImageOff className="h-5 w-5 text-[#b45309]" aria-hidden="true" strokeWidth={2.35} />
        </button>
      </section>
    </AdminShell>
  );
};
