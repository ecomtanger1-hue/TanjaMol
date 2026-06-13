import { useMemo, useState } from 'react';
import { Edit, Eye, EyeOff, PackagePlus, Search, Trash2 } from 'lucide-react';
import { AdminShell } from './AdminLayout';
import { productRoute, type Product, type StoredOrder } from '../../storefrontRuntime';

type ProductFilter = 'all' | 'visible' | 'hidden' | 'drafts' | 'low-stock' | 'needs-images' | 'needs-details';
type ProductSort = 'newest' | 'stock' | 'price-low' | 'price-high' | 'orders' | 'revenue';

type AdminProductsPageProps = {
  products: Product[];
  orders: StoredOrder[];
  hiddenSlugs: string[];
  onNavigate: (route: string) => void;
  onDeleteProduct: (product: Product) => void;
  onDeleteProducts?: (products: Product[]) => void;
  onHideProducts?: (slugs: string[]) => void;
  onShowProducts?: (slugs: string[]) => void;
  onSyncProducts?: () => void;
  onToggleVisibility: (slug: string) => void;
};

function productSales(product: Product, orders: StoredOrder[]) {
  const matchingItems = orders.flatMap(order => order.items.filter(item => item.slug === product.slug || item.id === product.id));
  const sales = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
  const revenue = matchingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { sales, revenue };
}

function needsImages(product: Product) {
  return !product.image || (product.gallery?.filter(Boolean).length || 0) < 2;
}

function needsDetails(product: Product) {
  return !product.details?.some(detail => detail.title.trim() && detail.text.trim() && detail.mediaUrl.trim());
}

function productStatus(product: Product, hidden: boolean) {
  if (product.isDraft) return { label: 'مسودة', className: 'bg-[#eef3ef] text-[#65716a]' };
  if (hidden) return { label: 'مخفي', className: 'bg-[#fff1d5] text-[#9a5a00]' };
  if ((product.stock ?? 0) <= 0) return { label: 'نفد المخزون', className: 'bg-[#fff1d5] text-[#9a5a00]' };
  if ((product.stock ?? 0) < 10) return { label: 'مخزون منخفض', className: 'bg-[#fff1d5] text-[#9a5a00]' };
  if (needsImages(product)) return { label: 'صور ناقصة', className: 'bg-[#fff1d5] text-[#9a5a00]' };
  if (needsDetails(product)) return { label: 'تفاصيل ناقصة', className: 'bg-[#fff1d5] text-[#9a5a00]' };
  return { label: 'ظاهر', className: 'bg-[#fff3df] text-[#b45309]' };
}

function productDateValue(product: Product) {
  const value = Date.parse(product.createdAt || product.updatedAt || '');
  return Number.isFinite(value) ? value : 0;
}

export function AdminProductsPage({
  products,
  orders,
  hiddenSlugs,
  onNavigate,
  onDeleteProduct,
  onDeleteProducts,
  onHideProducts,
  onShowProducts,
  onSyncProducts,
  onToggleVisibility,
}: AdminProductsPageProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [sort, setSort] = useState<ProductSort>('newest');
  const [selected, setSelected] = useState<string[]>([]);
  const hiddenSet = useMemo(() => new Set(hiddenSlugs), [hiddenSlugs]);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .map((product, index) => ({
        product,
        index,
        hidden: hiddenSet.has(product.slug),
        sales: productSales(product, orders),
      }))
      .filter(row => {
        if (normalizedQuery) {
          const haystack = `${row.product.title} ${row.product.slug} ${row.product.category} ${row.product.badge}`.toLowerCase();
          if (!haystack.includes(normalizedQuery)) return false;
        }
        if (filter === 'visible') return !row.product.isDraft && !row.hidden;
        if (filter === 'hidden') return !row.product.isDraft && row.hidden;
        if (filter === 'drafts') return Boolean(row.product.isDraft);
        if (filter === 'low-stock') return (row.product.stock ?? 0) < 10;
        if (filter === 'needs-images') return needsImages(row.product);
        if (filter === 'needs-details') return needsDetails(row.product);
        return true;
      })
      .sort((a, b) => {
        if (sort === 'stock') return (a.product.stock ?? 0) - (b.product.stock ?? 0);
        if (sort === 'price-low') return a.product.price - b.product.price;
        if (sort === 'price-high') return b.product.price - a.product.price;
        if (sort === 'orders') return b.sales.sales - a.sales.sales;
        if (sort === 'revenue') return b.sales.revenue - a.sales.revenue;
        return productDateValue(b.product) - productDateValue(a.product) || a.index - b.index;
      });
  }, [filter, hiddenSet, orders, products, query, sort]);

  const draftCount = products.filter(product => product.isDraft).length;
  const visibleCount = products.filter(product => !product.isDraft && !hiddenSet.has(product.slug)).length;
  const hiddenCount = products.filter(product => !product.isDraft && hiddenSet.has(product.slug)).length;
  const selectedProducts = products.filter(product => selected.includes(product.slug));
  const allCurrentSelected = rows.length > 0 && rows.every(row => selected.includes(row.product.slug));

  const toggleSelected = (slug: string) => {
    setSelected(current => current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]);
  };

  const bulkHide = () => {
    onHideProducts?.(selected);
    setSelected([]);
  };

  const bulkShow = () => {
    onShowProducts?.(selected);
    setSelected([]);
  };

  const bulkDelete = () => {
    if (!selectedProducts.length) return;
    const confirmed = window.confirm(`حذف ${selectedProducts.length} منتج من الإدارة والمتجر؟`);
    if (!confirmed) return;
    onDeleteProducts?.(selectedProducts);
    setSelected([]);
  };

  return (
    <AdminShell
      title="المنتجات"
      eyebrow="إدارة المتجر"
      onNavigate={onNavigate}
      actions={
        <>
          <button type="button" onClick={() => onNavigate('#/')} className="tm-admin-press hidden min-h-[38px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black sm:inline-flex">
            فتح المتجر
          </button>
          {onSyncProducts ? (
            <button type="button" onClick={onSyncProducts} className="tm-admin-press hidden min-h-[38px] rounded-md border border-[#cfd8d1] bg-white px-3 text-xs font-black sm:inline-flex">
              مزامنة
            </button>
          ) : null}
          <button type="button" onClick={() => onNavigate('#/admin/products/new')} className="tm-admin-press inline-flex min-h-[38px] items-center gap-2 rounded-md bg-[#ff9900] px-3 text-xs font-black text-[#131921]">
            <PackagePlus className="h-4 w-4" aria-hidden="true" strokeWidth={2.4} />
            إضافة منتج
          </button>
        </>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['كل المنتجات', products.length.toLocaleString('fr-MA')],
          ['ظاهرة', visibleCount.toLocaleString('fr-MA')],
          ['مخفية', hiddenCount.toLocaleString('fr-MA')],
          ['مسودات', draftCount.toLocaleString('fr-MA')],
        ].map(([label, value]) => (
          <article key={label} className="tm-admin-surface rounded-md bg-white p-4">
            <p className="text-xs font-extrabold text-[#65716a]">{label}</p>
            <p className="tm-admin-num mt-2 font-heading text-2xl font-black text-[#17201b]">{value}</p>
          </article>
        ))}
      </section>

      <section className="tm-admin-surface overflow-hidden rounded-md bg-white">
        <div className="grid gap-3 border-b border-[#dfe5df] p-4 xl:grid-cols-[minmax(280px,1fr)_210px_210px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65716a]" aria-hidden="true" strokeWidth={2.35} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="بحث عن منتج"
              className="min-h-[40px] w-full rounded-md border border-[#cfd8d1] bg-[#fbfaf6] pr-9 pl-3 text-sm font-bold outline-none focus:border-[#b45309]"
            />
          </label>
          <select value={filter} onChange={event => setFilter(event.target.value as ProductFilter)} className="min-h-[40px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-black outline-none focus:border-[#b45309]">
            <option value="all">كل الحالات</option>
            <option value="visible">ظاهر</option>
            <option value="hidden">مخفي</option>
            <option value="drafts">مسودات</option>
            <option value="low-stock">مخزون منخفض</option>
            <option value="needs-images">صور ناقصة</option>
            <option value="needs-details">تفاصيل ناقصة</option>
          </select>
          <select value={sort} onChange={event => setSort(event.target.value as ProductSort)} className="min-h-[40px] rounded-md border border-[#cfd8d1] bg-[#fbfaf6] px-3 text-sm font-black outline-none focus:border-[#b45309]">
            <option value="newest">الأحدث</option>
            <option value="stock">المخزون</option>
            <option value="price-low">السعر الأقل</option>
            <option value="price-high">السعر الأعلى</option>
            <option value="orders">الأكثر طلبا</option>
            <option value="revenue">الأعلى مداخيل</option>
          </select>
        </div>

        {selected.length ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfe5df] bg-[#fff8eb] px-4 py-3">
            <p className="text-sm font-black">{selected.length} محدد</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={bulkHide} className="tm-admin-press min-h-[34px] rounded-md border border-[#d8c3a0] bg-white px-3 text-xs font-black">إخفاء المحدد</button>
              <button type="button" onClick={bulkShow} className="tm-admin-press min-h-[34px] rounded-md border border-[#d8c3a0] bg-white px-3 text-xs font-black">إظهار المحدد</button>
              <button type="button" onClick={bulkDelete} className="tm-admin-press min-h-[34px] rounded-md bg-[#fff1d5] px-3 text-xs font-black text-[#9a5a00]">حذف المحدد</button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-[#f4f7f4] text-xs font-black text-[#65716a]">
              <tr>
                <th className="px-4 py-3 text-right">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={event => setSelected(event.target.checked ? rows.map(row => row.product.slug) : [])}
                    className="h-4 w-4 accent-[#ff9900]"
                  />
                </th>
                <th className="px-4 py-3 text-right">المنتج</th>
                <th className="px-4 py-3 text-right">القسم</th>
                <th className="px-4 py-3 text-right">السعر</th>
                <th className="px-4 py-3 text-right">المخزون</th>
                <th className="px-4 py-3 text-right">الصور</th>
                <th className="px-4 py-3 text-right">المتغيرات</th>
                <th className="px-4 py-3 text-right">الطلبات</th>
                <th className="px-4 py-3 text-right">المداخيل</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, hidden, sales }) => {
                const status = productStatus(product, hidden);

                return (
                  <tr key={product.slug} className="border-t border-[#e4e9e4] align-middle">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(product.slug)} onChange={() => toggleSelected(product.slug)} className="h-4 w-4 accent-[#ff9900]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.title} className="h-12 w-12 rounded-md object-cover" loading="lazy" decoding="async" width="96" height="96" />
                        <div className="min-w-0">
                          <p className="max-w-[250px] truncate font-heading text-sm font-black">{product.title}</p>
                          <p className="tm-admin-num mt-1 text-[11px] font-bold text-[#65716a]">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#65716a]">{product.category}</td>
                    <td className="tm-admin-num px-4 py-3 font-heading text-base font-black text-[#b45309]">{product.priceLabel}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{product.stock ?? 0}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{product.gallery?.length || 0}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{product.variants?.length || 0}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{sales.sales}</td>
                    <td className="tm-admin-num px-4 py-3 font-black">{sales.revenue.toLocaleString('fr-MA')} درهم</td>
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
              {!rows.length ? (
                <tr className="border-t border-[#e4e9e4]">
                  <td colSpan={11} className="px-4 py-10 text-center font-bold text-[#65716a]">لا توجد منتجات مطابقة.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
