/**
 * Yahoo Finance API Integration (Free, no API key required)
 * Supports international stocks including Swiss stocks (.SW)
 */

const YahooFinance = (function() {
    const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance';
    const SEARCH_URL = 'https://query2.finance.yahoo.com/v1/finance/search';

    /**
     * Get stock quote from Yahoo Finance
     */
    async function getQuote(ticker) {
        try {
            const url = `${BASE_URL}/chart/${ticker}?interval=1d&range=1d`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Yahoo Finance API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
                throw new Error(`No data found for ticker: ${ticker}`);
            }
            
            const result = data.chart.result[0];
            const meta = result.meta;
            
            return {
                symbol: meta.symbol,
                price: meta.regularMarketPrice,
                previousClose: meta.previousClose,
                change: meta.regularMarketPrice - meta.previousClose,
                changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
                currency: meta.currency,
                marketState: meta.marketState,
                exchangeName: meta.exchangeName,
                quoteType: meta.instrumentType,
                regularMarketTime: new Date(meta.regularMarketTime * 1000)
            };
        } catch (error) {
            console.error(`Yahoo Finance error for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * Get historical data from Yahoo Finance
     */
    async function getHistoricalData(ticker, days = 30) {
        try {
            const period2 = Math.floor(Date.now() / 1000);
            const period1 = period2 - (days * 24 * 60 * 60);
            
            const url = `${BASE_URL}/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Yahoo Finance API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
                throw new Error(`No historical data found for ticker: ${ticker}`);
            }
            
            const result = data.chart.result[0];
            const timestamps = result.timestamp;
            const quotes = result.indicators.quote[0];
            
            return timestamps.map((timestamp, index) => ({
                date: new Date(timestamp * 1000).toISOString().split('T')[0],
                close: quotes.close[index],
                open: quotes.open[index],
                high: quotes.high[index],
                low: quotes.low[index],
                volume: quotes.volume[index]
            })).filter(item => item.close !== null);
            
        } catch (error) {
            console.error(`Yahoo Finance historical data error for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * Search for stocks
     */
    async function search(query) {
        try {
            const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Yahoo Finance search error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.quotes || data.quotes.length === 0) {
                return [];
            }
            
            return data.quotes.map(quote => ({
                symbol: quote.symbol,
                name: quote.shortname || quote.longname || quote.symbol,
                type: quote.quoteType || 'EQUITY',
                exchange: quote.exchange,
                region: quote.region || 'US',
                score: quote.score || 0
            }));
            
        } catch (error) {
            console.error('Yahoo Finance search error:', error);
            return [];
        }
    }

    /**
     * Get company info
     */
    async function getCompanyInfo(ticker) {
        try {
            const quote = await getQuote(ticker);
            
            return {
                symbol: quote.symbol,
                name: quote.symbol,
                exchange: quote.exchangeName,
                currency: quote.currency,
                type: quote.quoteType
            };
        } catch (error) {
            console.error(`Yahoo Finance company info error for ${ticker}:`, error);
            throw error;
        }
    }

    // Public API
    return {
        getQuote,
        getHistoricalData,
        search,
        getCompanyInfo
    };
})();
