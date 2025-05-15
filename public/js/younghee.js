// YoungHee Game Module
console.log("YoungHee Game Module loaded");

// IMPORTANT: Define the global handle touch function immediately
window.handleTouch = function () {
  console.log("Touch button clicked via global function");

  // Check if game elements are initialized
  if (!window.touchButton) {
    console.error("Touch button not initialized yet");
    // Try to initialize elements
    window.touchButton = document.getElementById("touch-button");
    window.hpProgress = document.getElementById("hp-progress");
    window.hpValue = document.getElementById("hp-value");
  }

  // Exit if touch button is not found
  if (!window.touchButton) {
    console.error("Touch button still not found!");
    return;
  }

  // Ensure gameState exists
  if (!window.gameState) {
    console.error("Game state not initialized yet");
    return;
  }

  // If YoungHee is watching (turned around), you lose points
  const youngheeElement = document.getElementById("younghee-doll");
  const isWatching = youngheeElement
    ? youngheeElement.classList.contains("turn-around")
    : false;

  // Visual feedback for button press
  window.touchButton.classList.add("pressed");
  setTimeout(() => window.touchButton.classList.remove("pressed"), 100);

  if (window.gameState.hp <= 0) {
    if (window.showNotification) {
      window.showNotification("No HP left! Rest or use items to recover.");
    } else {
      console.log("No HP left! Rest or use items to recover.");
    }
    return;
  }

  // Add or remove points based on if YoungHee is watching
  if (isWatching) {
    // YoungHee is watching - lose points!
    const pointsLost = Math.min(window.gameState.points, 5);
    window.gameState.points -= pointsLost;

    // Show penalty notification
    if (window.showNotification) {
      window.showNotification(
        "YoungHee caught you moving! -" + pointsLost + " points"
      );
    }

    // Show points lost animation
    showPointsLost(pointsLost);

    // Visual effect - create red particles
    createTouchParticles(true); // true = penalty mode

    // Flash scene light red
    const sceneLight = document.getElementById("scene-light");
    if (sceneLight) {
      sceneLight.classList.add("red");
      setTimeout(() => {
        sceneLight.classList.remove("red");
      }, 500);
    }
  } else {
    // Normal gameplay - add points
    window.gameState.points += window.pointsPerTap || 1;
    console.log(
      "Points added:",
      window.pointsPerTap || 1,
      "Total:",
      window.gameState.points
    );

    // Show points gained animation
    showPointsGained(window.pointsPerTap || 1);

    // Visual effect - create particles
    createTouchParticles(false);

    // Decrease HP
    window.gameState.hp -= 1;

    // Check for bonus player
    if (Math.random() < (window.bonusChance || 0.1)) {
      activateRandomPlayer();
    }
  }

  // Update HP bar
  if (window.updateHPBar) {
    window.updateHPBar();
  } else {
    updateHPBar();
  }

  // Update UI
  if (window.updateUI) {
    window.updateUI();
  }

  if (window.saveGameState) {
    window.saveGameState();
  }
};

// Game Variables - all using window to avoid redeclaration
window.autoInterval = window.autoInterval || null;
window.pointsPerTap = window.pointsPerTap || 1;
window.bonusChance = window.bonusChance || 0.1; // 10% chance of bonus player appearing
window.autoEnabled = window.autoEnabled || false;
window.accumulatedPoints = window.accumulatedPoints || 0;
window.fallingElementsInterval = window.fallingElementsInterval || null;
window.youngHeeInterval = window.youngHeeInterval || null;
window.gameActive = window.gameActive || true;

// We'll initialize DOM elements as global variables
window.touchButton = window.touchButton || null;
window.hpProgress = window.hpProgress || null;
window.hpValue = window.hpValue || null;
window.autoToggle = window.autoToggle || null;
window.toggleIndicator = window.toggleIndicator || null;
window.players = window.players || null;
window.youngheeElement = window.youngheeElement || null;
window.sceneLight = window.sceneLight || null;

// Initialize YoungHee Game - making it global so it can be called from HTML if needed
window.initYoungHeeGame = function () {
  console.log("Initializing YoungHee Game");

  // Initialize DOM elements here to make sure they exist
  window.touchButton = document.getElementById("touch-button");
  window.hpProgress = document.getElementById("hp-progress");
  window.hpValue = document.getElementById("hp-value");
  window.autoToggle = document.querySelector(".auto-toggle");
  window.toggleIndicator = document.querySelector(".toggle-indicator");
  window.players = document.querySelectorAll(".player");
  window.youngheeElement = document.getElementById("younghee-doll");
  window.sceneLight = document.getElementById("scene-light");

  console.log("Touch button found:", window.touchButton);
  console.log("HP progress found:", window.hpProgress);
  console.log("HP value found:", window.hpValue);
  console.log("Auto toggle found:", window.autoToggle);
  console.log("Toggle indicator found:", window.toggleIndicator);
  console.log("Players found:", window.players ? window.players.length : 0);
  console.log("YoungHee element found:", window.youngheeElement);
  console.log("Scene light found:", window.sceneLight);

  // Set points per tap based on level
  if (window.gameState && window.gameState.level) {
    window.pointsPerTap = window.gameState.level;
  }

  // Update HP bar
  if (window.updateHPBar) {
    window.updateHPBar();
  } else {
    updateHPBar();
  }

  // Set auto toggle state - use an anonymous function to avoid scope issues
  if (window.autoToggle) {
    window.autoToggle.addEventListener("click", function () {
      console.log("Auto toggle clicked");
      toggleAutoMode();
    });
  }

  // Initialize player animations
  initializePlayers();

  // Add touch button event listener
  if (window.touchButton) {
    console.log("Adding touch button event listener");
    // 1. Try with click
    window.touchButton.addEventListener("click", window.handleTouch);
    // 2. Try with mousedown
    window.touchButton.addEventListener("mousedown", window.handleTouch);
    // 3. Try with touchstart for mobile
    window.touchButton.addEventListener("touchstart", function (e) {
      e.preventDefault(); // Prevent default to avoid double firing
      window.handleTouch();
    });

    // 4. Direct inline assignment
    window.touchButton.onclick = window.handleTouch;
  } else {
    console.error("TOUCH BUTTON NOT FOUND!");
  }

  // Start background animations
  startFallingElements();
  startYoungHeeMovement();
};

// Start YoungHee movement - random turns to catch players
function startYoungHeeMovement() {
  // Clear any existing interval
  if (window.youngHeeInterval) {
    clearInterval(window.youngHeeInterval);
  }

  // Light initially green
  if (window.sceneLight) {
    window.sceneLight.classList.add("green");
  }

  // Set up turns at random intervals
  window.youngHeeInterval = setInterval(() => {
    if (!window.youngheeElement) return;

    const isWatching = window.youngheeElement.classList.contains("turn-around");
    const turnTime = isWatching
      ? Math.random() * 2000 + 1000 // If watching, turn back after 1-3 seconds
      : Math.random() * 5000 + 3000; // If facing away, turn around after 3-8 seconds

    // Play countdown sound
    const audio = new Audio();
    audio.src =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    audio.volume = 0.2;
    audio.play().catch((e) => console.log("Audio failed to play:", e));

    // Toggle the scene light
    if (window.sceneLight) {
      if (isWatching) {
        // Turning to front - light goes green
        window.sceneLight.classList.remove("red");
        window.sceneLight.classList.add("green");
      } else {
        // Turning to back - light goes red
        window.sceneLight.classList.remove("green");
        window.sceneLight.classList.add("red");
      }
    }

    // Toggle the doll position
    setTimeout(() => {
      if (window.youngheeElement) {
        if (isWatching) {
          window.youngheeElement.classList.remove("turn-around");
        } else {
          window.youngheeElement.classList.add("turn-around");
        }
      }
    }, 500); // Slight delay for the light to change first
  }, Math.random() * 3000 + 2000); // 2-5 seconds between movement decisions
}

// Create touch particles effect when button is pressed
function createTouchParticles(isPenalty) {
  const gameArea = document.querySelector(".game-area");
  if (!gameArea) return;

  const particleCount = 15;
  const colors = isPenalty
    ? ["#ff3333", "#ff5555", "#ff8888", "#ffaaaa", "#ffdddd"] // Red colors for penalty
    : ["#ff3333", "#0084ff", "#f72585", "#4cc9f0", "#ffffff"]; // Normal colors

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random position around button
    let centerX = 0;
    let centerY = 0;

    if (window.touchButton) {
      const buttonRect = window.touchButton.getBoundingClientRect();
      const gameAreaRect = gameArea.getBoundingClientRect();
      centerX = buttonRect.left + buttonRect.width / 2 - gameAreaRect.left;
      centerY = buttonRect.top + buttonRect.height / 2 - gameAreaRect.top;
    } else {
      // Fallback to center of game area
      centerX = gameArea.offsetWidth / 2;
      centerY = gameArea.offsetHeight / 2;
    }

    // Style the particle
    particle.style.position = "absolute";
    particle.style.width = Math.random() * 10 + 5 + "px";
    particle.style.height = particle.style.width;
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    particle.style.borderRadius = "50%";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.zIndex = "5";

    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 5 + 3;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    // Append to game area
    gameArea.appendChild(particle);

    // Animate
    let posX = centerX;
    let posY = centerY;
    let opacity = 1;
    let size = parseFloat(particle.style.width);
    let frame = 0;

    const animateParticle = () => {
      if (frame >= 30 || opacity <= 0) {
        particle.remove();
        return;
      }

      posX += vx;
      posY += vy;
      opacity -= 0.03;
      size *= 0.97;

      particle.style.left = posX + "px";
      particle.style.top = posY + "px";
      particle.style.opacity = opacity;
      particle.style.width = size + "px";
      particle.style.height = size + "px";

      frame++;
      requestAnimationFrame(animateParticle);
    };

    requestAnimationFrame(animateParticle);
  }
}

// Start falling elements animation
function startFallingElements() {
  if (window.fallingElementsInterval) {
    clearInterval(window.fallingElementsInterval);
  }

  const gameArea = document.querySelector(".game-area");
  if (!gameArea) return;

  window.fallingElementsInterval = setInterval(() => {
    if (Math.random() < 0.2) {
      // 20% chance to create a falling element each interval
      createFallingElement(gameArea);
    }
  }, 1000);
}

// Create a single falling element
function createFallingElement(container) {
  const elements = ["△", "○", "□", "☆", "✦"];
  const colors = ["#ff3333", "#0084ff", "#f72585", "#4cc9f0", "#ffd60a"];

  const element = document.createElement("div");
  element.className = "falling-element";

  // Random properties
  const size = Math.random() * 20 + 10;
  const randomElement = elements[Math.floor(Math.random() * elements.length)];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * (container.offsetWidth - 50);
  const duration = Math.random() * 5 + 5; // 5-10 seconds
  const delay = Math.random() * 2;

  // Style the element
  element.textContent = randomElement;
  element.style.position = "absolute";
  element.style.left = left + "px";
  element.style.top = "-50px";
  element.style.fontSize = size + "px";
  element.style.color = randomColor;
  element.style.textShadow = `0 0 10px ${randomColor}`;
  element.style.zIndex = "1";
  element.style.animationDuration = duration + "s";
  element.style.animationDelay = delay + "s";
  element.style.opacity = "0.7";

  // Add to container
  container.appendChild(element);

  // Remove after animation completes
  setTimeout(() => {
    if (element.parentNode === container) {
      container.removeChild(element);
    }
  }, (duration + delay) * 1000);
}

// Update HP bar
function updateHPBar() {
  if (!window.hpProgress || !window.hpValue) return;

  const hpPercentage = (window.gameState.hp / window.gameState.maxHp) * 100;
  window.hpProgress.style.width = `${hpPercentage}%`;
  window.hpValue.textContent = `${window.gameState.hp} / ${window.gameState.maxHp}`;
  console.log("HP updated:", window.gameState.hp, "/", window.gameState.maxHp);
}

// Initialize player animations
function initializePlayers() {
  if (!window.players || window.players.length === 0) return;

  window.players.forEach((player, index) => {
    // Set random delay for each player to move
    const delay = Math.random() * 5000;
    setTimeout(() => {
      player.style.animation =
        "playerBob 2s infinite " + Math.random() * 1 + "s";
    }, delay);

    // Add custom animations when clicked
    player.addEventListener("click", () => {
      player.style.animation = "none";
      player.style.transform = "translateY(-10px) rotate(5deg)";

      setTimeout(() => {
        player.style.animation = "playerBob 2s infinite";
        player.style.transform = "";
      }, 300);
    });
  });
}

// Show points gained animation
function showPointsGained(points) {
  const pointsElement = document.createElement("div");
  pointsElement.textContent = "+" + points;
  pointsElement.className = "points-animation";
  pointsElement.style.position = "absolute";
  pointsElement.style.color = "yellow";
  pointsElement.style.fontSize = "1.5rem";
  pointsElement.style.fontWeight = "bold";
  pointsElement.style.top = "50%";
  pointsElement.style.left = "50%";
  pointsElement.style.transform = "translate(-50%, -50%)";
  pointsElement.style.zIndex = "100";
  pointsElement.style.opacity = "0";
  pointsElement.style.animation = "fadeInOut 1s forwards";
  pointsElement.style.textShadow = "0 0 10px yellow";

  const gameArea = document.querySelector(".game-area");
  if (gameArea) {
    gameArea.appendChild(pointsElement);

    setTimeout(() => {
      pointsElement.remove();
    }, 1000);
  }
}

// Show points lost animation
function showPointsLost(points) {
  const pointsElement = document.createElement("div");
  pointsElement.textContent = "-" + points;
  pointsElement.className = "points-animation";
  pointsElement.style.position = "absolute";
  pointsElement.style.color = "#ff3333";
  pointsElement.style.fontSize = "1.5rem";
  pointsElement.style.fontWeight = "bold";
  pointsElement.style.top = "50%";
  pointsElement.style.left = "50%";
  pointsElement.style.transform = "translate(-50%, -50%)";
  pointsElement.style.zIndex = "100";
  pointsElement.style.opacity = "0";
  pointsElement.style.animation = "fadeInOut 1s forwards";
  pointsElement.style.textShadow = "0 0 10px #ff3333";

  const gameArea = document.querySelector(".game-area");
  if (gameArea) {
    gameArea.appendChild(pointsElement);

    setTimeout(() => {
      pointsElement.remove();
    }, 1000);
  }
}

// Activate a random player for bonus points
function activateRandomPlayer() {
  if (!window.players || window.players.length === 0) return;

  const randomIndex = Math.floor(Math.random() * window.players.length);
  const player = window.players[randomIndex];

  // Highlight player with glowing effect
  player.style.backgroundColor = "#f72585";
  player.style.transform = "scale(1.2)";
  player.style.transition = "all 0.3s ease";
  player.style.boxShadow = "0 0 20px #f72585";
  player.style.animation = "none";

  // Bonus points (2-5x normal points)
  const bonusMultiplier = Math.floor(Math.random() * 4) + 2;
  const bonusPoints = window.pointsPerTap * bonusMultiplier;

  // Add click handler for bonus
  const handleClick = function () {
    // Add bonus points
    window.gameState.points += bonusPoints;

    // Show bonus points animation
    showPointsGained(bonusPoints);

    // Show notification
    window.showNotification("Bonus! +" + bonusPoints + " points");

    // Visual effect - create explosion particles
    createExplosion(player);

    // Reset player appearance
    player.style.backgroundColor = "#2a9d8f";
    player.style.transform = "scale(1)";
    player.style.boxShadow = "none";
    player.style.animation = "playerBob 2s infinite";

    // Update UI
    window.updateUI();
    window.saveGameState();

    // Remove event listener
    player.removeEventListener("click", handleClick);
  };

  player.addEventListener("click", handleClick);

  // Reset player after 3 seconds if not clicked
  setTimeout(() => {
    player.style.backgroundColor = "#2a9d8f";
    player.style.transform = "scale(1)";
    player.style.boxShadow = "none";
    player.style.animation = "playerBob 2s infinite";
    player.removeEventListener("click", handleClick);
  }, 3000);
}

// Create explosion effect
function createExplosion(element) {
  const rect = element.getBoundingClientRect();
  const gameArea = document.querySelector(".game-area");
  if (!gameArea) return;

  const gameAreaRect = gameArea.getBoundingClientRect();

  // Create explosion center position
  const centerX = rect.left + rect.width / 2 - gameAreaRect.left;
  const centerY = rect.top + rect.height / 2 - gameAreaRect.top;

  // Create particles
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");

    // Random properties
    const size = Math.random() * 8 + 4;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 60 + 20;
    const duration = Math.random() * 0.5 + 0.5;

    // Calculate end position
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;

    // Style the particle
    particle.style.position = "absolute";
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.backgroundColor = "#f72585";
    particle.style.borderRadius = "50%";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.zIndex = "10";
    particle.style.opacity = "1";
    particle.style.boxShadow = "0 0 5px #f72585";

    // Add to game area
    gameArea.appendChild(particle);

    // Animate
    particle.animate(
      [
        {
          left: centerX + "px",
          top: centerY + "px",
          opacity: 1,
          transform: "scale(1)",
        },
        {
          left: endX + "px",
          top: endY + "px",
          opacity: 0,
          transform: "scale(0)",
        },
      ],
      {
        duration: duration * 1000,
        easing: "ease-out",
        fill: "forwards",
      }
    );

    // Remove after animation
    setTimeout(() => {
      if (particle.parentNode === gameArea) {
        gameArea.removeChild(particle);
      }
    }, duration * 1000);
  }
}

// Toggle auto mode
function toggleAutoMode() {
  console.log("Toggling auto mode, current:", window.autoEnabled);
  window.autoEnabled = !window.autoEnabled;

  if (window.autoEnabled) {
    // Move toggle indicator to the right
    window.toggleIndicator.style.right = "1px";
    window.toggleIndicator.style.left = "auto";

    // Enable auto mode
    enableAutoMode();
    window.showNotification("Auto mode enabled");
  } else {
    // Move toggle indicator to the left
    window.toggleIndicator.style.left = "1px";
    window.toggleIndicator.style.right = "auto";

    // Disable auto mode
    disableAutoMode();
    window.showNotification("Auto mode disabled");
  }
}

// Enable auto mode - now checks if YoungHee is watching
function enableAutoMode() {
  console.log("Enabling auto mode");
  if (window.autoInterval) {
    clearInterval(window.autoInterval);
  }

  // Auto points at 1/4 the rate of manual tapping
  const pointsPerAutoTap = window.pointsPerTap / 4;

  window.autoInterval = setInterval(() => {
    console.log("Auto mode tick");

    // Check if YoungHee is watching
    const youngheeElement = document.getElementById("younghee-doll");
    const isWatching = youngheeElement
      ? youngheeElement.classList.contains("turn-around")
      : false;

    if (isWatching) {
      console.log("Auto mode skipped - YoungHee is watching!");
      return; // Skip this tap - don't lose points in auto mode
    }

    if (window.gameState.hp <= 0) {
      // HP is depleted, stop auto mode
      disableAutoMode();
      window.toggleIndicator.style.left = "1px";
      window.toggleIndicator.style.right = "auto";
      window.autoEnabled = false;
      window.showNotification("Auto mode stopped: No HP left");
    } else {
      // Add points directly
      window.gameState.points += pointsPerAutoTap;
      window.gameState.hp -= 0.5; // Reduce HP at a slower rate

      // Show small points gained animation
      if (Math.random() < 0.3) {
        // Only show sometimes to avoid cluttering
        showPointsGained(pointsPerAutoTap);
      }

      // Update HP bar
      window.updateHPBar();

      // Update UI
      window.updateUI();
      window.saveGameState();
    }
  }, 1000);
}

// Disable auto mode
function disableAutoMode() {
  console.log("Disabling auto mode");
  if (window.autoInterval) {
    clearInterval(window.autoInterval);
    window.autoInterval = null;
  }
}

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded in younghee.js");
  setTimeout(function () {
    window.initYoungHeeGame();
  }, 100); // Small delay to ensure everything is ready
});

// Also try with window.onload
window.addEventListener("load", function () {
  console.log("Window fully loaded in younghee.js");
  if (!window.touchButton) {
    console.log("Reinitializing game after window load");
    window.initYoungHeeGame();
  }
});

// Add CSS animation for points
const styleElement = document.createElement("style");
styleElement.textContent = `
  @keyframes fadeInOut {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    10% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
    90% { transform: translate(-50%, -20%) scale(1); opacity: 1; }
    100% { transform: translate(-50%, 0) scale(0.8); opacity: 0; }
  }
  
  @keyframes playerBob {
    0% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0); }
  }
  
  #touch-button.pressed {
    transform: scale(0.95);
    background-color: #1a1a2a;
  }
  
  .particle {
    position: absolute;
    pointer-events: none;
  }
`;
document.head.appendChild(styleElement);
