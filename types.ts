

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string; // This will now hold the resolved Data URI or fallback URL
  imageId?: string; // Link to StoredImage
  imagePath?: string; // Virtual path /uploads/products/...
  rating: number;
  colors?: string[];
  isCustomizable: boolean;
  stock: number;
  costPrice?: number; // For reports
}

export interface StoredImage {
  id: string;
  productId: string;
  path: string;
  data: string; // Base64 Data URI
  uploadDate: string;
  mimeType: string;
  status: 'active' | 'pending_deletion';
}

export enum Category {
  PARTY_SUPPLIES = 'Party Supplies',
  GIFTS = 'Gifts',
  DECORATIONS = 'Decorations',
  EVENT_ACCESSORIES = 'Event Accessories',
  PACKAGING = 'Packaging',
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  customizationNote?: string;
  costPrice?: number;
}

export interface Address {
  id: string;
  // Manual Fields
  label: string; // "Location (e.g. building name, street #)"
  apartment?: string; 
  governorate: string; // "Giza"
  city: string; // "Sheikh Zayed"
  phone: string; // Replaces email for address contact
  contactName: string;
  instructions?: string; // Address Specific Instructions
  
  // Legacy / Optional Geo fields (Nullable in DB)
  formattedAddress?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  isDefault: boolean;
}

export interface DeliveryLocation {
  addressId?: string; // If selected from saved
  address: string; // Formatted text for display
  governorate?: string;
  city?: string;
  notes?: string;
  // Geo optional
  lat?: number;
  lng?: number;
  placeId?: string;
  distanceKm?: number;
  estimatedDuration?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  address: string;
  deliveryLocation?: DeliveryLocation;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  deliveryFee: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  password?: string; // Added for admin auth
  addresses: Address[];
  birthday?: string;
  avatar?: string; // Base64 Data URI
  language: 'en' | 'ar';
  notificationsEnabled: boolean;
  country: string;
}

export enum PaymentMethod {
  CARD = 'Credit Card',
  WALLET = 'Mobile Wallet',
  COD = 'Cash on Delivery'
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface NotificationAdminProfile {
  name: string;
  phone: string;
  language: 'en' | 'ar';
  channels: ('WHATSAPP' | 'PUSH' | 'EMAIL')[];
}

export interface NotificationConfig {
  enableWhatsApp: boolean;
  enablePush: boolean;
  enableEmailDigest: boolean;
  orderAmountThreshold: number;
  admins: NotificationAdminProfile[];
}

export interface NotificationLog {
  id: string;
  orderId: string;
  recipient: string; // Name of admin
  recipientPhone: string;
  channel: 'WHATSAPP' | 'PUSH' | 'IN_APP';
  status: 'SENT' | 'FAILED' | 'QUEUED';
  messageHeader: string;
  messageBody: string;
  timestamp: string;
}

export interface AppSettings {
  brandColor: string;
  currency: string;
  paymentGateways: {
    paymob: boolean;
    fawry: boolean;
    stripe: boolean;
  };
  shipping: {
    flatRate: number;
    freeShippingThreshold: number;
  };
  notifications: NotificationConfig;
}

// --- AI / Smart Assistant Types ---
export interface AIRecommendation {
  id: string;
  type: 'REORDER' | 'DISCOUNT' | 'BUNDLE';
  severity: 'URGENT' | 'WARNING' | 'OPPORTUNITY';
  productId: string;
  productName: string;
  currentStock: number;
  velocity: number; // Sales per day
  daysRemaining: number;
  suggestion: {
    action: string;
    value: string | number; // e.g. reorder qty or discount %
    rationaleEn: string;
    rationaleAr: string;
  };
}

// --- Auto-Reorder & Forecasting Types ---
export interface Supplier {
  id: string;
  name: string;
  contactPhone: string;
  email: string;
  leadTimeDays: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'pending_approval' | 'sent' | 'fulfilled' | 'cancelled';
  createdDate: string;
  items: {
    productId: string;
    productName: string;
    currentStock: number;
    reorderQty: number;
    cost: number;
  }[];
  totalCost: number;
  notes?: string;
}

export interface DemandForecast {
  productId: string;
  forecast: {
    date: string;
    predictedSales: number;
    confidenceLow: number;
    confidenceHigh: number;
  }[];
}
