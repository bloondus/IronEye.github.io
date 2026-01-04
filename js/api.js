/**
 * API Module - Handles all external API calls
 * Alpha Vantage for stock data, Google News for news articles
 */

const APIManager = (function() {
    // Alpha Vantage API Configuration
    const ALPHA_VANTAGE_KEY = 'X5LUAWT8B501HEZV';
    const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
    
    // Rate limiting
    const RATE_LIMIT = {
        calls: 0,
        resetTime: Date.now() + 60000, // Reset every minute
        maxCalls: 5 // Alpha Vantage free tier: 5 calls/min, 500 calls/day
    };

    // Cache TTL (Time To Live)
    const CACHE_TTL = {
        QUOTE: 300000,      // 5 minutes
        INTRADAY: 300000,   // 5 minutes
        DAILY: 3600000,     // 1 hour
        NEWS: 1800000,      // 30 minutes
        EXCHANGE_RATE: 3600000  // 1 hour for currency exchange rate
    };

    /**
     * Check and update rate limit
     */
    function checkRateLimit() {
        const now = Date.now();
        
        if (now > RATE_LIMIT.resetTime) {
            RATE_LIMIT.calls = 0;
            RATE_LIMIT.resetTime = now + 60000;
        }
        
        if (RATE_LIMIT.calls >= RATE_LIMIT.maxCalls) {
            const waitTime = Math.ceil((RATE_LIMIT.resetTime - now) / 1000);
            throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
        }
        
        RATE_LIMIT.calls++;
    }

    /**
     * Make API request with error handling
     */
    async function makeRequest(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check for API error messages
            if (data['Error Message']) {
                throw new Error(data['Error Message']);
            }
            
            if (data['Note']) {
                throw new Error('API rate limit reached. Please try again later.');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Get current stock quote
     */
    async function getStockQuote(ticker) {
        const cacheKey = `quote_${ticker}`;
        
        // Try cache first
        const cached = await StorageManager.getCachedData(cacheKey);
        if (cached) {
            return cached;
        }
        
        checkRateLimit();
        
        const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;
        const data = await makeRequest(url);
        
        if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
            throw new Error(`No data found for ticker: ${ticker}`);
        }
        
        const quote = data['Global Quote'];
        const result = {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            lastUpdated: quote['07. latest trading day']
        };
        
        // Cache the result
        await StorageManager.cacheData(cacheKey, result, CACHE_TTL.QUOTE);
        
        return result;
    }

    /**
     * Get intraday stock data for charts (5min intervals)
     */
    async function getIntradayData(ticker) {
        const cacheKey = `intraday_${ticker}`;
        
        // Try cache first
        const cached = await StorageManager.getCachedData(cacheKey);
        if (cached) {
            return cached;
        }
        
        checkRateLimit();
        
        const url = `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=${ALPHA_VANTAGE_KEY}`;
        const data = await makeRequest(url);
        
        if (!data['Time Series (5min)']) {
            throw new Error(`No intraday data found for ticker: ${ticker}`);
        }
        
        const timeSeries = data['Time Series (5min)'];
        const result = Object.entries(timeSeries).map(([time, values]) => ({
            time: time,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume'])
        })).reverse();
        
        // Cache the result
        await StorageManager.cacheData(cacheKey, result, CACHE_TTL.INTRADAY);
        
        return result;
    }

    /**
     * Get daily stock data for charts
     */
    async function getDailyData(ticker, outputsize = 'compact') {
        const cacheKey = `daily_${ticker}_${outputsize}`;
        
        // Try cache first
        const cached = await StorageManager.getCachedData(cacheKey);
        if (cached) {
            return cached;
        }
        
        checkRateLimit();
        
        const url = `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=${outputsize}&apikey=${ALPHA_VANTAGE_KEY}`;
        const data = await makeRequest(url);
        
        if (!data['Time Series (Daily)']) {
            throw new Error(`No daily data found for ticker: ${ticker}`);
        }
        
        const timeSeries = data['Time Series (Daily)'];
        const result = Object.entries(timeSeries).map(([date, values]) => ({
            date: date,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume'])
        })).reverse();
        
        // Cache the result
        await StorageManager.cacheData(cacheKey, result, CACHE_TTL.DAILY);
        
        return result;
    }

    /**
     * Get company information
     */
    async function getCompanyInfo(ticker) {
        const cacheKey = `company_${ticker}`;
        
        // Try cache first
        const cached = await StorageManager.getCachedData(cacheKey);
        if (cached) {
            console.log(`Using cached company info for ${ticker}`);
            return cached;
        }
        
        checkRateLimit();
        
        const url = `${ALPHA_VANTAGE_BASE}?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;
        console.log(`Fetching company overview from: ${url}`);
        const data = await makeRequest(url);
        
        console.log(`API Response for ${ticker}:`, data);
        
        if (!data.Symbol) {
            console.error(`No Symbol in response for ${ticker}:`, data);
            throw new Error(`No company info found for ticker: ${ticker}`);
        }
        
        const result = {
            symbol: data.Symbol,
            name: data.Name,
            description: data.Description,
            sector: data.Sector,
            industry: data.Industry,
            marketCap: data.MarketCapitalization,
            peRatio: data.PERatio,
            dividendYield: data.DividendYield,
            week52High: parseFloat(data['52WeekHigh']),
            week52Low: parseFloat(data['52WeekLow'])
        };
        
        console.log(`Parsed company info for ${ticker}:`, result);
        
        // Cache for longer (24 hours)
        await StorageManager.cacheData(cacheKey, result, 86400000);
        
        return result;
    }

    /**
     * Search for stock ticker
     */
    async function searchTicker(keywords) {
        const url = `${ALPHA_VANTAGE_BASE}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${ALPHA_VANTAGE_KEY}`;
        const data = await makeRequest(url);
        
        if (!data.bestMatches) {
            return [];
        }
        
        return data.bestMatches.map(match => ({
            symbol: match['1. symbol'],
            name: match['2. name'],
            type: match['3. type'],
            region: match['4. region'],
            currency: match['8. currency']
        }));
    }

    /**
     * Get news articles for a stock
     * Using a news API or fallback to Google News search
     */
    async function getStockNews(ticker) {
        const cacheKey = `news_${ticker}`;
        
        // Try cache first
        const cached = await StorageManager.getCachedData(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Alpha Vantage News API (if available with your key)
        try {
            checkRateLimit();
            const url = `${ALPHA_VANTAGE_BASE}?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;
            const data = await makeRequest(url);
            
            if (data.feed && Array.isArray(data.feed)) {
                const articles = data.feed.slice(0, 10).map(article => ({
                    title: article.title,
                    summary: article.summary,
                    url: article.url,
                    source: article.source,
                    publishedAt: article.time_published,
                    sentiment: article.overall_sentiment_label
                }));
                
                await StorageManager.cacheData(cacheKey, articles, CACHE_TTL.NEWS);
                return articles;
            }
        } catch (error) {
            console.warn('Alpha Vantage News API not available, using fallback');
        }
        
        // Fallback: Generate Google News search link
        const newsUrl = `https://news.google.com/search?q=${encodeURIComponent(ticker + ' stock')}`;
        const fallbackArticles = [{
            title: `Latest ${ticker} News`,
            summary: 'Click to view the latest news articles on Google News',
            url: newsUrl,
            source: 'Google News',
            publishedAt: new Date().toISOString(),
            sentiment: 'neutral'
        }];
        
        await StorageManager.cacheData(cacheKey, fallbackArticles, CACHE_TTL.NEWS);
        return fallbackArticles;
    }

    /**
     * Batch fetch quotes for multiple tickers
     */
    async function batchGetQuotes(tickers) {
        const results = {};
        const errors = {};
        
        for (const ticker of tickers) {
            try {
                results[ticker] = await getStockQuote(ticker);
                // Add small delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                errors[ticker] = error.message;
                console.error(`Failed to fetch quote for ${ticker}:`, error);
            }
        }
        
        return { results, errors };
    }

    /**
     * Check if online
     */
    function isOnline() {
        return navigator.onLine;
    }
    /**
     * Get USD to CHF exchange rate
     */
    async function getExchangeRate() {
        const cacheKey = 'exchange_rate_USD_CHF';
        
        // Try cache first
        const cached = await StorageManager.getCachedData(cacheKey);
        if (cached) {
            return cached;
        }
        
        checkRateLimit();
        
        const url = `${ALPHA_VANTAGE_BASE}?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=CHF&apikey=${ALPHA_VANTAGE_KEY}`;
        const data = await makeRequest(url);
    // Public API
    return {
        getStockQuote,
        getIntradayData,
        getDailyData,
        getCompanyInfo,
        searchTicker,
        getStockNews,
        batchGetQuotes,
        getExchangeRate,
        isOnline,
        getRateLimitStatus
    };

    /**
     * Get rate limit status
     */Get rate limit status
     */
    function getRateLimitStatus() {
        const now = Date.now();
        const remaining = RATE_LIMIT.maxCalls - RATE_LIMIT.calls;
        const resetIn = Math.max(0, Math.ceil((RATE_LIMIT.resetTime - now) / 1000));
        
        return {
            remaining,
            resetIn,
            total: RATE_LIMIT.maxCalls
        };
    }

    // Public API
    return {
        getStockQuote,
        getIntradayData,
        getDailyData,
        getCompanyInfo,
        searchTicker,
        getStockNews,
        batchGetQuotes,
        isOnline,
        getRateLimitStatus
    };
})();
