import * as THREE from 'three';
import { sound } from '../sound';

interface OrigamiSheep {
  group: THREE.Group;
  headGroup: THREE.Group;
  legs: THREE.Mesh[];
  state: 'grazing' | 'fainting' | 'down' | 'recovering';
  timer: number;
  baseY: number;
  baseRotY: number;
  chewPhase: number;
}

export class Environment {
  public scene: THREE.Scene;
  public tablePosition: THREE.Vector3 = new THREE.Vector3(0, 1.2, 0);
  private clouds: THREE.Group[] = [];

  // Neighbor House & Car
  private neighborCarGroup: THREE.Group | null = null;
  private carBlinkers: THREE.Mesh[] = [];
  public carAlarmActive: boolean = false;
  private carAlarmTimer: number = 0;
  private damagedFencePosts: THREE.Mesh[] = [];

  // Fainting Sheep flock
  private sheepFlock: OrigamiSheep[] = [];
  private sheepBaaTimer: number = 4.0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildGarden();
    this.buildNeighborProperty();
    this.buildSheepPasture();
    this.buildClouds();
  }

  private buildGarden() {
    // 1. Soft rolling green grass terrain
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

    const grassMat = new THREE.MeshLambertMaterial({
      color: 0x82a852, // Warm Untitled Goose Game lawn green
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeo, grassMat);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Wooden garden table where folding takes place
    const tableGroup = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xb57842, flatShading: true });
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x8a5528, flatShading: true });

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
      tableGroup.add(plank);
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
      tableGroup.add(leg);
    });

    // Cross braces
    const braceGeo = new THREE.BoxGeometry(0.08, 0.08, 1.8);
    const braceL = new THREE.Mesh(braceGeo, darkWoodMat);
    braceL.position.set(-0.95, 0.3, 0);
    const braceR = new THREE.Mesh(braceGeo, darkWoodMat);
    braceR.position.set(0.95, 0.3, 0);
    tableGroup.add(braceL, braceR);

    // Picnic mat / drafting sheet on table
    const matGeo = new THREE.PlaneGeometry(1.8, 1.5);
    matGeo.rotateX(-Math.PI / 2);
    const matMat = new THREE.MeshLambertMaterial({ color: 0xdfd4be, flatShading: true });
    const picnicMat = new THREE.Mesh(matGeo, matMat);
    picnicMat.position.set(0, 1.205, 0);
    picnicMat.receiveShadow = true;
    tableGroup.add(picnicMat);

    // Apple coffee mug on table
    const mugGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.22, 10);
    const mugMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(0.7, 1.32, -0.6);
    mug.castShadow = true;
    tableGroup.add(mug);

    this.scene.add(tableGroup);

    // 3. Low-Poly Trees in the background
    const treePositions = [
      [-22, 0, -26],
      [28, 0, -28],
      [-28, 0, 15],
      [32, 0, 18],
      [-36, 0, -10],
      [38, 0, -5],
      [-10, 0, 35],
      [12, 0, 32]
    ];
    treePositions.forEach(([tx, ty, tz]) => {
      this.createTree(tx, ty, tz);
    });

    // 4. White Picket Fence in distance separating gardens
    this.createFence(-18, -12, 36);

    // 5. Flowers & Daisies scattered around lawn
    this.createDaisies();
  }

  // Neighbor Property: Suburban house, driveway and parked family car with flashing alarm!
  private buildNeighborProperty() {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(18, 0, -18);

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf3ede2, flatShading: true });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xb33927, flatShading: true });
    const woodTrim = new THREE.MeshLambertMaterial({ color: 0x4a3728, flatShading: true });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x81ecec });
    const gravelMat = new THREE.MeshLambertMaterial({ color: 0x7f8c8d, flatShading: true });

    // House Main Block
    const houseBody = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.5, 6.0), wallMat);
    houseBody.position.set(0, 2.25, 0);
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    // Gabled Roof
    const roofGeo = new THREE.ConeGeometry(5.8, 2.6, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 5.8, 0);
    roof.scale.set(1.0, 1.0, 0.85);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Chimney
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), wallMat);
    chimney.position.set(2.0, 6.2, -1.0);
    houseGroup.add(chimney);

    // Front Door & Windows facing player
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 0.1), woodTrim);
    door.position.set(-1.5, 1.1, 3.05);
    houseGroup.add(door);

    const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.08), windowMat);
    win1.position.set(1.6, 2.6, 3.05);
    const win2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.08), windowMat);
    win2.position.set(-1.6, 3.2, 3.05);
    houseGroup.add(win1, win2);

    // Driveway paving (runs towards player garden)
    const driveway = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 8.5), gravelMat);
    driveway.rotateX(-Math.PI / 2);
    driveway.position.set(-4.5, 0.02, 3.0);
    driveway.receiveShadow = true;
    houseGroup.add(driveway);

    // NEIGHBOR'S CAR
    const car = new THREE.Group();
    car.position.set(-4.5, 0.55, 2.5);
    car.rotation.y = -Math.PI / 12; // parked at slight angle

    const carBodyMat = new THREE.MeshStandardMaterial({
      color: 0x2980b9, // Suburban metallic blue
      roughness: 0.3,
      metalness: 0.6,
      flatShading: true
    });
    const carGlassMat = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1e272e, flatShading: true });

    // Lower Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 3.6), carBodyMat);
    chassis.position.y = 0.25;
    chassis.castShadow = true;
    car.add(chassis);

    // Cabin / Roof
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.9), carBodyMat);
    cabin.position.set(0, 0.78, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    // Windshield front & rear
    const fGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.55), carGlassMat);
    fGlass.position.set(0, 0.76, 0.77);
    fGlass.rotateX(-Math.PI / 6);
    const rGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.55), carGlassMat);
    rGlass.position.set(0, 0.76, -1.17);
    rGlass.rotateX(Math.PI + Math.PI / 6);
    car.add(fGlass, rGlass);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    for (const [wx, wz] of [[-0.95, 1.1], [0.95, 1.1], [-0.95, -1.1], [0.95, -1.1]]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, 0.05, wz);
      wheel.castShadow = true;
      car.add(wheel);
    }

    // 4 Flashing Alarm Blinkers (Front Amber + Rear Red/Amber)
    const blinkerGeo = new THREE.BoxGeometry(0.3, 0.15, 0.08);
    const blinkerMat1 = new THREE.MeshBasicMaterial({ color: 0x4a3000 }); // Dim off state
    const blinkerMat2 = new THREE.MeshBasicMaterial({ color: 0x4a3000 });

    const frontLeft = new THREE.Mesh(blinkerGeo, blinkerMat1);
    frontLeft.position.set(-0.7, 0.35, 1.82);
    const frontRight = new THREE.Mesh(blinkerGeo, blinkerMat1);
    frontRight.position.set(0.7, 0.35, 1.82);

    const rearLeft = new THREE.Mesh(blinkerGeo, blinkerMat2);
    rearLeft.position.set(-0.7, 0.4, -1.82);
    const rearRight = new THREE.Mesh(blinkerGeo, blinkerMat2);
    rearRight.position.set(0.7, 0.4, -1.82);

    car.add(frontLeft, frontRight, rearLeft, rearRight);
    this.carBlinkers = [frontLeft, frontRight, rearLeft, rearRight];

    houseGroup.add(car);
    this.neighborCarGroup = car;
    this.scene.add(houseGroup);
  }

  // The Sheep Pasture: 3 hilarious Origami Fainting Sheep on the left lawn!
  private buildSheepPasture() {
    const pastureGroup = new THREE.Group();
    pastureGroup.position.set(-14.5, 0, -11.5);

    // Low wooden pasture fence
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8a6845, flatShading: true });
    for (let x = -4; x <= 4; x += 2) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.9, 6), fenceMat);
      post.position.set(x, 0.45, 2.5);
      pastureGroup.add(post);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.06, 0.04), fenceMat);
    rail.position.set(0, 0.65, 2.5);
    pastureGroup.add(rail);

    // Spawn 3 quirky Origami Sheep
    const sheepConfigs = [
      { x: -1.8, z: 0.5, rotY: 0.4 },
      { x: 0.8, z: -0.6, rotY: -1.2 },
      { x: 2.2, z: 1.2, rotY: 2.1 }
    ];

    sheepConfigs.forEach((cfg, idx) => {
      const sheep = this.createOrigamiSheep(cfg.x, 0, cfg.z, cfg.rotY, idx);
      pastureGroup.add(sheep.group);
      this.sheepFlock.push(sheep);
    });

    this.scene.add(pastureGroup);
  }

  private createOrigamiSheep(x: number, y: number, z: number, rotY: number, idx: number): OrigamiSheep {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    const woolMat = new THREE.MeshLambertMaterial({ color: 0xf5f6fa, flatShading: true });
    const faceMat = new THREE.MeshLambertMaterial({ color: 0x2f3640, flatShading: true });
    const earMat = new THREE.MeshLambertMaterial({ color: 0x1e272e, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const legMat = new THREE.MeshLambertMaterial({ color: 0x353b48, flatShading: true });

    // Fluffy cloud-like Dodecahedron body
    const bodyGeo = new THREE.DodecahedronGeometry(0.72, 1);
    const body = new THREE.Mesh(bodyGeo, woolMat);
    body.position.y = 0.82;
    body.scale.set(1.0, 0.85, 1.3);
    body.castShadow = true;
    group.add(body);

    // Head Group (moves when grazing / fainting)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.95, 0.8);

    const headGeo = new THREE.BoxGeometry(0.38, 0.42, 0.48);
    const head = new THREE.Mesh(headGeo, faceMat);
    head.position.set(0, 0, 0.1);
    headGroup.add(head);

    // Big Googly Origami Eyes!
    for (const eyeX of [-0.14, 0.14]) {
      const eyeWhite = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), eyeMat);
      eyeWhite.position.set(eyeX, 0.08, 0.35);
      const pupil = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.04), pupilMat);
      pupil.position.set(eyeX, 0.08, 0.355);
      headGroup.add(eyeWhite, pupil);
    }

    // Droopy Origami Ears
    const earGeo = new THREE.BoxGeometry(0.3, 0.06, 0.14);
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.28, 0.1, 0);
    leftEar.rotation.z = -0.3;
    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.28, 0.1, 0);
    rightEar.rotation.z = 0.3;
    headGroup.add(leftEar, rightEar);

    group.add(headGroup);

    // 4 Stick Legs
    const legs: THREE.Mesh[] = [];
    const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.6, 6);
    const legPositions = [
      [-0.26, 0.3, 0.45],
      [0.26, 0.3, 0.45],
      [-0.26, 0.3, -0.45],
      [0.26, 0.3, -0.45]
    ];

    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      group.add(leg);
      legs.push(leg);
    });

    return {
      group,
      headGroup,
      legs,
      state: 'grazing',
      timer: 0,
      baseY: y,
      baseRotY: rotY,
      chewPhase: idx * 1.5
    };
  }

  // TRIGGER: Neighbor's car alarm blares, hazards flash, car bounces!
  public triggerCarAlarm() {
    this.carAlarmActive = true;
    this.carAlarmTimer = 5.2;

    // Splitter neighboring fence posts
    if (this.damagedFencePosts.length > 0) {
      this.damagedFencePosts.forEach((post, i) => {
        post.rotation.z = 0.35 * (i % 2 === 0 ? 1 : -1);
        post.position.y = 0.4;
      });
    }
  }

  // TRIGGER: Fainting sheep panic, yell "Määäh?!" and keel over sideways with stiff legs!
  public triggerFaintingSheep() {
    sound.playSheepBaa(true);

    this.sheepFlock.forEach((sheep, i) => {
      // Stagger slight timing between sheep for maximum comedic effect
      setTimeout(() => {
        sheep.state = 'fainting';
        sheep.timer = 0;
      }, i * 140);
    });
  }

  private createTree(x: number, y: number, z: number) {
    const treeGroup = new THREE.Group();
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6e4726, flatShading: true });
    const leafMat = new THREE.MeshLambertMaterial({
      color: Math.random() > 0.5 ? 0x5a8a3c : 0x4d7c32,
      flatShading: true
    });

    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.5, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const crown1Geo = new THREE.DodecahedronGeometry(2.4, 1);
    const crown1 = new THREE.Mesh(crown1Geo, leafMat);
    crown1.position.y = 4.2;
    crown1.castShadow = true;
    treeGroup.add(crown1);

    const crown2Geo = new THREE.DodecahedronGeometry(1.8, 1);
    const crown2 = new THREE.Mesh(crown2Geo, leafMat);
    crown2.position.set(0.3, 5.8, 0.2);
    crown2.castShadow = true;
    treeGroup.add(crown2);

    const scale = 0.85 + Math.random() * 0.4;
    treeGroup.scale.set(scale, scale, scale);
    treeGroup.position.set(x, y, z);
    this.scene.add(treeGroup);
  }

  private createFence(startX: number, startZ: number, length: number) {
    const fenceGroup = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0xeeece5, flatShading: true });

    const postCount = Math.floor(length / 1.4);
    for (let i = 0; i < postCount; i++) {
      const postGeo = new THREE.BoxGeometry(0.12, 1.1, 0.05);
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(startX + i * 1.4, 0.55, startZ);
      post.castShadow = true;
      fenceGroup.add(post);

      // Save posts near neighbor driveway to wobble/break on impact
      if (startX + i * 1.4 > 8) {
        this.damagedFencePosts.push(post);
      }
    }

    const railGeo = new THREE.BoxGeometry(length, 0.08, 0.04);
    const railTop = new THREE.Mesh(railGeo, postMat);
    railTop.position.set(startX + length / 2, 0.8, startZ);
    const railBottom = new THREE.Mesh(railGeo, postMat);
    railBottom.position.set(startX + length / 2, 0.35, startZ);
    fenceGroup.add(railTop, railBottom);

    this.scene.add(fenceGroup);
  }

  private createDaisies() {
    const flowerGroup = new THREE.Group();
    const petalMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const centerMat = new THREE.MeshLambertMaterial({ color: 0xffd23f, flatShading: true });

    for (let i = 0; i < 40; i++) {
      const fx = (Math.random() - 0.5) * 40;
      const fz = (Math.random() - 0.5) * 40;
      if (Math.abs(fx) < 3 && Math.abs(fz) < 3) continue;

      const f = new THREE.Group();
      const centerGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 6);
      const center = new THREE.Mesh(centerGeo, centerMat);
      f.add(center);

      const petalGeo = new THREE.BoxGeometry(0.26, 0.02, 0.08);
      for (let p = 0; p < 5; p++) {
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.rotation.y = (p * Math.PI * 2) / 5;
        f.add(petal);
      }

      f.position.set(fx, 0.05, fz);
      f.rotation.y = Math.random() * Math.PI;
      flowerGroup.add(f);
    }
    this.scene.add(flowerGroup);
  }

  private buildClouds() {
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      flatShading: true,
      transparent: true,
      opacity: 0.88
    });

    for (let i = 0; i < 8; i++) {
      const cloudGroup = new THREE.Group();
      const puffCount = 4 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffCount; p++) {
        const puffGeo = new THREE.DodecahedronGeometry(3 + Math.random() * 2.5, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(
          (p - puffCount / 2) * 2.8 + (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.8
        );
        cloudGroup.add(puff);
      }

      const cy = 60 + Math.random() * 50;
      const cx = (Math.random() - 0.5) * 200;
      const cz = (Math.random() - 0.5) * 150 - 30;
      cloudGroup.position.set(cx, cy, cz);
      this.clouds.push(cloudGroup);
      this.scene.add(cloudGroup);
    }
  }

  public update(delta: number) {
    // 1. Slowly drift clouds across the sky
    this.clouds.forEach(cloud => {
      cloud.position.x += 1.8 * delta;
      if (cloud.position.x > 140) {
        cloud.position.x = -140;
      }
    });

    // 2. Neighbor Car Alarm Animation: flashing hazard lights & bouncing car!
    if (this.carAlarmActive && this.neighborCarGroup) {
      this.carAlarmTimer -= delta;

      // 5Hz frantic hazard flashing
      const flash = Math.sin(Date.now() * 0.02) > 0;
      const hazardColor = flash ? 0xffaa00 : 0x3d2800;
      this.carBlinkers.forEach(b => {
        (b.material as THREE.MeshBasicMaterial).color.setHex(hazardColor);
      });

      // Car springs jolt & bounce
      this.neighborCarGroup.position.y = 0.55 + Math.sin(Date.now() * 0.035) * 0.05;
      this.neighborCarGroup.rotation.z = Math.sin(Date.now() * 0.025) * 0.03;

      if (this.carAlarmTimer <= 0) {
        this.carAlarmActive = false;
        this.carBlinkers.forEach(b => {
          (b.material as THREE.MeshBasicMaterial).color.setHex(0x4a3000);
        });
        this.neighborCarGroup.position.y = 0.55;
        this.neighborCarGroup.rotation.z = 0;
      }
    }

    // 3. Fainting Sheep Animation & Life Cycle
    this.sheepBaaTimer -= delta;
    if (this.sheepBaaTimer <= 0) {
      this.sheepBaaTimer = 10 + Math.random() * 12;
      // Gentle occasional baa if peaceful
      const grazingSheep = this.sheepFlock.find(s => s.state === 'grazing');
      if (grazingSheep) {
        sound.playSheepBaa(false);
      }
    }

    this.sheepFlock.forEach(sheep => {
      sheep.chewPhase += delta * 3.5;

      if (sheep.state === 'grazing') {
        // Calm head bobbing while eating fresh grass
        sheep.headGroup.rotation.x = 0.35 + Math.sin(sheep.chewPhase) * 0.12;
        sheep.group.rotation.z = THREE.MathUtils.lerp(sheep.group.rotation.z, 0, 0.1);
        sheep.group.position.y = THREE.MathUtils.lerp(sheep.group.position.y, sheep.baseY, 0.1);
        sheep.legs.forEach(leg => {
          leg.rotation.z = THREE.MathUtils.lerp(leg.rotation.z, 0, 0.1);
        });
      } else if (sheep.state === 'fainting') {
        // Dramatic fainting goat drop: legs go completely stiff, body keels 90° sideways!
        sheep.timer += delta;
        const keelProgress = Math.min(1.0, sheep.timer * 4.0);

        sheep.group.rotation.z = keelProgress * (Math.PI / 2); // 90 degree sideways flop
        sheep.group.position.y = sheep.baseY - keelProgress * 0.45; // resting flat on grass

        // Stick legs poke stiffly out into the air!
        sheep.legs.forEach((leg, idx) => {
          leg.rotation.z = (idx % 2 === 0 ? 0.35 : -0.35);
        });
        sheep.headGroup.rotation.x = -0.2; // surprised face looking up

        if (sheep.timer > 4.5) {
          sheep.state = 'recovering';
          sheep.timer = 0;
        }
      } else if (sheep.state === 'recovering') {
        // Sheep wiggles legs, rolls back onto feet, shakes head and returns to grazing!
        sheep.timer += delta;
        const getUpProgress = Math.min(1.0, sheep.timer * 2.5);

        sheep.group.rotation.z = (1 - getUpProgress) * (Math.PI / 2);
        sheep.group.position.y = sheep.baseY - (1 - getUpProgress) * 0.45;

        // Little leg kick before standing
        sheep.legs.forEach(leg => {
          leg.rotation.z = Math.sin(sheep.timer * 12) * 0.2;
        });

        if (sheep.timer > 0.8) {
          sheep.state = 'grazing';
          sheep.timer = 0;
        }
      }
    });
  }
}
