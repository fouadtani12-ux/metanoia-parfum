export type Gender = 'HOMME' | 'FEMME' | 'UNISEXE';
export type FragranceFamily = 'Oriental' | 'Boisé' | 'Floral' | 'Gourmand' | 'Frais' | 'Ambré' | 'Cuiré';
export type Volume = '30 ml' | '50 ml' | '75 ml' | '100 ml';

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  brand: string;
  category: string;
  gender: Gender;
  price: number;
  compareAtPrice?: number;
  discount?: number;
  stock: number;
  sku: string;
  barcode: string;
  volume: Volume;
  availableVolumes: Volume[];
  fragranceFamily: FragranceFamily;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  images: string[];
  gradientStyle: string; // Luxury flacon visual theme
  accentColor: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  gender?: Gender;
  count: number;
  image?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentMethod = 'COD' | 'ONLINE' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  volume: Volume;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  notes?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
  isCompleted: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: ShippingAddress;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  shippingMethod: 'STANDARD' | 'EXPRESS';
  discountAmount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  deliverySecurityPin?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type Role = 'CUSTOMER' | 'ADMIN';

export interface UserSession {
  id: string;
  device: string;
  ip: string;
  city: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserSecurityLog {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  ip: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  password?: string;
  isTwoFactorEnabled?: boolean;
  twoFactorMethod?: 'WHATSAPP' | 'SMS' | 'EMAIL';
  deliverySecurityPin?: string;
  failedLoginAttempts?: number;
  lockUntil?: string;
  sessions?: UserSession[];
  securityLogs?: UserSecurityLog[];
  addresses?: ShippingAddress[];
  savedFavorites?: string[]; // product IDs
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  lastLogin?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // e.g. 10 for 10% or 50 for 50 DH
  minimumAmount: number;
  maximumDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  change: number; // positive or negative
  reason: 'INITIAL' | 'ORDER_SALE' | 'ORDER_CANCELLED' | 'MANUAL_RESTOCK' | 'CORRECTION';
  previousStock: number;
  newStock: number;
  date: string;
  operator?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'NEW_ORDER' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NEW_USER' | 'NEW_REVIEW' | 'ORDER_CANCELLED';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ShippingRate {
  id: string;
  city: string;
  standardFee: number;
  expressFee: number;
  estimatedDays: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoText: string;
  email: string;
  orderNotificationEmail?: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  country: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  currency: string;
  salesTaxPercentage: number;
  termsAndConditions: string;
  returnPolicy: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  volume: Volume;
  quantity: number;
  price: number;
}
