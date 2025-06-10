#!/bin/bash

# Automated Squid Game Deployment Script
# This script will automatically deploy to the Ubuntu server

echo "🦑 Starting Automated Squid Game Deployment..."

# Server configuration
SERVER_IP="211.239.114.79"
SERVER_USER="ubuntu"
SERVER_PASSWORD="psj 1212qwqw!!"
APP_PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}Installing sshpass for automated SSH...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install hudochenkov/sshpass/sshpass
        else
            echo -e "${RED}Please install Homebrew first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y sshpass
    else
        echo -e "${RED}Please install sshpass manually for your system${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📦 Creating deployment package...${NC}"

# Run the deployment preparation script
./deploy.sh

if [ ! -f "squid-game-deploy.tar.gz" ]; then
    echo -e "${RED}❌ Deployment package not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Uploading to server...${NC}"

# Upload the deployment package
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no squid-game-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:~/

echo -e "${BLUE}🚀 Deploying on server...${NC}"

# Execute deployment on server
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
echo "🦑 Starting server deployment..."

# Stop any existing application
pm2 stop squid-game 2>/dev/null || true
pm2 delete squid-game 2>/dev/null || true

# Create backup of existing deployment
if [ -d "/var/www/squid-game" ]; then
    sudo mv /var/www/squid-game /var/www/squid-game-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
fi

# Extract new deployment
mkdir -p ~/squid-game-temp
cd ~/squid-game-temp
tar -xzf ~/squid-game-deploy.tar.gz

# Run the server setup script
chmod +x server-setup.sh
./server-setup.sh

# Clean up
cd ~
rm -rf ~/squid-game-temp
rm -f ~/squid-game-deploy.tar.gz

echo "✅ Deployment completed!"
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Your Squid Game is now available at: http://${SERVER_IP}${NC}"
    echo -e "${BLUE}📊 To check status: ssh ubuntu@${SERVER_IP} 'pm2 status'${NC}"
    echo -e "${BLUE}📝 To check logs: ssh ubuntu@${SERVER_IP} 'pm2 logs squid-game'${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Clean up local files
rm -f squid-game-deploy.tar.gz

echo -e "${GREEN}🦑 Automated deployment completed!${NC}" 