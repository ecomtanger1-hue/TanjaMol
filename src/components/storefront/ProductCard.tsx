import { useState } from 'react';
import { Check } from 'lucide-react';
import { cartItemFromProduct, type CartItem, type Product } from '../../storefrontRuntime';

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  onOpenProduct: (slug: string) => void;
  onAddToCart: (item: CartItem) => void;
  onOrderProduct: (item: CartItem) => void;
};

export function ProductCard({
  product,
  compact = false,
  onOpenProduct,
  onAddToCart,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const item = cartItemFromProduct(product);
  const openProductForOrder = () => {
    window.sessionStorage.setItem('tm-open-product-order', '1');
    onOpenProduct(product.slug);
  };
  const addProduct = () => {
    onAddToCart(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  };

  return (
    <article className="tm-reveal-item tm-lift tm-card min-w-0 overflow-hidden">
      <button type="button" onClick={() => onOpenProduct(product.slug)} className="block w-full text-right" aria-label={`فتح ${product.title}`}>
        <div className="relative">
          <img
            src={product.image}
            alt={product.title}
            className={`tm-image w-full object-cover ${compact ? 'h-[150px] sm:h-[180px]' : 'h-[150px] sm:h-[220px]'}`}
            loading="lazy"
            decoding="async"
            width="640"
            height="640"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <span className="tm-badge absolute right-2 top-2 px-2 py-1 text-[10px] sm:right-3 sm:top-3 sm:text-xs">
            {product.badge}
          </span>
        </div>
      </button>

      <div className="p-2.5 sm:p-4">
        <button type="button" onClick={() => onOpenProduct(product.slug)} className="block w-full" aria-label={`تفاصيل ${product.title}`}>
          <h3 className="tm-text-ink line-clamp-2 min-h-[42px] text-center font-heading text-sm font-black leading-tight sm:min-h-[48px] sm:text-lg">
            {product.title}
          </h3>
        </button>
        <div className="mt-3 text-center">
          <p className="tm-num tm-price-text font-heading text-xl font-black sm:text-2xl">{product.priceLabel}</p>
          <p className="tm-num tm-text-muted text-xs font-bold line-through sm:text-sm">{product.oldPrice}</p>
        </div>
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={openProductForOrder}
            className="tm-press tm-button-primary px-3 text-sm"
            aria-label={`اطلب ${product.title}`}
          >
            اطلب الآن
          </button>
          <button
            type="button"
            onClick={addProduct}
            className={`tm-press relative overflow-hidden px-3 text-xs ${added ? 'tm-add-button-added tm-button-dark' : 'tm-button-secondary'}`}
            aria-live="polite"
            aria-label={added ? `تمت إضافة ${product.title} للسلة` : `أضف ${product.title} للسلة`}
          >
            <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
              {added ? <Check className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={3} /> : null}
              {added ? 'تمت الإضافة' : 'أضف للسلة'}
            </span>
            {added ? <span className="tm-add-spark" aria-hidden="true" /> : null}
            {added ? <span className="tm-add-fly" aria-hidden="true" /> : null}
          </button>
        </div>
      </div>
    </article>
  );
}
