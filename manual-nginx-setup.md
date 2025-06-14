# Manual Nginx Setup for younghee.squidminigame.com

## 🔧 Step 1: SSH to Server

```bash
ssh psj@211.239.114.79
```

## 🌐 Step 2: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/younghee.squidminigame.com
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;

    # Proxy to Node.js app
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
        proxy_read_timeout 86400;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Webhook endpoint
    location /webhook {
        proxy_pass http://localhost:3000/webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

## 🔗 Step 3: Enable Site

```bash
sudo ln -sf /etc/nginx/sites-available/younghee.squidminigame.com /etc/nginx/sites-enabled/
```

## 🔍 Step 4: Test Configuration

```bash
sudo nginx -t
```

## 🔄 Step 5: Reload Nginx

```bash
sudo systemctl reload nginx
```

## 🌐 Step 6: Test HTTP

```bash
curl -I http://younghee.squidminigame.com
```

## 🔒 Step 7: Setup SSL Certificate

```bash
sudo certbot --nginx -d younghee.squidminigame.com -d www.younghee.squidminigame.com
```

## ✅ Step 8: Test HTTPS

```bash
curl -I https://younghee.squidminigame.com
```

## 📊 Step 9: Check Status

```bash
sudo systemctl status nginx
pm2 status
```

## 🎯 Expected Results:

- HTTP: `http://younghee.squidminigame.com` should work
- HTTPS: `https://younghee.squidminigame.com` should work after SSL setup
- Game should load properly with all features

## 🔍 Troubleshooting:

If something doesn't work:

```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check app logs
pm2 logs squidgame-ssl

# Check what's running on port 3000
curl http://localhost:3000/health
```
