#!/bin/bash

echo "🆓 Deploying 99 Pancakes Analytics for Minimal Usage"
echo "=================================================="

# Check if git repo is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "📦 Committing changes..."
    git add .
    git commit -m "Ready for free minimal usage deployment"
fi

echo ""
echo "🎯 Deployment Options for Minimal Usage:"
echo "========================================"
echo ""
echo "1️⃣  Render (RECOMMENDED - Auto-sleep saves resources)"
echo "   • $0/month forever"
echo "   • Perfect for minimal daily usage"
echo "   • Auto-sleep after 15min inactivity"
echo ""
echo "2️⃣  Railway (Alternative - Always-on)"
echo "   • $5 monthly credit (covers minimal usage)"
echo "   • No sleep mode"
echo "   • Faster cold starts"
echo ""

read -p "Choose deployment method (1 for Render, 2 for Railway): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Render..."
        echo "========================"
        echo ""
        echo "Pushing to GitHub for Render auto-deployment..."
        git push origin main
        echo ""
        echo "✅ Code pushed successfully!"
        echo ""
        echo "🔗 Next Steps:"
        echo "1. Go to https://render.com"
        echo "2. Click 'New +' → 'Web Service'"
        echo "3. Connect your GitHub repository"
        echo "4. Click 'Deploy' (render.yaml will auto-configure)"
        echo ""
        echo "⏱️  Deployment will complete in ~5 minutes"
        echo "🌐 Your app will be available at: https://pancakes-analytics.onrender.com"
        echo ""
        echo "💡 Performance Notes:"
        echo "   • First load: 10-30 seconds (cold start)"
        echo "   • Subsequent loads: Instant"
        echo "   • Auto-sleeps after 15min inactivity (perfect for minimal usage)"
        ;;
    2)
        echo ""
        echo "🚀 Deploying to Railway..."
        echo "========================="
        echo ""
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo "📦 Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo "🔐 Login to Railway..."
        railway login
        
        echo "🔧 Initializing Railway project..."
        railway init
        
        echo "🐘 Adding PostgreSQL database..."
        railway add postgresql
        
        echo "🚀 Deploying application..."
        railway up
        
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "🔗 Get your app URL:"
        railway status
        echo ""
        echo "⚙️  Set environment variables:"
        echo "railway variables set JWT_SECRET=$(openssl rand -base64 32)"
        echo "railway variables set FRONTEND_URL=https://your-frontend-url.vercel.app"
        ;;
    *)
        echo "❌ Invalid choice. Please run script again and choose 1 or 2."
        exit 1
        ;;
esac

echo ""
echo "🎉 Your 99 Pancakes Analytics is deploying for FREE!"
echo ""
echo "📊 Perfect for Minimal Usage:"
echo "   • Morning sales entry: Fast wake-up"
echo "   • Evening reports: Always available"
echo "   • Zero ongoing costs"
echo "   • Professional HTTPS URLs"
echo ""
echo "📚 Complete guides available:"
echo "   • MINIMAL_USAGE_DEPLOYMENT.md"
echo "   • FREE_DEPLOYMENT_GUIDE.md"
echo "   • DEPLOYMENT_COMMANDS.md"
echo ""
echo "✨ Deploy with confidence - your bakery analytics are ready!"