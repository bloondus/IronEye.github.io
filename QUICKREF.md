# 🚀 IronEye Quick Reference

## ⚡ Fast Setup (5 Minutes)

1. **Get API Key** → https://www.alphavantage.co/support/#api-key
2. **Edit** `js/api.js` line 9: Replace `'demo'` with your key
3. **Test locally** → `python -m http.server 8000`
4. **Deploy** → Push to GitHub, enable Pages

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Add new stock |
| `Ctrl/Cmd + R` | Refresh prices |
| `ESC` | Close modal |

## 📊 Common Stock Tickers

```
AAPL  → Apple           MSFT  → Microsoft
GOOGL → Google          AMZN  → Amazon
TSLA  → Tesla           META  → Facebook
NVDA  → NVIDIA          JPM   → JPMorgan
V     → Visa            WMT   → Walmart
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Rate limit error | Wait 60 seconds |
| No data for ticker | Verify ticker is correct |
| App not updating | Hard refresh: `Ctrl+Shift+R` |
| Icons missing | Run `generate-icons.html` |
| Service worker error | Clear cache, reload |

## 🛠️ Useful Commands

```bash
# Local server (Python 3)
python -m http.server 8000

# Local server (Node.js)
npx http-server -p 8000

# Git deploy
git add . && git commit -m "Update" && git push

# Clear service worker (browser console)
navigator.serviceWorker.getRegistrations()
  .then(r => r.forEach(reg => reg.unregister()));
```

## 🔍 API Rate Limits

**Free Tier:**
- 5 calls/minute
- 500 calls/day
- Automatically handled by app

**Cache Duration:**
- Stock quotes: 5 minutes
- Daily data: 1 hour
- News: 30 minutes

## 📱 PWA Installation

**Desktop (Chrome/Edge):**
1. Click install icon in address bar
2. Or: Menu → Install IronEye

**Mobile (iOS):**
1. Share button → Add to Home Screen

**Mobile (Android):**
1. Menu → Install app

## 🗂️ File Structure (Quick)

```
index.html          → Main page
js/storage.js       → Data management
js/api.js          → API calls (⚠️ ADD KEY HERE)
js/ui.js           → UI rendering
js/app.js          → Main logic
css/styles.css     → All styling
sw.js              → Offline support
manifest.json      → PWA config
```

## 💾 Data Storage Locations

- **Portfolio data**: IndexedDB → `IronEyeDB.stocks`
- **API cache**: IndexedDB → `IronEyeDB.cache`
- **App cache**: Service Worker cache

## 🔄 Update Workflow

```bash
1. Make changes
2. git add .
3. git commit -m "description"
4. git push
5. Wait ~1 minute for GitHub Pages
6. Hard refresh browser
```

## 🧪 Testing Checklist

- [ ] Add stock (e.g., AAPL)
- [ ] View details → See chart
- [ ] Edit stock → Change shares
- [ ] Delete stock → Confirm removal
- [ ] Refresh prices → Updates visible
- [ ] Test offline (DevTools → Network → Offline)
- [ ] Install PWA → Works standalone

## 🎯 Configuration Options

**API Key** (`js/api.js` line 9):
```javascript
const ALPHA_VANTAGE_KEY = 'YOUR_KEY_HERE';
```

**Cache Duration** (`js/api.js` line 18):
```javascript
const CACHE_TTL = {
    QUOTE: 300000,    // 5 min
    DAILY: 3600000,   // 1 hour
    NEWS: 1800000     // 30 min
};
```

**Theme Colors** (`css/styles.css` line 2):
```css
--primary-color: #6c63ff;
--bg-dark: #0f3460;
--bg-light: #1a1a2e;
```

## 📈 Calculation Formulas

**Profit/Loss:**
```
Profit = (Current Price - Buy Price) × Shares
Percentage = (Profit / Cost Basis) × 100
```

**Portfolio Value:**
```
Total Value = Σ(Current Price × Shares)
Total Cost = Σ(Buy Price × Shares)
Total Profit = Total Value - Total Cost
```

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| Live App | https://bloondus.github.io/IronEye.github.io/ |
| Alpha Vantage | https://www.alphavantage.co/ |
| Chart.js Docs | https://www.chartjs.org/docs/ |
| GitHub Repo | https://github.com/bloondus/IronEye.github.io |

## 💡 Pro Tips

1. **Minimize API calls**: Let the cache work (it's smart!)
2. **Stock ticker search**: Use Yahoo Finance to find tickers
3. **Offline testing**: DevTools → Application → Service Workers
4. **Performance**: Open test.html to run benchmarks
5. **Export data**: Use browser's IndexedDB inspector

## 🚨 Common Errors

```
"Rate limit exceeded"
→ Wait 60 seconds, uses cache meanwhile

"No data found for ticker"
→ Ticker may be invalid or not supported

"Service worker failed"
→ Requires HTTPS (GitHub Pages has it)

"IndexedDB not available"
→ Check browser compatibility
```

## 📊 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Opera 76+ | ✅ Full |

## 🎨 Customization Quick Edits

**Change app name:**
- `index.html` → `<title>` and `<h1>`
- `manifest.json` → `name` and `short_name`

**Change colors:**
- `css/styles.css` → `:root` variables

**Change cache time:**
- `js/api.js` → `CACHE_TTL` object

**Change default stocks:**
- Add demo stocks in `js/app.js` → `init()`

## 📝 Documentation Files

- **README.md** → Full documentation
- **SETUP.md** → Setup instructions
- **DEPLOYMENT.md** → Deployment checklist
- **OVERVIEW.md** → Complete overview
- **PROJECT.md** → Project details
- **THIS FILE** → Quick reference

---

## ⚡ Super Quick Start

```bash
# 1. Clone
git clone https://github.com/bloondus/IronEye.github.io.git

# 2. Add API key to js/api.js

# 3. Test
python -m http.server 8000

# 4. Deploy
git push

# Done! 🎉
```

---

**Keep this file handy for quick reference!**

*Last updated: January 2026*
