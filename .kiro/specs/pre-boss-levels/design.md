# Design: Pre-Boss Levels (1–4)

Reference: `requirements.md`. Code base: `main` @ `1f9e397` (rebase onto post-cleanup
`main` before coding).

## Architecture notes (from current code)

- `Environment.setLevel(levelId)` (`src/models/environment.ts:~1491`) toggles per-level
  groups; today only `level1GardenGroup` and `level2CoastGroup` exist, with explicit
  branches for `levelId === 1` and `=== 2`. Levels 3–5 have no branch → the last visible
  group (Garden) stays on.
- Moving bonus entities already have a precedent: the Level 2 boat (`boatGroup`,
  `hitBoat()`, `getBoatWorldPosition()`, `getBoatBoundingRadius()`), and the
  `satellite` bird type. The pizza robot should follow the boat pattern.
- The car-alarm gag lives in `src/game.ts` (`isOverkillMiss` block ~line 1020, and the
  airplane/satellite/iphone_duo hit block ~line 937) and in
  `environment.triggerCarAlarm()` / `triggerFaintingSheep()`.
- Bonus-sheet pattern: `levelSheetsRemaining++` (used for the neighbor-car "curiosity
  bonus") — reuse for the pizza robot reward.

## Design Req 1 — vantage model
- Keep the fold camera and fold logic untouched. Per level, swap the environment group
  and sky/fog only.
- Add `level3CampusGroup` and `level4AirportGroup`, built once (lazily) and toggled in
  `setLevel()` like the existing groups.
- Extend `setLevel()` with explicit `levelId === 3` and `=== 4` branches; ensure levels
  with no custom scenery never leave a previous group visible.

## Design Req 2 — car-alarm gag Level-1-only
- Gate the gag on `this.currentLevel === 1` (campaign) wherever
  `triggerCarAlarm()`/`triggerFaintingSheep()` are called from `game.ts`.
- For Levels 2–4 overkill misses: either no reaction, or a cheap location reaction
  (e.g. gulls scatter at the coast, pigeons scatter at MIT, ground crew ducks at the
  airport) — minimal, additive.
- Keep the Level 1 code path byte-for-byte in behavior.

## Design Req 3 — MIT campus + pizza robot
- `level3CampusGroup`: stylized campus — a few modular buildings (reuse
  `building-type-a.glb` if suitable), a dome silhouette, benches, lamp posts; sky/fog
  tuned cooler/urban.
- Pizza robot: a small wheeled bot group that drifts across the scene on a path (like
  `boatGroup`). API mirror: `getRobotWorldPosition()`, `getRobotBoundingRadius()`,
  `triggerRobotHit()`.
- Hit handling in `game.ts`: on robot hit → `levelSheetsRemaining++`, pizza
  confetti/score, SFX; NOT counted toward the level objective.
- Easter-egg exclusivity: build/activate the robot only when `currentLevel === 3`.
- i18n: rewrite `lvl3Title/Subtitle/Desc/Objective/Star1-3` for the MIT theme in `de`
  and `en`. Keep the `trigger_crater` mechanic OR switch to `hit_birds` — decide in
  tasks; default: keep crater mechanic, re-skin only.

## Design Req 4 — airport
- `level4AirportGroup`: runway strip, apron markings, a control-tower silhouette,
  windsock; the FL-404 model already exists (airliner). Table at the runway edge.
- Easter egg: a tiny lit porthole on the FL-404 showing a passenger; on hit, a quick
  spilled-coffee flourish. Level-4 only.

## Design Req 5 — easter-egg registry
- Document the one-egg-per-level mapping in code comments so future levels do not reuse
  an entity. Entities: sheep/car (L1), crab/boat (L2), pizza robot (L3), porthole (L4).

## Risks / edge cases
- Asset budget: new GLBs increase the already-large JS/asset bundle. Prefer reusing
  existing props (buildings, cloud, fence) and procedural toon meshes via
  `createToonMaterial()`.
- Moving-entity collision must not interfere with the primary target raycast; gate robot
  collision behind `currentLevel === 3`.
- Rebase ordering: this branch must sit on top of the cleanup branch's `levels.ts`
  changes to avoid a merge conflict in the unlock logic.
