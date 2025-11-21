

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { CartItem, Product, Order, User, Coupon, AppSettings, PaymentMethod, Category, StoredImage, DeliveryLocation, Address, NotificationLog } from '../types';
import { MOCK_PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import * as db from '../utils/storage';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  isLoading: boolean;
  user: User | null;
  login: (phone: string, name?: string, email?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  changeLanguage: (lang: 'en' | 'ar') => void;
  
  // Address Management
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkUpdatePrices: (percentage: number, category?: string) => Promise<void>;
  
  // Image Handling
  uploadProductImage: (file: File, productId: string) => Promise<StoredImage>;
  uploadUserAvatar: (file: File) => Promise<string>;
  storedImages: StoredImage[];
  
  // Cart & Orders
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, color?: string, note?: string) => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
  placeOrder: (location: DeliveryLocation, paymentMethod: PaymentMethod) => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  // Admin
  users: User[];
  toggleUserAdmin: (id: string) => void;
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  notificationLogs: NotificationLog[];
  sendTestNotification: () => void;
  
  // System
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  removeNotification: (id: string) => void;
  resetSystem: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper: Image Compression
const compressImage = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality)); 
        } else {
            resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Helper: Sanitize Product for Storage (Strip Base64)
const sanitizeProductForStorage = (product: Product): Product => {
  const p = { ...product };
  if (p.image && typeof p.image === 'string' && p.image.startsWith('data:')) {
     if (p.imagePath) {
         p.image = p.imagePath; 
     } else {
         p.image = p.imageId ? `/uploads/products/${p.imageId}.jpg` : 'https://via.placeholder.com/400?text=No+Image'; 
     }
  }
  return p;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- State Definitions ---
  const [user, setUser] = useState<User | null>(null);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({
      brandColor: '#512D6D',
      currency: 'EGP',
      paymentGateways: { paymob: true, fawry: true, stripe: false },
      shipping: { flatRate: 50, freeShippingThreshold: 1000 },
      notifications: {
        enableWhatsApp: true,
        enablePush: true,
        enableEmailDigest: false,
        orderAmountThreshold: 0,
        admins: [
          { name: 'Walid El Sheikh', phone: '+201066665153', language: 'ar', channels: ['WHATSAPP', 'IN_APP'] },
          { name: 'Mahmoud Shehada', phone: '+201010340487', language: 'en', channels: ['WHATSAPP', 'IN_APP'] }
        ]
      }
  });

  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 4000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Initialization (IndexedDB Load) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const isInitialized = await db.getGlobal<boolean>('app_initialized', false);

        const dbProducts = await db.getAll<Product>('products');
        if (!isInitialized && dbProducts.length === 0 && INITIAL_PRODUCTS.length > 0) {
             await db.bulkPut('products', INITIAL_PRODUCTS);
             setRawProducts(INITIAL_PRODUCTS);
             await db.setGlobal('app_initialized', true);
        } else {
             setRawProducts(dbProducts);
             if (!isInitialized) await db.setGlobal('app_initialized', true);
        }

        const dbImages = await db.getAll<StoredImage>('images');
        setStoredImages(dbImages);

        const dbOrders = await db.getAll<Order>('orders');
        setOrders(dbOrders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

        const dbCoupons = await db.getAll<Coupon>('coupons');
        setCoupons(dbCoupons);
        
        const dbLogs = await db.getAll<NotificationLog>('notification_logs');
        setNotificationLogs(dbLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

        const loadedUser = await db.getGlobal<User | null>('hp_user', null);
        setUser(loadedUser);

        const loadedSettings = await db.getGlobal<AppSettings>('hp_settings', settings);
        // Ensure deep merge of notifications settings in case of new schema
        setSettings(prev => ({ 
            ...prev, 
            ...loadedSettings,
            notifications: { ...prev.notifications, ...loadedSettings.notifications }
        }));

        const loadedCart = await db.getGlobal<CartItem[]>('hp_cart', []);
        setCart(loadedCart);
        
        const loadedUsers = await db.getGlobal<User[]>('hp_users', [
          { 
            id: '1', name: 'Walid El Sheikh', phone: '01066665153', email: 'walidelsheikh011111@gmail.com', 
            isAdmin: true, password: '$2b$10$ExampleHashForWalid666', addresses: [], language: 'en', 
            notificationsEnabled: true, country: 'Egypt', birthday: ''
          },
          { 
            id: '2', name: 'Mahmoud Shehada', phone: '01010340487', email: 'msbas999@gmail.com', 
            isAdmin: true, password: '$2b$10$ExampleHashForMahmoud77', addresses: [], language: 'en', 
            notificationsEnabled: true, country: 'Egypt', birthday: ''
          }
        ]);
        setUsers(loadedUsers);

      } catch (error) {
        console.error("Database Load Failed:", error);
        addNotification("Failed to load data from database.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Sync Globals on Change ---
  useEffect(() => { if(!isLoading) db.setGlobal('hp_user', user); }, [user, isLoading]);
  useEffect(() => { if(!isLoading) db.setGlobal('hp_cart', cart); }, [cart, isLoading]);
  useEffect(() => { if(!isLoading) db.setGlobal('hp_settings', settings); }, [settings, isLoading]);
  useEffect(() => { if(!isLoading) db.setGlobal('hp_users', users); }, [users, isLoading]);

  // --- Actions ---

  const resetSystem = async () => {
    try {
      await db.clearStore('products');
      await db.clearStore('images');
      await db.clearStore('orders');
      await db.clearStore('notification_logs');
      
      setRawProducts([]);
      setStoredImages([]);
      setOrders([]);
      setNotificationLogs([]);
      
      addNotification('System Reset Complete. Database Cleared.', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      console.error("Reset failed", e);
      addNotification('Reset failed.', 'error');
    }
  };

  const login = (phone: string, name?: string, email?: string) => {
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
      setUser(existingUser);
      addNotification(existingUser.language === 'ar' ? `مرحباً بك ${existingUser.name}` : `Welcome back, ${existingUser.name}!`, 'success');
    } else if (name && email) {
      const newUser: User = {
        id: Date.now().toString(),
        name, email, phone,
        isAdmin: false, addresses: [], language: 'en',
        notificationsEnabled: true, country: 'Egypt', birthday: ''
      };
      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
      addNotification('Account created successfully!', 'success');
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    addNotification('Logged out successfully', 'info');
    document.documentElement.dir = 'ltr';
  };

  const toggleUserAdmin = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u));
    addNotification('User role updated', 'success');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
    addNotification('Profile updated successfully', 'success');
  };

  const changeLanguage = (lang: 'en' | 'ar') => {
    if (!user) return;
    updateUser({ language: lang });
  };

  // Address
  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress: Address = {
      ...addressData,
      id: Date.now().toString(),
      formattedAddress: addressData.formattedAddress || `${addressData.label}, ${addressData.city}, ${addressData.governorate}`,
      lat: addressData.lat || 0,
      lng: addressData.lng || 0,
    };
    const updatedAddresses = [...user.addresses, newAddress];
    updateUser({ addresses: updatedAddresses });
    addNotification('Address saved successfully!', 'success');
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    updateUser({ addresses: user.addresses.filter(a => a.id !== id) });
    addNotification('Address removed', 'info');
  };

  // --- Image Logic ---
  const uploadProductImage = async (file: File, productId: string): Promise<StoredImage> => {
    try {
      const base64Data = await compressImage(file, 800, 800, 0.7);
      const ext = file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      
      const newImage: StoredImage = {
        id: `img_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        productId: productId,
        path: `/uploads/products/${productId}_${timestamp}.${ext}`,
        data: base64Data,
        uploadDate: new Date().toISOString(),
        mimeType: 'image/jpeg',
        status: 'active'
      };

      await db.putItem('images', newImage);
      setStoredImages(prev => [...prev, newImage]);
      return newImage;
    } catch (error) {
      console.error("Failed to process image", error);
      addNotification('Failed to upload image.', 'error');
      throw error;
    }
  };

  const uploadUserAvatar = async (file: File): Promise<string> => {
     try {
       const base64Data = await compressImage(file, 400, 400, 0.7);
       if (user) updateUser({ avatar: base64Data });
       return base64Data;
     } catch (e) {
       addNotification('Failed to update avatar', 'error');
       throw e;
     }
  };

  // --- Product Logic ---
  const products = useMemo(() => {
    return rawProducts.map(product => {
      if (product.imageId && !product.image?.startsWith('data:')) {
        const storedImg = storedImages.find(img => img.id === product.imageId && img.status === 'active');
        if (storedImg) {
          return { ...product, image: storedImg.data };
        }
      }
      return product;
    });
  }, [rawProducts, storedImages]);

  const addProduct = async (product: Product) => {
    try {
        const cleanProduct = sanitizeProductForStorage(product);
        await db.putItem('products', cleanProduct);
        setRawProducts(prev => [cleanProduct, ...prev]);
        addNotification('Product added successfully', 'success');
    } catch (e) {
        console.error("Add Product Error", e);
        addNotification('Failed to save product. Storage might be full.', 'error');
    }
  };

  const updateProduct = async (product: Product) => {
    try {
        const cleanProduct = sanitizeProductForStorage(product);
        await db.putItem('products', cleanProduct);
        setRawProducts(prev => prev.map(p => p.id === product.id ? cleanProduct : p));
        addNotification('Product updated', 'success');
    } catch (e) {
        addNotification('Failed to update product', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
        await db.deleteItem('products', id);
        setRawProducts(prev => prev.filter(p => p.id !== id));
        setStoredImages(prev => prev.map(img => 
          img.productId === id ? { ...img, status: 'pending_deletion' } : img
        ));
        addNotification('Product deleted', 'info');
    } catch (e) {
        addNotification('Failed to delete product', 'error');
    }
  };

  const bulkUpdatePrices = async (percentage: number, category?: string) => {
    const multiplier = 1 + (percentage / 100);
    const updates: Product[] = [];
    
    const newProducts = rawProducts.map(p => {
      if (category && category !== 'All' && p.category !== category) return p;
      const cleanP = sanitizeProductForStorage(p);
      const updated = { ...cleanP, price: Math.round(p.price * multiplier) };
      updates.push(updated);
      return updated;
    });

    for (const p of updates) {
        await db.putItem('products', p);
    }

    setRawProducts(newProducts);
    addNotification('Prices updated successfully', 'success');
  };

  // --- Notification System Logic ---
  const dispatchNotifications = async (order: Order) => {
    const config = settings.notifications;
    if (!config) return;

    // Check Threshold
    if (order.total < config.orderAmountThreshold) return;

    const itemsSummary = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
    
    for (const admin of config.admins) {
       // Skip if no valid channels
       if (!admin.channels.includes('WHATSAPP') && !admin.channels.includes('IN_APP')) continue;

       // 1. Construct Message based on Language
       let header = '';
       let body = '';
       
       if (admin.language === 'ar') {
          header = '📦 طلب جديد وصل!';
          body = `تم استلام الطلب رقم ${order.id} من العميل ${order.customerName}.\nالإجمالي: ${order.total} جنيه\nالمنطقة: ${order.deliveryLocation?.city || 'غير محدد'}\nالأصناف: ${itemsSummary}`;
       } else {
          header = '📦 New Order Received!';
          body = `Order ${order.id} has been placed by ${order.customerName}.\nAmount: ${order.total} EGP\nArea: ${order.deliveryLocation?.city || 'Unknown'}\nItems: ${itemsSummary}`;
       }

       // 2. Create Log Entry
       const logEntry: NotificationLog = {
         id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
         orderId: order.id,
         recipient: admin.name,
         recipientPhone: admin.phone,
         channel: config.enableWhatsApp && admin.channels.includes('WHATSAPP') ? 'WHATSAPP' : 'IN_APP',
         status: 'SENT', // Simulating successful send
         messageHeader: header,
         messageBody: body,
         timestamp: new Date().toISOString()
       };

       await db.putItem('notification_logs', logEntry);
       setNotificationLogs(prev => [logEntry, ...prev]);
       
       // 3. Trigger In-App UI for current user if they are an admin (Simulated)
       if (user?.isAdmin) {
          addNotification(`New Order: ${order.customerName} (${order.total} EGP)`, 'info');
       }
    }
  };
  
  const sendTestNotification = async () => {
     // Creates a dummy order to test the flow
     const dummyOrder: Order = {
       id: 'TEST-' + Math.floor(Math.random() * 1000),
       date: new Date().toISOString(),
       items: [{ id: '1', name: 'Blue Party Cups', price: 50, category: Category.PARTY_SUPPLIES, description: '', image: '', isCustomizable: false, stock: 100, rating: 5, quantity: 2 }],
       total: 1250,
       status: 'Processing',
       address: 'Test Address, Sheikh Zayed',
       deliveryLocation: { address: 'Sheikh Zayed', city: 'Sheikh Zayed', governorate: 'Giza' },
       paymentMethod: PaymentMethod.COD,
       customerName: 'Sarah Ahmed',
       customerPhone: '01000000000',
       deliveryFee: 50
     };
     await dispatchNotifications(dummyOrder);
     addNotification('Test notifications dispatched to logs.', 'success');
  };

  // --- Cart & Orders ---
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

  const placeOrder = async (location: DeliveryLocation, paymentMethod: PaymentMethod) => {
    if (!user) return;
    
    let deliveryFee = settings.shipping.flatRate;
    if (cartTotal >= settings.shipping.freeShippingThreshold) {
      deliveryFee = 0;
    }

    const newOrder: Order = {
      id: Math.floor(Math.random() * 100000).toString(),
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal + deliveryFee,
      status: 'Processing',
      address: location.address,
      deliveryLocation: location,
      paymentMethod,
      customerName: user.name,
      customerPhone: user.phone,
      deliveryFee: deliveryFee
    };
    
    try {
        await db.putItem('orders', newOrder);
        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        
        // TRIGGER NOTIFICATIONS
        await dispatchNotifications(newOrder);
        
        addNotification('Order placed successfully!', 'success');
    } catch (e) {
        addNotification('Failed to place order', 'error');
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const order = orders.find(o => o.id === id);
    if (order) {
        const updated = { ...order, status };
        await db.putItem('orders', updated);
        setOrders(prev => prev.map(o => o.id === id ? updated : o));
        addNotification(`Order #${id} updated to ${status}`, 'info');
    }
  };

  // --- Coupons ---
  const addCoupon = async (coupon: Coupon) => {
    await db.putItem('coupons', coupon);
    setCoupons(prev => [...prev, coupon]);
    addNotification('Coupon created', 'success');
  };

  const deleteCoupon = async (id: string) => {
    await db.deleteItem('coupons', id);
    setCoupons(prev => prev.filter(c => c.id !== id));
    addNotification('Coupon deleted', 'info');
  };

  // --- Settings ---
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    addNotification('Settings saved', 'success');
  };

  return (
    <StoreContext.Provider value={{
      isLoading,
      user, login, logout, updateUser, changeLanguage,
      addAddress, deleteAddress,
      products, addProduct, updateProduct, deleteProduct, bulkUpdatePrices,
      uploadProductImage, uploadUserAvatar, storedImages,
      cart, addToCart, removeFromCart, cartTotal,
      placeOrder, orders, updateOrderStatus,
      users, toggleUserAdmin,
      coupons, addCoupon, deleteCoupon,
      settings, updateSettings,
      notifications, addNotification, removeNotification, resetSystem,
      notificationLogs, sendTestNotification
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
