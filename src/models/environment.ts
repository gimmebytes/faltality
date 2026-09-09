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

    // Origami dark green cutting mat on table for contrast with bright white paper
    const matGeo = new THREE.BoxGeometry(1.1, 0.006, 0.85);
    const matMat = new THREE.MeshLambertMaterial({ color: 0x1b4332, flatShading: true });
    const cuttingMat = new THREE.Mesh(matGeo, matMat);
    cuttingMat.position.set(0, 1.203, 0);
    cuttingMat.receiveShadow = true;
    tableGroup.add(cuttingMat);

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

  // Neighbor house, garage driveway, red car with blinkers and wobbly fence
  private buildNeighborProperty() {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(-32, 0, -42);

    // Main House Body
    const houseGeo = new THREE.BoxGeometry(16, 8, 12);
    const houseMat = new THREE.MeshLambertMaterial({ color: 0xf4ece1, flatShading: true });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.set(0, 4, 0);
    house.castShadow = true;
    house.receiveShadow = true;
    houseGroup.add(house);

    // Gabled Roof
    const roofGeo = new THREE.ConeGeometry(12, 4.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xb53b2a, flatShading: true });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 10.2, 0);
    roof.scale.set(1.1, 1, 0.9);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Windows with warm cozy light
    const winGeo = new THREE.PlaneGeometry(1.6, 2.2);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffeaa7 });
    const winCoords = [
      [-4.5, 4.5, 6.05],
      [4.5, 4.5, 6.05],
      [-4.5, 4.5, -6.05],
      [4.5, 4.5, -6.05]
    ];
    winCoords.forEach(([wx, wy, wz]) => {
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(wx, wy, wz);
      if (wz < 0) win.rotateY(Math.PI);
      houseGroup.add(win);
    });

    // Chimney with small puff
    const chimneyGeo = new THREE.BoxGeometry(1.2, 3.2, 1.2);
    const chimneyMat = new THREE.MeshLambertMaterial({ color: 0x8a3828, flatShading: true });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(-4, 11, 2);
    houseGroup.add(chimney);

    // Driveway gravel patch
    const driveGeo = new THREE.PlaneGeometry(10, 16);
    driveGeo.rotateX(-Math.PI / 2);
    const driveMat = new THREE.MeshLambertMaterial({ color: 0x95a5a6, flatShading: true });
    const driveway = new THREE.Mesh(driveGeo, driveMat);
    driveway.position.set(14, 0.05, 4);
    driveway.receiveShadow = true;
    houseGroup.add(driveway);

    // Neighbor's Prized Low-Poly Station Wagon (Car)
    const carGroup = new THREE.Group();
    carGroup.position.set(14, 0.65, 4);
    carGroup.rotateY(-Math.PI * 0.15);

    // Chassis
    const carBodyGeo = new THREE.BoxGeometry(3.2, 1.1, 5.4);
    const carMat = new THREE.MeshLambertMaterial({ color: 0xd63031, flatShading: true });
    const carBody = new THREE.Mesh(carBodyGeo, carMat);
    carBody.position.set(0, 0.6, 0);
    carBody.castShadow = true;
    carGroup.add(carBody);

    // Cabin / Roof
    const carRoofGeo = new THREE.BoxGeometry(2.7, 0.95, 3.0);
    const carGlassMat = new THREE.MeshLambertMaterial({ color: 0x74b9ff, flatShading: true });
    const carRoof = new THREE.Mesh(carRoofGeo, carGlassMat);
    carRoof.position.set(0, 1.5, -0.4);
    carRoof.castShadow = true;
    carGroup.add(carRoof);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x2d3436, flatShading: true });
    const wheelPositions = [
      [-1.55, 0.2, 1.6],
      [1.55, 0.2, 1.6],
      [-1.55, 0.2, -1.6],
      [1.55, 0.2, -1.6]
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    // 4 Orange Hazard Blinkers
    const blinkerGeo = new THREE.BoxGeometry(0.4, 0.25, 0.15);
    const blinkerPositions = [
      [-1.2, 0.7, 2.72],
      [1.2, 0.7, 2.72],
      [-1.2, 0.7, -2.72],
      [1.2, 0.7, -2.72]
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

    this.scene.add(houseGroup);
  }

  // Neighboring sheep pasture with fainting origami sheep
  private buildSheepPasture() {
    const pastureGroup = new THREE.Group();
    pastureGroup.position.set(38, 0, -32);

    // Fence around pasture
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0xdeb887, flatShading: true });
    for (let i = -14; i <= 14; i += 3.5) {
      const postGeo = new THREE.BoxGeometry(0.2, 1.3, 0.2);
      const post = new THREE.Mesh(postGeo, fenceMat);
      post.position.set(i, 0.65, -12);
      pastureGroup.add(post);

      const postFront = new THREE.Mesh(postGeo, fenceMat);
      postFront.position.set(i, 0.65, 12);
      pastureGroup.add(postFront);
    }
    const railGeo = new THREE.BoxGeometry(28, 0.12, 0.08);
    const rail1 = new THREE.Mesh(railGeo, fenceMat);
    rail1.position.set(0, 0.9, -12);
    const rail2 = new THREE.Mesh(railGeo, fenceMat);
    rail2.position.set(0, 0.5, -12);
    pastureGroup.add(rail1, rail2);

    // Create 3 comical low-poly origami sheep
    const sheepConfigs = [
      { x: -5, z: -2, rotY: 0.4 },
      { x: 2, z: 4, rotY: -1.2 },
      { x: 7, z: -4, rotY: 2.1 }
    ];

    this.sheepFlock = sheepConfigs.map((cfg) => {
      const sheepGroup = new THREE.Group();
      sheepGroup.position.set(cfg.x, 0.7, cfg.z);
      sheepGroup.rotateY(cfg.rotY);

      // Fluffy wool body (faceted geometric block)
      const woolGeo = new THREE.BoxGeometry(1.6, 1.2, 2.2);
      const woolMat = new THREE.MeshLambertMaterial({ color: 0xf5f6fa, flatShading: true });
      const body = new THREE.Mesh(woolGeo, woolMat);
      body.castShadow = true;
      sheepGroup.add(body);

      // Black sheep face & ears
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.4, 1.25);

      const headGeo = new THREE.BoxGeometry(0.7, 0.7, 0.9);
      const faceMat = new THREE.MeshLambertMaterial({ color: 0x2f3640, flatShading: true });
      const head = new THREE.Mesh(headGeo, faceMat);
      head.castShadow = true;
      headGroup.add(head);

      // Droopy ears
      const earGeo = new THREE.BoxGeometry(0.5, 0.15, 0.25);
      const earL = new THREE.Mesh(earGeo, faceMat);
      earL.position.set(-0.45, 0.15, -0.1);
      earL.rotateZ(-0.3);
      const earR = new THREE.Mesh(earGeo, faceMat);
      earR.position.set(0.45, 0.15, -0.1);
      earR.rotateZ(0.3);
      headGroup.add(earL, earR);

      sheepGroup.add(headGroup);

      // 4 tiny matchstick legs
      const legGeo = new THREE.BoxGeometry(0.18, 0.8, 0.18);
      const legMat = new THREE.MeshLambertMaterial({ color: 0x2f3640, flatShading: true });
      const legs: THREE.Mesh[] = [];
      const legOffsets = [
        [-0.55, -0.7, 0.7],
        [0.55, -0.7, 0.7],
        [-0.55, -0.7, -0.7],
        [0.55, -0.7, -0.7]
      ];
      legOffsets.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        sheepGroup.add(leg);
        legs.push(leg);
      });

      pastureGroup.add(sheepGroup);

      return {
        group: sheepGroup,
        headGroup,
        legs,
        state: 'grazing',
        timer: 0,
        baseY: 0.7,
        baseRotY: cfg.rotY,
        chewPhase: Math.random() * Math.PI * 2
      };
    });

    this.scene.add(pastureGroup);
  }

  // Trigger neighbor chaos: Car alarm wails, blinkers flash, fence rattles!
  public triggerNeighborCarAlarm() {
    this.carAlarmActive = true;
    this.carAlarmTimer = 8.5; // Alarm runs for 8.5 seconds
    sound.playCarAlarm();

    // Wobbly damaged fence shake effect
    this.damagedFencePosts.forEach((post) => {
      post.rotation.z += (Math.random() - 0.5) * 0.4;
      post.rotation.x += (Math.random() - 0.5) * 0.4;
    });
  }

  public triggerCarAlarm() {
    this.triggerNeighborCarAlarm();
  }

  // Make sheep faint sideways comically like real fainting goats!
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

  private createTree(x: number, y: number, z: number) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x795548, flatShading: true });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const foliageMat = new THREE.MeshLambertMaterial({
      color: 0x4caf50,
      flatShading: true
    });
    const foliageTiers = [
      { radius: 2.2, height: 2.5, y: 2.8 },
      { radius: 1.7, height: 2.2, y: 4.2 },
      { radius: 1.1, height: 1.8, y: 5.4 }
    ];
    foliageTiers.forEach((tier) => {
      const fGeo = new THREE.ConeGeometry(tier.radius, tier.height, 6);
      const fMesh = new THREE.Mesh(fGeo, foliageMat);
      fMesh.position.y = tier.y;
      fMesh.castShadow = true;
      treeGroup.add(fMesh);
    });

    this.scene.add(treeGroup);
  }

  private createFence(startX: number, z: number, length: number) {
    const fenceGroup = new THREE.Group();
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5, flatShading: true });
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

    this.scene.add(fenceGroup);
  }

  private createDaisies() {
    const flowerGroup = new THREE.Group();
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
    const petalMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const centerMat = new THREE.MeshLambertMaterial({ color: 0xffeb3b });

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
    this.scene.add(flowerGroup);
  }

  private buildClouds() {
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      flatShading: true
    });

    for (let i = 0; i < 9; i++) {
      const cloudGroup = new THREE.Group();
      const puffCount = 4 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffCount; p++) {
        const puffSize = 3.5 + Math.random() * 3.5;
        const puffGeo = new THREE.DodecahedronGeometry(puffSize, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set((p - puffCount / 2) * 3.0, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 2.5);
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 260,
        32 + Math.random() * 24,
        -50 - Math.random() * 180
      );
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
        sheep.headGroup.rotation.x = 0.2 + Math.sin(sheep.chewPhase) * 0.12;
      } else if (sheep.state === 'fainting') {
        sheep.timer += delta * 4.5;
        const roll = Math.min(Math.PI / 2, sheep.timer * (Math.PI / 2));
        sheep.group.rotation.z = roll;
        sheep.group.position.y = sheep.baseY - Math.sin(roll) * 0.35;

        sheep.legs.forEach((leg) => {
          leg.rotation.z = -0.4;
        });

        if (sheep.timer >= 1.0) {
          sheep.state = 'down';
          sheep.timer = 4.5; // Lie stiff on back for 4.5s
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
          sheep.legs.forEach((leg) => {
            leg.rotation.z = 0;
          });
        }
      }
    });
  }
}
