# Spec: Boss Finale (Level 5 — Cupertino / iPhone Duo)

Status: Draft
Branch: `spec/boss-finale`
Depends on: `campaign-and-controls-cleanup` merged first; ideally `pre-boss-levels`
too (shared `environment.ts`/`levels.ts`). Rebase onto the latest `main` before coding.
Order in the overall plan: `campaign-and-controls-cleanup` → `pre-boss-levels` → **this**.

## Background

The boss (Level 5, iPhone Duo) currently feels unstimmig for two verified reasons:

1. **No dedicated arena.** `environment.setLevel()` only has scenery branches for
   Levels 1 and 2; Level 5 falls through and renders on the Garden sky.
2. **The three "phases" are only cosmetic.** In `src/models/birds.ts` (hit handling
   ~line 912–945): the first non-fatal crit (`health 3→2`) sets `bossPhase = 'unfolded'`
   with fold angle 0 and a crash screen; the second (`health 2→1`) sets `'unfolded'`
   again with a panic screen and higher speed. The declared `'unfolding'` phase is never
   used, and there are no distinct per-phase attack patterns — only screen texture and
   speed differ. The iPhone Duo model (`src/models/iphoneDuo.ts`) has
   normal/bsod/panic screen modes but no real phase behavior API.

The user wants the finale to take place in an Apple Store / Cupertino HQ and the iPhone
Duo to have three real phases, analogous to classic Super Mario boss fights.

---

## Requirement 1 — Dedicated Cupertino / Apple Store arena

**User Story:** As a player I want the final boss to take place in an Apple
Store / Cupertino HQ, so the finale feels like a climax, not the garden again.

### Acceptance Criteria
1. `setLevel(5)` activates a dedicated arena group (glass-store cube / Infinite-Loop
   ring / keynote stage) with its own sky/fog; it never uses the Garden backdrop.
2. The folding table stands in the arena (consistent with the "table stands somewhere"
   vantage principle from `pre-boss-levels`).
3. The arena reads as the climactic location (distinct lighting/props from levels 1–4).

---

## Requirement 2 — Real 3-phase boss fight (Super-Mario style)

**User Story:** As a player I want three distinct boss phases with their own behavior
and vulnerability windows, so the fight feels like a real boss, not a reskin per hit.

**Current state:** phases are cosmetic (see Background); `'unfolding'` unused; both
non-fatal hits jump straight to `'unfolded'` + angle 0.

### Acceptance Criteria
1. A clean phase state machine `closed → unfolding → unfolded → berserk/defeated` with
   each non-final crit advancing exactly one phase (no double-jump to `unfolded`).
2. Each phase has a DISTINCT behavior: its own movement/attack pattern AND its own
   vulnerability window (Mario logic — the weak point / hinge is only exposed part of
   the time, so the player must time crits).
3. Phase transitions escalate audiovisually (fold angle, screen mode normal→bsod→panic,
   speed, glitch/volume) and are driven by the phase machine, not ad-hoc per hit.
4. The iPhone Duo model (`src/models/iphoneDuo.ts`) exposes a phase API
   (e.g. `enterPhase(phase)`) instead of only screen-mode setters, so `birds.ts` drives
   phases through one entry point.
5. Defeating the boss requires surviving/landing crits across all three phases; the
   final (3rd) crit defeats it as today.
6. HUD communicates the current phase / boss HP so the player can read progress.

---

## Requirement 3 — Keep the humor & existing hooks

**User Story:** As a player I want the finale to keep the game's Apple-satire humor and
the existing boss visuals (Ceramic Shield deflection, BSOD/panic, Tim Cook chime).

### Acceptance Criteria
1. Ceramic Shield deflection of non-crit throws is preserved.
2. BSOD/panic screen modes and the boss SFX (hinge, Apple error, Mac chime) are mapped
   onto the new phase machine, not removed.
3. A phase-appropriate gag is added (e.g. a spinning beachball loader between phases,
   "No Signal" in the final phase) — boss-exclusive, consistent with the per-level
   easter-egg rule from `pre-boss-levels`.

---

## Non-Goals (Out of Scope)
- Pre-boss levels 1–4 theming — spec `pre-boss-levels`.
- Unlock bug & controls/HUD cleanup — spec `campaign-and-controls-cleanup`.
- New boss mechanics beyond the 3-phase fight (e.g. minions) unless trivial.

## Open assumptions to confirm before coding
- A1: Apple Store vs. Cupertino HQ ring — default to an Apple-Store glass cube on a
  keynote stage; confirm with the user if a different look is wanted.
- A2: "Vulnerability window" is time-based (hinge opens periodically) rather than
  requiring a specific prior action; confirm if a puzzle-style trigger is preferred.

## Verification Gate
Each sub-task ends with green `make build` + `make test`; commit per task
(Conventional Commits). Boss-phase behavior covered by an E2E test extending the
existing "iPhone Duo boss has 3 critical hit phases" spec.
