@echo off
REM Stellar NFT Marketplace Deployment Script for Windows
echo 🚀 Stellar NFT Marketplace - Vercel Deployment Script
echo ==================================================

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Vercel:
    vercel login
    if %errorlevel% neq 0 (
        echo ❌ Vercel login failed!
        pause
        exit /b 1
    )
)

REM Build the project
echo 🔨 Building project...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Deploy to Vercel
echo 📦 Deploying to Vercel...
vercel --prod

if %errorlevel% equ 0 (
    echo 🎉 Deployment successful!
    echo 🌐 Your NFT marketplace is now live!
) else (
    echo ❌ Deployment failed. Please check the errors above.
    pause
    exit /b 1
)

pause
