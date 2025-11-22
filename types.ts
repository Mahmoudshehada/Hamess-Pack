
export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  category: string; // Dynamic string instead of Enum
  description: string;
  descriptionAr?: string;
  image: string;
  imageId?: string;
  imagePath?: string;
  rating: number;
  colors?: string[];
  isCustomizable: boolean;
  stock: number;
  costPrice?: number;
}

export interface StoredImage {
  id: string;
  productId: string;
  path: string;
  data: string;
  uploadDate: string;
  mimeType: string;
  status: 'active' | 'pending_deletion';
}

// Default Categories (Initial State)
export enum CategoryEnum {
  GIFTS = 'Gifts',
  KITCHEN_TOOLS = 'Kitchen Tools',
  BIRTHDAY_PARTY = 'Birthday & Party',
  BALLOONS_HELIUM = 'Balloons & Helium',
  CUPS_PLATES = 'Cups & Plates',
  BAGS_PACKAGING = 'Bags & Packaging',
  CAFE_SUPPLIES = 'Cafe Supplies',
  KIDS_TOYS = 'Kids Toys',
  HALLOWEEN = 'Halloween',
  PACKAGING_MATERIALS = 'Packaging Materials',
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  customizationNote?: string;
  costPrice?: number;
}

export interface Address {
  id: string;
  label: string; 
  apartment?: string; 
  governorate: string; 
  city: string; 
  phone: string; 
  contactName: string;
  instructions?: string; 
  formattedAddress?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  isDefault: boolean;
}

export interface DeliveryLocation {
  addressId?: string;
  address: string;
  governorate?: string;
  city?: string;
  notes?: string;
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

export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  username?: string; // Added for simple login
  email: string;
  phone: string;
  role: UserRole;
  isAdmin: boolean; 
  password?: string;
  addresses: Address[];
  birthday?: string;
  avatar?: string;
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
  channels: ('WHATSAPP' | 'PUSH' | 'EMAIL' | 'IN_APP')[];
}

export interface NotificationConfig {
  enableWhatsApp: boolean;
  enablePush: boolean;
  enableEmailDigest: boolean;
  orderAmountThreshold: number;
  admins: NotificationAdminProfile[];
}

export type NotificationType = 'ORDER' | 'STOCK' | 'AI' | 'SYSTEM';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  readBy?: string[]; 
  data?: any; 
  priority: 'high' | 'normal' | 'low';
}

export interface NotificationLog {
  id: string;
  orderId: string;
  recipient: string;
  recipientPhone: string;
  channel: 'WHATSAPP' | 'PUSH' | 'IN_APP';
  status: 'SENT' | 'FAILED' | 'QUEUED';
  messageHeader: string;
  messageBody: string;
  timestamp: string;
}

export interface AppSettings {
  general: {
    brandName: string;
    contactEmail: string;
    currency: string;
    language: 'en' | 'ar';
  };
  shipping: {
    flatRate: number;
    freeShippingThreshold: number;
    deliveryAreas: string[];
  };
  paymentGateways: {
    paymob: boolean;
    fawry: boolean;
    stripe: boolean;
  };
  notifications: NotificationConfig;
  ai: {
    enabled: boolean;
    autoPricing: boolean;
    autoReorder: boolean;
    tone: 'Professional' | 'Friendly' | 'Urgent';
  };
  security: {
    sessionTimeout: number;
    requireComplexPassword: boolean;
  };
  backup: {
    lastBackupDate: string | null;
    autoBackup: boolean;
  };
}

export interface AIActionPayload {
  action_type: 'create_promotion' | 'change_price' | 'create_po' | 'notify_admin' | 'update_product' | 'none';
  params: any;
}

export interface AIChatResponse {
  human_en: string;
  human_ar: string;
  action_payload: AIActionPayload | null;
  confidence: number;
  explanation: string;
  relatedProduct?: Product;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  payload?: AIActionPayload | null;
  timestamp: number;
  status?: 'pending_action' | 'executed' | 'cancelled';
  relatedProduct?: Product;
}
