#!/bin/bash

echo "🔧 Setting up Nginx for younghee.squidminigame.com"
echo "=================================================="

SERVER="211.239.114.79"
USER="psj"
DOMAIN="younghee.squidminigame.com"

echo "🌐 Creating Nginx configuration..."
ssh $USER@$SERVER << 'EOF'
# Create Nginx configuration for younghee.squidminigame.com
sudo tee /etc/nginx/sites-available/younghee.squidminigame.com > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/younghee.squidminigame.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/younghee.squidminigame.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

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

echo "✅ Nginx configuration created"

echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/younghee.squidminigame.com /etc/nginx/sites-enabled/

echo "🔍 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo "📊 Nginx status:"
    sudo systemctl status nginx --no-pager -l
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

echo "🔒 Installing SSL certificate with Certbot..."
sudo certbot --nginx -d younghee.squidminigame.com -d www.younghee.squidminigame.com --non-interactive --agree-tos --email admin@squidminigame.com

echo "🌐 Testing HTTPS..."
curl -I https://younghee.squidminigame.com || echo "❌ HTTPS test failed"

echo "📋 Setup complete!"
EOF

echo ""
echo "🎉 Nginx SSL Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. 🌐 Test: https://younghee.squidminigame.com"
echo "   2. 🔧 Update Telegram webhook if needed"
echo ""
echo "🔍 Monitor with:"
echo "   curl -I https://younghee.squidminigame.com" 