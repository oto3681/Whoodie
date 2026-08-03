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
}

export interface WordPressSettings {
  siteTitle: string;
  tagline: string;
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
