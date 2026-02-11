# 🚀 Quick Database Migration Guide

## ⚠️ IMPORTANT: Apply This Migration First!

The code has been updated to fetch and store **ALL GitHub data**, but you need to update your Supabase database schema first.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/ibzdcrcgzeewjhpxztwh
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Migration
1. Open file: `supabase/migrations/20260208000001_create_user_tables.sql`
2. **Copy ALL the contents** (the entire file)
3. **Paste** into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Migration Success
You should see: ✅ "Success. No rows returned"

Check that these tables exist:
- user_profiles
- repository_snapshots  
- activity_logs
- monthly_stats
- user_goals
- ai_summaries

### Step 4: Test the Application
1. **Open your app**: http://localhost:5173 (if not running: `npm run dev`)
2. **Log out** (click your avatar → Log out)
3. **Log back in** with GitHub
4. **Wait 10-20 seconds** for data to load

### Step 5: Check Data in Supabase
Go back to Supabase dashboard → **Table Editor**:

**✅ user_profiles** - Should have 1 row with your GitHub profile
- Check: github_username, name, avatar_url, followers, public_repos

**✅ repository_snapshots** - Should have all your repositories
- Check: repo names, stars, language, description

**✅ activity_logs** - Should have recent GitHub events
- Check: activity_type (PushEvent, CreateEvent, etc.)

**✅ monthly_stats** - Should show monthly activity
- Check: total_commits, total_prs, total_issues (NOT all zeros!)

---

## 🎯 What You'll See After Migration

### Before (Old Schema):
- ❌ user_profiles: Empty
- ❌ activity_logs: Empty  
- ❌ monthly_stats: Only commits, PRs and issues = 0
- ❌ repository_snapshots: Empty or partial data

### After (New Schema):
- ✅ user_profiles: Complete GitHub profile with JSONB data
- ✅ activity_logs: 100+ recent events (commits, PRs, issues, stars)
- ✅ monthly_stats: Real counts for commits + PRs + issues
- ✅ repository_snapshots: All repos with complete details

---

## 📊 Data Being Fetched

The app now fetches from **8 GitHub API endpoints**:

1. **User Profile** → `user_profiles` table
2. **Repositories** → `repository_snapshots` table  
3. **Pull Requests** → Stored in activity data
4. **Issues** → Stored in activity data
5. **Events** → `activity_logs` table
6. **Organizations** → Fetched (not stored yet)
7. **Gists** → Fetched (not stored yet)
8. **Commits** → Aggregated in `monthly_stats`

---

## ⚠️ Important Notes

**Data Loss Warning:**
- Running the migration will **DROP all existing tables**
- All data in these tables will be **DELETED**
- Data will be **refetched** from GitHub on next login

**What Will Be Lost:**
- ❌ User goals (if you created any)
- ❌ AI summaries (if you generated any)
- ❌ All other data

**What Will Be Restored:**
- ✅ User profile (from GitHub)
- ✅ Repositories (from GitHub)  
- ✅ Activity logs (from GitHub)
- ✅ Monthly stats (calculated from GitHub)

**Recommendation**: If you have important user_goals or ai_summaries, export them first (Table Editor → Export as CSV)

---

## 🐛 Trouble shooting

### Migration Fails
**Error**: "relation already exists"
**Solution**: Add `DROP TABLE IF EXISTS tablename CASCADE;` before each CREATE TABLE

### Tables Empty After Login
**Check:**
1. Open browser console (F12) → Look for errors
2. Check GitHub token: Settings → Developer settings → Personal access tokens
3. Verify token has scopes: `repo`, `user`, `read:org`
4. Check Supabase logs: Dashboard → Logs

### API Rate Limit Exceeded
**Error**: "API rate limit exceeded"  
**Solution**: Wait 1 hour, or use a different GitHub account

---

## ✅ Success Checklist

- [ ] Migration SQL executed successfully in Supabase
- [ ] All 6 tables visible in Table Editor
- [ ] Logged out and logged back in
- [ ] user_profiles has your profile data
- [ ] repository_snapshots has your repos
- [ ] activity_logs has recent events  
- [ ] monthly_stats shows non-zero counts
- [ ] No errors in browser console (F12)

---

## 🎉 What's Next?

After successful migration:
1. **Dashboard** will show real statistics
2. **Activity logs** will track all GitHub events
3. **Monthly trends** will be accurate
4. **Data refreshes** on every login
5. **All GitHub data** stored in database

---

**Need Help?** Check browser console for errors and Supabase logs for clues.

**Everything Working?** You're all set! Your app now stores comprehensive GitHub data.
