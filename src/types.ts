export type ProductCategory = 
  | 'All'
  | 'Printed T-Shirts'
  | 'Hoodies'
  | 'Reflectors & Aprons'
  | 'Banners & Stickers'
  | 'Branding & Signage'
  | 'Flyers & Posters'
  | 'Eulogies & Memorials';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in KSh or local currency (0 if quote-based)
  isQuoteOnly?: boolean;
  priceDisplay?: string;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  features: string[];
  stockCount: number;
  isFlashDeal?: boolean;
  expressDeliveryAvailable?: boolean; // e.g. 24h for Eulogies or Flyers
  customizationOptions?: {
    sizes?: string[];
    finishes?: string[];
    minQuantity?: number;
  };
}

export interface CustomArtwork {
  fileUrl?: string;
  fileName?: string;
  instructions?: string;
  selectedSize?: string;
  selectedFinish?: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization?: CustomArtwork;
  calculatedPrice: number;
}

export type OrderStatus = 
  | 'Order Placed'
  | 'Order Received'
  | 'Order Received by Admin'
  | 'Design Approved'
  | 'Design Proof Approved'
  | 'Printing & Production'
  | 'Quality Check'
  | 'Out for Delivery'
  | 'Delivered';

export interface TrackingStep {
  status: OrderStatus;
  timestamp: string;
  completed: boolean;
  description: string;
}

export interface Order {
  id: string; // e.g. PX-98241
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryType: 'Pickup Station' | 'Express Home Delivery';
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'M-Pesa';
  paymentReference?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  trackingHistory: TrackingStep[];
}

export interface CustomerReview {
  id: string;
  customerName: string;
  productCategory: ProductCategory;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
  photoUrl?: string;
  likes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  avatar?: string;
  provider?: 'email' | 'google' | 'facebook';
}

export interface WordPressSettings {
  siteTitle: string;
  tagline: string;
  siteLogo?: string;
  whatsappNumber: string;
  supportPhone: string;
  companyEmail: string;
  paybillNumber: string;
  paybillAccount: string;
  companyAddress: string;
  companyCity: string;
  topBannerText: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  primaryColor: string;
  wpWooSyncEnabled: boolean;
  wpRestEndpoint: string;
  heroHeadline: string;
  heroSubheadline: string;
  mpesaEnvironment?: 'sandbox' | 'production';
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaPasskey?: string;
}

export interface CustomerInquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName?: string;
  inquiryTopic: string;
  notes?: string;
  createdAt: string;
  status: 'New' | 'Catalogue Sent' | 'Quoted' | 'Approved' | 'Completed';
  preferredCategory?: ProductCategory;
  requestedQuantity?: number;
}

export interface CataloguePrintConfig {
  title: string;
  subtitle?: string;
  clientName?: string;
  layoutStyle?: 'grid' | 'table' | 'cards' | 'specsheet';
  showPrices?: boolean;
  showImages?: boolean;
  showFeatures?: boolean;
  showPaybillInfo?: boolean;
  showTerms?: boolean;
  discountPercentage?: number;
  customNotes?: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'customer' | 'agent' | 'bot';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachmentType?: 'quote' | 'image' | 'payment_request' | 'catalogue' | 'proof';
  attachmentData?: {
    productName?: string;
    amount?: number;
    pdfTitle?: string;
    imageUrl?: string;
    paybill?: string;
    account?: string;
  };
}

export interface WhatsAppChatThread {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  companyName?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  topic: string;
  status: 'active' | 'quoted' | 'paid' | 'proof_pending' | 'resolved';
  isBotActive: boolean;
  messages: WhatsAppMessage[];
}

export interface BotRule {
  id: string;
  keyword: string;
  title: string;
  response: string;
  enabled: boolean;
  categoryTag?: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName?: string;
  tags: string[];
  source: 'order' | 'inquiry' | 'whatsapp' | 'manual' | 'csv_import';
  subscribedEmail: boolean;
  subscribedSms: boolean;
  createdAt: string;
  totalOrdersCount?: number;
  lastActiveDate?: string;
}

export interface BulkSmsTemplate {
  id: string;
  title: string;
  category: 'Promotion' | 'Memorial' | 'Corporate' | 'Payment' | 'Location' | 'Transactional';
  body: string;
}

export interface BulkEmailTemplate {
  id: string;
  title: string;
  category: 'Promotion' | 'Memorial' | 'Corporate' | 'Catalogue' | 'Payment' | 'Custom';
  subject: string;
  preheader: string;
  headline: string;
  heroImage?: string;
  badgeText?: string;
  bodyParagraphs: string[];
  bulletPoints?: string[];
  ctaButtonText: string;
  ctaButtonUrl: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  footerNote?: string;
}

export interface BulkCampaign {
  id: string;
  title: string;
  channel: 'sms' | 'email' | 'both';
  targetAudience: 'all' | 'orders' | 'corporate' | 'inquiries' | 'whatsapp' | 'custom';
  audienceLabel: string;
  recipientCount: number;
  senderId?: string;
  smsBody?: string;
  emailSubject?: string;
  emailPreheader?: string;
  emailTemplateId?: string;
  sentAt: string;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  deliveredCount: number;
  failedCount: number;
  openRateEstimate?: string;
  logs?: string[];
}

export interface AdminNotification {
  id: string;
  type: 'order_placed' | 'inquiry_submitted' | 'payment_received' | 'whatsapp_lead';
  title: string;
  message: string;
  timestamp: string;
  timeAgo?: string;
  read: boolean;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  referenceId: string; // Order ID (e.g. PX-98241) or Inquiry ID (inq-...) or Thread ID
  referenceData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    amount?: number;
    itemsSummary?: string;
    itemsCount?: number;
    deliveryCity?: string;
    deliveryType?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    topic?: string;
    companyName?: string;
    notes?: string;
    category?: string;
    requestedQuantity?: number;
  };
  acceptedAt?: string;
  acceptedBy?: string;
  actionTakenNotes?: string;
}

export interface ZohoQuoteItem {
  id: string;
  productId?: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unit: string; // pcs, sets, rolls, books, etc.
  unitPrice: number; // KSh
  discountPercent: number; // 0 - 100
  taxPercent: number; // 16 or 0
  taxAmount: number;
  total: number;
  selectedSize?: string;
  selectedFinish?: string;
  artworkNotes?: string;
}

export type ZohoQuoteStatus = 'Draft' | 'Sent' | 'Approved' | 'Invoiced' | 'Declined' | 'Converted to Order';

export interface ZohoQuotation {
  id: string;
  quoteNumber: string; // e.g. ZOHO-QT-2026-0042
  referenceInquiryId?: string;
  referenceChatId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName?: string;
  customerKraPin?: string;
  billingAddress?: string;
  deliveryLocation: string;
  deliveryType: 'Pickup Station' | 'Express Home Delivery' | 'CBD Workshop Pickup';
  quoteDate: string;
  expiryDate: string;
  validityDays: number;
  paymentTerms: 'Due on Receipt' | 'Net 15' | 'Net 30' | '50% Deposit, 50% on Delivery' | 'Cash on Delivery';
  deliveryTimeline: string; // e.g. "24-48 Hours Express", "3-5 Working Days"
  currency: 'KSh' | 'USD';
  items: ZohoQuoteItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number; // 16% VAT or 0%
  taxTotal: number;
  shippingCost: number;
  grandTotal: number;
  isTaxInclusive: boolean;
  notes: string;
  termsAndConditions: string;
  paybillNumber: string;
  paybillAccount: string;
  status: ZohoQuoteStatus;
  zohoSyncStatus?: 'synced' | 'local_only' | 'pending';
  zohoEstimateId?: string;
  convertedOrderId?: string;
  createdAt: string;
  updatedAt: string;
  preparedBy: string;
}

export interface ZohoSettings {
  accountEmail: string;
  notificationEmail: string;
  senderName: string;
  organizationId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  environment: 'sandbox' | 'production';
  autoSyncToZoho: boolean;
  defaultQuotePrefix: string;
  defaultPaymentTerms: 'Due on Receipt' | 'Net 15' | 'Net 30' | '50% Deposit, 50% on Delivery' | 'Cash on Delivery';
  defaultValidityDays: number;
  defaultTaxRate: number;
  defaultDeliveryTimeline: string;
  defaultNotes: string;
  defaultTerms: string;
  companyKraPin: string;
  includeEtrQrCode: boolean;
}

