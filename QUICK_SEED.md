# 🚀 Quick Start: Seed Questions to Render

## Steps to Populate 10,000 Questions:

### Step 1: Get Your Database URL from Render
1. Go to https://dashboard.render.com/
2. Click your **PostgreSQL database** (the one named `postgres-databas...`)
3. Scroll down and find **"External Database URL"**
4. **Copy the entire URL** (looks like: `postgresql://user:password@host:5432/dbname`)

### Step 2: Run the Seed Script

Open PowerShell and run:

```powershell
cd "d:\web ui"
$env:DATABASE_URL = "paste_your_url_here"
node seed-render.js
```

**Or in one line:**
```powershell
cd "d:\web ui" ; $env:DATABASE_URL="paste_your_url_here" ; node seed-render.js
```

### Step 3: Wait for Completion

The script will:
- ✅ Connect to your Render database
- ✅ Generate 10,000 questions
- ✅ Insert them into the database
- ✅ Show you a summary

This takes about 2-5 minutes depending on your internet speed.

### Step 4: Test Your Quiz Modules

1. Go to https://web-app-kljr.onrender.com
2. Click any quiz module (IT Jobs, Banking, or Government)
3. Start taking the test!

---

## 📋 Example:

```powershell
cd "d:\web ui"
$env:DATABASE_URL = "postgresql://abc123:password123@dpg-abc123.render.com:5432/aptitude_db"
node seed-render.js
```

---

## ✅ Success Indicators:

You'll see output like:
```
✅ Connected to database at: 2025-10-21 12:34:56
✅ Generated 10000 questions
✅ Inserted 5000 questions (50%)
✅ DATABASE SEEDING COMPLETE!

📊 Total Questions in Database: 10000

📋 Questions by Exam Type:
   💼 IT: 3333 questions
   🏦 BANKING: 3333 questions
   🏛️ GOVERNMENT: 3334 questions
```

---

## ❌ Troubleshooting:

**"DATABASE_URL is not set"**
- Make sure you set the environment variable before running the script
- Check you copied the entire URL including `postgresql://` at the start

**"Connection refused"**
- Verify the DATABASE_URL is correct
- Make sure your Render PostgreSQL is running
- Check internet connection

**"Tables do not exist"**
- First, deploy your app to Render at least once
- This creates the database tables
- Then run the seed script

---

Ready? Let's go! 🚀
