#!/bin/bash

echo "🦑 Starting Squid Game Mini App..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one with your Telegram Bot Token."
    echo "Example .env content:"
    echo "TELEGRAM_BOT_TOKEN=7734367102:AAEg7tQ7W7EPnwZoflk3wuAALK7ew03A7Rg"
    echo "PORT=3000"
    echo "API_BASE_URL=https://your-domain.com"
fi

echo "🚀 Starting server..."
echo "📱 Mini App will be available at:"
echo "   - Local: http://localhost:3000"
echo "   - Yeonghee: http://localhost:3000/yeonghee"
echo "   - Cheolsu: http://localhost:3000/cheolsu"
echo ""
echo "🤖 Telegram Bot Commands:"
echo "   - /start - Show character selection"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

# Start the server
npm start 