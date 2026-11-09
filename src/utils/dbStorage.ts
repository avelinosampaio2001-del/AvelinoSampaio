/**
 * Persistent IndexedDB and LocalStorage storage engine for Quieto Angola.
 * 
 * Solves the browser localStorage 5MB quota limitation completely by using
 * IndexedDB (which has 50MB - 1GB+ capacity), ensuring all uploaded product photos,
 * price modifications, orders, and banner slides survive browser refresh (F5).
 */

import { Product, OrderRecord, BannerSlide, GalleryItem } from '../types';

const DB_NAME = 'quieto_angola_db_v2';
const DB_VERSION = 2;
const STORE_NAME = 'quieto_app_store';

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open or initialize the IndexedDB database
 */
export function openQuietoDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB is not supported in this environment');
      reject(new Error('IndexedDB not supported'));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(dbInstance);
      };

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onblocked = () => {
        console.warn('IndexedDB open blocked by existing connection');
      };
    } catch (e) {
      reject(e);
    }
  });

  return dbPromise;
}

/**
 * Write a value to IndexedDB and mirror to localStorage if space permits
 */
export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  // 1. Primary write to IndexedDB (virtually unlimited quota)
  try {
    const db = await openQuietoDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`IndexedDB write error for "${key}":`, err);
  }

  // 2. Secondary write to localStorage (for fast instant boot)
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // Quota exceeded in localStorage is expected when storing images; IndexedDB handles it safely!
    // We suppress error to prevent console spam
  }
}

/**
 * Read a value from IndexedDB first, fallback to localStorage
 */
export async function getStorageItem<T>(key: string, fallback: T): Promise<T> {
  // 1. Try IndexedDB first
  try {
    const db = await openQuietoDB();
    const result = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });

    if (result !== undefined && result !== null) {
      return result;
    }
  } catch (err) {
    console.warn(`IndexedDB read error for "${key}", checking localStorage fallback:`, err);
  }

  // 2. Fallback to localStorage
  try {
    const local = localStorage.getItem(key);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed !== undefined && parsed !== null) {
        return parsed as T;
      }
    }
  } catch (err) {
    console.warn(`localStorage read error for "${key}":`, err);
  }

  return fallback;
}

export const PRODUCTS_STORAGE_KEY = 'quieto_products_v2';
export const ZEROED_FLAG_KEY = 'quieto_catalog_zeroed_v2';

/**
 * Explicit helper to save products
 */
export async function saveStoredProducts(products: Product[]): Promise<void> {
  await setStorageItem(PRODUCTS_STORAGE_KEY, products);
}

/**
 * Explicit helper to retrieve products with zeroed catalog migration
 */
export async function loadStoredProducts(fallback: Product[] = []): Promise<Product[]> {
  if (typeof window !== 'undefined') {
    const isZeroed = localStorage.getItem(ZEROED_FLAG_KEY);
    if (!isZeroed) {
      // First boot after user requested to zero out database:
      // Clear legacy storage and ensure empty array []
      localStorage.removeItem('quieto_products_v1');
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(ZEROED_FLAG_KEY, 'true');
      await setStorageItem(PRODUCTS_STORAGE_KEY, []);
      return [];
    }
  }
  return await getStorageItem<Product[]>(PRODUCTS_STORAGE_KEY, fallback);
}

/**
 * Explicit helper to wipe all products from database (zero-out)
 */
export async function clearStoredProducts(): Promise<void> {
  await setStorageItem(PRODUCTS_STORAGE_KEY, []);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('quieto_products_v1');
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(ZEROED_FLAG_KEY, 'true');
  }
}


/**
 * Explicit helper to save banner slides
 */
export async function saveStoredBannerSlides(slides: BannerSlide[]): Promise<void> {
  await setStorageItem('quieto_banner_slides_v1', slides);
}

/**
 * Explicit helper to retrieve banner slides
 */
export async function loadStoredBannerSlides(fallback: BannerSlide[]): Promise<BannerSlide[]> {
  return await getStorageItem<BannerSlide[]>('quieto_banner_slides_v1', fallback);
}

/**
 * Explicit helper to save orders
 */
export async function saveStoredOrders(orders: OrderRecord[]): Promise<void> {
  await setStorageItem('quieto_orders_v1', orders);
}

/**
 * Explicit helper to retrieve orders
 */
export async function loadStoredOrders(fallback: OrderRecord[]): Promise<OrderRecord[]> {
  return await getStorageItem<OrderRecord[]>('quieto_orders_v1', fallback);
}

/**
 * Explicit helper to save portfolio / gallery items
 */
export async function saveStoredGalleryItems(items: GalleryItem[]): Promise<void> {
  await setStorageItem('quieto_gallery_items_v1', items);
}

/**
 * Explicit helper to retrieve portfolio / gallery items
 */
export async function loadStoredGalleryItems(fallback: GalleryItem[]): Promise<GalleryItem[]> {
  return await getStorageItem<GalleryItem[]>('quieto_gallery_items_v1', fallback);
}

/**
 * Export full catalog backup as JSON string for download
 */
export function exportCatalogBackupJSON(products: Product[]): string {
  return JSON.stringify(
    {
      app: 'Quieto Angola',
      timestamp: new Date().toISOString(),
      version: '2.0',
      totalProducts: products.length,
      products
    },
    null,
    2
  );
}
