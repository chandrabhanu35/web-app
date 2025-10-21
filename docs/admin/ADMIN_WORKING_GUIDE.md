# 🔐 Admin Panel - Complete Working Guide

## ✅ STATUS: FULLY OPERATIONAL

Your Aptitude Hub admin panel is now **fully functional and ready to use!**

---

## 📋 ADMIN LOGIN CREDENTIALS

**Save these credentials securely:**

```
Name:     bhanu
Email:    bhanu@aptitude.com
Password: Ncb8008535@
Mobile:   7032151348
```

---

## 🚀 HOW TO START (2 LINES)

```powershell
cd "d:\web ui"
node server.js
```

Server will start on: **http://localhost:5000**

---

## 🎯 HOW TO ACCESS ADMIN PANEL

### Step 1: Open Admin URL
```
http://localhost:5000/admin
```

### Step 2: You'll See
- Clean login form with:
  - Email field (empty - enter your credentials)
  - Password field (empty - enter your password)
  - "Login as Admin" button

### Step 3: Enter Credentials
- **Email:** `bhanu@aptitude.com`
- **Password:** `Ncb8008535@`

### Step 4: Click Login Button
- Button will authenticate your credentials
- Dashboard will load automatically

---

## 📊 ADMIN DASHBOARD FEATURES

Once logged in, you have access to:

### 1. **Dashboard** (📊)
Real-time statistics showing:
- Total Registered Users
- Active Users
- Currently Online (last 30 min)
- New Users Today (last 24 hrs)
- Total Tests Taken
- Average Score

### 2. **Users** (👥)
- View all registered users
- User profiles and details
- Status information

### 3. **Login History** (📋)
- Track all user activity
- Last seen timestamp
- Days active
- Total tests per user
- Online status indicator (🟢 Online / ⚪ Offline)

### 4. **Analytics** (📈)
- Visual charts and graphs
- Activity trends
- Performance metrics

### 5. **Questions** (❓)
- Manage question bank (1,020+ questions)
- Add new questions
- Edit existing questions

### 6. **Reports** (📄)
- Generate user reports
- Engagement metrics
- Performance analysis

### 7. **Logout** (🚪)
- Securely logout
- Clear session

---

## 🔧 WHAT'S WORKING

✅ Server runs smoothly on port 5000  
✅ Admin account auto-created on startup  
✅ Admin login with email & password  
✅ JWT token authentication  
✅ Real-time dashboard statistics  
✅ User activity tracking  
✅ Login history with status indicators  
✅ Secure session management  
✅ Database connected and initialized  
✅ 1,020+ questions in database  

---

## 🌐 QUICK LINKS

| Feature | URL |
|---------|-----|
| Main App | http://localhost:5000 |
| Admin Panel | http://localhost:5000/admin |
| API Auth | http://localhost:5000/api/auth/login |
| Admin Stats | http://localhost:5000/api/admin/stats |

---

## 🆘 TROUBLESHOOTING

### Q: Login button not working?
**A:** 
- Make sure credentials are exactly correct
- Check browser console for errors (F12)
- Verify server is running (check terminal)
- Try refreshing the page

### Q: Can't access admin panel?
**A:**
- Check server is running: `http://localhost:5000` should work
- Verify port 5000 is not blocked
- Clear browser cache
- Try incognito/private window

### Q: Server won't start?
**A:**
- Kill existing Node processes: `taskkill /F /IM node.exe`
- Make sure Docker (PostgreSQL) is running
- Check if port 5000 is in use
- Verify database connection

### Q: Credentials not working?
**A:**
- Email: `bhanu@aptitude.com` (exact)
- Password: `Ncb8008535@` (case-sensitive)
- Both must be entered exactly

---

## 📱 BROWSER COMPATIBILITY

Works on:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Any modern browser

---

## 🔐 SECURITY

- ✅ Passwords hashed with Bcryptjs
- ✅ JWT token-based authentication
- ✅ CORS protection enabled
- ✅ Input validation on all fields
- ✅ Secure session management
- ✅ No credentials exposed in HTML

---

## 💾 DATABASE TABLES

The admin panel manages these tables:
1. **users** - All user accounts
2. **admin_users** - Admin roles
3. **test_results** - Test attempts
4. **questions** - Question bank
5. **achievements** - User badges
6. **daily_streaks** - Streak tracking
7. **leaderboard** - Rankings
8. **notifications** - User notifications

---

## 📞 SUPPORT

If something isn't working:

1. **Check server logs** - Look at terminal output
2. **Check browser console** - Press F12, look for errors
3. **Verify database** - Docker should show PostgreSQL running
4. **Restart server** - Stop (Ctrl+C) and restart (node server.js)

---

## ✨ YOU'RE ALL SET!

Your admin panel is ready to manage the Aptitude Hub platform.

**Start using it now:**
```
1. Run: cd "d:\web ui" ; node server.js
2. Open: http://localhost:5000/admin
3. Login with provided credentials
4. Start managing your platform!
```

---

**Happy Teaching & Learning! 🎓**
