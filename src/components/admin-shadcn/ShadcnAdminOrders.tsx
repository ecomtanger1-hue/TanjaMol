import { useMemo, useState } from 'react';
import { ArrowRight, Copy, MessageCircle, Phone, Search, ShoppingBag, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShadcnAdminShell } from './ShadcnAdminShell';
import type { StoreSettings, StoredOrder } from '../../storefrontRuntime';

type OrderStatus = StoredOrder['status'];

const statusLabels: Record<OrderStatus, string> = {
  new: 'جديد',
  whatsapp: 'بانتظار التأكيد',
  confirmed: 'مؤكد',
  delivery: 'في التوصيل',
  done: 'مكتمل',
};

const statusStyles: Record<OrderStatus, string> = {
  new: 'border-orange-400/30 bg-orange-500/15 text-orange-200',
  whatsapp: 'border-sky-400/30 bg-sky-500/15 text-sky-200',
  confirmed: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
  delivery: 'border-violet-400/30 bg-violet-500/15 text-violet-200',
  done: 'border-zinc-500/30 bg-zinc-500/15 text-zinc-200',
};

function cleanPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('212')) return digits;
  if (digits.startsWith('0')) return `212${digits.slice(1)}`;
  return digits;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ar-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function orderTimestamp(order: StoredOrder) {
  const time = new Date(order.createdAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function dateKey(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'unknown';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}/${month}/${day}`;
}

function isTodayKey(key: string) {
  return key === dateKey(new Date().toISOString());
}

function orderDateLabel(order: StoredOrder) {
  const key = dateKey(order.createdAt);
  if (key === 'unknown') return 'بدون تاريخ';
  return isTodayKey(key) ? 'Today' : key;
}

function formatMoney(value: number) {
  return `${value.toLocaleString('ar-MA')} د.م.`;
}

function orderMessage(order: StoredOrder, settings: StoreSettings) {
  const products = order.items.map(item => `${item.title} x${item.quantity}`).join('، ');
  return [
    `مرحبا ${order.name || ''}`,
    `معك ${settings.storeName || 'TanjaMall'} بخصوص الطلب ${order.id}.`,
    `المنتجات: ${products}`,
    `المجموع: ${formatMoney(order.total)}`,
    `العنوان: ${order.address}`,
    'هل تؤكد الطلب والدفع عند الاستلام؟',
  ].join('\n');
}

function whatsappUrl(order: StoredOrder, settings: StoreSettings) {
  return `https://wa.me/${cleanPhone(order.phone)}?text=${encodeURIComponent(orderMessage(order, settings))}`;
}

function orderCopyText(order: StoredOrder, settings: StoreSettings) {
  const products = order.items
    .map((item, index) => [
      `${index + 1}. ${item.title}`,
      item.variant ? `الاختيار: ${item.variant}` : null,
      `الكمية: ${item.quantity}`,
      `السعر: ${formatMoney(item.price)}`,
      `المبلغ: ${formatMoney(item.price * item.quantity)}`,
    ].filter(Boolean).join('\n'))
    .join('\n\n');

  return [
    `${settings.storeName || 'TanjaMall'} - تفاصيل الطلب`,
    `رقم الطلب: ${order.id}`,
    `الحالة: ${statusLabels[order.status]}`,
    `التاريخ: ${formatDate(order.createdAt)}`,
    '',
    'العميل',
    `الاسم: ${order.name || 'غير محدد'}`,
    `الهاتف: ${order.phone}`,
    `العنوان: ${order.address}`,
    order.note ? `الملاحظة: ${order.note}` : null,
    '',
    'المنتجات',
    products,
    '',
    `المجموع: ${formatMoney(order.total)}`,
    `المصدر: ${order.source}`,
  ].filter(Boolean).join('\n');
}

function variantRows(variant?: string) {
  if (!variant?.trim()) return [];

  return variant
    .split(/\s*(?:،|,|\/|\|)\s*/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const [rawLabel, ...rest] = part.split(/[:：]/);
      const value = rest.join(':').trim();
      return value
        ? { label: rawLabel.trim() || 'الاختيار', value }
        : { label: 'الاختيار', value: part };
    });
}

function MobileSheetField({ label, value, valueClassName = '' }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
      <span className="grid min-h-11 place-items-center rounded-md border border-white/10 bg-zinc-950/60 px-2 text-xs font-bold text-zinc-400">
        {label}
      </span>
      <span className={`grid min-h-11 items-center rounded-md border border-white/10 bg-zinc-950/80 px-3 text-sm font-black text-zinc-50 ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

function OrderStatusSelect({
  value,
  onChange,
}: {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
}) {
  return (
    <NativeSelect value={value} onChange={event => onChange(event.target.value as OrderStatus)} className="h-10 w-full min-w-[150px] border-white/10 bg-zinc-950 text-zinc-100">
      <NativeSelectOption value="new">جديد</NativeSelectOption>
      <NativeSelectOption value="whatsapp">بانتظار التأكيد</NativeSelectOption>
      <NativeSelectOption value="confirmed">مؤكد</NativeSelectOption>
      <NativeSelectOption value="delivery">في التوصيل</NativeSelectOption>
      <NativeSelectOption value="done">مكتمل</NativeSelectOption>
    </NativeSelect>
  );
}

function OrderActions({
  order,
  settings,
  onUpdateOrderStatus,
  onMarkCustomerMessageSent,
}: {
  order: StoredOrder;
  settings: StoreSettings;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onMarkCustomerMessageSent: (orderId: string, status: OrderStatus) => void;
}) {
  const sentForCurrentStatus = order.customerMessageStatus === order.status;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_44px_44px] items-center gap-3">
      <OrderStatusSelect value={order.status} onChange={status => onUpdateOrderStatus(order.id, status)} />
      <Button asChild type="button" size="icon" variant="outline" className="h-10 border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10" title="اتصال">
        <a href={`tel:${order.phone}`} aria-label="اتصال بالعميل"><Phone className="size-4" /></a>
      </Button>
      <Button
        asChild
        type="button"
        size="icon"
        className={sentForCurrentStatus ? 'h-10 bg-emerald-500 text-zinc-950 hover:bg-emerald-400' : 'h-10 bg-orange-500 text-zinc-950 hover:bg-orange-400'}
        title="واتساب"
        onClick={() => onMarkCustomerMessageSent(order.id, order.status)}
      >
        <a href={whatsappUrl(order, settings)} target="_blank" rel="noreferrer" aria-label="إرسال واتساب"><MessageCircle className="size-4" /></a>
      </Button>
    </div>
  );
}

function DesktopOrderActions({
  order,
  settings,
  onUpdateOrderStatus,
  onMarkCustomerMessageSent,
}: {
  order: StoredOrder;
  settings: StoreSettings;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onMarkCustomerMessageSent: (orderId: string, status: OrderStatus) => void;
}) {
  const sentForCurrentStatus = order.customerMessageStatus === order.status;

  return (
    <div className="inline-flex items-center justify-end gap-2">
      <OrderStatusSelect value={order.status} onChange={status => onUpdateOrderStatus(order.id, status)} />
      <Button asChild type="button" size="icon" variant="outline" className="h-10 w-10 border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10" title="اتصال">
        <a href={`tel:${order.phone}`} aria-label="اتصال بالعميل"><Phone className="size-4" /></a>
      </Button>
      <Button
        asChild
        type="button"
        size="icon"
        className={sentForCurrentStatus ? 'h-10 w-10 bg-emerald-500 text-zinc-950 hover:bg-emerald-400' : 'h-10 w-10 bg-orange-500 text-zinc-950 hover:bg-orange-400'}
        title="واتساب"
        onClick={() => onMarkCustomerMessageSent(order.id, order.status)}
      >
        <a href={whatsappUrl(order, settings)} target="_blank" rel="noreferrer" aria-label="إرسال واتساب"><MessageCircle className="size-4" /></a>
      </Button>
    </div>
  );
}

type OrdersProps = {
  orders: StoredOrder[];
  settings: StoreSettings;
  route: string;
  onNavigate: (route: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onMarkCustomerMessageSent: (orderId: string, status: OrderStatus) => void;
};

function groupOrdersByDate(orders: StoredOrder[]) {
  return orders.reduce<Array<{ key: string; label: string; orders: StoredOrder[] }>>((groups, order) => {
    const key = dateKey(order.createdAt);
    const current = groups[groups.length - 1];
    if (current?.key === key) {
      current.orders.push(order);
      return groups;
    }

    groups.push({ key, label: orderDateLabel(order), orders: [order] });
    return groups;
  }, []);
}

function MobileOrderCard({ order, onNavigate }: { order: StoredOrder; onNavigate: (route: string) => void }) {
  const firstItem = order.items?.[0];

  return (
    <article className="rounded-lg border border-white/10 bg-zinc-900/70 p-3 text-zinc-50">
      <button
        type="button"
        onClick={() => onNavigate(`#/admin/orders/${encodeURIComponent(order.id)}`)}
        className="grid w-full grid-cols-[84px_minmax(0,1fr)] gap-2 text-right sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-3"
      >
        <span className="grid aspect-square min-h-[84px] place-items-center overflow-hidden rounded-md border border-white/10 bg-zinc-950/80 text-center text-xs font-black leading-5 text-zinc-400 sm:min-h-[112px] sm:text-sm sm:leading-6">
          {firstItem?.image ? (
            <img
              src={firstItem.image}
              alt=""
              width={112}
              height={112}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <span className="px-2">صورة المنتج</span>
          )}
        </span>

        <span className="grid min-w-0 grid-rows-[auto_1fr] gap-2.5 sm:gap-3">
          <span className="grid grid-cols-[minmax(0,1fr)_62px_54px] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_82px_76px] sm:gap-2">
            <span className="min-w-0 truncate rounded-md border border-white/10 bg-zinc-950/80 px-2 py-2 text-center text-xs font-black text-zinc-50 sm:px-3 sm:text-sm">
              {order.name || 'الاسم'}
            </span>
            <span className="truncate rounded-md border border-white/10 bg-zinc-950/80 px-1 py-2 text-center text-[10px] font-black text-orange-300 sm:px-2 sm:text-sm">
              {formatMoney(order.total)}
            </span>
            <Badge variant="outline" title={statusLabels[order.status]} className={`${statusStyles[order.status]} h-7 max-w-full justify-self-center truncate rounded-full px-2 text-[10px] font-black leading-none sm:h-8 sm:text-xs`}>
              {statusLabels[order.status]}
            </Badge>
          </span>

          <span className="grid min-h-[48px] items-center rounded-md border border-white/10 bg-zinc-950/80 px-3 py-2 text-center text-sm font-black leading-6 text-zinc-100">
            <span className="line-clamp-2 break-words">{order.address || 'العنوان'}</span>
          </span>
        </span>
      </button>
    </article>
  );
}

export function ShadcnAdminOrdersPage({ orders, settings, route, onNavigate, onUpdateOrderStatus, onMarkCustomerMessageSent }: OrdersProps) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const normalizedQuery = query.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => status === 'all' || order.status === status)
      .filter(order => {
        if (!normalizedQuery) return true;
        const haystack = `${order.id} ${order.name} ${order.phone} ${order.address}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => orderTimestamp(b) - orderTimestamp(a));
  }, [normalizedQuery, orders, status]);

  const mobileOrderGroups = useMemo(() => groupOrdersByDate(filteredOrders), [filteredOrders]);

  const pendingCount = orders.filter(order => order.status === 'new' || order.status === 'whatsapp').length;
  const deliveryCount = orders.filter(order => order.status === 'delivery').length;
  const revenue = orders.filter(order => order.status !== 'done').reduce((sum, order) => sum + order.total, 0);
  const returnsCount = 0;

  return (
    <ShadcnAdminShell
      title="الطلبات"
      description="إدارة سريعة للطلبات من الهاتف بدون ازدحام."
      route={route}
      onNavigate={onNavigate}
    >
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
          <CardHeader className="px-3 pb-1.5 pt-3 sm:px-6 sm:pb-2 sm:pt-6"><CardTitle className="text-xs text-zinc-400">قيد التأكيد</CardTitle></CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6"><p className="text-lg font-black text-orange-300 sm:text-2xl">{pendingCount.toLocaleString('ar-MA')}</p></CardContent>
        </Card>
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
          <CardHeader className="px-3 pb-1.5 pt-3 sm:px-6 sm:pb-2 sm:pt-6"><CardTitle className="text-xs text-zinc-400">في التوصيل</CardTitle></CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6"><p className="text-lg font-black sm:text-2xl">{deliveryCount.toLocaleString('ar-MA')}</p></CardContent>
        </Card>
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
          <CardHeader className="px-3 pb-1.5 pt-3 sm:px-6 sm:pb-2 sm:pt-6"><CardTitle className="text-xs text-zinc-400">مفتوحة</CardTitle></CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6"><p className="text-base font-black sm:text-xl">{formatMoney(revenue)}</p></CardContent>
        </Card>
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
          <CardHeader className="px-3 pb-1.5 pt-3 sm:px-6 sm:pb-2 sm:pt-6"><CardTitle className="text-xs text-zinc-400">المرتجعات</CardTitle></CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6"><p className="text-lg font-black sm:text-2xl">{returnsCount.toLocaleString('ar-MA')}</p></CardContent>
        </Card>
      </section>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <NativeSelect value={status} onChange={event => setStatus(event.target.value as OrderStatus | 'all')} className="h-11 w-[190px] border-white/10 bg-zinc-950 text-zinc-100">
          <NativeSelectOption value="all">كل الحالات</NativeSelectOption>
          <NativeSelectOption value="new">جديد</NativeSelectOption>
          <NativeSelectOption value="whatsapp">بانتظار التأكيد</NativeSelectOption>
          <NativeSelectOption value="confirmed">مؤكد</NativeSelectOption>
          <NativeSelectOption value="delivery">في التوصيل</NativeSelectOption>
          <NativeSelectOption value="done">مكتمل</NativeSelectOption>
        </NativeSelect>
        <div className="relative">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-11 w-11 border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            onClick={() => setSearchOpen(current => !current)}
            aria-label="بحث الطلبات"
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
                aria-label="بحث الطلبات"
                className="h-10 border-white/10 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          ) : null}
        </div>
      </div>

      <Card className="mt-4 hidden border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none lg:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-right">الطلب</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">المجموع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="w-[270px] text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map(order => (
              <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <button type="button" onClick={() => onNavigate(`#/admin/orders/${encodeURIComponent(order.id)}`)} className="flex items-center gap-3 text-right">
                    {order.items?.[0]?.image ? (
                      <img
                        src={order.items[0].image}
                        alt=""
                        width={46}
                        height={46}
                        loading="lazy"
                        decoding="async"
                        className="size-[46px] shrink-0 rounded-md border border-white/10 object-cover"
                      />
                    ) : null}
                    <span className="min-w-0">
                      <span className="block font-black text-zinc-50">{order.id}</span>
                      <span className="block text-xs text-zinc-500">{formatDate(order.createdAt)}</span>
                    </span>
                  </button>
                </TableCell>
                <TableCell>
                  <button type="button" onClick={() => onNavigate(`#/admin/customers/${encodeURIComponent(order.phone)}`)} className="max-w-[220px] text-right">
                    <span className="block truncate font-black text-zinc-100">{order.name || 'عميل بدون اسم'}</span>
                    <span className="block truncate text-xs text-zinc-500">{order.phone}</span>
                  </button>
                </TableCell>
                <TableCell className="max-w-[280px] truncate text-zinc-400">{order.address}</TableCell>
                <TableCell className="font-black text-orange-300">{formatMoney(order.total)}</TableCell>
                <TableCell><Badge variant="outline" className={statusStyles[order.status]}>{statusLabels[order.status]}</Badge></TableCell>
                <TableCell>
                  <DesktopOrderActions order={order} settings={settings} onUpdateOrderStatus={onUpdateOrderStatus} onMarkCustomerMessageSent={onMarkCustomerMessageSent} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filteredOrders.length ? <div className="p-8 text-center text-sm text-zinc-400">لا توجد طلبات مطابقة.</div> : null}
      </Card>

      <section className="mt-4 grid gap-4 lg:hidden">
        {mobileOrderGroups.map(group => (
          <div key={group.key} className="grid gap-3">
            <p className="px-2 text-left text-sm font-black text-zinc-300">{group.label}</p>
            {group.orders.map(order => (
              <MobileOrderCard key={order.id} order={order} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
        {!filteredOrders.length ? <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-400">لا توجد طلبات مطابقة.</div> : null}
      </section>
    </ShadcnAdminShell>
  );
}

export function ShadcnAdminOrderDetailPage({ orders, settings, route, onNavigate, onUpdateOrderStatus, onMarkCustomerMessageSent }: OrdersProps) {
  const id = decodeURIComponent(route.replace('#/admin/orders/', ''));
  const order = orders.find(item => item.id === id);

  if (!order) {
    return (
      <ShadcnAdminShell title="تفاصيل الطلب" route={route} onNavigate={onNavigate}>
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-400">لم يتم العثور على الطلب.</div>
      </ShadcnAdminShell>
    );
  }

  const customerOrders = orders.filter(item => item.phone === order.phone);
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const copyOrderDetails = () => {
    void navigator.clipboard?.writeText(orderCopyText(order, settings));
  };

  return (
    <ShadcnAdminShell
      title={`طلب ${order.id}`}
      description={<span className="hidden sm:inline">{formatDate(order.createdAt)}</span>}
      route={route}
      onNavigate={onNavigate}
      actions={
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
          <span className="text-sm font-bold text-zinc-400 sm:hidden">{formatDate(order.createdAt)}</span>
          <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10" onClick={() => onNavigate('#/admin/orders')}><ArrowRight className="size-4" /> رجوع</Button>
        </div>
      }
    >
      <section className="grid gap-4 sm:hidden">
        {orderItems.map(item => {
          const variants = variantRows(item.variant);
          return (
            <article key={`${item.id}-${item.variant || 'default'}`} className="rounded-lg border border-white/10 bg-zinc-900/70 p-3 text-zinc-50 shadow-none">
              <p className="mb-3 rounded-md border border-white/10 bg-zinc-950/80 px-3 py-3 text-center text-sm font-black leading-6 break-words">
                {item.title}
              </p>
              <div className="grid content-start gap-2">
                <MobileSheetField label="طلب" value={order.id} />
                {variants.map((variant, index) => (
                  <MobileSheetField key={`${variant.label}-${variant.value}-${index}`} label={variant.label} value={variant.value} />
                ))}
                <MobileSheetField label="الكمية" value={item.quantity.toLocaleString('ar-MA')} />
                <MobileSheetField label="المجموع" value={formatMoney(item.price * item.quantity)} valueClassName="text-orange-300" />
              </div>
            </article>
          );
        })}

        <article className="rounded-lg border border-white/10 bg-zinc-900/70 p-3 text-zinc-50 shadow-none">
          <div className="grid gap-3">
            <MobileSheetField label="الاسم" value={order.name || 'غير محدد'} valueClassName="break-words" />
            <MobileSheetField label="الهاتف" value={order.phone} valueClassName="break-all" />
            <MobileSheetField label="العنوان" value={order.address} valueClassName="break-words leading-6" />
            {order.note ? <MobileSheetField label="ملاحظة" value={order.note} valueClassName="break-words leading-6" /> : null}
          </div>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_56px_44px_44px] gap-2">
            <OrderStatusSelect value={order.status} onChange={status => onUpdateOrderStatus(order.id, status)} />
            <Button type="button" variant="secondary" className="h-10 bg-white/10 px-2 text-xs font-black text-zinc-100 hover:bg-white/15" onClick={copyOrderDetails}>
              نسخ
            </Button>
            <Button asChild type="button" size="icon" variant="outline" className="h-10 border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10">
              <a href={`tel:${order.phone}`} aria-label="اتصال"><Phone className="size-4" /></a>
            </Button>
            <Button
              asChild
              type="button"
              size="icon"
              className={(order.customerMessageStatus === order.status ? 'h-10 bg-emerald-500 text-zinc-950 hover:bg-emerald-400' : 'h-10 bg-orange-500 text-zinc-950 hover:bg-orange-400')}
              onClick={() => onMarkCustomerMessageSent(order.id, order.status)}
            >
              <a href={whatsappUrl(order, settings)} target="_blank" rel="noreferrer" aria-label="واتساب"><MessageCircle className="size-4" /></a>
            </Button>
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-zinc-900/70 p-3 text-zinc-50 shadow-none">
          <p className="mb-3 text-base font-black">سجل العميل</p>
          <div className="grid gap-3">
            {customerOrders.slice(0, 5).map((item, index) => (
              <div key={item.id}>
                <button type="button" onClick={() => onNavigate(`#/admin/orders/${encodeURIComponent(item.id)}`)} className="w-full text-right text-sm">
                  <span className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="min-w-0">
                      <span className="block truncate font-black">{item.id}</span>
                      <span className="block truncate text-xs text-zinc-500">{formatDate(item.createdAt)}</span>
                    </span>
                    <span className="shrink-0 font-black text-orange-300">{formatMoney(item.total)}</span>
                  </span>
                </button>
                {index < Math.min(customerOrders.length, 5) - 1 ? <Separator className="mt-3 bg-white/10" /> : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className="hidden gap-5 sm:grid lg:grid-cols-[minmax(280px,0.35fr)_minmax(0,0.65fr)] [direction:ltr]">
        <aside className="grid content-start gap-5 [direction:rtl]">
          <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-end gap-2 text-lg font-black">
                العميل <UserRound className="size-4 text-zinc-300" />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="grid gap-3">
                <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500">الاسم</span>
                  <span className="min-w-0 border-b border-dashed border-white/15 pb-2 font-black leading-6 text-zinc-100 break-words">{order.name || 'غير محدد'}</span>
                </div>
                <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500">الهاتف</span>
                  <span className="min-w-0 border-b border-dashed border-white/15 pb-2 font-black text-zinc-100 break-all">{order.phone}</span>
                </div>
                <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500">الطلبات</span>
                  <span className="min-w-0 border-b border-dashed border-white/15 pb-2 font-black text-zinc-100">{customerOrders.length.toLocaleString('ar-MA')}</span>
                </div>
                <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-3">
                  <span className="pt-1 text-xs font-bold text-zinc-500">العنوان</span>
                  <span className="min-w-0 border-b border-dashed border-white/15 pb-2 font-black leading-6 text-zinc-100 break-words">{order.address}</span>
                </div>
                {order.note ? (
                  <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-3">
                    <span className="pt-1 text-xs font-bold text-zinc-500">ملاحظة</span>
                    <span className="min-w-0 border-b border-dashed border-white/15 pb-2 leading-5 text-zinc-300 break-words">{order.note}</span>
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10" onClick={() => onNavigate(`#/admin/customers/${encodeURIComponent(order.phone)}`)}>
                  طلبات العميل
                </Button>
                <Button type="button" variant="secondary" className="bg-white/10 text-zinc-100 hover:bg-white/15" onClick={copyOrderDetails}>
                  نسخ
                  <Copy className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black">سجل العميل</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {customerOrders.slice(0, 5).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(`#/admin/orders/${encodeURIComponent(item.id)}`)}
                  className="w-full rounded-md border border-white/10 bg-zinc-950/60 px-3 py-3 text-right text-sm transition hover:bg-white/5"
                >
                  <span className="grid grid-cols-[auto_auto_auto_minmax(0,1fr)] items-center gap-3">
                    <span className="shrink-0 font-black text-orange-300">{formatMoney(item.total)}</span>
                    <span className="shrink-0 text-xs text-zinc-500">{formatDate(item.createdAt)}</span>
                    <Badge variant="outline" className={statusStyles[item.status]}>{statusLabels[item.status]}</Badge>
                    <span className="min-w-0 truncate font-black text-zinc-100">{item.id}</span>
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="grid gap-5 [direction:rtl]">
          <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black">الملخص</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-4">
                <div className="grid grid-cols-[auto_auto_auto_minmax(0,1fr)] items-center gap-3">
                  <span className="shrink-0 font-black text-zinc-50">{order.id}</span>
                  <Badge variant="outline" className={statusStyles[order.status]}>{statusLabels[order.status]}</Badge>
                  <span className="shrink-0 text-sm text-zinc-500">{formatDate(order.createdAt)}</span>
                  <span className="min-w-0 text-left text-2xl font-black text-orange-300">{formatMoney(order.total)}</span>
                </div>
                <p className="mt-3 truncate text-center text-sm font-bold text-zinc-100">
                  {order.name || 'عميل بدون اسم'} - {order.address} - {order.phone}
                </p>
              </div>

              <div className="grid grid-cols-[44px_44px_minmax(180px,1fr)] items-center gap-2 [direction:ltr]">
                <Button
                  asChild
                  type="button"
                  size="icon"
                  className={(order.customerMessageStatus === order.status ? 'h-10 bg-emerald-500 text-zinc-950 hover:bg-emerald-400' : 'h-10 bg-orange-500 text-zinc-950 hover:bg-orange-400')}
                  onClick={() => onMarkCustomerMessageSent(order.id, order.status)}
                >
                  <a href={whatsappUrl(order, settings)} target="_blank" rel="noreferrer" aria-label="واتساب"><MessageCircle className="size-4" /></a>
                </Button>
                <Button asChild type="button" size="icon" variant="outline" className="h-10 border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10">
                  <a href={`tel:${order.phone}`} aria-label="اتصال"><Phone className="size-4" /></a>
                </Button>
                <div className="w-full max-w-[240px] justify-self-end [direction:rtl]">
                  <OrderStatusSelect value={order.status} onChange={status => onUpdateOrderStatus(order.id, status)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <span className="rounded-lg border border-white/10 bg-zinc-950/60 p-4 text-center">
                  <b className="block text-xs text-zinc-500">المنتجات</b>
                  <span className="mt-1 block font-black">{orderItems.length.toLocaleString('ar-MA')}</span>
                </span>
                <span className="rounded-lg border border-white/10 bg-zinc-950/60 p-4 text-center">
                  <b className="block text-xs text-zinc-500">المصدر</b>
                  <span className="mt-1 block truncate font-black">{order.source}</span>
                </span>
                <span className="rounded-lg border border-white/10 bg-zinc-950/60 p-4 text-center">
                  <b className="block text-xs text-zinc-500">رسالة العميل</b>
                  <span className="mt-1 block font-black">{order.customerMessageStatus === order.status ? 'تم إرسالها' : 'لم ترسل'}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black">المنتجات</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {orderItems.map(item => (
                <div key={`${item.id}-${item.variant || 'default'}`} className="grid items-center gap-5 rounded-lg border border-white/10 bg-zinc-950/60 p-4 md:grid-cols-[128px_minmax(0,1fr)] xl:grid-cols-[150px_minmax(0,1fr)]">
                  <img src={item.image} alt="" width={150} height={150} loading="lazy" decoding="async" className="size-32 rounded-lg object-cover xl:size-[150px]" />
                  <div className="grid gap-3 text-center">
                    <p className="text-base font-black leading-6 text-zinc-50 break-words">{item.title}</p>
                    {item.variant ? (
                      <p className="text-sm leading-5 text-zinc-400 break-words">
                        الاختيار: {item.variant}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-zinc-300">
                      <span>الكمية: <b className="text-zinc-50">{item.quantity.toLocaleString('ar-MA')}</b></span>
                      <span>المجموع: <b className="text-orange-300">{formatMoney(item.price * item.quantity)}</b></span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </ShadcnAdminShell>
  );
}

export function ShadcnAdminCustomerDetailPage({ orders, settings, route, onNavigate, onUpdateOrderStatus, onMarkCustomerMessageSent }: OrdersProps) {
  const phone = decodeURIComponent(route.replace('#/admin/customers/', ''));
  const customerOrders = orders.filter(order => order.phone === phone);
  const firstOrder = customerOrders[0];
  const total = customerOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <ShadcnAdminShell title={firstOrder?.name || 'عميل'} description={phone} route={route} onNavigate={onNavigate}>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none"><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">الطلبات</CardTitle></CardHeader><CardContent><p className="text-2xl font-black">{customerOrders.length.toLocaleString('ar-MA')}</p></CardContent></Card>
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none"><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">المجموع</CardTitle></CardHeader><CardContent><p className="text-xl font-black text-orange-300">{formatMoney(total)}</p></CardContent></Card>
        <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none"><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-400">آخر حالة</CardTitle></CardHeader><CardContent><p className="text-sm font-black">{firstOrder ? statusLabels[firstOrder.status] : '-'}</p></CardContent></Card>
      </section>
      <section className="mt-4 grid gap-3">
        {customerOrders.map(order => (
          <article key={order.id} className="rounded-lg border border-white/10 bg-zinc-900/70 p-3">
            <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
              <button type="button" onClick={() => onNavigate(`#/admin/orders/${encodeURIComponent(order.id)}`)} className="min-w-0 text-right">
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 font-black text-zinc-50">{order.id}</span>
                  <Badge variant="outline" className={statusStyles[order.status]}>{statusLabels[order.status]}</Badge>
                  <span className="min-w-0 truncate text-xs text-zinc-500">{formatDate(order.createdAt)}</span>
                  <span className="ms-auto shrink-0 text-xl font-black text-orange-300">{formatMoney(order.total)}</span>
                </div>
                <p className="truncate text-sm font-black text-zinc-100">{order.address}</p>
              </button>
              <OrderActions order={order} settings={settings} onUpdateOrderStatus={onUpdateOrderStatus} onMarkCustomerMessageSent={onMarkCustomerMessageSent} />
            </div>
          </article>
        ))}
      </section>
    </ShadcnAdminShell>
  );
}
