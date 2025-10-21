# Node.js Backend Setup - Install Node.js & PostgreSQL

## 🔧 Prerequisites Installation

### Windows PowerShell Command (Run as Administrator)

```powershell
# Install Node.js using Chocolatey (if you have it)
choco install nodejs

# Or download from https://nodejs.org/ and install manually

# Verify installation
node --version
npm --version
```

### Install PostgreSQL

1. Download from https://www.postgresql.org/download/
2. Run installer
3. Set password for `postgres` user
4. Remember this password for `.env` file
5. Select default port 5432
6. Install pgAdmin when prompted

### Verify PostgreSQL Running

```powershell
# Check if PostgreSQL service is running
Get-Service "postgresql-x64*"
```

---

## 📦 Project Setup in d:\web ui\

### 1. Open PowerShell
```powershell
cd "d:\web ui"
```

### 2. Install Node Packages
```powershell
npm install
```

This installs all dependencies from `package.json`:
- Express (web server)
- PostgreSQL driver
- JWT (authentication)
- CORS
- SASS compiler
- And more...

### 3. Create Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# Type password when prompted
# Inside PostgreSQL terminal, type:
CREATE DATABASE aptitude_hub;
```

### 4. Update `.env` File
Edit the `.env` file with your PostgreSQL password:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aptitude_hub
JWT_SECRET=your_secret_key_change_in_production
NODE_ENV=development
```

### 5. Compile SCSS to CSS
```powershell
npm run scss
```

### 6. Start the Server
```powershell
npm start
```

Server will run on http://localhost:5000

---

## 🎯 You're All Set!

Visit:
- Student App: http://localhost:5000
- Admin Panel: http://localhost:5000/admin

Enjoy your AptitudeHub platform! 🎓
