import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getToonGradient3 } from './materials';

class ModelLoaderService {
  private loader = new GLTFLoader();
  private cache = new Map<string, THREE.Group>();
  private promises = new Map<string, Promise<THREE.Group>>();

  public async load(url: string): Promise<THREE.Group> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!.clone();
    }

    if (this.promises.has(url)) {
      const scene = await this.promises.get(url)!;
      return scene.clone();
    }

    const p = new Promise<THREE.Group>((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          this.applyToonStyle(gltf.scene);
          this.cache.set(url, gltf.scene);
          resolve(gltf.scene);
        },
        undefined,
        (error) => {
          console.warn(`[ModelLoader] Error loading ${url}:`, error);
          reject(error);
        }
      );
    });

    this.promises.set(url, p);
    const scene = await p;
    return scene.clone();
  }

  public applyToonStyle(object: THREE.Object3D) {
    const gradient = getToonGradient3();
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const hasVertexColors = !!(mesh.geometry?.attributes?.color);

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const newMats = mats.map((mat) => {
            const m = mat as THREE.MeshStandardMaterial;

            const toonMat = new THREE.MeshToonMaterial({
              color: m.color ? m.color.clone() : new THREE.Color(0xffffff),
              map: m.map ?? null,
              gradientMap: gradient,
              side: m.side ?? THREE.FrontSide,
              vertexColors: hasVertexColors
            });

            if (m.map) {
              m.map.colorSpace = THREE.SRGBColorSpace;
              m.map.needsUpdate = true;
            }

            return toonMat;
          });

          mesh.material = Array.isArray(mesh.material) ? newMats : newMats[0];
        }
      }
    });
  }
}

export const modelLoader = new ModelLoaderService();
