FULL FRONTEND GAME PROMPT (PATH NAVIGATION MAZE)
🎮 GAME NAME

Path Navigation Maze – Rapid Decision Run

🧠 ROLE

You are building a production-grade frontend mini-game module inside an existing gaming platform.

This is part of Solo Earn Mode, but for now:

❌ NO backend integration
❌ NO wallet logic
❌ NO payout calculation
✅ ONLY frontend UI + simulated game state + mechanics

The game must be fully playable and structured for backend injection later.

🎯 CORE OBJECTIVE

Build a fast-paced decision-making navigation game where:

Player moves through a forward-moving path automatically
At junctions, player must choose correct direction
Wrong choice leads to crash / penalty
Correct choices increase score and survival distance
🧩 GAME FLOW (FRONTEND ONLY)
1. START SCREEN (UI STATE)

Show:

Game title: Path Navigation Maze
Instructions:
“Choose the correct path at each junction”
“One wrong move ends the run”
Start button
Difficulty preview:
Easy / Medium / Hard
2. GAME START (TRANSITION)

On start:

UI switches to game arena
Character auto-moves forward
Camera follows forward motion (runner-style but simplified)
🧠 CORE GAMEPLAY LOOP
🟦 AUTO-MOVEMENT SYSTEM
Player character moves forward continuously
Speed increases over time (difficulty scaling)
🧩 JUNCTION SYSTEM (CORE MECHANIC)

At intervals:

player reaches a junction point
2–4 possible paths appear:
Left
Right
Straight
Occasionally fake/dead end paths
🎯 PLAYER ACTION

Player must:

tap / click direction button
or swipe input (mobile-friendly option)
❗ RULE SYSTEM

Only one correct path per junction.

Correct path → continue run
Wrong path → crash animation + game ends
No response in time → auto-fail
🧠 GAME LOGIC (FRONTEND SIMULATION ONLY)
🎯 PATH GENERATION
Paths are generated from a seeded random system (frontend simulated only)
Junction pattern varies:
simple binary (left/right)
triple choice
maze-style fork chains
⚡ DIFFICULTY SCALING

As game progresses:

speed increases
junction frequency increases
fake paths appear more often
time window to choose decreases
🧩 OBSTACLE LAYER (ADVANCED)

Add obstacles inside paths:

moving barriers
collapsing tiles
rotating gates (visual only for now)
📊 SCORING SYSTEM (UI ONLY)

After run ends:

Show:

Distance traveled
Junctions cleared
Accuracy (% correct decisions)
Reaction speed (UI metric only)
🏆 PERFORMANCE TIERS:
S Tier → flawless run
A Tier → 1–2 mistakes
B Tier → mid survival
C Tier → early failure
💰 PLACEHOLDER REWARD UI:

Show:

“Potential Multiplier”
Range: 1.2x – 2.0x

(NO real computation)

🧠 ADVANCED GAME MECHANICS
1. 🔀 Dynamic Path Randomization
no repeating patterns
junction layouts vary per run
ensures unpredictability
2. ⚡ Reaction Pressure System
decision time decreases gradually
late-game becomes near instant decision making
3. 🧠 Fake Path Logic (Advanced Level)
some paths visually correct but are traps
forces real attention, not guessing
4. 🔁 Combo Survival System
consecutive correct decisions increase combo multiplier UI
wrong move resets combo
5. 🎥 CAMERA FEELING (UI IMMERSION)
forward motion simulation
slight screen shake on speed increase
crash animation on failure
🧱 UI STRUCTURE
🟦 GAME ARENA
Top HUD:
Distance meter
Junction counter
Timer (optional mode)
CENTER:
Path system (dynamic lanes)
Character auto-run position
BOTTOM:
Direction controls:
Left button
Right button
Optional straight button
🎨 DESIGN RULES (STRICT)

Must fully match existing platform:

same typography system
same button styles
same spacing scale
same background/theme system
same animation feel
no new visual identity introduced
🧱 COMPONENT STRUCTURE
PathMazePage
PathGeneratorEngine
JunctionSpawner
PlayerAutoRunner
InputController
CollisionSimulator (frontend only)
HUDDisplay
ResultPanel
⚠️ STRICT CONSTRAINTS
NO backend calls
NO wallet logic
NO real reward computation
NO physics engine dependency required
NO external AI logic

Everything is frontend simulation only.

🚀 FUTURE BACKEND HOOKS (PLACEHOLDERS ONLY)

Prepare structure for:

session_id
path_seed
junction_log
decision timestamps
survival distance
accuracy metrics
🧠 FINAL OUTPUT EXPECTATION

A fully playable frontend game with:

smooth forward motion feel
responsive decision controls
escalating difficulty
clean UI consistency with platform
backend-ready architecture