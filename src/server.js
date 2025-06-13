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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Direct links:`);
  console.log(`- Yeonghee: https://t.me/squidgametap_bot?startapp=yeonghee`);
  console.log(`- Cheolsu: https://t.me/squidgametap_bot?startapp=cheolsu`);
});
