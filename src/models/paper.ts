import * as THREE from 'three';
import { sound } from '../sound';
import { createToonMaterial, GOOSE_PALETTE } from '../materials';
import type { SupportedLang } from '../i18n';

export interface FoldStats {
  folds: number;
  layers: number;
  thicknessMm: number;
  width: number;
  length: number;
  massKg: number;
  maxDistanceM: number;
  maxAltitudeM: number;
  comparison: string;
  foldName: string;
}

export class PaperSheet {
  public mesh: THREE.Group;
  public folds: number = 0;
  public isFolding: boolean = false;
  public isFlying: boolean = false;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public initialTablePos: THREE.Vector3 = new THREE.Vector3(0, 1.215, 0);

  // Trajectory visualization
  public trajectoryLine: THREE.Line;
  private scene: THREE.Scene;

  // Visual meshes
  private paperBody: THREE.Mesh | null = null;

  // Paper materials
  private paperMat: THREE.Material;
  private foldEdgeMat: THREE.Material;
  public materialType: 'paper' | 'foil' = 'paper';
  private foilMat: THREE.MeshStandardMaterial;
  private foilEdgeMat: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.initialTablePos);

    this.paperMat = createToonMaterial({
      color: GOOSE_PALETTE.paperWhite,
      side: THREE.DoubleSide
    });

    this.foldEdgeMat = createToonMaterial({
      color: GOOSE_PALETTE.paperFoldDark
    });

    this.foilMat = new THREE.MeshStandardMaterial({
      color: 0xecf0f1,
      roughness: 0.28,
      metalness: 0.92,
      flatShading: true,
      side: THREE.DoubleSide
    });

    this.foilEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xbdc3c7,
      roughness: 0.38,
      metalness: 0.82,
      flatShading: true
    });

    const trajGeo = new THREE.BufferGeometry();
    const trajMat = new THREE.LineDashedMaterial({
      color: 0xff3b30,
      dashSize: 0.8,
      gapSize: 0.4,
      linewidth: 2
    });
    this.trajectoryLine = new THREE.Line(trajGeo, trajMat);
    this.trajectoryLine.visible = false;
    this.scene.add(this.trajectoryLine);

    this.rebuildMesh();
    this.scene.add(this.mesh);
  }

  // Calculate exponential statistics: 2^N layers, halving dimensions, exponential thickness
  public getStats(lang: SupportedLang = 'de'): FoldStats {
    const folds = this.folds;
    const layers = Math.pow(2, folds);
    const thicknessMm = 0.1 * layers; // Standard 80g paper: 0.1mm base

    // Starting dimensions: A4 ~ 210mm x 297mm (in 3D meters: 0.52m x 0.74m for nice table scale)
    let w = 0.52;
    let l = 0.74;
    for (let i = 0; i < folds; i++) {
      if (w > l) {
        w /= 2;
      } else {
        l /= 2;
      }
    }

    const massKg = this.materialType === "foil" ? 0.16 : 0.08;

    let maxDistanceM = 3;
    let maxAltitudeM = 1.5;
    let comparison = '';
    let foldName = '';

    if (lang === 'en') {
      if (folds === 0) {
        maxDistanceM = 3;
        maxAltitudeM = 1.5;
        comparison = 'Fluttering note sheet (drops limply into the grass)';
        foldName = 'Unfolded Sheet';
      } else if (folds === 1) {
        maxDistanceM = 16;
        maxAltitudeM = 8;
        comparison = 'Double layer – still flutters wildly';
        foldName = 'Single Fold';
      } else if (folds === 2) {
        maxDistanceM = 32;
        maxAltitudeM = 14;
        comparison = 'Thickness of standard cardboard – Pigeon range!';
        foldName = 'Pigeon Glider';
      } else if (folds === 3) {
        maxDistanceM = 65;
        maxAltitudeM = 28;
        comparison = 'Thickness of shipping box – Crane range!';
        foldName = 'Pocket Dart';
      } else if (folds === 4) {
        maxDistanceM = 120;
        maxAltitudeM = 55;
        comparison = 'Stack of credit cards – Seagull & Goose range!';
        foldName = 'Aerodynamic Wedge';
      } else if (folds === 5) {
        maxDistanceM = 220;
        maxAltitudeM = 95;
        comparison = 'Thickness of iPhone Fold – Crater & car alarm!';
        foldName = 'iFold Mini';
      } else if (folds === 6) {
        maxDistanceM = 380;
        maxAltitudeM = 160;
        comparison = 'Extremely rigid – Bone-crusher level';
        foldName = 'Origami Bullet';
      } else if (folds === 7) {
        maxDistanceM = 650;
        maxAltitudeM = 280;
        comparison = 'Mythical Limit: Absolute peak of human hands!';
        foldName = 'Human Peak Fold';
      } else if (folds === 8) {
        maxDistanceM = 1100;
        maxAltitudeM = 450;
        comparison = 'Hydraulic press required – Smashes high drones!';
        foldName = 'Hydraulic Crusher';
      } else if (folds === 9) {
        maxDistanceM = 1800;
        maxAltitudeM = 750;
        comparison = 'Solid titanium-paper block – Airliner FL-404 range!';
        foldName = 'iFold Pro Max';
      } else if (folds === 10) {
        maxDistanceM = 2800;
        maxAltitudeM = 1100;
        comparison = 'Stratosphere projectile: Density of solid granite!';
        foldName = 'Stratosphere Piercer';
      } else {
        maxDistanceM = 4500;
        maxAltitudeM = 1800;
        comparison = 'ORBITAL SINGULARITY: Reaches Tim Cook’s Satellite!';
        foldName = 'Black Hole of Paper';
      }
    } else {
      if (folds === 0) {
        maxDistanceM = 3;
        maxAltitudeM = 1.5;
        comparison = 'Flatterndes Notizblatt (trudelt kraftlos ins Gras)';
        foldName = 'Ungefalteter Bogen';
      } else if (folds === 1) {
        maxDistanceM = 16;
        maxAltitudeM = 8;
        comparison = 'Zweifach-Lage – flattert noch wild';
        foldName = 'Einfacher Falz';
      } else if (folds === 2) {
        maxDistanceM = 32;
        maxAltitudeM = 14;
        comparison = 'Dicke wie 1 Spielkarte – Tauben-Reichweite!';
        foldName = 'Tauben-Gleiter';
      } else if (folds === 3) {
        maxDistanceM = 65;
        maxAltitudeM = 28;
        comparison = 'Dicke wie 1 Pappkarton – erreicht Tauben & Kraniche!';
        foldName = 'Pocket Dart';
      } else if (folds === 4) {
        maxDistanceM = 120;
        maxAltitudeM = 55;
        comparison = 'Dicke wie ein Kreditkartenstapel – Gänse- & Möwen-Reichweite!';
        foldName = 'Aerodynamischer Keil';
      } else if (folds === 5) {
        maxDistanceM = 220;
        maxAltitudeM = 95;
        comparison = 'Dicke wie das neue iPhone Fold – Krater & Autoalarm!';
        foldName = 'iFold Mini';
      } else if (folds === 6) {
        maxDistanceM = 380;
        maxAltitudeM = 160;
        comparison = 'Extrem steif – Knochenbrecher-Level';
        foldName = 'Origami Bullet';
      } else if (folds === 7) {
        maxDistanceM = 650;
        maxAltitudeM = 280;
        comparison = 'Mythos-Grenze: Das Limit menschlicher Hände!';
        foldName = 'Human Peak Fold';
      } else if (folds === 8) {
        maxDistanceM = 1100;
        maxAltitudeM = 450;
        comparison = 'Hydraulische Presse erforderlich – zerschmettert Drohnen!';
        foldName = 'Hydraulic Crusher';
      } else if (folds === 9) {
        maxDistanceM = 1800;
        maxAltitudeM = 750;
        comparison = 'Massiver Block aus Zellulose-Titan – Airliner-Reichweite!';
        foldName = 'iFold Pro Max';
      } else if (folds === 10) {
        maxDistanceM = 2800;
        maxAltitudeM = 1100;
        comparison = 'Stratosphären-Projektil: Dichte wie Granit!';
        foldName = 'Stratosphere Piercer';
      } else {
        maxDistanceM = 4500;
        maxAltitudeM = 1800;
        comparison = 'ORBIT-SINGULARITÄT: Erreicht Tim Cooks Keynote-Satellit!';
        foldName = 'Black Hole of Paper';
      }
    }

    return {
      folds,
      layers,
      thicknessMm,
      width: Math.max(w, 0.08),
      length: Math.max(l, 0.08),
      massKg,
      maxDistanceM,
      maxAltitudeM,
      comparison,
      foldName
    };
  }

  // Rebuild the 3D mesh based on current fold count
  public rebuildMesh() {
    while (this.mesh.children.length > 0) {
      this.mesh.remove(this.mesh.children[0]);
    }

    const stats = this.getStats();
    const t = Math.max(0.005, (stats.thicknessMm / 1000) * 3.0); // Visual thickness scaled for 3D realism
    const w = stats.width;
    const l = stats.length;

    // Geometric model based on fold stage and material
    if (this.materialType === "foil") {
      if (this.folds === 0) {
        // Flat gleaming silver foil sheet with crinkle facets
        const geo = new THREE.BoxGeometry(w, 0.004, l, 8, 1, 8);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vz = pos.getZ(i);
          pos.setY(i, pos.getY(i) + (Math.sin(vx * 18) + Math.cos(vz * 18)) * 0.003);
        }
        geo.computeVertexNormals();
        this.paperBody = new THREE.Mesh(geo, this.foilMat);
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);
      } else if (this.folds < 3) {
        // Folded silver foil plate / glider
        const geo = new THREE.BoxGeometry(w, t * 1.2, l, 4, 1, 4);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vz = pos.getZ(i);
          pos.setY(i, pos.getY(i) + (Math.sin(vx * 24) * Math.cos(vz * 24)) * 0.004);
        }
        geo.computeVertexNormals();
        this.paperBody = new THREE.Mesh(geo, this.foilMat);
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        const edgeGeo = new THREE.BoxGeometry(w * 1.02, t * 1.3, 0.008);
        const edge = new THREE.Mesh(edgeGeo, this.foilEdgeMat);
        this.mesh.add(edge);
      } else {
        // 🌯 THE CRUMPLED KINETIC FOIL BALL (Alukugel!)
        // Compresses tighter & denser as fold count increases
        const ballRadius = Math.max(0.042, 0.20 * Math.pow(0.81, this.folds - 3));
        const ballGeo = new THREE.DodecahedronGeometry(ballRadius, 1);
        const pos = ballGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const vz = pos.getZ(i);
          const crinkleNoise = (Math.sin(vx * 43 + vy * 59 + vz * 67) * 0.5 + 0.5);
          const scale = 1.0 + (crinkleNoise - 0.5) * 0.32;
          pos.setXYZ(i, vx * scale, vy * scale, vz * scale);
        }
        ballGeo.computeVertexNormals();
        this.paperBody = new THREE.Mesh(ballGeo, this.foilMat);
        this.paperBody.castShadow = true;
        this.paperBody.position.set(0, ballRadius * 0.95, 0);
        this.mesh.add(this.paperBody);

        // At orbital tier (11+), add a glowing metallic halo
        if (this.folds >= 11) {
          const haloGeo = new THREE.RingGeometry(ballRadius * 1.3, ballRadius * 1.6, 16);
          haloGeo.rotateX(Math.PI / 2);
          const haloMat = new THREE.MeshBasicMaterial({ color: 0x00d2d3, side: THREE.DoubleSide });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.position.set(0, ballRadius * 0.95, 0);
          this.mesh.add(halo);
        }
      }
    } else {
      // Classic paper folding models
      if (this.folds === 0) {
        const geo = new THREE.BoxGeometry(w, 0.005, l);
        this.paperBody = new THREE.Mesh(geo, this.paperMat);
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        const creaseGeo = new THREE.BoxGeometry(w * 0.96, 0.006, 0.004);
        const crease = new THREE.Mesh(creaseGeo, this.foldEdgeMat);
        this.mesh.add(crease);
      } else if (this.folds < 4) {
        const geo = new THREE.BoxGeometry(w, t, l);
        this.paperBody = new THREE.Mesh(geo, this.paperMat);
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        const creaseGeo = new THREE.BoxGeometry(w * 1.01, t * 1.05, 0.006);
        const crease = new THREE.Mesh(creaseGeo, this.foldEdgeMat);
        this.mesh.add(crease);
      } else if (this.folds < 8) {
        const dartGroup = new THREE.Group();
        const dartGeo = new THREE.ConeGeometry(w * 0.75, l, 4);
        dartGeo.rotateX(Math.PI / 2);
        this.paperBody = new THREE.Mesh(dartGeo, this.paperMat);
        this.paperBody.scale.set(1, t * 8, 1);
        this.paperBody.castShadow = true;
        dartGroup.add(this.paperBody);
        this.mesh.add(dartGroup);
      } else {
        const cubeGeo = new THREE.BoxGeometry(w * 0.9, Math.min(t, 0.25), l * 0.9);
        this.paperBody = new THREE.Mesh(cubeGeo, this.paperMat);
        this.paperBody.castShadow = true;
        this.mesh.add(this.paperBody);
      }
    }
  }

  // Animated procedural paper folding animation
  public fold(onComplete?: () => void) {
    if (this.isFolding || this.isFlying) return;
    this.isFolding = true;

    if (this.materialType === 'foil') {
      sound.playFoilCrinkle(this.folds);
    } else {
      sound.playFold();
    }

    const startPos = this.mesh.position.clone();
    const startTime = performance.now();
    const duration = 280; // Crisp, snappy folding feel

    const animateFold = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Cute lift & squeeze hop
      const hop = Math.sin(progress * Math.PI) * 0.12;
      this.mesh.position.y = startPos.y + hop;

      // Snappy fold rotation
      this.mesh.rotation.y = progress * (Math.PI / 2);
      this.mesh.rotation.x = Math.sin(progress * Math.PI) * 0.2;

      if (progress < 1.0) {
        requestAnimationFrame(animateFold);
      } else {
        this.folds++;
        this.mesh.position.copy(this.initialTablePos);
        this.mesh.rotation.set(0, 0, 0);
        this.rebuildMesh();
        this.isFolding = false;
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateFold);
  }

  // Update parabolic dotted trajectory guide line
  public updateTrajectory(pitchDeg: number, yawDeg: number, powerPercent: number, hasTargetLock: boolean = false) {
    const stats = this.getStats();
    const foilMult = this.materialType === 'foil' ? 1.25 : 1.0;
    const baseSpeed = (24.0 + stats.folds * 15.0) * foilMult; // Higher folds launch at immense hypersonic speed
    const launchSpeed = baseSpeed * (powerPercent / 100);

    const pitchRad = THREE.MathUtils.degToRad(pitchDeg);
    const yawRad = THREE.MathUtils.degToRad(yawDeg);

    const simVelocity = new THREE.Vector3(
      -Math.sin(yawRad) * Math.cos(pitchRad) * launchSpeed,
      Math.sin(pitchRad) * launchSpeed,
      -Math.cos(yawRad) * Math.cos(pitchRad) * launchSpeed
    );

    const points: THREE.Vector3[] = [];
    const simPos = this.mesh.position.clone();
    const dt = 0.035;
    const maxSteps = 90;

    for (let i = 0; i < maxSteps; i++) {
      points.push(simPos.clone());
      simPos.addScaledVector(simVelocity, dt);

      // Gliding aerodynamic lift based on folds
      const liftFactor = Math.max(0.1, 1.0 - stats.folds * 0.08);
      const gravity = -9.81 * dt * liftFactor;
      simVelocity.y += gravity;

      const drag = 1.0 - (0.015 / Math.max(1, stats.folds * 0.8));
      simVelocity.multiplyScalar(drag);

      if (simPos.y <= 0.1) {
        points.push(simPos.clone());
        break;
      }
    }

    this.trajectoryLine.geometry.dispose();
    this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
    (this.trajectoryLine.material as THREE.LineDashedMaterial).color.setHex(
      hasTargetLock ? (stats.folds >= 11 ? 0xffd700 : 0x28cd41) : 0xff3b30
    );
    this.trajectoryLine.computeLineDistances();
    this.trajectoryLine.visible = true;
  }

  // Launch paper into physics flight
  public launch(pitchDeg: number, yawDeg: number, powerPercent: number) {
    this.isFlying = true;
    this.isFolding = false;
    this.trajectoryLine.visible = false;

    const stats = this.getStats();
    const foilMult = this.materialType === 'foil' ? 1.25 : 1.0;
    const baseSpeed = (24.0 + stats.folds * 15.0) * foilMult;
    const launchSpeed = baseSpeed * (powerPercent / 100);

    const pitchRad = THREE.MathUtils.degToRad(pitchDeg);
    const yawRad = THREE.MathUtils.degToRad(yawDeg);

    this.velocity.set(
      -Math.sin(yawRad) * Math.cos(pitchRad) * launchSpeed,
      Math.sin(pitchRad) * launchSpeed,
      -Math.cos(yawRad) * Math.cos(pitchRad) * launchSpeed
    );

    sound.playWhoosh(this.folds);
  }

  // Update real-time physics per frame during flight
  public updatePhysics(delta: number, homingTarget?: THREE.Vector3 | null): boolean {
    if (!this.isFlying) return false;

    const stats = this.getStats();

    // Homing guidance: gently bend trajectory toward locked bird
    if (homingTarget) {
      const dirToTarget = homingTarget.clone().sub(this.mesh.position).normalize();
      const currentDir = this.velocity.clone().normalize();
      const speed = this.velocity.length();

      const trackingStrength = Math.min(1.0, (0.45 + stats.folds * 0.05) * delta * 15.0);
      currentDir.lerp(dirToTarget, trackingStrength);
      this.velocity.copy(currentDir.multiplyScalar(speed));
    }

    // Aerodynamics & Gravity
    const liftFactor = Math.max(0.08, 1.0 - stats.folds * 0.075);
    const gravity = -9.81 * delta * liftFactor;
    this.velocity.y += gravity;

    const drag = 1.0 - (0.012 / Math.max(1, stats.folds * 0.8)) * (delta * 60);
    this.velocity.multiplyScalar(drag);

    this.mesh.position.addScaledVector(this.velocity, delta);

    // Dynamic rotation: paper points toward velocity vector
    if (this.velocity.lengthSq() > 0.1) {
      const lookAtPos = this.mesh.position.clone().add(this.velocity);
      this.mesh.lookAt(lookAtPos);

      if (stats.folds >= 5) {
        // Hypersonic bullet spin
        this.mesh.rotation.z += 15.0 * delta;
      }
    }

    // Ground impact check
    if (this.mesh.position.y <= 0.08) {
      this.mesh.position.y = 0.08;
      this.isFlying = false;
      this.velocity.set(0, 0, 0);
      sound.playCrash(stats.folds);
      return true; // Flight ended
    }

    // Far boundary check
    if (this.mesh.position.length() > 300) {
      this.isFlying = false;
      this.velocity.set(0, 0, 0);
      return true;
    }

    return false;
  }

  // Reset to fresh unfolded sheet of paper
  public resetNewSheet() {
    this.folds = 0;
    this.isFlying = false;
    this.isFolding = false;
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.initialTablePos);
    this.mesh.rotation.set(0, 0, 0);
    this.rebuildMesh();
    this.trajectoryLine.visible = false;
    sound.playNewPaper();
  }
}
