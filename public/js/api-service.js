/**
 * API Service for Game State Management
 * Handles all server communications
 */

class APIService {
  constructor() {
    this.baseURL = "https://your-api-domain.com/v1"; // Replace with actual API URL
    this.timeout = 10000;
    this.userId = null;
    this.authToken = null;
  }

  // Initialize user session
  async initializeUser(telegramData) {
    try {
      const response = await this.makeRequest("/user/init", "POST", {
        telegram_id: telegramData.id,
        username: telegramData.username,
        first_name: telegramData.first_name,
        last_name: telegramData.last_name,
        photo_url: telegramData.photo_url,
        language_code: telegramData.language_code,
      });

      if (response.success) {
        this.userId = response.user.id;
        this.authToken = response.token;
        return response.user;
      }
      throw new Error(response.message || "Failed to initialize user");
    } catch (error) {
      console.error("Initialize user error:", error);
      throw error;
    }
  }

  // Get user game state
  async getUserGameState() {
    try {
      const response = await this.makeRequest(
        `/user/game-state/${this.userId}`,
        "GET"
      );
      if (response.success) {
        return response.gameState;
      }
      throw new Error(response.message || "Failed to get game state");
    } catch (error) {
      console.error("Get game state error:", error);
      // Return default state if server fails
      return this.getDefaultGameState();
    }
  }

  // Save user game state
  async saveUserGameState(gameState) {
    try {
      const response = await this.makeRequest(
        `/user/game-state/${this.userId}`,
        "PUT",
        {
          level: gameState.level,
          hp: gameState.hp,
          coinEarn: gameState.coinEarn,
          coinCount: gameState.coinCount,
          lastRecover: gameState.lastRecover,
          lastZeroHP: gameState.lastZeroHP,
        }
      );

      if (response.success) {
        return response.gameState;
      }
      throw new Error(response.message || "Failed to save game state");
    } catch (error) {
      console.error("Save game state error:", error);
      // Fallback to localStorage if server fails
      localStorage.setItem("game_interface_state", JSON.stringify(gameState));
      throw error;
    }
  }

  // Record tap action
  async recordTap(tapData) {
    try {
      const response = await this.makeRequest("/user/tap", "POST", {
        user_id: this.userId,
        tap_type: tapData.isMultiTap ? "multi" : "single",
        finger_count: tapData.fingerCount || 1,
        coins_earned: tapData.coinsEarned,
        hp_lost: tapData.hpLost,
        timestamp: Date.now(),
      });

      return response.success;
    } catch (error) {
      console.error("Record tap error:", error);
      return false; // Don't block game if logging fails
    }
  }

  // Get user items/upgrades
  async getUserItems() {
    try {
      const response = await this.makeRequest(
        `/user/items/${this.userId}`,
        "GET"
      );
      if (response.success) {
        return response.items;
      }
      return [];
    } catch (error) {
      console.error("Get user items error:", error);
      return [];
    }
  }

  // Update live game statistics
  async updateLiveStats(stats) {
    try {
      await this.makeRequest("/admin/live-game/update", "POST", {
        user_id: this.userId,
        action: "tap",
        coins_earned: stats.coinsEarned,
        level: stats.level,
      });
    } catch (error) {
      console.error("Update live stats error:", error);
      // Don't block game if stats update fails
    }
  }

  // Exchange tokens
  async exchangeTokens(fromToken, toToken, amount) {
    try {
      const response = await this.makeRequest("/user/exchange", "POST", {
        user_id: this.userId,
        from_token: fromToken,
        to_token: toToken,
        from_amount: amount,
      });

      return response;
    } catch (error) {
      console.error("Exchange tokens error:", error);
      throw error;
    }
  }

  // Generic request method
  async makeRequest(endpoint, method = "GET", data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: this.timeout,
    };

    // Add auth token if available
    if (this.authToken) {
      options.headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    // Add data for POST/PUT requests
    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`API Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  // Get default game state
  getDefaultGameState() {
    return {
      level: 1,
      hp: 100,
      coinEarn: 0,
      coinCount: 0,
      lastRecover: Date.now(),
      lastZeroHP: null,
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.userId && this.authToken;
  }

  // Logout user
  logout() {
    this.userId = null;
    this.authToken = null;
    localStorage.removeItem("game_auth_token");
    localStorage.removeItem("game_user_id");
  }

  // Save auth data to localStorage for persistence
  saveAuthData() {
    if (this.userId && this.authToken) {
      localStorage.setItem("game_user_id", this.userId);
      localStorage.setItem("game_auth_token", this.authToken);
    }
  }

  // Load auth data from localStorage
  loadAuthData() {
    const userId = localStorage.getItem("game_user_id");
    const authToken = localStorage.getItem("game_auth_token");

    if (userId && authToken) {
      this.userId = userId;
      this.authToken = authToken;
      return true;
    }
    return false;
  }
}

// Create global API service instance
window.apiService = new APIService();
