# Spec: Campaign & Controls Cleanup

Status: Draft
Branch: `spec/campaign-and-controls-cleanup`
Scope: Pure quality/hygiene fixes. NO theming, NO boss rework, NO new levels.
Order in the overall plan: **this → `pre-boss-levels` → `boss-finale`**.

## Background

Reviewing the game surfaced two problem classes that should be fixed independently
of the planned level/boss redesign:

1. **Campaign is not completable on the live site** (blocking bug).
2. **Control leftovers** from earlier iterations (dead code, duplicate bindings,
   documentation drift) that make the control concept unclear.

All findings were verified against the code on `main` (commit `1f9e397`).

---

## Requirement 1 — Campaign unlock skips WIP level

**User Story:** As a player on the live site I want to progress past Level 1 so that
the campaign is completable at all.

**Current state (bug):** `CampaignProgressManager.saveLevelCompletion()` in
`src/levels.ts` rigidly unlocks `levelId + 1`. Level 2 (Coast) is `isWip: true` and
locked on non-local deployments. So after Level 1, Level 2 is targeted but stays
locked — and Level 3 is **never** reachable. On `isLocal` everything is unlocked, so
it does not surface locally.

### Acceptance Criteria
1. WHEN a level is completed with ≥1 star, THEN the system unlocks the next
   **non-WIP** level (not blindly `+1`), as long as WIP gating is active (`!isLocal`).
2. WHEN playing on `isLocal`, THEN behavior is unchanged (all levels incl. WIP
   reachable).
3. WHEN Level 1 is completed live, THEN Level 3 is unlocked afterwards (Level 2
   skipped while `isWip`).
4. The return value `newlyUnlockedLevel` names the level id that was actually
   unlocked.
5. No regression: ordering/progression on `isLocal` identical to before.

---

## Requirement 2 — Remove dead iAim auto-lock

**User Story:** As a developer I want no code or UI strings for a feature that is not
reachable, so that the control concept is honest.

**Current state:** `game.toggleAutoAim()` (`src/game.ts:598`) exists, but **no**
`KeyA` binding and **no** button in `src/main.ts` calls it. The i18n strings
`iAimOn`/`iAimOff` and the README doc for key `A` describe a dead function.

### Acceptance Criteria
1. WHEN the decision "remove iAim" holds, THEN `toggleAutoAim` and the related
   `autoAim` state logic are removed OR deliberately wired to a real control —
   **not** half of both.
2. WHEN iAim is removed, THEN `iAimOn`/`iAimOff` are removed from every language in
   `src/i18n.ts` and the README keymap is updated.
3. No dead reference remains (grep for `iAim`, `autoAim`, `toggleAutoAim` empty, or
   only at deliberately kept locations).

**Design default (see design.md):** iAim is **removed**, since it has no control and
the project backlog names "Direct Look + Hold-to-Charge" as the target paradigm.

---

## Requirement 3 — Clean up old slingshot-drag leftovers

**User Story:** As a developer I want only one active aiming paradigm in the code, so
that pointer handling stays maintainable.

**Current state:** `isSlingshotDragging`, `cancelSlingshotDrag()` and the drag branch
in `startChargingShot()` (`src/game.ts`) are leftovers of the old inverted-swipe
control that the backlog says was replaced by Direct Look.

### Acceptance Criteria
1. WHEN Direct Look + Hold-to-Charge is the active paradigm, THEN the slingshot-drag
   plumbing is removed, or — if `cancelSlingshotDrag` is still needed as a reset hook
   — renamed/reduced to the active paradigm.
2. No behavioral regression when aiming/charging a throw (covered by E2E tests).
3. `make build` and `make test` stay green.

---

## Requirement 4 — Control duplicate bindings & doc drift

**User Story:** As a player I want a consistent, documented control scheme so that the
keymap display and reality match.

**Current state:**
- Target cycling is bound multiple ways: `T` **and** `Tab` **and** a menu button.
- `pitchSlider`/`powerSlider` (`src/main.ts`, `index.html`) exist in parallel to the
  mouse Direct-Look/charge control and to the arrow keys → multiple input paths for
  the same value.
- The README keymap lists controls that no longer exist / are decoupled (`A`).

### Acceptance Criteria
1. WHEN target cycling is bound, THEN there is **one** unambiguous key binding
   (decision in design.md) plus optionally the menu button; the second key binding is
   removed.
2. The pitch/power sliders are, as a deliberate decision, either kept as an assist OR
   removed — documented in design.md; no silent dual state.
3. WHEN the controls are finalized, THEN the README keymap exactly reflects the
   actually active controls.
4. The i18n keymap strings (`keymapTitle`, `cycleTarget`, etc.) match the active
   bindings.

---

## Non-Goals (Out of Scope)
- No new level theming (MIT campus, airport) — separate spec `pre-boss-levels`.
- No boss arena / 3-phase fight — separate spec `boss-finale`.
- No reactivation of Level 2 (Coast) as a design decision — only the unlock mechanism
  is corrected.

## Verification Gate
A sub-task counts as done only when `make build` and `make test` are green.
