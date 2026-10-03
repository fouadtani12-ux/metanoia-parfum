import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Gender } from '../types';

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

const SUPABASE_STORAGE_KEY = 'metanoia_supabase_config_v2';

/**
 * Validates that the provided URL is a syntactically valid HTTP or HTTPS URL
 */
export function isValidSupabaseUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Validates that the provided key is non-empty and has reasonable key length
 */
export function isValidSupabaseKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed.length >= 10;
}

/**
 * Retrieve Supabase configuration from environment variables or admin localStorage fallback
 * Environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)
 */
export function getSupabaseConfig(): SupabaseConfig {
  const rawEnvUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const rawEnvKey =
    (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    '';

  const envUrl = isValidSupabaseUrl(rawEnvUrl) ? rawEnvUrl.trim() : '';
  const envKey = isValidSupabaseKey(rawEnvKey) ? rawEnvKey.trim() : '';

  // Check localStorage as admin override or local testing fallback
  try {
    const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const localUrl = isValidSupabaseUrl(parsed?.url) ? parsed.url.trim() : '';
      const localKey = isValidSupabaseKey(parsed?.publishableKey) ? parsed.publishableKey.trim() : '';

      return {
        url: envUrl || localUrl,
        publishableKey: envKey || localKey,
      };
    }
  } catch (e) {
    // Ignore error
  }

  return {
    url: envUrl,
    publishableKey: envKey,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
    // Clear cached client to force re-instantiation
    cachedClient = null;
    cachedUrl = '';
    cachedKey = '';
  } catch (e) {
    console.error('Failed to save Supabase config to localStorage', e);
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!isValidSupabaseUrl(config.url) || !isValidSupabaseKey(config.publishableKey)) {
    return null;
  }

  if (cachedClient && cachedUrl === config.url && cachedKey === config.publishableKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.publishableKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    cachedUrl = config.url;
    cachedKey = config.publishableKey;
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase] Client init notice:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(
    isValidSupabaseUrl(config.url) &&
    isValidSupabaseKey(config.publishableKey)
  );
}

/**
 * Extract embedded metadata from description if columns are absent in Supabase
 */
export function extractNotesFromDescription(desc?: string | null) {
  if (!desc || typeof desc !== 'string') {
    return { cleanDesc: '', topNotes: null, heartNotes: null, baseNotes: null, fragranceFamily: null, subtitle: null };
  }
  const match = desc.match(/<!--\s*METANOIA_DATA:(\{.*?\})\s*-->/);
  if (!match) {
    return { cleanDesc: desc, topNotes: null, heartNotes: null, baseNotes: null, fragranceFamily: null, subtitle: null };
  }
  try {
    const meta = JSON.parse(match[1]);
    const cleanDesc = desc.replace(match[0], '').trim();
    return {
      cleanDesc,
      topNotes: Array.isArray(meta.topNotes) && meta.topNotes.length > 0 ? meta.topNotes : null,
      heartNotes: Array.isArray(meta.heartNotes) && meta.heartNotes.length > 0 ? meta.heartNotes : null,
      baseNotes: Array.isArray(meta.baseNotes) && meta.baseNotes.length > 0 ? meta.baseNotes : null,
      fragranceFamily: meta.fragranceFamily || null,
      subtitle: meta.subtitle || null,
    };
  } catch {
    return { cleanDesc: desc, topNotes: null, heartNotes: null, baseNotes: null, fragranceFamily: null, subtitle: null };
  }
}

export function embedNotesInDescription(
  desc: string | undefined,
  meta: { topNotes?: string[]; heartNotes?: string[]; baseNotes?: string[]; fragranceFamily?: string; subtitle?: string }
): string {
  const clean = (desc || '').replace(/<!--\s*METANOIA_DATA:(\{.*?\})\s*-->/g, '').trim();
  const payload = {
    topNotes: meta.topNotes || [],
    heartNotes: meta.heartNotes || [],
    baseNotes: meta.baseNotes || [],
    fragranceFamily: meta.fragranceFamily || 'Oriental',
    subtitle: meta.subtitle || '',
  };
  return clean ? `${clean}\n\n<!-- METANOIA_DATA:${JSON.stringify(payload)} -->` : `<!-- METANOIA_DATA:${JSON.stringify(payload)} -->`;
}

/**
 * Mapper: Convert Supabase database row to application Product model
 */
export function rowToProduct(r: any): Product {
  const mainImg = r.image_url || (Array.isArray(r.images) && r.images[0]) || '/perfume-oud.png';
  const slug =
    r.slug ||
    (r.name
      ? r.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : `parfum-${r.id}`);

  // Extract and normalize gender and category reliably
  const rawCat = (r.category || '').toString().trim().toUpperCase();
  const rawGender = (r.gender || '').toString().trim().toUpperCase();
  const combined = `${rawGender} ${rawCat} ${(r.name || '')}`.toUpperCase();

  let gender: Gender = 'HOMME';
  if (
    rawGender.includes('FEMME') ||
    rawCat.includes('FEMME') ||
    rawGender.includes('WOMAN') ||
    rawCat.includes('WOMAN') ||
    rawGender === 'F' ||
    combined.includes('POUR FEMME') ||
    combined.includes('POUR ELLE')
  ) {
    gender = 'FEMME';
  } else if (
    rawGender.includes('UNISEX') ||
    rawCat.includes('UNISEX') ||
    rawGender.includes('MIXTE') ||
    rawCat.includes('MIXTE')
  ) {
    gender = 'UNISEXE';
  } else {
    gender = 'HOMME';
  }

  const numPrice = Number(r.price) || 0;
  const rawCompare = r.compare_at_price ?? r.original_price ?? r.compareAtPrice ?? r.old_price ?? r.originalPrice;
  const numCompare = rawCompare !== undefined && rawCompare !== null && rawCompare !== '' ? Number(rawCompare) : 0;
  const hasValidCompare = numCompare > numPrice;
  const discountVal = hasValidCompare
    ? Math.round(((numCompare - numPrice) / numCompare) * 100)
    : Number(r.discount) || 0;
  const compareAtPrice = hasValidCompare
    ? numCompare
    : discountVal > 0 && numPrice > 0
    ? Math.round(numPrice / (1 - discountVal / 100))
    : undefined;

  const { cleanDesc, topNotes: metaTop, heartNotes: metaHeart, baseNotes: metaBase, fragranceFamily: metaFamily, subtitle: metaSubtitle } =
    extractNotesFromDescription(r.description);

  const parseNotesField = (rawVal: any, metaFallback: string[] | null, defaultVal: string[]): string[] => {
    if (Array.isArray(rawVal) && rawVal.length > 0) {
      return rawVal.map(String).map((s) => s.trim()).filter(Boolean);
    }
    if (typeof rawVal === 'string' && rawVal.trim().length > 0) {
      return rawVal.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    }
    if (metaFallback && metaFallback.length > 0) {
      return metaFallback.map((s) => s.trim()).filter(Boolean);
    }
    return defaultVal;
  };

  const topNotes = parseNotesField(r.top_notes ?? r.topNotes, metaTop, ['Bergamote', 'Safran']);
  const heartNotes = parseNotesField(r.heart_notes ?? r.heartNotes, metaHeart, ['Oud Sauvage', 'Rose Noire']);
  const baseNotes = parseNotesField(r.base_notes ?? r.baseNotes, metaBase, ['Ambre Gris', 'Santal']);

  return {
    id: String(r.id),
    name: r.name || 'Parfum Metanoïa',
    slug,
    subtitle: r.subtitle || metaSubtitle || 'Extrait de Parfum Intense',
    description: cleanDesc,
    brand: r.brand || 'METANOÏA',
    category: gender,
    gender,
    price: numPrice,
    compareAtPrice,
    discount: discountVal,
    stock: Number(r.stock) ?? 0,
    sku: r.sku || `MET-${String(r.id).substring(0, 8).toUpperCase()}`,
    barcode: r.barcode || '6111234567890',
    volume: (r.volume as any) || '100 ml',
    availableVolumes: ['100 ml'],
    fragranceFamily: (r.fragrance_family as any) || (r.fragranceFamily as any) || metaFamily || 'Oriental',
    images: [mainImg],
    gradientStyle: 'from-amber-900/40 via-[#16161D] to-[#0D0D11]',
    accentColor: r.accent_color || r.accentColor || '#D8B08C',
    rating: Number(r.rating) || 5.0,
    reviewCount: Number(r.review_count) || 0,
    isNew: Boolean(r.is_new ?? r.isNew),
    isBestSeller: Boolean(r.is_best_seller ?? r.isBestSeller),
    isFeatured: true,
    isActive: r.is_active ?? true,
    topNotes,
    heartNotes,
    baseNotes,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
  };
}

/**
 * Test Supabase connection and verify products table exists
 */
export async function testSupabaseConnection(config?: SupabaseConfig): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  if (config) {
    if (!isValidSupabaseUrl(config.url)) {
      return {
        success: false,
        message: 'L’URL Supabase doit commencer par https:// (ex: https://votre-projet.supabase.co).',
      };
    }
    if (!isValidSupabaseKey(config.publishableKey)) {
      return {
        success: false,
        message: 'La clé publique Supabase (anon key) est requise.',
      };
    }
  }

  let clientToUse: SupabaseClient | null = null;
  try {
    clientToUse = config
      ? createClient(config.url.trim(), config.publishableKey.trim())
      : getSupabaseClient();
  } catch (err: any) {
    return {
      success: false,
      message: `Erreur de connexion : ${err?.message || 'URL invalide'}`,
    };
  }

  if (!clientToUse) {
    return {
      success: false,
      message: 'URL Supabase ou clé d’API publique manquante ou invalide.',
    };
  }

  try {
    const { data, error } = await clientToUse
      .from('products')
      .select('id, name')
      .limit(5);

    if (error) {
      if (
        error.code === '42P01' ||
        error.message.includes('relation "products" does not exist') ||
        error.message.includes('not found')
      ) {
        return {
          success: false,
          message:
            'Connecté à Supabase, mais la table "products" n’existe pas encore. Utilisez le script SQL fourni pour la créer.',
        };
      }
      return {
        success: false,
        message: `Erreur Supabase (${error.code || 'code'}): ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Connexion réussie ! (${data?.length ?? 0} parfums trouvés dans la table products)`,
      count: data?.length ?? 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Impossible de joindre le serveur Supabase.',
    };
  }
}

/**
 * Upload an image to Supabase Storage and retrieve its public URL
 */
export async function uploadProductImageToSupabase(
  imageData: string | File | Blob,
  fileName?: string
): Promise<string> {
  const client = getSupabaseClient();
  if (!client) {
    return typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
  }

  // If it's already an HTTP URL, no upload needed
  if (typeof imageData === 'string' && (imageData.startsWith('http://') || imageData.startsWith('https://'))) {
    return imageData;
  }

  const cleanName = fileName ? fileName.replace(/[^a-zA-Z0-9_-]/g, '') : `parfum-${Date.now()}`;
  const filePath = `${cleanName}-${Date.now()}.jpg`;
  const primaryBucket = 'product-images';
  const fallbackBucket = 'products';

  try {
    let blob: Blob;
    let contentType = 'image/jpeg';

    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          contentType = matches[1];
          const byteCharacters = atob(matches[2]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          blob = new Blob([new Uint8Array(byteNumbers)], { type: contentType });
        } else {
          return imageData;
        }
      } else {
        return imageData;
      }
    } else {
      blob = imageData;
      contentType = (imageData as any).type || 'image/jpeg';
    }

    // Attempt upload to primary bucket
    const { error: primaryError } = await client.storage
      .from(primaryBucket)
      .upload(filePath, blob, { contentType, upsert: true });

    if (!primaryError) {
      const { data: pubData } = client.storage.from(primaryBucket).getPublicUrl(filePath);
      return pubData.publicUrl;
    }

    // Fallback upload to secondary bucket
    console.warn(`[Supabase Storage] Bucket '${primaryBucket}' notice: ${primaryError.message}. Trying '${fallbackBucket}'...`);
    const { error: fallbackError } = await client.storage
      .from(fallbackBucket)
      .upload(filePath, blob, { contentType, upsert: true });

    if (!fallbackError) {
      const { data: pubData } = client.storage.from(fallbackBucket).getPublicUrl(filePath);
      return pubData.publicUrl;
    }

    console.warn('[Supabase Storage] Storage bucket upload fallback: using local image URL');
    return typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
  } catch (err) {
    console.error('[Supabase Storage] Error:', err);
    return typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
  }
}

/**
 * Delete an image from Supabase Storage bucket if it was uploaded there
 */
export async function deleteProductImageFromSupabase(imageUrl?: string): Promise<void> {
  if (!imageUrl) return;
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const primaryBucket = 'product-images';
    const fallbackBucket = 'products';

    let bucketName = '';
    let filePath = '';

    if (imageUrl.includes(`/storage/v1/object/public/${primaryBucket}/`)) {
      bucketName = primaryBucket;
      filePath = imageUrl.split(`/storage/v1/object/public/${primaryBucket}/`)[1];
    } else if (imageUrl.includes(`/storage/v1/object/public/${fallbackBucket}/`)) {
      bucketName = fallbackBucket;
      filePath = imageUrl.split(`/storage/v1/object/public/${fallbackBucket}/`)[1];
    }

    if (bucketName && filePath) {
      const decodedPath = decodeURIComponent(filePath);
      const { error } = await client.storage.from(bucketName).remove([decodedPath]);
      if (error) {
        console.warn(`[Supabase Storage] Notice deleting ${decodedPath}:`, error.message);
      } else {
        console.log(`[Supabase Storage] Successfully deleted image ${decodedPath} from ${bucketName}`);
      }
    }
  } catch (err) {
    console.warn('[Supabase Storage] Error during image deletion:', err);
  }
}

/**
 * Fetch all products from Supabase products table
 * Table schema:
 * - id
 * - name
 * - brand
 * - price
 * - description
 * - image_url
 * - stock
 * - category
 * - created_at
 */
export async function fetchProductsFromSupabase(): Promise<Product[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[Supabase] Fetch products error:', error);
      return [];
    }

    return data.map((r: any) => rowToProduct(r));
  } catch (err) {
    console.warn('[Supabase] Fetch exception:', err);
    return [];
  }
}

/**
 * Persist product in Supabase using the exact requested table schema:
 * - id
 * - name
 * - brand
 * - price
 * - description
 * - image_url
 * - stock
 * - category
 * - created_at
 */
export async function saveProductToSupabase(product: Product): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase n’est pas configuré. Veuillez renseigner VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const imageUrl = product.images?.[0] || (product as any).imageUrl || (product as any).image_url || '';

  // Determine exact gender (HOMME, FEMME, UNISEXE)
  const gRaw = (product.gender || product.category || 'HOMME').toUpperCase();
  const resolvedCategory: Gender = gRaw.includes('FEMME')
    ? 'FEMME'
    : gRaw.includes('UNISEX')
    ? 'UNISEXE'
    : 'HOMME';

  const numPrice = Number(product.price) || 0;
  const numCompare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const numDiscount = product.discount || (numCompare && numCompare > numPrice ? Math.round(((numCompare - numPrice) / numCompare) * 100) : null);

  // Embed notes safely in description so persistence works even if database schema lacks custom columns
  const enrichedDescription = embedNotesInDescription(product.description, {
    topNotes: product.topNotes,
    heartNotes: product.heartNotes,
    baseNotes: product.baseNotes,
    fragranceFamily: product.fragranceFamily,
    subtitle: product.subtitle,
  });

  const payload: Record<string, any> = {
    id: product.id,
    name: product.name,
    brand: product.brand || 'METANOÏA',
    price: numPrice,
    description: enrichedDescription,
    image_url: imageUrl,
    stock: Number(product.stock) || 0,
    category: resolvedCategory,
    created_at: product.createdAt || new Date().toISOString(),
  };

  if (numCompare && numCompare > numPrice) {
    payload.compare_at_price = numCompare;
    payload.original_price = numCompare;
  }
  if (numDiscount) {
    payload.discount = numDiscount;
  }

  // Also write to dedicated columns if available
  if (product.topNotes && product.topNotes.length > 0) {
    payload.top_notes = product.topNotes;
  }
  if (product.heartNotes && product.heartNotes.length > 0) {
    payload.heart_notes = product.heartNotes;
  }
  if (product.baseNotes && product.baseNotes.length > 0) {
    payload.base_notes = product.baseNotes;
  }
  if (product.fragranceFamily) {
    payload.fragrance_family = product.fragranceFamily;
  }
  if (product.subtitle) {
    payload.subtitle = product.subtitle;
  }
  if (product.volume) {
    payload.volume = product.volume;
  }

  let { error } = await client.from('products').upsert(payload, { onConflict: 'id' });

  // Graceful retry if Supabase table is missing optional columns
  if (error) {
    console.warn('[Supabase] Initial save notice:', error.message, '- Retrying with baseline schema...');
    const optionalColumns = ['top_notes', 'heart_notes', 'base_notes', 'fragrance_family', 'subtitle', 'volume', 'compare_at_price', 'original_price', 'discount'];
    for (const col of optionalColumns) {
      delete payload[col];
    }
    const retry = await client.from('products').upsert(payload, { onConflict: 'id' });
    error = retry.error;
  }

  if (error) {
    console.error('[Supabase] Save product error:', error);
    throw error;
  }
}

/**
 * Update an existing product in Supabase
 */
export async function updateProductInSupabase(id: string, updates: Partial<Product>): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const payload: Record<string, any> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.brand !== undefined) payload.brand = updates.brand;
  if (updates.price !== undefined) payload.price = Number(updates.price);
  if (updates.stock !== undefined) payload.stock = Number(updates.stock);
  if (updates.gender !== undefined || updates.category !== undefined) {
    const gRaw = ((updates.gender || updates.category || 'HOMME') as string).toUpperCase();
    payload.category = gRaw.includes('FEMME') ? 'FEMME' : gRaw.includes('UNISEX') ? 'UNISEXE' : 'HOMME';
  }
  if (updates.images && updates.images.length > 0) payload.image_url = updates.images[0];

  if (updates.compareAtPrice !== undefined) {
    const compVal = updates.compareAtPrice ? Number(updates.compareAtPrice) : null;
    payload.compare_at_price = compVal;
    payload.original_price = compVal;
  }
  if (updates.discount !== undefined) {
    payload.discount = Number(updates.discount) || null;
  }

  // Always embed notes in description so updates persist regardless of schema
  if (
    updates.topNotes !== undefined ||
    updates.heartNotes !== undefined ||
    updates.baseNotes !== undefined ||
    updates.description !== undefined ||
    updates.fragranceFamily !== undefined ||
    updates.subtitle !== undefined
  ) {
    payload.description = embedNotesInDescription(updates.description, {
      topNotes: updates.topNotes,
      heartNotes: updates.heartNotes,
      baseNotes: updates.baseNotes,
      fragranceFamily: updates.fragranceFamily,
      subtitle: updates.subtitle,
    });
  }

  if (updates.topNotes !== undefined) {
    payload.top_notes = Array.isArray(updates.topNotes) ? updates.topNotes : [];
  }
  if (updates.heartNotes !== undefined) {
    payload.heart_notes = Array.isArray(updates.heartNotes) ? updates.heartNotes : [];
  }
  if (updates.baseNotes !== undefined) {
    payload.base_notes = Array.isArray(updates.baseNotes) ? updates.baseNotes : [];
  }
  if (updates.fragranceFamily !== undefined) {
    payload.fragrance_family = updates.fragranceFamily;
  }
  if (updates.subtitle !== undefined) {
    payload.subtitle = updates.subtitle;
  }
  if (updates.volume !== undefined) {
    payload.volume = updates.volume;
  }

  let { error } = await client.from('products').update(payload).eq('id', id);

  if (error) {
    console.warn('[Supabase] Initial update notice:', error.message, '- Retrying with baseline schema...');
    const optionalColumns = ['top_notes', 'heart_notes', 'base_notes', 'fragrance_family', 'subtitle', 'volume', 'compare_at_price', 'original_price', 'discount'];
    for (const col of optionalColumns) {
      delete payload[col];
    }
    const retry = await client.from('products').update(payload).eq('id', id);
    error = retry.error;
  }

  if (error) {
    console.error('[Supabase] Update product error:', error);
    throw error;
  }
}

/**
 * Delete product from Supabase
 */
export async function deleteProductFromSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('products').delete().eq('id', id);
  if (error) {
    console.error('[Supabase] Delete product error:', error);
    throw error;
  }
}

export interface SupabaseRealtimeCallbacks {
  onInsert?: (newProduct: Product) => void;
  onUpdate?: (updatedProduct: Product) => void;
  onDelete?: (deletedId: string) => void;
  onSyncAll?: (products: Product[]) => void;
}

/**
 * Subscribe to realtime Supabase changes on the 'products' table.
 * Emits fine-grained events (INSERT, UPDATE, DELETE) and auto-syncs on reconnection.
 */
export function subscribeToSupabaseProducts(
  callbacks: SupabaseRealtimeCallbacks | ((products: Product[]) => void)
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const handleSyncAll = async () => {
    try {
      const prods = await fetchProductsFromSupabase();
      if (typeof callbacks === 'function') {
        callbacks(prods);
      } else if (callbacks.onSyncAll) {
        callbacks.onSyncAll(prods);
      }
    } catch (e) {
      console.warn('[Supabase Realtime] syncAll notice:', e);
    }
  };

  const channel = client
    .channel('metanoia-products-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      async (payload: any) => {
        console.log('[Supabase Realtime] Event:', payload.eventType, payload);

        if (typeof callbacks === 'object') {
          if (payload.eventType === 'INSERT' && payload.new) {
            const product = rowToProduct(payload.new);
            callbacks.onInsert?.(product);
            return;
          }
          if (payload.eventType === 'UPDATE' && payload.new) {
            const product = rowToProduct(payload.new);
            callbacks.onUpdate?.(product);
            return;
          }
          if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = String(payload.old.id);
            callbacks.onDelete?.(deletedId);
            return;
          }
        }

        // Fallback: sync the full collection
        await handleSyncAll();
      }
    )
    .subscribe((status) => {
      console.log('[Supabase Realtime] Channel status:', status);
      if (status === 'SUBSCRIBED') {
        // Sync full collection on initial connection / reconnection
        handleSyncAll();
      }
    });

  return () => {
    try {
      client.removeChannel(channel);
    } catch (e) {
      // Ignore
    }
  };
}

/**
 * Complete, ready-to-run SQL script for Supabase SQL Editor
 * Includes replica identity full and publication check for Realtime!
 */
export const SUPABASE_SQL_SETUP_SCRIPT = `-- ========================================================
-- METANOÏA PARFUMS - Script SQL d'initialisation pour Supabase
-- Exécutez ce script dans : Supabase Console -> SQL Editor -> New Query
-- ========================================================

-- 1. Table products avec les colonnes exactes requises (avec gestion des prix barrés et pyramide olfactive)
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text default 'METANOÏA',
  price numeric not null,
  compare_at_price numeric,
  original_price numeric,
  discount numeric,
  description text not null,
  image_url text,
  stock integer default 0,
  category text not null,
  top_notes text[],
  heart_notes text[],
  base_notes text[],
  fragrance_family text default 'Oriental',
  subtitle text,
  volume text default '100 ml',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Si votre table existe déjà, ajoutez simplement ces colonnes :
alter table public.products add column if not exists compare_at_price numeric;
alter table public.products add column if not exists original_price numeric;
alter table public.products add column if not exists discount numeric;
alter table public.products add column if not exists top_notes text[];
alter table public.products add column if not exists heart_notes text[];
alter table public.products add column if not exists base_notes text[];
alter table public.products add column if not exists fragrance_family text;
alter table public.products add column if not exists subtitle text;
alter table public.products add column if not exists volume text;

-- 2. Configuration indispensable pour Supabase Realtime (INSERT, UPDATE, DELETE)
alter table public.products replica identity full;

-- 3. Activation de Row Level Security (RLS)
alter table public.products enable row level security;

-- 4. Politiques d'accès pour les visiteurs et l'administration
drop policy if exists "Lecture publique des parfums" on public.products;
create policy "Lecture publique des parfums"
  on public.products for select
  using (true);

drop policy if exists "Insertion publique des parfums" on public.products;
create policy "Insertion publique des parfums"
  on public.products for insert
  with check (true);

drop policy if exists "Modification publique des parfums" on public.products;
create policy "Modification publique des parfums"
  on public.products for update
  using (true);

drop policy if exists "Suppression publique des parfums" on public.products;
create policy "Suppression publique des parfums"
  on public.products for delete
  using (true);

-- 5. Activer le Realtime sur la table products
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end $$;

-- 6. Création du bucket de stockage d'images pour les parfums
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 7. Politiques de stockage
drop policy if exists "Lecture publique des photos" on storage.objects;
create policy "Lecture publique des photos"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Upload public des photos" on storage.objects;
create policy "Upload public des photos"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

drop policy if exists "Suppression publique des photos" on storage.objects;
create policy "Suppression publique des photos"
  on storage.objects for delete
  using (bucket_id = 'product-images');
`;
