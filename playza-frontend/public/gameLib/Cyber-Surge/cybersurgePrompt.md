You are a senior game engineer and real-time 3D systems architect.

Your task is to implement a complete endless runner system using provided GLB assets.

## ASSETS PROVIDED

- Runner character (GLB) with animations:
  - idle
  - running
  - jumping
  - sliding
  - standing

- Road segments (GLB):
  - straight road
  - curve left
  - curve right
  - bridge
  - damaged road

- Obstacles (GLB):
  - barricade / road block (jump or avoid)
  - car wreck (wide obstacle)
  - low barrier (slide under)
  - traffic cones (light obstacle)

## OBJECTIVE

Build a fully functional endless runner system with:

- procedural road generation
- obstacle spawning
- player movement (run, jump, slide)
- collision detection
- scoring system
- basic camera follow system

---

## CORE SYSTEM REQUIREMENTS

### 1. PLAYER CONTROLLER

- Player continuously moves forward
- Default state: running animation
- Implement controls:
  - Jump → triggers jump animation
  - Slide → triggers sliding animation
- Prevent overlapping actions (no jump + slide at same time)

---

### 2. PROCEDURAL ROAD SPAWNING

- Spawn road segments ahead of the player
- Maintain a queue of active segments
- Remove segments behind player (object pooling preferred)

- Each new segment must:
  - attach seamlessly to previous segment
  - align position + rotation correctly

- Use weighted randomness:
  - straight roads most common
  - curves occasionally
  - bridge and damaged roads less frequent

---

### 3. OBSTACLE SYSTEM

- Spawn obstacles on road segments
- Each obstacle has a type:
  - HIGH obstacle → requires jump
  - LOW obstacle → requires slide
  - WIDE obstacle → requires lane change or jump

- Place obstacles:
  - aligned to lanes or center of road
  - not at segment edges (avoid spawn glitches)

---

### 4. COLLISION SYSTEM

- Detect collision between player and obstacle

- Behavior:
  - If correct action (jump/slide) → no collision
  - If incorrect → trigger game over

---

### 5. SCORING SYSTEM

- Score increases based on:
  - distance traveled
  - survival time

- Optional:
  - bonus for obstacle avoidance streak

---

### 6. CAMERA SYSTEM

- Third-person follow camera
- Smooth follow with slight lag
- Maintain consistent angle behind player

---

### 7. PERFORMANCE SYSTEM

- Implement object pooling:
  - reuse road segments
  - reuse obstacles

- Avoid constant creation/destruction

---

## IMPLEMENTATION DETAILS

- Use GLB loader to import assets
- Ensure all models share consistent scale
- Normalize pivot points if necessary
- Maintain consistent forward axis (Z or Y)

---

## GAME LOOP

- Start → runner begins running
- Continuously spawn roads
- Spawn obstacles progressively
- Increase difficulty over time:
  - more obstacles
  - faster speed
  - more complex segments

- On collision → stop game → show game over state

---

## FINAL OUTPUT

A playable endless runner system where:

- player can run, jump, and slide
- roads generate infinitely
- obstacles appear dynamically
- game ends on failure
- system is modular and extendable

Focus on clean architecture and reusable systems.
