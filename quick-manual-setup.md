# Quick Manual Setup for younghee.squidminigame.com

## 🚀 Quick Commands (Run on server):

```bash
# SSH to server
ssh psj@211.239.114.79

# Install Nginx
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Create directories
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# Create config file
sudo tee /etc/nginx/sites-available/younghee.squidminigame.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name younghee.squidminigame.com www.younghee.squidminigame.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/younghee.squidminigame.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d younghee.squidminigame.com

# Test
curl -I https://younghee.squidminigame.com
```

## ✅ Expected Result:

- `https://younghee.squidminigame.com` should work
- Game should load with all features
