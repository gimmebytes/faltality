# Spec: Pre-Boss Levels (1–4)

Status: Draft
Branch: `spec/pre-boss-levels`
Depends on: `campaign-and-controls-cleanup` merged first (both touch `levels.ts` /
`environment.ts`; rebase this branch onto the new `main` before writing code).
Order in the overall plan: `campaign-and-controls-cleanup` → **this** → `boss-finale`.

## Background & guiding principle

The 4 pre-boss levels currently lack a coherent sense of place and progression. Level 1
(Garden) and Level 2 (Coast) have dedicated 3D scenery; Levels 3–5 fall through
`setLevel()` and render on the Garden backdrop. Level 3's theme ("Neighbor's Car
Alarm") also feels like a repeat of Level 1 (suburb again).

**Guiding principle agreed with the user: the folding table is always the player's
vantage point — it just stands somewhere different each level.** Same mechanic, same
fold camera; only the world around the table changes, scaling from ground to orbit so
the finale (Apple/Cupertino, separate `boss-finale` spec) lands naturally.

**Important consequence (verified in code):** the car-alarm / crater gag is currently a
GLOBAL environment reaction — `triggerCarAlarm()` + `triggerFaintingSheep()` fire on any
5+-fold overkill miss in every level (`src/game.ts`, `isOverkillMiss`). Under the
"table stands somewhere" principle this gag must become **location-bound to Level 1**
(where the table stands in the suburban garden with the car + sheep). Other locations
get their own location-specific reaction instead.

## Level map (agreed)

| Level | Table stands … | Target | Level-exclusive easter egg |
|---|---|---|---|
| 1 Garden | own suburban garden | low birds | 🐑 fainting sheep + 🚗 car alarm (ONLY here) |
| 2 Coast | Baltic seaside | gulls / crab cutter boat | 🦀 crab scuttles off / boat horn |
| 3 MIT campus | campus courtyard / rooftop | pigeons between buildings | 🍕 Domino's/Starship delivery robot → shoot it = pizza bonus |
| 4 Airport | runway apron / tower roof | FL-404 airliner | ✈️ airliner porthole gag |

Level 5 (Cupertino/Apple Store boss) is out of scope here — see `boss-finale`.

---

## Requirement 1 — "Table stands somewhere" vantage model

**User Story:** As a player I want each level to feel like a distinct place while I keep
folding from the same table, so the game has a coherent sense of progression.

### Acceptance Criteria
1. Each pre-boss level (1–4) presents a distinct environment while the fold table and
   fold-camera logic stay the same.
2. The progression reads ground → seaside → urban (MIT) → airport, setting up the
   orbit/Cupertino finale.
3. No level after 1 renders on the Garden backdrop by fallthrough.

---

## Requirement 2 — Car-alarm gag becomes Level-1-only

**User Story:** As a player I want the car-alarm/sheep gag only where it makes sense
(the suburban garden), so it is a signature of Level 1 rather than firing in the
stratosphere.

**Current state:** `triggerCarAlarm()`/`triggerFaintingSheep()` fire globally on
overkill miss and on hitting airplane/satellite/iphone_duo (`src/game.ts`).

### Acceptance Criteria
1. The car alarm + fainting sheep reactions only trigger in Level 1.
2. Overkill misses in Levels 2–4 produce a location-appropriate reaction (or none), not
   a car alarm.
3. Existing Level 1 behavior is unchanged.

---

## Requirement 3 — Level 3 re-themed to MIT campus (+ pizza robot easter egg)

**User Story:** As a player I want Level 3 to be its own place (MIT campus) rather than a
second suburb, with a fun exclusive easter egg.

**Current state:** Level 3 theme is "Neighbor's Car Alarm" (`lvl3*` i18n), mechanic
`trigger_crater`; no dedicated environment.

### Acceptance Criteria
1. Level 3 gets a dedicated MIT-campus environment branch in `setLevel()` (buildings,
   courtyard/rooftop, campus props); it no longer uses the Garden backdrop.
2. A 🍕 delivery robot (Starship/Domino's style) crosses the scene as an OPTIONAL moving
   bonus entity (pattern analogous to the existing boat/satellite); it is not the level
   objective.
3. Hitting the robot grants a pizza bonus: +1 sheet (reusing the existing
   `levelSheetsRemaining++` "curiosity bonus" pattern) plus a pizza score/confetti
   reward.
4. The robot exists only in Level 3 (distinct, non-repeating easter egg).
5. `lvl3*` i18n texts (title/subtitle/desc/objective/stars) are updated to the MIT theme
   in all languages.

---

## Requirement 4 — Level 4 re-homed to the airport (runway)

**User Story:** As a player I want Level 4 (shoot down airliner FL-404) to take place
somewhere that makes the airliner plausible, not back in the garden.

**Current state:** Level 4 "Flug FL-404" has no dedicated environment (Garden
fallthrough).

### Acceptance Criteria
1. Level 4 gets a dedicated airport environment (runway apron / tower roof, the FL-404
   taking off / passing); table stands at the runway edge.
2. The airliner remains the objective; aiming/mechanic unchanged.
3. Level 4 easter egg (airliner porthole gag) is exclusive to Level 4.

---

## Requirement 5 — Distinct, non-repeating easter eggs

**User Story:** As a player I want each level's easter egg to be unique, so discovery
stays fresh.

### Acceptance Criteria
1. Each level 1–4 has exactly one signature easter egg, bound to a level-exclusive
   entity (sheep/car, crab/boat, pizza robot, airliner porthole).
2. No easter egg entity appears in more than one level.
3. The car-alarm gag remains the single intentional GLOBAL-feeling running gag, but
   location-bound to Level 1 per Requirement 2.

---

## Non-Goals (Out of Scope)
- Level 5 / boss arena / Cupertino — spec `boss-finale`.
- Unlock bug & controls/HUD cleanup — spec `campaign-and-controls-cleanup`.
- Reactivating Level 2 as non-WIP — a separate product decision.
- A manual aiming mode — deferred (see cleanup spec).

## Open assumptions to confirm before coding
- A1: Level 2 (Coast) stays `isWip` for now; this spec only polishes its theme if
  touched, it does not unlock it.
- A2: MIT campus is stylized/parody, not a licensed depiction (toon aesthetic).

## Verification Gate
Each sub-task ends with green `make build` + `make test`; commit per task using
Conventional Commits.
