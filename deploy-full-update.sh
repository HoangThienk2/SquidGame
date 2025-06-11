#!/bin/bash

echo "🚀 Starting full deployment of Squid Game project..."

# Navigate to home directory
cd /home/psj

# Check if squid-game-updated.tar.gz exists
if [ ! -f "squid-game-updated.tar.gz" ]; then
    echo "❌ Error: squid-game-updated.tar.gz not found!"
    echo "Please upload the squid-game-updated.tar.gz file first."
    exit 1
fi

# Create backup of current squid-game-3002
echo "📦 Creating backup of current squid-game-3002..."
if [ -d "squid-game-3002" ]; then
    BACKUP_NAME="squid-game-3002-backup-$(date +%Y%m%d_%H%M%S)"
    mv squid-game-3002 "$BACKUP_NAME"
    echo "✅ Backup created: $BACKUP_NAME"
else
    echo "⚠️  No existing squid-game-3002 found, skipping backup"
fi

# Extract the updated project
echo "📂 Extracting updated project..."
mkdir -p squid-game-3002-temp
tar -xzf squid-game-updated.tar.gz -C squid-game-3002-temp

# Move extracted content to squid-game-3002
mv squid-game-3002-temp squid-game-3002

# Set proper permissions
echo "🔧 Setting proper permissions..."
chmod -R 755 squid-game-3002
chmod +x squid-game-3002/*.sh 2>/dev/null || true

# Install dependencies if package.json exists
if [ -f "squid-game-3002/package.json" ]; then
    echo "📦 Installing dependencies..."
    cd squid-game-3002
    npm install --production
    cd ..
else
    echo "⚠️  No package.json found, skipping npm install"
fi

# Copy environment file if it exists in backup
if [ -d "$BACKUP_NAME" ] && [ -f "$BACKUP_NAME/.env" ]; then
    echo "🔧 Copying environment file from backup..."
    cp "$BACKUP_NAME/.env" squid-game-3002/.env
    echo "✅ Environment file copied"
fi

# Verify the deployment
if [ -d "squid-game-3002" ] && [ -f "squid-game-3002/public/exchange.html" ]; then
    echo "✅ Deployment successful!"
    echo "📊 Project size: $(du -sh squid-game-3002 | awk '{print $1}')"
    echo "📁 Files deployed:"
    ls -la squid-game-3002/ | head -10
    echo "..."
else
    echo "❌ Deployment failed!"
    
    # Restore backup if deployment failed
    if [ -d "$BACKUP_NAME" ]; then
        echo "🔄 Restoring backup..."
        rm -rf squid-game-3002
        mv "$BACKUP_NAME" squid-game-3002
        echo "✅ Backup restored"
    fi
    exit 1
fi

# Clean up
echo "🧹 Cleaning up..."
rm -f squid-game-updated.tar.gz

echo ""
echo "🎉 Full deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Check your .env file: squid-game-3002/.env"
echo "2. Restart your application:"
echo "   - PM2: pm2 restart squid-game-3002"
echo "   - Or restart your server process manually"
echo "3. Test the application: http://your-server:3002"
echo ""
echo "📦 Backup location: $BACKUP_NAME (if created)" 