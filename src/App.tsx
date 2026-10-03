import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/search/SearchModal';
import { ToastContainer } from './components/ui/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { AuthPage } from './pages/AuthPage';
import {
  AboutPage,
  ContactPage,
  FAQPage,
  ShippingPage,
  ReturnsPage,
  TermsPage,
  PrivacyPage,
  NotFoundPage,
} from './pages/StaticPages';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  const [searchParams, setSearchParams] = useState(() => {
    return new URLSearchParams(window.location.search);
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isRTL, setIsCartOpen } = useStore();

  // Navigation handler
  const navigate = (pathWithQuery: string) => {
    const [path, query] = pathWithQuery.split('?');
    window.history.pushState({}, '', pathWithQuery);
    setCurrentPath(path || '/');
    setSearchParams(new URLSearchParams(query || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Is Admin Route
  const isAdmin = currentPath.startsWith('/admin');

  // Render Page Content
  const renderPage = () => {
    // Admin Route
    if (isAdmin) {
      return <AdminDashboard navigate={navigate} />;
    }

    // Homepage
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} />;
    }

    // Shop Routes
    if (currentPath === '/shop') {
      const filter = searchParams.get('filter') as 'new' | 'bestseller' | 'discount' | undefined;
      return <ShopPage key={currentPath} initialFilter={filter} navigate={navigate} />;
    }
    if (currentPath === '/shop/homme') {
      return <ShopPage key={currentPath} genderFilter="HOMME" navigate={navigate} />;
    }
    if (currentPath === '/shop/femme') {
      return <ShopPage key={currentPath} genderFilter="FEMME" navigate={navigate} />;
    }
    if (currentPath === '/shop/unisexe') {
      return <ShopPage key={currentPath} genderFilter="UNISEXE" navigate={navigate} />;
    }

    // Product Detail
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '').split('/')[0];
      return <ProductDetailPage slug={slug} navigate={navigate} />;
    }

    // Cart (opens cart drawer or renders shop)
    if (currentPath === '/cart') {
      setTimeout(() => setIsCartOpen(true), 10);
      return <ShopPage navigate={navigate} />;
    }

    // Checkout
    if (currentPath === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    // Account & Orders
    if (currentPath === '/account' || currentPath === '/account/orders' || currentPath === '/account/profile') {
      const tab =
        currentPath === '/account/profile'
          ? 'profile'
          : searchParams.get('tab') === 'wishlist'
          ? 'wishlist'
          : 'orders';
      const successOrder = searchParams.get('success');
      return <AccountPage initialTab={tab} successOrderNumber={successOrder} navigate={navigate} />;
    }

    // Auth
    if (currentPath === '/login') {
      return <AuthPage mode="login" navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <AuthPage mode="register" navigate={navigate} />;
    }

    // Static & Legal Pages
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage navigate={navigate} />;
    }
    if (currentPath === '/faq') {
      return <FAQPage navigate={navigate} />;
    }
    if (currentPath === '/shipping') {
      return <ShippingPage navigate={navigate} />;
    }
    if (currentPath === '/returns') {
      return <ReturnsPage navigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <TermsPage navigate={navigate} />;
    }
    if (currentPath === '/privacy') {
      return <PrivacyPage navigate={navigate} />;
    }

    // 404 Fallback
    return <NotFoundPage navigate={navigate} />;
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-[#0B0B0D] text-[#F5F1EB] antialiased selection:bg-[#D8B08C]/30 selection:text-[#F5F1EB]"
    >
      {/* Top Navbar only on client pages */}
      {!isAdmin && (
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          openSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* Main View */}
      <main className="flex-1">{renderPage()}</main>

      {/* Footer only on client pages */}
      {!isAdmin && <Footer navigate={navigate} />}

      {/* Overlays & Drawers */}
      <CartDrawer onNavigate={navigate} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />
      <ToastContainer />
    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
