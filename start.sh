#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run this application."
    exit 1
fi

# Clear browser cache suggestion
echo "NOTE: If you're experiencing issues, try clearing your browser cache before running."
echo "For Chrome/Edge: Open DevTools (F12) -> Application -> Clear Storage -> Clear site data"
echo "For Firefox: Open DevTools (F12) -> Storage -> Clear Storage"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

# Create empty files for image placeholders if they don't exist
echo "Setting up game resources..."
mkdir -p public/images
touch public/images/temp.png 2>/dev/null
cp -n public/images/temp.png public/images/game-bg.png 2>/dev/null
cp -n public/images/temp.png public/images/younghee.png 2>/dev/null
cp -n public/images/temp.png public/images/side-doll.png 2>/dev/null
cp -n public/images/temp.png public/images/avatar.png 2>/dev/null

# Create a special debug.js file to help with troubleshooting
echo "Creating debug helper script..."
cat > public/js/debug.js << EOF
// Debug helper for Squid Game
console.log('Debug script loaded');

// This will be loaded first
window.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready in debug script');
  
  // Attach to window error events
  window.addEventListener('error', function(e) {
    console.error('Global error:', e.message, 'at', e.filename, 'line', e.lineno);
  });
  
  // Clear localStorage to avoid issues
  try {
    localStorage.clear();
    console.log('localStorage cleared for fresh start');
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
  
  // Add direct button handler in case other scripts fail
  window.setTimeout(function() {
    var touchButton = document.getElementById('touch-button');
    if (touchButton) {
      console.log('Adding emergency touch handler from debug.js');
      touchButton.addEventListener('click', function() {
        console.log('Emergency touch handler activated');
        
        return false;
      });
    }
  }, 500);
});
EOF

# Update index.html to include debug script
echo "Updating index.html to include debug script..."
sed -i.bak '/<head>/a\\n  <!-- Debug script -->\n  <script src="js/debug.js"></script>' public/index.html 2>/dev/null || true

# Check if .env file exists, if not, create it from example
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "PORT=3000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=development" > .env
    echo "Please update .env with your Telegram Bot token if needed."
fi

# Start the server
echo "Starting Squid Mini Game server..."
echo "Open http://localhost:3000 in your browser"
echo "TIP: Remember to click RELOAD in your browser if you still see issues"
npm start 