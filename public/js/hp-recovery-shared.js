// =====================
// HP Recovery Shared Logic
// =====================

// HP Recovery Function (shared across all pages)
async function recoverHP() {
  try {
    // Get telegramUserId from global scope (set by main page)
    let currentTelegramUserId = null;

    // Try to get from global variables
    if (typeof telegramUserId !== "undefined" && telegramUserId) {
      currentTelegramUserId = telegramUserId;
    } else if (
      typeof window.telegramUserId !== "undefined" &&
      window.telegramUserId
    ) {
      currentTelegramUserId = window.telegramUserId;
    } else {
      // Fallback: try to get from Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        currentTelegramUserId = user?.id?.toString();
      }
    }

    if (!currentTelegramUserId) {
      console.warn("⚠️ No telegramUserId available for HP recovery");
      return;
    }

    // Load current game state from server
    const response = await fetch(`/api/user/${currentTelegramUserId}`);
    if (!response.ok) {
      console.warn("⚠️ Failed to load game state for HP recovery");
      return;
    }

    const result = await response.json();
    if (!result.success || !result.data) {
      console.warn("⚠️ No valid game state for HP recovery");
      return;
    }

    const serverData = result.data;
    const currentTime = Date.now();

    // Initialize lastRecover if not set
    if (!serverData.lastRecover) {
      serverData.lastRecover = currentTime;
      console.log("🔄 First time recovery - setting lastRecover to now");
    }

    const timeSinceLastRecover = currentTime - serverData.lastRecover;
    const minutesSinceLastRecover = Math.floor(
      timeSinceLastRecover / (60 * 1000)
    );

    console.log(
      `⏰ HP Recovery Check - Minutes since last recover: ${minutesSinceLastRecover}`
    );
    console.log(
      `⏰ Time since last recover: ${timeSinceLastRecover}ms (need ${
        3 * 60 * 1000
      }ms)`
    );

    // Check if 3 minutes have passed
    if (timeSinceLastRecover >= 3 * 60 * 1000) {
      // Calculate max HP for current level
      const maxHP = getLevelHP(serverData.level || 1);
      const recoveryAmount = Math.floor(maxHP * 0.02); // 2% of max HP

      console.log(
        `💚 HP Recovery triggered! Max HP: ${maxHP}, Recovery: ${recoveryAmount} (2%)`
      );

      // Only recover if HP is below max
      if (serverData.hp < maxHP) {
        const oldHP = serverData.hp;
        const newHP = Math.min(maxHP, serverData.hp + recoveryAmount);

        console.log(
          `💚 HP Recovered: ${oldHP} → ${newHP} (+${recoveryAmount})`
        );

        // Sync HP recovery with server
        const updateResponse = await fetch(
          `/api/user/${currentTelegramUserId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hp: newHP,
              lastRecover: currentTime,
            }),
          }
        );

        if (updateResponse.ok) {
          console.log(
            `💚 HP Recovery synced to server: ${oldHP} → ${newHP} (+${recoveryAmount})`
          );

          // Update HP display on current page
          updateHPDisplayAfterRecovery(newHP, serverData.level || 1);

          // Also trigger fetchUserData if available to refresh all UI elements
          if (typeof fetchUserData === "function") {
            console.log(
              "🔄 Triggering fetchUserData to refresh UI after HP recovery"
            );
            await fetchUserData();
          }
        } else {
          console.warn("⚠️ Failed to sync HP recovery with server");
        }
      } else {
        console.log(
          `💚 HP already at max (${serverData.hp}/${maxHP}) - no recovery needed`
        );
        // Still update lastRecover to prevent continuous checking
        await fetch(`/api/user/${telegramUserId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastRecover: currentTime,
          }),
        });
      }
    } else {
      const remainingMinutes = Math.ceil(
        (3 * 60 * 1000 - timeSinceLastRecover) / (60 * 1000)
      );
      console.log(`⏰ Next HP recovery in ${remainingMinutes} minutes`);
    }
  } catch (error) {
    console.warn("⚠️ Error in HP recovery:", error);
  }
}

// Calculate HP for a given level (same logic as server and other files)
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
  ];

  // Return the daily point limit as max HP for the level
  if (level <= 0 || level > DAILY_POINT_LIMITS.length) return 2400; // Default for invalid levels
  const dailyLimit = DAILY_POINT_LIMITS[level - 1];
  if (dailyLimit === 0) return 2400; // Default for ruby levels (Level 1 equivalent)
  return dailyLimit; // Return actual HP points
}

// Initialize HP recovery timer when script loads
console.log("🛡️ HP Recovery Shared Logic initialized");
console.log("⏰ Starting HP recovery timer (every 30 seconds)");

// Start HP recovery interval - check every 30 seconds for faster response
setInterval(recoverHP, 30 * 1000); // Every 30 seconds

// Run initial recovery check
setTimeout(recoverHP, 1000); // After 1 second to ensure page is loaded
