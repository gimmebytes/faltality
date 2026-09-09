import * as THREE from 'three';
import { sound } from '../sound';

export type BirdType = 'goose' | 'pigeon' | 'seagull' | 'drone' | 'airplane' | 'satellite';

export interface BirdData {
  mesh: THREE.Group;
  type: BirdType;
  baseAltitude: number;
  speed: number;
  wingAngle: number;
  wingSpeed: number;
  leftWing: THREE.Object3D;
  rightWing: THREE.Object3D;
  head: THREE.Object3D;
  beaconMesh?: THREE.Mesh;
  radius: number;
  alive: boolean;
  hitVelocity: THREE.Vector3;
  parachuteMesh?: THREE.Group;
  scoreValue: number;
  title: string;
}

export class BirdManager {
  public birds: BirdData[] = [];
  private scene: THREE.Scene;
  private paperShreds: THREE.Group[] = [];
  private chirpTimer: number = 2.0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Spawn initial flocks clearly visible across the garden sky!
  public initFlocks() {
    // 1. Origami Pigeons flying low and close (3.5m - 6.5m altitude, Z between -8 and -14)
    this.spawnBird('pigeon', 4.0, -10, -10);
    this.spawnBird('pigeon', 5.5, 12, -14);
    this.spawnBird('pigeon', 6.2, -22, -12);

    // 2. Origami Cranes flying medium height right over the lawn (8m - 13m altitude, Z between -12 and -18)
    this.spawnBird('goose', 8.5, 0, -15);
    this.spawnBird('goose', 11.5, -18, -17);
    this.spawnBird('goose', 13.0, 22, -16);

    // 3. Origami Seagulls in higher air (15m - 20m altitude, Z between -15 and -22)
    this.spawnBird('seagull', 16.0, -15, -18);
    this.spawnBird('seagull', 19.5, 18, -20);

    // 4. Origami Stealth Flieger humming at top altitude (26m - 32m altitude)
    this.spawnBird('drone', 27.0, 5, -20);

    // 5. COMMERCIAL AIRLINERS: Two Faltality Airlines jets cruising majestically!
    this.spawnBird('airplane', 18.5, -15, -19);
    this.spawnBird('airplane', 24.0, 20, -22);

    // NOTE: Tim Cook Satellite is NOT spawned by default!
    // It is an exclusive Endgame easter egg that only enters orbit once the player reaches 11+ folds!
  }

  // Dynamically launch the Keynote Satellite into orbit when 11+ folds reached!
  public ensureSatelliteSpawned(): BirdData {
    const existing = this.birds.find(b => b.type === 'satellite' && b.alive);
    if (existing) return existing;
    return this.spawnBird('satellite', 22.5, 0, -14.5);
  }

  // Remove the satellite when player resets paper back to 0 folds
  public despawnSatellite() {
    for (let i = this.birds.length - 1; i >= 0; i--) {
      if (this.birds[i].type === 'satellite') {
        this.scene.remove(this.birds[i].mesh);
        this.birds.splice(i, 1);
      }
    }
  }

  public spawnBird(type: BirdType, altitude: number, startX?: number, startZ?: number): BirdData {
    const group = new THREE.Group();
    let leftWing: THREE.Object3D;
    let rightWing: THREE.Object3D;
    let head: THREE.Object3D;
    let beaconMesh: THREE.Mesh | undefined;
    let radius = 1.4;
    let speed = 4.5;
    let scoreValue = 100;
    let title = 'Origami-Taube';

    if (type === 'goose') {
      const parts = this.createOrigamiCrane();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(1.9, 1.9, 1.9);
      radius = 1.8;
      speed = 6.0 + Math.random() * 2.0;
      scoreValue = 250;
      title = 'Japanischer Origami-Kranich';
    } else if (type === 'pigeon') {
      const parts = this.createOrigamiPigeon();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(1.6, 1.6, 1.6);
      radius = 1.3;
      speed = 4.5 + Math.random() * 1.5;
      scoreValue = 100;
      title = 'Origami-Stadttaube';
    } else if (type === 'seagull') {
      const parts = this.createOrigamiSeagull();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(1.8, 1.8, 1.8);
      radius = 1.8;
      speed = 7.5 + Math.random() * 2.5;
      scoreValue = 400;
      title = 'Origami-Küstenseemöwe';
    } else if (type === 'airplane') {
      const parts = this.createOrigamiAirplane();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(3.4, 3.4, 3.4);
      radius = 4.2;
      speed = 8.5;
      scoreValue = 2500;
      title = '✈️ Faltality Airlines Flug FL-404';
    } else if (type === 'satellite') {
      const parts = this.createOrigamiSatellite();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      beaconMesh = parts.beacon;
      group.scale.set(4.8, 4.8, 4.8);
      radius = 5.5; // Very generous target radius
      speed = 3.6;
      scoreValue = 10000;
      title = '🛰️ Tim Cook Keynote-Satellit (iSat One)';
    } else {
      // High-End Origami Drone / Stealth Dart
      const parts = this.createOrigamiStealthDart();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(2.2, 2.2, 2.2);
      radius = 2.2;
      speed = 9.5;
      scoreValue = 1000;
      title = 'iFold Origami Stealth Dart';
    }

    const x = startX !== undefined ? startX : (Math.random() > 0.5 ? -55 : 55);
    const z = startZ !== undefined ? startZ : (-14 - Math.random() * 8);
    group.position.set(x, altitude, z);

    const dir = (startX !== undefined ? 1 : (x < 0 ? 1 : -1));
    group.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;

    this.scene.add(group);

    const bird: BirdData = {
      mesh: group,
      type,
      baseAltitude: altitude,
      speed: speed * dir,
      wingAngle: Math.random() * Math.PI,
      wingSpeed: (type === 'airplane' || type === 'satellite') ? 0.1 : (type === 'drone' ? 18 : (type === 'pigeon' ? 12 : 8)),
      leftWing,
      rightWing,
      head,
      beaconMesh,
      radius,
      alive: true,
      hitVelocity: new THREE.Vector3(),
      scoreValue,
      title
    };

    this.birds.push(bird);
    return bird;
  }

  // Helper: Create folded custom triangular buffer geometry
  private createFoldedFacetGeo(vertices: number[][], indices: number[][]): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const posList: number[] = [];

    for (const tri of indices) {
      for (const vi of tri) {
        posList.push(vertices[vi][0], vertices[vi][1], vertices[vi][2]);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(posList, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // 1. Japanese Origami Crane (Orizuru)
  private createOrigamiCrane() {
    const bodyGroup = new THREE.Group();

    const whiteWashi = new THREE.MeshLambertMaterial({ color: 0xfaf9f5, flatShading: true, side: THREE.DoubleSide });
    const redAccent = new THREE.MeshLambertMaterial({ color: 0xcc2222, flatShading: true, side: THREE.DoubleSide });
    const foldShadow = new THREE.MeshLambertMaterial({ color: 0xe8e5dc, flatShading: true, side: THREE.DoubleSide });

    const bodyVerts = [
      [0, 0.45, 0], [0, -0.45, 0], [0, 0.05, 0.65], [0, 0.05, -0.65], [0.35, 0.1, 0], [-0.35, 0.1, 0]
    ];
    const bodyIndices = [
      [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
      [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]
    ];
    const bodyGeo = this.createFoldedFacetGeo(bodyVerts, bodyIndices);
    const body = new THREE.Mesh(bodyGeo, whiteWashi);
    bodyGroup.add(body);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.05, 0.6);

    const neckVerts = [[0, 0, 0], [0, 0.9, 0.55], [0.08, 0.35, 0.25], [-0.08, 0.35, 0.25]];
    const neckIndices = [[0, 2, 1], [0, 1, 3], [0, 3, 2], [1, 2, 3]];
    const neck = new THREE.Mesh(this.createFoldedFacetGeo(neckVerts, neckIndices), whiteWashi);
    headGroup.add(neck);

    const beakVerts = [[0, 0.9, 0.55], [0, 0.72, 0.85], [0.06, 0.84, 0.65], [-0.06, 0.84, 0.65]];
    const beakIndices = [[0, 2, 1], [0, 1, 3], [0, 3, 2], [1, 2, 3]];
    const beak = new THREE.Mesh(this.createFoldedFacetGeo(beakVerts, beakIndices), redAccent);
    headGroup.add(beak);
    bodyGroup.add(headGroup);

    const tailVerts = [[0, 0.05, -0.6], [0, 0.75, -1.05], [0.08, 0.35, -0.8], [-0.08, 0.35, -0.8]];
    const tailIndices = [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]];
    const tail = new THREE.Mesh(this.createFoldedFacetGeo(tailVerts, tailIndices), foldShadow);
    bodyGroup.add(tail);

    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.3, 0.1, 0);
    const lWingVerts = [[0, 0, 0.4], [0, 0, -0.4], [-1.4, 0.35, 0.1], [-0.8, 0.15, -0.3]];
    const lWingIndices = [[0, 2, 1], [1, 2, 3]];
    const lWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(lWingVerts, lWingIndices), whiteWashi);
    leftWingGroup.add(lWingMesh);

    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.3, 0.1, 0);
    const rWingVerts = [[0, 0, 0.4], [0, 0, -0.4], [1.4, 0.35, 0.1], [0.8, 0.15, -0.3]];
    const rWingIndices = [[0, 1, 2], [1, 3, 2]];
    const rWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(rWingVerts, rWingIndices), whiteWashi);
    rightWingGroup.add(rWingMesh);

    bodyGroup.add(leftWingGroup, rightWingGroup);

    return { bodyGroup, leftWing: leftWingGroup, rightWing: rightWingGroup, head: headGroup };
  }

  // 2. Origami Pigeon
  private createOrigamiPigeon() {
    const bodyGroup = new THREE.Group();
    const slateWashi = new THREE.MeshLambertMaterial({ color: 0x758aa2, flatShading: true, side: THREE.DoubleSide });
    const darkWashi = new THREE.MeshLambertMaterial({ color: 0x4b6584, flatShading: true, side: THREE.DoubleSide });
    const pinkAccent = new THREE.MeshLambertMaterial({ color: 0xf78fb3, flatShading: true, side: THREE.DoubleSide });

    const bodyVerts = [
      [0, 0.35, 0.1], [0, -0.35, 0.1], [0, 0.0, 0.55], [0, 0.1, -0.55], [0.32, 0.05, 0], [-0.32, 0.05, 0]
    ];
    const bodyIndices = [
      [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
      [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]
    ];
    const body = new THREE.Mesh(this.createFoldedFacetGeo(bodyVerts, bodyIndices), slateWashi);
    bodyGroup.add(body);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.15, 0.45);
    const headVerts = [[0, 0, 0], [0, 0.35, 0.25], [0, 0.2, 0.45], [0.12, 0.15, 0.18], [-0.12, 0.15, 0.18]];
    const headIndices = [[0, 3, 1], [0, 1, 4], [1, 3, 2], [1, 2, 4], [0, 4, 3]];
    const head = new THREE.Mesh(this.createFoldedFacetGeo(headVerts, headIndices), pinkAccent);
    headGroup.add(head);
    bodyGroup.add(headGroup);

    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.28, 0.05, 0);
    const lWingVerts = [[0, 0, 0.3], [0, 0, -0.3], [-1.0, 0.2, 0.0], [-0.6, 0.05, -0.35]];
    const lWingIndices = [[0, 2, 1], [1, 2, 3]];
    const lWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(lWingVerts, lWingIndices), darkWashi);
    leftWingGroup.add(lWingMesh);

    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.28, 0.05, 0);
    const rWingVerts = [[0, 0, 0.3], [0, 0, -0.3], [1.0, 0.2, 0.0], [0.6, 0.05, -0.35]];
    const rWingIndices = [[0, 1, 2], [1, 3, 2]];
    const rWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(rWingVerts, rWingIndices), darkWashi);
    rightWingGroup.add(rWingMesh);

    bodyGroup.add(leftWingGroup, rightWingGroup);

    return { bodyGroup, leftWing: leftWingGroup, rightWing: rightWingGroup, head: headGroup };
  }

  // 3. Origami Seagull
  private createOrigamiSeagull() {
    const bodyGroup = new THREE.Group();
    const whiteWashi = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true, side: THREE.DoubleSide });
    const yellowAccent = new THREE.MeshLambertMaterial({ color: 0xf6b93b, flatShading: true, side: THREE.DoubleSide });
    const greyCrease = new THREE.MeshLambertMaterial({ color: 0xd2dae2, flatShading: true, side: THREE.DoubleSide });

    const bodyVerts = [
      [0, 0.25, 0.2], [0, -0.25, 0.2], [0, 0.0, 0.8], [0, 0.05, -0.7], [0.26, 0.0, 0], [-0.26, 0.0, 0]
    ];
    const bodyIndices = [
      [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
      [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]
    ];
    const body = new THREE.Mesh(this.createFoldedFacetGeo(bodyVerts, bodyIndices), whiteWashi);
    bodyGroup.add(body);

    const beakVerts = [[0, 0.08, 0.55], [0, -0.08, 0.55], [0, 0.0, 0.85], [0.08, 0.0, 0.6], [-0.08, 0.0, 0.6]];
    const beakIndices = [[0, 3, 2], [0, 2, 4], [1, 2, 3], [1, 4, 2]];
    const beak = new THREE.Mesh(this.createFoldedFacetGeo(beakVerts, beakIndices), yellowAccent);
    bodyGroup.add(beak);

    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.25, 0.05, 0.1);
    const lWingVerts = [[0, 0, 0.35], [0, 0, -0.3], [-1.7, 0.4, 0.05], [-1.0, 0.2, -0.25]];
    const lWingIndices = [[0, 2, 1], [1, 2, 3]];
    const lWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(lWingVerts, lWingIndices), greyCrease);
    leftWingGroup.add(lWingMesh);

    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.25, 0.05, 0.1);
    const rWingVerts = [[0, 0, 0.35], [0, 0, -0.3], [1.7, 0.4, 0.05], [1.0, 0.2, -0.25]];
    const rWingIndices = [[0, 1, 2], [1, 3, 2]];
    const rWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(rWingVerts, rWingIndices), greyCrease);
    rightWingGroup.add(rWingMesh);

    bodyGroup.add(leftWingGroup, rightWingGroup);

    return { bodyGroup, leftWing: leftWingGroup, rightWing: rightWingGroup, head: beak };
  }

  // 4. Origami Stealth Dart
  private createOrigamiStealthDart() {
    const bodyGroup = new THREE.Group();
    const stealthMat = new THREE.MeshStandardMaterial({
      color: 0x1e272e, roughness: 0.3, metalness: 0.2, flatShading: true, side: THREE.DoubleSide
    });
    const cyanGlow = new THREE.MeshBasicMaterial({ color: 0x00d2d3, side: THREE.DoubleSide });

    const bodyVerts = [
      [0, 0.2, 0.2], [0, -0.15, 0.2], [0, 0.0, 1.4], [0, 0.1, -0.8], [0.35, 0.0, -0.2], [-0.35, 0.0, -0.2]
    ];
    const bodyIndices = [
      [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
      [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]
    ];
    const body = new THREE.Mesh(this.createFoldedFacetGeo(bodyVerts, bodyIndices), stealthMat);
    bodyGroup.add(body);

    const canopyVerts = [[0, 0.32, 0.25], [0, 0.05, 0.8], [0, 0.1, -0.2], [0.12, 0.1, 0.1], [-0.12, 0.1, 0.1]];
    const canopyIndices = [[0, 1, 3], [0, 4, 1], [0, 3, 2], [0, 2, 4]];
    const canopy = new THREE.Mesh(this.createFoldedFacetGeo(canopyVerts, canopyIndices), cyanGlow);
    bodyGroup.add(canopy);

    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.35, 0.0, -0.1);
    const lWingVerts = [[0, 0, 0.8], [0, 0, -0.6], [-1.8, 0.1, -0.7], [-1.2, 0.25, -0.6]];
    const lWingIndices = [[0, 2, 1], [2, 3, 1]];
    const lWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(lWingVerts, lWingIndices), stealthMat);
    leftWingGroup.add(lWingMesh);

    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.35, 0.0, -0.1);
    const rWingVerts = [[0, 0, 0.8], [0, 0, -0.6], [1.8, 0.1, -0.7], [1.2, 0.25, -0.6]];
    const rWingIndices = [[0, 1, 2], [2, 1, 3]];
    const rWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(rWingVerts, rWingIndices), stealthMat);
    rightWingGroup.add(rWingMesh);

    bodyGroup.add(leftWingGroup, rightWingGroup);

    return { bodyGroup, leftWing: leftWingGroup, rightWing: rightWingGroup, head: canopy };
  }

  // 5. Origami Commercial Airliner (Faltality Airlines FL-404)
  private createOrigamiAirplane() {
    const bodyGroup = new THREE.Group();
    const whiteFuselage = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true, side: THREE.DoubleSide });
    const blueAirline = new THREE.MeshLambertMaterial({ color: 0x0984e3, flatShading: true, side: THREE.DoubleSide });
    const redStripe = new THREE.MeshLambertMaterial({ color: 0xe63946, flatShading: true, side: THREE.DoubleSide });
    const engineMat = new THREE.MeshLambertMaterial({ color: 0x2d3436, flatShading: true, side: THREE.DoubleSide });

    // Fuselage: Octagonal folded aerodynamic body
    const fuselageGeo = new THREE.CylinderGeometry(0.38, 0.32, 3.6, 8);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, whiteFuselage);
    bodyGroup.add(fuselage);

    // Folded Blue Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.38, 1.0, 8);
    noseGeo.rotateX(Math.PI / 2);
    noseGeo.translate(0, 0, 2.3);
    const nose = new THREE.Mesh(noseGeo, blueAirline);
    bodyGroup.add(nose);

    // Decorative Red Stripe around fuselage
    const stripeGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.3, 8);
    stripeGeo.rotateX(Math.PI / 2);
    stripeGeo.translate(0, 0, 0.7);
    const stripe = new THREE.Mesh(stripeGeo, redStripe);
    bodyGroup.add(stripe);

    // Folded Vertical Tail Fin (Rudder)
    const finVerts = [
      [0, 0.35, -0.9], [0, 1.35, -1.7], [0, 0.25, -1.8], [0.07, 0.35, -1.1], [-0.07, 0.35, -1.1]
    ];
    const finIndices = [[0, 3, 1], [0, 1, 4], [1, 3, 2], [1, 2, 4]];
    const fin = new THREE.Mesh(this.createFoldedFacetGeo(finVerts, finIndices), blueAirline);
    bodyGroup.add(fin);

    // Horizontal Stabilizers (Heckflügel)
    const horizStabGeo = new THREE.BoxGeometry(1.6, 0.05, 0.4);
    horizStabGeo.translate(0, 0.2, -1.5);
    const horizStab = new THREE.Mesh(horizStabGeo, whiteFuselage);
    bodyGroup.add(horizStab);

    // Swept Airliner Wings with Engines
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.35, 0.0, 0.3);
    const lWingVerts = [[0, 0, 0.8], [0, 0, -0.7], [-2.8, 0.25, -0.9], [-2.3, 0.4, -0.8]];
    const lWingIndices = [[0, 2, 1], [2, 3, 1]];
    const lWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(lWingVerts, lWingIndices), whiteFuselage);
    leftWingGroup.add(lWingMesh);

    // Jet Engine Left
    const lEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.65, 6), engineMat);
    lEngine.rotation.x = Math.PI / 2;
    lEngine.position.set(-1.1, -0.22, -0.1);
    leftWingGroup.add(lEngine);

    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.35, 0.0, 0.3);
    const rWingVerts = [[0, 0, 0.8], [0, 0, -0.7], [2.8, 0.25, -0.9], [2.3, 0.4, -0.8]];
    const rWingIndices = [[0, 1, 2], [2, 1, 3]];
    const rWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(rWingVerts, rWingIndices), whiteFuselage);
    rightWingGroup.add(rWingMesh);

    // Jet Engine Right
    const rEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.65, 6), engineMat);
    rEngine.rotation.x = Math.PI / 2;
    rEngine.position.set(1.1, -0.22, -0.1);
    rightWingGroup.add(rEngine);

    bodyGroup.add(leftWingGroup, rightWingGroup);

    // Thick, High-Visibility 3D White Contrail Trails!
    const trailMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    for (const xOff of [-1.1, 1.1]) {
      const trailGeo = new THREE.CylinderGeometry(0.08, 0.02, 7.5, 4);
      trailGeo.rotateX(Math.PI / 2);
      trailGeo.translate(xOff, -0.22, -4.0);
      const trailMesh = new THREE.Mesh(trailGeo, trailMat);
      bodyGroup.add(trailMesh);
    }

    return { bodyGroup, leftWing: leftWingGroup, rightWing: rightWingGroup, head: nose };
  }

  // 6. TIM COOK KEYNOTE SATELLITE (iSat Keynote One)
  private createOrigamiSatellite() {
    const bodyGroup = new THREE.Group();
    const spaceGray = new THREE.MeshStandardMaterial({
      color: 0x2d3436, roughness: 0.2, metalness: 0.8, flatShading: true
    });
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0984e3, roughness: 0.2, metalness: 0.7, flatShading: true, side: THREE.DoubleSide
    });
    const goldFoil = new THREE.MeshStandardMaterial({
      color: 0xf1c40f, roughness: 0.15, metalness: 0.95, flatShading: true
    });
    const appleWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cyanBeaconMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // Main Satellite Bus (Titanium Space Gray cube)
    const busGeo = new THREE.BoxGeometry(1.3, 1.3, 1.5);
    const bus = new THREE.Mesh(busGeo, spaceGray);
    bodyGroup.add(bus);

    // Gold thermal foil accent wrap
    const foilGeo = new THREE.BoxGeometry(1.35, 0.45, 1.35);
    const foil = new THREE.Mesh(foilGeo, goldFoil);
    bodyGroup.add(foil);

    // Downward Parabolic Keynote Dish (radar link to Apple Park)
    const dishGeo = new THREE.ConeGeometry(1.0, 0.5, 12, 1, true);
    dishGeo.rotateX(-Math.PI / 2);
    dishGeo.translate(0, -0.9, 0);
    const dish = new THREE.Mesh(dishGeo, goldFoil);
    bodyGroup.add(dish);

    // Tim Cook's Keynote Glasses on the front!
    const glassFrameMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftLens = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.19, 12), glassFrameMat);
    leftLens.position.set(-0.3, 0.22, 0.78);
    const rightLens = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.19, 12), glassFrameMat);
    rightLens.position.set(0.3, 0.22, 0.78);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.02), glassFrameMat);
    bridge.position.set(0, 0.22, 0.78);
    bodyGroup.add(leftLens, rightLens, bridge);

    // Glowing Apple Logo Silhouette on Top
    const appleBadge = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), appleWhite);
    appleBadge.position.set(0, 0.7, 0);
    appleBadge.rotation.x = Math.PI / 2;
    bodyGroup.add(appleBadge);

    // Blinking Orbit Beacon on top
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), cyanBeaconMat);
    beacon.position.set(0, 1.0, 0);
    bodyGroup.add(beacon);

    // Left Solar Panel Array (Double wing)
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.75, 0, 0);
    const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9), spaceGray);
    lArm.rotation.z = Math.PI / 2;
    lArm.position.set(-0.45, 0, 0);
    leftWingGroup.add(lArm);
    const lPanel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 0.08), solarMat);
    lPanel.position.set(-2.2, 0, 0);
    leftWingGroup.add(lPanel);

    // Right Solar Panel Array (Double wing)
    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.75, 0, 0);
    const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9), spaceGray);
    rArm.rotation.z = Math.PI / 2;
    rArm.position.set(0.45, 0, 0);
    rightWingGroup.add(rArm);
    const rPanel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 0.08), solarMat);
    rPanel.position.set(2.2, 0, 0);
    rightWingGroup.add(rPanel);

    bodyGroup.add(leftWingGroup, rightWingGroup);

    return { bodyGroup, leftWing: leftWingGroup, rightWing: rightWingGroup, head: dish, beacon };
  }

  // 3D MODELS FOR THE SATELLITE LOOT DROPS:
  // 1. Glossy White AirPods Pro Case
  private createAirPodsProModel(): THREE.Group {
    const g = new THREE.Group();
    const whiteGloss = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.12, metalness: 0.15
    });
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x95a5a6 });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x2ed573 });
    const portMat = new THREE.MeshBasicMaterial({ color: 0x555555 });

    // Case main body (1.4m wide in world space)
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.55), whiteGloss);
    g.add(body);

    // Case opening seam
    const seam = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.04, 0.57), seamMat);
    seam.position.y = 0.18;
    g.add(seam);

    // Green status LED dot
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), ledMat);
    led.position.set(0, -0.06, 0.29);
    g.add(led);

    // USB-C connector on bottom
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.12), portMat);
    port.position.set(0, -0.51, 0);
    g.add(port);

    return g;
  }

  // 2. Desert Titanium iPhone 16 Pro
  private createIPhoneModel(): THREE.Group {
    const g = new THREE.Group();
    const goldTitanium = new THREE.MeshStandardMaterial({
      color: 0xdfba73, roughness: 0.22, metalness: 0.85
    });
    const blackScreen = new THREE.MeshBasicMaterial({ color: 0x0a0b0c });
    const cameraIslandMat = new THREE.MeshStandardMaterial({
      color: 0xc9a45c, roughness: 0.25, metalness: 0.8
    });
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x111122 });

    // Phone chassis (1.8m tall in world space)
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.9, 0.12), goldTitanium);
    g.add(phone);

    // Front Screen
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 1.82), blackScreen);
    screen.position.set(0, 0, 0.065);
    g.add(screen);

    // Dynamic Island Pill
    const island = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.02), lensMat);
    island.position.set(0, 0.76, 0.07);
    g.add(island);

    // Camera Bump on Back
    const bump = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.08), cameraIslandMat);
    bump.position.set(-0.18, 0.58, -0.08);
    g.add(bump);

    // 3 Camera Lenses
    for (const [lx, ly] of [[-0.28, 0.7], [-0.28, 0.46], [-0.09, 0.58]]) {
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 12), lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(lx, ly, -0.13);
      g.add(lens);
    }

    return g;
  }

  // 3. The $19 Apple Polishing Cloth
  private createPolishingClothModel(): THREE.Group {
    const g = new THREE.Group();
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0xdcdde1, roughness: 0.95, metalness: 0.0, side: THREE.DoubleSide
    });
    const logoMat = new THREE.MeshBasicMaterial({ color: 0xa4b0be });

    // The $19 Cloth: Soft fabric square (1.5m x 1.5m)
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5, 2, 2), clothMat);
    g.add(cloth);

    // Embossed Apple Logo in corner
    const logo = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.16, 8), logoMat);
    logo.position.set(0.5, -0.5, 0.01);
    g.add(logo);

    return g;
  }

  // Origami Confetti, Paper Shreds, Luggage & Apple Accessories Explosion when hit
  public spawnPaperExplosion(pos: THREE.Vector3, birdType: BirdType) {
    const shredGroup = new THREE.Group();
    shredGroup.position.copy(pos);

    const shreds: { mesh: THREE.Object3D; vel: THREE.Vector3; rotVel: THREE.Vector3 }[] = [];

    // SPECIAL APPLE SATELLITE LOOT DROPS:
    if (birdType === 'satellite') {
      const dropCount = 42; // 42 gloriously large items!
      for (let i = 0; i < dropCount; i++) {
        let itemGroup: THREE.Group;
        if (i % 3 === 0) {
          itemGroup = this.createAirPodsProModel();
        } else if (i % 3 === 1) {
          itemGroup = this.createIPhoneModel();
        } else {
          itemGroup = this.createPolishingClothModel();
        }

        itemGroup.position.set(
          (Math.random() - 0.5) * 4.0,
          (Math.random() - 0.5) * 3.0,
          (Math.random() - 0.5) * 4.0
        );

        // Fountains outwards and gently towards the camera PoV!
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * 14.0,
          (Math.random() * 8.0) + 3.0,
          (Math.random() * 8.0) // drift forward toward garden camera!
        );

        const rotVel = new THREE.Vector3(
          (Math.random() - 0.5) * 4.0,
          (Math.random() - 0.5) * 6.0,
          (Math.random() - 0.5) * 4.0
        );

        shredGroup.add(itemGroup);
        shreds.push({ mesh: itemGroup, vel, rotVel });
      }

      // Also add sparkling rainbow keynote confetti
      const rainbowColors = [0x61bb46, 0xfdb827, 0xf5821f, 0xe03a3e, 0x963d97, 0x009ddc, 0xffffff];
      for (let i = 0; i < 40; i++) {
        const geo = new THREE.PlaneGeometry(0.5, 0.5);
        const mat = new THREE.MeshBasicMaterial({
          color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
        const vel = new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() * 12) + 4, (Math.random() - 0.5) * 20);
        const rotVel = new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
        shredGroup.add(mesh);
        shreds.push({ mesh, vel, rotVel });
      }

      shredGroup.userData = { shreds, age: 0, maxAge: 8.5, isSatellite: true };
      this.scene.add(shredGroup);
      this.paperShreds.push(shredGroup);
      return;
    }

    // Standard birds and airliner luggage
    let colors: number[];
    if (birdType === 'airplane') {
      colors = [0x0984e3, 0xff7675, 0xfdcb6e, 0x00cec9, 0xffffff];
    } else if (birdType === 'goose') {
      colors = [0xfaf9f5, 0xcc2222, 0xe8e5dc];
    } else if (birdType === 'pigeon') {
      colors = [0x758aa2, 0x4b6584, 0xf78fb3];
    } else if (birdType === 'seagull') {
      colors = [0xffffff, 0xf6b93b, 0xd2dae2];
    } else {
      colors = [0x1e272e, 0x00d2d3, 0x576574];
    }

    const shredCount = birdType === 'airplane' ? 50 : 28;

    for (let i = 0; i < shredCount; i++) {
      let geo: THREE.BufferGeometry;
      if (birdType === 'airplane' && i % 3 === 0) {
        // Cute miniature origami suitcase!
        geo = new THREE.BoxGeometry(0.7, 0.48, 0.36);
      } else {
        const isTri = Math.random() > 0.5;
        geo = isTri 
          ? new THREE.ConeGeometry(0.3, 0.55, 3) 
          : new THREE.PlaneGeometry(0.45, 0.45);
      }

      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        (Math.random() * 12) + 5,
        (Math.random() - 0.5) * 22
      );

      const rotVel = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );

      shredGroup.add(mesh);
      shreds.push({ mesh, vel, rotVel });
    }

    shredGroup.userData = { shreds, age: 0, maxAge: 3.5, isSatellite: false };
    this.scene.add(shredGroup);
    this.paperShreds.push(shredGroup);
  }

  // Giant Origami parachute
  public attachParachute(bird: BirdData) {
    const chuteGroup = new THREE.Group();
    const clothMat = new THREE.MeshLambertMaterial({
      color: bird.type === 'satellite' ? 0xf1c40f : (bird.type === 'airplane' ? 0x0984e3 : (bird.type === 'goose' ? 0xff4757 : (bird.type === 'drone' ? 0x00d2d3 : 0x2ed573))),
      side: THREE.DoubleSide,
      flatShading: true
    });

    const chuteRadius = bird.type === 'satellite' ? 4.5 : (bird.type === 'airplane' ? 3.5 : 1.5);
    const canopyGeo = new THREE.ConeGeometry(chuteRadius, chuteRadius * 0.5, 8, 1, true);
    canopyGeo.rotateX(Math.PI);
    const canopy = new THREE.Mesh(canopyGeo, clothMat);
    canopy.position.y = chuteRadius * 1.1;
    chuteGroup.add(canopy);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x555555 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-chuteRadius * 0.75, chuteRadius * 0.9, 0),
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(chuteRadius * 0.75, chuteRadius * 0.9, 0),
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0, chuteRadius * 0.9, -chuteRadius * 0.75),
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0, chuteRadius * 0.9, -chuteRadius * 0.75)
    ]);
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    chuteGroup.add(lines);

    chuteGroup.scale.set(0.1, 0.1, 0.1);
    bird.mesh.add(chuteGroup);
    bird.parachuteMesh = chuteGroup;
  }

  public hitBird(bird: BirdData, impactVelocity: THREE.Vector3): void {
    if (!bird.alive) return;
    bird.alive = false;

    bird.hitVelocity.copy(impactVelocity).multiplyScalar(0.35);
    bird.hitVelocity.y = Math.max(bird.hitVelocity.y * 0.3, 4.0);

    sound.playHit();
    if (bird.type === 'satellite') {
      sound.playMacStartupChime();
    } else if (bird.type === 'airplane') {
      sound.playPlaneCrash();
    } else if (bird.type === 'goose') {
      sound.playHonk(1.2);
    } else if (bird.type === 'pigeon') {
      sound.playPigeonCoo();
    } else {
      sound.playHonk(1.5);
    }

    this.spawnPaperExplosion(bird.mesh.position, bird.type);
    this.attachParachute(bird);
  }

  public update(delta: number) {
    this.chirpTimer -= delta;
    if (this.chirpTimer <= 0) {
      this.chirpTimer = 6 + Math.random() * 8;
      const livingGoose = this.birds.find(b => b.alive && b.type === 'goose');
      if (livingGoose && Math.abs(livingGoose.mesh.position.x) < 25) {
        sound.playHonk(0.9 + Math.random() * 0.2);
      } else {
        const livingPigeon = this.birds.find(b => b.alive && b.type === 'pigeon');
        if (livingPigeon && Math.abs(livingPigeon.mesh.position.x) < 20) {
          sound.playPigeonCoo();
        }
      }
    }

    for (let i = this.birds.length - 1; i >= 0; i--) {
      const bird = this.birds[i];

      if (bird.alive) {
        bird.mesh.position.x += bird.speed * delta;
        bird.wingAngle += bird.wingSpeed * delta;

        if (bird.type === 'satellite') {
          // Slow dignified space orbit drift and gentle solar panel tilt
          bird.mesh.rotation.y += 0.3 * delta;
          bird.mesh.position.y = bird.baseAltitude + Math.sin(bird.mesh.position.x * 0.08) * 0.3;
          if (bird.beaconMesh) {
            const pulse = (Math.sin(Date.now() * 0.008) + 1) * 0.5;
            bird.beaconMesh.scale.setScalar(0.9 + pulse * 0.7);
          }

          // NEVER LEAVE THE SCREEN: Satellite gracefully cruises back and forth between -26 and +26!
          if (bird.mesh.position.x > 26) {
            bird.mesh.position.x = 26;
            bird.speed = -Math.abs(bird.speed);
          } else if (bird.mesh.position.x < -26) {
            bird.mesh.position.x = -26;
            bird.speed = Math.abs(bird.speed);
          }
        } else if (bird.type === 'airplane') {
          // Airliner gentle bank and cloud cruising
          bird.mesh.rotation.z = Math.sin(bird.mesh.position.x * 0.05) * 0.08;
          bird.mesh.position.y = bird.baseAltitude + Math.sin(bird.mesh.position.x * 0.08) * 0.4;

          if (bird.mesh.position.x > 65) {
            bird.mesh.position.x = -65;
            bird.speed = Math.abs(bird.speed);
            bird.mesh.rotation.y = Math.PI / 2;
          } else if (bird.mesh.position.x < -65) {
            bird.mesh.position.x = 65;
            bird.speed = -Math.abs(bird.speed);
            bird.mesh.rotation.y = -Math.PI / 2;
          }
        } else {
          const flap = Math.sin(bird.wingAngle) * (bird.type === 'drone' ? 0.25 : 0.65);
          bird.leftWing.rotation.z = flap;
          bird.rightWing.rotation.z = -flap;
          bird.head.rotation.x = Math.sin(bird.wingAngle * 0.6) * 0.12;
          bird.mesh.position.y = bird.baseAltitude + Math.sin(bird.wingAngle * 0.7) * 0.35;

          if (bird.mesh.position.x > 65) {
            bird.mesh.position.x = -65;
            bird.speed = Math.abs(bird.speed);
            bird.mesh.rotation.y = Math.PI / 2;
          } else if (bird.mesh.position.x < -65) {
            bird.mesh.position.x = 65;
            bird.speed = -Math.abs(bird.speed);
            bird.mesh.rotation.y = -Math.PI / 2;
          }
        }
      } else {
        bird.hitVelocity.y -= 9.8 * delta * 0.7;
        bird.hitVelocity.x *= 0.98;
        bird.hitVelocity.z *= 0.98;

        bird.mesh.position.addScaledVector(bird.hitVelocity, delta);
        bird.mesh.rotation.z += 1.8 * delta;
        bird.mesh.rotation.x += 1.2 * delta;

        if (bird.parachuteMesh && bird.parachuteMesh.scale.x < 1.0) {
          const s = Math.min(1.0, bird.parachuteMesh.scale.x + delta * 2.5);
          bird.parachuteMesh.scale.set(s, s, s);
        }

        // Quick reliable respawn after hit! (Satellites do not auto-respawn if not 11+ folds)
        if (bird.mesh.position.y <= 1.5) {
          this.scene.remove(bird.mesh);
          this.birds.splice(i, 1);
          if (bird.type !== 'satellite') {
            setTimeout(() => {
              this.spawnBird(bird.type, bird.baseAltitude, 0, -14.5);
            }, 2000);
          }
        }
      }
    }

    // Update Paper Shreds & 3D Loot Explosion
    for (let i = this.paperShreds.length - 1; i >= 0; i--) {
      const group = this.paperShreds[i];
      group.userData.age += delta;

      const isSat = group.userData.isSatellite === true;
      const gravity = isSat ? 3.8 : 7.5; // Soft gentle glide for satellite drops!
      const shreds = group.userData.shreds as { mesh: THREE.Object3D; vel: THREE.Vector3; rotVel: THREE.Vector3 }[];

      for (const s of shreds) {
        s.vel.y -= gravity * delta;
        s.vel.x *= 0.985;
        s.vel.z *= 0.985;
        s.mesh.position.addScaledVector(s.vel, delta);
        s.mesh.rotation.x += s.rotVel.x * delta;
        s.mesh.rotation.y += s.rotVel.y * delta;
        s.mesh.rotation.z += s.rotVel.z * delta;
      }

      if (group.userData.age >= group.userData.maxAge) {
        this.scene.remove(group);
        this.paperShreds.splice(i, 1);
      }
    }
  }
}
