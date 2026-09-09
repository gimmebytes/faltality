// Internationalization (i18n) for FALTALITY (DE) & FOLDTALITY (EN)

export type SupportedLang = 'de' | 'en';

export interface FaltPediaTier {
  id: string;
  icon: string;
  folds: string;
  name: string;
  range: string;
  thickness: string;
  effect: string;
  target: string;
}

export interface Translations {
  gameTitle: string;
  gameSubtitle: string;
  metaTitle: string;
  skyActive: string;
  skyBirdsDefault: string;
  skyLocked: (targetName: string) => string;
  score: string;
  birdsHit: string;
  combo: string;
  iAimOn: string;
  iAimOff: string;
  cycleTarget: string;
  cycleTargetShort: (name: string) => string;
  keymapTitle: string;
  soundToggle: string;
  
  // Fold tower (Left HUD)
  foldTowerTag: string;
  foldsUnit: string;
  layerPill: (layers: number) => string;
  openFaltpediaPill: string;
  tierSingularity: { name: string; desc: string };
  tierAirliner: { name: string; desc: string };
  tierLimit: { name: string; desc: string };
  tierCrater: { name: string; desc: string };
  tierCrane: { name: string; desc: string };
  tierPigeon: { name: string; desc: string };
  tierSheet: { name: string; desc: string };

  // Buttons
  btnFoldMain: string;
  btnFoldSub: (thicknessStr: string) => string;
  btnFoldAimingSub: string;
  btnFoldFlyingSub: string;
  btnAimMain: string;
  btnAimSub: string;
  btnLaunchMain: string;
  btnLaunchSub: string;
  btnFlyingMain: string;
  btnFlyingSub: string;
  btnReset: string;
  btnTable: string;

  // Sliders
  pitchLabel: string;
  powerLabel: string;

  // Retro 80s/90s Intro Screen
  introSubtitle: string;
  introPressEnter: string;
  introStartBtn: string;
  introHintF: string;
  introHintSpace: string;
  introHintT: string;
  introHintArrows: string;

  // Hamburger Menu
  menuTitle: string;
  menuClose: string;
  menuLangLabel: string;
  menuFaltpediaBtn: string;
  menuAimLabel: string;
  menuCycleTargetBtn: string;
  menuSoundLabel: string;
  menuSoundOn: string;
  menuSoundOff: string;
  menuKeymapBtn: string;
  menuReplayIntroBtn: string;
  menuSkyStatusLabel: string;

  // Keymap Modal
  keymapModalHeader: string;
  keymapF: string;
  keymapSpace: string;
  keymapT: string;
  keymapArrowsPitch: string;
  keymapArrowsYaw: string;
  keymapA: string;
  keymapK: string;
  keymapR: string;
  keymapEsc: string;
  keymapOk: string;

  // Falt-Pedia Modal
  pediaTitle: string;
  pediaSubtitle: string;
  pediaCloseBtn: string;
  pediaTiers: FaltPediaTier[];

  // Game over / Faltality banners
  bannerFaltality: string;
  bannerOneMoreThing: string;
  bannerOverkill: string;
  subSatellite: string;
  subPlane: string;
  subNormal: (birdTitle: string, folds: number) => string;
  subCrater: string;
  pointsSatellite: (pts: number) => string;
  pointsPlane: (pts: number) => string;
  pointsNormal: (pts: number) => string;
  pointsCrater: (folds: number) => string;
}

export const translations: Record<SupportedLang, Translations> = {
  de: {
    gameTitle: 'FALTALITY',
    gameSubtitle: 'PRODUKTIVES PAPIERFALTEN',
    metaTitle: 'FALTALITY – Das exponentielle Papierfalt-Spektakel',
    skyActive: 'AKTIV:',
    skyBirdsDefault: '🕊️ Tauben, 🦢 Kraniche, 🦆 Enten',
    skyLocked: (targetName: string) => `🎯 Ziel erfasst: ${targetName}`,
    score: 'PUNKTE',
    birdsHit: 'GETROFFEN',
    combo: 'COMBO',
    iAimOn: '🎯 iAim: AN',
    iAimOff: '🎯 iAim: AUS',
    cycleTarget: '🎯 Ziel wechseln [T]',
    cycleTargetShort: (name: string) => `🎯 ${name}`,
    keymapTitle: '⌨️ Tastenbelegung',
    soundToggle: 'Sound',

    foldTowerTag: 'FALT-O-METER',
    foldsUnit: 'FALTUNGEN',
    layerPill: (layers: number) => `${layers.toLocaleString()} Lagen`,
    openFaltpediaPill: '📖 FALT-PEDIA',
    tierSingularity: { name: '11+ Tim Cook Satellit', desc: 'Keynote Orbit & iSat' },
    tierAirliner: { name: '9–10 Airliner', desc: 'Koffer-Explosion' },
    tierLimit: { name: '7–8 Limit', desc: 'Tisch vibriert' },
    tierCrater: { name: '5–6 Krater', desc: 'Meteor & Autoalarm' },
    tierCrane: { name: '3–4 Kranich', desc: 'Hoher Weitflug' },
    tierPigeon: { name: '1–2 Taube', desc: 'Flachgleiter' },
    tierSheet: { name: '0 Ungefaltet', desc: 'Flatterblatt (~3m)' },

    btnFoldMain: 'Falten',
    btnFoldSub: (thicknessStr) => `[Taste F] Verdoppeln auf ${thicknessStr}`,
    btnFoldAimingSub: '[Taste F] Weitersitzen & falten',
    btnFoldFlyingSub: 'Im Flug...',
    btnAimMain: 'Zielen',
    btnAimSub: '[Leertaste] Kamera hoch',
    btnLaunchMain: 'Werfen',
    btnLaunchSub: '[Leertaste] Feuer frei!',
    btnFlyingMain: 'Im Flug...',
    btnFlyingSub: 'Tracking',
    btnReset: 'Reset',
    btnTable: 'Tisch',

    pitchLabel: 'Steigung [↑/↓]:',
    powerLabel: 'Wurfkraft:',

    introSubtitle: '★ DAS EXPONENTIELLE PAPIERFALT-SPEKTAKEL ★',
    introPressEnter: '▶ DRÜCKE [ENTER] ODER [LEERTASTE] ZUM STARTEN ◀',
    introStartBtn: 'SPIEL STARTEN',
    introHintF: '<kbd>F</kbd> Papier falten (Verdoppeln)',
    introHintSpace: '<kbd>Leertaste</kbd> Zielen & Werfen',
    introHintT: '<kbd>T</kbd> Ziel wechseln (Lock-On)',
    introHintArrows: '<kbd>Pfeiltasten</kbd> Kamera & Winkel',

    menuTitle: 'MENÜ',
    menuClose: '✕',
    menuLangLabel: '🌐 Sprache wechseln / Language:',
    menuFaltpediaBtn: '📖 FALT-PEDIA Enzyklopädie öffnen',
    menuAimLabel: '🎯 Apple iAim Auto-Targeting:',
    menuCycleTargetBtn: '🎯 Nächstes Ziel anvisieren [Taste T]',
    menuSoundLabel: '🔊 Sound & Musik:',
    menuSoundOn: '🔊 Ton: AN',
    menuSoundOff: '🔇 Ton: AUS',
    menuKeymapBtn: '⌨️ Tastenbelegung (Key Map) [K]',
    menuReplayIntroBtn: '🎬 Intro-Animation erneut abspielen',
    menuSkyStatusLabel: '🪶 Aktuell über dem Garten aktiv:',

    keymapModalHeader: '⌨️ Tastenbelegung (Key Map)',
    keymapF: '<strong>Papier falten</strong> (Dicke & Reichweite verdoppeln) / Zurück zum Tisch',
    keymapSpace: '<strong>Zielmodus aktivieren</strong> bzw. <strong>Papier abschiessen</strong>',
    keymapT: '<strong>Ziel wechseln</strong> (Schaltet durch Tauben, Flugzeuge & Tim Cook Satellit)',
    keymapArrowsPitch: '<strong>Steigung (Pitch)</strong> erhöhen / senken',
    keymapArrowsYaw: '<strong>Richtung (Yaw)</strong> nach links / rechts steuern',
    keymapA: '<strong>Apple iAim</strong> Auto-Lock an-/ausschalten',
    keymapK: 'Dieses <strong>Tastenbelegungs-Fenster</strong> öffnen / schließen',
    keymapR: '<strong>Frisches Blatt Papier</strong> auf den Tisch legen (Reset)',
    keymapEsc: 'Fenster & Overlays schließen',
    keymapOk: 'Verstanden, weiterspielen!',

    pediaTitle: '📖 FALT-PEDIA',
    pediaSubtitle: 'Das Handbuch der kinetischen Papier-Physik & Zerstörungskraft',
    pediaCloseBtn: 'Schließen',
    pediaTiers: [
      {
        id: 'tier-0',
        icon: '📄',
        folds: '0 Faltungen (1 Lage)',
        name: 'Ungefaltetes Notizblatt',
        range: '~3 Meter Reichweite',
        thickness: '0.1 mm Dicke',
        effect: 'Trudelt kraftlos und federleicht ins Gras. Keine kinetische Wucht.',
        target: 'Keine Vögel erreichbar – bitte zuerst falten!'
      },
      {
        id: 'tier-1',
        icon: '🕊️',
        folds: '1–2 Faltungen (2–4 Lagen)',
        name: 'Aerodynamischer Flachgleiter',
        range: '16–32 Meter Reichweite',
        thickness: '0.2–0.4 mm (Schulheft-Dicke)',
        effect: 'Flacher Gleitflug über den Zaun.',
        target: 'Erreicht tieffliegende Origami-Tauben im Garten.'
      },
      {
        id: 'tier-2',
        icon: '🦢',
        folds: '3–4 Faltungen (8–16 Lagen)',
        name: 'Pocket Dart & Aerodynamischer Keil',
        range: '65–120 Meter Reichweite',
        thickness: '0.8–1.6 mm (Kreditkartenstapel)',
        effect: 'Stabiler ballistischer Bogenflug hoch in die Baumkronen.',
        target: 'Perfekt für majestätische japanische Origami-Kraniche & Möwen.'
      },
      {
        id: 'tier-3',
        icon: '💥',
        folds: '5–6 Faltungen (32–64 Lagen)',
        name: 'iFold Mini & Origami Bullet',
        range: '220–380 Meter Reichweite',
        thickness: '3.2–6.4 mm (Neues iPhone Fold)',
        effect: '💥 CHAOS-ZONE: Fehlwürfe erzeugen Meteoriten-Krater! Nachbars Autoalarm heult auf, Warnblinker blinken und die Ohnmachts-Schafe fallen steif um!',
        target: 'Zerschmettert Vögel & schlägt Krater in den Vorgarten.'
      },
      {
        id: 'tier-4',
        icon: '⚡',
        folds: '7–8 Faltungen (128–256 Lagen)',
        name: 'Human Peak Fold & Hydraulic Crusher',
        range: '650–1.100 Meter Reichweite',
        thickness: '1.3–2.6 cm (Dicke eines Buchs)',
        effect: '⚡ DAS LIMIT: Das physikalische Limit menschlicher Hände ist überschritten! Der Holztisch bebt durch die kinetische Verdichtung.',
        target: 'Durchschlägt selbst die extrem flinke iFold Stealth Dart Drohne!'
      },
      {
        id: 'tier-5',
        icon: '✈️',
        folds: '9–10 Faltungen (512–1.024 Lagen)',
        name: 'iFold Pro Max & Stratosphere Piercer',
        range: '1.800–2.800 Meter Reichweite',
        thickness: '5.1–10.2 cm (Dicht wie Granit)',
        effect: '✈️ STRATOSPHÄREN-DURCHBRUCH: Durchstößt die Wolkendecke! Trifft Passagierflug FL-404. Koffer regnen herab & Nachbars Schafe fallen in Ohnmacht!',
        target: 'Passagier-Linienflug „Faltality Airlines FL-404“'
      },
      {
        id: 'tier-6',
        icon: '🛰️',
        folds: '11+ Faltungen (2.048+ Lagen)',
        name: 'Schwarzes Loch aus Papier (Singularität)',
        range: '4.500+ Meter Reichweite',
        thickness: '20+ cm massiver Titan-Zelluloseblock',
        effect: '🍎 ONE MORE THING: Verlässt die Erdanziehung und zerschmettert Tim Cooks geheimen Keynote-Satelliten! Raining AirPods Pro Cases, goldene iPhones & 19$-Poliertücher!',
        target: 'Tim Cooks orbitaler Apple Keynote Satellit!'
      }
    ],

    bannerFaltality: 'F A L T A L I T Y !',
    bannerOneMoreThing: '🍎 ONE MORE THING !',
    bannerOverkill: 'O V E R K I L L !',
    subSatellite: '<strong>Tim Cooks Keynote-Satellit pulverisiert!</strong><br><span class="loot-subtext">✨ LOOT: AirPods Pro Cases • Goldene iPhones • 19$-Poliertücher</span>',
    subPlane: '🚨 ULTIMATIVE FLUGVERSPÄTUNG! Koffer regnen herab & Nachbars Schafe fallen um!',
    subNormal: (birdTitle, folds) => `${birdTitle} mit ${folds} Faltungen erwischt!`,
    subCrater: '💥 RUMMS! Nachbars Autoalarm heult auf, Warnblinker blinken & Schafe fallen um!',
    pointsSatellite: (pts) => `🛰️ +${pts.toLocaleString()} PUNKTE!`,
    pointsPlane: (pts) => `✈️ +${pts.toLocaleString()} PUNKTE!`,
    pointsNormal: (pts) => `+${pts.toLocaleString()} PUNKTE!`,
    pointsCrater: (folds) => `MIT ${folds} FALTUNGEN!`
  },
  en: {
    gameTitle: 'FOLDTALITY',
    gameSubtitle: 'PRODUCTIVE PAPER FOLDING',
    metaTitle: 'FOLDTALITY – The Exponential Paper Folding Experience',
    skyActive: 'ACTIVE:',
    skyBirdsDefault: '🕊️ Pigeons, 🦢 Cranes, 🦆 Ducks',
    skyLocked: (targetName: string) => `🎯 Target Locked: ${targetName}`,
    score: 'SCORE',
    birdsHit: 'HITS',
    combo: 'COMBO',
    iAimOn: '🎯 iAim: ON',
    iAimOff: '🎯 iAim: OFF',
    cycleTarget: '🎯 Next Target [T]',
    cycleTargetShort: (name: string) => `🎯 ${name}`,
    keymapTitle: '⌨️ Controls',
    soundToggle: 'Sound',

    foldTowerTag: 'FOLD-O-METER',
    foldsUnit: 'FOLDS',
    layerPill: (layers: number) => `${layers.toLocaleString()} Layers`,
    openFaltpediaPill: '📖 FALT-PEDIA',
    tierSingularity: { name: '11+ Tim Cook Sat', desc: 'Keynote Orbit & iSat' },
    tierAirliner: { name: '9–10 Airliner', desc: 'Luggage Explosion' },
    tierLimit: { name: '7–8 Limit', desc: 'Table Vibrates' },
    tierCrater: { name: '5–6 Crater', desc: 'Meteor & Car Alarm' },
    tierCrane: { name: '3–4 Origami Crane', desc: 'High Flight' },
    tierPigeon: { name: '1–2 City Pigeon', desc: 'Low Glider' },
    tierSheet: { name: '0 Fresh Sheet', desc: 'Fluttering (~3m)' },

    btnFoldMain: 'Fold',
    btnFoldSub: (thicknessStr) => `[Key F] Double to ${thicknessStr}`,
    btnFoldAimingSub: '[Key F] Return to table & fold',
    btnFoldFlyingSub: 'In flight...',
    btnAimMain: 'Aim',
    btnAimSub: '[Space] Look up',
    btnLaunchMain: 'Launch',
    btnLaunchSub: '[Space] Fire away!',
    btnFlyingMain: 'Flying...',
    btnFlyingSub: 'Tracking',
    btnReset: 'Reset',
    btnTable: 'Table',

    pitchLabel: 'Pitch [↑/↓]:',
    powerLabel: 'Power:',

    introSubtitle: '★ THE EXPONENTIAL PAPER FOLDING EXPERIENCE ★',
    introPressEnter: '▶ PRESS [ENTER] OR [SPACE] TO START ◀',
    introStartBtn: 'START GAME',
    introHintF: '<kbd>F</kbd> Fold Paper (Double)',
    introHintSpace: '<kbd>Space</kbd> Aim & Launch',
    introHintT: '<kbd>T</kbd> Cycle Target (Lock-On)',
    introHintArrows: '<kbd>Arrow Keys</kbd> Steer & Pitch',

    menuTitle: 'MENU',
    menuClose: '✕',
    menuLangLabel: '🌐 Switch Language / Sprache:',
    menuFaltpediaBtn: '📖 Open FALT-PEDIA Encyclopedia',
    menuAimLabel: '🎯 Apple iAim Auto-Targeting:',
    menuCycleTargetBtn: '🎯 Lock Next Target [Key T]',
    menuSoundLabel: '🔊 Sound & Music:',
    menuSoundOn: '🔊 Sound: ON',
    menuSoundOff: '🔇 Sound: OFF',
    menuKeymapBtn: '⌨️ Controls & Key Map [K]',
    menuReplayIntroBtn: '🎬 Replay Retro Intro Animation',
    menuSkyStatusLabel: '🪶 Active in the Garden Sky:',

    keymapModalHeader: '⌨️ Controls & Key Map',
    keymapF: '<strong>Fold Paper</strong> (Double thickness & range) / Return to table',
    keymapSpace: '<strong>Toggle Aim Mode</strong> or <strong>Launch Paper</strong>',
    keymapT: '<strong>Cycle Target</strong> (Cycles through Pigeons, Cranes, Airliner & Keynote Satellite)',
    keymapArrowsPitch: '<strong>Adjust Pitch</strong> up / down',
    keymapArrowsYaw: '<strong>Adjust Yaw</strong> left / right',
    keymapA: 'Toggle <strong>Apple iAim</strong> Auto-Lock',
    keymapK: 'Open / close this <strong>Controls Modal</strong>',
    keymapR: 'Place a <strong>Fresh Sheet of Paper</strong> on table (Reset)',
    keymapEsc: 'Close dialogs & overlays',
    keymapOk: 'Got it, let’s fold!',

    pediaTitle: '📖 FALT-PEDIA',
    pediaSubtitle: 'The Definitive Guide to Kinetic Origami Destruction',
    pediaCloseBtn: 'Close',
    pediaTiers: [
      {
        id: 'tier-0',
        icon: '📄',
        folds: '0 Folds (1 Layer)',
        name: 'Fresh Flat Sheet',
        range: '~3 meters range',
        thickness: '0.1 mm thickness',
        effect: 'Flutters helplessly down into the grass. Zero kinetic punch.',
        target: 'Cannot reach any targets – fold it first!'
      },
      {
        id: 'tier-1',
        icon: '🕊️',
        folds: '1–2 Folds (2–4 Layers)',
        name: 'Aerodynamic Glider',
        range: '16–32 meters range',
        thickness: '0.2–0.4 mm (Notebook thickness)',
        effect: 'Flat gliding flight across the garden fence.',
        target: 'Hits low-altitude origami pigeons.'
      },
      {
        id: 'tier-2',
        icon: '🦢',
        folds: '3–4 Folds (8–16 Layers)',
        name: 'Pocket Dart & Aerodynamic Wedge',
        range: '65–120 meters range',
        thickness: '0.8–1.6 mm (Credit card stack)',
        effect: 'High ballistic arch soaring above the treetops.',
        target: 'Perfect for Japanese origami cranes & seagulls.'
      },
      {
        id: 'tier-3',
        icon: '💥',
        folds: '5–6 Folds (32–64 Layers)',
        name: 'iFold Mini & Origami Bullet',
        range: '220–380 meters range',
        thickness: '3.2–6.4 mm (New iPhone Fold)',
        effect: '💥 CHAOS ZONE: Missed shots blast meteor craters! Neighbor’s car alarm wails, hazards flash, and fainting sheep keel over!',
        target: 'Obliterates birds & craters the front lawn.'
      },
      {
        id: 'tier-4',
        icon: '⚡',
        folds: '7–8 Folds (128–256 Layers)',
        name: 'Human Peak Fold & Hydraulic Crusher',
        range: '650–1,100 meters range',
        thickness: '1.3–2.6 cm (Novel thickness)',
        effect: '⚡ THE LIMIT: Human hands cannot fold paper past 7 times. The wooden table shakes under kinetic compression!',
        target: 'Penetrates even the nimble iFold Stealth Dart drone!'
      },
      {
        id: 'tier-5',
        icon: '✈️',
        folds: '9–10 Folds (512–1,024 Layers)',
        name: 'iFold Pro Max & Stratosphere Piercer',
        range: '1,800–2,800 meters range',
        thickness: '5.1–10.2 cm (Dense as granite)',
        effect: '✈️ STRATOSPHERIC BREACH: Pierces cloud layer! Strikes passenger flight FL-404. Luggage rains down & neighbor’s sheep faint!',
        target: 'Passenger Jet “Foldtality Airlines FL-404”'
      },
      {
        id: 'tier-6',
        icon: '🛰️',
        folds: '11+ Folds (2,048+ Layers)',
        name: 'Black Hole of Paper (Singularity)',
        range: '4,500+ meters range',
        thickness: '20+ cm pure titanium-cellulose block',
        effect: '🍎 ONE MORE THING: Escapes Earth gravity and vaporizes Tim Cook’s secret Keynote satellite! Rains AirPods Pro, gold iPhones & $19 Polishing Cloths!',
        target: 'Tim Cook’s orbital Apple Keynote Satellite!'
      }
    ],

    bannerFaltality: 'F O L D T A L I T Y !',
    bannerOneMoreThing: '🍎 ONE MORE THING !',
    bannerOverkill: 'O V E R K I L L !',
    subSatellite: '<strong>Tim Cook’s Keynote Satellite pulverized!</strong><br><span class="loot-subtext">✨ LOOT: AirPods Pro Cases • Gold iPhones • $19 Polishing Cloths</span>',
    subPlane: '🚨 ULTIMATE FLIGHT DELAY! Luggage rains down & neighbor’s sheep faint!',
    subNormal: (birdTitle, folds) => `Nailed ${birdTitle} with ${folds} folds!`,
    subCrater: '💥 BOOM! Neighbor’s car alarm blares, hazards flash & sheep keel over!',
    pointsSatellite: (pts) => `🛰️ +${pts.toLocaleString()} POINTS!`,
    pointsPlane: (pts) => `✈️ +${pts.toLocaleString()} POINTS!`,
    pointsNormal: (pts) => `+${pts.toLocaleString()} POINTS!`,
    pointsCrater: (folds) => `WITH ${folds} FOLDS!`
  }
};

export function detectLanguage(): SupportedLang {
  if (typeof window === 'undefined') return 'de';

  // 1. Explicit query parameter ?lang=en or ?lang=de
  const urlParams = new URLSearchParams(window.location.search);
  const paramLang = urlParams.get('lang')?.toLowerCase();
  if (paramLang === 'en' || paramLang === 'de') {
    localStorage.setItem('faltality_lang', paramLang);
    return paramLang;
  }

  // 2. Saved user preference in localStorage
  const saved = localStorage.getItem('faltality_lang') as SupportedLang;
  if (saved === 'en' || saved === 'de') {
    return saved;
  }

  // 3. Domain-based detection: 'foldtality' -> 'en', 'faltality' -> 'de'
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('foldtality')) {
    return 'en';
  }
  if (hostname.includes('faltality')) {
    return 'de';
  }

  // 4. Browser language fallback
  if (navigator.language && navigator.language.toLowerCase().startsWith('de')) {
    return 'de';
  }

  return 'en';
}
