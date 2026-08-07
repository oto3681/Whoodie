import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order, CustomerReview, WordPressSettings, OrderStatus, ProductCategory } from '../types';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, MOCK_ORDERS, DEFAULT_WORDPRESS_SETTINGS } from '../data/initialData';

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

// Subscribe to Products
export const subscribeProducts = (onUpdate: (products: Product[]) => void) => {
  const colRef = collection(db, PRODUCTS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // Seed initial products if database collection is empty
      try {
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(db, PRODUCTS_COL, prod.id), prod);
        }
      } catch (err) {
        console.error('Error seeding initial products:', err);
      }
      onUpdate(INITIAL_PRODUCTS);
    } else {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        if (data.id === 'prod-documentary-01' || data.category === ('Documentaries & Video' as any)) {
          deleteProductFromFirestore(data.id);
          return;
        }

        // Migrate old category names to new category names automatically
        if (CATEGORY_MAPPINGS[data.category]) {
          data.category = CATEGORY_MAPPINGS[data.category];
        }

        // Sync latest local images from INITIAL_PRODUCTS if available
        const initMatch = INITIAL_PRODUCTS.find(p => p.id === data.id);
        if (initMatch && initMatch.image && (data.image !== initMatch.image || data.image.startsWith('/src/assets/'))) {
          data.image = initMatch.image;
          saveProductToFirestore(data);
        } else if (data.image && data.image.startsWith('/src/assets/')) {
          data.image = data.image.replace('/src/assets/', '/assets/');
          saveProductToFirestore(data);
        }

        items.push(data);
      });

      // Ensure any newly introduced products in INITIAL_PRODUCTS are synced to Firestore
      const existingIds = new Set(items.map(item => item.id));
      for (const initProd of INITIAL_PRODUCTS) {
        if (!existingIds.has(initProd.id)) {
          saveProductToFirestore(initProd);
          items.push(initProd);
        }
      }

      onUpdate(items);
    }
  }, (error) => {
    console.warn('Firestore products snapshot error:', error);
  });
};

export const saveProductToFirestore = async (product: Product) => {
  try {
    await setDoc(doc(db, PRODUCTS_COL, product.id), product);
  } catch (err) {
    console.error('Failed to save product to Firestore:', err);
  }
};

export const deleteProductFromFirestore = async (productId: string) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COL, productId));
  } catch (err) {
    console.error('Failed to delete product from Firestore:', err);
  }
};

// Subscribe to Orders
export const subscribeOrders = (onUpdate: (orders: Order[]) => void) => {
  const colRef = collection(db, ORDERS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // Seed initial orders if database collection is empty
      try {
        for (const ord of MOCK_ORDERS) {
          await setDoc(doc(db, ORDERS_COL, ord.id), ord);
        }
      } catch (err) {
        console.error('Error seeding initial orders:', err);
      }
      onUpdate(MOCK_ORDERS);
    } else {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Order);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    }
  }, (error) => {
    console.warn('Firestore orders snapshot error:', error);
  });
};

export const saveOrderToFirestore = async (order: Order) => {
  try {
    await setDoc(doc(db, ORDERS_COL, order.id), order);
  } catch (err) {
    console.error('Failed to save order to Firestore:', err);
  }
};

// Subscribe to Reviews
export const subscribeReviews = (onUpdate: (reviews: CustomerReview[]) => void) => {
  const colRef = collection(db, REVIEWS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      try {
        for (const rev of INITIAL_REVIEWS) {
          await setDoc(doc(db, REVIEWS_COL, rev.id), rev);
        }
      } catch (err) {
        console.error('Error seeding initial reviews:', err);
      }
      onUpdate(INITIAL_REVIEWS);
    } else {
      const items: CustomerReview[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CustomerReview);
      });
      onUpdate(items);
    }
  }, (error) => {
    console.warn('Firestore reviews snapshot error:', error);
  });
};

export const saveReviewToFirestore = async (review: CustomerReview) => {
  try {
    await setDoc(doc(db, REVIEWS_COL, review.id), review);
  } catch (err) {
    console.error('Failed to save review to Firestore:', err);
  }
};

// Subscribe to WordPress / Site Settings
export const subscribeWpSettings = (onUpdate: (settings: WordPressSettings) => void) => {
  const docRef = doc(db, SETTINGS_COL, 'wpSettings');
  return onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) {
      try {
        await setDoc(docRef, DEFAULT_WORDPRESS_SETTINGS);
      } catch (err) {
        console.error('Error seeding initial wpSettings:', err);
      }
      onUpdate(DEFAULT_WORDPRESS_SETTINGS);
    } else {
      onUpdate(docSnap.data() as WordPressSettings);
    }
  }, (error) => {
    console.warn('Firestore wpSettings snapshot error:', error);
  });
};

export const saveWpSettingsToFirestore = async (settings: WordPressSettings) => {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'wpSettings'), settings);
  } catch (err) {
    console.error('Failed to save wpSettings to Firestore:', err);
  }
};
