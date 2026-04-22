1. FRONTEND UI PROMPT (SOLO EARN MODE – NO GAME LOGIC)

Copy this directly for your agent:

🧠 SOLO EARN MODE FRONTEND UI IMPLEMENTATION PROMPT

Build the frontend UI only (NO game logic, NO backend integration) for a new feature called:

“Solo Earn Mode”

This is a dedicated game mode where users can enter skill-based solo challenges and stake entry credits.

🎯 Core Objective:

Create a multi-game selection + gameplay UI flow system that feels native to the existing platform design system.

This page MUST match:

existing color palette
typography system
spacing rules
button styles
card styles
background patterns

Do NOT introduce new visual language.

🧩 Pages / UI Flow Structure:
1. 🏠 Solo Earn Landing Page
Title: “Solo Earn Mode”
Subtitle: “Play skill challenges. Earn instantly based on performance.”
Show wallet balance (read-only UI)
Show entry disclaimer (no backend logic)
Game Selection Cards (5 games):
Reflex Shooter
Memory Rush
Reaction Timing
Path Navigation Maze
Flux Tap (Tap Swap)

Each card includes:

game name
short description
difficulty indicator
“Play” button (UI only)
2. 🎮 Pre-Game Setup Screen

When user clicks “Play”:

Show:

selected game preview card
stake input UI (UI only, no validation logic)
“Start Run” button
warning text: “Performance determines reward multiplier”

DO NOT implement wallet logic or validation.

3. 🕹️ Game Arena Screen (UI Shell Only)

Create a reusable game container UI:

Must include:

top HUD (timer, score placeholder, session ID placeholder)
central game canvas area (empty placeholder div)
bottom action area (buttons placeholders depending on game)

Important:

NO gameplay logic
NO physics
NO interaction rules

Just layout structure.

4. 📊 Results Screen (UI ONLY)

After “game ends” (simulate state change only):

Show:

score summary UI
performance tier badge (UI only)
multiplier display (UI only)
“earnings preview” section (no calculation logic)
buttons:
“Play Again”
“Back to Solo Hub”
🎨 Design Rules (STRICT)
Must reuse existing design system components
Do NOT introduce new colors
Maintain same:
button radius
shadow style
card style
font hierarchy
Use consistent spacing scale already used in platform
Ensure dark/light mode compatibility if already exists
🧱 Architecture Requirements:
Build as modular components:
SoloEarnHubPage
GameCard
PreGameSetupModal/Page
GameArenaLayout
ResultsPanel
Keep all game screens reusable for future logic injection
Use placeholder state management only (no backend calls)
⚠️ Important Constraints:
NO backend integration
NO real wallet logic
NO game mechanics implementation
NO randomness or scoring logic

This is purely a UI/UX skeleton for future game engine integration

🧠 2. FRONTEND ARCHITECTURE + DESIGN CONSISTENCY PROMPT

Use this for the agent to “study and align system design first”:

🧠 DESIGN SYSTEM ALIGNMENT + ARCHITECTURE STUDY PROMPT

Before implementing any UI for the Solo Earn Mode, the agent must first perform a full analysis of the existing frontend system.

🎯 Objective:

Ensure the new Solo Earn Mode UI is visually and structurally identical to the existing platform design system.

🔍 REQUIRED ANALYSIS TASKS:
1. UI DESIGN SYSTEM DISCOVERY

Inspect existing project pages and extract:

color palette system
typography scale (headings, body, captions)
button styles (primary, secondary, disabled)
card design patterns
spacing system (padding/margin rules)
background styling patterns
animation patterns (if any)
2. COMPONENT ARCHITECTURE STUDY

Identify reusable components:

layout wrappers
navigation system
modal system
card components
form/input components
HUD or dashboard components
3. PAGE STRUCTURE ANALYSIS

Study existing pages:

Dashboard
Game pages (leaderboard, head-to-head, tournaments)
Wallet / profile pages

Extract:

layout consistency rules
section hierarchy patterns
UI spacing rhythm
interaction behavior patterns
4. DESIGN CONSISTENCY RULE

The Solo Earn Mode must:

look like it was built at the same time as existing system
reuse ALL existing UI tokens
not introduce any new visual identity
follow same interaction patterns (hover, click, transitions)
🧱 ARCHITECTURE OUTPUT EXPECTATION:

Agent must define:

component reuse plan
where new components are needed vs reused
folder structure for Solo Earn Mode
state management placeholder strategy
⚠️ STRICT RULE:

If any UI element deviates from existing design system, it must be refactored.

No visual innovation is allowed here — only consistency.