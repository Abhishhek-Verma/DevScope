# GitHub Token Setup for Public Portfolio Sharing

## Why You Need This

When users visit your shared portfolio link (e.g., `https://devscope-analyser.netlify.app/u/Abhishhek-Verma`) **without logging in**, GitHub's API has strict rate limits:

- ❌ **Without token**: 60 requests/hour (gets exhausted quickly)
- ✅ **With token**: 5,000 requests/hour (more than enough)

## Quick Setup (5 minutes)

### Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Token Settings**:
   - Visit: https://github.com/settings/tokens/new
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

2. **Configure the Token**:
   - **Note**: `DevScope Public Portfolio Access`
   - **Expiration**: Select `No expiration` or `1 year`
   - **Select scopes**: 
     - ✅ **public_repo** (under "repo" section) - Read-only access to public repositories
     - ⚠️ **DO NOT** select any other scopes (security best practice)

3. **Generate and Copy**:
   - Click `Generate token` at bottom
   - **COPY THE TOKEN NOW** (you won't see it again!)
   - Example: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add Token to Local Environment

1. **Open your `.env` file** (in the root of DevScope project)
   ```bash
   # If .env doesn't exist, create it
   ```

2. **Add this line** (replace with your actual token):
   ```env
   VITE_GITHUB_PUBLIC_TOKEN=ghp_your_actual_token_here
   ```

3. **Save the file**

### Step 3: Add Token to Netlify

1. **Go to Netlify Dashboard**:
   - Visit: https://app.netlify.com/
   - Select your `devscope-analyser` site

2. **Navigate to Environment Variables**:
   - Site settings → Environment variables
   - Or directly: https://app.netlify.com/sites/devscope-analyser/settings/env

3. **Add New Variable**:
   - Click `Add a variable` → `Add a single variable`
   - **Key**: `VITE_GITHUB_PUBLIC_TOKEN`
   - **Value**: `ghp_your_actual_token_here` (paste your token)
   - **Scopes**: Select all scopes (Production, Deploy Previews, Branch deploys)
   - Click `Create variable`

4. **Trigger Redeploy**:
   ```bash
   # In your terminal
   git commit --allow-empty -m "Trigger redeploy for env vars"
   git push origin main
   ```

### Step 4: Test

After Netlify deployment (2-3 minutes):

1. **Open incognito/private browser** (to simulate non-logged-in user)
2. **Visit**: `https://devscope-analyser.netlify.app/u/Abhishhek-Verma`
3. **Expected**: Portfolio loads successfully without errors! ✅

## Security Notes

✅ **Safe to use in frontend code**:
- The token only has `public_repo` read access
- It cannot modify any repositories
- It cannot access private repositories
- It only reads public data (same as manual browsing)

✅ **Protected by `.gitignore`**:
- Your `.env` file is NOT committed to GitHub
- Token remains private on your machine and Netlify

## Troubleshooting

### Still seeing rate limit errors?

1. **Check token is set correctly**:
   ```bash
   # In DevScope directory
   cat .env | findstr VITE_GITHUB_PUBLIC_TOKEN
   ```

2. **Verify Netlify variable**:
   - Go to: https://app.netlify.com/sites/devscope-analyser/settings/env
   - Confirm `VITE_GITHUB_PUBLIC_TOKEN` is listed

3. **Check token permissions**:
   - Visit: https://github.com/settings/tokens
   - Ensure your token has `public_repo` scope selected

4. **Wait for deployment**:
   - Netlify takes 2-3 minutes to rebuild after env var changes
   - Check: https://app.netlify.com/sites/devscope-analyser/deploys

### Token expired or invalid?

- Generate a new token following Step 1 above
- Update both `.env` file and Netlify environment variable
- Redeploy

## Alternative: Use Without Token (Not Recommended)

If you don't want to set up a token, users can still view portfolios BUT:
- ⚠️ They may see "Rate limit exceeded" errors
- ⚠️ They'll need to log in first (defeats purpose of public sharing)
- ⚠️ Limited to 60 views/hour total (across all visitors)

**Recommendation**: Set up the token - it takes 5 minutes and solves the issue permanently! 🚀
