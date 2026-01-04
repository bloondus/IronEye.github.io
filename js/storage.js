/**
 * Storage Module - Handles all data persistence using IndexedDB
 * Provides offline support and efficient data management
 */

const StorageManager = (function() {
    const DB_NAME = 'IronEyeDB';
    const DB_VERSION = 1;
    const STORES = {
        STOCKS: 'stocks',
        CACHE: 'cache'
    };

    let db = null;

    /**
     * Initialize IndexedDB
     */
    async function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                // Create stocks store
                if (!database.objectStoreNames.contains(STORES.STOCKS)) {
                    const stockStore = database.createObjectStore(STORES.STOCKS, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    stockStore.createIndex('ticker', 'ticker', { unique: false });
                }

                // Create cache store for API responses
                if (!database.objectStoreNames.contains(STORES.CACHE)) {
                    const cacheStore = database.createObjectStore(STORES.CACHE, { 
                        keyPath: 'key' 
                    });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Add a new stock to the portfolio
     */
    async function addStock(stock) {
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.STOCKS], 'readwrite');
            const store = transaction.objectStore(STORES.STOCKS);
            
            const stockData = {
                ticker: stock.ticker.toUpperCase(),
                shares: parseFloat(stock.shares),
                buyPrice: parseFloat(stock.buyPrice),
                buyDate: stock.buyDate,
                addedAt: new Date().toISOString()
            };
            
            const request = store.add(stockData);
            
            request.onsuccess = () => resolve({ ...stockData, id: request.result });
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all stocks from the portfolio
     */
    async function getAllStocks() {
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.STOCKS], 'readonly');
            const store = transaction.objectStore(STORES.STOCKS);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get a single stock by ID
     */
    async function getStock(id) {
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.STOCKS], 'readonly');
            const store = transaction.objectStore(STORES.STOCKS);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update an existing stock
     */
    async function updateStock(id, updates) {
        if (!db) await init();
        
        return new Promise(async (resolve, reject) => {
            const stock = await getStock(id);
            if (!stock) {
                reject(new Error('Stock not found'));
                return;
            }

            const updatedStock = { ...stock, ...updates };
            
            const transaction = db.transaction([STORES.STOCKS], 'readwrite');
            const store = transaction.objectStore(STORES.STOCKS);
            const request = store.put(updatedStock);
            
            request.onsuccess = () => resolve(updatedStock);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete a stock from the portfolio
     */
    async function deleteStock(id) {
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.STOCKS], 'readwrite');
            const store = transaction.objectStore(STORES.STOCKS);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Cache API response
     */
    async function cacheData(key, data, ttl = 3600000) { // Default 1 hour TTL
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CACHE], 'readwrite');
            const store = transaction.objectStore(STORES.CACHE);
            
            const cacheEntry = {
                key: key,
                data: data,
                timestamp: Date.now(),
                ttl: ttl
            };
            
            const request = store.put(cacheEntry);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get cached data if not expired
     */
    async function getCachedData(key) {
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CACHE], 'readonly');
            const store = transaction.objectStore(STORES.CACHE);
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                
                if (!result) {
                    resolve(null);
                    return;
                }
                
                // Check if cache is expired
                const isExpired = (Date.now() - result.timestamp) > result.ttl;
                
                if (isExpired) {
                    // Delete expired cache
                    deleteCachedData(key);
                    resolve(null);
                } else {
                    resolve(result.data);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete cached data
     */
    async function deleteCachedData(key) {
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CACHE], 'readwrite');
            const store = transaction.objectStore(STORES.CACHE);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all cache entries
     */
    async function clearCache() {
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CACHE], 'readwrite');
            const store = transaction.objectStore(STORES.CACHE);
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear old cache entries (older than specified days)
     */
    async function clearOldCache(days = 7) {
        if (!db) await init();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CACHE], 'readwrite');
            const store = transaction.objectStore(STORES.CACHE);
            const index = store.index('timestamp');
            
            const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
            const range = IDBKeyRange.upperBound(cutoffTime);
            
            const request = index.openCursor(range);
            let deleted = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deleted++;
                    cursor.continue();
                } else {
                    resolve(deleted);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Export portfolio data as JSON
     */
    async function exportData() {
        const stocks = await getAllStocks();
        return {
            version: DB_VERSION,
            exportDate: new Date().toISOString(),
            stocks: stocks
        };
    }

    /**
     * Import portfolio data from JSON
     */
    async function importData(data) {
        if (!data || !data.stocks || !Array.isArray(data.stocks)) {
            throw new Error('Invalid import data format');
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const stock of data.stocks) {
            try {
                // Remove id to let DB auto-generate new ones
                const { id, ...stockData } = stock;
                await addStock(stockData);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({ stock: stock.ticker, error: error.message });
            }
        }

        return results;
    }

    // Public API
    return {
        init,
        addStock,
        getAllStocks,
        getStock,
        updateStock,
        deleteStock,
        cacheData,
        getCachedData,
        deleteCachedData,
        clearCache,
        clearOldCache,
        exportData,
        importData
    };
})();

// Initialize storage on load
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init().catch(error => {
        console.error('Failed to initialize storage:', error);
    });
});
