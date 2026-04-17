# Rubik's Cube 3D

A fully-featured 3D Rubik's Cube puzzle game built with Three.js.

**Inspired by:** The original Rubik's Cube implementation by [bsehovac on CodePen](https://codepen.io/bsehovac/pen/EMyWVv)

> This project was built from scratch as a unique implementation. While inspired by the design and concept of bsehovac's CodePen, all code, UI, and game logic here is original.

## Features

- **3D Rendering** — Real-time 3D Rubik's cube with Three.js, including dynamic lighting, fog, and environment reflections
- **Drag to Rotate** — Click and drag on cube faces to rotate layers (uses raycasting + screen-space projection for accurate mapping)
- **Orbit View** — Right-click drag to orbit around the cube, scroll to zoom
- **Keyboard Controls** — R, L, U, D, F, B for face rotations (hold Shift for counter-clockwise)
- **2x2, 3x3, 4x4** — Switch between cube sizes
- **Color Themes** — Classic, Neon, and Pastel color schemes
- **Scramble & Auto-Solve** — Scramble the cube and watch it auto-solve
- **Timer & Move Counter** — Track your solve time and moves, with best time tracking
- **Win Detection** — Particle celebration effect when the cube is solved
- **Animation Speed** — Adjustable rotation animation speed
- **Move History** — Full notation history with standard Rubik's cube notation
- **Responsive** — Works on desktop with hideable panels

## How to Play

1. Click **Scramble** to shuffle the cube
2. **Left-click + drag** on cube faces to rotate layers
3. Use **keyboard shortcuts** (R, L, U, D, F, B) for precise moves
4. Hold **Shift** with keyboard keys for counter-clockwise rotations
5. **Right-click drag** to orbit the camera, **scroll** to zoom
6. Try to solve it as fast as possible with the fewest moves!

## Controls

| Action | Input |
|--------|-------|
| Right face CW | `R` |
| Left face CW | `L` |
| Up face CW | `U` |
| Down face CW | `D` |
| Front face CW | `F` |
| Back face CW | `B` |
| Counter-clockwise | `Shift` + key |
| Scramble | `S` |
| Toggle keyboard guide | `H` |

## Notation

Standard Rubik's cube notation:
- **R** = Right face clockwise (looking at the right face)
- **L** = Left face clockwise
- **U** = Up (top) face clockwise
- **D** = Down (bottom) face clockwise
- **F** = Front face clockwise
- **B** = Back face clockwise
- **'** (prime) = Counter-clockwise

## File Structure

```
rubiks-cube/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── Cube.js      # Core Rubik's cube logic & Three.js scene objects
    ├── ui.js        # Particle system for win celebration
    └── main.js      # Game loop, controls, raycasting, UI bindings
```

## Technical Details

- **Three.js r160** via CDN
- **OrbitControls** for camera manipulation
- Raycasting-based face interaction with screen-space drag projection
- Promise-based animation system for rotation sequences
- ACES Filmic tone mapping for cinematic lighting

## Credits

- **Inspiration:** [bsehovac's Rubik's Cube on CodePen](https://codepen.io/bsehovac/pen/EMyWVv)
- **Engine:** Three.js - https://threejs.org
- **Fonts:** Inter & JetBrains Mono via Google Fonts
