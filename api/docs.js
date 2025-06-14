const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const router = express.Router();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Squid Game API",
      version: "1.0.0",
      description: "API for managing Squid Game data based on Telegram User ID",
      contact: {
        name: "Squid Game Team",
        email: "support@squidgame.com",
      },
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
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            telegramUserId: {
              type: "string",
              description: "Telegram User ID",
              example: "123456789",
            },
            level: {
              type: "integer",
              minimum: 1,
              description: "Player level",
              example: 5,
            },
            hp: {
              type: "integer",
              minimum: 0,
              description: "Current health points",
              example: 85,
            },
            maxHP: {
              type: "integer",
              description: "Maximum health points",
              example: 100,
            },
            ruby: {
              type: "integer",
              minimum: 0,
              description: "Ruby count (coinCount)",
              example: 1250,
            },
            coins: {
              type: "integer",
              minimum: 0,
              description: "Coins in current session",
              example: 340,
            },
            totalCoins: {
              type: "integer",
              minimum: 0,
              description: "Total coins earned",
              example: 1590,
            },
            lastRecover: {
              type: "integer",
              description: "Last HP recovery timestamp",
              example: 1640995200000,
            },
            lastZeroHP: {
              type: "integer",
              description: "Last time HP reached zero timestamp",
              example: 1640995200000,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation date",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update date",
            },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            level: {
              type: "integer",
              minimum: 1,
              description: "Player level",
            },
            hp: {
              type: "integer",
              minimum: 0,
              description: "Current health points",
            },
            ruby: {
              type: "integer",
              minimum: 0,
              description: "Ruby count",
            },
            coins: {
              type: "integer",
              minimum: 0,
              description: "Coins in current session",
            },
            totalCoins: {
              type: "integer",
              minimum: 0,
              description: "Total coins earned",
            },
            lastRecover: {
              type: "integer",
              description: "Last HP recovery timestamp",
            },
            lastZeroHP: {
              type: "integer",
              description: "Last time HP reached zero timestamp",
            },
          },
        },
        GameSync: {
          type: "object",
          properties: {
            level: {
              type: "integer",
              description: "Current player level",
            },
            hp: {
              type: "integer",
              description: "Current health points",
            },
            coinCount: {
              type: "integer",
              description: "Current coin count",
            },
            coinEarn: {
              type: "integer",
              description: "Coins earned in session",
            },
            lastRecover: {
              type: "integer",
              description: "Last recovery timestamp",
            },
            lastZeroHP: {
              type: "integer",
              description: "Last zero HP timestamp",
            },
          },
        },
        LeaderboardEntry: {
          type: "object",
          properties: {
            telegramUserId: {
              type: "string",
              description: "Player Telegram ID",
            },
            level: {
              type: "integer",
              description: "Player level",
            },
            totalCoins: {
              type: "integer",
              description: "Total coins earned",
            },
            rank: {
              type: "integer",
              description: "Player rank",
            },
          },
        },
        Stats: {
          type: "object",
          properties: {
            totalPlayers: {
              type: "integer",
              description: "Total number of players",
            },
            totalCoins: {
              type: "integer",
              description: "Total coins in game",
            },
            averageLevel: {
              type: "number",
              description: "Average player level",
            },
            topLevel: {
              type: "integer",
              description: "Highest level achieved",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Request success status",
            },
            message: {
              type: "string",
              description: "Response message",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
            },
            error: {
              type: "string",
              description: "Error details",
            },
          },
        },
      },
    },
  },
  apis: ["./server.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

// Swagger UI options for better serverless compatibility
const swaggerOptions = {
  explorer: false,
  swaggerOptions: {
    persistAuthorization: false,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: false,
    showExtensions: false,
    showCommonExtensions: false,
    tryItOutEnabled: true,
  },
};

// Serve Swagger UI
router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(specs, swaggerOptions));

// Alternative JSON endpoint
router.get("/json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

module.exports = router;
