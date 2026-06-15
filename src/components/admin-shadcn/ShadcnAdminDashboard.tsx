import { ArrowUpLeft, Banknote, Boxes, Clock3, PackagePlus, ShoppingBag, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShadcnAdminShell } from './ShadcnAdminShell';
import type { Product, StoredOrder } from '../../storefrontRuntime';

type ShadcnAdminDashboardProps = {
  products: Product[];
  orders: StoredOrder[];
  hiddenSlugs: string[];
  route: string;
  onNavigate: (route: string) => void;
  onOpenProduct: (slug: string) => void;
};

const statusLabels: Record<StoredOrder['status'], string> = {
  new: 'جديد',
  whatsapp: 'بانتظار التأكيد',
  confirmed: 'مؤكد',
  delivery: 'في التوصيل',
  done: 'مكتمل',
};

const statusClassNames: Record<StoredOrder['status'], string> = {
  new: 'border-orange-400/30 bg-orange-500/15 text-orange-200',
  whatsapp: 'border-sky-400/30 bg-sky-500/15 text-sky-200',
  confirmed: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
  delivery: 'border-violet-400/30 bg-violet-500/15 text-violet-200',
  done: 'border-zinc-500/30 bg-zinc-500/15 text-zinc-200',
};

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ar-MA', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatMoney(value: number) {
  return `${value.toLocaleString('ar-MA')} د.م.`;
}

export function ShadcnAdminDashboard({
  products,
  orders,
  hiddenSlugs,
  route,
  onNavigate,
  onOpenProduct,
}: ShadcnAdminDashboardProps) {
  const todayOrders = orders.filter(order => isToday(order.createdAt));
  const activeOrders = orders.filter(order => order.status !== 'done');
  const visibleProducts = products.filter(product => !product.isDraft && !hiddenSlugs.includes(product.slug));
  const lowStockProducts = products.filter(product => (product.stock ?? 0) < 10);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = orders.slice(0, 6);

  const metrics = [
    { label: 'طلبات اليوم', value: todayOrders.length.toLocaleString('ar-MA'), icon: ShoppingBag },
    { label: 'قيد المتابعة', value: activeOrders.length.toLocaleString('ar-MA'), icon: Clock3 },
    { label: 'منتجات ظاهرة', value: visibleProducts.length.toLocaleString('ar-MA'), icon: Boxes },
    { label: 'مداخيل اليوم', value: formatMoney(todayRevenue), icon: Banknote },
  ];

  return (
    <ShadcnAdminShell
      title="لوحة التحكم"
      description="نظرة عملية على الطلبات والمنتجات من الهاتف أو المكتب."
      route={route}
      onNavigate={onNavigate}
      actions={
        <>
          <Button type="button" className="bg-orange-500 text-zinc-950 hover:bg-orange-400" onClick={() => onNavigate('#/admin/products/new')}>
            <PackagePlus className="size-4" />
            منتج جديد
          </Button>
          <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10" onClick={() => onNavigate('#/')}>
            <Store className="size-4" />
            المتجر
          </Button>
        </>
      }
    >
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
              <CardHeader className="flex-row items-center justify-between gap-3 pb-2">
                <CardTitle className="text-sm font-bold text-zinc-400">{metric.label}</CardTitle>
                <span className="grid size-9 place-items-center rounded-md bg-white/10 text-orange-300">
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-black tracking-normal">{metric.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
          <CardHeader className="!flex !flex-row items-center justify-between gap-3">
            <CardTitle className="text-lg font-black">الطلبات الأخيرة</CardTitle>
            <Button type="button" variant="outline" size="sm" className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10" onClick={() => onNavigate('#/admin/orders')}>
              الكل
              <ArrowUpLeft className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-2">
            {recentOrders.length ? recentOrders.map(order => (
              <button
                key={order.id}
                type="button"
                onClick={() => onNavigate(`#/admin/orders/${encodeURIComponent(order.id)}`)}
                className="flex min-h-[58px] items-center gap-3 rounded-lg border border-white/10 bg-zinc-950/70 px-3 py-2 text-right transition hover:border-orange-400/50"
              >
                <div className="min-w-0 flex flex-1 items-center gap-2">
                  <Badge variant="outline" className={statusClassNames[order.status]}>{statusLabels[order.status]}</Badge>
                  <span className="shrink-0 font-black">{order.id}</span>
                  <span className="shrink-0 text-xs text-zinc-500">{formatTime(order.createdAt)}</span>
                  <span className="truncate text-sm font-bold text-zinc-200">{order.name || 'عميل بدون اسم'}</span>
                  <span className="truncate text-xs text-zinc-500">{order.phone}</span>
                  <span className="truncate text-xs text-zinc-500">{order.address}</span>
                </div>
                <div className="shrink-0 text-left">
                  <p className="text-lg font-black text-orange-300">{formatMoney(order.total)}</p>
                  <p className="text-xs text-zinc-500">{order.items.length.toLocaleString('ar-MA')} منتج</p>
                </div>
              </button>
            )) : (
              <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">لا توجد طلبات بعد.</div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black">منتجات تحتاج انتباه</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {lowStockProducts.slice(0, 5).map((product, index) => (
                <div key={product.slug}>
                  <button type="button" onClick={() => onOpenProduct(product.slug)} className="flex w-full items-center gap-3 text-right">
                    <img
                      src={product.image}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      className="size-14 rounded-md object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black">{product.title}</span>
                      <span className="text-xs text-zinc-500">المخزون: {(product.stock ?? 0).toLocaleString('ar-MA')}</span>
                    </span>
                    <ArrowUpLeft className="size-4 text-zinc-500" />
                  </button>
                  {index < Math.min(lowStockProducts.length, 5) - 1 ? <Separator className="mt-3 bg-white/10" /> : null}
                </div>
              ))}
              {!lowStockProducts.length ? <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">كل المنتجات تبدو مستقرة.</p> : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </ShadcnAdminShell>
  );
}
