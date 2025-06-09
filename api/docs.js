const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Squid Game API",
      version: "1.0.0",
      description:
        "API để quản lý dữ liệu game Squid Game dựa trên Telegram User ID",
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
              description: "Cấp độ người chơi",
              example: 5,
            },
            hp: {
              type: "integer",
              minimum: 0,
              description: "Máu hiện tại",
              example: 85,
            },
            maxHP: {
              type: "integer",
              description: "Máu tối đa",
              example: 100,
            },
            ruby: {
              type: "integer",
              minimum: 0,
              description: "Số ruby (coinCount)",
              example: 1250,
            },
            coins: {
              type: "integer",
              minimum: 0,
              description: "Coins trong session hiện tại",
              example: 340,
            },
            totalCoins: {
              type: "integer",
              minimum: 0,
              description: "Tổng coins đã kiếm được",
              example: 1590,
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Trạng thái thành công",
            },
            message: {
              type: "string",
              description: "Thông báo",
            },
            data: {
              type: "object",
              description: "Dữ liệu trả về",
            },
          },
        },
      },
    },
    paths: {
      "/api/user/{telegramUserId}": {
        get: {
          summary: "Lấy thông tin người chơi",
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
              description: "Thành công",
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
          },
        },
        post: {
          summary: "Cập nhật thông tin người chơi",
          tags: ["User Management"],
          parameters: [
            {
              in: "path",
              name: "telegramUserId",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Cập nhật thành công",
            },
          },
        },
      },
      "/api/sync/{telegramUserId}": {
        post: {
          summary: "Đồng bộ trạng thái game",
          tags: ["Game Sync"],
          parameters: [
            {
              in: "path",
              name: "telegramUserId",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Đồng bộ thành công",
            },
          },
        },
      },
      "/api/leaderboard": {
        get: {
          summary: "Lấy bảng xếp hạng",
          tags: ["Leaderboard"],
          responses: {
            200: {
              description: "Thành công",
            },
          },
        },
      },
      "/api/stats": {
        get: {
          summary: "Lấy thống kê game",
          tags: ["Statistics"],
          responses: {
            200: {
              description: "Thành công",
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
      ]
    });
  </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  }
};
