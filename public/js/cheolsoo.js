// Cheolsoo Game Module
console.log("Cheolsoo Game Module loaded");

// DOM Elements - use window to avoid redeclaration
window.fallingContainer = window.fallingContainer || null;
window.checkInButton = window.checkInButton || null;

// Game Variables - use window to avoid redeclaration
window.lastCheckInTime = window.lastCheckInTime || 0;
window.activeMaskType = window.activeMaskType || null;
window.fallingInterval = window.fallingInterval || null;
window.CHECKIN_COOLDOWN = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
window.TON_REWARD = 0.001;

// Mask types with colors and shapes
window.maskTypes = window.maskTypes || [
  { name: "Circle", symbol: "○", color: "#4cc9f0" },
  { name: "Triangle", symbol: "△", color: "#f72585" },
  { name: "Square", symbol: "□", color: "#ffd60a" },
];

// Initialize check-in button
function initCheckInButton() {
  // Create falling container if it doesn't exist
  if (!document.getElementById("falling-container")) {
    const gameArea = document.querySelector(".game-area");
    if (gameArea) {
      window.fallingContainer = document.createElement("div");
      window.fallingContainer.id = "falling-container";
      window.fallingContainer.style.position = "absolute";
      window.fallingContainer.style.top = "0";
      window.fallingContainer.style.left = "0";
      window.fallingContainer.style.width = "100%";
      window.fallingContainer.style.height = "100%";
      window.fallingContainer.style.pointerEvents = "none";
      window.fallingContainer.style.zIndex = "10";
      gameArea.appendChild(window.fallingContainer);
    }
  } else {
    window.fallingContainer = document.getElementById("falling-container");
  }

  // Create check-in button if it doesn't exist
  if (!document.getElementById("check-in")) {
    const bottomSection = document.querySelector(".bottom-section");
    if (bottomSection) {
      window.checkInButton = document.createElement("button");
      window.checkInButton.id = "check-in";
      window.checkInButton.className = "check-in-button";
      window.checkInButton.textContent = "Check-In (4 SMG)";
      window.checkInButton.style.position = "absolute";
      window.checkInButton.style.top = "10px";
      window.checkInButton.style.right = "10px";
      window.checkInButton.style.padding = "8px 15px";
      window.checkInButton.style.backgroundColor = "#f72585";
      window.checkInButton.style.color = "white";
      window.checkInButton.style.border = "none";
      window.checkInButton.style.borderRadius = "5px";
      window.checkInButton.style.cursor = "pointer";
      window.checkInButton.style.boxShadow = "0 0 10px rgba(247, 37, 133, 0.5)";
      window.checkInButton.style.animation = "pulse 2s infinite";
      bottomSection.appendChild(window.checkInButton);
    }
  } else {
    window.checkInButton = document.getElementById("check-in");
  }

  if (!window.checkInButton) {
    console.log("Check-in button not found, skipping Cheolsoo initialization");
    return;
  }

  console.log("Initializing check-in button");
  updateCheckInButton();

  // Set interval to update button every minute
  setInterval(updateCheckInButton, 60000);

  // Add click handler
  window.checkInButton.addEventListener("click", handleCheckIn);
}

// Update check-in button state and text
function updateCheckInButton() {
  if (!window.checkInButton) return;

  const now = Date.now();
  const timeSinceLastCheckIn = now - window.lastCheckInTime;

  if (timeSinceLastCheckIn >= window.CHECKIN_COOLDOWN) {
    window.checkInButton.disabled = false;
    window.checkInButton.textContent = "Check-In (4 SMG)";

    // Add attention-grabbing animation
    window.checkInButton.style.animation = "pulse 2s infinite";
  } else {
    window.checkInButton.disabled = true;
    window.checkInButton.style.animation = "none";
    window.checkInButton.style.backgroundColor = "#666";

    // Calculate remaining time
    const remainingTime = window.CHECKIN_COOLDOWN - timeSinceLastCheckIn;
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor(
      (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
    );

    window.checkInButton.textContent = `Check-In Available in ${hours}h ${minutes}m`;
  }
}

// Handle check-in button click
function handleCheckIn() {
  const now = Date.now();
  window.lastCheckInTime = now;

  // Add SMG reward
  window.gameState.smg += 4;

  // Show notification
  window.showNotification("Checked in! +4 SMG");

  // Add transaction
  window.addTransaction("Cheolsoo check-in reward", 4, "SMG");

  // Button click animation
  window.checkInButton.style.transform = "scale(0.95)";
  setTimeout(() => {
    window.checkInButton.style.transform = "scale(1)";
  }, 100);

  // Celebrate with falling coins
  createCoinRain();

  // Start mini-game
  startMaskManGame();

  // Update UI
  window.updateUI();
  window.saveGameState();
  updateCheckInButton();
}

// Create coin rain animation
function createCoinRain() {
  if (!window.fallingContainer) return;

  // Create multiple coins
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const coin = document.createElement("div");
      coin.className = "coin";

      // Coin appearance
      coin.style.position = "absolute";
      coin.style.width = "30px";
      coin.style.height = "30px";
      coin.style.borderRadius = "50%";
      coin.style.backgroundColor = "#ffd700";
      coin.style.boxShadow = "0 0 10px rgba(255, 215, 0, 0.8)";
      coin.style.color = "#fff";
      coin.style.textAlign = "center";
      coin.style.lineHeight = "30px";
      coin.style.fontWeight = "bold";
      coin.style.fontSize = "16px";
      coin.textContent = "₮";
      coin.style.zIndex = "50";

      // Random position
      coin.style.left = Math.random() * 90 + 5 + "%";
      coin.style.top = "-30px";

      // Add to container
      window.fallingContainer.appendChild(coin);

      // Animate falling
      const fallDuration = Math.random() * 2 + 2;
      const swayAmount = Math.random() * 100 - 50; // Between -50 and 50

      // Use Web Animation API for smoother animation
      const keyframes = [
        { top: "-30px", left: coin.style.left, transform: "rotate(0deg)" },
        {
          top: "50%",
          left: `calc(${coin.style.left} + ${swayAmount}px)`,
          transform: "rotate(180deg)",
        },
        {
          top: "100%",
          left: coin.style.left,
          transform: "rotate(360deg)",
        },
      ];

      coin.animate(keyframes, {
        duration: fallDuration * 1000,
        easing: "ease-in",
        fill: "forwards",
      });

      // Remove after animation
      setTimeout(() => {
        if (coin.parentNode === window.fallingContainer) {
          window.fallingContainer.removeChild(coin);
        }
      }, fallDuration * 1000);
    }, i * 100); // Stagger the start of each coin
  }
}

// Start the falling mask man game
function startMaskManGame() {
  if (!window.fallingContainer) return;

  // Clear any existing game
  if (window.fallingInterval) {
    clearInterval(window.fallingInterval);
  }

  // Clear container
  window.fallingContainer.innerHTML = "";

  // Choose a random mask type to catch
  const randomIndex = Math.floor(Math.random() * window.maskTypes.length);
  window.activeMaskType = window.maskTypes[randomIndex].name;
  const activeColor = window.maskTypes[randomIndex].color;
  const activeSymbol = window.maskTypes[randomIndex].symbol;

  // Show instructions with highlighted color
  window.showNotification(
    `Tap the <span style="color:${activeColor};font-weight:bold">${window.activeMaskType} ${activeSymbol}</span> mask men to earn TON!`
  );

  // Display target mask type at the top
  const targetDisplay = document.createElement("div");
  targetDisplay.className = "target-mask";
  targetDisplay.innerHTML = `Catch: <span style="color:${activeColor};font-size:24px;text-shadow:0 0 5px ${activeColor}">${activeSymbol}</span>`;
  targetDisplay.style.position = "absolute";
  targetDisplay.style.top = "10px";
  targetDisplay.style.left = "50%";
  targetDisplay.style.transform = "translateX(-50%)";
  targetDisplay.style.backgroundColor = "rgba(0,0,0,0.7)";
  targetDisplay.style.color = "white";
  targetDisplay.style.padding = "5px 15px";
  targetDisplay.style.borderRadius = "20px";
  targetDisplay.style.zIndex = "100";
  targetDisplay.style.fontWeight = "bold";
  window.fallingContainer.appendChild(targetDisplay);

  // Start spawning mask men
  let spawnCount = 0;
  window.fallingInterval = setInterval(() => {
    spawnMaskMan();
    spawnCount++;

    if (spawnCount >= 15) {
      clearInterval(window.fallingInterval);
      window.fallingInterval = null;

      // End game after a delay
      setTimeout(() => {
        window.fallingContainer.innerHTML = "";
        window.showNotification("Game ended!");
      }, 5000);
    }
  }, 800);
}

// Spawn a mask man
function spawnMaskMan() {
  if (!window.fallingContainer) return;

  // Choose a random mask type
  const maskTypeIndex = Math.floor(Math.random() * window.maskTypes.length);
  const maskType = window.maskTypes[maskTypeIndex];

  // Create element
  const maskMan = document.createElement("div");
  maskMan.className = "mask-man";
  maskMan.dataset.maskType = maskType.name;

  // Style the mask man
  maskMan.style.position = "absolute";
  maskMan.style.width = "40px";
  maskMan.style.height = "60px";
  maskMan.style.borderRadius = "50%";
  maskMan.style.backgroundColor = "rgba(0,0,0,0.5)";
  maskMan.style.display = "flex";
  maskMan.style.justifyContent = "center";
  maskMan.style.alignItems = "center";
  maskMan.style.fontSize = "24px";
  maskMan.style.color = maskType.color;
  maskMan.style.textShadow = `0 0 5px ${maskType.color}`;
  maskMan.style.cursor = "pointer";
  maskMan.style.userSelect = "none";
  maskMan.style.boxShadow = `0 0 10px ${maskType.color}`;
  maskMan.style.zIndex = "20";

  // Add mask symbol
  maskMan.textContent = maskType.symbol;

  // Random position at top
  const left = Math.random() * (window.fallingContainer.offsetWidth - 50);
  maskMan.style.left = `${left}px`;
  maskMan.style.top = "0";

  // Add click handler
  maskMan.addEventListener("click", handleMaskManClick);

  // Add to container
  window.fallingContainer.appendChild(maskMan);

  // Use Web Animation API for smoother animations
  const duration = Math.random() * 1000 + 2000; // 2-3 seconds
  const swayAmount = Math.random() * 100 - 50; // Between -50 and 50

  const keyframes = [
    { top: "0px", left: `${left}px`, transform: "scale(0.5)" },
    {
      top: "30%",
      left: `${left + swayAmount}px`,
      transform: "scale(1.1)",
    },
    {
      top: "60%",
      left: `${left - swayAmount / 2}px`,
      transform: "scale(1)",
    },
    {
      top: "100%",
      left: `${left}px`,
      transform: "scale(0.8) rotate(10deg)",
    },
  ];

  const animation = maskMan.animate(keyframes, {
    duration: duration,
    easing: "ease-in",
    fill: "forwards",
  });

  // Remove after animation
  animation.onfinish = () => {
    if (maskMan.parentNode === window.fallingContainer) {
      window.fallingContainer.removeChild(maskMan);
    }
  };
}

// Handle clicking on a mask man
function handleMaskManClick(event) {
  event.preventDefault();
  const maskMan = event.target;
  const maskType = maskMan.dataset.maskType;

  // Create click effect
  const rect = maskMan.getBoundingClientRect();
  const clickEffect = document.createElement("div");
  clickEffect.style.position = "absolute";
  clickEffect.style.width = "50px";
  clickEffect.style.height = "50px";
  clickEffect.style.borderRadius = "50%";
  clickEffect.style.border = "2px solid white";
  clickEffect.style.top = rect.top + rect.height / 2 - 25 + "px";
  clickEffect.style.left = rect.left + rect.width / 2 - 25 + "px";
  clickEffect.style.zIndex = "30";
  clickEffect.style.pointerEvents = "none";

  document.body.appendChild(clickEffect);

  // Animate and remove
  clickEffect.animate(
    [
      { transform: "scale(0.2)", opacity: 1 },
      { transform: "scale(1.5)", opacity: 0 },
    ],
    {
      duration: 500,
      easing: "ease-out",
    }
  );

  setTimeout(() => {
    clickEffect.remove();
  }, 500);

  // Remove the mask man
  if (maskMan.parentNode === window.fallingContainer) {
    // Create a flash effect before removing
    maskMan.style.transform = "scale(1.5)";
    maskMan.style.opacity = "0.8";

    setTimeout(() => {
      window.fallingContainer.removeChild(maskMan);
    }, 100);
  }

  // Check if it's the right type
  if (maskType === window.activeMaskType) {
    // Reward player with TON
    window.gameState.ton += window.TON_REWARD;

    // Show notification
    window.showNotification(`Correct! +${window.TON_REWARD} TON`);

    // Add transaction
    window.addTransaction("Caught correct mask man", window.TON_REWARD, "TON");

    // Show floating TON
    showFloatingTON(event.clientX, event.clientY);

    // Update UI
    window.updateUI();
    window.saveGameState();
  } else {
    // Wrong mask type - show wrong animation
    const wrongMark = document.createElement("div");
    wrongMark.textContent = "✗";
    wrongMark.style.position = "absolute";
    wrongMark.style.top = event.clientY - 20 + "px";
    wrongMark.style.left = event.clientX - 10 + "px";
    wrongMark.style.color = "#ff3333";
    wrongMark.style.fontSize = "30px";
    wrongMark.style.fontWeight = "bold";
    wrongMark.style.zIndex = "50";
    wrongMark.style.pointerEvents = "none";

    document.body.appendChild(wrongMark);

    wrongMark.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(-30px)", opacity: 0 },
      ],
      {
        duration: 800,
        easing: "ease-out",
      }
    );

    setTimeout(() => {
      wrongMark.remove();
    }, 800);

    // Show notification
    window.showNotification("Wrong mask type!");
  }
}

// Show floating TON animation
function showFloatingTON(x, y) {
  const ton = document.createElement("div");
  ton.textContent = "+" + window.TON_REWARD + " TON";
  ton.style.position = "absolute";
  ton.style.top = y - 20 + "px";
  ton.style.left = x - 40 + "px";
  ton.style.color = "#4cc9f0";
  ton.style.fontSize = "20px";
  ton.style.fontWeight = "bold";
  ton.style.zIndex = "50";
  ton.style.textShadow = "0 0 5px rgba(76, 201, 240, 0.7)";
  ton.style.pointerEvents = "none";

  document.body.appendChild(ton);

  ton.animate(
    [
      { transform: "translateY(0) scale(1)", opacity: 1 },
      { transform: "translateY(-50px) scale(1.5)", opacity: 0 },
    ],
    {
      duration: 1000,
      easing: "ease-out",
    }
  );

  setTimeout(() => {
    ton.remove();
  }, 1000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded in cheolsoo.js");
  // Allow time for DOM to be fully initialized
  setTimeout(initCheckInButton, 150);
});

// Try again on window.load in case DOMContentLoaded was too early
window.addEventListener("load", function () {
  if (!window.checkInButton) {
    console.log("Reinitializing Cheolsoo after window load");
    initCheckInButton();
  }
});
