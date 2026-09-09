import * as THREE from 'three';

export class Environment {
  public scene: THREE.Scene;
  public tablePosition: THREE.Vector3 = new THREE.Vector3(0, 1.2, 0);
  private clouds: THREE.Group[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildGarden();
    this.buildClouds();
  }

  private buildGarden() {
    // 1. Soft rolling green grass terrain
    const groundGeo = new THREE.PlaneGeometry(300, 300, 20, 20);
    groundGeo.rotateX(-Math.PI / 2);
    // Add subtle vertex displacement for organic lawn feel
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);
      // Gentle slope upwards in distance
      const y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.4 + (distFromCenter > 50 ? (distFromCenter - 50) * 0.05 : 0);
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

    // Cute Apple mug on table
    const mugGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.22, 10);
    const mugMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(0.7, 1.32, -0.6);
    mug.castShadow = true;
    tableGroup.add(mug);

    this.scene.add(tableGroup);

    // 3. Low-Poly Trees in the background
    const treePositions = [
      [-15, 0, -20],
      [18, 0, -25],
      [-25, 0, 15],
      [28, 0, 18],
      [-35, 0, -10],
      [38, 0, -5],
      [-10, 0, 35],
      [12, 0, 32]
    ];
    treePositions.forEach(([tx, ty, tz]) => {
      this.createTree(tx, ty, tz);
    });

    // 4. White Picket Fence in distance
    this.createFence(-18, -12, 36);

    // 5. Flowers & Daisies scattered around lawn
    this.createDaisies();
  }

  private createTree(x: number, y: number, z: number) {
    const treeGroup = new THREE.Group();
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6e4726, flatShading: true });
    const leafMat = new THREE.MeshLambertMaterial({
      color: Math.random() > 0.5 ? 0x5a8a3c : 0x4d7c32,
      flatShading: true
    });

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.5, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage (stacked low-poly icosahedrons / cones)
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
    }

    // Rails
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
      if (Math.abs(fx) < 3 && Math.abs(fz) < 3) continue; // Keep space around table clear

      const f = new THREE.Group();
      const centerGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 6);
      const center = new THREE.Mesh(centerGeo, centerMat);
      f.add(center);

      // Petals
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
    // Slowly drift clouds across the sky
    this.clouds.forEach(cloud => {
      cloud.position.x += 1.8 * delta;
      if (cloud.position.x > 140) {
        cloud.position.x = -140;
      }
    });
  }
}
