// Tap to Earn Game Logic
// Author: GitHub Copilot
// File: public/js/taptoearn.js
// Mô tả: Chứa toàn bộ logic game "Tap to Earn" với comment chi tiết, dễ hiểu

// =====================
// 1. Cấu hình các mốc level, HP, coin, v.v.
// =====================

// Điểm cần để lên cấp (level 1 -> 100) - NEW SYSTEM
const LEVEL_UP_REQUIREMENTS = [
  6408, // Level 1: 267 taps × 24 = 6,408 points
  10416, // Level 2: 434 taps × 24 = 10,416 points
  13872, // Level 3: 578 taps × 24 = 13,872 points
  15552, // Level 4: 648 taps × 24 = 15,552 points
  17232, // Level 5: 718 taps × 24 = 17,232 points
  18912, // Level 6: 788 taps × 24 = 18,912 points
  20592, // Level 7: 858 taps × 24 = 20,592 points
  22272, // Level 8: 928 taps × 24 = 22,272 points
  23952, // Level 9: 998 taps × 24 = 23,952 points
  25632, // Level 10: 1,068 taps × 24 = 25,632 points
  31104, // Level 11: 1,296 taps × 24 = 31,104 points
  33696, // Level 12: 1,404 taps × 24 = 33,696 points
  36288, // Level 13: 1,512 taps × 24 = 36,288 points
  38880, // Level 14: 1,620 taps × 24 = 38,880 points
  41472, // Level 15: 1,728 taps × 24 = 41,472 points
  44064, // Level 16: 1,836 taps × 24 = 44,064 points
  46656, // Level 17: 1,944 taps × 24 = 46,656 points
  49248, // Level 18: 2,052 taps × 24 = 49,248 points
  51840, // Level 19: 2,160 taps × 24 = 51,840 points
  54432, // Level 20: 2,268 taps × 24 = 54,432 points
  65472, // Level 21: 2,728 taps × 24 = 65,472 points
  68448, // Level 22: 2,852 taps × 24 = 68,448 points
  71424, // Level 23: 2,976 taps × 24 = 71,424 points
  74400, // Level 24: 3,100 taps × 24 = 74,400 points
  77376, // Level 25: 3,224 taps × 24 = 77,376 points
  80352, // Level 26: 3,348 taps × 24 = 80,352 points
  83328, // Level 27: 3,472 taps × 24 = 83,328 points
  86304, // Level 28: 3,596 taps × 24 = 86,304 points
  89280, // Level 29: 3,720 taps × 24 = 89,280 points
  92256, // Level 30: 3,844 taps × 24 = 92,256 points
  110880, // Level 31: 4,620 taps × 24 = 110,880 points
  117600, // Level 32: 4,900 taps × 24 = 117,600 points
  124320, // Level 33: 5,180 taps × 24 = 124,320 points
  131040, // Level 34: 5,460 taps × 24 = 131,040 points
  137760, // Level 35: 5,740 taps × 24 = 137,760 points
  144480, // Level 36: 6,020 taps × 24 = 144,480 points
  151200, // Level 37: 6,300 taps × 24 = 151,200 points
  157920, // Level 38: 6,580 taps × 24 = 157,920 points
  164640, // Level 39: 6,860 taps × 24 = 164,640 points
  171360, // Level 40: 7,140 taps × 24 = 171,360 points
  198432, // Level 41: 8,268 taps × 24 = 198,432 points
  206016, // Level 42: 8,584 taps × 24 = 206,016 points
  213600, // Level 43: 8,900 taps × 24 = 213,600 points
  221184, // Level 44: 9,216 taps × 24 = 221,184 points
  228768, // Level 45: 9,532 taps × 24 = 228,768 points
  236352, // Level 46: 9,848 taps × 24 = 236,352 points
  243936, // Level 47: 10,164 taps × 24 = 243,936 points
  251520, // Level 48: 10,480 taps × 24 = 251,520 points
  259104, // Level 49: 10,796 taps × 24 = 259,104 points
  0, // Level 50: Ruby level
  329472, // Level 51: 13,728 taps × 24 = 329,472 points
  338400, // Level 52: 14,100 taps × 24 = 338,400 points
  347328, // Level 53: 14,472 taps × 24 = 347,328 points
  356256, // Level 54: 14,844 taps × 24 = 356,256 points
  365184, // Level 55: 15,216 taps × 24 = 365,184 points
  374112, // Level 56: 15,588 taps × 24 = 374,112 points
  383040, // Level 57: 15,960 taps × 24 = 383,040 points
  391968, // Level 58: 16,332 taps × 24 = 391,968 points
  400896, // Level 59: 16,704 taps × 24 = 400,896 points
  409824, // Level 60: 17,076 taps × 24 = 409,824 points
  487296, // Level 61: 20,304 taps × 24 = 487,296 points
  502848, // Level 62: 20,952 taps × 24 = 502,848 points
  518400, // Level 63: 21,600 taps × 24 = 518,400 points
  533952, // Level 64: 22,248 taps × 24 = 533,952 points
  549504, // Level 65: 22,896 taps × 24 = 549,504 points
  565056, // Level 66: 23,544 taps × 24 = 565,056 points
  580608, // Level 67: 24,192 taps × 24 = 580,608 points
  596160, // Level 68: 24,840 taps × 24 = 596,160 points
  611712, // Level 69: 25,488 taps × 24 = 611,712 points
  627264, // Level 70: 26,136 taps × 24 = 627,264 points
  // Continue with existing values for levels 71-100 (keeping original structure)
  6498000,
  7147000,
  7797600,
  8447400,
  0, // 71-74, 75 là ruby
  9747000,
  10396800,
  11046600,
  11696400,
  0, // 76-79, 80 là ruby
  12346200,
  13580820,
  14815440,
  16050060,
  0, // 81-84, 85 là ruby
  18519300,
  19753920,
  20988540,
  22223160,
  0, // 86-89, 90 là ruby
  23457780,
  26976448,
  30495114,
  34013782,
  0, // 91-94, 95 là ruby
  41051116,
  44569782,
  48008450,
  0, // 96-98, 99 là ruby
];

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
  // Remaining values unchanged from previous configuration...
];

// Get daily point limit for a level
function getDailyPointLimit(level) {
  if (level <= 0 || level > DAILY_POINT_LIMITS.length) return 0;
  return DAILY_POINT_LIMITS[level - 1] || 0;
}

// Số coin mỗi lần tap theo từng mốc level - DEPRECATED: Now using HP_LOSS_BY_LEVEL table
const TAP_COIN_BY_LEVEL = [
  { from: 1, to: 100, value: 24 }, // DEPRECATED: Coin rewards now match HP loss values
];

// HP loss per tap by level
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

// Get HP loss for a specific level
function getHPLoss(level) {
  if (level <= 0 || level > HP_LOSS_BY_LEVEL.length) return 24; // Default
  const hpLoss = HP_LOSS_BY_LEVEL[level - 1];
  return hpLoss === 0 ? 24 : hpLoss; // Use default for ruby levels
}

// =====================
// 2. Hàm tính toán các giá trị động
// =====================

// Tính tổng HP cho mỗi level - NEW LOGIC
function getLevelHP(level) {
  // NEW LOGIC: Return the daily point limit as max HP for the level
  // This is the denominator - the maximum HP for this level
  // HP is now stored as actual HP points (e.g., 23040 for level 1)
  // When leveling up, remaining HP (numerator) stays the same, only max HP (denominator) changes
  const dailyLimit = getDailyPointLimit(level);
  if (dailyLimit === 0) return 2400; // Default for ruby levels (Level 1 equivalent)
  return dailyLimit; // Return actual HP points, not divided by 24
}

// Tính số coin mỗi lần tap cho level hiện tại - NEW: Use HP loss as coin reward
function getTapCoin(level) {
  // NEW: Return HP loss value as coin reward
  return getHPLoss(level);
}

// Tính % MT nâng cấp (upgrade multiplier) - SIMPLIFIED
function getUpgradeMultiplier(level) {
  // SIMPLIFIED: No upgrade multiplier, always 1
  return 1;
}

// Lấy điểm cần để lên cấp cho level hiện tại
function getLevelUpRequirement(level) {
  // Level 1 cần LEVEL_UP_REQUIREMENTS[0] để lên level 2
  // Level 2 cần LEVEL_UP_REQUIREMENTS[1] để lên level 3, v.v.
  const requirement = LEVEL_UP_REQUIREMENTS[level - 1] || 0;
  console.log(
    `Level ${level} requires ${requirement} coins to level up to ${level + 1}`
  );
  return requirement;
}

// Tính tổng coin cần thiết để đạt level cụ thể
function getTotalCoinsForLevel(level) {
  if (level <= 1) return 0; // Level 1 không cần coin để đạt được
  let total = 0;
  for (let i = 0; i < level - 1; i++) {
    total += LEVEL_UP_REQUIREMENTS[i] || 0;
  }
  return total;
}

// Kiểm tra xem có thể lên level không
function canLevelUp(currentLevel, totalCoins) {
  const currentLevelRequirement = getLevelUpRequirement(currentLevel);

  console.log(`Level up check: Current level ${currentLevel}`);
  console.log(`- Total coins: ${totalCoins}`);
  console.log(`- Current level requirement: ${currentLevelRequirement}`);
  console.log(`- Can level up: ${totalCoins >= currentLevelRequirement}`);

  return (
    currentLevelRequirement > 0 &&
    totalCoins >= currentLevelRequirement &&
    currentLevel < 100
  );
}

// =====================
// 3. Lưu & lấy trạng thái game từ localStorage
// =====================

function saveGameState(state) {
  localStorage.setItem("taptoearn_state", JSON.stringify(state));
}

function loadGameState() {
  const data = localStorage.getItem("taptoearn_state");
  if (data) return JSON.parse(data);
  // Trạng thái mặc định - bắt đầu từ level 1
  return {
    level: 1,
    hp: getLevelHP(1), // HP dùng công thức level 1
    coinCount: 0,
    lastRecover: Date.now(),
    lastZeroHP: null,
  };
}

// =====================
// 4. Cập nhật UI
// =====================

function updateUI(state) {
  console.log("updateUI called with state:", state);

  // Cập nhật HP
  const maxHP = getLevelHP(state.level);
  const hpPercentage = Math.max(0, Math.min(100, (state.hp / maxHP) * 100));

  console.log(
    "Updating HP display:",
    state.hp,
    "/",
    maxHP,
    "Percentage:",
    hpPercentage
  );

  // Cập nhật text HP
  const hpElement = document.getElementById("hp-per-level");
  if (hpElement) {
    hpElement.textContent = `${state.hp}/${maxHP}`;
    console.log("HP element updated to:", hpElement.textContent);
  } else {
    console.error("HP element not found!");
  }

  // Cập nhật thanh progress HP và progress-icon
  const progressBar = document.querySelector(".progress-bar");
  const progressIcon = document.querySelector(".progress-icon");
  const progressContainer = document.querySelector(".hp-progress-container");

  if (progressBar) {
    progressBar.style.width = `${hpPercentage}%`;
  }

  if (progressIcon && progressContainer) {
    const containerWidth = progressContainer.offsetWidth;
    const newPosition = (containerWidth * hpPercentage) / 100;
    progressIcon.style.left = `${newPosition}px`;
  }

  // Cập nhật tổng coin (ruby count)
  document.getElementById("coin-count").textContent = state.coinCount;

  // Cập nhật level text
  const hpLevelElement = document.getElementById("hp-level");
  const lpLevelElement = document.getElementById("lp-level");

  if (hpLevelElement) {
    hpLevelElement.textContent = `${state.level}`;
    console.log("HP Level element updated to:", hpLevelElement.textContent);
  } else {
    console.error("HP Level element not found!");
  }

  if (lpLevelElement) {
    lpLevelElement.textContent = `${state.level}/100`;
    console.log("MT Level element updated to:", lpLevelElement.textContent);
  } else {
    console.error("MT Level element not found!");
  }

  // Tính phần trăm tiến trình level
  const currentLevelRequirement = getLevelUpRequirement(state.level);
  let levelProgress = 0;

  if (currentLevelRequirement > 0) {
    // Tính coin đã có cho level hiện tại
    const totalCoinsForCurrentLevel = getTotalCoinsForLevel(state.level);
    const coinsForThisLevel = state.coinCount - totalCoinsForCurrentLevel;

    // Tính progress dựa trên coin cần cho level hiện tại
    levelProgress = Math.min(
      100,
      Math.max(0, (coinsForThisLevel / currentLevelRequirement) * 100)
    );

    console.log(
      `Level progress: ${coinsForThisLevel}/${currentLevelRequirement} = ${levelProgress.toFixed(
        1
      )}%`
    );
  }

  // Cập nhật cả 2 thanh level progress
  const levelBars = document.querySelectorAll(".level-progress-bar");
  const levelIcons = document.querySelectorAll(".level-progress-icon");

  levelBars.forEach((bar) => {
    bar.style.width = `${levelProgress}%`;
  });

  levelIcons.forEach((icon) => {
    const container = icon.closest(
      ".hp-level-progress-container, .lp-level-progress-container"
    );
    if (container) {
      const containerWidth = container.offsetWidth;
      const newPosition = (containerWidth * levelProgress) / 100;
      icon.style.left = `${newPosition}px`;
    }
  });
}

// =====================
// 5. Xử lý tap
// =====================

function tap(event, multiplier = 1) {
  let state = loadGameState();
  console.log("Tap called - Current HP:", state.hp, "Multiplier:", multiplier);

  if (state.hp <= 0) {
    console.log("Cannot tap - HP is 0 or less");
    return; // Không tap khi HP = 0
  }

  // Tạo hiệu ứng coin bay từ vị trí click/touch
  if (event) {
    const coinTarget =
      document.getElementById("coin-target-stats") ||
      document.querySelector('img[src*="coin-icon.svg"]');
    if (coinTarget) {
      // Tạo 1 coin bay từ vị trí tap
      createFlyingCoin(
        event.clientX || event.touches?.[0]?.clientX || window.innerWidth / 2,
        event.clientY || event.touches?.[0]?.clientY || window.innerHeight / 2,
        coinTarget
      );
    }

    // Kích hoạt hiệu ứng flash cho bottom layout
    triggerBottomLayoutFlash();
  }

  // Calculate HP loss and coins - NEW: Both use same base value from HP loss table
  const baseValue = getHPLoss(state.level); // Base value from HP loss table
  let actualHPLoss;
  let tapCoin;

  console.log("🔧 USING HP LOSS TABLE FOR BOTH HP AND COINS");
  console.log("=== TAP CALCULATION DEBUG ===");
  console.log("Level:", state.level);
  console.log("baseValue (from HP loss table):", baseValue);
  console.log("is3FingerTap:", multiplier === 3);
  console.log("isAutoEarn:", multiplier === 0.25);
  console.log("multiplier:", multiplier);

  if (multiplier === 0.25) {
    // Auto-earn case: base value / 4 for both HP and coins
    actualHPLoss = Math.floor(baseValue / 4);
    tapCoin = Math.floor(baseValue / 4);
    console.log("Auto-earn - HP loss:", actualHPLoss, "Coins:", tapCoin);
  } else if (multiplier === 3) {
    // 3-finger tap: exactly 3x the base value for both HP and coins
    actualHPLoss = Math.floor(baseValue * 3);
    tapCoin = Math.floor(baseValue * 3);
    console.log("3-finger tap - HP loss:", actualHPLoss, "Coins:", tapCoin);
  } else {
    // Normal tap: exactly equals base value for both HP and coins
    actualHPLoss = baseValue;
    tapCoin = baseValue;
    console.log("Normal tap - HP loss:", actualHPLoss, "Coins:", tapCoin);
  }

  // Apply HP loss
  const oldHP = state.hp;
  state.hp -= actualHPLoss;
  console.log(
    "HP changed from",
    oldHP,
    "to",
    state.hp,
    "(-" + actualHPLoss + " HP)"
  );

  // Add coins
  console.log("Coin earned:", tapCoin);
  state.coinCount += tapCoin;
  console.log("Total ruby count:", state.coinCount);

  // Nếu HP về 0 hoặc âm, xử lý kết thúc lượt
  if (state.hp <= 0) {
    console.log("HP reached 0 or below, processing end of round");
    state.hp = 0; // Đảm bảo HP hiển thị là 0
    state.lastRecover = Date.now();
    state.lastZeroHP = Date.now();
    console.log("Round ended - Total coins:", state.coinCount, "HP set to 0");

    // Lưu state và cập nhật UI ngay để hiển thị HP = 0
    saveGameState(state);
    updateUI(state);

    // Kiểm tra lên cấp sau một delay nhỏ để giao diện kịp hiển thị HP = 0
    setTimeout(() => {
      let currentState = loadGameState();

      console.log(
        `Checking level up: Current level ${currentState.level}, Current coins ${currentState.coinCount}`
      );

      if (canLevelUp(currentState.level, currentState.coinCount)) {
        console.log("Level up conditions met!");
        const oldLevel = currentState.level;
        currentState.level++;

        // FIXED: Level up logic simplified since coins are added directly to coinCount
        console.log(`🎉 LEVEL UP! ${oldLevel} → ${currentState.level}`);
        console.log(`Ruby count after level up: ${currentState.coinCount}`);

        // Kiểm tra các mốc level đặc biệt
        if (currentState.level % 10 === 0) {
          // Thông báo đạt mốc level quan trọng
          if (typeof showTelegramAlert === "function") {
            showTelegramAlert(
              `🎉 Chúc mừng! Bạn đã đạt level ${currentState.level}!\n💰 Tổng coin: ${currentState.coinCount}`
            );
          }
        }

        saveGameState(currentState);
        updateUI(currentState);
        console.log("Level up completed - State saved and UI updated");

        // Hiển thị popup level up chỉ khi không phải lần đầu load
        if (!isInitialLoad && gameInitialized) {
          showLevelUpPopupInGame(currentState.level);
        }

        // Kiểm tra lại state sau khi lưu
        setTimeout(() => {
          const verifyState = loadGameState();
          console.log("Verification - State after level up:", verifyState);
          updateUI(verifyState);
        }, 100);
      } else {
        console.log("Level up conditions NOT met");
      }
    }, 500); // Delay 500ms để giao diện kịp hiển thị HP = 0

    return; // Kết thúc hàm sớm khi HP = 0
  }

  // Kiểm tra lên cấp (chỉ khi HP > 0)
  if (canLevelUp(state.level, state.coinCount)) {
    const oldLevel = state.level;
    state.level++;

    // FIXED: Level up logic simplified since coins are added directly to coinCount
    console.log(`🎉 LEVEL UP! ${oldLevel} → ${state.level}`);
    console.log(`Ruby count after level up: ${state.coinCount}`);

    // Kiểm tra các mốc level đặc biệt
    if (state.level % 10 === 0) {
      // Thông báo đạt mốc level quan trọng
      if (typeof showTelegramAlert === "function") {
        showTelegramAlert(
          `🎉 Chúc mừng! Bạn đã đạt level ${state.level}!\n💰 Tổng coin: ${state.coinCount}`
        );
      }
    }

    // Hiển thị popup level up chỉ khi không phải lần đầu load
    if (!isInitialLoad && gameInitialized) {
      showLevelUpPopupInGame(state.level);
    }
  }

  console.log("Final state before save:", state);
  saveGameState(state);
  updateUI(state);
}

// Thêm hàm tạo coin bay
function createFlyingCoin(startX, startY, targetElement) {
  const coinContainer = document.createElement("div");
  coinContainer.className = "coin-container";
  document.body.appendChild(coinContainer);

  const coin = document.createElement("div");
  coin.className = "flying-coin";

  // Vị trí bắt đầu
  coin.style.left = `${startX}px`;
  coin.style.top = `${startY}px`;

  // Tìm target element nếu không được truyền vào
  if (!targetElement) {
    targetElement =
      document.getElementById("coin-target-stats") ||
      document.getElementById("coin-target") ||
      document.querySelector('img[src*="coin-icon.svg"]');
  }

  // Nếu vẫn không tìm thấy target, sử dụng vị trí mặc định
  if (!targetElement) {
    console.warn("No target element found for flying coin");
    // Sử dụng vị trí coin counter làm target mặc định
    const tx = window.innerWidth / 2 - startX;
    const ty = 50 - startY; // Vị trí gần coin counter
    coin.style.setProperty("--tx", `${tx}px`);
    coin.style.setProperty("--ty", `${ty}px`);
  } else {
    // Tính toán vị trí đích (icon coin)
    const targetRect = targetElement.getBoundingClientRect();
    const tx = targetRect.left - startX + targetRect.width / 2;
    const ty = targetRect.top - startY + targetRect.height / 2;

    // Set biến CSS cho animation
    coin.style.setProperty("--tx", `${tx}px`);
    coin.style.setProperty("--ty", `${ty}px`);
  }

  coinContainer.appendChild(coin);

  // Xóa coin sau khi animation kết thúc
  coin.addEventListener("animationend", () => {
    coinContainer.remove();
  });
}

// =====================
// 6. Hồi phục HP theo thời gian
// =====================

function recoverHP() {
  let state = loadGameState();
  if (state.hp >= getLevelHP(state.level)) return;

  const now = Date.now();

  // Nếu HP = 0, kiểm tra đã qua 3 phút chưa
  if (state.hp === 0) {
    if (!state.lastZeroHP) return; // Chưa có thời điểm hết máu
    const msPassed = now - state.lastZeroHP;
    if (msPassed < 3 * 60 * 1000) return; // Chưa đủ 3 phút thì không hồi máu

    // Đủ 3 phút thì bắt đầu hồi máu
    const maxHP = getLevelHP(state.level);
    state.hp = Math.floor((maxHP * 2) / 100); // Hồi 2% HP để bắt đầu
    state.lastRecover = now;
    state.lastZeroHP = null; // Reset để không lặp lại
    saveGameState(state);
    updateUI(state);
    return;
  }

  // HP > 0, hồi máu mỗi 3 phút
  const msPassed = now - state.lastRecover;
  const threeMinutes = 3 * 60 * 1000; // 3 phút = 180,000ms

  if (msPassed >= threeMinutes) {
    // Tính số lần 3 phút đã qua
    const recoveryIntervals = Math.floor(msPassed / threeMinutes);
    const recoverPercent = recoveryIntervals * 2; // 2% mỗi 3 phút

    if (recoverPercent > 0) {
      const maxHP = getLevelHP(state.level);
      const recoveryAmount = Math.floor((maxHP * recoverPercent) / 100);
      state.hp = Math.min(maxHP, state.hp + recoveryAmount);

      // Cập nhật lastRecover để tránh hồi liên tục
      state.lastRecover = now - (msPassed % threeMinutes);

      saveGameState(state);
      updateUI(state);

      console.log(
        `🩹 Recovered ${recoverPercent}% HP (${recoveryAmount} points) after ${recoveryIntervals} intervals`
      );
    }
  }
}

// =====================
// 7. Khởi tạo game khi load trang
// =====================

document.addEventListener("DOMContentLoaded", function () {
  console.log("Game initialization started");

  // Ẩn popup level up khi khởi tạo - đảm bảo hoàn toàn ẩn
  const popup = document.getElementById("level-up-popup");
  if (popup) {
    popup.classList.remove("show");
    popup.style.display = "none";
    popup.style.opacity = "0";
    popup.style.visibility = "hidden";
    popup.style.pointerEvents = "none";
    console.log("Level up popup completely hidden on initialization");
  }

  // Thêm event listener cho nút Confirm trong popup
  const confirmBtn = document.getElementById("level-up-confirm-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log("Confirm button clicked via event listener");
        closeLevelUpPopup();
        return false;
      },
      true
    ); // Use capture phase
    console.log("Level up confirm button event listener added");
  }

  // Thêm event listener để đóng popup khi click vào backdrop
  if (popup) {
    popup.addEventListener("click", function (e) {
      if (e.target === popup) {
        console.log("Backdrop clicked, closing popup");
        e.preventDefault();
        e.stopPropagation();
        closeLevelUpPopup();
      }
    });

    // Ngăn event bubbling từ popup content
    const popupContent = popup.querySelector(".level-up-content");
    if (popupContent) {
      popupContent.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    console.log("Popup backdrop click listener added");
  }

  // Cập nhật UI lần đầu
  let initialState = loadGameState();

  // Khởi tạo previousLevel với level hiện tại
  previousLevel = initialState.level;
  console.log("Initialized previousLevel to:", previousLevel);

  updateUI(initialState);

  // Gắn sự kiện tap cho bottom-tap-area
  const bottomTapArea = document.getElementById("bottom-tap-area");
  if (bottomTapArea) {
    bottomTapArea.addEventListener("click", function (event) {
      console.log("Bottom tap area clicked");
      tap(event);
    });

    bottomTapArea.addEventListener("touchstart", function (event) {
      console.log("Bottom tap area touched");
      event.preventDefault(); // Prevent default touch behavior
      tap(event);
    });

    console.log("Bottom tap area event listeners added");
  }

  // Gắn sự kiện tap cho stats-panel với event
  document
    .getElementById("stats-panel")
    .addEventListener("click", function (event) {
      console.log("Stats panel clicked");
      tap(event);
    });

  // Gắn sự kiện tap cho main-stage với event
  document
    .getElementById("main-stage")
    .addEventListener("click", function (event) {
      console.log("Main stage clicked");
      tap(event);
    });

  // Hồi phục HP mỗi phút
  setInterval(recoverHP, 60 * 1000);

  console.log(
    "Game initialization completed - popup will be enabled after delay"
  );

  // Thêm delay 3 giây trước khi cho phép popup hiển thị
  setTimeout(() => {
    gameInitialized = true;
    isInitialLoad = false; // Đánh dấu đã hoàn tất khởi tạo
    console.log(
      "Popup now truly enabled after delay, isInitialLoad set to false"
    );
  }, 3000);
});

// Xử lý riêng cho nút auto earn
console.log("Setting up auto earn button handler");
const autoEarnButton = document.getElementById("auto-earn-button");

if (autoEarnButton) {
  console.log("Auto earn button found, adding click handler");

  // Xóa tất cả event listener cũ (nếu có)
  const newButton = autoEarnButton.cloneNode(true);
  autoEarnButton.parentNode.replaceChild(newButton, autoEarnButton);

  // Thêm event listener mới
  newButton.onclick = function (e) {
    console.log("Auto earn button clicked - direct handler");
    e.stopPropagation(); // Ngăn event bubbling
    const isAutoEarnOn = !this.classList.contains("active");
    console.log("Auto earn state will change to:", isAutoEarnOn);
    toggleAutoEarn(this, isAutoEarnOn);
  };
} else {
  console.error("Auto earn button not found - direct check");
}

// =====================
// 8. Ghi chú
// =====================
// - Có thể mở rộng thêm hiệu ứng, âm thanh, animation khi tap hoặc lên cấp.
// - Có thể thêm nút riêng cho tap nếu không muốn tap toàn bộ stats-panel.
// - Có thể tối ưu lưu trạng thái để tránh ghi localStorage quá nhiều nếu cần.

// =====================
// 9. Level Up Popup Functions
// =====================

function showLevelUpPopupInGame(newLevel) {
  console.log(
    "Checking level up popup for level",
    newLevel,
    "Previous level:",
    previousLevel,
    "Game initialized:",
    gameInitialized,
    "Is initial load:",
    isInitialLoad
  );

  // Chỉ hiển thị popup nếu game đã khởi tạo xong và không phải lần đầu load
  if (!gameInitialized || isInitialLoad) {
    console.log(
      "Game not initialized yet or is initial load, not showing popup"
    );
    return;
  }

  // Chỉ hiển thị popup nếu level thực sự tăng lên (không bằng hoặc nhỏ hơn)
  if (previousLevel === null || newLevel <= previousLevel) {
    console.log(
      "Level did not increase, not showing popup. Previous:",
      previousLevel,
      "New:",
      newLevel
    );
    return;
  }

  // Thêm kiểm tra bổ sung: chỉ hiển thị nếu level tăng đúng 1 bậc
  if (newLevel !== previousLevel + 1) {
    console.log(
      "Level jump is not exactly +1, not showing popup. Previous:",
      previousLevel,
      "New:",
      newLevel
    );
    previousLevel = newLevel; // Cập nhật previousLevel nhưng không hiển thị popup
    return;
  }

  console.log(
    "Showing level up popup for level",
    newLevel,
    "from actual gameplay"
  );
  const popup = document.getElementById("level-up-popup");
  if (popup) {
    // Cập nhật nội dung popup
    const titleElement = popup.querySelector(".level-up-title");
    if (titleElement) {
      titleElement.textContent = `Level ${newLevel}!`;
    }

    // Hiển thị popup với animation
    popup.style.display = "flex";
    popup.style.opacity = "1";
    popup.style.visibility = "visible";
    popup.style.pointerEvents = "auto";
    popup.classList.add("show");
  }

  // Cập nhật level trước đó
  previousLevel = newLevel;
}

function closeLevelUpPopup() {
  console.log("closeLevelUpPopup function called");
  const popup = document.getElementById("level-up-popup");
  if (popup) {
    console.log("Popup found, hiding it");
    popup.classList.remove("show");

    // Sử dụng setTimeout để đảm bảo animation hoàn tất trước khi ẩn hoàn toàn
    setTimeout(() => {
      popup.style.display = "none";
      popup.style.opacity = "0";
      popup.style.visibility = "hidden";
      popup.style.pointerEvents = "none";
      console.log("Popup completely hidden");
    }, 300); // Đợi animation kết thúc
  } else {
    console.error("Popup not found!");
  }
}

// Thêm hàm vào global scope để có thể gọi từ HTML
window.closeLevelUpPopup = closeLevelUpPopup;

// Thêm hàm test popup để debug
window.testLevelUpPopup = function () {
  console.log("Testing level up popup");
  const popup = document.getElementById("level-up-popup");
  if (popup) {
    popup.style.display = "flex";
    popup.style.opacity = "1";
    popup.style.visibility = "visible";
    popup.style.pointerEvents = "auto";
    popup.classList.add("show");
    console.log("Test popup shown");
  } else {
    console.error("Popup not found for testing!");
  }
};

// Thêm hàm reset game để test
window.resetGame = function () {
  localStorage.removeItem("taptoearn_state");
  location.reload();
};

// Touch handler for mobile
document.addEventListener(
  "touchstart",
  function (event) {
    // Kiểm tra xem popup có đang hiển thị không
    const popup = document.getElementById("level-up-popup");
    if (popup && popup.classList.contains("show")) {
      return; // Không xử lý touch khi popup đang hiển thị
    }

    // Kiểm tra xem có phải touch vào nút auto earn không
    if (event.target.closest("#auto-earn-button")) {
      return;
    }

    // Chỉ xử lý tap khi touch vào stats-panel, main-stage hoặc bottom-tap-area
    if (
      !event.target.closest("#stats-panel") &&
      !event.target.closest("#main-stage") &&
      !event.target.closest("#bottom-tap-area")
    ) {
      return;
    }

    event.preventDefault(); // Prevent default touch behaviors
    const touchCount = event.touches.length;

    if (touchCount === 1) {
      // Single touch - normal tap
      tap(event, 1);
    } else if (touchCount === 3) {
      // Triple touch - 3x multiplier
      tap(event, 3);
    }
  },
  { passive: false }
);

// Keep click handler for desktop testing
document.addEventListener("click", function (event) {
  // Kiểm tra xem popup có đang hiển thị không
  const popup = document.getElementById("level-up-popup");
  if (popup && popup.classList.contains("show")) {
    return; // Không xử lý click khi popup đang hiển thị
  }

  // Kiểm tra xem có phải click vào nút auto earn không
  if (event.target.closest("#auto-earn-button")) {
    return;
  }

  // Chỉ xử lý tap khi click vào stats-panel, main-stage hoặc bottom-tap-area
  if (
    !event.target.closest("#stats-panel") &&
    !event.target.closest("#main-stage") &&
    !event.target.closest("#bottom-tap-area")
  ) {
    return;
  }

  if (event.pointerType !== "touch") {
    // Only handle non-touch clicks
    tap(event, 1);
  }
});

// Add at the beginning of the file
function switchToGame2() {
  try {
    // Save current game state using the existing game state
    const gameState = loadGameState();

    // Add additional state information
    const state = {
      ...gameState,
      coins: document.getElementById("coin-count").textContent,
      hp: document.getElementById("hp-per-level").textContent,
      hpLevel: document.getElementById("hp-level").textContent,
      lpLevel: document.getElementById("lp-level").textContent,
    };

    localStorage.setItem("game1State", JSON.stringify(state));
    console.log("Game state saved:", state);

    // Navigate to game 2 using the route
    window.location.href = "/game2";
  } catch (error) {
    console.error("Error switching to game 2:", error);
    // Fallback navigation
    window.location.href = "/game2";
  }
}

// Biến theo dõi trạng thái auto earn
let isAutoEarnEnabled = false;
let autoEarnInterval = null;
let previousLevel = null; // Theo dõi level trước đó để tránh hiển thị popup không cần thiết
let gameInitialized = false; // Flag để kiểm tra game đã khởi tạo xong chưa
let isInitialLoad = true; // Flag để tránh popup khi lần đầu load game

// Hàm thực hiện auto tap
function autoTap() {
  if (!isAutoEarnEnabled) return;

  // Tạo một event giả lập
  const fakeEvent = {
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight / 2,
  };

  tap(fakeEvent, 0.25); // Auto tap với 1/4 điểm
}

// Hàm bật/tắt auto earn
function toggleAutoEarn() {
  console.log("Toggle auto earn called");
  isAutoEarnEnabled = !isAutoEarnEnabled;
  console.log("Auto earn enabled:", isAutoEarnEnabled);

  if (isAutoEarnEnabled) {
    // Bật auto earn
    console.log("Starting auto earn interval");
    if (!autoEarnInterval) {
      autoEarnInterval = setInterval(autoTap, 1000);
    }
  } else {
    // Tắt auto earn
    console.log("Stopping auto earn interval");
    if (autoEarnInterval) {
      clearInterval(autoEarnInterval);
      autoEarnInterval = null;
    }
  }

  // Cập nhật giao diện nút
  const button = document.getElementById("auto-earn-button");
  if (button) {
    const buttonImg = button.querySelector("img");
    if (isAutoEarnEnabled) {
      button.classList.add("active");
      buttonImg.src = "./images/screen1/icons/auto-earn.svg";
    } else {
      button.classList.remove("active");
      buttonImg.src = "./images/screen1/icons/auto-earn-off.svg";
    }
  }
}

// Thêm event listener cho nút auto earn
window.addEventListener("load", function () {
  console.log("Window loaded, setting up auto earn button");
  const button = document.getElementById("auto-earn-button");

  if (button) {
    console.log("Found auto earn button, adding click handler");
    // Xóa tất cả event listener cũ
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Thêm event listener mới
    newButton.addEventListener(
      "click",
      function (e) {
        console.log("Auto earn button clicked");
        e.preventDefault();
        e.stopPropagation();
        toggleAutoEarn();
      },
      true
    );
  } else {
    console.error("Auto earn button not found");
  }
});

// =====================
// 10. Bottom Layout Flash Effect
// =====================

function triggerBottomLayoutFlash() {
  const bottomLayoutContainer = document.getElementById(
    "bottom-layout-container"
  );
  const characterOverlay = document.getElementById("character-overlay");

  if (bottomLayoutContainer) {
    // Remove existing flash class if any
    bottomLayoutContainer.classList.remove("flash-active");

    // Force reflow to ensure the class removal takes effect
    void bottomLayoutContainer.offsetHeight;

    // Add flash class to trigger animation
    bottomLayoutContainer.classList.add("flash-active");

    // Remove flash class after animation completes
    setTimeout(() => {
      bottomLayoutContainer.classList.remove("flash-active");
    }, 800); // Match animation duration
  }

  // Trigger character press down effect
  if (characterOverlay) {
    // Remove existing press class if any
    characterOverlay.classList.remove("character-press");

    // Force reflow to ensure the class removal takes effect
    void characterOverlay.offsetHeight;

    // Add press class to trigger animation
    characterOverlay.classList.add("character-press");

    // Remove press class after animation completes
    setTimeout(() => {
      characterOverlay.classList.remove("character-press");
    }, 800); // Match animation duration
  }
}
