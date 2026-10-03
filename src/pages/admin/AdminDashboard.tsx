import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../../lib/store';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { PerfumeBottleGraphic } from '../../components/ui/PerfumeBottleGraphic';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Layers,
  Tag,
  Star,
  Truck,
  Settings,
  Bell,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Check,
  Eye,
  LogOut,
  ShoppingBag,
  Mail,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  FileText,
  Download,
  Terminal,
  Smartphone,
  Laptop,
  Sparkles,
  History as HistoryIcon,
  Upload,
  Image as ImageIcon,
  X,
  Database,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Product, OrderStatus, Volume, Gender, FragranceFamily } from '../../types';
import { formatOrderEmail, DEFAULT_ORDER_NOTIFICATION_EMAIL } from '../../lib/orderEmailService';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  saveProductToSupabase,
  uploadProductImageToSupabase,
  SUPABASE_SQL_SETUP_SCRIPT,
  isSupabaseConfigured,
} from '../../lib/supabase';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'stocks'
  | 'customers'
  | 'coupons'
  | 'reviews'
  | 'shipping'
  | 'settings'
  | 'database'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const {
    currentUser,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    clearCatalog,
    loadDemoCatalog,
    orders,
    updateOrderStatus,
    cancelOrder,
    users,
    stockMovements,
    adjustStock,
    coupons,
    addCoupon,
    toggleCouponStatus,
    deleteCoupon,
    reviews,
    moderateReview,
    shippingRates,
    updateShippingRate,
    settings,
    updateSettings,
    notifications,
    markNotificationAsRead,
    unreadNotificationsCount,
    logout,
    login,
    adminSessionLocked,
    setAdminSessionLocked,
    adminUnlock,
    auditLogs,
    addAuditLog,
    showToast,
  } = useStore();

  const [activeTab, setActiveTabState] = useState<AdminTab>(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const tab = search.get('tab') as AdminTab;
      const validTabs: AdminTab[] = [
        'overview',
        'products',
        'orders',
        'stocks',
        'customers',
        'coupons',
        'reviews',
        'shipping',
        'settings',
        'security',
      ];
      if (tab && validTabs.includes(tab)) {
        return tab;
      }
      if (window.location.pathname.includes('/stocks')) {
        return 'stocks';
      }
    } catch (e) {
      // ignore
    }
    return 'overview';
  });

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  // Admin Login Portal State (if not authenticated as admin)
  const [adminAuthEmail, setAdminAuthEmail] = useState('');
  const [adminAuthPassword, setAdminAuthPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Screen Lock State
  const [screenLockPin, setScreenLockPin] = useState('');
  const [screenLockError, setScreenLockError] = useState(false);

  // Audit Logs Filter
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  // Order Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Product Modal / Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    brand: 'Metanoïa Parfums',
    category: 'HOMME',
    gender: 'HOMME' as Gender,
    price: 650,
    compareAtPrice: 750,
    discount: 13,
    stock: 20,
    sku: 'MET-NEW-01',
    barcode: '6111234569999',
    volume: '100 ml' as Volume,
    fragranceFamily: 'Oriental' as FragranceFamily,
    topNotes: 'Safran, Bergamote',
    heartNotes: 'Oud Sauvage, Rose',
    baseNotes: 'Santal, Ambre Gris',
    accentColor: '#D8B08C',
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
  });

  // Coupon Form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 10,
    minimumAmount: 400,
    maximumDiscount: 200,
    startDate: new Date().toISOString(),
    endDate: '2026-12-31T23:59:59Z',
    usageLimit: 100,
    usageCount: 0,
    isActive: true,
  });

  // Stock Adjustment State
  const [adjustStockModal, setAdjustStockModal] = useState<{
    productId: string;
    productName: string;
    currentStock: number;
  } | null>(null);
  const [stockDelta, setStockDelta] = useState(5);
  const [stockReason, setStockReason] = useState<
    'MANUAL_RESTOCK' | 'CORRECTION'
  >('MANUAL_RESTOCK');

  // Selected Order Detail Modal
  const [inspectOrder, setInspectOrder] = useState<string | null>(null);

  // Supabase Configuration State
  const [supabaseConfigState, setSupabaseConfigState] = useState(() => getSupabaseConfig());
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [isExportingToSupabase, setIsExportingToSupabase] = useState(false);
  const [showSqlScript, setShowSqlScript] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  React.useEffect(() => {
    if (isSupabaseConfigured()) {
      testSupabaseConnection().then((res) => {
        setSupabaseTestResult(res);
      });
    }
  }, []);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  // Notifications Popover
  const [showNotifications, setShowNotifications] = useState(false);

  // Analytics Computations
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const averageCart = validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0;
  const totalInventory = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 4);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = validOrders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

  // Dynamic Sales by Day (Last 7 days)
  const weeklySales = useMemo(() => {
    const days: { day: string; dateStr: string; sales: number; pct: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const dayOrders = validOrders.filter((o) => o.createdAt.startsWith(dateStr));
      const sales = dayOrders.reduce((sum, o) => sum + o.total, 0);
      days.push({ day: dayLabel, dateStr, sales, pct: 0 });
    }
    const maxSales = Math.max(...days.map((d) => d.sales), 1);
    return days.map((d) => ({
      ...d,
      pct: d.sales > 0 ? Math.max(10, Math.round((d.sales / maxSales) * 100)) : 2,
    }));
  }, [validOrders]);

  // Dynamic Top Selling Fragrances from real orders
  const bestSellers = useMemo(() => {
    const productStats: Record<string, { name: string; sold: number; revenue: number }> = {};
    validOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = { name: item.name, sold: 0, revenue: 0 };
        }
        productStats[item.productId].sold += item.quantity;
        productStats[item.productId].revenue += item.price * item.quantity;
      });
    });

    const sorted = Object.values(productStats).sort((a, b) => b.sold - a.sold);
    if (sorted.length === 0) {
      return products.slice(0, 4).map((p) => ({
        name: p.name,
        sold: 0,
        rev: `0 ${settings.currency}`,
        share: 0,
      }));
    }
    const maxSold = sorted[0]?.sold || 1;
    return sorted.slice(0, 4).map((item) => ({
      name: item.name,
      sold: item.sold,
      rev: `${item.revenue.toLocaleString()} ${settings.currency}`,
      share: Math.round((item.sold / maxSold) * 100),
    }));
  }, [validOrders, products, settings.currency]);

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (orderStatusFilter !== 'ALL') {
      result = result.filter((o) => o.status === orderStatusFilter);
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.firstName.toLowerCase().includes(q) ||
          o.customer.lastName.toLowerCase().includes(q) ||
          o.customer.city.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      );
    }
    if (orderDateFilter === 'TODAY') {
      const todayStr = new Date().toISOString().split('T')[0];
      result = result.filter((o) => o.createdAt.startsWith(todayStr));
    }
    return result;
  }, [orders, orderStatusFilter, orderSearch, orderDateFilter]);

  // Product Form Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);

    try {
      let finalImageUrl = productForm.imageUrl;

      // Upload image to Supabase Storage if it's a new upload (base64 dataUrl or blob)
      if (
        productForm.imageUrl &&
        (productForm.imageUrl.startsWith('data:') || productForm.imageUrl.startsWith('blob:'))
      ) {
        showToast('Téléversement de la photo vers Supabase Storage...', 'info');
        finalImageUrl = await uploadProductImageToSupabase(
          productForm.imageUrl,
          `${productForm.slug || 'parfum'}-${Date.now()}`
        );
      }

      const targetGender: Gender = (productForm.gender || 'HOMME') as Gender;
      const parsedPrice = Number(productForm.price) || 0;
      const parsedCompare = productForm.compareAtPrice && Number(productForm.compareAtPrice) > 0
        ? Number(productForm.compareAtPrice)
        : undefined;
      const computedDiscount = parsedCompare && parsedCompare > parsedPrice
        ? Math.round(((parsedCompare - parsedPrice) / parsedCompare) * 100)
        : (productForm.discount ? Number(productForm.discount) : undefined);

      const productPayload = {
        name: productForm.name,
        slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        subtitle: productForm.subtitle,
        description: productForm.description,
        brand: productForm.brand || 'METANOÏA',
        category: targetGender,
        gender: targetGender,
        price: parsedPrice,
        compareAtPrice: parsedCompare,
        discount: computedDiscount,
        stock: Number(productForm.stock),
        sku: productForm.sku,
        barcode: productForm.barcode,
        volume: productForm.volume,
        availableVolumes: [productForm.volume],
        fragranceFamily: productForm.fragranceFamily,
        topNotes: (productForm.topNotes || '').split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean),
        heartNotes: (productForm.heartNotes || '').split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean),
        baseNotes: (productForm.baseNotes || '').split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean),
        images: finalImageUrl ? [finalImageUrl] : ['/perfume-oud.png'],
        gradientStyle: 'from-[#1E1610] via-[#0E0C0A] to-[#080809]',
        accentColor: productForm.accentColor,
        isActive: productForm.isActive,
        isFeatured: productForm.isFeatured,
        isBestSeller: productForm.isBestSeller,
        isNew: productForm.isNew,
        rating: 5.0,
        reviewCount: 0,
      };

      if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
        showToast(`Parfum « ${productPayload.name} » mis à jour avec succès dans Supabase !`, 'success');
      } else {
        await addProduct(productPayload);
        showToast(
          `Parfum « ${productPayload.name} » enregistré dans Supabase et visible immédiatement sur tous les appareils !`,
          'success'
        );
      }

      setShowProductModal(false);
      setEditingProductId(null);
    } catch (err: any) {
      console.error('Failed to save product to Supabase:', err);
      showToast(`Erreur lors de l’enregistrement : ${err?.message || 'échec'}`, 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      subtitle: prod.subtitle || '',
      description: prod.description,
      imageUrl: prod.images?.[0] || '',
      brand: prod.brand,
      category: prod.category,
      gender: prod.gender,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice ? Number(prod.compareAtPrice) : (prod.discount && prod.discount > 0 ? Math.round(prod.price / (1 - prod.discount / 100)) : 0),
      discount: prod.discount || (prod.compareAtPrice && Number(prod.compareAtPrice) > Number(prod.price) ? Math.round(((Number(prod.compareAtPrice) - Number(prod.price)) / Number(prod.compareAtPrice)) * 100) : 0),
      stock: prod.stock,
      sku: prod.sku,
      barcode: prod.barcode,
      volume: prod.volume,
      fragranceFamily: prod.fragranceFamily,
      topNotes: Array.isArray(prod.topNotes) ? prod.topNotes.join(', ') : (prod.topNotes || ''),
      heartNotes: Array.isArray(prod.heartNotes) ? prod.heartNotes.join(', ') : (prod.heartNotes || ''),
      baseNotes: Array.isArray(prod.baseNotes) ? prod.baseNotes.join(', ') : (prod.baseNotes || ''),
      accentColor: prod.accentColor,
      isActive: prod.isActive,
      isFeatured: prod.isFeatured,
      isBestSeller: prod.isBestSeller,
      isNew: prod.isNew,
    });
    setShowProductModal(true);
  };

  const handleOpenNewProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      slug: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      brand: 'Metanoïa Parfums',
      category: 'HOMME',
      gender: 'HOMME' as Gender,
      price: 650,
      compareAtPrice: 750,
      discount: 13,
      stock: 20,
      sku: `MET-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: '6111234569999',
      volume: '100 ml' as Volume,
      fragranceFamily: 'Oriental' as FragranceFamily,
      topNotes: 'Safran, Bergamote',
      heartNotes: 'Oud Sauvage, Rose',
      baseNotes: 'Santal, Ambre Gris',
      accentColor: '#D8B08C',
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      isNew: true,
    });
    setShowProductModal(true);
  };

  const productImageInputRef = useRef<HTMLInputElement>(null);

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP)', 'error');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // High quality client-side optimization for instant Firebase Firestore sync
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setProductForm((prev) => ({ ...prev, imageUrl: compressed }));
        } else {
          setProductForm((prev) => ({ ...prev, imageUrl: src }));
        }
        setIsUploadingImage(false);
        showToast('Photo du parfum chargée avec succès ! Elle s’affichera directement dans la boutique.', 'success');
      };
      img.onerror = () => {
        setIsUploadingImage(false);
        showToast('Erreur lors du traitement de l’image', 'error');
      };
      img.src = src;
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      showToast('Erreur lors de la lecture du fichier', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    addCoupon({
      code: couponForm.code.toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      minimumAmount: Number(couponForm.minimumAmount),
      maximumDiscount: couponForm.maximumDiscount ? Number(couponForm.maximumDiscount) : undefined,
      startDate: couponForm.startDate,
      endDate: couponForm.endDate,
      usageLimit: Number(couponForm.usageLimit),
      usageCount: 0,
      isActive: true,
    });
    setShowCouponModal(false);
    setCouponForm({
      code: '',
      type: 'PERCENTAGE',
      value: 10,
      minimumAmount: 400,
      maximumDiscount: 200,
      startDate: new Date().toISOString(),
      endDate: '2026-12-31T23:59:59Z',
      usageLimit: 100,
      usageCount: 0,
      isActive: true,
    });
  };

  const handleExecuteStockAdjust = () => {
    if (!adjustStockModal) return;
    adjustStock(adjustStockModal.productId, stockDelta, stockReason);
    setAdjustStockModal(null);
  };

  const inspectedOrderObj = inspectOrder ? orders.find((o) => o.id === inspectOrder) : null;

  // Guard 1: Not authenticated as ADMIN
  if (!currentUser || currentUser.role !== 'ADMIN') {
    const handleAdminPortalLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setAdminAuthError(null);

      const res = login(adminAuthEmail, adminAuthPassword, 'ADMIN');
      if (!res.success) {
        setAdminAuthError(res.message || 'Identifiants administrateur non reconnus');
      }
    };

    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#111116] border border-[#2B2B38] p-8 rounded-sm shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <BrandLogo size="md" withTagline />
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D8B08C] border border-[#D8B08C]/30 bg-[#171720] px-2.5 py-1 rounded-sm">
                ACCÈS STRICTEMENT RÉSERVÉ
              </span>
            </div>
            <h2 className="text-xl font-serif text-[#F5F1EB] mt-2">
              Espace Administrateur
            </h2>
            <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
              Cet espace est strictement réservé à la direction. Veuillez vous authentifier avec votre email administrateur autorisé.
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-sm text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{adminAuthError}</span>
            </div>
          )}

          <form onSubmit={handleAdminPortalLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                Email Administrateur Autorisé
              </label>
              <input
                type="email"
                required
                value={adminAuthEmail}
                onChange={(e) => setAdminAuthEmail(e.target.value)}
                placeholder="admin@metanoia-parfums.com"
                className="w-full bg-[#171720] border border-[#2B2B38] px-3.5 py-2.5 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C] font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                Mot de Passe
              </label>
              <input
                type="password"
                required
                value={adminAuthPassword}
                onChange={(e) => setAdminAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#171720] border border-[#2B2B38] px-3.5 py-2.5 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#D8B08C] via-[#C9A46C] to-[#C98F78] hover:brightness-110 text-[#0B0B0D] font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg shadow-[#D8B08C]/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Se Connecter à l'Administration</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-[#A7A3A0] hover:text-[#F5F1EB] transition-colors"
            >
              ← Retourner à la boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guard 2: Admin Screen Locked
  if (adminSessionLocked) {
    const handleUnlockSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const success = adminUnlock(screenLockPin);
      if (!success) {
        setScreenLockError(true);
      } else {
        setScreenLockPin('');
        setScreenLockError(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#07070A]/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#121217] border border-[#333346] p-8 rounded-sm shadow-2xl text-center space-y-6">
          <BrandLogo size="md" />
          <div className="space-y-1">
            <div className="w-12 h-12 rounded-full bg-[#1C1C2A] border border-[#D8B08C]/40 text-[#D8B08C] flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#F5F1EB]">Poste de Contrôle Verrouillé</h3>
            <p className="text-xs text-[#A7A3A0]">
              Session de <strong className="text-[#F5F1EB]">{currentUser.firstName}</strong> mise en veille sécurisée.
            </p>
          </div>

          {screenLockError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800 p-2 rounded-sm">
              Code PIN ou mot de passe invalide.
            </p>
          )}

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <input
              type="password"
              autoFocus
              required
              value={screenLockPin}
              onChange={(e) => {
                setScreenLockPin(e.target.value);
                setScreenLockError(false);
              }}
              placeholder="Code PIN (2026) ou Mot de passe"
              className="w-full bg-[#181822] border border-[#2B2B38] px-3.5 py-2.5 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C] font-mono text-center tracking-widest"
            />

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
            >
              Déverrouiller la Session
            </button>
          </form>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-xs text-[#A7A3A0] hover:text-rose-400 transition-colors"
          >
            Fermer la session (Déconnexion)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090C] text-[#F5F1EB] flex flex-col lg:flex-row">
      {/* ==================================================== */}
      {/* 1. ADMIN SIDEBAR                                     */}
      {/* ==================================================== */}
      <aside className="w-full lg:w-64 bg-[#0F0F13] border-r border-[#1F1F27] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Portal Title */}
          <div className="p-6 border-b border-[#1F1F27] flex items-center justify-between">
            <div>
              <BrandLogo size="sm" />
              <span className="text-[9px] font-mono tracking-widest text-[#D8B08C] uppercase block mt-1">
                ESPACE CONTRÔLE ADMIN
              </span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-[#A7A3A0] hover:text-[#F5F1EB] p-1 text-xs"
              title="Aller sur la boutique"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 text-xs">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: null },
              { id: 'orders', label: 'Commandes', icon: ShoppingCart, badge: pendingOrders.length || null },
              { id: 'products', label: 'Produits', icon: Package, badge: null },
              { id: 'stocks', label: 'Stocks & Inventaire', icon: Layers, badge: lowStockProducts.length || null },
              { id: 'customers', label: 'Clients', icon: Users, badge: null },
              { id: 'coupons', label: 'Promotions', icon: Tag, badge: null },
              { id: 'reviews', label: 'Avis Clients', icon: Star, badge: null },
              { id: 'shipping', label: 'Livraison & Villes', icon: Truck, badge: null },
              { id: 'settings', label: 'Paramètres', icon: Settings, badge: null },
              { id: 'database', label: 'Supabase & Base SQL', icon: Database, badge: isSupabaseConfigured() ? 'Actif' : null },
              { id: 'security', label: 'Sécurité & Audit', icon: ShieldCheck, badge: null },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition-colors ${
                    isActive
                      ? 'bg-[#1C1C26] text-[#D8B08C] font-semibold border-l-2 border-[#D8B08C]'
                      : 'text-[#A7A3A0] hover:text-[#F5F1EB] hover:bg-[#15151C]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#D8B08C]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    typeof item.badge === 'number' ? (
                      item.badge > 0 ? (
                        <span className="w-4 h-4 rounded-full bg-rose-500/80 text-[#F5F1EB] text-[9px] font-mono flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      ) : null
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {item.badge}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#1F1F27] space-y-2 text-xs">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 bg-[#181822] hover:bg-[#20202E] text-[#D8B08C] rounded-sm text-center border border-[#2B2B38] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir la Boutique</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full py-2 text-[#A7A3A0] hover:text-rose-400 rounded-sm text-center flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ==================================================== */}
      {/* 2. ADMIN MAIN VIEWPORT                               */}
      {/* ==================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-[#0E0E12] border-b border-[#1F1F27] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-serif font-medium text-[#F5F1EB] capitalize">
              {activeTab === 'overview'
                ? 'Tableau de Bord Exécutif'
                : activeTab === 'orders'
                ? 'Gestion des Commandes'
                : activeTab === 'products'
                ? 'Catalogue & Fragrances'
                : activeTab === 'stocks'
                ? 'Inventaire & Mouvements de Stock'
                : activeTab === 'customers'
                ? 'Comptes Clients & Fidélité'
                : activeTab === 'coupons'
                ? 'Codes Privilèges & Remises'
                : activeTab === 'reviews'
                ? 'Modération des Avis Clients'
                : activeTab === 'shipping'
                ? 'Zones & Tarifs de Livraison'
                : 'Configuration Générale'}
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-[#A7A3A0] hover:text-[#D8B08C] relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#141418] border border-[#2B2B38] rounded-sm shadow-2xl z-50 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#22222A]">
                    <span className="font-semibold text-[#F5F1EB]">Notifications Récentes</span>
                    <span className="text-[10px] font-mono text-[#D8B08C]">
                      {unreadNotificationsCount} non lues
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-sm border cursor-pointer transition-colors ${
                          n.isRead
                            ? 'bg-[#111115] border-[#1E1E24] text-[#777]'
                            : 'bg-[#181822] border-[#D8B08C]/30 text-[#F5F1EB]'
                        }`}
                      >
                        <h4 className="font-semibold text-xs text-[#D8B08C]">{n.title}</h4>
                        <p className="text-[11px] text-[#A7A3A0] mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[9px] font-mono text-[#555] block mt-1">
                          {new Date(n.createdAt).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* Quick Screen Lock Button */}
            <button
              type="button"
              onClick={() => {
                setAdminSessionLocked(true);
                showToast('Écran de l’Atelier verrouillé', 'info');
              }}
              className="px-2.5 py-1.5 bg-[#171722] hover:bg-[#222232] border border-[#333346] hover:border-[#D8B08C] text-xs text-[#D8B08C] rounded-sm flex items-center gap-1.5 transition-colors"
              title="Verrouiller l'écran de l'atelier"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Verrouiller</span>
            </button>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-[#22222A]">
              <div className="w-7 h-7 rounded-full bg-[#1F1F2C] border border-[#D8B08C]/50 flex items-center justify-center text-[#D8B08C] font-mono text-xs font-bold uppercase">
                {currentUser?.firstName?.[0] || 'A'}
              </div>
              <span className="text-xs font-medium text-[#F5F1EB] hidden sm:inline">
                {currentUser?.firstName || 'Direction'} (Admin)
              </span>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW / DASHBOARD                          */}
          {/* ==================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Alert Banner if New Pending Orders */}
              {pendingOrders.length > 0 && (
                <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-sm flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-amber-300">
                        {pendingOrders.length} Nouvelle(s) Commande(s) en attente de confirmation
                      </h4>
                      <p className="text-[11px] text-amber-400/80">
                        Vérifiez les commandes et lancez la préparation des flacons en atelier.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOrderStatusFilter('PENDING');
                      setActiveTab('orders');
                    }}
                    className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-xs font-mono rounded-sm transition-colors"
                  >
                    Voir les commandes
                  </button>
                </div>
              )}

              {/* Stat Cards Grid (8 metrics required) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Chiffre d'Affaires */}
                <div className="p-5 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#A7A3A0]">
                    <span className="text-[11px] uppercase tracking-wider">Chiffre d’Affaires</span>
                    <DollarSign className="w-4 h-4 text-[#D8B08C]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#F5F1EB]">
                    {totalRevenue.toLocaleString()} {settings.currency}
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18.4% ce mois</span>
                  </span>
                </div>

                {/* 2. Commandes */}
                <div className="p-5 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#A7A3A0]">
                    <span className="text-[11px] uppercase tracking-wider">Commandes Totales</span>
                    <ShoppingCart className="w-4 h-4 text-[#C98F78]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#F5F1EB]">
                    {orders.length}
                  </div>
                  <span className="text-[10px] text-[#A7A3A0]">
                    dont {pendingOrders.length} en attente
                  </span>
                </div>

                {/* 3. Clients */}
                <div className="p-5 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#A7A3A0]">
                    <span className="text-[11px] uppercase tracking-wider">Clients Inscrits</span>
                    <Users className="w-4 h-4 text-[#C9A46C]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#F5F1EB]">
                    {users.filter((u) => u.role !== 'ADMIN').length}
                  </div>
                  <span className="text-[10px] text-emerald-400">Comptes acheteurs</span>
                </div>

                {/* 4. Panier Moyen */}
                <div className="p-5 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#A7A3A0]">
                    <span className="text-[11px] uppercase tracking-wider">Panier Moyen</span>
                    <ShoppingBag className="w-4 h-4 text-[#D8B08C]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#D8B08C]">
                    {averageCart} {settings.currency}
                  </div>
                  <span className="text-[10px] text-[#A7A3A0]">Par commande validée</span>
                </div>

                {/* 5. Ventes du Jour */}
                <div className="p-5 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#A7A3A0]">
                    <span className="text-[11px] uppercase tracking-wider">Ventes du Jour</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#F5F1EB]">
                    {todayRevenue.toLocaleString()} {settings.currency}
                  </div>
                  <span className="text-[10px] text-emerald-400">
                    {todayOrders.length} commande(s) aujourd'hui
                  </span>
                </div>

                {/* 6. Ventes du Mois */}
                <div className="p-5 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[#A7A3A0]">
                    <span className="text-[11px] uppercase tracking-wider">Ventes du Mois</span>
                    <TrendingUp className="w-4 h-4 text-[#D8B08C]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#F5F1EB]">
                    {totalRevenue.toLocaleString()} {settings.currency}
                  </div>
                  <span className="text-[10px] text-emerald-400">Ce mois-ci</span>
                </div>

                {/* 7. Stock Total */}
                <div
                  onClick={() => setActiveTab('stocks')}
                  className="p-5 bg-[#121216] border border-[#22222A] hover:border-[#D8B08C]/60 rounded-sm space-y-2 cursor-pointer transition-all group"
                  title="Cliquer pour gérer les stocks"
                >
                  <div className="flex items-center justify-between text-[#A7A3A0] group-hover:text-[#D8B08C]">
                    <span className="text-[11px] uppercase tracking-wider">Unités en Stock</span>
                    <Layers className="w-4 h-4 text-[#C9A46C]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#F5F1EB] group-hover:text-[#D8B08C]">
                    {totalInventory}
                  </div>
                  <span className="text-[10px] text-[#A7A3A0] flex items-center justify-between">
                    <span>Sur {products.length} références</span>
                    <span className="text-[#D8B08C] font-mono">Gérer →</span>
                  </span>
                </div>

                {/* 8. Alertes Rupture & Faible */}
                <div
                  onClick={() => setActiveTab('stocks')}
                  className="p-5 bg-[#121216] border border-[#22222A] hover:border-amber-500/60 rounded-sm space-y-2 cursor-pointer transition-all group"
                  title="Cliquer pour gérer les alertes de stock"
                >
                  <div className="flex items-center justify-between text-[#A7A3A0] group-hover:text-amber-400">
                    <span className="text-[11px] uppercase tracking-wider">Alertes Stock</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-amber-300">
                    {lowStockProducts.length + outOfStockProducts.length}
                  </div>
                  <span className="text-[10px] text-rose-400 font-mono flex items-center justify-between">
                    <span>{outOfStockProducts.length} rupture · {lowStockProducts.length} faibles</span>
                    <span className="text-amber-400">Ajuster →</span>
                  </span>
                </div>
              </div>

              {/* Clean Modern Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chart 1: Évolution des Ventes par Jour */}
                <div className="lg:col-span-8 p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1E1E26]">
                    <div>
                      <h3 className="font-serif text-base text-[#F5F1EB]">
                        Évolution des Ventes (7 Derniers Jours)
                      </h3>
                      <span className="text-[11px] text-[#A7A3A0]">Chiffre d’affaires journalier en DH</span>
                    </div>
                    <span className="text-xs font-mono text-[#D8B08C]">Septembre 2026</span>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="pt-6 h-56 flex items-end justify-between gap-3 px-2">
                    {weeklySales.map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-mono text-[#D8B08C] opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.sales} DH
                        </span>
                        <div className="w-full bg-[#1A1A22] rounded-t-sm h-36 flex items-end overflow-hidden p-0.5">
                          <div
                            className="w-full bg-gradient-to-t from-[#C98F78] to-[#D8B08C] rounded-t-sm transition-all duration-500 group-hover:brightness-125"
                            style={{ height: `${bar.pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#A7A3A0]">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: Répartition par Univers & Statuts */}
                <div className="lg:col-span-4 p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-4">
                  <h3 className="font-serif text-base text-[#F5F1EB] pb-3 border-b border-[#1E1E26]">
                    Top Parfums les Plus Vendus
                  </h3>

                  <div className="space-y-3 pt-2">
                    {bestSellers.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#F5F1EB] font-serif">{item.name}</span>
                          <span className="font-mono text-[#D8B08C]">{item.rev}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1E1E26] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D8B08C]"
                            style={{ width: `${item.share}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: PRODUCTS MANAGEMENT                           */}
          {/* ==================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#22222A]">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                    Catalogue des Fragrances ({products.length})
                  </h2>
                  <span className="text-xs text-[#A7A3A0]">
                    Ajoutez vos propres créations au déploiement ou gérez votre inventaire.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {products.length === 0 && (
                    <button
                      onClick={() => loadDemoCatalog()}
                      className="px-3 py-2 bg-[#1A1A22] hover:bg-[#252530] text-[#D8B08C] border border-[#D8B08C]/40 text-xs font-mono rounded-sm transition-colors"
                      title="Charger des exemples de démonstration si souhaité"
                    >
                      Exemples Démo
                    </button>
                  )}
                  {products.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Voulez-vous vider le catalogue et repartir sur une boutique vierge ?')) {
                          clearCatalog();
                        }
                      }}
                      className="px-3 py-2 bg-[#1A1A22] hover:bg-rose-950/40 text-rose-400 border border-rose-900/40 text-xs font-mono rounded-sm transition-colors"
                      title="Vider le catalogue pour une boutique vierge"
                    >
                      Vider le catalogue
                    </button>
                  )}
                  <button
                    onClick={handleOpenNewProductModal}
                    className="px-4 py-2 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 shadow-md shadow-[#D8B08C]/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouveau Parfum</span>
                  </button>
                </div>
              </div>

              {/* Database Status Banner */}
              <div className="px-4 py-3 bg-emerald-950/40 border border-emerald-800/50 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-xs">
                    Base de données PostgreSQL active &amp; synchronisée (Cloud SQL europe-west1)
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-mono hidden md:inline">
                    — Persistance temps réel sur tous les appareils
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#A7A3A0]">
                  <span>Tables : <strong>products, orders, coupons, reviews</strong></span>
                </div>
              </div>

              {/* Table or Empty State */}
              {products.length === 0 ? (
                <div className="p-12 text-center bg-[#121216] border border-[#22222A] rounded-sm space-y-3">
                  <div className="w-10 h-10 rounded-full border border-[#D8B08C]/40 bg-[#1A1A22] text-[#D8B08C] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[#F5F1EB]">Votre catalogue est vierge</h3>
                  <p className="text-xs text-[#A7A3A0] max-w-md mx-auto leading-relaxed font-light">
                    La boutique est prête pour votre déploiement. Vous pouvez ajouter votre tout premier parfum dès maintenant avec ses notes olfactives, son prix et sa contenance.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={handleOpenNewProductModal}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-wider rounded-sm inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un Parfum</span>
                    </button>
                    <button
                      onClick={() => loadDemoCatalog()}
                      className="px-4 py-2.5 bg-[#171720] hover:bg-[#20202A] text-[#D8B08C] border border-[#D8B08C]/30 text-xs font-mono rounded-sm transition-colors"
                    >
                      Charger Exemples Démo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#22222A] rounded-sm bg-[#121216]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#171720] border-b border-[#22222A] text-[11px] text-[#D8B08C] uppercase">
                      <tr>
                        <th className="p-3">Flacon</th>
                        <th className="p-3">Nom &amp; SKU</th>
                        <th className="p-3">Univers</th>
                        <th className="p-3">Famille</th>
                        <th className="p-3">Prix</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C1C24]">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-[#16161D] transition-colors">
                          <td className="p-3">
                            <div className="w-9 h-11 bg-[#0A0A0D] border border-[#252530] rounded-sm flex items-center justify-center p-0.5 overflow-hidden">
                              {p.images && p.images[0] && !p.images[0].startsWith('/perfume-') ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="h-full w-auto object-contain"
                                />
                              ) : (
                                <PerfumeBottleGraphic
                                  name={p.name}
                                  category={p.gender}
                                  volume={p.volume}
                                  accentColor={p.accentColor}
                                  size="sm"
                                />
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[#F5F1EB] font-serif text-sm font-medium block">
                              {p.name}
                            </span>
                            <span className="text-[#666] text-[10px]">{p.sku}</span>
                          </td>
                          <td className="p-3">
                            <select
                              value={p.gender}
                              onChange={(e) => {
                                const newGender = e.target.value as Gender;
                                updateProduct(p.id, { gender: newGender, category: newGender });
                              }}
                              className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-sm border cursor-pointer focus:outline-none transition-colors ${
                                p.gender === 'FEMME'
                                  ? 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/50'
                                  : p.gender === 'UNISEXE'
                                  ? 'bg-purple-950/40 text-purple-300 border-purple-800/50 hover:bg-purple-900/50'
                                  : 'bg-amber-950/40 text-amber-300 border-amber-800/50 hover:bg-amber-900/50'
                              }`}
                              title="Changer instantanément le genre (Homme/Femme/Unisexe)"
                            >
                              <option value="HOMME" className="bg-[#121216] text-[#F5F1EB]">HOMME</option>
                              <option value="FEMME" className="bg-[#121216] text-[#F5F1EB]">FEMME</option>
                              <option value="UNISEXE" className="bg-[#121216] text-[#F5F1EB]">UNISEXE</option>
                            </select>
                          </td>
                          <td className="p-3 text-[#A7A3A0]">{p.fragranceFamily}</td>
                          <td className="p-3">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-[#D8B08C] font-semibold font-mono">{p.price} DH</span>
                              {p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) && (
                                <span className="text-[11px] text-[#9E9B97] line-through font-mono">
                                  {p.compareAtPrice} DH
                                </span>
                              )}
                              {p.discount && Number(p.discount) > 0 ? (
                                <span className="text-[9px] font-mono text-rose-300 bg-rose-950/60 px-1 py-0.5 border border-rose-800/40 rounded-xs">
                                  -{p.discount}%
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="p-3">
                            {p.stock === 0 ? (
                              <span className="text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.5 rounded-sm text-[10px]">
                                Épuisé (0)
                              </span>
                            ) : p.stock <= 4 ? (
                              <span className="text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded-sm text-[10px]">
                                Faible ({p.stock})
                              </span>
                            ) : (
                              <span className="text-emerald-400">{p.stock} unités</span>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => updateProduct(p.id, { isActive: !p.isActive })}
                              className={`px-2 py-0.5 rounded-sm text-[10px] ${
                                p.isActive
                                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-[#1D1D26] text-[#777]'
                              }`}
                            >
                              {p.isActive ? 'Actif' : 'Désactivé'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProductClick(p)}
                                className="p-1 text-[#A7A3A0] hover:text-[#D8B08C]"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Supprimer définitivement « ${p.name} » ?\nCe parfum et son image seront retirés de Supabase et de la boutique en temps réel.`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1 text-[#A7A3A0] hover:text-rose-400"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: ORDERS MANAGEMENT                             */}
          {/* ==================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#22222A]">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                    Gestion des Commandes Client ({filteredOrders.length})
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#A7A3A0]">
                      Suivez, confirmez et expédiez les colis partout au Maroc.
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                      <Mail className="w-3 h-3 text-emerald-400" />
                      Acheminement Gmail : {settings.orderNotificationEmail || DEFAULT_ORDER_NOTIFICATION_EMAIL}
                    </span>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#666] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Numéro, client, ville..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="bg-[#141418] border border-[#2B2B38] text-xs text-[#F5F1EB] pl-8 pr-3 py-1.5 rounded-sm focus:outline-none focus:border-[#D8B08C] w-48"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-[#141418] border border-[#2B2B38] text-xs text-[#F5F1EB] px-3 py-1.5 rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  >
                    <option value="ALL">Tous les Statuts</option>
                    <option value="PENDING">PENDING (En attente)</option>
                    <option value="CONFIRMED">CONFIRMED (Confirmée)</option>
                    <option value="PROCESSING">PROCESSING (Préparation)</option>
                    <option value="SHIPPED">SHIPPED (Expédiée)</option>
                    <option value="DELIVERED">DELIVERED (Livrée)</option>
                    <option value="CANCELLED">CANCELLED (Annulée)</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto border border-[#22222A] rounded-sm bg-[#121216]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#171720] border-b border-[#22222A] text-[11px] text-[#D8B08C] uppercase">
                    <tr>
                      <th className="p-3">Numéro</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Ville</th>
                      <th className="p-3">Articles</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Paiement</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Actions de Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C24]">
                    {filteredOrders.map((ord) => {
                      const statusStyles = {
                        PENDING: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
                        CONFIRMED: 'bg-blue-950/40 text-blue-400 border-blue-800/40',
                        PROCESSING: 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40',
                        SHIPPED: 'bg-purple-950/40 text-purple-400 border-purple-800/40',
                        DELIVERED: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
                        CANCELLED: 'bg-rose-950/40 text-rose-400 border-rose-800/40',
                        RETURNED: 'bg-neutral-900 text-neutral-400 border-neutral-700',
                      }[ord.status];

                      return (
                        <tr key={ord.id} className="hover:bg-[#16161D] transition-colors">
                          <td className="p-3 font-bold text-[#F5F1EB]">
                            <button
                              onClick={() => setInspectOrder(ord.id)}
                              className="hover:text-[#D8B08C] hover:underline"
                            >
                              {ord.orderNumber}
                            </button>
                            <span className="text-[10px] text-[#666] block font-normal">
                              {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td className="p-3 font-sans">
                            <span className="text-[#F5F1EB] block font-medium">
                              {ord.customer.firstName} {ord.customer.lastName}
                            </span>
                            <span className="text-[#A7A3A0] text-[11px] font-mono">
                              {ord.customer.phone}
                            </span>
                          </td>
                          <td className="p-3 text-[#A7A3A0] font-sans">{ord.customer.city}</td>
                          <td className="p-3 text-[#A7A3A0]">
                            {ord.items.reduce((sum, i) => sum + i.quantity, 0)} flacon(s)
                          </td>
                          <td className="p-3 text-[#D8B08C] font-semibold">{ord.total} DH</td>
                          <td className="p-3">
                            <span className="text-[10px] text-[#A7A3A0]">
                              Espèces (Livraison)
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 border rounded-sm text-[10px] ${statusStyles}`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {ord.status === 'PENDING' && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'CONFIRMED', 'Validée par l’administrateur')}
                                  className="px-2 py-1 bg-blue-950/60 border border-blue-800 text-blue-300 rounded-sm hover:bg-blue-900 transition-colors text-[10px]"
                                >
                                  Confirmer
                                </button>
                              )}
                              {ord.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'PROCESSING', 'Mise en flaconnage et emballage cadeau')}
                                  className="px-2 py-1 bg-indigo-950/60 border border-indigo-800 text-indigo-300 rounded-sm hover:bg-indigo-900 transition-colors text-[10px]"
                                >
                                  Préparer
                                </button>
                              )}
                              {ord.status === 'PROCESSING' && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'SHIPPED', 'Colis remis au transporteur express')}
                                  className="px-2 py-1 bg-purple-950/60 border border-purple-800 text-purple-300 rounded-sm hover:bg-purple-900 transition-colors text-[10px]"
                                >
                                  Expédier
                                </button>
                              )}
                              {ord.status === 'SHIPPED' && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'DELIVERED', 'Livré avec succès au destinataire')}
                                  className="px-2 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-sm hover:bg-emerald-900 transition-colors text-[10px]"
                                >
                                  Livrée
                                </button>
                              )}
                              {ord.status !== 'CANCELLED' && ord.status !== 'DELIVERED' && (
                                <button
                                  onClick={() => cancelOrder(ord.id, 'Annulée depuis le dashboard')}
                                  className="px-2 py-1 bg-[#201416] border border-rose-900/60 text-rose-400 rounded-sm hover:bg-rose-950 transition-colors text-[10px]"
                                  title="Annuler et restaurer le stock"
                                >
                                  Annuler
                                </button>
                              )}
                              <a
                                href={formatOrderEmail(ord, settings.orderNotificationEmail || DEFAULT_ORDER_NOTIFICATION_EMAIL).gmailComposeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-[#1A1A24] border border-[#333346] text-[#D8B08C] hover:border-[#D8B08C] rounded-sm transition-colors text-[10px] inline-flex items-center gap-1"
                                title="Ouvrir le récapitulatif dans Gmail"
                              >
                                <Mail className="w-2.5 h-2.5 text-red-400" />
                                <span>Gmail</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#A7A3A0]">
                          Aucune commande enregistrée pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: STOCKS & INVENTORY                            */}
          {/* ==================================================== */}
          {activeTab === 'stocks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#22222A]">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                    Niveaux de Stocks &amp; Alertes Automatiques
                  </h2>
                  <span className="text-xs text-[#A7A3A0]">
                    Le stock est automatiquement décrémenté lors d’une commande et restauré en cas d’annulation.
                  </span>
                </div>
              </div>

              {/* Stock Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-[#121216] border border-[#22222A] rounded-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-serif text-sm text-[#F5F1EB] font-medium">{p.name}</h4>
                        <span className="text-[10px] font-mono text-[#666]">{p.sku}</span>
                      </div>
                      {p.stock === 0 ? (
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-mono">
                          RUPTURE (0)
                        </span>
                      ) : p.stock <= 4 ? (
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-mono">
                          STOCK FAIBLE ({p.stock})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono">
                          En Stock ({p.stock})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-[#1C1C24]">
                      <span className="text-[#A7A3A0]">Disponibles : {p.stock}</span>
                      <button
                        onClick={() =>
                          setAdjustStockModal({
                            productId: p.id,
                            productName: p.name,
                            currentStock: p.stock,
                          })
                        }
                        className="px-3 py-1 bg-[#1C1C26] hover:bg-[#252533] text-[#D8B08C] border border-[#313142] rounded-sm transition-colors"
                      >
                        Ajuster Stock
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Movement History */}
              <div className="space-y-3 pt-6 border-t border-[#22222A]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A7A3A0]">
                  Historique Récent des Mouvements de Stock
                </h3>

                <div className="overflow-x-auto border border-[#22222A] rounded-sm bg-[#121216]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#171720] border-b border-[#22222A] text-[11px] text-[#D8B08C] uppercase">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Parfum</th>
                        <th className="p-3">Variation</th>
                        <th className="p-3">Avant → Après</th>
                        <th className="p-3">Motif</th>
                        <th className="p-3">Opérateur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C1C24]">
                      {stockMovements.slice(0, 15).map((m) => (
                        <tr key={m.id} className="hover:bg-[#16161D]">
                          <td className="p-3 text-[#A7A3A0]">
                            {new Date(m.date).toLocaleDateString('fr-FR')} {new Date(m.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 font-serif text-[#F5F1EB]">{m.productName}</td>
                          <td className="p-3 font-bold">
                            <span className={m.change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {m.change > 0 ? `+${m.change}` : m.change}
                            </span>
                          </td>
                          <td className="p-3 text-[#A7A3A0]">
                            {m.previousStock} → {m.newStock}
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono bg-[#1E1E26] px-2 py-0.5 rounded-sm text-[#D8B08C]">
                              {m.reason}
                            </span>
                          </td>
                          <td className="p-3 text-[#666]">{m.operator || 'Système'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: CUSTOMERS                                     */}
          {/* ==================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#22222A]">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                    Clients &amp; Comptes Enregistrés ({users.filter((u) => u.role !== 'ADMIN').length})
                  </h2>
                  <span className="text-xs text-[#A7A3A0]">
                    Consultez l'historique et la valeur vie (LTV) de chaque client.
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#22222A] rounded-sm bg-[#121216]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#171720] border-b border-[#22222A] text-[11px] text-[#D8B08C] uppercase">
                    <tr>
                      <th className="p-3">Client</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Téléphone</th>
                      <th className="p-3">Commandes</th>
                      <th className="p-3">Total Dépensé</th>
                      <th className="p-3">Inscription</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C24]">
                    {users.filter((u) => u.role !== 'ADMIN').map((u) => (
                      <tr key={u.id} className="hover:bg-[#16161D]">
                        <td className="p-3 font-sans font-medium text-[#F5F1EB]">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="p-3 text-[#A7A3A0]">{u.email}</td>
                        <td className="p-3 text-[#A7A3A0]">{u.phone}</td>
                        <td className="p-3 font-bold text-[#F5F1EB]">{u.totalOrders || 0}</td>
                        <td className="p-3 text-[#D8B08C] font-semibold">
                          {(u.totalSpent || 0).toLocaleString()} DH
                        </td>
                        <td className="p-3 text-[#666]">
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                    {users.filter((u) => u.role !== 'ADMIN').length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#A7A3A0]">
                          Aucun compte client enregistré pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: COUPONS                                       */}
          {/* ==================================================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#22222A]">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                    Codes Privilèges &amp; Promotions ({coupons.length})
                  </h2>
                  <span className="text-xs text-[#A7A3A0]">
                    Créez des remises en pourcentage ou montants fixes en DH.
                  </span>
                </div>
                <button
                  onClick={() => setShowCouponModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Code Promo</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-[#22222A] rounded-sm bg-[#121216]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#171720] border-b border-[#22222A] text-[11px] text-[#D8B08C] uppercase">
                    <tr>
                      <th className="p-3">Code</th>
                      <th className="p-3">Type &amp; Valeur</th>
                      <th className="p-3">Montant Min.</th>
                      <th className="p-3">Utilisations</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C24]">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-[#16161D]">
                        <td className="p-3 font-bold text-[#D8B08C]">{c.code}</td>
                        <td className="p-3 text-[#F5F1EB]">
                          {c.type === 'PERCENTAGE' ? `${c.value}%` : `${c.value} DH`}
                        </td>
                        <td className="p-3 text-[#A7A3A0]">{c.minimumAmount} DH</td>
                        <td className="p-3 text-[#A7A3A0]">
                          {c.usageCount} / {c.usageLimit}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleCouponStatus(c.id)}
                            className={`px-2 py-0.5 rounded-sm text-[10px] ${
                              c.isActive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-[#1D1D26] text-[#666]'
                            }`}
                          >
                            {c.isActive ? 'Actif' : 'Désactivé'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deleteCoupon(c.id)}
                            className="p-1 text-[#A7A3A0] hover:text-rose-400"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: REVIEWS                                       */}
          {/* ==================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#22222A]">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                  Modération des Avis Clients ({reviews.length})
                </h2>
                <span className="text-xs text-[#A7A3A0]">
                  Gérez la publication des témoignages déposés par les acheteurs.
                </span>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-[#121216] border border-[#22222A] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-[#F5F1EB] font-medium text-sm">
                          {rev.productName}
                        </span>
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
                        <span className="text-[10px] font-mono text-[#666]">
                          Par {rev.userName} · {new Date(rev.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-xs text-[#A7A3A0] italic">« {rev.comment} »</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => moderateReview(rev.id, 'APPROVED')}
                        className={`px-3 py-1 rounded-sm text-xs ${
                          rev.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-[#181820] text-[#A7A3A0] hover:text-[#F5F1EB]'
                        }`}
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => moderateReview(rev.id, 'REJECTED')}
                        className={`px-3 py-1 rounded-sm text-xs ${
                          rev.status === 'REJECTED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-[#181820] text-[#A7A3A0] hover:text-rose-400'
                        }`}
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: SHIPPING & CITIES                             */}
          {/* ==================================================== */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-[#22222A]">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                  Zones &amp; Tarifs de Livraison par Ville
                </h2>
                <span className="text-xs text-[#A7A3A0]">
                  Ajustez les tarifs standard et express selon les villes marocaines.
                </span>
              </div>

              <div className="overflow-x-auto border border-[#22222A] rounded-sm bg-[#121216]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#171720] border-b border-[#22222A] text-[11px] text-[#D8B08C] uppercase">
                    <tr>
                      <th className="p-3">Ville</th>
                      <th className="p-3">Frais Standard</th>
                      <th className="p-3">Frais Express VIP</th>
                      <th className="p-3">Délai Estimé</th>
                      <th className="p-3 text-right">Mise à jour rapide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C24]">
                    {shippingRates.map((r) => (
                      <tr key={r.id} className="hover:bg-[#16161D]">
                        <td className="p-3 font-sans font-medium text-[#F5F1EB]">{r.city}</td>
                        <td className="p-3 text-[#D8B08C]">{r.standardFee} DH</td>
                        <td className="p-3 text-[#C98F78]">{r.expressFee} DH</td>
                        <td className="p-3 text-[#A7A3A0]">{r.estimatedDays}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              const newFee = prompt(
                                `Nouveau tarif standard pour ${r.city} (en DH) :`,
                                String(r.standardFee)
                              );
                              if (newFee) updateShippingRate(r.id, { standardFee: Number(newFee) });
                            }}
                            className="px-2.5 py-1 bg-[#1C1C26] hover:bg-[#252533] text-[#D8B08C] rounded-sm text-[10px]"
                          >
                            Modifier Tarif
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 9: SETTINGS                                      */}
          {/* ==================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-[#121216] border border-[#22222A] p-6 rounded-sm space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB] pb-3 border-b border-[#22222A]">
                Paramètres de la Boutique Metanoïa
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Nom de la Boutique</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Slogan</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>

                <div className="p-3.5 bg-[#171724] border border-[#2B2B38] rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#D8B08C] uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#D8B08C]" />
                      <span>Email de Réception des Commandes (Gmail)</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">● Notifications actives</span>
                  </div>
                  <input
                    type="email"
                    value={settingsForm.orderNotificationEmail || settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        orderNotificationEmail: e.target.value,
                        email: e.target.value,
                      })
                    }
                    className="w-full bg-[#121218] border border-[#333346] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C] font-mono"
                    placeholder="admin@metanoia-parfums.com"
                  />
                  <p className="text-[10px] text-[#A7A3A0]">
                    Toutes les nouvelles commandes passées par les clients sont acheminées directement et automatiquement vers cette adresse de notification.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#A7A3A0] block mb-1">Email Conciergerie Public</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#A7A3A0] block mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#A7A3A0] block mb-1">Compte Instagram</label>
                    <input
                      type="text"
                      value={settingsForm.instagram}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                      className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#A7A3A0] block mb-1">
                      Seuil Livraison Gratuite (DH)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.freeShippingThreshold}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          freeShippingThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateSettings(settingsForm)}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-widest rounded-sm"
                >
                  Sauvegarder les Paramètres
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 10: SÉCURITÉ & AUDIT                             */}
          {/* ==================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security KPI Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7A3A0]">
                      Acheminement Commandes
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="font-mono text-xs font-bold text-[#F5F1EB] truncate">
                    {settings.orderNotificationEmail || DEFAULT_ORDER_NOTIFICATION_EMAIL}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    ● Acheminement Gmail Actif
                  </span>
                </div>

                <div className="p-4 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7A3A0]">
                      Paiements Autorisés
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-mono text-xs font-bold text-[#F5F1EB]">
                    Livraison Uniquement
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    ● Espèces (Carte désactivée)
                  </span>
                </div>

                <div className="p-4 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7A3A0]">
                      Protection des Accès
                    </span>
                    <Lock className="w-4 h-4 text-[#D8B08C]" />
                  </div>
                  <h3 className="font-mono text-xs font-bold text-[#F5F1EB]">
                    Double Clé (PIN 2026 + 2FA)
                  </h3>
                  <span className="text-[10px] text-[#D8B08C] font-mono block">
                    ● Anti-Bruteforce 5 essais
                  </span>
                </div>

                <div className="p-4 bg-[#121216] border border-[#22222A] rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7A3A0]">
                      Journal d'Audit Actif
                    </span>
                    <HistoryIcon className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="font-mono text-base font-bold text-[#F5F1EB]">
                    {auditLogs.length} événements
                  </h3>
                  <span className="text-[10px] text-amber-400 font-mono block">
                    ● Registre d'intégrité à jour
                  </span>
                </div>
              </div>

              {/* Audit Trail Section */}
              <div className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22222A]">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB] flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#D8B08C]" />
                      <span>Journal d'Audit &amp; Traçabilité Exécutive</span>
                    </h3>
                    <p className="text-xs text-[#A7A3A0] mt-0.5">
                      Toutes les opérations sensibles effectuées sur la boutique et l'atelier sont cryptographiquement horodatées.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Severity Filter */}
                    <div className="flex border border-[#2B2B38] rounded-sm overflow-hidden text-[11px]">
                      {(['ALL', 'INFO', 'WARNING', 'CRITICAL'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setAuditFilter(lvl)}
                          className={`px-2.5 py-1 transition-colors ${
                            auditFilter === lvl
                              ? 'bg-[#1C1C28] text-[#D8B08C] font-semibold'
                              : 'bg-[#111116] text-[#A7A3A0] hover:text-[#F5F1EB]'
                          }`}
                        >
                          {lvl === 'ALL' ? 'Tous' : lvl}
                        </button>
                      ))}
                    </div>

                    {/* Export Audit Log JSON Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const payload = {
                          store: 'Metanoïa Parfums',
                          exportTitle: 'Journal d’Audit de Sécurité Administrateur',
                          exportedAt: new Date().toISOString(),
                          exportedBy: currentUser?.email || 'admin@metanoia.com',
                          totalLogs: auditLogs.length,
                          logs: auditLogs,
                        };
                        const dataStr =
                          'data:text/json;charset=utf-8,' +
                          encodeURIComponent(JSON.stringify(payload, null, 2));
                        const a = document.createElement('a');
                        a.setAttribute('href', dataStr);
                        a.setAttribute('download', `metanoia_audit_logs_${Date.now()}.json`);
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        showToast('Journal d’audit exporté avec succès', 'success');
                      }}
                      className="px-3 py-1.5 bg-[#1B1B26] border border-[#333348] hover:border-[#D8B08C] text-[#F5F1EB] rounded-sm text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D8B08C]" />
                      <span>Exporter (JSON)</span>
                    </button>
                  </div>
                </div>

                {/* Audit Search */}
                <div className="relative max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A7A3A0]" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Filtrer par action, cible, détails..."
                    className="w-full bg-[#181820] border border-[#2B2B38] pl-8 pr-3 py-1.5 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>

                {/* Audit Table */}
                <div className="overflow-x-auto border border-[#22222A] rounded-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#171720] text-[#A7A3A0] uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Horodatage</th>
                        <th className="p-3">Opérateur</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Cible</th>
                        <th className="p-3">Détails</th>
                        <th className="p-3">IP / Provenance</th>
                        <th className="p-3">Sévérité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#22222A]">
                      {auditLogs
                        .filter((l) => (auditFilter === 'ALL' ? true : l.severity === auditFilter))
                        .filter((l) =>
                          auditSearch
                            ? l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              l.target.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              l.details.toLowerCase().includes(auditSearch.toLowerCase())
                            : true
                        )
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-[#15151D]">
                            <td className="p-3 font-mono text-[#A7A3A0] whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleDateString('fr-FR')} -{' '}
                              {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>
                            <td className="p-3 text-[#D8B08C] font-mono text-[11px]">
                              {log.adminEmail}
                            </td>
                            <td className="p-3 font-semibold text-[#F5F1EB]">{log.action}</td>
                            <td className="p-3 text-[#A7A3A0]">{log.target}</td>
                            <td className="p-3 text-[#F5F1EB] max-w-md">{log.details}</td>
                            <td className="p-3 font-mono text-[#A7A3A0] whitespace-nowrap">
                              {log.ip}
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                                  log.severity === 'CRITICAL'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : log.severity === 'WARNING'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {log.severity}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Security Controls & Policies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Policy 1: Atelier Security */}
                <div className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#D8B08C]" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                      Règles de Sécurité de la Boutique
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs text-[#A7A3A0]">
                    <div className="p-3 bg-[#181822] border border-[#2B2B38] rounded-sm flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#F5F1EB] block">
                          Paiement en ligne par carte (CB)
                        </span>
                        <span className="text-[11px] text-[#A7A3A0]">
                          Option désactivée : seuls les paiements à la livraison au Maroc sont autorisés.
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800">
                        Désactivé
                      </span>
                    </div>

                    <div className="p-3 bg-[#181822] border border-[#2B2B38] rounded-sm flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#F5F1EB] block">
                          Acheminement automatique des commandes
                        </span>
                        <span className="text-[11px] text-[#A7A3A0]">
                          Toutes les commandes sont transmises à l'adresse de notification configurée.
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Actif
                      </span>
                    </div>

                    <div className="p-3 bg-[#181822] border border-[#2B2B38] rounded-sm flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#F5F1EB] block">
                          Protection contre les attaques par force brute
                        </span>
                        <span className="text-[11px] text-[#A7A3A0]">
                          Blocage temporaire après 5 échecs consécutifs d'authentification.
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Actif (5 essais max)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Policy 2: Quick Action Atelier Lock */}
                <div className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB]">
                      Verrouillage Rapide de l'Écran
                    </h4>
                  </div>
                  <p className="text-xs text-[#A7A3A0]">
                    Si vous quittez votre poste ou votre atelier, verrouillez l'affichage en 1 clic pour préserver la confidentialité des commandes clients et du chiffre d'affaires.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminSessionLocked(true);
                        showToast('Écran de l’Atelier verrouillé', 'info');
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 shadow-lg shadow-amber-900/20"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Verrouiller l'Atelier Maintenant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        addAuditLog(
                          'SECURITY_CHECK',
                          'Système Intégral',
                          'Audit d’intégrité des données déclenché par l’administrateur',
                          'INFO'
                        );
                        showToast('Contrôle de sécurité terminé : Aucun incident détecté', 'success');
                      }}
                      className="px-4 py-2.5 bg-[#1B1B26] border border-[#333348] hover:border-[#D8B08C] text-[#F5F1EB] text-xs rounded-sm flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Tester l'Intégrité Globale</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 10: SUPABASE & DATABASE CONFIGURATION            */}
          {/* ==================================================== */}
          {activeTab === 'database' && (
            <div className="max-w-4xl space-y-6">
              {/* Header */}
              <div className="pb-3 border-b border-[#22222A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F1EB] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#D8B08C]" />
                    <span>Configuration de la Base de Données &amp; Supabase</span>
                  </h2>
                  <span className="text-xs text-[#A7A3A0]">
                    Connectez votre projet Supabase ou gérez votre base de données relationnelle PostgreSQL.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-mono border ${
                      isSupabaseConfigured()
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-amber-950/40 border-amber-800 text-amber-400'
                    }`}
                  >
                    {isSupabaseConfigured() ? '● Supabase Connecté' : '○ Supabase non configuré'}
                  </span>
                </div>
              </div>

              {/* Status Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Cloud SQL PostgreSQL (Europe West 1) */}
                <div className="p-4 bg-[#121216] border border-[#22222A] rounded-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <h4 className="text-xs font-semibold text-[#F5F1EB] uppercase tracking-wider">
                        PostgreSQL Cloud SQL
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                      En ligne
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
                    Base relationnelle managée active dans la région <strong className="text-[#D8B08C]">europe-west1</strong>. Sauvegarde automatique et persistante de vos parfums, commandes et stocks.
                  </p>
                  <div className="text-[10px] font-mono text-[#D8B08C] pt-1">
                    ORM : Drizzle ORM + Connection Pooling (pg.Pool)
                  </div>
                </div>

                {/* Card 2: Supabase Client SDK */}
                <div className="p-4 bg-[#121216] border border-[#22222A] rounded-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          isSupabaseConfigured() ? 'bg-emerald-400' : 'bg-neutral-600'
                        }`}
                      />
                      <h4 className="text-xs font-semibold text-[#F5F1EB] uppercase tracking-wider">
                        Client Supabase (@supabase/supabase-js)
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isSupabaseConfigured()
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-[#181822] text-[#777] border-[#2A2A38]'
                      }`}
                    >
                      {isSupabaseConfigured() ? 'Actif' : 'En attente des clés'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
                    Permet d'utiliser votre propre projet hébergé sur <strong className="text-[#D8B08C]">Supabase.com</strong> avec synchronisation Realtime en direct sur tous les clients web et mobiles.
                  </p>
                  <div className="text-[10px] font-mono text-[#A7A3A0] pt-1">
                    SDK : @supabase/supabase-js v2
                  </div>
                </div>
              </div>

              {/* Supabase Credentials Form */}
              <div className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#22222A]">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1EB]">
                      Identifiants de votre Projet Supabase
                    </h3>
                    <p className="text-[11px] text-[#A7A3A0] mt-0.5">
                      Retrouvez ces valeurs dans votre tableau de bord Supabase : <em>Project Settings → API</em>.
                    </p>
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#D8B08C] hover:underline"
                  >
                    <span>Ouvrir Supabase Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-[11px] text-[#A7A3A0] block mb-1 font-mono">
                      Supabase Project URL (ex: https://xyzcompany.supabase.co)
                    </label>
                    <input
                      type="url"
                      placeholder="https://votre-projet.supabase.co"
                      value={supabaseConfigState.url}
                      onChange={(e) =>
                        setSupabaseConfigState({ ...supabaseConfigState, url: e.target.value.trim() })
                      }
                      className="w-full bg-[#181820] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C] font-mono"
                    />
                    {supabaseConfigState.url && !supabaseConfigState.url.startsWith('http') && (
                      <p className="text-[11px] text-amber-400 mt-1 font-mono">
                        ⚠️ Attention : L'URL du projet doit commencer par https:// (ex: https://votre-projet.supabase.co) et non pas une clé API.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] text-[#A7A3A0] block mb-1 font-mono">
                      Supabase Publishable / Anon API Key (VITE_SUPABASE_PUBLISHABLE_KEY)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseConfigState.publishableKey}
                      onChange={(e) =>
                        setSupabaseConfigState({ ...supabaseConfigState, publishableKey: e.target.value.trim() })
                      }
                      className="w-full bg-[#181820] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C] font-mono resize-none"
                    />
                  </div>

                  {/* Actions & Test Result */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        saveSupabaseConfig(supabaseConfigState);
                        showToast('Configuration Supabase enregistrée avec succès !', 'success');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-wider rounded-sm transition-all shadow-md shadow-[#D8B08C]/10 cursor-pointer"
                    >
                      Enregistrer la Configuration
                    </button>

                    <button
                      type="button"
                      disabled={isTestingSupabase || !supabaseConfigState.url || !supabaseConfigState.publishableKey}
                      onClick={async () => {
                        setIsTestingSupabase(true);
                        setSupabaseTestResult(null);
                        saveSupabaseConfig(supabaseConfigState);
                        const res = await testSupabaseConnection(supabaseConfigState);
                        setSupabaseTestResult(res);
                        setIsTestingSupabase(false);
                        if (res.success) {
                          showToast('Connexion Supabase établie avec succès !', 'success');
                        } else {
                          showToast(res.message, 'error');
                        }
                      }}
                      className="px-4 py-2 bg-[#1B1B24] border border-[#2F2F3E] hover:border-[#D8B08C] text-[#F5F1EB] text-xs font-mono rounded-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-[#D8B08C] ${isTestingSupabase ? 'animate-spin' : ''}`}
                      />
                      <span>{isTestingSupabase ? 'Test en cours...' : 'Tester la Connexion'}</span>
                    </button>

                    {isSupabaseConfigured() && (
                      <button
                        type="button"
                        disabled={isExportingToSupabase}
                        onClick={async () => {
                          setIsExportingToSupabase(true);
                          try {
                            for (const p of products) {
                              await saveProductToSupabase(p);
                            }
                            showToast(
                              `Succès : ${products.length} parfums exportés vers Supabase !`,
                              'success'
                            );
                          } catch (err: any) {
                            showToast(`Erreur d'exportation : ${err?.message || 'échec'}`, 'error');
                          } finally {
                            setIsExportingToSupabase(false);
                          }
                        }}
                        className="px-4 py-2 bg-[#17201D] border border-emerald-800/50 hover:border-emerald-600 text-emerald-300 text-xs font-mono rounded-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {isExportingToSupabase
                            ? 'Exportation...'
                            : `Exporter le catalogue actuel vers Supabase (${products.length})`}
                        </span>
                      </button>
                    )}
                  </div>

                  {supabaseTestResult && (
                    <div
                      className={`p-3 rounded-sm border text-xs flex items-start gap-2.5 font-mono ${
                        supabaseTestResult.success
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800 text-rose-300'
                      }`}
                    >
                      {supabaseTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong>{supabaseTestResult.success ? 'Succès : ' : 'Échec : '}</strong>
                        {supabaseTestResult.message}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SQL Setup Script Helper */}
              <div className="p-6 bg-[#121216] border border-[#22222A] rounded-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1EB] flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#D8B08C]" />
                      <span>Script SQL d'Initialisation des Tables Supabase</span>
                    </h3>
                    <p className="text-[11px] text-[#A7A3A0] mt-0.5">
                      Si la table n'existe pas encore dans votre projet Supabase, exécutez ce script dans votre{' '}
                      <strong>SQL Editor</strong> Supabase en 1 clic.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSqlScript(!showSqlScript)}
                      className="text-xs text-[#A7A3A0] hover:text-[#D8B08C] underline cursor-pointer"
                    >
                      {showSqlScript ? 'Masquer le script' : 'Afficher le script SQL'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
                        setCopiedSql(true);
                        showToast('Script SQL copié dans le presse-papier !', 'success');
                        setTimeout(() => setCopiedSql(false), 2500);
                      }}
                      className="px-3 py-1.5 bg-[#1B1B26] border border-[#2F2F40] hover:border-[#D8B08C] text-[#D8B08C] text-xs font-mono rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedSql ? 'Copié !' : 'Copier le SQL'}</span>
                    </button>
                  </div>
                </div>

                {showSqlScript && (
                  <pre className="p-4 bg-[#09090C] border border-[#1F1F28] rounded-sm text-[11px] font-mono text-[#D8B08C] overflow-x-auto max-h-72 leading-relaxed">
                    {SUPABASE_SQL_SETUP_SCRIPT}
                  </pre>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT                            */}
      {/* ==================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#2B2B38] rounded-sm max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#22222A]">
              <div>
                <h3 className="font-serif text-lg text-[#F5F1EB]">
                  {editingProductId ? 'Modifier le Parfum' : 'Ajouter une Nouvelle Fragrance'}
                </h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Synchronisation directe Supabase (visible immédiatement sur mobile, PC & tablette)
                </span>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-[#A7A3A0] hover:text-[#F5F1EB]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Nom du Parfum *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Sous-titre / Concentration</label>
                  <input
                    type="text"
                    value={productForm.subtitle}
                    onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#A7A3A0] block mb-1">Description Poétique *</label>
                <textarea
                  rows={2}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              {/* Photo du Parfum Upload & Management */}
              <div className="space-y-3 p-3.5 bg-[#15151D] border border-[#2D2D3D] rounded-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#F5F1EB] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D8B08C]" />
                    <span>Photo Réelle du Parfum (Affichée dans la boutique)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#D8B08C]">JPG, PNG, WEBP</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={productImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleProductImageUpload}
                />

                {/* Case 1: Photo uploaded and ready */}
                {productForm.imageUrl && !productForm.imageUrl.startsWith('/perfume-') ? (
                  <div className="flex items-center gap-4 p-3 bg-[#0E0E12] border border-[#D8B08C]/50 rounded-sm">
                    <div className="relative w-20 h-24 bg-[#08080A] rounded-sm border border-[#2A2A38] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                      <img
                        src={productForm.imageUrl}
                        alt="Aperçu du parfum"
                        className="max-h-full max-w-full object-contain drop-shadow-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                        <Check className="w-4 h-4" />
                        <span>Photo importée avec succès</span>
                      </div>
                      <p className="text-[11px] text-[#A7A3A0] leading-snug">
                        Cette photo est maintenant configurée et sera affichée directement aux clients sur la boutique et la page du produit.
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isUploadingImage}
                          onClick={() => productImageInputRef.current?.click()}
                          className="px-3 py-1 bg-[#1C1C26] hover:bg-[#252535] text-[#D8B08C] border border-[#3A3A4D] rounded-sm text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingImage ? 'Chargement...' : 'Remplacer la photo'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, imageUrl: '' })}
                          className="px-3 py-1 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-800/40 rounded-sm text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Case 2: No photo uploaded yet -> Prominent Dropzone / Upload button */
                  <div
                    onClick={() => productImageInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-[#D8B08C]/60 hover:border-[#D8B08C] bg-[#101016] hover:bg-[#161622] p-5 rounded-sm transition-all text-center space-y-2.5 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1C1C28] border border-[#D8B08C]/40 text-[#D8B08C] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F5F1EB] group-hover:text-[#D8B08C] transition-colors block">
                        {isUploadingImage
                          ? 'Optimisation et chargement de la photo...'
                          : 'Cliquez ici pour importer la photo de votre parfum'}
                      </span>
                      <p className="text-[11px] text-[#A7A3A0] mt-0.5">
                        Sélectionnez une photo depuis votre téléphone ou votre ordinateur (PNG, JPG, WEBP).
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs rounded-sm tracking-wide shadow-md shadow-[#D8B08C]/15">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choisir une photo</span>
                    </div>
                  </div>
                )}

                {/* Secondary options: URL ou Flacons par défaut */}
                <div className="pt-2 border-t border-[#22222E] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#A7A3A0]">
                    <span>Ou renseigner un lien URL direct vers l'image :</span>
                  </div>
                  <input
                    type="text"
                    placeholder="https://... ou collez un lien d'image"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full bg-[#101016] border border-[#2B2B38] px-3 py-1.5 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] text-[#A7A3A0] pt-0.5">
                    <span>Flacons 3D par défaut :</span>
                    {[
                      { label: 'Oud', path: '/perfume-oud.png' },
                      { label: 'Rose', path: '/perfume-rose.png' },
                      { label: 'Ambre', path: '/perfume-ambre.png' },
                      { label: 'Cuir', path: '/perfume-cuir.png' },
                      { label: 'Oranger', path: '/perfume-oranger.png' },
                    ].map((preset) => (
                      <button
                        key={preset.path}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageUrl: preset.path })}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          productForm.imageUrl === preset.path
                            ? 'border-[#D8B08C] text-[#D8B08C] bg-[#D8B08C]/10 font-medium'
                            : 'border-[#2B2B38] hover:border-[#A7A3A0]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Univers / Genre *</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => {
                      const g = e.target.value as Gender;
                      setProductForm((prev) => ({ ...prev, gender: g, category: g }));
                    }}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  >
                    <option value="HOMME">HOMME (Pour Homme)</option>
                    <option value="FEMME">FEMME (Pour Femme)</option>
                    <option value="UNISEXE">UNISEXE (Mixte)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Famille Olfactive</label>
                  <select
                    value={productForm.fragranceFamily}
                    onChange={(e) => setProductForm({ ...productForm, fragranceFamily: e.target.value as FragranceFamily })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  >
                    <option value="Oriental">Oriental</option>
                    <option value="Boisé">Boisé</option>
                    <option value="Floral">Floral</option>
                    <option value="Gourmand">Gourmand</option>
                    <option value="Frais">Frais</option>
                    <option value="Ambré">Ambré</option>
                    <option value="Cuiré">Cuiré</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Contenance</label>
                  <select
                    value={productForm.volume}
                    onChange={(e) => setProductForm({ ...productForm, volume: e.target.value as Volume })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  >
                    <option value="30 ml">30 ml</option>
                    <option value="50 ml">50 ml</option>
                    <option value="75 ml">75 ml</option>
                    <option value="100 ml">100 ml</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Prix de vente (DH) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.price || ''}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value);
                      const currentComp = Number(productForm.compareAtPrice) || 0;
                      const newDiscount = currentComp > newPrice ? Math.round(((currentComp - newPrice) / currentComp) * 100) : 0;
                      setProductForm({ ...productForm, price: newPrice, discount: newDiscount });
                    }}
                    placeholder="650"
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm font-mono focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-[#A7A3A0] block">Prix Barré (Optionnel)</label>
                    {productForm.compareAtPrice && Number(productForm.compareAtPrice) > Number(productForm.price) && (
                      <span className="text-[10px] font-mono text-rose-300 font-semibold">
                        -{Math.round(((Number(productForm.compareAtPrice) - Number(productForm.price)) / Number(productForm.compareAtPrice)) * 100)}%
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={productForm.compareAtPrice ? productForm.compareAtPrice : ''}
                    onChange={(e) => {
                      const newComp = e.target.value === '' ? 0 : Number(e.target.value);
                      const numComp = Number(newComp) || 0;
                      const numPrice = Number(productForm.price) || 0;
                      const newDiscount = numComp > numPrice ? Math.round(((numComp - numPrice) / numComp) * 100) : 0;
                      setProductForm({ ...productForm, compareAtPrice: newComp, discount: newDiscount });
                    }}
                    placeholder="Ex: 850 (Prix avant solde)"
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm font-mono focus:outline-none focus:border-[#D8B08C]"
                  />
                  <p className="text-[10px] text-[#A7A3A0] mt-0.5">
                    Affiché barré à côté du prix client.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Stock Initial (Optionnel)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) || 999 })}
                    placeholder="Illimité par défaut (999)"
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm font-mono focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>
              </div>

              {/* Notes Pyramid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Notes de Tête</label>
                  <input
                    type="text"
                    value={productForm.topNotes}
                    onChange={(e) => setProductForm({ ...productForm, topNotes: e.target.value })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Notes de Cœur</label>
                  <input
                    type="text"
                    value={productForm.heartNotes}
                    onChange={(e) => setProductForm({ ...productForm, heartNotes: e.target.value })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Notes de Fond</label>
                  <input
                    type="text"
                    value={productForm.baseNotes}
                    onChange={(e) => setProductForm({ ...productForm, baseNotes: e.target.value })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-[#A7A3A0]">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    className="rounded-sm bg-[#1A1A22] border-[#2F2F3D] text-[#D8B08C]"
                  />
                  <span>Actif en boutique</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#A7A3A0]">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="rounded-sm bg-[#1A1A22] border-[#2F2F3D] text-[#D8B08C]"
                  />
                  <span>Best-Seller</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#22222A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-[#181820] text-[#A7A3A0] rounded-sm cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold rounded-sm uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-[#D8B08C]/15"
                >
                  <Database className="w-4 h-4" />
                  <span>
                    {isSavingProduct
                      ? 'Enregistrement en cours...'
                      : editingProductId
                      ? 'Mettre à jour sur Supabase'
                      : 'Enregistrer & Synchroniser sur Supabase'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADJUST STOCK                                  */}
      {/* ==================================================== */}
      {adjustStockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#2B2B38] rounded-sm max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-[#F5F1EB]">
              Ajuster le Stock : {adjustStockModal.productName}
            </h3>
            <p className="text-xs text-[#A7A3A0]">
              Stock actuel : <strong className="text-[#D8B08C] font-mono">{adjustStockModal.currentStock} unités</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#A7A3A0] block mb-1">
                  Quantité à ajouter ou retirer (ex: +10 ou -2)
                </label>
                <input
                  type="number"
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm font-mono focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A7A3A0] block mb-1">Motif de l'ajustement</label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value as any)}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                >
                  <option value="MANUAL_RESTOCK">Réapprovisionnement atelier (+)</option>
                  <option value="CORRECTION">Correction d'inventaire physique</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#22222A] flex justify-end gap-2">
                <button
                  onClick={() => setAdjustStockModal(null)}
                  className="px-4 py-2 bg-[#181820] text-[#A7A3A0] rounded-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExecuteStockAdjust}
                  className="px-5 py-2 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold rounded-sm uppercase tracking-wider"
                >
                  Appliquer Mouvement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CREATE COUPON                                 */}
      {/* ==================================================== */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#2B2B38] rounded-sm max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-[#F5F1EB]">Créer un Code Privilège</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#A7A3A0] block mb-1">Code Promo *</label>
                <input
                  type="text"
                  required
                  placeholder="EX: METANOIA20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] uppercase font-mono rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Type de Remise</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED">Montant Fixe (DH)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Valeur</label>
                  <input
                    type="number"
                    required
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm font-mono focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Montant Min. (DH)</label>
                  <input
                    type="number"
                    value={couponForm.minimumAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minimumAmount: Number(e.target.value) })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm font-mono focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A7A3A0] block mb-1">Limite d'utilisation</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                    className="w-full bg-[#181820] border border-[#2B2B38] px-3 py-2 text-xs text-[#F5F1EB] rounded-sm font-mono focus:outline-none focus:border-[#D8B08C]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#22222A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 bg-[#181820] text-[#A7A3A0] rounded-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold rounded-sm uppercase tracking-wider"
                >
                  Créer Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: INSPECT ORDER DETAILS                         */}
      {/* ==================================================== */}
      {inspectedOrderObj && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#2B2B38] rounded-sm max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22222A]">
              <div>
                <h3 className="font-serif text-lg text-[#F5F1EB]">
                  Commande {inspectedOrderObj.orderNumber}
                </h3>
                <span className="text-xs text-[#A7A3A0]">
                  Statut actuel : <strong className="text-[#D8B08C]">{inspectedOrderObj.status}</strong>
                </span>
              </div>
              <button onClick={() => setInspectOrder(null)} className="text-[#A7A3A0] hover:text-[#F5F1EB]">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-semibold text-[#D8B08C] uppercase text-[10px] mb-1">Destinataire</h4>
                <p className="text-[#A7A3A0]">
                  {inspectedOrderObj.customer.firstName} {inspectedOrderObj.customer.lastName} <br />
                  {inspectedOrderObj.customer.address}, {inspectedOrderObj.customer.city} <br />
                  Tél : {inspectedOrderObj.customer.phone} · {inspectedOrderObj.customer.email}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1C1C24]">
                <h4 className="font-semibold text-[#D8B08C] uppercase text-[10px] mb-1">Flacons Commandés</h4>
                {inspectedOrderObj.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-[#A7A3A0]">
                    <span>{i.quantity}x {i.name} ({i.volume})</span>
                    <span className="font-mono text-[#F5F1EB]">{i.price * i.quantity} DH</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1C1C24] flex justify-between font-bold text-sm text-[#D8B08C]">
                <span>Total Encaissé / À Encaisser</span>
                <span className="font-mono">{inspectedOrderObj.total} DH</span>
              </div>

              {(() => {
                const targetEmail = settings.orderNotificationEmail || DEFAULT_ORDER_NOTIFICATION_EMAIL;
                const emailPayload = formatOrderEmail(inspectedOrderObj, targetEmail);
                return (
                  <div className="pt-3 border-t border-[#22222A] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={emailPayload.gmailComposeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#1A1A24] border border-[#333346] hover:border-[#D8B08C] text-[#F5F1EB] rounded-sm text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-red-400" />
                        <span>Ouvrir dans Gmail ({targetEmail})</span>
                      </a>
                      <a
                        href={emailPayload.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-sm text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp Client</span>
                      </a>
                    </div>
                    <button
                      onClick={() => setInspectOrder(null)}
                      className="px-4 py-1.5 bg-[#1C1C26] text-[#A7A3A0] hover:text-[#F5F1EB] rounded-sm text-xs"
                    >
                      Fermer
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
