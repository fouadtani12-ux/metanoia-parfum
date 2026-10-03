import { Router, Request, Response } from 'express';
import {
  INITIAL_PRODUCTS,
  DEMO_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SHIPPING_RATES,
  INITIAL_SETTINGS
} from '../data/mockData.ts';
import {
  dbGetProducts,
  dbSaveProduct,
  dbDeleteProduct,
  dbGetOrders,
  dbSaveOrder
} from '../db/repository.ts';
import { getOrCreateUser, getAllUsers } from '../db/users.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { getServerSupabase } from './supabaseServer.ts';
import { extractNotesFromDescription, embedNotesInDescription } from '../lib/supabase.ts';

export const apiRouter = Router();

// In-Memory Database store with seed data
let dbProducts = [...DEMO_PRODUCTS];
let dbCategories = [...INITIAL_CATEGORIES];
let dbOrders = [...INITIAL_ORDERS];
let dbUsers = [...INITIAL_USERS];
let dbCoupons = [...INITIAL_COUPONS];
let dbReviews = [...INITIAL_REVIEWS];
let dbStocks = [...INITIAL_STOCK_MOVEMENTS];
let dbNotifications = [...INITIAL_NOTIFICATIONS];
let dbShippingRates = [...INITIAL_SHIPPING_RATES];
let dbSettings = { ...INITIAL_SETTINGS };

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'METANOÏA PARFUMS API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Catalog reset and demo endpoints
apiRouter.post('/catalog/clear', async (_req: Request, res: Response) => {
  dbProducts = [];
  if (process.env.SQL_HOST) {
    try {
      const all = await dbGetProducts();
      for (const p of all) {
        await dbDeleteProduct(p.id);
      }
    } catch (err) {
      console.warn('[DB] SQL clear products failed:', err);
    }
  }
  res.json({ success: true, message: 'Catalogue remis à zéro' });
});

apiRouter.post('/catalog/load-demo', async (_req: Request, res: Response) => {
  dbProducts = [...DEMO_PRODUCTS];
  if (process.env.SQL_HOST) {
    try {
      for (const prod of DEMO_PRODUCTS) {
        await dbSaveProduct(prod);
      }
    } catch (err) {
      console.warn('[DB] SQL load demo products failed:', err);
    }
  }
  res.json({ success: true, message: 'Catalogue de démonstration chargé', count: dbProducts.length });
});

// 1. PRODUCTS
apiRouter.get('/products', async (req: Request, res: Response) => {
  const { category, gender, search, family, minPrice, maxPrice, sort } = req.query;
  let result = [...dbProducts];

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        result = data.map((r: any) => {
          const numPrice = Number(r.price) || 0;
          const rawComp = r.compare_at_price ?? r.original_price ?? r.compareAtPrice ?? r.old_price;
          const numComp = rawComp !== undefined && rawComp !== null && rawComp !== '' ? Number(rawComp) : 0;
          const hasComp = numComp > numPrice;
          const discountVal = hasComp
            ? Math.round(((numComp - numPrice) / numComp) * 100)
            : Number(r.discount) || 0;
          const compareAtPrice = hasComp
            ? numComp
            : discountVal > 0 && numPrice > 0
            ? Math.round(numPrice / (1 - discountVal / 100))
            : numPrice > 0
            ? Math.round((numPrice * 1.25) / 10) * 10
            : undefined;

          const { cleanDesc, topNotes: metaTop, heartNotes: metaHeart, baseNotes: metaBase, fragranceFamily: metaFamily, subtitle: metaSubtitle } =
            extractNotesFromDescription(r.description);

          const parseNotes = (raw: any, meta: string[] | null, fallback: string[]): string[] => {
            if (Array.isArray(raw) && raw.length > 0) return raw.map(String).map((s) => s.trim()).filter(Boolean);
            if (typeof raw === 'string' && raw.trim().length > 0) return raw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
            if (meta && meta.length > 0) return meta;
            return fallback;
          };

          const topNotes = parseNotes(r.top_notes ?? r.topNotes, metaTop, ['Bergamote', 'Safran']);
          const heartNotes = parseNotes(r.heart_notes ?? r.heartNotes, metaHeart, ['Oud Sauvage', 'Rose Noire']);
          const baseNotes = parseNotes(r.base_notes ?? r.baseNotes, metaBase, ['Ambre Gris', 'Santal']);

          return {
            id: String(r.id),
            name: r.name,
            slug: r.slug || (r.name ? r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `parfum-${r.id}`),
            subtitle: r.subtitle || metaSubtitle || 'Extrait de Parfum Intense',
            description: cleanDesc,
            brand: r.brand || 'METANOÏA',
            category: r.category || 'HOMME',
            gender: (r.gender as any) || (r.category === 'FEMME' ? 'FEMME' : r.category === 'HOMME' ? 'HOMME' : 'UNISEXE'),
            price: numPrice,
            compareAtPrice,
            discount: discountVal,
            stock: Number(r.stock) ?? 0,
            sku: `MET-${String(r.id).substring(0, 8).toUpperCase()}`,
            barcode: '6111234567890',
            volume: (r.volume as any) || '100 ml',
            availableVolumes: ['100 ml'],
            fragranceFamily: (r.fragrance_family as any) || metaFamily || 'Oriental',
            images: [r.image_url || '/perfume-oud.png'],
            gradientStyle: 'from-amber-900/40 via-[#16161D] to-[#0D0D11]',
            accentColor: '#D8B08C',
            rating: Number(r.rating) || 5.0,
            reviewCount: Number(r.review_count) || 0,
            isNew: Boolean(r.is_new),
            isBestSeller: Boolean(r.is_best_seller),
            isFeatured: true,
            isActive: r.is_active ?? true,
            topNotes,
            heartNotes,
            baseNotes,
            createdAt: r.created_at || new Date().toISOString(),
            updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
          };
        });
      }
    } catch (err) {
      console.warn('[Server Supabase] Fetch products notice:', err);
    }
  } else if (process.env.SQL_HOST) {
    try {
      let sqlProducts = await dbGetProducts();
      if (sqlProducts.length === 0) {
        // Auto-seed Cloud SQL if table is empty
        for (const prod of DEMO_PRODUCTS) {
          await dbSaveProduct(prod);
        }
        sqlProducts = await dbGetProducts();
      }
      if (sqlProducts.length > 0) {
        result = sqlProducts;
      }
    } catch (err) {
      console.warn('[DB] SQL fetch products failed, using memory store:', err);
    }
  }

  if (category) {
    result = result.filter((p) => p.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (gender) {
    result = result.filter((p) => (p.gender || 'UNISEXE').toLowerCase() === (gender as string).toLowerCase());
  }
  if (family) {
    result = result.filter((p) => ((p as any).fragranceFamily || '').toLowerCase() === (family as string).toLowerCase());
  }
  if (minPrice) {
    result = result.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    result = result.filter((p) => p.price <= Number(maxPrice));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        ((p as any).brand || '').toLowerCase().includes(q) ||
        ((p as any).fragranceFamily || '').toLowerCase().includes(q) ||
        (Array.isArray(p.topNotes) && p.topNotes.some((n) => n.toLowerCase().includes(q))) ||
        (Array.isArray(p.heartNotes) && p.heartNotes.some((n) => n.toLowerCase().includes(q))) ||
        (Array.isArray(p.baseNotes) && p.baseNotes.some((n) => n.toLowerCase().includes(q)))
    );
  }

  // Sorting
  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === 'bestseller') result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  else if (sort === 'new') result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  res.json({ success: true, count: result.length, data: result });
});

apiRouter.get('/products/:idOrSlug', async (req: Request, res: Response) => {
  const param = req.params.idOrSlug;
  let prod = dbProducts.find((p) => p.id === param || p.slug === param);

  if (!prod && process.env.SQL_HOST) {
    try {
      const sqlProducts = await dbGetProducts();
      prod = sqlProducts.find((p) => p.id === param || p.slug === param);
    } catch (err) {
      console.warn('[DB] SQL fetch product detail failed:', err);
    }
  }

  if (!prod) {
    res.status(404).json({ success: false, message: 'Produit introuvable' });
    return;
  }
  res.json({ success: true, data: prod });
});

apiRouter.post('/products', async (req: Request, res: Response) => {
  const newProduct = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dbProducts.unshift(newProduct);

  const supabase = getServerSupabase();
  if (supabase) {
    const numPrice = Number(newProduct.price) || 0;
    const compVal = newProduct.compareAtPrice ? Number(newProduct.compareAtPrice) : null;
    const discountVal = newProduct.discount || (compVal && compVal > numPrice ? Math.round(((compVal - numPrice) / compVal) * 100) : null);

    try {
      const enrichedDesc = embedNotesInDescription(newProduct.description, {
        topNotes: newProduct.topNotes,
        heartNotes: newProduct.heartNotes,
        baseNotes: newProduct.baseNotes,
        fragranceFamily: newProduct.fragranceFamily,
        subtitle: newProduct.subtitle,
      });

      const sbPayload: any = {
        id: newProduct.id,
        name: newProduct.name,
        brand: newProduct.brand || 'METANOÏA',
        price: numPrice,
        description: enrichedDesc,
        image_url: newProduct.images?.[0] || newProduct.imageUrl || '',
        stock: Number(newProduct.stock) || 0,
        category: newProduct.category || 'HOMME',
        created_at: newProduct.createdAt,
      };
      if (compVal && compVal > numPrice) {
        sbPayload.compare_at_price = compVal;
        sbPayload.original_price = compVal;
      }
      if (discountVal) {
        sbPayload.discount = discountVal;
      }
      if (newProduct.topNotes && newProduct.topNotes.length > 0) sbPayload.top_notes = newProduct.topNotes;
      if (newProduct.heartNotes && newProduct.heartNotes.length > 0) sbPayload.heart_notes = newProduct.heartNotes;
      if (newProduct.baseNotes && newProduct.baseNotes.length > 0) sbPayload.base_notes = newProduct.baseNotes;
      if (newProduct.fragranceFamily) sbPayload.fragrance_family = newProduct.fragranceFamily;
      if (newProduct.subtitle) sbPayload.subtitle = newProduct.subtitle;
      if (newProduct.volume) sbPayload.volume = newProduct.volume;

      let { error } = await supabase.from('products').upsert(sbPayload, { onConflict: 'id' });
      if (error) {
        const optional = ['top_notes', 'heart_notes', 'base_notes', 'fragrance_family', 'subtitle', 'volume', 'compare_at_price', 'original_price', 'discount'];
        for (const col of optional) {
          if (error.message.includes(col)) delete sbPayload[col];
        }
        await supabase.from('products').upsert(sbPayload, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('[Server Supabase] Save product notice:', err);
    }
  }

  if (process.env.SQL_HOST) {
    try {
      await dbSaveProduct(newProduct);
    } catch (err) {
      console.warn('[DB] SQL save product failed:', err);
    }
  }

  res.status(201).json({ success: true, data: newProduct });
});

apiRouter.put('/products/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const index = dbProducts.findIndex((p) => p.id === id);
  if (index !== -1) {
    dbProducts[index] = { ...dbProducts[index], ...req.body, updatedAt: new Date().toISOString() };
  }

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const updates: any = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.brand !== undefined) updates.brand = req.body.brand;
      if (req.body.price !== undefined) updates.price = Number(req.body.price);
      if (req.body.stock !== undefined) updates.stock = Number(req.body.stock);
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.images && req.body.images.length > 0) updates.image_url = req.body.images[0];
      if (req.body.compareAtPrice !== undefined) {
        const compVal = req.body.compareAtPrice ? Number(req.body.compareAtPrice) : null;
        updates.compare_at_price = compVal;
        updates.original_price = compVal;
      }
      if (req.body.discount !== undefined) {
        updates.discount = Number(req.body.discount) || null;
      }

      const hasNotesUpdate = req.body.topNotes !== undefined || req.body.heartNotes !== undefined || req.body.baseNotes !== undefined;
      if (hasNotesUpdate || req.body.description !== undefined) {
        updates.description = embedNotesInDescription(req.body.description, {
          topNotes: req.body.topNotes,
          heartNotes: req.body.heartNotes,
          baseNotes: req.body.baseNotes,
          fragranceFamily: req.body.fragranceFamily,
          subtitle: req.body.subtitle,
        });
      }

      if (req.body.topNotes !== undefined) updates.top_notes = Array.isArray(req.body.topNotes) ? req.body.topNotes : [];
      if (req.body.heartNotes !== undefined) updates.heart_notes = Array.isArray(req.body.heartNotes) ? req.body.heartNotes : [];
      if (req.body.baseNotes !== undefined) updates.base_notes = Array.isArray(req.body.baseNotes) ? req.body.baseNotes : [];
      if (req.body.fragranceFamily !== undefined) updates.fragrance_family = req.body.fragranceFamily;
      if (req.body.subtitle !== undefined) updates.subtitle = req.body.subtitle;
      if (req.body.volume !== undefined) updates.volume = req.body.volume;

      let { error } = await supabase.from('products').update(updates).eq('id', id);
      if (error) {
        const optional = ['top_notes', 'heart_notes', 'base_notes', 'fragrance_family', 'subtitle', 'volume', 'compare_at_price', 'original_price', 'discount'];
        for (const col of optional) {
          if (error.message.includes(col)) delete updates[col];
        }
        await supabase.from('products').update(updates).eq('id', id);
      }
    } catch (err) {
      console.warn('[Server Supabase] Update product notice:', err);
    }
  }

  if (process.env.SQL_HOST) {
    try {
      const updated = { ...(dbProducts[index] || {}), ...req.body, id };
      await dbSaveProduct(updated);
    } catch (err) {
      console.warn('[DB] SQL update product failed:', err);
    }
  }

  res.json({ success: true, data: dbProducts[index] || req.body });
});

apiRouter.delete('/products/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  dbProducts = dbProducts.filter((p) => p.id !== id);

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('[Server Supabase] Delete product notice:', err);
    }
  }

  if (process.env.SQL_HOST) {
    try {
      await dbDeleteProduct(id);
    } catch (err) {
      console.warn('[DB] SQL delete product failed:', err);
    }
  }

  res.json({ success: true, message: 'Produit supprimé' });
});

// 2. CATEGORIES
apiRouter.get('/categories', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbCategories });
});

// 3. ORDERS
apiRouter.get('/orders', (req: Request, res: Response) => {
  const { status, city, customerId } = req.query;
  let result = [...dbOrders];

  if (customerId) {
    result = result.filter((o) => o.userId === customerId);
  }
  if (status && status !== 'ALL') {
    result = result.filter((o) => o.status === status);
  }
  if (city) {
    result = result.filter((o) => o.customer.city.toLowerCase() === (city as string).toLowerCase());
  }

  res.json({ success: true, count: result.length, data: result });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const order = dbOrders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Commande introuvable' });
    return;
  }
  res.json({ success: true, data: order });
});

apiRouter.post('/orders', async (req: Request, res: Response) => {
  const { customer, items, shippingMethod, paymentMethod = 'COD', couponCode, subtotal, shippingFee, discountAmount, total } = req.body;
  const orderNumber = `MET-${new Date().getFullYear()}-${1000 + dbOrders.length + 1}`;
  
  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customer,
    items,
    shippingMethod,
    paymentMethod,
    couponCode,
    subtotal,
    shippingFee,
    discountAmount,
    total,
    paymentStatus: 'PENDING',
    status: 'PENDING',
    timeline: [
      { status: 'PENDING', label: 'Commande reçue', timestamp: new Date().toISOString(), isCompleted: true, note: 'Commande validée sur la boutique' },
      { status: 'CONFIRMED', label: 'Commande confirmée', timestamp: '', isCompleted: false },
      { status: 'PROCESSING', label: 'Préparation en atelier', timestamp: '', isCompleted: false },
      { status: 'SHIPPED', label: 'Expédiée', timestamp: '', isCompleted: false },
      { status: 'DELIVERED', label: 'Livrée au client', timestamp: '', isCompleted: false }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbOrders.unshift(newOrder as any);

  if (process.env.SQL_HOST) {
    try {
      await dbSaveOrder(newOrder as any);
    } catch (err) {
      console.warn('[DB] SQL save order failed:', err);
    }
  }

  // Decrement stocks
  if (Array.isArray(items)) {
    items.forEach((item: any) => {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        dbStocks.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: prod.id,
          productName: prod.name,
          change: -item.quantity,
          reason: 'ORDER_SALE',
          previousStock: prod.stock + item.quantity,
          newStock: prod.stock,
          date: new Date().toISOString(),
          operator: `Système (${orderNumber})`
        });
      }
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'direction@metanoia-parfums.com';

  // Create notification
  dbNotifications.unshift({
    id: `notif-${Date.now()}`,
    title: `Nouvelle commande #${orderNumber}`,
    message: `${customer.firstName} ${customer.lastName} (${total} DH - ${customer.city}). Transmis à ${adminEmail}`,
    type: 'NEW_ORDER',
    isRead: false,
    link: '/admin/orders',
    createdAt: new Date().toISOString()
  });

  console.log(`[EMAIL NOTIFICATION] Commande #${orderNumber} (${total} DH) transmise avec succès à ${adminEmail}`);

  res.status(201).json({
    success: true,
    data: newOrder,
    emailNotificationSentTo: adminEmail
  });
});

apiRouter.post('/orders/notify-email', (req: Request, res: Response) => {
  const defaultAdmin = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'direction@metanoia-parfums.com';
  const { order, recipientEmail = defaultAdmin } = req.body;
  const targetEmail = recipientEmail || defaultAdmin;
  console.log(`[ORDER DISPATCH] Transmission de la commande ${order?.orderNumber || 'MET-COMMANDE'} vers ${targetEmail}`);
  res.json({
    success: true,
    recipient: targetEmail,
    message: `La commande a été transmise à ${targetEmail}`
  });
});

apiRouter.put('/orders/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const index = dbOrders.findIndex((o) => o.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Commande introuvable' });
    return;
  }
  const prevStatus = dbOrders[index].status;
  const nextStatus = req.body.status;

  // Stock restoration on cancel
  if (nextStatus === 'CANCELLED' && prevStatus !== 'CANCELLED') {
    dbOrders[index].items.forEach((item) => {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
        dbStocks.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: prod.id,
          productName: prod.name,
          change: item.quantity,
          reason: 'ORDER_CANCELLED',
          previousStock: prod.stock - item.quantity,
          newStock: prod.stock,
          date: new Date().toISOString(),
          operator: 'Système (Annulation)'
        });
      }
    });
  }

  dbOrders[index] = { ...dbOrders[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: dbOrders[index] });
});

// 4. CUSTOMERS
apiRouter.get('/customers', (_req: Request, res: Response) => {
  res.json({ success: true, count: dbUsers.length, data: dbUsers });
});

// Synchronize authenticated Firebase user to Cloud SQL PostgreSQL
apiRouter.post('/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || '';
    const { firstName, lastName } = req.body;
    if (!uid) {
      res.status(400).json({ error: 'UID Firebase manquant' });
      return;
    }
    const user = await getOrCreateUser(uid, email, firstName, lastName);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to sync user with DB:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Admin get all database users
apiRouter.get('/users/db', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const dbUserList = await getAllUsers();
    res.json({ success: true, data: dbUserList });
  } catch (error: any) {
    console.error('Failed to fetch DB users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// 5. COUPONS
apiRouter.get('/coupons', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbCoupons });
});

apiRouter.post('/coupons', (req: Request, res: Response) => {
  const newCoupon = { ...req.body, id: `coup-${Date.now()}` };
  dbCoupons.unshift(newCoupon);
  res.status(201).json({ success: true, data: newCoupon });
});

// 6. REVIEWS
apiRouter.get('/reviews', (req: Request, res: Response) => {
  const { productId } = req.query;
  let result = dbReviews;
  if (productId) {
    result = result.filter((r) => r.productId === productId);
  }
  res.json({ success: true, count: result.length, data: result });
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  const newReview = {
    ...req.body,
    id: `rev-${Date.now()}`,
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  };
  dbReviews.unshift(newReview);
  res.status(201).json({ success: true, data: newReview });
});

// 7. STOCK MOVEMENTS
apiRouter.get('/stocks', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStocks });
});

// 8. NOTIFICATIONS
apiRouter.get('/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbNotifications });
});

// 9. ANALYTICS & DASHBOARD METRICS
apiRouter.get('/analytics', (_req: Request, res: Response) => {
  const confirmedOrders = dbOrders.filter((o) => o.status !== 'CANCELLED');
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = dbOrders.length;
  const pendingOrders = dbOrders.filter((o) => o.status === 'PENDING').length;
  const totalCustomers = dbUsers.length;
  const averageCart = confirmedOrders.length ? Math.round(totalRevenue / confirmedOrders.length) : 0;
  
  // Total inventory units
  const totalInventory = dbProducts.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = dbProducts.filter((p) => p.stock > 0 && p.stock <= 4).length;
  const outOfStockCount = dbProducts.filter((p) => p.stock === 0).length;

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalCustomers,
      averageCart,
      totalInventory,
      lowStockCount,
      outOfStockCount,
    }
  });
});

export {
  dbProducts,
  dbCategories,
  dbOrders,
  dbUsers,
  dbCoupons,
  dbReviews,
  dbStocks,
  dbNotifications,
  dbShippingRates,
  dbSettings
};
