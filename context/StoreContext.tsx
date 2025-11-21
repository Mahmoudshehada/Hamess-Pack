
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { CartItem, Product, Order, User, Coupon, AppSettings, PaymentMethod, Category, StoredImage, DeliveryLocation, Address } from '../types';
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
  changeLanguage: (lang: 'en' | 'ar') => void;
  
  // Address Management
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  bulkUpdatePrices: (percentage: number, category?: string) => void;
  
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
  
  // System
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  removeNotification: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to safely load from localStorage
const loadState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.warn(`Failed to load state for ${key}`, e);
    return fallback;
  }
};

// Image Compression Utility (800x800, 0.8 Quality)
const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> => {
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
            // Compress to JPEG with 80% quality
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

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 4000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Safe Save Helper to handle QuotaExceededError
  const saveState = useCallback((key: string, value: any) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
      // Check for quota exceeded errors
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
         addNotification(`Storage Limit Reached! Failed to save ${key === 'hp_images' ? 'Images' : 'Data'}. Some data might be lost.`, 'error');
      }
    }
  }, [addNotification]);

  // Initialize state
  const [user, setUser] = useState<User | null>(() => loadState('hp_user', null));
  
  const [rawProducts, setRawProducts] = useState<Product[]>(() => 
    loadState('hp_products', INITIAL_PRODUCTS)
  );
  
  const [storedImages, setStoredImages] = useState<StoredImage[]>(() => 
    loadState('hp_images', [])
  );
  
  const [cart, setCart] = useState<CartItem[]>(() => 
    loadState('hp_cart', [])
  );
  
  const [orders, setOrders] = useState<Order[]>(() => 
    loadState('hp_orders', [])
  );
  
  const [users, setUsers] = useState<User[]>(() => 
    loadState('hp_users', [
      { 
        id: '1', 
        name: 'Walid El Sheikh', 
        phone: '01066665153', 
        email: 'walidelsheikh011111@gmail.com', 
        isAdmin: true, 
        password: '$2b$10$ExampleHashForWalid666', // Simulating bcrypt hash
        addresses: [], language: 'en', notificationsEnabled: true, country: 'Egypt', birthday: ''
      },
      { 
        id: '2', 
        name: 'Mahmoud Shehada', 
        phone: '01010340487', 
        email: 'msbas999@gmail.com', 
        isAdmin: true, 
        password: '$2b$10$ExampleHashForMahmoud77', // Simulating bcrypt hash
        addresses: [], language: 'en', notificationsEnabled: true, country: 'Egypt', birthday: ''
      }
    ])
  );

  const [coupons, setCoupons] = useState<Coupon[]>(() => 
    loadState('hp_coupons', [])
  );
  
  const [settings, setSettings] = useState<AppSettings>(() => 
    loadState('hp_settings', {
      brandColor: '#512D6D',
      currency: 'EGP',
      paymentGateways: { paymob: true, fawry: true, stripe: false },
      shipping: { flatRate: 50, freeShippingThreshold: 1000 }
    })
  );

  // Persistence Effects
  useEffect(() => { saveState('hp_user', user); }, [user, saveState]);
  useEffect(() => { saveState('hp_products', rawProducts); }, [rawProducts, saveState]);
  useEffect(() => { saveState('hp_images', storedImages); }, [storedImages, saveState]);
  useEffect(() => { saveState('hp_cart', cart); }, [cart, saveState]);
  useEffect(() => { saveState('hp_orders', orders); }, [orders, saveState]);
  useEffect(() => { saveState('hp_users', users); }, [users, saveState]);
  useEffect(() => { saveState('hp_coupons', coupons); }, [coupons, saveState]);
  useEffect(() => { saveState('hp_settings', settings); }, [settings, saveState]);

  // Language & Brand Effect
  useEffect(() => {
    document.documentElement.style.setProperty('--color-brand-600', settings.brandColor);
    // Apply Language / RTL
    if (user?.language) {
      document.documentElement.lang = user.language;
      document.documentElement.dir = user.language === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [settings.brandColor, user?.language]);

  // --- User Logic ---
  const login = (phone: string, name?: string, email?: string) => {
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
      setUser(existingUser);
      addNotification(existingUser.language === 'ar' ? `مرحباً بك ${existingUser.name}` : `Welcome back, ${existingUser.name}!`, 'success');
    } else if (name && email) {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        isAdmin: false,
        addresses: [],
        language: 'en',
        notificationsEnabled: true,
        country: 'Egypt',
        birthday: ''
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
    setUsers(users.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u));
    addNotification('User role updated', 'success');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    
    // Update current session user
    setUser(updatedUser);
    
    // Update persistent users list
    setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
    
    addNotification('Profile updated successfully', 'success');
  };

  const changeLanguage = (lang: 'en' | 'ar') => {
    if (!user) return;
    updateUser({ language: lang });
  };

  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    if (!user) return;
    
    // Simulate API Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newAddress: Address = {
      ...addressData,
      id: Date.now().toString(),
      // Ensure legacy geo fields are handled if missing (now default to empty/null safe)
      formattedAddress: addressData.formattedAddress || `${addressData.label}, ${addressData.city}, ${addressData.governorate}`,
      lat: addressData.lat || 0,
      lng: addressData.lng || 0,
    };

    // Backend Payload Construction (Manual Only)
    const apiPayload = {
      userId: user.id,
      formatted_address: newAddress.formattedAddress,
      governorate: newAddress.governorate,
      city: newAddress.city,
      apartment: newAddress.apartment || null,
      phone: newAddress.phone, // New Field
      name: newAddress.contactName,
      notes: newAddress.instructions || null,
      // Geo fields null/optional
      place_id: null,
      latitude: null,
      longitude: null
    };
    
    // Log for verification
    console.log("POST /api/user/addresses", JSON.stringify(apiPayload, null, 2));

    const updatedAddresses = [...user.addresses, newAddress];
    updateUser({ addresses: updatedAddresses });
    addNotification('Address saved successfully!', 'success');
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    // Simulate Delete API
    console.log(`DELETE /api/user/addresses/${id}`);
    updateUser({ addresses: user.addresses.filter(a => a.id !== id) });
    addNotification('Address removed', 'info');
  };

  // --- Image Logic ---
  const uploadProductImage = async (file: File, productId: string): Promise<StoredImage> => {
    try {
      if (file.size > 15 * 1024 * 1024) throw new Error("File too large.");
      
      // Aggressive compression: max 800x800, 80% quality
      const base64Data = await compressImage(file, 800, 800, 0.8);
      
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
       // Avatar compression: max 400x400, 80% quality
       const base64Data = await compressImage(file, 400, 400, 0.8);
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

  const placeOrder = (location: DeliveryLocation, paymentMethod: PaymentMethod) => {
    if (!user) return;
    
    let deliveryFee = settings.shipping.flatRate;
    // Manual address implies standard shipping fee
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
    
    setOrders([newOrder, ...orders]);
    setCart([]);
    addNotification('Order placed successfully!', 'success');
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    addNotification(`Order #${id} updated to ${status}`, 'info');
  };

  // --- Coupons ---
  const addCoupon = (coupon: Coupon) => {
    setCoupons([...coupons, coupon]);
    addNotification('Coupon created', 'success');
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    addNotification('Coupon deleted', 'info');
  };

  // --- Settings ---
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    addNotification('Settings saved', 'success');
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout, updateUser, changeLanguage,
      addAddress, deleteAddress,
      products, addProduct, updateProduct, deleteProduct, bulkUpdatePrices,
      uploadProductImage, uploadUserAvatar, storedImages,
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