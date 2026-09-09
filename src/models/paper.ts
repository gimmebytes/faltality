import * as THREE from 'three';
import { sound } from '../sound';
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
  public initialTablePos: THREE.Vector3 = new THREE.Vector3(0, 1.22, 0);

  // Trajectory visualization
  public trajectoryLine: THREE.Line;
  private scene: THREE.Scene;

  // Visual meshes
  private paperBody: THREE.Mesh | null = null;

  // Paper materials
  private paperMat: THREE.MeshLambertMaterial;
  private foldEdgeMat: THREE.MeshLambertMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.initialTablePos);

    this.paperMat = new THREE.MeshLambertMaterial({
      color: 0xfbf9f1,
      flatShading: true,
      side: THREE.DoubleSide
    });

    this.foldEdgeMat = new THREE.MeshLambertMaterial({
      color: 0xe0d9c7,
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
  }

  // Calculate exponential statistics: 2^N layers, halving dimensions, exponential thickness
  public getStats(lang: SupportedLang = 'de'): FoldStats {
    const folds = this.folds;
    const layers = Math.pow(2, folds);
    const thicknessMm = 0.1 * layers; // Standard 80g paper: 0.1mm base

    // Starting dimensions: A4 ~ 210mm x 297mm (in 3D meters: 0.42m x 0.60m for nice table scale)
    let w = 0.42;
    let l = 0.60;
    for (let i = 0; i < folds; i++) {
      if (w > l) {
        w /= 2;
      } else {
        l /= 2;
      }
    }

    const massKg = 0.08;

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
        foldName = 'First Crease';
      } else if (folds === 2) {
        maxDistanceM = 32;
        maxAltitudeM = 15;
        comparison = 'Notebook stability – reaches low origami pigeons';
        foldName = 'Postcard Fold';
      } else if (folds === 3) {
        maxDistanceM = 65;
        maxAltitudeM = 28;
        comparison = 'Cardboard thickness – hits cranes & pigeons!';
        foldName = 'Pocket Dart';
      } else if (folds === 4) {
        maxDistanceM = 120;
        maxAltitudeM = 55;
        comparison = 'Credit card stack – goose & seagull range!';
        foldName = 'Aerodynamic Wedge';
      } else if (folds === 5) {
        maxDistanceM = 220;
        maxAltitudeM = 95;
        comparison = 'iPhone Fold thickness – blasts craters & car alarms!';
        foldName = 'iFold Mini';
      } else if (folds === 6) {
        maxDistanceM = 380;
        maxAltitudeM = 160;
        comparison = 'Extremely rigid – bone-crusher velocity';
        foldName = 'Origami Bullet';
      } else if (folds === 7) {
        maxDistanceM = 650;
        maxAltitudeM = 280;
        comparison = 'Myth boundary: The limit of human hands!';
        foldName = 'Human Peak Fold';
      } else if (folds === 8) {
        maxDistanceM = 1100;
        maxAltitudeM = 450;
        comparison = 'Hydraulic press required – crushes drones!';
        foldName = 'Hydraulic Crusher';
      } else if (folds === 9) {
        maxDistanceM = 1800;
        maxAltitudeM = 750;
        comparison = 'Titanium-cellulose block – passenger airliner range!';
        foldName = 'iFold Pro Max';
      } else if (folds === 10) {
        maxDistanceM = 2800;
        maxAltitudeM = 1100;
        comparison = 'Stratospheric projectile: Dense as granite!';
        foldName = 'Stratosphere Piercer';
      } else {
        maxDistanceM = 4500;
        maxAltitudeM = 1800;
        comparison = 'ORBITAL SINGULARITY: Strikes Tim Cook’s Keynote Satellite!';
        foldName = 'Black Hole of Paper';
      }
    } else {
      // German (Default)
      if (folds === 0) {
        maxDistanceM = 3;
        maxAltitudeM = 1.5;
        comparison = 'Flatterndes Notizblatt (fällt kraftlos ins Gras)';
        foldName = 'Ungefaltetes Blatt';
      } else if (folds === 1) {
        maxDistanceM = 16;
        maxAltitudeM = 8;
        comparison = 'Doppelte Lage – flattert noch wild';
        foldName = 'Erster Knick';
      } else if (folds === 2) {
        maxDistanceM = 32;
        maxAltitudeM = 15;
        comparison = 'Schulheft-Stabilität – erreicht Origami-Tauben';
        foldName = 'Postkarten-Format';
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
    const t = Math.max(0.003, (stats.thicknessMm / 1000) * 2.5); // Visual thickness scaled for 3D realism
    const w = stats.width;
    const l = stats.length;

    // Geometric paper model based on fold stage
    if (this.folds === 0) {
      // Crisp flat fresh paper sheet lying flat on the wooden table
      const geo = new THREE.BoxGeometry(w, 0.002, l);
      this.paperBody = new THREE.Mesh(geo, this.paperMat);
      this.paperBody.castShadow = true;
      this.paperBody.receiveShadow = true;
      this.mesh.add(this.paperBody);
    } else if (this.folds < 4) {
      // Folded sheet with creased bevel edge
      const geo = new THREE.BoxGeometry(w, t, l);
      this.paperBody = new THREE.Mesh(geo, this.paperMat);
      this.paperBody.castShadow = true;
      this.paperBody.receiveShadow = true;
      this.mesh.add(this.paperBody);

      // Subtle crease crease line along the center
      const creaseGeo = new THREE.BoxGeometry(w * 1.01, t * 1.05, 0.005);
      const crease = new THREE.Mesh(creaseGeo, this.foldEdgeMat);
      this.mesh.add(crease);
    } else if (this.folds < 8) {
      // Dart / wedge-like origami dart projectile
      const dartGroup = new THREE.Group();
      const dartGeo = new THREE.ConeGeometry(w * 0.75, l, 4);
      dartGeo.rotateX(Math.PI / 2);
      this.paperBody = new THREE.Mesh(dartGeo, this.paperMat);
      this.paperBody.scale.set(1, t * 8, 1);
      this.paperBody.castShadow = true;
      dartGroup.add(this.paperBody);
      this.mesh.add(dartGroup);
    } else {
      // Ultra-dense cubic kinetic projectile (iFold Singular Block)
      const cubeGeo = new THREE.BoxGeometry(w * 0.9, Math.min(t, 0.25), l * 0.9);
      this.paperBody = new THREE.Mesh(cubeGeo, this.paperMat);
      this.paperBody.castShadow = true;
      this.mesh.add(this.paperBody);
    }
  }

  // Animated procedural paper folding animation
  public fold(onComplete?: () => void) {
    if (this.isFolding || this.isFlying) return;
    this.isFolding = true;

    sound.playFold();

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
    const baseSpeed = 24.0 + stats.folds * 15.0; // Higher folds launch at immense hypersonic speed
    const launchSpeed = baseSpeed * (powerPercent / 100);

    const pitchRad = THREE.MathUtils.degToRad(pitchDeg);
    const yawRad = THREE.MathUtils.degToRad(yawDeg);

    // Initial velocity vector
    const vx = -Math.sin(yawRad) * Math.cos(pitchRad) * launchSpeed;
    const vy = Math.sin(pitchRad) * launchSpeed;
    const vz = -Math.cos(yawRad) * Math.cos(pitchRad) * launchSpeed;

    const points: THREE.Vector3[] = [];
    const gravity = 9.81;
    const dt = 0.04;
    const simPos = this.mesh.position.clone();
    simPos.y = 1.4;

    const curV = new THREE.Vector3(vx, vy, vz);

    // Color code trajectory line: Green/Red depending on lock!
    const lineMat = this.trajectoryLine.material as THREE.LineDashedMaterial;
    if (hasTargetLock) {
      lineMat.color.setHex(0x28cd41); // Green Lock
    } else {
      lineMat.color.setHex(0xff3b30); // Red manual aim
    }

    const maxSteps = Math.min(80, Math.floor(stats.maxDistanceM * 1.5));
    for (let i = 0; i < maxSteps; i++) {
      points.push(simPos.clone());
      simPos.addScaledVector(curV, dt);
      curV.y -= gravity * dt;

      // Ground hit or table hit
      if (simPos.y <= 0.05) {
        points.push(simPos.clone());
        break;
      }
    }

    this.trajectoryLine.geometry.dispose();
    this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.trajectoryLine.computeLineDistances();
    this.trajectoryLine.visible = true;
  }

  // Launch paper projectile into 3D world!
  public launch(pitchDeg: number, yawDeg: number, powerPercent: number) {
    if (this.isFlying || this.isFolding) return;
    this.isFlying = true;
    this.trajectoryLine.visible = false;

    const stats = this.getStats();
    const baseSpeed = 24.0 + stats.folds * 15.0;
    const launchSpeed = baseSpeed * (powerPercent / 100);

    const pitchRad = THREE.MathUtils.degToRad(pitchDeg);
    const yawRad = THREE.MathUtils.degToRad(yawDeg);

    this.velocity.set(
      -Math.sin(yawRad) * Math.cos(pitchRad) * launchSpeed,
      Math.sin(pitchRad) * launchSpeed,
      -Math.cos(yawRad) * Math.cos(pitchRad) * launchSpeed
    );

    sound.playLaunch(powerPercent / 100);
  }

  // Step physics in the animation loop
  public updatePhysics(delta: number, homingTarget: THREE.Vector3 | null = null): boolean {
    if (!this.isFlying) return false;

    // Gentle magnetic homing assist if locked on a bird!
    if (homingTarget) {
      const dirToTarget = homingTarget.clone().sub(this.mesh.position).normalize();
      const currentSpeed = this.velocity.length();
      // Steer velocity smoothly toward target
      this.velocity.lerp(dirToTarget.multiplyScalar(currentSpeed), 4.5 * delta);
    }

    // Apply gravity
    const gravity = 9.81;
    this.velocity.y -= gravity * delta;

    // Apply slight aerodynamic air drag
    const drag = 0.02;
    this.velocity.multiplyScalar(1 - drag * delta);

    // Update position
    this.mesh.position.addScaledVector(this.velocity, delta);

    // Orient paper along its velocity vector
    if (this.velocity.lengthSq() > 0.05) {
      const lookAtPos = this.mesh.position.clone().add(this.velocity);
      this.mesh.lookAt(lookAtPos);
      // Dart spin for high folds
      if (this.folds >= 4) {
        this.mesh.rotation.z += 15.0 * delta;
      }
    }

    // Impact with grass ground
    if (this.mesh.position.y <= 0.08) {
      this.mesh.position.y = 0.08;
      this.isFlying = false;
      this.velocity.set(0, 0, 0);
      return true; // Flight ended!
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
