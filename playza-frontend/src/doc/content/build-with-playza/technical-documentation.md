
# Technical Documentation

This section is for developers integrating their game with the Playza platform.

> ⚠️ **Heads up:** The public technical docs are being expanded (a **Q1 2026** roadmap milestone — see [Roadmap](/doc/playza-gaming/roadmap)). Treat the structure below as the **planned outline**, and reach out to the developer relations team at [Admin@playza.games](mailto:Admin@playza.games) for the current SDK / API details.

## What integration covers

| Area | What you integrate against |
| --- | --- |
| **Auth** | Playza identity / session for the player |
| **Wallet** | Read player $ZA balance, charge contest entry, credit winnings |
| **Contests** | Create / join contests in one of the four formats (H2H, SoloEarn, Tournament, Games) |
| **Leaderboards** | Read live contest standings |
| **PZA Points** | Emit loyalty events for eligible actions |
| **Anti-cheat** | Submit verifiable score events server-side |
| **Webhooks** | Receive notifications when contests start / settle |

## Integration models

There are two ways to ship a game on Playza:

### 1. SDK integration

Best for **native** mobile games — you embed the Playza SDK into your iOS / Android build, and the SDK handles identity, wallet, contest hooks, and PZA Points emission.

### 2. Server integration

Best for **web games** or studios that already have their own client. Your server talks to Playza's contest and wallet APIs directly.

## A typical contest lifecycle

```
1. Player taps "Enter contest" in the Playza web app
 │
 ▼
2. Playza charges $ZA from the player's wallet (entry fee)
 │
 ▼
3. Playza launches your game with a session token
 │
 ▼
4. Your game plays out the round (H2H, SoloEarn, Tournament, or Games)
 │
 ▼
5. Your game submits the final score to Playza (server-side)
 │
 ▼
6. Playza ranks all entries, settles $ZA payouts using the
 prize-pool algorithm, updates leaderboards, and awards PZA Points
```

## Security expectations

- **All score events must be verifiable server-side.** Scores submitted purely from the client are not trusted.
- **No client-side wallet writes.** Only Playza's server moves $ZA.
- **Session tokens are short-lived.** Don't cache them across rounds.

## Where to ask questions

- 📧 [Admin@playza.games](mailto:Admin@playza.games)

## What's next

Once you're ready to submit a game, head to **[Submit Your Game](/doc/build-with-playza/submit-your-game)**.
