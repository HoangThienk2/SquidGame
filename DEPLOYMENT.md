# 🚀 Deployment Guide for younghee.squidminigame.com

## Current Status

- ✅ Game running on: `http://211.239.114.79:3000/`
- 🎯 Target domain: `https://younghee.squidminigame.com`
- ⏳ SSL certificate: Being set up (few hours wait)

## 📋 Prerequisites

- Ubuntu/Debian server with root access
- Node.js 18+ installed
- Nginx installed
- SSL certificate configured by hosting provider

## 🔧 Quick Deployment

### Option 1: Automated Deployment

```bash
# Run the automated deployment script
npm run deploy
```

### Option 2: Manual Deployment

#### Step 1: Upload Files to Server

```bash
# Upload all files to your server
scp -r * user@211.239.114.79:/var/www/squidgame/
```

#### Step 2: Install Dependencies

```bash
ssh user@211.239.114.79
cd /var/www/squidgame
npm install --production
```

#### Step 3: Set Environment

```bash
cp .env.production .env
```

#### Step 4: Start with PM2

```bash
npm run pm2:start
```

## 🌐 Nginx Configuration

The deployment script will create this Nginx configuration:

```nginx
server {
    listen 80;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;

    # SSL Configuration (set up by hosting provider)
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
```

## 🔒 SSL Certificate Setup

Since your hosting provider is setting up SSL, ensure:

1. **Certificate files are in the correct location:**

   - Certificate: `/etc/ssl/certs/younghee.squidminigame.com.crt`
   - Private Key: `/etc/ssl/private/younghee.squidminigame.com.key`

2. **DNS is pointing to your server:**
   - `younghee.squidminigame.com` → `211.239.114.79`
   - `www.younghee.squidminigame.com` → `211.239.114.79`

## 📱 Telegram Bot Configuration

After SSL is active, update your Telegram bot webhook:

```bash
curl -X POST "https://api.telegram.org/bot7734367102:AAEg7tQ7W7EPnwZoflk3wuAALK7ew03A7Rg/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://younghee.squidminigame.com/webhook"}'
```

## 🛠️ Management Commands

```bash
# Check application status
pm2 status

# View logs
npm run pm2:logs

# Restart application
npm run pm2:restart

# Stop application
npm run pm2:stop

# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t
```

## 🔍 Testing

### 1. Health Check

```bash
curl https://younghee.squidminigame.com/health
```

### 2. Game Access

- Open: `https://younghee.squidminigame.com`
- Should redirect HTTP to HTTPS automatically

### 3. Telegram Integration

- Test bot commands in Telegram
- Verify webhook is receiving updates

## 🚨 Troubleshooting

### SSL Issues

```bash
# Check SSL certificate
openssl x509 -in /etc/ssl/certs/younghee.squidminigame.com.crt -text -noout

# Test SSL connection
openssl s_client -connect younghee.squidminigame.com:443
```

### Application Issues

```bash
# Check logs
tail -f /var/log/squidgame.log

# Check PM2 status
pm2 monit
```

### Nginx Issues

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx configuration
sudo nginx -s reload
```

## 📊 Monitoring

- **Application logs:** `/var/log/squidgame.log`
- **Nginx logs:** `/var/log/nginx/access.log`
- **PM2 monitoring:** `pm2 monit`

## 🔄 Updates

To update the application:

```bash
# Pull new code
git pull origin main

# Restart application
npm run pm2:restart
```

---

## 📞 Support

If you encounter any issues during deployment, check:

1. SSL certificate is properly installed
2. DNS is pointing to the correct server
3. Firewall allows ports 80 and 443
4. Node.js application is running on port 3000
5. Nginx is properly configured and running
