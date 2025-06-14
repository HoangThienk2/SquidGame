# 📋 Manual Deployment Steps for younghee.squidminigame.com

## Step 1: Upload Files to Server

### Option A: Using SCP (Secure Copy)

```bash
# From your local machine, upload all files to server
scp -r * root@211.239.114.79:/var/www/squidgame/

# Or if using a different user:
scp -r * username@211.239.114.79:/var/www/squidgame/
```

### Option B: Using SFTP

```bash
sftp root@211.239.114.79
put -r * /var/www/squidgame/
exit
```

### Option C: Using rsync (Recommended)

```bash
rsync -avz --progress * root@211.239.114.79:/var/www/squidgame/
```

## Step 2: SSH to Server and Deploy

```bash
# SSH to your server
ssh root@211.239.114.79

# Navigate to app directory
cd /var/www/squidgame

# Make deployment script executable
chmod +x deploy-ssl.sh

# Run deployment (this will work on the server)
./deploy-ssl.sh
```

## Step 3: Alternative - Manual Setup on Server

If you prefer to set up manually:

```bash
# SSH to server
ssh root@211.239.114.79

# Create directory
mkdir -p /var/www/squidgame
cd /var/www/squidgame

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install dependencies
npm install --production

# Set up environment
cp .env.production .env

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Step 4: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/younghee.squidminigame.com

# Add this configuration:
server {
    listen 80;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;

    # SSL Configuration (certificates should be set up by hosting provider)
    ssl_certificate /etc/ssl/certs/younghee.squidminigame.com.crt;
    ssl_certificate_key /etc/ssl/private/younghee.squidminigame.com.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable the site
ln -s /etc/nginx/sites-available/younghee.squidminigame.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Step 5: Configure Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Step 6: Test Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs younghee-squidgame

# Test health endpoint
curl http://localhost:3000/health
```

## 🔍 Verification

After SSL is active:

- Visit: `https://younghee.squidminigame.com`
- Health check: `https://younghee.squidminigame.com/health`
- Update Telegram webhook to: `https://younghee.squidminigame.com/webhook`
