
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
  
  // Address Management
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkUpdatePrices: (percentage: number, category?: string) => Promise<void>;
  
  // Categories
  categories: string[];
  addCategory: (name: string) => Promise<void>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;

  // Image Handling
  uploadProductImage: (file: File, productId: string) => Promise<StoredImage>;
  uploadUserAvatar: (file: File) => Promise<string>;
  uploadCategoryImage: (category: string, file: File) => Promise<string>;
  storedImages: StoredImage[];
  categoryImages: Record<string, string>;
  
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
  
  // Notification Center
  systemNotifications: SystemNotification[];
  notificationLogs: NotificationLog[];
  createSystemNotification: (type: NotificationType, title: string, message: string, priority?: 'high'|'normal'|'low', data?: any) => Promise<SystemNotification>;
  markNotificationRead: (id: string) => void;
  deleteSystemNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // System Toasts
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  removeNotification: (id: string) => void;
  resetSystem: () => Promise<void>;
  exportSystemData: () => Promise<void>;
  importSystemData: (file: File) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// --- USERS SEED DATA ---
const SEED_USERS: User[] = [
  // --- Admins (2) ---
  { 
    id: 'admin-1', 
    name: 'Walid El Sheikh', 
    username: 'walid',
    phone: '01066665153', 
    email: 'walidelsheikh011111@gmail.com', 
    role: 'admin',
    isAdmin: true, 
    password: '0000', 
    addresses: [], 
    language: 'ar', 
    notificationsEnabled: true, 
    country: 'Egypt'
  },
  { 
    id: 'admin-2', 
    name: 'Mahmoud Shehada', 
    username: 'mahmoud',
    phone: '01010340487', 
    email: 'msbas999@gmail.com', 
    role: 'admin',
    isAdmin: true, 
    password: '0000', 
    addresses: [], 
    language: 'en', 
    notificationsEnabled: true, 
    country: 'Egypt'
  },
  // --- Staff (3) ---
  { 
    id: 'staff-1', 
    name: 'Staff Member 1', 
    username: 'staff01',
    phone: '01011111111', 
    email: 'staff1@hamesspack.com', 
    role: 'staff', 
    isAdmin: true, 
    password: '1111', 
    addresses: [], 
    language: 'en', 
    notificationsEnabled: true, 
    country: 'Egypt' 
  },
  { 
    id: 'staff-2', 
    name: 'Staff Member 2', 
    username: 'staff02',
    phone: '01022222222', 
    email: 'staff2@hamesspack.com', 
    role: 'staff', 
    isAdmin: true, 
    password: '2222', 
    addresses: [], 
    language: 'en', 
    notificationsEnabled: true, 
    country: 'Egypt' 
  },
  { 
    id: 'staff-3', 
    name: 'Staff Member 3', 
    username: 'staff03',
    phone: '01033333333', 
    email: 'staff3@hamesspack.com', 
    role: 'staff', 
    isAdmin: true, 
    password: '3333', 
    addresses: [], 
    language: 'en', 
    notificationsEnabled: true, 
    country: 'Egypt' 
  },
  // --- Customers (5) ---
  { 
    id: 'cust-1', 
    name: 'Sarah Ahmed', 
    username: 'sarah01',
    phone: '01200000001', 
    email: 'sarah@example.com', 
    role: 'customer', 
    isAdmin: false, 
    password: '1234',
    addresses: [], 
    language: 'en', 
    notificationsEnabled: true, 
    country: 'Egypt' 
  },
  { 
    id: 'cust-2', 
    name: 'Mohamed Ali', 
    username: 'mohamed02',
    phone: '01200000002', 
    email: 'mohamed@example.com', 
    role: 'customer', 
    isAdmin: false, 
    password: '1234',
    addresses: [], 
    language: 'ar', 
    notificationsEnabled: true, 
    country: 'Egypt' 
  },
  { 
    id: 'cust-3', 
    name: 'Laila Hassan', 
    username: 'laila03',
    phone: '01200000003', 
    email: 'laila@example.com', 
    role: 'customer', 
    isAdmin: false, 
    password: '1234',
    addresses: [], 
    language: 'en', 
    notificationsEnabled: true, 
    country: 'Egypt' 
  },
  { 
    id: 'cust-4', 
    name: 'Omar Youssef', 
    username: 'omar04',
    phone: '01200000004', 
    email: 'omar@example.com', 
    role: 'customer', 
    isAdmin: false, 
    password: '1234',
    addresses: [], 
    language: 'ar', 
    notificationsEnabled: true, 
    country: 'Egypt' 
  },
  { 
    id: 'cust-5', 
    name: 'Nour Ezzat', 
    username: 'nour05',
    phone: '01200000005', 
    email: 'nour@example.com', 
    role: 'customer', 
    isAdmin: false, 
    password: '1234',
    addresses: [], 
    language: 'en', 
    notificationsEnabled: true, 
    country: 'Egypt' 
  },
];

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

// Initial Default Settings
const DEFAULT_SETTINGS: AppSettings = {
  general: {
    brandName: 'Hamess Pack',
    contactEmail: 'support@hamesspack.com',
    currency: 'EGP',
    language: 'en'
  },
  shipping: {
    flatRate: 50,
    freeShippingThreshold: 1000,
    deliveryAreas: ['Cairo', 'Giza', 'Alexandria']
  },
  paymentGateways: {
    paymob: true,
    fawry: true,
    stripe: false
  },
  notifications: {
    enableWhatsApp: true,
    enablePush: true,
    enableEmailDigest: false,
    orderAmountThreshold: 0,
    admins: [
      { name: 'Walid El Sheikh', phone: '01066665153', language: 'ar', channels: ['WHATSAPP', 'IN_APP'] },
      { name: 'Mahmoud Shehada', phone: '01010340487', language: 'en', channels: ['WHATSAPP', 'IN_APP'] }
    ]
  },
  ai: {
    enabled: true,
    autoPricing: false,
    autoReorder: true,
    tone: 'Professional'
  },
  security: {
    sessionTimeout: 30,
    requireComplexPassword: true
  },
  backup: {
    lastBackupDate: null,
    autoBackup: true
  }
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- State Definitions ---
  const [user, setUser] = useState<User | null>(null);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(CATEGORY_IMAGES);
  const [categories, setCategories] = useState<string[]>(Object.values(CategoryEnum)); // Dynamic Categories
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 4000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Critical Persistence Loader ---
  const loadDataFromDB = async () => {
    try {
      const isInitialized = localStorage.getItem('hp_system_init');

      // 1. Load Products & Images
      let dbProducts = await db.getAll<Product>('products');
      const dbImages = await db.getAll<StoredImage>('images');
      
      // Initial Seed Logic: Only runs ONCE.
      if (!isInitialized) {
        console.log("System First Run: Seeding Mock Data...");
        if (!dbProducts || dbProducts.length === 0) {
            await db.bulkPut('products', MOCK_PRODUCTS);
            dbProducts = MOCK_PRODUCTS;
        }
        localStorage.setItem('hp_system_init', 'true');
      }

      setRawProducts(dbProducts || []);
      setStoredImages(dbImages || []);

      // 3. Load Categories & Category Images
      const dbCategoryImages = await db.getGlobal<Record<string, string>>('hp_category_images', {});
      setCategoryImages({ ...CATEGORY_IMAGES, ...dbCategoryImages });
      
      const dbCategories = await db.getGlobal<string[]>('hp_categories', Object.values(CategoryEnum));
      setCategories(dbCategories);

      // 4. Load Orders
      const dbOrders = await db.getAll<Order>('orders');
      setOrders((dbOrders || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      // 5. Load Coupons & Logs
      const dbCoupons = await db.getAll<Coupon>('coupons');
      setCoupons(dbCoupons || []);
      
      const dbLogs = await db.getAll<NotificationLog>('notification_logs');
      setNotificationLogs((dbLogs || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      const dbSysNotifs = await db.getAll<SystemNotification>('system_notifications');
      setSystemNotifications((dbSysNotifs || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      // 6. Load Globals
      const loadedUser = await db.getGlobal<User | null>('hp_user', null);
      setUser(loadedUser);

      const loadedSettings = await db.getGlobal<AppSettings>('hp_settings', DEFAULT_SETTINGS);
      setSettings(prev => ({ 
          ...prev, 
          ...loadedSettings,
          general: { ...prev.general, ...loadedSettings.general },
          shipping: { ...prev.shipping, ...loadedSettings.shipping },
          notifications: { ...prev.notifications, ...loadedSettings.notifications },
          ai: { ...prev.ai, ...loadedSettings.ai },
          security: { ...prev.security, ...loadedSettings.security },
          backup: { ...prev.backup, ...loadedSettings.backup }
      }));

      const loadedCart = await db.getGlobal<CartItem[]>('hp_cart', []);
      setCart(loadedCart);
      
      // 7. Load Users - Merge with SEED Data
      let loadedUsers = await db.getGlobal<User[]>('hp_users', []);
      const nonSeedUsers = loadedUsers.filter(u => !SEED_USERS.some(s => s.phone === u.phone));
      const mergedUsers = [...SEED_USERS, ...nonSeedUsers];
      
      if (JSON.stringify(mergedUsers) !== JSON.stringify(loadedUsers)) {
          await db.setGlobal('hp_users', mergedUsers);
      }
      setUsers(mergedUsers);

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

  // --- Sync Globals on Change ---
  useEffect(() => { if(!isLoading) db.setGlobal('hp_user', user); }, [user, isLoading]);
  useEffect(() => { if(!isLoading) db.setGlobal('hp_cart', cart); }, [cart, isLoading]);
  useEffect(() => { if(!isLoading) db.setGlobal('hp_settings', settings); }, [settings, isLoading]);
  useEffect(() => { if(!isLoading) db.setGlobal('hp_users', users); }, [users, isLoading]);

  // --- Actions ---
  const resetSystem = async () => {
    if(!window.confirm("WARNING: This will wipe ALL data. Are you sure?")) return;
    try {
      await db.clearStore('products');
      await db.clearStore('images');
      await db.clearStore('orders');
      await db.clearStore('notification_logs');
      await db.clearStore('system_notifications');
      await db.deleteItem('globals', 'hp_category_images');
      await db.deleteItem('globals', 'hp_categories');
      
      // Re-seed
      await db.bulkPut('products', MOCK_PRODUCTS);
      
      setRawProducts(MOCK_PRODUCTS);
      setStoredImages([]);
      setCategoryImages(CATEGORY_IMAGES); 
      setCategories(Object.values(CategoryEnum));
      setOrders([]);
      setNotificationLogs([]);
      setSystemNotifications([]);
      localStorage.removeItem('hp_system_init');
      
      addNotification('System Reset to Factory Defaults.', 'success');
    } catch (e) {
      addNotification('Reset failed.', 'error');
    }
  };
  
  const exportSystemData = async () => {
      try {
          const data = {
              timestamp: new Date().toISOString(),
              version: '1.0',
              products: await db.getAll('products'),
              orders: await db.getAll('orders'),
              users: await db.getAll('hp_users') || users,
              settings: settings,
              categories: await db.getGlobal('hp_categories', categories)
          };
          
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `hamesspack_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          setSettings(prev => ({ ...prev, backup: { ...prev.backup, lastBackupDate: new Date().toISOString() } }));
          addNotification('System backup downloaded successfully.', 'success');
      } catch (e) {
          console.error(e);
          addNotification('Export failed.', 'error');
      }
  };
  
  const importSystemData = async (file: File) => {
      try {
          const reader = new FileReader();
          reader.onload = async (e) => {
              const text = e.target?.result as string;
              const data = JSON.parse(text);
              
              if (!data.products || !data.orders) {
                  throw new Error("Invalid backup file format");
              }
              
              if(!window.confirm(`Restore backup from ${data.timestamp}? This will overwrite current data.`)) return;
              
              setIsLoading(true);
              
              // Wipe current
              await db.clearStore('products');
              await db.clearStore('orders');
              
              // Restore
              if (data.products) {
                 await db.bulkPut('products', data.products);
                 setRawProducts(data.products);
              }
              if (data.orders) {
                 await db.bulkPut('orders', data.orders);
                 setOrders(data.orders);
              }
              if (data.users) {
                 await db.setGlobal('hp_users', data.users);
                 setUsers(data.users);
              }
              if (data.settings) {
                 setSettings(data.settings);
              }
              if (data.categories) {
                  setCategories(data.categories);
                  await db.setGlobal('hp_categories', data.categories);
              }
              
              setIsLoading(false);
              addNotification('System restored successfully.', 'success');
          };
          reader.readAsText(file);
      } catch (e) {
          addNotification('Import failed. Invalid file.', 'error');
      }
  };

  const login = (identifier: string, password?: string, name?: string, email?: string): boolean => {
    const existingUser = users.find(u => 
      u.phone === identifier || 
      (u.username && u.username.toLowerCase() === identifier.toLowerCase())
    );

    if (existingUser) {
       if (existingUser.password) {
           if (password === existingUser.password) {
               setUser(existingUser);
               addNotification(`Welcome back, ${existingUser.name}!`, 'success');
               return true;
           } else {
               addNotification('Incorrect Password', 'error');
               return false;
           }
       } else {
           setUser(existingUser);
           addNotification(`Welcome back, ${existingUser.name}!`, 'success');
           return true;
       }
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
      addNotification('Account created successfully!', 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    addNotification('Logged out successfully', 'info');
  };

  const toggleUserAdmin = (id: string) => {
    setUsers(prev => prev.map(u => {
       if (u.id === id) {
         const newRole: UserRole = u.role === 'customer' ? 'staff' : 'customer';
         return { ...u, role: newRole, isAdmin: newRole !== 'customer' };
       }
       return u;
    }));
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

  const uploadProductImage = async (file: File, productId: string): Promise<StoredImage> => {
    try {
      const base64Data = await compressImage(file, 800, 800, 0.7);
      const newImage: StoredImage = {
        id: `img_${Date.now()}`,
        productId: productId,
        path: '', 
        data: base64Data,
        uploadDate: new Date().toISOString(),
        mimeType: 'image/jpeg',
        status: 'active'
      };
      
      // Save heavy image to 'images' store
      await db.putItem('images', newImage);
      
      // Update local state
      setStoredImages(prev => [...prev.filter(img => img.productId !== productId), newImage]);
      
      return newImage;
    } catch (error) {
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

  const uploadCategoryImage = async (category: string, file: File): Promise<string> => {
    try {
      const base64Data = await compressImage(file, 600, 600, 0.8);
      const newMap = { ...categoryImages, [category]: base64Data };
      setCategoryImages(newMap);
      await db.setGlobal('hp_category_images', newMap);
      addNotification('Category image updated', 'success');
      return base64Data;
    } catch (e) {
      addNotification('Failed to update category image', 'error');
      throw e;
    }
  };

  // --- CATEGORY MANAGEMENT ---
  const addCategory = async (name: string) => {
      if (categories.includes(name)) {
          addNotification('Category already exists', 'error');
          return;
      }
      const newCats = [...categories, name];
      setCategories(newCats);
      await db.setGlobal('hp_categories', newCats);
      addNotification('Category added', 'success');
  };

  const renameCategory = async (oldName: string, newName: string) => {
      if (categories.includes(newName)) {
          addNotification('Category name already exists', 'error');
          return;
      }
      const newCats = categories.map(c => c === oldName ? newName : c);
      setCategories(newCats);
      await db.setGlobal('hp_categories', newCats);

      const updatedProducts = rawProducts.map(p => p.category === oldName ? { ...p, category: newName } : p);
      setRawProducts(updatedProducts);
      for(const p of updatedProducts) {
          if (p.category === newName) await db.putItem('products', p);
      }

      if (categoryImages[oldName]) {
          const newMap = { ...categoryImages, [newName]: categoryImages[oldName] };
          delete newMap[oldName];
          setCategoryImages(newMap);
          await db.setGlobal('hp_category_images', newMap);
      }
      addNotification('Category renamed', 'success');
  };

  const deleteCategory = async (name: string) => {
      const newCats = categories.filter(c => c !== name);
      setCategories(newCats);
      await db.setGlobal('hp_categories', newCats);
      addNotification('Category deleted', 'info');
  };

  // --- Product Logic (View Construction) ---
  const products = useMemo(() => {
    return rawProducts.map(product => {
      // If product has a linked imageId, try to find it in the stored images
      if (product.imageId) {
        const storedImg = storedImages.find(img => img.id === product.imageId);
        if (storedImg) return { ...product, image: storedImg.data };
      }
      // Fallback for legacy products or those with direct base64 (not recommended)
      if (product.image) return product;
      return { ...product, image: 'https://via.placeholder.com/400?text=No+Image' };
    });
  }, [rawProducts, storedImages]);

  const addProduct = async (product: Product) => {
    try {
        await db.putItem('products', product);
        setRawProducts(prev => [...prev, product]);
        addNotification('Product saved successfully.', 'success');
    } catch (e) {
        console.error(e);
        addNotification('Critical Error: Failed to save product to DB.', 'error');
    }
  };

  const updateProduct = async (product: Product) => {
    try {
        await db.putItem('products', product);
        setRawProducts(prev => prev.map(p => p.id === product.id ? product : p));
        addNotification('Product updated successfully', 'success');
    } catch (e) {
        addNotification('Critical Error: Failed to update product', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
        await db.deleteItem('products', id);
        setRawProducts(prev => prev.filter(p => p.id !== id));
        addNotification('Product deleted', 'info');
    } catch (e) {
        addNotification('Failed to delete product', 'error');
    }
  };

  const bulkUpdatePrices = async (percentage: number, category?: string) => {
    const multiplier = 1 + (percentage / 100);
    const newProducts = rawProducts.map(p => {
      if (category && category !== 'All' && p.category !== category) return p;
      return { ...p, price: Math.round(p.price * multiplier) };
    });
    
    // Batch Update
    for (const p of newProducts) await db.putItem('products', p);
    setRawProducts(newProducts);
    addNotification('Prices updated', 'success');
  };

  // Notification Management
  const createSystemNotification = async (type: NotificationType, title: string, message: string, priority: 'high' | 'normal' | 'low' = 'normal', data?: any) => {
    const newNotif: SystemNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      priority,
      timestamp: new Date().toISOString(),
      isRead: false,
      readBy: [],
      data
    };
    
    await db.putItem('system_notifications', newNotif);
    setSystemNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationRead = async (id: string) => {
    const notif = systemNotifications.find(n => n.id === id);
    if (notif && user) {
        const updated = { ...notif, isRead: true, readBy: [...(notif.readBy || []), user.id] };
        await db.putItem('system_notifications', updated);
        setSystemNotifications(prev => prev.map(n => n.id === id ? updated : n));
    }
  };

  const deleteSystemNotification = async (id: string) => {
      await db.deleteItem('system_notifications', id);
      setSystemNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = async () => {
     await db.clearStore('system_notifications');
     setSystemNotifications([]);
     addNotification('Inbox cleared', 'info');
  };


  // Cart Logic
  const addToCart = (product: Product, quantity: number, color?: string, note?: string) => {
    const existingItem = cart.find(item => 
      item.id === product.id && 
      item.selectedColor === color && 
      item.customizationNote === note
    );
    if (existingItem) {
      setCart(cart.map(item => item === existingItem ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setCart([...cart, { ...product, quantity, selectedColor: color, customizationNote: note }]);
    }
    addNotification('Added to cart', 'success');
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
      // 1. Save Order (Wait for completion)
      await db.putItem('orders', newOrder);
      setOrders(prev => [newOrder, ...prev]);
      setCart([]);

      // 2. Decrease Stock
      const updatedProducts = rawProducts.map(p => {
        const cartItem = cart.find(item => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
      
      for(const p of updatedProducts) await db.putItem('products', p);
      setRawProducts(updatedProducts);

      // 3. Notify
      const notifTitle = `New Order #${newOrder.id}`;
      const notifBody = `${newOrder.customerName} (${newOrder.deliveryLocation?.city}) - ${newOrder.total} EGP`;
      await createSystemNotification('ORDER', notifTitle, notifBody, 'high', { orderId: newOrder.id });

    } catch (e) {
      console.error(e);
      addNotification("Critical: Order failed to save. Please check storage.", "error");
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    const order = updated.find(o => o.id === id);
    if(order) await db.putItem('orders', order);
    addNotification('Order status updated', 'success');
  };

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await db.setGlobal('hp_settings', newSettings);
    addNotification('Settings saved', 'success');
  };

  // Mock Coupons
  const addCoupon = async (coupon: Coupon) => {
    setCoupons([...coupons, coupon]);
    await db.putItem('coupons', coupon);
  };
  const deleteCoupon = async (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    await db.deleteItem('coupons', id);
  };

  const value = {
    isLoading, user, login, logout, updateUser, changeLanguage,
    addAddress, deleteAddress,
    products, addProduct, updateProduct, deleteProduct, bulkUpdatePrices,
    categories, addCategory, renameCategory, deleteCategory,
    uploadProductImage, uploadUserAvatar, uploadCategoryImage, storedImages, categoryImages,
    cart, addToCart, removeFromCart, cartTotal, placeOrder,
    orders, updateOrderStatus,
    users, toggleUserAdmin, coupons, addCoupon, deleteCoupon, settings, updateSettings,
    notifications, addNotification, removeNotification, resetSystem, exportSystemData, importSystemData,
    systemNotifications, notificationLogs, createSystemNotification, markNotificationRead, deleteSystemNotification, clearAllNotifications
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
