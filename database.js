const mongoose = require("mongoose");

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

// =====================
// Database Schema
// =====================

// User Schema
const userSchema = new mongoose.Schema(
  {
    telegramUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    hp: {
      type: Number,
      default: function () {
        return getLevelHP(this.level || 1);
      },
      min: 0,
    },
    maxHP: {
      type: Number,
      default: function () {
        return getLevelHP(this.level || 1);
      },
      min: 100,
    },
    ruby: {
      type: Number,
      default: 0,
      min: 0,
    },
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },
    coinCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    coinEarn: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCoins: {
      type: Number,
      default: 0,
      min: 0,
    },
    smg: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRecover: {
      type: Number,
      default: Date.now,
    },
    lastZeroHP: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    collection: "users", // Tên collection trong MongoDB
  }
);

// Pre-save middleware to calculate maxHP based on level
userSchema.pre("save", function (next) {
  // Calculate maxHP based on current level
  this.maxHP = getLevelHP(this.level);
  console.log(
    `🔧 Pre-update: Setting maxHP for level ${this.level}: ${this.maxHP}`
  );
  next();
});

// Pre-update middleware to calculate maxHP based on level
userSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function (next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.level) {
      update.$set.maxHP = getLevelHP(update.$set.level);
      console.log(
        `🔧 Pre-update: Setting maxHP for level ${update.$set.level}: ${update.$set.maxHP}`
      );
    }
    next();
  }
);

// Indexes for better performance
userSchema.index({ level: -1, totalCoins: -1 });
userSchema.index({ coinCount: -1 });
userSchema.index({ updatedAt: -1 });

// Transaction History Schema
const transactionHistorySchema = new mongoose.Schema(
  {
    telegramUserId: {
      type: String,
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    exchangeType: {
      type: String,
      required: true,
      enum: ["point-to-smg", "smg-to-point"],
    },
    fromLabel: {
      type: String,
      required: true,
    },
    fromValue: {
      type: String,
      required: true,
    },
    toLabel: {
      type: String,
      required: true,
    },
    toValue: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "transaction_history",
  }
);

// Index for efficient queries
transactionHistorySchema.index({ telegramUserId: 1, timestamp: -1 });

const User = mongoose.model("User", userSchema);
const TransactionHistory = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema
);

class Database {
  constructor() {
    this.isConnected = false;
    this.User = User;
    this.TransactionHistory = TransactionHistory;
  }

  // Kết nối MongoDB
  async connect(mongoUri = null) {
    try {
      // Skip if already connected
      if (this.isConnected && mongoose.connection.readyState === 1) {
        return true;
      }

      const uri =
        mongoUri ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/squidgame";

      // Configure mongoose for serverless
      mongoose.set("strictQuery", false);

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      await mongoose.connect(uri, options);

      this.isConnected = true;
      console.log("✅ MongoDB connected successfully");
      return true;
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error.message);
      this.isConnected = false;
      return false;
    }
  }

  // Lấy hoặc tạo user data
  async getUserData(telegramUserId) {
    try {
      let user = await User.findOne({ telegramUserId });

      if (!user) {
        // Tạo user mới với proper maxHP calculation
        const initialLevel = 1;
        const maxHP = getLevelHP(initialLevel);

        user = new User({
          telegramUserId,
          level: initialLevel,
          hp: maxHP, // Start with full HP
          maxHP: maxHP,
          coinCount: 0,
          coinEarn: 0,
          totalCoins: 0,
          smg: 0,
          lastRecover: Date.now(),
          lastZeroHP: null,
        });
        await user.save();
        console.log(
          `👤 Created new user: ${telegramUserId} with maxHP: ${maxHP}`
        );
      } else {
        // Check and update maxHP if it doesn't match the level
        const expectedMaxHP = getLevelHP(user.level);
        if (user.maxHP !== expectedMaxHP) {
          console.log(
            `🔧 Database: Updating maxHP for level ${user.level}: ${user.maxHP} → ${expectedMaxHP}`
          );
          user.maxHP = expectedMaxHP;
          // Also update HP if it exceeds new maxHP
          if (user.hp > expectedMaxHP) {
            user.hp = expectedMaxHP;
          }
          await user.save();
        }
      }

      return user;
    } catch (error) {
      console.error("❌ Error getting user data:", error);
      throw error;
    }
  }

  // Tạo user mới (helper function)
  async createUser(userData) {
    try {
      const initialLevel = userData.level || 1;
      const maxHP = getLevelHP(initialLevel);

      const user = new User({
        telegramUserId: userData.telegramUserId,
        level: initialLevel,
        hp: userData.hp !== undefined ? userData.hp : maxHP,
        maxHP: maxHP,
        ruby: userData.ruby || 0,
        coins: userData.coins || 0,
        coinCount: userData.coinCount || 0,
        coinEarn: userData.coinEarn || 0,
        totalCoins: userData.totalCoins || 0,
        smg: userData.smg || 0,
        lastRecover: userData.lastRecover || Date.now(),
        lastZeroHP: userData.lastZeroHP || null,
      });

      await user.save();
      console.log(
        `👤 Created new user via createUser: ${userData.telegramUserId} with maxHP: ${maxHP}`
      );
      return user;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  }

  // Cập nhật user data
  async updateUserData(telegramUserId, updateData) {
    try {
      const user = await User.findOneAndUpdate(
        { telegramUserId },
        { $set: updateData },
        {
          new: true, // Trả về document sau khi update
          upsert: true, // Tạo mới nếu không tồn tại
          runValidators: true, // Chạy schema validation
        }
      );

      console.log(`📝 Updated user: ${telegramUserId}`);
      return user;
    } catch (error) {
      console.error("❌ Error updating user data:", error);
      throw error;
    }
  }

  // Lấy leaderboard
  async getLeaderboard(limit = 10, sortBy = "level") {
    try {
      let sortCriteria;

      switch (sortBy) {
        case "totalCoins":
          sortCriteria = { totalCoins: -1, level: -1 };
          break;
        case "ruby":
          sortCriteria = { coinCount: -1, level: -1 };
          break;
        case "level":
        default:
          sortCriteria = { level: -1, totalCoins: -1 };
          break;
      }

      const users = await User.find({})
        .sort(sortCriteria)
        .limit(limit)
        .select("telegramUserId level coinCount totalCoins updatedAt");

      return users.map((user, index) => ({
        rank: index + 1,
        telegramUserId: user.telegramUserId,
        level: user.level,
        ruby: user.coinCount,
        totalCoins: user.totalCoins,
        updatedAt: user.updatedAt,
      }));
    } catch (error) {
      console.error("❌ Error getting leaderboard:", error);
      throw error;
    }
  }

  // Lấy thống kê
  async getStats() {
    try {
      const totalPlayers = await User.countDocuments();

      const aggregateResult = await User.aggregate([
        {
          $group: {
            _id: null,
            totalCoinsEarned: { $sum: "$totalCoins" },
            totalRubyCoins: { $sum: "$coinCount" },
            averageLevel: { $avg: "$level" },
            maxLevel: { $max: "$level" },
          },
        },
      ]);

      // Đếm active players (hoạt động trong 24h qua)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activePlayers = await User.countDocuments({
        updatedAt: { $gte: oneDayAgo },
      });

      const stats = aggregateResult[0] || {
        totalCoinsEarned: 0,
        totalRubyCoins: 0,
        averageLevel: 0,
        maxLevel: 0,
      };

      return {
        totalPlayers,
        totalCoinsEarned: stats.totalCoinsEarned,
        totalRubyCoins: stats.totalRubyCoins,
        averageLevel: Math.round(stats.averageLevel * 100) / 100,
        maxLevel: stats.maxLevel,
        activePlayers,
      };
    } catch (error) {
      console.error("❌ Error getting stats:", error);
      throw error;
    }
  }

  // =====================
  // Transaction History Methods
  // =====================

  // Lưu transaction history
  async saveTransactionHistory(telegramUserId, transactionData) {
    try {
      const transaction = new this.TransactionHistory({
        telegramUserId,
        transactionId: transactionData.id || Date.now().toString(),
        exchangeType: transactionData.exchangeType,
        fromLabel: transactionData.fromLabel,
        fromValue: transactionData.fromValue,
        toLabel: transactionData.toLabel,
        toValue: transactionData.toValue,
        timestamp: transactionData.timestamp || Date.now(),
      });

      await transaction.save();
      console.log(`💾 Transaction history saved for user: ${telegramUserId}`);
      return transaction;
    } catch (error) {
      console.error("❌ Error saving transaction history:", error);
      throw error;
    }
  }

  // Lấy transaction history của user
  async getTransactionHistory(telegramUserId, limit = 10) {
    try {
      const transactions = await this.TransactionHistory.find({
        telegramUserId,
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      console.log(
        `📥 Retrieved ${transactions.length} transactions for user: ${telegramUserId}`
      );
      return transactions;
    } catch (error) {
      console.error("❌ Error getting transaction history:", error);
      throw error;
    }
  }

  // Xóa tất cả transaction history của user
  async clearTransactionHistory(telegramUserId) {
    try {
      const result = await this.TransactionHistory.deleteMany({
        telegramUserId,
      });
      console.log(
        `🗑️ Cleared ${result.deletedCount} transactions for user: ${telegramUserId}`
      );
      return result;
    } catch (error) {
      console.error("❌ Error clearing transaction history:", error);
      throw error;
    }
  }

  // Đóng kết nối
  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("🔌 MongoDB disconnected");
    } catch (error) {
      console.error("❌ Error disconnecting MongoDB:", error);
    }
  }
}

module.exports = { Database, User, TransactionHistory };
