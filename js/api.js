/**
 * API Module - Handles all external API calls
 * Alpha Vantage for stock data, Google News for news articles
 */

const APIManager = (function() {
    // Alpha Vantage API Configuration - Multiple keys with automatic rotation
    const ALPHA_VANTAGE_KEYS = [
        'X5LUAWT8B501HEZV',  // Primary key
        '6WAK1QLOINYRISY4',  // Fallback 1
        'YKRVM6CGDW3FO0E8',  // Fallback 2
        '77O3FLN75S90Z8ZO',  // Fallback 3
        '7SKHB0ASQA19XAFH'   // Fallback 4
    ];
    let currentKeyIndex = 0;
    let ALPHA_VANTAGE_KEY = ALPHA_VANTAGE_KEYS[currentKeyIndex];
    const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
    
    // Rate limiting per key
    const RATE_LIMITS = ALPHA_VANTAGE_KEYS.map(() => ({
        calls: 0,
        resetTime: Date.now() + 60000,
        maxCalls: 5,
        failures: 0
    }));

    // Swiss Valor numbers to ticker mapping
    const SWISS_VALOR = {
        '874251': 'SCMN.SW',      // Swisscom
        '3886335': 'NESN.SW',     // Nestlé
        '1200526': 'NOVN.SW',     // Novartis
        '1203204': 'ROG.SW',      // Roche
        '1213860': 'ABBN.SW',     // ABB
        '24476758': 'UBSG.SW',    // UBS
        '1213853': 'CSGN.SW',     // Credit Suisse
        '1107539': 'ZURN.SW',     // Zurich Insurance
        '1485278': 'SREN.SW',     // Swiss Re
        '1064593': 'GIVN.SW',     // Givaudan
        '1384101': 'LONN.SW',     // Lonza
        '1485287': 'SLHN.SW',     // Swiss Life
        '1226836': 'SGSN.SW',     // SGS
        '2414615': 'GEBN.SW',     // Geberit
        '21048333': 'CFR.SW'      // Richemont
    };

    // ISIN to ticker mapping
    const ISIN_TO_TICKER = {
        // Swiss stocks (CH prefix)
        'CH0008742519': 'SCMN.SW',    // Swisscom
        'CH0038863350': 'NESN.SW',    // Nestlé
        'CH0012005267': 'NOVN.SW',    // Novartis
        'CH0012032048': 'ROG.SW',     // Roche
        'CH0012138530': 'ABBN.SW',    // ABB
        'CH0244767585': 'UBSG.SW',    // UBS
        'CH0012138522': 'CSGN.SW',    // Credit Suisse
        'CH0011075394': 'ZURN.SW',    // Zurich Insurance
        'CH0014852781': 'SREN.SW',    // Swiss Re
        'CH0010645932': 'GIVN.SW',    // Givaudan
        'CH0013841017': 'LONN.SW',    // Lonza
        'CH0014852872': 'SLHN.SW',    // Swiss Life
        'CH0002268036': 'SGSN.SW',    // SGS
        'CH0024146153': 'GEBN.SW',    // Geberit
        'CH0210483332': 'CFR.SW',     // Richemont
        // US stocks (optional examples)
        'US0378331005': 'AAPL',       // Apple
        'US5949181045': 'MSFT',       // Microsoft
        'US88160R1014': 'TSLA',       // Tesla
        'US02079K3059': 'GOOGL'       // Alphabet/Google
    };

    // Swiss company names for display
    const SWISS_COMPANIES = {
        'SCMN.SW': 'Swisscom AG',
        'NESN.SW': 'Nestlé SA',
        'NOVN.SW': 'Novartis AG',
        'ROG.SW': 'Roche Holding AG',
        'ABBN.SW': 'ABB Ltd',
        'UBSG.SW': 'UBS Group AG',
        'CSGN.SW': 'Credit Suisse Group AG',
        'ZURN.SW': 'Zurich Insurance Group AG',
        'SREN.SW': 'Swiss Re AG',
        'GIVN.SW': 'Givaudan SA',
        'LONN.SW': 'Lonza Group AG',
        'SLHN.SW': 'Swiss Life Holding AG',
        'SGSN.SW': 'SGS SA',
        'GEBN.SW': 'Geberit AG',
        'CFR.SW': 'Compagnie Financière Richemont SA'
    };

    // Swiss ticker mapping (without .SW)
    const SWISS_TICKER_MAP = {
        'SCMN': 'SCMN.SW',
        'NESN': 'NESN.SW',
        'NOVN': 'NOVN.SW',
        'ROG': 'ROG.SW',
        'ABBN': 'ABBN.SW',
        'UBSG': 'UBSG.SW',
        'CSGN': 'CSGN.SW',
        'ZURN': 'ZURN.SW',
        'SREN': 'SREN.SW',
        'GIVN': 'GIVN.SW',
        'LONN': 'LONN.SW',
        'SLHN': 'SLHN.SW',
        'SGSN': 'SGSN.SW',
        'GEBN': 'GEBN.SW',
        'CFR': 'CFR.SW',
        'SIKA': 'SIKA.SW',
        'ALC': 'ALC.SW',
        'HOLN': 'HOLN.SW'
    };

    /**
     * Normalize ticker - add .SW for known Swiss stocks
     */
    function normalizeSwissTicker(ticker) {
        const upper = ticker.toUpperCase().trim();
        
        // Already has .SW
        if (upper.endsWith('.SW')) {
            return upper;
        }
        
        // Check if it's a known Swiss stock
        if (SWISS_TICKER_MAP[upper]) {
            console.log(`📍 Normalized Swiss ticker: ${upper} → ${SWISS_TICKER_MAP[upper]}`);
            return SWISS_TICKER_MAP[upper];
        }
        
        return ticker;
    }

    // Cache TTL (Time To Live)
    const CACHE_TTL = {
        QUOTE: 300000,      // 5 minutes
        INTRADAY: 300000,   // 5 minutes
        DAILY: 3600000,     // 1 hour
        NEWS: 1800000,      // 30 minutes
        EXCHANGE_RATE: 3600000  // 1 hour for currency exchange rate
    };

    /**
     * Rotate to next API key
     */
    function rotateAPIKey() {
        const oldIndex = currentKeyIndex;
        currentKeyIndex = (currentKeyIndex + 1) % ALPHA_VANTAGE_KEYS.length;
        ALPHA_VANTAGE_KEY = ALPHA_VANTAGE_KEYS[currentKeyIndex];
        
        console.warn(`🔄 API Key rotated from #${oldIndex + 1} to #${currentKeyIndex + 1}`);
        console.log(`🔑 Using key: ...${ALPHA_VANTAGE_KEY.slice(-4)}`);
        
        return ALPHA_VANTAGE_KEY;
    }

    /**
     * Check and update rate limit for current key
     */
    function checkRateLimit() {
        const limit = RATE_LIMITS[currentKeyIndex];
        const now = Date.now();
        
        if (now > limit.resetTime) {
            limit.calls = 0;
            limit.resetTime = now + 60000;
        }
        
        if (limit.calls >= limit.maxCalls) {
            // Try to rotate to next key
            console.warn(`⚠️ Rate limit reached for key #${currentKeyIndex + 1}, rotating...`);
            rotateAPIKey();
            return checkRateLimit(); // Check new key
        }
        
        limit.calls++;
    }

    /**
     * Make API request with error handling and automatic key rotation
     */
    async function makeRequest(url, retries = ALPHA_VANTAGE_KEYS.length) {
        if (retries <= 0) {
            throw new Error('All API keys exhausted. Please wait a moment.');
        }

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
            
            // Check for rate limit - rotate key and retry
            if (data['Note'] || data['Information']) {
                const message = data['Note'] || data['Information'];
                if (message.includes('call frequency') || message.includes('Thank you')) {
                    console.warn(`⚠️ Rate limit detected: ${message}`);
                    RATE_LIMITS[currentKeyIndex].failures++;
                    
                    // Rotate to next key
                    const oldKey = ALPHA_VANTAGE_KEY;
                    rotateAPIKey();
                    
                    // Rebuild URL with new key
                    const newUrl = url.replace(oldKey, ALPHA_VANTAGE_KEY);
                    console.log(`🔄 Retrying with new key...`);
                    
                    return makeRequest(newUrl, retries - 1);
                }
                throw new Error(message);
            }
            
            // Success - reset failure count
            RATE_LIMITS[currentKeyIndex].failures = 0;
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            
            // If network error and we have retries left, try next key
            if (retries > 1 && (error.message.includes('fetch') || error.message.includes('network'))) {
                rotateAPIKey();
                const newUrl = url.replace(/apikey=[^&]+/, `apikey=${ALPHA_VANTAGE_KEY}`);
                return makeRequest(newUrl, retries - 1);
            }
            
            throw error;
        }
    }

    /**
     * Get current stock quote with multi-API fallback strategy
     */
    async function getStockQuote(ticker) {
        // Normalize ticker (add .SW for Swiss stocks)
        ticker = normalizeSwissTicker(ticker);
        
        const cacheKey = `quote_${ticker}`;
        
        // Try cache first
        const cached = await StorageManager.getCachedData(cacheKey);
        if (cached) {
            return cached;
        }
        
        let result;
        const isSwissStock = ticker.endsWith('.SW');
        
        try {
            // Strategy 1: For Swiss stocks, try Twelve Data first
            if (isSwissStock) {
                console.log(`🇨🇭 Swiss stock detected: ${ticker}, trying Twelve Data first...`);
                try {
                    const twelveQuote = await TwelveDataAPI.getQuote(ticker);
                    result = {
                        symbol: twelveQuote.symbol,
                        price: twelveQuote.price,
                        change: twelveQuote.change,
                        changePercent: twelveQuote.changePercent,
                        volume: twelveQuote.volume,
                        currency: twelveQuote.currency || 'CHF',
                        lastUpdated: twelveQuote.lastUpdated,
                        source: 'TwelveData',
                        skipConversion: true  // Swiss stocks already in CHF
                    };
                    console.log(`✅ Twelve Data successful for ${ticker} (CHF)`);
                } catch (twelveError) {
                    console.warn(`⚠️ Twelve Data failed, trying Yahoo Finance...`);
                    
                    // Fallback to Yahoo Finance for Swiss stocks (Finnhub doesn't support .SW in free tier)
                    const yahooQuote = await YahooFinance.getQuote(ticker);
                    result = {
                        symbol: yahooQuote.symbol,
                        price: yahooQuote.price,
                        change: yahooQuote.change,
                        changePercent: yahooQuote.changePercent,
                        currency: yahooQuote.currency || 'CHF',
                        lastUpdated: yahooQuote.regularMarketTime.toISOString().split('T')[0],
                        source: 'YahooFinance',
                        skipConversion: yahooQuote.currency === 'CHF'  // Skip if already CHF
                    };
                    console.log(`✅ Yahoo Finance successful for ${ticker} (${yahooQuote.currency})`);
                }
            } else {
                // Strategy 2: For US/international stocks, try Alpha Vantage first
                try {
                    checkRateLimit();
                    
                    const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;
                    const data = await makeRequest(url);
                    
                    if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
                        throw new Error(`No data found for ticker: ${ticker}`);
                    }
                    
                    const quote = data['Global Quote'];
                    result = {
                        symbol: quote['01. symbol'],
                        price: parseFloat(quote['05. price']),
                        change: parseFloat(quote['09. change']),
                        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                        volume: parseInt(quote['06. volume']),
                        lastUpdated: quote['07. latest trading day'],
                        currency: 'USD',
                        source: 'AlphaVantage',
                        skipConversion: false  // USD needs conversion to CHF
                    };
                } catch (alphaError) {
                    console.warn(`⚠️ Alpha Vantage failed for ${ticker}, trying Finnhub...`);
                    
                    // Fallback to Finnhub
                    const finnhubQuote = await FinnhubAPI.getQuote(ticker);
                    result = {
                        symbol: finnhubQuote.symbol,
                        price: finnhubQuote.price,
                        change: finnhubQuote.change,
                        changePercent: finnhubQuote.changePercent,
                        volume: 0,
                        lastUpdated: new Date(finnhubQuote.timestamp * 1000).toISOString().split('T')[0],
                        currency: 'USD',
                        source: 'Finnhub',
                        skipConversion: false  // USD needs conversion to CHF
                    };
                    console.log(`✅ Finnhub successful for ${ticker}`);
                }
            }
        } catch (finalError) {
            console.error(`❌ All APIs failed for ${ticker}`);
            throw new Error(`Could not fetch quote for ${ticker}`);
        }
        
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
        
        let result;
        
        try {
            // Try Alpha Vantage first
            checkRateLimit();
            
            const url = `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=${outputsize}&apikey=${ALPHA_VANTAGE_KEY}`;
            const data = await makeRequest(url);
            
            if (!data['Time Series (Daily)']) {
                throw new Error(`No daily data found for ticker: ${ticker}`);
            }
            
            const timeSeries = data['Time Series (Daily)'];
            result = Object.entries(timeSeries).map(([date, values]) => ({
                date: date,
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: parseInt(values['5. volume'])
            })).reverse();
        } catch (alphaError) {
            // Fallback to Yahoo Finance
            console.warn(`⚠️ Alpha Vantage failed for ${ticker}, trying Yahoo Finance...`);
            
            try {
                const days = outputsize === 'full' ? 365 : 100; // Map outputsize to days
                const yahooData = await YahooFinance.getHistoricalData(ticker, days);
                
                result = yahooData.map(item => ({
                    date: item.date,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    volume: item.volume
                }));
                
                console.log(`✅ Yahoo Finance successful for ${ticker}`);
            } catch (yahooError) {
                console.error(`❌ Both APIs failed for ${ticker} daily data`);
                throw new Error(`Could not fetch daily data for ${ticker}`);
            }
        }
        
        // Cache the result
        await StorageManager.cacheData(cacheKey, result, CACHE_TTL.DAILY);
        
        return result;
    }

    /**
     * Get company information
     */
    async function getCompanyInfo(ticker) {
        // Normalize ticker first
        ticker = normalizeSwissTicker(ticker);
        
        const cacheKey = `company_${ticker}`;
        
        // Try cache first
        const cached = await StorageManager.getCachedData(cacheKey);
        if (cached) {
            console.log(`Using cached company info for ${ticker}`);
            return cached;
        }
        
        let result;
        const isSwissStock = ticker.endsWith('.SW');
        
        // Check hardcoded Swiss company names first
        if (isSwissStock && SWISS_COMPANIES[ticker]) {
            result = {
                symbol: ticker,
                name: SWISS_COMPANIES[ticker],
                description: '',
                sector: 'N/A',
                industry: 'N/A',
                marketCap: 'N/A',
                peRatio: 'N/A',
                dividendYield: 'N/A',
                week52High: 0,
                week52Low: 0
            };
            console.log(`✅ Using hardcoded Swiss company name: ${SWISS_COMPANIES[ticker]}`);
            
            // Cache for longer (24 hours)
            await StorageManager.cacheData(cacheKey, result, 86400000);
            return result;
        }
        
        try {
            // For Swiss stocks, try Twelve Data first
            if (isSwissStock) {
                try {
                    const twelveProfile = await TwelveDataAPI.getProfile(ticker);
                    result = {
                        symbol: twelveProfile.symbol,
                        name: twelveProfile.name,
                        description: twelveProfile.description || '',
                        sector: twelveProfile.sector || 'N/A',
                        industry: twelveProfile.industry || 'N/A',
                        marketCap: 'N/A',
                        peRatio: 'N/A',
                        dividendYield: 'N/A',
                        week52High: 0,
                        week52Low: 0
                    };
                    console.log(`✅ Twelve Data profile successful for ${ticker}`);
                } catch (twelveError) {
                    console.warn(`⚠️ Twelve Data profile failed, using hardcoded name if available`);
                    
                    // Use hardcoded name as last resort
                    result = {
                        symbol: ticker,
                        name: SWISS_COMPANIES[ticker] || ticker,
                        description: '',
                        sector: 'N/A',
                        industry: 'N/A',
                        marketCap: 'N/A',
                        peRatio: 'N/A',
                        dividendYield: 'N/A',
                        week52High: 0,
                        week52Low: 0
                    };
                }
            } else {
                // For US stocks, try Alpha Vantage first
                try {
                    checkRateLimit();
                    
                    const url = `${ALPHA_VANTAGE_BASE}?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;
                    console.log(`Fetching company overview from: ${url}`);
                    const data = await makeRequest(url);
                    
                    console.log(`API Response for ${ticker}:`, data);
                    
                    if (!data.Symbol) {
                        console.error(`No Symbol in response for ${ticker}:`, data);
                        throw new Error(`No company info found for ticker: ${ticker}`);
                    }
                    
                    result = {
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
                } catch (alphaError) {
                    console.warn(`⚠️ Alpha Vantage failed for ${ticker}, trying Finnhub...`);
                    
                    try {
                        const finnhubProfile = await FinnhubAPI.getProfile(ticker);
                        result = {
                            symbol: finnhubProfile.symbol,
                            name: finnhubProfile.name,
                            description: finnhubProfile.description || '',
                            sector: 'N/A',
                            industry: finnhubProfile.industry || 'N/A',
                            marketCap: finnhubProfile.marketCap || 'N/A',
                            peRatio: 'N/A',
                            dividendYield: 'N/A',
                            week52High: 0,
                            week52Low: 0
                        };
                        console.log(`✅ Finnhub profile successful for ${ticker}`);
                    } catch (finnhubError) {
                        console.error(`❌ All APIs failed for ${ticker} company info`);
                        throw new Error(`Could not fetch company info for ${ticker}`);
                    }
                }
            }
        } catch (finalError) {
            console.error(`❌ Could not get company info for ${ticker}`);
            // Return ticker as name as last resort
            result = {
                symbol: ticker,
                name: ticker,
                description: '',
                sector: 'N/A',
                industry: 'N/A',
                marketCap: 'N/A',
                peRatio: 'N/A',
                dividendYield: 'N/A',
                week52High: 0,
                week52Low: 0
            };
        }
        
        // Cache for longer (24 hours)
        await StorageManager.cacheData(cacheKey, result, 86400000);
        
        return result;
    }

    /**
     * Detect if input is Valor number, ISIN, or ticker
     */
    function detectSecurityIdentifier(input) {
        const cleaned = input.trim().toUpperCase().replace(/\s/g, '');
        
        // Check if it's an ISIN (2 letters + 10 digits/letters)
        if (/^[A-Z]{2}[A-Z0-9]{10}$/.test(cleaned)) {
            const ticker = ISIN_TO_TICKER[cleaned];
            if (ticker) {
                console.log(`📋 ISIN detected: ${cleaned} → ${ticker}`);
                return {
                    type: 'ISIN',
                    value: cleaned,
                    ticker: ticker
                };
            }
        }
        
        // Check if it's a Valor number (Swiss: 6-9 digits)
        if (/^\d{6,9}$/.test(cleaned)) {
            const ticker = SWISS_VALOR[cleaned];
            if (ticker) {
                console.log(`🔢 Valor detected: ${cleaned} → ${ticker}`);
                return {
                    type: 'VALOR',
                    value: cleaned,
                    ticker: ticker
                };
            }
        }
        
        // Otherwise treat as ticker or company name
        return {
            type: 'TICKER',
            value: cleaned,
            ticker: null
        };
    }

    /**
     * Search for stock ticker with Valor/ISIN support
     */
    async function searchTicker(keywords) {
        if (!keywords || keywords.length < 2) {
            return [];
        }

        let results = [];
        
        // First, check if input is a Valor number or ISIN
        const identifier = detectSecurityIdentifier(keywords);
        
        if (identifier.ticker && (identifier.type === 'ISIN' || identifier.type === 'VALOR')) {
            // Direct match found - add it first with high priority
            const ticker = identifier.ticker;
            const companyName = SWISS_COMPANIES[ticker] || ticker;
            const identifierInfo = identifier.type === 'VALOR' 
                ? ` (Valor: ${identifier.value})`
                : ` (ISIN: ${identifier.value})`;
            
            results.push({
                symbol: ticker,
                name: companyName + identifierInfo,
                type: 'EQUITY',
                region: 'Switzerland',
                currency: 'CHF',
                matchScore: 1.0,
                source: identifier.type
            });
            
            console.log(`✅ Found ${identifier.type} match: ${ticker} - ${companyName}`);
            
            // Return immediately for direct matches
            return results;
        }
        
        // Otherwise, search using APIs with intelligent fallback
        try {
            // Try Twelve Data first for comprehensive international coverage
            console.log(`🔍 Trying Twelve Data search...`);
            const twelveResults = await TwelveDataAPI.search(keywords);
            
            if (twelveResults && twelveResults.length > 0) {
                console.log(`✅ Twelve Data found ${twelveResults.length} results`);
                return twelveResults;
            }
        } catch (twelveError) {
            console.warn(`⚠️ Twelve Data search failed, trying Finnhub...`);
        }
        
        try {
            // Fallback to Finnhub
            console.log(`🔍 Trying Finnhub search...`);
            const finnhubResults = await FinnhubAPI.search(keywords);
            
            if (finnhubResults && finnhubResults.length > 0) {
                console.log(`✅ Finnhub found ${finnhubResults.length} results`);
                return finnhubResults;
            }
        } catch (finnhubError) {
            console.warn(`⚠️ Finnhub search failed, trying Alpha Vantage...`);
        }
        
        try {
            // Try Alpha Vantage
            const url = `${ALPHA_VANTAGE_BASE}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${ALPHA_VANTAGE_KEY}`;
            const data = await makeRequest(url);
            
            if (!data.bestMatches) {
                throw new Error('No matches found');
            }
            
            return data.bestMatches.map(match => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                currency: match['8. currency']
            }));
        } catch (alphaError) {
            console.error(`❌ All search APIs failed`);
            return [];
        }
    }

    /**    /**
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
        
        if (!data['Realtime Currency Exchange Rate']) {
            throw new Error('Could not fetch exchange rate');
        }
        
        const rate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
        
        // Cache the result
        await StorageManager.cacheData(cacheKey, rate, CACHE_TTL.EXCHANGE_RATE);
        
        return rate;
    }

    /**
     * Get rate limit status
     */
    function getRateLimitStatus() {
        const limit = RATE_LIMITS[currentKeyIndex];
        const now = Date.now();
        const remaining = limit.maxCalls - limit.calls;
        const resetIn = Math.max(0, Math.ceil((limit.resetTime - now) / 1000));
        
        return {
            remaining,
            resetIn,
            total: limit.maxCalls,
            currentKey: currentKeyIndex + 1,
            totalKeys: ALPHA_VANTAGE_KEYS.length,
            keyFailures: RATE_LIMITS.map(l => l.failures)
        };
    }

    /**
     * Get API status info for all keys
     */
    function getAPIStatus() {
        return ALPHA_VANTAGE_KEYS.map((key, index) => ({
            keyNumber: index + 1,
            keyPreview: `...${key.slice(-4)}`,
            calls: RATE_LIMITS[index].calls,
            failures: RATE_LIMITS[index].failures,
            isActive: index === currentKeyIndex
        }));
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
        getExchangeRate,
        isOnline,
        getRateLimitStatus,
        getAPIStatus
    };
})();
