import { db } from './index.ts';
import { products, orders, coupons, reviews } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import type { Product, Order, Coupon, Review, Volume, FragranceFamily } from '../types/index.ts';

// -------------------------------------------------------------
// Products Repository
// -------------------------------------------------------------
export async function dbGetProducts(): Promise<Product[]> {
  try {
    const rows = await db.select().from(products).orderBy(desc(products.createdAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      subtitle: r.subtitle || undefined,
      description: r.description,
      brand: 'METANOÏA',
      category: r.category,
      gender: (r.gender as any) || 'UNISEXE',
      price: r.price,
      compareAtPrice: r.originalPrice && r.originalPrice > r.price
        ? r.originalPrice
        : Math.round((r.price * 1.25) / 10) * 10,
      discount: r.originalPrice && r.originalPrice > r.price
        ? Math.round(((r.originalPrice - r.price) / r.originalPrice) * 100)
        : 20,
      stock: r.stock,
      sku: `MET-${r.id.substring(0, 8).toUpperCase()}`,
      barcode: '6111234567890',
      volume: (r.volume as Volume) || '100 ml',
      availableVolumes: ['100 ml'] as Volume[],
      fragranceFamily: 'Oriental' as FragranceFamily,
      images: (r.images as string[]) || [],
      gradientStyle: 'from-amber-900/40 via-[#16161D] to-[#0D0D11]',
      accentColor: '#D8B08C',
      rating: r.rating || 5.0,
      reviewCount: r.reviewCount || 0,
      isNew: r.isNew || false,
      isBestSeller: r.isBestSeller || false,
      isFeatured: true,
      isActive: r.isActive ?? true,
      topNotes: (r.topNotes as string[]) || [],
      heartNotes: (r.heartNotes as string[]) || [],
      baseNotes: (r.baseNotes as string[]) || [],
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('[DB] dbGetProducts error:', error);
    throw new Error('Impossible de récupérer les parfums depuis la base de données.', { cause: error });
  }
}

export async function dbSaveProduct(product: Product): Promise<Product> {
  try {
    await db
      .insert(products)
      .values({
        id: product.id,
        name: product.name,
        slug: product.slug,
        subtitle: product.subtitle,
        description: product.description,
        price: product.price,
        originalPrice: product.compareAtPrice,
        category: product.category,
        gender: product.gender || 'UNISEXE',
        volume: product.volume,
        stock: product.stock,
        images: product.images,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isNew: product.isNew,
        isBestSeller: product.isBestSeller,
        isActive: product.isActive,
        topNotes: product.topNotes,
        heartNotes: product.heartNotes,
        baseNotes: product.baseNotes,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          name: product.name,
          slug: product.slug,
          subtitle: product.subtitle,
          description: product.description,
          price: product.price,
          originalPrice: product.compareAtPrice,
          category: product.category,
          gender: product.gender || 'UNISEXE',
          volume: product.volume,
          stock: product.stock,
          images: product.images,
          rating: product.rating,
          reviewCount: product.reviewCount,
          isNew: product.isNew,
          isBestSeller: product.isBestSeller,
          isActive: product.isActive,
          topNotes: product.topNotes,
          heartNotes: product.heartNotes,
          baseNotes: product.baseNotes,
        },
      });

    return product;
  } catch (error) {
    console.error('[DB] dbSaveProduct error:', error);
    throw new Error("Impossible d'enregistrer le produit en base de données.", { cause: error });
  }
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  try {
    await db.delete(products).where(eq(products.id, id));
    return true;
  } catch (error) {
    console.error('[DB] dbDeleteProduct error:', error);
    throw new Error('Impossible de supprimer le produit.', { cause: error });
  }
}

// -------------------------------------------------------------
// Orders Repository
// -------------------------------------------------------------
export async function dbGetOrders(): Promise<Order[]> {
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return rows.map((r) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      userId: r.userId || undefined,
      customer: r.customer as any,
      items: r.items as any,
      subtotal: r.subtotal,
      shippingFee: r.shippingFee,
      shippingMethod: r.shippingMethod as any,
      discountAmount: r.discountAmount,
      couponCode: r.couponCode || undefined,
      total: r.total,
      paymentMethod: r.paymentMethod as any,
      paymentStatus: r.paymentStatus as any,
      status: r.status as any,
      deliverySecurityPin: r.deliverySecurityPin || undefined,
      timeline: (r.timeline as any) || [],
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('[DB] dbGetOrders error:', error);
    throw new Error('Impossible de récupérer les commandes.', { cause: error });
  }
}

export async function dbSaveOrder(order: Order): Promise<Order> {
  try {
    await db
      .insert(orders)
      .values({
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        shippingMethod: order.shippingMethod,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        deliverySecurityPin: order.deliverySecurityPin,
        timeline: order.timeline,
      })
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          paymentStatus: order.paymentStatus,
          status: order.status,
          timeline: order.timeline,
          updatedAt: new Date(),
        },
      });

    return order;
  } catch (error) {
    console.error('[DB] dbSaveOrder error:', error);
    throw new Error("Impossible d'enregistrer la commande en base de données.", { cause: error });
  }
}

// -------------------------------------------------------------
// Coupons Repository
// -------------------------------------------------------------
export async function dbGetCoupons(): Promise<Coupon[]> {
  try {
    const rows = await db.select().from(coupons);
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      type: (r.discountType as any) || 'PERCENTAGE',
      value: r.discountValue,
      minimumAmount: r.minOrderAmount || 0,
      startDate: new Date().toISOString(),
      endDate: r.expiresAt || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      usageLimit: r.usageLimit || 100,
      usageCount: r.usageCount || 0,
      isActive: r.isActive ?? true,
    }));
  } catch (error) {
    console.error('[DB] dbGetCoupons error:', error);
    throw new Error('Impossible de récupérer les coupons.', { cause: error });
  }
}

// -------------------------------------------------------------
// Reviews Repository
// -------------------------------------------------------------
export async function dbGetReviews(): Promise<Review[]> {
  try {
    const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    return rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: 'Création Metanoïa',
      userName: r.author,
      rating: r.rating,
      comment: r.comment,
      status: 'APPROVED',
      verifiedPurchase: r.verified ?? true,
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('[DB] dbGetReviews error:', error);
    throw new Error('Impossible de récupérer les avis.', { cause: error });
  }
}

export async function dbSaveReview(review: Review): Promise<Review> {
  try {
    await db.insert(reviews).values({
      id: review.id,
      productId: review.productId,
      author: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: new Date().toISOString().split('T')[0],
      verified: review.verifiedPurchase,
    });
    return review;
  } catch (error) {
    console.error('[DB] dbSaveReview error:', error);
    throw new Error("Impossible d'enregistrer l'avis.", { cause: error });
  }
}
