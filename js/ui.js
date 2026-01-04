/**
 * UI Module - Handles all UI rendering and interactions
 */

const UIManager = (function() {
    // DOM Elements
    const elements = {
        portfolioSummary: document.getElementById('portfolioSummary'),
        totalValue: document.getElementById('totalValue'),
        totalProfit: document.getElementById('totalProfit'),
        totalProfitPercent: document.getElementById('totalProfitPercent'),
        totalStocks: document.getElementById('totalStocks'),
        stockList: document.getElementById('stockList'),
        emptyState: document.getElementById('emptyState'),
        addStockBtn: document.getElementById('addStockBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        stockModal: document.getElementById('stockModal'),
        stockForm: document.getElementById('stockForm'),
        closeModal: document.getElementById('closeModal'),
        cancelBtn: document.getElementById('cancelBtn'),
        detailsModal: document.getElementById('detailsModal'),
        closeDetailsModal: document.getElementById('closeDetailsModal'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        toastContainer: document.getElementById('toastContainer'),
        connectionStatus: document.getElementById('connectionStatus')
    };

    let currentChart = null;
    let editingStockId = null;

    /**
     * Format currency
     */
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    /**
     * Format percentage
     */
    function formatPercentage(value) {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    }

    /**
     * Format number with commas
     */
    function formatNumber(value) {
        return new Intl.NumberFormat('en-US').format(value);
    }

    /**
     * Format date
     */
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Show loading overlay
     */
    function showLoading(message = 'Loading...') {
        if (elements.loadingOverlay) {
            const textElement = elements.loadingOverlay.querySelector('p');
            if (textElement) textElement.textContent = message;
            elements.loadingOverlay.classList.add('active');
        }
    }

    /**
     * Hide loading overlay
     */
    function hideLoading() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.remove('active');
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /**
     * Update connection status indicator
     */
    function updateConnectionStatus() {
        const isOnline = navigator.onLine;
        elements.connectionStatus.classList.toggle('online', isOnline);
        elements.connectionStatus.classList.toggle('offline', !isOnline);
    }

    /**
     * Render portfolio summary
     */
    function renderSummary(stocks, quotes) {
        let totalValue = 0;
        let totalCost = 0;
        
        stocks.forEach(stock => {
            const quote = quotes[stock.ticker];
            if (quote) {
                const currentValue = quote.price * stock.shares;
                const costBasis = stock.buyPrice * stock.shares;
                totalValue += currentValue;
                totalCost += costBasis;
            }
        });
        
        const totalProfit = totalValue - totalCost;
        const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
        
        elements.totalValue.textContent = formatCurrency(totalValue);
        elements.totalStocks.textContent = stocks.length;
        elements.totalProfit.textContent = formatCurrency(totalProfit);
        elements.totalProfitPercent.textContent = formatPercentage(totalProfitPercent);
        
        elements.totalProfitPercent.className = 'summary-percentage ' + 
            (totalProfit >= 0 ? 'positive' : 'negative');
    }

    /**
     * Render stock card
     */
    function renderStockCard(stock, quote) {
        const currentValue = quote ? quote.price * stock.shares : 0;
        const costBasis = stock.buyPrice * stock.shares;
        const profitLoss = currentValue - costBasis;
        const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;
        
        const card = document.createElement('div');
        card.className = 'stock-card';
        card.setAttribute('data-stock-id', stock.id);
        
        // Use company name if available, otherwise show ticker
        const displayName = stock.companyName || stock.ticker;
        
        card.innerHTML = `
            <div class="stock-header">
                <div class="stock-ticker">
                    <h3>${displayName}</h3>
                    <span class="stock-name">${stock.ticker}</span>
                </div>
                <div class="stock-price">
                    <div class="current-price">${quote ? formatCurrency(quote.price) : '---'}</div>
                    ${quote ? `<div class="price-change ${quote.change >= 0 ? 'positive' : 'negative'}">
                        ${formatPercentage(quote.changePercent)}
                    </div>` : ''}
                </div>
            </div>
            <div class="stock-details">
                <div class="detail-item">
                    <span class="detail-label">Shares</span>
                    <span class="detail-value">${formatNumber(stock.shares)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Value</span>
                    <span class="detail-value">${formatCurrency(currentValue)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">P/L</span>
                    <span class="detail-value ${profitLoss >= 0 ? 'positive' : 'negative'}">
                        ${formatPercentage(profitLossPercent)}
                    </span>
                </div>
            </div>
            <div class="stock-actions">
                <button class="btn btn-primary" onclick="UIManager.showStockDetails(${stock.id})">
                    <i class="fas fa-chart-line"></i> Details
                </button>
                <button class="btn btn-secondary" onclick="UIManager.editStock(${stock.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="UIManager.deleteStock(${stock.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        return card;
    }

    /**
     * Render stock list
     */
    function renderStockList(stocks, quotes) {
        elements.stockList.innerHTML = '';
        
        if (stocks.length === 0) {
            elements.emptyState.style.display = 'block';
        } else {
            elements.emptyState.style.display = 'none';
            
            stocks.forEach(stock => {
                const quote = quotes[stock.ticker];
                const card = renderStockCard(stock, quote);
                elements.stockList.appendChild(card);
            });
        }
    }

    /**
     * Show add/edit stock modal
     */
    function showStockModal(stock = null) {
        editingStockId = stock ? stock.id : null;
        
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = stock ? 'Edit Stock' : 'Add Stock';
        
        if (stock) {
            document.getElementById('tickerSymbol').value = stock.ticker;
            document.getElementById('shares').value = stock.shares;
            document.getElementById('buyPrice').value = stock.buyPrice;
            document.getElementById('buyDate').value = stock.buyDate;
        } else {
            elements.stockForm.reset();
            // Set default date to today
            document.getElementById('buyDate').value = new Date().toISOString().split('T')[0];
        }
        
        elements.stockModal.classList.add('active');
    }

    /**
     * Hide stock modal
     */
    function hideStockModal() {
        elements.stockModal.classList.remove('active');
        elements.stockForm.reset();
        editingStockId = null;
    }

    /**
     * Show stock details modal with chart and news
     */
    async function showStockDetails(stockId) {
        try {
            showLoading('Loading stock details...');
            
            const stock = await StorageManager.getStock(stockId);
            if (!stock) throw new Error('Stock not found');
            
            const quote = await APIManager.getStockQuote(stock.ticker);
            
            // Update modal title with company name if available
            const titleText = stock.companyName ? 
                `${stock.companyName} (${stock.ticker})` : 
                `${stock.ticker} - Details`;
            document.getElementById('detailsTitle').textContent = titleText;
            
            // Render stock info
            const currentValue = quote.price * stock.shares;
            const costBasis = stock.buyPrice * stock.shares;
            const profitLoss = currentValue - costBasis;
            const profitLossPercent = (profitLoss / costBasis) * 100;
            
            const detailsInfo = document.getElementById('detailsInfo');
            detailsInfo.innerHTML = `
                <div class="detail-item">
                    <span class="detail-label">Current Price</span>
                    <span class="detail-value">${formatCurrency(quote.price)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Shares Owned</span>
                    <span class="detail-value">${formatNumber(stock.shares)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Value</span>
                    <span class="detail-value">${formatCurrency(currentValue)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Profit/Loss</span>
                    <span class="detail-value ${profitLoss >= 0 ? 'positive' : 'negative'}">
                        ${formatCurrency(profitLoss)} (${formatPercentage(profitLossPercent)})
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Buy Date</span>
                    <span class="detail-value">${formatDate(stock.buyDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Buy Price</span>
                    <span class="detail-value">${formatCurrency(stock.buyPrice)}</span>
                </div>
            `;
            
            // Load chart data
            await renderPriceChart(stock.ticker);
            
            // Setup news button
            const loadNewsBtn = document.getElementById('loadNewsBtn');
            loadNewsBtn.onclick = () => loadStockNews(stock.ticker);
            
            // Clear previous news
            document.getElementById('newsList').innerHTML = '';
            
            elements.detailsModal.classList.add('active');
            hideLoading();
        } catch (error) {
            hideLoading();
            showToast(error.message, 'error');
        }
    }

    /**
     * Hide details modal
     */
    function hideDetailsModal() {
        elements.detailsModal.classList.remove('active');
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
    }

    /**
     * Render price chart
     */
    async function renderPriceChart(ticker) {
        try {
            const dailyData = await APIManager.getDailyData(ticker, 'compact');
            
            // Take last 30 days
            const chartData = dailyData.slice(-30);
            
            const ctx = document.getElementById('priceChart').getContext('2d');
            
            // Destroy previous chart if exists
            if (currentChart) {
                currentChart.destroy();
            }
            
            currentChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.map(d => formatDate(d.date)),
                    datasets: [{
                        label: 'Closing Price',
                        data: chartData.map(d => d.close),
                        borderColor: '#6c63ff',
                        backgroundColor: 'rgba(108, 99, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return 'Price: ' + formatCurrency(context.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(2);
                                },
                                color: '#b8b8d1'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#b8b8d1',
                                maxRotation: 45,
                                minRotation: 45
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to render chart:', error);
            showToast('Failed to load chart data', 'error');
        }
    }

    /**
     * Load and display stock news
     */
    async function loadStockNews(ticker) {
        try {
            showLoading('Loading news...');
            
            const news = await APIManager.getStockNews(ticker);
            const newsList = document.getElementById('newsList');
            
            if (news.length === 0) {
                newsList.innerHTML = '<p>No news articles found.</p>';
            } else {
                newsList.innerHTML = news.map(article => `
                    <div class="news-item">
                        <h4>${article.title}</h4>
                        ${article.summary ? `<p>${article.summary}</p>` : ''}
                        <div class="news-meta">
                            <span>${article.source}</span>
                            ${article.publishedAt ? `<span>${formatDate(article.publishedAt)}</span>` : ''}
                        </div>
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                            Read more <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                `).join('');
            }
            
            hideLoading();
        } catch (error) {
            hideLoading();
            showToast('Failed to load news', 'error');
        }
    }

    /**
     * Get form data for stock
     */
    function getStockFormData() {
        return {
            ticker: document.getElementById('tickerSymbol').value.toUpperCase().trim(),
            shares: parseFloat(document.getElementById('shares').value),
            buyPrice: parseFloat(document.getElementById('buyPrice').value),
            buyDate: document.getElementById('buyDate').value
        };
    }

    /**
     * Get editing stock ID
     */
    function getEditingStockId() {
        return editingStockId;
    }

    /**
     * Edit stock (public method)
     */
    async function editStock(stockId) {
        try {
            const stock = await StorageManager.getStock(stockId);
            if (stock) {
                showStockModal(stock);
            }
        } catch (error) {
            showToast('Failed to load stock data', 'error');
        }
    }

    /**
     * Delete stock (public method)
     */
    async function deleteStock(stockId) {
        if (!confirm('Are you sure you want to delete this stock?')) {
            return;
        }
        
        try {
            showLoading('Deleting stock...');
            await StorageManager.deleteStock(stockId);
            showToast('Stock deleted successfully', 'success');
            
            // Trigger refresh
            if (window.App && window.App.loadPortfolio) {
                await window.App.loadPortfolio();
            }
            hideLoading();
        } catch (error) {
            hideLoading();
            showToast('Failed to delete stock', 'error');
        }
    }

    // Initialize
    function init() {
        // Setup event listeners
        elements.closeModal?.addEventListener('click', hideStockModal);
        elements.cancelBtn?.addEventListener('click', hideStockModal);
        elements.closeDetailsModal?.addEventListener('click', hideDetailsModal);
        
        // Close modals on outside click
        elements.stockModal?.addEventListener('click', (e) => {
            if (e.target === elements.stockModal) hideStockModal();
        });
        elements.detailsModal?.addEventListener('click', (e) => {
            if (e.target === elements.detailsModal) hideDetailsModal();
        });
        
        // Update connection status
        updateConnectionStatus();
        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);
    }

    // Public API
    return {
        init,
        showLoading,
        hideLoading,
        showToast,
        renderSummary,
        renderStockList,
        showStockModal,
        hideStockModal,
        showStockDetails,
        hideDetailsModal,
        getStockFormData,
        getEditingStockId,
        editStock,
        deleteStock,
        formatCurrency,
        formatPercentage,
        formatDate
    };
})();
