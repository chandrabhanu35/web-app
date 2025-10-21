# Security Audit Report - AptitudeHub

**Date:** October 20, 2025  
**Status:** ⚠️ CRITICAL VULNERABILITIES FOUND

---

## SQL Injection Risk Assessment

### Current Status: ✅ SAFE (Parameterized Queries Used)

Good News: Your code **already uses parameterized queries** (`$1, $2, $3` placeholders) which **prevents SQL injection**.

Example (SAFE):
```javascript
// ✅ SAFE - Uses parameterized query
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ DANGEROUS - Would allow SQL injection
const result = await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**All your routes use the safe method**, so SQL injection is NOT a risk.

---

## Critical Security Issues Found

### 1. ⚠️ CRITICAL: Missing Admin Authorization Check

**Location:** `routes/admin.js` - ALL endpoints

**Problem:**
```javascript
router.get('/users', verifyToken, async (req, res) => {
  // Only checks if user is logged in, NOT if they are admin!
  // Any authenticated user can access all admin endpoints
```

**Risk:** Any regular user who can log in can access:
- List all users
- View user details (password hashes, emails, etc.)
- View admin stats
- Potentially modify users

**Attack Scenario:**
1. Attacker signs up as regular user: `hacker@evil.com`
2. Calls `/api/admin/users` with their token
3. Gets list of ALL users including admin account
4. Potentially finds password hash patterns or exploits

**Fix:** Add admin verification
```javascript
// Check if user is actually admin before allowing access
const adminCheck = await pool.query(
  'SELECT role FROM admin_users WHERE user_id = $1 AND role = $2',
  [req.userId, 'admin']
);

if (adminCheck.rows.length === 0) {
  return res.status(403).json({ error: 'Admin access required' });
}
```

---

### 2. ⚠️ HIGH: Weak JWT Secret

**Location:** `routes/auth.js` line 10
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';
```

**Problem:**
- If `JWT_SECRET` env var is not set, it uses hardcoded weak default
- Default secret is visible in source code
- Attacker can forge tokens with known secret

**Risk:** Token forgery - attacker can create admin tokens without password

**Fix:** 
1. Set strong `JWT_SECRET` in `.env`:
```
JWT_SECRET=your_very_long_random_secret_key_min_32_chars_like_this_one_is_good
```

2. Fail if secret is weak (in production):
```javascript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your_secret_key_change_in_production') {
  throw new Error('JWT_SECRET must be set in .env with a strong value!');
}
```

---

### 3. ⚠️ HIGH: No Input Validation

**Location:** All routes

**Problem:** Minimal validation on user inputs
```javascript
// Only checks if fields exist, not what's in them
if (!name || !email || !mobile || !password) {
  return res.status(400).json({ error: 'All fields required' });
}
```

**Risk:** 
- XSS if data is rendered without sanitization
- NoSQL injection (less risk with PostgreSQL but still)
- Data corruption with extremely long inputs

**Examples of attacks:**
- Email: `<script>alert('hacked')</script>`
- Name: `" OR 1=1 --`  (though parameterized queries prevent SQL execution)
- Mobile: `1234567890123456789012345678901234567890`

---

### 4. ⚠️ HIGH: Incomplete Admin Check in Middleware

**Location:** `middleware/auth.js`
```javascript
export const verifyAdmin = async (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      // Check if user is admin (you can add admin verification from DB)
      next();  // ⚠️ PASSES WITHOUT ACTUALLY CHECKING IF ADMIN!
    });
  }
};
```

**Problem:** `verifyAdmin` doesn't actually verify admin status - comment admits this

**Risk:** Function is useless; any authenticated user bypasses it

---

### 5. ⚠️ MEDIUM: Exposure of Sensitive User Data

**Location:** `routes/admin.js` - `/users` endpoint
```javascript
res.json({ users: result.rows });  // Returns ALL user data including password hashes!
```

**Problem:** Response includes sensitive fields:
- `password_hash` - Hash can be cracked or leaked
- Personal data to unauthenticated endpoints

**Fix:** Only return safe fields:
```javascript
const safeUsers = result.rows.map(u => ({
  id: u.id,
  name: u.name,
  email: u.email,
  mobile: u.mobile,
  profile_pic: u.profile_pic,
  created_at: u.created_at,
  is_active: u.is_active
  // Don't include: password_hash, payment info, etc.
}));
```

---

### 6. ⚠️ MEDIUM: No Rate Limiting

**Problem:** Attackers can:
- Brute force login (try 10,000 passwords per second)
- Spam endpoints
- DOS attack

**Risk:** Account takeover via brute force

---

### 7. ⚠️ MEDIUM: CORS Allowing All Origins

**Location:** `server.js`
```javascript
app.use(cors());  // ⚠️ Allows requests from ANY domain!
```

**Problem:** Any malicious website can make requests to your API

**Fix:**
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'],
  credentials: true
}));
```

---

### 8. ⚠️ MEDIUM: No HTTPS Requirement

**Problem:** In production, all traffic should be encrypted (HTTPS)

**Risk:** Man-in-the-middle attacks, token interception

---

### 9. ⚠️ LOW: Passwords Not Hashed Universally

**Problem:** While auth.js hashes passwords, if anyone directly inserts to DB they're stored plain

---

### 10. ⚠️ LOW: No Audit Logging

**Problem:** No record of who accessed what admin functions

**Risk:** Can't detect attacks or investigate incidents

---

## Summary Table

| Issue | Severity | Fixable | Estimated Time |
|-------|----------|---------|-----------------|
| SQL Injection | ✅ Safe | N/A | 0 min |
| Missing Admin Check | 🔴 CRITICAL | Yes | 15 min |
| Weak JWT Secret | 🟠 HIGH | Yes | 5 min |
| No Input Validation | 🟠 HIGH | Yes | 30 min |
| Broken verifyAdmin | 🟠 HIGH | Yes | 10 min |
| Data Exposure | 🟠 HIGH | Yes | 20 min |
| No Rate Limiting | 🟡 MEDIUM | Yes | 45 min |
| CORS Too Open | 🟡 MEDIUM | Yes | 5 min |
| No HTTPS | 🟡 MEDIUM | Yes | Setup change |
| No Audit Logs | 🟡 MEDIUM | Yes | 60 min |

---

## What If You Go Live RIGHT NOW?

### Worst Case Scenario:
1. **Attacker signs up** as regular user
2. **Uses their token** to call `/api/admin/users`
3. **Gets all users** including admin email (`bhanu@aptitude.com`)
4. **Gets password hashes** for all 1000+ users
5. **Cracks weak passwords** using GPU cracking tools (hours to days)
6. **Gains admin access** with stolen/cracked password
7. **Deletes all user data** or steals it

### More Likely Scenario:
1. Attacker creates 100 fake accounts
2. Spams your server with requests
3. Brute forces weak user passwords
4. Accesses student test data
5. Modifies leaderboard or test results

---

## Immediate Actions Required (Before Going Live)

1. ✅ Add admin role verification to ALL `/api/admin/*` endpoints
2. ✅ Set strong JWT_SECRET in `.env`
3. ✅ Add input validation (email format, password strength, field length limits)
4. ✅ Fix `verifyAdmin` middleware to actually check admin_users table
5. ✅ Remove sensitive fields from API responses
6. ✅ Add rate limiting to auth endpoints
7. ✅ Restrict CORS to your domain only
8. ✅ Use HTTPS in production (not localhost)
9. ✅ Add admin action logging

---

## Code I Can Fix For You

I can immediately fix:
- ✅ Admin authorization checks
- ✅ Input validation layer
- ✅ Response field filtering
- ✅ Proper verifyAdmin middleware
- ✅ JWT secret enforcement
- ✅ Rate limiting
- ✅ CORS restrictions

Want me to apply these fixes now? Say "yes fix all" and I'll update all the vulnerable routes and files.
