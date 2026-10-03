# Tasks: Campaign & Controls Cleanup

Reference: `requirements.md`, `design.md`. Branch: `spec/campaign-and-controls-cleanup`.
Each task ends with green `make build` + `make test`, and is committed on completion
using Conventional Commits (one commit per finished task).

- [ ] 1. Switch unlock logic to "next non-WIP level"
  - Adjust `saveLevelCompletion()` in `src/levels.ts` per design.md
  - `newlyUnlockedLevel` returns the level id actually unlocked
  - Commit: `fix: unlock next non-WIP campaign level`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Add an E2E test for the unlock fix
  - Test: completing Level 1 with WIP gating active → Level 3 unlocked, Level 2 locked
  - Local path: unchanged (Level 2 unlocked)
  - Commit: `test: cover WIP-skipping campaign unlock`
  - _Requirements: 1.3, 1.5_

- [ ] 3. Remove the unreachable `!autoAim` manual branch (keep iAim always on)
  - Remove the dead `!autoAim` branch in `src/game.ts:804` and the `!game.autoAim`
    guard in `src/main.ts:1372`; do NOT touch `pitchDeg`/`yawDeg`/`updateTrajectory`
  - Keep `autoAim = true` and locked-on throw behavior unchanged
  - Commit: `refactor: remove unreachable manual-aim branch`
  - _Requirements: 2.1, 2.3_

- [ ] 4. Keep iAim as a gag: comment the no-op and wire `KeyA` flash
  - Add a clear comment on `toggleAutoAim()` marking it a deliberate no-op gag
  - Wire `KeyA` in `src/main.ts` → brief "iAim: OFF" flash that snaps back to "ON"
    (`iAimOn`/`iAimOff` both kept)
  - Commit: `feat: make iAim always-on gag playable via A key`
  - _Requirements: 2.2, 2.4, 2.5, 2.6_

- [ ] 5. Clean up slingshot-drag leftovers
  - Remove the drag branch in `startChargingShot()`; remove `isSlingshotDragging`
  - Review `cancelSlingshotDrag()` → reduce/rename to `resetAimState()` if applicable
  - Commit: `refactor: remove legacy slingshot-drag path`
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6. Resolve target-cycling duplicate binding (`Tab` out, `T` stays)
  - Remove the `Tab` case in the keydown handler in `src/main.ts`
  - Menu button stays functional
  - Commit: `fix: de-duplicate target-cycling key binding`
  - _Requirements: 4.1_

- [ ] 7. Adjust the existing target-cycling E2E test
  - `tests/faltality.spec.ts` "Tab / T target cycling": expect only `T`
  - Commit: `test: expect single target-cycling key`
  - _Requirements: 4.1_

- [ ] 8. Document the pitch/power slider decision (keep as assist)
  - No code removal; just confirm the sliders only mirror `game` values
  - Comment/doc note that they are secondary touch assist
  - Commit: `docs: document pitch/power sliders as touch assist`
  - _Requirements: 4.2_

- [ ] 9. Sync README keymap & i18n keymap with active bindings
  - `README.md`: re-describe `A` as the iAim gag; list active keys reconciled against `main.ts`
  - `keymapTitle`/`cycleTarget`/`keymapA` etc. in `src/i18n.ts` consistent
  - Commit: `docs: sync keymap with active bindings`
  - _Requirements: 2.4, 4.3, 4.4_

- [ ] 10. HUD declutter: remove the duplicate level readout
  - Slim `#mode-pill-text` to level-select affordance; keep the bottom-right mission
    panel as the single in-play level readout
  - Commit: `fix: remove duplicate in-game level readout`
  - _Requirements: 5.1, 5.5_

- [ ] 11. HUD declutter: hide in-game title bar
  - Hide `#logo-title` + `#logo-badge` once gameplay starts; keep them on the intro
  - Commit: `fix: hide in-game title bar during play`
  - _Requirements: 5.2_

- [ ] 12. HUD declutter: fix clipped launch/drag element
  - Removed with Req 3 if it is `#slingshot-drag-indicator`; else reposition in-viewport
  - Commit: `fix: keep launch indicator within viewport`
  - _Requirements: 5.3_

- [ ] 13. HUD declutter: route keymap modal + intro keymap through i18n
  - Replace hard-coded German in `#keymap-modal` and the intro keymap box with i18n keys
  - Commit: `fix: localize keymap modal and intro controls`
  - _Requirements: 5.4_

- [ ] 14. Final gate & PR
  - `make build` + `make test` green
  - Manual smoke: Level 1 → Level 3 unlock simulated locally; HUD visually checked
  - Open PR `spec/campaign-and-controls-cleanup` → `main` (body via --body-file)
  - _Requirements: all_
