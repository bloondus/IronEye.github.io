# IronEye Deployment Checklist

## Pre-Deployment

- [ ] Get Alpha Vantage API key from https://www.alphavantage.co/support/#api-key
- [ ] Replace `'demo'` in `js/api.js` (line 9) with your actual API key
- [ ] Generate icons using `generate-icons.html` OR use the provided SVG
- [ ] Test the application locally
- [ ] Verify all features work:
  - [ ] Add stock
  - [ ] Edit stock
  - [ ] Delete stock
  - [ ] View details
  - [ ] Price chart displays
  - [ ] News loading
  - [ ] Offline mode works

## GitHub Repository Setup

- [ ] Create repository at https://github.com/bloondus/IronEye.github.io
- [ ] Initialize git in project folder:
  ```bash
  git init
  git add .
  git commit -m "Initial commit: IronEye Stock Portfolio Manager"
  git branch -M main
  git remote add origin https://github.com/bloondus/IronEye.github.io.git
  git push -u origin main
  ```

## GitHub Pages Configuration

- [ ] Go to repository Settings
- [ ] Navigate to "Pages" section
- [ ] Select source branch: `main`
- [ ] Select folder: `/ (root)`
- [ ] Click "Save"
- [ ] Wait for deployment (check Actions tab)
- [ ] Visit: https://bloondus.github.io/IronEye.github.io/

## Post-Deployment Verification

- [ ] Open the deployed site in browser
- [ ] Check if all CSS loads correctly
- [ ] Verify JavaScript files load without errors
- [ ] Test adding a stock with real data
- [ ] Verify API calls work
- [ ] Test on mobile device
- [ ] Test PWA installation:
  - [ ] Desktop: Look for install icon in address bar
  - [ ] Mobile: "Add to Home Screen" option

## PWA Features Check

- [ ] Service worker registers successfully
- [ ] App works offline (try in DevTools offline mode)
- [ ] Manifest.json loads correctly
- [ ] Icons display in PWA install prompt
- [ ] App can be installed on home screen

## Performance Optimization (Optional)

- [ ] Minify CSS (use online tools)
- [ ] Minify JavaScript (be careful with modules)
- [ ] Optimize images/icons
- [ ] Enable GitHub Pages CDN (automatic)

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop/Mac)
- [ ] Chrome (Mobile)
- [ ] Safari (iOS)
- [ ] Samsung Internet (Android)

## Common Issues & Fixes

### Issue: 404 Errors on Refresh
✅ **Fixed**: `404.html` file handles SPA routing

### Issue: Service Worker Not Updating
**Solution**:
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
location.reload();
```

### Issue: CORS Errors
✅ **Not an issue**: Alpha Vantage supports CORS

### Issue: Icons Not Showing
**Solutions**:
1. Check icons folder exists
2. Verify icon paths in manifest.json
3. Use SVG as fallback
4. Generate icons using generate-icons.html

## Security Checklist

- [ ] API key in code (acceptable for free tier)
- [ ] No sensitive data in repository
- [ ] HTTPS enabled (automatic with GitHub Pages)
- [ ] No exposed credentials
- [ ] Privacy policy (if needed for PWA store submission)

## Optional Enhancements

- [ ] Custom domain setup
- [ ] Google Analytics (if desired)
- [ ] Add favicon.ico
- [ ] Create og:image for social sharing
- [ ] Add robots.txt
- [ ] Create sitemap.xml

## Maintenance

- [ ] Monitor API usage (check Alpha Vantage dashboard)
- [ ] Update dependencies periodically:
  - Chart.js version
  - Font Awesome version
- [ ] Check for browser compatibility updates
- [ ] Review and update cached stock data policies

## User Documentation

- [ ] README.md is complete and accurate
- [ ] SETUP.md is easy to follow
- [ ] Include example screenshots (optional)
- [ ] Link to live demo in README

## Marketing/Sharing (Optional)

- [ ] Add screenshots to repository
- [ ] Create demo video
- [ ] Share on social media
- [ ] Submit to PWA directories
- [ ] Add to portfolio/resume

## Final Steps

- [ ] Test with real portfolio data
- [ ] Verify calculations are accurate
- [ ] Check profit/loss percentages
- [ ] Ensure date formatting is correct
- [ ] Test news loading for multiple stocks
- [ ] Verify chart displays correctly for different time ranges

## Emergency Rollback Plan

If something goes wrong:

1. **Revert to previous commit**:
   ```bash
   git log  # Find last working commit
   git revert <commit-hash>
   git push
   ```

2. **Disable GitHub Pages temporarily**:
   - Go to Settings → Pages
   - Select "None" under source
   - Fix issues locally
   - Re-enable when ready

## Support Resources

- **Alpha Vantage**: https://www.alphavantage.co/support/
- **GitHub Pages**: https://docs.github.com/pages
- **Chart.js**: https://www.chartjs.org/docs/
- **PWA**: https://web.dev/progressive-web-apps/
- **Service Workers**: https://developer.mozilla.org/docs/Web/API/Service_Worker_API

---

**Deployment Date**: _______________

**Deployed By**: _______________

**URL**: https://bloondus.github.io/IronEye.github.io/

**Status**: [ ] Success [ ] Issues (describe below)

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
