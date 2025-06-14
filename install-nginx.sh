#!/bin/bash

echo "🔧 Installing and Configuring Nginx for younghee.squidminigame.com"
echo "=================================================================="

SERVER="211.239.114.79"
USER="psj"
DOMAIN="younghee.squidminigame.com"

echo "📦 Installing Nginx and Certbot..."
ssh $USER@$SERVER << 'EOF'
# Update package list
sudo apt update

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx --no-pager -l

# Create sites-available and sites-enabled directories if they don't exist
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Check if main nginx.conf includes sites-enabled
if ! grep -q "sites-enabled" /etc/nginx/nginx.conf; then
    echo "Adding sites-enabled to nginx.conf..."
    sudo sed -i '/http {/a\\tinclude /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
fi

echo "✅ Nginx installation complete"

# Create configuration for younghee.squidminigame.com
echo "🌐 Creating Nginx configuration..."
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

echo "✅ Nginx configuration created"

# Enable site
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/younghee.squidminigame.com /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    
    # Test HTTP
    echo "🌐 Testing HTTP..."
    curl -I http://localhost || echo "❌ Local HTTP test failed"
    
    echo "🌐 Testing domain HTTP..."
    curl -I http://younghee.squidminigame.com || echo "❌ Domain HTTP test failed"
    
    echo "📋 Basic setup complete!"
    echo "Now setting up SSL..."
    
    # Setup SSL
    echo "🔒 Setting up SSL certificate..."
    sudo certbot --nginx -d younghee.squidminigame.com -d www.younghee.squidminigame.com --non-interactive --agree-tos --email admin@squidminigame.com
    
    echo "🌐 Testing HTTPS..."
    curl -I https://younghee.squidminigame.com || echo "❌ HTTPS test failed"
    
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

echo "🎉 Complete setup finished!"
EOF

echo ""
echo "🎉 Nginx Installation and SSL Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. 🌐 Test: http://younghee.squidminigame.com"
echo "   2. 🌐 Test: https://younghee.squidminigame.com"
echo "   3. 🎮 Game should be accessible!" 