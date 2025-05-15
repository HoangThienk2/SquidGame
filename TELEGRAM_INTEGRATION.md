# Integrating Squid Mini Game with Telegram

This document provides instructions for integrating the Squid Mini Game with Telegram using the Telegram Bot API and the Mini App platform.

## Prerequisites

1. A Telegram Bot token (create one via [BotFather](https://t.me/botfather))
2. A publicly accessible server to host your game (or use a service like ngrok during development)

## Steps for Integration

### 1. Create a Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use the `/newbot` command to create a new bot
3. Choose a name and username for your bot
4. Save the bot token provided by BotFather

### 2. Configure Web App Settings

1. Message BotFather with `/mybots` and select your bot
2. Choose "Bot Settings" > "Menu Button" > "Configure menu button"
3. Set the Web App URL to your game's URL (e.g., `https://your-domain.com/`)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Set `TELEGRAM_BOT_TOKEN` to your bot token
3. Set other configurations as needed

### 4. Deploy the Application

1. Deploy your application to a publicly accessible server
2. Make sure the domain has a valid SSL certificate
3. Set the `PORT` environment variable as needed

### 5. Set Bot Commands (Optional)

Configure BotFather to set commands for your bot:

```
play - Start playing Squid Mini Game
balance - Check your SMG and TON balance
leaderboard - View the top players
help - Get help using the game
```

## Using the Telegram Web App API

The game already includes the Telegram Web App JavaScript SDK, which provides several useful features:

- `window.Telegram.WebApp.expand()` - Expands the mini app to full screen
- `window.Telegram.WebApp.MainButton` - Controls the main button at the bottom of the screen
- `window.Telegram.WebApp.BackButton` - Controls the back button
- `window.Telegram.WebApp.close()` - Closes the mini app
- `window.Telegram.WebApp.initData` - Contains information about the user and the app

## Data Persistence

The game currently saves data to the browser's localStorage. For production use, you should implement:

1. Server-side storage with MongoDB (configuration included in `.env.example`)
2. User authentication via Telegram Login Widget or Mini App user data
3. API endpoints for saving and retrieving game state

## Testing

During development, you can test your Mini App using:

1. The [Mini App Test Tool](https://dev.telegram.org/bots/webapps#testing-mini-apps)
2. Providing a direct link to your bot with the `?startapp` parameter
3. Using ngrok to create a temporary HTTPS URL for local development

## Telegram Payment Integration (Future Enhancement)

To implement payments for in-game purchases:

1. Connect with BotFather's `/mybots` > "Payments" to set up a payment provider
2. Implement the Telegram Payments API in your server
3. Create payment buttons in your Mini App that call `window.Telegram.WebApp.openInvoice()`

## Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Payments API](https://core.telegram.org/bots/payments)
