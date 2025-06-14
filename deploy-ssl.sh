#!/bin/bash

# Deployment Script for younghee.squidminigame.com with SSL
echo "🚀 Starting deployment for younghee.squidminigame.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="younghee.squidminigame.com"
APP_DIR="/var/www/squidgame"
SERVICE_NAME="squidgame"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "   Domain: ${GREEN}$DOMAIN${NC}"
echo -e "   App Directory: ${GREEN}$APP_DIR${NC}"
echo -e "   Service: ${GREEN}$SERVICE_NAME${NC}"
echo ""

# Step 1: Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Step 3: Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    sudo npm install -g pm2
fi

# Step 4: Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Step 5: Copy application files
echo -e "${YELLOW}📋 Copying application files...${NC}"
cp -r * $APP_DIR/
cd $APP_DIR

# Step 6: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Step 7: Set up environment
echo -e "${YELLOW}⚙️ Setting up environment...${NC}"
cp .env.production .env

# Step 8: Set up Nginx (if not already configured)
echo -e "${YELLOW}🌐 Setting up Nginx configuration...${NC}"
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration (certificates should be set up by hosting provider)
    ssl_certificate /etc/ssl/certs/$DOMAIN.crt;
    ssl_certificate_key /etc/ssl/private/$DOMAIN.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

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
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Step 9: Set up PM2 ecosystem
echo -e "${YELLOW}⚙️ Setting up PM2 ecosystem...${NC}"
tee ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/squidgame-error.log',
    out_file: '/var/log/squidgame-out.log',
    log_file: '/var/log/squidgame.log',
    time: true
  }]
};
EOF

# Step 10: Start the application
echo -e "${YELLOW}🚀 Starting the application...${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Step 11: Set up firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "   1. Wait for SSL certificate to be activated (few hours)"
echo -e "   2. Update DNS to point $DOMAIN to this server"
echo -e "   3. Test the application at https://$DOMAIN"
echo -e "   4. Update Telegram bot webhook to https://$DOMAIN/webhook"
echo ""
echo -e "${YELLOW}📊 Useful Commands:${NC}"
echo -e "   Check status: ${GREEN}pm2 status${NC}"
echo -e "   View logs: ${GREEN}pm2 logs $SERVICE_NAME${NC}"
echo -e "   Restart app: ${GREEN}pm2 restart $SERVICE_NAME${NC}"
echo -e "   Check Nginx: ${GREEN}sudo nginx -t${NC}"
echo "" 