import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { Environment } from './models/environment';
import { BirdManager } from './models/birds';
import type { BirdData } from './models/birds';
import { PaperSheet } from './models/paper';
import type { CreaseQuality } from './models/paper';
import { GOOSE_PALETTE } from './materials';
import { sound } from './sound';
import { CAMPAIGN_LEVELS, CampaignProgressManager } from './levels';
import type { CampaignLevel } from './levels';

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
  public renderer: THREE.WebGLRenderer;

  public environment: Environment;
  public birdManager: BirdManager;
  public paper: PaperSheet;

  // 2-Phase Game Loop: 'folding' -> 'aiming' -> 'flying'
  public phase: GamePhase = 'folding';

  // 90s Arcade Auto-Aim & Fast Reaction Lock (Default ON for fast-paced arcade action!)
  public autoAim: boolean = true;
  public targetedBird: BirdData | null = null;
  private lockOnReticle: THREE.Group;
  private reticleMat: THREE.MeshBasicMaterial;

  // Aiming parameters
  public pitchDeg: number = 42;
  public yawDeg: number = 0;
  public powerPercent: number = 85;

  // Camera animation positions
  // 1. Folding mode: warm, readable table framing with wide FOV (O'Reilly book & coffee in full view!)
  private foldCamPos = new THREE.Vector3(0, 2.30, 2.15);
  private foldCamTarget = new THREE.Vector3(0, 1.22, 0.05);

  // 2. Aiming & Shooting mode (Moorhuhn Style): stationary PoV overlooking the sky
  private aimCamPos = new THREE.Vector3(0, 2.05, 3.8);

  // 3. Chaos Wide Pan-Out Cam: Elevated overview of garden, neighbor car and fainting sheep!
  private chaosCamPos = new THREE.Vector3(0, 5.8, 9.2);
  private chaosCamTarget = new THREE.Vector3(0.5, 1.2, -18.0);
  public isChaosSpectating: boolean = false;

  // Level Progression: Level 1 -> Level 2
  public static readonly LEVEL1_TARGET_SCORE = 3000;
  public currentLevelId: number = 1;
  public level2Unlocked: boolean = false;
  public onLevelUnlocked?: (levelId: number) => void;
  public onLevelSwitch?: (levelId: number) => void;
  public onBoatHit?: (points: number) => void;

  private targetCamPos = new THREE.Vector3();
  private targetCamLookAt = new THREE.Vector3();

  // Screen shake for punchy arcade feel
  private screenShake: number = 0;

  // Slow-motion & game state
  private timeScale: number = 1.0;
  private slowMoTimer: number = 0;
  private isResettingCam: boolean = false;
  private hitTargetThisFlight: boolean = false;
  private hitEndFlightTimer: number | null = null;
  private flightResetTimer: number | null = null;

  public state: GameState = {
    score: 0,
    birdsHitCount: 0,
    bestCombo: 0,
    currentCombo: 0,
    paperCount: 1
  };

  // Keyboard state for smooth arrow key aiming
  public keysPressed: Record<string, boolean> = {};

  // Free-Look & Head Pan Offsets from the table
  public foldYawOffset: number = 0;
  public foldPitchOffset: number = 0;
  public isManualAiming: boolean = false;

  // Foil Unlock score requirement
  public static readonly FOIL_UNLOCK_SCORE = 500;
  public onFoilUnlocked?: () => void;

  public isFoilUnlocked(): boolean {
    return this.state.score >= FaltalityGame.FOIL_UNLOCK_SCORE;
  }

  public onStatsChanged?: () => void;
  public onFaltality?: (bird: BirdData, folds: number, scoreAward: number) => void;
  public onOverkillCrater?: (folds: number) => void;
  public onFlightEnd?: () => void;
  public onPhaseChange?: (phase: GamePhase) => void;

  // Boss: iPhone Duo callbacks
  public bossSpawnedOnce: boolean = false;
  public onBossSpawn?: (boss: BirdData) => void;
  public onBossDamage?: (boss: BirdData, currentHp: number, maxHp: number, isCritical?: boolean) => void;
  public onBossDefeat?: (boss: BirdData) => void;
  public onShieldDeflect?: (bird: BirdData) => void;

  // Active Crease Timing Minigame (Gears / Mario Golf Style)
  public isCreasing: boolean = false;
  public creaseStartTime: number = 0;
  public creaseDuration: number = 650; // ms per sweep
  public sweetspotStart: number = 0.52; // 52% of gauge
  public sweetspotEnd: number = 0.78;   // 78% of gauge
  public onCreaseStart?: (data: { duration: number; sweetspotStart: number; sweetspotEnd: number }) => void;
  public onCreaseProgress?: (progress: number) => void;
  public onCreaseResult?: (quality: CreaseQuality, perfectCount: number) => void;

  // Campaign Mode State & Progression
  public gameMode: 'sandbox' | 'campaign' = 'sandbox';
  public currentLevel: CampaignLevel | null = null;
  public levelSheetsRemaining: number = 0;
  public levelSheetsUsed: number = 0;
  public levelTargetsHit: number = 0;
  public levelObjectiveMet: boolean = false;
  public levelMaxFoldsUsed: number = 0;
  public levelScoreStart: number = 0;

  public onLevelComplete?: (level: CampaignLevel, stars: number, score: number, isNewRecord: boolean, newlyUnlocked?: number) => void;
  public onLevelFailed?: (level: CampaignLevel, reason: string) => void;
  public onGameModeChange?: (mode: 'sandbox' | 'campaign', level?: CampaignLevel | null) => void;

  // Direct Look & Hold-to-Charge Slingshot State
  public isCharging: boolean = false;
  public chargePower: number = 20;
  public chargeScreenX: number = 0;
  public chargeScreenY: number = 0;

  // Backyard Chaos hit callbacks
  public onCatHit?: (points: number) => void;
  public onGrillHit?: (points: number) => void;
  public onCarHit?: (points: number) => void;

  // Slingshot State & Listeners
  public isSlingshotDragging: boolean = false;
  public slingshotTension: number = 0; // 0.0 to 1.0
  public onSlingshotDrag?: (data: { active: boolean; tension: number; power: number; pitch: number; yaw: number; screenX: number; screenY: number }) => void;
  public flightDuration: number = 0;

  private lastTime: number = 0;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(container: HTMLElement) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(GOOSE_PALETTE.sky);
    this.scene.fog = new THREE.Fog(GOOSE_PALETTE.fog, 65, 260);

    this.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 600);
    this.camera.position.copy(this.foldCamPos);
    this.targetCamPos.copy(this.foldCamPos);
    this.targetCamLookAt.copy(this.foldCamTarget);
    this.camera.lookAt(this.foldCamTarget);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();

    this.environment = new Environment(this.scene);
    this.environment.setFoilUnlocked(this.isFoilUnlocked());
    this.birdManager = new BirdManager(this.scene);
    this.birdManager.initFlocks();
    this.paper = new PaperSheet(this.scene);

    // Table physical reaction on thick folds
    this.paper.onHeavyFold = (folds) => {
      this.screenShake = folds >= 9 ? 0.48 : 0.24;
      this.environment.shakeMug(folds >= 9 ? 1.6 : 1.1);
    };

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
    // Soft sky and grass bounce light
    const hemiLight = new THREE.HemisphereLight(GOOSE_PALETTE.hemiSky, GOOSE_PALETTE.hemiGround, 0.85);
    this.scene.add(hemiLight);

    // Warm British afternoon sun in 45-degree angle
    const sunLight = new THREE.DirectionalLight(GOOSE_PALETTE.sunLight, 1.45);
    sunLight.position.set(30, 48, 22);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -45;
    sunLight.shadow.camera.right = 45;
    sunLight.shadow.camera.top = 45;
    sunLight.shadow.camera.bottom = -45;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    // Gentle ambient light to keep pastel shadows readable
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.35);
    this.scene.add(ambientLight);
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

      // Generous yaw range to easily look left at the sheep or right at the neighbor's house!
      this.yawDeg = Math.max(-75, Math.min(75, initialYaw - deltaX * 0.25));
      this.pitchDeg = Math.max(12, Math.min(80, initialPitch + deltaY * 0.28));

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
  public resetCameraLook() {
    this.foldYawOffset = 0;
    this.foldPitchOffset = 0;
    this.isManualAiming = false;
    this.isChaosSpectating = false;
    if (this.phase === 'aiming') {
      this.enterFoldingMode();
    } else {
      if (this.onStatsChanged) this.onStatsChanged();
    }
  }

  public summonBoss(): BirdData {
    // Clear chaos camera immediately so player is not stuck in garden overview
    this.isChaosSpectating = false;

    // Cancel pending flight timers
    if (this.flightResetTimer) {
      clearTimeout(this.flightResetTimer);
      this.flightResetTimer = null;
    }
    if (this.hitEndFlightTimer) {
      clearTimeout(this.hitEndFlightTimer);
      this.hitEndFlightTimer = null;
    }
    this.isResettingCam = false;

    // If paper was in flight, cleanly reset it to table
    if (this.paper.isFlying) {
      this.paper.isFlying = false;
      this.paper.mesh.position.copy(this.paper.initialTablePos);
      this.paper.velocity.set(0, 0, 0);
    }

    const boss = this.birdManager.ensureBossSpawned();
    this.targetedBird = boss;
    this.bossSpawnedOnce = true;
    sound.playOneMoreThingIntro();

    // Directly enter aiming mode and lock onto boss in the sky!
    this.phase = 'aiming';
    this.foldYawOffset = 0;
    this.foldPitchOffset = 0;
    this.isManualAiming = false;
    this.aimAtTarget(boss);

    if (this.onBossSpawn) this.onBossSpawn(boss);
    if (this.onPhaseChange) this.onPhaseChange(this.phase);
    if (this.onStatsChanged) this.onStatsChanged();
    return boss;
  }

  public cycleTarget(direction: number = 1) {
    const aliveBirds = this.birdManager.birds.filter(b => b.alive);
    if (aliveBirds.length === 0) return;

    const stats = this.paper.getStats();
    const boss = aliveBirds.find(b => b.type === 'iphone_duo');
    const satellite = aliveBirds.find(b => b.type === 'satellite');

    if (boss && this.targetedBird !== boss && this.targetedBird === null) {
      this.targetedBird = boss;
    } else if (stats.folds >= 11 && satellite && this.targetedBird !== satellite && !boss) {
      this.targetedBird = satellite;
    } else {
      const currentIndex = this.targetedBird ? aliveBirds.indexOf(this.targetedBird) : -1;
      const nextIndex = (currentIndex + direction + aliveBirds.length) % aliveBirds.length;
      this.targetedBird = aliveBirds[nextIndex];
    }

    if (this.targetedBird) {
      sound.playLockOn();
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
    this.isCreasing = false;
    this.isChaosSpectating = false;
    this.phase = 'aiming';
    this.foldYawOffset = 0;
    this.foldPitchOffset = 0;
    this.isManualAiming = false;

    const stats = this.paper.getStats();
    const boss = this.birdManager.birds.find(b => b.alive && b.type === 'iphone_duo');

    if (boss) {
      // Prioritize boss if summoned!
      this.targetedBird = boss;
      sound.playLockOn();
      this.aimAtTarget(boss);
    } else if (stats.folds >= 11) {
      // Auto-acquire satellite if high fold stage (11+)!
      const satellite = this.birdManager.ensureSatelliteSpawned();
      this.targetedBird = satellite;
      sound.playLockOn();
      this.aimAtTarget(satellite);
    } else {
      // Ensure satellite is NOT present if folds < 11
      this.birdManager.despawnSatellite();
      if (this.targetedBird?.type === 'satellite' || (this.targetedBird && !this.targetedBird.alive)) {
        this.targetedBird = null;
      }
      // 90s Arcade Auto-Aim: Automatically acquire nearest living target!
      if (this.autoAim && this.targetedBird === null) {
        const aliveBirds = this.birdManager.birds.filter(b => b.alive);
        if (aliveBirds.length > 0) {
          aliveBirds.sort((a, b) => Math.abs(a.mesh.position.x) - Math.abs(b.mesh.position.x));
          this.targetedBird = aliveBirds[0];
          sound.playLockOn();
          this.aimAtTarget(this.targetedBird);
        }
      }
    }

    this.paper.setSlingshotVisible(true);
    this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);
    if (this.onPhaseChange) this.onPhaseChange(this.phase);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public enterFoldingMode() {
    if (this.phase === 'flying') return;
    this.cancelSlingshotDrag();
    this.isChaosSpectating = false;
    this.phase = 'folding';
    this.paper.trajectoryLine.visible = false;
    this.paper.setSlingshotVisible(false);
    this.lockOnReticle.visible = false;
    this.foldYawOffset = 0;
    this.foldPitchOffset = 0;
    this.isManualAiming = false;
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

  public toggleMaterial(): "paper" | "foil" {
    if (this.phase === "flying" || this.paper.isFolding) return this.paper.materialType;
    if (!this.isFoilUnlocked()) return this.paper.materialType;
    this.paper.materialType = this.paper.materialType === "paper" ? "foil" : "paper";
    this.paper.rebuildMesh();
    if (this.paper.materialType === "foil") {
      sound.playFoilCrinkle(this.paper.folds);
    } else {
      sound.playNewPaper();
    }
    this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);
    if (this.onStatsChanged) this.onStatsChanged();
    return this.paper.materialType;
  }

  public triggerFoldAction() {
    if (this.phase === 'flying' || this.paper.isFolding) return;

    if (this.phase === 'aiming') {
      this.enterFoldingMode();
      return;
    }

    if (!this.isCreasing) {
      this.startCreaseMinigame();
    } else {
      this.commitCreaseMinigame();
    }
  }

  public startCreaseMinigame() {
    if (this.phase === 'flying' || this.paper.isFolding || this.isCreasing) return;
    this.isCreasing = true;
    this.creaseStartTime = performance.now();

    // Dynamic difficulty and randomized beat / sweetspot position
    const folds = this.paper.folds;
    let sweetspotWidth = 0.24;
    if (folds <= 2) {
      sweetspotWidth = 0.23 + Math.random() * 0.05; // 23% - 28% wide
    } else if (folds <= 6) {
      sweetspotWidth = 0.16 + Math.random() * 0.04; // 16% - 20% wide
    } else {
      sweetspotWidth = 0.11 + Math.random() * 0.03; // 11% - 14% wide (Tight Master Fold!)
    }

    // Dynamic randomized position across the gauge (20% to 92% - width)
    const minStart = 0.20;
    const maxStart = Math.max(minStart, 0.92 - sweetspotWidth);
    this.sweetspotStart = minStart + Math.random() * (maxStart - minStart);
    this.sweetspotEnd = this.sweetspotStart + sweetspotWidth;

    // Dynamic duration with jitter:
    // Base duration scales down from 760ms to 520ms, plus +/- 120ms random jitter!
    const baseDuration = Math.max(500, 760 - folds * 28);
    const jitter = (Math.random() - 0.5) * 240;
    this.creaseDuration = Math.round(Math.max(420, Math.min(880, baseDuration + jitter)));

    if (this.onCreaseStart) {
      this.onCreaseStart({
        duration: this.creaseDuration,
        sweetspotStart: this.sweetspotStart,
        sweetspotEnd: this.sweetspotEnd
      });
    }
  }

  public commitCreaseMinigame() {
    if (!this.isCreasing) return;
    this.isCreasing = false;

    const elapsed = performance.now() - this.creaseStartTime;
    const progress = Math.min(1.0, elapsed / this.creaseDuration);

    let quality: CreaseQuality = 'good';
    if (progress >= this.sweetspotStart && progress <= this.sweetspotEnd) {
      quality = 'perfect';
    } else if (progress < this.sweetspotStart) {
      const earlyTolerance = 0.12;
      quality = progress >= (this.sweetspotStart - earlyTolerance) ? 'good' : 'imperfect';
    } else {
      const lateTolerance = 0.12;
      quality = progress <= (this.sweetspotEnd + lateTolerance) ? 'good' : 'imperfect';
    }

    this.executeFold(quality);
  }

  public autoCommitCreaseTimeout() {
    if (!this.isCreasing) return;
    this.isCreasing = false;
    this.executeFold('good');
  }

  public executeFold(quality: CreaseQuality = 'good') {
    if (this.onCreaseResult) {
      const nextCount = this.paper.perfectCreaseCount + (quality === 'perfect' ? 1 : 0);
      this.onCreaseResult(quality, nextCount);
    }

    this.paper.fold(quality, () => {
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

  public foldPaper() {
    this.triggerFoldAction();
  }

  public resetNewSheet() {
    this.isCreasing = false;
    this.state.paperCount++;
    if (!this.isFoilUnlocked()) {
      this.paper.materialType = 'paper';
    }
    this.paper.resetNewSheet();
    this.birdManager.despawnSatellite();
    this.targetedBird = null;
    this.isChaosSpectating = false;
    this.hitTargetThisFlight = false;
    this.enterFoldingMode();
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public launchPaper() {
    if (this.paper.isFlying || this.paper.isFolding) return;

    if (this.phase === 'folding') {
      this.enterAimingMode();
      return;
    }

    this.cancelSlingshotDrag();
    this.hitTargetThisFlight = false;
    this.isChaosSpectating = false;
    this.phase = 'flying';
    this.flightDuration = 0;

    if (this.gameMode === 'campaign' && this.currentLevel) {
      this.levelSheetsRemaining = Math.max(0, this.levelSheetsRemaining - 1);
      this.levelSheetsUsed++;
      this.levelMaxFoldsUsed = Math.max(this.levelMaxFoldsUsed, this.paper.folds);
    }

    this.screenShake = 0.15; // Crisp shooter kick!
    this.lockOnReticle.visible = false;
    this.paper.launch(this.pitchDeg, this.yawDeg, this.powerPercent);
    if (this.onPhaseChange) this.onPhaseChange(this.phase);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  // Direct Look: Move trackpad/mouse freely to point crosshair/camera at sky
  public updateAimPointer(clientX: number, clientY: number) {
    if (this.phase !== 'aiming' || this.isChaosSpectating) return;

    // Viewport-normalized coordinates: X in [-1, 1], Y in [-1, 1]
    const normX = (clientX / window.innerWidth) * 2 - 1;
    const normY = (clientY / window.innerHeight) * 2 - 1;

    // Pitch: higher on screen = aim higher (up to 78 deg), lower = aim lower (down to 14 deg)
    const targetPitch = 42 - normY * 34;
    this.pitchDeg = Math.max(12, Math.min(80, Math.round(targetPitch)));

    // Yaw: center is 0 deg, left (normX = -1) turns left (+58 deg), right turns right (-58 deg)
    const targetYaw = -normX * 58;
    this.yawDeg = Math.max(-75, Math.min(75, Math.round(targetYaw)));

    this.isManualAiming = true;
    this.chargeScreenX = clientX;
    this.chargeScreenY = clientY;

    this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  // Hold-to-Charge: Press & hold pointer or Spacebar to charge shot power from 20% to 100%!
  public startChargingShot(screenX: number, screenY: number): boolean {
    if (this.paper.isFlying || this.paper.isFolding) return false;

    if (this.phase === 'folding') {
      this.enterAimingMode();
    }

    this.isCharging = true;
    this.isSlingshotDragging = true;
    const basePower = (this.autoAim && this.targetedBird) ? 80 : 20;
    this.chargePower = basePower;
    this.chargeScreenX = screenX;
    this.chargeScreenY = screenY;
    this.powerPercent = basePower;
    this.slingshotTension = Math.max(0.05, (basePower - 20) / 80);
    if (!this.autoAim || !this.targetedBird) {
      this.isManualAiming = true;
      this.lockOnReticle.visible = false;
    }

    // Initial subtle pull on rubber bands
    this.paper.setSlingshotPull(new THREE.Vector3(0, -0.01, 0.04), this.slingshotTension);
    this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);

    if (this.onSlingshotDrag) {
      this.onSlingshotDrag({
        active: true,
        tension: 0.05,
        power: 20,
        pitch: this.pitchDeg,
        yaw: this.yawDeg,
        screenX,
        screenY
      });
    }

    return true;
  }

  // Release charged shot: Fires immediately with crisp audio and high precision
  public releaseChargeShot(): boolean {
    if (!this.isCharging && !this.isSlingshotDragging) return false;
    this.isCharging = false;
    this.isSlingshotDragging = false;

    sound.playSlingRelease();
    this.paper.setSlingshotPull(null, 0);

    if (this.onSlingshotDrag) {
      this.onSlingshotDrag({
        active: false,
        tension: 0,
        power: this.powerPercent,
        pitch: this.pitchDeg,
        yaw: this.yawDeg,
        screenX: 0,
        screenY: 0
      });
    }

    this.launchPaper();
    return true;
  }

  // Cancel charging safely
  public cancelChargingShot() {
    this.isCharging = false;
    this.isSlingshotDragging = false;
    this.slingshotTension = 0;
    this.paper.setSlingshotPull(null, 0);
    this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);

    if (this.onSlingshotDrag) {
      this.onSlingshotDrag({
        active: false,
        tension: 0,
        power: this.powerPercent,
        pitch: this.pitchDeg,
        yaw: this.yawDeg,
        screenX: 0,
        screenY: 0
      });
    }
  }

  // Slingshot alias methods for backwards compatibility
  public startSlingshotDrag(screenX: number, screenY: number): boolean {
    return this.startChargingShot(screenX, screenY);
  }

  public updateSlingshotDrag(screenX: number, screenY: number) {
    this.chargeScreenX = screenX;
    this.chargeScreenY = screenY;
    this.updateAimPointer(screenX, screenY);
  }

  public releaseSlingshotDrag(): boolean {
    return this.releaseChargeShot();
  }

  public cancelSlingshotDrag() {
    this.cancelChargingShot();
  }

  private triggerFaltality(bird: BirdData) {
    this.hitTargetThisFlight = true;
    this.timeScale = 0.25;
    this.slowMoTimer = 1.2;
    this.screenShake = 0.45; // Satisfying hit impact!

    const foldBonusMultiplier = 1 + this.paper.folds * 0.5;
    const foilMult = this.paper.materialType === "foil" ? 2.0 : 1.0;
    const pointsAwarded = Math.round(bird.scoreValue * foldBonusMultiplier * foilMult);

    if (this.paper.materialType === "foil") {
      sound.playFoilClang();
    }

    const wasFoilUnlocked = this.isFoilUnlocked();
    this.state.score += pointsAwarded;
    this.state.birdsHitCount++;
    this.state.currentCombo++;
    if (this.state.currentCombo > this.state.bestCombo) {
      this.state.bestCombo = this.state.currentCombo;
    }
    this.checkLevelProgression();

    // Campaign Mode objective check:
    if (this.gameMode === 'campaign' && this.currentLevel) {
      if (this.currentLevel.targetAction === 'hit_birds') {
        if (this.currentLevel.targetBirdTypes.includes(bird.type)) {
          this.levelTargetsHit++;
          if (this.levelTargetsHit >= this.currentLevel.requiredTargetCount) {
            this.levelObjectiveMet = true;
          }
        }
      } else if (this.currentLevel.targetAction === 'defeat_boss') {
        if (bird.type === 'iphone_duo') {
          this.levelTargetsHit++;
          this.levelObjectiveMet = true;
        }
      }
    }

    if (!wasFoilUnlocked && this.isFoilUnlocked()) {
      this.environment.setFoilUnlocked(true);
      if (this.onFoilUnlocked) this.onFoilUnlocked();
    }

    // Comedic trigger: Airliners, Satellites and iPhone Duo scare the fainting sheep and trigger alarm!
    if (bird.type === 'airplane' || bird.type === 'satellite' || bird.type === 'iphone_duo') {
      this.environment.triggerFaintingSheep();
      this.environment.triggerCarAlarm();
      this.isChaosSpectating = true;
    }

    // Auto-summon iPhone Duo when score >= 15,000 or after satellite is pulverized!
    if ((this.state.score >= 15000 || bird.type === 'satellite') && !this.bossSpawnedOnce) {
      this.bossSpawnedOnce = true;
      setTimeout(() => {
        this.summonBoss();
      }, 1600);
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

  public fastResetFlight() {
    if (this.phase !== 'flying') return;
    if (this.hitEndFlightTimer) {
      clearTimeout(this.hitEndFlightTimer);
      this.hitEndFlightTimer = null;
    }
    if (this.flightResetTimer) {
      clearTimeout(this.flightResetTimer);
      this.flightResetTimer = null;
    }
    this.paper.isFlying = false;
    this.paper.velocity.set(0, 0, 0);
    this.isResettingCam = false;
    this.handleFlightFinished(true);
  }

  public checkLevelProgression() {
    if (this.currentLevelId === 1 && !this.level2Unlocked && this.state.score >= FaltalityGame.LEVEL1_TARGET_SCORE) {
      this.level2Unlocked = true;
      sound.playLevelUp();
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.45 },
        colors: ['#00d2d3', '#54a0ff', '#feca57', '#ff6b6b']
      });
      if (this.onLevelUnlocked) this.onLevelUnlocked(2);
    }
  }

  public switchLevel(levelId: number): boolean {
    if (levelId === 2 && !this.level2Unlocked && this.state.score < FaltalityGame.LEVEL1_TARGET_SCORE) {
      return false;
    }
    this.currentLevelId = levelId;
    this.environment.setLevel(levelId);
    this.targetedBird = null;
    this.lockOnReticle.visible = false;
    if (levelId === 1) {
      this.birdManager.initFlocks();
    } else if (levelId === 2) {
      this.birdManager.loadCoastFlocks();
    }
    this.enterFoldingMode();
    if (this.onLevelSwitch) this.onLevelSwitch(levelId);
    if (this.onStatsChanged) this.onStatsChanged();
    return true;
  }

  private handleFlightFinished(isFast: boolean = false) {
    if (this.hitEndFlightTimer) {
      clearTimeout(this.hitEndFlightTimer);
      this.hitEndFlightTimer = null;
    }

    if (this.isResettingCam && !isFast) return;
    this.isResettingCam = true;

    // Reset combo if player missed
    if (!this.hitTargetThisFlight) {
      this.state.currentCombo = 0;
    }

    // Overkill crater effect ONLY for overfolded missed throws (paper slamming into lawn/neighbor fence)
    const isOverkillMiss = !isFast && this.paper.folds >= 5 && !this.hitTargetThisFlight;
    if (isOverkillMiss) {
      this.screenShake = 0.6;
      sound.playGroundImpact();
      sound.playCarAlarm();

      // TRIGGER LIVING NEIGHBORHOOD:
      // Neighbor's car hazards flash & car bounces; fainting sheep keel over sideways!
      this.environment.triggerCarAlarm();
      this.environment.triggerFaintingSheep();
      this.isChaosSpectating = true;

      // Campaign Mode crater objective check:
      if (this.gameMode === 'campaign' && this.currentLevel?.targetAction === 'trigger_crater') {
        this.levelTargetsHit++;
        this.levelObjectiveMet = true;
      }

      if (this.onOverkillCrater) {
        this.onOverkillCrater(this.paper.folds);
      }
    }

    if (this.onFlightEnd) this.onFlightEnd();

    // Campaign Level Win/Loss resolution:
    if (this.gameMode === 'campaign' && this.currentLevel) {
      if (this.levelObjectiveMet) {
        const earnedStars = this.currentLevel.stars.checkStars({
          objectiveMet: true,
          sheetsUsed: this.levelSheetsUsed,
          maxSheets: this.currentLevel.maxSheets,
          perfectCreases: this.paper.perfectCreaseCount,
          score: this.state.score - this.levelScoreStart,
          maxFoldsUsed: this.levelMaxFoldsUsed
        });
        const scoreDelta = Math.max(0, this.state.score - this.levelScoreStart);
        const { isNewRecord, newlyUnlockedLevel } = CampaignProgressManager.saveLevelCompletion(
          this.currentLevel.id,
          earnedStars,
          scoreDelta
        );
        sound.playLevelVictoryFanfare();
        if (this.onLevelComplete) {
          this.onLevelComplete(this.currentLevel, earnedStars, scoreDelta, isNewRecord, newlyUnlockedLevel);
        }
        this.isResettingCam = false;
        return;
      } else if (this.levelSheetsRemaining <= 0) {
        sound.playLevelFailed();
        if (this.onLevelFailed) {
          this.onLevelFailed(this.currentLevel, 'no_sheets');
        }
        this.isResettingCam = false;
        return;
      }
    }

    // WIDE GARDEN CINEMATIC TIMEOUT:
    // If chaos occurred, pull camera back for a bit, but keep it snappy!
    const isBossActive = this.birdManager.birds.some(b => b.alive && b.type === 'iphone_duo');
    const resetDelay = isFast ? 0 : (this.isChaosSpectating ? (isBossActive ? 900 : 1500) : 250);

    if (this.flightResetTimer) {
      clearTimeout(this.flightResetTimer);
    }

    const doReset = () => {
      this.flightResetTimer = null;
      this.state.paperCount++;
      if (!this.isFoilUnlocked()) {
        this.paper.materialType = 'paper';
      }
      this.paper.resetNewSheet();
      this.birdManager.despawnSatellite();

      // Crucial: Retain boss target lock-on if active!
      if (this.targetedBird?.type !== 'iphone_duo') {
        this.targetedBird = null;
      }
      this.isChaosSpectating = false;
      this.hitTargetThisFlight = false;
      this.phase = 'folding';
      this.paper.trajectoryLine.visible = false;
      this.isResettingCam = false;
      if (this.onPhaseChange) this.onPhaseChange(this.phase);
      if (this.onStatsChanged) this.onStatsChanged();
    };

    if (resetDelay === 0) {
      doReset();
    } else {
      this.flightResetTimer = window.setTimeout(doReset, resetDelay);
    }
  }

  public startCampaignLevel(levelId: number) {
    const lvl = CAMPAIGN_LEVELS.find(l => l.id === levelId);
    if (!lvl) return;

    if (this.flightResetTimer) {
      clearTimeout(this.flightResetTimer);
      this.flightResetTimer = null;
    }

    this.gameMode = 'campaign';
    this.currentLevel = lvl;
    this.levelSheetsRemaining = lvl.maxSheets;
    this.levelSheetsUsed = 0;
    this.levelTargetsHit = 0;
    this.levelObjectiveMet = false;
    this.levelMaxFoldsUsed = 0;
    this.levelScoreStart = this.state.score;
    this.hitTargetThisFlight = false;
    this.isChaosSpectating = false;
    this.isResettingCam = false;
    this.targetedBird = null;

    this.birdManager.loadLevelSpawns(lvl.spawns);
    this.paper.resetNewSheet();
    this.enterFoldingMode();

    if (this.onGameModeChange) this.onGameModeChange('campaign', lvl);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public startSandboxMode() {
    if (this.flightResetTimer) {
      clearTimeout(this.flightResetTimer);
      this.flightResetTimer = null;
    }

    this.gameMode = 'sandbox';
    this.currentLevel = null;
    this.levelSheetsRemaining = 0;
    this.levelSheetsUsed = 0;
    this.levelTargetsHit = 0;
    this.levelObjectiveMet = false;
    this.levelMaxFoldsUsed = 0;
    this.hitTargetThisFlight = false;
    this.isChaosSpectating = false;
    this.isResettingCam = false;
    this.targetedBird = null;

    this.birdManager.clearAllBirds();
    this.birdManager.initFlocks();
    this.paper.resetNewSheet();
    this.enterFoldingMode();

    if (this.onGameModeChange) this.onGameModeChange('sandbox', null);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public retryCurrentLevel() {
    if (this.currentLevel) {
      this.startCampaignLevel(this.currentLevel.id);
    } else {
      this.startSandboxMode();
    }
  }

  public nextLevel() {
    if (this.currentLevel) {
      const nextId = this.currentLevel.id + 1;
      const nextLvl = CAMPAIGN_LEVELS.find(l => l.id === nextId);
      if (nextLvl) {
        this.startCampaignLevel(nextId);
      } else {
        this.startSandboxMode();
      }
    }
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private handleArrowKeyLook(delta: number) {
    const panSpeed = 62.0 * delta;

    if (this.phase === "folding") {
      if (this.keysPressed["ArrowUp"]) {
        this.foldPitchOffset = Math.min(65, this.foldPitchOffset + panSpeed);
      }
      if (this.keysPressed["ArrowDown"]) {
        this.foldPitchOffset = Math.max(-25, this.foldPitchOffset - panSpeed);
      }
      if (this.keysPressed["ArrowLeft"]) {
        this.foldYawOffset = Math.min(88, this.foldYawOffset + panSpeed);
      }
      if (this.keysPressed["ArrowRight"]) {
        this.foldYawOffset = Math.max(-88, this.foldYawOffset - panSpeed);
      }
    } else if (this.phase === "aiming") {
      let changed = false;
      if (this.keysPressed["ArrowUp"]) {
        this.pitchDeg = Math.min(85, this.pitchDeg + panSpeed);
        this.isManualAiming = true;
        changed = true;
      }
      if (this.keysPressed["ArrowDown"]) {
        this.pitchDeg = Math.max(10, this.pitchDeg - panSpeed);
        this.isManualAiming = true;
        changed = true;
      }
      if (this.keysPressed["ArrowLeft"]) {
        this.yawDeg = Math.min(88, this.yawDeg + panSpeed);
        this.isManualAiming = true;
        changed = true;
      }
      if (this.keysPressed["ArrowRight"]) {
        this.yawDeg = Math.max(-88, this.yawDeg - panSpeed);
        this.isManualAiming = true;
        changed = true;
      }

      if (changed) {
        this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, this.targetedBird !== null);
        if (this.onStatsChanged) this.onStatsChanged();
      }
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
        if (b.type === 'iphone_duo') return true; // Boss is always lockable!
        return b.baseAltitude <= stats.maxAltitudeM * 1.25;
      });

      if (reachableBirds.length > 0) {
        const boss = reachableBirds.find(b => b.type === 'iphone_duo');
        const satellite = reachableBirds.find(b => b.type === 'satellite');
        if (boss) {
          this.targetedBird = boss;
        } else if (satellite && stats.folds >= 11) {
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
      if (bird.type === 'iphone_duo') {
        this.reticleMat.color.setHex(0xff2d55); // Apple Electric Magenta
        this.lockOnReticle.scale.set(4.8, 4.8, 4.8); // Framed for gigantic iPhone Duo boss!
      } else if (bird.type === 'satellite') {
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

    this.handleArrowKeyLook(delta);
    this.updateAutoAim(delta);

    // Active Crease timing meter animation & auto-commit
    if (this.isCreasing) {
      const elapsed = performance.now() - this.creaseStartTime;
      const progress = Math.min(1.0, elapsed / this.creaseDuration);
      if (this.onCreaseProgress) {
        this.onCreaseProgress(progress);
      }
      if (elapsed >= this.creaseDuration) {
        this.autoCommitCreaseTimeout();
      }
    }

    // Hold-to-Charge Slingshot Tension accumulation
    if (this.isCharging) {
      this.chargePower = Math.min(100, this.chargePower + delta * 92);
      this.powerPercent = Math.round(this.chargePower);
      const tension = Math.min(1.0, (this.chargePower - 20) / 80);
      this.slingshotTension = tension;

      sound.playSlingStretch(tension);

      // Physical pull on rubber bands
      const pullZ = tension * 0.32;
      const pullY = -tension * 0.06;
      this.paper.setSlingshotPull(new THREE.Vector3(0, pullY, pullZ), tension);

      // Real-time Trajectory update matching charged power
      this.paper.updateTrajectory(this.pitchDeg, this.yawDeg, this.powerPercent, false);

      if (this.onSlingshotDrag) {
        this.onSlingshotDrag({
          active: true,
          tension,
          power: this.powerPercent,
          pitch: this.pitchDeg,
          yaw: this.yawDeg,
          screenX: this.chargeScreenX,
          screenY: this.chargeScreenY
        });
      }

      if (this.onStatsChanged) this.onStatsChanged();
    }

    if (this.paper.isFlying) {
      this.flightDuration += delta;
      const homingTarget = (this.autoAim && this.targetedBird && this.targetedBird.alive) 
        ? this.targetedBird.mesh.position 
        : null;

      let flightFinished = this.paper.updatePhysics(delta, homingTarget);

      // Auto-cut flight on miss so player returns quickly to table (max 2.8s or 4.0s for glider, or past horizon)
      const maxFlightTime = this.paper.getStats().archetype === 'glider' ? 4.0 : 2.8;
      const pastHorizon = this.paper.mesh.position.z < -65 || this.paper.mesh.position.length() > 95;
      if (!this.hitTargetThisFlight && (this.flightDuration > maxFlightTime || pastHorizon)) {
        this.paper.isFlying = false;
        this.paper.velocity.set(0, 0, 0);
        flightFinished = true;
      }

      const paperPos = this.paper.mesh.position;
      const stats = this.paper.getStats();
      const paperRadius = Math.max(stats.width, stats.length) * 0.5;
      const hitTolerance = this.autoAim ? 2.2 : 1.2;

      for (const bird of this.birdManager.birds) {
        if (!bird.alive) continue;

        // CRUCIAL ANTI-INTERCEPTION:
        // If locked on boss or satellite, intermediate low-altitude birds must not intercept the shot!
        if (this.targetedBird?.type === 'iphone_duo' && bird.type !== 'iphone_duo') {
          continue;
        }
        if (this.targetedBird?.type === 'satellite' && bird.type !== 'satellite') {
          continue;
        }

        const dist = paperPos.distanceTo(bird.mesh.position);
        if (dist < bird.radius + paperRadius + hitTolerance) {
          // Damage calculation: 1 HP for standard throws, 2 HP (critical) for 5+ folds or foil!
          const isCritical = this.paper.folds >= 5 || this.paper.materialType === 'foil';
          const damage = (bird.type === 'iphone_duo' && isCritical) ? 2 : 1;

          const destroyed = this.birdManager.hitBird(bird, this.paper.velocity, damage);
          if (destroyed) {
            this.triggerFaltality(bird);
            if (bird.type === 'iphone_duo' && this.onBossDefeat) {
              this.onBossDefeat(bird);
            }
          } else {
            // Boss took damage but survived
            this.screenShake = isCritical ? 0.65 : 0.35;
            this.timeScale = 0.3;
            this.slowMoTimer = 0.6;
            if (isCritical) {
              sound.playFoilClang();
            }
            if (this.onBossDamage) {
              this.onBossDamage(bird, bird.health ?? 0, bird.maxHealth ?? 4, isCritical);
            }
          }

          this.paper.velocity.multiplyScalar(0.35);
          this.paper.velocity.y = -3;

          // End flight promptly after hit spectacle so paper doesn't drift for 25s
          if (!this.hitEndFlightTimer) {
            this.hitEndFlightTimer = window.setTimeout(() => {
              this.hitEndFlightTimer = null;
              if (this.paper.isFlying) {
                this.paper.isFlying = false;
                this.handleFlightFinished();
              }
            }, 1000);
          }
          break;
        }
      }

      // Backyard & Coast Chaos: Check collisions with Sneaky Cat, Neighbor Grill, Car & Krabbenkutter!
      if (!this.hitTargetThisFlight) {
        if (this.environment.currentLevel === 1) {
          // 1. Sneaky Cat on fence
          const catPos = this.environment.getCatWorldPosition();
          if (paperPos.distanceTo(catPos) < paperRadius + this.environment.getCatBoundingRadius()) {
            if (this.environment.hitCat()) {
              this.hitTargetThisFlight = true;
              this.state.score += 500;
              this.state.currentCombo++;
              this.screenShake = 0.35;
              this.timeScale = 0.3;
              this.slowMoTimer = 0.7;
              this.paper.velocity.multiplyScalar(0.25);
              this.paper.velocity.y = 2.4;
              confetti({
                particleCount: 50,
                spread: 65,
                origin: { y: 0.6 },
                colors: ['#e67e22', '#f39c12', '#2ecc71']
              });
              if (this.onCatHit) this.onCatHit(500);
              this.checkLevelProgression();
              if (this.onStatsChanged) this.onStatsChanged();
            }
          }

          // 2. Neighbor BBQ Grill
          const grillPos = this.environment.getGrillWorldPosition();
          if (paperPos.distanceTo(grillPos) < paperRadius + this.environment.getGrillBoundingRadius()) {
            if (this.environment.hitGrill()) {
              this.hitTargetThisFlight = true;
              this.state.score += 300;
              this.state.currentCombo++;
              this.screenShake = 0.45;
              this.timeScale = 0.3;
              this.slowMoTimer = 0.8;
              this.paper.velocity.multiplyScalar(0.2);
              this.paper.velocity.y = -1.5;
              confetti({
                particleCount: 45,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#ff4500', '#e67e22', '#ffd700']
              });
              if (this.onGrillHit) this.onGrillHit(300);
              this.checkLevelProgression();
              if (this.onStatsChanged) this.onStatsChanged();
            }
          }

          // 3. Neighbor Car in Driveway
          const carPos = this.environment.getCarWorldPosition();
          if (paperPos.distanceTo(carPos) < paperRadius + this.environment.getCarBoundingRadius()) {
            this.environment.triggerCarAlarm();
            this.hitTargetThisFlight = true;
            this.state.score += 250;
            this.state.currentCombo++;
            this.screenShake = 0.45;
            this.isChaosSpectating = true;
            this.paper.velocity.multiplyScalar(0.25);
            this.paper.velocity.y = 1.8;
            if (this.onCarHit) this.onCarHit(250);
            this.checkLevelProgression();
            if (this.onStatsChanged) this.onStatsChanged();
          }
        } else if (this.environment.currentLevel === 2) {
          // Level 2: Krabbenkutter Boat in the bay!
          const boatPos = this.environment.getBoatWorldPosition();
          if (paperPos.distanceTo(boatPos) < paperRadius + this.environment.getBoatBoundingRadius()) {
            if (this.environment.hitBoat()) {
              this.hitTargetThisFlight = true;
              this.state.score += 350;
              this.state.currentCombo++;
              this.screenShake = 0.45;
              this.timeScale = 0.3;
              this.slowMoTimer = 0.8;
              this.paper.velocity.multiplyScalar(0.2);
              this.paper.velocity.y = 2.0;
              confetti({
                particleCount: 55,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00d2d3', '#54a0ff', '#feca57']
              });
              if (this.onBoatHit) this.onBoatHit(350);
              this.checkLevelProgression();
              if (this.onStatsChanged) this.onStatsChanged();
            }
          }
        }
      }

      if (flightFinished) {
        this.handleFlightFinished();
      }
    }

    // DYNAMIC FIRST-PERSON CAMERA & CHAOS PANORAMA-CAM:
    if (this.isChaosSpectating) {
      // Elevated wide cinematic shot: shows lawn, sheep fainting and neighbor car hazards!
      this.targetCamPos.copy(this.chaosCamPos);
      this.targetCamLookAt.copy(this.chaosCamTarget);
    } else if (this.phase === 'aiming' || this.phase === 'flying') {
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

      const basePitchDeg = -32.0;
      const pitchRad = THREE.MathUtils.degToRad(basePitchDeg + this.foldPitchOffset);
      const yawRad = THREE.MathUtils.degToRad(this.foldYawOffset);
      const lookDist = 20.0;

      this.targetCamLookAt.set(
        this.foldCamPos.x - Math.sin(yawRad) * Math.cos(pitchRad) * lookDist,
        this.foldCamPos.y + Math.sin(pitchRad) * lookDist,
        this.foldCamPos.z - Math.cos(yawRad) * Math.cos(pitchRad) * lookDist
      );
    }

    const camLerpSpeed = this.isChaosSpectating ? 0.08 : (this.phase === 'flying' ? 0.25 : 0.15);
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
