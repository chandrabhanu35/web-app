# 🚀 AptitudeHub - Launch Instructions

## Status Check ✅

Your application is **ready to launch** with:
- ✅ All dependencies installed (npm install complete)
- ✅ SCSS compiled to CSS successfully
- ✅ All 25+ files in place
- ✅ Express server configured

## ⚠️ What's Needed: PostgreSQL Database

**The server needs PostgreSQL running to work.**

Choose one of these options:

---

## Option 1: Install PostgreSQL Locally (Windows)

### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 15 or later
3. Run the installer (postgresql-15.x-x64.exe)

### Step 2: Installation Settings
- **Port**: 5432 (default)
- **Username**: postgres
- **Password**: password (or choose your own)
- **Install pgAdmin**: Yes (optional but helpful)

### Step 3: Create Database
Open Command Prompt or PowerShell and run:

```bash
psql -U postgres -c "CREATE DATABASE aptitude_hub;"
```

### Step 4: Update .env File
Edit `d:\web ui\.env` and set your PostgreSQL password:

```properties
PORT=5000
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aptitude_hub
JWT_SECRET=your_secret_key_change_in_production_12345
NODE_ENV=development
```

### Step 5: Run Server
```bash
cd "d:\web ui"
npm start
```

✅ Server will start on http://localhost:5000

---

## Option 2: Use Docker (Recommended for Quick Testing)

### Step 1: Install Docker
Download from https://www.docker.com/products/docker-desktop

### Step 2: Run PostgreSQL Container
```bash
docker run --name aptitude-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

### Step 3: Create Database
```bash
docker exec aptitude-db psql -U postgres -c "CREATE DATABASE aptitude_hub;"
```

### Step 4: Run Server
```bash
cd "d:\web ui"
npm start
```

✅ Server will start on http://localhost:5000

---

## Option 3: Cloud PostgreSQL (Production)

For deploying to production, use:
- **Amazon RDS** (AWS)
- **Google Cloud SQL** (Google Cloud)
- **Heroku Postgres** (Heroku)
- **Neon** (https://neon.tech - Free tier!)

Then update `.env` with your cloud database URL.

---

## 📋 Full Setup Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `aptitude_hub` created
- [ ] `.env` file updated with your password
- [ ] Run `npm install` (already done ✅)
- [ ] Run `npm start` to launch server

---

## 🎯 Verify Everything Works

### Test 1: Server Running
Visit: http://localhost:5000

You should see the **Student Login Page**

### Test 2: Admin Panel
Visit: http://localhost:5000/admin

You should see the **Admin Dashboard**

### Test 3: Sign Up
1. Click "Sign Up"
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Mobile: 1234567890
   - Password: password123
3. Click "Create Account"

You should be logged in to the dashboard!

### Test 4: Take a Test
1. Click on "IT Aptitude" exam
2. Answer 5 questions
3. View your results and score

✅ Everything works!

---

## 🔧 Troubleshooting

### "ECONNREFUSED 127.0.0.1:5432"
**Problem**: PostgreSQL is not running
**Solution**: 
- Windows: Check Services app for "postgresql"
- Docker: Run `docker ps` to verify container is running
- Fix: Restart PostgreSQL service

### "Database does not exist"
**Problem**: `aptitude_hub` database wasn't created
**Solution**: Run in PostgreSQL client:
```bash
psql -U postgres -c "CREATE DATABASE aptitude_hub;"
```

### Port 5000 Already in Use
**Problem**: Another app is using port 5000
**Solution**: Edit `.env` and change PORT to 5001, 5002, etc.

### SASS Compilation Failed
**Problem**: CSS didn't compile
**Solution**: Already fixed! Run:
```bash
npm run scss
```

### Can't Connect After Changing Password
**Problem**: .env has wrong password
**Solution**: Update `.env` file with correct PostgreSQL password

---

## 🌟 Next Steps After Launch

### 1. Create Admin User
- Sign up normally
- Connect to database directly:
```bash
psql -U postgres -d aptitude_hub
INSERT INTO admin_users (user_id, role) VALUES (1, 'superadmin');
```

### 2. Add More Questions
- Login to admin panel
- Click "Questions" section
- Add your own questions

### 3. Customize Colors
- Edit `scss/_variables.scss`
- Change `$primary-color` and `$secondary-color`
- Run `npm run scss` to recompile

### 4. Deploy Online
- Follow deployment guides in docs
- Use Heroku, Railway, or Vercel
- Upload to GitHub
- Connect to cloud database

---

## 📞 Need Help?

Check these files for more information:
- `QUICK_START.md` - 5-minute quick start
- `SETUP_GUIDE.md` - Detailed documentation
- `PROJECT_SUMMARY.md` - Complete overview
- `.env` - Configuration file
- `COMPLETION_CHECKLIST.md` - What's included

---

## ✨ You're All Set!

Your AptitudeHub platform is complete and ready. Just:

1. **Get PostgreSQL running** (local, Docker, or cloud)
2. **Update `.env`** with your database credentials
3. **Run `npm start`**
4. **Visit http://localhost:5000**

**Enjoy! 🎉**

---

*Last Updated: October 20, 2025*
*Status: READY TO LAUNCH*
