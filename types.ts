
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
  costPrice?: number; // Snapshot of cost at time of purchase
}

export interface DeliveryLocation {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  notes?: string;
  distanceKm?: number;
  estimatedDuration?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  address: string; // Kept for backward compatibility/display
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
  addresses: string[];
  birthday?: string;
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
}