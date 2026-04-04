# 8 Ball Pool - Playza Game

A real-time 1v1 multiplayer 8 Ball Pool game built with Phaser.js for the frontend and Node.js/Express for the backend.

## Features

- **Realistic Physics**: Ball-to-ball collision, cushion bounce, friction, and spin mechanics
- **Real-time Multiplayer**: WebSocket-based synchronization between clients
- **Server-authoritative**: No client trust - all physics calculated server-side
- **Official 8-Ball Rules**: Break shot, solids/stripes assignment, fouls, turn-based gameplay
- **Wallet Integration**: Entry fees, rewards, transaction logging
- **Spin Control**: Topspin, backspin, and side spin mechanics
- **Shot Prediction**: Trajectory line with cushion reflections

## Project Structure

```
playza/
├── playza-backend/
│   └── src/
│       ├── modules/
│       │   └── pool/
│       │       ├── pool.service.ts    # Game logic and room management
│       │       ├── pool.routes.ts     # API endpoints
│       │       ├── physics.ts         # Server-side physics engine
│       │       ├── rules.ts           # 8-ball game rules
│       │       └── types.ts           # TypeScript interfaces
│       └── lib/
│           └── socketHandler.ts       # WebSocket handling
│
└── playza-frontend/
    └── src/
        ├── game/
        │   └── pool/
        │       ├── PoolScene.ts       # Main game scene
        │       ├── CueStick.ts        # Cue stick visualization
        │       ├── ShotPredictor.ts   # Shot prediction line
        │       ├── SocketManager.ts   # WebSocket client
        │       ├── config.ts          # Game configuration
        │       └── types.ts           # Game types
        ├── pages/
        │   └── PoolGame.tsx           # Main game page
        ├── store/
        │   └── poolGameStore.ts       # Zustand state management
        └── api/
            └── poolApi.ts             # API client
```

## Setup Instructions

### 1. Database Setup

Run the following SQL in your Supabase SQL Editor to create the pool_rooms table:

```sql
-- 8 BALL POOL
create table if not exists pool_rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  host_id uuid not null references users(id) on delete cascade,
  guest_id uuid references users(id) on delete set null,
  stake numeric(12, 2) default 0,
  status text default 'waiting' check (status in ('waiting', 'active', 'finished', 'abandoned')),
  game_state jsonb default null,
  winner_id uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 2. Backend Setup

```bash
cd playza-backend
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd playza-frontend
npm install
npm run dev
```

### 4. Access the Game

Navigate to: `http://localhost:5173/pool`

## API Endpoints

- `GET /api/pool/rooms` - List waiting rooms
- `POST /api/pool/create` - Create new room (requires stake)
- `POST /api/pool/join` - Join existing room (requires code)
- `GET /api/pool/room/:roomId` - Get room details
- `POST /api/pool/shot` - Execute a shot
- `POST /api/pool/quickmatch` - Quick match (find or create room)
- `POST /api/pool/resign` - Resign from game

## Game Controls

1. **Aiming**: Click and drag anywhere on the table
2. **Power**: Drag distance determines shot power
3. **Shoot**: Release mouse to execute shot
4. **Spin**: Use spin control panel (future enhancement)

## 8-Ball Rules Implemented

- **Break Shot**: First player breaks the rack
- **Ball Assignment**: Solids/stripes assigned after first ball pocketed
- **Turn Switching**: Switches when no ball of your type is pocketed
- **Fouls**:
  - Scratch (cue ball pocketed)
  - No ball hit first
  - Wrong ball hit first (when balls assigned)
- **Penalties**: Ball-in-hand on foul
- **Win Condition**: Legally pocket the 8-ball after clearing your balls

## Multiplayer Architecture

1. **Room Creation**: Host creates room, pays stake
2. **Opponent Join**: Guest joins with code, pays stake
3. **Game Start**: Both players in room, game becomes active
4. **Turn System**: Server-authoritative turn management
5. **Shot Execution**: Client sends shot input, server calculates physics
6. **State Sync**: Server broadcasts game state to both players
7. **Win/Lose**: Winner receives reward (90% of total stake)

## Security Features

- JWT authentication required
- Server-authoritative physics (no client manipulation)
- Wallet balance validation before game creation
- Transaction logging for all game activities

## Tech Stack

- **Frontend**: React, Phaser.js, Zustand, TailwindCSS
- **Backend**: Node.js, Express, Supabase
- **Real-time**: Socket.IO
- **Database**: PostgreSQL (Supabase)