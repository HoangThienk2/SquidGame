const mongoose = require("mongoose");

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
    },
    hp: {
      type: Number,
      default: 100,
      min: 0,
    },
    maxHP: {
      type: Number,
      default: 100,
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
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Indexes for better performance
userSchema.index({ level: -1, totalCoins: -1 });
userSchema.index({ coinCount: -1 });
userSchema.index({ updatedAt: -1 });

const User = mongoose.model("User", userSchema);

class Database {
  constructor() {
    this.isConnected = false;
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
        // Tạo user mới với default values
        user = new User({
          telegramUserId,
          level: 1,
          hp: 100,
          maxHP: 100,
          coinCount: 0,
          coinEarn: 0,
          totalCoins: 0,
          lastRecover: Date.now(),
          lastZeroHP: null,
        });
        await user.save();
        console.log(`👤 Created new user: ${telegramUserId}`);
      }

      return user;
    } catch (error) {
      console.error("❌ Error getting user data:", error);
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

module.exports = { Database, User };
