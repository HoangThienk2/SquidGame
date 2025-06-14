#!/bin/bash

echo "🚀 SSL Domain Deploy Script - younghee.squidminigame.com"
echo "========================================================"

# Configuration
SERVER="211.239.114.79"
USER="psj"  # Using same user as existing script
DOMAIN="younghee.squidminigame.com"
APP_NAME="squidgame-ssl"

# Step 1: Create archive
echo "📦 Creating archive..."
rm -f SquidGame-SSL.tar.gz
tar -czf SquidGame-SSL.tar.gz --exclude=node_modules --exclude=.git --exclude="*.log" --exclude="*.tar.gz" .

if [ $? -eq 0 ]; then
    echo "✅ Archive created successfully"
else
    echo "❌ Failed to create archive"
    exit 1
fi

# Step 2: Upload to server
echo "📤 Uploading to server..."
scp SquidGame-SSL.tar.gz $USER@$SERVER:~/

if [ $? -eq 0 ]; then
    echo "✅ Upload successful"
else
    echo "❌ Upload failed"
    exit 1
fi

# Step 3: Deploy on server with SSL configuration
echo "🔄 Deploying on server with SSL..."
ssh $USER@$SERVER << EOF
    echo "📂 Setting up SSL deployment directory..."
    mkdir -p SquidGame-SSL
    
    echo "📦 Extracting new version..."
    tar -xzf SquidGame-SSL.tar.gz -C SquidGame-SSL/
    
    cd SquidGame-SSL
    
    echo "📦 Installing dependencies..."
    npm install --production
    
    echo "⚙️ Setting up environment..."
    cp .env.production .env
    
    echo "🔄 Starting/Restarting SSL server..."
    # Stop existing SSL instance if running
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start new instance
    pm2 start ecosystem.config.js --env production --name $APP_NAME
    pm2 save
    
    echo "🌐 Setting up Nginx for SSL domain..."
    # Create Nginx config if it doesn't exist
    if [ ! -f /etc/nginx/sites-available/$DOMAIN ]; then
        sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration (will be set up by hosting provider)
    ssl_certificate /etc/ssl/certs/$DOMAIN.crt;
    ssl_certificate_key /etc/ssl/private/$DOMAIN.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_EOF
        
        # Enable the site
        sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        echo "✅ Nginx configuration created"
    else
        echo "ℹ️ Nginx configuration already exists"
    fi
    
    echo "✅ SSL Deployment completed!"
    echo "🌐 Server status:"
    pm2 status $APP_NAME
    
    echo ""
    echo "📋 SSL Domain Setup Status:"
    echo "   - Application: ✅ Running on port 3000"
    echo "   - Nginx: ✅ Configured for SSL"
    echo "   - Domain: $DOMAIN"
    echo "   - SSL: ⏳ Waiting for certificate activation"
EOF

echo ""
echo "🎉 SSL Deploy completed!"
echo "📋 Next Steps:"
echo "   1. ⏳ Wait for SSL certificate to be activated (few hours)"
echo "   2. 🌐 Test: https://$DOMAIN"
echo "   3. 📱 Update Telegram webhook:"
echo "      curl -X POST \"https://api.telegram.org/bot7734367102:AAEg7tQ7W7EPnwZoflk3wuAALK7ew03A7Rg/setWebhook\" \\"
echo "           -H \"Content-Type: application/json\" \\"
echo "           -d '{\"url\": \"https://$DOMAIN/webhook\"}'"
echo ""
echo "🔍 Monitoring:"
echo "   - Check status: ssh $USER@$SERVER 'pm2 status $APP_NAME'"
echo "   - View logs: ssh $USER@$SERVER 'pm2 logs $APP_NAME'"
echo "   - Current game: http://$SERVER:3000 (still running)" 