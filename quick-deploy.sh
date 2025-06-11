#!/bin/bash

echo "🚀 Starting quick deployment to Squid Game server..."

# Kiểm tra xem có thay đổi gì không
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Nén project
echo "📦 Compressing project..."
tar -czf squid-game-updated.tar.gz --exclude='.git' --exclude='node_modules' --exclude='*.tar.gz' --exclude='.env' .

if [ $? -ne 0 ]; then
    echo "❌ Failed to compress project"
    exit 1
fi

echo "✅ Project compressed successfully ($(ls -lah squid-game-updated.tar.gz | awk '{print $5}'))"

# Upload lên server
echo "📤 Uploading to server..."
scp squid-game-updated.tar.gz psj@211.239.114.79:/home/psj/

if [ $? -ne 0 ]; then
    echo "❌ Failed to upload to server"
    exit 1
fi

echo "✅ Upload completed successfully"

# SSH và deploy
echo "🔧 Deploying on server..."
ssh psj@211.239.114.79 << 'ENDSSH'
echo "🔄 Running deployment script..."
./deploy-full-update.sh

if [ $? -eq 0 ]; then
    echo "🔄 Restarting application..."
    pm2 restart squid-game-3002 2>/dev/null || {
        echo "⚠️  PM2 restart failed, trying manual restart..."
        pkill -f "node.*3002" 2>/dev/null
        cd squid-game-3002
        nohup node server.js > server.log 2>&1 &
        echo "✅ Application restarted manually"
    }
    
    echo "✅ Checking application status..."
    sleep 3
    if netstat -tlnp 2>/dev/null | grep -q ":3002 "; then
        echo "🎉 Application is running on port 3002!"
    else
        echo "⚠️  Application might not be running on port 3002"
    fi
else
    echo "❌ Deployment failed!"
    exit 1
fi
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Your application should be available at: http://211.239.114.79:3002"
    echo ""
else
    echo "❌ Deployment failed on server"
    exit 1
fi

# Dọn dẹp file tạm
rm -f squid-game-updated.tar.gz
echo "🧹 Cleaned up temporary files" 