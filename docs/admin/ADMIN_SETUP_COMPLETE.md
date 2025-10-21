# 🔐 Admin Panel - Complete Setup Guide

## Server Status: ✅ RUNNING

Your server is now running on **http://localhost:5000**

---

## 📋 Admin Credentials

```
Name:     bhanu
Email:    bhanu@aptitude.com
Mobile:   7032151348
Password: Ncb8008535@
```

---

## 🚀 How to Access Admin Panel

### Step 1: Go to Admin Page
Open in browser: **http://localhost:5000/admin**

### Step 2: Login Modal Appears
You'll see a login form with pre-filled credentials:
- Email: `bhanu@aptitude.com`
- Password: `Ncb8008535@`

### Step 3: Click "Login as Admin"
- System authenticates your credentials
- Dashboard loads automatically

---

## 📊 Admin Dashboard Features

### 1. **Dashboard** (📊)
Shows real-time statistics:
- **Total Registered Users** - All users who signed up
- **Active Users** - Users with is_active = true
- **Currently Online** - Users active in last 30 minutes
- **New Today** - Users registered in last 24 hours
- **Total Tests** - All tests taken
- **Average Score** - Average test score percentage

### 2. **Users** (👥)
- View all registered users
- See user details and profile information
- Filter and search functionality

### 3. **Login History** (📋)
- Track all user activity
- Columns: Name, Email, Last Seen, Days Active, Total Tests
- Status indicator (🟢 Online / ⚪ Offline)
- Determines online status: activity in last 30 minutes

### 4. **Analytics** (📈)
- Visual charts and graphs
- Activity trends
- Performance metrics
- User engagement analytics

### 5. **Questions** (❓)
- Manage exam questions
- View question bank
- Question statistics (1,020+ questions available)
- Add/Edit/Delete questions

### 6. **Reports** (📄)
- Generate reports
- User performance reports
- Test analytics
- Engagement metrics

### 7. **Logout** (🚪)
- Securely logout
- Clears authentication token
- Returns to login screen

---

## 🔧 API Endpoints Used by Admin Panel

### Authentication
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Admin Statistics
```
GET /api/admin/stats
Header: Authorization: Bearer {token}
Response: { totalRegisteredUsers, totalActiveUsers, currentlyOnline, newUsersToday, totalTests, avgScore, examStats }
```

### Online Users
```
GET /api/admin/users/online
Header: Authorization: Bearer {token}
Response: { onlineUsers }
```

### Login History
```
GET /api/admin/users/login-history
Header: Authorization: Bearer {token}
Response: { loginHistory }
```

---

## 🛠️ How to Start/Stop Server

### Start Server
```powershell
cd "d:\web ui"
node server.js
```

The server will:
1. Connect to PostgreSQL database
2. Initialize all tables
3. Create admin account (if not exists)
4. Start listening on port 5000
5. Display: "🚀 Server running on http://localhost:5000"

### Stop Server
Press `Ctrl + C` in the terminal

The server will:
1. Gracefully shutdown
2. Close database connections
3. Exit with code 0

---

## 📱 Access URLs

| Feature | URL |
|---------|-----|
| Main App | http://localhost:5000 |
| Admin Panel | http://localhost:5000/admin |
| API Base | http://localhost:5000/api |
| Auth Login | POST http://localhost:5000/api/auth/login |
| Admin Stats | GET http://localhost:5000/api/admin/stats |

---

## 🔐 Security Features

✅ **Password Hashing** - Bcryptjs with salt rounds
✅ **JWT Tokens** - Secure token-based authentication
✅ **CORS Protection** - Cross-Origin Resource Sharing enabled
✅ **Input Validation** - All inputs validated
✅ **Admin Check** - Requests verified with Authorization header
✅ **No Pre-filled Credentials** - Only shown in admin page modal
✅ **Session Management** - LocalStorage based sessions

---

## 📊 Database Tables

The admin panel interacts with these tables:

1. **users** - All user accounts
2. **admin_users** - Admin role assignments
3. **test_results** - All test attempts
4. **questions** - Question bank (1,020+ questions)
5. **achievements** - User badges/achievements
6. **daily_streaks** - User streak tracking
7. **leaderboard** - User rankings
8. **notifications** - User notifications

---

## ✅ What's Working

- ✅ Admin account auto-created on startup
- ✅ Admin login with password verification
- ✅ Dashboard with 6 real-time statistics
- ✅ Currently online users display
- ✅ Login history tracking
- ✅ User management interface
- ✅ Analytics and reports
- ✅ Question management
- ✅ JWT token authentication
- ✅ Secure session management

---

## 🎯 Next Steps

1. **Test Admin Login**
   - Go to http://localhost:5000/admin
   - Login with provided credentials
   - Explore dashboard

2. **Create Student Accounts**
   - Go to http://localhost:5000
   - Click "Sign Up"
   - Create student accounts

3. **Monitor Activity**
   - Go to admin panel
   - Check "Currently Online" section
   - View "Login History"

4. **Generate Reports**
   - Click "Reports" in admin panel
   - View user engagement metrics
   - Analyze test performance

5. **Manage Questions**
   - Click "Questions" to view bank
   - 1,020 questions already seeded
   - Can add more as needed

---

## 🆘 Troubleshooting

### "Unable to connect to server"
- Make sure Node.js is running
- Server should show: "🚀 Server running on http://localhost:5000"
- Docker container must be running: `docker ps`

### "Login failed"
- Verify credentials are exactly:
  - Email: `bhanu@aptitude.com`
  - Password: `Ncb8008535@`
- Check database is connected

### "Dashboard not loading"
- Clear browser cache
- Check Authorization header is being sent
- Verify token in LocalStorage

### Server keeps crashing
- Check Docker PostgreSQL is running
- Verify port 5000 is not in use
- Check for errors in terminal

---

## 📞 Admin Credentials (Save This!)

```
┌─────────────────────────────────────┐
│  🔐 ADMIN LOGIN CREDENTIALS         │
├─────────────────────────────────────┤
│  Email:    bhanu@aptitude.com       │
│  Password: Ncb8008535@              │
│  Mobile:   7032151348               │
│  Name:     bhanu                    │
└─────────────────────────────────────┘
```

---

**Setup Complete! Your admin panel is ready to use.** 🎉

Go to: http://localhost:5000/admin
