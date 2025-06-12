// GitHub Pages API Replacement
// Since GitHub Pages only serves static files, we need external services

class GitHubPagesAPI {
  constructor() {
    // Option 1: JSONBin.io (Free JSON storage)
    this.jsonBinURL = "https://api.jsonbin.io/v3/b";
    this.jsonBinKey = "$2a$10$YOUR_API_KEY_HERE"; // Get from jsonbin.io

    // Option 2: Firebase (Google's free database)
    this.firebaseURL = "https://squidgame-default-rtdb.firebaseio.com";

    // Option 3: Supabase (Open source Firebase alternative)
    this.supabaseURL = "https://your-project.supabase.co/rest/v1";
    this.supabaseKey = "YOUR_SUPABASE_KEY";

    // Choose which service to use
    this.useService = "localStorage"; // fallback to localStorage for now
  }

  // JSONBin.io Implementation
  async saveToJSONBin(userId, data) {
    try {
      const response = await fetch(`${this.jsonBinURL}/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": this.jsonBinKey,
          "X-Bin-Name": `squidgame_user_${userId}`,
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.error("JSONBin save error:", error);
      return false;
    }
  }

  async loadFromJSONBin(userId) {
    try {
      const response = await fetch(`${this.jsonBinURL}/${userId}/latest`, {
        headers: {
          "X-Master-Key": this.jsonBinKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.record;
      }
    } catch (error) {
      console.error("JSONBin load error:", error);
    }
    return null;
  }

  // Firebase Implementation
  async saveToFirebase(userId, data) {
    try {
      const response = await fetch(`${this.firebaseURL}/users/${userId}.json`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.error("Firebase save error:", error);
      return false;
    }
  }

  async loadFromFirebase(userId) {
    try {
      const response = await fetch(`${this.firebaseURL}/users/${userId}.json`);

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Firebase load error:", error);
    }
    return null;
  }

  // Main API methods (same interface as original)
  async syncGameState(userId, gameState) {
    console.log(`🔄 Syncing game state for user: ${userId}`);

    switch (this.useService) {
      case "jsonbin":
        return await this.saveToJSONBin(userId, gameState);
      case "firebase":
        return await this.saveToFirebase(userId, gameState);
      default:
        // Fallback to localStorage
        localStorage.setItem(`squidgame_${userId}`, JSON.stringify(gameState));
        console.log("💾 Saved to localStorage (fallback)");
        return true;
    }
  }

  async loadGameState(userId) {
    console.log(`📥 Loading game state for user: ${userId}`);

    switch (this.useService) {
      case "jsonbin":
        return await this.loadFromJSONBin(userId);
      case "firebase":
        return await this.loadFromFirebase(userId);
      default:
        // Fallback to localStorage
        const data = localStorage.getItem(`squidgame_${userId}`);
        if (data) {
          console.log("📱 Loaded from localStorage (fallback)");
          return JSON.parse(data);
        }
        return null;
    }
  }

  // Setup methods for different services
  setupJSONBin(apiKey) {
    this.jsonBinKey = apiKey;
    this.useService = "jsonbin";
    console.log("✅ JSONBin.io configured");
  }

  setupFirebase(projectUrl) {
    this.firebaseURL = projectUrl;
    this.useService = "firebase";
    console.log("✅ Firebase configured");
  }

  setupSupabase(url, key) {
    this.supabaseURL = url;
    this.supabaseKey = key;
    this.useService = "supabase";
    console.log("✅ Supabase configured");
  }
}

// Replace the original API calls in index.html
window.GitHubPagesAPI = GitHubPagesAPI;

// Usage example:
/*
const api = new GitHubPagesAPI();

// Option 1: Use JSONBin.io (recommended for beginners)
api.setupJSONBin('$2a$10$YOUR_API_KEY_FROM_JSONBIN');

// Option 2: Use Firebase
api.setupFirebase('https://your-project-default-rtdb.firebaseio.com');

// Then use normally:
await api.syncGameState(userId, gameState);
const loadedState = await api.loadGameState(userId);
*/
