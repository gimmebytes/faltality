# Tasks: Campaign & Controls Cleanup

Bezug: `requirements.md`, `design.md`. Branch: `spec/campaign-and-controls-cleanup`.
Jede Task endet mit grünem `make build` + `make test`.

- [ ] 1. Unlock-Logik auf „nächstes nicht-WIP Level" umstellen
  - `saveLevelCompletion()` in `src/levels.ts` nach design.md anpassen
  - `newlyUnlockedLevel` liefert die tatsächlich freigeschaltete Id
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. E2E-Test für den Unlock-Fix ergänzen
  - Test: Level 1 abschließen bei aktivem WIP-Gating → Level 3 unlocked, Level 2 locked
  - Local-Pfad: unverändert (Level 2 unlocked)
  - _Requirements: 1.3, 1.5_

- [ ] 3. Toten iAim-Code entfernen
  - `toggleAutoAim()` + `autoAim`-State aus `src/game.ts` entfernen
  - sicherstellen, dass Target-Cycling/Reticle davon unabhängig weiterläuft
  - _Requirements: 2.1, 2.3_

- [ ] 4. iAim-i18n-Strings entfernen & Typ anpassen
  - `iAimOn`/`iAimOff` in allen Sprachen in `src/i18n.ts` löschen
  - Strings-Interface anpassen → `tsc` grün
  - _Requirements: 2.2, 2.3_

- [ ] 5. Slingshot-Drag-Reste bereinigen
  - Drag-Zweig in `startChargingShot()` entfernen; `isSlingshotDragging` entfernen
  - `cancelSlingshotDrag()` prüfen → ggf. zu `resetAimState()` reduzieren/umbenennen
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6. Ziel-wechseln-Doppelbindung auflösen (`Tab` raus, `T` bleibt)
  - `Tab`-Case im Keydown-Handler in `src/main.ts` entfernen
  - Menü-Button bleibt funktional
  - _Requirements: 4.1_

- [ ] 7. Bestehenden Target-Cycling-E2E-Test anpassen
  - `tests/faltality.spec.ts` „Tab / T target cycling": nur noch `T` erwarten
  - _Requirements: 4.1_

- [ ] 8. Pitch-/Power-Slider-Entscheidung dokumentieren (behalten als Assist)
  - keine Code-Entfernung; nur bestätigen, dass Slider nur `game`-Werte spiegeln
  - Kommentar/Doku-Hinweis, dass sie sekundäres Touch-Assist sind
  - _Requirements: 4.2_

- [ ] 9. README-Keymap & i18n-Keymap gegen aktive Bindings synchronisieren
  - `README.md`: `A`-Zeile raus; aktive Keys gegen `main.ts` abgeglichen auflisten
  - `keymapTitle`/`cycleTarget` etc. in `src/i18n.ts` passend
  - _Requirements: 2.2, 4.3, 4.4_

- [ ] 10. Abschluss-Gate & PR
  - `make build` + `make test` grün
  - manuelle Smoke: Level 1 → Level 3 Freischaltung lokal simuliert
  - PR `spec/campaign-and-controls-cleanup` → `main` öffnen (Body via --body-file)
  - _Requirements: alle_
