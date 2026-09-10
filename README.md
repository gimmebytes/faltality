# 🪶 FALTALITY (iFold Edition)

Ein satirisch-physikalisches 3D-Browsergame im charmanten Low-Poly Flat-Shading Stil von **Untitled Goose Game**, gewidmet dem Mythos des exponentiellen Papierfaltens und dem Erscheinen des neuen *iPhone Fold*.

---

## 🌐 Live URL
👉 **[https://faltality.gimmebytes.com](https://faltality.gimmebytes.com)**

---

## 🎯 Das 2-Phasen-Spielprinzip

> *"Ein normales Blatt Papier kann man nur 7 Mal falten – aber was passiert, wenn du es weiter faltest?"*

In **FALTALITY** startest du mit einem frischen Blatt Papier auf einem gemütlichen Gartentisch. 

1. **Phase 1: Faltmodus (Tischperspektive)**
   - Du sitzt am Tisch und faltest dein Blatt (`Taste F`).
   - Jede Faltung verdoppelt die Schichten und Dicke exponentiell ($d = 0.1\,\text{mm} \cdot 2^n$).
   - Die Live-Eskalationskarte verrät dir genau, welches Feature bei wie vielen Faltungen aktiv wird.
   - Nach ausreichend Faltungen drückst du die **Leertaste** (oder Klick auf **ZIELEN**), um in den Zielmodus zu wechseln.

2. **Phase 2: Zielmodus (Himmelsperspektive)**
   - Die Kamera schwenkt majestätisch hoch in den Himmel über den Garten.
   - Am Himmel ziehen gefaltete japanische Origami-Kraniche, Origami-Tauben, Möwen, die *iFold Origami Stealth Dart*, in den Wolken **Faltality Airlines Flug FL-404** und im Erdorbit **Tim Cooks Apple Keynote-Satellit** ihre Bahnen.
   - Steuere deinen Schuss flüssig mit den **Pfeiltasten [↑ ↓ ← →]** oder der Maus.
   - Drücke die **Leertaste** zum blitzschnellen Moorhuhn-Abschuss!

3. **Phase 3: Flug & Faltality**
   - Das Papier pfeift zischend durch den Himmel!
   - Bei Vogel-Treffern: Slow-Motion, Konfetti, Papierschnipsel und Fallschirme.
   - Bei Airliner-Treffern: Cartoon-Crash & bunter Reisekoffer-Regen!
   - Bei Fehlwürfen mit $\ge 5$ Faltungen: Kinetischer Meteoriten-Krater, Erdbeben-Shake und Nachbars Autoalarmanlage!

---

## ⌨️ Tastenbelegung (Key Map)

| Taste | Aktion |
| --- | --- |
| <kbd>F</kbd> | Papier falten / Zurück zum Tisch wechseln |
| <kbd>Leertaste</kbd> | Zielmodus aktivieren / Papiergeschoss abfeuern |
| <kbd>T</kbd> | Nächstes Ziel erfassen (Lock-On Zyklen) |
| <kbd>U</kbd> | Material wechseln (Papier / Alufolie ab 500 Pkt.) |
| <kbd>C</kbd> | Kamera-Fokus auf Papier auf dem Tisch zentrieren |
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
- **Web Audio API Synth**: Knusprige Papier-Faltgeräusche, dynamische Flug-Whooshes, Gans-Honks, generative Debussy-Klaviertöne, quietschende Autoalarmanlagen und Sub-Bass-Kraterwumms ohne externe Asset-Downloads
- **Canvas-Confetti & Origami-Partikel / Koffer** für den Triumph-Moment bei einem Treffer

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

```bash
# Docker Image bauen
docker build -t faltality:latest .

# Container starten
docker run -d -p 8080:8080 --name faltality faltality:latest
```
