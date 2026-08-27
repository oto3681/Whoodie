import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order, CustomerReview, WordPressSettings, ProductCategory, RegisteredMember } from '../types';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, MOCK_ORDERS, DEFAULT_WORDPRESS_SETTINGS, INITIAL_REGISTERED_MEMBERS, getProductFallbackImage } from '../data/initialData';

const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';
const REVIEWS_COL = 'reviews';
const SETTINGS_COL = 'settings';
const MEMBERS_COL = 'members';

const CATEGORY_MAPPINGS: Record<string, ProductCategory> = {
  'Hoodies & Sweatshirts': 'Hoodies',
  'Reflectors & Safety': 'Reflectors & Aprons',
  'Banners & Displays': 'Banners & Stickers',
  'Brochures & Flyers': 'Flyers & Posters',
  'Product Stickers & Labels': 'Banners & Stickers',
  'Signs': 'Signage',
  'Caps & Hats': 'Caps',
  'Hats': 'Caps',
  'Headwear': 'Caps'
};

// Safe LocalStorage helpers for resilient local caching
const safeGetLocalStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.debug(`Failed to read ${key} from localStorage:`, e);
    return fallback;
  }
};

const safeSetLocalStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.debug(`Failed to save ${key} to localStorage:`, e);
  }
};

export const getAdminCustomProductImages = (): Record<string, string> => {
  return safeGetLocalStorage<Record<string, string>>('pixelprint_admin_product_images', {});
};

export const setAdminCustomProductImage = (productId: string, imageUrl: string | null) => {
  const customMap = getAdminCustomProductImages();
  if (imageUrl && imageUrl.trim() !== '') {
    customMap[productId] = imageUrl;
  } else {
    delete customMap[productId];
  }
  safeSetLocalStorage('pixelprint_admin_product_images', customMap);
};

// Subscribe to Products with bulletproof error suppression and permanent picture preservation
export const subscribeProducts = (onUpdate: (products: Product[]) => void): Unsubscribe => {
  try {
    const colRef = collection(db, PRODUCTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        // Run processing in an internal async IIFE with full try/catch
        (async () => {
          try {
            const customImages = getAdminCustomProductImages();
            const updatedCustomImages = { ...customImages };

            if (snapshot.empty) {
              // Only seed initial products if collection is completely fresh
              const seededItems: Product[] = INITIAL_PRODUCTS.map((p) => {
                if (customImages[p.id]) {
                  return { ...p, image: customImages[p.id] };
                }
                return p;
              });

              for (const prod of seededItems) {
                try {
                  await setDoc(doc(db, PRODUCTS_COL, prod.id), prod);
                } catch (e) {
                  console.debug('Initial product seed bypass:', e);
                }
              }
              onUpdate(seededItems);
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

                // Automatically split legacy combined "Branding & Signage" into separate Branding and Signage
                if ((data.category as string) === 'Branding & Signage' || (data.category as string) === 'Branding and Signage') {
                  const nameLow = (data.name || '').toLowerCase();
                  if (nameLow.includes('sign') || nameLow.includes('billboard') || nameLow.includes('led') || nameLow.includes('advertisement') || nameLow.includes('storefront') || nameLow.includes('plaque') || nameLow.includes('channel letter')) {
                    data.category = 'Signage';
                  } else {
                    data.category = 'Branding';
                  }
                  saveProductToFirestore(data).catch(() => {});
                }

                // If Firestore has a valid image, preserve it permanently and sync with customImages cache
                if (data.image && data.image.trim() !== '') {
                  // If there's an asset path that needs resolving, clean it
                  if (data.image.startsWith('/src/assets/') || data.image.startsWith('src/assets/')) {
                    data.image = data.image.replace(/^\/?src\/assets\//, '/assets/');
                    saveProductToFirestore(data).catch(() => {});
                  }
                  // Keep local custom images synchronized with live Firestore
                  updatedCustomImages[data.id] = data.image;
                } else if (customImages[data.id] && customImages[data.id].trim() !== '') {
                  // Fallback to local admin custom image if Firestore doc was missing it
                  data.image = customImages[data.id];
                  saveProductToFirestore(data).catch(() => {});
                } else {
                  // Only fallback if both Firestore and local admin map have no image
                  const initMatch = INITIAL_PRODUCTS.find(p => p.id === data.id);
                  data.image = initMatch?.image || getProductFallbackImage(data.name, data.category);
                  saveProductToFirestore(data).catch(() => {});
                }

                items.push(data);
              });

              // Update persistent local image map so all uploaded images survive session resets
              safeSetLocalStorage('pixelprint_admin_product_images', updatedCustomImages);

              const existingIds = new Set(items.map(item => item.id));
              for (const initProd of INITIAL_PRODUCTS) {
                if (!existingIds.has(initProd.id)) {
                  const prodWithCustom = updatedCustomImages[initProd.id] 
                    ? { ...initProd, image: updatedCustomImages[initProd.id] } 
                    : initProd;
                  saveProductToFirestore(prodWithCustom).catch(() => {});
                  items.push(prodWithCustom);
                }
              }

              onUpdate(items);
            }
          } catch (processErr) {
            console.debug('Firestore products processing caught:', processErr);
            const localSaved = safeGetLocalStorage<Product[] | null>('pixelprint_products', null);
            onUpdate(localSaved && localSaved.length > 0 ? localSaved : INITIAL_PRODUCTS);
          }
        })().catch((err) => {
          console.debug('Firestore products IIFE caught:', err);
          const localSaved = safeGetLocalStorage<Product[] | null>('pixelprint_products', null);
          onUpdate(localSaved && localSaved.length > 0 ? localSaved : INITIAL_PRODUCTS);
        });
      },
      (error) => {
        console.debug('Firestore products snapshot notice:', error);
        const localSaved = safeGetLocalStorage<Product[] | null>('pixelprint_products', null);
        onUpdate(localSaved && localSaved.length > 0 ? localSaved : INITIAL_PRODUCTS);
      }
    );
  } catch (err) {
    console.debug('Firestore subscribeProducts initialization error:', err);
    const localSaved = safeGetLocalStorage<Product[] | null>('pixelprint_products', null);
    onUpdate(localSaved && localSaved.length > 0 ? localSaved : INITIAL_PRODUCTS);
    return () => {};
  }
};

export const saveProductToFirestore = async (product: Product): Promise<void> => {
  try {
    if (product.image && product.image.trim() !== '') {
      setAdminCustomProductImage(product.id, product.image);
    }
    await setDoc(doc(db, PRODUCTS_COL, product.id), product);
  } catch (err) {
    console.debug('Failed to save product to Firestore (fallback to local state):', err);
  }
};

export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  try {
    setAdminCustomProductImage(productId, null);
    await deleteDoc(doc(db, PRODUCTS_COL, productId));
  } catch (err) {
    console.debug('Failed to delete product from Firestore:', err);
  }
};

// Subscribe to Orders (real orders placed by registered users only)
export const subscribeOrders = (onUpdate: (orders: Order[]) => void): Unsubscribe => {
  try {
    const colRef = collection(db, ORDERS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        try {
          if (snapshot.empty) {
            onUpdate([]);
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
          onUpdate([]);
        }
      },
      (error) => {
        console.debug('Firestore orders snapshot notice:', error);
        onUpdate([]);
      }
    );
  } catch (err) {
    console.debug('Firestore subscribeOrders initialization error:', err);
    onUpdate([]);
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

export const deleteOrderFromFirestore = async (orderId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ORDERS_COL, orderId));
  } catch (err) {
    console.debug('Failed to delete order from Firestore:', err);
  }
};

// Subscribe to Registered Members with local fallback & seed
export const subscribeMembers = (onUpdate: (members: RegisteredMember[]) => void): Unsubscribe => {
  try {
    const colRef = collection(db, MEMBERS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        (async () => {
          try {
            if (snapshot.empty) {
              for (const member of INITIAL_REGISTERED_MEMBERS) {
                try {
                  await setDoc(doc(db, MEMBERS_COL, member.id), member);
                } catch (e) {
                  console.debug('Member seed bypass:', e);
                }
              }
              onUpdate(INITIAL_REGISTERED_MEMBERS);
            } else {
              const items: RegisteredMember[] = [];
              snapshot.forEach((docSnap) => {
                items.push(docSnap.data() as RegisteredMember);
              });
              items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              onUpdate(items);
            }
          } catch (processErr) {
            console.debug('Firestore members processing caught:', processErr);
            onUpdate(INITIAL_REGISTERED_MEMBERS);
          }
        })().catch((err) => {
          console.debug('Firestore members IIFE caught:', err);
        });
      },
      (error) => {
        console.debug('Firestore members snapshot notice:', error);
        onUpdate(INITIAL_REGISTERED_MEMBERS);
      }
    );
  } catch (err) {
    console.debug('Firestore subscribeMembers initialization error:', err);
    onUpdate(INITIAL_REGISTERED_MEMBERS);
    return () => {};
  }
};

export const saveMemberToFirestore = async (member: RegisteredMember): Promise<void> => {
  try {
    await setDoc(doc(db, MEMBERS_COL, member.id), member);
  } catch (err) {
    console.debug('Failed to save member to Firestore (fallback to local state):', err);
  }
};

export const deleteMemberFromFirestore = async (memberId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, MEMBERS_COL, memberId));
  } catch (err) {
    console.debug('Failed to delete member from Firestore:', err);
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
    try {
      localStorage.removeItem('pixelprint_admin_product_images');
    } catch (e) {
      console.debug('Failed to clear custom product images in localStorage:', e);
    }
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
