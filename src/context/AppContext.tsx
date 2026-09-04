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
  ZohoQuoteStatus,
  RegisteredMember
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_REVIEWS, 
  MOCK_ORDERS, 
  DEFAULT_WORDPRESS_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_INQUIRIES,
  INITIAL_WHATSAPP_THREADS,
  INITIAL_BOT_RULES,
  INITIAL_ADMIN_NOTIFICATIONS,
  DEFAULT_ZOHO_SETTINGS,
  INITIAL_ZOHO_QUOTATIONS,
  INITIAL_REGISTERED_MEMBERS
} from '../data/initialData';
import { playNotificationSound } from '../utils/audioNotification';
import {
  INITIAL_SMS_TEMPLATES,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_CUSTOM_CONTACTS,
  INITIAL_CAMPAIGNS
} from '../data/bulkTemplates';
import {
  safeGetLocalStorage,
  safeSetLocalStorage
} from '../utils/storage';
import {
  subscribeProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeOrders,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  subscribeMembers,
  saveMemberToFirestore,
  deleteMemberFromFirestore,
  subscribeReviews,
  saveReviewToFirestore,
  subscribeWpSettings,
  saveWpSettingsToFirestore,
  subscribeCategories,
  saveCategoriesToFirestore,
  setAdminCustomProductImage,
  getAdminCustomProductImages,
} from '../services/firestoreService';
import {
  sendOrderConfirmationToGmail,
  sendOrderStatusUpdateToGmail,
  ADMIN_OFFICIAL_GMAIL
} from '../services/emailService';

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
  theme: 'light' | 'dark';

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setIsGuestBrowsing: (val: boolean) => void;
  setSelectedCategory: (cat: ProductCategory) => void;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, quantity: number, customization?: CustomArtwork) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  
  // Auth
  loginAsUser: (userData?: { name?: string; email?: string; phone?: string }) => void;
  loginWithGoogle: (customData?: { name?: string; email?: string; avatar?: string; phone?: string }) => void;
  loginWithFacebook: (customData?: { name?: string; email?: string; avatar?: string; phone?: string }) => void;
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
  addCategory: (name: string) => boolean;
  removeCategory: (name: string, reassignTo?: ProductCategory) => boolean;
  renameCategory: (oldName: string, newName: string) => boolean;
  resetCategories: () => void;
  
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
    adminEmail?: string;
  }) => Promise<BulkCampaign>;
  sendBulkEmailCampaign: (data: {
    title: string;
    targetAudience: BulkCampaign['targetAudience'];
    audienceLabel: string;
    recipients: CustomerContact[];
    subject: string;
    preheader: string;
    template: BulkEmailTemplate;
    adminEmail?: string;
  }) => Promise<BulkCampaign>;
  deleteCampaign: (campaignId: string) => void;

  // Admin Notification Center & Real-Time Alerts
  adminNotifications: AdminNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  acceptOrderDirectly: (orderId: string, customNote?: string) => void;
  acceptOrderFromNotification: (notificationId: string, orderId: string, customNote?: string) => void;
  acceptInquiryFromNotification: (notificationId: string, inquiryId: string, quoteNote?: string) => void;
  declineNotification: (notificationId: string, reason?: string) => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  clearAllOrders: () => void;
  simulateIncomingOrderNotification: () => void;
  simulateIncomingInquiryNotification: () => void;

  // Zoho Quotations & Invoice Engine
  zohoQuotations: ZohoQuotation[];
  zohoSettings: ZohoSettings;
  createZohoQuotation: (quoteData: Partial<ZohoQuotation>) => ZohoQuotation;
  updateZohoQuotation: (id: string, updates: Partial<ZohoQuotation>) => void;
  deleteZohoQuotation: (id: string) => void;
  clearAllQuotations: () => void;
  duplicateZohoQuotation: (id: string) => ZohoQuotation | null;
  updateZohoQuoteStatus: (id: string, status: ZohoQuoteStatus) => void;
  convertZohoQuoteToOrder: (quoteId: string) => Order | null;
  updateZohoSettings: (newSettings: Partial<ZohoSettings>) => void;
  syncQuoteToZoho: (quoteId: string) => Promise<boolean>;

  // Registered Members Database & Management
  registeredMembers: RegisteredMember[];
  addRegisteredMember: (memberData: Omit<RegisteredMember, 'id' | 'createdAt'>) => RegisteredMember;
  updateRegisteredMember: (memberId: string, updates: Partial<RegisteredMember>) => void;
  deleteRegisteredMember: (memberId: string) => void;
  deleteOrder: (orderId: string) => void;

  // Gmail Order Confirmation & Notification Engine (from woodynatdesigners12@gmail.com)
  sendOrderConfirmationEmail: (orderId: string, customRecipient?: string, customNote?: string) => Promise<{ success: boolean; message?: string }>;
  sendOrderStatusUpdateEmail: (orderId: string, stage: OrderStatus, customRecipient?: string, customNote?: string) => Promise<{ success: boolean; message?: string }>;

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
    const customImages = safeGetLocalStorage<Record<string, string>>('pixelprint_admin_product_images', {});
    const parsed = safeGetLocalStorage<Product[] | null>('pixelprint_products', null);
    if (parsed && Array.isArray(parsed)) {
      return parsed.map((p) => {
        if (customImages[p.id] && customImages[p.id].trim() !== '') {
          return { ...p, image: customImages[p.id] };
        }
        if (p.image && p.image.trim() !== '') {
          if (p.image.startsWith('/src/assets/')) {
            return { ...p, image: p.image.replace('/src/assets/', '/assets/') };
          }
          return p;
        }
        const match = INITIAL_PRODUCTS.find((initP) => initP.id === p.id);
        if (match && match.image) {
          return { ...p, image: match.image };
        }
        return p;
      });
    }
    return INITIAL_PRODUCTS.map((p) => customImages[p.id] ? { ...p, image: customImages[p.id] } : p);
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeGetLocalStorage<CartItem[]>('pixelprint_cart', []);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = safeGetLocalStorage<Order[]>('pixelprint_orders', []);
    return Array.isArray(saved) ? saved.filter((o) => !o.id.startsWith('PX-982') && !o.id.startsWith('PX-771') && !o.id.startsWith('PX-883')) : [];
  });

  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(() => {
    return safeGetLocalStorage<CustomerInquiry[]>('pixelprint_inquiries', INITIAL_INQUIRIES);
  });

  // WhatsApp Threads & Bot Rules
  const [whatsappThreads, setWhatsappThreads] = useState<WhatsAppChatThread[]>(() => {
    return safeGetLocalStorage<WhatsAppChatThread[]>('pixelprint_whatsapp_threads', INITIAL_WHATSAPP_THREADS);
  });

  const [botRules, setBotRules] = useState<BotRule[]>(() => {
    return safeGetLocalStorage<BotRule[]>('pixelprint_bot_rules', INITIAL_BOT_RULES);
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    return INITIAL_WHATSAPP_THREADS[0]?.id || null;
  });

  const [isWhatBotGlobalActive, setIsWhatBotGlobalActive] = useState<boolean>(true);

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    return safeGetLocalStorage<CustomerReview[]>('pixelprint_reviews', INITIAL_REVIEWS);
  });

  const [wpSettings, setWpSettings] = useState<WordPressSettings>(() => {
    const parsed = safeGetLocalStorage<WordPressSettings | null>('pixelprint_wp_settings', null);
    const savedCustomLogo = safeGetLocalStorage<string | null>('pixelprint_admin_custom_logo', null);
    if (parsed) {
      if (parsed.companyAddress && (parsed.companyAddress.includes('Ronald Ngala') || parsed.companyAddress.includes('complex building'))) {
        parsed.companyAddress = 'Temple Road Gatkim Complex Building fourth floor Wing B Room 4B1';
      }
      if (savedCustomLogo && (!parsed.siteLogo || parsed.siteLogo.trim() === '')) {
        parsed.siteLogo = savedCustomLogo;
      }
      return parsed;
    }
    return {
      ...DEFAULT_WORDPRESS_SETTINGS,
      siteLogo: savedCustomLogo || DEFAULT_WORDPRESS_SETTINGS.siteLogo || '',
    };
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = safeGetLocalStorage<UserProfile | null>('pixelprint_user', null);
    if (saved && (saved.name === 'John Doe' || !saved.name)) {
      if (saved.email && saved.email.includes('@')) {
        saved.name = saved.email.split('@')[0].replace(/[._-]/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
      } else {
        saved.name = 'Registered Customer';
      }
      safeSetLocalStorage('pixelprint_user', saved);
    }
    return saved;
  });

  // Bulk SMS & Email Campaign Studio State
  const [customerContacts, setCustomerContacts] = useState<CustomerContact[]>(() => {
    return safeGetLocalStorage<CustomerContact[]>('pixelprint_customer_contacts', INITIAL_CUSTOM_CONTACTS);
  });

  const [smsTemplates, setSmsTemplates] = useState<BulkSmsTemplate[]>(() => {
    return safeGetLocalStorage<BulkSmsTemplate[]>('pixelprint_sms_templates', INITIAL_SMS_TEMPLATES);
  });

  const [emailTemplates, setEmailTemplates] = useState<BulkEmailTemplate[]>(() => {
    return safeGetLocalStorage<BulkEmailTemplate[]>('pixelprint_email_templates', INITIAL_EMAIL_TEMPLATES);
  });

  const [bulkCampaigns, setBulkCampaigns] = useState<BulkCampaign[]>(() => {
    return safeGetLocalStorage<BulkCampaign[]>('pixelprint_bulk_campaigns', INITIAL_CAMPAIGNS);
  });

  // Admin Notification Center State
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    const saved = safeGetLocalStorage<AdminNotification[]>('pixelprint_admin_notifications', []);
    return Array.isArray(saved) ? saved.filter((n) => !n.id.startsWith('notif-ord-101') && !n.id.startsWith('notif-inq-102')) : [];
  });

  // Zoho Quotations & Invoice Engine State (Strictly holds ONLY quotations explicitly created by the Admin)
  const [zohoQuotations, setZohoQuotations] = useState<ZohoQuotation[]>(() => {
    const saved = safeGetLocalStorage<ZohoQuotation[]>('pixelprint_zoho_quotations', []);
    const initial = Array.isArray(saved) ? saved : [];
    // Ensure no automatically generated mock quotes exist; only admin-generated quotes are retained
    return initial
      .filter((q) => !['quote-001', 'quote-002', 'quote-003'].includes(q.id))
      .map((q) => ({
        ...q,
        quoteNumber: q.quoteNumber ? q.quoteNumber.replace(/^(ZOHO-QT|WQ)/, 'WNAT') : 'WNAT-2026-0001'
      }));
  });

  // Registered Members Database State (Stores ONLY genuinely registered users or admin-created members)
  const [registeredMembers, setRegisteredMembers] = useState<RegisteredMember[]>(() => {
    const saved = safeGetLocalStorage<RegisteredMember[]>('pixelprint_registered_members', []);
    return Array.isArray(saved) ? saved.filter((m) => !['mem-001', 'mem-002', 'mem-003', 'mem-004', 'mem-005'].includes(m.id)) : [];
  });

  const [zohoSettings, setZohoSettings] = useState<ZohoSettings>(() => {
    const parsed = safeGetLocalStorage<Partial<ZohoSettings> | null>('pixelprint_zoho_settings', null);
    if (parsed) {
      return {
        ...DEFAULT_ZOHO_SETTINGS,
        ...parsed,
        defaultQuotePrefix: (parsed.defaultQuotePrefix || 'WNAT-2026').replace(/^(ZOHO-QT|WQ)/, 'WNAT'),
        accountEmail: parsed.accountEmail || 'woodynatdesigners12@gmail.com',
        notificationEmail: parsed.notificationEmail || 'woodynatdesigners12@gmail.com',
        senderName: parsed.senderName || 'Woodynat Designers Limited'
      };
    }
    return DEFAULT_ZOHO_SETTINGS;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const cached = safeGetLocalStorage<ProductCategory[]>('pixelprint_categories', INITIAL_CATEGORIES);
    return cached && cached.length > 0 ? cached : INITIAL_CATEGORIES;
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

  // Theme Management (Light / Dark Mode)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const savedTheme = safeGetLocalStorage<'light' | 'dark' | null>('pixelprint_theme', null);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    safeSetLocalStorage('pixelprint_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Firestore Real-time Subscriptions
  useEffect(() => {
    const unsubProducts = subscribeProducts((fetched) => {
      setProducts((prev) => {
        const customImages = safeGetLocalStorage<Record<string, string>>('pixelprint_admin_product_images', {});
        const merged = fetched.map((p) => {
          if (customImages[p.id] && customImages[p.id].trim() !== '') {
            return { ...p, image: customImages[p.id] };
          }
          const prevMatch = prev.find(item => item.id === p.id);
          if (prevMatch?.image && (!p.image || p.image.trim() === '')) {
            return { ...p, image: prevMatch.image };
          }
          return p;
        });
        safeSetLocalStorage('pixelprint_products', merged);
        return merged;
      });
      setIsDbConnected(true);
    });

    const unsubOrders = subscribeOrders((fetched) => {
      setOrders(fetched);
    });

    const unsubReviews = subscribeReviews((fetched) => {
      setReviews(fetched);
    });

    const unsubMembers = subscribeMembers((fetched) => {
      setRegisteredMembers(fetched);
      safeSetLocalStorage('pixelprint_registered_members', fetched);
    });

    const unsubWp = subscribeWpSettings((fetched) => {
      setWpSettings((prev) => {
        const savedCustomLogo = safeGetLocalStorage<string | null>('pixelprint_admin_custom_logo', null);
        const resolvedLogo = fetched.siteLogo || (savedCustomLogo || prev.siteLogo || '');
        const merged: WordPressSettings = {
          ...fetched,
          siteLogo: resolvedLogo
        };
        safeSetLocalStorage('pixelprint_wp_settings', merged);
        return merged;
      });
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubMembers();
      unsubReviews();
      unsubWp();
    };
  }, []);

  // Categories subscription from Firestore
  useEffect(() => {
    const unsubCategories = subscribeCategories((fetchedCategories) => {
      if (fetchedCategories && fetchedCategories.length > 0) {
        setCategories(fetchedCategories);
      }
    });

    return () => {
      unsubCategories();
    };
  }, []);

  // Save categories to localStorage
  useEffect(() => {
    safeSetLocalStorage('pixelprint_categories', categories);
  }, [categories]);

  // Save to localStorage as backup
  useEffect(() => {
    safeSetLocalStorage('pixelprint_products', products);
  }, [products]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_cart', cart);
  }, [cart]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_inquiries', inquiries);
  }, [inquiries]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_whatsapp_threads', whatsappThreads);
  }, [whatsappThreads]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_bot_rules', botRules);
  }, [botRules]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_wp_settings', wpSettings);
  }, [wpSettings]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_registered_members', registeredMembers);
  }, [registeredMembers]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_customer_contacts', customerContacts);
  }, [customerContacts]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_sms_templates', smsTemplates);
  }, [smsTemplates]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_email_templates', emailTemplates);
  }, [emailTemplates]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_bulk_campaigns', bulkCampaigns);
  }, [bulkCampaigns]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_admin_notifications', adminNotifications);
  }, [adminNotifications]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_zoho_quotations', zohoQuotations);
  }, [zohoQuotations]);

  useEffect(() => {
    safeSetLocalStorage('pixelprint_zoho_settings', zohoSettings);
  }, [zohoSettings]);

  const unreadNotificationsCount = adminNotifications.filter((n) => !n.read || n.status === 'pending').length;

  useEffect(() => {
    if (currentUser) {
      safeSetLocalStorage('pixelprint_user', currentUser);
    } else {
      try {
        localStorage.removeItem('pixelprint_user');
      } catch (e) {
        console.warn('Failed to remove user from localStorage', e);
      }
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

  // Auth Handlers & Registered Member Recording
  const recordRegisteredMember = (user: UserProfile) => {
    if (!user || !user.email) return;
    const cleanEmail = user.email.toLowerCase().trim();
    const nowIso = new Date().toISOString();

    setRegisteredMembers((prev) => {
      const existingIdx = prev.findIndex((m) => m.email.toLowerCase() === cleanEmail);
      let updatedList: RegisteredMember[];

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const updatedMember: RegisteredMember = {
          ...existing,
          name: (user.name && user.name !== 'John Doe') ? user.name : existing.name,
          phone: user.phone || existing.phone,
          avatar: user.avatar || existing.avatar,
          provider: user.provider || existing.provider,
          role: existing.role || user.role || 'user',
          lastActive: nowIso,
        };
        updatedList = [...prev];
        updatedList[existingIdx] = updatedMember;
        saveMemberToFirestore(updatedMember);
      } else {
        const newMember: RegisteredMember = {
          id: user.id || `mem-${Date.now().toString().slice(-6)}`,
          name: user.name,
          email: cleanEmail,
          phone: user.phone || '',
          role: user.role || 'user',
          avatar: user.avatar || '',
          provider: user.provider || 'email',
          status: 'active',
          createdAt: nowIso,
          companyName: '',
          city: 'Nairobi',
          notes: `Registered via ${user.provider === 'google' ? 'Gmail / Google' : user.provider === 'facebook' ? 'Facebook' : 'Email / Phone'}`,
          ordersCount: 0,
          totalSpend: 0,
          lastActive: nowIso
        };
        updatedList = [newMember, ...prev];
        saveMemberToFirestore(newMember);
      }

      safeSetLocalStorage('pixelprint_registered_members', updatedList);
      return updatedList;
    });
  };

  const loginAsUser = (userData?: { name?: string; email?: string; phone?: string }) => {
    const rawEmail = (userData?.email || 'client@woodynat.co.ke').trim().toLowerCase();
    
    // Check saved user profiles in local registry
    const savedProfiles = safeGetLocalStorage<Record<string, { name: string; phone?: string; avatar?: string }>>('pixelprint_user_registry', {});
    const existingProfile = savedProfiles[rawEmail];

    let resolvedName = userData?.name?.trim();
    if (!resolvedName || resolvedName === 'John Doe') {
      if (existingProfile?.name && existingProfile.name !== 'John Doe') {
        resolvedName = existingProfile.name;
      } else if (rawEmail.includes('@')) {
        const handle = rawEmail.split('@')[0];
        resolvedName = handle.replace(/[._-]/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
      } else {
        resolvedName = 'Registered Customer';
      }
    }

    const resolvedPhone = userData?.phone || existingProfile?.phone || '+254712998877';
    const avatar = existingProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    savedProfiles[rawEmail] = {
      name: resolvedName,
      phone: resolvedPhone,
      avatar,
    };
    safeSetLocalStorage('pixelprint_user_registry', savedProfiles);

    const user: UserProfile = {
      id: `user-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      name: resolvedName,
      email: rawEmail,
      phone: resolvedPhone,
      role: 'user',
      provider: 'email',
      avatar,
    };
    setCurrentUser(user);
    recordRegisteredMember(user);
    setActiveModal(null);
    showToast(`Welcome, ${user.name}! 👋`, 'Logged in to Woodynat Customer Account.');
  };

  const loginWithGoogle = (customData?: { name?: string; email?: string; avatar?: string; phone?: string }) => {
    const defaultEmail = (customData?.email || 'client.woodynat@gmail.com').trim().toLowerCase();
    const savedProfiles = safeGetLocalStorage<Record<string, { name: string; phone?: string; avatar?: string }>>('pixelprint_user_registry', {});
    const existingProfile = savedProfiles[defaultEmail];

    let defaultName = customData?.name?.trim();
    if (!defaultName || defaultName === 'John Doe' || defaultName === 'Google User') {
      if (existingProfile?.name && existingProfile.name !== 'John Doe') {
        defaultName = existingProfile.name;
      } else {
        const handle = defaultEmail.split('@')[0];
        defaultName = handle.replace(/[._-]/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) || 'Google User';
      }
    }

    const resolvedPhone = customData?.phone || existingProfile?.phone || '+254700123456';
    const avatar = customData?.avatar || existingProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    savedProfiles[defaultEmail] = {
      name: defaultName,
      phone: resolvedPhone,
      avatar,
    };
    safeSetLocalStorage('pixelprint_user_registry', savedProfiles);

    const user: UserProfile = {
      id: `google-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      name: defaultName,
      email: defaultEmail,
      phone: resolvedPhone,
      role: 'user',
      provider: 'google',
      avatar,
    };
    setCurrentUser(user);
    recordRegisteredMember(user);
    setActiveModal(null);
    showToast(`Signed In with Google! 🚀`, `Welcome ${user.name}! Your Gmail account is connected.`);
  };

  const loginWithFacebook = (customData?: { name?: string; email?: string; avatar?: string; phone?: string }) => {
    const defaultEmail = (customData?.email || 'customer.fb@woodynat.co.ke').trim().toLowerCase();
    const savedProfiles = safeGetLocalStorage<Record<string, { name: string; phone?: string; avatar?: string }>>('pixelprint_user_registry', {});
    const existingProfile = savedProfiles[defaultEmail];

    let defaultName = customData?.name?.trim();
    if (!defaultName || defaultName === 'John Doe' || defaultName === 'Facebook Customer') {
      if (existingProfile?.name && existingProfile.name !== 'John Doe') {
        defaultName = existingProfile.name;
      } else {
        const handle = defaultEmail.split('@')[0];
        defaultName = handle.replace(/[._-]/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) || 'Facebook Customer';
      }
    }

    const resolvedPhone = customData?.phone || existingProfile?.phone || '+254711889900';
    const avatar = customData?.avatar || existingProfile?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80';

    savedProfiles[defaultEmail] = {
      name: defaultName,
      phone: resolvedPhone,
      avatar,
    };
    safeSetLocalStorage('pixelprint_user_registry', savedProfiles);

    const user: UserProfile = {
      id: `fb-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      name: defaultName,
      email: defaultEmail,
      phone: resolvedPhone,
      role: 'user',
      provider: 'facebook',
      avatar,
    };
    setCurrentUser(user);
    recordRegisteredMember(user);
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

  // Orders (Genuine registered user orders only)
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingHistory' | 'orderStatus' | 'paymentStatus'>): Order => {
    if (!currentUser) {
      showToast('Registration Required 🔒', 'Only registered users are permitted to place orders. Please sign in or create an account.', 'error');
      throw new Error('Only registered users are permitted to place orders.');
    }

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

    const isRegistered = true;
    const resolvedUserId = currentUser.id;
    const resolvedCustomerName = (currentUser.name && currentUser.name.trim() !== '' && currentUser.name !== 'John Doe')
      ? currentUser.name.trim()
      : (orderData.customerName && orderData.customerName.trim() !== '' && orderData.customerName !== 'John Doe'
          ? orderData.customerName.trim()
          : (currentUser.email ? currentUser.email.split('@')[0].replace(/[._-]/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) : 'Registered Customer'));
    const resolvedUserEmail = currentUser.email || orderData.customerEmail;
    const resolvedUserPhone = currentUser.phone || orderData.customerPhone;
    const resolvedUserAvatar = currentUser.avatar;
    const resolvedUserProvider = currentUser.provider;

    const newOrder: Order = {
      ...orderData,
      id,
      customerName: resolvedCustomerName,
      customerPhone: resolvedUserPhone,
      userId: resolvedUserId,
      isRegisteredUser: true,
      userEmail: resolvedUserEmail,
      userAvatar: resolvedUserAvatar,
      userProvider: resolvedUserProvider,
      orderStatus: 'Order Placed',
      paymentStatus: 'Paid',
      createdAt: nowStr,
      estimatedDelivery: 'Tomorrow, 02:00 PM',
      trackingHistory,
      emailConfirmationSent: false,
      emailConfirmationRecipient: resolvedUserEmail
    };

    saveOrderToFirestore(newOrder);

    // Update Registered Member metrics if order placed by registered user
    if (resolvedUserEmail) {
      const cleanEmail = resolvedUserEmail.toLowerCase().trim();
      setRegisteredMembers((prev) => {
        const memberIdx = prev.findIndex((m) => m.email.toLowerCase() === cleanEmail);
        if (memberIdx >= 0) {
          const m = prev[memberIdx];
          const updatedM: RegisteredMember = {
            ...m,
            ordersCount: (m.ordersCount || 0) + 1,
            totalSpend: (m.totalSpend || 0) + newOrder.totalAmount,
            lastActive: new Date().toISOString()
          };
          const next = [...prev];
          next[memberIdx] = updatedM;
          saveMemberToFirestore(updatedM);
          safeSetLocalStorage('pixelprint_registered_members', next);
          return next;
        }
        return prev;
      });
    }

    // Auto-dispatch confirmation receipt to Customer's Gmail from woodynatdesigners12@gmail.com
    if (resolvedUserEmail && resolvedUserEmail.includes('@')) {
      sendOrderConfirmationToGmail(newOrder, resolvedUserEmail).then((res) => {
        if (res.success) {
          const sentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';
          const orderWithEmail: Order = {
            ...newOrder,
            emailConfirmationSent: true,
            emailConfirmationSentAt: sentTime,
            emailConfirmationRecipient: resolvedUserEmail,
            emailConfirmationMessageId: res.messageId
          };
          setOrders((prev) => prev.map((o) => (o.id === id ? orderWithEmail : o)));
          saveOrderToFirestore(orderWithEmail);
          showToast('Order Receipt Emailed ✉️', `Confirmation sent to ${resolvedUserEmail} from woodynatdesigners12@gmail.com`);
        }
      }).catch((err) => {
        console.warn('Auto confirmation email notice:', err);
      });
    }

    // Auto-generate Admin Notification for Incoming Order
    const notifId = `notif-ord-${Date.now()}`;
    const newNotif: AdminNotification = {
      id: notifId,
      type: 'order_placed',
      title: `New Order from ${isRegistered ? `Registered User (${newOrder.customerName})` : newOrder.customerName} (#${id})`,
      message: `${isRegistered ? '👤 Registered User' : 'Customer'} ${newOrder.customerName} (${newOrder.customerPhone}${resolvedUserEmail ? ` • ${resolvedUserEmail}` : ''}) placed an order for ${newOrder.items.length} item(s) totaling KSh ${newOrder.totalAmount.toLocaleString()} via ${newOrder.paymentMethod}.`,
      timestamp: 'Just now',
      timeAgo: 'Just now',
      read: false,
      status: 'pending',
      referenceId: id,
      referenceData: {
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        customerEmail: resolvedUserEmail,
        isRegisteredUser: isRegistered,
        userId: resolvedUserId,
        userProvider: resolvedUserProvider,
        userAvatar: resolvedUserAvatar,
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
    showToast('🔔 New Order Alert!', `Order #${id} received from ${newOrder.customerName}${isRegistered ? ' (Registered User)' : ''}. Total: KSh ${newOrder.totalAmount.toLocaleString()}`);

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

      // Auto-notify customer Gmail of stage update from woodynatdesigners12@gmail.com
      const userEmail = targetOrder.userEmail || targetOrder.customerEmail;
      if (userEmail && userEmail.includes('@')) {
        sendOrderStatusUpdateToGmail(updatedOrder, status, userEmail).catch(() => {});
      }

      showToast('Order Status Updated 🚚', `Order ${orderId} progressed to "${status}".`);
    }
  };

  // Product Admin
  const addProduct = (product: Product) => {
    if (product.image && product.image.trim() !== '') {
      setAdminCustomProductImage(product.id, product.image);
    }
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const next = exists ? prev.map((p) => (p.id === product.id ? product : p)) : [...prev, product];
      safeSetLocalStorage('pixelprint_products', next);
      return next;
    });
    saveProductToFirestore(product);
    showToast('Product Created ✨', `${product.name} added to live catalog.`);
  };

  const updateProduct = (updated: Product) => {
    if (updated.image && updated.image.trim() !== '') {
      setAdminCustomProductImage(updated.id, updated.image);
    } else {
      setAdminCustomProductImage(updated.id, null);
    }
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      safeSetLocalStorage('pixelprint_products', next);
      return next;
    });
    saveProductToFirestore(updated);
    showToast('Product Saved 💾', `${updated.name} details updated.`);
  };

  const deleteProduct = (id: string) => {
    setAdminCustomProductImage(id, null);
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      safeSetLocalStorage('pixelprint_products', next);
      return next;
    });
    deleteProductFromFirestore(id);
    showToast('Product Deleted', 'Item removed from catalog.', 'warning');
  };

  // Category Management (Admin)
  const addCategory = (newCatName: string): boolean => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      showToast('Invalid Name', 'Category name cannot be empty.', 'error');
      return false;
    }
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Duplicate Category', `Category "${trimmed}" already exists in the catalogue.`, 'warning');
      return false;
    }
    const updated = [...categories, trimmed as ProductCategory];
    setCategories(updated);
    safeSetLocalStorage('pixelprint_categories', updated);
    saveCategoriesToFirestore(updated);
    showToast('Category Added! 📁', `"${trimmed}" added to catalogue.`);
    return true;
  };

  const removeCategory = (catToRemove: string, reassignTo?: ProductCategory): boolean => {
    if (catToRemove === 'All') {
      showToast('Action Blocked', '"All" is the default root view and cannot be removed.', 'error');
      return false;
    }

    const remainingCategories = categories.filter(c => c !== catToRemove);
    if (remainingCategories.length <= 1) {
      showToast('Action Blocked', 'At least one category must remain in the catalogue.', 'warning');
      return false;
    }

    const fallbackCat: ProductCategory = reassignTo && remainingCategories.includes(reassignTo)
      ? reassignTo
      : (remainingCategories.find(c => c !== 'All') || 'Printed T-Shirts');

    // Update any products that used this category
    const affectedCount = products.filter(p => p.category === catToRemove).length;
    if (affectedCount > 0) {
      setProducts(prev => {
        const next = prev.map(p => p.category === catToRemove ? { ...p, category: fallbackCat } : p);
        safeSetLocalStorage('pixelprint_products', next);
        return next;
      });
      products.forEach(p => {
        if (p.category === catToRemove) {
          saveProductToFirestore({ ...p, category: fallbackCat });
        }
      });
    }

    setCategories(remainingCategories);
    safeSetLocalStorage('pixelprint_categories', remainingCategories);
    saveCategoriesToFirestore(remainingCategories);

    if (selectedCategory === catToRemove) {
      setSelectedCategory('All');
    }

    showToast(
      'Category Removed! 🗑️',
      affectedCount > 0 
        ? `Removed "${catToRemove}". Reassigned ${affectedCount} product(s) to "${fallbackCat}".`
        : `Removed "${catToRemove}" from catalogue.`
    );
    return true;
  };

  const renameCategory = (oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (oldName === 'All') {
      showToast('Action Blocked', '"All" is a system view and cannot be renamed.', 'error');
      return false;
    }
    if (!trimmed) {
      showToast('Invalid Name', 'Category name cannot be empty.', 'error');
      return false;
    }
    if (oldName.toLowerCase() === trimmed.toLowerCase()) {
      return true;
    }
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase())) {
      showToast('Duplicate Category', `A category named "${trimmed}" already exists.`, 'warning');
      return false;
    }

    const updatedCategories = categories.map(c => c === oldName ? (trimmed as ProductCategory) : c);
    setCategories(updatedCategories);
    safeSetLocalStorage('pixelprint_categories', updatedCategories);
    saveCategoriesToFirestore(updatedCategories);

    // Update products in this category
    const affectedCount = products.filter(p => p.category === oldName).length;
    if (affectedCount > 0) {
      setProducts(prev => {
        const next = prev.map(p => p.category === oldName ? { ...p, category: trimmed as ProductCategory } : p);
        safeSetLocalStorage('pixelprint_products', next);
        return next;
      });
      products.forEach(p => {
        if (p.category === oldName) {
          saveProductToFirestore({ ...p, category: trimmed as ProductCategory });
        }
      });
    }

    if (selectedCategory === oldName) {
      setSelectedCategory(trimmed as ProductCategory);
    }

    showToast('Category Renamed! ✏️', `Renamed "${oldName}" to "${trimmed}".`);
    return true;
  };

  const resetCategories = () => {
    setCategories(INITIAL_CATEGORIES);
    safeSetLocalStorage('pixelprint_categories', INITIAL_CATEGORIES);
    saveCategoriesToFirestore(INITIAL_CATEGORIES);
    showToast('Categories Reset 🔄', 'Restored default catalogue categories.');
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
    setWpSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      safeSetLocalStorage('pixelprint_wp_settings', updated);
      if (newSettings.siteLogo !== undefined) {
        if (newSettings.siteLogo && newSettings.siteLogo.trim() !== '') {
          safeSetLocalStorage('pixelprint_admin_custom_logo', newSettings.siteLogo);
        } else {
          try {
            localStorage.removeItem('pixelprint_admin_custom_logo');
          } catch (e) {
            console.debug('Failed to remove custom logo key:', e);
          }
        }
      }
      saveWpSettingsToFirestore(updated);
      return updated;
    });
    showToast('WordPress Settings Saved ⚡', 'Live site branding & logo synchronized.');
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
    adminEmail?: string;
  }): Promise<BulkCampaign> => {
    const campaignId = `camp-sms-${Date.now()}`;
    const sentAt = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + 
      ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const count = data.recipients.length;
    // Simulate high success rate with Kenya telcos (Safaricom / Airtel)
    const deliveredCount = Math.max(1, count - Math.floor(Math.random() * (count > 10 ? 2 : 1)));
    const failedCount = count - deliveredCount;
    const adminEmail = data.adminEmail || wpSettings.companyEmail || 'woodynatdesigners12@gmail.com';

    const campaign: BulkCampaign = {
      id: campaignId,
      title: data.title,
      channel: 'sms',
      targetAudience: data.targetAudience,
      audienceLabel: data.audienceLabel,
      recipientCount: count,
      senderId: data.senderId || 'WOODYNAT',
      adminEmail,
      smsBody: data.smsBody,
      sentAt,
      status: 'completed',
      deliveredCount,
      failedCount,
      openRateEstimate: '98.5%',
      logs: [
        `${new Date().toLocaleTimeString()} - Telco Bulk SMS Gateway authorization authenticated for: ${adminEmail}`,
        `${new Date().toLocaleTimeString()} - Queued ${count} personalized SMS dispatches for audience "${data.audienceLabel}" (Sender ID: ${data.senderId || 'WOODYNAT'})`,
        `${new Date().toLocaleTimeString()} - Safaricom SMPP & Airtel Kenya carrier routes established`,
        `${new Date().toLocaleTimeString()} - Broadcast finalized: ${deliveredCount} Delivered successfully, ${failedCount} unreachable/failed`,
        `${new Date().toLocaleTimeString()} - Dynamic placeholders (e.g. {{customer_name}}, Paybill 247247) compiled and rendered`,
        `${new Date().toLocaleTimeString()} - Detailed SMS delivery confirmation report emailed to ${adminEmail}`
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
    adminEmail?: string;
  }): Promise<BulkCampaign> => {
    const campaignId = `camp-email-${Date.now()}`;
    const sentAt = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + 
      ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const count = data.recipients.length;
    const deliveredCount = Math.max(1, count - Math.floor(Math.random() * (count > 10 ? 2 : 1)));
    const failedCount = count - deliveredCount;
    const adminEmail = data.adminEmail || wpSettings.companyEmail || 'woodynatdesigners12@gmail.com';

    const campaign: BulkCampaign = {
      id: campaignId,
      title: data.title,
      channel: 'email',
      targetAudience: data.targetAudience,
      audienceLabel: data.audienceLabel,
      recipientCount: count,
      adminEmail,
      emailSubject: data.subject,
      emailPreheader: data.preheader,
      emailTemplateId: data.template.id,
      sentAt,
      status: 'completed',
      deliveredCount,
      failedCount,
      openRateEstimate: '72.8%',
      logs: [
        `${new Date().toLocaleTimeString()} - High-Deliverability SMTP Marketing Cluster activated (Sender: Woodynat Designers <${adminEmail}>)`,
        `${new Date().toLocaleTimeString()} - Subject line compiled: "${data.subject}"`,
        `${new Date().toLocaleTimeString()} - Personalizing responsive HTML template for ${count} customer inboxes`,
        `${new Date().toLocaleTimeString()} - Batch dispatch complete: ${deliveredCount} delivered to Gmail/Corporate inboxes, ${failedCount} soft-bounced`,
        `${new Date().toLocaleTimeString()} - Campaign dispatch receipt and audit analytics delivered to ${adminEmail}`
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

  const acceptOrderDirectly = (orderId: string, customNote?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';

    if (targetOrder) {
      const canonicalStepsDescriptions: Record<string, string> = {
        'Order Placed': 'Order placed & M-Pesa payment authorized successfully.',
        'Order Received by Admin': customNote ? `Admin Accepted: ${customNote}` : 'Order acknowledged & accepted by Woodynat production team. Pre-press print queue activated.',
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

      const targetIdx = 1; // 'Order Received by Admin'
      const updatedHistory: Order['trackingHistory'] = canonicalSteps.map((stepName, idx) => {
        const existingStep = targetOrder.trackingHistory?.find(s => s.status === stepName);
        const isCompleted = idx <= targetIdx;

        return {
          status: stepName,
          completed: isCompleted,
          timestamp: isCompleted 
            ? (idx === 1 ? nowFormatted : (existingStep?.timestamp && existingStep.timestamp !== 'Pending' && existingStep.timestamp !== 'Queued' ? existingStep.timestamp : nowFormatted))
            : 'Pending',
          description: idx === 1 && customNote ? `Admin Accepted: ${customNote}` : (existingStep?.description || canonicalStepsDescriptions[stepName] || 'Step processing')
        };
      });

      const updatedOrder: Order = {
        ...targetOrder,
        orderStatus: 'Order Received by Admin',
        acceptedAt: nowFormatted,
        acceptedBy: 'Admin (Woodynat Designers)',
        acceptanceNotes: customNote || 'Order verified and accepted by Admin. Production line activated at Woodynat CBD Workshop.',
        trackingHistory: updatedHistory,
      };

      saveOrderToFirestore(updatedOrder);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

      // Auto-notify customer Gmail that Admin Accepted their order
      const userEmail = targetOrder.userEmail || targetOrder.customerEmail;
      if (userEmail && userEmail.includes('@')) {
        sendOrderStatusUpdateToGmail(updatedOrder, 'Order Received by Admin', userEmail, customNote).catch(() => {});
      }
    }

    setAdminNotifications((prev) =>
      prev.map((n) => {
        if (n.referenceId === orderId) {
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

  const acceptOrderFromNotification = (notificationId: string, orderId: string, customNote?: string) => {
    acceptOrderDirectly(orderId, customNote);
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true, status: 'accepted' } : n))
    );
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
            actionTakenNotes: quoteNote || 'Inquiry acknowledged. Official quotation to be prepared by Admin via Woody-Quote Studio.'
          };
        }
        return n;
      })
    );

    playNotificationSound('accept');
    showToast('Inquiry Acknowledged! 📋', `Inquiry #${inquiryId} acknowledged. Open Woody-Quote Studio to prepare quote.`);
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

  // Gmail Order Confirmation & Notification Actions
  const sendOrderConfirmationEmail = async (orderId: string, customRecipient?: string, customNote?: string): Promise<{ success: boolean; message?: string }> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) {
      return { success: false, message: `Order #${orderId} not found.` };
    }

    const recipient = (customRecipient || targetOrder.userEmail || targetOrder.customerEmail || '').trim();
    if (!recipient || !recipient.includes('@')) {
      showToast('Valid Email Required ⚠️', 'Please provide a valid recipient email (e.g. your Gmail address).', 'warning');
      return { success: false, message: 'Valid recipient email required.' };
    }

    const result = await sendOrderConfirmationToGmail(targetOrder, recipient, customNote);
    if (result.success) {
      const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';
      const updatedOrder: Order = {
        ...targetOrder,
        emailConfirmationSent: true,
        emailConfirmationSentAt: nowFormatted,
        emailConfirmationRecipient: recipient,
        emailConfirmationMessageId: result.messageId
      };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      saveOrderToFirestore(updatedOrder);
      showToast('Confirmation Emailed! ✉️', `Official receipt sent to ${recipient} from woodynatdesigners12@gmail.com`);
      return { success: true, message: `Dispatched to ${recipient}` };
    } else {
      showToast('Email Dispatch 📧', result.error || 'Failed to dispatch email.', 'info');
      return { success: false, message: result.error };
    }
  };

  const sendOrderStatusUpdateEmail = async (orderId: string, stage: OrderStatus, customRecipient?: string, customNote?: string): Promise<{ success: boolean; message?: string }> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, message: 'Order not found' };

    const recipient = (customRecipient || targetOrder.userEmail || targetOrder.customerEmail || '').trim();
    if (!recipient || !recipient.includes('@')) return { success: false, message: 'No recipient email' };

    const result = await sendOrderStatusUpdateToGmail(targetOrder, stage, recipient, customNote);
    if (result.success) {
      showToast('Status Update Emailed! 📧', `Progress notification delivered to ${recipient} from woodynatdesigners12@gmail.com`);
    }
    return { success: result.success, message: result.error };
  };

  const clearAllOrders = () => {
    setOrders([]);
    safeSetLocalStorage('pixelprint_orders', []);
    showToast('Orders Cleared ✨', 'Order list cleared. Admin will receive only genuine orders placed by registered users.', 'info');
  };

  const simulateIncomingOrderNotification = () => {
    showToast('Real Orders Only 🛡️', 'Automated order simulation is disabled. Admin receives only genuine orders placed by registered customers.', 'info');
  };

  const simulateIncomingInquiryNotification = () => {
    const sampleLeads = [
      { name: 'Brian Ombati', company: 'Prime Agro Chemicals Ltd', phone: '0733889900', email: 'brian@primeagro.co.ke', topic: '500 Heavy-Duty Reflective Vests & Caps', cat: 'Reflectors & Aprons' as ProductCategory, qty: 500 },
      { name: 'Dr. Beatrice Nduta', company: 'St. Jude Medical Centre', phone: '0710223344', email: 'info@stjudemed.org', topic: 'Full Hospital Signage, Acrylic Door Plates & Posters', cat: 'Signage' as ProductCategory, qty: 25 },
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
        notes: 'Urgent quotation requested with official company stamp.'
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
    const rawPrefix = zohoSettings.defaultQuotePrefix || 'WNAT-2026';
    const prefix = rawPrefix.replace(/^(ZOHO-QT|WQ)/, 'WNAT');
    const quoteNumber = quoteData.quoteNumber || `${prefix}-${padNumber}`;
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + (quoteData.validityDays || zohoSettings.defaultValidityDays || 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const items = quoteData.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discountPercent / 100)), 0);
    const netAmount = subtotal - discountTotal;
    const shippingCost = quoteData.shippingCost || 0;
    const grandTotal = netAmount + shippingCost;

    const newQuote: ZohoQuotation = {
      id: `woody-qt-${Date.now()}`,
      quoteNumber,
      customerName: quoteData.customerName || 'Customer / Business Lead',
      customerPhone: quoteData.customerPhone || '0797939199',
      customerEmail: quoteData.customerEmail || 'client@example.com',
      companyName: quoteData.companyName || '',
      customerKraPin: '',
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
      taxRate: 0,
      taxTotal: 0,
      shippingCost,
      grandTotal,
      isTaxInclusive: false,
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
    showToast('Woody-Quote Created!', `Quotation ${newQuote.quoteNumber} for ${newQuote.customerName} has been saved.`);
    return newQuote;
  };

  const updateZohoQuotation = (id: string, updates: Partial<ZohoQuotation>) => {
    setZohoQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const updated = { ...q, ...updates, updatedAt: new Date().toISOString() };
        
        // Recalculate totals if items or rates were modified
        if (updates.items || updates.shippingCost !== undefined) {
          const items = updated.items || [];
          const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const discountTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discountPercent / 100)), 0);
          const netAmount = subtotal - discountTotal;
          const shippingCost = updated.shippingCost || 0;
          updated.subtotal = subtotal;
          updated.discountTotal = discountTotal;
          updated.taxRate = 0;
          updated.taxTotal = 0;
          updated.grandTotal = netAmount + shippingCost;
        }
        return updated;
      })
    );
    showToast('Woody-Quote Updated', 'Quotation changes have been saved.');
  };

  const deleteZohoQuotation = (id: string) => {
    setZohoQuotations((prev) => prev.filter((q) => q.id !== id));
    showToast('Quotation Deleted', 'Zoho quotation record was removed.', 'info');
  };

  const clearAllQuotations = () => {
    setZohoQuotations([]);
    safeSetLocalStorage('pixelprint_zoho_quotations', []);
    showToast('Quotations Cleared', 'All quotations removed. Quotations are only created when generated by an Admin.', 'info');
  };

  const duplicateZohoQuotation = (id: string): ZohoQuotation | null => {
    const original = zohoQuotations.find((q) => q.id === id);
    if (!original) {
      showToast('Error', 'Quotation record could not be found.', 'error');
      return null;
    }
    const rawPrefix = zohoSettings.defaultQuotePrefix || 'WNAT-2026';
    const prefix = rawPrefix.replace(/^(ZOHO-QT|WQ)/, 'WNAT');
    const newQuote = createZohoQuotation({
      ...original,
      quoteNumber: `${prefix}-${String(zohoQuotations.length + 1).padStart(4, '0')}`,
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

  const convertZohoQuoteToOrder = (quoteId: string): Order | null => {
    const quote = zohoQuotations.find((q) => q.id === quoteId);
    if (!quote) {
      showToast('Error', 'Quotation record could not be found.', 'error');
      return null;
    }

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

  // Registered Members Database Management
  const addRegisteredMember = (memberData: Omit<RegisteredMember, 'id' | 'createdAt'>): RegisteredMember => {
    const id = `mem-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const newMember: RegisteredMember = {
      ...memberData,
      id,
      createdAt: new Date().toISOString(),
      ordersCount: memberData.ordersCount || 0,
      totalSpend: memberData.totalSpend || 0,
      status: memberData.status || 'active',
      role: memberData.role || 'user',
      provider: memberData.provider || 'manual',
      lastActive: new Date().toISOString()
    };

    setRegisteredMembers((prev) => {
      const updated = [newMember, ...prev.filter((m) => m.email.toLowerCase() !== newMember.email.toLowerCase())];
      safeSetLocalStorage('pixelprint_registered_members', updated);
      return updated;
    });

    saveMemberToFirestore(newMember);

    // Also update local registry
    const savedProfiles = safeGetLocalStorage<Record<string, { name: string; phone?: string; avatar?: string }>>('pixelprint_user_registry', {});
    savedProfiles[newMember.email.toLowerCase()] = {
      name: newMember.name,
      phone: newMember.phone,
      avatar: newMember.avatar,
    };
    safeSetLocalStorage('pixelprint_user_registry', savedProfiles);

    showToast('Member Registered 🎉', `${newMember.name} (${newMember.role}) has been added to the database.`, 'success');
    return newMember;
  };

  const updateRegisteredMember = (memberId: string, updates: Partial<RegisteredMember>) => {
    setRegisteredMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          const merged: RegisteredMember = { ...m, ...updates };
          saveMemberToFirestore(merged);
          return merged;
        }
        return m;
      });
      safeSetLocalStorage('pixelprint_registered_members', updated);
      return updated;
    });
    showToast('Member Updated ✍️', 'Customer profile details updated successfully.', 'success');
  };

  const deleteRegisteredMember = (memberId: string) => {
    const target = registeredMembers.find((m) => m.id === memberId);
    setRegisteredMembers((prev) => {
      const filtered = prev.filter((m) => m.id !== memberId);
      safeSetLocalStorage('pixelprint_registered_members', filtered);
      return filtered;
    });
    deleteMemberFromFirestore(memberId);
    showToast('Member Removed 🗑️', `${target?.name || 'Member'} was removed from the database.`, 'info');
  };

  const deleteOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) => {
      const filtered = prev.filter((o) => o.id !== orderId);
      safeSetLocalStorage('pixelprint_orders', filtered);
      return filtered;
    });
    deleteOrderFromFirestore(orderId);
    showToast('Order Deleted 🗑️', `Order #${orderId} was removed from the database.`, 'info');
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
        registeredMembers,
        addRegisteredMember,
        updateRegisteredMember,
        deleteRegisteredMember,
        deleteOrder,
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
        addCategory,
        removeCategory,
        renameCategory,
        resetCategories,
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
        acceptOrderDirectly,
        acceptOrderFromNotification,
        acceptInquiryFromNotification,
        declineNotification,
        deleteNotification,
        clearAllNotifications,
        clearAllOrders,
        simulateIncomingOrderNotification,
        simulateIncomingInquiryNotification,
        zohoQuotations,
        zohoSettings,
        createZohoQuotation,
        updateZohoQuotation,
        deleteZohoQuotation,
        clearAllQuotations,
        duplicateZohoQuotation,
        updateZohoQuoteStatus,
        convertZohoQuoteToOrder,
        updateZohoSettings,
        syncQuoteToZoho,
        sendOrderConfirmationEmail,
        sendOrderStatusUpdateEmail,
        theme,
        setTheme,
        toggleTheme,
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
