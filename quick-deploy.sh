#!/bin/bash

echo "🚀 Quick Deploy Script - SquidGame"
echo "=================================="

# Step 1: Create archive
echo "📦 Creating archive..."
rm -f SquidGame-updated.tar.gz
tar -czf SquidGame-updated.tar.gz --exclude=node_modules --exclude=.git --exclude="*.log" --exclude="SquidGame-updated.tar.gz" .

if [ $? -eq 0 ]; then
    echo "✅ Archive created successfully"
else
    echo "❌ Failed to create archive"
    exit 1
fi

# Step 2: Upload to server
echo "📤 Uploading to server..."
scp SquidGame-updated.tar.gz psj@211.239.114.79:~/

if [ $? -eq 0 ]; then
    echo "✅ Upload successful"
else
    echo "❌ Upload failed"
    exit 1
fi

# Step 3: Deploy on server
echo "🔄 Deploying on server..."
ssh psj@211.239.114.79 << 'EOF'
    echo "📂 Backing up current version..."
    cp -r SquidGame SquidGame-backup-$(date +%Y%m%d-%H%M%S)
    
    echo "📦 Extracting new version..."
    tar -xzf SquidGame-updated.tar.gz -C SquidGame/
    
    echo "🔄 Restarting server..."
    pm2 restart squidgame-main
    
    echo "✅ Deployment completed!"
    echo "🌐 Server status:"
    pm2 status squidgame-main
EOF

echo ""
echo "🎉 Deploy completed!"
echo "🌐 Game URL: http://211.239.114.79:3000"
echo "🔍 API Test: curl http://211.239.114.79:3000/api/user/test_user" 