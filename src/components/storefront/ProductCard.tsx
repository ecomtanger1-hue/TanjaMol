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
  const item = cartItemFromProduct(product);
  const openProductForOrder = () => {
    window.sessionStorage.setItem('tm-open-product-order', '1');
    onOpenProduct(product.slug);
  };

  return (
    <article className="tm-lift min-w-0 overflow-hidden rounded-lg bg-[#fffdf8] shadow-[0_10px_28px_rgba(23,32,27,0.08)]">
      <button type="button" onClick={() => onOpenProduct(product.slug)} className="block w-full text-right">
        <div className="relative">
          <img
            src={product.image}
            alt={product.title}
            className={`tm-image w-full object-cover ${compact ? 'h-[150px] sm:h-[180px]' : 'h-[150px] sm:h-[220px]'}`}
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <span className="tm-ui-label absolute right-2 top-2 rounded-md bg-white px-2 py-1 text-[10px] text-[#17201b] shadow-[0_8px_22px_rgba(23,32,27,0.16)] sm:right-3 sm:top-3 sm:text-xs">
            {product.badge}
          </span>
        </div>
      </button>

      <div className="p-2.5 sm:p-4">
        <button type="button" onClick={() => onOpenProduct(product.slug)} className="block w-full">
          <h3 className="tm-card-title line-clamp-2 min-h-[44px] text-center text-[#17201b] sm:min-h-[52px]">
            {product.title}
          </h3>
        </button>
        <div className="mt-3 text-center">
          <p className="tm-num tm-price text-xl text-[#0f7d55] sm:text-2xl">{product.priceLabel}</p>
          <p className="tm-num text-xs font-semibold text-[#929992] line-through sm:text-sm">{product.oldPrice}</p>
        </div>
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={openProductForOrder}
            className="tm-press tm-button-label min-h-[42px] rounded-md bg-[#00a66c] px-3 text-sm text-white"
          >
            اطلب الآن
          </button>
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="tm-press tm-secondary-label min-h-[38px] rounded-md bg-[#f2f7f4] px-3 text-xs text-[#253129]"
          >
            أضف للسلة
          </button>
        </div>
      </div>
    </article>
  );
}
