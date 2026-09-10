import * as THREE from 'three';
import { sound } from '../sound';
import { createToonMaterial, GOOSE_PALETTE } from '../materials';
import type { SupportedLang } from '../i18n';

export type OrigamiArchetype = 'sheet' | 'glider' | 'dart' | 'comet';
export type CreaseQuality = 'perfect' | 'good' | 'imperfect';

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
  archetype: OrigamiArchetype;
  archetypeName: string;
  archetypeIcon: string;
  archetypeDesc: string;
  perfectCreases: number;
  liftRating: number;
  speedRating: number;
  impactRating: number;
}

export class PaperSheet {
  public mesh: THREE.Group;
  public folds: number = 0;
  public perfectCreaseCount: number = 0;
  public lastCreaseQuality: CreaseQuality = 'good';
  public isFolding: boolean = false;
  public isFlying: boolean = false;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public initialTablePos: THREE.Vector3 = new THREE.Vector3(0, 1.215, 0);

  // Trajectory visualization
  public trajectoryLine: THREE.Line;
  public trajectoryBeads: THREE.InstancedMesh;
  public readonly beadCount: number = 42;
  private scene: THREE.Scene;

  // Slingshot 3D Visualization Rig
  public slingshotGroup!: THREE.Group;
  private leftBandMesh!: THREE.Mesh;
  private rightBandMesh!: THREE.Mesh;
  public leftProngPos: THREE.Vector3 = new THREE.Vector3(-0.38, 1.25, -0.15);
  public rightProngPos: THREE.Vector3 = new THREE.Vector3(0.38, 1.25, -0.15);

  // Visual meshes
  private paperBody: THREE.Mesh | null = null;

  // Paper materials
  private paperMat: THREE.Material;
  private foldEdgeMat: THREE.Material;
  public materialType: 'paper' | 'foil' = 'paper';
  private foilMat: THREE.MeshStandardMaterial;
  private foilEdgeMat: THREE.MeshStandardMaterial;
  private titaniumMat: THREE.MeshStandardMaterial;
  private singularityMat: THREE.MeshBasicMaterial;
  private accretionRingMat: THREE.MeshBasicMaterial;
  private layerLinesMat: THREE.Material;
  public onHeavyFold?: (folds: number) => void;

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

    this.layerLinesMat = createToonMaterial({
      color: 0xbdc3c7
    });

    this.titaniumMat = new THREE.MeshStandardMaterial({
      color: 0xdcdde1,
      roughness: 0.18,
      metalness: 0.94,
      flatShading: true
    });

    this.singularityMat = new THREE.MeshBasicMaterial({
      color: 0x050505
    });

    this.accretionRingMat = new THREE.MeshBasicMaterial({
      color: 0x00d2d3,
      side: THREE.DoubleSide
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

    // Trajectory beads: bold, chunky, highly visible 3D arcade arc (immune to WebGL 1px line limit)
    const beadGeo = new THREE.SphereGeometry(0.048, 8, 8);
    const beadMat = new THREE.MeshBasicMaterial({
      color: 0xff3b30,
      transparent: true,
      opacity: 0.92
    });
    this.trajectoryBeads = new THREE.InstancedMesh(beadGeo, beadMat, this.beadCount);
    this.trajectoryBeads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.trajectoryBeads.visible = false;
    this.scene.add(this.trajectoryBeads);

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

    // Slingshot 3D Rig with volumetric 3D rubber bands
    this.slingshotGroup = new THREE.Group();

    const prongMat = createToonMaterial({ color: 0x8b5a2b });
    const capMat = createToonMaterial({ color: 0xd4af37 });

    [-0.38, 0.38].forEach((x) => {
      const prongGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.22, 8);
      const prongMesh = new THREE.Mesh(prongGeo, prongMat);
      prongMesh.position.set(x, 1.25, -0.15);
      this.slingshotGroup.add(prongMesh);

      const capGeo = new THREE.SphereGeometry(0.034, 8, 8);
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.set(x, 1.36, -0.15);
      this.slingshotGroup.add(capMesh);
    });

    // 3D Volumetric Rubber Bands (thick cylinders with pivot at base)
    const bandCylGeo = new THREE.CylinderGeometry(0.016, 0.016, 1, 8);
    bandCylGeo.translate(0, 0.5, 0); // pivot at base

    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      roughness: 0.35,
      metalness: 0.1
    });

    this.leftBandMesh = new THREE.Mesh(bandCylGeo, bandMat);
    this.rightBandMesh = new THREE.Mesh(bandCylGeo, bandMat.clone());
    this.slingshotGroup.add(this.leftBandMesh);
    this.slingshotGroup.add(this.rightBandMesh);

    this.slingshotGroup.visible = false;
    this.scene.add(this.slingshotGroup);

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

    // Determine Origami Archetype based on fold level and material
    let archetype: OrigamiArchetype = 'sheet';
    let archetypeName = '';
    let archetypeIcon = '📄';
    let archetypeDesc = '';
    let liftRating = 1;
    let speedRating = 1;
    let impactRating = 1;

    if (this.materialType === 'foil' || folds >= 7) {
      archetype = 'comet';
      archetypeIcon = '☄️';
      archetypeName = lang === 'en' ? 'Titan Comet' : 'Titan-Komet';
      archetypeDesc = lang === 'en' 
        ? 'Ballistic mortar arc, crushes armor & craters the lawn' 
        : 'Ballistischer Meteorit, zerschmettert Rüstung & schlägt Krater';
      liftRating = 1;
      speedRating = 5;
      impactRating = 5;
    } else if (folds >= 4) {
      archetype = 'dart';
      archetypeIcon = '🎯';
      archetypeName = lang === 'en' ? 'Acrobatic Dart' : 'Akrobatik-Dart';
      archetypeDesc = lang === 'en'
        ? 'Supersonic needle trajectory, slices straight through wind'
        : 'Pfeilschnelle Nadel-Flugbahn, schneidet durch den Wind';
      liftRating = 3;
      speedRating = 4;
      impactRating = 3;
    } else if (folds >= 1) {
      archetype = 'glider';
      archetypeIcon = '🪶';
      archetypeName = lang === 'en' ? 'Glider' : 'Gleiter';
      archetypeDesc = lang === 'en'
        ? 'High aerodynamic lift, gentle glide, long hang-time'
        : 'Hoher Auftrieb, sanftes Segeln, lange Flugzeit';
      liftRating = 5;
      speedRating = 2;
      impactRating = 2;
    } else {
      archetype = 'sheet';
      archetypeIcon = '📄';
      archetypeName = lang === 'en' ? 'Unfolded' : 'Ungefaltet';
      archetypeDesc = lang === 'en'
        ? 'Fluttering raw note sheet with zero aerodynamics'
        : 'Reines Flatterblatt ohne aerodynamische Form';
      liftRating = 1;
      speedRating = 1;
      impactRating = 1;
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
      foldName,
      archetype,
      archetypeName,
      archetypeIcon,
      archetypeDesc,
      perfectCreases: this.perfectCreaseCount,
      liftRating,
      speedRating,
      impactRating
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
      // Classic paper folding models: Exponential thickness escalation!
      if (this.folds === 0) {
        // Pristine flat A4 sheet
        const geo = new THREE.BoxGeometry(w, 0.003, l);
        this.paperBody = new THREE.Mesh(geo, this.paperMat);
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);
      } else if (this.folds === 1) {
        // Halved sheet with crisp spine fold
        const geo = new THREE.BoxGeometry(w, 0.006, l);
        this.paperBody = new THREE.Mesh(geo, this.paperMat);
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        const crease = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.007, 0.004), this.foldEdgeMat);
        this.mesh.add(crease);
      } else if (this.folds === 2) {
        // 4 layers - double folded
        const geo = new THREE.BoxGeometry(w, 0.012, l);
        this.paperBody = new THREE.Mesh(geo, this.paperMat);
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        const edge = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.013, l * 0.98), this.foldEdgeMat);
        this.mesh.add(edge);
      } else if (this.folds === 3) {
        // 8 layers - sturdy cardboard block
        const geo = new THREE.BoxGeometry(w, 0.024, l);
        this.paperBody = new THREE.Mesh(geo, this.paperMat);
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        const edge1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.025, 0.006), this.foldEdgeMat);
        const edge2 = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.025, l * 0.98), this.foldEdgeMat);
        this.mesh.add(edge1, edge2);
      } else if (this.folds < 7) {
        // Folds 4-6: Visibly thick compressed pack (4.5cm - 9.5cm) with stratified layer lines
        const blockHeight = 0.045 + (this.folds - 4) * 0.024;
        const blockGeo = new THREE.BoxGeometry(w, blockHeight, l);
        this.paperBody = new THREE.Mesh(blockGeo, this.paperMat);
        this.paperBody.position.y = blockHeight * 0.5;
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        // Visible stacked horizontal edge lines on all 4 sides showing compressed paper sheets
        const numLayers = 3 + (this.folds - 4) * 2;
        for (let i = 1; i < numLayers; i++) {
          const layerY = (i / numLayers) * blockHeight;
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(w * 1.008, 0.003, l * 1.008), this.layerLinesMat);
          stripe.position.y = layerY;
          this.mesh.add(stripe);
        }
      } else if (this.folds < 9) {
        // Folds 7-8: THE HYDRAULIC CRUSHER / MASSIVE COMPRESSED PAPER BRICK
        // 14cm thick solid block with bulging compressed edges and accordion creases!
        const brickHeight = 0.14;
        const brickW = Math.max(0.12, w);
        const brickL = Math.max(0.12, l);
        const brickGeo = new THREE.BoxGeometry(brickW, brickHeight, brickL, 3, 4, 3);

        // Bulge the vertices slightly outward under extreme internal tension
        const pos = brickGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vy = pos.getY(i);
          const distFromCenterY = Math.abs(vy);
          const bulge = (1.0 - distFromCenterY / (brickHeight * 0.5)) * 0.008;
          pos.setX(i, pos.getX(i) + (pos.getX(i) > 0 ? bulge : -bulge));
          pos.setZ(i, pos.getZ(i) + (pos.getZ(i) > 0 ? bulge : -bulge));
        }
        brickGeo.computeVertexNormals();

        this.paperBody = new THREE.Mesh(brickGeo, this.paperMat);
        this.paperBody.position.y = brickHeight * 0.5;
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        // Accordion edge bands
        for (let i = 1; i <= 6; i++) {
          const bandY = (i / 7) * brickHeight;
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(brickW * 1.015, 0.004, brickL * 1.015), this.foldEdgeMat);
          stripe.position.y = bandY;
          this.mesh.add(stripe);
        }
      } else if (this.folds < 11) {
        // Folds 9-10: TITANIUM INGOT / iFOLD PRO MAX
        // Solid aerospace-grade titanium block with chamfered bevels and laser etched trim
        const ingotH = 0.15;
        const ingotW = 0.13;
        const ingotL = 0.13;
        const ingotGeo = new THREE.BoxGeometry(ingotW, ingotH, ingotL);
        this.paperBody = new THREE.Mesh(ingotGeo, this.titaniumMat);
        this.paperBody.position.y = ingotH * 0.5;
        this.paperBody.castShadow = true;
        this.paperBody.receiveShadow = true;
        this.mesh.add(this.paperBody);

        // Laser etched chamfer trim
        const trimGeo = new THREE.BoxGeometry(ingotW * 1.01, 0.012, ingotL * 1.01);
        const trimMat = new THREE.MeshStandardMaterial({ color: 0x54a0ff, metalness: 0.9, roughness: 0.2 });
        const trim = new THREE.Mesh(trimGeo, trimMat);
        trim.position.y = ingotH * 0.5;
        this.mesh.add(trim);
      } else {
        // Fold 11+: BLACK HOLE / QUANTUM SINGULARITY OF PAPER
        // Collapsed event horizon sphere with orbiting accretion ring and paper debris!
        const singRadius = 0.11;
        const coreGeo = new THREE.SphereGeometry(singRadius, 16, 16);
        this.paperBody = new THREE.Mesh(coreGeo, this.singularityMat);
        this.paperBody.position.y = singRadius * 1.6;
        this.mesh.add(this.paperBody);

        // Glowing cyan/violet accretion ring
        const ringGeo = new THREE.RingGeometry(singRadius * 1.4, singRadius * 1.85, 24);
        ringGeo.rotateX(Math.PI / 2);
        const ring = new THREE.Mesh(ringGeo, this.accretionRingMat);
        ring.position.y = singRadius * 1.6;
        this.mesh.add(ring);

        // Orbiting paper shred satellites
        for (let i = 0; i < 4; i++) {
          const shredGeo = new THREE.BoxGeometry(0.025, 0.002, 0.035);
          const shred = new THREE.Mesh(shredGeo, this.paperMat);
          const angle = (i / 4) * Math.PI * 2;
          shred.position.set(Math.cos(angle) * singRadius * 2.2, singRadius * 1.6 + (i % 2 === 0 ? 0.02 : -0.02), Math.sin(angle) * singRadius * 2.2);
          shred.rotation.y = angle;
          shred.rotation.z = 0.3;
          this.mesh.add(shred);
        }
      }
    }
  }

  // Animated procedural paper folding animation with Crease Quality
  public fold(quality: CreaseQuality = 'good', onComplete?: () => void) {
    if (this.isFolding || this.isFlying) return;
    this.isFolding = true;
    this.lastCreaseQuality = quality;

    if (quality === 'perfect') {
      this.perfectCreaseCount++;
      sound.playPerfectCrease();
    } else if (quality === 'imperfect') {
      sound.playCrumpleCrease();
    } else {
      if (this.materialType === 'foil') {
        sound.playFoilCrinkle(this.folds);
      } else {
        sound.playPianoNote(this.folds);
      }
    }

    const previousArchetype = this.getStats().archetype;
    const startPos = this.mesh.position.clone();
    const startTime = performance.now();
    const duration = quality === 'perfect' ? 220 : 280; // Snappier fold animation for perfect crease!

    const animateFold = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Lift & squeeze hop (extra bounce for perfect fold!)
      const hop = Math.sin(progress * Math.PI) * (quality === 'perfect' ? 0.16 : 0.12);
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

        // Heavy impact table shudder & sound for thick folds
        if (this.folds >= 6) {
          sound.playHeavyFoldImpact(this.folds);
          if (this.onHeavyFold) {
            this.onHeavyFold(this.folds);
          }
        }

        const newArchetype = this.getStats().archetype;
        if (newArchetype !== previousArchetype) {
          sound.playArchetypeShift(newArchetype === 'sheet' ? 'glider' : newArchetype);
        }

        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateFold);
  }

  // Update parabolic dotted trajectory guide line matching Archetype aerodynamics
  public updateTrajectory(pitchDeg: number, yawDeg: number, powerPercent: number, hasTargetLock: boolean = false) {
    const stats = this.getStats();
    const foilMult = this.materialType === 'foil' ? 1.25 : 1.0;
    const perfectBonus = 1.0 + Math.min(0.35, this.perfectCreaseCount * 0.08);

    let baseSpeed = 12.0;
    if (stats.archetype === 'glider') {
      baseSpeed = 20.0 + (stats.folds - 1) * 7.0;
    } else if (stats.archetype === 'dart') {
      baseSpeed = 48.0 + (stats.folds - 4) * 16.0;
    } else if (stats.archetype === 'comet') {
      baseSpeed = 96.0 + Math.max(0, stats.folds - 7) * 25.0;
    }

    const launchSpeed = baseSpeed * perfectBonus * foilMult * (powerPercent / 100);
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
    const maxSteps = 95;

    for (let i = 0; i < maxSteps; i++) {
      points.push(simPos.clone());
      simPos.addScaledVector(simVelocity, dt);

      let gravity = -9.81 * dt;
      let drag = 1.0;

      if (stats.archetype === 'glider') {
        const lift = Math.max(0.72, 0.94 - (this.folds - 1) * 0.08);
        gravity = -9.81 * dt * (1.0 - lift);
        drag = 1.0 - 0.015;
      } else if (stats.archetype === 'dart') {
        const lift = Math.max(0.25, 0.42 - (this.folds - 4) * 0.05);
        gravity = -9.81 * dt * (1.0 - lift * 0.6);
        drag = 1.0 - 0.005;
      } else if (stats.archetype === 'comet') {
        gravity = -9.81 * dt * 1.45;
        drag = 1.0 - 0.003;
      } else {
        gravity = -9.81 * dt * 0.85;
        drag = 1.0 - 0.035;
      }

      simVelocity.y += gravity;
      simVelocity.multiplyScalar(drag);

      if (simPos.y <= 0.1) {
        points.push(simPos.clone());
        break;
      }
    }

    this.trajectoryLine.geometry.dispose();
    this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Color code trajectory by Archetype, Target Lock & Perfect Crease
    let lineColor = 0xff3b30;
    if (hasTargetLock) {
      lineColor = 0xff2d55; // Vibrant neon crimson lock-on
    } else if (this.perfectCreaseCount > 0) {
      lineColor = 0xffd700; // Shimmering Gold for perfect crease mastery
    } else if (stats.archetype === 'glider') {
      lineColor = 0x30d158; // Spring Green
    } else if (stats.archetype === 'dart') {
      lineColor = 0x0a84ff; // Cyan Dart
    } else if (stats.archetype === 'comet') {
      lineColor = 0xff9500; // Fiery Comet
    }

    (this.trajectoryLine.material as THREE.LineDashedMaterial).color.setHex(lineColor);
    this.trajectoryLine.computeLineDistances();
    this.trajectoryLine.visible = true;

    // Update InstancedMesh trajectory beads: bold, chunky, highly visible 3D arcade arc!
    const dummyMat = new THREE.Matrix4();
    const dummyScale = new THREE.Vector3();
    const dummyQuat = new THREE.Quaternion();

    for (let i = 0; i < this.beadCount; i++) {
      const pointIdx = Math.min(
        points.length - 1,
        Math.floor((i / (this.beadCount - 1)) * (points.length - 1))
      );
      const pt = points[pointIdx];
      // Taper beads: starts chunky (1.0) and tapers to 0.4 near the end
      const s = Math.max(0.35, 1.0 - (i / this.beadCount) * 0.6);
      dummyScale.set(s, s, s);
      dummyMat.compose(pt, dummyQuat, dummyScale);
      this.trajectoryBeads.setMatrixAt(i, dummyMat);
    }
    this.trajectoryBeads.instanceMatrix.needsUpdate = true;
    (this.trajectoryBeads.material as THREE.MeshBasicMaterial).color.setHex(lineColor);
    this.trajectoryBeads.visible = true;
  }

  private orientBand(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, tension: number) {
    const dir = to.clone().sub(from);
    const len = dir.length();
    if (len < 0.001) return;

    mesh.position.copy(from);
    const baseRadius = 0.016;
    const thickness = Math.max(0.009, baseRadius - tension * 0.005);
    const scaleFactor = thickness / baseRadius;
    mesh.scale.set(scaleFactor, len, scaleFactor);

    const yAxis = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(yAxis, dir.normalize());
  }

  // Set Slingshot Pull Vector & Tension
  public setSlingshotPull(pullOffset: THREE.Vector3 | null, tension01: number = 0) {
    if (!pullOffset) {
      this.mesh.position.copy(this.initialTablePos);
      this.mesh.rotation.set(0, 0, 0);
      const restingBack = this.initialTablePos.clone().add(new THREE.Vector3(0, 0.02, 0.06));
      this.orientBand(this.leftBandMesh, this.leftProngPos, restingBack, 0);
      this.orientBand(this.rightBandMesh, this.rightProngPos, restingBack, 0);
      return;
    }

    this.mesh.position.set(
      this.initialTablePos.x + pullOffset.x,
      this.initialTablePos.y + pullOffset.y,
      this.initialTablePos.z + pullOffset.z
    );

    // Subtle dynamic tilt while dragging
    this.mesh.rotation.x = pullOffset.y * 1.8;
    this.mesh.rotation.y = -pullOffset.x * 2.2;

    const paperBackAttach = this.mesh.position.clone().add(new THREE.Vector3(0, 0.02, 0.05));
    this.orientBand(this.leftBandMesh, this.leftProngPos, paperBackAttach, tension01);
    this.orientBand(this.rightBandMesh, this.rightProngPos, paperBackAttach, tension01);

    // Update band color based on tension (Orange -> Neon Red -> Golden)
    const bandMatL = this.leftBandMesh.material as THREE.MeshStandardMaterial;
    const bandMatR = this.rightBandMesh.material as THREE.MeshStandardMaterial;
    let bandColor = 0xff9500;
    if (tension01 >= 0.88) {
      bandColor = 0xffd700; // Shimmering Gold
    } else if (tension01 >= 0.45) {
      bandColor = 0xff3b30; // Neon Red
    }
    bandMatL.color.setHex(bandColor);
    bandMatR.color.setHex(bandColor);
  }

  public setSlingshotVisible(visible: boolean) {
    this.slingshotGroup.visible = visible;
    if (!visible) {
      this.setSlingshotPull(null, 0);
      this.trajectoryLine.visible = false;
      this.trajectoryBeads.visible = false;
    }
  }

  // Launch paper into physics flight
  public launch(pitchDeg: number, yawDeg: number, powerPercent: number) {
    this.isFlying = true;
    this.isFolding = false;
    this.trajectoryLine.visible = false;
    this.trajectoryBeads.visible = false;
    this.setSlingshotVisible(false);

    const stats = this.getStats();
    const foilMult = this.materialType === 'foil' ? 1.25 : 1.0;
    const perfectBonus = 1.0 + Math.min(0.35, this.perfectCreaseCount * 0.08);

    let baseSpeed = 12.0;
    if (stats.archetype === 'glider') {
      baseSpeed = 20.0 + (stats.folds - 1) * 7.0;
    } else if (stats.archetype === 'dart') {
      baseSpeed = 48.0 + (stats.folds - 4) * 16.0;
    } else if (stats.archetype === 'comet') {
      baseSpeed = 96.0 + Math.max(0, stats.folds - 7) * 25.0;
    }

    const launchSpeed = baseSpeed * perfectBonus * foilMult * (powerPercent / 100);
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

    // Homing guidance: gently bend trajectory toward locked target
    if (homingTarget) {
      const dirToTarget = homingTarget.clone().sub(this.mesh.position).normalize();
      const currentDir = this.velocity.clone().normalize();
      const speed = this.velocity.length();

      const trackingStrength = Math.min(1.0, (0.35 + stats.folds * 0.04) * delta * 12.0);
      currentDir.lerp(dirToTarget, trackingStrength);
      this.velocity.copy(currentDir.multiplyScalar(speed));
    }

    // Aerodynamics & Gravity governed by Origami Archetype
    let gravity = -9.81 * delta;
    let drag = 1.0;

    if (stats.archetype === 'glider') {
      // Glider: High lift, floaty slow glide, stays in the air for extended time
      const lift = Math.max(0.72, 0.94 - (this.folds - 1) * 0.08);
      gravity = -9.81 * delta * (1.0 - lift);
      drag = 1.0 - 0.015 * (delta * 60);
    } else if (stats.archetype === 'dart') {
      // Dart: Piercing straight line, minimal drag, fast flight path
      const lift = Math.max(0.25, 0.42 - (this.folds - 4) * 0.05);
      gravity = -9.81 * delta * (1.0 - lift * 0.6);
      drag = 1.0 - 0.005 * (delta * 60);
    } else if (stats.archetype === 'comet') {
      // Comet: Ballistic heavy drop, massive kinetic impact
      gravity = -9.81 * delta * 1.45;
      drag = 1.0 - 0.003 * (delta * 60);
    } else {
      // Raw sheet: flutters wildly and drops
      gravity = -9.81 * delta * 0.85;
      drag = 1.0 - 0.035 * (delta * 60);
    }

    // Imperfect fold wobble penalty
    if (this.lastCreaseQuality === 'imperfect') {
      this.velocity.x += Math.sin(this.mesh.position.z * 1.8) * 0.8 * delta;
    }

    this.velocity.y += gravity;
    this.velocity.multiplyScalar(drag);
    this.mesh.position.addScaledVector(this.velocity, delta);

    // Dynamic rotation: paper aligns with flight trajectory
    if (this.velocity.lengthSq() > 0.1) {
      const lookAtPos = this.mesh.position.clone().add(this.velocity);
      this.mesh.lookAt(lookAtPos);

      // Supersonic bullet spin for darts and comets, or perfect folds
      if (stats.archetype === 'dart' || stats.archetype === 'comet' || this.perfectCreaseCount > 0) {
        this.mesh.rotation.z += (stats.archetype === 'comet' ? 22.0 : 16.0) * delta;
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
    this.perfectCreaseCount = 0;
    this.lastCreaseQuality = 'good';
    this.isFlying = false;
    this.isFolding = false;
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.initialTablePos);
    this.mesh.rotation.set(0, 0, 0);
    this.setSlingshotPull(null, 0);
    this.setSlingshotVisible(false);
    this.rebuildMesh();
    this.trajectoryLine.visible = false;
    this.trajectoryBeads.visible = false;
    sound.playNewPaper();
  }
}
