// =====================
// Shared Auto Earn Functionality
// =====================

let autoEarnInterval = null;
let isAutoEarnActive = false;
let audioContext = null;

// Auto earn configuration
const AUTO_EARN_CONFIG = {
  interval: 2000, // 2 seconds
  multiplier: 0.25, // 0.25x multiplier for auto-tap
  storageKey: "autoEarnEnabled",
};

// Initialize audio context for auto earn
function initializeAudioContext() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("🔊 Audio context initialized for auto earn");
    }

    // Resume audio context if suspended
    if (audioContext.state === "suspended") {
      audioContext
        .resume()
        .then(() => {
          console.log("🔊 Audio context resumed");
        })
        .catch((error) => {
          console.log("❌ Failed to resume audio context:", error);
        });
    }
  } catch (error) {
    console.log("❌ Audio context initialization failed:", error);
  }
}

// Resume audio context when tab becomes visible
function resumeAudioContext() {
  if (audioContext && audioContext.state === "suspended") {
    audioContext
      .resume()
      .then(() => {
        console.log("🔊 Audio context resumed on tab focus");
      })
      .catch((error) => {
        console.log("❌ Failed to resume audio context on tab focus:", error);
      });
  }
}

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

  // Initialize audio context for sound effects
  initializeAudioContext();

  // Check if we're on the main game page (index.html)
  const isMainPage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/");

  if (isMainPage && typeof tap === "function") {
    // On main page, use the tap function
    autoEarnInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        // Resume audio context if needed
        resumeAudioContext();

        const fakeEvent = {
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        };
        tap(fakeEvent, AUTO_EARN_CONFIG.multiplier);

        // FIXED: Play coin sound for auto earn
        if (typeof playCoinSound === "function") {
          playCoinSound();
          console.log("🔊 Auto earn sound played");
        }

        console.log("🎯 Auto tap triggered (0.25x multiplier)");
      }
    }, AUTO_EARN_CONFIG.interval);
  } else {
    // On other pages, make API calls to earn coins
    autoEarnInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        // Resume audio context if needed
        resumeAudioContext();
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
  const isAutoEarnEnabled = button && button.classList.contains("active");

  if (document.visibilityState === "hidden") {
    if (isAutoEarnEnabled) {
      // Don't stop auto earn completely, just pause it
      console.log("⏸️ Auto earn paused - tab not visible");
    }
  } else if (document.visibilityState === "visible") {
    // Resume audio context when tab becomes visible
    resumeAudioContext();

    if (isAutoEarnEnabled && !isAutoEarnActive) {
      // Restart auto earn if it was enabled but stopped
      startAutoEarn();
      console.log("▶️ Auto earn resumed - tab visible");
    } else if (isAutoEarnEnabled) {
      console.log("▶️ Auto earn already active - audio context resumed");
    }
  }
}

// Enhanced initialization function
function initializeAutoEarn() {
  // Load saved state
  loadAutoEarnState();

  // Initialize audio context
  initializeAudioContext();

  // Add visibility change listener with improved handling
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Add focus/blur listeners for additional audio context management
  window.addEventListener("focus", () => {
    console.log("🔍 Window focused - resuming audio context");
    resumeAudioContext();
  });

  window.addEventListener("blur", () => {
    console.log("🔍 Window blurred");
  });

  // Add user interaction listener to unlock audio context
  document.addEventListener("click", initializeAudioContext, { once: true });
  document.addEventListener("touchstart", initializeAudioContext, {
    once: true,
  });

  console.log("🎮 Auto earn system initialized with enhanced audio support");
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
