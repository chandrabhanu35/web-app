@echo off
REM Quick Start Script for AptitudeHub

echo.
echo ====================================
echo   AptitudeHub - Quick Start
echo ====================================
echo.

cd /d D:\web ui

REM Step 1: Start Database
echo [1/4] Starting PostgreSQL Database...
call npm run docker:up
echo ✅ Database started

REM Wait for database
echo.
echo [2/4] Waiting for database to be ready (10 seconds)...
timeout /t 10 /nobreak

REM Step 2: Migrate Database
echo.
echo [3/4] Initializing database schema...
call npm run migrate

REM Step 3: Seed Questions
echo.
echo [4/4] Seeding balanced questions...
call npm run seed:improved

echo.
echo ====================================
echo   Setup Complete! 
echo ====================================
echo.
echo Starting application...
echo.
call npm run dev

pause
