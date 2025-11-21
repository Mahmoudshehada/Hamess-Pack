

const DB_NAME = 'HamessPackDB';
const DB_VERSION = 2; // Incremented version for new store

// Initialize Database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
        console.error("IndexedDB Error:", request.error);
        reject(request.error);
    };

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Products Store (for Inventory)
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
      }
      
      // Images Store (for Binary Blobs/Base64)
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
      
      // Notification Logs Store
      if (!db.objectStoreNames.contains('notification_logs')) {
        const store = db.createObjectStore('notification_logs', { keyPath: 'id' });
        store.createIndex('orderId', 'orderId', { unique: false });
      }

      // Global Settings/User (Key-Value Store)
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
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = callback(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
};

// --- CRUD Operations ---

// 1. Get All Items from a Store
export const getAll = <T>(storeName: string): Promise<T[]> => {
  return performTransaction<T[]>(storeName, 'readonly', (store) => store.getAll());
};

// 2. Get Single Item
export const getOne = <T>(storeName: string, id: string): Promise<T | undefined> => {
  return performTransaction<T>(storeName, 'readonly', (store) => store.get(id));
};

// 3. Put (Insert/Update) Item
export const putItem = (storeName: string, item: any): Promise<string> => {
  return performTransaction<string>(storeName, 'readwrite', (store) => store.put(item));
};

// 4. Delete Item
export const deleteItem = (storeName: string, id: string): Promise<void> => {
  return performTransaction<void>(storeName, 'readwrite', (store) => store.delete(id));
};

// 5. Global Key-Value Helpers (for User, Settings)
export const getGlobal = async <T>(key: string, fallback: T): Promise<T> => {
  const result = await getOne<{key: string, value: T}>('globals', key);
  return result ? result.value : fallback;
};

export const setGlobal = async (key: string, value: any): Promise<void> => {
  await putItem('globals', { key, value });
};

// 6. Bulk Put (for Initial Migration)
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

// 7. Clear Store
export const clearStore = async (storeName: string): Promise<void> => {
  return performTransaction<void>(storeName, 'readwrite', (store) => store.clear());
};

// 8. Estimation
export const estimateUsage = async () => {
    if (navigator.storage && navigator.storage.estimate) {
        return await navigator.storage.estimate();
    }
    return { usage: 0, quota: 0 };
};
