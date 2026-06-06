import { Edit, Eye, EyeOff, PackagePlus, Trash2 } from 'lucide-react';
import { AdminShell } from './AdminLayout';
import { productRoute, type Product, type StoredOrder } from '../../storefrontRuntime';

type AdminProductsPageProps = {
  products: Product[];
  orders: StoredOrder[];
  hiddenSlugs: string[];
  onNavigate: (route: string) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleVisibility: (slug: string) => void;
};

function productSales(product: Product, orders: StoredOrder[]) {
  const matchingItems = orders.flatMap(order => order.items.filter(item => item.slug === product.slug || item.id === product.id));
  const sales = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
  const revenue = matchingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { sales, revenue };
}

function productStatus(product: Product, hidden: boolean) {
  if (hidden) return { label: 'مخفي', className: 'bg-[#fff1d5] text-[#9a5a00]' };
  if ((product.gallery?.length || 0) < 3) return { label: 'يحتاج صور', className: 'bg-[#fff1d5] text-[#9a5a00]' };
  if ((product.stock ?? 24) < 10) return { label: 'مخزون منخفض', className: 'bg-[#fff1d5] text-[#9a5a00]' };
  return { label: 'ظاهر', className: 'bg-[#fff3df] text-[#b45309]' };
}

export function AdminProductsPage({
  products,
  orders,
  hiddenSlugs,
  onNavigate,
  onDeleteProduct,
  onToggleVisibility,
}: AdminProductsPageProps) {
  const hiddenSet = new Set(hiddenSlugs);
  const visibleCount = products.filter(product => !hiddenSet.has(product.slug)).length;
  const hiddenCount = products.length - visibleCount;
  const totalRevenue = products.reduce((sum, product) => sum + productSales(product, orders).revenue, 0);

  return (
    <AdminShell
      title="المنتجات"
      eyebrow="إدارة المتجر"
      onNavigate={onNavigate}
      actions={
        <>
          <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press hidden min-h-[42px] rounded-md border border-[#cfd8d1] bg-white px-4 text-sm font-extrabold text-[#17201b] sm:block">
            فتح المتجر
          </button>
          <button type="button" onClick={() => onNavigate('#/admin/products/new')} className="tm-admin-press inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#ff9900] px-4 text-sm font-black text-[#131921] shadow-[0_14px_34px_-22px_rgba(255,153,0,0.9)]">
            <PackagePlus className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
            إضافة منتج
          </button>
        </>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['كل المنتجات', products.length.toLocaleString('fr-MA'), 'منتجات في الإدارة'],
          ['ظاهرة في المتجر', visibleCount.toLocaleString('fr-MA'), 'يراها العملاء'],
          ['مخفية', hiddenCount.toLocaleString('fr-MA'), 'غير ظاهرة للعملاء'],
          ['مداخيل المنتجات', `${totalRevenue.toLocaleString('fr-MA')} درهم`, 'حسب الطلبات المسجلة'],
        ].map(([label, value, hint]) => (
          <article key={label} className="tm-admin-surface rounded-md bg-white p-4">
            <p className="text-xs font-extrabold text-[#65716a]">{label}</p>
            <p className="tm-admin-num mt-3 font-heading text-3xl font-black text-[#17201b]">{value}</p>
            <p className="mt-1 text-xs font-bold text-[#65716a]">{hint}</p>
          </article>
        ))}
      </section>

      <section className="tm-admin-surface overflow-hidden rounded-md bg-white">
        <div className="flex flex-col gap-2 border-b border-[#dfe5df] p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-black">قائمة المنتجات</h2>
            <p className="mt-1 text-sm font-semibold text-[#65716a]">إدارة الظهور، التعديل، الحذف، ومراجعة الأداء.</p>
          </div>
          <p className="text-xs font-black text-[#65716a]">{products.length} منتج</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-[#f4f7f4] text-xs font-black text-[#65716a]">
              <tr>
                <th className="px-4 py-3 text-right">المنتج</th>
                <th className="px-4 py-3 text-right">القسم</th>
                <th className="px-4 py-3 text-right">السعر</th>
                <th className="px-4 py-3 text-right">المخزون</th>
                <th className="px-4 py-3 text-right">الصور</th>
                <th className="px-4 py-3 text-right">المبيعات</th>
                <th className="px-4 py-3 text-right">المداخيل</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const hidden = hiddenSet.has(product.slug);
                const status = productStatus(product, hidden);
                const sales = productSales(product, orders);

                return (
                  <tr key={product.slug} className="border-t border-[#e4e9e4] align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.title} className="h-14 w-14 rounded-md object-cover" loading="lazy" decoding="async" width="112" height="112" />
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate font-heading text-base font-black">{product.title}</p>
                          <p className="tm-admin-num mt-1 text-xs font-bold text-[#65716a]">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#65716a]">{product.category}</td>
                    <td className="tm-admin-num px-4 py-3 font-heading text-lg font-black text-[#b45309]">{product.priceLabel}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{product.stock ?? 24}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{product.gallery?.length || 0}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{sales.sales}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{sales.revenue} درهم</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => onNavigate(productRoute(product.slug))} className="tm-admin-press grid h-9 w-9 place-items-center rounded-md border border-[#cfd8d1] bg-white text-[#17201b]" aria-label={`فتح ${product.title}`}>
                          <Eye className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
                        </button>
                        <button type="button" onClick={() => onNavigate(`#/admin/products/${encodeURIComponent(product.slug)}/edit`)} className="tm-admin-press grid h-9 w-9 place-items-center rounded-md border border-[#cfd8d1] bg-white text-[#17201b]" aria-label={`تعديل ${product.title}`}>
                          <Edit className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
                        </button>
                        <button type="button" onClick={() => onToggleVisibility(product.slug)} className="tm-admin-press grid h-9 w-9 place-items-center rounded-md border border-[#cfd8d1] bg-white text-[#17201b]" aria-label={hidden ? `إظهار ${product.title}` : `إخفاء ${product.title}`}>
                          {hidden ? <EyeOff className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} /> : <Eye className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />}
                        </button>
                        <button type="button" onClick={() => onDeleteProduct(product)} className="tm-admin-press grid h-9 w-9 place-items-center rounded-md bg-[#fff1d5] text-[#9a5a00]" aria-label={`حذف ${product.title}`}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
