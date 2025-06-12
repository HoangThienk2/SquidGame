#!/bin/bash

# Squid Game Deployment Script
# Server: 211.239.114.79
# User: ubuntu
# Password: psj 1212qwqw!!
# Root password: 1212qwqw@@

echo "🚀 Starting deployment..."

# Backup current project
echo "📦 Backing up current project..."
if [ -d "SquidGame" ]; then
    mv SquidGame SquidGame-backup-$(date +%Y%m%d-%H%M%S)
    echo "✅ Backup completed"
fi

# Extract new project
echo "📂 Extracting new project..."
tar -xzf SquidGame-updated.tar.gz
echo "✅ Project extracted"

# Go to project directory
cd SquidGame

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production
echo "✅ Dependencies installed"

# Stop existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node.*server" || echo "No existing processes found"
pm2 stop all || echo "No PM2 processes found"

# Start the server
echo "🚀 Starting server..."
pm2 start server.js --name "squidgame-server" || node server.js &

# Check status
echo "📊 Checking server status..."
sleep 3
pm2 status || ps aux | grep "node.*server"

echo "✅ Deployment completed!"
echo "🌐 Server should be running on the configured port"

# Test the API
echo "🧪 Testing API..."
curl -s http://localhost:3000/api/user/test_deploy_user | head -200

# Server configuration
SERVER_IP="211.239.114.79"
SERVER_USER="ubuntu"
SERVER_PASSWORD="psj 1212qwqw!!"
ROOT_PASSWORD="1212qwqw@@"
APP_NAME="squid-game"
APP_PORT="3000"
DOMAIN_PORT="80"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Preparing deployment package...${NC}"

# Create deployment package
rm -rf deploy-package
mkdir -p deploy-package

# Copy necessary files
cp -r public deploy-package/
cp -r api deploy-package/
cp -r src deploy-package/ 2>/dev/null || true
cp server.js deploy-package/
cp server-production.js deploy-package/
cp database.js deploy-package/
cp swagger.js deploy-package/
cp package.json deploy-package/
cp package-lock.json deploy-package/
cp .env.example deploy-package/
cp start-app.sh deploy-package/
cp README.md deploy-package/

# Create production environment file
cat > deploy-package/.env << EOF
PORT=${APP_PORT}
TELEGRAM_BOT_TOKEN=7734367102:AAEg7tQ7W7EPnwZoflk3wuAALK7ew03A7Rg
NODE_ENV=production
API_BASE_URL=http://${SERVER_IP}:${APP_PORT}
API_TIMEOUT=10000

# Database Configuration
MONGODB_URI=mongodb+srv://rjotnotinh16969:gv1Z8RDR1H4kZtBU@squidgame.0qujv8p.mongodb.net/squidgame?retryWrites=true&w=majority&appName=Squidgame
EOF

# Create deployment script for server
cat > deploy-package/server-setup.sh << 'EOF'
#!/bin/bash

echo "🚀 Setting up Squid Game on server..."

# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo apt install -y nginx

# Create application directory
sudo mkdir -p /var/www/squid-game
sudo chown -R ubuntu:ubuntu /var/www/squid-game

# Copy application files
cp -r * /var/www/squid-game/
cd /var/www/squid-game

# Install dependencies
npm install --production

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'squid-game',
    script: 'server-production.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOFPM2

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
sudo tee /etc/nginx/sites-available/squid-game << 'EOFNGINX'
server {
    listen 80;
    server_name _;

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
    }
}
EOFNGINX

# Enable the site
sudo ln -sf /etc/nginx/sites-available/squid-game /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 3000
sudo ufw --force enable

echo "✅ Squid Game deployment completed!"
echo "🌐 Access your game at: http://$(curl -s ifconfig.me)"
echo "📊 PM2 status: pm2 status"
echo "📝 PM2 logs: pm2 logs squid-game"
EOF

chmod +x deploy-package/server-setup.sh

# Create archive
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
tar -czf squid-game-deploy.tar.gz -C deploy-package .

echo -e "${GREEN}✅ Deployment package created: squid-game-deploy.tar.gz${NC}"
echo -e "${BLUE}📤 Ready to upload to server${NC}"

# Instructions for manual deployment
echo -e "${YELLOW}🔧 Manual Deployment Instructions:${NC}"
echo "1. Upload squid-game-deploy.tar.gz to your server"
echo "2. SSH to your server: ssh ubuntu@${SERVER_IP}"
echo "3. Extract: tar -xzf squid-game-deploy.tar.gz"
echo "4. Run setup: chmod +x server-setup.sh && ./server-setup.sh"
echo ""
echo -e "${GREEN}🎮 Your Squid Game will be available at: http://${SERVER_IP}${NC}"

# Clean up
rm -rf deploy-package

echo -e "${GREEN}🦑 Deployment package ready!${NC}" 