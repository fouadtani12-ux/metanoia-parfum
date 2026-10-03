import { pgTable, serial, text, integer, boolean, doublePrecision, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: text('role').default('CUSTOMER').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  subtitle: text('subtitle'),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  originalPrice: integer('original_price'),
  category: text('category').notNull(),
  gender: text('gender').default('UNISEXE'),
  volume: text('volume').default('100 ml').notNull(),
  stock: integer('stock').default(0).notNull(),
  images: jsonb('images').$type<string[]>().notNull(),
  rating: doublePrecision('rating').default(5.0),
  reviewCount: integer('review_count').default(0),
  isNew: boolean('is_new').default(false),
  isBestSeller: boolean('is_best_seller').default(false),
  isActive: boolean('is_active').default(true),
  topNotes: jsonb('top_notes').$type<string[]>(),
  heartNotes: jsonb('heart_notes').$type<string[]>(),
  baseNotes: jsonb('base_notes').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id'),
  customer: jsonb('customer').notNull(),
  items: jsonb('items').notNull(),
  subtotal: integer('subtotal').notNull(),
  shippingFee: integer('shipping_fee').default(0).notNull(),
  shippingMethod: text('shipping_method').default('STANDARD').notNull(),
  discountAmount: integer('discount_amount').default(0).notNull(),
  couponCode: text('coupon_code'),
  total: integer('total').notNull(),
  paymentMethod: text('payment_method').default('COD').notNull(),
  paymentStatus: text('payment_status').default('PENDING').notNull(),
  status: text('status').default('PENDING').notNull(),
  deliverySecurityPin: text('delivery_security_pin'),
  timeline: jsonb('timeline'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(),
  minOrderAmount: integer('min_order_amount').default(0),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  isActive: boolean('is_active').default(true),
  expiresAt: text('expires_at'),
});

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  author: text('author').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  date: text('date').notNull(),
  verified: boolean('verified').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const storeSettings = pgTable('store_settings', {
  id: text('id').primaryKey().default('settings'),
  storeName: text('store_name'),
  currency: text('currency').default('MAD'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  orderNotificationEmail: text('order_notification_email'),
  address: text('address'),
  standardShippingFee: integer('standard_shipping_fee').default(35),
  expressShippingFee: integer('express_shipping_fee').default(60),
  freeShippingThreshold: integer('free_shipping_threshold').default(500),
});
