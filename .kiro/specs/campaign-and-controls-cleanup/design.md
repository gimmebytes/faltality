# Design: Campaign & Controls Cleanup

Bezug: `requirements.md` (gleiches Verzeichnis). Code-Basis: `main` @ `1f9e397`.

## Designentscheidungen (die offenen Punkte aus requirements aufgelöst)

| Frage | Entscheidung | Begründung |
|---|---|---|
| iAim entfernen oder verdrahten? | **Entfernen** | Kein Binding/Button vorhanden; Backlog nennt Direct-Look als Zielparadigma. Totes Feature. |
| Slingshot-Drag entfernen oder behalten? | **Entfernen, `cancelSlingshotDrag` als Reset-Hook ggf. in `resetAimState` umbenennen** | Direct-Look ist aktiv; Drag-Zweig ist toter Pfad. Reset-Semantik evtl. noch nötig. |
| Ziel-wechseln: `T` oder `Tab`? | **`Tab` entfernen, `T` behalten** | `Tab` kollidiert mit Browser-Fokuswechsel/A11y; `T` ist konfliktfrei. Menü-Button bleibt. |
| Pitch-/Power-Slider? | **Als Touch-/Assist-Control behalten, aber als sekundär dokumentieren** | Auf Touch-Geräten ohne Maus sind sie der einzige Feinjustage-Weg; sie spiegeln nur `game.pitchDeg`/Power, erzeugen keinen zweiten Wahrheitszustand. Entfernen würde Mobile verschlechtern. |

> Hinweis: Slider-Entscheidung ist die einzige, bei der „behalten" statt „entfernen"
> gewählt wurde — bewusst, weil sie Mobile-Funktionalität sind, kein Alt-Code.

## Betroffene Dateien

- `src/levels.ts` — Unlock-Logik (Req 1).
- `src/game.ts` — `toggleAutoAim`/`autoAim`-State entfernen (Req 2); Slingshot-Drag
  bereinigen (Req 3).
- `src/main.ts` — Keyboard-Handler: `Tab`-Binding fürs Ziel-wechseln entfernen
  (Req 4); keine iAim-Verdrahtung hinzufügen.
- `src/i18n.ts` — `iAimOn`/`iAimOff` in allen Sprachen entfernen (Req 2); Keymap-Strings
  mit aktiven Bindings synchronisieren (Req 4).
- `README.md` — Keymap-Tabelle korrigieren (Req 2 + 4).
- `index.html` — nur falls iAim-Button-Markup existiert (prüfen; Slider bleiben).
- `tests/faltality.spec.ts` — Test „Tab / T target cycling" anpassen: nur noch `T`
  erwartet; Boss-/Folding-Tests bleiben als Regressionsschutz.

## Design Req 1 — Unlock-Logik

Statt `const nextLevelId = levelId + 1;` das nächste nicht-WIP Level suchen,
sobald WIP-Gating aktiv ist:

```ts
const isLocal = isLocalEnvironment();
// nächstes freischaltbares Level: überspringe WIP-Level, wenn nicht lokal
const nextLvl = CAMPAIGN_LEVELS
  .filter(l => l.id > levelId && (isLocal || !l.isWip))
  .sort((a, b) => a.id - b.id)[0];

if (earnedStars >= 1 && nextLvl && progress[nextLvl.id] && !progress[nextLvl.id].unlocked) {
  progress[nextLvl.id].unlocked = true;
  newlyUnlockedLevel = nextLvl.id;
}
```

- `isLocal` → nächstes Level ist immer `levelId+1` (nichts gefiltert) → unverändert.
- `!isLocal` → WIP-Level 2 wird übersprungen, Level 1 schaltet Level 3 frei.
- `loadProgress()` bleibt unverändert (sperrt WIP schon beim Laden).

## Design Req 2 — iAim entfernen
- `toggleAutoAim()` und das `autoAim`-Feld samt Lese-/Schreibstellen entfernen.
- Lock-On-/Reticle-Logik, die NICHT an `autoAim` hängt, bleibt (Target-Cycling via `T`).
- `iAimOn`/`iAimOff` aus jedem Sprachblock in `src/i18n.ts` löschen; Interface-Typ
  (`AppStrings` o.ä.) entsprechend anpassen, damit `tsc` grün bleibt.

## Design Req 3 — Slingshot-Drag
- Drag-Zweig in `startChargingShot()` entfernen; Funktion auf den Direct-Look-/
  Charge-Pfad reduzieren.
- `isSlingshotDragging` entfernen; `cancelSlingshotDrag()` → prüfen, ob Aufrufer
  (`game.ts:586`, `:745`) nur State zurücksetzen; falls ja, in `resetAimState()`
  umbenennen und Inhalt auf das Nötige reduzieren.

## Design Req 4 — Doppelbindung & Doku
- Im Keydown-Handler (`src/main.ts`) den `Tab`-Case fürs Ziel-wechseln entfernen,
  `T` behalten. `preventDefault` für `Tab` nur entfernen, wenn es ausschließlich fürs
  Cycling da war.
- README-Keymap: Zeilen für `A` (iAim) streichen; aktive Keys (`F` falten,
  `Space` zielen/werfen, `T` nächstes Ziel, `C` Kamera-Reset, `U` Material, Pfeiltasten
  Feinjustage) auflisten — gegen tatsächliche Bindings in `main.ts` abgleichen,
  **nicht** aus dem Gedächtnis.

## Risiken / Edge Cases
- Bereits in localStorage gespeicherter Fortschritt mit „Level 2 unlocked=true" aus
  Local-Spiel: `loadProgress()` setzt WIP live auf `false` zurück → unkritisch.
- `Tab`-Entfernung darf die normale Browser-Tab-Navigation im Menü nicht brechen
  (vorher nur im Spielkontext abgefangen prüfen).
- i18n-Typänderung muss in ALLEN Sprachobjekten konsistent sein, sonst `tsc`-Fehler —
  gewünschter Compiler-Schutz.
