# 🦢 FALTALITY (iFold Edition)

Ein satirisch-physikalisches 3D-Browsergame im charmanten Low-Poly Flat-Shading Stil von **Untitled Goose Game**, gewidmet dem Mythos des exponentiellen Papierfaltens und dem Erscheinen des neuen *iPhone Fold*.

---

## 🎯 Das 2-Phasen-Spielprinzip

> *"Ein normales Blatt Papier kann man nur 7 Mal falten – aber was passiert, wenn du es weiter faltest?"*

In **FALTALITY** startest du mit einem frischen Blatt Papier auf einem gemütlichen Gartentisch. 

1. **Phase 1: Faltmodus (Tischperspektive)**
   - Du sitzt am Tisch und faltest dein Blatt (`Taste F`).
   - Jede Faltung verdoppelt die Schichten und Dicke exponentiell ($d = 0.1\,\text{mm} \cdot 2^n$).
   - Nach ausreichend Faltungen drückst du die **Leertaste** (oder Klick auf **ZIELEN**), um in den Zielmodus zu wechseln.

2. **Phase 2: Zielmodus (Himmelsperspektive)**
   - Die Kamera schwenkt majestätisch hoch in den Himmel über den Garten.
   - Am Himmel ziehen Stadttauben, die britische Garten-Gans mit ihrer roten Schleife, Küstenmöwen und die legendäre *iFold Apple Delivery Drone* ihre Bahnen.
   - Steuere deinen Schuss flüssig mit den **Pfeiltasten [↑ ↓ ← →]** oder der Maus.
   - Drücke die **Leertaste** zum Abschuss!

3. **Phase 3: Flug & Faltality**
   - Sobald du einen Vogel triffst, schaltet das Spiel in filmische Zeitlupe, die ikonische **F A L T A L I T Y !**-Fanfare ertönt, Konfetti regnet und der Vogel schwebt mit einem Fallschirmchen zu Boden. Nach jedem Wurf slappt ein neues Blatt auf den Tisch!

---

## ⌨️ Tastenbelegung (Key Map)

| Taste | Aktion |
| --- | --- |
| <kbd>F</kbd> | Papier falten / Zurück zum Tisch wechseln |
| <kbd>Leertaste</kbd> | Zielmodus aktivieren / Papiergeschoss abfeuern |
| <kbd>↑</kbd> <kbd>↓</kbd> | Steigung (Pitch) erhöhen / senken |
| <kbd>←</kbd> <kbd>→</kbd> | Richtung (Yaw) links / rechts steuern |
| <kbd>A</kbd> | Apple iAim Auto-Lock umschalten |
| <kbd>K</kbd> | Tastenbelegung Overlay (Key Map) ein-/ausblenden |
| <kbd>R</kbd> | Frisches Blatt Papier nehmen |
| <kbd>Esc</kbd> | Menüs und Overlays schließen |

---

## 🛠️ Technologie

- **WebGL & Three.js** mit custom Flat-Shading, dynamischer Beleuchtung und weichen Schatten
- **Vite & TypeScript** für blitzschnelle Performance und HMR
- **Web Audio API Synth**: Knusprige Papier-Faltgeräusche, dynamische Flug-Whooshes, Gans-Honks und generative Debussy-Klaviertöne ohne externe Asset-Downloads
- **Canvas-Confetti** für den Triumph-Moment bei einem Treffer

---

## 🚀 Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Dev-Server starten
npm run dev

# Produktions-Build erstellen
npm run build
```
