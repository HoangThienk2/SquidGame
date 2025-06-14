const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const { Database } = require("./database");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 443; // Use 443 for HTTPS

// Initialize Telegram Bot without polling (use webhook for production)
const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN ||
    "7734367102:AAEg7tQ7W7EPnwZoflk3wuAALK7ew03A7Rg"
);

// Initialize Database
const db = new Database();

// In-memory fallback database (if MongoDB fails)
const gameDatabase = new Map();

// Enhanced CORS configuration for SSL domain
const corsOptions = {
  origin: [
    "https://younghee.squidminigame.com",
    "https://www.younghee.squidminigame.com",
    "http://211.239.114.79:3000", // Keep for transition
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
  max: 300, // 300 requests per minute
  message: {
    success: false,
    error: "Too many requests",
    message: "Please wait a moment before making more requests",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === "/health" || req.path === "/api/db-status";
  },
});

// Sync rate limiting for gaming
const syncLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 50, // 50 requests per 5 seconds
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

// Force HTTPS redirect (for production)
app.use((req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Younghee Squid Game Server is running",
    timestamp: new Date().toISOString(),
    domain: "younghee.squidminigame.com",
    ssl: true,
  });
});

// Include all the game logic from the main server.js
// (This would include all the level requirements, functions, and API endpoints)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Younghee Squid Game Server running on port ${PORT}`);
  console.log(`🌐 Domain: https://younghee.squidminigame.com`);
  console.log(`🔒 SSL: Enabled`);
  console.log(`📱 Ready for Telegram WebApp`);
});

module.exports = app;
