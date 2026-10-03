import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { BrandLogo } from '../ui/BrandLogo';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  Globe,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  openSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, openSearch }) => {
  const {
    cartCount,
    setIsCartOpen,
    wishlist,
    currentUser,
    language,
    setLanguage,
    settings,
    t,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const navLinks = [
    { label: t('nav.shop'), path: '/shop' },
    { label: t('nav.men'), path: '/shop/homme' },
    { label: t('nav.women'), path: '/shop/femme' },
    { label: t('nav.unisex'), path: '/shop/unisexe' },
    { label: t('nav.about'), path: '/about' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0D]/95 backdrop-blur-md border-b border-[#25252D]">
      {/* Slim Top Announcement Banner */}
      {showBanner && (
        <div className="relative bg-[#151518] border-b border-[#25252D]/60 py-1.5 px-4 text-center">
          <p className="text-[11px] tracking-[0.15em] text-[#D8B08C] font-light uppercase">
            {language === 'ar'
              ? `توصيل مجاني لجميع مدن المغرب ابتداءً من ${settings.freeShippingThreshold} د.م · الدفع عند الاستلام`
              : language === 'en'
              ? `Free shipping across Morocco on orders over ${settings.freeShippingThreshold} MAD · Cash on Delivery`
              : `Livraison offerte partout au Maroc dès ${settings.freeShippingThreshold} DH · Paiement à la livraison`}
          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A7A3A0] hover:text-[#F5F1EB] text-xs p-1"
            aria-label="Fermer la bannière"
          >
            ×
          </button>
        </div>
      )}

      {/* 3-Zone Top Navigation Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Single text element Brand mark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#F5F1EB] hover:text-[#D8B08C] p-2 -ml-2"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => handleNavClick('/')}
            className="focus:outline-none text-left"
          >
            <BrandLogo size="md" />
          </button>
        </div>

        {/* Zone 2: 4-6 Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`relative text-xs uppercase tracking-[0.2em] transition-colors py-1 ${
                  isActive
                    ? 'text-[#D8B08C] font-semibold'
                    : 'text-[#A7A3A0] hover:text-[#F5F1EB]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#D8B08C]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Search, Wishlist, Cart Drawer, Account) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#A7A3A0] mr-1">
            <Globe className="w-3.5 h-3.5 text-[#D8B08C]" />
            <button
              onClick={() => setLanguage('fr')}
              className={`px-1 py-0.5 transition-colors ${
                language === 'fr' ? 'text-[#D8B08C] font-bold' : 'hover:text-[#F5F1EB]'
              }`}
            >
              FR
            </button>
            <span>·</span>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-1 py-0.5 transition-colors ${
                language === 'ar' ? 'text-[#D8B08C] font-bold' : 'hover:text-[#F5F1EB]'
              }`}
            >
              AR
            </button>
            <span>·</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-1 py-0.5 transition-colors ${
                language === 'en' ? 'text-[#D8B08C] font-bold' : 'hover:text-[#F5F1EB]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Search Trigger */}
          <button
            onClick={openSearch}
            className="p-2 text-[#A7A3A0] hover:text-[#D8B08C] transition-colors relative"
            aria-label="Recherche"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => handleNavClick('/account?tab=wishlist')}
            className="p-2 text-[#A7A3A0] hover:text-[#D8B08C] transition-colors relative"
            aria-label="Favoris"
          >
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C98F78] text-[9px] text-[#0B0B0D] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Account / Admin Portal */}
          {currentUser?.role === 'ADMIN' ? (
            <button
              onClick={() => handleNavClick('/admin')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#19191E] border border-[#D8B08C]/40 text-[#D8B08C] text-xs rounded-sm hover:border-[#D8B08C] transition-colors"
              title="Accéder au panneau d'administration"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D8B08C]" />
              <span className="hidden sm:inline font-mono text-[10px]">ADMIN</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick(currentUser ? '/account' : '/login')}
              className="p-2 text-[#A7A3A0] hover:text-[#D8B08C] transition-colors"
              aria-label="Compte"
              title={currentUser ? `Connecté: ${currentUser.firstName}` : 'Connexion'}
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#151518] hover:bg-[#1E1E24] border border-[#D8B08C]/30 hover:border-[#D8B08C] text-[#F5F1EB] rounded-sm transition-all"
            aria-label="Panier"
          >
            <ShoppingBag className="w-4 h-4 text-[#D8B08C]" />
            <span className="text-xs font-medium tabular-nums text-[#D8B08C]">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B0B0D] border-b border-[#25252D] px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className="text-left text-sm uppercase tracking-[0.2em] text-[#A7A3A0] hover:text-[#D8B08C] py-2 border-b border-[#1E1E24]"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('/contact')}
              className="text-left text-sm uppercase tracking-[0.2em] text-[#A7A3A0] hover:text-[#D8B08C] py-2 border-b border-[#1E1E24]"
            >
              {t('nav.contact')}
            </button>
            <button
              onClick={() => handleNavClick(currentUser ? '/account' : '/login')}
              className="text-left text-sm uppercase tracking-[0.2em] text-[#D8B08C] py-2 font-medium"
            >
              {currentUser ? `${t('nav.account')} (${currentUser.firstName})` : t('nav.login')}
            </button>
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('/admin?tab=stocks')}
                className="text-left text-xs uppercase tracking-[0.2em] text-[#D8B08C]/90 hover:text-[#D8B08C] py-2.5 flex items-center gap-2 pt-3 border-t border-[#1E1E24]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D8B08C]" />
                <span>Espace Admin</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
