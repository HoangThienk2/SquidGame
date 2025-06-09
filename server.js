const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const { Database } = require("./database");
const { swaggerUi, specs } = require("./swagger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Telegram Bot without polling (use webhook for production)
const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN ||
    "7734367102:AAEg7tQ7W7EPnwZoflk3wuAALK7ew03A7Rg"
);

// Initialize Database
const db = new Database();

// In-memory fallback database (if MongoDB fails)
const gameDatabase = new Map();

// Helper function to get or create user data (with fallback)
async function getUserData(telegramUserId) {
  try {
    if (db.isConnected) {
      // Use MongoDB
      const user = await db.getUserData(telegramUserId);
      return {
        telegramUserId: user.telegramUserId,
        level: user.level,
        hp: user.hp,
        maxHP: user.maxHP,
        coinCount: user.coinCount,
        coinEarn: user.coinEarn,
        totalCoins: user.totalCoins,
        lastRecover: user.lastRecover,
        lastZeroHP: user.lastZeroHP,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } else {
      // Fallback to in-memory
      if (!gameDatabase.has(telegramUserId)) {
        gameDatabase.set(telegramUserId, {
          telegramUserId: telegramUserId,
          level: 1,
          hp: 100,
          maxHP: 100,
          coinCount: 0,
          coinEarn: 0,
          totalCoins: 0,
          lastRecover: Date.now(),
          lastZeroHP: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return gameDatabase.get(telegramUserId);
    }
  } catch (error) {
    console.error("❌ Error in getUserData:", error);
    // Fallback to in-memory on error
    if (!gameDatabase.has(telegramUserId)) {
      gameDatabase.set(telegramUserId, {
        telegramUserId: telegramUserId,
        level: 1,
        hp: 100,
        maxHP: 100,
        coinCount: 0,
        coinEarn: 0,
        totalCoins: 0,
        lastRecover: Date.now(),
        lastZeroHP: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return gameDatabase.get(telegramUserId);
  }
}

// Helper function to update user data (with fallback)
async function updateUserData(telegramUserId, updateData) {
  try {
    if (db.isConnected) {
      // Use MongoDB
      const user = await db.updateUserData(telegramUserId, updateData);
      return {
        telegramUserId: user.telegramUserId,
        level: user.level,
        hp: user.hp,
        maxHP: user.maxHP,
        coinCount: user.coinCount,
        coinEarn: user.coinEarn,
        totalCoins: user.totalCoins,
        lastRecover: user.lastRecover,
        lastZeroHP: user.lastZeroHP,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } else {
      // Fallback to in-memory
      const userData = await getUserData(telegramUserId);
      const updatedData = {
        ...userData,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      gameDatabase.set(telegramUserId, updatedData);
      return updatedData;
    }
  } catch (error) {
    console.error("❌ Error in updateUserData:", error);
    // Fallback to in-memory on error
    const userData = await getUserData(telegramUserId);
    const updatedData = {
      ...userData,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    gameDatabase.set(telegramUserId, updatedData);
    return updatedData;
  }
}

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Thumbnail endpoint for game preview
app.get("/thumbnail", (req, res) => {
  const thumbnailPath = path.join(__dirname, "public/images/thumbnail.png");
  res.sendFile(thumbnailPath, (err) => {
    if (err) {
      // Fallback to SVG if PNG doesn't exist
      const svgPath = path.join(__dirname, "public/images/thumbnail.svg");
      res.sendFile(svgPath, (err2) => {
        if (err2) {
          res.status(404).json({ error: "Thumbnail not found" });
        }
      });
    }
  });
});

// Generate thumbnail endpoint
app.get("/generate-thumbnail", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Squid Game Thumbnail</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        #thumbnail { border: 2px solid #333; }
        .info { margin-top: 10px; }
    </style>
</head>
<body>
    <h2>🦑 Squid Game Thumbnail Generator</h2>
    <canvas id="thumbnail" width="475" height="220"></canvas>
    <div class="info">
        <p><strong>Size:</strong> 475 x 220 px</p>
        <button onclick="downloadThumbnail()" style="padding: 10px 20px; font-size: 16px; background: #FF6B6B; color: white; border: none; border-radius: 5px; cursor: pointer;">
            📥 Download PNG
        </button>
    </div>
    
    <script>
        const canvas = document.getElementById('thumbnail');
        const ctx = canvas.getContext('2d');
        
        // Create gradient background (Squid Game colors)
        const gradient = ctx.createLinearGradient(0, 0, 475, 220);
        gradient.addColorStop(0, '#FF6B6B');  // Pink/Red
        gradient.addColorStop(0.3, '#FF8E8E');
        gradient.addColorStop(0.7, '#4ECDC4'); // Teal
        gradient.addColorStop(1, '#45B7D1');   // Blue
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 475, 220);
        
        // Add dark overlay for better text visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, 475, 220);
        
        // Add game title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('🦑 SQUID GAME', 237.5, 70);
        
        ctx.font = 'bold 28px Arial';
        ctx.fillText('MINI APP', 237.5, 110);
        
        // Add character info
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFD93D'; // Yellow
        ctx.fillText('👩 Yeonghee Game', 237.5, 150);
        
        // Add call to action
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('🎮 TAP TO PLAY!', 237.5, 185);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        function downloadThumbnail() {
            const link = document.createElement('a');
            link.download = 'squid-game-thumbnail.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Show success message
            alert('✅ Thumbnail downloaded successfully!\\n\\nSize: 475 x 220 px\\nFormat: PNG');
        }
        
        // Auto-generate message
        console.log('🎨 Thumbnail generated successfully!');
        console.log('📏 Size: 475 x 220 pixels');
        console.log('🎯 Ready for Telegram Mini App');
    </script>
</body>
</html>
  `);
});

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Squid Game API Documentation",
  })
);

// Character-specific routes
app.get("/yeonghee", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/cheolsu", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Main page - fallback to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Webhook endpoint for Telegram
app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// =====================
// NEW API ENDPOINTS FOR GAME DATA
// =====================

/**
 * @swagger
 * /api/user/{telegramUserId}:
 *   get:
 *     summary: Lấy thông tin người chơi
 *     description: Lấy tất cả thông tin game của người chơi theo Telegram User ID
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: telegramUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Telegram User ID
 *         example: "123456789"
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Thiếu Telegram User ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/user/:telegramUserId", async (req, res) => {
  try {
    const telegramUserId = req.params.telegramUserId;

    if (!telegramUserId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required",
      });
    }

    const userData = await getUserData(telegramUserId);

    res.json({
      success: true,
      data: {
        telegramUserId: userData.telegramUserId,
        level: userData.level,
        hp: userData.hp,
        maxHP: userData.maxHP,
        ruby: userData.coinCount, // Ruby coins (top display)
        coins: userData.coinEarn, // Current earning session
        totalCoins: userData.totalCoins, // Total coins earned
        lastRecover: userData.lastRecover,
        lastZeroHP: userData.lastZeroHP,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/user/{telegramUserId}:
 *   post:
 *     summary: Cập nhật thông tin người chơi
 *     description: Cập nhật dữ liệu game của người chơi
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: telegramUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Telegram User ID
 *         example: "123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *           example:
 *             level: 6
 *             hp: 90
 *             coinCount: 1300
 *             coinEarn: 50
 *             totalCoins: 1650
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User data updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/api/user/:telegramUserId", async (req, res) => {
  try {
    const telegramUserId = req.params.telegramUserId;
    const updateData = req.body;

    if (!telegramUserId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required",
      });
    }

    // Validate update data
    const allowedFields = [
      "level",
      "hp",
      "coinCount",
      "coinEarn",
      "totalCoins",
      "lastRecover",
      "lastZeroHP",
    ];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    const updatedUserData = await updateUserData(telegramUserId, filteredData);

    res.json({
      success: true,
      message: "User data updated successfully",
      data: {
        telegramUserId: updatedUserData.telegramUserId,
        level: updatedUserData.level,
        hp: updatedUserData.hp,
        maxHP: updatedUserData.maxHP,
        ruby: updatedUserData.coinCount,
        coins: updatedUserData.coinEarn,
        totalCoins: updatedUserData.totalCoins,
        updatedAt: updatedUserData.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/sync/{telegramUserId}:
 *   post:
 *     summary: Đồng bộ trạng thái game
 *     description: Tự động đồng bộ trạng thái game từ client
 *     tags: [Game Sync]
 *     parameters:
 *       - in: path
 *         name: telegramUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Telegram User ID
 *         example: "123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameSync'
 *           example:
 *             level: 5
 *             hp: 85
 *             coinCount: 1250
 *             coinEarn: 340
 *             lastRecover: 1703123456789
 *             lastZeroHP: null
 *     responses:
 *       200:
 *         description: Đồng bộ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Game state synced successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     telegramUserId:
 *                       type: string
 *                     level:
 *                       type: integer
 *                     hp:
 *                       type: integer
 *                     ruby:
 *                       type: integer
 *                     coins:
 *                       type: integer
 *                     totalCoins:
 *                       type: integer
 *                     syncedAt:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/api/sync/:telegramUserId", async (req, res) => {
  try {
    const telegramUserId = req.params.telegramUserId;
    const gameState = req.body;

    if (!telegramUserId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required",
      });
    }

    // Update user data with game state
    const syncData = {
      level: gameState.level || 1,
      hp: gameState.hp || 100,
      coinCount: gameState.coinCount || 0,
      coinEarn: gameState.coinEarn || 0,
      totalCoins: (gameState.coinCount || 0) + (gameState.coinEarn || 0),
      lastRecover: gameState.lastRecover || Date.now(),
      lastZeroHP: gameState.lastZeroHP || null,
    };

    const updatedUserData = await updateUserData(telegramUserId, syncData);

    res.json({
      success: true,
      message: "Game state synced successfully",
      data: {
        telegramUserId: updatedUserData.telegramUserId,
        level: updatedUserData.level,
        hp: updatedUserData.hp,
        ruby: updatedUserData.coinCount,
        coins: updatedUserData.coinEarn,
        totalCoins: updatedUserData.totalCoins,
        syncedAt: updatedUserData.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Lấy bảng xếp hạng
 *     description: Lấy danh sách top người chơi theo các tiêu chí khác nhau
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số lượng người chơi trả về
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [level, totalCoins, ruby]
 *           default: level
 *         description: Tiêu chí sắp xếp
 *         example: level
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaderboardEntry'
 *                     sortBy:
 *                       type: string
 *                       example: "level"
 *                     totalPlayers:
 *                       type: integer
 *                       example: 150
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "level"; // 'level', 'totalCoins', or 'ruby'

    let leaderboard;

    if (db.isConnected) {
      // Use MongoDB
      leaderboard = await db.getLeaderboard(limit, sortBy);
    } else {
      // Fallback to in-memory
      const allUsers = Array.from(gameDatabase.values());

      let sortedUsers;
      switch (sortBy) {
        case "totalCoins":
          sortedUsers = allUsers.sort((a, b) => b.totalCoins - a.totalCoins);
          break;
        case "ruby":
          sortedUsers = allUsers.sort((a, b) => b.coinCount - a.coinCount);
          break;
        case "level":
        default:
          sortedUsers = allUsers.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.totalCoins - a.totalCoins;
          });
          break;
      }

      leaderboard = sortedUsers.slice(0, limit).map((user, index) => ({
        rank: index + 1,
        telegramUserId: user.telegramUserId,
        level: user.level,
        ruby: user.coinCount,
        totalCoins: user.totalCoins,
        updatedAt: user.updatedAt,
      }));
    }

    res.json({
      success: true,
      data: {
        leaderboard: leaderboard,
        sortBy: sortBy,
        totalPlayers: db.isConnected
          ? (await db.getStats()).totalPlayers
          : gameDatabase.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Lấy thống kê game
 *     description: Lấy thống kê tổng quan về game và người chơi
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Stats'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/stats", async (req, res) => {
  try {
    let stats;

    if (db.isConnected) {
      // Use MongoDB
      stats = await db.getStats();
    } else {
      // Fallback to in-memory
      const allUsers = Array.from(gameDatabase.values());

      stats = {
        totalPlayers: allUsers.length,
        totalCoinsEarned: allUsers.reduce(
          (sum, user) => sum + user.totalCoins,
          0
        ),
        totalRubyCoins: allUsers.reduce((sum, user) => sum + user.coinCount, 0),
        averageLevel:
          allUsers.length > 0
            ? Math.round(
                (allUsers.reduce((sum, user) => sum + user.level, 0) /
                  allUsers.length) *
                  100
              ) / 100
            : 0,
        maxLevel:
          allUsers.length > 0
            ? Math.max(...allUsers.map((user) => user.level))
            : 0,
        activePlayers: allUsers.filter((user) => {
          const lastActive = new Date(user.updatedAt);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return lastActive > oneDayAgo;
        }).length,
      };
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/db-status:
 *   get:
 *     summary: Kiểm tra trạng thái database
 *     description: Kiểm tra kết nối MongoDB và trạng thái fallback
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     mongoConnected:
 *                       type: boolean
 *                       description: MongoDB có kết nối không
 *                       example: true
 *                     fallbackMode:
 *                       type: boolean
 *                       description: Có đang dùng fallback mode không
 *                       example: false
 *                     inMemoryUsers:
 *                       type: integer
 *                       description: Số user trong in-memory storage
 *                       example: 0
 */
app.get("/api/db-status", (req, res) => {
  res.json({
    success: true,
    data: {
      mongoConnected: db.isConnected,
      fallbackMode: !db.isConnected,
      inMemoryUsers: gameDatabase.size,
    },
  });
});

// =====================
// EXISTING API ROUTES (UPDATED)
// =====================

// Bot commands with character selection
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; // Get Telegram user ID
  const baseUrl =
    process.env.API_BASE_URL || "https://squid-game-m29i-123.vercel.app";

  // Initialize user data when they start the bot
  await getUserData(userId.toString());

  // Check for startapp parameter
  const startParam = msg.text.split(" ")[1]; // Get parameter after /start

  if (startParam === "yeonghee") {
    // Direct link to Yeonghee game
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎮 Play Yeonghee Game",
              web_app: { url: `${baseUrl}/?userId=${userId}` },
            },
          ],
        ],
      },
    };
    bot.sendMessage(chatId, "🦑 Welcome to Yeonghee Game!", options);
    return;
  }

  if (startParam === "cheolsu") {
    // Direct link to Cheolsu game
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎮 Play Cheolsu Game",
              web_app: {
                url: `https://squid-game2.vercel.app/?userId=${userId}`,
              },
            },
          ],
        ],
      },
    };
    bot.sendMessage(chatId, "🦑 Welcome to Cheolsu Game!", options);
    return;
  }

  // Default menu when no specific character is requested
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "👩 Play as Yeonghee",
            web_app: { url: `${baseUrl}/?userId=${userId}` },
          },
        ],
        [
          {
            text: "👨 Play as Cheolsu",
            web_app: {
              url: `https://squid-game2.vercel.app/?userId=${userId}`,
            },
          },
        ],
      ],
    },
  };

  bot.sendMessage(
    chatId,
    "🦑 Welcome to Squid Game Mini!\n\nChoose your character:",
    options
  );
});

// Handle startapp parameter for direct links
bot.on("message", (msg) => {
  if (msg.web_app_data) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "🎮 Game data received!");
  }
});

// API routes (keeping existing ones for compatibility)
app.get("/api/game-state", (req, res) => {
  res.json({
    success: true,
    data: {
      points: 0,
      level: 1,
      hp: 100,
      smg: 0,
      ton: 0,
      lastCheckIn: null,
      consecutiveCheckIns: 0,
    },
  });
});

// Character-specific API routes
app.get("/api/game-state/yeonghee", (req, res) => {
  res.json({
    success: true,
    character: "yeonghee",
    data: {
      points: 100,
      level: 1,
      hp: 100,
      smg: 50,
      ton: 10,
      lastCheckIn: null,
      consecutiveCheckIns: 0,
    },
  });
});

app.get("/api/game-state/cheolsu", (req, res) => {
  res.json({
    success: true,
    character: "cheolsu",
    data: {
      points: 150,
      level: 1,
      hp: 100,
      smg: 75,
      ton: 15,
      lastCheckIn: null,
      consecutiveCheckIns: 0,
    },
  });
});

// Manual webhook setup route (for testing)
app.get("/setup-webhook", async (req, res) => {
  try {
    const webhookUrl = `${
      process.env.API_BASE_URL || "https://squid-game-m29i-123.vercel.app"
    }/webhook`;
    await bot.setWebHook(webhookUrl);
    res.json({
      success: true,
      message: "Webhook set successfully",
      url: webhookUrl,
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Force update bot commands
app.get("/update-commands", async (req, res) => {
  try {
    // Delete existing webhook first
    await bot.deleteWebHook();
    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Set new webhook
    const webhookUrl = `${
      process.env.API_BASE_URL || "https://squid-game-m29i-123.vercel.app"
    }/webhook`;
    await bot.setWebHook(webhookUrl);
    res.json({ success: true, message: "Commands updated successfully" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  // Try to connect to MongoDB
  console.log("🔄 Attempting to connect to MongoDB...");
  const connected = await db.connect();

  if (!connected) {
    console.log("⚠️  Running in fallback mode (in-memory storage)");
  }

  console.log(`Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Direct links:`);
  console.log(
    `- Yeonghee: https://t.me/squidgametap_bot?startapp=yeonghee (opens: ${
      process.env.API_BASE_URL || "https://squid-game-m29i-123.vercel.app"
    }/)`
  );
  console.log(
    `- Cheolsu: https://t.me/squidgametap_bot?startapp=cheolsu (opens: https://squid-game2.vercel.app/)`
  );
  console.log(`\nAPI Endpoints:`);
  console.log(`- GET /api/user/:telegramUserId - Get user game data`);
  console.log(`- POST /api/user/:telegramUserId - Update user game data`);
  console.log(`- POST /api/sync/:telegramUserId - Sync game state from client`);
  console.log(`- GET /api/leaderboard - Get leaderboard`);
  console.log(`- GET /api/stats - Get game statistics`);
  console.log(`- GET /api/db-status - Check database status`);
  console.log(
    `\nDatabase: ${db.isConnected ? "✅ MongoDB" : "⚠️  In-Memory (fallback)"}`
  );
});
