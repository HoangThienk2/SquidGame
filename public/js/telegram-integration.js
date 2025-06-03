// Khởi tạo Telegram WebApp
const tg = window.Telegram.WebApp;

// Thông báo cho Telegram rằng web app đã sẵn sàng
tg.ready();

// Thiết lập viewport
function setupViewport() {
  // Expand to full height
  tg.expand();

  // Hoặc có thể set chiều cao cụ thể
  // tg.setViewportHeight(800);

  // Kiểm tra xem có đang chạy trong Telegram Web App không
  if (tg.platform !== "unknown") {
    // Đang chạy trong Telegram
    document.body.classList.add("in-telegram-app");

    // Lấy kích thước viewport của Telegram
    const viewportHeight = tg.viewportHeight;
    const viewportStableHeight = tg.viewportStableHeight;
    const isExpanded = tg.isExpanded;

    console.log("Telegram viewport:", {
      height: viewportHeight,
      stableHeight: viewportStableHeight,
      isExpanded: isExpanded,
    });
  } else {
    // Đang chạy như web thường
    document.body.classList.add("standalone-web");
  }
}

// Thiết lập theme theo Telegram theme
function setupTelegramTheme() {
  // Lấy màu chủ đạo từ Telegram
  const mainColor = tg.themeParams.bg_color || "#2D1B3D";
  const textColor = tg.themeParams.text_color || "#FFFFFF";

  // Cập nhật theme của game
  document.documentElement.style.setProperty("--game-main-color", mainColor);
  document.documentElement.style.setProperty("--game-text-color", textColor);
}

// Lưu điểm số lên Telegram Cloud Storage
function saveScoreToTelegram(score) {
  if (tg.CloudStorage) {
    tg.CloudStorage.setItem("gameScore", score.toString())
      .then(() => console.log("Score saved to Telegram"))
      .catch((error) => console.error("Error saving score:", error));
  }
}

// Lấy điểm số từ Telegram Cloud Storage
async function loadScoreFromTelegram() {
  if (tg.CloudStorage) {
    try {
      const score = await tg.CloudStorage.getItem("gameScore");
      return score ? parseInt(score) : 0;
    } catch (error) {
      console.error("Error loading score:", error);
      return 0;
    }
  }
  return 0;
}

// Hiển thị popup thông báo trong Telegram
function showTelegramAlert(message) {
  tg.showPopup({
    title: "Thông báo",
    message: message,
    buttons: [{ type: "close" }],
  });
}

// Gửi dữ liệu về bot khi người chơi đạt mốc điểm
function sendScoreToBot(score, level) {
  tg.sendData(
    JSON.stringify({
      type: "score_update",
      score: score,
      level: level,
    })
  );
}

// Xử lý khi người chơi đạt mốc điểm/level quan trọng
function handleGameAchievement(score, level) {
  // Lưu điểm
  saveScoreToTelegram(score);

  // Gửi về bot
  sendScoreToBot(score, level);

  // Hiển thị thông báo
  showTelegramAlert(`Chúc mừng! Bạn đã đạt level ${level} với ${score} điểm!`);
}

// Khởi tạo khi trang load
window.addEventListener("load", function () {
  // Thiết lập viewport
  setupViewport();

  setupTelegramTheme();

  loadScoreFromTelegram().then((score) => {
    if (score > 0) {
      console.log("Loaded score from Telegram:", score);
    }
  });

  if (tg.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      // Lưu trạng thái game trước khi đóng
      const gameState = loadGameState();
      saveScoreToTelegram(gameState.coinCount);
      tg.close();
    });
  }
});
