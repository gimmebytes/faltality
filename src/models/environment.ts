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

  // Kitchen Aluminium Foil Roll Box on table (unlocked at score threshold)
  private foilBox: THREE.Mesh | null = null;
  private foilLip: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildGarden();
    this.buildNeighborProperty();
    this.buildSheepPasture();
    this.buildClouds();
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
    this.scene.add(ground);

    // 2. Wooden garden table where folding takes place (warm cottage honey wood)
    const tableGroup = new THREE.Group();
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
    const matMat = createToonMaterial({ color: GOOSE_PALETTE.cuttingMat });
    const cuttingMat = new THREE.Mesh(matGeo, matMat);
    cuttingMat.position.set(0, 1.203, 0);
    cuttingMat.receiveShadow = true;
    tableGroup.add(cuttingMat);

    // Cozy rustic red enamel mug on table
    const mugGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.22, 10);
    const mugMat = createToonMaterial({ color: GOOSE_PALETTE.mugEnamel });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(0.7, 1.32, -0.6);
    mug.castShadow = true;

    // Dark coffee inside the mug
    const coffeeGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.02, 10);
    const coffeeMat = createToonMaterial({ color: GOOSE_PALETTE.mugCoffee });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.set(0, 0.09, 0);
    mug.add(coffee);

    tableGroup.add(mug);

    // Kitchen Aluminium Foil Roll Box on table (initially locked, visible when threshold met)
    const foilBoxGeo = new THREE.BoxGeometry(0.55, 0.08, 0.08);
    const foilBoxMat = createToonMaterial({ color: 0x2c3e50 });
    const foilBox = new THREE.Mesh(foilBoxGeo, foilBoxMat);
    foilBox.position.set(-0.68, 1.245, -0.45);
    foilBox.rotation.y = 0.2;
    foilBox.castShadow = true;
    foilBox.visible = false;
    tableGroup.add(foilBox);
    this.foilBox = foilBox;

    // Gleaming silver foil strip peeking out of the dispenser
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
    tableGroup.add(foilLip);
    this.foilLip = foilLip;

    this.scene.add(tableGroup);

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

    this.scene.add(houseGroup);
  }

  // Neighboring sheep pasture with fainting origami sheep
  private buildSheepPasture() {
    const pastureGroup = new THREE.Group();
    pastureGroup.position.set(17, 0, -23);

    // Fence around pasture (rustic cottage wood)
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

    // Create 3 comical stylized 3D sheep
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
        model.rotation.y = Math.PI; // Face forward
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

    this.scene.add(pastureGroup);
  }

  // Reveal or hide aluminium foil dispenser box on table based on unlock state
  public setFoilUnlocked(unlocked: boolean) {
    if (this.foilBox) this.foilBox.visible = unlocked;
    if (this.foilLip) this.foilLip.visible = unlocked;
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

  private createTree(x: number, y: number, z: number, variant: number = 0) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);
    this.scene.add(treeGroup);

    const modelUrl = variant % 2 === 0 ? '/models/tree_oak.glb' : '/models/tree_detailed.glb';
    modelLoader.load(modelUrl).then((tree) => {
      const scale = 5.8 + (variant % 3) * 0.7;
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = variant * 1.6;
      treeGroup.add(tree);
    }).catch(() => {
      // Fallback
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

    this.scene.add(fenceGroup);
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
    this.scene.add(flowerGroup);
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
          sheep.legs?.forEach((leg) => {
            leg.rotation.z = 0;
          });
        }
      }
    });
  }
}
