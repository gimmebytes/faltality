# Agent Instructions & Guidelines

This document contains persistent operational guidelines for AI agents working in this repository.

---

## 1. Build, Execution & Deployment Workflows

**Core Rule:** AI agents MUST strictly use the predefined `make` targets from the [`Makefile`](file:///Users/marvin.kruse/Source/personal/faltality/Makefile) for all tasks (building, checking, running, deploying) instead of invoking ad-hoc `npm` or `docker` commands directly.

### Standard Make Targets:
* **`make dev`**: Start the local Vite development server.
* **`make build`**: Run TypeScript type-checking and the Vite production build (`tsc && vite build`). Always execute this before completing a task or submitting code.
* **`make preview`**: Preview the compiled production build locally.
* **`make docker-build`**: Build the local Docker image (`faltality:latest`).
* **`make docker-run`**: Run the containerized app locally on port 8080.
* **`make deploy`**: Build multi-arch image, push to registry, and trigger Scaleway container redeployment (reads credentials securely from `.env`).

---

## 2. Secrets & Environment Configuration

* **Zero-Leak Policy:** Never commit secrets, container IDs, internal infrastructure URLs, or private project identifiers into git history or public files.
* Environment variables belong exclusively in `.env` (which is ignored by [`.gitignore`](file:///Users/marvin.kruse/Source/personal/faltality/.gitignore)).
* Public templates or dummy variables belong in [`.env.example`](file:///Users/marvin.kruse/Source/personal/faltality/.env.example).

---

## 3. Technology Stack & Design Conventions

* **Engine:** Three.js (r186+) with TypeScript and Vite.
* **Art Style:** Stylized cel-shading (*Untitled Goose Game* aesthetic).
  * Use `createToonMaterial()` from [`src/materials.ts`](file:///Users/marvin.kruse/Source/personal/faltality/src/materials.ts) for procedural meshes.
  * Use `modelLoader.load()` from [`src/assetLoader.ts`](file:///Users/marvin.kruse/Source/personal/faltality/src/assetLoader.ts) for GLTF/GLB models to automatically apply the toon shader gradient.
