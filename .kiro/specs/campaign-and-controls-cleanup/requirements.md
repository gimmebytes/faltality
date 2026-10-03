# Spec: Campaign & Controls Cleanup

Status: Draft
Branch: `spec/campaign-and-controls-cleanup`
Scope: Reine Qualitäts-/Hygiene-Fixes. KEIN Theming, KEIN Boss-Umbau, KEINE neuen Level.
Reihenfolge im Gesamtplan: **dieses → `pre-boss-levels` → `boss-finale`**.

## Hintergrund

Review des Spiels ergab zwei Problemklassen, die unabhängig vom geplanten
Level-/Boss-Redesign sofort behoben werden sollten:

1. **Kampagne auf der Live-Site nicht durchspielbar** (blockierender Bug).
2. **Steuerungs-Altlasten** aus früheren Iterationen (toter Code, Doppelbindungen,
   Doku-Drift), die das Steuerungskonzept unklar machen.

Alle Fundstellen wurden am Code auf `main` (Commit `1f9e397`) verifiziert.

---

## Requirement 1 — Kampagnen-Freischaltung überspringt WIP-Level

**User Story:** Als Spieler auf der Live-Site will ich nach Level 1 weiterspielen
können, damit die Kampagne überhaupt durchspielbar ist.

**Ist-Stand (Bug):** `CampaignProgressManager.saveLevelCompletion()` in
`src/levels.ts` schaltet starr `levelId + 1` frei. Level 2 (Küste) ist
`isWip: true` und auf Nicht-Local-Deployments gesperrt. Nach Level 1 wird also
Level 2 angesteuert, bleibt aber gesperrt — und Level 3 wird **nie** erreichbar.
Auf `isLocal` ist alles frei, daher fällt es lokal nicht auf.

### Acceptance Criteria
1. WENN ein Level mit ≥1 Stern abgeschlossen wird, DANN schaltet das System das
   nächste **nicht-WIP** Level frei (nicht blind `+1`), sofern WIP-Gating aktiv ist
   (`!isLocal`).
2. WENN auf `isLocal` gespielt wird, DANN bleibt das Verhalten unverändert (alle
   Level inkl. WIP erreichbar).
3. WENN Level 1 live abgeschlossen wird, DANN ist Level 3 anschließend freigeschaltet
   (Level 2 übersprungen, solange `isWip`).
4. Die Rückgabe `newlyUnlockedLevel` nennt das tatsächlich freigeschaltete Level-Id.
5. Kein Regress: Reihenfolge/Progression auf `isLocal` identisch zu vorher.

---

## Requirement 2 — Toter iAim-Auto-Lock entfernen

**User Story:** Als Entwickler will ich keinen Code und keine UI-Strings für ein
Feature, das nicht erreichbar ist, damit das Steuerungskonzept ehrlich ist.

**Ist-Stand:** `game.toggleAutoAim()` (`src/game.ts:598`) existiert, aber **kein**
`KeyA`-Binding und **kein** Button in `src/main.ts` ruft es auf. Die i18n-Strings
`iAimOn`/`iAimOff` und README-Doku zu Taste `A` beschreiben eine tote Funktion.

### Acceptance Criteria
1. WENN die Entscheidung „iAim entfernen" gilt, DANN werden `toggleAutoAim` und die
   zugehörige `autoAim`-State-Logik entfernt ODER bewusst hinter ein echtes Control
   gehängt — **nicht** beides halb.
2. WENN iAim entfernt wird, DANN werden `iAimOn`/`iAimOff` aus allen Sprachen in
   `src/i18n.ts` entfernt und die README-Keymap angepasst.
3. Kein toter Verweis bleibt übrig (grep nach `iAim`, `autoAim`, `toggleAutoAim` leer
   bzw. nur noch an bewusst behaltenen Stellen).

**Design-Default (siehe design.md):** iAim wird **entfernt**, da es kein Control hat
und das Projekt-Backlog „Direct Look + Hold-to-Charge" als Zielparadigma nennt.

---

## Requirement 3 — Alte Slingshot-Drag-Reste bereinigen

**User Story:** Als Entwickler will ich nur ein aktives Zielparadigma im Code, damit
Pointer-Handling wartbar bleibt.

**Ist-Stand:** `isSlingshotDragging`, `cancelSlingshotDrag()` und der Drag-Zweig in
`startChargingShot()` (`src/game.ts`) sind Reste der alten invertierten
Swipe-Steuerung, die laut Backlog durch Direct-Look ersetzt wurde.

### Acceptance Criteria
1. WENN Direct-Look + Hold-to-Charge das aktive Paradigma ist, DANN wird die
   Slingshot-Drag-Plumbing entfernt oder, falls `cancelSlingshotDrag` noch als
   Reset-Hook gebraucht wird, auf das aktive Paradigma umbenannt/reduziert.
2. Kein Verhaltensregress beim Zielen/Laden eines Wurfs (durch E2E-Tests abgesichert).
3. `make build` und `make test` bleiben grün.

---

## Requirement 4 — Steuerungs-Doppelbindungen & Doku-Drift

**User Story:** Als Spieler will ich eine konsistente, dokumentierte Steuerung, damit
Keymap-Anzeige und Realität übereinstimmen.

**Ist-Stand:**
- Ziel-wechseln ist mehrfach gebunden: `T` **und** `Tab` **und** ein Menü-Button.
- `pitchSlider`/`powerSlider` (`src/main.ts`, `index.html`) existieren parallel zur
  Maus-Direct-Look-/Charge-Steuerung und zu Pfeiltasten → mehrere Eingabewege für
  denselben Wert.
- README-Keymap listet Controls, die nicht mehr existieren/entkoppelt sind (`A`).

### Acceptance Criteria
1. WENN Ziel-wechseln gebunden wird, DANN gibt es **eine** eindeutige Tastenbindung
   (Entscheidung in design.md) plus optional den Menü-Button; die zweite
   Tastenbindung wird entfernt.
2. Die Pitch-/Power-Slider werden als bewusste Entscheidung entweder als Assist
   beibehalten ODER entfernt — dokumentiert in design.md; kein stiller Doppelzustand.
3. WENN die Steuerung finalisiert ist, DANN spiegelt die README-Keymap exakt die
   tatsächlich aktiven Controls wider.
4. Die i18n-Keymap-Strings (`keymapTitle`, `cycleTarget` etc.) stimmen mit den
   aktiven Bindings überein.

---

## Nicht-Ziele (Out of Scope)
- Kein neues Level-Theming (MIT-Campus, Flughafen) — eigene Spec `pre-boss-levels`.
- Keine Boss-Arena / 3-Phasen-Kampf — eigene Spec `boss-finale`.
- Keine Reaktivierung von Level 2 (Küste) als Design-Entscheidung — nur der
  Freischalt-Mechanismus wird korrigiert.

## Verifikations-Gate
Jede Teilaufgabe gilt erst als erledigt, wenn `make build` und `make test` grün sind.
