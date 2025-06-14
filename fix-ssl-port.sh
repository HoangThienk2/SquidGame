#!/bin/bash

echo "🔧 Fixing SSL Port Configuration"
echo "================================="

SERVER="211.239.114.79"
USER="psj"

echo "🔧 Updating .env file to use port 3000..."
ssh $USER@$SERVER << 'EOF'
cd /home/psj/SquidGame-SSL

echo "📝 Backing up current .env..."
cp .env .env.backup

echo "🔧 Updating .env file..."
cat > .env << 'ENVEOF'
# Production Environment Configuration for younghee.squidminigame.com
NODE_ENV=production
PORT=3000

# Domain Configuration
DOMAIN=younghee.squidminigame.com
API_BASE_URL=https://younghee.squidminigame.com
WEBHOOK_URL=https://younghee.squidminigame.com/webhook

# SSL Configuration (handled by Nginx)
SSL_ENABLED=false
FORCE_HTTPS=false

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=7734367102:AAEg7tQ7W7EPnwZoflk3wuAALK7ew03A7Rg

# Database Configuration
MONGODB_URI=mongodb+srv://rjotnotinh16969:gv1Z8RDR1H4kZtBU@squidgame.0qujv8p.mongodb.net/squidgame?retryWrites=true&w=majority&appName=Squidgame
DB_NAME=squidgame

# Security Configuration
CORS_ORIGINS=https://younghee.squidminigame.com,https://www.younghee.squidminigame.com

# Rate Limiting
API_RATE_LIMIT=300
SYNC_RATE_LIMIT=50

# Logging
LOG_LEVEL=info
ENVEOF

echo "✅ Updated .env file:"
cat .env

echo "🔄 Restarting SSL app..."
pm2 restart squidgame-ssl

echo "⏳ Waiting for restart..."
sleep 3

echo "📊 PM2 Status:"
pm2 status

echo "🌐 Testing local connection on port 3000..."
curl -s http://localhost:3000/health || echo "❌ Health check failed"

echo "🔍 Checking what's running on port 3000..."
netstat -tlnp | grep :3000 || echo "Nothing on port 3000"

echo "📋 App should now be running on port 3000!"
EOF

echo ""
echo "🎉 SSL Port Configuration Fixed!"
echo ""
echo "📋 Next Steps:"
echo "   1. 🌐 Test: curl http://211.239.114.79:3000/health"
echo "   2. 🔧 Configure Nginx to proxy HTTPS to port 3000"
echo "   3. 🌐 Test: https://younghee.squidminigame.com"
echo ""
echo "🔍 Monitor with:"
echo "   ssh psj@211.239.114.79 'pm2 logs squidgame-ssl'" 