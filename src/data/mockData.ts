import { Product, Category, User, Order, Coupon, Review, StockMovement, Notification, ShippingRate, StoreSettings, AdminAuditLog } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "METANOÏA PARFUMS",
  tagline: "Une signature olfactive qui vous ressemble.",
  logoText: "METANOÏA",
  email: "contact@metanoia-parfums.com",
  orderNotificationEmail: "contact@metanoia-parfums.com",
  phone: "+212 6 00 00 00 00",
  whatsapp: "+212 6 00 00 00 00",
  address: "Boulevard Mohamed VI, Hivernage",
  city: "Marrakech",
  country: "Maroc",
  instagram: "@metanoia.parfums",
  facebook: "metanoiaparfums",
  tiktok: "@metanoiaparfums",
  freeShippingThreshold: 500,
  defaultShippingFee: 40,
  currency: "DH",
  salesTaxPercentage: 0,
  termsAndConditions: "Toutes nos fragrances sont des créations originales de haute parfumerie...",
  returnPolicy: "Retours acceptés sous 14 jours pour les flacons non ouverts et scellés."
};

export const INITIAL_SHIPPING_RATES: ShippingRate[] = [
  { id: 'sr-1', city: 'Marrakech', standardFee: 25, expressFee: 45, estimatedDays: '24h - 48h' },
  { id: 'sr-2', city: 'Casablanca', standardFee: 35, expressFee: 55, estimatedDays: '24h - 48h' },
  { id: 'sr-3', city: 'Rabat', standardFee: 35, expressFee: 55, estimatedDays: '24h - 48h' },
  { id: 'sr-4', city: 'Tanger', standardFee: 40, expressFee: 65, estimatedDays: '48h - 72h' },
  { id: 'sr-5', city: 'Agadir', standardFee: 40, expressFee: 65, estimatedDays: '48h - 72h' },
  { id: 'sr-6', city: 'Fès', standardFee: 40, expressFee: 60, estimatedDays: '48h - 72h' },
  { id: 'sr-7', city: 'Meknès', standardFee: 40, expressFee: 60, estimatedDays: '48h - 72h' },
  { id: 'sr-8', city: 'Autres villes du Maroc', standardFee: 50, expressFee: 75, estimatedDays: '48h - 96h' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'HOMME', slug: 'homme', description: 'Accords boisés profonds, cuirs texturés et épices nobles pour hommes audacieux.', gender: 'HOMME', count: 0 },
  { id: 'cat-2', name: 'FEMME', slug: 'femme', description: 'Bouquets floraux précieux, vanilles veloutées et sillages solaires d’exception.', gender: 'FEMME', count: 0 },
  { id: 'cat-3', name: 'UNISEXE', slug: 'unisexe', description: 'Alchimies olfactives libres au-delà du genre, ambrées et captivantes.', gender: 'UNISEXE', count: 0 },
  { id: 'cat-4', name: 'NOUVEAUTÉS', slug: 'nouveautes', description: 'Les dernières extraits de parfum nés de nos ateliers de création.', count: 0 },
  { id: 'cat-5', name: 'BEST-SELLERS', slug: 'best-sellers', description: 'Les icônes plébiscitées de la maison Metanoïa Parfums.', count: 0 },
  { id: 'cat-6', name: 'OFFRES', slug: 'offres', description: 'Privilèges et sélections exclusives à durée limitée.', count: 0 }
];

// Catalogue de parfums de haute création Metanoïa Parfums (Vierge par défaut)
export const DEMO_PRODUCTS: Product[] = [];
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    firstName: 'Direction',
    lastName: 'Générale',
    email: 'admin@metanoia.com',
    phone: '+212 6 00 00 00 00',
    role: 'ADMIN',
    password: 'Admin2026!',
    isTwoFactorEnabled: true,
    twoFactorMethod: 'WHATSAPP',
    failedLoginAttempts: 0,
    sessions: [
      {
        id: 'sess-admin-1',
        device: 'MacBook Pro · Safari macOS',
        ip: '196.12.180.45 (Maroc)',
        city: 'Marrakech',
        lastActive: 'À l’instant',
        isCurrent: true,
      }
    ],
    securityLogs: [
      {
        id: 'sec-adm-1',
        action: 'Connexion sécurisée réussie (2FA validé)',
        timestamp: '2026-09-26T04:15:00Z',
        ip: '196.12.180.45',
        device: 'Safari / macOS',
        status: 'SUCCESS'
      },
      {
        id: 'sec-adm-2',
        action: 'Contrôle d’intégrité des stocks & commandes',
        timestamp: '2026-09-25T19:00:00Z',
        ip: '196.12.180.45',
        device: 'Safari / macOS',
        status: 'SUCCESS'
      }
    ],
    addresses: [],
    totalOrders: 0,
    totalSpent: 0,
    createdAt: '2026-01-01T08:00:00Z',
    lastLogin: '2026-09-26T04:15:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'audit-1',
    adminEmail: 'admin@metanoia.com',
    action: 'SESSION_AUTH',
    target: 'Portail Atelier Admin',
    details: 'Initialisation de la boutique sécurisée METANOÏA PARFUMS',
    ip: '196.12.180.45',
    timestamp: '2026-09-27T08:00:00Z',
    severity: 'INFO'
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'METANOIA10',
    type: 'PERCENTAGE',
    value: 10,
    minimumAmount: 300,
    maximumDiscount: 200,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    usageLimit: 500,
    usageCount: 0,
    isActive: true
  },
  {
    id: 'coup-2',
    code: 'BIENVENUE20',
    type: 'PERCENTAGE',
    value: 20,
    minimumAmount: 500,
    maximumDiscount: 300,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    usageLimit: 200,
    usageCount: 0,
    isActive: true
  }
];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

