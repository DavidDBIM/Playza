# 🎮 Playza Street Fight — MVP Game Design

## 🧠 Overview

Playza Street Fight is a 1v1 competitive fighting game built using Three.js.  
This MVP focuses on a simple, responsive combat system that can later integrate into the Playza competitive ecosystem (wallet, leaderboard, matchmaking).

---

## 🔁 Core Game Loop

Match Start → Players Spawn → Fight → Health Decreases → KO → Result Screen → Reward (future)

---

## 🎮 Game Mode

- Mode: 1v1 Local (Player vs AI)
- Perspective: 2.5D (Side View)
- Arena: Fixed stage

---

## 🧍 Character Design

### 🥊 Player Character: Shadow Boxer

- Style: Fast striker
- Strength: Speed, quick combos
- Weakness: Lower durability

#### Moveset

| Move        | Key | Damage | Description             |
| ----------- | --- | ------ | ----------------------- |
| Light Punch | J   | 5      | Fast jab, low damage    |
| Heavy Kick  | K   | 12     | Slow but strong attack  |
| Block       | L   | 0      | Reduces incoming damage |
| Idle        | —   | —      | Default stance          |

---

### 🤖 Enemy Character: Street Bot

- Uses same base model (MVP stage)
- Same moves as player
- Controlled by simple AI

#### AI Behavior (Basic)

- Move toward player if far
- Attack when in range
- Occasionally block
- Randomized decision timing

---

## ❤️ Health System

- Player Health: 100 HP
- Enemy Health: 100 HP

### Damage Rules

- Punch: -5 HP
- Kick: -12 HP
- Block: Reduces damage by ~70%

---

## 🏆 Win Condition

- A player loses when HP reaches 0
- Game ends immediately on KO

---

## 🎥 Camera System

- Type: Fixed Side View (2.5D)
- Behavior:
  - Always faces both players
  - No rotation
  - Slight follow on X-axis (optional later)

---

## 🕹️ Controls

| Key | Action      |
| --- | ----------- |
| A   | Move Left   |
| D   | Move Right  |
| J   | Light Punch |
| K   | Heavy Kick  |
| L   | Block       |

_(Jump will be added later in V2)_

---

## 🏙️ Environment

### Arena: Neon Street

- Flat ground plane
- Dark/night atmosphere
- Neon lighting accents
- No interactive objects (MVP)

---

## ⚔️ Combat System (MVP Rules)

### Attack Conditions

- Attack only hits if opponent is within range
- Range is distance-based (no physics yet)

### Hit Logic

- If attacking and opponent in range:
  → Apply damage
- If opponent is blocking:
  → Reduce damage

---

## 🧠 AI System (MVP)

### Decision Loop

- If distance > threshold → Move closer
- If distance ≤ threshold:
  - 60% chance → Attack
  - 20% chance → Block
  - 20% chance → Idle

---

## 🧩 Animation Requirements

Each move must have a corresponding animation:

- Idle
- Walk
- Punch
- Kick
- Block
- Hit Reaction

---

## 🧱 Technical Scope (MVP)

### Engine

- Three.js

### Assets

- Character: `.glb`
- Arena: `.glb`

### Systems Included

- Scene setup
- Character loading
- Animation system
- Input handling
- Basic AI
- Health system

---

## 🚫 Out of Scope (For Now)

- Multiplayer
- Online matchmaking
- Wallet integration
- Advanced physics
- Combo chains
- Special powers
- Sound effects (optional later)

---

## 🚀 Future Integration (Playza Vision)

- Real-time PvP battles
- Entry fee & rewards system
- Global leaderboard
- Tournament mode
- H2H (Head-to-Head system)
- Ranking system

---

## ⚠️ Design Principles

- Keep MVP SMALL and WORKING
- Every move must map to animation
- Avoid feature creep
- Prioritize responsiveness over realism

---

## 🎯 Goal of MVP

Build a playable 1v1 fighting prototype where:

- Player can move and attack
- Enemy reacts with simple AI
- Health system works
- Game ends on KO

---

## 📌 Next Step

➡️ Move to Layer 2: Image Generation Agent  
(Generate character + environment concept art for 3D modeling)
