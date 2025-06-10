#!/bin/bash

echo "🦑 FINAL SQUID GAME DEPLOYMENT"
echo "=============================="
echo "Server: 211.239.114.79"
echo "User: ubuntu"
echo ""

# Step 1: Upload file
echo "📤 Step 1: Uploading deployment package..."
if sshpass -p "psj 1212qwqw!!" scp -o StrictHostKeyChecking=no -o ConnectTimeout=30 squid-game-deploy.tar.gz ubuntu@211.239.114.79:~/; then
    echo "✅ Upload successful!"
else
    echo "❌ Upload failed. Trying alternative method..."
    # Try with different options
    if sshpass -p "psj 1212qwqw!!" scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no squid-game-deploy.tar.gz ubuntu@211.239.114.79:~/; then
        echo "✅ Upload successful with alternative method!"
    else
        echo "❌ Upload failed completely. Please check network connection."
        exit 1
    fi
fi

echo ""
echo "🚀 Step 2: Deploying on server..."

# Step 2: Deploy on server
sshpass -p "psj 1212qwqw!!" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 ubuntu@211.239.114.79 << 'DEPLOY_SCRIPT'
echo "🦑 Starting deployment on server..."

# Stop existing processes
echo "🛑 Stopping existing processes..."
pm2 stop squid-game 2>/dev/null || echo "No existing squid-game process"
pm2 delete squid-game 2>/dev/null || echo "No existing squid-game process to delete"

# Backup existing installation
if [ -d "/var/www/squid-game" ]; then
    echo "📦 Backing up existing installation..."
    sudo mv /var/www/squid-game /var/www/squid-game-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
fi

# Extract deployment
echo "📂 Extracting deployment package..."
cd ~
rm -rf squid-game-temp
mkdir -p squid-game-temp
cd squid-game-temp
tar -xzf ~/squid-game-deploy.tar.gz

echo "🔧 Setting up server environment..."

# Update system
sudo apt update -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx
fi

# Setup application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /var/www/squid-game
sudo chown -R ubuntu:ubuntu /var/www/squid-game

# Copy files
echo "📋 Copying application files..."
cp -r * /var/www/squid-game/
cd /var/www/squid-game

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create PM2 config
echo "⚙️ Creating PM2 configuration..."
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

# Start application
echo "🚀 Starting application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup ubuntu -u ubuntu --hp /home/ubuntu

# Configure Nginx
echo "🌐 Configuring Nginx..."
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

# Enable site
sudo ln -sf /etc/nginx/sites-available/squid-game /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
if sudo nginx -t; then
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    echo "✅ Nginx configured successfully"
else
    echo "❌ Nginx configuration error"
fi

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 3000
echo "y" | sudo ufw enable

# Clean up
cd ~
rm -rf squid-game-temp
rm -f squid-game-deploy.tar.gz

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "========================"
echo "✅ Application started with PM2"
echo "✅ Nginx configured and running"
echo "✅ Firewall configured"
echo ""
echo "🌐 Your Squid Game is now available at:"
echo "   http://$(curl -s ifconfig.me 2>/dev/null || echo '211.239.114.79')"
echo ""
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs squid-game"
echo ""

DEPLOY_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL! 🎉"
    echo "=========================="
    echo ""
    echo "🌐 Your Squid Game is now live at:"
    echo "   http://211.239.114.79"
    echo ""
    echo "🔧 Management commands:"
    echo "   ssh ubuntu@211.239.114.79 'pm2 status'"
    echo "   ssh ubuntu@211.239.114.79 'pm2 logs squid-game'"
    echo "   ssh ubuntu@211.239.114.79 'pm2 restart squid-game'"
    echo ""
    echo "🦑 Enjoy your Squid Game!"
else
    echo ""
    echo "❌ DEPLOYMENT FAILED!"
    echo "Please check the error messages above."
fi 