
const DB_NAME = 'HamessPackDB';
const DB_VERSION = 9; // Incremented version to force schema update

// Initialize Database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
        console.error("CRITICAL: Database failed to open:", request.error);
        reject(request.error);
    };

    request.onblocked = () => {
       console.warn("Database upgrade blocked. Please close other tabs of this app.");
    };

    request.onsuccess = () => {
        resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log("Upgrading Database Schema to v" + DB_VERSION + "...");
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Products Store (Metadata only, lightweight)
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
      }
      
      // Images Store (Heavy data, isolated)
      if (!db.objectStoreNames.contains('images')) {
        const store = db.createObjectStore('images', { keyPath: 'id' });
        store.createIndex('productId', 'productId', { unique: false });
      }
      
      // Orders Store
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' });
      }
      
      // Coupons Store
      if (!db.objectStoreNames.contains('coupons')) {
        db.createObjectStore('coupons', { keyPath: 'id' });
      }
      
      // Users Store - CRITICAL FOR ADDRESS PERSISTENCE
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('phone', 'phone', { unique: true });
        store.createIndex('email', 'email', { unique: true });
      }
      
      // System Notifications
      if (!db.objectStoreNames.contains('system_notifications')) {
        const store = db.createObjectStore('system_notifications', { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
      }
      
      // Notification Logs
      if (!db.objectStoreNames.contains('notification_logs')) {
        db.createObjectStore('notification_logs', { keyPath: 'id' });
      }

      // Global Settings & Session
      if (!db.objectStoreNames.contains('globals')) {
        db.createObjectStore('globals', { keyPath: 'key' });
      }
    };
  });
};

// Generic Helper to perform Transaction
const performTransaction = <T>(
  storeName: string, 
  mode: IDBTransactionMode, 
  callback: (store: IDBObjectStore) => IDBRequest<any>
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      if (!db.objectStoreNames.contains(storeName)) {
          console.warn(`Store ${storeName} not found. DB might need upgrade.`);
          return resolve([] as any); 
      }

      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = callback(store);

      tx.oncomplete = () => {
        // Transaction committed successfully
      };

      tx.onerror = () => {
        console.error(`Transaction failed on ${storeName}:`, tx.error);
        reject(tx.error);
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
          console.error(`Request failed on ${storeName}:`, request.error);
      };
    } catch (e) {
      console.error("Database Error:", e);
      reject(e);
    }
  });
};

// --- CRUD Operations ---

export const getAll = <T>(storeName: string): Promise<T[]> => {
  return performTransaction<T[]>(storeName, 'readonly', (store) => store.getAll());
};

export const getOne = <T>(storeName: string, id: string): Promise<T | undefined> => {
  return performTransaction<T>(storeName, 'readonly', (store) => store.get(id));
};

export const putItem = (storeName: string, item: any): Promise<string> => {
  return performTransaction<string>(storeName, 'readwrite', (store) => store.put(item));
};

export const deleteItem = (storeName: string, id: string): Promise<void> => {
  return performTransaction<void>(storeName, 'readwrite', (store) => store.delete(id));
};

export const getGlobal = async <T>(key: string, fallback: T): Promise<T> => {
  try {
      const result = await getOne<{key: string, value: T}>('globals', key);
      return result ? result.value : fallback;
  } catch (e) {
      return fallback;
  }
};

export const setGlobal = async (key: string, value: any): Promise<void> => {
  await putItem('globals', { key, value });
};

export const bulkPut = async (storeName: string, items: any[]): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        items.forEach(item => store.put(item));
        
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const clearStore = async (storeName: string): Promise<void> => {
  return performTransaction<void>(storeName, 'readwrite', (store) => store.clear());
};

export const estimateUsage = async () => {
    if (navigator.storage && navigator.storage.estimate) {
        return await navigator.storage.estimate();
    }
    return { usage: 0, quota: 0 };
};
