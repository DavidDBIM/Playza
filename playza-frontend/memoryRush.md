FULL FRONTEND GAME PROMPT (MEMORY RUSH)
🎮 GAME NAME

Memory Rush – Pattern Recall Challenge

🧠 ROLE

You are building a production-grade frontend mini-game module inside an existing gaming platform.

This is part of Solo Earn Mode, but for now:

❌ NO backend integration
❌ NO wallet logic
❌ NO real payout calculation
✅ ONLY frontend UI + simulated game state + mechanics

The game must be fully playable and ready for backend validation later.

🎯 CORE OBJECTIVE

Build a fast-paced memory and recall challenge game where:

Player memorizes a pattern sequence
Pattern disappears
Player must reproduce it correctly
Difficulty scales dynamically per round
🧩 GAME FLOW (FRONTEND ONLY)
1. START SCREEN (UI STATE)

Show:

Game title: Memory Rush
Instructions:
“Memorize the pattern”
“Repeat it exactly”
Start button
Difficulty preview (Easy / Medium / Hard)
2. PATTERN PHASE (MEMORIZATION)

When game starts:

🎯 Pattern Generator:
Generate a sequence of:
colors OR symbols OR tiles
Example:
🔵 🟢 🔴 🟡 🟢
UI Behavior:
Pattern displayed for limited time:
Easy: 3–5 seconds
Medium: 2–3 seconds
Hard: 1–2 seconds
Animation:
Tiles flash sequentially
Smooth fade-in/fade-out
Slight pulse effect per item
3. MEMORIZATION LOCK PHASE

After display:

Pattern disappears
UI shows “RECALL NOW”
Optional countdown timer starts
4. PLAYER INPUT PHASE

Player must recreate pattern using:

clickable tiles
or tap buttons
or swipe selection grid (mobile-friendly)
UI Grid:
4–9 tiles visible
same symbols/colors as pattern pool
🧠 GAME LOGIC (FRONTEND SIMULATION ONLY)
🎯 Input Rules:
Player selects tiles in sequence
Order matters strictly
Wrong selection = instant error feedback
Correct sequence = success
🔁 FEEDBACK SYSTEM
On Correct Tap:
tile glows green
soft success animation
progress advances
On Wrong Tap:
tile flashes red
sequence resets OR partial penalty (UI only)
🎯 Completion Conditions:
Full correct sequence = success
Too many mistakes = fail
Time expires = fail
📊 SCORING SYSTEM (UI ONLY)

After completion show:

Accuracy (% correct sequence)
Time taken
Pattern length
🏆 Performance Tier UI:
S Tier → perfect recall, fast
A Tier → minor delay or 1 mistake
B Tier → multiple corrections
C Tier → failed or incomplete
💰 Placeholder Reward UI:

Show:

“Potential Multiplier”
Range indicator:
1.2x – 2.0x

(NO real calculation)

🧠 ADVANCED GAME MECHANICS
1. 📈 Dynamic Difficulty Scaling

As rounds increase:

pattern length increases
display time decreases
symbol complexity increases
2. 🧩 Pattern Variations

Use multiple pattern types:

Type A: Color Sequence

🔵 🟢 🔴 🟡

Type B: Shape Sequence

● ▲ ■ ◆

Type C: Mixed Mode (Advanced)

🔵 ▲ 🟡 ■

3. 🧠 Distractor Mode (Advanced Level)

Add fake elements during recall:

extra tiles appear
irrelevant symbols included
forces real memory recall
4. ⚡ Speed Recall Mode (Hard Tier)
pattern shown extremely fast
player must respond immediately after disappearance
5. 🔁 Combo System (Frontend Only)
streak of perfect rounds increases multiplier UI
mistake resets streak
🧱 UI STRUCTURE
🟦 Layout
Top HUD:
Round number
Timer
Score placeholder
Progress bar
Center:
Pattern display area (phase-based visibility)
Input grid area
Bottom:
Status feedback:
“Memorize”
“Recall”
“Correct / Wrong indicator”
🎨 DESIGN RULES (STRICT)

Must match existing platform:

reuse same typography system
reuse button styles
reuse spacing scale
reuse card + HUD styling
no new color system introduced
dark/light mode compatibility must remain consistent
🧱 COMPONENT STRUCTURE
MemoryRushPage
PatternGenerator
PatternDisplay
RecallGrid
InputValidator (frontend state only)
GameTimer
FeedbackAnimator
ResultPanel
⚠️ STRICT CONSTRAINTS
NO backend calls
NO real scoring computation
NO wallet or payout logic
NO external memory libraries
NO AI assistance in-game logic (pure frontend simulation only)
🚀 FUTURE HOOKS (PLACEHOLDERS ONLY)

Prepare structure for:

session_id
pattern_seed
user_input_log
timing data
accuracy metrics
🧠 FINAL OUTPUT EXPECTATION

A fully playable frontend game with:

smooth animations
clear UX flow
increasing difficulty
scalable architecture
backend-ready structure