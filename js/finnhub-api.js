/**
 * Finnhub API Integration
 * Premium stock data with generous free tier
 * Free tier: 60 calls/minute, unlimited daily calls
 * Documentation: https://finnhub.io/docs/api
 */

const FinnhubAPI = (function() {
    const API_KEY = 'd5en4c9r01qmi0sjnvu0d5en4c9r01qmi0sjnvug';
    const BASE_URL = 'https://finnhub.io/api/v1';

    /**
     * Get real-time stock quote
     */
    async function getQuote(ticker) {
        try {
            console.log(`🔍 Finnhub: Fetching quote for ${ticker}`);
            
            const url = `${BASE_URL}/quote?symbol=${ticker}&token=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Finnhub API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.c === 0 && data.h === 0 && data.l === 0) {
                throw new Error(`No data found for ${ticker}`);
            }
            
            console.log(`✅ Finnhub: Got quote for ${ticker}: ${data.c}`);
            
            return {
                symbol: ticker,
                price: data.c,           // Current price
                previousClose: data.pc,  // Previous close
                change: data.d,          // Change
                changePercent: data.dp,  // Percent change
                high: data.h,            // Day high
                low: data.l,             // Day low
                open: data.o,            // Day open
                timestamp: data.t,       // Last update timestamp
                source: 'Finnhub'
            };
        } catch (error) {
            console.error(`❌ Finnhub error for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * Get company profile
     */
    async function getProfile(ticker) {
        try {
            console.log(`🔍 Finnhub: Fetching profile for ${ticker}`);
            
            const url = `${BASE_URL}/stock/profile2?symbol=${ticker}&token=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Finnhub API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.ticker) {
                throw new Error(`No profile data for ${ticker}`);
            }
            
            return {
                symbol: data.ticker,
                name: data.name,
                description: data.description || '',
                industry: data.finnhubIndustry,
                exchange: data.exchange,
                country: data.country,
                currency: data.currency,
                marketCap: data.marketCapitalization,
                logo: data.logo,
                weburl: data.weburl,
                ipo: data.ipo
            };
            
        } catch (error) {
            console.error(`❌ Finnhub profile error for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * Search for stocks
     */
    async function search(query) {
        try {
            console.log(`🔍 Finnhub: Searching for "${query}"`);
            
            const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Finnhub API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.result || data.result.length === 0) {
                console.log(`⚠️ Finnhub: No results for "${query}"`);
                return [];
            }
            
            const results = data.result.slice(0, 10).map(item => ({
                symbol: item.symbol,
                name: item.description,
                type: item.type,
                exchange: item.displaySymbol,
                region: 'US'
            }));
            
            console.log(`✅ Finnhub: Found ${results.length} results for "${query}"`);
            return results;
            
        } catch (error) {
            console.error(`❌ Finnhub search error for "${query}":`, error);
            return [];
        }
    }

    /**
     * Get candle data (OHLCV historical data)
     */
    async function getCandles(ticker, resolution = 'D', from, to) {
        try {
            console.log(`🔍 Finnhub: Fetching candles for ${ticker}`);
            
            // Default to last 30 days if not specified
            if (!to) to = Math.floor(Date.now() / 1000);
            if (!from) from = to - (30 * 24 * 60 * 60);
            
            const url = `${BASE_URL}/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Finnhub API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.s === 'no_data') {
                throw new Error(`No candle data for ${ticker}`);
            }
            
            const result = data.t.map((timestamp, index) => ({
                date: new Date(timestamp * 1000).toISOString().split('T')[0],
                open: data.o[index],
                high: data.h[index],
                low: data.l[index],
                close: data.c[index],
                volume: data.v[index]
            }));
            
            console.log(`✅ Finnhub: Got ${result.length} candles for ${ticker}`);
            return result;
            
        } catch (error) {
            console.error(`❌ Finnhub candles error for ${ticker}:`, error);
            throw error;
        }
    }

    // Public API
    return {
        getQuote,
        getProfile,
        search,
        getCandles
    };
})();
