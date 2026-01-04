/**
 * Main Application Logic
 * Coordinates between Storage, API, and UI modules
 */

const App = (function() {
    let portfolioStocks = [];
    let stockQuotes = {};
    
    /**
     * Initialize the application
     */
    async function init() {
        try {
            // Initialize UI
            UIManager.init();
            
            // Load portfolio
            await loadPortfolio();
            
            // Setup event listeners
            setupEventListeners();
            
            // Auto-refresh prices every 5 minutes
            setInterval(refreshPrices, 5 * 60 * 1000);
            
            // Clean old cache on startup
            StorageManager.clearOldCache(7).catch(err => 
                console.warn('Failed to clear old cache:', err)
            );
            
            console.log('IronEye initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            UIManager.showToast('Failed to initialize application', 'error');
        }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Add stock button
        const addStockBtn = document.getElementById('addStockBtn');
        if (addStockBtn) {
            addStockBtn.addEventListener('click', () => {
                UIManager.showStockModal();
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshPrices);
        }
        
        // Stock form submission
        const stockForm = document.getElementById('stockForm');
        if (stockForm) {
            stockForm.addEventListener('submit', handleStockFormSubmit);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                UIManager.hideStockModal();
                UIManager.hideDetailsModal();
            }
            
            // Ctrl/Cmd + N to add new stock
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                UIManager.showStockModal();
            }
            
            // Ctrl/Cmd + R to refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                refreshPrices();
            }
        });
    }
    
    /**
     * Load portfolio from storage and fetch current prices
     */
    async function loadPortfolio() {
        try {
            UIManager.showLoading('Loading portfolio...');
            
            // Get stocks from storage
            portfolioStocks = await StorageManager.getAllStocks();
            
            // If no stocks, just update UI
            if (portfolioStocks.length === 0) {
                UIManager.renderStockList([], {});
                UIManager.renderSummary([], {});
                UIManager.hideLoading();
                return;
            }
            
            // Fetch quotes for all stocks
            const tickers = [...new Set(portfolioStocks.map(s => s.ticker))];
            await fetchQuotes(tickers);
            
            // Fetch company names (in background)
            fetchCompanyNames(tickers).catch(err => 
                console.warn('Failed to fetch some company names:', err)
            );
            
            // Render UI
            UIManager.renderStockList(portfolioStocks, stockQuotes);
            UIManager.renderSummary(portfolioStocks, stockQuotes);
            
            UIManager.hideLoading();
        } catch (error) {
            console.error('Failed to load portfolio:', error);
            UIManager.hideLoading();
            UIManager.showToast('Failed to load portfolio data', 'error');
        }
    }
    
    /**
     * Fetch quotes for multiple tickers
     */
    async function fetchQuotes(tickers) {
        if (!APIManager.isOnline()) {
            UIManager.showToast('Offline - showing cached data', 'warning');
            return;
        }
        
        try {
            const { results, errors } = await APIManager.batchGetQuotes(tickers);
            
            // Update stockQuotes with results
            Object.assign(stockQuotes, results);
            
            // Show errors if any
            if (Object.keys(errors).length > 0) {
                console.warn('Some quotes failed to fetch:', errors);
                const errorTickers = Object.keys(errors).join(', ');
                UIManager.showToast(
                    `Failed to fetch data for: ${errorTickers}`, 
                    'warning'
                );
            }
        } catch (error) {
            console.error('Failed to fetch quotes:', error);
            throw error;
        }
    }
    
    /**
     * Fetch company names for tickers
     */
    async function fetchCompanyNames(tickers) {
        if (!APIManager.isOnline()) {
            console.log('Offline - skipping company name fetch');
            return;
        }
        
        console.log('Fetching company names for:', tickers);
        
        for (const ticker of tickers) {
            try {
                // Check if we already have company name
                const hasName = portfolioStocks.some(s => s.ticker === ticker && s.companyName);
                if (hasName) {
                    console.log(`Already have company name for ${ticker}`);
                    continue;
                }
                
                console.log(`Fetching company info for ${ticker}...`);
                
                // Fetch company info
                const companyInfo = await APIManager.getCompanyInfo(ticker);
                
                console.log(`Company info for ${ticker}:`, companyInfo);
                
                if (companyInfo && companyInfo.name) {
                    console.log(`Found company name: ${companyInfo.name}`);
                    
                    // Update all stocks with this ticker
                    for (const stock of portfolioStocks) {
                        if (stock.ticker === ticker && !stock.companyName) {
                            stock.companyName = companyInfo.name;
                            // Update in database
                            await StorageManager.updateStock(stock.id, { 
                                companyName: companyInfo.name 
                            });
                            console.log(`Updated stock ${stock.id} with company name`);
                        }
                    }
                    
                    // Re-render to show company name
                    UIManager.renderStockList(portfolioStocks, stockQuotes);
                    console.log('UI re-rendered with company name');
                }
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.warn(`Failed to fetch company name for ${ticker}:`, error);
            }
        }
        
        console.log('Finished fetching company names');
    }
    
    /**
     * Refresh all stock prices
     */
    async function refreshPrices() {
        if (portfolioStocks.length === 0) {
            UIManager.showToast('No stocks to refresh', 'warning');
            return;
        }
        
        if (!APIManager.isOnline()) {
            UIManager.showToast('Cannot refresh while offline', 'error');
            return;
        }
        
        try {
            UIManager.showLoading('Refreshing prices...');
            
            const tickers = [...new Set(portfolioStocks.map(s => s.ticker))];
            await fetchQuotes(tickers);
            
            // Re-render UI
            UIManager.renderStockList(portfolioStocks, stockQuotes);
            UIManager.renderSummary(portfolioStocks, stockQuotes);
            
            UIManager.hideLoading();
            UIManager.showToast('Prices updated successfully', 'success');
        } catch (error) {
            console.error('Failed to refresh prices:', error);
            UIManager.hideLoading();
            
            // Check rate limit
            const rateLimitStatus = APIManager.getRateLimitStatus();
            if (rateLimitStatus.remaining === 0) {
                UIManager.showToast(
                    `Rate limit reached. Try again in ${rateLimitStatus.resetIn} seconds.`,
                    'error'
                );
            } else {
                UIManager.showToast('Failed to refresh prices', 'error');
            }
        }
    }
    
    /**
     * Handle stock form submission (add or edit)
     */
    async function handleStockFormSubmit(e) {
        e.preventDefault();
        
        const formData = UIManager.getStockFormData();
        const editingId = UIManager.getEditingStockId();
        
        // Validate form data
        if (!formData.ticker || formData.ticker.length === 0) {
            UIManager.showToast('Please enter a ticker symbol', 'error');
            return;
        }
        
        if (formData.shares <= 0) {
            UIManager.showToast('Number of shares must be greater than 0', 'error');
            return;
        }
        
        if (formData.buyPrice <= 0) {
            UIManager.showToast('Buy price must be greater than 0', 'error');
            return;
        }
        
        try {
            UIManager.showLoading(editingId ? 'Updating stock...' : 'Adding stock...');
            
            if (editingId) {
                // Update existing stock
                await StorageManager.updateStock(editingId, formData);
                UIManager.showToast('Stock updated successfully', 'success');
            } else {
                // Verify ticker exists (only when adding new)
                if (APIManager.isOnline()) {
                    try {
                        await APIManager.getStockQuote(formData.ticker);
                    } catch (error) {
                        UIManager.hideLoading();
                        UIManager.showToast(
                            `Invalid ticker symbol: ${formData.ticker}`,
                            'error'
                        );
                        return;
                    }
                }
                
                // Add new stock
                await StorageManager.addStock(formData);
                UIManager.showToast('Stock added successfully', 'success');
            }
            
            // Reload portfolio
            await loadPortfolio();
            
            // Close modal
            UIManager.hideStockModal();
            UIManager.hideLoading();
        } catch (error) {
            console.error('Failed to save stock:', error);
            UIManager.hideLoading();
            UIManager.showToast('Failed to save stock', 'error');
        }
    }
    
    /**
     * Export portfolio data
     */
    async function exportPortfolio() {
        try {
            const data = await StorageManager.exportData();
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ironeye-portfolio-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            UIManager.showToast('Portfolio exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export portfolio:', error);
            UIManager.showToast('Failed to export portfolio', 'error');
        }
    }
    
    /**
     * Import portfolio data
     */
    async function importPortfolio(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            UIManager.showLoading('Importing portfolio...');
            
            const results = await StorageManager.importData(data);
            
            await loadPortfolio();
            
            UIManager.hideLoading();
            
            if (results.failed > 0) {
                UIManager.showToast(
                    `Imported ${results.success} stocks, ${results.failed} failed`,
                    'warning'
                );
            } else {
                UIManager.showToast(
                    `Successfully imported ${results.success} stocks`,
                    'success'
                );
            }
        } catch (error) {
            console.error('Failed to import portfolio:', error);
            UIManager.hideLoading();
            UIManager.showToast('Failed to import portfolio', 'error');
        }
    }
    
    /**
     * Get app statistics
     */
    function getStats() {
        const rateLimitStatus = APIManager.getRateLimitStatus();
        
        return {
            totalStocks: portfolioStocks.length,
            uniqueTickers: new Set(portfolioStocks.map(s => s.ticker)).size,
            apiCallsRemaining: rateLimitStatus.remaining,
            apiResetIn: rateLimitStatus.resetIn,
            isOnline: APIManager.isOnline()
        };
    }
    
    // Make App available globally for UI callbacks
    window.App = {
        loadPortfolio,
        refreshPrices,
        exportPortfolio,
        importPortfolio,
        getStats
    };
    
    // Public API
    return {
        init,
        loadPortfolio,
        refreshPrices,
        exportPortfolio,
        importPortfolio,
        getStats
    };
})();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/IronEye.github.io/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
