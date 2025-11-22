
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { CartItem, Product, Order, User, Coupon, AppSettings, PaymentMethod, CategoryEnum, StoredImage, DeliveryLocation, Address, NotificationLog, UserRole, SystemNotification, NotificationType } from '../types';
import * as db from '../utils/storage';
import { CATEGORY_IMAGES, MOCK_PRODUCTS } from '../constants';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  isLoading: boolean;
  user: User | null;
  login: (identifier: string, password?: string, name?: string, email?: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  changeLanguage: (lang: 'en' | 'ar') => void;
  
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => void;
  
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkUpdatePrices: (percentage: number, category?: string) => Promise<void>;
  
  categories: string[];
  addCategory: (name: string) => Promise<void>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;

  uploadProductImage: (file: File, productId: string) => Promise<StoredImage>;
  uploadUserAvatar: (file: File) => Promise<string>;
  uploadCategoryImage: (category: string, file: File) => Promise<string>;
  storedImages: StoredImage[];
  categoryImages: Record<string, string>;
  
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
  
  systemNotifications: SystemNotification[];
  notificationLogs: NotificationLog[];
  createSystemNotification: (type: NotificationType, title: string, message: string, priority?: 'high'|'normal'|'low', data?: any) => Promise<SystemNotification>;
  markNotificationRead: (id: string) => void;
  deleteSystemNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  removeNotification: (id: string) => void;
  resetSystem: () => Promise<void>;
  exportSystemData: () => Promise<void>;
  importSystemData: (file: File) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// --- SEED USERS ---
const SEED_USERS: User[] = [
  // --- Admins (2) ---
  { id: 'admin-1', name: 'Walid El Sheikh', username: 'walid', phone: '01066665153', email: 'walid@hamess.com', role: 'admin', isAdmin: true, password: '0000', addresses: [], language: 'ar', notificationsEnabled: true, country: 'Egypt' },
  { id: 'admin-2', name: 'Mahmoud Shehada', username: 'mahmoud', phone: '01010340487', email: 'mahmoud@hamess.com', role: 'admin', isAdmin: true, password: '0000', addresses: [], language: 'en', notificationsEnabled: true, country: 'Egypt' },
  // --- Staff (3) ---
  { id: 'staff-1', name: 'Staff Member 1', username: 'staff01', phone: '01011111111', email: 'staff1@hamess.com', role: 'staff', isAdmin: false, password: '1111', addresses: [], language: 'en', notificationsEnabled: true, country: 'Egypt' },
  { id: 'staff-2', name: 'Staff Member 2', username: 'staff02', phone: '01022222222', email: 'staff2@hamess.com', role: 'staff', isAdmin: false, password: '2222', addresses: [], language: 'ar', notificationsEnabled: true, country: 'Egypt' },
  { id: 'staff-3', name: 'Inventory Manager', username: 'staff03', phone: '01033333333', email: 'inv@hamess.com', role: 'staff', isAdmin: false, password: '3333', addresses: [], language: 'en', notificationsEnabled: true, country: 'Egypt' },
  // --- Customers (5) ---
  { id: 'cust-1', name: 'Sarah Ahmed', username: 'sarah', phone: '01200000001', email: 'sarah@test.com', role: 'customer', isAdmin: false, password: '1234', addresses: [], language: 'en', notificationsEnabled: true, country: 'Egypt' },
  { id: 'cust-2', name: 'Mohamed Ali', username: 'mohamed', phone: '01200000002', email: 'mohamed@test.com', role: 'customer', isAdmin: false, password: '1234', addresses: [], language: 'ar', notificationsEnabled: true, country: 'Egypt' },
  { id: 'cust-3', name: 'Rania Youssef', username: 'rania', phone: '01200000003', email: 'rania@test.com', role: 'customer', isAdmin: false, password: '1234', addresses: [], language: 'en', notificationsEnabled: true, country: 'Egypt' },
  { id: 'cust-4', name: 'Omar Khaled', username: 'omar', phone: '01200000004', email: 'omar@test.com', role: 'customer', isAdmin: false, password: '1234', addresses: [], language: 'ar', notificationsEnabled: true, country: 'Egypt' },
  { id: 'cust-5', name: 'Nour Ezzat', username: 'nour', phone: '01200000005', email: 'nour@test.com', role: 'customer', isAdmin: false, password: '1234', addresses: [], language: 'en', notificationsEnabled: true, country: 'Egypt' },
];

const compressImage = (file: File, maxWidth = 500, maxHeight = 500, quality = 0.7): Promise<string> => {
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
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
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

const DEFAULT_SETTINGS: AppSettings = {
  general: { brandName: 'Hamess Pack', contactEmail: 'support@hamesspack.com', currency: 'EGP', language: 'en' },
  shipping: { flatRate: 50, freeShippingThreshold: 1000, deliveryAreas: ['Cairo', 'Giza', 'Alexandria'] },
  paymentGateways: { paymob: true, fawry: true, stripe: false },
  notifications: { enableWhatsApp: true, enablePush: true, enableEmailDigest: false, orderAmountThreshold: 0, admins: [{ name: 'Walid', phone: '01066665153', language: 'ar', channels: ['WHATSAPP'] }, { name: 'Mahmoud', phone: '01010340487', language: 'en', channels: ['WHATSAPP'] }] },
  ai: { enabled: true, autoPricing: false, autoReorder: true, tone: 'Professional' },
  security: { sessionTimeout: 30, requireComplexPassword: true },
  backup: { lastBackupDate: null, autoBackup: true }
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(CATEGORY_IMAGES);
  const [categories, setCategories] = useState<string[]>(Object.values(CategoryEnum));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 4000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const loadDataFromDB = async () => {
    try {
      const isInitialized = await db.getGlobal<string>('hp_init_v3', '');

      // 1. Products & Images
      let dbProducts = await db.getAll<Product>('products');
      const dbImages = await db.getAll<StoredImage>('images');
      
      if (!isInitialized) {
        if (!dbProducts || dbProducts.length === 0) {
            await db.bulkPut('products', MOCK_PRODUCTS);
            dbProducts = MOCK_PRODUCTS;
        }
        await db.setGlobal('hp_init_v3', 'true');
      }

      setRawProducts(dbProducts || []);
      setStoredImages(dbImages || []);

      // 2. Orders
      const dbOrders = await db.getAll<Order>('orders');
      setOrders((dbOrders || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      // 3. Users (Persistent Store)
      let dbUsers = await db.getAll<User>('users');
      if (dbUsers.length === 0) {
           await db.bulkPut('users', SEED_USERS);
           dbUsers = SEED_USERS;
      }
      setUsers(dbUsers);

      // 4. Notifications
      const dbSysNotifs = await db.getAll<SystemNotification>('system_notifications');
      setSystemNotifications((dbSysNotifs || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      // 5. Session & Globals
      const sessionUser = await db.getGlobal<User | null>('hp_session_user', null);
      if (sessionUser) {
          // IMPORTANT: Always refresh from 'users' store to get latest addresses
          const freshUser = dbUsers.find(u => u.id === sessionUser.id);
          if (freshUser) {
              setUser(freshUser);
          } else {
              setUser(sessionUser); // Fallback
          }
      }
      
      const loadedSettings = await db.getGlobal<AppSettings>('hp_settings', DEFAULT_SETTINGS);
      setSettings(prev => ({ ...prev, ...loadedSettings }));

      const loadedCart = await db.getGlobal<CartItem[]>('hp_cart', []);
      setCart(loadedCart);
      
      const dbCategoryImages = await db.getGlobal<Record<string, string>>('hp_category_images', {});
      setCategoryImages({ ...CATEGORY_IMAGES, ...dbCategoryImages });
      
      const dbCategories = await db.getGlobal<string[]>('hp_categories', Object.values(CategoryEnum));
      setCategories(dbCategories);

    } catch (error) {
      console.error("CRITICAL: Database Load Failed:", error);
      addNotification("Database Error. Data may be unavailable.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromDB();
  }, []);

  useEffect(() => { if(!isLoading) db.setGlobal('hp_cart', cart); }, [cart, isLoading]);
  useEffect(() => { if(!isLoading) db.setGlobal('hp_settings', settings); }, [settings, isLoading]);

  // --- Address Actions ---
  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress: Address = {
      ...addressData,
      id: Date.now().toString(),
      formattedAddress: addressData.formattedAddress || `${addressData.label}, ${addressData.city}, ${addressData.governorate}`,
      lat: addressData.lat || 0,
      lng: addressData.lng || 0,
      isDefault: user.addresses.length === 0
    };
    
    // Create new user object with updated addresses
    const updatedUser = { ...user, addresses: [...user.addresses, newAddress] };
    
    // 1. Update State
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    
    // 2. PERSIST TO DB IMMEDIATELY (Dual sync: Session + User Store)
    try {
        await db.putItem('users', updatedUser); 
        await db.setGlobal('hp_session_user', updatedUser);
        addNotification('Address saved permanently.', 'success');
    } catch (e) {
        console.error("Failed to save address persistence", e);
        addNotification('Failed to save address to disk.', 'error');
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;
    const updatedUser = { ...user, addresses: user.addresses.filter(a => a.id !== id) };
    
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    
    await db.putItem('users', updatedUser);
    await db.setGlobal('hp_session_user', updatedUser);
    addNotification('Address removed', 'info');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
    
    await db.putItem('users', updatedUser);
    await db.setGlobal('hp_session_user', updatedUser);
    addNotification('Profile updated successfully', 'success');
  };

  const changeLanguage = (lang: 'en' | 'ar') => {
    if (user) {
      updateUser({ language: lang });
    }
    setSettings(prev => ({ ...prev, general: { ...prev.general, language: lang } }));
  };

  // --- Auth ---
  const login = (identifier: string, password?: string, name?: string, email?: string): boolean => {
    const existingUser = users.find(u => 
      u.phone === identifier || 
      (u.username && u.username.toLowerCase() === identifier.toLowerCase())
    );

    if (existingUser) {
       if (existingUser.password && password && password !== existingUser.password) {
           addNotification('Incorrect Password', 'error');
           return false;
       }
       setUser(existingUser);
       db.setGlobal('hp_session_user', existingUser);
       addNotification(`Welcome back, ${existingUser.name}!`, 'success');
       return true;
    } 
    
    if (name && email) {
      const newUser: User = {
        id: Date.now().toString(),
        name, email, 
        phone: identifier,
        role: 'customer',
        isAdmin: false, addresses: [], language: 'en',
        notificationsEnabled: true, country: 'Egypt',
        username: email.split('@')[0], 
        password: '1234'
      };
      
      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
      db.putItem('users', newUser);
      db.setGlobal('hp_session_user', newUser);
      addNotification('Account created successfully!', 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    db.setGlobal('hp_session_user', null);
    addNotification('Logged out successfully', 'info');
  };

  // --- Products ---
  const products = useMemo(() => {
    return rawProducts.map(product => {
      if (product.imageId) {
        const storedImg = storedImages.find(img => img.id === product.imageId);
        if (storedImg) return { ...product, image: storedImg.data };
      }
      if (product.image) return product;
      return { ...product, image: 'https://via.placeholder.com/400?text=No+Image' };
    });
  }, [rawProducts, storedImages]);

  const addProduct = async (product: Product) => {
    await db.putItem('products', product);
    setRawProducts(prev => [...prev, product]);
    addNotification('Product saved.', 'success');
  };

  const updateProduct = async (product: Product) => {
    await db.putItem('products', product);
    setRawProducts(prev => prev.map(p => p.id === product.id ? product : p));
    
    // Check for Low Stock Notification
    if (product.stock <= 5) {
        await createSystemNotification(
            'STOCK',
            'Low Stock Alert',
            `Product "${product.name}" is running low (${product.stock} remaining).`,
            'high',
            { productId: product.id }
        );
    }
    
    addNotification('Product updated.', 'success');
  };

  const deleteProduct = async (id: string) => {
    await db.deleteItem('products', id);
    setRawProducts(prev => prev.filter(p => p.id !== id));
    addNotification('Product deleted', 'info');
  };

  const uploadProductImage = async (file: File, productId: string): Promise<StoredImage> => {
    try {
      const base64Data = await compressImage(file, 500, 500, 0.7); // Updated size constraint
      const newImage: StoredImage = {
        id: `img_${Date.now()}`,
        productId: productId,
        path: '', 
        data: base64Data,
        uploadDate: new Date().toISOString(),
        mimeType: 'image/jpeg',
        status: 'active'
      };
      
      await db.putItem('images', newImage);
      setStoredImages(prev => [...prev.filter(img => img.productId !== productId), newImage]);
      return newImage;
    } catch (error) {
      addNotification('Failed to upload image.', 'error');
      throw error;
    }
  };

  // --- Categories ---
  const addCategory = async (name: string) => {
      if (user?.role !== 'admin') { addNotification("Admin access required", "error"); return; }
      const newCats = [...categories, name];
      setCategories(newCats);
      await db.setGlobal('hp_categories', newCats);
      addNotification("Category added", "success");
  };

  const deleteCategory = async (name: string) => {
      if (user?.role !== 'admin') { addNotification("Admin access required", "error"); return; }
      const newCats = categories.filter(c => c !== name);
      setCategories(newCats);
      await db.setGlobal('hp_categories', newCats);
      addNotification("Category removed", "success");
  };

  // --- Cart & Order ---
  const addToCart = (product: Product, quantity: number, color?: string, note?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.selectedColor === color && item.customizationNote === note);
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { ...product, quantity, selectedColor: color, customizationNote: note }];
    });
    addNotification('Added to cart', 'success');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    addNotification('Removed from cart', 'info');
  };

  const placeOrder = async (location: DeliveryLocation, paymentMethod: PaymentMethod) => {
    if (!user) return;
    let deliveryFee = settings.shipping.flatRate;
    if (cartTotal >= settings.shipping.freeShippingThreshold) deliveryFee = 0;

    const newOrder: Order = {
      id: Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal + deliveryFee,
      status: 'Processing',
      address: location.address, 
      deliveryLocation: location, 
      paymentMethod,
      customerName: user.name,
      customerPhone: user.phone,
      deliveryFee
    };
    
    try {
      await db.putItem('orders', newOrder);
      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      
      const updatedProducts = rawProducts.map(p => {
        const cartItem = cart.find(item => item.id === p.id);
        if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        return p;
      });
      for(const p of updatedProducts) {
          await db.putItem('products', p);
          // Check stock post-order
          if (p.stock <= 5) {
               await createSystemNotification(
                 'STOCK',
                 'Critical Stock Level',
                 `Item ${p.name} reached critical stock level after recent order.`,
                 'high'
               );
          }
      }
      setRawProducts(updatedProducts);
      
      // Notify System
      await createSystemNotification(
         'ORDER',
         'New Order Received',
         `Order #${newOrder.id} placed by ${newOrder.customerName} for ${newOrder.total} EGP`,
         'high',
         { orderId: newOrder.id }
      );

      addNotification("Order placed successfully!", "success");
    } catch (e) {
      addNotification("Order failed to save.", "error");
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updatedOrders);
    const order = updatedOrders.find(o => o.id === id);
    if(order) await db.putItem('orders', order);
    addNotification('Order status updated', 'success');
  };

  // --- Notifications Logic ---
  const createSystemNotification = async (type: NotificationType, title: string, message: string, priority: 'high'|'normal'|'low' = 'normal', data?: any) => {
     const newNotif: SystemNotification = {
         id: Date.now().toString() + Math.random().toString(36).substring(7),
         type,
         title,
         message,
         timestamp: new Date().toISOString(),
         isRead: false,
         readBy: [],
         priority,
         data
     };
     
     // Save to DB
     await db.putItem('system_notifications', newNotif);
     setSystemNotifications(prev => [newNotif, ...prev]);

     // Simulate Sending to External Channels based on settings
     if (settings.notifications.enableWhatsApp && type === 'STOCK' && priority === 'high') {
         console.log(`[SIMULATION] WhatsApp sent to ${settings.notifications.admins[0]?.phone}: ${message}`);
     }
     
     return newNotif;
  };

  const markNotificationRead = async (id: string) => {
      const notif = systemNotifications.find(n => n.id === id);
      if (notif && user) {
          // If already read by user, skip
          if (notif.readBy?.includes(user.id)) return;

          const updatedReadBy = [...(notif.readBy || []), user.id];
          const updatedNotif = { ...notif, readBy: updatedReadBy, isRead: true }; // Local isRead is for UI binding
          
          await db.putItem('system_notifications', updatedNotif);
          setSystemNotifications(prev => prev.map(n => n.id === id ? updatedNotif : n));
      }
  };

  const deleteSystemNotification = async (id: string) => {
      await db.deleteItem('system_notifications', id);
      setSystemNotifications(prev => prev.filter(n => n.id !== id));
      addNotification("Notification deleted", "info");
  };

  const clearAllNotifications = async () => {
      // Only clear visual list or mark all read? Let's delete for now as requested 'delete' capability
      // But clearing ALL might be dangerous. Let's just implement individual delete in UI mainly.
      // This function can mark all as read for the user.
      if (!user) return;
      const updatedNotifs = systemNotifications.map(n => {
          if (!n.readBy?.includes(user.id)) {
              return { ...n, readBy: [...(n.readBy || []), user.id] };
          }
          return n;
      });
      
      // Batch update in DB? simplified for now
      for(const n of updatedNotifs) await db.putItem('system_notifications', n);
      setSystemNotifications(updatedNotifs);
      addNotification("All marked as read", "success");
  };
  
  const updateSettings = async (newSettings: AppSettings) => {
      setSettings(newSettings);
      await db.setGlobal('hp_settings', newSettings);
      addNotification("Settings saved", "success");
  };

  const resetSystem = async () => {
    if(!window.confirm("WARNING: This will wipe ALL data. Are you sure?")) return;
    await db.clearStore('products');
    await db.clearStore('images');
    await db.clearStore('orders');
    await db.clearStore('users');
    await db.deleteItem('globals', 'hp_init_v3');
    await db.deleteItem('globals', 'hp_session_user');
    window.location.reload();
  };

  const value = {
    isLoading, user, login, logout, updateUser, changeLanguage,
    addAddress, deleteAddress,
    products, addProduct, updateProduct, deleteProduct, bulkUpdatePrices: async () => {},
    categories, addCategory, renameCategory: async () => {}, deleteCategory,
    uploadProductImage, uploadUserAvatar: async () => '', uploadCategoryImage: async () => '', storedImages, categoryImages,
    cart, addToCart, removeFromCart, cartTotal,
    placeOrder, orders, updateOrderStatus,
    users, toggleUserAdmin: () => {}, coupons, addCoupon: () => {}, deleteCoupon: () => {}, 
    settings, updateSettings,
    notifications, addNotification, removeNotification, resetSystem, exportSystemData: async () => {}, importSystemData: async () => {},
    systemNotifications, notificationLogs, createSystemNotification, markNotificationRead, deleteSystemNotification, clearAllNotifications
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
