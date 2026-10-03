import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Volume, Product } from '../types';
import { PerfumeBottleGraphic } from '../components/ui/PerfumeBottleGraphic';
import { ProductCard } from '../components/products/ProductCard';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Star,
  Check,
  ArrowRight,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, navigate }) => {
  const {
    products,
    getProductBySlug,
    addToCart,
    isInWishlist,
    toggleWishlist,
    reviews,
    addReview,
    currentUser,
    settings,
    setIsCartOpen,
  } = useStore();

  const product = getProductBySlug(slug) || products.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] text-[#F5F1EB] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 rounded-full border border-[#D8B08C]/40 bg-[#1A1A22] text-[#D8B08C] flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl text-[#F5F1EB]">Recherche du Parfum...</h2>
          <p className="text-xs text-[#A7A3A0]">
            Chargement des détails olfactifs depuis la Maison Metanoïa.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-5 py-2 bg-[#1A1A22] border border-[#D8B08C]/40 text-[#D8B08C] text-xs uppercase tracking-wider rounded-sm hover:border-[#D8B08C] cursor-pointer"
          >
            Retourner à la boutique
          </button>
        </div>
      </div>
    );
  }

  const [selectedVolume, setSelectedVolume] = useState<Volume>(product.volume || '100 ml');
  const [quantity, setQuantity] = useState(1);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  React.useEffect(() => {
    setImgLoadFailed(false);
  }, [product.images?.[0]]);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState(
    currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ''
  );

  const inWishlist = isInWishlist(product.id);
  const productReviews = reviews.filter(
    (r) => r.productId === product.id && r.status === 'APPROVED'
  );

  const isLowStock = product.stock > 0 && product.stock <= 4;
  const isOutOfStock = product.stock === 0;

  // Robust calculation of prices and discount
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

  // Similar Products
  const similarProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.isActive &&
        (p.fragranceFamily === product.fragranceFamily || p.gender === product.gender)
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedVolume, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVolume, quantity);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReview({
      productId: product.id,
      productName: product.name,
      userName: reviewAuthor || 'Client Vérifié',
      rating: reviewRating,
      comment: reviewComment,
      verifiedPurchase: true,
    });

    setReviewComment('');
  };

  // Structured Data JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: product.sku,
    gtin13: product.barcode,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MAD',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://metanoia-parfums.com/product/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-[#A7A3A0] flex items-center gap-2">
        <button onClick={() => navigate('/')} className="hover:text-[#F5F1EB]">
          Accueil
        </button>
        <span>/</span>
        <button onClick={() => navigate('/shop')} className="hover:text-[#F5F1EB]">
          Boutique
        </button>
        <span>/</span>
        <button
          onClick={() =>
            navigate(
              product.gender === 'HOMME'
                ? '/shop/homme'
                : product.gender === 'FEMME'
                ? '/shop/femme'
                : '/shop/unisexe'
            )
          }
          className="hover:text-[#F5F1EB]"
        >
          {product.gender}
        </button>
        <span>/</span>
        <span className="text-[#D8B08C] truncate">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Visual Flacon Showcase */}
        <div className="lg:col-span-6 sticky top-28">
          <div className="relative bg-gradient-to-b from-[#181820]/80 via-[#101014] to-[#0A0A0D] border border-[#2A2A38] rounded-sm p-2 sm:p-4 flex items-center justify-center shadow-2xl overflow-hidden min-h-[460px] sm:min-h-[560px] aspect-[4/5]">
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
              {product.isNew && (
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D8B08C] border border-[#D8B08C]/40 bg-[#0B0B0D]/80 px-2.5 py-1">
                  NOUVEAUTÉ
                </span>
              )}
              {product.isBestSeller && (
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A46C] border border-[#C9A46C]/40 bg-[#0B0B0D]/80 px-2.5 py-1">
                  BEST-SELLER
                </span>
              )}
            </div>

            {/* Wishlist Heart */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                inWishlist
                  ? 'bg-[#C98F78] text-[#0B0B0D] border-[#C98F78]'
                  : 'bg-[#15151A]/80 border-[#2E2E3A] text-[#A7A3A0] hover:text-[#F5F1EB]'
              }`}
              aria-label="Ajouter aux favoris"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>

            {/* Luxury Flacon Visual or Uploaded Photo */}
            {product.images && product.images[0] && !product.images[0].startsWith('/perfume-') && !imgLoadFailed ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-20 blur-3xl pointer-events-none rounded-full"
                  style={{ background: product.accentColor || '#D8B08C' }}
                />
                <img
                  src={product.images[0]}
                  alt={product.name}
                  onError={() => setImgLoadFailed(true)}
                  className="relative z-10 w-full h-full object-contain object-center drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)] hover:scale-[1.02] transition-transform duration-500"
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
                  volume={selectedVolume}
                  accentColor={product.accentColor}
                  gradientStyle={product.gradientStyle}
                  size="hero"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A7A3A0]">
              <span className="text-[#D8B08C] font-semibold">{product.brand}</span>
              <span>·</span>
              <span>{product.gender}</span>
              <span>·</span>
              <span>{product.fragranceFamily}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F1EB] mt-2">
              {product.name}
            </h1>
            <p className="text-xs text-[#D8B08C] font-mono uppercase tracking-widest mt-1">
              {product.subtitle || 'Extrait de Parfum Haute Précision'}
            </p>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center text-[#D8B08C]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-current'
                        : 'text-[#3E3E4C]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-[#F5F1EB]">
                {product.rating}
              </span>
              <span className="text-xs text-[#A7A3A0]">
                ({product.reviewCount} avis vérifiés)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-[#141418] border border-[#22222A] rounded-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#D8B08C] font-mono tabular-nums">
                {numPrice} {settings.currency}
              </span>
              {effectiveComparePrice && effectiveComparePrice > numPrice && (
                <del
                  className="text-base sm:text-lg text-[#9E9B97] font-mono tabular-nums line-through decoration-[#C98F78] font-normal"
                  style={{ textDecoration: 'line-through' }}
                >
                  {effectiveComparePrice} {settings.currency}
                </del>
              )}
              {effectiveDiscount > 0 && (
                <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 border border-rose-800/40 rounded-xs">
                  -{effectiveDiscount}%
                </span>
              )}
            </div>

            {/* Stock State Badge - Only show if out of stock */}
            {isOutOfStock && (
              <span className="text-xs font-mono uppercase text-rose-400 border border-rose-800/40 bg-rose-950/40 px-2.5 py-1">
                Rupture de Stock
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-[#A7A3A0] leading-relaxed">
            {product.description}
          </p>

          {/* Volume Selector */}
          <div>
            <label className="text-xs uppercase tracking-wider text-[#A7A3A0] font-semibold block mb-2">
              Contenance
            </label>
            <div className="flex gap-2">
              {product.availableVolumes.map((vol) => (
                <button
                  key={vol}
                  onClick={() => setSelectedVolume(vol)}
                  className={`px-4 py-2 text-xs font-mono rounded-sm border transition-all ${
                    selectedVolume === vol
                      ? 'border-[#D8B08C] bg-[#1F1F28] text-[#D8B08C] font-bold shadow-sm'
                      : 'border-[#2A2A35] bg-[#121216] text-[#A7A3A0] hover:text-[#F5F1EB] hover:border-[#3E3E4C]'
                  }`}
                >
                  {vol}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#2B2B38] bg-[#121216] rounded-sm h-11">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-[#A7A3A0] hover:text-[#F5F1EB]"
                >
                  -
                </button>
                <span className="px-3 text-xs font-mono font-medium text-[#F5F1EB] tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock > 0 ? Math.max(product.stock, 20) : 20, q + 1))}
                  className="px-3 py-2 text-[#A7A3A0] hover:text-[#F5F1EB]"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-11 bg-[#191920] hover:bg-[#22222C] text-[#F5F1EB] hover:text-[#D8B08C] border border-[#D8B08C]/40 hover:border-[#D8B08C] text-xs font-semibold uppercase tracking-[0.2em] rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4 text-[#D8B08C]" />
                <span>Ajouter au Panier</span>
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 bg-gradient-to-r from-[#D8B08C] via-[#C9A46C] to-[#C98F78] hover:brightness-110 text-[#0B0B0D] font-bold text-xs uppercase tracking-[0.25em] rounded-sm transition-all shadow-xl shadow-[#D8B08C]/10 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Acheter Maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reassurance Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1E1E26] text-xs text-[#A7A3A0]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#D8B08C] shrink-0" />
              <span>Livraison 24h-48h Maroc</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D8B08C] shrink-0" />
              <span>Flacon Authentique 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#D8B08C] shrink-0" />
              <span>Retours 14 Jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. OLFACTIVE PYRAMID SECTION                         */}
      {/* ==================================================== */}
      <section className="bg-[#101014] border border-[#22222A] p-8 sm:p-12 rounded-sm space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
            ARCHITECTURE DU PARFUM
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F1EB] mt-1">
            La Pyramide Olfactive
          </h2>
          <p className="text-xs text-[#A7A3A0] mt-1">
            Chaque note se dévoile selon une partition temporelle précise, de la première vaporisation jusqu'aux heures les plus profondes de la nuit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Notes de Tête */}
          <div className="p-6 bg-[#141419] border border-[#242430] rounded-sm space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D8B08C] block">
              01 · NOTES DE TÊTE (15 PREMIÈRES MINUTES)
            </span>
            <h3 className="font-serif text-lg text-[#F5F1EB]">L’Ouverture</h3>
            <ul className="space-y-1.5 text-xs text-[#A7A3A0]">
              {(product.topNotes || []).map((note) => (
                <li key={note} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8B08C]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes de Cœur */}
          <div className="p-6 bg-[#141419] border border-[#242430] rounded-sm space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C98F78] block">
              02 · NOTES DE CŒUR (2 À 6 HEURES)
            </span>
            <h3 className="font-serif text-lg text-[#F5F1EB]">L’Âme du Parfum</h3>
            <ul className="space-y-1.5 text-xs text-[#A7A3A0]">
              {(product.heartNotes || []).map((note) => (
                <li key={note} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C98F78]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes de Fond */}
          <div className="p-6 bg-[#141419] border border-[#242430] rounded-sm space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A46C] block">
              03 · NOTES DE FOND (JUSQU'À 24 HEURES)
            </span>
            <h3 className="font-serif text-lg text-[#F5F1EB]">Le Sillage Éternel</h3>
            <ul className="space-y-1.5 text-xs text-[#A7A3A0]">
              {(product.baseNotes || []).map((note) => (
                <li key={note} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A46C]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. REVIEWS & RATINGS                                 */}
      {/* ==================================================== */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#22222A]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
              TÉMOIGNAGES
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F1EB] mt-1">
              Avis Clients ({productReviews.length})
            </h2>
          </div>
        </div>

        {/* Existing Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productReviews.length === 0 ? (
            <p className="text-xs text-[#A7A3A0] italic">
              Soyez le premier à donner votre avis sur cette création.
            </p>
          ) : (
            productReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-[#121216] border border-[#22222A] rounded-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F5F1EB]">
                      {rev.userName}
                    </span>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] font-mono text-emerald-400 border border-emerald-800/40 bg-emerald-950/30 px-1.5 py-0.5 rounded-sm">
                        Achat vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex text-[#D8B08C]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating ? 'fill-current' : 'text-[#333]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#A7A3A0] leading-relaxed pt-1">
                  « {rev.comment} »
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Review Form */}
        <div className="p-6 bg-[#131317] border border-[#22222A] rounded-sm space-y-4 max-w-xl">
          <h3 className="font-serif text-base text-[#F5F1EB]">Partagez votre ressenti</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#A7A3A0]">Votre note :</span>
              <div className="flex gap-1 text-[#D8B08C]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= reviewRating ? 'fill-current' : 'text-[#3E3E4C]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Votre nom"
              value={reviewAuthor}
              onChange={(e) => setReviewAuthor(e.target.value)}
              className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              required
            />

            <textarea
              rows={3}
              placeholder="Décrivez votre expérience avec ce parfum..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              required
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1C1C24] hover:bg-[#252530] text-[#D8B08C] border border-[#D8B08C]/40 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
            >
              Publier Mon Avis
            </button>
          </form>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. SIMILAR PRODUCTS                                  */}
      {/* ==================================================== */}
      {similarProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-[#1E1E26]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-[#F5F1EB]">
              Vous Pourriez Aussi Aimer
            </h2>
            <button
              onClick={() => navigate('/shop')}
              className="text-xs uppercase tracking-widest text-[#D8B08C] hover:underline"
            >
              Voir Tout
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={navigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
