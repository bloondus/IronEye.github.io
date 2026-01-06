/**
 * Yahoo Finance API Integration (Free, no API key required)
 * Supports international stocks including Swiss stocks (.SW)
 */

const YahooFinance = (function() {
    const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance';
    const SEARCH_URL = 'https://query2.finance.yahoo.com/v1/finance/search';

    /**
     * Normalize ticker symbol for Swiss stocks
     * Converts common formats to Yahoo Finance format
     */
    function normalizeTicker(ticker) {
        const upper = ticker.toUpperCase().trim();
        
        // If already has .SW suffix, return as is
        if (upper.endsWith('.SW')) {
            return upper;
        }
        
        // Known Swiss stock mappings (SIX Swiss Exchange)
        const swissStocks = {
            'SCMN': 'SCMN.SW',      // Swisscom
            'NESN': 'NESN.SW',      // Nestlé
            'NOVN': 'NOVN.SW',      // Novartis
            'ROG': 'ROG.SW',        // Roche
            'UBSG': 'UBSG.SW',      // UBS
            'CSGN': 'CSGN.SW',      // Credit Suisse
            'ABBN': 'ABBN.SW',      // ABB
            'ZURN': 'ZURN.SW',      // Zurich Insurance
            'SREN': 'SREN.SW',      // Swiss Re
            'GIVN': 'GIVN.SW',      // Givaudan
            'LONN': 'LONN.SW',      // Lonza
            'SLHN': 'SLHN.SW',      // Swiss Life
            'SGSN': 'SGSN.SW',      // SGS
            'GEBN': 'GEBN.SW',      // Geberit
            'CFCN': 'CFCN.SW',      // CFR Compagnie Financière Richemont
            'SIKA': 'SIKA.SW',      // Sika
            'ALC': 'ALC.SW',        // Alcon
            'HOLN': 'HOLN.SW',      // Holcim
        };
        
        // Check if it's a known Swiss stock
        if (swissStocks[upper]) {
            console.log(`📍 Normalized Swiss ticker: ${upper} → ${swissStocks[upper]}`);
            return swissStocks[upper];
        }
        
        // Return as is for other tickers
        return upper;
    }

    /**
     * Get stock quote from Yahoo Finance
     */
    async function getQuote(ticker) {
        // Normalize ticker (especially for Swiss stocks)
        const normalizedTicker = normalizeTicker(ticker);
        
        try {
            const url = `${BASE_URL}/chart/${normalizedTicker}?interval=1d&range=1d`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
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
        // Normalize ticker (especially for Swiss stocks)
        const normalizedTicker = normalizeTicker(ticker);
        
        try {
            const period2 = Math.floor(Date.now() / 1000);
            const period1 = period2 - (days * 24 * 60 * 60);
            
            const url = `${BASE_URL}/chart/${normalizedTicker}?period1=${period1}&period2=${period2}&interval=1d`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
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
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Yahoo Finance search error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.quotes || data.quotes.length === 0) {
                return [];
            }
            
            return data.quotes
                .filter(quote => quote.quoteType !== 'NEWS') // Filter out news
                .map(quote => ({
                    symbol: quote.symbol,
                    name: quote.shortname || quote.longname || quote.symbol,
                    type: quote.quoteType || 'EQUITY',
                    exchange: quote.exchDisp || quote.exchange || '',
                    region: getRegionFromExchange(quote.exchange),
                    currency: quote.currency || '',
                    score: quote.score || 0
            }));
            
        } catch (error) {
            console.error('Yahoo Finance search error:', error);
            return [];
        }
    }

    /**
     * Get region from exchange code
     */
    function getRegionFromExchange(exchange) {
        const exchangeMap = {
            'VTX': 'Switzerland',
            'EBS': 'Switzerland',
            'SIX': 'Switzerland',
            'XSWX': 'Switzerland',
            'NMS': 'United States',
            'NYQ': 'United States',
            'PCX': 'United States',
            'LSE': 'United Kingdom',
            'FRA': 'Germany',
            'PAR': 'France',
            'TYO': 'Japan',
            'HKG': 'Hong Kong'
        };
        return exchangeMap[exchange] || exchange || 'Unknown';
    }

    /**
     * Get company info
     */
    async function getCompanyInfo(ticker) {
        // Normalize ticker (especially for Swiss stocks)
        const normalizedTicker = normalizeTicker(ticker);
        
        try {
            const quote = await getQuote(normalizedTicker);
            
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
