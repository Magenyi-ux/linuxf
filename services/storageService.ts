
/**
 * storageService.ts - Local Storage and IndexedDB Interface
 * This service handles persisting large data like PDFs using IndexedDB.
 */

const DB_NAME = 'waExamPrep_DB';
const STORE_NAME = 'pdfs';
const DB_VERSION = 1;

/**
 * Opens (and initializes if necessary) the IndexedDB database.
 */
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) => reject(event.target.error);
    });
};

/**
 * Saves a PDF file to IndexedDB.
 */
export const savePDF = async (id: string, file: File): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.put({
            id,
            name: file.name,
            data: file,
            type: file.type,
            timestamp: Date.now()
        });

        request.onsuccess = () => resolve();
        request.onerror = (event: any) => reject(event.target.error);
    });
};

/**
 * Retrieves all saved PDFs from IndexedDB.
 */
export const getAllPDFs = async (): Promise<{id: string, name: string, data: File}[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) => reject(event.target.error);
    });
};

/**
 * Deletes a PDF from IndexedDB.
 */
export const deletePDF = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event: any) => reject(event.target.error);
    });
};
