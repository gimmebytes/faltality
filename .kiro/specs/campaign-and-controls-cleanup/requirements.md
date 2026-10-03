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

## Requirement 2 — iAim is always on (keep as a gag), remove the unreachable manual path

**User Story:** As a player I want aiming to just work by default (iAim always on),
because free-hand aiming on a laptop is too fiddly; and as a developer I want the
code to be honest about the fact that iAim cannot be turned off.

**Current state (verified):** `autoAim` defaults to `true` (`src/game.ts:48`) and
`toggleAutoAim()` (`src/game.ts:598`) is a no-op: it sets `autoAim = true` and returns
`true` — it never actually toggles off. iAim is the **core aiming mechanic**, not dead
code: when a target is locked (`autoAim && targetedBird`) a throw starts at
`basePower = 80` and skips manual aiming (`src/game.ts:798`, `:804`). Because
`autoAim` is never `false`, the `!autoAim` branches (`src/game.ts:804`,
`src/main.ts:1372`) are **unreachable** manual-aiming code. There is no `KeyA` binding
and no button; the README documents key `A` for a toggle that does not exist.

**Design intent:** iAim stays always on and is the default. The non-toggling
`toggleAutoAim()` is kept intentionally as an Apple-satire gag ("you can't turn iAim
off"). A real manual aiming mode is a possible LATER feature, not part of this spec.

### Acceptance Criteria
1. `autoAim` stays `true` by default and iAim remains the active aiming mechanic (no
   behavioral change to a locked-on throw).
2. `toggleAutoAim()` is kept as an intentional gag, but clearly commented as a
   deliberate no-op so it is not mistaken for a bug.
3. The unreachable `!autoAim` manual-aiming branches (`src/game.ts:804`,
   `src/main.ts:1372`) are removed or simplified, WITHOUT touching the shared
   `pitchDeg`/`yawDeg`/trajectory system that iAim itself uses.
4. The README keymap is corrected: either wire `KeyA` so the gag is playable (press A
   → brief "iAim: OFF" flash that snaps back to "ON"), or drop the `A` line entirely.
   Decision recorded in design.md.
5. i18n `iAimOn`/`iAimOff`: keep both only if the gag flash in 4 is implemented;
   otherwise remove `iAimOff` as unreachable. Decision recorded in design.md.
6. A possible future "manual aiming mode" is noted in design.md as a Could-item, so the
   intent behind the removed branch is not lost.

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

## Requirement 5 — HUD declutter: redundancy & consistency

**User Story:** As a player I want an uncluttered, consistent in-game HUD so that the
screen is readable and does not show the same information twice or in two languages.

**Current state (verified via live screenshot at `localhost:5173`, Level 1):**
- The level is shown **twice at once**: the top-right mode pill (`#mode-pill-text`,
  "Level 1: The Garden Fence 0%") and a bottom-right mission panel
  (`#campaign-mission-objective`, "LEVEL 1: THE GARDEN FENCE · Goal 0/2 · Bonus…").
- The game title bar (`#logo-title` "FALTALITY" + `#logo-badge` "iFold Edition")
  stays visible during play, where it is redundant with the intro screen.
- A clipped element ("…o launch!") protrudes at the top-left of the viewport —
  likely the `#slingshot-drag-indicator` or a launch hint (ties into Req 3).
- Language is mixed: the intro keymap box reads "SCHNELLSTART-STEUERUNG (CONTROLS)"
  and the keymap modal (`#keymap-modal`, lines ~420-454 in `index.html`) is
  hard-coded German text instead of going through i18n.

### Acceptance Criteria
1. The current level is shown in **one** place during play; the duplicate is removed or
   repurposed (decision in design.md). Both must not show the same level text at once.
2. The in-game title bar (`#logo-title` + `#logo-badge`) is hidden during active
   gameplay (it may stay on the intro screen).
3. The clipped top-left launch/drag element no longer protrudes; if it is the
   slingshot-drag indicator it is removed with Req 3, otherwise it is repositioned to
   stay inside the viewport.
4. The keymap modal (`#keymap-modal`) and the intro keymap box no longer mix languages;
   their text flows through i18n and matches the active UI language.
5. No regression to score/combo/objective readouts or the Fold-O-Meter panel (the
   latter is explicitly out of scope here — see Non-Goals).

---

## Non-Goals (Out of Scope)
- No new level theming (MIT campus, airport) — separate spec `pre-boss-levels`.
- No boss arena / 3-phase fight — separate spec `boss-finale`.
- No reactivation of Level 2 (Coast) as a design decision — only the unlock mechanism
  is corrected.
- **No Fold-O-Meter redesign.** The large left-hand FOLD-O-METER / tier-list panel
  (1-2 City Pigeon … 11+ Tim Cook Sat) takes ~25% of screen width, but reworking it
  (collapsible/compact layout) is UX redesign, not cleanup — deferred to a future
  dedicated `hud-ux` spec.

## Verification Gate
A sub-task counts as done only when `make build` and `make test` are green.
