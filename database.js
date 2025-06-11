const mongoose = require("mongoose");

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
  if (this.isModified("level")) {
    this.maxHP = getLevelHP(this.level);
    console.log(
      `🔧 Pre-save: Setting maxHP for level ${this.level}: ${this.maxHP}`
    );
  }
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
