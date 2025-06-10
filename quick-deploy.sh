#!/bin/bash

# Quick Squid Game Deployment Script
echo "🦑 Quick Squid Game Deployment to 211.239.114.79"
echo "=================================================="

# Check if deployment package exists
if [ ! -f "squid-game-deploy.tar.gz" ]; then
    echo "📦 Creating deployment package..."
    ./deploy.sh
fi

echo ""
echo "🚀 Now follow these steps:"
echo ""
echo "1️⃣  Upload to server:"
echo "   scp squid-game-deploy.tar.gz ubuntu@211.239.114.79:~/"
echo ""
echo "2️⃣  Connect to server:"
echo "   ssh ubuntu@211.239.114.79"
echo "   Password: psj 1212qwqw!!"
echo ""
echo "3️⃣  On the server, run:"
echo "   tar -xzf squid-game-deploy.tar.gz"
echo "   chmod +x server-setup.sh"
echo "   ./server-setup.sh"
echo ""
echo "4️⃣  Your game will be available at:"
echo "   http://211.239.114.79"
echo ""
echo "📋 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""

# Try to upload automatically if sshpass is available
if command -v sshpass &> /dev/null; then
    echo "🔄 Attempting automatic upload..."
    if sshpass -p "psj 1212qwqw!!" scp -o StrictHostKeyChecking=no squid-game-deploy.tar.gz ubuntu@211.239.114.79:~/; then
        echo "✅ Upload successful!"
        echo ""
        echo "🔗 Now connect to your server and run the deployment:"
        echo "   ssh ubuntu@211.239.114.79"
        echo "   tar -xzf squid-game-deploy.tar.gz && chmod +x server-setup.sh && ./server-setup.sh"
    else
        echo "❌ Automatic upload failed. Please upload manually using the scp command above."
    fi
else
    echo "💡 Install sshpass for automatic upload: brew install hudochenkov/sshpass/sshpass"
fi 