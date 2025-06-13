// =====================
// Shared Auto Earn Functionality
// =====================

let autoEarnInterval = null;
let isAutoEarnActive = false;

// Auto earn configuration
const AUTO_EARN_CONFIG = {
  interval: 2000, // 2 seconds
  multiplier: 0.25, // 0.25x multiplier for auto-tap
  storageKey: "autoEarnEnabled",
};

// Load auto earn state from localStorage
function loadAutoEarnState() {
  const savedState = localStorage.getItem(AUTO_EARN_CONFIG.storageKey);
  if (savedState === "true") {
    // Restore auto earn state
    const button = document.getElementById("auto-earn-button");
    const navItem = document.getElementById("nav-auto-earn");
    if (button && navItem) {
      button.classList.add("active");
      navItem.classList.add("active");
      startAutoEarn();
      console.log("🔄 Auto earn restored from localStorage");
    }
  }
}

// Save auto earn state to localStorage
function saveAutoEarnState(enabled) {
  localStorage.setItem(AUTO_EARN_CONFIG.storageKey, enabled.toString());
  console.log("💾 Auto earn state saved to localStorage:", enabled);
}

// Start auto earn interval
function startAutoEarn() {
  if (autoEarnInterval) {
    clearInterval(autoEarnInterval);
  }

  isAutoEarnActive = true;

  // Check if we're on the main game page (index.html)
  const isMainPage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/");

  if (isMainPage && typeof tap === "function") {
    // On main page, use the tap function
    autoEarnInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        const fakeEvent = {
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        };
        tap(fakeEvent, AUTO_EARN_CONFIG.multiplier);
        console.log("🎯 Auto tap triggered (0.25x multiplier)");
      }
    }, AUTO_EARN_CONFIG.interval);
  } else {
    // On other pages, make API calls to earn coins
    autoEarnInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        performAutoEarnAPI();
      }
    }, AUTO_EARN_CONFIG.interval);
  }

  console.log("🟢 Auto earn started on page:", window.location.pathname);
}

// Stop auto earn
function stopAutoEarn() {
  if (autoEarnInterval) {
    clearInterval(autoEarnInterval);
    autoEarnInterval = null;
  }
  isAutoEarnActive = false;
  console.log("🔴 Auto earn stopped");
}

// Perform auto earn via API call (for non-main pages)
async function performAutoEarnAPI() {
  try {
    // Get user ID from localStorage or Telegram
    let userId = localStorage.getItem("telegramUserId");
    if (
      !userId &&
      typeof window.Telegram !== "undefined" &&
      window.Telegram.WebApp
    ) {
      userId = window.Telegram.WebApp.initDataUnsafe?.user?.id?.toString();
    }

    if (!userId) {
      console.log("❌ No user ID available for auto earn API");
      return;
    }

    // First, get current user data
    const getUserResponse = await fetch(
      `/api/user/${encodeURIComponent(userId)}`
    );
    if (!getUserResponse.ok) {
      console.log("❌ Failed to get user data for auto earn");
      return;
    }

    const userData = await getUserResponse.json();
    if (!userData.success) {
      console.log("❌ Invalid user data response");
      return;
    }

    // Calculate auto earn coins (simulate a tap with multiplier)
    const baseCoinsPerTap = 1; // Base coins per tap
    const autoEarnCoins = Math.floor(
      baseCoinsPerTap * AUTO_EARN_CONFIG.multiplier
    );

    // Update game state with auto earned coins
    const updatedGameState = {
      level: userData.data.level,
      hp: Math.max(0, userData.data.hp - 1), // Reduce HP by 1 for auto tap
      coinCount: userData.data.ruby,
      coinEarn: userData.data.coins + autoEarnCoins,
      lastRecover: userData.data.lastRecover || Date.now(),
      lastZeroHP: userData.data.lastZeroHP,
    };

    // Sync the updated state
    const syncResponse = await fetch(
      `/api/sync/${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedGameState),
      }
    );

    if (syncResponse.ok) {
      const result = await syncResponse.json();
      console.log("🎯 Auto earn API success:", result);

      // Update UI if possible
      if (result.success && result.data) {
        updateCoinsDisplay(result.data.coins);
        updateRubyDisplay(result.data.ruby);
        updateHPDisplay(result.data.hp);
      }
    } else {
      console.log("❌ Auto earn sync failed:", syncResponse.status);
    }
  } catch (error) {
    console.log("❌ Auto earn API error:", error);
  }
}

// Update coins display (if elements exist)
function updateCoinsDisplay(coins) {
  const coinElements = document.querySelectorAll(
    "[data-coins], .coins-display, #coins-count"
  );
  coinElements.forEach((element) => {
    if (element) {
      element.textContent = coins.toLocaleString();
    }
  });
}

// Update ruby display (if elements exist)
function updateRubyDisplay(ruby) {
  const rubyElements = document.querySelectorAll(
    "[data-ruby], .ruby-display, #ruby-count"
  );
  rubyElements.forEach((element) => {
    if (element) {
      element.textContent = ruby.toLocaleString();
    }
  });
}

// Update HP display (if elements exist)
function updateHPDisplay(hp) {
  const hpElements = document.querySelectorAll(
    "[data-hp], .hp-display, #hp-count"
  );
  hpElements.forEach((element) => {
    if (element) {
      element.textContent = hp.toLocaleString();
    }
  });
}

// Toggle auto earn function
function toggleAutoEarn() {
  const button = document.getElementById("auto-earn-button");
  const navItem = document.getElementById("nav-auto-earn");

  if (button && button.classList.contains("active")) {
    // Disable auto earn
    stopAutoEarn();
    button.classList.remove("active");
    if (navItem) navItem.classList.remove("active");
    saveAutoEarnState(false);
    console.log("🔴 Auto earn disabled");
  } else {
    // Enable auto earn
    startAutoEarn();
    if (button) button.classList.add("active");
    if (navItem) navItem.classList.add("active");
    saveAutoEarnState(true);
    console.log("🟢 Auto earn enabled - 2s interval with 0.25x multiplier");
  }
}

// Handle visibility change to pause/resume auto earn
function handleVisibilityChange() {
  const button = document.getElementById("auto-earn-button");
  if (
    document.visibilityState === "hidden" &&
    button &&
    button.classList.contains("active")
  ) {
    stopAutoEarn();
    console.log("⏸️ Auto earn paused - tab not visible");
  } else if (
    document.visibilityState === "visible" &&
    button &&
    button.classList.contains("active")
  ) {
    startAutoEarn();
    console.log("▶️ Auto earn resumed - tab visible");
  }
}

// Initialize auto earn functionality
function initializeAutoEarn() {
  // Add visibility change listener
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Load saved state
  loadAutoEarnState();

  console.log("🎮 Auto earn functionality initialized");
}

// Clean up auto earn when page unloads
function cleanupAutoEarn() {
  stopAutoEarn();
  document.removeEventListener("visibilitychange", handleVisibilityChange);
}

// Add cleanup on page unload
window.addEventListener("beforeunload", cleanupAutoEarn);

// Export functions for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeAutoEarn,
    toggleAutoEarn,
    loadAutoEarnState,
    saveAutoEarnState,
    startAutoEarn,
    stopAutoEarn,
  };
}
