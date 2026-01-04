# 🎯 IronEye - Complete Project Overview

## 📦 Project Files Structure

```
ironeye/
├── 📄 index.html              # Main application page
├── 📄 manifest.json           # PWA manifest configuration
├── 📄 sw.js                   # Service worker for offline support
├── 📄 404.html                # GitHub Pages SPA routing handler
│
├── 📁 css/
│   └── styles.css            # Complete responsive styling
│
├── 📁 js/
│   ├── storage.js            # IndexedDB data management module
│   ├── api.js                # Alpha Vantage API integration
│   ├── ui.js                 # UI rendering and interactions
│   └── app.js                # Main application logic & coordination
│
├── 📁 icons/
│   └── icon.svg              # Application icon (SVG format)
│
├── 📁 Documentation/
│   ├── README.md             # Main documentation
│   ├── SETUP.md              # Quick setup guide
│   ├── DEPLOYMENT.md         # Deployment checklist
│   └── PROJECT.md            # Project overview
│
├── 📁 Tools/
│   ├── generate-icons.html   # Icon generator tool
│   ├── test.html             # Testing suite
│   └── .gitignore            # Git ignore rules
```

## 🎨 Application Features

### Core Functionality
✅ **Portfolio Management**
- Add new stocks with ticker, shares, buy price, and date
- Edit existing stock entries
- Delete stocks from portfolio
- View detailed stock information

✅ **Real-Time Data**
- Live stock prices via Alpha Vantage API
- 30-day historical price charts
- Price change indicators
- Profit/loss calculations (absolute & percentage)

✅ **News Integration**
- Latest news articles for each stock
- Google News integration
- Financial news sources

✅ **Offline Support**
- Full PWA with service workers
- IndexedDB for local data storage
- Smart caching of API responses
- Offline portfolio viewing

✅ **Responsive Design**
- Mobile-first approach
- Touch-friendly UI
- Adaptive layouts for all screen sizes
- Dark theme optimized for readability

## 🔧 Technical Architecture

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS3**: Grid, Flexbox, Custom Properties
- **JavaScript**: ES6+ Vanilla JS (no frameworks)
- **PWA**: Service Workers, Web App Manifest

### Data Layer
- **IndexedDB**: Primary data storage
- **Cache API**: API response caching
- **LocalStorage**: Fallback storage (if needed)

### External Dependencies
- **Chart.js 4.4.0**: Price visualization
- **Font Awesome 6.4.0**: Icons
- **Alpha Vantage API**: Stock market data

### Browser APIs Used
- IndexedDB API
- Fetch API
- Service Worker API
- Cache API
- Notifications API (optional)
- Push API (optional)

## 📊 Module Breakdown

### 1. Storage Module (`js/storage.js`)
**Purpose**: Manage all data persistence

**Functions**:
- `init()` - Initialize IndexedDB
- `addStock(stock)` - Add new stock
- `getAllStocks()` - Retrieve all stocks
- `getStock(id)` - Get single stock
- `updateStock(id, updates)` - Update stock
- `deleteStock(id)` - Remove stock
- `cacheData(key, data, ttl)` - Cache API responses
- `getCachedData(key)` - Retrieve cached data
- `exportData()` - Export portfolio as JSON
- `importData(data)` - Import portfolio from JSON

**Database Structure**:
```javascript
{
  stocks: {
    id: auto-increment,
    ticker: string,
    shares: float,
    buyPrice: float,
    buyDate: date,
    addedAt: timestamp
  },
  cache: {
    key: string (primary),
    data: object,
    timestamp: number,
    ttl: number
  }
}
```

### 2. API Module (`js/api.js`)
**Purpose**: Handle external API communications

**Functions**:
- `getStockQuote(ticker)` - Get current price
- `getIntradayData(ticker)` - Get 5-min interval data
- `getDailyData(ticker)` - Get daily historical data
- `getCompanyInfo(ticker)` - Get company details
- `searchTicker(keywords)` - Search for stocks
- `getStockNews(ticker)` - Fetch news articles
- `batchGetQuotes(tickers)` - Batch quote fetching
- `isOnline()` - Check connectivity
- `getRateLimitStatus()` - Monitor API limits

**API Endpoints Used**:
- `GLOBAL_QUOTE` - Current stock price
- `TIME_SERIES_INTRADAY` - Intraday data
- `TIME_SERIES_DAILY` - Daily historical data
- `OVERVIEW` - Company information
- `SYMBOL_SEARCH` - Ticker search
- `NEWS_SENTIMENT` - News articles

**Rate Limiting**:
- Free tier: 5 calls/minute, 500 calls/day
- Automatic tracking and enforcement
- Smart caching to minimize API usage

### 3. UI Module (`js/ui.js`)
**Purpose**: Render UI components and handle interactions

**Functions**:
- `renderSummary(stocks, quotes)` - Portfolio summary
- `renderStockList(stocks, quotes)` - Stock cards
- `renderStockCard(stock, quote)` - Individual card
- `showStockModal(stock)` - Add/Edit modal
- `showStockDetails(stockId)` - Details modal
- `renderPriceChart(ticker)` - Chart.js integration
- `loadStockNews(ticker)` - News section
- `showLoading(message)` - Loading overlay
- `showToast(message, type)` - Notifications
- `formatCurrency(value)` - Currency formatting
- `formatPercentage(value)` - Percentage formatting
- `formatDate(dateString)` - Date formatting

**UI Components**:
- Portfolio summary dashboard
- Stock list with cards
- Add/Edit stock modal
- Stock details modal with chart
- News section
- Loading overlay
- Toast notifications
- Connection status indicator

### 4. App Module (`js/app.js`)
**Purpose**: Main application logic and coordination

**Functions**:
- `init()` - Initialize application
- `loadPortfolio()` - Load and render portfolio
- `refreshPrices()` - Update stock prices
- `handleStockFormSubmit(e)` - Process form
- `exportPortfolio()` - Export data
- `importPortfolio(file)` - Import data
- `getStats()` - Application statistics

**Event Handlers**:
- Add stock button
- Refresh button
- Form submission
- Keyboard shortcuts (ESC, Ctrl+N, Ctrl+R)
- Online/offline events

## 🎯 User Workflows

### Adding a Stock
1. User clicks "Add Stock" button
2. Modal opens with empty form
3. User enters ticker, shares, price, date
4. Form validation checks inputs
5. API verifies ticker exists (if online)
6. Stock saved to IndexedDB
7. Portfolio refreshes with new stock
8. Success toast notification shown

### Viewing Stock Details
1. User clicks "Details" on stock card
2. API fetches current quote
3. Details modal opens with info
4. Daily price data fetched
5. Chart.js renders 30-day chart
6. User can load news articles
7. News fetched and displayed

### Offline Usage
1. User opens app without internet
2. Service worker serves cached files
3. Portfolio loads from IndexedDB
4. Cached prices shown (with timestamp)
5. Add/edit/delete works offline
6. Warning shown for stale data
7. Refresh disabled until online

## 🔒 Data Flow

```
User Action
    ↓
UI Module (event handling)
    ↓
App Module (coordination)
    ↓
    ├─→ Storage Module ←→ IndexedDB
    └─→ API Module ←→ Network
            ↓
    Response/Data
            ↓
    UI Module (rendering)
            ↓
    User sees result
```

## ⚡ Performance Optimizations

### Caching Strategy
- **Static assets**: Cache first, update background
- **API calls**: Network first, cache fallback
- **Time-based expiry**: 5 min (quotes) to 24 hours (company info)
- **Automatic cleanup**: 7-day old cache removal

### Loading Strategy
- **Critical CSS**: Inline in HTML
- **Defer JS**: Non-critical scripts deferred
- **Lazy loading**: Charts loaded on demand
- **Batch operations**: Multiple API calls grouped

### Bundle Size
- **HTML**: ~5KB (gzipped)
- **CSS**: ~12KB (gzipped)
- **JavaScript**: ~30KB (gzipped, all modules)
- **Total first load**: ~500KB (including libraries)
- **Cached load**: <50KB

## 🧪 Testing

### Manual Testing Checklist
- [ ] Add stock with various tickers
- [ ] Edit stock details
- [ ] Delete stock
- [ ] View stock details and chart
- [ ] Load news articles
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Test offline mode
- [ ] Test PWA installation
- [ ] Test rate limiting behavior

### Automated Tests (test.html)
- System compatibility checks
- Storage operations
- API integration
- UI formatting
- Performance benchmarks

## 🚀 Deployment Process

### 1. Pre-Deployment
```bash
# Get API key from Alpha Vantage
# Edit js/api.js with API key
# Generate icons (optional)
# Test locally
```

### 2. Git Setup
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/bloondus/IronEye.github.io.git
git push -u origin main
```

### 3. GitHub Pages
- Enable in repository settings
- Select branch: main
- Wait for deployment (~1-2 minutes)
- Visit: https://bloondus.github.io/IronEye.github.io/

### 4. Verification
- Test all functionality on live site
- Verify PWA installation works
- Check service worker registration
- Test on multiple devices

## 📱 PWA Features

### Installability
- Web App Manifest configured
- Service worker registered
- HTTPS enabled (via GitHub Pages)
- Icons for all platforms (72px - 512px)

### Offline Support
- All static assets cached
- IndexedDB for data persistence
- Graceful degradation when offline
- Cache-first strategy for reliability

### Native-like Experience
- Standalone display mode
- Custom splash screen
- App icon on home screen
- No browser chrome when installed

## 🔐 Security Considerations

### Data Privacy
- All data stored locally
- No server-side processing
- No user tracking
- No third-party analytics

### API Key Security
- Client-side exposure necessary
- Free tier keys safe to expose
- Rate limits protect abuse
- Premium keys should use backend

### Content Security
- HTTPS enforced (GitHub Pages)
- No external script injection
- CSP headers recommended
- XSS protection via sanitization

## 🛠️ Maintenance & Updates

### Regular Tasks
- Monitor API usage
- Check for library updates (Chart.js, Font Awesome)
- Review browser compatibility
- Update documentation
- Clean old cache entries

### Update Process
```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push

# GitHub Pages auto-deploys
# Clear browser cache if needed
```

### Version Control
- Use semantic versioning
- Tag releases
- Maintain changelog
- Document breaking changes

## 🎓 Learning Resources

### Technologies Used
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Chart.js Docs](https://www.chartjs.org/docs/)
- [Alpha Vantage API](https://www.alphavantage.co/documentation/)

### Best Practices
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [JavaScript Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [CSS Guidelines](https://cssguidelin.es/)
- [Git Best Practices](https://git-scm.com/book/en/v2)

## 💡 Future Enhancements

### Planned Features
1. Multiple portfolio support
2. Historical performance tracking
3. Price alerts and notifications
4. Dividend tracking
5. Tax calculation helpers
6. Multi-currency support
7. Advanced charting (technical indicators)
8. Stock comparison tool
9. Export to CSV/Excel
10. Import from brokerage statements

### Technical Improvements
1. Unit test coverage
2. E2E testing with Playwright
3. Performance monitoring
4. Error tracking (Sentry)
5. A/B testing capability
6. Analytics dashboard
7. Code splitting
8. Lazy loading optimizations

## 📞 Support & Contributing

### Getting Help
- Check README.md for documentation
- Review SETUP.md for configuration
- Use GitHub Issues for bugs
- Check test.html for diagnostics

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Await review

### Code Style
- Use ES6+ features
- 2-space indentation
- Semicolons required
- Comments for complex logic
- Descriptive variable names

## 📄 License

MIT License - Free for personal and commercial use

---

**Project Status**: ✅ Production Ready

**Last Updated**: January 2026

**Maintainer**: bloondus

**Repository**: https://github.com/bloondus/IronEye.github.io

---

## Quick Commands Reference

```bash
# Local development
python -m http.server 8000

# Git operations
git add .
git commit -m "message"
git push

# Icon generation
# Open generate-icons.html in browser

# Testing
# Open test.html in browser

# Clear service worker
# DevTools → Application → Service Workers → Unregister
```

---

**Built with ❤️ for investors, by investors**
