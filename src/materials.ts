import * as THREE from 'three';

// Shared 3-step toon lighting gradient texture for "Untitled Goose Game" cel-shaded look
let sharedGradient3: THREE.DataTexture | null = null;
let sharedGradient4: THREE.DataTexture | null = null;

export function getToonGradient3(): THREE.DataTexture {
  if (!sharedGradient3) {
    // 3 discrete lighting steps: Deep Shadow (80), Soft Shadow (165), Highlight (255)
    const data = new Uint8Array([
      80, 80, 80, 255,
      165, 165, 165, 255,
      255, 255, 255, 255
    ]);
    sharedGradient3 = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    sharedGradient3.minFilter = THREE.NearestFilter;
    sharedGradient3.magFilter = THREE.NearestFilter;
    sharedGradient3.generateMipmaps = false;
    sharedGradient3.needsUpdate = true;
  }
  return sharedGradient3;
}

export function getToonGradient4(): THREE.DataTexture {
  if (!sharedGradient4) {
    const data = new Uint8Array([
      60, 60, 60, 255,
      130, 130, 130, 255,
      200, 200, 200, 255,
      255, 255, 255, 255
    ]);
    sharedGradient4 = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
    sharedGradient4.minFilter = THREE.NearestFilter;
    sharedGradient4.magFilter = THREE.NearestFilter;
    sharedGradient4.generateMipmaps = false;
    sharedGradient4.needsUpdate = true;
  }
  return sharedGradient4;
}

export interface ToonMaterialOptions {
  color: THREE.ColorRepresentation;
  side?: THREE.Side;
  transparent?: boolean;
  opacity?: number;
  wireframe?: boolean;
  steps?: 3 | 4;
}

/**
 * Creates a stylish cel-shaded MeshToonMaterial with banded lighting
 */
export function createToonMaterial(options: ToonMaterialOptions): THREE.MeshToonMaterial {
  const gradient = options.steps === 4 ? getToonGradient4() : getToonGradient3();
  return new THREE.MeshToonMaterial({
    color: options.color,
    gradientMap: gradient,
    side: options.side ?? THREE.FrontSide,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1.0,
    wireframe: options.wireframe ?? false
  });
}

/**
 * Creates a subtle dark inverted-hull outline mesh for any geometry
 */
export function createOutlineMesh(
  geometry: THREE.BufferGeometry,
  outlineColor: THREE.ColorRepresentation = 0x1f2937,
  thickness: number = 0.018
): THREE.Mesh {
  const outlineMat = new THREE.MeshBasicMaterial({
    color: outlineColor,
    side: THREE.BackSide
  });
  const outlineMesh = new THREE.Mesh(geometry, outlineMat);
  outlineMesh.scale.multiplyScalar(1 + thickness);
  return outlineMesh;
}

/**
 * Curated "British Countryside & Cottage Garden" Indie Color Palette
 */
export const GOOSE_PALETTE = {
  // World & Sky
  sky: 0x8fc2e8,
  skyHorizon: 0xc1def2,
  fog: 0xa9cde8,
  sunLight: 0xfff3db,
  hemiSky: 0xd8ebff,
  hemiGround: 0x6e8756,

  // Garden Lawn & Foliage
  grass: 0x6e935a,
  grassDark: 0x587a46,
  foliagePrimary: 0x527b42,
  foliageSecondary: 0x669152,
  foliageDark: 0x3d5f30,
  woodBark: 0x6d4c38,

  // Garden Table & Furniture
  tableWood: 0xc88f54,
  tableLegs: 0xa76f36,
  cuttingMat: 0x2e593a,
  mugEnamel: 0xcc3b3b,
  mugCoffee: 0x3c2718,

  // Architecture (Neighbor House & Fence)
  plasterWall: 0xe8dfcf,
  roofTiles: 0xa44535,
  roofTrim: 0x7a3024,
  woodFence: 0xd4be99,
  fencePosts: 0xbc9d75,
  neighborChimney: 0x8c3b2e,
  neighborDoor: 0x2b5268,
  windowFrame: 0xfdfdfd,
  windowGlass: 0x93b5cb,

  // Props & Vehicles
  carBlue: 0x2f6ab3,
  carWhiteRoof: 0xf4f1eb,
  carBumper: 0x95a5a6,
  carTire: 0x2c3e50,
  carLightYellow: 0xf1c40f,

  // Animals (Sheep & Birds)
  sheepWool: 0xf4f0e6,
  sheepWoolFainted: 0xe5e1d7,
  sheepFace: 0x262322,
  sheepLegs: 0x1e1c1b,

  pigeonGray: 0x768ca3,
  pigeonChest: 0x8a9db0,
  pigeonBeak: 0xf39c12,

  craneWhite: 0xf7f5f0,
  craneRedCrown: 0xd63031,
  craneBlackTips: 0x2d3436,

  seagullWhite: 0xffffff,
  seagullWing: 0xdfe6e9,
  seagullBeak: 0xf1c40f,

  airplaneFuselage: 0x2980b9,
  airplaneStripe: 0xe74c3c,
  airplaneWings: 0xecf0f1,

  satelliteGold: 0xf1c40f,
  satelliteGray: 0x34495e,

  // Origami Paper
  paperWhite: 0xfcfaee,
  paperFoldDark: 0xdfd9c8,
  paperFoilShine: 0xd5dbe0
};
