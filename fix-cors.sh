#!/bin/bash

echo "🔧 Fixing CORS for GitHub Pages"
echo "================================"

# SSH into server and update CORS configuration
ssh psj@211.239.114.79 << 'EOF'
cd SquidGame

# Create backup
cp server.js server.js.backup

# Update CORS configuration to specifically allow GitHub Pages
sed -i 's/app.use(cors());/app.use(cors({\
  origin: [\
    "https:\/\/HoangThienk2.github.io",\
    "https:\/\/hoangthienk2.github.io",\
    "http:\/\/localhost:3000",\
    "http:\/\/127.0.0.1:3000"\
  ],\
  credentials: true,\
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],\
  allowedHeaders: ["Content-Type", "Authorization"]\
}));/' server.js

echo "✅ CORS configuration updated"
echo "🔄 Restarting server..."

# Restart the server
pm2 restart all || node server.js &

echo "✅ Server restarted with new CORS settings"
echo "🌐 GitHub Pages can now access: http://211.239.114.79:3000/api/"

EOF

echo "🎉 CORS fix completed!"
echo "🔗 Test your game at: https://HoangThienk2.github.io" 