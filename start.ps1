# AptitudeHub - Quick Start PowerShell Script

Write-Host "`n" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  AptitudeHub - Quick Start" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`n"

# Navigate to project directory
Set-Location "D:\web ui"

# Step 1: Start Database
Write-Host "[1/5] Starting PostgreSQL Database..." -ForegroundColor Yellow
npm run docker:up
Write-Host "✅ Database started" -ForegroundColor Green

# Wait for database
Write-Host "`n[2/5] Waiting for database to be ready (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 2: Check database connection
Write-Host "`n[3/5] Initializing database schema..." -ForegroundColor Yellow
npm run migrate
Write-Host "✅ Database schema ready" -ForegroundColor Green

# Step 3: Seed balanced questions
Write-Host "`n[4/5] Seeding balanced questions..." -ForegroundColor Yellow
npm run seed:improved
Write-Host "✅ Questions seeded" -ForegroundColor Green

# Step 4: Start server
Write-Host "`n[5/5] Starting application..." -ForegroundColor Yellow
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`n📍 Access the app at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📊 Admin panel at: http://localhost:5000/admin" -ForegroundColor Cyan
Write-Host "`n"

npm run dev
