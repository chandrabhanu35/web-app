# 🚀 Quick Start Guide - 5 Minutes to Launch!

## Step 1: Install Dependencies (1 min)

Open PowerShell in `d:\web ui\` folder and run:

```powershell
npm install
```

## Step 2: Setup PostgreSQL Database (2 min)

### Option A: Using pgAdmin (GUI)
1. Open pgAdmin (comes with PostgreSQL)
2. Create new database called `aptitude_hub`
3. Run SQL script from `db/schema.js`

### Option B: Using Command Line
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql terminal:
CREATE DATABASE aptitude_hub;
```

## Step 3: Update .env File (1 min)

Edit `.env` file and add your PostgreSQL password:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aptitude_hub
JWT_SECRET=super_secret_key_12345
NODE_ENV=development
```

## Step 4: Compile SCSS (1 min)

```powershell
npm run scss
```

This converts SCSS files to CSS and watches for changes.

## Step 5: Start Server (in new terminal)

```powershell
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

---

## ✅ You're Ready!

### Access the applications:

1. **Student App**: http://localhost:5000
   - Sign up with any name/email/mobile
   - Take exams
   - View leaderboard
   - Check achievements

2. **Admin Panel**: http://localhost:5000/admin
   - View user analytics
   - Manage questions
   - See activity reports
   - Deactivate users

---

## 📊 What You Get

- ✅ Full authentication system with database
- ✅ Professional SASS-styled interface
- ✅ Admin dashboard with analytics
- ✅ Engagement features (streaks, XP, levels)
- ✅ Leaderboard ranking
- ✅ Test history and achievements
- ✅ Mobile-responsive design

---

## 🔧 If Something Goes Wrong

### Error: "Cannot find module 'express'"
```
Solution: Run 'npm install' again
```

### Error: "Database connection failed"
```
Solution: 
- Make sure PostgreSQL is running
- Check DB credentials in .env
- Create database manually if needed
```

### Error: "SCSS not compiling"
```
Solution: Run 'npm install -g sass'
```

### Port 5000 already in use
```
Solution: Change PORT in .env to 5001 (or any free port)
```

---

## 📁 Key Files to Know

- `server.js` - Main backend file
- `public/index.html` - Student interface
- `public/admin.html` - Admin dashboard
- `routes/` - API endpoints
- `scss/` - All styling files
- `.env` - Configuration

---

## 🎯 Next Steps

1. **Add more questions** via Admin Panel
2. **Customize colors** in `scss/_variables.scss`
3. **Add more exams** in Student dashboard
4. **Deploy to cloud** (Heroku, Railway, Vercel)

---

## 💡 Features to Explore

- **Streaks**: Take tests on consecutive days
- **XP System**: Earn points based on test performance
- **Leaderboard**: Compete with other students
- **Analytics**: View your progress over time
- **Admin Reports**: See platform-wide statistics

---

## 📚 Helpful Commands

```powershell
# Install dependencies
npm install

# Compile SCSS
npm run scss

# Start server (production)
npm start

# Start server with auto-reload (development)
npm run dev

# Stop server
Ctrl + C
```

---

**That's it! You now have a complete aptitude testing platform. Enjoy! 🎉**

For detailed setup, refer to `SETUP_GUIDE.md`
