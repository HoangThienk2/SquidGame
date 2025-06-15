#!/bin/bash

echo "🚀 Deploying to younghee.squidminigame.com (SSL Domain)"
echo "====================================================="

SERVER="211.239.114.79"
USER="psj"
DOMAIN="younghee.squidminigame.com"
APP_NAME="squidgame-ssl"
DEPLOY_DIR="SquidGame-SSL"

# Step 1: Create archive
echo "📦 Creating deployment archive..."
if [ -f "SquidGame-Younghee.tar.gz" ]; then
    rm SquidGame-Younghee.tar.gz
    echo "🗑️  Removed existing archive"
fi

tar -czf SquidGame-Younghee.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.tar.gz' \
    --exclude='.DS_Store' \
    --exclude='deploy-*.sh' \
    --exclude='fix-*.sh' \
    --exclude='setup-*.sh' \
    --exclude='complete-*.sh' \
    --exclude='install-*.sh' \
    --exclude='*.md' \
    .

if [ $? -eq 0 ]; then
    echo "✅ Archive created successfully: SquidGame-Younghee.tar.gz"
else
    echo "❌ Failed to create archive"
    exit 1
fi

# Step 2: Upload to server
echo "📤 Uploading to server..."
scp SquidGame-Younghee.tar.gz $USER@$SERVER:~/

if [ $? -eq 0 ]; then
    echo "✅ Upload successful"
else
    echo "❌ Upload failed"
    exit 1
fi

# Step 3: Deploy on server
echo "🚀 Deploying on server..."
ssh $USER@$SERVER << EOF
echo "📂 Backing up current version..."
if [ -d "/home/psj/$DEPLOY_DIR" ]; then
    cp -r /home/psj/$DEPLOY_DIR /home/psj/$DEPLOY_DIR-backup-\$(date +%Y%m%d-%H%M%S)
    echo "✅ Backup created"
fi

echo "📦 Extracting new version..."
mkdir -p /home/psj/$DEPLOY_DIR
cd /home/psj/$DEPLOY_DIR
tar -xzf ~/SquidGame-Younghee.tar.gz

echo "📝 Setting up environment..."
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

echo "📦 Installing dependencies..."
npm install --production

echo "🔄 Restarting application..."
pm2 restart $APP_NAME || pm2 start server.js --name $APP_NAME

echo "⏳ Waiting for startup..."
sleep 3

echo "📊 PM2 Status:"
pm2 status

echo "🌐 Testing application..."
curl -s http://localhost:3000/health || echo "❌ Health check failed"

echo "🌐 Testing domain..."
curl -I https://$DOMAIN || echo "❌ Domain test failed"

echo "🧹 Cleaning up..."
rm ~/SquidGame-Younghee.tar.gz

echo "✅ Deployment completed!"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment to younghee.squidminigame.com completed successfully!"
    echo ""
    echo "🌐 Your game is now live at:"
    echo "   https://younghee.squidminigame.com"
    echo ""
    echo "📊 Check status:"
    echo "   ssh $USER@$SERVER 'pm2 status'"
    echo "   ssh $USER@$SERVER 'pm2 logs $APP_NAME'"
else
    echo "❌ Deployment failed"
    exit 1
fi 