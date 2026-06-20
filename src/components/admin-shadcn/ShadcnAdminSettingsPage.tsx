import { useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import { ShadcnAdminShell } from './ShadcnAdminShell';
import type { Category, Product, StoreSettings } from '../../storefrontRuntime';

type ShadcnAdminSettingsPageProps = {
  settings: StoreSettings;
  products: Product[];
  route: string;
  onSave: (settings: StoreSettings) => void;
  onNavigate: (route: string) => void;
};

function emptyCategory(): Category {
  return {
    id: `category-${Date.now()}`,
    title: '',
    count: '',
    image: '',
  };
}

export function ShadcnAdminSettingsPage({ settings, products, route, onSave, onNavigate }: ShadcnAdminSettingsPageProps) {
  const [draft, setDraft] = useState<StoreSettings>(() => ({
    ...settings,
    categories: settings.categories || [],
  }));

  const visibleProducts = useMemo(() => products.filter(product => !product.isDraft), [products]);
  const categories = draft.categories || [];

  const updateField = (key: keyof StoreSettings, value: string) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const updateCategory = (id: string, key: keyof Category, value: string) => {
    setDraft(current => ({
      ...current,
      categories: (current.categories || []).map(category => category.id === id ? { ...category, [key]: value } : category),
    }));
  };

  const addCategory = () => {
    setDraft(current => ({ ...current, categories: [emptyCategory(), ...(current.categories || [])] }));
  };

  const deleteCategory = (id: string) => {
    setDraft(current => ({ ...current, categories: (current.categories || []).filter(category => category.id !== id) }));
  };

  const saveDraft = () => {
    onSave({
      ...draft,
      categories: (draft.categories || []).map(category => ({ ...category, count: '' })),
    });
  };

  return (
    <ShadcnAdminShell
      title="الإعدادات"
      route={route}
      onNavigate={onNavigate}
      actions={
        <Button type="button" className="bg-orange-500 text-zinc-950 hover:bg-orange-400" onClick={saveDraft}>
          <Save className="size-4" />
          حفظ
        </Button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="grid gap-5">
          <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-black">بيانات المتجر</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  اسم المتجر
                  <Input value={draft.storeName} onChange={event => updateField('storeName', event.target.value)} className="h-11 border-white/10 bg-zinc-950 text-zinc-100" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  رقم واتساب
                  <Input value={draft.whatsappNumber} onChange={event => updateField('whatsappNumber', event.target.value)} className="h-11 border-white/10 bg-zinc-950 text-zinc-100" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  رقم الهاتف
                  <Input value={draft.phone} onChange={event => updateField('phone', event.target.value)} className="h-11 border-white/10 bg-zinc-950 text-zinc-100" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  المدينة
                  <Input value={draft.city} onChange={event => updateField('city', event.target.value)} className="h-11 border-white/10 bg-zinc-950 text-zinc-100" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  مدة التوصيل
                  <Input value={draft.deliveryText} onChange={event => updateField('deliveryText', event.target.value)} className="h-11 border-white/10 bg-zinc-950 text-zinc-100" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  العنوان
                  <Input value={draft.address} onChange={event => updateField('address', event.target.value)} className="h-11 border-white/10 bg-zinc-950 text-zinc-100" />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-black">منتج الواجهة الرئيسية</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <NativeSelect value={draft.heroProductSlug || ''} onChange={event => updateField('heroProductSlug', event.target.value)} className="h-11 w-full border-white/10 bg-zinc-950 text-zinc-100">
                <NativeSelectOption value="">بدون تحديد</NativeSelectOption>
                {visibleProducts.map(product => (
                  <NativeSelectOption key={product.slug} value={product.slug}>{product.title}</NativeSelectOption>
                ))}
              </NativeSelect>
              {draft.heroProductSlug ? (
                <div className="rounded-lg border border-orange-400/20 bg-orange-500/10 p-3 text-sm text-orange-100">
                  المنتج المحدد سيظهر كبطل الصفحة الرئيسية بعد الحفظ.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 content-start">
          <Card className="border-white/10 bg-zinc-900/70 text-zinc-50 shadow-none">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-black">إدارة الأقسام</CardTitle>
                <p className="mt-1 text-sm text-zinc-400">تظهر في الصفحة الرئيسية وقوائم التصفح.</p>
              </div>
              <Button type="button" size="sm" className="bg-orange-500 text-zinc-950 hover:bg-orange-400" onClick={addCategory}>
                <Plus className="size-4" />
                قسم جديد
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              {categories.map((category, index) => (
                <div key={category.id} className="grid gap-3 rounded-lg border border-white/10 bg-zinc-950/70 p-3 md:grid-cols-[88px_minmax(0,1fr)_minmax(0,1.25fr)_44px] md:items-end">
                  <div className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
                    {category.image ? (
                      <img src={category.image} alt="" width={176} height={176} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="grid aspect-square place-items-center text-xs font-black text-zinc-500">صورة</div>
                    )}
                  </div>
                  <label className="grid gap-2 text-sm font-bold text-zinc-300">
                    اسم القسم
                    <Input value={category.title} autoFocus={index === 0 && !category.title} onChange={event => updateCategory(category.id, 'title', event.target.value)} className="h-11 border-white/10 bg-zinc-900 text-zinc-100" />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-zinc-300">
                    رابط الصورة
                    <Input value={category.image} onChange={event => updateCategory(category.id, 'image', event.target.value)} className="h-11 border-white/10 bg-zinc-900 text-zinc-100" />
                  </label>
                  <Button type="button" size="icon" variant="ghost" className="text-red-300 hover:bg-red-500/10 hover:text-red-200" onClick={() => deleteCategory(category.id)} aria-label="حذف القسم">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {!categories.length ? (
                <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-400">
                  لا توجد أقسام مخصصة.
                </div>
              ) : null}
              <Separator className="bg-white/10" />
              <Button type="button" className="min-h-11 bg-orange-500 text-zinc-950 hover:bg-orange-400" onClick={saveDraft}>
                <Save className="size-4" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </ShadcnAdminShell>
  );
}
