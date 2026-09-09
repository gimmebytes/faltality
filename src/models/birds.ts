import * as THREE from 'three';
import { sound } from '../sound';

export type BirdType = 'goose' | 'pigeon' | 'seagull' | 'drone' | 'airplane';

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
  radius: number;
  alive: boolean;
  hitVelocity: THREE.Vector3;
  parachuteMesh?: THREE.Group;
  scoreValue: number;
  title: string;
  contrailMesh?: THREE.Group;
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
    // 1. Origami Pigeons flying low and close (3.5m - 6.5m altitude, Z between -8 and -16)
    this.spawnBird('pigeon', 4.0, -10, -10);
    this.spawnBird('pigeon', 5.5, 12, -14);
    this.spawnBird('pigeon', 6.2, -22, -12);

    // 2. Origami Cranes flying medium height right over the lawn (8m - 14m altitude, Z between -12 and -22)
    this.spawnBird('goose', 9.0, 0, -16);
    this.spawnBird('goose', 12.5, -18, -20);
    this.spawnBird('goose', 14.0, 24, -18);

    // 3. Origami Seagulls in higher air (17m - 26m altitude, Z between -15 and -26)
    this.spawnBird('seagull', 19.0, -15, -22);
    this.spawnBird('seagull', 24.0, 18, -25);

    // 4. Origami Stealth Flieger humming at top altitude (32m - 40m altitude)
    this.spawnBird('drone', 34.0, 5, -22);

    // 5. THE AIRLINER: Faltality Airlines FL-404 cruising majestically in the clouds!
    this.spawnBird('airplane', 28.0, -35, -24);
  }

  public spawnBird(type: BirdType, altitude: number, startX?: number, startZ?: number): BirdData {
    const group = new THREE.Group();
    let leftWing: THREE.Object3D;
    let rightWing: THREE.Object3D;
    let head: THREE.Object3D;
    let radius = 1.4;
    let speed = 4.5;
    let scoreValue = 100;
    let title = 'Origami-Taube';
    let contrailMesh: THREE.Group | undefined;

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
      contrailMesh = parts.contrails;
      group.scale.set(2.4, 2.4, 2.4);
      radius = 3.2;
      speed = 8.0;
      scoreValue = 2500;
      title = '✈️ Faltality Airlines Flug FL-404';
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

    const x = startX !== undefined ? startX : (Math.random() > 0.5 ? -60 : 60);
    const z = startZ !== undefined ? startZ : (-10 - Math.random() * 16);
    group.position.set(x, altitude, z);

    const dir = (startX !== undefined ? (Math.random() > 0.5 ? 1 : -1) : (x < 0 ? 1 : -1));
    group.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;

    this.scene.add(group);

    const bird: BirdData = {
      mesh: group,
      type,
      baseAltitude: altitude,
      speed: speed * dir,
      wingAngle: Math.random() * Math.PI,
      wingSpeed: type === 'airplane' ? 0.2 : (type === 'drone' ? 18 : (type === 'pigeon' ? 12 : 8)),
      leftWing,
      rightWing,
      head,
      radius,
      alive: true,
      hitVelocity: new THREE.Vector3(),
      scoreValue,
      title,
      contrailMesh
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
    const whiteFuselage = new THREE.MeshLambertMaterial({ color: 0xfafafa, flatShading: true, side: THREE.DoubleSide });
    const blueAirline = new THREE.MeshLambertMaterial({ color: 0x0984e3, flatShading: true, side: THREE.DoubleSide });
    const engineMat = new THREE.MeshLambertMaterial({ color: 0x636e72, flatShading: true, side: THREE.DoubleSide });

    // Long octagonal folded fuselage
    const fuselageGeo = new THREE.CylinderGeometry(0.35, 0.3, 3.4, 6);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, whiteFuselage);
    bodyGroup.add(fuselage);

    // Folded Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.35, 0.8, 6);
    noseGeo.rotateX(Math.PI / 2);
    noseGeo.translate(0, 0, 2.1);
    const nose = new THREE.Mesh(noseGeo, blueAirline);
    bodyGroup.add(nose);

    // Folded Vertical Tail Fin (Rudder)
    const finVerts = [
      [0, 0.3, -1.0], [0, 1.2, -1.6], [0, 0.2, -1.7], [0.06, 0.3, -1.2], [-0.06, 0.3, -1.2]
    ];
    const finIndices = [[0, 3, 1], [0, 1, 4], [1, 3, 2], [1, 2, 4]];
    const fin = new THREE.Mesh(this.createFoldedFacetGeo(finVerts, finIndices), blueAirline);
    bodyGroup.add(fin);

    // Swept Airliner Wings with Engines
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.3, 0.0, 0.2);
    const lWingVerts = [[0, 0, 0.7], [0, 0, -0.6], [-2.5, 0.2, -0.8], [-2.0, 0.35, -0.7]];
    const lWingIndices = [[0, 2, 1], [2, 3, 1]];
    const lWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(lWingVerts, lWingIndices), whiteFuselage);
    leftWingGroup.add(lWingMesh);

    // Jet Engine Left
    const lEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 5), engineMat);
    lEngine.rotation.x = Math.PI / 2;
    lEngine.position.set(-1.0, -0.2, -0.1);
    leftWingGroup.add(lEngine);

    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.3, 0.0, 0.2);
    const rWingVerts = [[0, 0, 0.7], [0, 0, -0.6], [2.5, 0.2, -0.8], [2.0, 0.35, -0.7]];
    const rWingIndices = [[0, 1, 2], [2, 1, 3]];
    const rWingMesh = new THREE.Mesh(this.createFoldedFacetGeo(rWingVerts, rWingIndices), whiteFuselage);
    rightWingGroup.add(rWingMesh);

    // Jet Engine Right
    const rEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 5), engineMat);
    rEngine.rotation.x = Math.PI / 2;
    rEngine.position.set(1.0, -0.2, -0.1);
    rightWingGroup.add(rEngine);

    bodyGroup.add(leftWingGroup, rightWingGroup);

    // White Contrails
    const contrails = new THREE.Group();
    const trailMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.6, gapSize: 0.3, linewidth: 2 });
    for (const xOff of [-1.0, 1.0]) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(xOff, -0.2, -0.4),
        new THREE.Vector3(xOff, -0.2, -4.5)
      ]);
      const line = new THREE.Line(lineGeo, trailMat);
      line.computeLineDistances();
      contrails.add(line);
    }
    bodyGroup.add(contrails);

    return { bodyGroup, leftWing: leftWingGroup, rightWing: rightWingGroup, head: nose, contrails };
  }

  // Origami Confetti, Paper Shreds & Luggage Explosion when hit
  public spawnPaperExplosion(pos: THREE.Vector3, birdType: BirdType) {
    const shredGroup = new THREE.Group();
    shredGroup.position.copy(pos);

    const colors = birdType === 'airplane'
      ? [0x0984e3, 0xff7675, 0xfdcb6e, 0x00cec9, 0xffffff] // colorful luggage bags!
      : birdType === 'goose' 
      ? [0xfaf9f5, 0xcc2222, 0xe8e5dc]
      : birdType === 'pigeon'
      ? [0x758aa2, 0x4b6584, 0xf78fb3]
      : birdType === 'seagull'
      ? [0xffffff, 0xf6b93b, 0xd2dae2]
      : [0x1e272e, 0x00d2d3, 0x576574];

    const shredCount = birdType === 'airplane' ? 45 : 28;
    const shreds: { mesh: THREE.Mesh; vel: THREE.Vector3; rotVel: THREE.Vector3 }[] = [];

    for (let i = 0; i < shredCount; i++) {
      let geo: THREE.BufferGeometry;
      if (birdType === 'airplane' && i % 3 === 0) {
        // Cute miniature origami suitcase!
        geo = new THREE.BoxGeometry(0.3, 0.2, 0.15);
      } else {
        const isTri = Math.random() > 0.5;
        geo = isTri 
          ? new THREE.ConeGeometry(0.25, 0.45, 3) 
          : new THREE.PlaneGeometry(0.35, 0.35);
      }

      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() * 10) + 4,
        (Math.random() - 0.5) * 18
      );

      const rotVel = new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18
      );

      shredGroup.add(mesh);
      shreds.push({ mesh, vel, rotVel });
    }

    shredGroup.userData = { shreds, age: 0, maxAge: 2.8 };
    this.scene.add(shredGroup);
    this.paperShreds.push(shredGroup);
  }

  // Giant Origami parachute
  public attachParachute(bird: BirdData) {
    const chuteGroup = new THREE.Group();
    const clothMat = new THREE.MeshLambertMaterial({
      color: bird.type === 'airplane' ? 0x0984e3 : (bird.type === 'goose' ? 0xff4757 : (bird.type === 'drone' ? 0x00d2d3 : 0x2ed573)),
      side: THREE.DoubleSide,
      flatShading: true
    });

    const chuteRadius = bird.type === 'airplane' ? 3.0 : 1.5;
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
      new THREE.Vector3(0, chuteRadius * 0.9, chuteRadius * 0.75)
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
    if (bird.type === 'airplane') {
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

        if (bird.type !== 'airplane') {
          const flap = Math.sin(bird.wingAngle) * (bird.type === 'drone' ? 0.25 : 0.65);
          bird.leftWing.rotation.z = flap;
          bird.rightWing.rotation.z = -flap;
          bird.head.rotation.x = Math.sin(bird.wingAngle * 0.6) * 0.12;
          bird.mesh.position.y = bird.baseAltitude + Math.sin(bird.wingAngle * 0.7) * 0.35;
        } else {
          // Airliner gentle bank and cloud cruising
          bird.mesh.rotation.z = Math.sin(bird.mesh.position.x * 0.05) * 0.08;
          bird.mesh.position.y = bird.baseAltitude + Math.sin(bird.mesh.position.x * 0.08) * 0.4;
        }

        // Wrap around when flying offscreen - maintain correct forward heading!
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

        if (bird.mesh.position.y <= 0.5) {
          this.scene.remove(bird.mesh);
          this.birds.splice(i, 1);
          setTimeout(() => {
            this.spawnBird(bird.type, bird.baseAltitude);
          }, 1500 + Math.random() * 1500);
        }
      }
    }

    // Update Paper Shreds explosion
    for (let i = this.paperShreds.length - 1; i >= 0; i--) {
      const group = this.paperShreds[i];
      group.userData.age += delta;

      const shreds = group.userData.shreds as { mesh: THREE.Mesh; vel: THREE.Vector3; rotVel: THREE.Vector3 }[];
      for (const s of shreds) {
        s.vel.y -= 7.5 * delta;
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
