# Deployment Configuration Guide

## What You Did (Your Development Process)

1. ✅ **Developed locally** using Docker Compose with PostgreSQL
2. ✅ **Connected to GitHub** repository
3. ✅ **Deployed to Render** platform
4. ✅ **Integrated CI/CD** - Render auto-deploys on push to main branch

---

## Current Issues Fixed

### Issue 1: Quiz Submission Failed (500 Error)
**Problem:** POST /api/quiz/submit returns 500 Internal Server Error

**Why it happened:**
- Database INSERT or UPDATE query had syntax errors
- Missing input validation
- NULL/undefined handling issues
- Poor error logging

**How fixed:**
- Added comprehensive input validation
- Fixed SQL UPSERT syntax in leaderboard update
- Added detailed error logging for debugging
- Improved null/undefined handling

### Issue 2: Frontend Route 404
**Problem:** GET /api/it returns 404

**Why it happened:**
- Browser attempted to fetch `/it` as a static resource
- This is normal SPA behavior - not actually an error

**How fixed:**
- Server.js already correctly serves index.html for all non-API routes
- No changes needed - confirmed working as designed

### Issue 3: Console Warning
**Problem:** "Deprecated feature used: Unload event listeners are deprecated"

**Why it happened:**
- Browser extension (content.js:2) warning
- NOT from our application code

**Status:** Safe to ignore - our code doesn't use unload events

---

## Environment Variables Setup (Required on Render)

### Step 1: Go to Render Dashboard
1. Navigate to: https://dashboard.render.com
2. Select your web service: `web-app-kljr`
3. Click "Environment" tab

### Step 2: Add/Verify These Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Enables production error handling |
| `JWT_SECRET` | Generate secure string | Min 32 characters, use: https://1password.com/password-generator/ |
| `DATABASE_URL` | Your Postgres URL | Should already be set if you created DB on Render |
| `PORT` | `5000` | Port your app listens on |

### Step 3: Generate Secure JWT_SECRET

**Option A: Online Generator**
- Go to: https://www.random.org/strings/
- Settings:
  - Number of strings: 1
  - Length of each string: 32
  - Characters to use: a-z, A-Z, 0-9, special characters
- Copy the result

**Option B: Terminal Command (Local)**
```bash
# On Windows PowerShell:
$([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()).Replace('-', '')

# On Mac/Linux:
openssl rand -base64 32
```

**Example JWT_SECRET:**
```
x8mK$9pL&2nQ@5vR%3tU#7wX*4yZ!1bC
```

### Step 4: Redeploy Application

#### Option A: Auto Deploy (Recommended)
1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix quiz submission errors"
   git push origin main
   ```
2. Render automatically detects the push and deploys
3. Check Status tab to verify deployment

#### Option B: Manual Deploy
1. In Render dashboard, go to "Deployments" tab
2. Click "Create Deploy" button
3. Select "main" branch
4. Click "Create"

---

## Verify Deployment

### Step 1: Check Application Status
- Visit: https://web-app-kljr.onrender.com
- Should see login/signup page (no errors)

### Step 2: Test Login Flow
1. Create new account (signup)
2. Dashboard should load (0 stats initially)
3. Start a quiz
4. Submit answers
5. Should see "✅ Test result saved" and XP notification

### Step 3: Monitor Server Logs
1. In Render dashboard, go to "Logs" tab
2. Look for:
   - `📍 POST /api/quiz/submit` - Request received
   - `✅ Test result saved` - Success
   - `✅ User stats updated` - Stats updated
   - Any `❌ Error` messages

### Step 4: Check Browser Console
1. Open DevTools (F12)
2. Console tab should show:
   - No 500 errors
   - "Received updated stats" confirmation
   - XP and streak notifications

---

## Database Structure Verification

### Required Tables (Auto-created)
- `users` - User accounts
- `test_results` - Quiz submission records
- `leaderboard` - User rankings
- `questions` - Quiz questions
- `admin_users` - Admin accounts
- `sessions` - Login session tracking
- `achievements` - User badges
- `notifications` - User notifications

### Verify Tables Exist
1. Go to Render dashboard
2. Click on PostgreSQL database
3. Check "Connect" → "Browser" tab
4. Query: `SELECT tablename FROM pg_tables WHERE schemaname='public';`

---

## Deployment Architecture

```
┌─────────────────────────┐
│   GitHub (Repository)   │
│   main branch           │
└────────────┬────────────┘
             │ (Push triggers webhook)
             ↓
┌─────────────────────────┐
│  Render Platform        │
│  ├─ Web Service         │
│  │  ├─ Node.js          │
│  │  ├─ Express Server   │
│  │  └─ Static Files     │
│  └─ PostgreSQL DB       │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│  https://web-app-       │
│  kljr.onrender.com      │
│  (Live Application)     │
└─────────────────────────┘
```

---

## Local Development vs Production

### Local Development (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://postgres:password@localhost:5432/aptitude_hub
JWT_SECRET=dev_secret_key
```

### Production (Render Environment Variables)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@render-db-host:5432/database_name
JWT_SECRET=<secure_random_string_32_chars>
```

---

## Troubleshooting

### Problem: 500 Error on Quiz Submit
**Check:**
1. Verify `JWT_SECRET` is set on Render
2. Check database connection: `DATABASE_URL` should exist
3. View server logs on Render for detailed error
4. Ensure all tables exist in PostgreSQL

### Problem: Database Connection Failed
**Check:**
1. PostgreSQL instance is running on Render
2. `DATABASE_URL` is correct format
3. Network connectivity between web service and database

### Problem: CORS Errors
**Check:**
1. Frontend origin in allowed list: `server.js` line ~55
2. Ensure `https://web-app-kljr.onrender.com` is in `allowedOrigins`

### Problem: Stats Not Updating
**Check:**
1. localStorage enabled in browser
2. Token is valid (check F12 → Storage)
3. Check server logs for "User stats updated" message

---

## Next Steps

1. ✅ **Update Render environment variables** (JWT_SECRET, NODE_ENV)
2. ✅ **Commit and push** all code changes to GitHub
3. ✅ **Monitor deployment** on Render
4. ✅ **Test full flow** (signup → quiz → stats update)
5. ✅ **Monitor logs** during testing

---

## Files Modified in This Fix

```
d:\web ui\routes\quiz.js         - Fixed submit endpoint & leaderboard update
d:\web ui\db\schema.js           - Improved leaderboard table structure
d:\web ui\server.js              - Added request logging & error handling
d:\web ui\public\app.js          - Better error messages & logging
d:\web ui\middleware\auth.js     - Stricter JWT_SECRET validation
```

---

## Success Indicators

After deployment, you should see:

✅ User can signup/login
✅ Dashboard loads with 0 stats initially
✅ Can start and submit quiz
✅ "Test result saved" message appears
✅ "+XXX XP earned!" notification shows
✅ Back to Dashboard shows updated stats
✅ Leaderboard shows user entry

If any of these fail, check the server logs on Render for error details.

