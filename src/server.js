const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Telegram Bot without polling (use webhook for production)
const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN ||
    "7734367102:AAEg7tQ7W7EPnwZoflk3wuAALK7ew03A7Rg"
);

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Character-specific routes
app.get("/yeonghee", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/cheolsu", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Webhook endpoint for Telegram
app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Bot commands with character selection
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const baseUrl =
    process.env.API_BASE_URL || "https://squid-game-m29i-123.vercel.app";

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "👩 Play as Yeonghee",
            web_app: { url: `${baseUrl}/yeonghee` },
          },
        ],
        [
          {
            text: "👨 Play as Cheolsu",
            web_app: { url: `${baseUrl}/cheolsu` },
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

// API routes
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Direct links:`);
  console.log(`- Yeonghee: https://t.me/squidgametap_bot?startapp=yeonghee`);
  console.log(`- Cheolsu: https://t.me/squidgametap_bot?startapp=cheolsu`);
});
