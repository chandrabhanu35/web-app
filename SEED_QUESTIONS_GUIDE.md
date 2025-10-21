# How to Populate Questions in Your Database

## Problem
The three quiz modules (IT Jobs, Banking Exams, Government Exams) are not showing questions because the database is empty.

## Solution

You have two options:

### Option 1: Seed Locally (Recommended for Testing)

1. **Install PostgreSQL locally** (if not already installed)
   - Download from: https://www.postgresql.org/download/

2. **Create a local database**
   ```
   createdb aptitude_hub
   ```

3. **Update your `.env` file**
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aptitude_hub
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

4. **Run the seed script**
   ```bash
   npm run seed
   ```

5. **Verify** - Check if questions were added:
   ```bash
   node -e "import('./db/connection.js').then(m => m.default.query('SELECT COUNT(*) FROM questions')).then(r => console.log('Total questions:', r.rows[0].count)).catch(e => console.error(e))"
   ```

---

### Option 2: Seed on Render (For Production)

1. **Connect to Render PostgreSQL**
   ```bash
   # Install psql if needed
   # On Windows: https://www.postgresql.org/download/windows/
   # On Mac: brew install postgresql
   ```

2. **Get your connection details from Render**
   - Go to https://dashboard.render.com/
   - Click your PostgreSQL database
   - Copy the **External Database URL**

3. **Run seed via remote connection**
   ```bash
   DATABASE_URL="your_render_url" npm run seed
   ```

---

### Option 3: Use Admin Panel to Add Questions Manually

1. **Login as Admin:**
   - URL: `https://web-app-kljr.onrender.com/admin`
   - Email: `bhanu@aptitude.com`
   - Password: `Ncb8008535@`

2. **Add questions through the admin panel interface**
   (You would need to build this feature first)

---

## What the Seed Script Does

The `db/seed.js` file generates and inserts **10,000 questions** covering:

✅ **IT Jobs & Campus Placements** (50 questions, 60 minutes)
- Quantitative Aptitude
- Reasoning
- Programming Concepts

✅ **Banking Exams** (50 questions, 60 minutes)
- Quantitative Aptitude
- Reasoning
- General Knowledge
- English Language

✅ **Government Exams** (75 questions, 90 minutes)
- Quantitative Aptitude
- General Knowledge
- Reasoning
- English Language

---

## Quick Command

```bash
cd d:\web ui
npm run seed
```

After running this, your quiz modules will have questions!

---

## Troubleshooting

**Error: "Cannot find module 'pg'"**
```bash
npm install
```

**Error: "Connection refused"**
- Make sure PostgreSQL is running locally
- Check your `.env` file has correct DB credentials

**Questions not appearing on the site**
- Check browser console for errors (F12)
- Verify questions were inserted:
  ```bash
  SELECT COUNT(*) FROM questions;
  ```

---

Let me know if you need help with any of these steps! 🎯
