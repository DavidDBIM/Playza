# PLAYZA — 3D HEXA STACK GAME
# FULL GAME DEVELOPMENT SPECIFICATION & IMPLEMENTATION PROMPT

You are a senior game developer, gameplay systems architect, UI/UX designer, and 3D casual game engineer.

Your task is to build a COMPLETE production-quality modern 3D casual puzzle game called:

# “Hexa Stack”

This game is for the Playza platform.

The game must feel:
- premium
- satisfying
- addictive
- polished
- smooth
- modern
- highly replayable

The gameplay should combine:
- hexa puzzle mechanics
- stack merging
- combo chaining
- strategic placement
- satisfying destruction
- arcade progression

The game should NOT feel like a cheap hyper-casual clone.

The goal is to create:
# A visually stunning 3D hexa stack puzzle game with deep satisfaction and long-term retention.

---

# TECH STACK (MANDATORY)

Use:

- React
- TypeScript
- Vite
- React Three Fiber
- Three.js
- Zustand
- Framer Motion
- TailwindCSS

Architecture must be scalable and production ready.

---

# PROJECT STRUCTURE

Use this exact scalable architecture:

```txt
gamelib/
  hexa-stack/
    core/
      game-engine/
      game-loop/
      renderer/
      physics/
      audio/
      scoring/
      progression/

    systems/
      input/
      spawning/
      merging/
      combo/
      destruction/
      effects/
      powerups/
      difficulty/

    components/
      board/
      stack/
      cells/
      particles/
      ui/
      modals/
      hud/

    hooks/
    store/
    assets/
      models/
      textures/
      audio/
      shaders/

    effects/
      particles/
      postprocessing/
      animations/

    levels/
    utils/
    constants/
    types/

The architecture MUST strictly separate:

rendering
gameplay logic
animation
scoring
effects
state management

DO NOT create a messy monolithic structure.

CORE GAME CONCEPT

The player is presented with:

a hexagonal board
stacks of colored hex tiles
a queue of upcoming stacks

The player drags and places stacks onto empty hex cells.

Each stack:

has a color
has a height/level
visually grows vertically in 3D

Matching adjacent stacks of the same color merges them.

Merged stacks increase height.

When a stack reaches maximum overload height:

it becomes unstable
glows with energy
triggers an explosive combo clear

This is the core addiction loop.

PRIMARY GAMEPLAY LOOP
LOOP FLOW
Generate random stack options
Player drags stack to board
Stack placement animation
Neighbor detection
Matching merge logic
Height increase
Combo calculation
Explosion if overloaded
Particle effects
Score update
Difficulty scaling
Spawn next stacks

Loop continuously until loss condition.

GAME RULES
BOARD
Use a honeycomb hexagonal board
Responsive layout
Floating premium board appearance
Empty cells should glow subtly on hover

Board should feel:

tactile
futuristic
premium
dynamic
STACK SYSTEM

Each stack contains:

color
stack height
energy level
merge state

Stacks visually grow vertically.

The higher the stack:

the taller it becomes
the stronger the glow
the more unstable it appears
MERGING RULES

When same-colored neighboring stacks connect:

Example:

Red level 2
Red level 3

Result:

Red level 5

Merged stack:

animates upward
emits particles
shakes slightly
plays satisfying merge sound
OVERLOAD SYSTEM (CORE FEATURE)

When a stack reaches maximum height:

it enters OVERLOAD mode

Visual effects:

glowing cracks
pulsing light
vibration
energy particles
heat distortion

If overloaded:

the stack explodes
surrounding cells clear
combo multiplier activates
nearby stacks may chain react

This system is a MAJOR gameplay identity.

COMBO SYSTEM

Combos should feel spectacular.

Features:

combo counter
screen shake
score multiplier
slow motion for large clears
particle bursts
chain reaction explosions

The bigger the combo:

the stronger the effects
the stronger the audio
the larger the score reward
GAME LOSS CONDITION

Player loses when:

no valid placement exists
OR
board exceeds danger threshold

On near-loss:

board pulses red
danger music intensifies
camera subtly shakes

Loss should create tension.

GAME MODES

Implement architecture supporting multiple modes.

MODE 1 — ENDLESS

Primary launch mode.

Features:

infinite progression
increasing difficulty
score chasing
MODE 2 — LEVEL MODE

Structure system only for now.

Support:

objectives
limited moves
blockers
target scores
MODE 3 — HARDCORE

Future-ready structure.

Features:

faster progression
harsher penalties
competitive scoring
DIFFICULTY SYSTEM

Difficulty increases dynamically over time.

Increase:

stack spawn complexity
color variety
overload frequency
board pressure

DO NOT make difficulty unfair.

Game should create:

tension
recovery moments
near-failure excitement
POWERUPS

Implement extensible powerup system.

Initial powerups:

HAMMER

Destroy one stack.

SWAP

Swap two stacks.

SHUFFLE

Shuffle board stacks.

COLOR SHIFT

Convert stack color.

UNDO

Undo last move.

Each powerup must have:

cooldown
animation
sound effects
satisfying feedback
VISUAL STYLE

IMPORTANT:
DO NOT use realistic graphics.

Use:

Stylized Casual 3D

Style inspiration:

polished mobile arcade games
glossy toy materials
vibrant colors
smooth lighting
clean geometry

Visual goals:

premium
readable
satisfying
performant
3D RENDERING STYLE

Use:

real-time lighting
soft ambient occlusion
subtle bloom
smooth shadows
floating board depth
reflective materials

The game should feel:

modern
alive
tactile
HEX STACK DESIGN

Hex stacks must:

have rounded edges
layered geometry
glossy materials
soft reflections

Visual stacking should feel satisfying.

The player must WANT to create huge stacks.

ANIMATION QUALITY

Animations are CRITICAL.

Add:

easing
bounce effects
squash/stretch
stack compression
smooth merge transitions
floating idle animations

The game must NEVER feel static.

PARTICLE EFFECTS

Implement:

merge particles
energy sparks
overload explosions
shockwaves
glow bursts
combo trails

Effects must scale with combo size.

CAMERA SYSTEM

Camera should:

slightly tilt
feel cinematic
smoothly animate
subtly react to gameplay

Add:

combo zoom
impact shake
danger pulse
AUDIO SYSTEM

Implement layered audio system.

Need:

placement click
merge pop
overload boom
combo rise
warning sounds
UI feedback

Audio must feel satisfying and responsive.

UI/UX DESIGN

Create a clean modern casual-game UI.

Include:

score
combo meter
next stacks
coins
gems
pause button
settings
powerups

UI should:

animate smoothly
feel polished
never clutter gameplay
META PROGRESSION

Create expandable progression system.

Support:

unlockable themes
stack skins
board skins
effects
trails
achievements
daily rewards
missions

Architecture should support future monetization.

PERFORMANCE REQUIREMENTS

Game MUST:

run smoothly on mobile
support desktop
maintain high FPS
optimize particle count
optimize draw calls
avoid unnecessary rerenders

Use:

memoization
instancing
optimized geometry reuse
RESPONSIVE DESIGN

Must support:

desktop
tablet
mobile portrait
mobile landscape

Mobile-first gameplay experience.

INPUT SYSTEM

Support:

mouse
touch
drag/drop
responsive gestures

Drag interactions must feel:

smooth
magnetic
satisfying
GAME FEEL (VERY IMPORTANT)

The game’s success depends on:

SATISFACTION

Every interaction should feel:

juicy
responsive
impactful

Focus heavily on:

feedback
animation
sound
combo spectacle
CODE QUALITY

Requirements:

clean architecture
reusable systems
scalable design
proper TypeScript typing
maintainable code
modular components

Avoid:

duplicated logic
giant components
tangled state management
DELIVERABLES

Build:

CORE SYSTEMS
board generation
stack logic
merge system
overload system
combo system
scoring system
3D VISUALS
full R3F scene
lighting
effects
particles
animations
UI
HUD
menus
overlays
transitions
GAMEPLAY
endless mode
progression scaling
powerups
POLISH
smooth animations
effects
audio hooks
responsive interactions
FINAL GOAL

Create a game that feels:

highly addictive
visually premium
satisfying to play
modern
scalable for Playza

The game should feel polished enough that it could release on:

Android
iOS
Web

Do NOT build a prototype.

Build a production-quality foundation with scalable architecture and excellent gameplay feel.