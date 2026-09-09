import * as THREE from 'three';
import { sound } from '../sound';

export type BirdType = 'goose' | 'pigeon' | 'seagull' | 'drone';

export interface BirdData {
  mesh: THREE.Group;
  type: BirdType;
  baseAltitude: number;
  speed: number;
  wingAngle: number;
  wingSpeed: number;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  head: THREE.Object3D;
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
  private featherParticles: THREE.Points[] = [];
  private chirpTimer: number = 2.0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Spawn initial flocks clearly visible across the garden sky!
  public initFlocks() {
    // 1. Pigeons flying low and close (3.5m - 6.5m altitude, Z between -8 and -16)
    this.spawnBird('pigeon', 4.0, -10, -10);
    this.spawnBird('pigeon', 5.5, 12, -14);
    this.spawnBird('pigeon', 6.2, -22, -12);

    // 2. Geese flying medium height right over the lawn (8m - 14m altitude, Z between -12 and -22)
    this.spawnBird('goose', 9.0, 0, -16);
    this.spawnBird('goose', 12.5, -18, -20);
    this.spawnBird('goose', 14.0, 24, -18);

    // 3. Seagulls in higher air (17m - 26m altitude, Z between -15 and -26)
    this.spawnBird('seagull', 19.0, -15, -22);
    this.spawnBird('seagull', 24.0, 18, -25);

    // 4. Apple iFold Drone humming at top altitude (32m - 40m altitude)
    this.spawnBird('drone', 34.0, 5, -22);
  }

  public spawnBird(type: BirdType, altitude: number, startX?: number, startZ?: number): BirdData {
    const group = new THREE.Group();
    let leftWing: THREE.Mesh;
    let rightWing: THREE.Mesh;
    let head: THREE.Object3D;
    let radius = 1.4;
    let speed = 4.5;
    let scoreValue = 100;
    let title = 'Taube';

    if (type === 'goose') {
      const parts = this.createGooseMesh();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(1.7, 1.7, 1.7);
      radius = 1.8;
      speed = 6.0 + Math.random() * 2.0;
      scoreValue = 250;
      title = 'Freche Garten-Gans';
    } else if (type === 'pigeon') {
      const parts = this.createPigeonMesh();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(1.6, 1.6, 1.6);
      radius = 1.3;
      speed = 4.5 + Math.random() * 1.5;
      scoreValue = 100;
      title = 'Stadttaube';
    } else if (type === 'seagull') {
      const parts = this.createSeagullMesh();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(1.8, 1.8, 1.8);
      radius = 1.8;
      speed = 7.5 + Math.random() * 2.5;
      scoreValue = 400;
      title = 'Küstenseemöwe';
    } else {
      // Drone
      const parts = this.createDroneMesh();
      group.add(parts.bodyGroup);
      leftWing = parts.leftWing;
      rightWing = parts.rightWing;
      head = parts.head;
      group.scale.set(2.0, 2.0, 2.0);
      radius = 2.2;
      speed = 9.0;
      scoreValue = 1000;
      title = 'iFold Apple Delivery Drone';
    }

    const x = startX !== undefined ? startX : (Math.random() > 0.5 ? -55 : 55);
    const z = startZ !== undefined ? startZ : (-10 - Math.random() * 15);
    group.position.set(x, altitude, z);

    // Direction: flying towards opposite side with beak pointing forward!
    const dir = (startX !== undefined ? (Math.random() > 0.5 ? 1 : -1) : (x < 0 ? 1 : -1));
    group.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;

    this.scene.add(group);

    const bird: BirdData = {
      mesh: group,
      type,
      baseAltitude: altitude,
      speed: speed * dir,
      wingAngle: Math.random() * Math.PI,
      wingSpeed: type === 'drone' ? 25 : (type === 'pigeon' ? 14 : 9),
      leftWing,
      rightWing,
      head,
      radius,
      alive: true,
      hitVelocity: new THREE.Vector3(),
      scoreValue,
      title
    };

    this.birds.push(bird);
    return bird;
  }

  // Create an Untitled Goose Game style Goose
  private createGooseMesh() {
    const bodyGroup = new THREE.Group();
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xfcfdfd, flatShading: true });
    const orangeMat = new THREE.MeshLambertMaterial({ color: 0xff7700, flatShading: true });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.7, 8, 6);
    bodyGeo.scale(1.4, 0.75, 0.9);
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    bodyGroup.add(body);

    // Neck and Head
    const headGroup = new THREE.Group();
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.9, 7);
    neckGeo.rotateX(0.4);
    neckGeo.translate(0, 0.45, 0.35);
    const neck = new THREE.Mesh(neckGeo, whiteMat);
    headGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.28, 7, 6);
    headGeo.scale(1.1, 0.9, 1.2);
    headGeo.translate(0, 0.85, 0.65);
    const head = new THREE.Mesh(headGeo, whiteMat);
    headGroup.add(head);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.14, 0.5, 6);
    beakGeo.rotateX(Math.PI / 2);
    beakGeo.translate(0, 0.82, 1.0);
    const beak = new THREE.Mesh(beakGeo, orangeMat);
    headGroup.add(beak);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4);
    const eyeL = new THREE.Mesh(eyeGeo, blackMat);
    eyeL.position.set(0.16, 0.9, 0.7);
    const eyeR = new THREE.Mesh(eyeGeo, blackMat);
    eyeR.position.set(-0.16, 0.9, 0.7);
    headGroup.add(eyeL, eyeR);

    bodyGroup.add(headGroup);

    // Wings
    const wingGeo = new THREE.BoxGeometry(1.2, 0.08, 0.6);
    wingGeo.translate(0.6, 0, 0);
    const leftWing = new THREE.Mesh(wingGeo, whiteMat);
    leftWing.position.set(0.35, 0.1, 0.1);
    leftWing.rotation.y = 0.2;

    const rightWingGeo = new THREE.BoxGeometry(1.2, 0.08, 0.6);
    rightWingGeo.translate(-0.6, 0, 0);
    const rightWing = new THREE.Mesh(rightWingGeo, whiteMat);
    rightWing.position.set(-0.35, 0.1, 0.1);
    rightWing.rotation.y = -0.2;

    bodyGroup.add(leftWing, rightWing);

    // Feet
    const footGeo = new THREE.BoxGeometry(0.15, 0.08, 0.35);
    const footL = new THREE.Mesh(footGeo, orangeMat);
    footL.position.set(0.25, -0.4, -0.5);
    footL.rotation.x = -0.3;
    const footR = new THREE.Mesh(footGeo, orangeMat);
    footR.position.set(-0.25, -0.4, -0.5);
    footR.rotation.x = -0.3;
    bodyGroup.add(footL, footR);

    // Bell on ribbon around goose neck
    const ribbonGeo = new THREE.TorusGeometry(0.24, 0.04, 5, 8);
    ribbonGeo.rotateX(Math.PI / 2);
    ribbonGeo.translate(0, 0.65, 0.48);
    const ribbonMat = new THREE.MeshLambertMaterial({ color: 0xcc2222, flatShading: true });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    const bellGeo = new THREE.SphereGeometry(0.08, 6, 6);
    bellGeo.translate(0, 0.58, 0.7);
    const bellMat = new THREE.MeshLambertMaterial({ color: 0xffd700, flatShading: true });
    const bell = new THREE.Mesh(bellGeo, bellMat);
    headGroup.add(ribbon, bell);

    return { bodyGroup, leftWing, rightWing, head: headGroup };
  }

  // Create cute round Pigeon
  private createPigeonMesh() {
    const bodyGroup = new THREE.Group();
    const greyMat = new THREE.MeshLambertMaterial({ color: 0x7c8c99, flatShading: true });
    const darkGreyMat = new THREE.MeshLambertMaterial({ color: 0x48535c, flatShading: true });
    const greenNeckMat = new THREE.MeshLambertMaterial({ color: 0x4a9375, flatShading: true });
    const pinkMat = new THREE.MeshLambertMaterial({ color: 0xdf8484, flatShading: true });
    const beakMat = new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true });

    const bodyGeo = new THREE.SphereGeometry(0.45, 7, 6);
    bodyGeo.scale(1.2, 0.85, 0.85);
    const body = new THREE.Mesh(bodyGeo, greyMat);
    bodyGroup.add(body);

    const headGroup = new THREE.Group();
    const neckGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.45, 6);
    neckGeo.rotateX(0.3);
    neckGeo.translate(0, 0.25, 0.2);
    const neck = new THREE.Mesh(neckGeo, greenNeckMat);
    headGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.2, 6, 5);
    headGeo.translate(0, 0.45, 0.3);
    const head = new THREE.Mesh(headGeo, greyMat);
    headGroup.add(head);

    const beakGeo = new THREE.ConeGeometry(0.06, 0.2, 5);
    beakGeo.rotateX(Math.PI / 2);
    beakGeo.translate(0, 0.42, 0.52);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    headGroup.add(beak);

    bodyGroup.add(headGroup);

    const wingGeo = new THREE.BoxGeometry(0.8, 0.05, 0.45);
    wingGeo.translate(0.4, 0, 0);
    const leftWing = new THREE.Mesh(wingGeo, darkGreyMat);
    leftWing.position.set(0.2, 0.1, 0.0);

    const rightWingGeo = new THREE.BoxGeometry(0.8, 0.05, 0.45);
    rightWingGeo.translate(-0.4, 0, 0);
    const rightWing = new THREE.Mesh(rightWingGeo, darkGreyMat);
    rightWing.position.set(-0.2, 0.1, 0.0);

    bodyGroup.add(leftWing, rightWing);

    const footGeo = new THREE.BoxGeometry(0.08, 0.05, 0.2);
    const footL = new THREE.Mesh(footGeo, pinkMat);
    footL.position.set(0.12, -0.3, -0.2);
    const footR = new THREE.Mesh(footGeo, pinkMat);
    footR.position.set(-0.12, -0.3, -0.2);
    bodyGroup.add(footL, footR);

    return { bodyGroup, leftWing, rightWing, head: headGroup };
  }

  // Create Seagull
  private createSeagullMesh() {
    const bodyGroup = new THREE.Group();
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x5a6572, flatShading: true });
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xfcc203, flatShading: true });

    const bodyGeo = new THREE.SphereGeometry(0.55, 7, 5);
    bodyGeo.scale(1.5, 0.7, 0.7);
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    bodyGroup.add(body);

    const headGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(0.24, 6, 5);
    headGeo.translate(0, 0.35, 0.5);
    const head = new THREE.Mesh(headGeo, whiteMat);
    headGroup.add(head);

    const beakGeo = new THREE.ConeGeometry(0.08, 0.45, 5);
    beakGeo.rotateX(Math.PI / 2);
    beakGeo.translate(0, 0.35, 0.85);
    const beak = new THREE.Mesh(beakGeo, yellowMat);
    headGroup.add(beak);

    bodyGroup.add(headGroup);

    const wingGeo = new THREE.BoxGeometry(1.6, 0.06, 0.4);
    wingGeo.translate(0.8, 0, 0);
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(0.25, 0.1, 0.0);

    const rightWingGeo = new THREE.BoxGeometry(1.6, 0.06, 0.4);
    rightWingGeo.translate(-0.8, 0, 0);
    const rightWing = new THREE.Mesh(rightWingGeo, wingMat);
    rightWing.position.set(-0.25, 0.1, 0.0);

    bodyGroup.add(leftWing, rightWing);

    return { bodyGroup, leftWing, rightWing, head: headGroup };
  }

  // Create High-Tech Apple "iFold Drone"
  private createDroneMesh() {
    const bodyGroup = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f7, roughness: 0.2, metalness: 0.1, flatShading: true });
    const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.8, roughness: 0.2, flatShading: true });
    const appleGlowMat = new THREE.MeshBasicMaterial({ color: 0x64b5f6 });

    const bodyGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.25, 12);
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    bodyGroup.add(body);

    const ringGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
    ringGeo.rotateX(Math.PI / 2);
    ringGeo.translate(0, 0.13, 0);
    const ring = new THREE.Mesh(ringGeo, appleGlowMat);
    bodyGroup.add(ring);

    for (let i = 0; i < 4; i++) {
      const armAngle = (i * Math.PI) / 2 + Math.PI / 4;
      const armGeo = new THREE.BoxGeometry(0.12, 0.08, 0.9);
      armGeo.translate(0, 0, 0.45);
      armGeo.rotateY(armAngle);
      const arm = new THREE.Mesh(armGeo, titaniumMat);
      bodyGroup.add(arm);

      const podGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 8);
      const px = Math.cos(armAngle - Math.PI / 2) * 0.9;
      const pz = Math.sin(armAngle - Math.PI / 2) * 0.9;
      podGeo.translate(px, 0.08, pz);
      const pod = new THREE.Mesh(podGeo, titaniumMat);
      bodyGroup.add(pod);
    }

    const rotorGeo = new THREE.BoxGeometry(1.6, 0.02, 0.15);
    const leftWing = new THREE.Mesh(rotorGeo, titaniumMat);
    leftWing.position.set(0.65, 0.18, 0.65);

    const rightWing = new THREE.Mesh(rotorGeo, titaniumMat);
    rightWing.position.set(-0.65, 0.18, -0.65);

    bodyGroup.add(leftWing, rightWing);

    return { bodyGroup, leftWing, rightWing, head: ring };
  }

  // Spawn Low-Poly Feather Explosion Particle Effect
  public spawnFeatherExplosion(pos: THREE.Vector3, birdType: BirdType) {
    const featherCount = 35;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(featherCount * 3);
    const velocities: THREE.Vector3[] = [];

    const featherColor = birdType === 'goose' ? 0xffffff :
      birdType === 'pigeon' ? 0x7c8c99 :
      birdType === 'seagull' ? 0xfffaea : 0x00bbff;

    for (let i = 0; i < featherCount; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() * 8) + 2,
          (Math.random() - 0.5) * 12
        )
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: featherColor,
      size: 0.45,
      transparent: true,
      opacity: 0.95
    });

    const points = new THREE.Points(geometry, material);
    points.userData = { velocities, age: 0, maxAge: 2.5 };
    this.scene.add(points);
    this.featherParticles.push(points);
  }

  // Create cute parachute that opens when hit!
  public attachParachute(bird: BirdData) {
    const chuteGroup = new THREE.Group();
    const clothMat = new THREE.MeshLambertMaterial({
      color: bird.type === 'goose' ? 0xff5555 : 0x44aa44,
      side: THREE.DoubleSide,
      flatShading: true
    });

    const canopyGeo = new THREE.SphereGeometry(1.3, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const canopy = new THREE.Mesh(canopyGeo, clothMat);
    canopy.position.y = 1.6;
    chuteGroup.add(canopy);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x333333 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.1, 1.6, 0),
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(1.1, 1.6, 0),
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(0, 1.6, -1.1),
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(0, 1.6, 1.1)
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

    bird.hitVelocity.copy(impactVelocity).multiplyScalar(0.4);
    bird.hitVelocity.y = Math.max(bird.hitVelocity.y * 0.3, 4.0);

    sound.playHit();
    if (bird.type === 'goose') {
      sound.playHonk(1.2);
    } else if (bird.type === 'pigeon') {
      sound.playPigeonCoo();
    } else {
      sound.playHonk(1.5);
    }

    this.spawnFeatherExplosion(bird.mesh.position, bird.type);
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

        if (bird.type === 'drone') {
          bird.leftWing.rotation.y += 35 * delta;
          bird.rightWing.rotation.y += 35 * delta;
        } else {
          const flap = Math.sin(bird.wingAngle) * 0.7;
          bird.leftWing.rotation.z = flap;
          bird.rightWing.rotation.z = -flap;

          bird.head.rotation.x = Math.sin(bird.wingAngle * 0.5) * 0.15;
          bird.mesh.position.y = bird.baseAltitude + Math.sin(bird.wingAngle * 0.7) * 0.4;
        }

        // Wrap around when flying offscreen - maintain correct forward heading!
        if (bird.mesh.position.x > 55) {
          bird.mesh.position.x = -55;
          bird.speed = Math.abs(bird.speed);
          bird.mesh.rotation.y = Math.PI / 2;
        } else if (bird.mesh.position.x < -55) {
          bird.mesh.position.x = 55;
          bird.speed = -Math.abs(bird.speed);
          bird.mesh.rotation.y = -Math.PI / 2;
        }
      } else {
        bird.hitVelocity.y -= 9.8 * delta * 0.7;
        bird.hitVelocity.x *= 0.98;
        bird.hitVelocity.z *= 0.98;

        bird.mesh.position.addScaledVector(bird.hitVelocity, delta);
        bird.mesh.rotation.z += 1.5 * delta;
        bird.mesh.rotation.x += 0.8 * delta;

        if (bird.parachuteMesh && bird.parachuteMesh.scale.x < 1.0) {
          const s = Math.min(1.0, bird.parachuteMesh.scale.x + delta * 2.5);
          bird.parachuteMesh.scale.set(s, s, s);
        }

        if (bird.mesh.position.y <= 0.5) {
          this.scene.remove(bird.mesh);
          this.birds.splice(i, 1);
          setTimeout(() => {
            this.spawnBird(bird.type, bird.baseAltitude);
          }, 2000 + Math.random() * 2000);
        }
      }
    }

    for (let i = this.featherParticles.length - 1; i >= 0; i--) {
      const p = this.featherParticles[i];
      p.userData.age += delta;

      const posAttr = p.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const velocities = p.userData.velocities as THREE.Vector3[];

      for (let j = 0; j < velocities.length; j++) {
        velocities[j].y -= 4.0 * delta;
        velocities[j].x += Math.sin(p.userData.age * 5 + j) * 0.5 * delta;

        positions[j * 3] += velocities[j].x * delta;
        positions[j * 3 + 1] += velocities[j].y * delta;
        positions[j * 3 + 2] += velocities[j].z * delta;
      }
      posAttr.needsUpdate = true;

      const mat = p.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, 1 - (p.userData.age / p.userData.maxAge));

      if (p.userData.age >= p.userData.maxAge) {
        this.scene.remove(p);
        p.geometry.dispose();
        this.featherParticles.splice(i, 1);
      }
    }
  }
}
