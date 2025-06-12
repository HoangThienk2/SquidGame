#!/bin/bash

echo "🔒 SSL Setup Script for SquidGame Server"
echo "========================================"

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Usage: $0 <domain-name>"
    echo "Example: $0 squidgame.yourdomain.com"
    echo ""
    echo "⚠️  Note: You need a domain name pointing to 211.239.114.79"
    echo "   You cannot use SSL with just IP address (211.239.114.79)"
    exit 1
fi

DOMAIN=$1
SERVER_IP="211.239.114.79"

echo "🌐 Domain: $DOMAIN"
echo "🖥️  Server IP: $SERVER_IP"
echo ""

# Step 1: Install Certbot and Nginx
echo "📦 Installing required packages..."
ssh psj@$SERVER_IP << EOF
    # Update system
    sudo apt update
    
    # Install Nginx and Certbot
    sudo apt install -y nginx certbot python3-certbot-nginx
    
    # Check if Nginx is running
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    echo "✅ Nginx and Certbot installed"
EOF

# Step 2: Configure Nginx as reverse proxy
echo "🔧 Configuring Nginx..."
ssh psj@$SERVER_IP << EOF
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_CONFIG

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    if [ \$? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "✅ Nginx configured successfully"
    else
        echo "❌ Nginx configuration error"
        exit 1
    fi
EOF

# Step 3: Get SSL certificate
echo "🔒 Getting SSL certificate..."
ssh psj@$SERVER_IP << EOF
    # Get SSL certificate
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    if [ \$? -eq 0 ]; then
        echo "✅ SSL certificate obtained successfully"
        
        # Set up auto-renewal
        sudo systemctl enable certbot.timer
        sudo systemctl start certbot.timer
        
        echo "✅ Auto-renewal configured"
    else
        echo "❌ Failed to get SSL certificate"
        echo "Make sure $DOMAIN points to $SERVER_IP"
        exit 1
    fi
EOF

echo ""
echo "🎉 SSL Setup Completed!"
echo "🌐 Your secure URL: https://$DOMAIN"
echo "🔒 HTTP will automatically redirect to HTTPS"
echo ""
echo "📋 Next steps:"
echo "1. Update your Telegram bot webhook to use HTTPS URL"
echo "2. Test the secure connection: curl https://$DOMAIN/api/user/test_user" 