// Tap to Earn Game Logic
// Author: GitHub Copilot
// File: public/js/taptoearn.js
// Mô tả: Chứa toàn bộ logic game "Tap to Earn" với comment chi tiết, dễ hiểu

// =====================
// 1. Cấu hình các mốc level, HP, coin, v.v.
// =====================

// Điểm cần để lên cấp (level 1 -> 100)
const LEVEL_UP_REQUIREMENTS = [
  1600,
  2600,
  3750,
  5050,
  6500,
  8100,
  9800,
  11650,
  13700,
  15850, // 1-10
  24200,
  27500,
  31000,
  34600,
  38400,
  42450,
  46700,
  51100,
  55700,
  60500, // 11-20
  81850,
  88350,
  95050,
  102000,
  109200,
  116650,
  124350,
  132250,
  140400,
  148800, // 21-30
  194850,
  211700,
  229100,
  247100,
  265700,
  284850,
  304600,
  324900,
  345750,
  367200, // 31-40
  454100,
  480450,
  507550,
  535250,
  563650,
  592700,
  622450,
  652850,
  683950,
  0, // 41-49, 50 là ruby
  855000,
  940500,
  1026000,
  1111500,
  0, // 51-54, 55 là ruby
  1368000,
  1453500,
  1539000,
  1624500,
  0, // 56-59, 60 là ruby
  1710000,
  1881000,
  2052000,
  2223000,
  0, // 61-64, 65 là ruby
  2565000,
  2736000,
  2907000,
  3078000,
  0, // 66-69, 70 là ruby
  3249000,
  3573900,
  3898800,
  4223700,
  0, // 71-74, 75 là ruby
  4873500,
  5198400,
  5523300,
  5848200,
  0, // 76-79, 80 là ruby
  6173100,
  6790410,
  7407720,
  8025030,
  0, // 81-84, 85 là ruby
  9259650,
  9876960,
  10494270,
  11111580,
  0, // 86-89, 90 là ruby
  11728890,
  13488224,
  15247557,
  17006891,
  0, // 91-94, 95 là ruby
  20525558,
  22284891,
  24004225,
  0, // 96-98, 99 là ruby
];

// Số coin mỗi lần tap theo từng mốc level
const TAP_COIN_BY_LEVEL = [
  { from: 1, to: 10, value: 24 },
  { from: 11, to: 20, value: 27 },
  { from: 21, to: 30, value: 31 },
  { from: 31, to: 40, value: 35 },
  { from: 41, to: 50, value: 39 },
  { from: 51, to: 60, value: 47 },
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

// Tính số coin mỗi lần tap cho level hiện tại
function getTapCoin(level) {
  for (const range of TAP_COIN_BY_LEVEL) {
    if (level >= range.from && level <= range.to) return range.value;
  }
  return 24; // fallback
}

// Tính % MT nâng cấp (upgrade multiplier)
function getUpgradeMultiplier(level) {
  return 1 + (level - 1) * 0.05; // 100% + 5% mỗi cấp
}

// Lấy điểm cần để lên cấp cho level hiện tại
function getLevelUpRequirement(level) {
  return LEVEL_UP_REQUIREMENTS[level - 1] || 0;
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
  // Trạng thái mặc định
  return {
    level: 1,
    hp: getLevelHP(1),
    coinEarn: 0,
    coinCount: 0,
    lastRecover: Date.now(),
  };
}

// =====================
// 4. Cập nhật UI
// =====================

function updateUI(state) {
  // Cập nhật HP
  const maxHP = getLevelHP(state.level);
  const hpPercentage = Math.max(0, Math.min(100, (state.hp / maxHP) * 100));

  // Cập nhật text HP
  document.getElementById("hp-per-level").textContent = `${state.hp}/${maxHP}`;

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
  document.getElementById("hp-level").textContent = state.level;
  document.getElementById("lp-level").textContent = state.level;

  // Tính phần trăm tiến trình level
  const upReq = getLevelUpRequirement(state.level);
  let levelProgress = 0;

  if (upReq > 0) {
    // Tính số coin cần cho level hiện tại
    const currentLevelCoins = state.coinCount;
    // Tính progress dựa trên số coin hiện tại
    levelProgress = Math.min(100, (currentLevelCoins / upReq) * 100);
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
  if (state.hp <= 0) return; // Không tap khi HP = 0

  // Tạo hiệu ứng coin bay từ vị trí click/touch
  if (event) {
    const coinTarget = document.querySelector('img[src*="coin-icon.svg"]');
    if (coinTarget) {
      // Tạo 3 coin bay từ vị trí tap, nhân với multiplier
      const coinCount = Math.max(1, Math.floor(3 * multiplier));
      for (let i = 0; i < coinCount; i++) {
        setTimeout(() => {
          createFlyingCoin(
            event.clientX ||
              event.touches?.[0]?.clientX ||
              window.innerWidth / 2,
            event.clientY ||
              event.touches?.[0]?.clientY ||
              window.innerHeight / 2,
            coinTarget
          );
        }, i * 150);
      }
    }
  }

  // Giảm HP và tính coin với multiplier
  const newHP = state.hp - 4;
  state.hp = newHP <= 0 ? 0 : newHP; // Đảm bảo HP về đúng 0

  // Tính coin nhận được với multiplier
  let tapCoin;
  if (multiplier === 0.25) {
    // Nếu là auto earn (multiplier = 0.25), tính chính xác 1/4 số điểm
    tapCoin = Math.floor(
      (getTapCoin(state.level) * getUpgradeMultiplier(state.level)) / 4
    );
  } else {
    // Các trường hợp khác giữ nguyên công thức cũ
    tapCoin = Math.round(
      getTapCoin(state.level) * getUpgradeMultiplier(state.level) * multiplier
    );
  }

  state.coinEarn += tapCoin;

  // Nếu HP về 0, cộng dồn coinEarn vào coinCount, reset coinEarn
  if (state.hp === 0) {
    state.coinCount += state.coinEarn;
    state.coinEarn = 0;
    state.lastRecover = Date.now();
  }

  // Kiểm tra lên cấp
  const upReq = getLevelUpRequirement(state.level);
  if (upReq > 0 && state.coinCount >= upReq && state.level < 100) {
    state.level++;
    // Hồi full HP khi lên cấp
    state.hp = getLevelHP(state.level);

    // Kiểm tra các mốc level đặc biệt
    if (state.level % 10 === 0) {
      // Thông báo đạt mốc level quan trọng
      if (typeof showTelegramAlert === "function") {
        showTelegramAlert(
          `🎉 Chúc mừng! Bạn đã đạt level ${state.level}!\n💰 Tổng coin: ${state.coinCount}`
        );
      }
    }
  }

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

  // Tính toán vị trí đích (icon coin)
  const targetRect = targetElement.getBoundingClientRect();
  const tx = targetRect.left - startX + targetRect.width / 2;
  const ty = targetRect.top - startY + targetRect.height / 2;

  // Set biến CSS cho animation
  coin.style.setProperty("--tx", `${tx}px`);
  coin.style.setProperty("--ty", `${ty}px`);

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
  const msPassed = now - state.lastRecover;
  // 3 phút hồi 2% HP
  const recoverPercent = Math.floor(msPassed / (3 * 60 * 1000)) * 2;
  // const recoverPercent = Math.floor(msPassed / (5 * 1000)) * 5;  5s phục hồi 5% HP
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

  // Cập nhật UI lần đầu
  updateUI(loadGameState());

  // Gắn sự kiện tap cho stats-panel với event
  document
    .getElementById("stats-panel")
    .addEventListener("click", function (event) {
      tap(event);
    });

  // Gắn sự kiện tap cho main-stage với event
  document
    .getElementById("main-stage")
    .addEventListener("click", function (event) {
      tap(event);
    });

  // Hồi phục HP mỗi phút
  setInterval(recoverHP, 60 * 1000);

  console.log("Game initialization completed");
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

// Handle touch events
document.addEventListener(
  "touchstart",
  function (event) {
    // Kiểm tra xem có phải click vào nút auto earn không
    if (event.target.closest("#auto-earn-button")) {
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
  // Kiểm tra xem có phải click vào nút auto earn không
  if (event.target.closest("#auto-earn-button")) {
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
