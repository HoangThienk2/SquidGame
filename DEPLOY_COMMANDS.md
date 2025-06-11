# 🚀 HƯỚNG DẪN DEPLOY SQUID GAME

## 📋 CÁC LỆNH CẦN THIẾT CHO MỖI LẦN DEPLOY

### 1. 📦 NÉN PROJECT (Trên máy local)

```bash
# Di chuyển vào thư mục project
cd /path/to/your/SquidGame

# Nén toàn bộ project (loại trừ các file không cần thiết)
tar -czf squid-game-updated.tar.gz --exclude='.git' --exclude='node_modules' --exclude='*.tar.gz' --exclude='.env' .

# Kiểm tra file đã tạo
ls -lah squid-game-updated.tar.gz
```

### 2. 📤 UPLOAD LÊN SERVER

```bash
# Upload file nén lên server
scp squid-game-updated.tar.gz psj@211.239.114.79:/home/psj/

# Upload script deployment (chỉ cần làm 1 lần đầu)
scp deploy-full-update.sh psj@211.239.114.79:/home/psj/
```

### 3. 🔧 DEPLOY TRÊN SERVER

```bash
# SSH vào server
ssh psj@211.239.114.79

# Cấp quyền thực thi cho script (chỉ cần làm 1 lần đầu)
chmod +x deploy-full-update.sh

# Chạy deployment
./deploy-full-update.sh
```

### 4. 🔄 RESTART APPLICATION

```bash
# Nếu dùng PM2
pm2 restart squid-game-3002

# Hoặc nếu dùng node trực tiếp
pkill -f "node.*3002"
cd squid-game-3002
nohup node server.js > server.log 2>&1 &

# Hoặc nếu có script start
cd squid-game-3002
./start-app.sh
```

### 5. ✅ KIỂM TRA

```bash
# Kiểm tra ứng dụng có chạy không
ps aux | grep node

# Kiểm tra port 3002
netstat -tlnp | grep 3002

# Test truy cập
curl http://localhost:3002
```

---

## 🔥 LỆNH NHANH CHO CÁC LẦN SAU

### Trên máy local:

```bash
# Nén và upload một lệnh
tar -czf squid-game-updated.tar.gz --exclude='.git' --exclude='node_modules' --exclude='*.tar.gz' --exclude='.env' . && scp squid-game-updated.tar.gz psj@211.239.114.79:/home/psj/
```

### Trên server:

```bash
# Deploy và restart một lệnh
./deploy-full-update.sh && pm2 restart squid-game-3002
```

---

## 📝 SCRIPT TỰ ĐỘNG HÓA

### Tạo script deploy nhanh trên máy local:

```bash
# Tạo file quick-deploy.sh
cat > quick-deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting quick deployment..."

# Nén project
echo "📦 Compressing project..."
tar -czf squid-game-updated.tar.gz --exclude='.git' --exclude='node_modules' --exclude='*.tar.gz' --exclude='.env' .

# Upload lên server
echo "📤 Uploading to server..."
scp squid-game-updated.tar.gz psj@211.239.114.79:/home/psj/

# SSH và deploy
echo "🔧 Deploying on server..."
ssh psj@211.239.114.79 << 'ENDSSH'
./deploy-full-update.sh
pm2 restart squid-game-3002 2>/dev/null || echo "PM2 restart failed, please restart manually"
ENDSSH

echo "✅ Deployment completed!"
EOF

# Cấp quyền thực thi
chmod +x quick-deploy.sh
```

### Sử dụng script tự động:

```bash
# Chỉ cần chạy 1 lệnh
./quick-deploy.sh
```

---

## 🛠️ TROUBLESHOOTING

### Nếu deployment thất bại:

```bash
# Kiểm tra backup
ls -la /home/psj/squid-game-3002-backup-*

# Restore backup thủ công
mv squid-game-3002-backup-YYYYMMDD_HHMMSS squid-game-3002
```

### Nếu port bị chiếm:

```bash
# Tìm process đang dùng port 3002
lsof -i :3002

# Kill process
kill -9 PID_NUMBER
```

### Kiểm tra logs:

```bash
# PM2 logs
pm2 logs squid-game-3002

# Hoặc logs thủ công
tail -f squid-game-3002/server.log
```

---

## 📋 CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Code đã test trên local
- [ ] Đã commit/save tất cả thay đổi
- [ ] Kiểm tra file .env trên server
- [ ] Backup database (nếu có)
- [ ] Thông báo user về maintenance (nếu cần)

---

## 🎯 TÓM TẮT LỆNH QUAN TRỌNG

```bash
# 1. NÉN PROJECT
tar -czf squid-game-updated.tar.gz --exclude='.git' --exclude='node_modules' --exclude='*.tar.gz' --exclude='.env' .

# 2. UPLOAD
scp squid-game-updated.tar.gz psj@211.239.114.79:/home/psj/

# 3. DEPLOY
ssh psj@211.239.114.79
./deploy-full-update.sh

# 4. RESTART
pm2 restart squid-game-3002
```
