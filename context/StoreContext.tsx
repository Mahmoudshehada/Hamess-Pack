
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { CartItem, Product, Order, User, Coupon, AppSettings, PaymentMethod, Category, StoredImage, DeliveryLocation } from '../types';
import { MOCK_PRODUCTS as INITIAL_PRODUCTS } from '../constants';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  user: User | null;
  login: (phone: string, name?: string, email?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  bulkUpdatePrices: (percentage: number, category?: string) => void;
  
  // Image Handling
  uploadProductImage: (file: File, productId: string) => Promise<StoredImage>;
  storedImages: StoredImage[];
  
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, color?: string, note?: string) => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
  placeOrder: (location: DeliveryLocation, paymentMethod: PaymentMethod) => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  users: User[];
  toggleUserAdmin: (id: string) => void;
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  removeNotification: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rawProducts, setRawProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Admin User', phone: '0000', email: 'admin@hamess.com', isAdmin: true, addresses: ['Cairo, Egypt'] },
    { id: 'manager-1', name: 'mahmoudshehada', phone: '01010340487', email: 'msbas999@gmail.com', isAdmin: true, addresses: [] }
  ]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    brandColor: '#512D6D',
    currency: 'EGP',
    paymentGateways: { paymob: true, fawry: true, stripe: false },
    shipping: { flatRate: 50, freeShippingThreshold: 1000 }
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Notification Helpers
  const addNotification = (message: string, type: 'success' | 'info' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // User Logic
  const login = (phone: string, name?: string, email?: string) => {
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
      setUser(existingUser);
      addNotification(`Welcome back, ${existingUser.name}!`, 'success');
    } else if (name && email) {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        isAdmin: false,
        addresses: []
      };
      setUsers([...users, newUser]);
      setUser(newUser);
      addNotification('Account created successfully!', 'success');
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    addNotification('Logged out successfully', 'info');
  };

  const toggleUserAdmin = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u));
    addNotification('User role updated', 'success');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    addNotification('Profile updated successfully', 'success');
  };

  // Image Upload Logic
  const uploadProductImage = (file: File, productId: string): Promise<StoredImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const ext = file.name.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        
        const newImage: StoredImage = {
          id: `img_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          productId: productId,
          path: `/uploads/products/${productId}_${timestamp}.${ext}`,
          data: base64Data,
          uploadDate: new Date().toISOString(),
          mimeType: file.type,
          status: 'active'
        };

        setStoredImages(prev => [...prev, newImage]);
        resolve(newImage);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Product Logic with Image Resolution
  const products = useMemo(() => {
    return rawProducts.map(product => {
      if (product.imageId) {
        const storedImg = storedImages.find(img => img.id === product.imageId && img.status === 'active');
        if (storedImg) {
          return { ...product, image: storedImg.data };
        }
      }
      return product;
    });
  }, [rawProducts, storedImages]);

  const addProduct = (product: Product) => {
    setRawProducts([product, ...rawProducts]);
    addNotification('Product added', 'success');
  };

  const updateProduct = (product: Product) => {
    setRawProducts(rawProducts.map(p => p.id === product.id ? product : p));
    addNotification('Product updated', 'success');
  };

  const deleteProduct = (id: string) => {
    setRawProducts(rawProducts.filter(p => p.id !== id));
    setStoredImages(prev => prev.map(img => 
      img.productId === id ? { ...img, status: 'pending_deletion' } : img
    ));
    addNotification('Product deleted', 'info');
  };

  const bulkUpdatePrices = (percentage: number, category?: string) => {
    setRawProducts(rawProducts.map(p => {
      if (category && category !== 'All' && p.category !== category) return p;
      const multiplier = 1 + (percentage / 100);
      return { ...p, price: Math.round(p.price * multiplier) };
    }));
    addNotification('Prices updated successfully', 'success');
  };

  // Cart Logic
  const addToCart = (product: Product, quantity: number, color?: string, note?: string) => {
    const existingItem = cart.find(item => 
      item.id === product.id && 
      item.selectedColor === color && 
      item.customizationNote === note
    );

    if (existingItem) {
      setCart(cart.map(item => 
        item === existingItem 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity, selectedColor: color, customizationNote: note, costPrice: product.costPrice }]);
    }
    addNotification('Added to cart', 'success');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Order Logic
  const placeOrder = (location: DeliveryLocation, paymentMethod: PaymentMethod) => {
    if (!user) return;
    
    // Calculate dynamic delivery fee based on distance if available, else flat rate
    let deliveryFee = settings.shipping.flatRate;
    if (location.distanceKm) {
      // Example: 10 EGP base + 2 EGP per km
      deliveryFee = Math.max(deliveryFee, Math.ceil(10 + (location.distanceKm * 2)));
    }

    // Check free shipping
    if (cartTotal >= settings.shipping.freeShippingThreshold) {
      deliveryFee = 0;
    }

    const newOrder: Order = {
      id: Math.floor(Math.random() * 100000).toString(),
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal + deliveryFee,
      status: 'Processing',
      address: location.address, // Simplified string for list view
      deliveryLocation: location, // Full structured data
      paymentMethod,
      customerName: user.name,
      customerPhone: user.phone,
      deliveryFee: deliveryFee
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
    addNotification('Order placed successfully!', 'success');
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    addNotification(`Order #${id} updated to ${status}`, 'info');
  };

  // Coupon Logic
  const addCoupon = (coupon: Coupon) => {
    setCoupons([...coupons, coupon]);
    addNotification('Coupon created', 'success');
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    addNotification('Coupon deleted', 'info');
  };

  // Settings
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    document.documentElement.style.setProperty('--color-brand-600', newSettings.brandColor);
    addNotification('Settings saved', 'success');
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout, updateUser,
      products, addProduct, updateProduct, deleteProduct, bulkUpdatePrices,
      uploadProductImage, storedImages,
      cart, addToCart, removeFromCart, cartTotal,
      placeOrder, orders, updateOrderStatus,
      users, toggleUserAdmin,
      coupons, addCoupon, deleteCoupon,
      settings, updateSettings,
      notifications, addNotification, removeNotification
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};