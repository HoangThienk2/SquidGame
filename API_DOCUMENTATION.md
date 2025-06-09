# 🎮 Squid Game API Documentation

## 📋 Tổng quan

API này cho phép truy xuất và cập nhật thông tin game của người chơi dựa trên Telegram User ID.

## 🔗 Base URL

```
https://squid-game-m29i-123.vercel.app
```

## 📊 API Endpoints

### 1. Lấy thông tin người chơi

```http
GET /api/user/{telegramUserId}
```

**Mô tả:** Lấy tất cả thông tin game của người chơi theo Telegram User ID

**Response:**

```json
{
  "success": true,
  "data": {
    "telegramUserId": "123456789",
    "level": 5,
    "hp": 85,
    "maxHP": 100,
    "ruby": 1250, // Số ruby (hiển thị trên đầu)
    "coins": 340, // Coins hiện tại trong session
    "totalCoins": 1590, // Tổng coins đã kiếm được
    "lastRecover": 1703123456789,
    "lastZeroHP": null,
    "createdAt": "2023-12-21T10:30:00.000Z",
    "updatedAt": "2023-12-21T15:45:00.000Z"
  }
}
```

### 2. Cập nhật thông tin người chơi

```http
POST /api/user/{telegramUserId}
```

**Body:**

```json
{
  "level": 6,
  "hp": 90,
  "coinCount": 1300,
  "coinEarn": 50,
  "totalCoins": 1650
}
```

**Response:**

```json
{
  "success": true,
  "message": "User data updated successfully",
  "data": {
    "telegramUserId": "123456789",
    "level": 6,
    "hp": 90,
    "maxHP": 100,
    "ruby": 1300,
    "coins": 50,
    "totalCoins": 1650,
    "updatedAt": "2023-12-21T15:50:00.000Z"
  }
}
```

### 3. Đồng bộ trạng thái game

```http
POST /api/sync/{telegramUserId}
```

**Mô tả:** Tự động đồng bộ trạng thái game từ client

**Body:**

```json
{
  "level": 5,
  "hp": 85,
  "coinCount": 1250,
  "coinEarn": 340,
  "lastRecover": 1703123456789,
  "lastZeroHP": null
}
```

### 4. Bảng xếp hạng

```http
GET /api/leaderboard?limit=10&sortBy=level
```

**Parameters:**

- `limit` (optional): Số lượng người chơi trả về (mặc định: 10)
- `sortBy` (optional): Sắp xếp theo (`level`, `totalCoins`, `ruby`) (mặc định: `level`)

**Response:**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "telegramUserId": "123456789",
        "level": 15,
        "ruby": 5000,
        "totalCoins": 12500,
        "updatedAt": "2023-12-21T15:45:00.000Z"
      }
    ],
    "sortBy": "level",
    "totalPlayers": 150
  }
}
```

### 5. Thống kê game

```http
GET /api/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalPlayers": 150,
    "totalCoinsEarned": 125000,
    "totalRubyCoins": 45000,
    "averageLevel": 3.5,
    "maxLevel": 15,
    "activePlayers": 85
  }
}
```

## 🔧 Cách sử dụng

### JavaScript Example:

```javascript
// Lấy thông tin người chơi
async function getUserData(telegramUserId) {
  const response = await fetch(`/api/user/${telegramUserId}`);
  const data = await response.json();
  return data;
}

// Cập nhật điểm số
async function updateUserScore(telegramUserId, newData) {
  const response = await fetch(`/api/user/${telegramUserId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newData),
  });
  return await response.json();
}

// Lấy bảng xếp hạng
async function getLeaderboard() {
  const response = await fetch("/api/leaderboard?limit=20&sortBy=level");
  const data = await response.json();
  return data.data.leaderboard;
}
```

### cURL Examples:

```bash
# Lấy thông tin người chơi
curl -X GET "https://squid-game-m29i-123.vercel.app/api/user/123456789"

# Cập nhật thông tin
curl -X POST "https://squid-game-m29i-123.vercel.app/api/user/123456789" \
  -H "Content-Type: application/json" \
  -d '{"level": 6, "hp": 90, "coinCount": 1300}'

# Lấy bảng xếp hạng
curl -X GET "https://squid-game-m29i-123.vercel.app/api/leaderboard?limit=10"
```

## 🎯 Tích hợp với Telegram

Game tự động:

1. Lấy Telegram User ID từ URL hoặc Telegram WebApp
2. Tải dữ liệu từ server khi khởi động
3. Tự động đồng bộ khi có thay đổi
4. Lưu backup trong localStorage

## 📱 Telegram Bot Integration

Bot tự động thêm User ID vào URL:

- `https://your-domain.com/?userId=123456789`

## 🔒 Bảo mật

- Chỉ cho phép cập nhật các trường được phép
- Validate dữ liệu đầu vào
- Rate limiting (có thể thêm sau)

## 💾 Lưu trữ dữ liệu

Hiện tại sử dụng in-memory storage. Trong production nên chuyển sang:

- MongoDB
- PostgreSQL
- Redis (cho cache)

## 🚀 Deployment

API đã được deploy và sẵn sàng sử dụng tại:

```
https://squid-game-m29i-123.vercel.app
```
