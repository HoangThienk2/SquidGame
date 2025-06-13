#!/bin/bash

echo "🌐 Setting up FREE SSL with Let's Encrypt"
echo "=========================================="

SERVER_IP="211.239.114.79"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 STEP 1: Get a FREE DOMAIN${NC}"
echo "Choose one of these FREE domain services:"
echo "1. 🌍 Freenom (freenom.com) - .tk, .ml, .ga, .cf domains"
echo "2. 🔗 No-IP (noip.com) - Free subdomain"
echo "3. 🦆 DuckDNS (duckdns.org) - Free subdomain"
echo "4. ☁️  Cloudflare (cloudflare.com) - Free subdomain + SSL"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT: You need to register a domain first!${NC}"
echo "Example domains you can get for FREE:"
echo "• yourgame.tk (from Freenom)"
echo "• yourgame.ddns.net (from No-IP)"
echo "• yourgame.duckdns.org (from DuckDNS)"
echo ""

read -p "Enter your FREE domain name (e.g., yourgame.tk): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}❌ Domain name is required!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 STEP 2: Setup DNS${NC}"
echo "Point your domain to server IP: $SERVER_IP"
echo "• A Record: $DOMAIN_NAME → $SERVER_IP"
echo "• CNAME Record: www.$DOMAIN_NAME → $DOMAIN_NAME"
echo ""

read -p "Have you configured DNS? (y/n): " DNS_CONFIGURED

if [ "$DNS_CONFIGURED" != "y" ]; then
    echo -e "${YELLOW}⚠️  Please configure DNS first, then run this script again${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 STEP 3: Install Certbot & Get SSL Certificate${NC}"

# Install Certbot and get SSL certificate
ssh psj@$SERVER_IP << EOF
    echo "🔧 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    
    echo "🔐 Getting SSL certificate for $DOMAIN_NAME..."
    sudo certbot certonly --standalone --preferred-challenges http -d $DOMAIN_NAME -d www.$DOMAIN_NAME --email admin@$DOMAIN_NAME --agree-tos --non-interactive
    
    echo "✅ SSL certificate obtained!"
    sudo ls -la /etc/letsencrypt/live/$DOMAIN_NAME/
EOF

echo ""
echo -e "${BLUE}📋 STEP 4: Create HTTPS Server with Real SSL${NC}"

# Create HTTPS server with real SSL certificate
ssh psj@$SERVER_IP << 'HTTPS_SETUP'
    cd SquidGame
    
    # Create production HTTPS server
    cat > https-production.js << 'HTTPS_PROD'
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Import the existing Express app
const app = require('./server.js');

// Get domain from environment or use default
const DOMAIN = process.env.DOMAIN || 'yourgame.tk';
const HTTP_PORT = 80;
const HTTPS_PORT = 443;

// SSL options with Let's Encrypt certificates
const sslOptions = {
    key: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`),
    cert: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`)
};

// Create HTTP server (redirect to HTTPS)
const httpServer = http.createServer((req, res) => {
    res.writeHead(301, { 
        "Location": `https://${req.headers.host}${req.url}` 
    });
    res.end();
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start HTTP server (for redirect)
httpServer.listen(HTTP_PORT, () => {
    console.log(`🌐 HTTP Server running on port ${HTTP_PORT} (redirects to HTTPS)`);
});

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
    console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
    console.log(`🌐 Secure URL: https://${DOMAIN}`);
    console.log(`🌐 Secure URL with www: https://www.${DOMAIN}`);
});

// Handle errors
httpsServer.on('error', (err) => {
    console.error('❌ HTTPS Server error:', err);
});

httpServer.on('error', (err) => {
    console.error('❌ HTTP Server error:', err);
});
HTTPS_PROD

    echo "✅ Production HTTPS server created"
HTTPS_SETUP

echo ""
echo -e "${BLUE}📋 STEP 5: Start Production HTTPS Server${NC}"

# Stop old servers and start new production server
ssh psj@$SERVER_IP << EOF
    cd SquidGame
    
    # Stop old processes
    pm2 stop squidgame-https 2>/dev/null || true
    pm2 delete squidgame-https 2>/dev/null || true
    pm2 stop squidgame-server 2>/dev/null || true
    
    # Start production HTTPS server with domain
    DOMAIN=$DOMAIN_NAME pm2 start https-production.js --name squidgame-production
    
    # Save PM2 config
    pm2 save
    
    echo "✅ Production server started"
    pm2 status
EOF

echo ""
echo -e "${GREEN}🎉 FREE SSL SETUP COMPLETED!${NC}"
echo ""
echo -e "${GREEN}🌐 Your game is now available at:${NC}"
echo "   • https://$DOMAIN_NAME"
echo "   • https://www.$DOMAIN_NAME"
echo "   • http://$DOMAIN_NAME (redirects to HTTPS)"
echo ""
echo -e "${GREEN}🔍 Test your SSL:${NC}"
echo "   curl https://$DOMAIN_NAME/api/user/test_user"
echo ""
echo -e "${YELLOW}📝 Notes:${NC}"
echo "   • SSL certificate auto-renews every 90 days"
echo "   • HTTP traffic automatically redirects to HTTPS"
echo "   • Your game now has a professional domain!"
echo ""
echo -e "${BLUE}🔄 To renew SSL certificate manually:${NC}"
echo "   sudo certbot renew" 