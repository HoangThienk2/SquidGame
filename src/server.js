const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// API routes
app.get("/api/game-state", (req, res) => {
  // This would typically fetch the user's game state from a database
  res.json({
    success: true,
    data: {
      points: 0,
      level: 1,
      hp: 100,
      smg: 0,
      ton: 0,
      lastCheckIn: null,
      consecutiveCheckIns: 0,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
