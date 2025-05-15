// Main JavaScript file

// Initialize Telegram WebApp
window.tg = window.Telegram ? window.Telegram.WebApp : null;
console.log("Telegram WebApp initialized");

// DOM Elements
window.hpProgress = null;
window.hpValue = null;

// Initialize game state
window.gameState = {
  points: 0, // Game points
  level: 1, // Current level
  hp: 3999, // Health points
  maxHp: 3999, // Maximum health points
  smg: 0, // Currency: SMG
  ton: 0, // Currency: TON
  lastCheckIn: null, // Last check-in timestamp
  consecutiveCheckIns: 0,
  autoMode: false,
  autoSpeedMultiplier: 1,
  pointsToNextLevel: 100,
  transactions: [], // Transaction history
};

console.log("Game state initialized:", window.gameState);

// Initialize game state from localStorage or defaults
window.initializeGameState = function () {
  console.log("Initializing game state from localStorage");

  try {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      console.log("Loaded saved state:", parsedState);

      // Merge with current state to ensure all properties exist
      window.gameState = Object.assign(window.gameState, parsedState);
    } else {
      console.log("No saved game state found, using defaults");
    }
  } catch (error) {
    console.error("Error loading game state:", error);
  }

  console.log("Game state initialized:", window.gameState);
};

// Save game state to localStorage
window.saveGameState = function () {
  try {
    localStorage.setItem("gameState", JSON.stringify(window.gameState));
    console.log("Saving game state to localStorage");
  } catch (error) {
    console.error("Error saving game state:", error);
  }
};

// Update UI based on game state
window.updateUI = function () {
  console.log("Updating UI with current game state");

  // Update HP bar
  window.updateHPBar();
};

// Update HP bar
window.updateHPBar = function () {
  if (!window.hpProgress || !window.hpValue) {
    console.error("HP elements not found in updateHPBar");
    return;
  }

  const hp = window.gameState.hp;
  const maxHp = window.gameState.maxHp;
  const percentage = (hp / maxHp) * 100;

  console.log("Updated HP bar:", { hp, maxHp, percentage });

  window.hpProgress.style.width = `${percentage}%`;
  window.hpValue.textContent = `${hp} / ${maxHp}`;
};

// Show notification
window.showNotification = function (message, duration = 3000) {
  const notificationArea = document.getElementById("notification-area");
  if (!notificationArea) {
    console.error("Notification area not found");
    return;
  }

  console.log("Showing notification:", message, "duration:", duration);

  notificationArea.innerHTML = message;
  notificationArea.classList.add("show");

  setTimeout(() => {
    notificationArea.classList.remove("show");
    console.log("Notification hidden");
  }, duration);
};

// Add transaction to history
window.addTransaction = function (description, amount, currency) {
  const transaction = {
    description,
    amount,
    currency,
    timestamp: Date.now(),
  };

  console.log("Adding transaction:", transaction);

  window.gameState.transactions.push(transaction);

  // Keep only the latest 50 transactions
  if (window.gameState.transactions.length > 50) {
    window.gameState.transactions = window.gameState.transactions.slice(-50);
  }
};

// Format with commas for thousands
window.formatNumber = function (number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Check for daily check-in
window.checkDailyCheckIn = function () {
  console.log("Checking for daily check-in");

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const lastCheckIn = window.gameState.lastCheckIn || 0;

  // Check if the last check-in was before today
  if (lastCheckIn < today) {
    window.gameState.lastCheckIn = now.getTime();
    window.gameState.smg += 10;
    window.addTransaction("Daily check-in reward", 10, "SMG");
    window.showNotification("Daily check-in complete! +10 SMG");
    window.saveGameState();
    console.log("Daily check-in reward added");
  } else {
    console.log("Already checked in today");
  }
};

// Initialize UI elements
window.initUI = function () {
  console.log("Initializing UI elements");

  // Initialize HP elements
  window.hpProgress = document.getElementById("hp-progress");
  window.hpValue = document.getElementById("hp-value");

  if (window.hpProgress && window.hpValue) {
    console.log("HP elements found");
  } else {
    console.error("HP elements not found");
  }

  // Get other DOM elements
  const navItems = document.querySelectorAll(".nav-item");
  const backButton = document.querySelector(".back-button");
  const notificationArea = document.getElementById("notification-area");

  console.log("DOM elements references:", {
    hpProgress: window.hpProgress,
    hpValue: window.hpValue,
    navItems: navItems ? navItems.length : 0,
    backButton,
    notificationArea,
  });

  // Add back button handler
  if (backButton) {
    backButton.addEventListener("click", function () {
      if (window.tg && window.tg.close) {
        window.tg.close();
      }
    });
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded in main.js");

  // Initialize UI elements
  window.initUI();

  // Initialize game state from localStorage
  window.initializeGameState();

  // Update UI based on game state
  window.updateUI();

  // Check for daily check-in
  window.checkDailyCheckIn();
});

// Also try with window.onload
window.addEventListener("load", function () {
  console.log("Window fully loaded in main.js");

  // Make sure UI is initialized
  if (!window.hpProgress || !window.hpValue) {
    console.log("Reinitializing UI after window load");
    window.initUI();
    window.updateUI();
  }
});
