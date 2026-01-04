# IronEye - Stock Portfolio Manager

**Live Demo**: https://bloondus.github.io/IronEye.github.io/

A modern, fully responsive Progressive Web Application for managing your personal stock portfolio with real-time data, offline support, and beautiful visualizations.

---

## 📊 Quick Stats

- **Type**: Single Page Application (SPA)
- **Framework**: Vanilla JavaScript (No dependencies)
- **Data Storage**: IndexedDB (client-side)
- **API**: Alpha Vantage (free tier supported)
- **Hosting**: GitHub Pages
- **PWA**: Full offline support

---

## 🎯 Core Features

### Portfolio Management
✅ Add, edit, and delete stocks  
✅ Track shares, buy price, and purchase date  
✅ Real-time profit/loss calculation  
✅ Visual portfolio summary dashboard  

### Market Data
✅ Live stock prices via Alpha Vantage API  
✅ Interactive 30-day price charts  
✅ Latest news articles for each stock  
✅ Smart caching to minimize API calls  

### User Experience
✅ Mobile-first responsive design  
✅ Offline mode with cached data  
✅ PWA - Install as native app  
✅ Touch-friendly interface  
✅ Dark theme optimized for readability  

---

## 🚀 Quick Start

### 1. Get API Key (Free)
Visit: https://www.alphavantage.co/support/#api-key

### 2. Configure
Edit `js/api.js` line 9:
```javascript
const ALPHA_VANTAGE_KEY = 'YOUR_KEY_HERE';
```

### 3. Deploy
```bash
git clone https://github.com/bloondus/IronEye.github.io.git
cd IronEye.github.io
# Edit js/api.js with your API key
git add .
git commit -m "Add API key"
git push
```

### 4. Use
Visit: https://bloondus.github.io/IronEye.github.io/

---

## 📱 Installation

### As PWA on Mobile
1. Open in mobile browser
2. Tap "Add to Home Screen"
3. Use like a native app!

### As PWA on Desktop
1. Open in Chrome/Edge
2. Click install icon in address bar
3. Access from desktop/taskbar

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           User Interface (ui.js)        │
│  - Rendering  - Modals  - Notifications │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│        Application Logic (app.js)       │
│  - Coordination  - Events  - State      │
└─────────────────────────────────────────┘
         ↕                        ↕
┌──────────────────┐    ┌──────────────────┐
│  Storage Module  │    │   API Module     │
│   (storage.js)   │    │    (api.js)      │
│   - IndexedDB    │    │ - Alpha Vantage  │
│   - Caching      │    │ - Rate Limiting  │
└──────────────────┘    └──────────────────┘
         ↕                        ↕
┌──────────────────┐    ┌──────────────────┐
│    IndexedDB     │    │   External APIs  │
│  (Browser API)   │    │  (Network Calls) │
└──────────────────┘    └──────────────────┘
```

---

## 📊 Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Vanilla JavaScript (ES6+) |
| **Styling** | CSS3 (Grid, Flexbox) |
| **Database** | IndexedDB |
| **Charts** | Chart.js 4.4.0 |
| **Icons** | Font Awesome 6.4.0 |
| **API** | Alpha Vantage (REST) |
| **Offline** | Service Workers |
| **Hosting** | GitHub Pages |

---

## 🎨 Screenshots

### Desktop View
![Desktop Portfolio](screenshots/desktop.png)

### Mobile View
![Mobile Portfolio](screenshots/mobile.png)

### Stock Details
![Stock Details](screenshots/details.png)

---

## ⚡ Performance

- **First Load**: ~500KB (including libraries)
- **Cached Load**: <50KB
- **Offline**: Full functionality (view only)
- **API Calls**: Optimized with smart caching
- **Lighthouse Score**: 95+ (PWA)

---

## 🔒 Privacy & Security

- ✅ All data stored locally in your browser
- ✅ No user accounts or registration
- ✅ No data sent to third parties (except Alpha Vantage)
- ✅ No tracking or analytics
- ✅ Open source - review the code yourself

---

## 📖 Documentation

- **[README.md](README.md)** - Comprehensive documentation
- **[SETUP.md](SETUP.md)** - Step-by-step setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment checklist

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 🌟 Star History

If you find this project useful, please star it on GitHub!

---

## 🔗 Links

- **Live Demo**: https://bloondus.github.io/IronEye.github.io/
- **Repository**: https://github.com/bloondus/IronEye.github.io
- **Issues**: https://github.com/bloondus/IronEye.github.io/issues
- **Alpha Vantage**: https://www.alphavantage.co/

---

## 💡 Roadmap

- [ ] Multiple portfolio support
- [ ] Export/import data as JSON
- [ ] Price alerts and notifications
- [ ] Dividend tracking
- [ ] Currency conversion
- [ ] Advanced charting options
- [ ] Stock comparison tool
- [ ] Performance over time graphs

---

## 🙏 Acknowledgments

- **Alpha Vantage** - Free stock market API
- **Chart.js** - Beautiful charts library
- **Font Awesome** - Icon library
- **GitHub Pages** - Free hosting

---

**Built with ❤️ by stock market enthusiasts, for stock market enthusiasts**

*Last Updated: January 2026*
