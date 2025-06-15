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

// Điểm cần để lên cấp (level 1 -> 100) - NEW SYSTEM
const LEVEL_UP_REQUIREMENTS = [
  6408, // Level 1: 267 taps × 24 = 6,408 points
  10416, // Level 2: 434 taps × 24 = 10,416 points
  13872, // Level 3: 578 taps × 24 = 13,872 points
  15552, // Level 4: 648 taps × 24 = 15,552 points
  17232, // Level 5: 718 taps × 24 = 17,232 points
  18912, // Level 6: 788 taps × 24 = 18,912 points
  20592, // Level 7: 858 taps × 24 = 20,592 points
  22272, // Level 8: 928 taps × 24 = 22,272 points
  23952, // Level 9: 998 taps × 24 = 23,952 points
  25632, // Level 10: 1,068 taps × 24 = 25,632 points
  31104, // Level 11: 1,296 taps × 24 = 31,104 points
  33696, // Level 12: 1,404 taps × 24 = 33,696 points
  36288, // Level 13: 1,512 taps × 24 = 36,288 points
  38880, // Level 14: 1,620 taps × 24 = 38,880 points
  41472, // Level 15: 1,728 taps × 24 = 41,472 points
  44064, // Level 16: 1,836 taps × 24 = 44,064 points
  46656, // Level 17: 1,944 taps × 24 = 46,656 points
  49248, // Level 18: 2,052 taps × 24 = 49,248 points
  51840, // Level 19: 2,160 taps × 24 = 51,840 points
  54432, // Level 20: 2,268 taps × 24 = 54,432 points
  65472, // Level 21: 2,728 taps × 24 = 65,472 points
  68448, // Level 22: 2,852 taps × 24 = 68,448 points
  71424, // Level 23: 2,976 taps × 24 = 71,424 points
  74400, // Level 24: 3,100 taps × 24 = 74,400 points
  77376, // Level 25: 3,224 taps × 24 = 77,376 points
  80352, // Level 26: 3,348 taps × 24 = 80,352 points
  83328, // Level 27: 3,472 taps × 24 = 83,328 points
  86304, // Level 28: 3,596 taps × 24 = 86,304 points
  89280, // Level 29: 3,720 taps × 24 = 89,280 points
  92256, // Level 30: 3,844 taps × 24 = 92,256 points
  110880, // Level 31: 4,620 taps × 24 = 110,880 points
  117600, // Level 32: 4,900 taps × 24 = 117,600 points
  124320, // Level 33: 5,180 taps × 24 = 124,320 points
  131040, // Level 34: 5,460 taps × 24 = 131,040 points
  137760, // Level 35: 5,740 taps × 24 = 137,760 points
  144480, // Level 36: 6,020 taps × 24 = 144,480 points
  151200, // Level 37: 6,300 taps × 24 = 151,200 points
  157920, // Level 38: 6,580 taps × 24 = 157,920 points
  164640, // Level 39: 6,860 taps × 24 = 164,640 points
  171360, // Level 40: 7,140 taps × 24 = 171,360 points
  198432, // Level 41: 8,268 taps × 24 = 198,432 points
  206016, // Level 42: 8,584 taps × 24 = 206,016 points
  213600, // Level 43: 8,900 taps × 24 = 213,600 points
  221184, // Level 44: 9,216 taps × 24 = 221,184 points
  228768, // Level 45: 9,532 taps × 24 = 228,768 points
  236352, // Level 46: 9,848 taps × 24 = 236,352 points
  243936, // Level 47: 10,164 taps × 24 = 243,936 points
  251520, // Level 48: 10,480 taps × 24 = 251,520 points
  259104, // Level 49: 10,796 taps × 24 = 259,104 points
  0, // Level 50: Ruby level
  329472, // Level 51: 13,728 taps × 24 = 329,472 points
  338400, // Level 52: 14,100 taps × 24 = 338,400 points
  347328, // Level 53: 14,472 taps × 24 = 347,328 points
  356256, // Level 54: 14,844 taps × 24 = 356,256 points
  365184, // Level 55: 15,216 taps × 24 = 365,184 points
  374112, // Level 56: 15,588 taps × 24 = 374,112 points
  383040, // Level 57: 15,960 taps × 24 = 383,040 points
  391968, // Level 58: 16,332 taps × 24 = 391,968 points
  400896, // Level 59: 16,704 taps × 24 = 400,896 points
  409824, // Level 60: 17,076 taps × 24 = 409,824 points
  487296, // Level 61: 20,304 taps × 24 = 487,296 points
  502848, // Level 62: 20,952 taps × 24 = 502,848 points
  518400, // Level 63: 21,600 taps × 24 = 518,400 points
  533952, // Level 64: 22,248 taps × 24 = 533,952 points
  549504, // Level 65: 22,896 taps × 24 = 549,504 points
  565056, // Level 66: 23,544 taps × 24 = 565,056 points
  580608, // Level 67: 24,192 taps × 24 = 580,608 points
  596160, // Level 68: 24,840 taps × 24 = 596,160 points
  611712, // Level 69: 25,488 taps × 24 = 611,712 points
  627264, // Level 70: 26,136 taps × 24 = 627,264 points
  // Continue with existing values for levels 71-100 (keeping original structure)
  6498000,
  7147000,
  7797600,
  8447400,
  0, // 71-74, 75 là ruby
  9747000,
  10396800,
  11046600,
  11696400,
  0, // 76-79, 80 là ruby
  12346200,
  13580820,
  14815440,
  16050060,
  0, // 81-84, 85 là ruby
  18519300,
  19753920,
  20988540,
  22223160,
  0, // 86-89, 90 là ruby
  23457780,
  26976448,
  30495114,
  34013782,
  0, // 91-94, 95 là ruby
  41051116,
  44569782,
  48008450,
  0, // 96-98, 99 là ruby
];

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
    2400,
    3600,
    4800,
    6000,
    7200,
    8400,
    9600,
    10800,
    12000,
    13200, // Levels 1–10
    16200,
    17550,
    18900,
    20250,
    21600,
    22950,
    24300,
    25650,
    27000,
    28350, // Levels 11–20
    34100,
    35650,
    37200,
    38750,
    40300,
    41850,
    43400,
    44950,
    46500,
    48050, // Levels 21–30
    57750,
    61250,
    64750,
    68250,
    71750,
    75250,
    78750,
    82250,
    85750,
    89250, // Levels 31–40
    103350,
    107250,
    111150,
    115050,
    118950,
    122850,
    126750,
    130650,
    134550,
    0, // Levels 41–50 (Ruby level remains 0)
    171550,
    176250,
    180950,
    185650,
    190350,
    195050,
    199750,
    204450,
    209150,
    213850, // Levels 51–60
    253800,
    261900,
    270000,
    278100,
    286200,
    294300,
    302400,
    310500,
    318600,
    326700, // Levels 61–70
    378200,
    387350,
    396500,
    405650,
    414800,
    423950,
    433100,
    442250,
    451400,
    460550, // Levels 71–80
    539000,
    549500,
    560000,
    570500,
    581000,
    591500,
    602000,
    612500,
    623000,
    633500, // Levels 81–90
    740000,
    756000,
    772000,
    788000,
    804000,
    820000,
    836000,
    852000,
    868000,
    884000, // Levels 91–100
    // Remaining values unchanged from previous configuration...
  ];

  // Return the daily point limit as max HP for the level
  if (level <= 0 || level > DAILY_POINT_LIMITS.length) return 2400; // Default for invalid levels
  const dailyLimit = DAILY_POINT_LIMITS[level - 1];
  if (dailyLimit === 0) return 2400; // Default for ruby levels (Level 1 equivalent)
  return dailyLimit; // Return actual HP points
}

// Helper function to check if user can level up
function canLevelUp(currentLevel, totalCoins) {
  const totalCoinsNeededForNextLevel = getTotalCoinsForLevel(currentLevel + 1);

  console.log(`🔍 Level up check details:`);
  console.log(`Current level: ${currentLevel}`);
  console.log(`Total coins available: ${totalCoins}`);
  console.log(
    `Total coins needed for level ${
      currentLevel + 1
    }: ${totalCoinsNeededForNextLevel}`
  );
  console.log(
    `Can level up: ${
      totalCoins >= totalCoinsNeededForNextLevel && currentLevel < 100
    }`
  );

  return (
    totalCoinsNeededForNextLevel > 0 &&
    totalCoins >= totalCoinsNeededForNextLevel &&
    currentLevel < 100
  );
}

// Helper function to get total coins needed for a level
function getTotalCoinsForLevel(level) {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 0; i < level - 1; i++) {
    total += LEVEL_UP_REQUIREMENTS[i] || 0;
  }
  return total;
}

// Helper function to recover HP based on time elapsed
function recoverHP(userData) {
  const currentTime = Date.now();
  const maxHP = getLevelHP(userData.level);

  // Cap HP at maxHP if it's already over the limit
  if (userData.hp > maxHP) {
    console.log(`🔧 Capping HP: ${userData.hp} → ${maxHP} (maxHP limit)`);
    userData.hp = maxHP;
    userData.lastRecover = currentTime;
    return userData;
  }

  // Initialize lastRecover if not set
  if (!userData.lastRecover) {
    userData.lastRecover = currentTime;
    return userData;
  }

  const timeSinceLastRecover = currentTime - userData.lastRecover;
  const recoveryInterval = 3 * 60 * 1000; // 3 minutes in milliseconds

  // Check if enough time has passed for recovery
  if (timeSinceLastRecover >= recoveryInterval && userData.hp < maxHP) {
    // Calculate how many 3-minute intervals have passed
    const intervalsElapsed = Math.floor(
      timeSinceLastRecover / recoveryInterval
    );

    // Calculate recovery amount (2% per interval)
    const recoveryPerInterval = Math.floor(maxHP * 0.02);
    const totalRecovery = recoveryPerInterval * intervalsElapsed;

    // Apply recovery but don't exceed maxHP
    const oldHP = userData.hp;
    userData.hp = Math.min(maxHP, userData.hp + totalRecovery);

    // Update lastRecover timestamp to account for the intervals used
    userData.lastRecover =
      userData.lastRecover + intervalsElapsed * recoveryInterval;

    console.log(
      `💚 Server HP Recovery: ${oldHP} → ${userData.hp} (+${
        userData.hp - oldHP
      }) for user ${userData.telegramUserId}`
    );
  }

  return userData;
}

// =====================
// Database Functions
// =====================

// Helper function to get user data (with fallback)
async function getUserData(telegramUserId) {
  try {
    console.log(`🔍 getUserData called for user: ${telegramUserId}`);

    if (db.isConnected) {
      // Use MongoDB
      console.log(`🔍 Searching for user in MongoDB: ${telegramUserId}`);
      let user = await db.getUserData(telegramUserId);

      if (!user) {
        console.log(
          `⚠️ User not found in MongoDB, checking if this is a valid user ID: ${telegramUserId}`
        );

        // Additional validation - don't create user for invalid IDs
        if (
          !telegramUserId ||
          telegramUserId === "undefined" ||
          telegramUserId === "null"
        ) {
          console.log(`❌ Invalid user ID detected: ${telegramUserId}`);
          throw new Error("Invalid user ID");
        }

        // IMPORTANT: Only create new user if this is truly a first-time user
        // Check if this might be an existing user with connection issues
        console.log(
          `🔍 Checking if user ${telegramUserId} should be created as new user`
        );

        // Create new user with proper maxHP calculation - BUT LOG THIS CLEARLY
        console.log(
          `🆕 Creating NEW USER in MongoDB: ${telegramUserId} - HP will be set to FULL`
        );
        console.log(
          `⚠️ WARNING: If this user already existed, their HP will be RESET to full!`
        );

        const initialLevel = 1;
        const maxHP = getLevelHP(initialLevel);
        user = await db.createUser({
          telegramUserId: telegramUserId,
          level: initialLevel,
          hp: maxHP, // This will reset HP to full for new users
          maxHP: maxHP,
          ruby: 0,
          coins: 0,
          smg: 0,
          lastRecover: Date.now(),
          lastZeroHP: null,
        });
        console.log(`✅ New user created successfully with FULL HP:`, user);
      } else {
        console.log(`✅ Existing user found in MongoDB:`, {
          telegramUserId: user.telegramUserId,
          level: user.level,
          hp: user.hp,
          ruby: user.ruby,
          smg: user.smg,
        });

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

        // Apply HP recovery logic
        const originalHP = user.hp;
        const originalLastRecover = user.lastRecover;
        user = recoverHP(user);

        // Update database if HP or lastRecover changed
        if (
          user.hp !== originalHP ||
          user.lastRecover !== originalLastRecover
        ) {
          console.log(`🔄 Updating HP recovery: ${originalHP} → ${user.hp}`);
          await db.updateUserData(telegramUserId, {
            hp: user.hp,
            lastRecover: user.lastRecover,
          });
        }
      }
      return user;
    } else {
      console.log(`🔍 Using in-memory storage for user: ${telegramUserId}`);
      // Fallback to in-memory
      if (!gameDatabase.has(telegramUserId)) {
        console.log(
          `🆕 Creating NEW USER in memory: ${telegramUserId} - HP will be set to FULL`
        );
        console.log(
          `⚠️ WARNING: If this user already existed, their HP will be RESET to full!`
        );
        const initialLevel = 1;
        const maxHP = getLevelHP(initialLevel);
        gameDatabase.set(telegramUserId, {
          telegramUserId: telegramUserId,
          level: initialLevel,
          hp: maxHP, // This will reset HP to full for new users
          maxHP: maxHP,
          coinCount: 0,
          coinEarn: 0,
          totalCoins: 0,
          smg: 0,
          lastRecover: Date.now(),
          lastZeroHP: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`✅ New user created in memory with FULL HP`);
      } else {
        console.log(`✅ Existing user found in memory: ${telegramUserId}`);
        // Apply HP recovery for in-memory users too
        let userData = gameDatabase.get(telegramUserId);
        const originalHP = userData.hp;
        const originalLastRecover = userData.lastRecover;
        userData = recoverHP(userData);

        // Update in-memory data if changed
        if (
          userData.hp !== originalHP ||
          userData.lastRecover !== originalLastRecover
        ) {
          gameDatabase.set(telegramUserId, userData);
        }
      }
      return gameDatabase.get(telegramUserId);
    }
  } catch (error) {
    console.error("❌ Error in getUserData:", error);

    // Don't create fallback user for invalid IDs
    if (
      !telegramUserId ||
      telegramUserId === "undefined" ||
      telegramUserId === "null"
    ) {
      throw error;
    }

    // Fallback to in-memory on error
    if (!gameDatabase.has(telegramUserId)) {
      console.log(
        `🆘 Creating FALLBACK USER in memory due to error: ${telegramUserId} - HP will be set to FULL`
      );
      console.log(
        `⚠️ CRITICAL: This user's HP is being RESET to full due to database error!`
      );
      const initialLevel = 1;
      const maxHP = getLevelHP(initialLevel);
      gameDatabase.set(telegramUserId, {
        telegramUserId: telegramUserId,
        level: initialLevel,
        hp: maxHP, // This will reset HP to full due to error
        maxHP: maxHP,
        coinCount: 0,
        coinEarn: 0,
        totalCoins: 0,
        smg: 0,
        lastRecover: Date.now(),
        lastZeroHP: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(
        `✅ Fallback user created in memory with FULL HP due to error`
      );
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
        smg: user.smg || 0,
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
 *                     smg:
 *                       type: integer
 *                       example: 50
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
        smg: userData.smg || 0, // SMG currency
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
      "smg",
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
        smg: updatedUserData.smg || 0,
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

    // Get current user data first
    const currentUserData = await getUserData(telegramUserId);

    // Check for level up before updating
    const totalCoins = (gameState.coinCount || 0) + (gameState.coinEarn || 0);
    let finalCoinCount = gameState.coinCount || 0;
    let finalCoinEarn = gameState.coinEarn || 0;
    let finalLevel = gameState.level || 1;

    // Check if user should level up
    if (canLevelUp(currentUserData.level, totalCoins)) {
      const oldLevel = currentUserData.level;
      finalLevel = oldLevel + 1;

      console.log(`🎉 SERVER LEVEL UP! ${oldLevel} → ${finalLevel}`);
      console.log(
        `Before level up - Ruby: ${finalCoinCount}, Coins: ${finalCoinEarn}`
      );

      // FIXED: Khi lên level, cộng coins vào ruby và reset coins về 0
      finalCoinCount += finalCoinEarn;
      finalCoinEarn = 0;

      console.log(
        `After level up - Ruby: ${finalCoinCount}, Coins: ${finalCoinEarn}`
      );
    }

    // Update user data with game state (including level up changes)
    const syncData = {
      level: finalLevel,
      hp: gameState.hp !== undefined ? gameState.hp : getLevelHP(finalLevel),
      coinCount: finalCoinCount,
      coinEarn: finalCoinEarn,
      smg: gameState.smg || 0, // Add SMG field
      totalCoins: finalCoinCount + finalCoinEarn,
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
        smg: updatedUserData.smg || 0,
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
 * /api/exchange/{telegramUserId}:
 *   post:
 *     summary: Exchange points for SMG
 *     description: Convert 1000 points to 1 SMG
 *     tags: [Exchange]
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
 *             type: object
 *             properties:
 *               points:
 *                 type: integer
 *                 minimum: 1000
 *                 description: Points to exchange (must be multiple of 1000)
 *                 example: 1000
 *               exchangeType:
 *                 type: string
 *                 enum: [point-to-smg, smg-to-point]
 *                 description: Type of exchange
 *                 example: "point-to-smg"
 *     responses:
 *       200:
 *         description: Exchange successful
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
 *                   example: "Exchange completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     exchanged:
 *                       type: object
 *                       properties:
 *                         points:
 *                           type: integer
 *                         smg:
 *                           type: number
 *                     newBalance:
 *                       type: object
 *                       properties:
 *                         totalCoins:
 *                           type: integer
 *                         smg:
 *                           type: number
 *       400:
 *         description: Invalid exchange request
 *       500:
 *         description: Server error
 */
app.post("/api/exchange/:telegramUserId", async (req, res) => {
  try {
    const telegramUserId = req.params.telegramUserId;
    const { points, exchangeType = "point-to-smg" } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required",
      });
    }

    if (!points || points < 1000) {
      return res.status(400).json({
        success: false,
        error: "Minimum 1000 points required for exchange",
      });
    }

    if (points % 1000 !== 0) {
      return res.status(400).json({
        success: false,
        error: "Points must be a multiple of 1000",
      });
    }

    // Get current user data
    const userData = await getUserData(telegramUserId);

    if (exchangeType === "point-to-smg") {
      // Check if user has enough ruby points
      if (userData.coinCount < points) {
        return res.status(400).json({
          success: false,
          error: "Insufficient ruby points for exchange",
        });
      }

      // Calculate SMG to give (1000 points = 1 SMG)
      const smgToAdd = points / 1000;

      // Update user data - subtract from ruby (coinCount) and add SMG
      const updateData = {
        coinCount: userData.coinCount - points,
        totalCoins: userData.coinCount - points + (userData.coinEarn || 0),
        smg: (userData.smg || 0) + smgToAdd,
      };

      const updatedUserData = await updateUserData(telegramUserId, updateData);

      console.log("🔄 Exchange completed - Updated user data:", {
        ruby: updatedUserData.coinCount,
        totalCoins: updatedUserData.totalCoins,
        smg: updatedUserData.smg,
      });

      res.json({
        success: true,
        message: "Exchange completed successfully",
        data: {
          exchanged: {
            points: points,
            smg: smgToAdd,
          },
          newBalance: {
            ruby: updatedUserData.coinCount,
            totalCoins: updatedUserData.totalCoins,
            smg: updatedUserData.smg,
          },
        },
      });
    } else if (exchangeType === "smg-to-point") {
      // Convert SMG back to ruby points (1 SMG = 1000 points)
      const smgToExchange = points / 1000; // points here represents the points equivalent

      if ((userData.smg || 0) < smgToExchange) {
        return res.status(400).json({
          success: false,
          error: "Insufficient SMG for exchange",
        });
      }

      // Update user data - add to ruby (coinCount) and subtract SMG
      const updateData = {
        coinCount: userData.coinCount + points,
        totalCoins: userData.coinCount + points + (userData.coinEarn || 0),
        smg: (userData.smg || 0) - smgToExchange,
      };

      const updatedUserData = await updateUserData(telegramUserId, updateData);

      res.json({
        success: true,
        message: "Exchange completed successfully",
        data: {
          exchanged: {
            smg: smgToExchange,
            points: points,
          },
          newBalance: {
            ruby: updatedUserData.coinCount,
            totalCoins: updatedUserData.totalCoins,
            smg: updatedUserData.smg,
          },
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid exchange type",
      });
    }
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
// Transaction History API Endpoints
// =====================

/**
 * @swagger
 * /api/transaction-history/{telegramUserId}:
 *   get:
 *     summary: Get transaction history
 *     description: Get user's exchange transaction history
 *     tags: [Transaction History]
 *     parameters:
 *       - in: path
 *         name: telegramUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Telegram User ID
 *         example: "123456789"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of transactions to return
 *         example: 10
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       transactionId:
 *                         type: string
 *                       exchangeType:
 *                         type: string
 *                         enum: [point-to-smg, smg-to-point]
 *                       fromLabel:
 *                         type: string
 *                       fromValue:
 *                         type: string
 *                       toLabel:
 *                         type: string
 *                       toValue:
 *                         type: string
 *                       timestamp:
 *                         type: number
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.get("/api/transaction-history/:telegramUserId", async (req, res) => {
  try {
    const telegramUserId = req.params.telegramUserId;
    const limit = parseInt(req.query.limit) || 10;

    if (!telegramUserId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required",
      });
    }

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        error: "Limit must be between 1 and 50",
      });
    }

    let transactions = [];

    if (db.isConnected) {
      // Use MongoDB
      transactions = await db.getTransactionHistory(telegramUserId, limit);
    } else {
      // Fallback: return empty array for now
      console.log("⚠️ Transaction history not available in fallback mode");
    }

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("❌ Error getting transaction history:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/transaction-history/{telegramUserId}:
 *   post:
 *     summary: Save transaction history
 *     description: Save a new exchange transaction to history
 *     tags: [Transaction History]
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
 *             type: object
 *             required:
 *               - exchangeType
 *               - fromLabel
 *               - fromValue
 *               - toLabel
 *               - toValue
 *             properties:
 *               id:
 *                 type: string
 *                 description: Transaction ID (optional, will be generated if not provided)
 *               exchangeType:
 *                 type: string
 *                 enum: [point-to-smg, smg-to-point]
 *               fromLabel:
 *                 type: string
 *               fromValue:
 *                 type: string
 *               toLabel:
 *                 type: string
 *               toValue:
 *                 type: string
 *               timestamp:
 *                 type: number
 *                 description: Transaction timestamp (optional, will be generated if not provided)
 *     responses:
 *       200:
 *         description: Transaction saved successfully
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
 *                   example: "Transaction history saved successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post("/api/transaction-history/:telegramUserId", async (req, res) => {
  try {
    const telegramUserId = req.params.telegramUserId;
    const transactionData = req.body;

    if (!telegramUserId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required",
      });
    }

    // Validate required fields
    const requiredFields = [
      "exchangeType",
      "fromLabel",
      "fromValue",
      "toLabel",
      "toValue",
    ];
    for (const field of requiredFields) {
      if (!transactionData[field]) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`,
        });
      }
    }

    // Validate exchangeType
    if (
      !["point-to-smg", "smg-to-point"].includes(transactionData.exchangeType)
    ) {
      return res.status(400).json({
        success: false,
        error: "exchangeType must be 'point-to-smg' or 'smg-to-point'",
      });
    }

    let savedTransaction = null;

    if (db.isConnected) {
      // Use MongoDB
      savedTransaction = await db.saveTransactionHistory(
        telegramUserId,
        transactionData
      );
    } else {
      // Fallback: just return success for now
      console.log("⚠️ Transaction history not saved in fallback mode");
      savedTransaction = { ...transactionData, id: Date.now().toString() };
    }

    res.json({
      success: true,
      message: "Transaction history saved successfully",
      data: savedTransaction,
    });
  } catch (error) {
    console.error("❌ Error saving transaction history:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/transaction-history/{telegramUserId}:
 *   delete:
 *     summary: Clear transaction history
 *     description: Clear all transaction history for a user
 *     tags: [Transaction History]
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
 *         description: Transaction history cleared successfully
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
 *                   example: "Transaction history cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: number
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.delete("/api/transaction-history/:telegramUserId", async (req, res) => {
  try {
    const telegramUserId = req.params.telegramUserId;

    if (!telegramUserId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required",
      });
    }

    let result = { deletedCount: 0 };

    if (db.isConnected) {
      // Use MongoDB
      result = await db.clearTransactionHistory(telegramUserId);
    } else {
      // Fallback: just return success for now
      console.log("⚠️ Transaction history not cleared in fallback mode");
    }

    res.json({
      success: true,
      message: "Transaction history cleared successfully",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("❌ Error clearing transaction history:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
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
