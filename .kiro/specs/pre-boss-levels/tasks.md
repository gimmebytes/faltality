# Tasks: Pre-Boss Levels (1–4)

Reference: `requirements.md`, `design.md`. Branch: `spec/pre-boss-levels`.
PRE-STEP: rebase onto `main` after `campaign-and-controls-cleanup` is merged.
Each task ends with green `make build` + `make test`; commit per task (Conventional).

- [ ] 1. Make car-alarm gag Level-1-only
  - Gate `triggerCarAlarm()`/`triggerFaintingSheep()` calls on `currentLevel === 1`
  - Levels 2–4: no car alarm on overkill miss
  - Commit: `fix: scope car-alarm gag to level 1`
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Add setLevel branches + empty groups for L3/L4
  - Add `level3CampusGroup`/`level4AirportGroup`, toggle in `setLevel()`; no Garden
    fallthrough for levels ≥3
  - Commit: `feat: dedicated environment groups for levels 3 and 4`
  - _Requirements: 1.1, 1.3_

- [ ] 3. Build the MIT campus environment (Level 3)
  - Buildings/dome/benches/lamps + cooler sky/fog, reusing existing props where possible
  - Commit: `feat: MIT campus environment for level 3`
  - _Requirements: 1.1, 1.2, 3.1_

- [ ] 4. Re-skin Level 3 i18n to MIT theme (de + en)
  - Rewrite `lvl3*` strings; keep crater mechanic (re-skin only) unless decided otherwise
  - Commit: `feat: re-theme level 3 copy to MIT campus`
  - _Requirements: 3.5_

- [ ] 5. Add the pizza delivery robot bonus entity (Level 3)
  - Robot group on a drifting path; `getRobotWorldPosition/BoundingRadius`, hit handler
  - Hit → `levelSheetsRemaining++` + pizza confetti/score/SFX; not an objective
  - Active only when `currentLevel === 3`
  - Commit: `feat: pizza delivery robot easter egg in level 3`
  - _Requirements: 3.2, 3.3, 3.4, 5.1, 5.2_

- [ ] 6. Build the airport environment (Level 4)
  - Runway/apron/tower/windsock; table at runway edge; FL-404 reused
  - Commit: `feat: airport environment for level 4`
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [ ] 7. Add the airliner porthole easter egg (Level 4)
  - Lit porthole w/ passenger; spilled-coffee flourish on hit; Level-4 only
  - Commit: `feat: airliner porthole easter egg in level 4`
  - _Requirements: 4.3, 5.1, 5.2_

- [ ] 8. Easter-egg registry comment + Level-2 reaction polish
  - Document one-egg-per-level mapping in code; add light coast reaction for overkill
  - Commit: `docs: document per-level easter-egg registry`
  - _Requirements: 5.1, 5.2, 5.3, 2.2_

- [ ] 9. Final gate & PR
  - `make build` + `make test` green; visual smoke of levels 1–4
  - Open PR `spec/pre-boss-levels` → `main` (body via --body-file)
  - _Requirements: all_
