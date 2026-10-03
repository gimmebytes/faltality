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

- [ ] 3. Remove dead iAim code
  - Remove `toggleAutoAim()` + `autoAim` state from `src/game.ts`
  - Ensure target cycling/reticle keeps working independently
  - Commit: `refactor: remove dead iAim auto-lock`
  - _Requirements: 2.1, 2.3_

- [ ] 4. Remove iAim i18n strings & adjust type
  - Delete `iAimOn`/`iAimOff` in all languages in `src/i18n.ts`
  - Adjust strings interface → `tsc` green
  - Commit: `refactor: drop iAim i18n strings`
  - _Requirements: 2.2, 2.3_

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
  - `README.md`: drop the `A` line; list active keys reconciled against `main.ts`
  - `keymapTitle`/`cycleTarget` etc. in `src/i18n.ts` consistent
  - Commit: `docs: sync keymap with active bindings`
  - _Requirements: 2.2, 4.3, 4.4_

- [ ] 10. Final gate & PR
  - `make build` + `make test` green
  - Manual smoke: Level 1 → Level 3 unlock simulated locally
  - Open PR `spec/campaign-and-controls-cleanup` → `main` (body via --body-file)
  - _Requirements: all_
