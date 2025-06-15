// =====================
// Shared Auto Earn Functionality
// =====================

let autoEarnInterval = null;
let isAutoEarnActive = false;
let audioContext = null;

// Auto earn configuration
const AUTO_EARN_CONFIG = {
  interval: 2000, // 2 seconds
  multiplier: 1, // 1x multiplier for auto-tap (changed from 0.25 to ensure coins are earned)
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
    // On main page, use the tap function with level-based calculation
    autoEarnInterval = setInterval(() => {
      // Only auto earn when tab is visible
      if (document.visibilityState === "visible") {
        // Resume audio context if needed
        resumeAudioContext();

        // Get current user level for calculation (try to get from global state)
        let currentLevel = 1;
        if (typeof gameState !== "undefined" && gameState.level) {
          currentLevel = gameState.level;
        } else if (
          typeof window.currentUser !== "undefined" &&
          window.currentUser.level
        ) {
          currentLevel = window.currentUser.level;
        }

        // Calculate auto earn multiplier based on level (1/4 of level coins)
        const levelCoins = currentLevel;
        const autoEarnMultiplier = Math.max(0.25, levelCoins / 4); // At least 0.25, or 1/4 of level coins

        console.log("🎯 Auto earn main page calculation:", {
          currentLevel: currentLevel,
          levelCoins: levelCoins,
          autoEarnMultiplier: autoEarnMultiplier,
          calculation: `Level ${currentLevel}: ${levelCoins} ÷ 4 = ${autoEarnMultiplier}`,
        });

        const fakeEvent = {
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        };
        tap(fakeEvent, autoEarnMultiplier);

        // FIXED: Play coin sound for auto earn
        if (typeof playCoinSound === "function") {
          playCoinSound();
          console.log("🔊 Auto earn sound played");
        }

        console.log(
          `🎯 Auto tap triggered (${autoEarnMultiplier}x multiplier) - Main page`
        );
      } else {
        console.log("⏸️ Auto earn paused - tab not visible (main page)");
      }
    }, AUTO_EARN_CONFIG.interval);
  } else {
    // On other pages, make API calls to earn coins
    autoEarnInterval = setInterval(() => {
      // Only auto earn when tab is visible
      if (document.visibilityState === "visible") {
        // Resume audio context if needed
        resumeAudioContext();
        performAutoEarnAPI();
        console.log("🎯 Auto earn API triggered - Other page");
      } else {
        console.log("⏸️ Auto earn paused - tab not visible (other page)");
      }
    }, AUTO_EARN_CONFIG.interval);
  }

  console.log("🟢 Auto earn started on page:", window.location.pathname);
  console.log("🟢 Auto earn interval:", AUTO_EARN_CONFIG.interval + "ms");
  console.log("🟢 Auto earn multiplier:", AUTO_EARN_CONFIG.multiplier + "x");
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
    // Get user ID using the same logic as other pages
    let userId = null;

    // Try to get from global variable first (if available)
    if (typeof telegramUserId !== "undefined" && telegramUserId) {
      userId = telegramUserId;
    }
    // Try to get from getTelegramUserId function (if available)
    else if (typeof getTelegramUserId === "function") {
      userId = getTelegramUserId();
    }
    // Try sessionStorage
    else if (sessionStorage.getItem("telegramUserId")) {
      userId = sessionStorage.getItem("telegramUserId");
    }
    // Try localStorage
    else if (localStorage.getItem("telegramUserId")) {
      userId = localStorage.getItem("telegramUserId");
    }
    // Try Telegram WebApp
    else if (
      typeof window.Telegram !== "undefined" &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initDataUnsafe?.user?.id
    ) {
      userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    }

    if (!userId) {
      console.log("❌ No user ID available for auto earn API");
      return;
    }

    console.log("🎯 Auto earn API - Using userId:", userId);

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

    const currentUser = userData.data;
    console.log("📊 Current user data for auto earn:", currentUser);

    // Check if user has enough HP for auto earn
    if (currentUser.hp <= 0) {
      console.log("❌ No HP available for auto earn");
      return;
    }

    // Calculate auto earn coins based on HP loss per level (same as index.html logic)
    // HP loss per tap by level (same array as index.html)
    const HP_LOSS_BY_LEVEL = [
      // Level 1-10
      24,
      25,
      26,
      28,
      29,
      30,
      31,
      32,
      34,
      35,
      // Level 11-20
      41,
      42,
      43,
      45,
      46,
      47,
      49,
      50,
      51,
      53,
      // Level 21-30
      62,
      64,
      65,
      67,
      68,
      70,
      71,
      73,
      74,
      76,
      // Level 31-40
      88,
      89,
      91,
      93,
      95,
      96,
      98,
      100,
      102,
      103,
      // Level 41-49
      117,
      119,
      121,
      123,
      125,
      127,
      129,
      131,
      133,
      // Level 50 (Ruby level)
      24, // Default to level 1 value for ruby level
      // Level 51-60
      83,
      165,
      167,
      169,
      172,
      174,
      176,
      179,
      181,
      183,
      // Level 61-70
      216,
      219,
      221,
      224,
      227,
      230,
      232,
      235,
      238,
      240,
      // Level 71-100 (using progressive values)
      250,
      260,
      270,
      280,
      0, // 71-75 (75 is ruby)
      290,
      300,
      310,
      320,
      0, // 76-80 (80 is ruby)
      330,
      340,
      350,
      360,
      0, // 81-85 (85 is ruby)
      370,
      380,
      390,
      400,
      0, // 86-90 (90 is ruby)
      410,
      420,
      430,
      440,
      0, // 91-95 (95 is ruby)
      450,
      460,
      470,
      0,
      0, // 96-100 (99, 100 are ruby)
    ];

    // Get HP loss for a specific level (same function as index.html)
    function getHPLoss(level) {
      if (level <= 0 || level > HP_LOSS_BY_LEVEL.length) return 24; // Default
      const hpLoss = HP_LOSS_BY_LEVEL[level - 1];
      return hpLoss === 0 ? 24 : hpLoss; // Use default for ruby levels
    }

    const baseHPLoss = getHPLoss(currentUser.level || 1); // Get HP loss based on level
    const autoEarnCoins = Math.floor(baseHPLoss / 4); // Auto earn = HP loss ÷ 4

    console.log("🎯 Auto earn calculation:", {
      userLevel: currentUser.level,
      baseHPLoss: baseHPLoss,
      autoEarnCoins: autoEarnCoins,
      calculation: `HP Loss ${baseHPLoss} ÷ 4 = ${autoEarnCoins}`,
    });

    // Calculate new game state
    const newGameState = {
      level: currentUser.level,
      hp: Math.max(0, currentUser.hp - baseHPLoss), // Reduce HP by baseHPLoss (not fixed 1)
      coinCount:
        (currentUser.coinCount || currentUser.ruby || 0) + autoEarnCoins, // Add auto earned coins to ruby
      coinEarn: currentUser.coinEarn || currentUser.coins || 0, // Keep coinEarn unchanged
      smg: currentUser.smg || 0,
      lastRecover: currentUser.lastRecover || Date.now(),
      lastZeroHP: currentUser.lastZeroHP,
    };

    console.log("🎯 Auto earn - Game state calculation:", {
      currentRuby: currentUser.coinCount || currentUser.ruby || 0,
      autoEarnCoins: autoEarnCoins,
      newRuby: newGameState.coinCount,
      currentHP: currentUser.hp,
      newHP: newGameState.hp,
      hpLoss: baseHPLoss,
      rubyIncrease: `${
        currentUser.coinCount || currentUser.ruby || 0
      } + ${autoEarnCoins} = ${newGameState.coinCount}`,
      hpDecrease: `${currentUser.hp} - ${baseHPLoss} = ${newGameState.hp}`,
    });

    console.log("🎯 Auto earn - Sending game state:", newGameState);
    console.log(
      "🎯 Auto earn - Expected result: HP decreased by",
      baseHPLoss,
      ", ruby increased by",
      autoEarnCoins
    );

    // Add detailed logging for the request
    console.log("📤 Auto earn - API Request details:", {
      url: `/api/sync/${encodeURIComponent(userId)}`,
      method: "POST",
      body: newGameState,
      expectedCoinIncrease: autoEarnCoins,
    });

    // Sync the updated state using the sync API
    const syncResponse = await fetch(
      `/api/sync/${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGameState),
      }
    );

    if (syncResponse.ok) {
      const result = await syncResponse.json();
      console.log("🎯 Auto earn sync API success:", result);

      // Check if ruby actually increased
      const expectedRuby =
        (currentUser.coinCount || currentUser.ruby || 0) + autoEarnCoins;
      const actualRuby = result.data.ruby || 0;

      console.log("🔍 Auto earn result verification:", {
        expectedRuby: expectedRuby,
        actualRuby: actualRuby,
        rubyDifference:
          actualRuby - (currentUser.coinCount || currentUser.ruby || 0),
        success:
          actualRuby >= expectedRuby
            ? "✅ Ruby increased correctly"
            : "❌ Ruby not increased properly",
      });

      // Update UI if possible and result is successful
      if (result.success && result.data) {
        // Store current user level for HP display calculation
        if (typeof window !== "undefined") {
          window.currentUser = result.data;
        }

        // Update displays using the actual returned data
        updateCoinsDisplay(result.data.coins || 0);
        updateRubyDisplay(result.data.ruby || 0);
        updateHPDisplay(result.data.hp || 0);

        // Update SMG display if available
        if (result.data.smg !== undefined) {
          updateSMGDisplay(result.data.smg);
        }

        console.log("✅ Auto earn UI updated:", {
          coins: result.data.coins,
          ruby: result.data.ruby,
          hp: result.data.hp,
          smg: result.data.smg,
        });
      } else {
        console.log("❌ Auto earn sync result not successful:", result);
      }
    } else {
      const errorText = await syncResponse.text();
      console.log(
        "❌ Auto earn sync API failed:",
        syncResponse.status,
        errorText
      );
    }
  } catch (error) {
    console.log("❌ Auto earn API error:", error);
  }
}

// Update coins display (if elements exist)
function updateCoinsDisplay(coins) {
  const coinSelectors = [
    "[data-coins]",
    ".coins-display",
    "#coins-count",
    ".coin-count",
    "#coin-display",
  ];

  coinSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element) {
        element.textContent = coins.toLocaleString();
      }
    });
  });

  console.log("💰 Coins display updated:", coins);
}

// Update ruby display (if elements exist)
function updateRubyDisplay(ruby) {
  const rubySelectors = [
    "[data-ruby]",
    ".ruby-display",
    "#ruby-count",
    ".text-yellow-300.font-bold", // Exchange page ruby display
    ".ruby-count",
  ];

  rubySelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element) {
        element.textContent = ruby.toLocaleString();
      }
    });
  });

  console.log("💎 Ruby display updated:", ruby);
}

// Update SMG display (if elements exist)
function updateSMGDisplay(smg) {
  const smgSelectors = [
    "[data-smg]",
    ".smg-display",
    "#smg-count",
    ".text-gray-200.font-bold", // Exchange page SMG display
    ".smg-count",
  ];

  smgSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element) {
        element.textContent = smg ? smg.toLocaleString() : "0";
      }
    });
  });

  console.log("🪙 SMG display updated:", smg);
}

// Update HP display (if elements exist)
function updateHPDisplay(hp) {
  const hpSelectors = ["[data-hp]", ".hp-display", "#hp-count", ".hp-count"];

  hpSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element) {
        // For HP display, we need to calculate the percentage format
        if (element.textContent.includes("/")) {
          // Get the max HP display value from the existing format
          const parts = element.textContent.split("/");
          if (parts.length === 2) {
            const maxHPDisplay = parseInt(parts[1].trim()) || 100;

            // Calculate current HP display based on the same logic as other files
            // We need to get the user's level to calculate maxHP properly
            let userLevel = 1;

            // Try to get level from global variables
            if (typeof currentUser !== "undefined" && currentUser.level) {
              userLevel = currentUser.level;
            } else if (typeof gameState !== "undefined" && gameState.level) {
              userLevel = gameState.level;
            } else if (
              typeof window.currentUser !== "undefined" &&
              window.currentUser.level
            ) {
              userLevel = window.currentUser.level;
            }

            // Calculate maxHP using the same getLevelHP function logic
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
            ];

            function getLevelHP(level) {
              if (level <= 0 || level > DAILY_POINT_LIMITS.length) return 2400;
              const dailyLimit = DAILY_POINT_LIMITS[level - 1];
              if (dailyLimit === 0) return 2400;
              return dailyLimit;
            }

            const maxHP = getLevelHP(userLevel);
            const hpDisplay = Math.round(maxHP / 24);
            const currentHPDisplay = Math.round((hp / maxHP) * hpDisplay);

            element.textContent = `${currentHPDisplay} / ${hpDisplay}`;

            console.log("❤️ HP display updated (percentage format):", {
              rawHP: hp,
              userLevel: userLevel,
              maxHP: maxHP,
              hpDisplay: hpDisplay,
              currentHPDisplay: currentHPDisplay,
              displayText: `${currentHPDisplay} / ${hpDisplay}`,
            });
          }
        } else {
          element.textContent = hp.toLocaleString();
        }
      }
    });
  });

  console.log("❤️ HP display updated:", hp);
}

// Toggle auto earn function
function toggleAutoEarn() {
  const button = document.getElementById("auto-earn-button");
  const navItem = document.getElementById("nav-auto-earn");

  console.log("🔄 Toggle auto earn called");
  console.log("🔄 Button exists:", !!button);
  console.log(
    "🔄 Button active:",
    button && button.classList.contains("active")
  );
  console.log("🔄 Current page:", window.location.pathname);

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
    console.log(
      "🟢 Auto earn enabled - 2s interval with level-based coins (1/4 of level)"
    );
    console.log(
      "🟢 Page type:",
      window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/"
        ? "Main page (tap function)"
        : "Other page (API calls)"
    );
  }
}

// Handle visibility change to pause/resume auto earn
function handleVisibilityChange() {
  const button = document.getElementById("auto-earn-button");
  const isAutoEarnEnabled = button && button.classList.contains("active");

  console.log("👁️ Visibility changed:", document.visibilityState);
  console.log("👁️ Auto earn enabled:", isAutoEarnEnabled);
  console.log("👁️ Auto earn active:", isAutoEarnActive);

  if (document.visibilityState === "hidden") {
    if (isAutoEarnEnabled && isAutoEarnActive) {
      console.log(
        "⏸️ Tab hidden - Auto earn will pause (interval continues but no actions)"
      );
      // Don't stop the interval, just let the visibility check in startAutoEarn handle it
    }
  } else if (document.visibilityState === "visible") {
    // Resume audio context when tab becomes visible
    resumeAudioContext();

    if (isAutoEarnEnabled) {
      if (!isAutoEarnActive) {
        // Restart auto earn if it was enabled but stopped
        startAutoEarn();
        console.log("▶️ Tab visible - Auto earn restarted");
      } else {
        console.log("▶️ Tab visible - Auto earn will resume (already active)");
      }
    } else {
      console.log("👁️ Tab visible - Auto earn not enabled");
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
