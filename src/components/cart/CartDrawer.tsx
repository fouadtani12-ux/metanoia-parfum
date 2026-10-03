import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, ShieldCheck } from 'lucide-react';
import { PerfumeBottleGraphic } from '../ui/PerfumeBottleGraphic';

interface CartDrawerProps {
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    settings,
    t,
    language,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const estimatedTotal = Math.max(0, cartSubtotal - couponDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;

    const res = applyCoupon(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoInput('');
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onNavigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0E0E11] border-l border-[#22222A] flex flex-col shadow-2xl text-[#F5F1EB]">
          {/* Header */}
          <div className="p-5 border-b border-[#1E1E24] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#D8B08C]" />
              <h2 className="text-sm font-sans uppercase tracking-[0.2em] font-semibold text-[#F5F1EB]">
                {t('cart.title')} ({cart.reduce((c, i) => c + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-[#A7A3A0] hover:text-[#F5F1EB] p-1.5 transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#141418] px-5 py-3 border-b border-[#1E1E24]">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-[#A7A3A0] leading-snug">
                {language === 'ar' ? (
                  <>
                    تبقّى فقط{' '}
                    <span className="text-[#D8B08C] font-semibold font-mono">
                      {remainingForFreeShipping} {t('common.currency')}
                    </span>{' '}
                    للاستفادة من{' '}
                    <span className="text-[#F5F1EB] font-medium">التوصيل المجاني</span> لجميع مدن المغرب.
                  </>
                ) : language === 'en' ? (
                  <>
                    Only{' '}
                    <span className="text-[#D8B08C] font-semibold font-mono">
                      {remainingForFreeShipping} {t('common.currency')}
                    </span>{' '}
                    away from{' '}
                    <span className="text-[#F5F1EB] font-medium">free delivery</span> across Morocco.
                  </>
                ) : (
                  <>
                    Plus que{' '}
                    <span className="text-[#D8B08C] font-semibold font-mono">
                      {remainingForFreeShipping} {settings.currency}
                    </span>{' '}
                    pour bénéficier de la{' '}
                    <span className="text-[#F5F1EB] font-medium">livraison offerte</span> partout au Maroc.
                  </>
                )}
              </p>
            ) : (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span>✦</span>
                <span>
                  {language === 'ar'
                    ? 'تهانينا! لقد حصلت على التوصيل المجاني لكافة مدن المملكة.'
                    : language === 'en'
                    ? 'Congratulations! You qualify for complimentary shipping.'
                    : 'Félicitations ! Vous bénéficiez de la livraison standard offerte.'}
                </span>
              </p>
            )}
            <div className="mt-2 w-full h-1 bg-[#25252D] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 rounded-full border border-[#2A2A35] flex items-center justify-center text-[#A7A3A0] mb-4">
                  <ShoppingBag className="w-5 h-5 text-[#D8B08C]/60" />
                </div>
                <h3 className="font-serif text-lg text-[#F5F1EB]">{t('cart.empty_title')}</h3>
                <p className="text-xs text-[#A7A3A0] max-w-xs mt-1 leading-relaxed">
                  {t('cart.empty_desc')}
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('/shop');
                  }}
                  className="mt-6 px-6 py-2.5 bg-[#19191E] border border-[#D8B08C]/40 hover:border-[#D8B08C] text-[#D8B08C] hover:text-[#F5F1EB] text-xs uppercase tracking-widest transition-all rounded-sm"
                >
                  {t('cart.discover')}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.volume}`}
                  className="flex gap-4 p-3 bg-[#131317] border border-[#1F1F26] rounded-sm relative group"
                >
                  {/* Flacon thumbnail */}
                  <div
                    onClick={() => {
                      setIsCartOpen(false);
                      onNavigate(`/product/${item.product.slug}`);
                    }}
                    className="w-16 h-20 bg-[#0B0B0D] rounded-sm flex items-center justify-center shrink-0 cursor-pointer overflow-hidden p-1 border border-[#22222A]"
                  >
                    {item.product.images && item.product.images[0] && !item.product.images[0].startsWith('/perfume-') ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-auto object-contain"
                      />
                    ) : (
                      <PerfumeBottleGraphic
                        name={item.product.name}
                        category={item.product.gender}
                        volume={item.volume}
                        accentColor={item.product.accentColor}
                        size="sm"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            setIsCartOpen(false);
                            onNavigate(`/product/${item.product.slug}`);
                          }}
                          className="text-xs font-serif font-medium text-[#F5F1EB] hover:text-[#D8B08C] cursor-pointer line-clamp-1"
                        >
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.volume)}
                          className="text-[#666] hover:text-rose-400 p-1 transition-colors"
                          aria-label="Supprimer l'article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#A7A3A0] mt-0.5">
                        {item.volume} · {item.product.gender}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1C22]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#2B2B38] bg-[#0E0E12] rounded-sm">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.productId, item.volume, item.quantity - 1)
                          }
                          className="px-2 py-0.5 text-[#A7A3A0] hover:text-[#F5F1EB] transition-colors"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-[#F5F1EB] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.productId, item.volume, item.quantity + 1)
                          }
                          className="px-2 py-0.5 text-[#A7A3A0] hover:text-[#F5F1EB] transition-colors"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      {(() => {
                        const itemPrice = Number(item.price) || 0;
                        const rawComp = item.product?.compareAtPrice ? Number(item.product.compareAtPrice) : 0;
                        const itemComp = rawComp > itemPrice ? rawComp : Math.round((itemPrice * 1.25) / 10) * 10;
                        const hasComp = itemComp > itemPrice;
                        return (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-mono font-semibold text-[#D8B08C] tabular-nums">
                              {itemPrice * item.quantity} {settings.currency}
                            </span>
                            {hasComp && (
                              <del
                                className="text-[10px] text-[#9E9B97] font-mono tabular-nums line-through decoration-[#C98F78] font-normal"
                                style={{ textDecoration: 'line-through' }}
                              >
                                {itemComp * item.quantity} {settings.currency}
                              </del>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#1E1E24] bg-[#101014] space-y-4">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-[#18181F] border border-[#D8B08C]/40 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#D8B08C]" />
                      <span className="text-xs font-mono font-medium text-[#D8B08C]">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] text-[#A7A3A0]">
                        (-{couponDiscount} {settings.currency})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-[#A7A3A0] hover:text-rose-400 p-1"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Code promo (ex: METANOIA10)"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        className="flex-1 bg-[#15151A] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] placeholder:text-[#666] uppercase focus:outline-none focus:border-[#D8B08C] rounded-sm font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-[#202028] hover:bg-[#282833] text-xs text-[#D8B08C] border border-[#2E2E3C] rounded-sm uppercase tracking-wider transition-colors"
                      >
                        Appliquer
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-rose-400 leading-none pt-0.5">{promoError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#A7A3A0] pt-2 border-t border-[#1C1C22]">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-mono text-[#F5F1EB] tabular-nums">
                    {cartSubtotal} {t('common.currency')}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Remise ({appliedCoupon.code})</span>
                    <span className="font-mono tabular-nums">
                      -{couponDiscount} {t('common.currency')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{t('cart.shipping')}</span>
                  <span className="font-mono text-[#D8B08C]">
                    {remainingForFreeShipping === 0
                      ? t('cart.free_shipping')
                      : t('cart.shipping_calculated')}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-medium text-[#F5F1EB] pt-2 border-t border-[#22222A]">
                  <span>{t('cart.total')}</span>
                  <span className="font-mono text-[#D8B08C] text-base font-semibold tabular-nums">
                    {estimatedTotal} {t('common.currency')}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 bg-gradient-to-r from-[#D8B08C] via-[#C9A46C] to-[#C98F78] hover:brightness-110 text-[#0B0B0D] font-semibold text-xs uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D8B08C]/10 transition-all"
              >
                <span>{t('cart.checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#A7A3A0]/70 pt-1 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D8B08C] shrink-0" />
                <span>{t('cart.cod_badge')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
