# IronEye - Stock Portfolio Manager

A fully responsive, offline-capable web application for managing your personal stock portfolio. Built with vanilla JavaScript and designed to run entirely in the browser.

## 🚀 Features

- **Portfolio Management**: Add, edit, and delete stocks from your portfolio
- **Real-time Data**: Fetch current stock prices using Alpha Vantage API
- **Performance Tracking**: View profit/loss for individual stocks and entire portfolio
- **Interactive Charts**: Visualize stock price history with Chart.js
- **News Integration**: Access latest news articles for your stocks
- **Offline Support**: View your portfolio data even without internet connection
- **PWA Ready**: Install as a Progressive Web App on mobile and desktop
- **Local Storage**: All data stored locally using IndexedDB
- **Responsive Design**: Mobile-first design that works on all devices
- **Rate Limit Handling**: Smart caching to minimize API calls

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Alpha Vantage API key (free tier available)

## 🔧 Setup

1. **Get an Alpha Vantage API Key**
   - Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Sign up for a free API key
   - Copy your API key

2. **Configure the API Key**
   - Open `js/api.js`
   - Replace `'demo'` with your API key:
     ```javascript
     const ALPHA_VANTAGE_KEY = 'YOUR_API_KEY_HERE';
     ```

3. **Deploy to GitHub Pages**
   - Push the code to your GitHub repository
   - Go to repository Settings → Pages
   - Select the branch to deploy (usually `main` or `master`)
   - Your app will be available at `https://yourusername.github.io/repository-name/`

## 🎯 Usage

### Adding a Stock

1. Click the **"Add Stock"** button
2. Enter the ticker symbol (e.g., AAPL, MSFT, GOOGL)
3. Enter the number of shares you own
4. Enter the purchase price per share
5. Select the purchase date
6. Click **"Save Stock"**

### Viewing Stock Details

1. Click the **"Details"** button on any stock card
2. View current price, profit/loss, and other metrics
3. See the historical price chart (last 30 days)
4. Click **"Load News"** to see latest news articles

### Managing Your Portfolio

- **Edit Stock**: Click the "Edit" button to modify stock details
- **Delete Stock**: Click the "Delete" button to remove a stock
- **Refresh Prices**: Click the "Refresh Prices" button to update all stock prices
- **Offline Mode**: The app works offline using cached data

## 📱 Installing as PWA

### On Mobile (iOS/Android)

1. Open the app in your browser
2. Tap the browser menu (⋮ or share icon)
3. Select "Add to Home Screen"
4. The app will appear as a native app icon

### On Desktop

1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Or go to browser menu → "Install IronEye"

## 🏗️ Project Structure

```
ironeye/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
├── css/
│   └── styles.css          # All styles (mobile-first)
├── js/
│   ├── storage.js          # IndexedDB data management
│   ├── api.js              # Alpha Vantage API integration
│   ├── ui.js               # UI rendering and interactions
│   └── app.js              # Main application logic
└── icons/
    └── (PWA icons)
```

## 🔑 Key Technologies

- **Vanilla JavaScript**: No frameworks, pure ES6+
- **IndexedDB**: Client-side database for portfolio data
- **Alpha Vantage API**: Real-time stock market data
- **Chart.js**: Interactive price charts
- **Service Workers**: Offline functionality
- **CSS Grid & Flexbox**: Responsive layouts
- **Progressive Web App**: Installable, app-like experience

## ⚡ API Rate Limits

The free Alpha Vantage API has the following limits:
- 5 API calls per minute
- 500 API calls per day

The app handles this by:
- Caching all API responses locally
- Showing rate limit warnings
- Auto-refreshing only when needed

## 🎨 Customization

### Change Theme Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #6c63ff;
    --secondary-color: #16213e;
    --bg-dark: #0f3460;
    --bg-light: #1a1a2e;
    /* ... */
}
```

### Modify Cache Duration

Edit cache TTL in `js/api.js`:

```javascript
const CACHE_TTL = {
    QUOTE: 300000,      // 5 minutes
    INTRADAY: 300000,   // 5 minutes
    DAILY: 3600000,     // 1 hour
    NEWS: 1800000       // 30 minutes
};
```

## 🐛 Troubleshooting

### "No data found for ticker" Error
- Verify the ticker symbol is correct
- Some stocks may not be available on Alpha Vantage
- Check if the market is open

### API Rate Limit Reached
- Wait for the rate limit to reset (shown in error message)
- The app will use cached data in the meantime
- Consider upgrading to Alpha Vantage premium tier

### Data Not Saving
- Check if browser supports IndexedDB
- Ensure cookies/storage is enabled
- Try clearing browser cache and reloading

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [Alpha Vantage API Documentation](https://www.alphavantage.co/documentation/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 💡 Future Enhancements

- [ ] Support for multiple portfolios
- [ ] Portfolio performance graphs over time
- [ ] Export/import portfolio data
- [ ] Price alerts and notifications
- [ ] Dividend tracking
- [ ] Multiple currency support
- [ ] Dark/light theme toggle
- [ ] Stock comparison feature

---

Built with ❤️ for stock market enthusiasts
