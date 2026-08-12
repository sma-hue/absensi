#!/bin/bash
# Vercel Deployment Helper Script
# Usage: chmod +x deploy-vercel.sh && ./deploy-vercel.sh

set -e  # Exit on error

echo "🚀 Absensi System - Vercel Deployment Helper"
echo "=============================================="
echo ""

# Check prerequisites
echo "✅ Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

echo "✅ Git, Node.js, and npm are installed"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Initialize Git (if needed)
echo "🔧 Setting up Git repository..."
if [ ! -d .git ]; then
    echo "   Initializing Git repository..."
    git init
    git add .
    git commit -m "feat: Complete NFC + Face Recognition absensi system v1.0.0"
    echo "✅ Git repository initialized"
else
    echo "   Git repository already exists"
    echo "   Current status:"
    git status --short
fi
echo ""

# Step 3: Deployment options
echo "📤 Vercel Deployment Options:"
echo "================================"
echo ""
echo "Option 1: Deploy via Web Interface (Recommended)"
echo "  1. Go to https://vercel.com"
echo "  2. Login or Sign Up"
echo "  3. Click 'Add New' → 'Project'"
echo "  4. Import from GitHub"
echo "  5. Select this repository"
echo "  6. Click 'Deploy'"
echo ""
echo "Option 2: Deploy via Vercel CLI"
echo "  1. npm install -g vercel"
echo "  2. vercel login"
echo "  3. vercel --prod"
echo ""
echo "================================"
echo ""

# Step 4: Ask which option
read -p "Choose deployment method (1 or 2)? [1]: " deploy_choice
deploy_choice=${deploy_choice:-1}

if [ "$deploy_choice" = "2" ]; then
    # Deploy via CLI
    echo ""
    echo "🚀 Starting Vercel CLI deployment..."
    echo ""
    
    if ! command -v vercel &> /dev/null; then
        echo "📥 Installing Vercel CLI globally..."
        npm install -g vercel
    fi
    
    echo ""
    echo "Please login to Vercel when prompted..."
    vercel login
    
    echo ""
    echo "🚀 Deploying to production..."
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo "   Check your Vercel dashboard for the production URL"
else
    # Guide for web deployment
    echo ""
    echo "✅ Ready for Web Deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Visit https://vercel.com and login/signup"
    echo "2. Click 'Add New' → 'Project'"
    echo "3. Select 'Import Git Repository'"
    echo "4. Paste your GitHub repository URL"
    echo "5. Select Framework: Node.js"
    echo "6. Click 'Deploy'"
    echo ""
    echo "Your GitHub URL should be:"
    echo "  https://github.com/YOUR_USERNAME/absensi.git"
    echo ""
fi

echo ""
echo "📝 Important Post-Deployment:"
echo "  1. Change default admin password (admin/admin123)"
echo "  2. Test NFC scanning functionality"
echo "  3. Enroll student/teacher face photos"
echo "  4. Setup database backups"
echo "  5. Monitor application errors"
echo ""

echo "🎉 Deployment setup complete!"
echo ""
echo "📚 More information:"
echo "  - QUICKSTART.md    : User guide"
echo "  - DEPLOYMENT.md    : Detailed deployment guide"
echo "  - README.md        : Full documentation"
echo ""
