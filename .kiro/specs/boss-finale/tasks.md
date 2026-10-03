# Tasks: Boss Finale (Level 5)

Reference: `requirements.md`, `design.md`. Branch: `spec/boss-finale`.
PRE-STEP: rebase onto `main` after `campaign-and-controls-cleanup` (and ideally
`pre-boss-levels`) are merged.
Each task ends with green `make build` + `make test`; commit per task (Conventional).

- [ ] 1. Build the Cupertino / Apple Store arena (Level 5)
  - `level5ArenaGroup` (glass cube, keynote stage, spotlights, Infinite-Loop ring) +
    `setLevel(5)` branch; no Garden fallthrough; table on stage
  - Commit: `feat: Cupertino Apple Store boss arena`
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Add a phase API to the iPhone Duo model
  - `enterPhase(phase)` setting fold angle, screen mode and effects per phase
  - Commit: `feat: iPhone Duo phase API`
  - _Requirements: 2.4_

- [ ] 3. Implement the phase state machine in birds.ts
  - `closed → unfolding → unfolded → berserk → defeated`; one phase per non-final crit;
    drive transitions through `enterPhase()`
  - Commit: `feat: real 3-phase boss state machine`
  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 4. Add per-phase vulnerability windows
  - `isVulnerable` toggles on a per-phase timer; crit only counts while vulnerable,
    else Ceramic Shield deflect
  - Commit: `feat: timed boss vulnerability windows`
  - _Requirements: 2.2, 3.1_

- [ ] 5. Distinct per-phase movement/attack patterns
  - unfolding sway, unfolded lateral sweep, berserk zig-zag; tune for the 6-sheet budget
  - Commit: `feat: distinct per-phase boss attack patterns`
  - _Requirements: 2.2, 2.3_

- [ ] 6. Map existing SFX/screens + add boss gag
  - crash/panic screens + hinge/Apple/Mac SFX onto phases; beachball between phases,
    "No Signal" in berserk
  - Commit: `feat: map boss SFX to phases and add beachball gag`
  - _Requirements: 3.2, 3.3_

- [ ] 7. Boss HP / phase HUD indicator (Level 5 only)
  - 3 pips or phase label; coordinate with HUD cleanup to avoid clutter
  - Commit: `feat: boss phase HUD indicator`
  - _Requirements: 2.6_

- [ ] 8. Extend the boss E2E test
  - Assert distinct phases + a vulnerability window (not just three hits)
  - Commit: `test: cover distinct boss phases and vulnerability`
  - _Requirements: 2.1, 2.2_

- [ ] 9. Final gate & PR
  - `make build` + `make test` green; manual fight playthrough winnable with 6 sheets
  - Open PR `spec/boss-finale` → `main` (body via --body-file)
  - _Requirements: all_
