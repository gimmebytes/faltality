import * as THREE from 'three';
import { sound } from '../sound';
import { createToonMaterial, GOOSE_PALETTE } from '../materials';
import { modelLoader } from '../assetLoader';

interface OrigamiSheep {
  group: THREE.Group;
  headGroup?: THREE.Group;
  legs?: THREE.Mesh[];
  state: 'grazing' | 'fainting' | 'down' | 'recovering';
  timer: number;
  baseY: number;
  baseRotY: number;
  chewPhase: number;
}

// High-Resolution Procedural Canvas Texture for O'Reilly Parody Book 1 (Level 1: Garden)
function createOReillyBookTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d')!;

  // Background - Classic O'Reilly eggshell white
  ctx.fillStyle = '#fcfcfa';
  ctx.fillRect(0, 0, 1024, 1400);

  // Top header banner (classic deep maroon / crimson bar)
  ctx.fillStyle = '#800020';
  ctx.fillRect(0, 0, 1024, 170);

  // White O'REILLY text in header bar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText("O'REILLY®", 968, 108);

  // Sub-banner category line
  ctx.fillStyle = '#111111';
  ctx.font = '700 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE DEFINITIVE GUIDE', 64, 236);

  // Main Title (bold serif)
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillStyle = '#1c1c1e';
  ctx.fillText('Deploying Origami', 64, 324);
  ctx.fillText('to Production', 64, 408);

  // Subtitle
  ctx.font = 'italic 32px Georgia, serif';
  ctx.fillStyle = '#555555';
  ctx.fillText('Bending Spacetime, Quantum Creases', 64, 476);
  ctx.fillText('& Non-Euclidean Cellulose', 64, 520);

  // Center woodcut-style illustration frame
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 6;
  ctx.strokeRect(120, 580, 784, 600);

  // Background inside animal frame
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(126, 586, 772, 588);

  // Draw stylized origami crane line-art
  ctx.save();
  ctx.translate(512, 880);
  ctx.strokeStyle = '#1a1a1a';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Body triangle
  ctx.beginPath();
  ctx.moveTo(0, 70);
  ctx.lineTo(-150, -60);
  ctx.lineTo(0, -140);
  ctx.lineTo(150, -60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left wing fold
  ctx.beginPath();
  ctx.moveTo(0, -140);
  ctx.lineTo(-250, -230);
  ctx.lineTo(-100, -40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right wing fold
  ctx.beginPath();
  ctx.moveTo(0, -140);
  ctx.lineTo(250, -230);
  ctx.lineTo(100, -40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head & Neck
  ctx.beginPath();
  ctx.moveTo(0, 70);
  ctx.lineTo(-76, 190);
  ctx.lineTo(-104, 176);
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(0, 70);
  ctx.lineTo(76, 190);
  ctx.stroke();

  // Fine woodcut hatch marks
  ctx.lineWidth = 3;
  for (let i = -110; i <= 110; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, -20);
    ctx.lineTo(i + 16, 30);
    ctx.stroke();
  }
  ctx.restore();

  // Animal caption under frame
  ctx.fillStyle = '#444444';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Grus Grus Origamiensis (Production Crane)', 512, 1232);

  // Bottom footer: Author & Note
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1c1c1e';
  ctx.fillText('Tim C. & The Faltality Foundation', 64, 1316);

  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#8e8e93';
  ctx.fillText('Zero Runtime Errors Guaranteed • 100% Titanium Compatible', 64, 1360);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

// High-Resolution Procedural Canvas Texture for O'Reilly Book 2 (Level 2: Ostsee-Küste)
function createOReillyCoastBookTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d')!;

  // Background - Eggshell white
  ctx.fillStyle = '#fcfcfa';
  ctx.fillRect(0, 0, 1024, 1400);

  // Top header banner (deep oceanic navy blue)
  ctx.fillStyle = '#0c2461';
  ctx.fillRect(0, 0, 1024, 170);

  // White O'REILLY text in header bar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText("O'REILLY®", 968, 108);

  // Sub-banner category line
  ctx.fillStyle = '#111111';
  ctx.font = '700 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE DEFINITIVE GUIDE', 64, 236);

  // Main Title (bold serif)
  ctx.font = 'bold 68px Georgia, serif';
  ctx.fillStyle = '#1c1c1e';
  ctx.fillText('Surfing Quantum', 64, 324);
  ctx.fillText('Origami in Prod', 64, 408);

  // Subtitle
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillStyle = '#4a69bd';
  ctx.fillText('Hydrodynamics, Fluid Aerodynamics', 64, 476);
  ctx.fillText('& Coastal Seagull Avoidance', 64, 520);

  // Center woodcut-style illustration frame
  ctx.strokeStyle = '#0c2461';
  ctx.lineWidth = 6;
  ctx.strokeRect(120, 580, 784, 600);

  // Background inside animal frame
  ctx.fillStyle = '#f1f2f6';
  ctx.fillRect(126, 586, 772, 588);

  // Draw stylized Seagull and ocean waves woodcut art
  ctx.save();
  ctx.translate(512, 860);
  ctx.strokeStyle = '#1a1a1a';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Woodcut Waves at bottom of frame
  ctx.beginPath();
  for (let x = -360; x <= 360; x += 60) {
    ctx.moveTo(x, 180);
    ctx.bezierCurveTo(x + 20, 150, x + 40, 150, x + 60, 180);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let x = -330; x <= 330; x += 60) {
    ctx.moveTo(x, 210);
    ctx.bezierCurveTo(x + 20, 180, x + 40, 180, x + 60, 210);
  }
  ctx.stroke();

  // Flying Seagull: Body
  ctx.beginPath();
  ctx.ellipse(0, -30, 48, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Left Wing
  ctx.beginPath();
  ctx.moveTo(-20, -35);
  ctx.quadraticCurveTo(-140, -160, -260, -110);
  ctx.quadraticCurveTo(-160, -70, 0, -30);
  ctx.fill();
  ctx.stroke();

  // Right Wing
  ctx.beginPath();
  ctx.moveTo(20, -35);
  ctx.quadraticCurveTo(140, -160, 260, -110);
  ctx.quadraticCurveTo(160, -70, 0, -30);
  ctx.fill();
  ctx.stroke();

  // Beak (yellow tip)
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.moveTo(42, -32);
  ctx.lineTo(82, -28);
  ctx.lineTo(44, -22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(32, -32, 4, 0, Math.PI * 2);
  ctx.fill();

  // Wing feather woodcut lines
  ctx.lineWidth = 2.5;
  for (let i = -220; i <= -60; i += 35) {
    ctx.beginPath();
    ctx.moveTo(i, -100);
    ctx.lineTo(i + 25, -75);
    ctx.stroke();
  }
  for (let i = 60; i <= 220; i += 35) {
    ctx.beginPath();
    ctx.moveTo(i, -75);
    ctx.lineTo(i + 25, -100);
    ctx.stroke();
  }
  ctx.restore();

  // Animal caption under frame
  ctx.fillStyle = '#444444';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Larus Argentatus Origamicus (Coastal Seagull)', 512, 1232);

  // Bottom footer: Author & Note
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1c1c1e';
  ctx.fillText('Dr. K. Strandgut & The Faltality Foundation', 64, 1316);

  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#8e8e93';
  ctx.fillText('100% Saltwater Resistant • Wind Force 9 Certified', 64, 1360);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Canvas Texture for Yellow 3M Post-It Pad
function createPostItTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 3M Canary Yellow
  ctx.fillStyle = '#fff44f';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle top glue band
  ctx.fillStyle = '#f5e838';
  ctx.fillRect(0, 0, 512, 64);

  // Handwritten scribble notes
  ctx.fillStyle = '#1c1c1e';
  ctx.font = 'bold 44px -apple-system, "Comic Sans MS", cursive, sans-serif';
  ctx.fillText('TODO (URGENT):', 40, 60);

  ctx.font = '30px -apple-system, "Comic Sans MS", cursive, sans-serif';
  ctx.fillStyle = '#2c3e50';
  ctx.fillText('1. Fold past 7 (!?)', 40, 150);
  ctx.fillText('2. Ask Tim Cook about', 40, 230);
  ctx.fillText('   Titanium grade 5', 40, 280);
  ctx.fillText('3. Refill coffee mug ☕', 40, 370);
  ctx.fillText('4. Pet neighbor cat 🐱', 40, 450);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export class Environment {
  public scene: THREE.Scene;
  public tablePosition: THREE.Vector3 = new THREE.Vector3(0, 1.2, 0);
  public currentLevel: number = 1;

  // Root Environment Groups for Seamless Biome Switching
  public commonTableGroup: THREE.Group = new THREE.Group();
  public level1GardenGroup: THREE.Group = new THREE.Group();
  public level2CoastGroup: THREE.Group = new THREE.Group();
  private clouds: THREE.Group[] = [];

  // Table Props Level 1 (Garden)
  private mugGroup: THREE.Group | null = null;
  private mugWobbleTimer: number = 0;
  private mugWobbleIntensity: number = 1.0;
  private steamPuffs: THREE.Mesh[] = [];

  // Sneaky Neighbor Cat (Level 1)
  private catGroup: THREE.Group | null = null;
  private catTail: THREE.Mesh | null = null;
  private catDirection: number = 1;
  private catState: 'stalking' | 'startled' = 'stalking';
  private catStartledTimer: number = 0;
  public catHitCount: number = 0;

  // Neighbor BBQ Grill (Level 1)
  private grillGroup: THREE.Group | null = null;
  private grillLid: THREE.Mesh | null = null;
  private grillFlame: THREE.Mesh | null = null;
  private grillSmokePuffs: THREE.Mesh[] = [];
  private grillHitTimer: number = 0;
  public grillHitCount: number = 0;

  // Neighbor House & Car (Level 1)
  private neighborCarGroup: THREE.Group | null = null;
  private carBlinkers: THREE.Mesh[] = [];
  public carAlarmActive: boolean = false;
  private carAlarmTimer: number = 0;
  private damagedFencePosts: THREE.Mesh[] = [];

  // Fainting Sheep flock (Level 1)
  private sheepFlock: OrigamiSheep[] = [];
  private sheepBaaTimer: number = 4.0;

  // Kitchen Aluminium Foil Roll Box on table (unlocked at score threshold)
  private foilBox: THREE.Mesh | null = null;
  private foilLip: THREE.Mesh | null = null;

  // --- LEVEL 2: OSTSEE-KÜSTE PROPS & HAZARDS ---
  private boatGroup: THREE.Group | null = null;
  private boatSmokePuffs: THREE.Mesh[] = [];
  public boatHitCount: number = 0;
  public boatHitTimer: number = 0;
  private lighthouseBeam: THREE.Group | null = null;
  private oceanGeometry: THREE.PlaneGeometry | null = null;
  private oceanBasePositions: Float32Array | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.scene.add(this.commonTableGroup);
    this.scene.add(this.level1GardenGroup);
    this.scene.add(this.level2CoastGroup);

    this.buildTableBase();
    this.buildGarden();
    this.buildNeighborProperty();
    this.buildSheepPasture();
    this.buildSneakyCat();
    this.buildNeighborGrill();
    this.buildCoastBiome();
    this.buildClouds();

    this.setLevel(1);
  }

  // Universal Table Base shared across biomes
  private buildTableBase() {
    const woodMat = createToonMaterial({ color: GOOSE_PALETTE.tableWood });
    const darkWoodMat = createToonMaterial({ color: GOOSE_PALETTE.tableLegs });

    // Tabletop planks
    const plankWidth = 0.45;
    const plankLength = 2.4;
    const plankThickness = 0.08;
    for (let i = -2; i <= 2; i++) {
      const plankGeo = new THREE.BoxGeometry(plankLength, plankThickness, plankWidth - 0.03);
      const plank = new THREE.Mesh(plankGeo, woodMat);
      plank.position.set(0, 1.16, i * plankWidth);
      plank.castShadow = true;
      plank.receiveShadow = true;
      this.commonTableGroup.add(plank);
    }

    // Table legs
    const legGeo = new THREE.BoxGeometry(0.12, 1.2, 0.12);
    const legCoords = [
      [-0.95, 0.6, -0.9],
      [0.95, 0.6, -0.9],
      [-0.95, 0.6, 0.9],
      [0.95, 0.6, 0.9]
    ];
    legCoords.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, darkWoodMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      this.commonTableGroup.add(leg);
    });

    // Cross braces
    const braceGeo = new THREE.BoxGeometry(0.08, 0.08, 1.8);
    const braceL = new THREE.Mesh(braceGeo, darkWoodMat);
    braceL.position.set(-0.95, 0.3, 0);
    const braceR = new THREE.Mesh(braceGeo, darkWoodMat);
    braceR.position.set(0.95, 0.3, 0);
    this.commonTableGroup.add(braceL, braceR);

    // Origami dark green cutting mat on table for contrast with bright white paper
    const matGeo = new THREE.BoxGeometry(1.1, 0.006, 0.85);
    const matMat = createToonMaterial({ color: GOOSE_PALETTE.cuttingMat });
    const cuttingMat = new THREE.Mesh(matGeo, matMat);
    cuttingMat.position.set(0, 1.203, 0);
    cuttingMat.receiveShadow = true;
    this.commonTableGroup.add(cuttingMat);
  }

  private buildGarden() {
    // 1. Soft rolling green grass terrain in warm Goose Game lawn green
    const groundGeo = new THREE.PlaneGeometry(300, 300, 24, 24);
    groundGeo.rotateX(-Math.PI / 2);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);
      const y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.4 + (distFromCenter > 45 ? (distFromCenter - 45) * 0.05 : 0);
      pos.setY(i, y);
    }
    groundGeo.computeVertexNormals();

    const grassMat = createToonMaterial({
      color: GOOSE_PALETTE.grass
    });
    const ground = new THREE.Mesh(groundGeo, grassMat);
    ground.receiveShadow = true;
    this.level1GardenGroup.add(ground);

    // --- LEVEL 1 TABLE PROPS ---
    // 1. Cozy rustic red enamel mug with handle, coffee and rising steam
    const mugGroup = new THREE.Group();
    mugGroup.position.set(0.72, 1.205, -0.55);

    const mugBodyGeo = new THREE.CylinderGeometry(0.1, 0.088, 0.22, 12);
    const mugMat = createToonMaterial({ color: GOOSE_PALETTE.mugEnamel });
    const mugMesh = new THREE.Mesh(mugBodyGeo, mugMat);
    mugMesh.position.y = 0.11;
    mugMesh.castShadow = true;
    mugGroup.add(mugMesh);

    // Mug handle
    const handleGeo = new THREE.TorusGeometry(0.065, 0.016, 6, 12, Math.PI);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.position.set(0.10, 0.11, 0);
    handle.rotation.z = -Math.PI / 2;
    mugGroup.add(handle);

    // Dark coffee inside the mug
    const coffeeGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.02, 12);
    const coffeeMat = createToonMaterial({ color: GOOSE_PALETTE.mugCoffee });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.set(0, 0.20, 0);
    mugGroup.add(coffee);

    // Subtle steam puffs rising from coffee
    this.steamPuffs = [];
    const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.03 + i * 0.012, 6, 5), steamMat);
      puff.position.set((Math.random() - 0.5) * 0.04, 0.24 + i * 0.08, (Math.random() - 0.5) * 0.04);
      mugGroup.add(puff);
      this.steamPuffs.push(puff);
    }
    this.level1GardenGroup.add(mugGroup);
    this.mugGroup = mugGroup;

    // Coffee stain ring on the honey wood table next to the mug
    const stainGeo = new THREE.RingGeometry(0.082, 0.098, 24);
    stainGeo.rotateX(-Math.PI / 2);
    const stainMat = new THREE.MeshBasicMaterial({
      color: 0x5a381e,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide
    });
    const stain = new THREE.Mesh(stainGeo, stainMat);
    stain.position.set(0.72, 1.202, -0.28);
    this.level1GardenGroup.add(stain);

    // 2. Thick O'Reilly Parody Book 1: "Deploying Origami to Production"
    // Positioned closer & tilted pleasantly towards the player camera for crisp readability!
    const bookGroup = new THREE.Group();
    bookGroup.position.set(-0.52, 1.205, 0.16);
    bookGroup.rotation.set(-0.14, 0.12, 0.02);

    const pagesGeo = new THREE.BoxGeometry(0.32, 0.052, 0.44);
    const pagesMat = createToonMaterial({ color: 0xfcf8e3 });
    const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
    pagesMesh.position.set(0.01, 0.026, 0);
    pagesMesh.castShadow = true;
    bookGroup.add(pagesMesh);

    const coverTex = createOReillyBookTexture();
    const coverGeo = new THREE.BoxGeometry(0.34, 0.008, 0.46);
    const coverSideMat = createToonMaterial({ color: 0x800020 });
    const coverTopMat = new THREE.MeshStandardMaterial({
      map: coverTex,
      roughness: 0.5,
      metalness: 0.05
    });
    const coverMaterials = [
      coverSideMat, coverSideMat, coverTopMat, coverSideMat, coverSideMat, coverSideMat
    ];
    const coverMesh = new THREE.Mesh(coverGeo, coverMaterials);
    coverMesh.position.set(0, 0.056, 0);
    coverMesh.castShadow = true;
    bookGroup.add(coverMesh);

    const spineGeo = new THREE.BoxGeometry(0.015, 0.058, 0.46);
    const spineMesh = new THREE.Mesh(spineGeo, coverSideMat);
    spineMesh.position.set(-0.17, 0.029, 0);
    bookGroup.add(spineMesh);
    this.level1GardenGroup.add(bookGroup);

    // 3. 3M Yellow Post-it Note Pad with urgent TODO notes
    const postItGroup = new THREE.Group();
    postItGroup.position.set(-0.36, 1.205, 0.48);
    postItGroup.rotation.y = -0.18;

    const postItTex = createPostItTexture();
    const postItGeo = new THREE.BoxGeometry(0.16, 0.018, 0.16);
    const postItSideMat = createToonMaterial({ color: 0xf5e838 });
    const postItTopMat = new THREE.MeshStandardMaterial({
      map: postItTex,
      roughness: 0.65,
      metalness: 0.0
    });
    const postItMaterials = [
      postItSideMat, postItSideMat, postItTopMat, postItSideMat, postItSideMat, postItSideMat
    ];
    const postItMesh = new THREE.Mesh(postItGeo, postItMaterials);
    postItMesh.position.y = 0.009;
    postItMesh.castShadow = true;
    postItGroup.add(postItMesh);
    this.level1GardenGroup.add(postItGroup);

    // 4. Parody Bitten Apple
    const appleGroup = new THREE.Group();
    appleGroup.position.set(0.56, 1.205, 0.42);

    const appleMat = createToonMaterial({ color: 0x78c238 });
    const appleGeo = new THREE.SphereGeometry(0.065, 10, 8);
    appleGeo.scale(1, 0.92, 1);
    const appleMesh = new THREE.Mesh(appleGeo, appleMat);
    appleMesh.position.y = 0.065;
    appleMesh.castShadow = true;
    appleGroup.add(appleMesh);

    const stemGeo = new THREE.CylinderGeometry(0.004, 0.005, 0.038, 4);
    const stemMat = createToonMaterial({ color: 0x5d4037 });
    const appleStem = new THREE.Mesh(stemGeo, stemMat);
    appleStem.position.set(0, 0.135, 0);
    appleStem.rotation.z = 0.18;
    appleGroup.add(appleStem);

    const biteGeo = new THREE.SphereGeometry(0.032, 6, 6);
    const biteFleshMat = createToonMaterial({ color: 0xfef9e7 });
    const biteMesh = new THREE.Mesh(biteGeo, biteFleshMat);
    biteMesh.position.set(0.045, 0.075, 0.02);
    appleGroup.add(biteMesh);
    this.level1GardenGroup.add(appleGroup);

    // Kitchen Aluminium Foil Roll Box
    const foilBoxGeo = new THREE.BoxGeometry(0.55, 0.08, 0.08);
    const foilBoxMat = createToonMaterial({ color: 0x2c3e50 });
    const foilBox = new THREE.Mesh(foilBoxGeo, foilBoxMat);
    foilBox.position.set(-0.68, 1.245, -0.45);
    foilBox.rotation.y = 0.2;
    foilBox.castShadow = true;
    foilBox.visible = false;
    this.level1GardenGroup.add(foilBox);
    this.foilBox = foilBox;

    const foilLipGeo = new THREE.PlaneGeometry(0.52, 0.06);
    foilLipGeo.rotateX(-Math.PI / 2);
    const foilLipMat = new THREE.MeshStandardMaterial({
      color: 0xecf0f1,
      roughness: 0.25,
      metalness: 0.95,
      flatShading: true
    });
    const foilLip = new THREE.Mesh(foilLipGeo, foilLipMat);
    foilLip.position.set(-0.68, 1.288, -0.41);
    foilLip.rotation.y = 0.2;
    foilLip.visible = false;
    this.level1GardenGroup.add(foilLip);
    this.foilLip = foilLip;

    // 3. Low-Poly Trees in the background
    const treePositions = [
      [-36, 0, -26],
      [28, 0, -28],
      [-28, 0, 15],
      [32, 0, 18],
      [-36, 0, -10],
      [38, 0, -5],
      [-10, 0, 35],
      [12, 0, 32]
    ];
    treePositions.forEach(([tx, ty, tz], idx) => {
      this.createTree(tx, ty, tz, idx);
    });

    // 4. White Picket Fence in distance separating gardens
    this.createFence(-18, -12, 36);

    // 5. Flowers & Daisies scattered around lawn
    this.createDaisies();
  }

  // Neighbor house, garage driveway, red car with blinkers and wobbly fence
    // Neighbor house, garage driveway, stylized sedan with blinkers
  private buildNeighborProperty() {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(-25, 0, -28);

    // High-Quality Stylized Suburban Cottage
    modelLoader.load('/models/building-type-a.glb').then((house) => {
      house.scale.set(14.0, 14.0, 14.0);
      house.position.set(0, 0, 0);
      house.rotation.y = Math.PI * 0.5;
      houseGroup.add(house);
    }).catch(() => {
      const houseGeo = new THREE.BoxGeometry(16, 8, 12);
      const houseMat = createToonMaterial({ color: GOOSE_PALETTE.plasterWall });
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.set(0, 4, 0);
      houseGroup.add(house);
    });

    // Driveway gravel patch
    const driveGeo = new THREE.PlaneGeometry(10, 16);
    driveGeo.rotateX(-Math.PI / 2);
    const driveMat = createToonMaterial({ color: 0xb4c2c9 });
    const driveway = new THREE.Mesh(driveGeo, driveMat);
    driveway.position.set(13, 0.05, 4);
    driveway.receiveShadow = true;
    houseGroup.add(driveway);

    // Neighbor's Prized Stylized Low-Poly Car
    const carGroup = new THREE.Group();
    carGroup.position.set(13, 0.05, 4);
    carGroup.rotateY(-Math.PI * 0.15);

    modelLoader.load('/models/sedan.glb').then((car) => {
      car.scale.set(2.3, 2.3, 2.3);
      car.rotation.y = Math.PI;
      carGroup.add(car);
    });

    // Hazard Blinkers for car alarm
    const blinkerGeo = new THREE.BoxGeometry(0.35, 0.2, 0.15);
    const blinkerPositions = [
      [-1.1, 0.75, 2.2],
      [1.1, 0.75, 2.2],
      [-1.1, 0.75, -2.2],
      [1.1, 0.75, -2.2]
    ];
    this.carBlinkers = [];
    blinkerPositions.forEach(([bx, by, bz]) => {
      const blinkerMat = new THREE.MeshBasicMaterial({ color: 0x332200 });
      const blinker = new THREE.Mesh(blinkerGeo, blinkerMat);
      blinker.position.set(bx, by, bz);
      carGroup.add(blinker);
      this.carBlinkers.push(blinker);
    });

    houseGroup.add(carGroup);
    this.neighborCarGroup = carGroup;
    this.level1GardenGroup.add(houseGroup);
  }

  // Neighboring sheep pasture with fainting origami sheep
  private buildSheepPasture() {
    const pastureGroup = new THREE.Group();
    pastureGroup.position.set(17, 0, -23);

    const fenceMat = createToonMaterial({ color: GOOSE_PALETTE.woodFence });
    for (let i = -7.5; i <= 7.5; i += 3.0) {
      const postGeo = new THREE.BoxGeometry(0.2, 1.3, 0.2);
      const post = new THREE.Mesh(postGeo, fenceMat);
      post.position.set(i, 0.65, -6.5);
      pastureGroup.add(post);

      const postFront = new THREE.Mesh(postGeo, fenceMat);
      postFront.position.set(i, 0.65, 6.5);
      pastureGroup.add(postFront);
    }
    const railGeo = new THREE.BoxGeometry(15.5, 0.12, 0.08);
    const rail1 = new THREE.Mesh(railGeo, fenceMat);
    rail1.position.set(0, 0.9, -6.5);
    const rail2 = new THREE.Mesh(railGeo, fenceMat);
    rail2.position.set(0, 0.5, -6.5);
    pastureGroup.add(rail1, rail2);

    const sheepConfigs = [
      { x: -3.5, z: -1, rotY: 0.4 },
      { x: 0.5, z: 2.2, rotY: -1.2 },
      { x: 4.0, z: -1.5, rotY: 2.1 }
    ];

    this.sheepFlock = sheepConfigs.map((cfg) => {
      const sheepGroup = new THREE.Group();
      sheepGroup.position.set(cfg.x, 0.05, cfg.z);
      sheepGroup.rotateY(cfg.rotY);

      modelLoader.load('/models/sheep.glb').then((model) => {
        model.scale.set(0.42, 0.42, 0.42);
        model.rotation.y = Math.PI;
        model.position.y = -0.4;
        sheepGroup.add(model);
      });

      pastureGroup.add(sheepGroup);

      return {
        group: sheepGroup,
        state: 'grazing',
        timer: 0,
        baseY: 0.05,
        baseRotY: cfg.rotY,
        chewPhase: Math.random() * Math.PI * 2
      };
    });

    this.level1GardenGroup.add(pastureGroup);
  }

  // Reveal or hide aluminium foil dispenser box on table based on unlock state
  public setFoilUnlocked(unlocked: boolean) {
    if (this.foilBox) this.foilBox.visible = unlocked;
    if (this.foilLip) this.foilLip.visible = unlocked;
  }

  // Wobble coffee mug on table when heavy folds occur
  public shakeMug(intensity: number = 1.0) {
    this.mugWobbleTimer = 0.65;
    this.mugWobbleIntensity = intensity;
  }

  // Sneaky Cat collision & triggers
  public hitCat(): boolean {
    if (this.catState === 'startled') return false;
    this.catState = 'startled';
    this.catStartledTimer = 1.6;
    this.catHitCount++;
    sound.playCatMeow();
    return true;
  }

  public getCatWorldPosition(): THREE.Vector3 {
    if (!this.catGroup) return new THREE.Vector3(0, -999, 0);
    return this.catGroup.position.clone().add(new THREE.Vector3(0, 0.15, 0));
  }

  public getCatBoundingRadius(): number {
    return 0.85;
  }

  // Neighbor BBQ Grill collision & triggers
  public hitGrill(): boolean {
    this.grillHitTimer = 3.5;
    this.grillHitCount++;
    sound.playGrillSizzle();
    if (this.grillFlame) this.grillFlame.visible = true;
    if (this.grillLid) this.grillLid.rotation.x = -0.85;
    return true;
  }

  public getGrillWorldPosition(): THREE.Vector3 {
    if (!this.grillGroup) return new THREE.Vector3(0, -999, 0);
    return this.grillGroup.position.clone().add(new THREE.Vector3(0, 0.9, 0));
  }

  public getGrillBoundingRadius(): number {
    return 1.15;
  }

  // Neighbor Car collision accessors
  public getCarWorldPosition(): THREE.Vector3 {
    return new THREE.Vector3(-12.0, 0.85, -24.0);
  }

  public getCarBoundingRadius(): number {
    return 2.5;
  }

  // Build Sneaky Neighbor Cat stalking the garden fence
  private buildSneakyCat() {
    const catGroup = new THREE.Group();
    catGroup.position.set(-3.5, 0.89, -12.0);

    const catMat = createToonMaterial({ color: 0xd35400 });
    const darkMat = createToonMaterial({ color: 0xa04000 });
    const whiteMat = createToonMaterial({ color: 0xfdfefe });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71 });

    const bodyGeo = new THREE.BoxGeometry(0.36, 0.18, 0.18);
    const body = new THREE.Mesh(bodyGeo, catMat);
    body.position.set(0, 0.11, 0);
    body.castShadow = true;
    catGroup.add(body);

    const chestGeo = new THREE.BoxGeometry(0.20, 0.13, 0.184);
    const chest = new THREE.Mesh(chestGeo, whiteMat);
    chest.position.set(0.06, 0.09, 0);
    catGroup.add(chest);

    const headGeo = new THREE.BoxGeometry(0.18, 0.16, 0.16);
    const head = new THREE.Mesh(headGeo, catMat);
    head.position.set(0.24, 0.21, 0);
    head.castShadow = true;
    catGroup.add(head);

    const earGeo = new THREE.ConeGeometry(0.045, 0.08, 4);
    earGeo.rotateY(Math.PI / 4);
    const earL = new THREE.Mesh(earGeo, darkMat);
    earL.position.set(0.24, 0.32, 0.055);
    const earR = new THREE.Mesh(earGeo, darkMat);
    earR.position.set(0.24, 0.32, -0.055);
    catGroup.add(earL, earR);

    const eyeGeo = new THREE.BoxGeometry(0.02, 0.028, 0.028);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.33, 0.23, 0.045);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.33, 0.23, -0.045);
    catGroup.add(eyeL, eyeR);

    const legGeo = new THREE.BoxGeometry(0.06, 0.12, 0.06);
    const legCoords = [
      [-0.12, 0.04, 0.06],
      [-0.12, 0.04, -0.06],
      [0.12, 0.04, 0.06],
      [0.12, 0.04, -0.06]
    ];
    legCoords.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, whiteMat);
      leg.position.set(lx, ly, lz);
      catGroup.add(leg);
    });

    const tailGeo = new THREE.CylinderGeometry(0.022, 0.028, 0.24, 6);
    tailGeo.translate(0, 0.12, 0);
    tailGeo.rotateZ(Math.PI * 0.32);
    const tail = new THREE.Mesh(tailGeo, darkMat);
    tail.position.set(-0.18, 0.15, 0);
    catGroup.add(tail);
    this.catTail = tail;

    this.catGroup = catGroup;
    this.level1GardenGroup.add(catGroup);
  }

  // Build Neighbor BBQ Grill with smoking lid and flare burst
  private buildNeighborGrill() {
    const grillGroup = new THREE.Group();
    grillGroup.position.set(-18.0, 0, -20.0);

    const metalMat = createToonMaterial({ color: 0x242424 });
    const legMat = createToonMaterial({ color: 0x7f8c8d });
    const coalMat = new THREE.MeshBasicMaterial({ color: 0xe67e22 });
    const wheelMat = createToonMaterial({ color: 0xc0392b });

    const bowlGeo = new THREE.SphereGeometry(0.52, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const bowl = new THREE.Mesh(bowlGeo, metalMat);
    bowl.position.set(0, 0.9, 0);
    bowl.castShadow = true;
    grillGroup.add(bowl);

    const coalGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.06, 12);
    const coals = new THREE.Mesh(coalGeo, coalMat);
    coals.position.set(0, 0.88, 0);
    grillGroup.add(coals);

    const grateGeo = new THREE.CylinderGeometry(0.50, 0.50, 0.02, 12);
    const grateMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.85, roughness: 0.3 });
    const grate = new THREE.Mesh(grateGeo, grateMat);
    grate.position.set(0, 0.92, 0);
    grillGroup.add(grate);

    const lidGeo = new THREE.SphereGeometry(0.53, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const lid = new THREE.Mesh(lidGeo, metalMat);
    lid.position.set(0, 0.92, 0);
    lid.castShadow = true;

    const handleGeo = new THREE.BoxGeometry(0.06, 0.08, 0.22);
    const handle = new THREE.Mesh(handleGeo, legMat);
    handle.position.set(0, 0.54, 0);
    lid.add(handle);

    grillGroup.add(lid);
    this.grillLid = lid;

    const flameGeo = new THREE.ConeGeometry(0.62, 1.35, 7);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 1.55, 0);
    flame.visible = false;
    grillGroup.add(flame);
    this.grillFlame = flame;

    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.95, 6);
    const l1 = new THREE.Mesh(legGeo, legMat);
    l1.position.set(0, 0.45, 0.35);
    l1.rotation.x = -0.22;
    const l2 = new THREE.Mesh(legGeo, legMat);
    l2.position.set(-0.3, 0.45, -0.25);
    l2.rotation.z = 0.22;
    l2.rotation.x = 0.15;
    const l3 = new THREE.Mesh(legGeo, legMat);
    l3.position.set(0.3, 0.45, -0.25);
    l3.rotation.z = -0.22;
    l3.rotation.x = 0.15;
    grillGroup.add(l1, l2, l3);

    const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.position.set(-0.38, 0.1, -0.32);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.position.set(0.38, 0.1, -0.32);
    grillGroup.add(w1, w2);

    this.grillSmokePuffs = [];
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.35 });
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.14 + i * 0.06, 6, 6), smokeMat);
      puff.position.set(0, 1.45 + i * 0.4, 0);
      grillGroup.add(puff);
      this.grillSmokePuffs.push(puff);
    }

    this.grillGroup = grillGroup;
    this.level1GardenGroup.add(grillGroup);
  }

  // Trigger neighbor chaos: Car alarm wails, blinkers flash, fence rattles!
  public triggerNeighborCarAlarm() {
    this.carAlarmActive = true;
    this.carAlarmTimer = 8.5;
    sound.playCarAlarm();

    this.damagedFencePosts.forEach((post) => {
      post.rotation.z += (Math.random() - 0.5) * 0.4;
      post.rotation.x += (Math.random() - 0.5) * 0.4;
    });
  }

  public triggerCarAlarm() {
    this.triggerNeighborCarAlarm();
  }

  public triggerSheepFaint() {
    this.sheepFlock.forEach((sheep) => {
      if (sheep.state !== 'fainting' && sheep.state !== 'down') {
        sheep.state = 'fainting';
        sheep.timer = 0;
      }
    });
  }

  public triggerFaintingSheep() {
    this.triggerSheepFaint();
  }

  private createTree(x: number, y: number, z: number, variant: number = 0) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);
    this.level1GardenGroup.add(treeGroup);

    const modelUrl = variant % 2 === 0 ? '/models/tree_oak.glb' : '/models/tree_detailed.glb';
    modelLoader.load(modelUrl).then((tree) => {
      const scale = 5.8 + (variant % 3) * 0.7;
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = variant * 1.6;
      treeGroup.add(tree);
    }).catch(() => {
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.5, 6);
      const trunkMat = createToonMaterial({ color: GOOSE_PALETTE.woodBark });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.25;
      trunk.castShadow = true;
      treeGroup.add(trunk);
    });
  }

  private createFence(startX: number, z: number, length: number) {
    const fenceGroup = new THREE.Group();
    const fenceMat = createToonMaterial({ color: GOOSE_PALETTE.woodFence });
    this.damagedFencePosts = [];

    const postSpacing = 2.0;
    const count = Math.floor(length / postSpacing);

    for (let i = 0; i <= count; i++) {
      const postGeo = new THREE.BoxGeometry(0.12, 1.1, 0.12);
      const post = new THREE.Mesh(postGeo, fenceMat);
      post.position.set(startX + i * postSpacing, 0.55, z);
      post.castShadow = true;
      fenceGroup.add(post);
      this.damagedFencePosts.push(post);
    }

    const railGeo = new THREE.BoxGeometry(length, 0.08, 0.04);
    const topRail = new THREE.Mesh(railGeo, fenceMat);
    topRail.position.set(startX + length / 2, 0.85, z);
    const midRail = new THREE.Mesh(railGeo, fenceMat);
    midRail.position.set(startX + length / 2, 0.45, z);
    fenceGroup.add(topRail, midRail);

    this.level1GardenGroup.add(fenceGroup);
  }

  private createDaisies() {
    const flowerGroup = new THREE.Group();
    const stemMat = createToonMaterial({ color: GOOSE_PALETTE.foliageSecondary });
    const petalMat = createToonMaterial({ color: 0xffffff });
    const centerMat = createToonMaterial({ color: 0xf1c40f });

    for (let i = 0; i < 45; i++) {
      const x = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      if (Math.sqrt(x * x + z * z) < 3.5) continue;

      const flower = new THREE.Group();
      flower.position.set(x, 0.08, z);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4), stemMat);
      stem.position.y = 0.125;
      flower.add(stem);

      const center = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), centerMat);
      center.position.y = 0.26;
      flower.add(center);

      for (let p = 0; p < 5; p++) {
        const petal = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.05), petalMat);
        petal.position.set(Math.cos((p * Math.PI * 2) / 5) * 0.09, 0.26, Math.sin((p * Math.PI * 2) / 5) * 0.09);
        petal.rotation.y = (p * Math.PI * 2) / 5;
        flower.add(petal);
      }
      flowerGroup.add(flower);
    }
    this.level1GardenGroup.add(flowerGroup);
  }

  // --- BRAND NEW BIOME: LEVEL 2 - 🏖️ DIE OSTSEE-KÜSTE ---
  private buildCoastBiome() {
    // 1. Rustikaler Holz-Pier unter dem Tisch (Verlängerte Planken auf Stelzen über dem Wasser)
    const pierGroup = new THREE.Group();
    const pierWoodMat = createToonMaterial({ color: 0xa8815b });
    const darkWoodMat = createToonMaterial({ color: 0x6e4e32 });

    // Pier deck planks extending out towards the sea
    const pierDeckLength = 26.0;
    const pierDeckWidth = 7.5;
    const plankW = 0.38;
    const numPlanks = Math.floor(pierDeckLength / plankW);

    for (let i = 0; i < numPlanks; i++) {
      const pZ = -pierDeckLength / 2 + i * plankW + 4.0;
      const plankMesh = new THREE.Mesh(
        new THREE.BoxGeometry(pierDeckWidth, 0.10, plankW - 0.03),
        pierWoodMat
      );
      plankMesh.position.set(0, 1.10, pZ);
      plankMesh.receiveShadow = true;
      pierGroup.add(plankMesh);
    }

    // Heavy wooden pilings / stilts descending into the water
    const stiltGeo = new THREE.CylinderGeometry(0.16, 0.18, 3.2, 8);
    const stiltPositions = [
      [-3.4, 0.0, -8], [3.4, 0.0, -8],
      [-3.4, 0.0, -3], [3.4, 0.0, -3],
      [-3.4, 0.0, 2], [3.4, 0.0, 2],
      [-3.4, 0.0, 7], [3.4, 0.0, 7]
    ];
    stiltPositions.forEach(([sx, sy, sz]) => {
      const stilt = new THREE.Mesh(stiltGeo, darkWoodMat);
      stilt.position.set(sx, sy, sz);
      stilt.castShadow = true;
      pierGroup.add(stilt);

      // Mooring rope wrapped around post top
      const ropeGeo = new THREE.TorusGeometry(0.19, 0.04, 6, 12);
      ropeGeo.rotateX(Math.PI / 2);
      const ropeMat = createToonMaterial({ color: 0xdfc098 });
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set(sx, 1.45, sz);
      pierGroup.add(rope);
    });

    // Pier rope railing along the edges
    for (let side of [-3.5, 3.5]) {
      const railRopeGeo = new THREE.CylinderGeometry(0.03, 0.03, pierDeckLength, 6);
      railRopeGeo.rotateX(Math.PI / 2);
      const ropeMat = createToonMaterial({ color: 0xdfc098 });
      const rope = new THREE.Mesh(railRopeGeo, ropeMat);
      rope.position.set(side, 1.42, -1.0);
      pierGroup.add(rope);
    }
    this.level2CoastGroup.add(pierGroup);

    // 2. Azurblaues animiertes Meer (Ocean water plane with vertex wave movement)
    const oceanGeo = new THREE.PlaneGeometry(380, 380, 48, 48);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0abde3,
      roughness: 0.15,
      metalness: 0.2,
      flatShading: true
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.set(0, -0.35, -40);
    ocean.receiveShadow = true;
    this.level2CoastGroup.add(ocean);

    this.oceanGeometry = oceanGeo;
    this.oceanBasePositions = new Float32Array(oceanGeo.attributes.position.array);

    // 3. Sandige Küstendünen & Strand (Beach shore on left and right)
    const sandGeo = new THREE.PlaneGeometry(160, 160, 18, 18);
    sandGeo.rotateX(-Math.PI / 2);
    const sandPos = sandGeo.attributes.position;
    for (let i = 0; i < sandPos.count; i++) {
      const sx = sandPos.getX(i);
      const sz = sandPos.getZ(i);
      const duneY = Math.sin(sx * 0.06) * Math.cos(sz * 0.05) * 2.5 + Math.max(0, sz * 0.08);
      sandPos.setY(i, duneY);
    }
    sandGeo.computeVertexNormals();

    const sandMat = createToonMaterial({ color: 0xf5cd79 }); // Warm golden Baltic sand
    const dunesLeft = new THREE.Mesh(sandGeo, sandMat);
    dunesLeft.position.set(-80, -0.2, -10);
    dunesLeft.receiveShadow = true;
    this.level2CoastGroup.add(dunesLeft);

    const dunesRight = new THREE.Mesh(sandGeo, sandMat);
    dunesRight.position.set(80, -0.2, -10);
    dunesRight.receiveShadow = true;
    this.level2CoastGroup.add(dunesRight);

    // 4. Bunte Ostsee-Strandkörbe (Classic striped beach wicker chairs on sand)
    const strandkorbPositions = [
      { x: -16, y: 0.35, z: -14, rotY: 0.3 },
      { x: 18, y: 0.40, z: -15, rotY: -0.4 },
      { x: 25, y: 0.55, z: -20, rotY: -0.6 }
    ];
    strandkorbPositions.forEach((cfg) => {
      const skGroup = new THREE.Group();
      skGroup.position.set(cfg.x, cfg.y, cfg.z);
      skGroup.rotation.y = cfg.rotY;

      const basketMat = createToonMaterial({ color: 0xddaa77 });
      const baseGeo = new THREE.BoxGeometry(1.4, 0.9, 1.1);
      const baseMesh = new THREE.Mesh(baseGeo, basketMat);
      baseMesh.position.y = 0.45;
      baseMesh.castShadow = true;
      skGroup.add(baseMesh);

      const hoodGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.4, 8, 1, false, 0, Math.PI);
      hoodGeo.rotateZ(Math.PI / 2);
      const stripedMat = createToonMaterial({ color: 0x2e86de });
      const hood = new THREE.Mesh(hoodGeo, stripedMat);
      hood.position.set(0, 1.25, 0.05);
      hood.castShadow = true;
      skGroup.add(hood);

      const cushionGeo = new THREE.BoxGeometry(1.2, 0.25, 0.85);
      const cushionMat = createToonMaterial({ color: 0xffffff });
      const cushion = new THREE.Mesh(cushionGeo, cushionMat);
      cushion.position.set(0, 0.55, 0.1);
      skGroup.add(cushion);

      this.level2CoastGroup.add(skGroup);
    });

    // 5. Rot-weißer Leuchtturm in der Ferne mit rotierendem Lichtkegel
    const lighthouseGroup = new THREE.Group();
    lighthouseGroup.position.set(-42, 0, -52);

    const rockGeo = new THREE.DodecahedronGeometry(6.5, 1);
    const rockMat = createToonMaterial({ color: 0x57606f });
    const rockBase = new THREE.Mesh(rockGeo, rockMat);
    rockBase.position.y = 2.0;
    rockBase.scale.set(1.5, 0.8, 1.3);
    lighthouseGroup.add(rockBase);

    const ringCount = 6;
    const ringHeight = 3.2;
    for (let r = 0; r < ringCount; r++) {
      const radiusBot = 3.2 - r * 0.22;
      const radiusTop = 3.2 - (r + 1) * 0.22;
      const rGeo = new THREE.CylinderGeometry(radiusTop, radiusBot, ringHeight, 12);
      const color = r % 2 === 0 ? 0xc0392b : 0xf1f2f6;
      const rMat = createToonMaterial({ color });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.y = 4.5 + r * ringHeight;
      rMesh.castShadow = true;
      lighthouseGroup.add(rMesh);
    }

    const galleryGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.35, 14);
    const galleryMat = createToonMaterial({ color: 0x2c3e50 });
    const gallery = new THREE.Mesh(galleryGeo, galleryMat);
    gallery.position.y = 4.5 + ringCount * ringHeight;
    lighthouseGroup.add(gallery);

    const lanternGeo = new THREE.CylinderGeometry(1.6, 1.6, 1.8, 10);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfffa65 });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 4.5 + ringCount * ringHeight + 1.1;
    lighthouseGroup.add(lantern);

    const domeGeo = new THREE.SphereGeometry(1.65, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, galleryMat);
    dome.position.y = 4.5 + ringCount * ringHeight + 2.0;
    lighthouseGroup.add(dome);

    const beamPivot = new THREE.Group();
    beamPivot.position.set(0, 4.5 + ringCount * ringHeight + 1.1, 0);

    const beamGeo = new THREE.ConeGeometry(8.0, 52.0, 16);
    beamGeo.rotateX(Math.PI / 2);
    beamGeo.translate(0, 0, 26.0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfffa65,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beamPivot.add(beam);
    lighthouseGroup.add(beamPivot);
    this.lighthouseBeam = beamPivot;

    this.level2CoastGroup.add(lighthouseGroup);

    // 6. Krabbenkutter "FALTALITY I" (Interactive Fishing Boat in the bay)
    const boatGroup = new THREE.Group();
    boatGroup.position.set(24, -0.25, -28);

    const hullMat = createToonMaterial({ color: 0x1b1464 });
    const hullTopMat = createToonMaterial({ color: 0xffffff });
    const deckMat = createToonMaterial({ color: 0xd2b48c });

    const hullGeo = new THREE.BoxGeometry(4.2, 1.6, 9.5);
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.5;
    hull.castShadow = true;
    boatGroup.add(hull);

    const gunwaleGeo = new THREE.BoxGeometry(4.35, 0.4, 9.6);
    const gunwale = new THREE.Mesh(gunwaleGeo, hullTopMat);
    gunwale.position.y = 1.35;
    boatGroup.add(gunwale);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.1, 9.0), deckMat);
    deck.position.y = 1.45;
    boatGroup.add(deck);

    const cabinGeo = new THREE.BoxGeometry(2.8, 1.9, 3.2);
    const cabin = new THREE.Mesh(cabinGeo, hullTopMat);
    cabin.position.set(0, 2.45, 0.8);
    cabin.castShadow = true;
    boatGroup.add(cabin);

    const winMat = new THREE.MeshBasicMaterial({ color: 0x38ada9 });
    const frontWin = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.7), winMat);
    frontWin.position.set(0, 2.65, -0.81);
    boatGroup.add(frontWin);

    const mastGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.8, 6);
    const mast = new THREE.Mesh(mastGeo, createToonMaterial({ color: 0x71583a }));
    mast.position.set(0, 4.3, -1.8);
    mast.castShadow = true;
    boatGroup.add(mast);

    const stackGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 8);
    const stack = new THREE.Mesh(stackGeo, createToonMaterial({ color: 0xe74c3c }));
    stack.position.set(0.8, 3.6, 1.5);
    boatGroup.add(stack);

    const buoyGeo = new THREE.TorusGeometry(0.28, 0.08, 6, 12);
    const buoyMat = createToonMaterial({ color: 0xff6b6b });
    const buoy = new THREE.Mesh(buoyGeo, buoyMat);
    buoy.position.set(-1.42, 2.4, 0.8);
    buoy.rotation.y = Math.PI / 2;
    boatGroup.add(buoy);

    this.boatSmokePuffs = [];
    const boatSmokeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.25 + i * 0.1, 6, 6), boatSmokeMat);
      puff.position.set(0.8, 4.2 + i * 0.45, 1.5);
      boatGroup.add(puff);
      this.boatSmokePuffs.push(puff);
    }

    this.boatGroup = boatGroup;
    this.level2CoastGroup.add(boatGroup);

    // --- LEVEL 2 TABLE PROPS ---
    // 1. O'Reilly Parody Book 2: "Surfing Quantum Origami in Prod"
    const coastBookGroup = new THREE.Group();
    coastBookGroup.position.set(-0.52, 1.205, 0.16);
    coastBookGroup.rotation.set(-0.14, 0.12, 0.02);

    const cPagesGeo = new THREE.BoxGeometry(0.32, 0.052, 0.44);
    const cPagesMesh = new THREE.Mesh(cPagesGeo, createToonMaterial({ color: 0xfcf8e3 }));
    cPagesMesh.position.set(0.01, 0.026, 0);
    cPagesMesh.castShadow = true;
    coastBookGroup.add(cPagesMesh);

    const cCoverTex = createOReillyCoastBookTexture();
    const cCoverGeo = new THREE.BoxGeometry(0.34, 0.008, 0.46);
    const cCoverSideMat = createToonMaterial({ color: 0x0c2461 });
    const cCoverTopMat = new THREE.MeshStandardMaterial({
      map: cCoverTex,
      roughness: 0.45,
      metalness: 0.05
    });
    const cCoverMaterials = [
      cCoverSideMat, cCoverSideMat, cCoverTopMat, cCoverSideMat, cCoverSideMat, cCoverSideMat
    ];
    const cCoverMesh = new THREE.Mesh(cCoverGeo, cCoverMaterials);
    cCoverMesh.position.set(0, 0.056, 0);
    cCoverMesh.castShadow = true;
    coastBookGroup.add(cCoverMesh);

    const cSpine = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.058, 0.46), cCoverSideMat);
    cSpine.position.set(-0.17, 0.029, 0);
    coastBookGroup.add(cSpine);
    this.level2CoastGroup.add(coastBookGroup);

    // 2. Chilled Aluminum Can ("KÜSTEN-KOLA") with water droplets
    const canGroup = new THREE.Group();
    canGroup.position.set(0.68, 1.205, -0.35);

    const canBodyGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.24, 14);
    const canMat = new THREE.MeshStandardMaterial({
      color: 0x1e3799,
      roughness: 0.22,
      metalness: 0.85
    });
    const canMesh = new THREE.Mesh(canBodyGeo, canMat);
    canMesh.position.y = 0.12;
    canMesh.castShadow = true;
    canGroup.add(canMesh);

    const silverMat = new THREE.MeshStandardMaterial({ color: 0xdcdde1, metalness: 0.9, roughness: 0.2 });
    const canLid = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.076, 0.015, 14), silverMat);
    canLid.position.y = 0.24;
    canGroup.add(canLid);

    const dropMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 });
    for (let d = 0; d < 6; d++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.008, 4, 4), dropMat);
      const angle = (d * Math.PI * 2) / 6;
      drop.position.set(Math.cos(angle) * 0.078, 0.06 + d * 0.028, Math.sin(angle) * 0.078);
      canGroup.add(drop);
    }
    this.level2CoastGroup.add(canGroup);

    // 3. Pommestüte (Paper cone of hot french fries with flag)
    const friesGroup = new THREE.Group();
    friesGroup.position.set(0.62, 1.205, 0.28);
    friesGroup.rotation.z = -0.15;

    const coneGeo = new THREE.ConeGeometry(0.09, 0.26, 8, 1, true);
    const coneMat = createToonMaterial({ color: 0xf8f9fa });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 0.13;
    cone.castShadow = true;
    friesGroup.add(cone);

    const fryMat = createToonMaterial({ color: 0xf1c40f });
    for (let f = 0; f < 5; f++) {
      const fryGeo = new THREE.BoxGeometry(0.014, 0.18, 0.014);
      const fry = new THREE.Mesh(fryGeo, fryMat);
      fry.position.set((Math.random() - 0.5) * 0.06, 0.22, (Math.random() - 0.5) * 0.06);
      fry.rotation.set((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3);
      friesGroup.add(fry);
    }

    const flagStick = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.16, 4), silverMat);
    flagStick.position.set(0, 0.28, 0);
    friesGroup.add(flagStick);

    const flagGeo = new THREE.PlaneGeometry(0.05, 0.03);
    const flagMat = createToonMaterial({ color: 0xe74c3c });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.026, 0.34, 0);
    friesGroup.add(flag);

    this.level2CoastGroup.add(friesGroup);

    // 4. Baltic Sea Shell & Starfish on table
    const starMat = createToonMaterial({ color: 0xe67e22 });
    const starfish = new THREE.Group();
    starfish.position.set(-0.38, 1.205, 0.42);
    for (let a = 0; a < 5; a++) {
      const armGeo = new THREE.ConeGeometry(0.014, 0.065, 4);
      armGeo.rotateZ(Math.PI / 2);
      const arm = new THREE.Mesh(armGeo, starMat);
      arm.rotation.y = (a * Math.PI * 2) / 5;
      arm.position.y = 0.006;
      starfish.add(arm);
    }
    this.level2CoastGroup.add(starfish);

    const shellGeo = new THREE.TorusGeometry(0.038, 0.018, 6, 8, Math.PI * 1.5);
    shellGeo.rotateX(Math.PI / 2);
    const shellMat = createToonMaterial({ color: 0xfff2cc });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.set(-0.46, 1.205, 0.36);
    this.level2CoastGroup.add(shell);
  }

  // Switch Biomes & Atmospheric Lighting
  public setLevel(levelId: number) {
    this.currentLevel = levelId;
    if (levelId === 1) {
      this.level1GardenGroup.visible = true;
      this.level2CoastGroup.visible = false;
      this.scene.background = new THREE.Color(GOOSE_PALETTE.sky);
      this.scene.fog = new THREE.Fog(GOOSE_PALETTE.fog, 65, 260);
    } else if (levelId === 2) {
      this.level1GardenGroup.visible = false;
      this.level2CoastGroup.visible = true;
      this.scene.background = new THREE.Color(0x7ed6df); // Sunny Baltic seaside sky
      this.scene.fog = new THREE.Fog(0xc7ecee, 75, 280);
    }
  }

  // Krabbenkutter Boat collision & triggers (Level 2)
  public hitBoat(): boolean {
    if (this.currentLevel !== 2) return false;
    this.boatHitTimer = 2.5;
    this.boatHitCount++;
    sound.playBoatHorn();
    // Burst extra chimney steam puffs
    this.boatSmokePuffs.forEach((p, idx) => {
      p.position.y = 4.2 + idx * 0.8;
      p.scale.set(2.2, 2.2, 2.2);
    });
    return true;
  }

  public getBoatWorldPosition(): THREE.Vector3 {
    if (!this.boatGroup) return new THREE.Vector3(0, -999, 0);
    return this.boatGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  }

  public getBoatBoundingRadius(): number {
    return 3.5;
  }

  private buildClouds() {
    for (let i = 0; i < 11; i++) {
      const cloudGroup = new THREE.Group();
      cloudGroup.position.set(
        (Math.random() - 0.5) * 280,
        32 + Math.random() * 22,
        -40 - Math.random() * 190
      );

      modelLoader.load('/models/cloud.glb').then((cloudMesh) => {
        const s = 14.0 + Math.random() * 12.0;
        cloudMesh.scale.set(s, s * 0.65, s * 0.85);
        cloudGroup.add(cloudMesh);
      });

      this.clouds.push(cloudGroup);
      this.scene.add(cloudGroup);
    }
  }

  public update(delta: number) {
    // Slowly drift clouds across the sunny sky
    this.clouds.forEach((cloud) => {
      cloud.position.x += 1.8 * delta;
      if (cloud.position.x > 150) {
        cloud.position.x = -150;
      }
    });

    // LEVEL 1: GARDEN CHAOS ANIMATION
    if (this.currentLevel === 1) {
      // Animate Neighbor's Car Alarm
      if (this.carAlarmActive) {
        this.carAlarmTimer -= delta;
        const flash = Math.floor(this.carAlarmTimer * 7.5) % 2 === 0;
        const colorHex = flash ? 0xff9f43 : 0x331100;
        this.carBlinkers.forEach((b) => {
          (b.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
        });

        if (this.neighborCarGroup) {
          this.neighborCarGroup.position.y = 0.65 + (flash ? 0.05 : 0);
        }

        if (this.carAlarmTimer <= 0) {
          this.carAlarmActive = false;
          this.carBlinkers.forEach((b) => {
            (b.material as THREE.MeshBasicMaterial).color.setHex(0x332200);
          });
          if (this.neighborCarGroup) this.neighborCarGroup.position.y = 0.65;
        }
      }

      // Animate Fainting Origami Sheep
      this.sheepBaaTimer -= delta;
      if (this.sheepBaaTimer <= 0) {
        this.sheepBaaTimer = 8 + Math.random() * 8;
        sound.playSheepBaa();
      }

      this.sheepFlock.forEach((sheep) => {
        sheep.chewPhase += delta * 4;

        if (sheep.state === 'grazing') {
          if (sheep.headGroup) sheep.headGroup.rotation.x = 0.2 + Math.sin(sheep.chewPhase) * 0.12;
        } else if (sheep.state === 'fainting') {
          sheep.timer += delta * 4.5;
          const roll = Math.min(Math.PI / 2, sheep.timer * (Math.PI / 2));
          sheep.group.rotation.z = roll;
          sheep.group.position.y = sheep.baseY - Math.sin(roll) * 0.35;

          sheep.legs?.forEach((leg) => {
            leg.rotation.z = -0.4;
          });

          if (sheep.timer >= 1.0) {
            sheep.state = 'down';
            sheep.timer = 4.5;
            sound.playSheepBaa();
          }
        } else if (sheep.state === 'down') {
          sheep.timer -= delta;
          if (sheep.timer <= 0) {
            sheep.state = 'recovering';
            sheep.timer = 0;
          }
        } else if (sheep.state === 'recovering') {
          sheep.timer += delta * 2.5;
          const progress = Math.min(1.0, sheep.timer);
          const roll = (1.0 - progress) * (Math.PI / 2);
          sheep.group.rotation.z = roll;
          sheep.group.position.y = sheep.baseY - Math.sin(roll) * 0.35;

          if (progress >= 1.0) {
            sheep.state = 'grazing';
            sheep.group.rotation.z = 0;
            sheep.group.position.y = sheep.baseY;
            sheep.legs?.forEach((leg) => {
              leg.rotation.z = 0;
            });
          }
        }
      });

      // Animate Coffee Mug Wobble & Rising Steam
      if (this.mugGroup) {
        if (this.mugWobbleTimer > 0) {
          this.mugWobbleTimer -= delta;
          const decay = Math.max(0, this.mugWobbleTimer / 0.65);
          const wobble = Math.sin(this.mugWobbleTimer * 42) * 0.16 * decay * this.mugWobbleIntensity;
          this.mugGroup.rotation.z = wobble;
          this.mugGroup.rotation.x = wobble * 0.6;
        } else {
          this.mugGroup.rotation.set(0, 0, 0);
        }

        this.steamPuffs.forEach((puff, idx) => {
          puff.position.y += (0.04 + idx * 0.015) * delta;
          puff.position.x += Math.sin(puff.position.y * 12) * 0.008 * delta;
          if (puff.position.y > 0.48) {
            puff.position.y = 0.24;
            puff.position.x = (Math.random() - 0.5) * 0.03;
          }
        });
      }

      // Animate Sneaky Cat Stalking
      if (this.catGroup) {
        if (this.catState === 'stalking') {
          const catSpeed = 1.2 * delta;
          this.catGroup.position.x += this.catDirection * catSpeed;

          if (this.catTail) {
            this.catTail.rotation.z = Math.PI * 0.32 + Math.sin(performance.now() * 0.005) * 0.25;
          }

          if (this.catGroup.position.x > 9.5 && this.catDirection > 0) {
            this.catDirection = -1;
            this.catGroup.rotation.y = Math.PI;
          } else if (this.catGroup.position.x < -9.5 && this.catDirection < 0) {
            this.catDirection = 1;
            this.catGroup.rotation.y = 0;
          }
        } else if (this.catState === 'startled') {
          this.catStartledTimer -= delta;
          const progress = Math.max(0, 1.0 - this.catStartledTimer / 1.6);
          const jumpY = Math.sin(progress * Math.PI) * 1.35;
          this.catGroup.position.y = 0.89 + jumpY;
          this.catGroup.rotation.x = progress * Math.PI * 2;

          if (this.catStartledTimer <= 0) {
            this.catState = 'stalking';
            this.catGroup.position.y = 0.89;
            this.catGroup.rotation.x = 0;
            this.catGroup.rotation.y = this.catDirection > 0 ? 0 : Math.PI;
          }
        }
      }

      // Animate Neighbor BBQ Grill Smoke & Flare
      if (this.grillGroup) {
        if (this.grillHitTimer > 0) {
          this.grillHitTimer -= delta;
          if (this.grillFlame) {
            const flameScale = 1.0 + Math.sin(this.grillHitTimer * 28) * 0.3;
            this.grillFlame.scale.set(flameScale, flameScale * 1.2, flameScale);
          }
          if (this.grillHitTimer <= 0) {
            if (this.grillFlame) this.grillFlame.visible = false;
            if (this.grillLid) this.grillLid.rotation.x = 0;
          }
        }

        this.grillSmokePuffs.forEach((puff, idx) => {
          puff.position.y += (0.6 + idx * 0.25) * delta;
          puff.scale.addScalar(0.12 * delta);
          if (puff.position.y > 2.6) {
            puff.position.y = 1.45;
            puff.scale.set(1, 1, 1);
          }
        });
      }
    }

    // LEVEL 2: OSTSEE-KÜSTE ANIMATION
    if (this.currentLevel === 2) {
      const time = performance.now() * 0.001;

      // 1. Dynamic Ocean Waves
      if (this.oceanGeometry && this.oceanBasePositions) {
        const posAttr = this.oceanGeometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const u = this.oceanBasePositions[i * 3];
          const v = this.oceanBasePositions[i * 3 + 1];
          const wave = Math.sin(u * 0.07 + time * 2.2) * Math.cos(v * 0.06 + time * 1.8) * 0.32
                     + Math.sin(u * 0.12 - time * 1.4) * 0.14;
          posAttr.setZ(i, wave);
        }
        posAttr.needsUpdate = true;
      }

      // 2. Rotating Lighthouse Searchlight Beam
      if (this.lighthouseBeam) {
        this.lighthouseBeam.rotation.y += delta * 0.75;
      }

      // 3. Krabbenkutter Boat Bobbing & Rolling on the Waves
      if (this.boatGroup) {
        this.boatGroup.position.y = -0.25 + Math.sin(time * 1.8) * 0.12;
        this.boatGroup.rotation.z = Math.sin(time * 1.5) * 0.05;
        this.boatGroup.rotation.x = Math.cos(time * 1.2) * 0.03;
      }

      // 4. Krabbenkutter Chimney Smoke
      this.boatSmokePuffs.forEach((puff, idx) => {
        puff.position.y += (0.8 + idx * 0.2) * delta;
        puff.position.x += 0.2 * delta;
        puff.scale.addScalar(0.12 * delta);
        if (puff.position.y > 4.5) {
          puff.position.set(0.8, 4.0, 1.5);
          puff.scale.set(0.7, 0.7, 0.7);
        }
      });
    }
  }
}
