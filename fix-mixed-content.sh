#!/bin/bash

echo "🔒 Fixing Mixed Content - Setting up HTTPS"
echo "=========================================="

# Get domain name from user
read -p "🌐 Enter your domain name (e.g., squidgame.example.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Domain name is required!"
    exit 1
fi

echo "🔧 Setting up HTTPS for domain: $DOMAIN_NAME"

# SSH into server and setup HTTPS
ssh psj@211.239.114.79 << EOF
# Install Certbot if not installed
sudo apt update
sudo apt install -y certbot

# Stop current servers to free port 80
pm2 stop all

# Get SSL certificate
sudo certbot certonly --standalone --preferred-challenges http -d $DOMAIN_NAME --email admin@$DOMAIN_NAME --agree-tos --non-interactive

# Create HTTPS server configuration
cd SquidGame
cat > https-server.js << 'HTTPS_EOF'
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "https://HoangThienk2.github.io",
    "https://hoangthienk2.github.io",
    "https://$DOMAIN_NAME",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Import your existing routes
const { Database } = require("./database");
// Add your existing API routes here...

// SSL certificate paths
const privateKey = fs.readFileSync('/etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/$DOMAIN_NAME/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/$DOMAIN_NAME/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(3443, () => {
  console.log('🔒 HTTPS Server running on port 3443');
});

// Redirect HTTP to HTTPS
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(':3000', ':3443') + req.url });
  res.end();
}).listen(3000);

HTTPS_EOF

# Start HTTPS server
pm2 start https-server.js --name "squidgame-https"
pm2 save

echo "✅ HTTPS server started on port 3443"
echo "🌐 Your API is now available at: https://$DOMAIN_NAME:3443/api/"

EOF

echo "🎉 HTTPS setup completed!"
echo "📝 Now update your GitHub Pages to use: https://$DOMAIN_NAME:3443/api/" 