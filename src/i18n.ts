// Internationalization (i18n) for FALTALITY (DE) & FOLDTALITY (EN)

export type SupportedLang = 'de' | 'en';

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
  helpTitle: string;
  keymapTitle: string;
  soundToggle: string;
  
  // Fold tower (Left HUD)
  foldTowerTag: string;
  foldsUnit: string;
  layerPill: (layers: number) => string;
  tierSingularity: { name: string; desc: string };
  tierAirliner: { name: string; desc: string };
  tierLimit: { name: string; desc: string };
  tierCrater: { name: string; desc: string };
  tierCrane: { name: string; desc: string };
  tierPigeon: { name: string; desc: string };
  tierSheet: { name: string; desc: string };

  // Bottom Dashboard
  sheetTag: (num: number) => string;
  modeFolding: string;
  modeAiming: string;
  modeFlying: string;
  thicknessUnit: string;
  limitMarker: string;
  layersLabel: string;
  rangeLabel: string;
  comparisonLabel: string;

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

  // Sliders
  pitchLabel: string;
  powerLabel: string;

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

  // Escalation Card
  escalationReady: string;
  escalationActiveLow: string;
  escalationActiveMid: string;
  escalationCraterTitle: string;
  escalationLimitTitle: string;
  escalationPlaneTitle: string;
  escalationOrbitTitle: string;

  esc0Now: string;
  esc0Next: string;
  esc1Now: string;
  esc1Next: string;
  esc3Now: string;
  esc3Next: string;
  esc5Now: string;
  esc5Next: string;
  esc7Now: string;
  esc7Next: string;
  esc9Now: string;
  esc9Next: string;
  esc11Now: string;
  esc11Next: string;

  // Banners & Faltality / Foldtality
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
    gameSubtitle: 'iFold Edition',
    metaTitle: 'FALTALITY – Das exponentielle Papierfalt-Spiel',
    skyActive: 'AM HIMMEL AKTIV',
    skyBirdsDefault: 'Kraniche, Tauben & Möwen',
    skyLocked: (name) => `Lock: ${name} [Taste T für Wechsel]`,
    score: 'PUNKTE',
    birdsHit: 'VÖGEL ERWISCHT',
    combo: 'COMBO',
    iAimOn: '🎯 iAim: AN',
    iAimOff: '🎯 iAim: AUS',
    cycleTarget: '🎯 Ziel [T]',
    cycleTargetShort: (name) => `🎯 ${name} [T]`,
    helpTitle: "Wie funktioniert's?",
    keymapTitle: 'Tastenbelegung anzeigen [Taste K]',
    soundToggle: 'Ton umschalten',

    foldTowerTag: 'EXPONENTIAL-FALTMETER',
    foldsUnit: 'Faltungen',
    layerPill: (layers) => `${layers.toLocaleString()} ${layers === 1 ? 'Lage' : 'Lagen'}`,
    tierSingularity: { name: '11+ Tim Cook Satellit', desc: 'Keynote Orbit & iSat' },
    tierAirliner: { name: '9–10 Airliner', desc: 'Koffer-Explosion' },
    tierLimit: { name: '7–8 Limit', desc: 'Tisch vibriert' },
    tierCrater: { name: '5–6 Krater', desc: 'Meteor & Autoalarm' },
    tierCrane: { name: '3–4 Kranich', desc: 'Hoher Weitflug' },
    tierPigeon: { name: '1–2 Taube', desc: 'Flachgleiter' },
    tierSheet: { name: '0 Ungefaltet', desc: 'Flatterblatt (~3m)' },

    sheetTag: (num) => `BLATT #${num}`,
    modeFolding: 'Faltmodus',
    modeAiming: 'Zielmodus',
    modeFlying: 'Im Flug',
    thicknessUnit: 'Dicke',
    limitMarker: '7: Menschl. Limit',
    layersLabel: 'Lagen (2^N):',
    rangeLabel: 'Reichweite:',
    comparisonLabel: 'Vergleich:',

    btnFoldMain: 'FALTEN',
    btnFoldSub: (thicknessStr) => `[Taste F] Verdoppeln auf ${thicknessStr}`,
    btnFoldAimingSub: '[Taste F] Weitersitzen & falten',
    btnFoldFlyingSub: 'Im Flug...',
    btnAimMain: 'ZIELEN',
    btnAimSub: '[Leertaste] Kamera hoch',
    btnLaunchMain: 'ABSCHIESSEN',
    btnLaunchSub: '[Leertaste] Feuer frei!',
    btnFlyingMain: 'FLUG...',
    btnFlyingSub: 'Tracking',
    btnReset: '🔄 Reset [R]',

    pitchLabel: 'Steigung [↑/↓]:',
    powerLabel: 'Wurfkraft:',

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

    escalationReady: 'BEREIT ZUM START:',
    escalationActiveLow: 'AKTIV: TIEFFLIEGER-JAGD',
    escalationActiveMid: 'AKTIV: KRANICH- & MÖWEN-REICHWEITE',
    escalationCraterTitle: 'NEU: METEORITEN-KRATER AKTIV!',
    escalationLimitTitle: 'NEU: TISCH-VIBRATION AKTIV!',
    escalationPlaneTitle: 'NEU: AIRLINER-JAGD BEREIT!',
    escalationOrbitTitle: 'ORBIT ERREICHT: TIM COOK SATELLIT AKTIV!',

    esc0Now: '<strong>Flatterndes Blatt</strong>: Fliegt nur ~3 m und trudelt harmlos ins Gras.',
    esc0Next: '⏩ <em>Falte auf 1:</em> Verdoppelt Reichweite auf ~16 m für tiefe Origami-Tauben!',
    esc1Now: '<strong>Aerodynamischer Flachgleiter</strong>: Perfekte Höhe für tiefe Origami-Tauben.',
    esc1Next: '⏩ <em>Falte auf 3:</em> Ausreichend Steigflug für japanische Origami-Kraniche!',
    esc3Now: '<strong>Stabiler Weitstreckengleiter</strong>: Zieht hoch über den Garten zu Kranichen & Möwen.',
    esc3Next: '⏩ <em>Ab Faltung 5:</em> 💥 <strong>Nachbars Autoalarm & Ohnmachts-Schafe!</strong>',
    esc5Now: '<strong>Kinetische Masse</strong>: Fehlwürfe erzeugen Krater, Nachbars Auto heult auf & die Schafe fallen um!',
    esc5Next: '⏩ <em>Ab Faltung 7:</em> Menschl. Limit überschritten & Tisch beginnt zu zittern!',
    esc7Now: '<strong>Hyperschall-Geschoss</strong>: Tisch bebt. Reichweite reicht für die iFold Stealth Dart!',
    esc7Next: '⏩ <em>Ab Faltung 9:</em> ✈️ <strong>Faltality Airlines FL-404</strong> in den Wolken abschießen!',
    esc9Now: '<strong>Stratosphären-Punch</strong>: Kann Passagierflugzeug FL-404 treffen (Koffer-Regen & Schafe fallen um)!',
    esc9Next: '⏩ <em>Ab Faltung 11+:</em> 🛰️ <strong>Tim Cook Keynote-Satellit erscheint im Orbit!</strong>',
    esc11Now: '<strong>Exosphäre erreicht</strong>: Tim Cooks geheimer Keynote-Satellit kreist im Orbit!',
    esc11Next: '🎯 <em>Abschuss:</em> Drücke [T] zum Anvisieren & ernte fliegende AirPods, iPhones & Poliertücher!',

    bannerFaltality: 'F A L T A L I T Y !',
    bannerOneMoreThing: '🍏 ONE MORE THING !',
    bannerOverkill: 'O V E R K I L L !',
    subSatellite: '<strong>Tim Cooks Keynote-Satellit pulverisiert!</strong><br><span class="loot-subtext">✨ LOOT: AirPods Pro Cases • Gold iPhones • $19 Poliertücher</span>',
    subPlane: '🚨 FLUGVERSPÄTUNG DES TODES! Koffer regnen herab & Nachbars Schafe fallen um!',
    subNormal: (birdTitle, folds) => `${birdTitle} mit ${folds} Faltungen erwischt!`,
    subCrater: '💥 BUMM! Nachbars Auto heult auf, Warnblinker an & die Schafe kippen um!',
    pointsSatellite: (pts) => `🛰️ +${pts.toLocaleString()} PUNKTE!`,
    pointsPlane: (pts) => `✈️ +${pts.toLocaleString()} PUNKTE!`,
    pointsNormal: (pts) => `+${pts.toLocaleString()} PUNKTE!`,
    pointsCrater: (folds) => `MIT ${folds} FALTUNGEN!`
  },

  en: {
    gameTitle: 'FOLDTALITY',
    gameSubtitle: 'iFold Edition',
    metaTitle: 'FOLDTALITY – The Exponential Paper Folding Game',
    skyActive: 'ACTIVE IN SKY',
    skyBirdsDefault: 'Cranes, Pigeons & Seagulls',
    skyLocked: (name) => `Locked: ${name} [Press T to Cycle]`,
    score: 'SCORE',
    birdsHit: 'BIRDS HIT',
    combo: 'COMBO',
    iAimOn: '🎯 iAim: ON',
    iAimOff: '🎯 iAim: OFF',
    cycleTarget: '🎯 Target [T]',
    cycleTargetShort: (name) => `🎯 ${name} [T]`,
    helpTitle: 'How to play?',
    keymapTitle: 'Show Controls [Key K]',
    soundToggle: 'Toggle Sound',

    foldTowerTag: 'EXPONENTIAL FOLD-METER',
    foldsUnit: 'Folds',
    layerPill: (layers) => `${layers.toLocaleString()} ${layers === 1 ? 'Layer' : 'Layers'}`,
    tierSingularity: { name: '11+ Tim Cook Satellite', desc: 'Keynote Orbit & iSat' },
    tierAirliner: { name: '9–10 Airliner', desc: 'Luggage Explosion' },
    tierLimit: { name: '7–8 Human Limit', desc: 'Table Shakes' },
    tierCrater: { name: '5–6 Crater', desc: 'Meteor & Car Alarm' },
    tierCrane: { name: '3–4 Origami Crane', desc: 'High Flight' },
    tierPigeon: { name: '1–2 City Pigeon', desc: 'Low Glider' },
    tierSheet: { name: '0 Fresh Sheet', desc: 'Fluttering (~3m)' },

    sheetTag: (num) => `SHEET #${num}`,
    modeFolding: 'Folding Mode',
    modeAiming: 'Aiming Mode',
    modeFlying: 'In Flight',
    thicknessUnit: 'Thickness',
    limitMarker: '7: Human Limit',
    layersLabel: 'Layers (2^N):',
    rangeLabel: 'Range:',
    comparisonLabel: 'Comparison:',

    btnFoldMain: 'FOLD',
    btnFoldSub: (thicknessStr) => `[Key F] Double to ${thicknessStr}`,
    btnFoldAimingSub: '[Key F] Return to table & fold',
    btnFoldFlyingSub: 'In flight...',
    btnAimMain: 'AIM',
    btnAimSub: '[Space] Look up',
    btnLaunchMain: 'LAUNCH',
    btnLaunchSub: '[Space] Fire away!',
    btnFlyingMain: 'FLIGHT...',
    btnFlyingSub: 'Tracking',
    btnReset: '🔄 Reset [R]',

    pitchLabel: 'Pitch [↑/↓]:',
    powerLabel: 'Power:',

    keymapModalHeader: '⌨️ Controls (Key Map)',
    keymapF: '<strong>Fold Paper</strong> (double thickness & range) / Return to table',
    keymapSpace: '<strong>Enter Aim Mode</strong> or <strong>Launch Paper</strong>',
    keymapT: '<strong>Cycle Target</strong> (toggle between pigeons, planes & Tim Cook satellite)',
    keymapArrowsPitch: '<strong>Pitch (Elevation)</strong> tilt up / down',
    keymapArrowsYaw: '<strong>Yaw (Direction)</strong> steer left / right',
    keymapA: 'Toggle <strong>Apple iAim</strong> auto-lock on/off',
    keymapK: 'Open / close this <strong>Controls Modal</strong>',
    keymapR: 'Place a <strong>Fresh Sheet of Paper</strong> on the table (Reset)',
    keymapEsc: 'Close popups & dialogs',
    keymapOk: 'Got it, let me play!',

    escalationReady: 'READY TO LAUNCH:',
    escalationActiveLow: 'ACTIVE: LOW-ALTITUDE HUNT',
    escalationActiveMid: 'ACTIVE: CRANE & SEAGULL RANGE',
    escalationCraterTitle: 'NEW: METEOR CRATER ACTIVE!',
    escalationLimitTitle: 'NEW: TABLE VIBRATION ACTIVE!',
    escalationPlaneTitle: 'NEW: PASSENGER JET READY!',
    escalationOrbitTitle: 'ORBIT REACHED: TIM COOK SATELLITE ACTIVE!',

    esc0Now: '<strong>Fluttering Paper</strong>: Flies only ~3 m and flutters harmlessly into the lawn.',
    esc0Next: '⏩ <em>Fold to 1:</em> Doubles range to ~16 m for low-altitude origami pigeons!',
    esc1Now: '<strong>Aerodynamic Glider</strong>: Ideal altitude for low origami pigeons.',
    esc1Next: '⏩ <em>Fold to 3:</em> Enough lift to reach majestic origami cranes!',
    esc3Now: '<strong>Long-Range Dart</strong>: Soars high across the lawn towards cranes & seagulls.',
    esc3Next: '⏩ <em>From Fold 5:</em> 💥 <strong>Neighbor’s Car Alarm & Fainting Sheep!</strong>',
    esc5Now: '<strong>Kinetic Mass</strong>: Missed shots blast craters, trip the car alarm & knock out the sheep!',
    esc5Next: '⏩ <em>From Fold 7:</em> Human limit surpassed & table begins to shake!',
    esc7Now: '<strong>Hypersonic Slug</strong>: Table trembles. Range reaches the iFold Stealth Dart!',
    esc7Next: '⏩ <em>From Fold 9:</em> ✈️ Intercept <strong>Foldtality Airlines FL-404</strong> in the clouds!',
    esc9Now: '<strong>Stratospheric Punch</strong>: Strikes passenger jet FL-404 (luggage rain & fainting sheep)!',
    esc9Next: '⏩ <em>From Fold 11+:</em> 🛰️ <strong>Tim Cook Keynote Satellite enters orbit!</strong>',
    esc11Now: '<strong>Exosphere Reached</strong>: Tim Cook’s secret Keynote satellite orbits overhead!',
    esc11Next: '🎯 <em>Take it down:</em> Press [T] to lock on & harvest AirPods, iPhones & Polishing Cloths!',

    bannerFaltality: 'F O L D T A L I T Y !',
    bannerOneMoreThing: '🍏 ONE MORE THING !',
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
