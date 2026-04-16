ADMIN to BACKEND:

```json
create game
{
  "title": "VelocityGL",
  "slug": "velocity-gl",
  "category": "Action",
  "thumbnailUrl": "...",
  "iframeUrl": "...",
  "difficulty": "Hard",
  "mode": "Tournament",
  "durationInSeconds": 300,
  "platformFeePercentage": 10,
  "howToPlay": {
    "controls": "...",
    "rules": "...",
    "scoring": "..."
  }
}

2. create session 
{
  "gameId": "game_01HQ...",
  "title": "Elite Tournament #1",
  "type": "tournament",
  "entryFee": 1500,
  "maxPlayers": 200,
  "winnersCount": 20,
  "scheduledStartTime": "2026-04-16T13:00:00Z",
  "scheduledEndTime": "2026-04-16T16:00:00Z"
}


BACKEND to FRONTEND
1. get game

[
  {
    "id": "game_01HQ...",
    "title": "VelocityGL",
    "slug": "velocity-gl",
    "thumbnailUrl": "...",
    "category": "Action",
    "difficulty": "Hard",
    "durationInSeconds": 300,
    "isActive": true
  }
]

2. get sessions

[
  {
    "id": "session_01HQ...",
    "gameId": "game_01HQ...",
    "title": "Elite Tournament #1",
    "type": "tournament",
    "entryFee": 1500,
    "playersJoined": 124,
    "maxPlayers": 200,
    "grossPrizePool": 186000 (to be calculated: entryFee * playersJoined),
    "netPrizePool": 167400, (grossPrizePool - (grossPrizePool * platformFeePercentage / 100))
    "winnersCount": 20,
    "status": "WAITING",
    "startTime": "2026-04-16T13:00:00Z",
    "endTime": "2026-04-16T16:00:00Z"
  }
]

3. join session response

{
  "success": true,
  "sessionPlayer": {
    "id": "sp_01HQ...",
    "sessionId": "session_01HQ...",
    "status": "JOINED",
    "joinedAt": "..."
  },
  "wallet": {
    "balance": 8500
  }
}

4. Start Gmae Response 

{
  "sessionId": "session_01HQ...",
  "game": {
    "iframeUrl": "...",
    "durationInSeconds": 300
  },
  "sessionConfig": {
    "startTime": "...",
    "endTime": "..."
  }
}

5. submit score response

{
  "success": true,
  "validatedScore": 89420,
  "rank": 3,
  "status": "FINISHED"
}

6. Leaderboard response

{
  "sessionId": "session_01HQ...",
  "status": "LIVE",
  "lastUpdatedAt": "...",
  "entries": [
    {
      "rank": 1,
      "userId": "user_1",
      "username": "player1",
      "avatarUrl": "...",
      "score": 89420,
      "status": "FINISHED"
    },
    {
      "rank": 2,
      "userId": "user_2",
      "username": "player2",
      "avatarUrl": "...",
      "score": 88100,
      "status": "PLAYING"
    }
  ],
  "currentUser": {
    "rank": 12,
    "score": 54000,
    "status": "PLAYING"
  }
}
```

FINAL FLOWS NEED

ADMIN → creates Game
ADMIN → creates Session

USER → joins Session
USER → plays Game
USER → submits Score

BACKEND → validates score
BACKEND → computes ranking
BACKEND → returns leaderboard
BACKEND → distributes payout
ADMIN → end session
ADMIN → trigger payout...

check this now...

Now what is the grossPrizePool and netPrizepool? and why game has platformfee