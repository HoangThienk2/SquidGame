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
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://squid-game-m29i-123.vercel.app",
        description: "Production server",
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
            lastRecover: {
              type: "integer",
              description: "Timestamp lần hồi phục cuối",
              example: 1703123456789,
            },
            lastZeroHP: {
              type: "integer",
              nullable: true,
              description: "Timestamp lần cuối HP = 0",
              example: null,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Thời gian tạo tài khoản",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Thời gian cập nhật cuối",
            },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            level: {
              type: "integer",
              minimum: 1,
              description: "Cấp độ mới",
            },
            hp: {
              type: "integer",
              minimum: 0,
              description: "Máu mới",
            },
            coinCount: {
              type: "integer",
              minimum: 0,
              description: "Số ruby mới",
            },
            coinEarn: {
              type: "integer",
              minimum: 0,
              description: "Coins kiếm được trong session",
            },
            totalCoins: {
              type: "integer",
              minimum: 0,
              description: "Tổng coins",
            },
            lastRecover: {
              type: "integer",
              description: "Timestamp hồi phục",
            },
            lastZeroHP: {
              type: "integer",
              nullable: true,
              description: "Timestamp HP = 0",
            },
          },
        },
        GameSync: {
          type: "object",
          properties: {
            level: {
              type: "integer",
              minimum: 1,
              description: "Cấp độ hiện tại",
              example: 5,
            },
            hp: {
              type: "integer",
              minimum: 0,
              description: "Máu hiện tại",
              example: 85,
            },
            coinCount: {
              type: "integer",
              minimum: 0,
              description: "Số ruby",
              example: 1250,
            },
            coinEarn: {
              type: "integer",
              minimum: 0,
              description: "Coins kiếm được",
              example: 340,
            },
            lastRecover: {
              type: "integer",
              description: "Timestamp hồi phục",
              example: 1703123456789,
            },
            lastZeroHP: {
              type: "integer",
              nullable: true,
              description: "Timestamp HP = 0",
              example: null,
            },
          },
        },
        LeaderboardEntry: {
          type: "object",
          properties: {
            rank: {
              type: "integer",
              description: "Thứ hạng",
              example: 1,
            },
            telegramUserId: {
              type: "string",
              description: "Telegram User ID",
              example: "123456789",
            },
            level: {
              type: "integer",
              description: "Cấp độ",
              example: 15,
            },
            ruby: {
              type: "integer",
              description: "Số ruby",
              example: 5000,
            },
            totalCoins: {
              type: "integer",
              description: "Tổng coins",
              example: 12500,
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Thời gian cập nhật cuối",
            },
          },
        },
        Stats: {
          type: "object",
          properties: {
            totalPlayers: {
              type: "integer",
              description: "Tổng số người chơi",
              example: 150,
            },
            totalCoinsEarned: {
              type: "integer",
              description: "Tổng coins đã kiếm được",
              example: 125000,
            },
            totalRubyCoins: {
              type: "integer",
              description: "Tổng ruby coins",
              example: 45000,
            },
            averageLevel: {
              type: "number",
              description: "Cấp độ trung bình",
              example: 3.5,
            },
            maxLevel: {
              type: "integer",
              description: "Cấp độ cao nhất",
              example: 15,
            },
            activePlayers: {
              type: "integer",
              description: "Người chơi hoạt động (24h)",
              example: 85,
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
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              description: "Thông báo lỗi",
            },
          },
        },
      },
    },
  },
  apis: ["./server.js"], // Đường dẫn đến file chứa API routes
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
