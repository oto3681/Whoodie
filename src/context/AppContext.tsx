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
  CustomArtwork,
  CustomerInquiry,
  WhatsAppChatThread,
  WhatsAppMessage,
  BotRule,
  CustomerContact,
  BulkSmsTemplate,
  BulkEmailTemplate,
  BulkCampaign,
  AdminNotification,
  ZohoQuotation,
  ZohoQuoteItem,
  ZohoSettings,
  ZohoQuoteStatus
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_REVIEWS, 
  MOCK_ORDERS, 
  DEFAULT_WORDPRESS_SETTINGS,
  INITIAL_INQUIRIES,
  INITIAL_WHATSAPP_THREADS,
  INITIAL_BOT_RULES,
  INITIAL_ADMIN_NOTIFICATIONS,
  DEFAULT_ZOHO_SETTINGS,
  INITIAL_ZOHO_QUOTATIONS
} from '../data/initialData';
import { playNotificationSound } from '../utils/audioNotification';
import {
  INITIAL_SMS_TEMPLATES,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_CUSTOM_CONTACTS,
  INITIAL_CAMPAIGNS
} from '../data/bulkTemplates';
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
  inquiries: CustomerInquiry[];
  reviews: CustomerReview[];
  currentUser: UserProfile | null;
  wpSettings: WordPressSettings;
  activeModal: 'login' | 'cart' | 'checkout' | 'product-detail' | 'track' | 'feedback' | 'catalogue' | null;
  selectedProductForDetail: Product | null;
  activeTrackingId: string | null;
  toasts: ToastMessage[];
  activeView: 'shop' | 'dashboard' | 'admin' | 'tracking' | 'reviews';
  isDbConnected: boolean;
  isGuestBrowsing: boolean;

  // Actions
  setIsGuestBrowsing: (val: boolean) => void;
  setSelectedCategory: (cat: ProductCategory) => void;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, quantity: number, customization?: CustomArtwork) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  
  // Auth
  loginAsUser: (userData?: { name?: string; email?: string; phone?: string }) => void;
  loginWithGoogle: (customData?: { name?: string; email?: string; avatar?: string }) => void;
  loginWithFacebook: (customData?: { name?: string; email?: string; avatar?: string }) => void;
  loginAsAdmin: (adminEmail?: string) => void;
  logout: () => void;
  
  // Orders & Tracking
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingHistory' | 'orderStatus' | 'paymentStatus'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveTrackingId: (id: string | null) => void;
  
  // Customer Inquiries
  addInquiry: (inquiry: Omit<CustomerInquiry, 'id' | 'createdAt'>) => CustomerInquiry;
  updateInquiryStatus: (inquiryId: string, status: CustomerInquiry['status']) => void;
  deleteInquiry: (inquiryId: string) => void;

  // Product Management (Admin)
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  // Reviews
  addReview: (review: Omit<CustomerReview, 'id' | 'date' | 'likes'>) => void;
  likeReview: (reviewId: string) => void;
  
  // WordPress Settings
  updateWpSettings: (settings: Partial<WordPressSettings>) => void;
  
  // WhatsApp Live Chat & WhatBot Hub
  whatsappThreads: WhatsAppChatThread[];
  botRules: BotRule[];
  activeThreadId: string | null;
  isWhatBotGlobalActive: boolean;
  setActiveThreadId: (id: string | null) => void;
  setIsWhatBotGlobalActive: (active: boolean) => void;
  sendMessageToThread: (
    threadId: string, 
    text: string, 
    sender?: 'agent' | 'bot' | 'customer', 
    attachmentType?: WhatsAppMessage['attachmentType'], 
    attachmentData?: WhatsAppMessage['attachmentData']
  ) => void;
  toggleThreadBot: (threadId: string) => void;
  updateThreadStatus: (threadId: string, status: WhatsAppChatThread['status']) => void;
  createNewThread: (customerName: string, customerPhone: string, topic?: string, companyName?: string) => WhatsAppChatThread;
  addBotRule: (rule: Omit<BotRule, 'id'>) => void;
  updateBotRule: (rule: BotRule) => void;
  deleteBotRule: (ruleId: string) => void;
  toggleBotRule: (ruleId: string) => void;
  simulateIncomingCustomerMessage: (threadId: string, customerText: string) => void;

  // Bulk SMS & Email Campaign Studio
  customerContacts: CustomerContact[];
  smsTemplates: BulkSmsTemplate[];
  emailTemplates: BulkEmailTemplate[];
  bulkCampaigns: BulkCampaign[];
  addCustomerContact: (contact: Omit<CustomerContact, 'id' | 'createdAt'>) => CustomerContact;
  updateCustomerContact: (contact: CustomerContact) => void;
  deleteCustomerContact: (contactId: string) => void;
  importCustomerContacts: (contactsList: Array<Omit<CustomerContact, 'id' | 'createdAt'>>) => number;
  addSmsTemplate: (template: Omit<BulkSmsTemplate, 'id'>) => void;
  updateSmsTemplate: (template: BulkSmsTemplate) => void;
  deleteSmsTemplate: (templateId: string) => void;
  addEmailTemplate: (template: Omit<BulkEmailTemplate, 'id'>) => void;
  updateEmailTemplate: (template: BulkEmailTemplate) => void;
  deleteEmailTemplate: (templateId: string) => void;
  sendBulkSmsCampaign: (data: {
    title: string;
    targetAudience: BulkCampaign['targetAudience'];
    audienceLabel: string;
    recipients: CustomerContact[];
    smsBody: string;
    senderId?: string;
  }) => Promise<BulkCampaign>;
  sendBulkEmailCampaign: (data: {
    title: string;
    targetAudience: BulkCampaign['targetAudience'];
    audienceLabel: string;
    recipients: CustomerContact[];
    subject: string;
    preheader: string;
    template: BulkEmailTemplate;
  }) => Promise<BulkCampaign>;
  deleteCampaign: (campaignId: string) => void;

  // Admin Notification Center & Real-Time Alerts
  adminNotifications: AdminNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  acceptOrderFromNotification: (notificationId: string, orderId: string, customNote?: string) => void;
  acceptInquiryFromNotification: (notificationId: string, inquiryId: string, quoteNote?: string) => void;
  declineNotification: (notificationId: string, reason?: string) => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  simulateIncomingOrderNotification: () => void;
  simulateIncomingInquiryNotification: () => void;

  // Zoho Quotations & Invoice Engine
  zohoQuotations: ZohoQuotation[];
  zohoSettings: ZohoSettings;
  createZohoQuotation: (quoteData: Partial<ZohoQuotation>) => ZohoQuotation;
  updateZohoQuotation: (id: string, updates: Partial<ZohoQuotation>) => void;
  deleteZohoQuotation: (id: string) => void;
  duplicateZohoQuotation: (id: string) => ZohoQuotation;
  updateZohoQuoteStatus: (id: string, status: ZohoQuoteStatus) => void;
  convertZohoQuoteToOrder: (quoteId: string) => Order;
  updateZohoSettings: (newSettings: Partial<ZohoSettings>) => void;
  syncQuoteToZoho: (quoteId: string) => Promise<boolean>;

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
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map((p) => {
          const match = INITIAL_PRODUCTS.find((initP) => initP.id === p.id);
          if (match && match.image) {
            return { ...p, image: match.image };
          }
          if (p.image && p.image.startsWith('/src/assets/')) {
            return { ...p, image: p.image.replace('/src/assets/', '/assets/') };
          }
          return p;
        });
      } catch (e) {
        console.error('Error parsing saved products from localStorage:', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pixelprint_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pixelprint_orders');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });

  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(() => {
    const saved = localStorage.getItem('pixelprint_inquiries');
    return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
  });

  // WhatsApp Threads & Bot Rules
  const [whatsappThreads, setWhatsappThreads] = useState<WhatsAppChatThread[]>(() => {
    const saved = localStorage.getItem('pixelprint_whatsapp_threads');
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_THREADS;
  });

  const [botRules, setBotRules] = useState<BotRule[]>(() => {
    const saved = localStorage.getItem('pixelprint_bot_rules');
    return saved ? JSON.parse(saved) : INITIAL_BOT_RULES;
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    return INITIAL_WHATSAPP_THREADS[0]?.id || null;
  });

  const [isWhatBotGlobalActive, setIsWhatBotGlobalActive] = useState<boolean>(true);

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('pixelprint_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [wpSettings, setWpSettings] = useState<WordPressSettings>(() => {
    const saved = localStorage.getItem('pixelprint_wp_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.companyAddress && parsed.companyAddress.includes('Ronald Ngala')) {
        parsed.companyAddress = 'Temple Road Gatkim complex building fourth floor wing B Room 4B1';
      }
      return parsed;
    }
    return DEFAULT_WORDPRESS_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('pixelprint_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Bulk SMS & Email Campaign Studio State
  const [customerContacts, setCustomerContacts] = useState<CustomerContact[]>(() => {
    const saved = localStorage.getItem('pixelprint_customer_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_CONTACTS;
  });

  const [smsTemplates, setSmsTemplates] = useState<BulkSmsTemplate[]>(() => {
    const saved = localStorage.getItem('pixelprint_sms_templates');
    return saved ? JSON.parse(saved) : INITIAL_SMS_TEMPLATES;
  });

  const [emailTemplates, setEmailTemplates] = useState<BulkEmailTemplate[]>(() => {
    const saved = localStorage.getItem('pixelprint_email_templates');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_TEMPLATES;
  });

  const [bulkCampaigns, setBulkCampaigns] = useState<BulkCampaign[]>(() => {
    const saved = localStorage.getItem('pixelprint_bulk_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  // Admin Notification Center State
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('pixelprint_admin_notifications');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_NOTIFICATIONS;
  });

  // Zoho Quotations & Invoice Engine State
  const [zohoQuotations, setZohoQuotations] = useState<ZohoQuotation[]>(() => {
    const saved = localStorage.getItem('pixelprint_zoho_quotations');
    return saved ? JSON.parse(saved) : INITIAL_ZOHO_QUOTATIONS;
  });

  const [zohoSettings, setZohoSettings] = useState<ZohoSettings>(() => {
    const saved = localStorage.getItem('pixelprint_zoho_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_ZOHO_SETTINGS,
          ...parsed,
          accountEmail: parsed.accountEmail || 'woodynatdesigners12@gmail.com',
          notificationEmail: parsed.notificationEmail || 'woodynatdesigners12@gmail.com',
          senderName: parsed.senderName || 'Woodynat Designers Limited'
        };
      } catch (e) {
        console.error('Error parsing zohoSettings:', e);
      }
    }
    return DEFAULT_ZOHO_SETTINGS;
  });

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<AppContextType['activeModal']>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppContextType['activeView']>('shop');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [isGuestBrowsing, setIsGuestBrowsing] = useState<boolean>(false);

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
    'Hoodies',
    'Reflectors & Aprons',
    'Banners & Stickers',
    'Branding & Signage',
    'Flyers & Posters',
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
    localStorage.setItem('pixelprint_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('pixelprint_whatsapp_threads', JSON.stringify(whatsappThreads));
  }, [whatsappThreads]);

  useEffect(() => {
    localStorage.setItem('pixelprint_bot_rules', JSON.stringify(botRules));
  }, [botRules]);

  useEffect(() => {
    localStorage.setItem('pixelprint_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('pixelprint_wp_settings', JSON.stringify(wpSettings));
  }, [wpSettings]);

  useEffect(() => {
    localStorage.setItem('pixelprint_customer_contacts', JSON.stringify(customerContacts));
  }, [customerContacts]);

  useEffect(() => {
    localStorage.setItem('pixelprint_sms_templates', JSON.stringify(smsTemplates));
  }, [smsTemplates]);

  useEffect(() => {
    localStorage.setItem('pixelprint_email_templates', JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  useEffect(() => {
    localStorage.setItem('pixelprint_bulk_campaigns', JSON.stringify(bulkCampaigns));
  }, [bulkCampaigns]);

  useEffect(() => {
    localStorage.setItem('pixelprint_admin_notifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  useEffect(() => {
    localStorage.setItem('pixelprint_zoho_quotations', JSON.stringify(zohoQuotations));
  }, [zohoQuotations]);

  useEffect(() => {
    localStorage.setItem('pixelprint_zoho_settings', JSON.stringify(zohoSettings));
  }, [zohoSettings]);

  const unreadNotificationsCount = adminNotifications.filter((n) => !n.read || n.status === 'pending').length;

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pixelprint_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pixelprint_user');
    }
  }, [currentUser]);

  // Toast utility
  const showToast = (title: string, description: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
  const loginAsUser = (userData?: { name?: string; email?: string; phone?: string }) => {
    const user: UserProfile = {
      id: `user-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      name: userData?.name || 'John Doe',
      email: userData?.email || 'client@gmail.com',
      phone: userData?.phone || '+254712998877',
      role: 'user',
      provider: 'email',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(user);
    setActiveModal(null);
    showToast(`Welcome, ${user.name}! 👋`, 'Logged in to Woodynat Customer Account.');
  };

  const loginWithGoogle = (customData?: { name?: string; email?: string; avatar?: string }) => {
    const defaultEmail = customData?.email || 'client.woodynat@gmail.com';
    const defaultName = customData?.name || (defaultEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) || 'Google User');
    const user: UserProfile = {
      id: `google-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      name: defaultName,
      email: defaultEmail,
      phone: '+254700123456',
      role: 'user',
      provider: 'google',
      avatar: customData?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(user);
    setActiveModal(null);
    showToast(`Signed In with Google! 🚀`, `Welcome ${user.name}! Your Gmail account is connected.`);
  };

  const loginWithFacebook = (customData?: { name?: string; email?: string; avatar?: string }) => {
    const defaultEmail = customData?.email || 'customer.fb@woodynat.co.ke';
    const defaultName = customData?.name || 'Facebook Customer';
    const user: UserProfile = {
      id: `fb-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      name: defaultName,
      email: defaultEmail,
      phone: '+254711889900',
      role: 'user',
      provider: 'facebook',
      avatar: customData?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(user);
    setActiveModal(null);
    showToast(`Signed In with Facebook! 💙`, `Welcome ${user.name}! Connected via Facebook.`);
  };

  const loginAsAdmin = (adminEmail?: string) => {
    const admin: UserProfile = {
      id: 'admin-001',
      name: 'Admin Manager',
      email: adminEmail || 'woodynatdesigners12@gmail.com',
      phone: '+254712345678',
      role: 'admin',
      provider: 'email',
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
        status: 'Order Placed',
        timestamp: nowStr,
        completed: true,
        description: 'Order placed & M-Pesa payment authorized successfully.'
      },
      {
        status: 'Order Received by Admin',
        timestamp: 'Processing',
        completed: false,
        description: 'Order acknowledged & assigned to Woodynat production team.'
      },
      {
        status: 'Design Approved',
        timestamp: 'Pending Review',
        completed: false,
        description: 'Design proofing & artwork vectorization approved.'
      },
      {
        status: 'Quality Check',
        timestamp: 'Queued',
        completed: false,
        description: 'Color inspection, print calibration & packaging check.'
      },
      {
        status: 'Out for Delivery',
        timestamp: 'Pending Dispatch',
        completed: false,
        description: 'Package handed over to dispatch courier rider.'
      },
      {
        status: 'Delivered',
        timestamp: 'Pending Arrival',
        completed: false,
        description: 'Delivered to customer or designated pick-up station.'
      }
    ];

    const newOrder: Order = {
      ...orderData,
      id,
      userId: currentUser?.id || 'guest',
      orderStatus: 'Order Placed',
      paymentStatus: 'Paid',
      createdAt: nowStr,
      estimatedDelivery: 'Tomorrow, 02:00 PM',
      trackingHistory
    };

    saveOrderToFirestore(newOrder);

    // Auto-generate Admin Notification for Incoming Order
    const notifId = `notif-ord-${Date.now()}`;
    const newNotif: AdminNotification = {
      id: notifId,
      type: 'order_placed',
      title: `New Customer Order Placed (#${id})`,
      message: `${newOrder.customerName} placed an order for ${newOrder.items.length} item(s) totaling KSh ${newOrder.totalAmount.toLocaleString()} via ${newOrder.paymentMethod}.`,
      timestamp: 'Just now',
      timeAgo: 'Just now',
      read: false,
      status: 'pending',
      referenceId: id,
      referenceData: {
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        customerEmail: newOrder.customerEmail,
        amount: newOrder.totalAmount,
        itemsCount: newOrder.items.length,
        itemsSummary: newOrder.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', '),
        deliveryCity: newOrder.deliveryCity,
        deliveryType: newOrder.deliveryType,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus,
        notes: newOrder.items.map((i) => i.customization?.instructions).filter(Boolean).join('; ')
      }
    };
    setAdminNotifications((prev) => [newNotif, ...prev]);
    playNotificationSound('order');

    clearCart();
    setActiveTrackingId(id);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const canonicalStepsDescriptions: Record<string, string> = {
        'Order Placed': 'Order placed & M-Pesa payment authorized successfully.',
        'Order Received by Admin': 'Order acknowledged & assigned to Woodynat production team.',
        'Design Approved': 'Design proofing & artwork vectorization approved.',
        'Quality Check': 'Color inspection, print calibration & packaging check.',
        'Out for Delivery': 'Package handed over to dispatch courier rider.',
        'Delivered': 'Delivered to customer or designated pick-up station.'
      };

      const canonicalSteps: OrderStatus[] = [
        'Order Placed',
        'Order Received by Admin',
        'Design Approved',
        'Quality Check',
        'Out for Delivery',
        'Delivered'
      ];

      const targetIdx = canonicalSteps.indexOf(status);
      const nowFormatted = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

      // Build updated tracking history ensuring progressive completion
      const updatedHistory: Order['trackingHistory'] = canonicalSteps.map((stepName, idx) => {
        const existingStep = targetOrder.trackingHistory?.find(s => s.status === stepName);
        const isCompleted = idx <= targetIdx;

        return {
          status: stepName,
          completed: isCompleted,
          timestamp: isCompleted 
            ? (existingStep?.timestamp && existingStep.timestamp !== 'Pending' && existingStep.timestamp !== 'Queued' ? existingStep.timestamp : nowFormatted)
            : 'Pending',
          description: existingStep?.description || canonicalStepsDescriptions[stepName] || 'Step processing'
        };
      });

      const updatedOrder: Order = {
        ...targetOrder,
        orderStatus: status,
        trackingHistory: updatedHistory,
      };

      saveOrderToFirestore(updatedOrder);
      showToast('Order Status Updated 🚚', `Order ${orderId} progressed to "${status}".`);
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
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

  // Customer Inquiries
  const addInquiry = (inquiryData: Omit<CustomerInquiry, 'id' | 'createdAt'>): CustomerInquiry => {
    const newInq: CustomerInquiry = {
      ...inquiryData,
      id: `inq-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: inquiryData.status || 'New',
    };
    setInquiries((prev) => [newInq, ...prev]);

    // Auto-generate Admin Notification for Incoming Inquiry
    const notifId = `notif-inq-${Date.now()}`;
    const newNotif: AdminNotification = {
      id: notifId,
      type: 'inquiry_submitted',
      title: 'New Commercial Quote Inquiry',
      message: `${newInq.customerName}${newInq.companyName ? ` (${newInq.companyName})` : ''} requested quotation for ${newInq.requestedQuantity ? `${newInq.requestedQuantity}x ` : ''}${newInq.inquiryTopic}.`,
      timestamp: 'Just now',
      timeAgo: 'Just now',
      read: false,
      status: 'pending',
      referenceId: newInq.id,
      referenceData: {
        customerName: newInq.customerName,
        customerPhone: newInq.customerPhone,
        customerEmail: newInq.customerEmail,
        companyName: newInq.companyName,
        topic: newInq.inquiryTopic,
        category: newInq.preferredCategory,
        requestedQuantity: newInq.requestedQuantity,
        notes: newInq.notes
      }
    };
    setAdminNotifications((prev) => [newNotif, ...prev]);
    playNotificationSound('inquiry');

    showToast('Customer Inquiry Recorded 📋', `Inquiry for ${newInq.customerName} logged successfully.`);
    return newInq;
  };

  const updateInquiryStatus = (inquiryId: string, status: CustomerInquiry['status']) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === inquiryId ? { ...inq, status } : inq))
    );
    showToast('Inquiry Status Updated 🔄', `Inquiry status changed to "${status}".`);
  };

  const deleteInquiry = (inquiryId: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== inquiryId));
    showToast('Inquiry Removed', 'Inquiry record deleted.', 'info');
  };

  // WhatsApp & WhatBot Live Chat Engine
  const sendMessageToThread = (
    threadId: string, 
    text: string, 
    sender: 'agent' | 'bot' | 'customer' = 'agent', 
    attachmentType?: WhatsAppMessage['attachmentType'], 
    attachmentData?: WhatsAppMessage['attachmentData']
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      sender,
      text,
      timestamp: timeStr,
      status: sender === 'agent' ? 'sent' : 'delivered',
      attachmentType,
      attachmentData,
    };

    setWhatsappThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const updatedMessages = [...thread.messages, newMsg];
          return {
            ...thread,
            messages: updatedMessages,
            lastMessage: text || (attachmentType ? `[${attachmentType.toUpperCase()}]` : 'Sent an attachment'),
            lastMessageTime: timeStr,
            unreadCount: sender === 'agent' ? 0 : thread.unreadCount,
          };
        }
        return thread;
      })
    );
  };

  const simulateIncomingCustomerMessage = (threadId: string, customerText: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      sender: 'customer',
      text: customerText,
      timestamp: timeStr,
      status: 'delivered',
    };

    let targetThread = whatsappThreads.find((t) => t.id === threadId);

    setWhatsappThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          targetThread = thread;
          return {
            ...thread,
            messages: [...thread.messages, newMsg],
            lastMessage: customerText,
            lastMessageTime: timeStr,
            unreadCount: thread.unreadCount + 1,
          };
        }
        return thread;
      })
    );

    // If bot is active on this thread & global bot is active, evaluate rules
    if (targetThread && targetThread.isBotActive && isWhatBotGlobalActive) {
      const lower = customerText.toLowerCase().trim();
      const matchedRule = botRules.find((rule) => {
        if (!rule.enabled) return false;
        const keywords = rule.keyword.split('|').map((k) => k.trim().toLowerCase());
        return keywords.some((k) => {
          if (k.length <= 2) {
            return lower === k || lower.startsWith(`${k} `) || lower.includes(` ${k} `);
          }
          return lower.includes(k);
        });
      });

      setTimeout(() => {
        if (matchedRule) {
          sendMessageToThread(threadId, matchedRule.response, 'bot');
          
          if (matchedRule.id === 'rule-human' || lower.includes('human') || lower.includes('specialist') || lower === '7') {
            setWhatsappThreads((prev) =>
              prev.map((t) => (t.id === threadId ? { ...t, isBotActive: false } : t))
            );
            showToast('Live Agent Requested 👨‍💼', `${targetThread?.customerName || 'Customer'} is waiting for a live reply!`);
          }
        } else {
          // Fallback response with quick assistance menu
          const fallbackResponse = `👋 Thank you for messaging Woodynat Designers (WhatsApp: 0797939199).\n\nTo help you faster, reply:\n1️⃣ T-Shirts & Polos\n2️⃣ Hoodies & Fleeces\n3️⃣ Banners & Signage\n4️⃣ M-Pesa Paybill (247247 / Acc: 0797939199)\n5️⃣ Shop Location (Gatkim Complex, Nairobi CBD)\n6️⃣ 24h Memorial Booklets\n7️⃣ Speak with a live designer`;
          sendMessageToThread(threadId, fallbackResponse, 'bot');
        }
      }, 700);
    }
  };

  const toggleThreadBot = (threadId: string) => {
    setWhatsappThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const nextVal = !t.isBotActive;
          showToast(
            nextVal ? 'WhatBot Activated 🤖' : 'WhatBot Paused ⏸️', 
            nextVal ? `Auto-replies enabled for ${t.customerName}.` : `Live admin manual takeover active for ${t.customerName}.`
          );
          return { ...t, isBotActive: nextVal };
        }
        return t;
      })
    );
  };

  const updateThreadStatus = (threadId: string, status: WhatsAppChatThread['status']) => {
    setWhatsappThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, status } : t))
    );
    showToast('Chat Status Updated 🏷️', `Thread marked as "${status.toUpperCase()}".`);
  };

  const createNewThread = (customerName: string, customerPhone: string, topic = 'General Inquiry', companyName = ''): WhatsAppChatThread => {
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const newThread: WhatsAppChatThread = {
      id: `chat-${Date.now()}`,
      customerName,
      customerPhone: cleanPhone || customerPhone,
      companyName,
      unreadCount: 0,
      lastMessage: 'Chat conversation initiated with Woodynat WhatsApp (0797939199).',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic,
      status: 'active',
      isBotActive: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: `👋 Hello ${customerName}! Welcome to Woodynat Designers Limited (Official WhatsApp: 0797939199). We are ready to assist with: [${topic}].`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered'
        }
      ]
    };

    setWhatsappThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    showToast('WhatsApp Chat Created 💬', `Started new thread for ${customerName} (${customerPhone}).`);
    return newThread;
  };

  const addBotRule = (ruleData: Omit<BotRule, 'id'>) => {
    const newRule: BotRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
    };
    setBotRules((prev) => [...prev, newRule]);
    showToast('WhatBot Trigger Created 🤖', `Trigger rule "${newRule.title}" added.`);
  };

  const updateBotRule = (rule: BotRule) => {
    setBotRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
    showToast('WhatBot Rule Updated ✏️', `Rule "${rule.title}" updated.`);
  };

  const deleteBotRule = (ruleId: string) => {
    setBotRules((prev) => prev.filter((r) => r.id !== ruleId));
    showToast('Rule Deleted 🗑️', 'WhatBot trigger removed.', 'info');
  };

  const toggleBotRule = (ruleId: string) => {
    setBotRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // Bulk Contacts Operations
  const addCustomerContact = (contactData: Omit<CustomerContact, 'id' | 'createdAt'>): CustomerContact => {
    const newContact: CustomerContact = {
      ...contactData,
      id: `cnt-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setCustomerContacts((prev) => [newContact, ...prev]);
    showToast('Contact Saved 👤', `Added ${newContact.name} to customer directory.`);
    return newContact;
  };

  const updateCustomerContact = (updated: CustomerContact) => {
    setCustomerContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('Contact Updated ✏️', `Updated details for ${updated.name}.`);
  };

  const deleteCustomerContact = (contactId: string) => {
    setCustomerContacts((prev) => prev.filter((c) => c.id !== contactId));
    showToast('Contact Deleted 🗑️', 'Customer contact removed from broadcast directory.', 'info');
  };

  const importCustomerContacts = (contactsList: Array<Omit<CustomerContact, 'id' | 'createdAt'>>): number => {
    const timestamp = Date.now();
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    
    // Avoid duplicates by phone or email
    const existingPhones = new Set(customerContacts.map((c) => c.phone.replace(/[^0-9]/g, '')));
    const existingEmails = new Set(customerContacts.map((c) => c.email.toLowerCase().trim()).filter(Boolean));

    const newItems: CustomerContact[] = [];
    contactsList.forEach((c, idx) => {
      const cleanPhone = c.phone.replace(/[^0-9]/g, '');
      const cleanEmail = c.email.toLowerCase().trim();
      const isDuplicate = (cleanPhone && existingPhones.has(cleanPhone)) || (cleanEmail && existingEmails.has(cleanEmail));
      
      if (!isDuplicate && (cleanPhone || cleanEmail)) {
        if (cleanPhone) existingPhones.add(cleanPhone);
        if (cleanEmail) existingEmails.add(cleanEmail);
        newItems.push({
          ...c,
          id: `cnt-${timestamp}-${idx}`,
          createdAt: formattedDate
        });
      }
    });

    if (newItems.length > 0) {
      setCustomerContacts((prev) => [...newItems, ...prev]);
      showToast('Contacts Imported 📥', `Successfully added ${newItems.length} unique customer contacts.`);
    } else {
      showToast('No New Contacts', 'All provided contacts already exist in your directory.', 'info');
    }
    return newItems.length;
  };

  // SMS & Email Template Operations
  const addSmsTemplate = (templateData: Omit<BulkSmsTemplate, 'id'>) => {
    const newTpl: BulkSmsTemplate = {
      ...templateData,
      id: `sms-tpl-${Date.now()}`
    };
    setSmsTemplates((prev) => [newTpl, ...prev]);
    showToast('SMS Template Created 📱', `Saved "${newTpl.title}".`);
  };

  const updateSmsTemplate = (tpl: BulkSmsTemplate) => {
    setSmsTemplates((prev) => prev.map((t) => (t.id === t.id ? tpl : t)));
    showToast('Template Updated ✏️', `Saved changes to "${tpl.title}".`);
  };

  const deleteSmsTemplate = (templateId: string) => {
    setSmsTemplates((prev) => prev.filter((t) => t.id !== templateId));
    showToast('Template Removed 🗑️', 'SMS template deleted.', 'info');
  };

  const addEmailTemplate = (templateData: Omit<BulkEmailTemplate, 'id'>) => {
    const newTpl: BulkEmailTemplate = {
      ...templateData,
      id: `email-tpl-${Date.now()}`
    };
    setEmailTemplates((prev) => [newTpl, ...prev]);
    showToast('Email Template Created ✉️', `Saved "${newTpl.title}".`);
  };

  const updateEmailTemplate = (tpl: BulkEmailTemplate) => {
    setEmailTemplates((prev) => prev.map((t) => (t.id === tpl.id ? tpl : t)));
    showToast('Template Updated ✏️', `Saved changes to "${tpl.title}".`);
  };

  const deleteEmailTemplate = (templateId: string) => {
    setEmailTemplates((prev) => prev.filter((t) => t.id !== templateId));
    showToast('Template Removed 🗑️', 'Email template deleted.', 'info');
  };

  // Bulk SMS Dispatcher
  const sendBulkSmsCampaign = async (data: {
    title: string;
    targetAudience: BulkCampaign['targetAudience'];
    audienceLabel: string;
    recipients: CustomerContact[];
    smsBody: string;
    senderId?: string;
  }): Promise<BulkCampaign> => {
    const campaignId = `camp-sms-${Date.now()}`;
    const sentAt = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + 
      ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const count = data.recipients.length;
    // Simulate high success rate with Kenya telcos (Safaricom / Airtel)
    const deliveredCount = Math.max(1, count - Math.floor(Math.random() * (count > 10 ? 2 : 1)));
    const failedCount = count - deliveredCount;

    const campaign: BulkCampaign = {
      id: campaignId,
      title: data.title,
      channel: 'sms',
      targetAudience: data.targetAudience,
      audienceLabel: data.audienceLabel,
      recipientCount: count,
      senderId: data.senderId || 'WOODYNAT',
      smsBody: data.smsBody,
      sentAt,
      status: 'completed',
      deliveredCount,
      failedCount,
      openRateEstimate: '98.5%',
      logs: [
        `${new Date().toLocaleTimeString()} - Telco Bulk SMS Dispatch Gateway initialized (Sender ID: ${data.senderId || 'WOODYNAT'})`,
        `${new Date().toLocaleTimeString()} - Queued ${count} personalized SMS dispatches for audience "${data.audienceLabel}"`,
        `${new Date().toLocaleTimeString()} - Safaricom SMPP & Airtel Kenya carrier routes established`,
        `${new Date().toLocaleTimeString()} - Broadcast finalized: ${deliveredCount} Delivered successfully, ${failedCount} unreachable/failed`,
        `${new Date().toLocaleTimeString()} - Dynamic placeholders (e.g. {{customer_name}}, Paybill 247247) compiled and rendered`
      ]
    };

    setBulkCampaigns((prev) => [campaign, ...prev]);
    showToast('Bulk SMS Broadcast Sent! 🚀', `Dispatched to ${deliveredCount} customer numbers via ${data.senderId || 'WOODYNAT'}.`);
    return campaign;
  };

  // Bulk Email Dispatcher
  const sendBulkEmailCampaign = async (data: {
    title: string;
    targetAudience: BulkCampaign['targetAudience'];
    audienceLabel: string;
    recipients: CustomerContact[];
    subject: string;
    preheader: string;
    template: BulkEmailTemplate;
  }): Promise<BulkCampaign> => {
    const campaignId = `camp-email-${Date.now()}`;
    const sentAt = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + 
      ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const count = data.recipients.length;
    const deliveredCount = Math.max(1, count - Math.floor(Math.random() * (count > 10 ? 2 : 1)));
    const failedCount = count - deliveredCount;

    const campaign: BulkCampaign = {
      id: campaignId,
      title: data.title,
      channel: 'email',
      targetAudience: data.targetAudience,
      audienceLabel: data.audienceLabel,
      recipientCount: count,
      emailSubject: data.subject,
      emailPreheader: data.preheader,
      emailTemplateId: data.template.id,
      sentAt,
      status: 'completed',
      deliveredCount,
      failedCount,
      openRateEstimate: '72.8%',
      logs: [
        `${new Date().toLocaleTimeString()} - High-Deliverability SMTP Marketing Cluster activated (Sender: Woodynat Designers <sales@woodynatdesigners.co.ke>)`,
        `${new Date().toLocaleTimeString()} - Subject line compiled: "${data.subject}"`,
        `${new Date().toLocaleTimeString()} - Personalizing responsive HTML template for ${count} customer inboxes`,
        `${new Date().toLocaleTimeString()} - Batch dispatch complete: ${deliveredCount} delivered to Gmail/Corporate inboxes, ${failedCount} soft-bounced`,
        `${new Date().toLocaleTimeString()} - Trackable links to WhatsApp & Official Catalogue embedded`
      ]
    };

    setBulkCampaigns((prev) => [campaign, ...prev]);
    showToast('Bulk Email Campaign Sent! ✉️', `Delivered to ${deliveredCount} client inboxes.`);
    return campaign;
  };

  const deleteCampaign = (campaignId: string) => {
    setBulkCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    showToast('Campaign Removed 🗑️', 'Campaign history entry deleted.', 'info');
  };

  // Admin Notification Center & Real-Time Alert Handlers
  const markNotificationAsRead = (id: string) => {
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setAdminNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    showToast('All Alerts Read 🔕', 'Marked all admin notifications as read.');
  };

  const acceptOrderFromNotification = (notificationId: string, orderId: string, customNote?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';

    if (targetOrder && targetOrder.orderStatus === 'Order Placed') {
      updateOrderStatus(orderId, 'Order Received by Admin');
    }

    setAdminNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId || n.referenceId === orderId) {
          return {
            ...n,
            read: true,
            status: 'accepted',
            acceptedAt: nowFormatted,
            acceptedBy: 'Admin (Woodynat Designers)',
            actionTakenNotes: customNote || 'Order officially accepted by Admin & assigned to pre-press artwork proofing and print production.'
          };
        }
        return n;
      })
    );

    playNotificationSound('accept');
    showToast('Order Accepted! ✅', `Order #${orderId} accepted and assigned to production. Customer notified.`);
  };

  const acceptInquiryFromNotification = (notificationId: string, inquiryId: string, quoteNote?: string) => {
    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';

    updateInquiryStatus(inquiryId, 'Approved');

    setAdminNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId || n.referenceId === inquiryId) {
          return {
            ...n,
            read: true,
            status: 'accepted',
            acceptedAt: nowFormatted,
            acceptedBy: 'Admin (Woodynat Designers)',
            actionTakenNotes: quoteNote || 'Inquiry accepted. Official quotation & rate card queued for dispatch.'
          };
        }
        return n;
      })
    );

    playNotificationSound('accept');
    showToast('Inquiry Accepted! 📋', `Inquiry #${inquiryId} accepted. Ready to dispatch quotation.`);
  };

  const declineNotification = (notificationId: string, reason?: string) => {
    setAdminNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? {
              ...n,
              read: true,
              status: 'declined',
              actionTakenNotes: reason || 'Archived / Declined by Admin.'
            }
          : n
      )
    );
    showToast('Alert Archived', 'Notification marked as declined.', 'info');
  };

  const deleteNotification = (notificationId: string) => {
    setAdminNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    showToast('Notification Deleted 🗑️', 'Alert removed from panel.', 'info');
  };

  const clearAllNotifications = () => {
    setAdminNotifications([]);
    showToast('Notifications Cleared', 'Notification panel emptied.', 'info');
  };

  const simulateIncomingOrderNotification = () => {
    const sampleCustomers = [
      { name: 'Mercy Achieng', phone: '0711445566', email: 'm.achieng@gmail.com', city: 'Nairobi Westlands' },
      { name: 'Peter Karanja', phone: '0728990011', email: 'peter.k@gmail.com', city: 'Nairobi CBD' },
      { name: 'Eunice Wangari', phone: '0703887766', email: 'eunice.w@gmail.com', city: 'Upperhill Nairobi' },
      { name: 'Collins Otieno', phone: '0799332211', email: 'collins.o@gmail.com', city: 'Kilimani Nairobi' }
    ];
    const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const sampleAmounts = [4500, 8500, 14200, 26000, 39500];
    const amt = sampleAmounts[Math.floor(Math.random() * sampleAmounts.length)];
    const fakeOrderId = `PX-${Math.floor(10000 + Math.random() * 90000)}`;

    const notif: AdminNotification = {
      id: `notif-ord-${Date.now()}`,
      type: 'order_placed',
      title: `New Customer Order Placed (#${fakeOrderId})`,
      message: `${customer.name} just placed an order for custom print items totaling KSh ${amt.toLocaleString()} via M-Pesa.`,
      timestamp: 'Just now',
      timeAgo: 'Just now',
      read: false,
      status: 'pending',
      referenceId: fakeOrderId,
      referenceData: {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        amount: amt,
        itemsCount: 2,
        itemsSummary: 'Roll-Up Banners (x2), Custom Embroidered Polo Shirts (x15)',
        deliveryCity: customer.city,
        deliveryType: 'Express Home Delivery',
        paymentMethod: 'M-Pesa',
        paymentStatus: 'Paid',
        notes: 'Customer uploaded vector PDF logo with corporate pantone codes.'
      }
    };

    setAdminNotifications((prev) => [notif, ...prev]);
    playNotificationSound('order');
    showToast('🔔 Live Incoming Order Alert!', `${customer.name} placed order #${fakeOrderId} (KSh ${amt.toLocaleString()}). Accept in Notification Panel!`);
  };

  const simulateIncomingInquiryNotification = () => {
    const sampleLeads = [
      { name: 'Brian Ombati', company: 'Prime Agro Chemicals Ltd', phone: '0733889900', email: 'brian@primeagro.co.ke', topic: '500 Heavy-Duty Reflective Vests & Caps', cat: 'Reflectors & Aprons' as ProductCategory, qty: 500 },
      { name: 'Dr. Beatrice Nduta', company: 'St. Jude Medical Centre', phone: '0710223344', email: 'info@stjudemed.org', topic: 'Full Hospital Signage, Acrylic Door Plates & Posters', cat: 'Branding & Signage' as ProductCategory, qty: 25 },
      { name: 'Kelvin Mutua', company: 'Silverstone Logistics', phone: '0722114455', email: 'kmutua@silverstone.co.ke', topic: '100 Embroidered Hoodies & Thermal Coffee Mugs', cat: 'Hoodies' as ProductCategory, qty: 100 }
    ];
    const lead = sampleLeads[Math.floor(Math.random() * sampleLeads.length)];
    const inqId = `inq-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

    const notif: AdminNotification = {
      id: `notif-inq-${Date.now()}`,
      type: 'inquiry_submitted',
      title: 'New Commercial Quote Inquiry',
      message: `${lead.name} (${lead.company}) submitted a bulk inquiry for ${lead.qty}x ${lead.topic}.`,
      timestamp: 'Just now',
      timeAgo: 'Just now',
      read: false,
      status: 'pending',
      referenceId: inqId,
      referenceData: {
        customerName: lead.name,
        customerPhone: lead.phone,
        customerEmail: lead.email,
        companyName: lead.company,
        topic: lead.topic,
        category: lead.cat,
        requestedQuantity: lead.qty,
        notes: 'Urgent quotation requested with official company stamp & KRA PIN.'
      }
    };

    setAdminNotifications((prev) => [notif, ...prev]);
    playNotificationSound('inquiry');
    showToast('🔔 Live Customer Inquiry Alert!', `${lead.name} (${lead.company}) submitted a quote inquiry. Accept in Notification Panel!`);
  };

  // Zoho Quotations Engine Actions
  const createZohoQuotation = (quoteData: Partial<ZohoQuotation>): ZohoQuotation => {
    const quoteCount = zohoQuotations.length + 1;
    const padNumber = String(quoteCount).padStart(4, '0');
    const quoteNumber = quoteData.quoteNumber || `${zohoSettings.defaultQuotePrefix || 'ZOHO-QT-2026'}-${padNumber}`;
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + (quoteData.validityDays || zohoSettings.defaultValidityDays || 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const items = quoteData.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discountPercent / 100)), 0);
    const netTaxable = subtotal - discountTotal;
    const taxRate = quoteData.taxRate !== undefined ? quoteData.taxRate : zohoSettings.defaultTaxRate;
    const taxTotal = quoteData.isTaxInclusive ? 0 : Math.round(netTaxable * (taxRate / 100));
    const shippingCost = quoteData.shippingCost || 0;
    const grandTotal = netTaxable + taxTotal + shippingCost;

    const newQuote: ZohoQuotation = {
      id: `zoho-qt-${Date.now()}`,
      quoteNumber,
      customerName: quoteData.customerName || 'Customer / Business Lead',
      customerPhone: quoteData.customerPhone || '0797939199',
      customerEmail: quoteData.customerEmail || 'client@example.com',
      companyName: quoteData.companyName || '',
      customerKraPin: quoteData.customerKraPin || '',
      billingAddress: quoteData.billingAddress || 'Nairobi, Kenya',
      deliveryLocation: quoteData.deliveryLocation || 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
      deliveryType: quoteData.deliveryType || 'CBD Workshop Pickup',
      quoteDate: quoteData.quoteDate || today,
      expiryDate: quoteData.expiryDate || expiry,
      validityDays: quoteData.validityDays || zohoSettings.defaultValidityDays || 14,
      paymentTerms: quoteData.paymentTerms || zohoSettings.defaultPaymentTerms || '50% Deposit, 50% on Delivery',
      deliveryTimeline: quoteData.deliveryTimeline || zohoSettings.defaultDeliveryTimeline || '24-48 Hours Express Delivery',
      currency: quoteData.currency || 'KSh',
      items,
      subtotal,
      discountTotal,
      taxRate,
      taxTotal,
      shippingCost,
      grandTotal,
      isTaxInclusive: quoteData.isTaxInclusive ?? false,
      notes: quoteData.notes || zohoSettings.defaultNotes,
      termsAndConditions: quoteData.termsAndConditions || zohoSettings.defaultTerms,
      paybillNumber: wpSettings.paybillNumber || '247247',
      paybillAccount: wpSettings.paybillAccount || '0797939199',
      status: quoteData.status || 'Draft',
      zohoSyncStatus: zohoSettings.autoSyncToZoho ? 'synced' : 'local_only',
      zohoEstimateId: zohoSettings.autoSyncToZoho ? `EST-${Math.floor(2000000 + Math.random() * 900000)}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preparedBy: currentUser?.name || 'Woodynat Commercial Desk'
    };

    setZohoQuotations((prev) => [newQuote, ...prev]);
    showToast('Zoho Quotation Created!', `Quotation ${newQuote.quoteNumber} for ${newQuote.customerName} has been saved.`);
    return newQuote;
  };

  const updateZohoQuotation = (id: string, updates: Partial<ZohoQuotation>) => {
    setZohoQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const updated = { ...q, ...updates, updatedAt: new Date().toISOString() };
        
        // Recalculate totals if items or rates were modified
        if (updates.items || updates.taxRate !== undefined || updates.shippingCost !== undefined || updates.isTaxInclusive !== undefined) {
          const items = updated.items || [];
          const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const discountTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discountPercent / 100)), 0);
          const netTaxable = subtotal - discountTotal;
          const taxRate = updated.taxRate !== undefined ? updated.taxRate : 16;
          const taxTotal = updated.isTaxInclusive ? 0 : Math.round(netTaxable * (taxRate / 100));
          const shippingCost = updated.shippingCost || 0;
          updated.subtotal = subtotal;
          updated.discountTotal = discountTotal;
          updated.taxTotal = taxTotal;
          updated.grandTotal = netTaxable + taxTotal + shippingCost;
        }
        return updated;
      })
    );
    showToast('Quotation Updated', 'Zoho quotation changes have been saved.');
  };

  const deleteZohoQuotation = (id: string) => {
    setZohoQuotations((prev) => prev.filter((q) => q.id !== id));
    showToast('Quotation Deleted', 'Zoho quotation record was removed.', 'info');
  };

  const duplicateZohoQuotation = (id: string): ZohoQuotation => {
    const original = zohoQuotations.find((q) => q.id === id);
    if (!original) throw new Error('Quotation not found');
    const newQuote = createZohoQuotation({
      ...original,
      quoteNumber: `${zohoSettings.defaultQuotePrefix || 'ZOHO-QT-2026'}-${String(zohoQuotations.length + 1).padStart(4, '0')}`,
      status: 'Draft',
      zohoSyncStatus: 'local_only',
      zohoEstimateId: undefined,
      customerName: `${original.customerName} (Copy)`
    });
    showToast('Quotation Duplicated', `Created copy ${newQuote.quoteNumber}`);
    return newQuote;
  };

  const updateZohoQuoteStatus = (id: string, status: ZohoQuoteStatus) => {
    updateZohoQuotation(id, { status });
  };

  const convertZohoQuoteToOrder = (quoteId: string): Order => {
    const quote = zohoQuotations.find((q) => q.id === quoteId);
    if (!quote) throw new Error('Quotation not found');

    const newOrderId = `PX-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    // Map quotation items to cart items
    const cartItems: CartItem[] = quote.items.map((item) => {
      let matchedProduct = products.find((p) => p.id === item.productId || p.name.toLowerCase() === item.name.toLowerCase());
      if (!matchedProduct) {
        matchedProduct = {
          id: `custom-prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: item.name,
          category: (item.category as ProductCategory) || 'Printed T-Shirts',
          price: item.unitPrice,
          rating: 5.0,
          reviewCount: 1,
          image: '/assets/images/rollup_banner_8500_1785222380932.jpg',
          description: item.description,
          features: ['Custom Commercial Print Order via Zoho Quotes'],
          stockCount: 999
        };
      }
      return {
        product: matchedProduct,
        quantity: item.quantity,
        calculatedPrice: item.unitPrice,
        customization: {
          quantity: item.quantity,
          instructions: `${item.description} | ${item.artworkNotes || ''}`,
          selectedSize: item.selectedSize,
          selectedFinish: item.selectedFinish
        }
      };
    });

    const newOrder: Order = {
      id: newOrderId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      customerEmail: quote.customerEmail,
      deliveryCity: 'Nairobi',
      deliveryAddress: quote.deliveryLocation || quote.billingAddress || 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
      deliveryType: quote.deliveryType === 'CBD Workshop Pickup' ? 'Pickup Station' : 'Express Home Delivery',
      items: cartItems,
      subtotal: quote.subtotal - quote.discountTotal,
      shippingFee: quote.shippingCost,
      totalAmount: quote.grandTotal,
      paymentMethod: 'M-Pesa',
      paymentStatus: 'Pending',
      orderStatus: 'Order Received by Admin',
      createdAt: now,
      estimatedDelivery: 'Within 24-48 Hours',
      trackingHistory: [
        {
          status: 'Order Placed',
          timestamp: 'Just now',
          completed: true,
          description: `Quote ${quote.quoteNumber} converted to active commercial order.`
        },
        {
          status: 'Order Received by Admin',
          timestamp: 'Just now',
          completed: true,
          description: 'Acknowledged and queued for production pre-press at Gatkim Complex.'
        }
      ]
    };

    setOrders((prev) => [newOrder, ...prev]);
    updateZohoQuotation(quoteId, { status: 'Converted to Order', convertedOrderId: newOrderId });

    // Also create admin alert
    const notif: AdminNotification = {
      id: `notif-ord-${Date.now()}`,
      type: 'order_placed',
      title: `Converted Zoho Quote #${quote.quoteNumber} to Order`,
      message: `${quote.customerName} quotation converted to live Order #${newOrderId} (KSh ${quote.grandTotal.toLocaleString()}).`,
      timestamp: 'Just now',
      timeAgo: 'Just now',
      read: false,
      status: 'accepted',
      referenceId: newOrderId,
      referenceData: {
        customerName: quote.customerName,
        customerPhone: quote.customerPhone,
        customerEmail: quote.customerEmail,
        companyName: quote.companyName,
        amount: quote.grandTotal,
        itemsCount: quote.items.length,
        itemsSummary: quote.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
        deliveryCity: 'Nairobi',
        deliveryType: quote.deliveryType,
        paymentMethod: 'M-Pesa',
        paymentStatus: 'Pending'
      },
      acceptedAt: new Date().toISOString(),
      acceptedBy: 'Admin (Zoho Quotes Engine)',
      actionTakenNotes: `Quotation ${quote.quoteNumber} converted into production order.`
    };
    setAdminNotifications((prev) => [notif, ...prev]);
    playNotificationSound('order');

    showToast('Quote Converted to Live Order!', `Order #${newOrderId} created. View in Order Queue.`);
    return newOrder;
  };

  const updateZohoSettings = (newSettings: Partial<ZohoSettings>) => {
    setZohoSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Zoho Settings Updated', 'Zoho Books / Invoice integration parameters saved.');
  };

  const syncQuoteToZoho = async (quoteId: string): Promise<boolean> => {
    const quote = zohoQuotations.find((q) => q.id === quoteId);
    if (!quote) return false;

    // Simulate real Zoho Books API synchronization
    await new Promise((resolve) => setTimeout(resolve, 900));
    const generatedEstimateId = `EST-ZH-${Math.floor(1000000 + Math.random() * 9000000)}`;

    updateZohoQuotation(quoteId, {
      zohoSyncStatus: 'synced',
      zohoEstimateId: generatedEstimateId
    });

    showToast('Zoho Cloud Sync Complete!', `Quotation ${quote.quoteNumber} synchronized to Zoho Books as Estimate #${generatedEstimateId}`);
    return true;
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
        inquiries,
        reviews,
        currentUser,
        wpSettings,
        activeModal,
        selectedProductForDetail,
        activeTrackingId,
        toasts,
        activeView,
        isDbConnected,
        isGuestBrowsing,
        setIsGuestBrowsing,
        setSelectedCategory,
        setSearchQuery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        loginAsUser,
        loginWithGoogle,
        loginWithFacebook,
        loginAsAdmin,
        logout,
        createOrder,
        updateOrderStatus,
        setActiveTrackingId,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        likeReview,
        updateWpSettings,
        whatsappThreads,
        botRules,
        activeThreadId,
        isWhatBotGlobalActive,
        setActiveThreadId,
        setIsWhatBotGlobalActive,
        sendMessageToThread,
        toggleThreadBot,
        updateThreadStatus,
        createNewThread,
        addBotRule,
        updateBotRule,
        deleteBotRule,
        toggleBotRule,
        simulateIncomingCustomerMessage,
        customerContacts,
        smsTemplates,
        emailTemplates,
        bulkCampaigns,
        addCustomerContact,
        updateCustomerContact,
        deleteCustomerContact,
        importCustomerContacts,
        addSmsTemplate,
        updateSmsTemplate,
        deleteSmsTemplate,
        addEmailTemplate,
        updateEmailTemplate,
        deleteEmailTemplate,
        sendBulkSmsCampaign,
        sendBulkEmailCampaign,
        deleteCampaign,
        adminNotifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        acceptOrderFromNotification,
        acceptInquiryFromNotification,
        declineNotification,
        deleteNotification,
        clearAllNotifications,
        simulateIncomingOrderNotification,
        simulateIncomingInquiryNotification,
        zohoQuotations,
        zohoSettings,
        createZohoQuotation,
        updateZohoQuotation,
        deleteZohoQuotation,
        duplicateZohoQuotation,
        updateZohoQuoteStatus,
        convertZohoQuoteToOrder,
        updateZohoSettings,
        syncQuoteToZoho,
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
