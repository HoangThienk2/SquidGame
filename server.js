const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const { Database } = require("./database");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
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

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    "https://hoangthienk2.github.io",
    "https://HoangThienk2.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://api.allorigins.win",
    "https://cors-anywhere.herokuapp.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Increased from 100 to 300 requests per minute
  message: {
    success: false,
    error: "Too many requests",
    message: "Please wait a moment before making more requests",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health" || req.path === "/api/db-status";
  },
});

// More lenient rate limiting for sync endpoints (for gaming)
const syncLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds (reduced from 10 seconds)
  max: 50, // 50 requests per 5 seconds (increased from 20 per 10 seconds)
  message: {
    success: false,
    error: "Sync rate limit exceeded",
    message: "Please slow down your game actions",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Apply rate limiting
app.use("/api/", apiLimiter);
app.use("/api/sync/", syncLimiter);

// Swagger Documentation - Direct setup for better Vercel compatibility
try {
  const swaggerJsdoc = require("swagger-jsdoc");
  const swaggerUi = require("swagger-ui-express");

  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Squid Game API",
        version: "1.0.0",
        description:
          "API for managing Squid Game data based on Telegram User ID",
      },
      servers: [
        {
          url: "https://squid-game-hoangthienk2s-projects.vercel.app",
          description: "Production server",
        },
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
    },
    apis: ["./server.js"], // Look for API documentation in this file
  };

  const specs = swaggerJsdoc(swaggerOptions);

  // Custom Swagger UI options for Vercel compatibility
  const swaggerUiOptions = {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Squid Game API Documentation",
    swaggerOptions: {
      url: "/api-docs/json",
    },
  };

  // Serve Swagger JSON
  app.get("/api-docs/json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  // Serve Swagger UI with CDN
  app.get("/api-docs", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Squid Game API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar { display: none }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api-docs/json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
    `);
  });
} catch (error) {
  console.error("❌ Swagger UI setup failed:", error);
  // Fallback simple API documentation
  app.get("/api-docs", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Squid Game API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .endpoint { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .method { font-weight: bold; color: #fff; padding: 5px 10px; border-radius: 3px; }
        .get { background: #61affe; }
        .post { background: #49cc90; }
        .path { font-family: monospace; font-size: 16px; margin: 10px 0; }
        .description { color: #666; }
    </style>
</head>
<body>
    <h1>🦑 Squid Game API Documentation</h1>
    <p>API for managing Squid Game data based on Telegram User ID</p>
    
    <div class="endpoint">
        <span class="method get">GET</span>
        <div class="path">/api/user/{telegramUserId}</div>
        <div class="description">Get user game data by Telegram User ID</div>
    </div>
    
    <div class="endpoint">
        <span class="method post">POST</span>
        <div class="path">/api/user/{telegramUserId}</div>
        <div class="description">Update user game data</div>
    </div>
    
    <div class="endpoint">
        <span class="method post">POST</span>
        <div class="path">/api/sync/{telegramUserId}</div>
        <div class="description">Sync game state from client</div>
    </div>
    
    <div class="endpoint">
        <span class="method get">GET</span>
        <div class="path">/api/leaderboard</div>
        <div class="description">Get top players leaderboard</div>
    </div>
    
    <div class="endpoint">
        <span class="method get">GET</span>
        <div class="path">/api/stats</div>
        <div class="description">Get game statistics</div>
    </div>
    
    <div class="endpoint">
        <span class="method get">GET</span>
        <div class="path">/api/db-status</div>
        <div class="description">Check database connection status</div>
    </div>
    
    <div class="endpoint">
        <span class="method get">GET</span>
        <div class="path">/health</div>
        <div class="description">Health check endpoint</div>
    </div>
    
    <p><strong>Base URL:</strong> https://squid-game-hoangthienk2s-projects.vercel.app</p>
    <p><strong>Example:</strong> <a href="/api/user/123456789">/api/user/123456789</a></p>
</body>
</html>
    `);
  });
}

// =====================
// Helper Functions
// =====================

// NEW HP LOGIC: Calculate HP based on daily point limits (same as client-side)
function getLevelHP(level) {
  // Daily point limits for each level (max points that can be earned per day)
  const DAILY_POINT_LIMITS = [
    23040, // Level 1: 960 taps × 24 = 23,040 points
    34560, // Level 2: 1,440 taps × 24 = 34,560 points
    46080, // Level 3: 1,920 taps × 24 = 46,080 points
    57600, // Level 4: 2,400 taps × 24 = 57,600 points
    69120, // Level 5: 2,880 taps × 24 = 69,120 points
    80640, // Level 6: 3,360 taps × 24 = 80,640 points
    92160, // Level 7: 3,840 taps × 24 = 92,160 points
    103680, // Level 8: 4,320 taps × 24 = 103,680 points
    115200, // Level 9: 4,800 taps × 24 = 115,200 points
    126720, // Level 10: 5,280 taps × 24 = 126,720 points
    155520, // Level 11: 6,480 taps × 24 = 155,520 points
    168480, // Level 12: 7,020 taps × 24 = 168,480 points
    181440, // Level 13: 7,560 taps × 24 = 181,440 points
    194400, // Level 14: 8,100 taps × 24 = 194,400 points
    207360, // Level 15: 8,640 taps × 24 = 207,360 points
    220320, // Level 16: 9,180 taps × 24 = 220,320 points
    233280, // Level 17: 9,720 taps × 24 = 233,280 points
    246240, // Level 18: 10,260 taps × 24 = 246,240 points
    259200, // Level 19: 10,800 taps × 24 = 259,200 points
    272160, // Level 20: 11,340 taps × 24 = 272,160 points
    327360, // Level 21: 13,640 taps × 24 = 327,360 points
    342240, // Level 22: 14,260 taps × 24 = 342,240 points
    357120, // Level 23: 14,880 taps × 24 = 357,120 points
    372000, // Level 24: 15,500 taps × 24 = 372,000 points
    386880, // Level 25: 16,120 taps × 24 = 386,880 points
    401760, // Level 26: 16,740 taps × 24 = 401,760 points
    416640, // Level 27: 17,360 taps × 24 = 416,640 points
    431520, // Level 28: 17,980 taps × 24 = 431,520 points
    446400, // Level 29: 18,600 taps × 24 = 446,400 points
    461280, // Level 30: 19,220 taps × 24 = 461,280 points
    554400, // Level 31: 23,100 taps × 24 = 554,400 points
    588000, // Level 32: 24,500 taps × 24 = 588,000 points
    621600, // Level 33: 25,900 taps × 24 = 621,600 points
    655200, // Level 34: 27,300 taps × 24 = 655,200 points
    688800, // Level 35: 28,700 taps × 24 = 688,800 points
    722400, // Level 36: 30,100 taps × 24 = 722,400 points
    756000, // Level 37: 31,500 taps × 24 = 756,000 points
    789600, // Level 38: 32,900 taps × 24 = 789,600 points
    823200, // Level 39: 34,300 taps × 24 = 823,200 points
    856800, // Level 40: 35,700 taps × 24 = 856,800 points
    992160, // Level 41: 41,340 taps × 24 = 992,160 points
    1029600, // Level 42: 42,900 taps × 24 = 1,029,600 points
    1067040, // Level 43: 44,460 taps × 24 = 1,067,040 points
    1104480, // Level 44: 46,020 taps × 24 = 1,104,480 points
    1141920, // Level 45: 47,580 taps × 24 = 1,141,920 points
    1179360, // Level 46: 49,140 taps × 24 = 1,179,360 points
    1216800, // Level 47: 50,700 taps × 24 = 1,216,800 points
    1254240, // Level 48: 52,260 taps × 24 = 1,254,240 points
    1291680, // Level 49: 53,820 taps × 24 = 1,291,680 points
    0, // Level 50: Ruby level
    1646880, // Level 51: 68,620 taps × 24 = 1,646,880 points
    1692000, // Level 52: 70,500 taps × 24 = 1,692,000 points
    1737120, // Level 53: 72,380 taps × 24 = 1,737,120 points
    1782240, // Level 54: 74,260 taps × 24 = 1,782,240 points
    1827360, // Level 55: 76,140 taps × 24 = 1,827,360 points
    1872480, // Level 56: 78,020 taps × 24 = 1,872,480 points
    1917600, // Level 57: 79,900 taps × 24 = 1,917,600 points
    1962720, // Level 58: 81,780 taps × 24 = 1,962,720 points
    2007840, // Level 59: 83,660 taps × 24 = 2,007,840 points
    2052960, // Level 60: 85,540 taps × 24 = 2,052,960 points
    2436480, // Level 61: 101,520 taps × 24 = 2,436,480 points
    2514240, // Level 62: 104,760 taps × 24 = 2,514,240 points
    2592000, // Level 63: 108,000 taps × 24 = 2,592,000 points
    2669760, // Level 64: 111,240 taps × 24 = 2,669,760 points
    2747520, // Level 65: 114,480 taps × 24 = 2,747,520 points
    2825280, // Level 66: 117,720 taps × 24 = 2,825,280 points
    2903040, // Level 67: 120,960 taps × 24 = 2,903,040 points
    2980800, // Level 68: 124,200 taps × 24 = 2,980,800 points
    3058560, // Level 69: 127,440 taps × 24 = 3,058,560 points
    3136320, // Level 70: 130,680 taps × 24 = 3,136,320 points
    // Continue with higher values for levels 71-100
    3500000,
    3600000,
    3700000,
    3800000,
    0, // 71-75
    4000000,
    4100000,
    4200000,
    4300000,
    0, // 76-80
    4500000,
    4600000,
    4700000,
    4800000,
    0, // 81-85
    5000000,
    5100000,
    5200000,
    5300000,
    0, // 86-90
    5500000,
    5600000,
    5700000,
    5800000,
    0, // 91-95
    6000000,
    6100000,
    6200000,
    0,
    0, // 96-100
  ];

  // Return the daily point limit as max HP for the level
  if (level <= 0 || level > DAILY_POINT_LIMITS.length) return 23040; // Default for invalid levels
  const dailyLimit = DAILY_POINT_LIMITS[level - 1];
  if (dailyLimit === 0) return 23040; // Default for ruby levels (Level 1 equivalent)
  return dailyLimit; // Return actual HP points
}

// =====================
// Database Functions
// =====================

// Helper function to get user data (with fallback)
async function getUserData(telegramUserId) {
  try {
    if (db.isConnected) {
      // Use MongoDB
      let user = await db.getUserData(telegramUserId);
      if (!user) {
        // Create new user with proper maxHP calculation
        const initialLevel = 1;
        const maxHP = getLevelHP(initialLevel);
        user = await db.createUser({
          telegramUserId: telegramUserId,
          level: initialLevel,
          hp: maxHP,
          maxHP: maxHP,
          ruby: 0,
          coins: 0,
          lastRecover: Date.now(),
          lastZeroHP: null,
        });
      } else {
        // Update maxHP if it doesn't match the level
        const expectedMaxHP = getLevelHP(user.level);
        if (user.maxHP !== expectedMaxHP) {
          console.log(
            `🔧 Updating maxHP for level ${user.level}: ${user.maxHP} → ${expectedMaxHP}`
          );
          user.maxHP = expectedMaxHP;
          // Also update HP if it exceeds new maxHP
          if (user.hp > expectedMaxHP) {
            user.hp = expectedMaxHP;
          }
          await db.updateUserData(telegramUserId, {
            maxHP: expectedMaxHP,
            hp: user.hp,
          });
        }
      }
      return user;
    } else {
      // Fallback to in-memory
      if (!gameDatabase.has(telegramUserId)) {
        const initialLevel = 1;
        const maxHP = getLevelHP(initialLevel);
        gameDatabase.set(telegramUserId, {
          telegramUserId: telegramUserId,
          level: initialLevel,
          hp: maxHP,
          maxHP: maxHP,
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
      const initialLevel = 1;
      const maxHP = getLevelHP(initialLevel);
      gameDatabase.set(telegramUserId, {
        telegramUserId: telegramUserId,
        level: initialLevel,
        hp: maxHP,
        maxHP: maxHP,
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
      // Calculate maxHP if level is being updated
      if (updateData.level) {
        updateData.maxHP = getLevelHP(updateData.level);
        console.log(
          `🔧 Setting maxHP for level ${updateData.level}: ${updateData.maxHP}`
        );
      }

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

      // Calculate maxHP if level is being updated
      if (updateData.level) {
        updatedData.maxHP = getLevelHP(updateData.level);
        console.log(
          `🔧 Setting maxHP for level ${updateData.level}: ${updatedData.maxHP}`
        );
      }

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

    // Calculate maxHP if level is being updated
    if (updateData.level) {
      updatedData.maxHP = getLevelHP(updateData.level);
      console.log(
        `🔧 Setting maxHP for level ${updateData.level}: ${updatedData.maxHP}`
      );
    }

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
 *     summary: Get user information
 *     description: Retrieve player's game data by Telegram User ID
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
 *         description: User data retrieved successfully
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
 *                     telegramUserId:
 *                       type: string
 *                       example: "123456789"
 *                     level:
 *                       type: integer
 *                       example: 5
 *                     hp:
 *                       type: integer
 *                       example: 85
 *                     maxHP:
 *                       type: integer
 *                       example: 100
 *                     ruby:
 *                       type: integer
 *                       example: 1250
 *                     coins:
 *                       type: integer
 *                       example: 340
 *                     totalCoins:
 *                       type: integer
 *                       example: 1590
 *                     lastRecover:
 *                       type: integer
 *                       example: 1703123456789
 *                     lastZeroHP:
 *                       type: integer
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Telegram user ID is required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
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
 *     summary: Update user information
 *     description: Update player's game data
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
 *         description: Update successful
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
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
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
 *     summary: Sync game state
 *     description: Automatically sync game state from client
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
 *         description: Sync successful
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
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
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
      hp: gameState.hp !== undefined ? gameState.hp : 100,
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
 *     summary: Get leaderboard
 *     description: Get top players list by different criteria
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of players to return
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [level, totalCoins, ruby]
 *           default: level
 *         description: Sorting criteria
 *         example: level
 *     responses:
 *       200:
 *         description: Success
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
 *         description: Server error
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
 *     summary: Get game statistics
 *     description: Get overall game and player statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Success
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
 *         description: Server error
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
 *     summary: Check database status
 *     description: Check MongoDB connection and fallback status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Success
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
 *                       description: Whether MongoDB is connected
 *                       example: true
 *                     fallbackMode:
 *                       type: boolean
 *                       description: Whether using fallback mode
 *                       example: false
 *                     inMemoryUsers:
 *                       type: integer
 *                       description: Number of users in in-memory storage
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

// Health check endpoint for Vercel
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: db.isConnected ? "connected" : "fallback",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Start server (only if not imported as module)
if (require.main === module) {
  app.listen(PORT, async () => {
    // Try to connect to MongoDB
    console.log("🔄 Attempting to connect to MongoDB...");
    const connected = await db.connect();

    if (!connected) {
      console.log("⚠️  Running in fallback mode (in-memory storage)");
    }

    console.log(`Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
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
    console.log(
      `- POST /api/sync/:telegramUserId - Sync game state from client`
    );
    console.log(`- GET /api/stats - Get game statistics`);
    console.log(`- GET /api/db-status - Check database status`);
    console.log(
      `\nDatabase: ${
        db.isConnected ? "✅ MongoDB" : "⚠️  In-Memory (fallback)"
      }`
    );
  });
} else {
  // Initialize database connection for Vercel serverless
  (async () => {
    try {
      console.log("🔄 Initializing serverless function...");
      const connected = await db.connect();
      if (!connected) {
        console.log("⚠️  Running in fallback mode (in-memory storage)");
      } else {
        console.log("✅ MongoDB connected for Vercel deployment");
      }
    } catch (error) {
      console.error("❌ Serverless initialization error:", error);
      // Continue with fallback mode - don't crash
    }
  })().catch((error) => {
    console.error("❌ Critical serverless error:", error);
    // Ensure we don't crash the serverless function
  });
}

// Export for Vercel serverless functions
module.exports = app;
