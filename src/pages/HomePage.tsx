import React from 'react';
import { useStore } from '../lib/store';
import { PerfumeBottleGraphic } from '../components/ui/PerfumeBottleGraphic';
import { ProductCard } from '../components/products/ProductCard';
import { ArrowRight, Sparkles, Shield, Truck, Award, Instagram } from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { products, activeProducts, categories, settings } = useStore();

  const featuredProducts = products.filter((p) => p.isFeatured && p.isActive).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller && p.isActive).slice(0, 4);

  return (
    <div className="space-y-24">
      {/* ==================================================== */}
      {/* 1. HERO SECTION                                      */}
      {/* ==================================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* Subtle Golden Glow caustic aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#D8B08C]/15 via-[#C9A46C]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

        {/* Ambient background particles and architectural lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#25252D_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-8">
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif text-[#F5F1EB] tracking-tight leading-[1.08] text-balance">
            METANOÏA <br />
            <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#FAF5EE] via-[#D8B08C] to-[#C98F78]">
              PARFUMS
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#A7A3A0] font-light max-w-2xl mx-auto leading-relaxed">
            « {settings.tagline} » <br className="hidden sm:inline" />
            Des matières premières rares façonnées avec minutie pour éveiller des émotions intemporelles et singulières.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/shop')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#D8B08C] via-[#C9A46C] to-[#C98F78] hover:brightness-110 text-[#0B0B0D] text-xs font-semibold uppercase tracking-[0.25em] rounded-sm transition-all shadow-xl shadow-[#D8B08C]/15 flex items-center justify-center gap-2 group"
            >
              <span>DÉCOUVRIR LA COLLECTION</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/shop?filter=new')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#141418] hover:bg-[#1C1C22] text-[#F5F1EB] hover:text-[#D8B08C] border border-[#2B2B38] hover:border-[#D8B08C]/60 text-xs font-medium uppercase tracking-[0.25em] rounded-sm transition-all flex items-center justify-center"
            >
              VOIR LES NOUVEAUTÉS
            </button>
          </div>

          {/* Trust Markers */}
          <div className="pt-8 border-t border-[#1C1C24] flex flex-wrap items-center justify-center gap-6 text-xs text-[#A7A3A0]">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#D8B08C]" />
              <span>Livraison 24h-48h Partout au Maroc</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#D8B08C]" />
              <span>Flacons Authentiques Scellés</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#D8B08C]" />
              <span>Extraits Purs &amp; Nobles</span>
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. SECTION COLLECTIONS / UNIVERS                     */}
      {/* ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
            EXPLORATION OLFACTIVE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#F5F1EB] mt-1">
            Les Univers de la Maison
          </h2>
          <p className="text-xs text-[#A7A3A0] mt-2">
            Des accords composés sans compromis pour révéler chaque facette de votre personnalité.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const path =
              cat.gender === 'HOMME'
                ? '/shop/homme'
                : cat.gender === 'FEMME'
                ? '/shop/femme'
                : cat.gender === 'UNISEXE'
                ? '/shop/unisexe'
                : cat.slug === 'nouveautes'
                ? '/shop?filter=new'
                : cat.slug === 'best-sellers'
                ? '/shop?filter=bestseller'
                : '/shop?filter=discount';

            return (
              <div
                key={cat.id}
                onClick={() => navigate(path)}
                className="group cursor-pointer p-6 bg-[#131317] border border-[#22222A] hover:border-[#D8B08C]/50 rounded-sm text-center transition-all duration-300 flex flex-col items-center justify-between h-44 hover:-translate-y-1"
              >
                <div className="w-8 h-8 rounded-full border border-[#2B2B38] group-hover:border-[#D8B08C] flex items-center justify-center text-[#D8B08C] transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-semibold tracking-wider text-[#F5F1EB] group-hover:text-[#D8B08C] transition-colors uppercase">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] font-mono text-[#A7A3A0]/70 mt-1 block">
                    {cat.count} créations
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8B08C] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <span>Explorer</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. FEATURED PRODUCTS (OU ÉTAT BOUTIQUE EN PRÉPARATION)*/}
      {/* ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#1E1E26]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
              SÉLECTION EXCLUSIVE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F1EB] mt-1">
              Les Créations Signature
            </h2>
          </div>
          {activeProducts.length > 0 && (
            <button
              onClick={() => navigate('/shop')}
              className="text-xs uppercase font-medium tracking-widest text-[#D8B08C] hover:text-[#F5F1EB] flex items-center gap-1 transition-colors"
            >
              <span>Toute la boutique</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeProducts.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-sm bg-[#121216] border border-[#22222A] text-center space-y-4">
            <div className="w-12 h-12 rounded-full border border-[#D8B08C]/40 bg-[#1A1A22] text-[#D8B08C] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-[#F5F1EB]">
              Nouvelles Créations en Préparation
            </h3>
            <p className="text-sm text-[#A7A3A0] max-w-lg mx-auto font-light leading-relaxed">
              Les extraits de parfum signature sont actuellement en cours de macération dans nos ateliers de Marrakech. Notre collection exclusive sera dévoilée très prochainement.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={navigate} />
            ))}
          </div>
        )}
      </section>

      {/* ==================================================== */}
      {/* 4. BRAND STORY & PHILOSOPHIE                         */}
      {/* ==================================================== */}
      <section className="bg-[#0E0E12] border-y border-[#1E1E26] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
              L’ARTISANAT DU SILLAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#F5F1EB] leading-tight">
              Metanoïa : La transformation de l’esprit à travers le parfum
            </h2>
            <p className="text-sm text-[#A7A3A0] leading-relaxed">
              En grec ancien, <em>metanoia</em> signifie une métamorphose profonde, un changement d'état de conscience. Nous concevons chaque parfum comme un vecteur d'affirmation de soi, une alchimie subtile entre mémoire, mystère et prestance.
            </p>
            <p className="text-sm text-[#A7A3A0] leading-relaxed">
              Formulés avec une concentration d'extrait de parfum dépassant les 25 %, nos jus garantissent un sillage incomparable et une tenue remarquable sur la peau tout au long du jour et de la nuit.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/about')}
                className="px-6 py-3 bg-[#191920] border border-[#D8B08C]/40 hover:border-[#D8B08C] text-[#D8B08C] hover:text-[#F5F1EB] text-xs uppercase tracking-widest rounded-sm transition-all"
              >
                Découvrir Notre Histoire
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-6 bg-[#131317] border border-[#252530] rounded-sm space-y-2">
              <span className="text-2xl font-serif text-[#D8B08C]">25%+</span>
              <h4 className="text-xs uppercase tracking-wider text-[#F5F1EB] font-semibold">
                Concentration Extrait
              </h4>
              <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
                Une richesse d'huiles essentielles pures assurant un sillage durable et racé.
              </p>
            </div>

            <div className="p-6 bg-[#131317] border border-[#252530] rounded-sm space-y-2">
              <span className="text-2xl font-serif text-[#C98F78]">100%</span>
              <h4 className="text-xs uppercase tracking-wider text-[#F5F1EB] font-semibold">
                Origine Certifiée
              </h4>
              <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
                Matières nobles : Oud d'Assam, Rose de Grasse, Santal crémeux et Cèdre de l'Atlas.
              </p>
            </div>

            <div className="p-6 bg-[#131317] border border-[#252530] rounded-sm space-y-2">
              <span className="text-2xl font-serif text-[#C9A46C]">24h-48h</span>
              <h4 className="text-xs uppercase tracking-wider text-[#F5F1EB] font-semibold">
                Livraison Maroc
              </h4>
              <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
                Livraison soignée partout au Maroc avec option paiement à la livraison (COD).
              </p>
            </div>

            <div className="p-6 bg-[#131317] border border-[#252530] rounded-sm space-y-2">
              <span className="text-2xl font-serif text-[#FAF5EE]">Coffret</span>
              <h4 className="text-xs uppercase tracking-wider text-[#F5F1EB] font-semibold">
                Écrin Somptueux
              </h4>
              <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
                Chaque flacon repose dans un écrin noir mat rehaussé de dorures chaudes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 5. BEST SELLERS SECTION (SI DISPONIBLES)             */}
      {/* ==================================================== */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#1E1E26]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A46C]">
                PLÉBISCITÉES
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F1EB] mt-1">
                Les Meilleures Ventes
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop?filter=bestseller')}
              className="text-xs uppercase font-medium tracking-widest text-[#D8B08C] hover:text-[#F5F1EB] flex items-center gap-1 transition-colors"
            >
              <span>Voir les Best-Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* ==================================================== */}
      {/* 6. INSTAGRAM SOCIAL PROOF                            */}
      {/* ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 bg-gradient-to-r from-[#141418] via-[#101014] to-[#141418] border border-[#252530] rounded-sm text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 text-[#D8B08C] mb-3">
            <Instagram className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">{settings.instagram}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F1EB]">
            Partagez Votre Signature Olfactive
          </h2>

          <p className="text-xs sm:text-sm text-[#A7A3A0] max-w-lg mx-auto mt-2 leading-relaxed">
            Rejoignez plus de 15 000 passionnés de haute parfumerie. Taggez <strong>#MetanoiaParfums</strong> pour figurer dans notre galerie d'honneur.
          </p>

          <div className="mt-6">
            <a
              href="https://instagram.com/metanoia.parfums"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#191920] border border-[#D8B08C]/40 hover:border-[#D8B08C] text-[#D8B08C] text-xs uppercase tracking-wider rounded-sm transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Suivre @metanoia.parfums</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
