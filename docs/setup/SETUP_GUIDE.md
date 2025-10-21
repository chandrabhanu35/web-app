# 🎯 AptitudeHub - Complete Setup Guide

## 📋 Project Overview

AptitudeHub is a **full-stack aptitude testing platform** with:
- ✅ **Database Authentication** - PostgreSQL with bcrypt password hashing
- ✅ **Admin Panel** - Manage users, questions, and analytics
- ✅ **SASS/SCSS** - Professional, maintainable styling
- ✅ **Engagement Features** - Streaks, XP points, levels, leaderboards, achievements
- ✅ **Real-time Analytics** - Charts and performance reports
- ✅ **Responsive Design** - Works on all devices

---

## 🛠️ Prerequisites

Before starting, ensure you have:

1. **Node.js** (v14+) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12+) - [Download](https://www.postgresql.org/download/)
3. **npm** (comes with Node.js)
4. **Git** (optional)

---

## 📁 Project Structure

```
d:\web ui\
├── package.json              # Dependencies
├── server.js                 # Express server entry point
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
│
├── db/
│   ├── connection.js        # Database connection
│   └── schema.js            # Database initialization
│
├── middleware/
│   └── auth.js              # JWT authentication
│
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── quiz.js              # Quiz/Test endpoints
│   ├── user.js              # User profile endpoints
│   └── admin.js             # Admin endpoints
│
├── public/
│   ├── index.html           # Main app
│   ├── admin.html           # Admin panel
│   ├── app.js               # Frontend logic
│   ├── admin.js             # Admin logic
│   ├── questions.js         # Question bank
│   └── css/
│       └── main.css         # Compiled SCSS
│
└── scss/
    ├── main.scss            # Main SCSS file
    ├── _variables.scss      # Variables
    ├── _mixins.scss         # Mixins
    ├── _common.scss         # Common styles
    ├── _layout.scss         # Layout styles
    ├── _quiz.scss           # Quiz styles
    ├── _admin.scss          # Admin styles
    └── _profile.scss        # Profile styles
```

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
cd "d:\web ui"
npm install
```

This will install:
- `express` - Web framework
- `pg` - PostgreSQL client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT auth
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `sass` - SCSS compiler
- `nodemon` - Auto-reload (dev)

### Step 2: Setup PostgreSQL Database

Open **pgAdmin** or **psql** terminal:

```sql
-- Create database
CREATE DATABASE aptitude_hub;

-- Connect to database
\c aptitude_hub;

-- Now run the initialization script from db/schema.js
```

Or use Node.js to auto-create tables:

```bash
node db/schema.js
```

### Step 3: Configure Environment Variables

Update `.env` file:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aptitude_hub
JWT_SECRET=change_this_to_a_secure_random_string
NODE_ENV=development
```

### Step 4: Compile SCSS to CSS

```bash
npm run scss
```

This watches and compiles `scss/main.scss` → `public/css/main.css`

### Step 5: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

Server will run on: **http://localhost:5000**

---

## 📱 Accessing the Platform

### Student Application
- **URL**: `http://localhost:5000/`
- **Features**: Login, signup, take exams, view results, leaderboard
- **Database**: User credentials, test history, achievements

### Admin Panel
- **URL**: `http://localhost:5000/admin`
- **Features**: User management, analytics, question management, reports
- **Require**: Admin privileges (set in database)

---

## 🔐 Authentication & Security

### User Registration
1. **Signup Form** collects: name, email, mobile, password
2. **Password Hashing** using bcrypt (salting rounds: 10)
3. **JWT Token** issued for 30 days
4. **Stored in**: localStorage (consider httpOnly cookies for production)

### Login Process
1. Email/password verification
2. JWT token generation
3. Token sent in `Authorization: Bearer <token>` header
4. All API calls require valid token

### Making API Calls

```javascript
const response = await fetch('http://localhost:5000/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(15) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_pic VARCHAR(500),
  bio TEXT,
  experience_points INT DEFAULT 0,
  streak_count INT DEFAULT 0,
  total_tests INT DEFAULT 0,
  best_score DECIMAL(5,2) DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Test Results Table
```sql
CREATE TABLE test_results (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  exam_type VARCHAR(50),
  score INT,
  total_questions INT,
  percentage DECIMAL(5,2),
  time_taken INT,
  category_scores JSONB,
  answers JSONB,
  created_at TIMESTAMP
);
```

### Achievements Table
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  badge_name VARCHAR(100),
  badge_icon VARCHAR(100),
  description TEXT,
  earned_at TIMESTAMP
);
```

### Leaderboard Table
```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id),
  rank INT,
  total_score INT,
  tests_completed INT,
  last_updated TIMESTAMP
);
```

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/test-history` - Get test history
- `GET /api/user/achievements` - Get achievements
- `GET /api/user/stats` - Get user statistics

### Quiz
- `GET /api/quiz/questions/:examType` - Get questions
- `POST /api/quiz/submit` - Submit test result
- `GET /api/quiz/leaderboard` - Get leaderboard

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - Get user details
- `GET /api/admin/stats` - Get dashboard stats
- `POST /api/admin/questions` - Add question
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user
- `GET /api/admin/reports/activity` - Activity report

---

## 🎨 SASS/SCSS Structure

### Variables (`_variables.scss`)
```scss
$primary-color: #667eea;
$secondary-color: #764ba2;
$spacing-lg: 20px;
$radius-md: 15px;
// ... more variables
```

### Mixins (`_mixins.scss`)
```scss
@mixin flex-center { display: flex; align-items: center; justify-content: center; }
@mixin gradient-bg($from, $to) { background: linear-gradient(135deg, $from, $to); }
@mixin responsive($size) { @media (max-width: $breakpoint) { @content; } }
// ... more mixins
```

### Usage Example
```scss
.button {
  @include flex-center;
  @include gradient-bg($primary-color, $secondary-color);
  padding: $spacing-lg;
  border-radius: $radius-md;
  @include transition(all);

  &:hover {
    transform: scale(1.05);
  }
}
```

---

## 🚀 Features Breakdown

### 1. **Engagement System**

#### Streaks 🔥
- Tracks consecutive days of activity
- Resets if user doesn't take any test for a day
- Updated in `daily_streaks` table

#### Experience Points (XP) ⭐
- Earned on each test completion
- Base XP: 10 × percentage_scored
- Updated in `users` table

#### Levels 📈
- Level = floor(XP / 1000) + 1
- Display on dashboard
- Motivation for continuous engagement

#### Achievements 🏅
- Badge system with icons
- Unlocked based on milestones:
  - First Test
  - 10 Tests Completed
  - 80%+ Score
  - 7-day Streak
  - Top 10 Leaderboard

### 2. **Leaderboard** 🏆
- Ranked by total score
- Shows top 100 users
- Updates after each test
- Visible to all users

### 3. **Analytics Dashboard**
- Total users, tests, average score
- Activity trends (last 30 days)
- Exam distribution charts
- Category performance breakdown
- Real-time user statistics

### 4. **Admin Panel**
- User management (view, deactivate)
- Add/edit questions
- Performance reports
- Activity analytics
- User behavior insights

---

## ✨ Enhancement Ideas

### Tier 1 - Current Features
- ✅ User authentication with database
- ✅ SASS styling
- ✅ Admin panel
- ✅ Engagement features
- ✅ Leaderboard
- ✅ Analytics

### Tier 2 - Recommended Next
- Social features (friend requests, study groups)
- Notifications (email/SMS)
- Mobile app (React Native)
- Discussion forums
- Video explanations

### Tier 3 - Advanced
- Personalized learning paths
- AI-powered recommendations
- Mock interviews
- Certificate generation
- Payment integration

---

## 🐛 Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: 
- Ensure PostgreSQL is running
- Check `.env` database credentials
- Verify database exists

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: CORS is already enabled in `server.js`. If still issues:
```javascript
// In server.js
app.use(cors({
  origin: '*',
  credentials: true
}));
```

### JWT Token Invalid
```
Error: Invalid token
```
**Solution**:
- Check `JWT_SECRET` in `.env` matches server
- Ensure token is in correct header format
- Token might have expired (30 days)

### SCSS Not Compiling
```
Command 'sass' not found
```
**Solution**:
```bash
npm install -g sass
# or use npx
npx sass scss/main.scss public/css/main.css
```

---

## 📝 Common Workflows

### Adding a New Exam Category

1. **Add to database** (exam_types table if using)
2. **Update frontend** (index.html exam cards)
3. **Add questions** (via admin panel)
4. **Update API** (if needed in quiz.js)

### Creating New Achievements

1. Edit `db/schema.js` with achievement details
2. Add logic in `routes/quiz.js` (submitResult)
3. Update `achievements` table with new badge
4. Show on profile/leaderboard

### Customizing Styling

All styles are in `scss/` folder:
- Change colors in `_variables.scss`
- Modify layouts in `_layout.scss`
- Add new components with mixins
- Compile with: `npm run scss`

---

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [SASS Guide](https://sass-lang.com/guide)
- [Chart.js Docs](https://www.chartjs.org/)

---

## 🎓 Learning Path

1. **Week 1**: Setup & Authentication
2. **Week 2**: Quiz & Results
3. **Week 3**: Admin Panel & Analytics
4. **Week 4**: Engagement Features & Optimization
5. **Week 5+**: Mobile app & Advanced features

---

## 📞 Support

For issues:
1. Check `.env` configuration
2. Review browser console for errors
3. Check server logs in terminal
4. Verify all files are in correct paths

---

**Ready to launch! 🚀**

Last Updated: October 20, 2025
