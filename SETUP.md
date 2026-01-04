# Quick Setup Guide for IronEye

## Step 1: Get Your Alpha Vantage API Key

1. Go to https://www.alphavantage.co/support/#api-key
2. Fill in your name and email
3. Click "GET FREE API KEY"
4. Copy the API key (it looks like: `ABCD1234EFGH5678`)

## Step 2: Configure the Application

1. Open the file `js/api.js` in a text editor
2. Find line 9:
   ```javascript
   const ALPHA_VANTAGE_KEY = 'demo';
   ```
3. Replace `'demo'` with your API key:
   ```javascript
   const ALPHA_VANTAGE_KEY = 'ABCD1234EFGH5678';
   ```
4. Save the file

## Step 3: Generate Icons (Optional)

1. Open `generate-icons.html` in your browser
2. Icons will automatically download
3. Create a folder called `icons` in your project
4. Move all downloaded icons to the `icons` folder

## Step 4: Test Locally

You can test the app locally in several ways:

### Option A: Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open: http://localhost:8000

### Option B: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```
Then open: http://localhost:8000

### Option C: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Step 5: Deploy to GitHub Pages

### Prepare Your Repository

1. **Create the GitHub repository** (if not already created):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: IronEye Stock Portfolio Manager"
   git branch -M main
   git remote add origin https://github.com/bloondus/IronEye.github.io.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository: https://github.com/bloondus/IronEye.github.io
   - Click "Settings"
   - Scroll to "Pages" section (left sidebar)
   - Under "Source", select branch: `main`
   - Click "Save"
   - Your site will be published at: https://bloondus.github.io/IronEye.github.io/

3. **Wait for deployment** (usually 1-2 minutes)
   - GitHub will show a green checkmark when ready
   - Visit your site URL

### Update Service Worker Path (Important!)

If deploying to a subdirectory (not the root), update `js/app.js`:

```javascript
// Change this line (around line 230):
navigator.serviceWorker.register('/sw.js')

// To this (if your repo is named IronEye.github.io):
navigator.serviceWorker.register('/sw.js')

// Or if using a different repo name:
navigator.serviceWorker.register('/repository-name/sw.js')
```

## Step 6: Using the Application

### Add Your First Stock

1. Click "Add Stock" button
2. Enter ticker (e.g., `AAPL` for Apple)
3. Enter shares: `10`
4. Enter buy price: `150.00`
5. Select buy date
6. Click "Save Stock"

### Common Ticker Symbols

- **AAPL** - Apple Inc.
- **MSFT** - Microsoft
- **GOOGL** - Alphabet (Google)
- **AMZN** - Amazon
- **TSLA** - Tesla
- **META** - Meta (Facebook)
- **NVDA** - NVIDIA
- **JPM** - JPMorgan Chase
- **V** - Visa
- **WMT** - Walmart

### View Details

1. Click "Details" on any stock
2. See price chart (last 30 days)
3. Click "Load News" for latest articles

### Offline Usage

- The app works offline after first load
- Cached prices will be shown
- Add/edit/delete stocks works offline
- Refresh requires internet connection

## Troubleshooting

### Problem: "Rate limit exceeded"
**Solution**: Wait 60 seconds. Free API allows 5 calls/minute.

### Problem: Icons not showing
**Solution**: 
1. Run `generate-icons.html` to create icons
2. Place icons in `/icons/` folder
3. Or use Font Awesome icons (already included)

### Problem: Service Worker not registering
**Solution**:
1. Use HTTPS (GitHub Pages provides this)
2. Check browser console for errors
3. Clear browser cache

### Problem: App not updating after changes
**Solution**:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear service worker cache:
   - Open DevTools → Application → Service Workers
   - Click "Unregister"
   - Reload page

### Problem: Stock not found
**Solution**:
- Verify ticker symbol is correct
- Try searching on Yahoo Finance first
- Some international stocks may not be available

## API Limits Reminder

**Free Tier:**
- 5 API calls per minute
- 500 API calls per day

**Tips to stay within limits:**
- App caches all responses
- Refresh only when needed
- Data cached for 5 minutes (quotes) to 1 hour (daily data)

## Browser Support

✅ **Fully Supported:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

⚠️ **Partial Support:**
- Older browsers may not support PWA features
- IndexedDB required (all modern browsers)

## Security Notes

🔒 **Your data is safe:**
- All data stored locally in your browser
- No data sent to any server (except Alpha Vantage API)
- No user accounts or registration
- No tracking or analytics

🔑 **API Key Security:**
- Your API key is visible in the source code
- This is normal for client-side apps
- Free API keys have rate limits (safe to expose)
- Don't share premium API keys

## Need Help?

- Check the main README.md for detailed documentation
- Search for ticker symbols: https://finance.yahoo.com
- Alpha Vantage support: https://www.alphavantage.co/support/

---

**Enjoy tracking your portfolio with IronEye! 📈**
