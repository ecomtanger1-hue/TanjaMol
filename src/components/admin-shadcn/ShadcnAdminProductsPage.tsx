import { useMemo, useRef, useState } from 'react';
import { ArrowUpLeft, Edit, Eye, EyeOff, PackagePlus, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { productRoute, type Product, type StoredOrder } from '../../storefrontRuntime';
import { ShadcnAdminShell } from './ShadcnAdminShell';

type ProductFilter = 'all' | 'visible' | 'hidden' | 'drafts' | 'low-stock' | 'needs-images' | 'needs-details';
type ProductSort = 'newest' | 'stock' | 'price-low' | 'price-high' | 'orders' | 'revenue';

type ShadcnAdminProductsPageProps = {
  products: Product[];
  orders: StoredOrder[];
  hiddenSlugs: string[];
  route: string;
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

function productDateValue(product: Product) {
  const value = Date.parse(product.createdAt || product.updatedAt || '');
  return Number.isFinite(value) ? value : 0;
}

function formatCompactMoney(value: number) {
  return `${value.toLocaleString('ar-MA')} د.م.`;
}

function productStatus(product: Product, hidden: boolean) {
  if (product.isDraft) return { label: 'مسودة', className: 'border-zinc-500/30 bg-zinc-500/15 text-zinc-200' };
  if (hidden) return { label: 'مخفي', className: 'border-amber-400/30 bg-amber-500/15 text-amber-200' };
  if ((product.stock ?? 0) <= 0) return { label: 'نفد المخزون', className: 'border-red-400/30 bg-red-500/15 text-red-200' };
  if ((product.stock ?? 0) < 10) return { label: 'مخزون منخفض', className: 'border-amber-400/30 bg-amber-500/15 text-amber-200' };
  if (needsImages(product)) return { label: 'صور ناقصة', className: 'border-sky-400/30 bg-sky-500/15 text-sky-200' };
  if (needsDetails(product)) return { label: 'تفاصيل ناقصة', className: 'border-violet-400/30 bg-violet-500/15 text-violet-200' };
  return { label: 'ظاهر', className: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200' };
}

export function ShadcnAdminProductsPage({
  products,
  orders,
  hiddenSlugs,
  route,
  onNavigate,
  onDeleteProduct,
  onDeleteProducts,
  onHideProducts,
  onShowProducts,
  onSyncProducts,
  onToggleVisibility,
}: ShadcnAdminProductsPageProps) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [sort, setSort] = useState<ProductSort>('newest');
  const [selected, setSelected] = useState<string[]>([]);
  const longPressTimers = useRef<Record<string, number>>({});
  const longPressHandled = useRef<Set<string>>(new Set());
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

  const selectedProducts = products.filter(product => selected.includes(product.slug));
  const selectionMode = selected.length > 0;
  const allCurrentSelected = rows.length > 0 && rows.every(row => selected.includes(row.product.slug));
  const visibleCount = products.filter(product => !product.isDraft && !hiddenSet.has(product.slug)).length;
  const draftCount = products.filter(product => product.isDraft).length;
  const attentionCount = products.filter(product => needsImages(product) || needsDetails(product) || (product.stock ?? 0) < 10).length;

  const toggleSelected = (slug: string) => {
    setSelected(current => current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]);
  };

  const startLongPressSelection = (slug: string) => {
    if (selectionMode) return;
    window.clearTimeout(longPressTimers.current[slug]);
    longPressTimers.current[slug] = window.setTimeout(() => {
      toggleSelected(slug);
      longPressHandled.current.add(slug);
      delete longPressTimers.current[slug];
    }, 450);
  };

  const cancelLongPressSelection = (slug: string) => {
    window.clearTimeout(longPressTimers.current[slug]);
    delete longPressTimers.current[slug];
  };

  const openProductEditor = (slug: string) => {
    if (longPressHandled.current.delete(slug)) return;
    onNavigate(`#/admin/products/${encodeURIComponent(slug)}/edit`);
  };

  const handleMobileCardClick = (slug: string) => {
    if (longPressHandled.current.delete(slug)) return;
    if (selectionMode) {
      toggleSelected(slug);
    }
  };

  const toggleAllCurrent = () => {
    setSelected(current => {
      if (allCurrentSelected) return current.filter(slug => !rows.some(row => row.product.slug === slug));
      return Array.from(new Set([...current, ...rows.map(row => row.product.slug)]));
    });
  };

  const clearSelection = () => setSelected([]);

  const bulkHide = () => {
    onHideProducts?.(selected);
    clearSelection();
  };

  const bulkShow = () => {
    onShowProducts?.(selected);
    clearSelection();
  };

  const bulkDelete = () => {
    if (!selectedProducts.length) return;
    onDeleteProducts?.(selectedProducts);
    clearSelection();
  };

  const productActions = (product: Product, hidden: boolean, mobile = false) => {
    const disabledForSelection = mobile && selectionMode;
    const buttonClassName = mobile ? 'h-9 w-full text-zinc-200 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-35' : 'size-9 text-zinc-200 hover:bg-white/10';
    const dangerClassName = mobile ? 'h-9 w-full text-red-300 hover:bg-red-500/10 hover:text-red-200 disabled:pointer-events-none disabled:opacity-35' : 'size-9 text-red-300 hover:bg-red-500/10 hover:text-red-200';

    return (
      <div
        className={mobile ? 'grid grid-cols-4 gap-2' : 'inline-flex items-center gap-1'}
      onClick={mobile && !selectionMode ? event => event.stopPropagation() : undefined}
      onPointerDown={mobile && !selectionMode ? event => event.stopPropagation() : undefined}
      onContextMenu={mobile ? event => event.preventDefault() : undefined}
    >
      <Button type="button" variant="ghost" size="icon" disabled={disabledForSelection} className={buttonClassName} onClick={() => onNavigate(productRoute(product.slug))} aria-label="فتح في المتجر" title="فتح في المتجر">
        <ArrowUpLeft className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" disabled={disabledForSelection} className={buttonClassName} onClick={() => onNavigate(`#/admin/products/${encodeURIComponent(product.slug)}/edit`)} aria-label="تعديل" title="تعديل">
        <Edit className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" disabled={disabledForSelection} className={buttonClassName} onClick={() => onToggleVisibility(product.slug)} aria-label={hidden ? 'إظهار' : 'إخفاء'} title={hidden ? 'إظهار' : 'إخفاء'}>
        {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </Button>
      <Button type="button" variant="ghost" size="icon" disabled={disabledForSelection} className={dangerClassName} onClick={() => onDeleteProduct(product)} aria-label="حذف" title="حذف">
        <Trash2 className="size-4" />
      </Button>
    </div>
    );
  };

  return (
    <ShadcnAdminShell
      title="المنتجات"
      route={route}
      onNavigate={onNavigate}
      actions={
        <>
          <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10" onClick={onSyncProducts}>
            مزامنة
          </Button>
          <Button type="button" className="bg-orange-500 text-zinc-950 hover:bg-orange-400" onClick={() => onNavigate('#/admin/products/new')}>
            <PackagePlus className="size-4" />
            منتج جديد
          </Button>
        </>
      }
    >
      <section className="grid grid-cols-3 gap-3">
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">ظاهر</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-black">{visibleCount.toLocaleString('ar-MA')}</p></CardContent>
        </Card>
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">مسودات</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-black">{draftCount.toLocaleString('ar-MA')}</p></CardContent>
        </Card>
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">انتباه</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-black text-orange-300">{attentionCount.toLocaleString('ar-MA')}</p></CardContent>
        </Card>
      </section>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2 lg:flex lg:flex-wrap">
        <NativeSelect value={filter} onChange={event => setFilter(event.target.value as ProductFilter)} className="h-11 w-full border-white/10 bg-zinc-950 text-zinc-100 lg:w-[190px]">
          <NativeSelectOption value="all">كل الحالات</NativeSelectOption>
          <NativeSelectOption value="visible">ظاهر</NativeSelectOption>
          <NativeSelectOption value="hidden">مخفي</NativeSelectOption>
          <NativeSelectOption value="drafts">مسودات</NativeSelectOption>
          <NativeSelectOption value="low-stock">مخزون منخفض</NativeSelectOption>
          <NativeSelectOption value="needs-images">صور ناقصة</NativeSelectOption>
          <NativeSelectOption value="needs-details">تفاصيل ناقصة</NativeSelectOption>
        </NativeSelect>
        <NativeSelect value={sort} onChange={event => setSort(event.target.value as ProductSort)} className="h-11 w-full border-white/10 bg-zinc-950 text-zinc-100 lg:w-[190px]">
          <NativeSelectOption value="newest">الأحدث</NativeSelectOption>
          <NativeSelectOption value="stock">المخزون</NativeSelectOption>
          <NativeSelectOption value="price-low">السعر الأقل</NativeSelectOption>
          <NativeSelectOption value="price-high">السعر الأعلى</NativeSelectOption>
          <NativeSelectOption value="orders">الأكثر طلبا</NativeSelectOption>
          <NativeSelectOption value="revenue">الأعلى مداخيل</NativeSelectOption>
        </NativeSelect>
        <div className="relative">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-11 w-11 border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            onClick={() => setSearchOpen(current => !current)}
            aria-label="بحث المنتجات"
          >
            <Search className="size-4" />
          </Button>
          {searchOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-[min(320px,calc(100vw-32px))] rounded-lg border border-white/10 bg-zinc-900 p-2 shadow-2xl">
              <Input
                autoFocus
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="بحث"
                aria-label="بحث المنتجات"
                className="h-10 border-white/10 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          ) : null}
        </div>
      </div>

      {selected.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-orange-400/20 bg-orange-500/10 p-2">
          <span className="px-2 text-sm font-bold text-orange-100">{selected.length.toLocaleString('ar-MA')} محدد</span>
          <Button type="button" size="sm" variant="secondary" className="bg-white/10 text-zinc-100 hover:bg-white/15" onClick={bulkShow}>إظهار</Button>
          <Button type="button" size="sm" variant="secondary" className="bg-white/10 text-zinc-100 hover:bg-white/15" onClick={bulkHide}>إخفاء</Button>
          <Button type="button" size="sm" variant="destructive" onClick={bulkDelete}>حذف</Button>
          <Button type="button" size="sm" variant="ghost" className="text-zinc-200 hover:bg-white/10" onClick={clearSelection}>إلغاء</Button>
        </div>
      ) : null}

      <section className="mt-4 grid gap-3 lg:hidden">
        {rows.map(({ product, hidden, sales }) => {
          const checked = selected.includes(product.slug);
          return (
            <article
              key={product.slug}
              aria-selected={checked}
              onClick={() => handleMobileCardClick(product.slug)}
              onPointerDown={() => startLongPressSelection(product.slug)}
              onPointerUp={() => cancelLongPressSelection(product.slug)}
              onPointerLeave={() => cancelLongPressSelection(product.slug)}
              onPointerCancel={() => cancelLongPressSelection(product.slug)}
              onContextMenu={event => {
                event.preventDefault();
              }}
              className={cn(
                'rounded-lg border border-white/10 bg-zinc-900/70 p-3 transition-colors',
                checked && 'border-orange-400/50 bg-orange-500/10 ring-1 ring-orange-400/30',
              )}
            >
              <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                <button
                  type="button"
                  disabled={selectionMode}
                  onClick={event => {
                    event.stopPropagation();
                    openProductEditor(product.slug);
                  }}
                  className="grid min-w-0 gap-1 text-center disabled:pointer-events-none"
                  aria-label={`تعديل ${product.title}`}
                >
                  <img
                    src={product.image}
                    alt=""
                    width={72}
                    height={72}
                    loading="lazy"
                    decoding="async"
                    className="size-[72px] rounded-md object-cover"
                  />
                  <span className="truncate text-xs font-black text-orange-300">{formatCompactMoney(product.price)}</span>
                </button>
                <div className="grid min-w-0 grid-rows-[auto_auto] content-start gap-2">
                  <button
                    type="button"
                    disabled={selectionMode}
                    onClick={event => {
                      event.stopPropagation();
                      openProductEditor(product.slug);
                    }}
                    className="min-w-0 truncate text-right text-sm font-black text-zinc-50 disabled:pointer-events-none"
                  >
                    {product.title}
                  </button>
                  {productActions(product, hidden, true)}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-zinc-950/80 p-2 text-center text-xs">
                <span><b className="block text-zinc-100">{(product.stock ?? 0).toLocaleString('ar-MA')}</b><span className="text-zinc-500">مخزون</span></span>
                <span><b className="block text-zinc-100">{sales.sales.toLocaleString('ar-MA')}</b><span className="text-zinc-500">طلبات</span></span>
                <span><b className="block text-zinc-100">{formatCompactMoney(sales.revenue)}</b><span className="text-zinc-500">مداخيل</span></span>
              </div>
            </article>
          );
        })}
      </section>

      <Card className="mt-4 hidden border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none lg:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-12 text-right">
                <input type="checkbox" checked={allCurrentSelected} onChange={toggleAllCurrent} className="size-4 accent-orange-500" aria-label="تحديد كل المنتجات" />
              </TableHead>
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">المخزون</TableHead>
              <TableHead className="text-right">المبيعات</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="w-[170px] text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ product, hidden, sales }) => {
              const status = productStatus(product, hidden);
              return (
                <TableRow key={product.slug} className={cn('border-white/10 hover:bg-white/5', selected.includes(product.slug) && 'bg-orange-500/10')}>
                  <TableCell>
                    <input type="checkbox" checked={selected.includes(product.slug)} onChange={() => toggleSelected(product.slug)} className="size-4 accent-orange-500" aria-label={`تحديد ${product.title}`} />
                  </TableCell>
                  <TableCell>
                    <button type="button" onClick={() => onNavigate(`#/admin/products/${encodeURIComponent(product.slug)}/edit`)} className="flex items-center gap-3 text-right">
                      <img src={product.image} alt="" width={56} height={56} loading="lazy" decoding="async" className="size-14 rounded-md object-cover" />
                      <span className="min-w-0">
                        <span className="block max-w-[420px] truncate font-black text-zinc-50">{product.title}</span>
                        <span className="block text-xs text-zinc-500">{product.slug}</span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={status.className}>{status.label}</Badge></TableCell>
                  <TableCell>{(product.stock ?? 0).toLocaleString('ar-MA')}</TableCell>
                  <TableCell>{sales.sales.toLocaleString('ar-MA')}</TableCell>
                  <TableCell className="font-bold text-orange-300">{product.priceLabel || `${product.price} درهم`}</TableCell>
                  <TableCell>{productActions(product, hidden)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {!rows.length ? (
        <div className="mt-4 rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-400">
          لا توجد منتجات مطابقة.
        </div>
      ) : null}
    </ShadcnAdminShell>
  );
}
