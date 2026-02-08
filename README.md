# DevScope - GitHub Developer Analytics Dashboard

A modern, React-based dashboard for visualizing GitHub developer activity with real-time data integration.

## 🚀 Features

- **Real-time GitHub Integration**: Fetch and display actual GitHub data using GitHub API
- **Interactive Dashboard**: View commits, pull requests, issues, and repository statistics
- **Language Analytics**: Visualize programming language distribution across repositories
- **Activity Timeline**: Track contributions over time with interactive charts
- **Professional Summary**: Auto-generate developer summaries based on GitHub activity
- **Goals & Achievements**: Set and track development goals with real GitHub metrics
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## 📋 Prerequisites

- Node.js 16+ or npm
- A GitHub account
- Supabase account (for authentication)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DevScope
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Authentication**
   
   - Go to your Supabase project dashboard
   - Navigate to Authentication → Providers
   - Enable GitHub OAuth provider
   - Add your GitHub OAuth App credentials
   - Set the callback URL to: `http://localhost:5173/auth/callback` (for development)

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 📦 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Update Supabase callback URL to your production URL:
   - `https://your-domain.vercel.app/auth/callback`

### Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Netlify

3. Set environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Update Supabase callback URL:
   - `https://your-domain.netlify.app/auth/callback`

### Deploy to GitHub Pages

1. Update `vite.config.ts` with your repo base:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... other config
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Deploy dist folder to gh-pages branch
   ```

## 🔧 Configuration

### GitHub API Rate Limits

The application fetches data from GitHub API. Be aware of rate limits:
- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour

The app uses authenticated requests via Supabase GitHub OAuth.

### Customization

- **Theme**: Modify colors in `tailwind.config.ts`
- **Charts**: Customize chart styles in component files
- **Goals**: Update goal targets in localStorage

## 📊 Data Sources

All data is fetched in real-time from:
- GitHub REST API v3
- User repositories
- Commit history
- Events and activity
- Language statistics

## 🔐 Security

- Environment variables are never committed to the repository
- Supabase handles authentication securely
- GitHub OAuth tokens are stored securely
- All API requests are authenticated

## 🐛 Troubleshooting

### "No GitHub data available"
- Ensure you've logged in with GitHub
- Check that GitHub OAuth is properly configured in Supabase
- Verify the GitHub token has proper scopes

### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear cache
npm cache clean --force
```

### API Rate Limiting
- Wait for the rate limit to reset
- Reduce the number of repositories being analyzed
- Consider implementing caching

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with:** React, TypeScript, Vite, Tailwind CSS, Supabase, Recharts, Framer Motion
