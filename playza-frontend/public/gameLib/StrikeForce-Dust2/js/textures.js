// ── Procedural Textures ────────────────────────────────────────────────────────

function makeSandTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#d4a84b"; ctx.fillRect(0,0,256,256);
  for (let i = 0; i < 6000; i++) {
    const b = 160 + Math.random()*50;
    ctx.fillStyle = `rgb(${b+35},${b-5},${b-75})`;
    ctx.fillRect(Math.random()*256, Math.random()*256, 1+ Math.random()*2, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(25,25); return t;
}

function makeWallTexture(c1="#c9a86c", c2="#b8956a") {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = c1; ctx.fillRect(0,0,128,128);
  ctx.strokeStyle = c2; ctx.lineWidth = 2;
  for (let y = 0; y < 128; y += 16) {
    const off = (Math.floor(y/16)%2)*32;
    for (let x = -32+off; x < 128; x += 64) ctx.strokeRect(x,y,64,16);
  }
  for (let i=0;i<2000;i++) { ctx.fillStyle=`rgba(0,0,0,${Math.random()*0.1})`; ctx.fillRect(Math.random()*128,Math.random()*128,1,1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function makeDarkWallTexture() { return makeWallTexture("#8a7a5a","#7a6a4a"); }

function makeConcreteTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle="#888"; ctx.fillRect(0,0,128,128);
  for (let i=0;i<4000;i++) { const s=90+Math.random()*50; ctx.fillStyle=`rgb(${s},${s},${s})`; ctx.fillRect(Math.random()*128,Math.random()*128,1,1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function makeCrateTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#8B4513"; ctx.fillRect(0,0,128,128);
  ctx.strokeStyle = "#5D3A1A"; ctx.lineWidth=4;
  ctx.strokeRect(10,10,108,108);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(128,128);
  ctx.moveTo(128,0); ctx.lineTo(0,128); ctx.stroke();
  ctx.strokeStyle="#6B4423"; ctx.lineWidth=1;
  for(let i=0;i<20;i++){const y=Math.random()*128; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(128,y+(Math.random()-.5)*8); ctx.stroke();}
  return new THREE.CanvasTexture(c);
}

function makeMetalTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0,0,128,128);
  g.addColorStop(0,"#888"); g.addColorStop(0.5,"#bbb"); g.addColorStop(1,"#777");
  ctx.fillStyle = g; ctx.fillRect(0,0,128,128);
  ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth=2;
  for(let i=0;i<128;i+=8){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}
  const t = new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}

function makeRoofTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#aaa"; ctx.fillRect(0,0,128,128);
  for(let i=0;i<2000;i++){const s=140+Math.random()*30;ctx.fillStyle=`rgb(${s},${s},${s})`;ctx.fillRect(Math.random()*128,Math.random()*128,2,2);}
  const t = new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}

function makeGrassTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#3a5e2a"; ctx.fillRect(0,0,128,128);
  for(let i=0;i<5000;i++){const v=40+Math.random()*30;ctx.fillStyle=`rgb(${v-10},${v+20},${v-20})`;ctx.fillRect(Math.random()*128,Math.random()*128,1,1);}
  const t = new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(15,15); return t;
}

// ── Material Cache: create once, reuse ────────────────────────────────────────
let _mats = null;
function getMaterials() {
  if (_mats) return _mats;
  _mats = {
    ground:    new THREE.MeshStandardMaterial({ map: makeSandTexture(), roughness: 0.9 }),
    wall:      new THREE.MeshStandardMaterial({ map: makeWallTexture(), roughness: 0.8 }),
    darkWall:  new THREE.MeshStandardMaterial({ map: makeDarkWallTexture(), roughness: 0.8 }),
    concrete:  new THREE.MeshStandardMaterial({ map: makeConcreteTexture(), roughness: 0.7 }),
    crate:     new THREE.MeshStandardMaterial({ map: makeCrateTexture(), roughness: 0.6 }),
    metal:     new THREE.MeshStandardMaterial({ map: makeMetalTexture(), roughness: 0.3, metalness: 0.6 }),
    roof:      new THREE.MeshStandardMaterial({ map: makeRoofTexture(), roughness: 0.8 }),
    grass:     new THREE.MeshStandardMaterial({ map: makeGrassTexture(), roughness: 0.9 }),
    ctBlue:    new THREE.MeshStandardMaterial({ color: 0x4169e1 }),
    tBrown:    new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
    skin:      new THREE.MeshStandardMaterial({ color: 0xffdbb4 }),
    barrel:    new THREE.MeshStandardMaterial({ color: 0x333333, metalness:0.8 }),
    gun:       new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness:0.7, roughness:0.3 }),
    gunWood:   new THREE.MeshStandardMaterial({ color: 0x5d3a1a }),
    gunGreen:  new THREE.MeshStandardMaterial({ color: 0x2e4d2e }),
    bombA:     new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity:0.3 }),
    bombB:     new THREE.MeshStandardMaterial({ color: 0x4400ff, emissive: 0x2200ff, emissiveIntensity:0.3 }),
  };
  return _mats;
}
