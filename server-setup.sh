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
