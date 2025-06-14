#!/bin/bash

echo "🔧 Complete SSL Reset - younghee.squidminigame.com"
echo "=================================================="

SERVER="211.239.114.79"
USER="psj"
DOMAIN="younghee.squidminigame.com"

echo "🧹 Complete PM2 cleanup and SSL restart..."
ssh $USER@$SERVER << 'EOF'
echo "🛑 Stopping ALL PM2 processes..."
pm2 stop all
pm2 delete all

echo "🧹 Killing any remaining processes on port 3000..."
sudo pkill -f "node.*server.js" || true
sudo lsof -ti:3000 | xargs sudo kill -9 || true

echo "📂 Checking SSL directory..."
cd /home/psj/SquidGame-SSL
ls -la

echo "🚀 Starting SINGLE SSL instance..."
pm2 start server.js --name "squidgame-ssl" --env production

echo "⏳ Waiting for startup..."
sleep 5

echo "📊 PM2 Status:"
pm2 status

echo "🌐 Testing local connection..."
curl -s http://localhost:3000/health || echo "❌ Health check failed"

echo "🔍 Checking what's running on port 3000..."
sudo netstat -tlnp | grep :3000 || echo "Nothing on port 3000"

echo "📋 SSL Setup Complete!"
EOF

echo ""
echo "🎉 SSL Reset Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. ⏳ Wait for SSL certificate activation"
echo "   2. 🌐 Test: https://younghee.squidminigame.com"
echo "   3. 🔧 Update Telegram webhook if needed"
echo ""
echo "🔍 Monitor with:"
echo "   ssh psj@211.239.114.79 'pm2 status'"
echo "   ssh psj@211.239.114.79 'pm2 logs squidgame-ssl'" 