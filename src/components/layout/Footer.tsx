import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { Instagram, Facebook, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../lib/store';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings, showToast, t, language, currentUser } = useStore();
  const [newsletterEmail, setNewsletterEmail] = React.useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Veuillez renseigner une adresse email valide', 'error');
      return;
    }
    showToast(
      language === 'ar'
        ? 'شكراً لك. لقد تم تسجيلك بنجاح في نادي متانويا.'
        : language === 'en'
        ? 'Thank you. You are now subscribed to the Metanoïa Club.'
        : 'Merci. Vous êtes désormais inscrit(e) aux privilèges Metanoïa.',
      'success'
    );
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#08080A] border-t border-[#1F1F24] text-[#A7A3A0] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Prestige Club */}
        <div className="pb-12 mb-12 border-b border-[#18181D] flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
              {t('footer.cercle')}
            </span>
            <h4 className="text-xl md:text-2xl font-serif text-[#F5F1EB] mt-1">
              {t('footer.cercle_sub')}
            </h4>
          </div>
          <form onSubmit={handleNewsletter} className="flex w-full md:w-auto max-w-md gap-2">
            <input
              type="email"
              placeholder={t('footer.email_placeholder')}
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="bg-[#121215] border border-[#2A2A33] px-4 py-2.5 text-xs text-[#F5F1EB] placeholder:text-[#A7A3A0]/60 focus:outline-none focus:border-[#D8B08C] rounded-sm w-full md:w-64"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] text-xs font-semibold uppercase tracking-wider rounded-sm hover:brightness-110 transition-all flex items-center gap-1 shrink-0"
            >
              <span>{t('footer.subscribe')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#18181D]">
          {/* Col 1: Maison Metanoïa */}
          <div className="space-y-4">
            <div className="text-left">
              <BrandLogo size="sm" withTagline />
            </div>
            <p className="text-xs text-[#A7A3A0] leading-relaxed pt-2">
              {language === 'ar'
                ? 'دار عطور مغربية راقية تجمع بين نبل المكونات الشرقية النادرة ودقة وأناقة التقاليد الفرنسية في صناعة الخلاصات النقية.'
                : language === 'en'
                ? 'Moroccan high perfumery combining rare oriental essences with the timeless refinement of French extrait creation.'
                : 'Haute parfumerie d\'exception alliant la noblesse des matières premières orientales et le raffinement de la tradition française. Chaque extrait de parfum est composé pour marquer les mémoires.'}
            </p>

          </div>

          {/* Col 2: Boutique */}
          <div>
            <h5 className="text-xs font-sans uppercase tracking-[0.2em] text-[#F5F1EB] font-semibold mb-4">
              {t('footer.boutique')}
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigate('/shop/homme')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('nav.men')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop/femme')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('nav.women')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop/unisexe')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('nav.unisex')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop?filter=new')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('shop.filter_new')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop?filter=bestseller')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('shop.filter_bestseller')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Informations & Service Client */}
          <div>
            <h5 className="text-xs font-sans uppercase tracking-[0.2em] text-[#F5F1EB] font-semibold mb-4">
              {t('footer.informations')}
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('footer.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('footer.contact')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shipping')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('footer.shipping')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/returns')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('footer.returns')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/faq')}
                  className="hover:text-[#D8B08C] transition-colors"
                >
                  {t('footer.faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Suivez-nous & Instagram */}
          <div>
            <h5 className="text-xs font-sans uppercase tracking-[0.2em] text-[#F5F1EB] font-semibold mb-4">
              {t('footer.follow')}
            </h5>
            <p className="text-xs text-[#A7A3A0] mb-4">
              {language === 'ar'
                ? 'انضموا إلى عائلتنا على إنستغرام واكتشفوا كواليس ابتكار عطورنا.'
                : language === 'en'
                ? 'Join our community on Instagram and explore behind the scenes of our olfactory creations.'
                : 'Rejoignez notre communauté sur Instagram et découvrez les coulisses de la création de nos fragrances.'}
            </p>
            <div className="flex items-center gap-3 mb-6">
              <a
                href="https://instagram.com/metanoia.parfums"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-sm bg-[#121215] border border-[#2A2A33] flex items-center justify-center text-[#D8B08C] hover:border-[#D8B08C] transition-all"
                title="Instagram @metanoia.parfums"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/metanoiaparfums"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-sm bg-[#121215] border border-[#2A2A33] flex items-center justify-center text-[#D8B08C] hover:border-[#D8B08C] transition-all"
                title="Facebook Metanoïa Parfums"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <a
              href="https://instagram.com/metanoia.parfums"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-mono text-[#D8B08C] hover:underline"
            >
              {settings.instagram}
            </a>
          </div>
        </div>

        {/* Bottom bar & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#A7A3A0]/70">
          <div>
            {t('footer.rights')}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/terms')}
              className="hover:text-[#F5F1EB] transition-colors"
            >
              {t('footer.terms')}
            </button>
            <span>·</span>
            <button
              onClick={() => navigate('/privacy')}
              className="hover:text-[#F5F1EB] transition-colors"
            >
              {t('footer.privacy')}
            </button>
            {currentUser?.role === 'ADMIN' && (
              <>
                <span>·</span>
                <button
                  onClick={() => navigate('/admin?tab=stocks')}
                  className="text-[#D8B08C] hover:text-[#FAF5EE] transition-colors font-mono flex items-center gap-1.5"
                  title="Accéder au panneau administrateur et au contrôle des stocks"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D8B08C]" />
                  <span>Espace Admin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
