#!/bin/bash

echo "🔧 Setting up basic Nginx for younghee.squidminigame.com"
echo "======================================================="

SERVER="211.239.114.79"
USER="psj"
DOMAIN="younghee.squidminigame.com"

echo "🌐 Creating basic Nginx configuration (HTTP only first)..."
ssh $USER@$SERVER << 'EOF'
# Create basic Nginx configuration for younghee.squidminigame.com
sudo tee /etc/nginx/sites-available/younghee.squidminigame.com > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Webhook endpoint
    location /webhook {
        proxy_pass http://localhost:3000/webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
NGINXEOF

echo "✅ Basic Nginx configuration created"

echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/younghee.squidminigame.com /etc/nginx/sites-enabled/

echo "🔍 Testing Nginx configuration..."
sudo nginx -t

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "📊 Nginx status:"
sudo systemctl status nginx --no-pager -l

echo "🌐 Testing HTTP..."
curl -I http://younghee.squidminigame.com || echo "❌ HTTP test failed"

echo "📋 Basic setup complete!"
echo "Now you can run: sudo certbot --nginx -d younghee.squidminigame.com"
EOF

echo ""
echo "🎉 Basic Nginx Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. 🌐 Test: http://younghee.squidminigame.com"
echo "   2. 🔒 Run SSL setup manually on server:"
echo "      ssh psj@211.239.114.79"
echo "      sudo certbot --nginx -d younghee.squidminigame.com -d www.younghee.squidminigame.com"
echo "   3. 🌐 Test: https://younghee.squidminigame.com" 