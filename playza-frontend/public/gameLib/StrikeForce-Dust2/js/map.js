// ── Shared scene references (set by game.js) ──────────────────────────────────
let scene, camera, renderer;
let weaponGroup;
let collisionBoxes = [];

// ─── Map Creation: Expanded Dust 2 (400×400) ─────────────────────────────────
function buildWall(w, h, d, x, y, z, mat) {
  const m = getMaterials();
  mat = mat || m.wall;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  mesh.position.set(x,y,z);
  mesh.castShadow = mesh.receiveShadow = true;
  scene.add(mesh);
  collisionBoxes.push({
    min: new THREE.Vector3(x-w/2, y-h/2, z-d/2),
    max: new THREE.Vector3(x+w/2, y+h/2, z+d/2),
  });
  return mesh;
}

function buildBox(w,h,d,x,y,z,mat) { return buildWall(w,h,d,x,y+(h/2),z,mat); }

function buildCrate(x,z,size) {
  size = size||2;
  const m = getMaterials();
  buildBox(size*2, size*2, size*2, x, 0, z, m.crate);
}

// ─── Expanded Dust 2 Map ──────────────────────────────────────────────────────
function buildMap() {
  const m = getMaterials();

  // ── Ground ──────────────────────────────────────────────────────────────────
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE + 40, MAP_SIZE + 40), m.ground);
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);

  // Grass border outside map
  const grassGeom = new THREE.PlaneGeometry(MAP_SIZE + 200, MAP_SIZE + 200);
  const grass = new THREE.Mesh(grassGeom, m.grass);
  grass.rotation.x = -Math.PI/2; grass.position.y = -0.05; scene.add(grass);

  // ── Outer Boundary Walls ────────────────────────────────────────────────────
  const BW = 4, BH = 30;
  buildWall(MAP_SIZE+8, BH, BW, 0, BH/2, -(MAP_SIZE/2), m.darkWall); // North
  buildWall(MAP_SIZE+8, BH, BW, 0, BH/2,  (MAP_SIZE/2), m.darkWall); // South
  buildWall(BW, BH, MAP_SIZE+8, -(MAP_SIZE/2), BH/2, 0, m.darkWall); // West
  buildWall(BW, BH, MAP_SIZE+8,  (MAP_SIZE/2), BH/2, 0, m.darkWall); // East

  // ── T Spawn Area (z = -160 to -105) ─────────────────────────────────────────
  buildWall(70, 16, 2, 0, 8, -160, m.wall);         // North wall
  buildWall(2, 16, 55, -35, 8, -132, m.wall);        // West wall
  buildWall(2, 16, 55,  35, 8, -132, m.wall);        // East wall
  buildWall(28, 16, 2, -21, 8, -105, m.wall);        // SW opening wall
  buildWall(28, 16, 2,  21, 8, -105, m.wall);        // SE opening wall
  // T spawn buildings (visual)
  buildBox(18, 20, 18, -75, 0, -145, m.darkWall);
  buildBox(18, 20, 18,  75, 0, -145, m.darkWall);
  buildBox(12, 12, 14,  0,  0, -148, m.darkWall);

  // ── Long A Corridor (x=50–80, z=-105 to 30) ──────────────────────────────────
  buildWall(2, 14, 135, 50, 7, -37, m.wall);          // Left wall of Long A
  buildWall(2, 14, 135, 80, 7, -37, m.wall);          // Right/outer wall
  buildWall(22, 14, 2, 65, 7, -104, m.wall);          // North Long A entry
  // Long A cars (cover)
  buildBox(10, 5, 5,  62, 0, -70, m.metal);
  buildBox(10, 5, 5,  62, 0, -50, m.metal);

  // Long A Doors (wide opening to site)
  buildWall(2, 14, 40, 50, 7, 10, m.darkWall);
  buildWall(10, 14, 2, 55, 7, 30, m.wall);
  buildWall(10, 14, 2, 75, 7, 30, m.wall);

  // ── A Site (x=30 to 105, z=30 to 110) ────────────────────────────────────────
  buildWall(75, 14, 2, 67, 7, 110, m.darkWall);      // Back wall
  buildWall(2, 14, 80, 30, 7, 70, m.wall);           // Left wall (ramp side)
  buildWall(2, 14, 46, 105, 7, 87, m.darkWall);      // Right wall

  // A Ramp platform (raised area)
  buildBox(16, 5, 14, 100, 0, 60, m.concrete);
  buildBox(8, 9, 14, 100, 0, 46, m.concrete);        // ramp step

  // CT platform
  buildBox(18, 3, 12, 72, 0, 95, m.concrete);

  // A Site cover crates
  buildCrate(50, 55, 2.5);
  buildCrate(44, 65, 2);
  buildCrate(57, 65, 2);
  buildCrate(40, 50, 1.5);
  buildCrate(68, 50, 2);
  buildCrate(48, 42, 1.5);

  // A Site bomb marker platform
  buildBox(20, 0.3, 20, 65, 0, 75, m.bombA);

  // ── Short A / Palace Area (x=-10 to 30, z=30 to 110) ────────────────────────
  buildWall(40, 14, 2, 10, 7, 30, m.wall);           // Connector to Short
  buildWall(2, 14, 30, 30, 7, 44, m.wall);           // Short right
  buildWall(2, 14, 30,-10, 7, 44, m.wall);           // Short left
  buildWall(40, 14, 2, 10, 7, 58, m.darkWall);       // Short top

  // Short A barrel cluster
  buildCrate(18, 50, 2.2);
  buildCrate(4, 50, 2);
  buildCrate(4, 42, 1.5);

  // ── Mid (x=-20 to 20, z=-60 to 30) ──────────────────────────────────────────
  buildWall(2, 12, 60, -20, 6, -15, m.darkWall);
  buildWall(2, 12, 60,  20, 6, -15, m.darkWall);
  buildWall(40, 12, 2, 0, 6, -75, m.wall);          // Mid open top (T side)
  // Mid doors (double door)
  buildWall(14, 12, 2, -7, 6, -30, m.wall);
  buildWall(14, 12, 2,  7, 6, -30, m.wall);
  // Mid boxes
  buildCrate(8, -8, 2.5);
  buildCrate(-5, -22, 2);
  buildCrate(0, 10, 2.5);

  // Window room
  buildWall(2, 9, 18, 20, 4.5, -50, m.concrete);   // window ledge
  buildBox(18, 6, 2, 28, 0, -44, m.concrete);       // cat walk outer wall

  // Catwalk to A
  buildBox(26, 1, 14, 28, 6, -14, m.concrete);      // catwalk platform
  buildWall(2, 8, 26, 42, 4, -14, m.concrete);      // catwalk outer wall

  // ── B Tunnels (x=-115 to -60, z=-100 to 25) ─────────────────────────────────
  // Upper tunnel
  buildWall(2, 10, 80, -60, 5, -35, m.wall);
  buildWall(2, 10, 80, -85, 5, -35, m.wall);
  buildWall(25, 10, 2, -72, 5, -95, m.wall);        // tunnel roof end
  buildWall(25, 10, 2, -72, 5, 25, m.wall);         // tunnel open end

  // Lower tunnel
  buildWall(2, 10, 40, -95, 5, -35, m.wall);
  buildWall(2, 10, 40,-115, 5, -35, m.wall);
  buildWall(20, 10, 2, -105, 5, -55, m.wall);       // lower end
  buildWall(20, 10, 2, -105, 5, -15, m.wall);       // lower join

  // Tunnel roof
  buildBox(25, 2, 80, -72, 10, -35, m.roof);
  buildBox(20, 2, 40,-105, 10, -35, m.roof);

  // ── B Site (x=-115 to -35, z=25 to 115) ──────────────────────────────────────
  buildWall(80, 14, 2, -75, 7, 115, m.darkWall);    // Back wall
  buildWall(2, 14, 90, -35, 7, 70, m.wall);         // Right wall
  buildWall(2, 14, 90,-115, 7, 70, m.wall);         // Left wall

  // B van (big cover)
  buildBox(18, 7, 8, -75, 0, 40, m.metal);
  // Tires near van
  buildBox(3, 3, 3, -65, 0, 38, m.metal);
  buildBox(3, 3, 3, -85, 0, 38, m.metal);

  buildCrate(-55, 55, 2.5);
  buildCrate(-48, 65, 2);
  buildCrate(-62, 62, 2.5);
  buildCrate(-75, 50, 2);
  buildCrate(-80, 65, 2.2);
  buildCrate(-55,100, 2);

  // B platform
  buildBox(20, 3, 14, -50, 0, 100, m.concrete);

  // B bomb site marker
  buildBox(20, 0.3, 20, -80, 0, 75, m.bombB);

  // ── CT Spawn (x=-50 to 50, z=115 to 170) ─────────────────────────────────────
  buildWall(100, 16, 2, 0, 8, 170, m.wall);          // North wall
  buildWall(2, 16, 55,-50, 8, 142, m.wall);          // West wall
  buildWall(2, 16, 55, 50, 8, 142, m.wall);          // East wall
  buildWall(30, 16, 2, -20, 8, 115, m.wall);         // SW partial
  buildWall(30, 16, 2,  20, 8, 115, m.wall);         // SE partial
  // CT buildings
  buildBox(20, 20, 20, -75, 0, 150, m.darkWall);
  buildBox(20, 20, 20,  75, 0, 150, m.darkWall);
  buildBox(14, 12, 14, 0, 0, 155, m.concrete);

  // ── Connectors (Mid to CT, Mid to B) ─────────────────────────────────────────
  // Mid → CT connector
  buildWall(2, 10, 40, 20, 5, 72, m.concrete);
  buildWall(2, 10, 40, -20, 5, 72, m.concrete);
  buildWall(40, 10, 2, 0, 5, 92, m.concrete);
  buildWall(40, 10, 2, 0, 5, 52, m.concrete);

  // Mid → B connector
  buildWall(30, 10, 2, -35, 5, 5, m.concrete);
  buildWall(2, 10, 30, -35, 5, -10, m.concrete);
  buildWall(30, 10, 2, -35, 5, -25, m.concrete);

  // ── Decorative / Environmental ────────────────────────────────────────────────
  // Barrels scattered around
  for(const [bx,bz] of [[30,-80],[60,-90],[-40,-80],[-10,-90],[90,20],[-90,10],[-20,90],[20,90]]) {
    buildBox(3, 5, 3, bx, 0, bz, m.concrete);
  }

  // Some sandbags (small rectangles)
  for(const [bx,bz,bw,bd] of [[44,80,5,2],[54,80,5,2],[35,105,2,5],[95,95,2,5],[-45,95,2,5],[-100,95,2,5]]) {
    buildBox(bw, 1.5, bd, bx, 0, bz, m.concrete);
  }

  // Overhead light poles
  buildLightPole(0, 0);
  buildLightPole(65, 70);
  buildLightPole(-75, 70);
  buildLightPole(60, -60);
  buildLightPole(-72, -35);
}

function buildLightPole(x, z) {
  const m = getMaterials();
  buildBox(1, 14, 1, x, 0, z, m.metal);
  buildBox(4, 0.5, 1, x+1.5, 14, z, m.metal);
  // Small point light at top
  const pl = new THREE.PointLight(0xfff4cc, 0.8, 40);
  pl.position.set(x+2, 14.5, z); scene.add(pl);
}
