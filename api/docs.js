const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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
        url: "https://squid-game-m29i-123.vercel.app",
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
              description: "Success status",
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
              description: "Error status",
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
    paths: {
      "/api/user/{telegramUserId}": {
        get: {
          summary: "Get player information",
          description: "Retrieve player data by Telegram User ID",
          tags: ["User Management"],
          parameters: [
            {
              in: "path",
              name: "telegramUserId",
              required: true,
              schema: {
                type: "string",
              },
              description: "Telegram User ID",
              example: "123456789",
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Update player information",
          description: "Update player data by Telegram User ID",
          tags: ["User Management"],
          parameters: [
            {
              in: "path",
              name: "telegramUserId",
              required: true,
              schema: {
                type: "string",
              },
              description: "Telegram User ID",
              example: "123456789",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserUpdate",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Update successful",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            400: {
              description: "Invalid request data",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/sync/{telegramUserId}": {
        post: {
          summary: "Sync game state",
          description: "Synchronize game state from client to server",
          tags: ["Game Sync"],
          parameters: [
            {
              in: "path",
              name: "telegramUserId",
              required: true,
              schema: {
                type: "string",
              },
              description: "Telegram User ID",
              example: "123456789",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GameSync",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Sync successful",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            400: {
              description: "Invalid sync data",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/leaderboard": {
        get: {
          summary: "Get leaderboard",
          description: "Retrieve top players leaderboard",
          tags: ["Leaderboard"],
          parameters: [
            {
              in: "query",
              name: "limit",
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 10,
              },
              description: "Number of top players to return",
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/LeaderboardEntry",
                        },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/stats": {
        get: {
          summary: "Get game statistics",
          description: "Retrieve overall game statistics",
          tags: ["Statistics"],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/Stats",
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/db-status": {
        get: {
          summary: "Check database status",
          description: "Check if database connection is working",
          tags: ["System"],
          responses: {
            200: {
              description: "Database is connected",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Database connected successfully",
                      },
                      timestamp: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Database connection failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

module.exports = (req, res) => {
  if (req.url === "/api/docs") {
    // Return Swagger JSON
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(specs);
  } else {
    // Return Swagger UI HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>🦑 Squid Game API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #FF6B6B; }
    .swagger-ui .info .description { color: #666; }
    .swagger-ui .scheme-container { background: #fafafa; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone
      ],
      layout: "StandaloneLayout"
    });
  </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  }
};
