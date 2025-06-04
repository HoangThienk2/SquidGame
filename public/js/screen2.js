// Game State
let gameState = {
  combo: 1,
  maxCombo: 10,
  coins: 0,
  activeSlots: [],
  characters: ["char1", "char2", "char3", "char4", "char5"],
  lastClickTime: 0,
};

// Initialize Game
function initGame() {
  const slots = document.querySelectorAll(".character-slot");
  slots.forEach((slot, index) => {
    slot.addEventListener("click", () => handleSlotClick(index));
    spawnCharacter(slot);
  });
  updateUI();
}

// Spawn a character in a slot
function spawnCharacter(slot) {
  const character =
    gameState.characters[
      Math.floor(Math.random() * gameState.characters.length)
    ];
  slot.dataset.character = character;
  slot.style.backgroundImage = `url(./images/screen2/characters/${character}.svg)`;
  slot.style.backgroundSize = "contain";
  slot.style.backgroundPosition = "center";
  slot.style.backgroundRepeat = "no-repeat";
}

// Handle slot click
function handleSlotClick(index) {
  const slot = document.querySelectorAll(".character-slot")[index];
  const currentTime = Date.now();

  // Add to active slots
  gameState.activeSlots.push({
    index,
    character: slot.dataset.character,
    time: currentTime,
  });

  // Highlight slot
  slot.classList.add("active");

  // Check for matches after a short delay
  setTimeout(() => checkMatches(), 300);

  // Reset combo if clicked too slow
  if (currentTime - gameState.lastClickTime > 1000) {
    gameState.combo = 1;
  }
  gameState.lastClickTime = currentTime;

  updateUI();
}

// Check for character matches
function checkMatches() {
  if (gameState.activeSlots.length < 3) return;

  const slots = document.querySelectorAll(".character-slot");
  const character = gameState.activeSlots[0].character;
  const isMatch = gameState.activeSlots.every(
    (slot) => slot.dataset.character === character
  );

  if (isMatch) {
    // Increase combo and coins
    gameState.combo = Math.min(gameState.combo + 1, gameState.maxCombo);
    const coinsEarned = 10 * gameState.combo;
    gameState.coins += coinsEarned;

    // Create coin effects
    gameState.activeSlots.forEach((slotInfo) => {
      const slot = slots[slotInfo.index];
      const rect = slot.getBoundingClientRect();
      createCoins(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        gameState.combo
      );
    });

    // Respawn new characters
    gameState.activeSlots.forEach((slotInfo) => {
      const slot = slots[slotInfo.index];
      slot.classList.remove("active");
      spawnCharacter(slot);
    });
  } else {
    // Reset combo on mismatch
    gameState.combo = 1;
    gameState.activeSlots.forEach((slotInfo) => {
      slots[slotInfo.index].classList.remove("active");
    });
  }

  // Clear active slots
  gameState.activeSlots = [];
  updateUI();
}

// Create flying coins
function createCoins(x, y, multiplier = 1) {
  const count = 3 * multiplier;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const coin = document.createElement("div");
      coin.className = "flying-coin";
      coin.style.left = `${x}px`;
      coin.style.top = `${y}px`;

      const coinTarget = document.getElementById("coin-target");
      const targetRect = coinTarget.getBoundingClientRect();

      coin.style.setProperty("--tx", `${targetRect.left - x}px`);
      coin.style.setProperty("--ty", `${targetRect.top - y}px`);

      document.getElementById("coin-container").appendChild(coin);

      setTimeout(() => coin.remove(), 1000);
    }, i * 100);
  }
}

// Update UI elements
function updateUI() {
  document.getElementById("coin-count").textContent = gameState.coins;
  document.getElementById("combo-count").textContent = `x${gameState.combo}`;

  const comboProgress = document.getElementById("combo-progress");
  const progressWidth = (gameState.combo / gameState.maxCombo) * 100;
  comboProgress.style.width = `${progressWidth}%`;
}

// Initialize game when document is loaded
document.addEventListener("DOMContentLoaded", initGame);
