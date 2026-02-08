# Quick Start Guide

## 🚀 Running DevScope Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials (already configured with defaults).

### 3. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:5173

### 4. Login with GitHub
- Click "Login with GitHub" button
- Authorize the application
- View your real GitHub analytics!

## 📦 Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## 🌐 Deploy Now

### Vercel (Easiest)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## ✅ What's Working

- ✅ Real GitHub data fetching
- ✅ Live activity feed
- ✅ Commit statistics
- ✅ Repository analytics
- ✅ Language breakdown
- ✅ Goals tracking
- ✅ Achievement system
- ✅ Professional summary generation
- ✅ Dark mode
- ✅ Responsive design

## 🔧 Troubleshooting

### "No GitHub Data"
Make sure you're logged in with GitHub and have repositories.

### Build Errors
```bash
rm -rf node_modules
npm install
npm run build
```

### Authentication Issues
Check your Supabase configuration and GitHub OAuth settings.

---

**For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

**For complete changes log, see [CHANGES.md](./CHANGES.md)**
