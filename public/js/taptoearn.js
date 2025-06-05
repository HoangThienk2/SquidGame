// Tap to Earn Game Logic
// Author: GitHub Copilot
// File: public/js/taptoearn.js
// Mô tả: Chứa toàn bộ logic game "Tap to Earn" với comment chi tiết, dễ hiểu

// =====================
// 1. Cấu hình các mốc level, HP, coin, v.v.
// =====================

// Điểm cần để lên cấp (level 1 -> 100)
const LEVEL_UP_REQUIREMENTS = [
  3200,
  5200,
  7500,
  10100,
  13000,
  16200,
  19600,
  23300,
  27400,
  31700, // 1-10
  48400,
  55000,
  62000,
  69200,
  76800,
  84900,
  93400,
  102200,
  111400,
  121000, // 11-20
  163700,
  176700,
  190100,
  204000,
  218400,
  233300,
  248700,
  264500,
  280800,
  297600, // 21-30
  389700,
  423400,
  458200,
  494200,
  531400,
  569700,
  609200,
  649800,
  691500,
  734400, // 31-40
  908200,
  960900,
  1015100,
  1070500,
  1127300,
  1185400,
  1244900,
  1305700,
  1367900,
  0, // 41-49, 50 là ruby
  1710000,
  1881000,
  2052000,
  2223000,
  0, // 51-54, 55 là ruby
  2394000,
  2565000,
  2736000,
  2907000,
  0, // 56-59, 60 là ruby
  3420000,
  3762000,
  4104000,
  4446000,
  0, // 61-64, 65 là ruby
  5130000,
  5472000,
  5814000,
  6156000,
  0, // 66-69, 70 là ruby
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

// Số coin mỗi lần tap theo từng mốc level
const TAP_COIN_BY_LEVEL = [
  { from: 1, to: 10, value: 24 },
  { from: 11, to: 20, value: 27 },
  { from: 21, to: 30, value: 31 },
  { from: 31, to: 40, value: 35 },
  { from: 41, to: 49, value: 39 },
  { from: 50, to: 60, value: 47 },
  { from: 61, to: 70, value: 54 },
  { from: 71, to: 80, value: 61 },
  { from: 81, to: 90, value: 70 },
  { from: 91, to: 100, value: 80 },
];

// =====================
// 2. Hàm tính toán các giá trị động
// =====================

// Tính tổng HP cho mỗi level
function getLevelHP(level) {
  if (level <= 1) return 100; // Level 1 có 100 HP
  let hp = 100;
  for (let lv = 2; lv <= level; lv++) {
    if (lv <= 30) hp += 50;
    else if (lv <= 60) hp += 100;
    else if (lv <= 90) hp += 150;
    else hp += 200;
  }
  return hp;
}

// Tính số coin mỗi lần tap cho level hiện tại
function getTapCoin(level) {
  if (level <= 1) return 24; // Level 1 có 24 coin mỗi tap
  for (const range of TAP_COIN_BY_LEVEL) {
    if (level >= range.from && level <= range.to) return range.value;
  }
  return 24; // fallback
}

// Tính % MT nâng cấp (upgrade multiplier)
function getUpgradeMultiplier(level) {
  if (level <= 1) return 1; // Level 1 có multiplier = 1
  return 1 + (level - 1) * 0.05; // 100% + 5% mỗi cấp
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
    coinEarn: 0,
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

  // Cập nhật coin kiếm được trong 1 lần đầy HP
  document.getElementById("coin-earn").textContent = state.coinEarn;
  // Cập nhật tổng coin
  document.getElementById("coin-count").textContent = state.coinCount;

  // Cập nhật level text
  const hpLevelElement = document.getElementById("hp-level");
  const lpLevelElement = document.getElementById("lp-level");

  if (hpLevelElement) {
    hpLevelElement.textContent = `${state.level}/100`;
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

  // Giảm HP và tính coin với multiplier
  const oldHP = state.hp;
  state.hp -= 4;
  console.log("HP changed from", oldHP, "to", state.hp);

  // Tính coin nhận được với multiplier
  let tapCoin;
  if (multiplier === 0.25) {
    // Nếu là auto earn (multiplier = 0.25), tính chính xác 1/4 số điểm
    tapCoin = Math.floor(
      (getTapCoin(state.level) * getUpgradeMultiplier(state.level)) / 4
    );
  } else {
    // Các trường hợp khác sử dụng multiplier trực tiếp
    tapCoin = Math.round(
      getTapCoin(state.level) * getUpgradeMultiplier(state.level) * multiplier
    );
  }

  // Không cần thêm bonus riêng cho tap 3 ngón vì đã được tính trong multiplier
  console.log("Coin earned with multiplier", multiplier + ":", tapCoin);

  state.coinEarn += tapCoin;
  console.log("Coin earned:", tapCoin, "Total coinEarn:", state.coinEarn);

  // Nếu HP về 0 hoặc âm, xử lý kết thúc lượt
  if (state.hp <= 0) {
    console.log("HP reached 0 or below, processing end of round");
    state.hp = 0; // Đảm bảo HP hiển thị là 0
    state.coinCount += state.coinEarn;
    state.coinEarn = 0;
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
        currentState.level++;

        // KHÔNG hồi full HP khi hết máu - chỉ hồi khi còn HP
        if (currentState.hp > 0) {
          currentState.hp = getLevelHP(currentState.level);
          console.log("Level up! HP restored to:", currentState.hp);
        } else {
          console.log(
            "Level up! But HP stays at 0 - must wait 3 minutes to recover"
          );
        }

        console.log("Level up! New level:", currentState.level);

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

    // Chỉ hồi full HP khi lên cấp nếu HP > 0
    if (state.hp > 0) {
      state.hp = getLevelHP(state.level);
      console.log(
        "Level up! New level:",
        state.level,
        "HP restored to:",
        state.hp
      );
    } else {
      console.log("Level up! New level:", state.level, "But HP stays at 0");
    }

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

  // HP > 0, hồi máu như cũ
  const msPassed = now - state.lastRecover;
  // 3 phút hồi 2% HP
  const recoverPercent = Math.floor(msPassed / (3 * 60 * 1000)) * 2;
  if (recoverPercent > 0) {
    const maxHP = getLevelHP(state.level);
    state.hp = Math.min(
      maxHP,
      state.hp + Math.floor((maxHP * recoverPercent) / 100)
    );
    state.lastRecover = now;
    saveGameState(state);
    updateUI(state);
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
      coinEarn: document.getElementById("coin-earn").textContent,
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
