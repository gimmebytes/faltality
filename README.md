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
   - Am Himmel ziehen gefaltete japanische Origami-Kraniche, Origami-Tauben, Möwen und die gefürchtete *iFold Origami Stealth Dart* ihre Bahnen.
   - Steuere deinen Schuss flüssig mit den **Pfeiltasten [↑ ↓ ← →]** oder der Maus.
   - Drücke die **Leertaste** zum blitzschnellen Moorhuhn-Abschuss!

3. **Phase 3: Flug & Faltality**
   - Das Papier pfeift zischend durch den Himmel! Bei einem Treffer schaltet das Spiel in filmische Zeitlupe, bunte Origami-Papierschnipsel wirbeln umher, die **F A L T A L I T Y !**-Fanfare ertönt und der Vogel schwebt mit einem Fallschirmchen zu Boden.

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

- **WebGL & Three.js** mit geometrischen Origami-3D-Skulpturen, custom Flat-Shading und weichen Schatten
- **Vite & TypeScript** für blitzschnelle Performance und HMR
- **Web Audio API Synth**: Knusprige Papier-Faltgeräusche, dynamische Flug-Whooshes, Gans-Honks und generative Debussy-Klaviertöne ohne externe Asset-Downloads
- **Canvas-Confetti & Origami-Partikel** für den Triumph-Moment bei einem Treffer

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

---

## 🐳 Docker Deployment

Das Spiel ist vollständig containerisiert und kann als leichtgewichtiger Nginx-Container betrieben werden.

### Lokaler Docker-Start
```bash
docker build -t faltality:latest .
docker run -p 8080:8080 faltality:latest
```
