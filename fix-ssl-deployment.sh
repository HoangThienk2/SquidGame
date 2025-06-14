#!/bin/bash

echo "🔧 Fixing SSL Deployment - younghee.squidminigame.com"
echo "=================================================="

SERVER="211.239.114.79"
USER="psj"
APP_NAME="squidgame-ssl"

echo "🧹 Cleaning up PM2 instances..."
ssh $USER@$SERVER << 'EOF'
    echo "🛑 Stopping all younghee-squidgame instances..."
    pm2 delete younghee-squidgame 2>/dev/null || true
    
    echo "🧹 Cleaning PM2 process list..."
    pm2 kill
    pm2 resurrect
    
    echo "📂 Going to SSL deployment directory..."
    cd ~/SquidGame-SSL
    
    echo "🚀 Starting single SSL instance..."
    # Start with a single instance first
    pm2 start server.js --name $APP_NAME --env production
    pm2 save
    
    echo "✅ SSL instance started successfully!"
    echo "📊 Current PM2 status:"
    pm2 status
    
    echo ""
    echo "🌐 Testing local connection..."
    curl -s http://localhost:3000/health || echo "❌ Health check failed"
    
    echo ""
    echo "📋 SSL Setup Status:"
    echo "   - Application: ✅ Running on port 3000"
    echo "   - PM2 Instance: $APP_NAME"
    echo "   - Domain: younghee.squidminigame.com"
    echo "   - SSL: ⏳ Waiting for certificate activation"
EOF

echo ""
echo "🎉 SSL Deployment Fixed!"
echo ""
echo "📋 Next Steps:"
echo "   1. ⏳ Wait for SSL certificate to be activated (few hours)"
echo "   2. 🌐 Test: https://younghee.squidminigame.com"
echo "   3. 🔧 If Nginx needs configuration, run manually on server:"
echo "      sudo nano /etc/nginx/sites-available/younghee.squidminigame.com"
echo ""
echo "🔍 Monitoring:"
echo "   - Check status: ssh $USER@$SERVER 'pm2 status'"
echo "   - View logs: ssh $USER@$SERVER 'pm2 logs $APP_NAME'"
echo "   - Test health: ssh $USER@$SERVER 'curl http://localhost:3000/health'" 