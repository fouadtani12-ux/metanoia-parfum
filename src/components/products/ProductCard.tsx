import React from 'react';
import { Product } from '../../types';
import { PerfumeBottleGraphic } from '../ui/PerfumeBottleGraphic';
import { useStore } from '../../lib/store';
import { Heart, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, isInWishlist, toggleWishlist, settings, t } = useStore();
  const inWishlist = isInWishlist(product.id);
  const [imgLoadFailed, setImgLoadFailed] = React.useState(false);

  React.useEffect(() => {
    setImgLoadFailed(false);
  }, [product.images?.[0]]);

  const isLowStock = product.stock > 0 && product.stock <= 4;
  const isOutOfStock = product.stock === 0;

  // Robust calculation of selling price, crossed-out original price and discount percentage
  const numPrice = Number(product.price) || 0;
  const rawCompare = product.compareAtPrice ? Number(product.compareAtPrice) : 0;
  const hasValidCompare = rawCompare > numPrice;
  const effectiveComparePrice = hasValidCompare
    ? rawCompare
    : product.discount && Number(product.discount) > 0 && numPrice > 0
    ? Math.round(numPrice / (1 - Number(product.discount) / 100))
    : numPrice > 0
    ? Math.round((numPrice * 1.25) / 10) * 10
    : null;

  const effectiveDiscount =
    effectiveComparePrice && effectiveComparePrice > numPrice
      ? Math.round(((effectiveComparePrice - numPrice) / effectiveComparePrice) * 100)
      : 0;

  const hasCustomPhoto =
    product.images &&
    product.images[0] &&
    !product.images[0].startsWith('/perfume-') &&
    !imgLoadFailed;

  return (
    <div className="group relative bg-[#121215] border border-[#22222A] hover:border-[#D8B08C]/40 rounded-sm overflow-hidden transition-all duration-300 flex flex-col justify-between">
      {/* Top badges / Status */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {product.isNew && (
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#D8B08C] bg-[#0B0B0D]/80 backdrop-blur-md px-2 py-0.5 border border-[#D8B08C]/30">
              {t('product.new')}
            </span>
          )}
          {product.isBestSeller && !product.isNew && (
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#C9A46C] bg-[#0B0B0D]/80 backdrop-blur-md px-2 py-0.5 border border-[#C9A46C]/30">
              {t('product.bestseller')}
            </span>
          )}
          {effectiveDiscount > 0 && (
            <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-950/90 backdrop-blur-md px-2 py-0.5 border border-rose-800/50 shadow-sm">
              -{effectiveDiscount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            inWishlist
              ? 'bg-[#C98F78] text-[#0B0B0D]'
              : 'bg-[#0B0B0D]/80 text-[#A7A3A0] hover:text-[#F5F1EB] hover:border-[#D8B08C]/50 border border-[#2A2A33]'
          }`}
          aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Main Flacon Visual */}
      <div
        onClick={() => onNavigate(`/product/${product.slug}`)}
        className="cursor-pointer relative w-full aspect-[4/5] flex items-center justify-center bg-gradient-to-b from-[#18181D]/60 via-[#121216] to-[#0F0F12] group-hover:brightness-105 transition-all overflow-hidden"
      >
        {hasCustomPhoto ? (
          <div className="w-full h-full flex items-center justify-center relative p-1.5 sm:p-2">
            <img
              src={product.images[0]}
              alt={product.name}
              onError={() => setImgLoadFailed(true)}
              className="w-full h-full object-contain object-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] group-hover:scale-[1.03] transition-transform duration-500"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center py-6">
            <PerfumeBottleGraphic
              name={product.name}
              category={product.gender}
              volume={product.volume}
              accentColor={product.accentColor}
              gradientStyle={product.gradientStyle}
              size="md"
            />
          </div>
        )}

        {/* Quick view overlay bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/product/${product.slug}`);
            }}
            className="px-3 py-1.5 bg-[#1C1C22] hover:bg-[#25252E] border border-[#33333F] text-xs text-[#F5F1EB] flex items-center gap-1.5 rounded-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#D8B08C]" />
            <span>{t('product.quick_view')}</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow justify-between border-t border-[#1C1C22]">
        <div>
          {/* Metadata Discipline: clean unboxed text with middle dots */}
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#A7A3A0] font-light mb-1">
            <span>{product.fragranceFamily}</span>
            <span aria-hidden="true">·</span>
            <span>{product.gender}</span>
            <span aria-hidden="true">·</span>
            <span>{product.volume}</span>
          </div>

          {/* Perfume Name */}
          <h3
            onClick={() => onNavigate(`/product/${product.slug}`)}
            className="text-lg font-serif font-medium text-[#F5F1EB] group-hover:text-[#D8B08C] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Subtitle / Olfactive Notes Preview */}
          <p className="text-xs text-[#A7A3A0]/80 line-clamp-1 mt-0.5 italic">
            {(product.topNotes && product.topNotes.length > 0)
              ? `${product.topNotes.slice(0, 2).join(', ')}${product.heartNotes && product.heartNotes[0] ? ` & ${product.heartNotes[0]}` : ''}`
              : (product.subtitle || 'Extrait de Parfum Intense')}
          </p>
        </div>

        {/* Pricing & Stock status */}
        <div className="pt-3 mt-3 border-t border-[#1A1A20] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-[#D8B08C] font-mono tabular-nums">
              {numPrice} {t('common.currency')}
            </span>
            {effectiveComparePrice && effectiveComparePrice > numPrice && (
              <del
                className="text-xs text-[#9E9B97] font-mono tabular-nums line-through decoration-[#C98F78] font-normal"
                style={{ textDecoration: 'line-through' }}
              >
                {effectiveComparePrice} {t('common.currency')}
              </del>
            )}
          </div>

          {/* Stock hint - Only show if out of stock */}
          {isOutOfStock && (
            <span className="text-[10px] uppercase font-mono text-rose-400">{t('product.out_of_stock')}</span>
          )}
        </div>

        {/* Buy Button */}
        <div className="mt-3">
          <button
            onClick={() => addToCart(product, product.volume, 1)}
            disabled={isOutOfStock}
            className={`w-full py-2 px-3 text-xs font-medium uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-[#18181D] text-[#555] cursor-not-allowed border border-[#25252D]'
                : 'bg-[#19191E] hover:bg-gradient-to-r hover:from-[#D8B08C] hover:to-[#C9A46C] text-[#F5F1EB] hover:text-[#0B0B0D] border border-[#2F2F3D] hover:border-transparent'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? t('product.out_of_stock') : t('product.add_to_cart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
