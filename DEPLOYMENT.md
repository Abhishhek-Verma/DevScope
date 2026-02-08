# Deployment Checklist for DevScope

## ✅ Pre-Deployment

- [x] All static data replaced with real GitHub API calls
- [x] Environment variables configured (.env.example provided)
- [x] Supabase credentials moved to environment variables
- [x] AI Summary simplified to work with localStorage
- [x] Goals tracking using localStorage for persistence
- [x] Recent activity fetching real GitHub events
- [x] Contribution data from actual GitHub commits
- [x] Build passes successfully
- [x] Dependencies installed and up to date
- [x] .gitignore properly configured

## 🔧 Supabase Setup Required

1. **Create a Supabase Project** (if not done)
   - Go to https://supabase.com
   - Create new project
   - Copy Project URL and Anon Key

2. **Enable GitHub OAuth**
   - Go to Authentication → Providers
   - Enable GitHub provider
   - Create GitHub OAuth App:
     - Go to GitHub Settings → Developer settings → OAuth Apps
     - Click "New OAuth App"
     - Set Homepage URL: `http://localhost:5173` (dev) or your production URL
     - Set Authorization callback URL: `http://localhost:5173/auth/callback`
   - Copy Client ID and Client Secret to Supabase

3. **Update Callback URLs**
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL=your_url
# - VITE_SUPABASE_ANON_KEY=your_key
```

**Post-Deployment:**
- Update GitHub OAuth callback URL to Vercel URL
- Update Supabase site URL in settings

### Option 2: Netlify

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

**Post-Deployment:**
- Update GitHub OAuth callback URL to Netlify URL
- Configure `_redirects` file for SPA routing (Netlify auto-handles this)

### Option 3: GitHub Pages

1. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/repo-name/',
     // ... rest of config
   })
   ```

2. Deploy:
   ```bash
   npm run build
   # Use gh-pages or manual deploy of dist folder
   ```

**Note:** GitHub Pages requires additional configuration for client-side routing.

### Option 4: Traditional Hosting (e.g., cPanel, shared hosting)

```bash
# Build the project
npm run build

# Upload the entire `dist` folder to your web server
# Configure your server to serve index.html for all routes
```

## 🔐 Environment Variables

Make sure to set these in your deployment platform:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ⚙️ Post-Deployment

1. **Test Authentication**
   - Visit your deployed site
   - Click "Login with GitHub"
   - Verify GitHub OAuth flow works
   - Check that you're redirected back to dashboard

2. **Verify Data Loading**
   - Check that repositories load
   - Verify commit data appears
   - Test recent activity feed
   - Confirm charts render correctly

3. **Test All Features**
   - Dashboard overview
   - Activity tab
   - Goals & achievements
   - Professional summary generation
   - Portfolio page
   - Dark mode toggle

4. **Performance Check**
   - Test on different devices
   - Verify responsive design
   - Check loading times
   - Monitor GitHub API rate limits

## 🐛 Common Issues & Solutions

### Issue: "Authentication Failed"
**Solution:** 
- Verify GitHub OAuth app callback URL matches deployment URL
- Check Supabase authentication settings
- Ensure environment variables are set correctly

### Issue: "No GitHub Data"
**Solution:**
- GitHub token needs proper scopes (repo, read:user, user:email)
- Verify user is authenticated
- Check browser console for API errors

### Issue: "Rate Limit Exceeded"
**Solution:**
- GitHub API allows 5,000 requests/hour when authenticated
- Implement caching if needed
- Reduce number of repositories analyzed

### Issue: Build Fails on Deployment
**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## 📊 Monitoring

After deployment, monitor:
- GitHub API usage (rate limits)
- Supabase usage (auth requests, database storage)
- Application performance
- Error logs in browser console

## 🔄 Future Improvements (Optional)

- [ ] Add Redis/caching layer for GitHub data
- [ ] Implement server-side data fetching
- [ ] Add real AI-powered summary generation
- [ ] Integrate GitHub GraphQL API for better queries
- [ ] Add database storage for user preferences
- [ ] Implement contribution heatmap visualization
- [ ] Add repository README previews
- [ ] Create shareable portfolio links

## 📝 Notes

- The application now uses real GitHub API data throughout
- All mock/static data has been replaced
- LocalStorage is used for goals and summary persistence
- No backend database required (except for Supabase auth)
- GitHub API rate limits: 5,000 requests/hour (authenticated)

---

**Ready to Deploy!** Choose your preferred platform and follow the steps above.
