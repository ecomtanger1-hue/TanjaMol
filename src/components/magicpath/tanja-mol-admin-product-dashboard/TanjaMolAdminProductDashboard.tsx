import type { CartItem, OrderDraft, Product } from '../../../storefrontRuntime';

type StoredOrder = OrderDraft & {
  id: string;
  createdAt: string;
};

type DashboardProps = {
  products: Product[];
  orders: StoredOrder[];
  onAddProduct: () => void;
  onOpenStorefront: () => void;
  onOpenProduct: (slug: string) => void;
  onOpenOrders?: () => void;
  onOpenSettings?: () => void;
};

const trafficSources = [
  ['Facebook Ads', '46%', 'w-[46%]'],
  ['Instagram', '27%', 'w-[27%]'],
  ['بحث مباشر', '18%', 'w-[18%]'],
  ['إحالات', '9%', 'w-[9%]'],
];

const chartHeights = [42, 64, 58, 88, 73, 96, 124, 112, 138, 122, 154, 170];

function orderTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export const TanjaMolAdminProductDashboard = ({
  products,
  orders,
  onAddProduct,
  onOpenStorefront,
  onOpenProduct,
  onOpenOrders,
  onOpenSettings,
}: DashboardProps) => {
  const salesTotal = orders.reduce((sum, order) => sum + orderTotal(order.items), 0);
  const publishedProducts = products.length;
  const productsNeedImages = products.filter(product => product.gallery.length < 3).length;
  const lowStock = products.filter(product => (product.stock ?? 24) < 10).length;
  const topProducts = products.slice(0, 4);
  const latestOrders = orders.slice(0, 5);

  const metrics = [
    ['المبيعات اليوم', `${salesTotal.toLocaleString('fr-MA')} درهم`, orders.length ? '+18%' : '0%', 'طلبات واتساب'],
    ['طلبات مسجلة', String(orders.length), `${Math.min(orders.length, 31)} مؤكد`, 'الدفع عند الاستلام'],
    ['منتجات منشورة', String(publishedProducts), `${productsNeedImages} تحتاج صور`, 'تظهر في واجهة المتجر'],
    ['معدل التحويل', orders.length ? '3.2%' : '0%', orders.length ? '+0.4%' : 'ابدأ البيع', 'زيارات وطلبات'],
  ];

  const orderFlow = [
    ['جديدة', orders.length, 'bg-[#00a66c]'],
    ['بانتظار التأكيد', Math.ceil(orders.length * 0.25), 'bg-[#f59e0b]'],
    ['جاهزة للإرسال', Math.ceil(orders.length * 0.45), 'bg-[#256dff]'],
    ['تم التسليم', Math.ceil(orders.length * 0.3), 'bg-[#102118]'],
  ];

  const productHealth = [
    ['منتجات منشورة', String(publishedProducts), 'جاهزة للبيع'],
    ['تحتاج صور', String(productsNeedImages), 'أقل من 3 صور في المعرض'],
    ['مخزون منخفض', String(lowStock), 'أقل من 10 قطع'],
    ['صفحات كاملة', String(Math.max(0, publishedProducts - productsNeedImages)), 'تفاصيل وصور جاهزة'],
  ];

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#f4f2eb] text-[#17201b]">
      <div className="grid min-h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-l border-[#d9dfd8] bg-[#102118] text-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col px-4 py-5">
            <div className="flex items-center gap-3 px-2">
              <button type="button" onClick={onOpenStorefront} className="grid h-11 w-11 place-items-center rounded-md bg-[#00a66c] font-heading text-lg font-black">TM</button>
              <div>
                <p className="font-heading text-xl font-black">TanjaMol</p>
                <p className="text-xs font-bold text-white/58">إدارة المتجر</p>
              </div>
            </div>

            <nav className="mt-8 grid gap-1 text-sm font-extrabold">
              {['لوحة التحكم', 'المنتجات', 'الطلبات', 'الزوار', 'التقارير', 'الإعدادات'].map((item, index) => (
                <button key={item} type="button" onClick={index === 1 ? onAddProduct : index === 2 ? onOpenOrders : index === 5 ? onOpenSettings : undefined} className={`min-h-[42px] rounded-md px-3 text-right transition-colors ${index === 0 ? 'bg-white text-[#102118]' : 'text-white/72 hover:bg-white/10 hover:text-white'}`}>
                  {item}
                </button>
              ))}
            </nav>

            <div className="mt-auto rounded-md bg-white/10 p-4">
              <p className="text-xs font-bold text-white/58">صحة المتجر اليوم</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
                <div className="h-full rounded-full bg-[#00d084]" style={{ width: `${Math.min(92, 64 + publishedProducts)}%` }} />
              </div>
              <p className="mt-3 text-sm font-extrabold leading-6">الأداء جيد. راقب المنتجات التي تحتاج صورا أو مخزونا قبل إطلاق الحملات.</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#d9dfd8] bg-[#f8f7f1]/94 backdrop-blur">
            <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-xs font-black text-[#0f7d55]">نظرة عامة</p>
                <h1 className="truncate font-heading text-2xl font-black sm:text-3xl">لوحة تحكم TanjaMol</h1>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onOpenStorefront} className="tm-admin-press hidden min-h-[42px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-extrabold text-[#17201b] sm:block">
                  فتح المتجر
                </button>
                <button type="button" onClick={onAddProduct} className="tm-admin-press min-h-[42px] rounded-md bg-[#00a66c] px-4 text-sm font-black text-white shadow-[0_14px_34px_-22px_rgba(0,166,108,0.9)]">
                  إضافة منتج
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:px-8">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map(([label, value, delta, hint]) => (
                <article key={label} className="tm-admin-surface rounded-md bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-extrabold text-[#65716a]">{label}</p>
                    <span className={`rounded-md px-2 py-1 text-xs font-black ${delta.startsWith('+') ? 'bg-[#e7f8ee] text-[#0f7d55]' : 'bg-[#fff1d5] text-[#9a5a00]'}`}>{delta}</span>
                  </div>
                  <p className="tm-admin-num mt-3 font-heading text-3xl font-black text-[#17201b]">{value}</p>
                  <p className="mt-1 text-xs font-bold text-[#65716a]">{hint}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_420px]">
              <article className="tm-admin-surface rounded-md bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-heading text-2xl font-black">المبيعات والطلبات</h2>
                    <p className="mt-1 text-sm font-semibold text-[#65716a]">قراءة سريعة للأداء والطلبات.</p>
                  </div>
                  <div className="flex gap-2 text-xs font-black">
                    <span className="rounded-md bg-[#eef3ef] px-3 py-2 text-[#4e5a52]">اليوم</span>
                    <span className="rounded-md bg-[#17201b] px-3 py-2 text-white">7 أيام</span>
                    <span className="rounded-md bg-[#eef3ef] px-3 py-2 text-[#4e5a52]">30 يوم</span>
                  </div>
                </div>

                <div className="mt-6 flex h-[260px] items-end gap-3 border-b border-[#dfe5df] px-1">
                  {chartHeights.map((height, index) => (
                    <div key={height + index} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t-md bg-[#00a66c]" style={{ height: `${Math.max(18, height + orders.length * 2)}px` }} />
                      <span className="tm-admin-num text-[11px] font-bold text-[#65716a]">{index + 1}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  {orderFlow.map(([label, count, color]) => (
                    <div key={label} className="rounded-md bg-[#f4f7f4] p-3">
                      <div className={`h-1.5 rounded-full ${color}`} />
                      <p className="mt-3 text-xs font-extrabold text-[#65716a]">{label}</p>
                      <p className="tm-admin-num mt-1 font-heading text-2xl font-black">{count}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="tm-admin-surface rounded-md bg-[#102118] p-4 text-white sm:p-5">
                <h2 className="font-heading text-2xl font-black">تنبيهات تحتاج قرار</h2>
                <div className="mt-4 grid gap-3">
                  {[
                    [`${productsNeedImages} منتجات تحتاج صورا إضافية`, 'أكمل المعرض قبل تشغيل الإعلانات'],
                    [`${lowStock} منتجات بمخزون منخفض`, 'راجع المورد قبل زيادة الطلبات'],
                    [orders.length ? `${orders.length} طلبات واتساب` : 'لا توجد طلبات بعد', 'راجع واجهة المتجر'],
                  ].map(([title, action]) => (
                    <div key={title} className="rounded-md bg-white/10 p-3">
                      <p className="text-sm font-extrabold">{title}</p>
                      <p className="mt-1 text-xs font-bold text-[#72e2af]">{action}</p>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={onAddProduct} className="tm-admin-press mt-4 min-h-[42px] w-full rounded-md bg-white text-sm font-black text-[#102118]">
                  فتح صفحة إضافة منتج
                </button>
              </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <article className="tm-admin-surface rounded-md bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-2xl font-black">أكثر المنتجات أداء</h2>
                  <button type="button" onClick={onAddProduct} className="tm-admin-press min-h-[36px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">إضافة منتج</button>
                </div>
                <div className="mt-4 grid gap-3">
                  {topProducts.map((product, index) => (
                    <button key={product.id} type="button" onClick={() => onOpenProduct(product.slug)} className="tm-admin-press flex items-center gap-3 rounded-md border border-[#dfe5df] bg-[#fbfaf6] p-3 text-right">
                      <img src={product.image} alt={product.title} className="tm-admin-image h-14 w-14 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-base font-black">{product.title}</p>
                        <p className="mt-1 text-xs font-bold text-[#65716a]">{index + 3} طلبات</p>
                      </div>
                      <div className="text-left">
                        <p className="tm-admin-num font-heading text-xl font-black text-[#0f7d55]">{product.priceLabel}</p>
                        <p className="text-xs font-bold text-[#65716a]">السعر</p>
                      </div>
                    </button>
                  ))}
                </div>
              </article>

              <article className="tm-admin-surface rounded-md bg-white p-4 sm:p-5">
                <h2 className="font-heading text-2xl font-black">مصادر الزيارات</h2>
                <div className="mt-4 grid gap-4">
                  {trafficSources.map(([source, value, width]) => (
                    <div key={source}>
                      <div className="flex items-center justify-between text-sm font-extrabold">
                        <span>{source}</span>
                        <span className="tm-admin-num text-[#0f7d55]">{value}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e1e7e1]">
                        <div className={`h-full rounded-full bg-[#00a66c] ${width}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <article className="tm-admin-surface overflow-hidden rounded-md bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-[#dfe5df] p-4">
                  <h2 className="font-heading text-2xl font-black">آخر الطلبات</h2>
                  <button type="button" onClick={onOpenStorefront} className="tm-admin-press min-h-[36px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black">فتح المتجر</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-[#f4f7f4] text-xs font-black text-[#65716a]">
                      <tr>
                        <th className="px-4 py-3 text-right">الطلب</th>
                        <th className="px-4 py-3 text-right">الزبون</th>
                        <th className="px-4 py-3 text-right">المنتج</th>
                        <th className="px-4 py-3 text-right">المبلغ</th>
                        <th className="px-4 py-3 text-right">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(latestOrders.length ? latestOrders : []).map(order => (
                        <tr key={order.id} className="border-t border-[#e4e9e4]">
                          <td className="tm-admin-num px-4 py-3 font-black">{order.id}</td>
                          <td className="px-4 py-3 font-bold">{order.name}</td>
                          <td className="px-4 py-3 text-[#65716a]">{order.items[0]?.title || 'طلب مباشر'}</td>
                          <td className="tm-admin-num px-4 py-3 font-black">{orderTotal(order.items)} درهم</td>
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-[#eef3ef] px-2.5 py-1 text-xs font-black text-[#4e5a52]">واتساب</span>
                          </td>
                        </tr>
                      ))}
                      {!latestOrders.length ? (
                        <tr className="border-t border-[#e4e9e4]">
                          <td colSpan={5} className="px-4 py-8 text-center font-bold text-[#65716a]">لا توجد طلبات بعد. جرّب تقديم طلب من صفحة منتج.</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="tm-admin-surface rounded-md bg-white p-4 sm:p-5">
                <h2 className="font-heading text-2xl font-black">صحة المنتجات</h2>
                <div className="mt-4 grid gap-2">
                  {productHealth.map(([label, value, hint]) => (
                    <div key={label} className="flex items-center justify-between gap-3 rounded-md bg-[#fbfaf6] px-3 py-3">
                      <div>
                        <p className="font-heading text-base font-black">{label}</p>
                        <p className="mt-1 text-xs font-bold text-[#65716a]">{hint}</p>
                      </div>
                      <p className="tm-admin-num font-heading text-2xl font-black text-[#0f7d55]">{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
