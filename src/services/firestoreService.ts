import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order, CustomerReview, WordPressSettings, ProductCategory } from '../types';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, MOCK_ORDERS, DEFAULT_WORDPRESS_SETTINGS, getProductFallbackImage } from '../data/initialData';

const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';
const REVIEWS_COL = 'reviews';
const SETTINGS_COL = 'settings';

const CATEGORY_MAPPINGS: Record<string, ProductCategory> = {
  'Hoodies & Sweatshirts': 'Hoodies',
  'Reflectors & Safety': 'Reflectors & Aprons',
  'Banners & Displays': 'Banners & Stickers',
  'Brochures & Flyers': 'Flyers & Posters',
  'Product Stickers & Labels': 'Banners & Stickers'
};

// Subscribe to Products with bulletproof error suppression
export const subscribeProducts = (onUpdate: (products: Product[]) => void): Unsubscribe => {
  try {
    const colRef = collection(db, PRODUCTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        // Run processing in an internal async IIFE with full try/catch
        (async () => {
          try {
            if (snapshot.empty) {
              for (const prod of INITIAL_PRODUCTS) {
                try {
                  await setDoc(doc(db, PRODUCTS_COL, prod.id), prod);
                } catch (e) {
                  console.debug('Initial product seed bypass:', e);
                }
              }
              onUpdate(INITIAL_PRODUCTS);
            } else {
              const items: Product[] = [];
              snapshot.forEach((docSnap) => {
                const data = docSnap.data() as Product;
                if (data.id === 'prod-documentary-01' || data.category === ('Documentaries & Video' as any)) {
                  deleteProductFromFirestore(data.id).catch(() => {});
                  return;
                }

                if (CATEGORY_MAPPINGS[data.category]) {
                  data.category = CATEGORY_MAPPINGS[data.category];
                }

                const initMatch = INITIAL_PRODUCTS.find(p => p.id === data.id);
                if (data.image && (data.image.startsWith('/src/assets/') || data.image.startsWith('src/assets/'))) {
                  data.image = data.image.replace(/^\/?src\/assets\//, '/assets/');
                  saveProductToFirestore(data).catch(() => {});
                } else if (!data.image || data.image.trim() === '') {
                  data.image = initMatch?.image || getProductFallbackImage(data.name, data.category);
                  saveProductToFirestore(data).catch(() => {});
                }

                items.push(data);
              });

              const existingIds = new Set(items.map(item => item.id));
              for (const initProd of INITIAL_PRODUCTS) {
                if (!existingIds.has(initProd.id)) {
                  saveProductToFirestore(initProd).catch(() => {});
                  items.push(initProd);
                }
              }

              onUpdate(items);
            }
          } catch (processErr) {
            console.debug('Firestore products processing caught:', processErr);
            onUpdate(INITIAL_PRODUCTS);
          }
        })().catch((err) => {
          console.debug('Firestore products IIFE caught:', err);
        });
      },
      (error) => {
        console.debug('Firestore products snapshot notice:', error);
        onUpdate(INITIAL_PRODUCTS);
      }
    );
  } catch (err) {
    console.debug('Firestore subscribeProducts initialization error:', err);
    onUpdate(INITIAL_PRODUCTS);
    return () => {};
  }
};

export const saveProductToFirestore = async (product: Product): Promise<void> => {
  try {
    await setDoc(doc(db, PRODUCTS_COL, product.id), product);
  } catch (err) {
    console.debug('Failed to save product to Firestore (fallback to local state):', err);
  }
};

export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COL, productId));
  } catch (err) {
    console.debug('Failed to delete product from Firestore:', err);
  }
};

// Subscribe to Orders with bulletproof error suppression
export const subscribeOrders = (onUpdate: (orders: Order[]) => void): Unsubscribe => {
  try {
    const colRef = collection(db, ORDERS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        (async () => {
          try {
            if (snapshot.empty) {
              for (const ord of MOCK_ORDERS) {
                try {
                  await setDoc(doc(db, ORDERS_COL, ord.id), ord);
                } catch (e) {
                  console.debug('Order seed bypass:', e);
                }
              }
              onUpdate(MOCK_ORDERS);
            } else {
              const items: Order[] = [];
              snapshot.forEach((docSnap) => {
                items.push(docSnap.data() as Order);
              });
              items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              onUpdate(items);
            }
          } catch (processErr) {
            console.debug('Firestore orders processing caught:', processErr);
            onUpdate(MOCK_ORDERS);
          }
        })().catch((err) => {
          console.debug('Firestore orders IIFE caught:', err);
        });
      },
      (error) => {
        console.debug('Firestore orders snapshot notice:', error);
        onUpdate(MOCK_ORDERS);
      }
    );
  } catch (err) {
    console.debug('Firestore subscribeOrders initialization error:', err);
    onUpdate(MOCK_ORDERS);
    return () => {};
  }
};

export const saveOrderToFirestore = async (order: Order): Promise<void> => {
  try {
    await setDoc(doc(db, ORDERS_COL, order.id), order);
  } catch (err) {
    console.debug('Failed to save order to Firestore (fallback to local state):', err);
  }
};

// Subscribe to Reviews with bulletproof error suppression
export const subscribeReviews = (onUpdate: (reviews: CustomerReview[]) => void): Unsubscribe => {
  try {
    const colRef = collection(db, REVIEWS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        (async () => {
          try {
            if (snapshot.empty) {
              for (const rev of INITIAL_REVIEWS) {
                try {
                  await setDoc(doc(db, REVIEWS_COL, rev.id), rev);
                } catch (e) {
                  console.debug('Review seed bypass:', e);
                }
              }
              onUpdate(INITIAL_REVIEWS);
            } else {
              const items: CustomerReview[] = [];
              snapshot.forEach((docSnap) => {
                items.push(docSnap.data() as CustomerReview);
              });
              onUpdate(items);
            }
          } catch (processErr) {
            console.debug('Firestore reviews processing caught:', processErr);
            onUpdate(INITIAL_REVIEWS);
          }
        })().catch((err) => {
          console.debug('Firestore reviews IIFE caught:', err);
        });
      },
      (error) => {
        console.debug('Firestore reviews snapshot notice:', error);
        onUpdate(INITIAL_REVIEWS);
      }
    );
  } catch (err) {
    console.debug('Firestore subscribeReviews initialization error:', err);
    onUpdate(INITIAL_REVIEWS);
    return () => {};
  }
};

export const saveReviewToFirestore = async (review: CustomerReview): Promise<void> => {
  try {
    await setDoc(doc(db, REVIEWS_COL, review.id), review);
  } catch (err) {
    console.debug('Failed to save review to Firestore (fallback to local state):', err);
  }
};

// Subscribe to WordPress / Site Settings
export const subscribeWpSettings = (onUpdate: (settings: WordPressSettings) => void): Unsubscribe => {
  try {
    const docRef = doc(db, SETTINGS_COL, 'wpSettings');
    return onSnapshot(
      docRef,
      (docSnap) => {
        (async () => {
          try {
            if (!docSnap.exists()) {
              try {
                await setDoc(docRef, DEFAULT_WORDPRESS_SETTINGS);
              } catch (e) {
                console.debug('Settings seed bypass:', e);
              }
              onUpdate(DEFAULT_WORDPRESS_SETTINGS);
            } else {
              onUpdate(docSnap.data() as WordPressSettings);
            }
          } catch (processErr) {
            console.debug('Firestore wpSettings processing caught:', processErr);
            onUpdate(DEFAULT_WORDPRESS_SETTINGS);
          }
        })().catch((err) => {
          console.debug('Firestore wpSettings IIFE caught:', err);
        });
      },
      (error) => {
        console.debug('Firestore wpSettings snapshot notice:', error);
        onUpdate(DEFAULT_WORDPRESS_SETTINGS);
      }
    );
  } catch (err) {
    console.debug('Firestore subscribeWpSettings initialization error:', err);
    onUpdate(DEFAULT_WORDPRESS_SETTINGS);
    return () => {};
  }
};

export const saveWpSettingsToFirestore = async (settings: WordPressSettings): Promise<void> => {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'wpSettings'), settings);
  } catch (err) {
    console.debug('Failed to save wpSettings to Firestore:', err);
  }
};

export const restoreAllProductImages = async (): Promise<void> => {
  try {
    for (const initProd of INITIAL_PRODUCTS) {
      if (initProd.image) {
        await setDoc(doc(db, PRODUCTS_COL, initProd.id), {
          image: initProd.image
        }, { merge: true });
      }
    }
  } catch (err) {
    console.debug('Failed to restore all product images:', err);
  }
};
