# ⚡ Quick Deployment Checklist

## 📋 Overview
✅ Code pushed to GitHub  
⬜ Create database tables in Supabase  
⬜ Deploy to Netlify  
⬜ Add environment variables  
⬜ Update OAuth callbacks  
⬜ Test live site  

---

## 1️⃣ CREATE TABLES IN SUPABASE (5 minutes)

### Go to Supabase:
👉 https://app.supabase.com/

### Steps:
1. **Login** → Select your project
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**
4. Open file on computer:
   ```
   D:\Project-Devscope\DevScope\supabase\migrations\20260208000001_create_user_tables.sql
   ```
5. **Copy ALL** the SQL code (Ctrl+A, Ctrl+C)
6. **Paste** in Supabase SQL Editor (Ctrl+V)
7. Click **"RUN"** button
8. Wait for: **"Success. No rows returned"** ✅

### Verify:
- Click **"Table Editor"**
- Should see 6 tables: `user_profiles`, `user_goals`, `ai_summaries`, `activity_logs`, `repository_snapshots`, `monthly_stats`

✅ **DONE** → Move to step 2

---

## 2️⃣ DEPLOY TO NETLIFY (3 minutes)

### Go to Netlify:
👉 https://app.netlify.com/

### Steps:
1. Click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. **Authorize** Netlify (if prompted)
4. **Select** "DevScope" repository
5. **Verify** settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
6. Click **"Deploy DevScope"**
7. **Wait** 2-3 minutes for build

### Result:
You'll get a URL like: `https://your-site-12345.netlify.app`

⚠️ **DON'T test yet!** Need to add environment variables first.

---

## 3️⃣ ADD ENVIRONMENT VARIABLES (5 minutes)

### Get Supabase Keys:
1. Go to: https://app.supabase.com/
2. Select project → **Settings** → **API**
3. **Copy** "Project URL" (e.g., `https://your-project-id.supabase.co`)
4. **Copy** "anon public" key (click Reveal)

### Add to Netlify:
1. Netlify → **Site settings** → **Environment variables**
2. Click **"Add a variable"** (3 times for 3 variables)

**Variable 1:**
- Key: `VITE_SUPABASE_URL`
- Value: `https://your-project-id.supabase.co` (paste your actual URL)

**Variable 2:**
- Key: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGc...` (your long anon key)

**Variable 3:**
- Key: `VITE_GEMINI_API_KEY`
- Value: `your_gemini_api_key_here` (get from https://aistudio.google.com/app/apikey)

### Redeploy:
1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait 2-3 minutes

✅ **DONE** → Move to step 4

---

## 4️⃣ UPDATE OAUTH CALLBACKS (2 minutes)

### Copy Your Netlify URL:
Example: `https://your-site-12345.netlify.app`

### Update Supabase:
1. Go to: https://app.supabase.com/
2. Select project → **Authentication** → **URL Configuration**
3. **Redirect URLs** → Click **"Add URL"**
4. Add: `https://your-site-12345.netlify.app/auth/callback`
5. **Site URL** → Update to: `https://your-site-12345.netlify.app`
6. Click **"Save"**

✅ **DONE** → Move to step 5

---

## 5️⃣ TEST YOUR SITE (3 minutes)

### Open Your Site:
👉 `https://your-site-12345.netlify.app`

### Quick Tests:
1. ✅ Click "Sign in with GitHub" → Should login
2. ✅ Dashboard shows real GitHub data
3. ✅ Goals tab → Add a goal → Saves to database
4. ✅ Generate AI Summary → Works
5. ✅ Portfolio page displays

### Check Database:
1. Supabase → **Table Editor**
2. Check `user_profiles` → See your data
3. Check `user_goals` → See saved goals
4. Check `ai_summaries` → See generated summaries

---

## ✅ SUCCESS!

Your site is live at:
```
https://your-site-12345.netlify.app
```

## 🔄 To Update in Future:

```powershell
cd D:\Project-Devscope\DevScope
git add .
git commit -m "Update message"
git push
```

Netlify auto-deploys in 2-3 minutes!

---

## 🚨 Quick Fixes

### "Build Failed"
→ Check: Build command = `npm run build`, Publish = `dist`

### "White Screen"
→ Check: All 3 env variables added, then redeploy

### "OAuth Error"
→ Check: Redirect URL in Supabase includes `/auth/callback`

### "Table doesn't exist"
→ Rerun SQL migration in Supabase

---

## 📖 Full Guide

For detailed instructions, screenshots, and troubleshooting:
👉 Read `COMPLETE_DEPLOYMENT_GUIDE.md`

---

**Total Time**: ~20 minutes  
**Difficulty**: Easy 🟢  
**Status**: Ready to deploy! ✅
