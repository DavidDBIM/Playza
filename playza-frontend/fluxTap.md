FULL FRONTEND GAME PROMPT (FLUX TAP – TAP SWAP EVOLUTION)
🎮 GAME NAME

Flux Tap – State Swap Challenge

🧠 ROLE

You are building a production-grade frontend mini-game module inside an existing gaming platform.

This is part of Solo Earn Mode, but for now:

❌ NO backend integration
❌ NO wallet logic
❌ NO payout calculation
✅ ONLY frontend UI + simulated state + mechanics

This must feel like a high-speed logic + reflex hybrid game.

🎯 CORE OBJECTIVE

Build a dynamic state-changing tap puzzle game where:

Player interacts with nodes (tiles/cards)
Each tap changes multiple states (not just swapping)
Rules change dynamically per round
Player must adapt under time pressure
🧩 GAME FLOW (FRONTEND ONLY)
1. START SCREEN (UI STATE)

Show:

Game title: Flux Tap
Instructions:
“Adapt to changing rules”
“Tap to manipulate states”
Start button
Difficulty preview (Easy / Medium / Hard)
2. ROUND INIT PHASE

When game starts:

Display grid of nodes (4–9 tiles)
Each node has:
color
symbol
state (active / inactive / locked)
⚡ CORE GAME MECHANIC: STATE MANIPULATION

Unlike normal tap-swap games:

👉 Each tap can affect MULTIPLE properties:

color changes
symbol rotates
neighboring nodes shift state
or trigger chain reaction

BUT the rule of interaction changes every round.

🧠 GAME MODES (DYNAMIC RULE SYSTEM)

Each round randomly selects a rule set:

🟦 MODE 1: COLOR ALIGNMENT

Goal:

make all active nodes match target color

Tap effect:

swaps colors between nodes OR shifts palette cycle
🔷 MODE 2: SYMBOL ORDER LOGIC

Goal:

arrange symbols in correct order sequence

Tap effect:

rotates symbol positions or cycles state
⚡ MODE 3: CHAIN REACTION MODE

Goal:

trigger correct cascading pattern

Tap effect:

tapping one node affects neighbors in chain logic
🔀 MODE 4: RULE FLIP MODE (MOST ADVANCED)

Rules change every few seconds:

“Red nodes are locked”
“Only diagonal swaps allowed”
“Odd positions only active”

Player must adapt instantly.

🎮 GAMEPLAY LOOP
Rule displayed briefly
Grid appears
Player taps nodes to manipulate state
System checks progress continuously
Round completes when pattern is solved OR time runs out
🧠 FEEDBACK SYSTEM
✅ Correct Action:
glow effect
soft pulse animation
state confirmation
❌ Wrong Action:
shake animation
red flash
partial reset or penalty (UI only)
📊 SCORING SYSTEM (UI ONLY)

After round:

Show:

Completed patterns
Time taken
Mistake count
Efficiency score
🏆 PERFORMANCE TIERS:
S Tier → perfect adaptive play
A Tier → minor mistakes
B Tier → slow completion
C Tier → failed logic chain
💰 PLACEHOLDER REWARD UI:

Display:

“Potential Multiplier”
Range: 1.2x – 2.0x

(NO real calculation)

🧠 ADVANCED GAME MECHANICS
1. 🔁 Dynamic Rule Switching

Rules change:

every round
or mid-round in harder modes
2. ⚡ Chain Reaction Logic
one tap can trigger multi-node changes
creates strategic depth
3. 🧠 Hidden State Memory
some nodes retain hidden state changes
forces player to track memory + logic
4. 🔀 Anti-pattern Randomization
no repeated layouts
no predictable tap outcomes
prevents automation exploitation
5. 🎯 Combo Logic
consecutive correct transformations increase combo UI
wrong action resets chain multiplier
🧱 UI STRUCTURE
🟦 GAME ARENA
Top HUD:
Timer
Round number
Progress indicator
Rule display banner
CENTER:
Interactive node grid (main gameplay area)
BOTTOM:
status feedback panel
rule reminder toggle (optional UI assist)
🎨 DESIGN RULES (STRICT)

Must fully match existing platform:

same typography system
same button style system
same spacing rules
same card design language
same background theme
no new UI identity introduced
🧱 COMPONENT STRUCTURE
FluxTapPage
NodeGridRenderer
NodeStateEngine
RuleEngineSimulator
TapInteractionHandler
ChainReactionEngine
HUDDisplay
ResultPanel
⚠️ STRICT CONSTRAINTS
NO backend calls
NO wallet logic
NO real reward computation
NO external AI logic
NO persistent state beyond session simulation
🚀 FUTURE BACKEND HOOKS (PLACEHOLDERS ONLY)

Prepare for:

session_id
rule_seed
node_state_log
tap_sequence log
timing metrics
accuracy score
🧠 FINAL OUTPUT EXPECTATION

A fully playable frontend game that:

feels unique and unpredictable
requires adaptive thinking
scales difficulty dynamically
integrates seamlessly into Solo Earn system
is backend-ready for future reward validation
🔥 FINAL NOTE (IMPORTANT)

With this game, your system now has:

Reflex skill game 🎯
Memory skill game 🧠
Decision maze game 🧩
Timing reaction game ⚡
Adaptive logic game 🔄

You’ve basically built a full skill economy arcade system.