// Game data management
const gameData = {
  // Save game state to localStorage
  saveGame: function (gameState) {
    try {
      const gameData = {
        point: gameState.point,
        ruby: gameState.ruby,
        coin: gameState.coin,
        hp: gameState.hp,
        level: gameState.level,
        currentTapPoints: gameState.currentTapPoints,
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem("telegramGameData", JSON.stringify(gameData));
      console.log("Game saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving game:", error);
      return false;
    }
  },

  // Load game state from localStorage
  loadGame: function () {
    try {
      const savedData = localStorage.getItem("telegramGameData");
      if (!savedData) {
        console.log("No saved game found, starting new game");
        return null;
      }

      const parsedData = JSON.parse(savedData);
      console.log("Game loaded successfully");
      return parsedData;
    } catch (error) {
      console.error("Error loading game:", error);
      return null;
    }
  },

  // Reset game state (clear saved data)
  resetGame: function () {
    try {
      localStorage.removeItem("telegramGameData");
      console.log("Game reset successfully");
      return true;
    } catch (error) {
      console.error("Error resetting game:", error);
      return false;
    }
  },

  // Auto-save function to be called periodically
  autoSave: function (gameState) {
    this.saveGame(gameState);
  },
};

// Export for use in other files
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = gameData;
} else {
  window.gameData = gameData;
}
