
import { CollectibleItem, StoreProfile } from '../types';

const DB_NAME = 'AsfanutDB';
const DB_VERSION = 1;
const STORE_ITEMS = 'items';
const STORE_SETTINGS = 'settings';

export const initDB = (): Promise<IDBDatabase> => {
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

// Generic helper for transactions
const withStore = async (
  storeName: string, 
  mode: IDBTransactionMode, 
  callback: (store: IDBObjectStore) => IDBRequest | void
): Promise<any> => {
  const db = await initDB();
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

// --- API ---

export const saveProfileToDB = async (profile: StoreProfile) => {
  return withStore(STORE_SETTINGS, 'readwrite', (store) => {
    store.put({ key: 'profile', value: profile });
  });
};

export const getProfileFromDB = async (): Promise<StoreProfile | null> => {
  const result = await withStore(STORE_SETTINGS, 'readonly', (store) => {
    return store.get('profile');
  });
  return result ? result.value : null;
};

export const saveItemToDB = async (item: CollectibleItem) => {
  return withStore(STORE_ITEMS, 'readwrite', (store) => {
    store.put(item);
  });
};

export const getItemsFromDB = async (): Promise<CollectibleItem[]> => {
  const result = await withStore(STORE_ITEMS, 'readonly', (store) => {
    return store.getAll();
  });
  // Sort by created date desc
  return (result as CollectibleItem[]).sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteItemFromDB = async (id: string) => {
  return withStore(STORE_ITEMS, 'readwrite', (store) => {
    store.delete(id);
  });
};
