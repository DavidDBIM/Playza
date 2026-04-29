# Cyber-Surge Environment Asset Guide

This game already has runner, road, car, and roadblock GLB assets. To make the environment feel richer, add GLB files for the world around the road: buildings, skyline pieces, signs, traffic dressing, and background atmosphere.

## Recommended Folder Structure

Place new assets under:

```text
src/assets/environment/
  buildings/
  skyline/
  props/
  lighting/
  background/
```

Suggested files:

```text
src/assets/environment/buildings/cyber_building_pack.glb
src/assets/environment/buildings/neon_shopfront_pack.glb
src/assets/environment/skyline/distant_skyline_pack.glb
src/assets/environment/props/billboards_pack.glb
src/assets/environment/props/street_props_pack.glb
src/assets/environment/lighting/neon_light_strips_pack.glb
src/assets/environment/background/sky_dome.glb
```

## 3D Structures Needed

### Buildings

Use modular building assets so the game can recycle them like road segments.

Needed building types:

- Tall cyber towers, 8-25 units high
- Short shopfronts, 3-7 units high
- Rooftop antennas and satellite dishes
- Industrial blocks for railway/bridge zones
- Frosted or glass buildings for late-game night/fog zones

Recommended GLB design:

- Origin at ground center
- Width: 3-8 units
- Depth: 3-8 units
- Height: variable
- Low-poly or optimized mid-poly
- Emissive windows and neon strips
- Separate child meshes named clearly, such as `windows`, `sign`, `body`, `roof_trim`

### Skyline Background

Use distant skyline strips behind the road, not heavy individual buildings.

Needed skyline files:

- `distant_skyline_core.glb`
- `distant_skyline_bridge.glb`
- `distant_skyline_night.glb`

Recommended design:

- Long horizontal city silhouette
- Very low geometry
- Emissive window materials
- No collision
- Can be placed at x +/- 18 to 40 and z ahead/behind the player

### Roadside Props

Props make the road feel alive without changing gameplay.

Useful props:

- Neon billboards
- Hologram signs
- Street lamps
- Data towers
- Traffic cones
- Road edge barriers
- Flying drone props
- Cable arches over the road

Recommended GLB design:

- Keep each prop under 5k triangles where possible
- Use emissive materials for readable night visuals
- Keep origins at the base of the object
- Avoid giant textures; prefer baked colors and small texture atlases

### Background And Sky

The current game uses Three.js fog and scene background colors. You can improve it with:

- A simple sky dome GLB or large inverted sphere
- A cyber city panorama texture
- Low-poly floating skyline layers
- Fog-colored horizon meshes

Best approach:

- Use procedural fog/background color for phase transitions
- Use GLB skyline strips for real structure
- Avoid huge full 3D cities in the far background

## Biome-Specific Assets

### Phase 1: Core Grid

Visual target: readable neon city road.

Use:

- Blue/cyan signs
- Clean road towers
- Medium building density
- Bright window panels

### Phase 2: Dense Traffic

Visual target: faster, tighter, busier city.

Use:

- More billboards
- Traffic gantries
- Industrial buildings
- Railway/bridge support beams
- Orange/pink accents

### Phase 3: Night/Fog Grid

Visual target: harder, darker, more dramatic.

Use:

- Distant skyline silhouettes
- Strong fog
- White/purple/cyan emissive accents
- Taller buildings
- Hologram panels

## GLB Export Requirements

Use glTF 2.0 metallic-roughness materials.

Avoid:

- `KHR_materials_pbrSpecularGlossiness`
- Extremely large textures
- Unapplied transforms
- Objects far from origin
- Hidden high-poly meshes

Preferred:

- `.glb` binary format
- Applied transforms
- Mesh names that describe purpose
- Emissive materials for neon
- Draco compression only if DRACOLoader is enabled

## Suggested Loader Additions

When assets are ready, add an environment path map in `AssetLibrary.js`, similar to roads and obstacles:

```js
const ENVIRONMENT_PATHS = {
    buildings: ['./src/assets/environment/buildings/cyber_building_pack.glb'],
    skyline: ['./src/assets/environment/skyline/distant_skyline_pack.glb'],
    props: ['./src/assets/environment/props/billboards_pack.glb']
};
```

Then extend `EnvironmentManager.js` with object pools for buildings, skyline strips, and props so they recycle with road segments.

