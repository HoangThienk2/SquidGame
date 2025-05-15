# Squid Mini Game for Telegram

A mini-game inspired by Squid Game, designed to be integrated with Telegram. The game consists of two main components:

## YoungHee (영희) T2E

- Daily check-in for points
- Automatic point accumulation (1/4 the rate of manual tapping)
- When HP is depleted in auto mode, press Take button to collect points
- Level-up notifications when sufficient points are accumulated
- Random appearance of squid game players during tapping for bonus points

## Cheolsoo (철수) T2E

A simple tap game to earn TON and SMG:

- SMG game: Check-in every 2 hours and earn with one tap
- TON game: Check-in every 2 hours and play the mask man tap game

### Game Features:

- Daily check-in rewards starting at 10 SMG, increasing by 1 SMG for consecutive days
- Check-in game every 2 hours with 4 SMG reward
- TON reward game every 3 hours
- Tap the falling mask man with circle, triangle, or square mask
- Earn 0.001 TON for correct taps

## Installation

```
npm install
npm run dev
```

## Telegram Integration

Follow the [Telegram Bot API documentation](https://core.telegram.org/bots/api) to integrate this game with your Telegram bot.
