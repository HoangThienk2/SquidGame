# 🦑 DEPLOY SQUID GAME NGAY BÂY GIỜ

## Bước 1: Upload file lên server

Mở Terminal/Command Prompt và chạy lệnh này:

```bash
scp squid-game-deploy.tar.gz ubuntu@211.239.114.79:~/
```

**Nhập mật khẩu khi được hỏi**: `psj 1212qwqw!!`

## Bước 2: Kết nối vào server

```bash
ssh ubuntu@211.239.114.79
```

**Nhập mật khẩu**: `psj 1212qwqw!!`

## Bước 3: Deploy trên server

Sau khi đã kết nối vào server, chạy các lệnh sau:

```bash
# Giải nén file
tar -xzf squid-game-deploy.tar.gz

# Chạy script cài đặt
chmod +x server-setup.sh
./server-setup.sh
```

## Bước 4: Kiểm tra kết quả

Sau khi script chạy xong, game sẽ có sẵn tại:
**http://211.239.114.79**

## Nếu có lỗi, chạy thủ công:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài PM2 và Nginx
sudo npm install -g pm2
sudo apt install -y nginx

# Tạo thư mục ứng dụng
sudo mkdir -p /var/www/squid-game
sudo chown -R ubuntu:ubuntu /var/www/squid-game

# Copy files
cp -r * /var/www/squid-game/
cd /var/www/squid-game

# Cài dependencies
npm install --production

# Tạo PM2 config
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

# Khởi động ứng dụng
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Cấu hình Nginx
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

# Kích hoạt site
sudo ln -sf /etc/nginx/sites-available/squid-game /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Cấu hình firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 3000
sudo ufw --force enable
```

## ✅ HOÀN THÀNH!

Game của bạn sẽ có sẵn tại: **http://211.239.114.79**

## Lệnh quản lý hữu ích:

```bash
# Kiểm tra trạng thái
pm2 status

# Xem logs
pm2 logs squid-game

# Khởi động lại
pm2 restart squid-game
```
