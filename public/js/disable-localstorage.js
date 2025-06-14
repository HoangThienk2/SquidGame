/**
 * Disable localStorage completely to prevent any backup creation
 * This script should be loaded first before any other scripts
 */

(function () {
  "use strict";

  console.log("🚫 Disabling localStorage for server-only approach...");

  // Store original localStorage methods
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;

  // List of allowed localStorage keys (for essential functionality only)
  const allowedKeys = [
    "game_user_id", // For API authentication
    "game_auth_token", // For API authentication
    "telegramUserId", // For user identification (though we prefer sessionStorage)
  ];

  // Override localStorage.setItem to block game state storage
  localStorage.setItem = function (key, value) {
    // Block all game state related localStorage
    if (
      key.includes("game_interface_state") ||
      key.includes("backup") ||
      key.includes("game_last_save") ||
      key.includes("gameState") ||
      key.includes("taptoearn_state") ||
      key.includes("game1State")
    ) {
      console.warn(
        `🚫 BLOCKED localStorage.setItem("${key}") - Using server API only`
      );
      return; // Don't save to localStorage
    }

    // Allow essential keys only
    if (allowedKeys.includes(key)) {
      console.log(
        `✅ ALLOWED localStorage.setItem("${key}") - Essential functionality`
      );
      return originalSetItem.call(this, key, value);
    }

    // Block everything else
    console.warn(
      `🚫 BLOCKED localStorage.setItem("${key}") - Server-only approach`
    );
  };

  // Override localStorage.getItem to warn about blocked keys
  localStorage.getItem = function (key) {
    if (
      key.includes("game_interface_state") ||
      key.includes("backup") ||
      key.includes("game_last_save") ||
      key.includes("gameState") ||
      key.includes("taptoearn_state") ||
      key.includes("game1State")
    ) {
      console.warn(
        `🚫 BLOCKED localStorage.getItem("${key}") - Using server API only`
      );
      return null; // Return null as if key doesn't exist
    }

    return originalGetItem.call(this, key);
  };

  // Clean up existing game state localStorage on load
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.includes("game_interface_state") ||
        key.includes("backup") ||
        key.includes("game_last_save") ||
        key.includes("gameState") ||
        key.includes("taptoearn_state") ||
        key.includes("game1State") ||
        key === "loglevel")
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    originalRemoveItem.call(localStorage, key);
    console.log(`🗑️ Cleaned up localStorage: ${key}`);
  });

  if (keysToRemove.length > 0) {
    console.log(`✅ Cleaned up ${keysToRemove.length} localStorage entries`);
  }

  console.log("✅ localStorage protection enabled - Server API only!");
})();
