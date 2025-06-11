#!/bin/bash

echo "🚀 Starting deployment of exchange.html update..."

# Navigate to home directory
cd /home/psj

# Check if squid-game-3002 exists
if [ ! -d "squid-game-3002" ]; then
    echo "❌ Error: squid-game-3002 directory not found!"
    exit 1
fi

# Check if exchange-update.tar.gz exists
if [ ! -f "exchange-update.tar.gz" ]; then
    echo "❌ Error: exchange-update.tar.gz not found!"
    echo "Please upload the exchange-update.tar.gz file first."
    exit 1
fi

# Create backup of current exchange.html
echo "📦 Creating backup of current exchange.html..."
if [ -f "squid-game-3002/public/exchange.html" ]; then
    cp squid-game-3002/public/exchange.html squid-game-3002/public/exchange.html.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created successfully"
else
    echo "⚠️  No existing exchange.html found, skipping backup"
fi

# Extract the updated file
echo "📂 Extracting updated exchange.html..."
tar -xzf exchange-update.tar.gz

# Copy the updated file to squid-game-3002
echo "🔄 Deploying updated exchange.html..."
cp public/exchange.html squid-game-3002/public/exchange.html

# Clean up extracted files
rm -rf public/

# Verify the deployment
if [ -f "squid-game-3002/public/exchange.html" ]; then
    echo "✅ Deployment successful!"
    echo "📊 File size: $(ls -lh squid-game-3002/public/exchange.html | awk '{print $5}')"
    echo "🕒 Last modified: $(ls -l squid-game-3002/public/exchange.html | awk '{print $6, $7, $8}')"
else
    echo "❌ Deployment failed!"
    exit 1
fi

# Optional: Restart the application if needed
echo "🔄 You may need to restart your application to see the changes."
echo "💡 Run: pm2 restart squid-game-3002 (if using PM2)"
echo "💡 Or restart your server process manually"

echo "🎉 Deployment completed successfully!" 