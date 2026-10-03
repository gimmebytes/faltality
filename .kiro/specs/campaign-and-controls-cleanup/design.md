# Design: Campaign & Controls Cleanup

Reference: `requirements.md` (same directory). Code base: `main` @ `1f9e397`.

## Design decisions (resolving the open points from requirements)

| Question | Decision | Rationale |
|---|---|---|
| Remove or wire iAim? | **Remove** | No binding/button present; backlog names Direct Look as the target paradigm. Dead feature. |
| Remove or keep slingshot drag? | **Remove, possibly rename `cancelSlingshotDrag` to `resetAimState`** | Direct Look is active; the drag branch is a dead path. Reset semantics may still be needed. |
| Target cycling: `T` or `Tab`? | **Remove `Tab`, keep `T`** | `Tab` collides with browser focus switch / a11y; `T` is conflict-free. Menu button stays. |
| Pitch/power sliders? | **Keep as touch/assist control, but document as secondary** | On touch devices without a mouse they are the only fine-tuning path; they only mirror `game.pitchDeg`/power and create no second source of truth. Removing them would degrade mobile. |

> Note: the slider decision is the only one where "keep" was chosen over "remove" —
> deliberately, because they are mobile functionality, not legacy code.

## Affected files

- `src/levels.ts` — unlock logic (Req 1).
- `src/game.ts` — remove `toggleAutoAim`/`autoAim` state (Req 2); clean up
  slingshot drag (Req 3).
- `src/main.ts` — keyboard handler: remove the `Tab` binding for target cycling
  (Req 4); do not add iAim wiring.
- `src/i18n.ts` — remove `iAimOn`/`iAimOff` in all languages (Req 2); sync keymap
  strings with active bindings (Req 4).
- `README.md` — fix the keymap table (Req 2 + 4).
- `index.html` — only if iAim button markup exists (check; sliders stay).
- `tests/faltality.spec.ts` — adjust the "Tab / T target cycling" test: expect only
  `T`; boss/folding tests stay as regression protection.

## Design Req 1 — unlock logic

Instead of `const nextLevelId = levelId + 1;`, find the next non-WIP level once WIP
gating is active:

```ts
const isLocal = isLocalEnvironment();
// next unlockable level: skip WIP levels when not local
const nextLvl = CAMPAIGN_LEVELS
  .filter(l => l.id > levelId && (isLocal || !l.isWip))
  .sort((a, b) => a.id - b.id)[0];

if (earnedStars >= 1 && nextLvl && progress[nextLvl.id] && !progress[nextLvl.id].unlocked) {
  progress[nextLvl.id].unlocked = true;
  newlyUnlockedLevel = nextLvl.id;
}
```

- `isLocal` → next level is always `levelId+1` (nothing filtered) → unchanged.
- `!isLocal` → WIP Level 2 is skipped, Level 1 unlocks Level 3.
- `loadProgress()` stays unchanged (already locks WIP on load).

## Design Req 2 — remove iAim
- Remove `toggleAutoAim()` and the `autoAim` field plus its read/write sites.
- Lock-on / reticle logic that does NOT depend on `autoAim` stays (target cycling via
  `T`).
- Delete `iAimOn`/`iAimOff` from every language block in `src/i18n.ts`; adjust the
  strings interface type (`AppStrings` or similar) so `tsc` stays green.

## Design Req 3 — slingshot drag
- Remove the drag branch in `startChargingShot()`; reduce the function to the
  Direct-Look/charge path.
- Remove `isSlingshotDragging`; check whether callers of `cancelSlingshotDrag()`
  (`game.ts:586`, `:745`) only reset state; if so, rename to `resetAimState()` and
  reduce its body to the minimum.

## Design Req 4 — duplicate binding & docs
- In the keydown handler (`src/main.ts`), remove the `Tab` case for target cycling,
  keep `T`. Only remove `preventDefault` for `Tab` if it existed solely for cycling.
- README keymap: drop the `A` (iAim) line; list active keys (`F` fold, `Space`
  aim/throw, `T` next target, `C` camera reset, `U` material, arrow keys fine-tune) —
  reconcile against the actual bindings in `main.ts`, **not** from memory.

## Risks / edge cases
- Progress already stored in localStorage with "Level 2 unlocked=true" from local
  play: `loadProgress()` resets WIP to `false` live → non-critical.
- Removing `Tab` must not break normal browser tab navigation in the menu (verify it
  was only intercepted in the game context before).
- The i18n type change must be consistent across ALL language objects, otherwise
  `tsc` errors — the intended compiler safety net.
