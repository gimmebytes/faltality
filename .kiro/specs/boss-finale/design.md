# Design: Boss Finale (Level 5)

Reference: `requirements.md`. Code base: `main` @ `1f9e397` (rebase onto latest `main`
after cleanup + pre-boss merges).

## Architecture notes (from current code)

- Arena: `Environment.setLevel()` (`src/models/environment.ts:~1491`) needs a `=== 5`
  branch with a dedicated `level5ArenaGroup` (today none → Garden fallthrough).
- Boss hit logic: `src/models/birds.ts` ~line 900–950. Non-crit → Ceramic Shield
  deflect; crit with `health>1` → decrement + screen mode + speed; `health===0` →
  defeated with hinge-break. Phase is set ad-hoc per hit; `'unfolding'` unused.
- Boss model: `src/models/iphoneDuo.ts` — has `triggerCrashScreen()`,
  `triggerPanicScreen()`, `triggerDamageFlash()`, `targetFoldAngle`; no phase API.
- Boss phase type: `bossPhase: 'closed' | 'unfolding' | 'unfolded' | 'defeated'`.
- Existing E2E: "iPhone Duo boss has 3 critical hit phases …" — extend, don't replace.

## Design Req 1 — arena
- Build `level5ArenaGroup`: glass-store cube on a keynote stage, spotlight rig, product
  plinths, Infinite-Loop ring silhouette on the horizon; dark keynote sky + cool fog.
- Add `setLevel(5)` branch; ensure no previous group remains visible.
- Place the fold table on the keynote stage (vantage principle).

## Design Req 2 — phase state machine
- Define phases with explicit data: `closed` (intro, hinge shut, invulnerable until it
  opens) → `unfolding` (hinge opening, first vulnerability window) → `unfolded` (flat
  180°, main attack pattern) → `berserk` (final, fastest, erratic) → `defeated`.
- Map HP to phases: start `health = 3`, `closed/unfolding` as the pre-first-crit state;
  each non-final crit advances exactly ONE phase. Final crit → `defeated`.
- Vulnerability window: expose a `isVulnerable` flag on the boss that toggles on a timer
  per phase (hinge open = vulnerable). A crit only counts while `isVulnerable`;
  otherwise Ceramic Shield deflect (reuse existing deflect path).
- Per-phase behavior:
  - unfolding: slow sway, hinge opens/closes periodically (short vulnerable window).
  - unfolded: faster lateral sweep, longer vulnerable window, BSOD screen.
  - berserk: fast zig-zag, short erratic windows, panic screen + Mac chime.
- Model API: add `iphoneDuoModel.enterPhase(phase)` that sets fold angle, screen mode
  and effects for that phase; `birds.ts` calls it once per transition instead of
  setting angle/screen inline.

## Design Req 3 — humor & hooks
- Keep Ceramic Shield deflect for non-crit AND for crits during a non-vulnerable window.
- Map existing SFX/screens onto phases (crash→unfolded, panic→berserk, chimes on
  transitions).
- Add a boss-exclusive gag: spinning beachball loader during transitions; "No Signal"
  overlay in berserk.

## Design Req 2/6 — HUD
- Add a boss HP / phase indicator to the HUD (3 pips or a phase label), shown only in
  Level 5. Coordinate with the HUD cleanup spec so it does not re-add clutter.

## Affected files
- `src/models/environment.ts` — arena group + `setLevel(5)`.
- `src/models/birds.ts` — phase machine, vulnerability gating, transition calls.
- `src/models/iphoneDuo.ts` — `enterPhase()` API, per-phase visuals.
- `src/game.ts` — boss HUD callbacks / phase readout.
- `src/i18n.ts` — phase/HUD strings, boss gag copy (de + en).
- `tests/faltality.spec.ts` — extend the boss-phase test (distinct phases + vulnerability
  window).

## Risks / edge cases
- Vulnerability timing must be fair at the game's throw cadence — tune windows so the
  fight is winnable with the 6-sheet budget (`lvl5` maxSheets).
- Don't regress the existing boss E2E; extend it.
- Asset budget: prefer procedural toon meshes for the arena over new heavy GLBs.
- Rebase ordering: sits on top of cleanup (and ideally pre-boss) to avoid
  `environment.ts`/`levels.ts` conflicts.
