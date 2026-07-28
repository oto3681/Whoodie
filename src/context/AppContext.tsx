import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  CustomerReview, 
  UserProfile, 
  WordPressSettings, 
  ProductCategory, 
  OrderStatus,
  CustomArtwork
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_REVIEWS, 
  MOCK_ORDERS, 
  DEFAULT_WORDPRESS_SETTINGS 
} from '../data/initialData';
import {
  subscribeProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeOrders,
  saveOrderToFirestore,
  subscribeReviews,
  saveReviewToFirestore,
  subscribeWpSettings,
  saveWpSettingsToFirestore,
} from '../services/firestoreService';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
}

interface AppContextType {
  // State
  products: Product[];
  categories: ProductCategory[];
  selectedCategory: ProductCategory;
  searchQuery: string;
  cart: CartItem[];
  orders: Order[];
  reviews: CustomerReview[];
  currentUser: UserProfile | null;
  wpSettings: WordPressSettings;
  activeModal: 'login' | 'cart' | 'checkout' | 'product-detail' | 'track' | 'feedback' | null;
  selectedProductForDetail: Product | null;
  activeTrackingId: string | null;
  toasts: ToastMessage[];
  activeView: 'shop' | 'dashboard' | 'admin' | 'tracking' | 'reviews';
  isDbConnected: boolean;

  // Actions
  setSelectedCategory: (cat: ProductCategory) => void;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, quantity: number, customization?: CustomArtwork) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  
  // Auth
  loginAsUser: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
  
  // Orders & Tracking
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingHistory' | 'orderStatus' | 'paymentStatus'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveTrackingId: (id: string | null) => void;
  
  // Product Management (Admin)
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  // Reviews
  addReview: (review: Omit<CustomerReview, 'id' | 'date' | 'likes'>) => void;
  likeReview: (reviewId: string) => void;
  
  // WordPress Settings
  updateWpSettings: (settings: Partial<WordPressSettings>) => void;
  
  // Navigation & Modals
  setActiveModal: (modal: AppContextType['activeModal']) => void;
  setSelectedProductForDetail: (product: Product | null) => void;
  setActiveView: (view: AppContextType['activeView']) => void;
  showToast: (title: string, description: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pixelprint_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pixelprint_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pixelprint_orders');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('pixelprint_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [wpSettings, setWpSettings] = useState<WordPressSettings>(() => {
    const saved = localStorage.getItem('pixelprint_wp_settings');
    return saved ? JSON.parse(saved) : DEFAULT_WORDPRESS_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('pixelprint_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<AppContextType['activeModal']>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppContextType['activeView']>('shop');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Firestore Real-time Subscriptions
  useEffect(() => {
    const unsubProducts = subscribeProducts((fetched) => {
      setProducts(fetched);
      setIsDbConnected(true);
    });

    const unsubOrders = subscribeOrders((fetched) => {
      setOrders(fetched);
    });

    const unsubReviews = subscribeReviews((fetched) => {
      setReviews(fetched);
    });

    const unsubWp = subscribeWpSettings((fetched) => {
      setWpSettings(fetched);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubReviews();
      unsubWp();
    };
  }, []);

  // Categories list
  const categories: ProductCategory[] = [
    'All',
    'Printed T-Shirts',
    'Hoodies & Sweatshirts',
    'Reflectors & Safety',
    'Banners & Displays',
    'Branding & Signage',
    'Product Stickers & Labels',
    'Brochures & Flyers',
    'Eulogies & Memorials'
  ];

  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem('pixelprint_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pixelprint_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pixelprint_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pixelprint_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('pixelprint_wp_settings', JSON.stringify(wpSettings));
  }, [wpSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pixelprint_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pixelprint_user');
    }
  }, [currentUser]);

  // Toast utility
  const showToast = (title: string, description: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Management
  const addToCart = (product: Product, quantity: number, customization?: CustomArtwork) => {
    const basePrice = product.price;
    const itemPrice = customization?.quantity ? basePrice * customization.quantity : basePrice * quantity;

    const newItem: CartItem = {
      product,
      quantity,
      customization,
      calculatedPrice: itemPrice,
    };

    setCart((prev) => [...prev, newItem]);
    showToast('Added to Cart 🛒', `${product.name} (x${quantity}) added to your cart.`);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    showToast('Removed Item', 'Item removed from your cart.', 'info');
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      const unitPrice = item.product.price;
      next[index] = {
        ...item,
        quantity,
        calculatedPrice: unitPrice * quantity,
      };
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Auth Handlers
  const loginAsUser = () => {
    const user: UserProfile = {
      id: 'user-789',
      name: 'John Doe',
      email: 'client@gmail.com',
      phone: '+254712998877',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(user);
    setActiveModal(null);
    showToast('Welcome back, John! 👋', 'Logged in as Customer Account.');
  };

  const loginAsAdmin = () => {
    const admin: UserProfile = {
      id: 'admin-001',
      name: 'Admin Manager',
      email: 'admin@woodynatdesigners.co.ke',
      phone: '+254712345678',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(admin);
    setActiveModal(null);
    setActiveView('admin');
    showToast('Admin Authenticated 🔐', 'Welcome to Woodynat Designers Limited Admin Console.');
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('shop');
    showToast('Logged Out', 'You have been safely logged out.', 'info');
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingHistory' | 'orderStatus' | 'paymentStatus'>): Order => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const id = `PX-${randomNum}`;
    const nowStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const trackingHistory: Order['trackingHistory'] = [
      {
        status: 'Order Received',
        timestamp: nowStr,
        completed: true,
        description: 'Order placed & payment authorized successfully.'
      },
      {
        status: 'Design Proof Approved',
        timestamp: 'Pending Review',
        completed: false,
        description: 'Design proofing & artwork vectorization underway.'
      },
      {
        status: 'Printing & Production',
        timestamp: 'Queued',
        completed: false,
        description: 'High definition digital printing on press.'
      },
      {
        status: 'Quality Check',
        timestamp: 'Pending',
        completed: false,
        description: 'Color inspection & packaging.'
      },
      {
        status: 'Out for Delivery',
        timestamp: 'Pending',
        completed: false,
        description: 'Dispatched with courier rider.'
      },
      {
        status: 'Delivered',
        timestamp: 'Pending',
        completed: false,
        description: 'Delivered to customer or pick-up point.'
      }
    ];

    const newOrder: Order = {
      ...orderData,
      id,
      userId: currentUser?.id || 'guest',
      orderStatus: 'Order Received',
      paymentStatus: 'Paid',
      createdAt: nowStr,
      estimatedDelivery: 'Tomorrow, 02:00 PM',
      trackingHistory
    };

    saveOrderToFirestore(newOrder);
    clearCart();
    setActiveTrackingId(id);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const updatedHistory = targetOrder.trackingHistory.map((step) => {
        if (step.status === status) {
          return {
            ...step,
            completed: true,
            timestamp: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
          };
        }
        return step;
      });

      const updatedOrder: Order = {
        ...targetOrder,
        orderStatus: status,
        trackingHistory: updatedHistory,
      };

      saveOrderToFirestore(updatedOrder);
      showToast('Order Updated 🚚', `Order ${orderId} status set to "${status}".`);
    }
  };

  // Product Admin
  const addProduct = (product: Product) => {
    saveProductToFirestore(product);
    showToast('Product Created ✨', `${product.name} added to live catalog.`);
  };

  const updateProduct = (updated: Product) => {
    saveProductToFirestore(updated);
    showToast('Product Saved 💾', `${updated.name} details updated.`);
  };

  const deleteProduct = (id: string) => {
    deleteProductFromFirestore(id);
    showToast('Product Deleted', 'Item removed from catalog.', 'warning');
  };

  // Reviews
  const addReview = (reviewData: Omit<CustomerReview, 'id' | 'date' | 'likes'>) => {
    const newRev: CustomerReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      likes: 0
    };
    saveReviewToFirestore(newRev);
    showToast('Review Submitted ⭐', 'Thank you for building trust with new clients!');
  };

  const likeReview = (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId);
    if (target) {
      const updated = { ...target, likes: target.likes + 1 };
      saveReviewToFirestore(updated);
    }
  };

  // WP Settings
  const updateWpSettings = (newSettings: Partial<WordPressSettings>) => {
    const updated = { ...wpSettings, ...newSettings };
    saveWpSettingsToFirestore(updated);
    showToast('WordPress Settings Saved ⚡', 'Live site branding & config synchronized.');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        categories,
        selectedCategory,
        searchQuery,
        cart,
        orders,
        reviews,
        currentUser,
        wpSettings,
        activeModal,
        selectedProductForDetail,
        activeTrackingId,
        toasts,
        activeView,
        isDbConnected,
        setSelectedCategory,
        setSearchQuery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        loginAsUser,
        loginAsAdmin,
        logout,
        createOrder,
        updateOrderStatus,
        setActiveTrackingId,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        likeReview,
        updateWpSettings,
        setActiveModal,
        setSelectedProductForDetail,
        setActiveView,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
