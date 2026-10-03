# Design: Campaign & Controls Cleanup

Reference: `requirements.md` (same directory). Code base: `main` @ `1f9e397`.

## Design decisions (resolving the open points from requirements)

| Question | Decision | Rationale |
|---|---|---|
| Remove or keep iAim? | **Keep — always on, and keep the non-toggling `toggleAutoAim()` as a gag** | iAim is the core aiming mechanic (`autoAim` defaults `true`, drives locked-on power/aim). Free-hand aiming is too fiddly on a laptop, so always-on is the intended default. |
| Wire `KeyA` or just fix docs? | **Wire `KeyA` so the gag is playable** | Press A → brief "iAim: OFF" flash that snaps back to "ON". Makes the Apple-satire joke experienceable instead of a dead README line. A is a free key. |
| Keep `iAimOff` string? | **Keep** | Needed for the gag flash. |
| Unreachable `!autoAim` manual branch? | **Remove the unreachable branch only** | `autoAim` is never `false`, so these branches are dead. But do NOT touch the shared `pitchDeg`/`yawDeg`/trajectory system — iAim uses it too. |
| Remove or keep slingshot drag? | **Remove, possibly rename `cancelSlingshotDrag` to `resetAimState`** | Direct Look is active; the drag branch is a dead path. Reset semantics may still be needed. |
| Target cycling: `T` or `Tab`? | **Remove `Tab`, keep `T`** | `Tab` collides with browser focus switch / a11y; `T` is conflict-free. Menu button stays. |
| Pitch/power sliders? | **Keep as touch/assist control, but document as secondary** | On touch devices without a mouse they are the only fine-tuning path; they only mirror `game.pitchDeg`/power and create no second source of truth. Removing them would degrade mobile. |

> Notes:
> - iAim is kept always-on by design; a real **manual aiming mode is a possible later
>   feature** (Could-item), explicitly out of scope for this spec.
> - The slider decision is a deliberate "keep" because the sliders are mobile
>   functionality, not legacy code.

## Affected files

- `src/levels.ts` — unlock logic (Req 1).
- `src/game.ts` — keep `toggleAutoAim`/`autoAim` (gag, always on); remove the
  unreachable `!autoAim` manual branch (Req 2); clean up slingshot drag (Req 3).
- `src/main.ts` — keyboard handler: wire `KeyA` to the iAim gag flash (Req 2); remove
  the `Tab` binding for target cycling (Req 4).
- `src/i18n.ts` — keep `iAimOn`/`iAimOff` (used by the gag flash); fix the `keymapA`
  doc string to describe the gag; sync keymap strings with active bindings (Req 4).
- `README.md` — fix the keymap table: `A` = iAim gag (can't be turned off) (Req 2 + 4).
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

## Design Req 2 — keep iAim always on (gag), remove unreachable manual branch
- Keep `autoAim = true` and the locked-on throw behavior unchanged.
- Keep `toggleAutoAim()` as an intentional gag; add a clear comment, e.g.
  `// Intentional no-op: iAim can't be turned off (Apple joke). Flashes OFF then snaps back.`
- Wire `KeyA` in the keydown handler (`src/main.ts`) to call `toggleAutoAim()` and
  trigger a brief UI flash: show `iAimOff` ("iAim: OFF") for ~600ms, then revert to
  `iAimOn`. `autoAim` itself never changes.
- Remove the unreachable `!autoAim` branch at `src/game.ts:804` and the
  `!game.autoAim` condition at `src/main.ts:1372` — but DO NOT remove or alter
  `pitchDeg`/`yawDeg`/`updateTrajectory`, which iAim relies on.
- Keep `iAimOn` AND `iAimOff` in i18n (both used by the gag flash).
- Note: the `isManualAiming` field and a true manual aiming mode are deferred to a
  possible later feature; leave `isManualAiming` only if still referenced by kept
  code, otherwise remove it with the unreachable branch.

## Design Req 3 — slingshot drag
- `startChargingShot()` currently sets `isSlingshotDragging = true` and branches on
  `!autoAim`. Since iAim is always on, the manual drag sub-path is dead. Reduce
  `startChargingShot()` to the locked-on charge path.
- The `pointermove` Direct-Look guard (`src/main.ts:1372`) reads
  `(!game.autoAim || game.isSlingshotDragging)`; with iAim always on and the drag
  path removed, re-evaluate whether this listener is still needed at all. If not,
  remove it; if yes, simplify the condition.
- Remove `isSlingshotDragging`; check whether callers of `cancelSlingshotDrag()`
  (`game.ts:586`, `:745`) only reset state; if so, rename to `resetAimState()` and
  reduce its body to the minimum. Keep any reset that iAim still needs between throws.

## Design Req 4 — duplicate binding & docs
- In the keydown handler (`src/main.ts`), remove the `Tab` case for target cycling,
  keep `T`. Only remove `preventDefault` for `Tab` if it existed solely for cycling.
- README keymap: keep `A` but re-describe it as the iAim gag (can't be turned off);
  list active keys (`F` fold, `Space` aim/throw, `T` next target, `A` iAim gag,
  `C` camera reset, `U` material, arrow keys fine-tune) — reconcile against the actual
  bindings in `main.ts`, **not** from memory.

## Risks / edge cases
- Progress already stored in localStorage with "Level 2 unlocked=true" from local
  play: `loadProgress()` resets WIP to `false` live → non-critical.
- Removing `Tab` must not break normal browser tab navigation in the menu (verify it
  was only intercepted in the game context before).
- The i18n type change must be consistent across ALL language objects, otherwise
  `tsc` errors — the intended compiler safety net.
