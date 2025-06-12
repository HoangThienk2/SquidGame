/**
 * Game State Manager
 * Handles game state synchronization between server and local storage
 */

class GameStateManager {
  constructor() {
    this.currentState = null;
    this.isOnline = navigator.onLine;
    this.syncInterval = null;
    this.pendingChanges = [];
    this.lastSyncTime = 0;

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  // Initialize game state
  async initializeGameState() {
    try {
      // Try to load from server first
      if (this.isOnline && window.apiService.isAuthenticated()) {
        console.log("Loading game state from server...");
        this.currentState = await window.apiService.getUserGameState();
        this.saveToLocalStorage(this.currentState);
        console.log("Game state loaded from server:", this.currentState);
      } else {
        // Fallback to localStorage
        console.log("Loading game state from localStorage...");
        this.currentState = this.loadFromLocalStorage();
      }

      // Start auto-sync if online
      if (this.isOnline && window.apiService.isAuthenticated()) {
        this.startAutoSync();
      }

      return this.currentState;
    } catch (error) {
      console.error("Failed to initialize game state:", error);
      // Fallback to localStorage
      this.currentState = this.loadFromLocalStorage();
      return this.currentState;
    }
  }

  // Get current game state
  getGameState() {
    return this.currentState || this.loadFromLocalStorage();
  }

  // Update game state
  async updateGameState(newState, immediate = false) {
    try {
      // Update current state
      this.currentState = { ...newState };

      // Always save to localStorage immediately
      this.saveToLocalStorage(this.currentState);

      // Try to sync with server
      if (this.isOnline && window.apiService.isAuthenticated()) {
        if (immediate) {
          // Immediate sync for critical actions
          await this.syncToServer();
        } else {
          // Add to pending changes for batch sync
          this.addPendingChange(this.currentState);
        }
      } else {
        // Store for later sync when online
        this.addPendingChange(this.currentState);
      }

      return this.currentState;
    } catch (error) {
      console.error("Failed to update game state:", error);
      // At least we have localStorage backup
      return this.currentState;
    }
  }

  // Record tap action
  async recordTapAction(tapData) {
    try {
      if (this.isOnline && window.apiService.isAuthenticated()) {
        // Record tap on server (non-blocking)
        window.apiService.recordTap(tapData).catch((error) => {
          console.warn("Failed to record tap on server:", error);
        });

        // Update live stats (non-blocking)
        window.apiService
          .updateLiveStats({
            coinsEarned: tapData.coinsEarned,
            level: this.currentState?.level || 1,
          })
          .catch((error) => {
            console.warn("Failed to update live stats:", error);
          });
      }
    } catch (error) {
      console.warn("Failed to record tap action:", error);
      // Don't block game for logging failures
    }
  }

  // Sync to server
  async syncToServer() {
    try {
      if (!this.isOnline || !window.apiService.isAuthenticated()) {
        return false;
      }

      console.log("Syncing game state to server...");
      const serverState = await window.apiService.saveUserGameState(
        this.currentState
      );
      this.lastSyncTime = Date.now();
      console.log("Game state synced to server successfully");
      return true;
    } catch (error) {
      console.error("Failed to sync to server:", error);
      return false;
    }
  }

  // Add pending change
  addPendingChange(state) {
    this.pendingChanges.push({
      state: { ...state },
      timestamp: Date.now(),
    });

    // Keep only last 10 changes to avoid memory issues
    if (this.pendingChanges.length > 10) {
      this.pendingChanges = this.pendingChanges.slice(-10);
    }
  }

  // Sync pending changes
  async syncPendingChanges() {
    if (
      !this.isOnline ||
      !window.apiService.isAuthenticated() ||
      this.pendingChanges.length === 0
    ) {
      return;
    }

    try {
      console.log(`Syncing ${this.pendingChanges.length} pending changes...`);

      // Get the latest state from pending changes
      const latestChange = this.pendingChanges[this.pendingChanges.length - 1];
      await window.apiService.saveUserGameState(latestChange.state);

      // Clear pending changes after successful sync
      this.pendingChanges = [];
      this.lastSyncTime = Date.now();

      console.log("Pending changes synced successfully");
    } catch (error) {
      console.error("Failed to sync pending changes:", error);
    }
  }

  // Start auto-sync
  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      if (this.pendingChanges.length > 0) {
        this.syncPendingChanges();
      }
    }, 30000);

    console.log("Auto-sync started (30s interval)");
  }

  // Stop auto-sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log("Auto-sync stopped");
  }

  // Save to localStorage
  saveToLocalStorage(state) {
    try {
      localStorage.setItem("game_interface_state", JSON.stringify(state));
      localStorage.setItem("game_last_save", Date.now().toString());
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("game_interface_state");
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }

    // Return default state
    return this.getDefaultGameState();
  }

  // Get default game state
  getDefaultGameState() {
    return {
      level: 1,
      hp: this.getLevelHP(1),
      coinCount: 0,
      lastRecover: Date.now(),
      lastZeroHP: null,
    };
  }

  // Helper function to get level HP
  getLevelHP(level) {
    if (level <= 1) return 100;
    let hp = 100;
    for (let lv = 2; lv <= level; lv++) {
      if (lv <= 30) hp += 50;
      else if (lv <= 60) hp += 100;
      else if (lv <= 90) hp += 150;
      else hp += 200;
    }
    return hp;
  }

  // Force sync now
  async forceSyncNow() {
    if (this.isOnline && window.apiService.isAuthenticated()) {
      return await this.syncToServer();
    }
    return false;
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isAuthenticated: window.apiService.isAuthenticated(),
      pendingChanges: this.pendingChanges.length,
      lastSyncTime: this.lastSyncTime,
      autoSyncActive: !!this.syncInterval,
    };
  }

  // Clean up
  destroy() {
    this.stopAutoSync();
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }
}

// Create global game state manager instance
window.gameStateManager = new GameStateManager();
