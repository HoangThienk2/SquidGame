#!/bin/bash

# Upload Script for younghee.squidminigame.com
echo "📤 Uploading files to server..."

SERVER="211.239.114.79"
USER="root"  # Change this if you use a different user
APP_DIR="/var/www/squidgame"

echo "🎯 Target: $USER@$SERVER:$APP_DIR"

# Create directory on server
echo "📁 Creating directory on server..."
ssh $USER@$SERVER "mkdir -p $APP_DIR"

# Upload files using rsync (excludes node_modules and .git)
echo "📤 Uploading files..."
rsync -avz --progress \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=*.log \
  --exclude=.DS_Store \
  . $USER@$SERVER:$APP_DIR/

echo "✅ Files uploaded successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. SSH to server: ssh $USER@$SERVER"
echo "2. Go to app directory: cd $APP_DIR"
echo "3. Run deployment: ./deploy-ssl.sh"
echo ""
echo "Or run this command to do it all:"
echo "ssh $USER@$SERVER 'cd $APP_DIR && chmod +x deploy-ssl.sh && ./deploy-ssl.sh'" 