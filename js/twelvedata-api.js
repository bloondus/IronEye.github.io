/**
 * Twelve Data API Integration
 * Supports Swiss stocks (SIX Exchange) and international markets
 * Free tier: 800 calls/day, 8 calls/minute
 * Documentation: https://twelvedata.com/docs
 */

const TwelveDataAPI = (function() {
    const API_KEY = '6e3af53b4d64405593b867ca76d3b735';
    const BASE_URL = 'https://api.twelvedata.com';

    /**
     * Get real-time stock quote
     */
    async function getQuote(ticker) {
        try {
            console.log(`🔍 Twelve Data: Fetching quote for ${ticker}`);
            
            const url = `${BASE_URL}/quote?symbol=${ticker}&apikey=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Twelve Data API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error' || !data.symbol) {
                throw new Error(data.message || `No data found for ${ticker}`);
            }
            
            console.log(`✅ Twelve Data: Got quote for ${ticker}: ${data.close}`);
            
            return {
                symbol: data.symbol,
                name: data.name || data.symbol,
                price: parseFloat(data.close),
                previousClose: parseFloat(data.previous_close),
                change: parseFloat(data.change),
                changePercent: parseFloat(data.percent_change),
                volume: parseInt(data.volume),
                currency: data.currency || 'USD',
                exchange: data.exchange,
                lastUpdated: data.datetime,
                source: 'TwelveData'
            };
        } catch (error) {
            console.error(`❌ Twelve Data error for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * Get time series data (historical)
     */
    async function getTimeSeries(ticker, interval = '1day', outputsize = 30) {
        try {
            console.log(`🔍 Twelve Data: Fetching time series for ${ticker}`);
            
            const url = `${BASE_URL}/time_series?symbol=${ticker}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Twelve Data API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error' || !data.values) {
                throw new Error(data.message || `No time series data for ${ticker}`);
            }
            
            const result = data.values.map(item => ({
                date: item.datetime,
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                volume: parseInt(item.volume)
            }));
            
            console.log(`✅ Twelve Data: Got ${result.length} data points for ${ticker}`);
            return result;
            
        } catch (error) {
            console.error(`❌ Twelve Data time series error for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * Search for stocks
     */
    async function search(query) {
        try {
            console.log(`🔍 Twelve Data: Searching for "${query}"`);
            
            const url = `${BASE_URL}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Twelve Data API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error' || !data.data) {
                console.log(`⚠️ Twelve Data: No results for "${query}"`);
                return [];
            }
            
            const results = data.data.slice(0, 10).map(item => ({
                symbol: item.symbol,
                name: item.instrument_name,
                type: item.instrument_type,
                exchange: item.exchange,
                currency: item.currency,
                country: item.country,
                region: item.country
            }));
            
            console.log(`✅ Twelve Data: Found ${results.length} results for "${query}"`);
            return results;
            
        } catch (error) {
            console.error(`❌ Twelve Data search error for "${query}":`, error);
            return [];
        }
    }

    /**
     * Get company profile
     */
    async function getProfile(ticker) {
        try {
            console.log(`🔍 Twelve Data: Fetching profile for ${ticker}`);
            
            const url = `${BASE_URL}/profile?symbol=${ticker}&apikey=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Twelve Data API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message || `No profile data for ${ticker}`);
            }
            
            return {
                symbol: data.symbol,
                name: data.name,
                description: data.description,
                sector: data.sector,
                industry: data.industry,
                exchange: data.exchange,
                currency: data.currency,
                country: data.country
            };
            
        } catch (error) {
            console.error(`❌ Twelve Data profile error for ${ticker}:`, error);
            throw error;
        }
    }

    // Public API
    return {
        getQuote,
        getTimeSeries,
        search,
        getProfile
    };
})();
