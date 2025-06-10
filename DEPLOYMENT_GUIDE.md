# 🦑 Squid Game Deployment Guide

## Server Information

- **IP**: 211.239.114.79
- **User**: ubuntu
- **Password**: psj 1212qwqw!!
- **Root Password**: 1212qwqw@@

## Quick Deployment Steps

### Step 1: Prepare Deployment Package

```bash
# Run this on your local machine
./deploy.sh
```

### Step 2: Upload to Server

```bash
# Upload the deployment package
scp squid-game-deploy.tar.gz ubuntu@211.239.114.79:~/
```

### Step 3: Connect to Server

```bash
ssh ubuntu@211.239.114.79
# Password: psj 1212qwqw!!
```

### Step 4: Deploy on Server

```bash
# Extract the deployment package
tar -xzf squid-game-deploy.tar.gz

# Run the setup script
chmod +x server-setup.sh
./server-setup.sh
```

## Manual Server Setup (if automated script fails)

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 18.x

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PM2 and Nginx

```bash
sudo npm install -g pm2
sudo apt install -y nginx
```

### 4. Setup Application Directory

```bash
sudo mkdir -p /var/www/squid-game
sudo chown -R ubuntu:ubuntu /var/www/squid-game
cp -r * /var/www/squid-game/
cd /var/www/squid-game
```

### 5. Install Dependencies

```bash
npm install --production
```

### 6. Create PM2 Configuration

```bash
cat > ecosystem.config.js << 'EOF'
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
EOF
```

### 7. Start Application

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/squid-game << 'EOF'
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
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/squid-game /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 9. Configure Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 3000
sudo ufw --force enable
```

## Useful Commands

### Check Application Status

```bash
pm2 status
pm2 logs squid-game
```

### Restart Application

```bash
pm2 restart squid-game
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
```

### View Application Logs

```bash
pm2 logs squid-game --lines 100
```

### Update Application

```bash
# Stop current application
pm2 stop squid-game

# Upload new files and extract
# Then restart
pm2 start squid-game
```

## Access Your Game

Once deployed, your Squid Game will be available at:
**http://211.239.114.79**

## Troubleshooting

### If Port 3000 is blocked

```bash
sudo ufw allow 3000
```

### If Nginx fails to start

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### If PM2 process dies

```bash
pm2 restart squid-game
pm2 logs squid-game
```

### Check if application is running

```bash
curl http://localhost:3000
netstat -tlnp | grep 3000
```

## Environment Configuration

The deployment uses these environment variables:

- `PORT=3000`
- `NODE_ENV=production`
- `API_BASE_URL=http://211.239.114.79:3000`
- MongoDB connection string (already configured)
- Telegram Bot Token (already configured)

## Security Notes

- Firewall is configured to allow only necessary ports (22, 80, 3000)
- Application runs under the ubuntu user (not root)
- PM2 manages the application process with auto-restart
- Nginx acts as a reverse proxy for better security and performance
