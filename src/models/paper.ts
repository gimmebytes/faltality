import * as THREE from 'three';
import { sound } from '../sound';

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

    this.scene.add(this.mesh);
    this.rebuildMesh();
  }

  // Get current physical stats based on exponential folding
  public getStats(): FoldStats {
    const folds = this.folds;
    const layers = Math.pow(2, folds);
    const thicknessMm = 0.1 * layers;

    let w = 1.0;
    let l = 0.7;
    for (let f = 0; f < folds; f++) {
      if (f % 2 === 0) {
        w /= 2;
      } else {
        l /= 2;
      }
    }

    const massKg = 0.08;

    let maxDistanceM = 8;
    let maxAltitudeM = 4;
    let comparison = 'Flatterndes Notizblatt (fällt schnell zu Boden)';
    let foldName = 'Ungefaltet';

    if (folds === 1) {
      maxDistanceM = 16;
      maxAltitudeM = 8;
      comparison = 'Doppelte Lage – flattert noch wild';
      foldName = 'Erster Knick';
    } else if (folds === 2) {
      maxDistanceM = 32;
      maxAltitudeM = 15;
      comparison = 'Schulheft-Stabilität';
      foldName = 'Postkarten-Format';
    } else if (folds === 3) {
      maxDistanceM = 65;
      maxAltitudeM = 28;
      comparison = 'Dicke wie 1 Pappkarton – erreicht Tauben!';
      foldName = 'Pocket Dart';
    } else if (folds === 4) {
      maxDistanceM = 120;
      maxAltitudeM = 55;
      comparison = 'Dicke wie ein Kreditkartenstapel – Gänse-Reichweite!';
      foldName = 'Aerodynamischer Keil';
    } else if (folds === 5) {
      maxDistanceM = 220;
      maxAltitudeM = 95;
      comparison = 'Dicke wie das neue iPhone Fold – massiver Punch!';
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
      comparison = 'Massiver Block aus gepresstem Zellulose-Titan';
      foldName = 'iFold Pro Max';
    } else {
      maxDistanceM = 3500;
      maxAltitudeM = 1400;
      comparison = 'FALTALITY GOD TIER: Durchbricht die Stratosphäre!';
      foldName = 'Black Hole of Paper';
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
    const visualThickness = Math.max(0.005, (stats.thicknessMm / 1000) * 8.0);
    const w = stats.width;
    const l = stats.length;

    const geo = new THREE.BoxGeometry(w, visualThickness, l);
    this.paperBody = new THREE.Mesh(geo, this.paperMat);
    this.paperBody.castShadow = true;
    this.paperBody.receiveShadow = true;
    this.mesh.add(this.paperBody);

    const creaseGeo = new THREE.BoxGeometry(w * 0.98, visualThickness * 1.05, 0.015);
    const crease = new THREE.Mesh(creaseGeo, this.foldEdgeMat);
    this.mesh.add(crease);

    if (this.folds >= 3) {
      const tipGeo = new THREE.ConeGeometry(w * 0.45, l * 0.5, 4);
      tipGeo.rotateX(Math.PI / 2);
      tipGeo.translate(0, 0, l * 0.45);
      const tip = new THREE.Mesh(tipGeo, this.paperMat);
      tip.scale.set(1, visualThickness / (w * 0.45), 1);
      this.mesh.add(tip);
    }
  }

  // Animate a 3D fold
  public fold(onComplete?: () => void) {
    if (this.isFolding || this.isFlying) return;
    this.isFolding = true;

    const currentFolds = this.folds;
    sound.playFold(currentFolds + 1);

    const stats = this.getStats();
    const visualThickness = Math.max(0.005, (stats.thicknessMm / 1000) * 8.0);
    const foldAlongX = currentFolds % 2 === 0;

    const flapWidth = foldAlongX ? stats.width / 2 : stats.width;
    const flapLength = foldAlongX ? stats.length : stats.length / 2;

    const flapGroup = new THREE.Group();
    flapGroup.position.set(0, visualThickness * 0.5, 0);

    const flapGeo = new THREE.BoxGeometry(flapWidth, visualThickness * 0.9, flapLength);
    if (foldAlongX) {
      flapGeo.translate(flapWidth / 2, 0, 0);
    } else {
      flapGeo.translate(0, 0, flapLength / 2);
    }
    const flapMesh = new THREE.Mesh(flapGeo, this.paperMat);
    flapGroup.add(flapMesh);
    this.mesh.add(flapGroup);

    let startTime: number | null = null;
    const duration = 220; // snappier fold animation

    const animateFold = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const eased = Math.sin((progress * Math.PI) / 2);

      if (foldAlongX) {
        flapGroup.rotation.z = -eased * Math.PI;
      } else {
        flapGroup.rotation.x = eased * Math.PI;
      }

      if (progress < 1.0) {
        requestAnimationFrame(animateFold);
      } else {
        this.folds++;
        this.isFolding = false;
        this.rebuildMesh();
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateFold);
  }

  // Calculate launch velocity vector - high speed, snappy Moorhuhn projectile!
  public calculateLaunchVelocity(pitchDeg: number, yawDeg: number, powerPercent: number): THREE.Vector3 {
    const stats = this.getStats();
    // Fast & punchy: starting at 24 m/s and reaching >100 m/s with folds
    const baseSpeed = 24.0 + stats.folds * 15.0;
    const speed = baseSpeed * (powerPercent / 100);

    const pitchRad = THREE.MathUtils.degToRad(pitchDeg);
    const yawRad = THREE.MathUtils.degToRad(yawDeg);

    const vx = -Math.sin(yawRad) * Math.cos(pitchRad) * speed;
    const vy = Math.sin(pitchRad) * speed;
    const vz = -Math.cos(yawRad) * Math.cos(pitchRad) * speed;

    return new THREE.Vector3(vx, vy, vz);
  }

  // Update dotted trajectory line for visual aiming
  public updateTrajectory(pitchDeg: number, yawDeg: number, powerPercent: number, isLocked: boolean = false) {
    if (this.isFlying) {
      this.trajectoryLine.visible = false;
      return;
    }

    this.trajectoryLine.visible = true;
    (this.trajectoryLine.material as THREE.LineDashedMaterial).color.setHex(isLocked ? 0x28cd41 : 0xff3b30);

    const points: THREE.Vector3[] = [];
    const initialVel = this.calculateLaunchVelocity(pitchDeg, yawDeg, powerPercent);
    const pos = this.mesh.position.clone();
    const vel = initialVel.clone();
    const stats = this.getStats();

    // Responsive drag
    const dragCoeff = Math.max(0.003, 0.08 / Math.sqrt(stats.folds + 1));
    const dt = 0.03;

    points.push(pos.clone());

    for (let step = 0; step < 75; step++) {
      const speed = vel.length();
      const dragForce = speed * speed * dragCoeff;
      const drag = vel.clone().normalize().multiplyScalar(-dragForce);

      vel.addScaledVector(drag, dt);
      vel.y -= 9.81 * dt;
      pos.addScaledVector(vel, dt);

      points.push(pos.clone());
      if (pos.y <= 0) break;
    }

    this.trajectoryLine.geometry.dispose();
    this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.trajectoryLine.computeLineDistances();
  }

  // Launch the folded paper into the sky!
  public launch(pitchDeg: number, yawDeg: number, powerPercent: number) {
    if (this.isFlying || this.isFolding) return;
    this.isFlying = true;
    this.trajectoryLine.visible = false;

    this.velocity = this.calculateLaunchVelocity(pitchDeg, yawDeg, powerPercent);
    sound.playLaunch(powerPercent / 100);

    this.mesh.lookAt(this.mesh.position.clone().add(this.velocity));
  }

  // Reset onto table with fresh new sheet
  public resetNewSheet() {
    this.isFlying = false;
    this.isFolding = false;
    this.folds = 0;
    this.mesh.position.copy(this.initialTablePos);
    this.mesh.rotation.set(0, 0, 0);
    this.rebuildMesh();
    sound.playNewPaper();
  }

  // Physics update during flight - crisp ballistics!
  public updatePhysics(delta: number, homingTarget?: THREE.Vector3 | null): boolean {
    if (!this.isFlying) return false;

    const stats = this.getStats();
    const isFlappy = stats.folds < 2;
    // Lower drag for fast, punchy flight
    const dragCoeff = isFlappy ? 0.22 : Math.max(0.003, 0.08 / Math.sqrt(stats.folds + 1));

    // Responsive Aerodynamic Homing (if Auto-Aim is active and folded at least twice)
    if (homingTarget && stats.folds >= 2) {
      const dirToTarget = homingTarget.clone().sub(this.mesh.position).normalize();
      const currentSpeed = this.velocity.length();
      this.velocity.lerp(dirToTarget.multiplyScalar(currentSpeed), 8.0 * delta);
    }

    const speed = this.velocity.length();
    const dragForce = speed * speed * dragCoeff;
    const drag = this.velocity.clone().normalize().multiplyScalar(-dragForce);

    this.velocity.addScaledVector(drag, delta);
    this.velocity.y -= 9.81 * delta;

    if (isFlappy) {
      this.mesh.rotation.z += 16 * delta;
      this.mesh.rotation.x += Math.sin(Date.now() * 0.01) * 10 * delta;
    } else {
      if (this.velocity.lengthSq() > 0.1) {
        this.mesh.lookAt(this.mesh.position.clone().add(this.velocity));
      }
    }

    this.mesh.position.addScaledVector(this.velocity, delta);

    if (this.mesh.position.y <= 0.1) {
      this.mesh.position.y = 0.1;
      this.isFlying = false;
      return true;
    }

    if (Math.abs(this.mesh.position.x) > 250 || Math.abs(this.mesh.position.z) > 250 || this.mesh.position.y > 500) {
      this.isFlying = false;
      return true;
    }

    return false;
  }
}
