// Tap to Earn Game Logic
// Author: GitHub Copilot
// File: public/js/taptoearn.js
// Mô tả: Chứa toàn bộ logic game "Tap to Earn" với comment chi tiết, dễ hiểu

// =====================
// 1. Cấu hình các mốc level, HP, coin, v.v.
// =====================

// Điểm cần để lên cấp (level 1 -> 100)
const LEVEL_UP_REQUIREMENTS = [
  1600, 2600, 3750, 5050, 6500, 8100, 9800, 11650, 13700, 15850, // 1-10
  24200, 27500, 31000, 34600, 38400, 42450, 46700, 51100, 55700, 60500, // 11-20
  81850, 88350, 95050, 102000, 109200, 116650, 124350, 132250, 140400, 148800, // 21-30
  194850, 211700, 229100, 247100, 265700, 284850, 304600, 324900, 345750, 367200, // 31-40
  454100, 480450, 507550, 535250, 563650, 592700, 622450, 652850, 683950, 0, // 41-49, 50 là ruby
  855000, 940500, 1026000, 1111500, 0, // 51-54, 55 là ruby
  1368000, 1453500, 1539000, 1624500, 0, // 56-59, 60 là ruby
  1710000, 1881000, 2052000, 2223000, 0, // 61-64, 65 là ruby
  2565000, 2736000, 2907000, 3078000, 0, // 66-69, 70 là ruby
  3249000, 3573900, 3898800, 4223700, 0, // 71-74, 75 là ruby
  4873500, 5198400, 5523300, 5848200, 0, // 76-79, 80 là ruby
  6173100, 6790410, 7407720, 8025030, 0, // 81-84, 85 là ruby
  9259650, 9876960, 10494270, 11111580, 0, // 86-89, 90 là ruby
  11728890, 13488224, 15247557, 17006891, 0, // 91-94, 95 là ruby
  20525558, 22284891, 24004225, 0 // 96-98, 99 là ruby
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
  localStorage.setItem('taptoearn_state', JSON.stringify(state));
}

function loadGameState() {
  const data = localStorage.getItem('taptoearn_state');
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
  document.getElementById('hp-per-level').textContent = `${state.hp}/${getLevelHP(state.level)}`;
  // Cập nhật coin kiếm được trong 1 lần đầy HP
  document.getElementById('coin-earn').textContent = state.coinEarn;
  // Cập nhật tổng coin
  document.getElementById('coin-count').textContent = state.coinCount;
  // Cập nhật level
  document.getElementById('hp-level').textContent = state.level;
  document.getElementById('lp-level').textContent = state.level;
}

// =====================
// 5. Xử lý tap
// =====================

function tap() {
  let state = loadGameState();
  if (state.hp <= 0) return; // Không tap khi HP = 0
  state.hp = Math.max(0, state.hp - 4);
  // Tính coin nhận được
  const tapCoin = Math.round(getTapCoin(state.level) * getUpgradeMultiplier(state.level));
  state.coinEarn += tapCoin;
  // Nếu HP về 0, cộng dồn coinEarn vào coinCount, reset coinEarn
  if (state.hp === 0) {
    state.coinCount += state.coinEarn;
    state.coinEarn = 0;
    state.lastRecover = Date.now();
  }
  // Kiểm tra lên cấp
  const upReq = getLevelUpRequirement(state.level);
  if (upReq > 0 && state.coinCount >= upReq * 2 && state.level < 100) {
    state.level++;
    // Hồi full HP khi lên cấp
    state.hp = getLevelHP(state.level);
  }
  saveGameState(state);
  updateUI(state);
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
    state.hp = Math.min(maxHP, state.hp + Math.floor(maxHP * recoverPercent / 100));
    state.lastRecover = now;
    saveGameState(state);
    updateUI(state);
  }
}

// =====================
// 7. Khởi tạo game khi load trang
// =====================

document.addEventListener('DOMContentLoaded', function () {
  // Cập nhật UI lần đầu
  updateUI(loadGameState());
  // Gắn sự kiện tap cho stats-panel (hoặc vùng bạn muốn)
  document.getElementById('stats-panel').addEventListener('click', function () {
    tap();
  });
  // Gắn sự kiện tap cho main-stage để cũng kiếm coin
  document.getElementById('main-stage').addEventListener('click', function () {
    tap();
  });
  // Hồi phục HP mỗi phút
  setInterval(recoverHP, 60 * 1000);
});

// =====================
// 8. Ghi chú
// =====================
// - Có thể mở rộng thêm hiệu ứng, âm thanh, animation khi tap hoặc lên cấp.
// - Có thể thêm nút riêng cho tap nếu không muốn tap toàn bộ stats-panel.
// - Có thể tối ưu lưu trạng thái để tránh ghi localStorage quá nhiều nếu cần.
