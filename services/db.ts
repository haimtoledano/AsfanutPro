
import { CollectibleItem, StoreProfile } from '../types';
import { APP_CONFIG } from '../config';

const DB_NAME = 'AsfanutDB';
const DB_VERSION = 1;
const STORE_ITEMS = 'items';
const STORE_SETTINGS = 'settings';

// --- Browser Storage (IndexedDB) Implementation ---

const initBrowserDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create Items Store
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
      }

      // Create Settings Store
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };
  });
};

const withStore = async (
  storeName: string, 
  mode: IDBTransactionMode, 
  callback: (store: IDBObjectStore) => IDBRequest | void
): Promise<any> => {
  const db = await initBrowserDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    
    let request: IDBRequest | void;
    try {
      request = callback(store);
    } catch (e) {
      reject(e);
      return;
    }

    transaction.oncomplete = () => {
      resolve(request ? request.result : undefined);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

const browserStorage = {
  saveProfile: async (profile: StoreProfile) => {
    return withStore(STORE_SETTINGS, 'readwrite', (store) => {
      store.put({ key: 'profile', value: profile });
    });
  },

  getProfile: async (): Promise<StoreProfile | null> => {
    const result = await withStore(STORE_SETTINGS, 'readonly', (store) => {
      return store.get('profile');
    });
    return result ? result.value : null;
  },

  saveItem: async (item: CollectibleItem) => {
    return withStore(STORE_ITEMS, 'readwrite', (store) => {
      store.put(item);
    });
  },

  getItems: async (): Promise<CollectibleItem[]> => {
    const result = await withStore(STORE_ITEMS, 'readonly', (store) => {
      return store.getAll();
    });
    return (result as CollectibleItem[]).sort((a, b) => b.createdAt - a.createdAt);
  },

  deleteItem: async (id: string) => {
    return withStore(STORE_ITEMS, 'readwrite', (store) => {
      store.delete(id);
    });
  }
};

// --- Server Storage (API/SQLite) Implementation Mock ---

const serverStorage = {
  saveProfile: async (profile: StoreProfile) => {
    // Example: await fetch(`${APP_CONFIG.apiBaseUrl}/profile`, { method: 'POST', body: JSON.stringify(profile) ... });
    console.log("Saving profile to server...", profile);
    return Promise.resolve(); 
  },

  getProfile: async (): Promise<StoreProfile | null> => {
    console.log("Fetching profile from server...");
    return Promise.resolve(null);
  },

  saveItem: async (item: CollectibleItem) => {
    console.log("Saving item to server...", item);
    return Promise.resolve();
  },

  getItems: async (): Promise<CollectibleItem[]> => {
    console.log("Fetching items from server...");
    return Promise.resolve([]);
  },

  deleteItem: async (id: string) => {
    console.log("Deleting item from server...", id);
    return Promise.resolve();
  }
};

// --- Public Facade ---

const getStorage = () => {
  return APP_CONFIG.storageType === 'SERVER' ? serverStorage : browserStorage;
};

export const saveProfileToDB = (profile: StoreProfile) => getStorage().saveProfile(profile);
export const getProfileFromDB = () => getStorage().getProfile();
export const saveItemToDB = (item: CollectibleItem) => getStorage().saveItem(item);
export const updateItemInDB = (item: CollectibleItem) => getStorage().saveItem(item); // Alias for clarity
export const getItemsFromDB = () => getStorage().getItems();
export const deleteItemFromDB = (id: string) => getStorage().deleteItem(id);
