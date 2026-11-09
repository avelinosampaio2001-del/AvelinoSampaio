import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, BannerSlide, GalleryItem, OrderRecord } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collections
const PRODUCTS_COLLECTION = 'products';
const SLIDES_COLLECTION = 'bannerSlides';
const GALLERY_COLLECTION = 'galleryItems';
const ORDERS_COLLECTION = 'orders';

/**
 * Real-time listener for Products across all devices (PC & Phone)
 */
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (error: unknown) => void
) {
  try {
    return onSnapshot(
      collection(db, PRODUCTS_COLLECTION),
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((docSnap) => {
          prods.push(docSnap.data() as Product);
        });
        onData(prods);
      },
      (error) => {
        console.warn('Real-time sync notice (products):', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
      }
    );
  } catch (err) {
    console.warn('subscribeToProducts error:', err);
    return () => {};
  }
}

/**
 * Save single product to Cloud
 */
export async function syncProductToCloud(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete product from Cloud
 */
export async function removeProductFromCloud(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Clear all products from Cloud database
 */
export async function clearAllProductsFromCloud(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('Error clearing products in cloud:', err);
  }
}

/**
 * Real-time listener for Banner Slides across all devices
 */
export function subscribeToBannerSlides(
  onData: (slides: BannerSlide[]) => void,
  onError?: (error: unknown) => void
) {
  try {
    return onSnapshot(
      collection(db, SLIDES_COLLECTION),
      (snapshot) => {
        const slides: BannerSlide[] = [];
        snapshot.forEach((docSnap) => {
          slides.push(docSnap.data() as BannerSlide);
        });
        if (slides.length > 0) {
          onData(slides);
        }
      },
      (error) => {
        console.warn('Real-time sync notice (slides):', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, SLIDES_COLLECTION);
      }
    );
  } catch (err) {
    console.warn('subscribeToBannerSlides error:', err);
    return () => {};
  }
}

/**
 * Save slide to Cloud
 */
export async function syncSlideToCloud(slide: BannerSlide): Promise<void> {
  const path = `${SLIDES_COLLECTION}/${slide.id}`;
  try {
    await setDoc(doc(db, SLIDES_COLLECTION, slide.id), slide);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save all slides to Cloud
 */
export async function syncAllSlidesToCloud(slides: BannerSlide[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    slides.forEach((s) => {
      const ref = doc(db, SLIDES_COLLECTION, s.id);
      batch.set(ref, s);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Error syncing slides batch:', err);
  }
}

/**
 * Real-time listener for Portfolio / Gallery across all devices
 */
export function subscribeToGallery(
  onData: (items: GalleryItem[]) => void,
  onError?: (error: unknown) => void
) {
  try {
    return onSnapshot(
      collection(db, GALLERY_COLLECTION),
      (snapshot) => {
        const items: GalleryItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as GalleryItem);
        });
        if (items.length > 0) {
          onData(items);
        }
      },
      (error) => {
        console.warn('Real-time sync notice (gallery):', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, GALLERY_COLLECTION);
      }
    );
  } catch (err) {
    console.warn('subscribeToGallery error:', err);
    return () => {};
  }
}

/**
 * Save gallery item to Cloud
 */
export async function syncGalleryItemToCloud(item: GalleryItem): Promise<void> {
  const path = `${GALLERY_COLLECTION}/${item.id}`;
  try {
    await setDoc(doc(db, GALLERY_COLLECTION, item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete gallery item from Cloud
 */
export async function removeGalleryItemFromCloud(itemId: string): Promise<void> {
  const path = `${GALLERY_COLLECTION}/${itemId}`;
  try {
    await deleteDoc(doc(db, GALLERY_COLLECTION, itemId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Save all gallery items batch to Cloud
 */
export async function syncAllGalleryItemsToCloud(items: GalleryItem[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const ref = doc(db, GALLERY_COLLECTION, item.id);
      batch.set(ref, item);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Error syncing gallery batch:', err);
  }
}

/**
 * Real-time listener for Orders across all devices
 */
export function subscribeToOrders(
  onData: (orders: OrderRecord[]) => void,
  onError?: (error: unknown) => void
) {
  try {
    return onSnapshot(
      collection(db, ORDERS_COLLECTION),
      (snapshot) => {
        const orders: OrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as OrderRecord);
        });
        if (orders.length > 0) {
          onData(orders);
        }
      },
      (error) => {
        console.warn('Real-time sync notice (orders):', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
      }
    );
  } catch (err) {
    console.warn('subscribeToOrders error:', err);
    return () => {};
  }
}

/**
 * Save order to Cloud
 */
export async function syncOrderToCloud(order: OrderRecord): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
