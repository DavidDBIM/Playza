FULL FRONTEND + GAME MECHANICS PROMPT (REFLEX SHOOTER)
🧠 ROLE

You are building a production-grade frontend game module inside an existing gaming platform.

This is a Solo Earn Mode game, but for now:

NO backend integration
NO wallet logic
NO real payout calculation
ONLY frontend + simulated state + game mechanics
🎯 GAME NAME

Reflex Shooter – Rapid Target Hit

🧩 CORE OBJECTIVE

Build a fully playable frontend mini-game where:

Player shoots moving targets
Game runs in timed sessions (e.g. 30–60 seconds)
Accuracy + speed determines score (frontend simulation only)
Game is self-contained but ready for backend validation later
🎮 GAME LOOP (FRONTEND LOGIC ONLY)
1. START STATE
“Start Game” button
Show:
Rules
Session duration (e.g. 45s)
Ammo limit (e.g. 15 bullets)
2. GAME START (UI TRANSITION)

When user clicks start:

Transition to game arena
Start countdown timer
Spawn targets automatically
3. GAMEPLAY LOOP
🎯 Target System
Targets spawn in random positions inside arena
Each target has:
size (small / medium / large)
speed (slow / medium / fast)
lifespan (auto disappear if not hit)
🎯 Movement Patterns:
Vertical oscillation
Horizontal sliding
Diagonal movement (advanced level)
🔫 Shooting System
User taps/clicks to shoot
Bullet reduces ammo count
Hit detection:
If click overlaps target → HIT
else → MISS
🎯 Hit Rules:
Small target = 3 points
Medium target = 2 points
Large target = 1 point
Fast moving target = bonus multiplier (x1.5)
4. GAME TIMER
Countdown visible on HUD
Game ends when:
time = 0 OR
ammo = 0
5. GAME END STATE

Show results screen:

📊 Stats Display:
Total shots fired
Hits
Misses
Accuracy % (hits/shots)
Score breakdown
🏆 Performance Tier (UI ONLY):
S Tier (90–100%)
A Tier (75–89%)
B Tier (50–74%)
C Tier (<50%)
💰 Placeholder Reward UI:
Show “Potential Multiplier”
Do NOT calculate real payout
Just UI placeholder like:
1.2x – 2.0x range indicator
🧠 ADVANCED GAME MECHANICS (IMPORTANT)
🎯 1. Dynamic Difficulty Scaling

As session progresses:

targets spawn faster
target size decreases
movement speed increases
🎯 2. Anti-Pattern Randomization

Ensure:

spawn positions are not predictable
no repeated movement patterns
no static spawn zones
🎯 3. Combo System (Frontend only)
Consecutive hits build combo
Combo increases score multiplier UI
Miss resets combo
🎯 4. Precision Hit Detection

Use:

bounding box or circle collision detection
ensure hit validation is pixel-accurate
🎯 5. Visual Feedback System

On hit:

flash effect
small shake animation
+score pop-up animation

On miss:

subtle recoil animation
UI feedback indicator
🧱 UI STRUCTURE
🟦 Game Arena Layout
Top HUD:
Timer
Score
Ammo count
Session ID placeholder
Center:
Game canvas (targets spawn here)
Bottom:
Fire indicator / click zone (optional mobile UX support)
🎨 DESIGN RULES

Must match existing platform:

same typography
same button styles
same spacing system
same background theme
same card styling

NO new design language allowed.

🧩 COMPONENT STRUCTURE (FRONTEND)
ReflexShooterPage
GameHUD
TargetSpawner
TargetEntity
ScoreManager (frontend state only)
ResultPanel
CountdownTimer
GameArenaCanvas
⚠️ STRICT CONSTRAINTS
NO backend calls
NO real wallet logic
NO real reward computation
NO external physics engines required
NO cheating logic enforcement (frontend only simulation)
🚀 FUTURE BACKEND HOOKS (DO NOT IMPLEMENT NOW)

Leave placeholders for:

session_id
score payload
accuracy metrics
timestamp logs
🧠 FINAL OUTPUT EXPECTATION

A fully playable frontend game:

smooth animations
responsive controls
scalable architecture
easy backend injection later