import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { Environment } from './models/environment';
import { BirdManager } from './models/birds';
import type { BirdData } from './models/birds';
import { PaperSheet } from './models/paper';
import { sound } from './sound';

export type GamePhase = 'folding' | 'aiming' | 'flying';

export interface GameState {
  score: number;
  birdsHitCount: number;
  bestCombo: number;
  currentCombo: number;
  paperCount: number;
}

export class FaltalityGame {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private environment: Environment;
  public birdManager: BirdManager;
  public paper: PaperSheet;

  // 2-Phase Game Loop: 'folding' -> 'aiming' -> 'flying'
  public phase: GamePhase = 'folding';

  // Auto-Aim & Target Lock
  public autoAim: boolean = true;
  public targetedBird: BirdData | null = null;
  private lockOnReticle: THREE.Group;
  private reticleMat: THREE.MeshBasicMaterial;

  // Aiming parameters
  public pitchDeg: number = 42;
  public yawDeg: number = 0;
  public powerPercent: number = 85;

  // Camera animation positions
  // 1. Folding mode: cozy overhead table angle, focusing on folding paper
  private foldCamPos = new THREE.Vector3(0, 2.7, 2.4);
  private foldCamTarget = new THREE.Vector3(0, 1.2, 0.0);

  // 2. Aiming & Shooting mode (Moorhuhn Style): stationary PoV overlooking the garden sky
  private aimCamPos = new THREE.Vector3(0, 2.05, 3.8);

  private targetCamPos = new THREE.Vector3();
  private targetCamLookAt = new THREE.Vector3();

  // Screen shake for punchy arcade feel
  private screenShake: number = 0;

  // Slow-motion & game state
  private timeScale: number = 1.0;
  private slowMoTimer: number = 0;
  private isResettingCam: boolean = false;

  public state: GameState = {
    score: 0,
    birdsHitCount: 0,
    bestCombo: 0,
    currentCombo: 0,
    paperCount: 1
  };

  // Keyboard state for smooth arrow key aiming
  public keysPressed: Record<string, boolean> = {};

  public onStatsChanged?: () => void;
  public onFaltality?: (bird: BirdData, folds: number, scoreAward: number) => void;
  public onOverkillCrater?: (folds: number) => void;
  public onFlightEnd?: () => void;
  public onPhaseChange?: (phase: GamePhase) => void;

  private lastTime: number = 0;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(container: HTMLElement) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbfe0f7);
    this.scene.fog = new THREE.Fog(0xbfe0f7, 140, 450);

    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 600);
    this.camera.position.copy(this.foldCamPos);
    this.targetCamPos.copy(this.foldCamPos);
    this.targetCamLookAt.copy(this.foldCamTarget);
    this.camera.lookAt(this.foldCamTarget);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();

    this.environment = new Environment(this.scene);
    this.birdManager = new BirdManager(this.scene);
    this.birdManager.initFlocks();
    this.paper = new PaperSheet(this.scene);

    const { reticleGroup, reticleMat } = this.createLockOnReticle();
    this.lockOnReticle = reticleGroup;
    this.reticleMat = reticleMat;
    this.scene.add(this.lockOnReticle);

    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.setupAimingControls();

    this.lastTime = performance.now();
    requestAnimationFrame(this.animate.bind(this));
  }

  private createLockOnReticle(): { reticleGroup: THREE.Group; reticleMat: THREE.MeshBasicMaterial } {
    const group = new THREE.Group();
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x28cd41,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });

    const ringGeo = new THREE.RingGeometry(1.6, 1.8, 24);
    const ring = new THREE.Mesh(ringGeo, reticleMat);
    group.add(ring);

    const tickGeo = new THREE.PlaneGeometry(0.25, 0.7);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const tick = new THREE.Mesh(tickGeo, reticleMat);
      tick.position.set(Math.cos(angle) * 2.0, Math.sin(angle) * 2.0, 0);
      tick.rotation.z = angle + Math.PI / 2;
      group.add(tick);
    }

    group.visible = false;
    return { reticleGroup: group, reticleMat };
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x82a852, 0.75);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 1.35);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);
  }

  private setupAimingControls() {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialYaw = this.yawDeg;
    let initialPitch = this.pitchDeg;
    let pointerDownTime = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (this.phase !== 'aiming') return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const target = e.target as HTMLElement;
      if (target.closest('.ui-interactive')) return;

      isDragging = true;
      startX = clientX;
      startY = clientY;
      initialYaw = this.yawDeg;
      initialPitch = this.pitchDeg;
      pointerDownTime = performance.now();
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || this.phase !== 'aiming') return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      this.yawDeg = Math.max(-55, Math.min(55, initialYaw - deltaX * 0.25));
      this.pitchDeg = Math.max(15, Math.min(80, initialPitch + deltaY * 0.28));

      this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);
      if (this.onStatsChanged) this.onStatsChanged();
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;

      // Tap on a bird / satellite in the sky
      const clickDuration = performance.now() - pointerDownTime;
      if (clickDuration < 250) {
        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
        this.checkRaycastTarget(clientX, clientY);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    window.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  }

  // Click directly on a target to lock it!
  private checkRaycastTarget(clientX: number, clientY: number) {
    if (this.phase !== 'aiming') return;
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const aliveBirds = this.birdManager.birds.filter(b => b.alive);
    let bestBird: BirdData | null = null;
    let minDist = 3.5;

    for (const b of aliveBirds) {
      const screenPos = b.mesh.position.clone().project(this.camera);
      const dx = screenPos.x - this.mouse.x;
      const dy = screenPos.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.28 && dist < minDist) {
        minDist = dist;
        bestBird = b;
      }
    }

    if (bestBird) {
      this.targetedBird = bestBird;
      this.aimAtTarget(bestBird);
      if (this.onStatsChanged) this.onStatsChanged();
    }
  }

  // Target Cycling: Press [T] to switch between sky targets!
  public cycleTarget() {
    const aliveBirds = this.birdManager.birds.filter(b => b.alive);
    if (aliveBirds.length === 0) return;

    const stats = this.paper.getStats();
    const satellite = aliveBirds.find(b => b.type === 'satellite');

    // If we are on 11+ folds and satellite is alive and not targeted, jump straight to it!
    if (stats.folds >= 11 && satellite && this.targetedBird !== satellite) {
      this.targetedBird = satellite;
    } else {
      const currentIndex = this.targetedBird ? aliveBirds.indexOf(this.targetedBird) : -1;
      const nextIndex = (currentIndex + 1) % aliveBirds.length;
      this.targetedBird = aliveBirds[nextIndex];
    }

    if (this.targetedBird) {
      this.aimAtTarget(this.targetedBird);
    }
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public aimAtTarget(bird: BirdData) {
    const paperPos = this.paper.mesh.position;
    const stats = this.paper.getStats();
    const dist = paperPos.distanceTo(bird.mesh.position);
    const baseSpeed = 24.0 + stats.folds * 15.0;
    const flightSpeed = baseSpeed * (this.powerPercent / 100);
    const timeToHit = Math.max(0.05, dist / flightSpeed);

    const predictedX = bird.mesh.position.x + bird.speed * timeToHit * 0.98;
    const predictedY = bird.mesh.position.y + 0.5 * 9.81 * (timeToHit * timeToHit * 0.25);
    const predictedZ = bird.mesh.position.z;

    const dx = predictedX - paperPos.x;
    const dy = predictedY - paperPos.y;
    const dz = predictedZ - paperPos.z;
    const horizontalDist = Math.sqrt(dx * dx + dz * dz);

    this.yawDeg = THREE.MathUtils.radToDeg(Math.atan2(-dx, -dz));
    this.pitchDeg = Math.min(78, Math.max(18, THREE.MathUtils.radToDeg(Math.atan2(dy, horizontalDist))));

    this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, true);
  }

  public enterAimingMode() {
    if (this.phase === 'flying' || this.paper.isFolding) return;
    this.phase = 'aiming';

    const stats = this.paper.getStats();
    // Only spawn and auto-acquire satellite if high fold stage (11+)!
    if (stats.folds >= 11) {
      const satellite = this.birdManager.ensureSatelliteSpawned();
      this.targetedBird = satellite;
      this.aimAtTarget(satellite);
    } else {
      // Ensure satellite is NOT present if folds < 11
      this.birdManager.despawnSatellite();
      if (this.targetedBird?.type === 'satellite') {
        this.targetedBird = null;
      }
    }

    this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);
    if (this.onPhaseChange) this.onPhaseChange(this.phase);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public enterFoldingMode() {
    if (this.phase === 'flying') return;
    this.phase = 'folding';
    this.paper.trajectoryLine.visible = false;
    this.lockOnReticle.visible = false;
    if (this.onPhaseChange) this.onPhaseChange(this.phase);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public toggleAutoAim(): boolean {
    this.autoAim = !this.autoAim;
    if (!this.autoAim) {
      this.targetedBird = null;
      this.lockOnReticle.visible = false;
      if (this.phase === 'aiming') {
        this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, false);
      }
    }
    return this.autoAim;
  }

  public foldPaper() {
    if (this.phase === 'flying' || this.paper.isFolding) return;

    if (this.phase === 'aiming') {
      this.enterFoldingMode();
    }

    sound.playPianoNote(this.paper.folds);

    this.paper.fold(() => {
      const folds = this.paper.folds;
      // Satellite triggers exclusively at 11+ folds!
      if (folds >= 11) {
        this.birdManager.ensureSatelliteSpawned();
        if (folds === 11) {
          sound.playMacStartupChime(); // Majestic orbit insertion chime!
        }
      } else {
        this.birdManager.despawnSatellite();
      }
      if (this.onStatsChanged) this.onStatsChanged();
    });
  }

  public resetNewSheet() {
    this.state.paperCount++;
    this.paper.resetNewSheet();
    this.birdManager.despawnSatellite();
    this.targetedBird = null;
    this.enterFoldingMode();
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public launchPaper() {
    if (this.paper.isFlying || this.paper.isFolding) return;

    if (this.phase === 'folding') {
      this.enterAimingMode();
      return;
    }

    this.phase = 'flying';
    this.screenShake = 0.15; // Crisp shooter kick!
    this.lockOnReticle.visible = false;
    this.paper.launch(this.pitchDeg, this.yawDeg, this.powerPercent);
    if (this.onPhaseChange) this.onPhaseChange(this.phase);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  private triggerFaltality(bird: BirdData) {
    this.timeScale = 0.25;
    this.slowMoTimer = 1.2;
    this.screenShake = 0.45; // Satisfying hit impact!

    const foldBonusMultiplier = 1 + this.paper.folds * 0.5;
    const pointsAwarded = Math.round(bird.scoreValue * foldBonusMultiplier);

    this.state.score += pointsAwarded;
    this.state.birdsHitCount++;
    this.state.currentCombo++;
    if (this.state.currentCombo > this.state.bestCombo) {
      this.state.bestCombo = this.state.currentCombo;
    }

    sound.playFaltality();
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ff3b30', '#ffd700', '#4cd964', '#5ac8fa', '#5856d6']
    });

    if (this.onFaltality) {
      this.onFaltality(bird, this.paper.folds, pointsAwarded);
    }
  }

  private handleFlightFinished() {
    if (this.isResettingCam) return;
    this.isResettingCam = true;

    // Overkill crater effect for overfolded missed throws
    if (this.paper.folds >= 5) {
      this.screenShake = 0.6;
      sound.playGroundImpact();
      sound.playCarAlarm();
      if (this.onOverkillCrater) {
        this.onOverkillCrater(this.paper.folds);
      }
    }

    if (this.onFlightEnd) this.onFlightEnd();

    // Snappy reset
    setTimeout(() => {
      this.state.paperCount++;
      this.paper.resetNewSheet();
      this.birdManager.despawnSatellite();
      this.targetedBird = null;
      this.phase = 'folding';
      this.paper.trajectoryLine.visible = false;
      this.isResettingCam = false;
      if (this.onPhaseChange) this.onPhaseChange(this.phase);
      if (this.onStatsChanged) this.onStatsChanged();
    }, 600);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private handleArrowKeyAiming(delta: number) {
    if (this.phase !== 'aiming') return;

    const aimSpeed = 48.0 * delta;
    let changed = false;

    if (this.keysPressed['ArrowUp']) {
      this.pitchDeg = Math.min(80, this.pitchDeg + aimSpeed);
      changed = true;
    }
    if (this.keysPressed['ArrowDown']) {
      this.pitchDeg = Math.max(15, this.pitchDeg - aimSpeed);
      changed = true;
    }
    if (this.keysPressed['ArrowLeft']) {
      this.yawDeg = Math.min(55, this.yawDeg + aimSpeed);
      changed = true;
    }
    if (this.keysPressed['ArrowRight']) {
      this.yawDeg = Math.max(-55, this.yawDeg - aimSpeed);
      changed = true;
    }

    if (changed) {
      this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);
      if (this.onStatsChanged) this.onStatsChanged();
    }
  }

  private updateAutoAim(delta: number) {
    if (!this.autoAim || this.phase !== 'aiming') {
      this.lockOnReticle.visible = false;
      return;
    }

    const stats = this.paper.getStats();

    // If folds < 11, satellite cannot be locked!
    if (stats.folds < 11 && this.targetedBird?.type === 'satellite') {
      this.targetedBird = null;
    }

    // Only pick a new target if we don't have one or if the current one died
    if (!this.targetedBird || !this.targetedBird.alive) {
      const reachableBirds = this.birdManager.birds.filter((b: BirdData) => {
        if (!b.alive) return false;
        if (b.type === 'satellite' && stats.folds < 11) return false;
        return b.baseAltitude <= stats.maxAltitudeM * 1.25;
      });

      if (reachableBirds.length > 0) {
        const satellite = reachableBirds.find(b => b.type === 'satellite');
        if (satellite && stats.folds >= 11) {
          this.targetedBird = satellite;
        } else if (stats.folds >= 9 && stats.folds <= 10) {
          const plane = reachableBirds.find(b => b.type === 'airplane');
          this.targetedBird = plane || reachableBirds[0];
        } else {
          reachableBirds.sort((a: BirdData, b: BirdData) => Math.abs(a.mesh.position.x) - Math.abs(b.mesh.position.x));
          this.targetedBird = reachableBirds[0];
        }
      } else {
        this.targetedBird = null;
      }
    }

    if (this.targetedBird && this.targetedBird.alive) {
      const bird = this.targetedBird;

      // Color code reticle by target type!
      if (bird.type === 'satellite') {
        this.reticleMat.color.setHex(0xffd700); // Brilliant Gold
        this.lockOnReticle.scale.set(1.5, 1.5, 1.5);
      } else if (bird.type === 'airplane') {
        this.reticleMat.color.setHex(0x0984e3); // Sky Blue
        this.lockOnReticle.scale.set(1.2, 1.2, 1.2);
      } else {
        this.reticleMat.color.setHex(0x28cd41); // Classic Green
        this.lockOnReticle.scale.set(1.0, 1.0, 1.0);
      }

      this.lockOnReticle.visible = true;
      this.lockOnReticle.position.copy(bird.mesh.position);
      this.lockOnReticle.lookAt(this.camera.position);
      this.lockOnReticle.rotation.z += 2.2 * delta;

      // Smooth auto-track if player is not actively pressing arrow keys
      if (!this.paper.isFlying && !this.keysPressed['ArrowUp'] && !this.keysPressed['ArrowDown'] && !this.keysPressed['ArrowLeft'] && !this.keysPressed['ArrowRight']) {
        const paperPos = this.paper.mesh.position;
        const dist = paperPos.distanceTo(bird.mesh.position);
        const baseSpeed = 24.0 + stats.folds * 15.0;
        const flightSpeed = baseSpeed * (this.powerPercent / 100);
        const timeToHit = Math.max(0.05, dist / flightSpeed);

        const predictedX = bird.mesh.position.x + bird.speed * timeToHit * 0.98;
        const predictedY = bird.mesh.position.y + 0.5 * 9.81 * (timeToHit * timeToHit * 0.25);
        const predictedZ = bird.mesh.position.z;

        const dx = predictedX - paperPos.x;
        const dy = predictedY - paperPos.y;
        const dz = predictedZ - paperPos.z;
        const horizontalDist = Math.sqrt(dx * dx + dz * dz);

        const targetYaw = THREE.MathUtils.radToDeg(Math.atan2(-dx, -dz));
        const targetPitch = Math.min(78, Math.max(18, THREE.MathUtils.radToDeg(Math.atan2(dy, horizontalDist))));

        this.yawDeg = THREE.MathUtils.lerp(this.yawDeg, targetYaw, 0.2);
        this.pitchDeg = THREE.MathUtils.lerp(this.pitchDeg, targetPitch, 0.2);

        this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, true);
      }
    } else {
      this.lockOnReticle.visible = false;
      if (!this.paper.isFlying) {
        this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, false);
      }
    }
  }

  private animate(currentTime: number) {
    requestAnimationFrame(this.animate.bind(this));

    const rawDelta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const delta = Math.min(rawDelta, 0.1) * this.timeScale;

    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= rawDelta;
      if (this.slowMoTimer <= 0) {
        this.timeScale = 1.0;
      }
    }

    this.environment.update(delta);
    this.birdManager.update(delta);

    this.handleArrowKeyAiming(delta);
    this.updateAutoAim(delta);

    if (this.paper.isFlying) {
      const homingTarget = (this.autoAim && this.targetedBird && this.targetedBird.alive) 
        ? this.targetedBird.mesh.position 
        : null;

      const flightFinished = this.paper.updatePhysics(delta, homingTarget);

      const paperPos = this.paper.mesh.position;
      const stats = this.paper.getStats();
      const paperRadius = Math.max(stats.width, stats.length) * 0.5;
      const hitTolerance = this.autoAim ? 2.2 : 1.2;

      for (const bird of this.birdManager.birds) {
        if (!bird.alive) continue;

        // CRUCIAL ANTI-INTERCEPTION:
        // If the player locked on the Tim Cook Satellite, intermediate airliners MUST NOT intercept the shot!
        if (this.targetedBird?.type === 'satellite' && bird.type === 'airplane') {
          continue; // Pierce right past the airliner into space!
        }

        const dist = paperPos.distanceTo(bird.mesh.position);
        if (dist < bird.radius + paperRadius + hitTolerance) {
          this.birdManager.hitBird(bird, this.paper.velocity);
          this.triggerFaltality(bird);
          this.paper.velocity.multiplyScalar(0.35);
          this.paper.velocity.y = -3;
          break;
        }
      }

      if (flightFinished) {
        this.handleFlightFinished();
      }
    }

    // DYNAMIC FIRST-PERSON CAMERA AIMING:
    // Full spherical projection based on pitchDeg and yawDeg!
    if (this.phase === 'aiming' || this.phase === 'flying') {
      this.targetCamPos.copy(this.aimCamPos);

      const pitchRad = THREE.MathUtils.degToRad(this.pitchDeg);
      const yawRad = THREE.MathUtils.degToRad(this.yawDeg);
      const lookDist = 25.0;

      this.targetCamLookAt.set(
        this.aimCamPos.x - Math.sin(yawRad) * Math.cos(pitchRad) * lookDist,
        this.aimCamPos.y + Math.sin(pitchRad) * lookDist,
        this.aimCamPos.z - Math.cos(yawRad) * Math.cos(pitchRad) * lookDist
      );
    } else {
      this.targetCamPos.copy(this.foldCamPos);
      this.targetCamLookAt.copy(this.foldCamTarget);
    }

    const camLerpSpeed = this.phase === 'flying' ? 0.25 : 0.15;
    this.camera.position.lerp(this.targetCamPos, camLerpSpeed);

    // Apply screen shake if active
    if (this.screenShake > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.screenShake;
      this.camera.position.y += (Math.random() - 0.5) * this.screenShake;
      this.screenShake *= 0.88;
    }

    const currentLook = new THREE.Vector3();
    this.camera.getWorldDirection(currentLook);
    const targetDir = this.targetCamLookAt.clone().sub(this.camera.position).normalize();
    currentLook.lerp(targetDir, camLerpSpeed);
    this.camera.lookAt(this.camera.position.clone().add(currentLook));

    this.renderer.render(this.scene, this.camera);
  }
}
