import * as THREE from 'three';
import { createToonMaterial } from '../materials';

export class IPhoneDuoModel {
  public rootGroup: THREE.Group;
  public leftHalf: THREE.Group;
  public rightHalf: THREE.Group;
  public hingeMesh: THREE.Mesh;
  public screenMat: THREE.MeshBasicMaterial;
  public screenCanvas: HTMLCanvasElement;
  public screenCtx: CanvasRenderingContext2D;
  public screenTexture: THREE.CanvasTexture;

  private leftChassisMat: THREE.Material;
  private rightChassisMat: THREE.Material;
  private damageFlashTimer: number = 0;
  private glitchTimer: number = 0;
  public currentFoldAngle: number = Math.PI * 0.48; // Default closed (pocket mode)
  public targetFoldAngle: number = Math.PI * 0.48;

  constructor() {
    this.rootGroup = new THREE.Group();

    // 1. Procedural Screen Wallpaper Canvas (Super Retina XDR Dual Display)
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 512;
    this.screenCtx = this.screenCanvas.getContext('2d')!;
    this.renderScreenTexture(0);

    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.colorSpace = THREE.SRGBColorSpace;

    this.screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTexture,
      side: THREE.DoubleSide
    });

    // 2. Titanium Frame Materials
    const titaniumColor = 0x3d3f44; // Space Black Titanium
    this.leftChassisMat = createToonMaterial({ color: titaniumColor });
    this.rightChassisMat = createToonMaterial({ color: titaniumColor });
    const darkGlassMat = createToonMaterial({ color: 0x1c1d1f });
    const lensRingMat = createToonMaterial({ color: 0x7f8c8d });
    const lensGlassMat = createToonMaterial({ color: 0x0a0a0a });
    const appleLogoMat = createToonMaterial({ color: 0xffffff });

    const panelWidth = 1.05;
    const panelHeight = 2.1;
    const panelDepth = 0.09;

    // 3. Central Precision Hinge Cylinder
    const hingeGeo = new THREE.CylinderGeometry(0.065, 0.065, panelHeight * 0.98, 16);
    const hingeMat = createToonMaterial({ color: 0x5a5d64 });
    this.hingeMesh = new THREE.Mesh(hingeGeo, hingeMat);
    this.hingeMesh.castShadow = true;
    this.rootGroup.add(this.hingeMesh);

    // Decorative hinge caps
    for (const capY of [-panelHeight * 0.49, panelHeight * 0.49]) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 16), hingeMat);
      cap.position.y = capY;
      this.rootGroup.add(cap);
    }

    // 4. Left Panel (Pivoting from x = 0 towards -X)
    this.leftHalf = new THREE.Group();
    {
      const bodyGeo = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
      const bodyMesh = new THREE.Mesh(bodyGeo, this.leftChassisMat);
      bodyMesh.position.set(-panelWidth * 0.5, 0, 0);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      this.leftHalf.add(bodyMesh);

      // Left Inner Screen (faces +Z when unfolded)
      const screenGeo = new THREE.PlaneGeometry(panelWidth * 0.93, panelHeight * 0.94);
      // UV mapping: left half of texture (0.0 to 0.5)
      const uv = screenGeo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, uv.getX(i) * 0.5);
      }
      uv.needsUpdate = true;

      const screenMesh = new THREE.Mesh(screenGeo, this.screenMat);
      screenMesh.position.set(-panelWidth * 0.5, 0, panelDepth * 0.51);
      this.leftHalf.add(screenMesh);

      // Left Back Glass
      const backGlassGeo = new THREE.PlaneGeometry(panelWidth * 0.96, panelHeight * 0.97);
      backGlassGeo.rotateY(Math.PI);
      const backGlass = new THREE.Mesh(backGlassGeo, darkGlassMat);
      backGlass.position.set(-panelWidth * 0.5, 0, -panelDepth * 0.51);
      this.leftHalf.add(backGlass);

      // Back Embossed Apple Logo
      const logoGroup = this.createAppleLogoMesh(appleLogoMat);
      logoGroup.position.set(-panelWidth * 0.5, 0.05, -panelDepth * 0.52);
      logoGroup.rotation.y = Math.PI;
      logoGroup.scale.set(0.24, 0.24, 0.24);
      this.leftHalf.add(logoGroup);
    }
    this.rootGroup.add(this.leftHalf);

    // 5. Right Panel (Pivoting from x = 0 towards +X)
    this.rightHalf = new THREE.Group();
    {
      const bodyGeo = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
      const bodyMesh = new THREE.Mesh(bodyGeo, this.rightChassisMat);
      bodyMesh.position.set(panelWidth * 0.5, 0, 0);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      this.rightHalf.add(bodyMesh);

      // Right Inner Screen (faces +Z when unfolded)
      const screenGeo = new THREE.PlaneGeometry(panelWidth * 0.93, panelHeight * 0.94);
      // UV mapping: right half of texture (0.5 to 1.0)
      const uv = screenGeo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, 0.5 + uv.getX(i) * 0.5);
      }
      uv.needsUpdate = true;

      const screenMesh = new THREE.Mesh(screenGeo, this.screenMat);
      screenMesh.position.set(panelWidth * 0.5, 0, panelDepth * 0.51);
      this.rightHalf.add(screenMesh);

      // Dynamic Island Pill Cutout on top of right display
      const islandGeo = new THREE.BoxGeometry(0.26, 0.065, 0.01);
      const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const dynamicIsland = new THREE.Mesh(islandGeo, islandMat);
      dynamicIsland.position.set(panelWidth * 0.5, panelHeight * 0.41, panelDepth * 0.52);
      this.rightHalf.add(dynamicIsland);

      // Right Back Glass
      const backGlassGeo = new THREE.PlaneGeometry(panelWidth * 0.96, panelHeight * 0.97);
      backGlassGeo.rotateY(Math.PI);
      const backGlass = new THREE.Mesh(backGlassGeo, darkGlassMat);
      backGlass.position.set(panelWidth * 0.5, 0, -panelDepth * 0.51);
      this.rightHalf.add(backGlass);

      // Iconic Triple Camera Plateau on back
      const bumpSize = 0.52;
      const bumpGeo = new THREE.BoxGeometry(bumpSize, bumpSize, 0.05);
      const bumpMesh = new THREE.Mesh(bumpGeo, this.rightChassisMat);
      bumpMesh.position.set(panelWidth * 0.62, panelHeight * 0.32, -panelDepth * 0.54);
      this.rightHalf.add(bumpMesh);

      // 3 Symmetrical Camera Lenses with Sapphire Bezels
      const lensCoords = [
        [-0.14, 0.12],
        [-0.14, -0.12],
        [0.14, 0.0]
      ];
      lensCoords.forEach(([lx, ly]) => {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), lensRingMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(panelWidth * 0.62 + lx, panelHeight * 0.32 + ly, -panelDepth * 0.57);
        this.rightHalf.add(ring);

        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.045, 16), lensGlassMat);
        glass.rotation.x = Math.PI / 2;
        glass.position.set(panelWidth * 0.62 + lx, panelHeight * 0.32 + ly, -panelDepth * 0.575);
        this.rightHalf.add(glass);
      });

      // True Tone Flash & LiDAR Sensor
      const flash = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12), createToonMaterial({ color: 0xfff0b3 }));
      flash.rotation.x = Math.PI / 2;
      flash.position.set(panelWidth * 0.62 + 0.14, panelHeight * 0.32 + 0.14, -panelDepth * 0.56);
      this.rightHalf.add(flash);
    }
    this.rootGroup.add(this.rightHalf);

    // Initial position: folded closed
    this.applyFoldAngle(this.currentFoldAngle);
  }

  private createAppleLogoMesh(material: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const bodyGeo = new THREE.SphereGeometry(0.5, 10, 8);
    bodyGeo.scale(0.85, 0.95, 0.2);

    const b1 = new THREE.Mesh(bodyGeo, material);
    b1.position.set(-0.15, 0, 0);
    const b2 = new THREE.Mesh(bodyGeo, material);
    b2.position.set(0.15, 0, 0);
    group.add(b1, b2);

    const leafGeo = new THREE.ConeGeometry(0.2, 0.45, 6);
    leafGeo.rotateZ(Math.PI * 0.35);
    const leaf = new THREE.Mesh(leafGeo, material);
    leaf.position.set(0.15, 0.6, 0);
    group.add(leaf);

    return group;
  }

  // Draw vibrant Apple event wallpaper on internal dual-screen canvas
  public renderScreenTexture(glitchAmount: number = 0) {
    const ctx = this.screenCtx;
    const w = 512;
    const h = 512;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ambient glow circles
    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 220, 95, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 45, 85, 0.45)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(380, 280, 110, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 122, 255, 0.45)';
    ctx.fill();

    // Time text on Left Screen
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('9:41', 130, 120);

    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#8e8e93';
    ctx.fillText('Keynote • Infinite Loop', 130, 155);

    // Left screen widget: "FOLD RATIO: EXPONENTIAL"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(30, 290, 200, 140, 16);
    ctx.fill();

    ctx.fillStyle = '#30d158';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('d = 0.1mm • 2ⁿ', 130, 345);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('📱 FALT-STATUS: OK', 130, 385);

    // Right display: "ONE MORE THING" Banner & Siri Orb
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(285, 90, 200, 160, 16);
    ctx.fill();

    ctx.fillStyle = '#ffd60a';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('ONE MORE THING', 385, 145);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('iPhone Duo 2026', 385, 180);
    ctx.fillStyle = '#ff375f';
    ctx.fillText('Titanium Hinge', 385, 215);

    // Split Screen Divider bar down the center
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(250, 0, 12, h);

    // Dynamic Island status indicator at top right
    ctx.fillStyle = '#30d158';
    ctx.beginPath();
    ctx.arc(385, 45, 5, 0, Math.PI * 2);
    ctx.fill();

    // Glitch scanlines and chromatic distortion if damaged
    if (glitchAmount > 0.05) {
      const lineCount = Math.floor(glitchAmount * 28);
      for (let i = 0; i < lineCount; i++) {
        const gy = Math.random() * h;
        const gh = Math.random() * 8 + 2;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 0, 80, 0.65)' : 'rgba(0, 255, 230, 0.65)';
        ctx.fillRect(Math.random() * 50, gy, w - Math.random() * 50, gh);
      }

      // Battery warning badge
      ctx.fillStyle = '#ff453a';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('⚠️ FALT-CRITICAL 10%', 256, 260);
    }
    ctx.restore();

    if (this.screenTexture) {
      this.screenTexture.needsUpdate = true;
    }
  }

  // Update physical hinge rotation of both halves
  public applyFoldAngle(angle: number) {
    this.currentFoldAngle = angle;
    // Left half pivots around Y: closed rotates into +Z, open is flat (rotation.y = 0)
    this.leftHalf.rotation.y = angle;
    // Right half pivots symmetrically around Y
    this.rightHalf.rotation.y = -angle;
  }

  public triggerDamageFlash() {
    this.damageFlashTimer = 0.35;
    this.glitchTimer = 0.8;
  }

  public update(delta: number) {
    // Smooth fold angle animation toward targetFoldAngle
    if (Math.abs(this.currentFoldAngle - this.targetFoldAngle) > 0.01) {
      this.applyFoldAngle(THREE.MathUtils.lerp(this.currentFoldAngle, this.targetFoldAngle, delta * 3.5));
    }

    // Damage flash timer (highlights screen red / white)
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= delta;
      const flash = this.damageFlashTimer > 0;
      this.screenMat.color.setHex(flash ? 0xff3b30 : 0xffffff);
    } else {
      this.screenMat.color.setHex(0xffffff);
    }

    // Glitch animation if agitated
    if (this.glitchTimer > 0) {
      this.glitchTimer -= delta;
      this.renderScreenTexture(this.glitchTimer);
    }
  }
}
