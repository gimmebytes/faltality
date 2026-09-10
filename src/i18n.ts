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
  btnFocusPaper: string;
  btnFocusPaperTitle: string;
  btnMaterialPaper: string;
  btnMaterialFoil: string;
  btnMaterialLocked: string;
  btnMaterialLockedTitle: (ptsRemaining: number) => string;
  btnMaterialTitle: string;
  foilActiveTag: string;
  paperActiveTag: string;
  foilUnlockNotification: string;

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
  keymapC: string;
  keymapU: string;
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

  // Boss: iPhone Duo
  bossName: string;
  bossPhaseClosed: string;
  bossPhaseUnfolding: string;
  bossPhaseOpen: string;
  bossShieldDeflect: string;
  bossSpawnBanner: string;
  bossSpawnSub: string;
  bossDefeatBanner: string;
  bossDefeatSub: string;
  menuSummonBoss: string;

  // Active Crease Timing & Archetypes
  creaseTitle: string;
  creasePerfect: string;
  creaseGood: string;
  creaseImperfect: string;
  creaseHint: string;
  archetypeBadgeLabel: string;
  archetypeGlider: string;
  archetypeDart: string;
  archetypeComet: string;
  archetypeSheet: string;
  archetypeGliderDesc: string;
  archetypeDartDesc: string;
  archetypeCometDesc: string;
  archetypeSheetDesc: string;
  statGlide: string;
  statSpeed: string;
  statImpact: string;

  // Slingshot Drag-to-Throw
  slingDragTip: string;
  slingDragRelease: string;
  slingDragCancel: string;

  // Campaign Mode & Levels
  modeSandbox: string;
  modeCampaign: string;
  btnLevelSelect: string;
  btnSandbox: string;
  levelSelectTitle: string;
  levelSelectSubtitle: string;
  levelSelectClose: string;
  levelUnlockAllBtn: string;
  levelResetProgressBtn: string;
  levelSheetsAmmoLabel: (remaining: number, max: number) => string;
  levelObjectivePill: (current: number, required: number) => string;
  levelResultVictory: string;
  levelResultFailed: string;
  levelResultFailedReason: string;
  btnNextLevel: string;
  btnRetryLevel: string;
  btnReturnToSelect: string;
  btnBackToSandbox: string;
  starEarnedTitle: (stars: number) => string;
  highScorePill: (score: number) => string;

  // Level 1: Der Gartenzaun
  lvl1Title: string;
  lvl1Subtitle: string;
  lvl1Desc: string;
  lvl1Objective: string;
  lvl1Star1: string;
  lvl1Star2: string;
  lvl1Star3: string;

  // Level 2: Hohe Weide
  lvl2Title: string;
  lvl2Subtitle: string;
  lvl2Desc: string;
  lvl2Objective: string;
  lvl2Star1: string;
  lvl2Star2: string;
  lvl2Star3: string;

  // Level 3: Auto-Alarm
  lvl3Title: string;
  lvl3Subtitle: string;
  lvl3Desc: string;
  lvl3Objective: string;
  lvl3Star1: string;
  lvl3Star2: string;
  lvl3Star3: string;

  // Level 4: Flug FL-404
  lvl4Title: string;
  lvl4Subtitle: string;
  lvl4Desc: string;
  lvl4Objective: string;
  lvl4Star1: string;
  lvl4Star2: string;
  lvl4Star3: string;

  // Level 5: Apple Keynote Orbit
  lvl5Title: string;
  lvl5Subtitle: string;
  lvl5Desc: string;
  lvl5Objective: string;
  lvl5Star1: string;
  lvl5Star2: string;
  lvl5Star3: string;
}

export const translations: Record<SupportedLang, Translations> = {
  de: {
    gameTitle: 'FALTALITY',
    gameSubtitle: 'PRODUKTIVES PAPIERFALTEN',
    metaTitle: 'FALTALITY – Das exponentielle Papierfalt-Spektakel',
    skyActive: 'AKTIV:',
    skyBirdsDefault: '🕊️ Tauben, 🦤 Kraniche, 🦆 Enten',
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
    btnFoldAimingSub: '[Taste F] Zurück zum Tisch',
    btnFoldFlyingSub: 'Im Flug...',
    btnAimMain: 'Zielen',
    btnAimSub: '[Leertaste] Nach oben schauen',
    btnLaunchMain: 'Werfen',
    btnLaunchSub: '[Leertaste] Feuer frei!',
    btnFlyingMain: 'Im Flug...',
    btnFlyingSub: 'Tracking',
    btnReset: 'Reset',
    btnTable: 'Tisch',
    btnFocusPaper: 'Fokus',
    btnFocusPaperTitle: 'Sicht auf Papier zentrieren [Taste C]',
    btnMaterialPaper: 'Papier',
    btnMaterialFoil: 'Alufolie',
    btnMaterialLocked: 'Alufolie (ab 500)',
    btnMaterialLockedTitle: (ptsRemaining) => `🔒 Alufolie ab 500 Punkten freischaltbar (noch ${ptsRemaining} Pkt. nötig)`,
    btnMaterialTitle: 'Material wechseln: Papier / Alufolie [Taste U]',
    foilActiveTag: '🌯 ALU-FOLIE (2x SCORE)',
    paperActiveTag: '📄 PAPIER',
    foilUnlockNotification: '✨ ALUFOLIE FREIGESCHALTET! Drücke [U] für Alufolie (2x Punkte-Multiplikator!)',

    pitchLabel: 'Steigung [↑/↓]:',
    powerLabel: 'Wurfkraft:',

    introSubtitle: '★ DAS EXPONENTIELLE PAPIERFALT-SPEKTAKEL ★',
    introPressEnter: '▶ DRÜCKE [ENTER] ODER [LEERTASTE] ZUM STARTEN ◀',
    introStartBtn: 'SPIEL STARTEN',
    introHintF: '<kbd>F</kbd> Papier falten (Verdoppeln)',
    introHintSpace: '<kbd>Leertaste</kbd> Zielen & Werfen',
    introHintT: '<kbd>Tab</kbd> / <kbd>T</kbd> 90s Arcade Lock-On',
    introHintArrows: '<kbd>Pfeiltasten</kbd> Kamera & Winkel',

    menuTitle: 'MENÜ',
    menuClose: '✕',
    menuLangLabel: '🌐 Sprache wechseln / Language:',
    menuFaltpediaBtn: '📖 FALT-PEDIA Enzyklopädie öffnen',
    menuAimLabel: '🎯 Apple iAim Auto-Targeting:',
    menuCycleTargetBtn: '🎯 Ziel wechseln [Tab / T]',
    menuSoundLabel: '🔊 Sound & Musik:',
    menuSoundOn: '🔊 Ton: AN',
    menuSoundOff: '🔇 Ton: AUS',
    menuKeymapBtn: '⌨️ Tastenbelegung (Key Map) [K]',
    menuReplayIntroBtn: '🎬 Intro-Animation erneut abspielen',
    menuSkyStatusLabel: '🪶 Aktuell über dem Garten aktiv:',

    keymapModalHeader: '⌨️ Tastenbelegung (Key Map)',
    keymapF: '<strong>Papier falten</strong> (Dicke & Reichweite verdoppeln) / Zurück zum Tisch',
    keymapSpace: '<strong>Zielmodus aktivieren</strong> bzw. <strong>Papier abschiessen</strong>',
    keymapT: '<strong>90s Arcade Lock-On</strong> (Schaltet durch Vögel, Möwen, Jets & Tim Cook Satellit)',
    keymapArrowsPitch: '<strong>Steigung (Pitch)</strong> erhöhen / senken',
    keymapArrowsYaw: '<strong>Richtung (Yaw)</strong> nach links / rechts steuern',
    keymapA: '<strong>Apple iAim</strong> Auto-Lock an-/ausschalten',
    keymapK: 'Dieses <strong>Tastenbelegungs-Fenster</strong> öffnen / schließen',
    keymapC: '<strong>Blick auf Papier zentrieren</strong> (Kamera-Reset zurück zum Tisch)',
    keymapU: '<strong>Material wechseln</strong> (Papier / Alufolie ab 500 Punkten freischaltbar)',
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
        icon: '🦤',
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
        name: 'Hydraulischer Brecher & Limit-Faltung',
        range: '650–1.100 Meter Reichweite',
        thickness: '1.3–2.6 cm (Taschenbuch-Dicke)',
        effect: '⚡ DAS MYTHISCHE LIMIT: Menschliche Hände können Papier nicht öfter falten. Der Holztisch vibriert bedrohlich unter der kinetischen Kompression!',
        target: 'Durchdringt selbst die wendige iFold Stealth Dart Drohne!'
      },
      {
        id: 'tier-5',
        icon: '✈️',
        folds: '9–10 Faltungen (512–1.024 Lagen)',
        name: 'iFold Pro Max & Stratosphären-Geschoss',
        range: '1.800–2.800 Meter Reichweite',
        thickness: '5.1–10.2 cm (Massiv wie Granit)',
        effect: '✈️ STRATOSPHÄRISCHER DURCHBRUCH: Durchstößt die Wolkendecke! Trifft Linienflug FL-404. Gepäckstücke regnen herab & Nachbars Schafe fallen in Schockstarre!',
        target: 'Passagierjet „Foldtality Airlines FL-404“'
      },
      {
        id: 'tier-6',
        icon: '🛰️',
        folds: '11+ Faltungen (2.048+ Lagen)',
        name: 'Schwarzes Loch aus Papier (Singularität)',
        range: '4.500+ Meter Reichweite',
        thickness: '20+ cm reiner Titan-Zellstoff-Block',
        effect: '🍎 ONE MORE THING: Durchbricht das Gravitationsfeld der Erde und vaporisiert Tim Cooks geheimen Keynote-Satelliten! Es regnet AirPods Pro, goldene iPhones & 19$-Poliertücher!',
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
    pointsCrater: (folds) => `MIT ${folds} FALTUNGEN!`,

    bossName: '📱 Apple iPhone Duo (Titanium Hinge)',
    bossPhaseClosed: 'Phase 1: Geschlossen (Pocket Mode)',
    bossPhaseUnfolding: 'Phase 2: Entfaltung...',
    bossPhaseOpen: 'Phase 3: Aufgeklappt (Dual-Screen)',
    bossShieldDeflect: '🛡️ CERAMIC SHIELD ZU STARK! Mindestens 5 Faltungen oder Alufolie nötig!',
    bossSpawnBanner: '★ ONE MORE THING... ★',
    bossSpawnSub: 'Der finale Falt-Boss: iPhone Duo nähert sich aus dem Orbit!',
    bossDefeatBanner: '🏆 F A L T A L I T Y !',
    bossDefeatSub: '📱 iPhone Duo Scharnier geknackt! +25.000 Punkte!',
    menuSummonBoss: '📱 iPhone Duo herausfordern [B]',

    creaseTitle: 'FALT-TIMING',
    creasePerfect: '★ PERFEKTE KANTE! (+25% SPEED) ★',
    creaseGood: 'GUTE KANTE',
    creaseImperfect: 'KNITTER-KANTE (Eiert leicht)',
    creaseHint: '[F] im grünen Bereich drücken!',
    archetypeBadgeLabel: 'FLUG-ARCHETYP',
    archetypeGlider: 'Segler (Glider)',
    archetypeDart: 'Pfeil (Dart)',
    archetypeComet: 'Komet (Comet)',
    archetypeSheet: 'Papierblatt',
    archetypeGliderDesc: 'Sanfter Weitgleiter mit enormer Thermik & Hangtime.',
    archetypeDartDesc: 'Rasanter Präzisionspfeil mit lasergerader Flugbahn.',
    archetypeCometDesc: 'Schweres Ballistik-Geschoss mit massiver kinetischer Wucht.',
    archetypeSheetDesc: 'Ungefaltetes Blatt. Trudelt zu Boden.',
    statGlide: 'Gleitflug',
    statSpeed: 'Tempo',
    statImpact: 'Wucht',

    // Slingshot: Direct Look & Hold-to-Charge
    slingDragTip: '🎯 Zielen mit Trackpad/Maus • Halten zum Laden • Loslassen!',
    slingDragRelease: 'Loslassen zum Werfen!',
    slingDragCancel: '[Esc] Abbruch',

    // Campaign Mode & Levels
    modeSandbox: '🏡 Spielwiese (Endlos)',
    modeCampaign: '🎯 Kampagne',
    btnLevelSelect: '🎯 Level-Auswahl',
    btnSandbox: '🏡 Freie Spielwiese',
    levelSelectTitle: '🎯 KAMPAGNEN-LEVEL',
    levelSelectSubtitle: 'Wähle eine Falt-Mission, erfülle das Ziel und sammle bis zu 3 Sterne!',
    levelSelectClose: 'Schließen',
    levelUnlockAllBtn: '🔓 Alle freischalten (Cheat)',
    levelResetProgressBtn: '🔄 Fortschritt zurücksetzen',
    levelSheetsAmmoLabel: (rem, max) => `📄 Blätter: ${rem}/${max}`,
    levelObjectivePill: (curr, req) => `Ziel: ${curr}/${req}`,
    levelResultVictory: '★ MISSION ERFÜLLT! ★',
    levelResultFailed: 'MISSION GESCHEITERT',
    levelResultFailedReason: 'Keine Papierbögen mehr übrig!',
    btnNextLevel: 'Nächstes Level ▶',
    btnRetryLevel: 'Erneut versuchen 🔄',
    btnReturnToSelect: 'Level-Auswahl 📋',
    btnBackToSandbox: 'Zur Spielwiese 🏡',
    starEarnedTitle: (stars) => `${stars} von 3 Sternen erreicht!`,
    highScorePill: (score) => `Bestwert: ${score.toLocaleString()} Pkt.`,

    lvl1Title: 'Level 1: Der Gartenzaun',
    lvl1Subtitle: 'Origami-Einstieg & Thermik',
    lvl1Desc: 'Zwei neugierige Stadttauben kreisen tief über dem Vorgarten. Falte einen sanften Segler (Glider), um sie zu erwischen!',
    lvl1Objective: 'Triff 2 Tauben mit maximal 3 Blättern.',
    lvl1Star1: '★ Level erfolgreich abgeschlossen',
    lvl1Star2: '★ Mit maximal 2 Blättern geschafft',
    lvl1Star3: '★ Mindestens 1 perfekte Kante erzielt',

    lvl2Title: 'Level 2: Hohe Weide',
    lvl2Subtitle: 'Präzisionsflug & Nadel-Aerodynamik',
    lvl2Desc: 'Zwei japanische Origami-Kraniche ziehen in 12m Höhe vorbei. Hier hilft nur ein rasanter Akrobatik-Dart!',
    lvl2Objective: 'Triff 2 Kraniche in der Höhe mit max. 3 Blättern.',
    lvl2Star1: '★ Beide Kraniche getroffen',
    lvl2Star2: '★ Mit maximal 2 Blättern geschafft',
    lvl2Star3: '★ Mindestens 1 perfekte Kante erzielt',

    lvl3Title: 'Level 3: Nachbars Auto-Alarm',
    lvl3Subtitle: 'Kinetische Zerstörungskraft',
    lvl3Desc: 'Nachbars Familienkutsche steht friedlich in der Auffahrt. Falte das Papier zu einem schweren Kometen (5+ Faltungen) und löse den Autoalarm aus!',
    lvl3Objective: 'Erzeuge einen Meteoriten-Krater (5+ Faltungen), um die Alarmanlage auszulösen.',
    lvl3Star1: '★ Autoalarm & Schaf-Schock ausgelöst',
    lvl3Star2: '★ Im allerersten Wurf gelungen (1-Shot)',
    lvl3Star3: '★ Perfekte Kante & Komet gemeistert',

    lvl4Title: 'Level 4: Flug FL-404',
    lvl4Subtitle: 'Stratosphären-Abfangjäger',
    lvl4Desc: 'Der Passagierjet Faltality Airlines FL-404 kreuzt in 20m Höhe mit 7 m/s! Berechne den Vorhaltewinkel präzise.',
    lvl4Objective: 'Hole Passagierjet FL-404 vom Himmel (max. 4 Blätter).',
    lvl4Star1: '★ Flugzeug FL-404 getroffen',
    lvl4Star2: '★ Mit maximal 2 Blättern getroffen',
    lvl4Star3: '★ Mindestens 1 perfekte Kante erzielt',

    lvl5Title: 'Level 5: Apple Keynote Orbit',
    lvl5Subtitle: 'Der finale Falt-Boss: iPhone Duo',
    lvl5Desc: 'Das gigantische 14m-Titanium iPhone Duo schwebt majestätisch im Orbit! Knacke das Ceramic-Shield-Scharnier!',
    lvl5Objective: 'Zerstöre das iPhone Duo (4 Treffer, max. 6 Blätter).',
    lvl5Star1: '★ iPhone Duo Scharnier pulverisiert',
    lvl5Star2: '★ Mit maximal 4 Blättern besiegt',
    lvl5Star3: '★ Mindestens 2 perfekte Kanten erzielt'
  },
  en: {
    gameTitle: 'FOLDTALITY',
    gameSubtitle: 'PRODUCTIVE PAPER FOLDING',
    metaTitle: 'FOLDTALITY – The Exponential Paper Folding Experience',
    skyActive: 'ACTIVE:',
    skyBirdsDefault: '🕊️ Pigeons, 🦤 Cranes, 🦆 Ducks',
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
    btnFocusPaper: 'Focus',
    btnFocusPaperTitle: 'Center view on paper [Key C]',
    btnMaterialPaper: 'Paper',
    btnMaterialFoil: 'Alu Foil',
    btnMaterialLocked: 'Foil (at 500)',
    btnMaterialLockedTitle: (ptsRemaining) => `🔒 Unlock tin foil at 500 points (${ptsRemaining} pts needed)`,
    btnMaterialTitle: 'Toggle material: Paper / Tin Foil [Key U]',
    foilActiveTag: '🌯 TIN FOIL (2x SCORE)',
    paperActiveTag: '📄 PAPER',
    foilUnlockNotification: '✨ TIN FOIL UNLOCKED! Press [U] for Tin Foil (2x score multiplier!)',

    pitchLabel: 'Pitch [↑/↓]:',
    powerLabel: 'Power:',

    introSubtitle: '★ THE EXPONENTIAL PAPER FOLDING EXPERIENCE ★',
    introPressEnter: '▶ PRESS [ENTER] OR [SPACE] TO START ◀',
    introStartBtn: 'START GAME',
    introHintF: '<kbd>F</kbd> Fold Paper (Double)',
    introHintSpace: '<kbd>Space</kbd> Aim & Launch',
    introHintT: '<kbd>Tab</kbd> / <kbd>T</kbd> 90s Arcade Lock-On',
    introHintArrows: '<kbd>← → ↑ ↓</kbd> Pan View & Aim',

    menuTitle: 'MENU',
    menuClose: '✕',
    menuLangLabel: '🌐 Switch Language / Sprache:',
    menuFaltpediaBtn: '📖 Open FALT-PEDIA Encyclopedia',
    menuAimLabel: '🎯 Apple iAim Auto-Targeting:',
    menuCycleTargetBtn: '🎯 Cycle Target [Tab / T]',
    menuSoundLabel: '🔊 Sound & Music:',
    menuSoundOn: '🔊 Sound: ON',
    menuSoundOff: '🔇 Sound: OFF',
    menuKeymapBtn: '⌨️ Controls & Key Map [K]',
    menuReplayIntroBtn: '🎬 Replay Retro Intro Animation',
    menuSkyStatusLabel: '🪶 Active in the Garden Sky:',

    keymapModalHeader: '⌨️ Controls & Key Map',
    keymapF: '<strong>Fold Paper</strong> (Double thickness & range) / Return to table',
    keymapSpace: '<strong>Toggle Aim Mode</strong> or <strong>Launch Paper</strong>',
    keymapT: '<strong>90s Arcade Lock-On</strong> (Cycles through Pigeons, Seagulls, Airliners & Satellites)',
    keymapArrowsPitch: '<strong>Adjust Pitch</strong> up / down',
    keymapArrowsYaw: '<strong>Adjust Yaw</strong> left / right',
    keymapA: 'Toggle <strong>Apple iAim</strong> Auto-Lock',
    keymapK: 'Open / close this <strong>Controls Modal</strong>',
    keymapC: '<strong>Center view on paper</strong> (Camera reset back to table)',
    keymapU: '<strong>Toggle Material</strong> (Paper / Tin Foil unlockable at 500 points)',
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
        icon: '🦤',
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
    pointsCrater: (folds) => `WITH ${folds} FOLDS!`,

    bossName: '📱 Apple iPhone Duo (Titanium Hinge)',
    bossPhaseClosed: 'Phase 1: Closed (Pocket Mode)',
    bossPhaseUnfolding: 'Phase 2: Unfolding...',
    bossPhaseOpen: 'Phase 3: Unfolded (Dual-Screen)',
    bossShieldDeflect: '🛡️ CERAMIC SHIELD TOO STRONG! Requires 5+ folds or Aluminum Foil!',
    bossSpawnBanner: '★ ONE MORE THING... ★',
    bossSpawnSub: 'The Ultimate Folding Boss: iPhone Duo approaches from orbit!',
    bossDefeatBanner: '🏆 F O L D T A L I T Y !',
    bossDefeatSub: '📱 iPhone Duo Hinge cracked! +25,000 Points!',
    menuSummonBoss: '📱 Challenge iPhone Duo [B]',

    creaseTitle: 'CREASE TIMING',
    creasePerfect: '★ PERFECT CREASE! (+25% SPEED) ★',
    creaseGood: 'GOOD CREASE',
    creaseImperfect: 'CRUMPLED CREASE (Wobbly)',
    creaseHint: 'Press [F] inside the sweetspot!',
    archetypeBadgeLabel: 'FLIGHT ARCHETYPE',
    archetypeGlider: 'Glider',
    archetypeDart: 'Dart',
    archetypeComet: 'Comet',
    archetypeSheet: 'Flat Sheet',
    archetypeGliderDesc: 'Gentle floater with high lift factor and long hang-time.',
    archetypeDartDesc: 'High-speed precision dart with razor-straight trajectory.',
    archetypeCometDesc: 'Heavy ballistic slug with immense kinetic impact.',
    archetypeSheetDesc: 'Unfolded sheet. Drifts helplessly to the grass.',
    statGlide: 'Glide',
    statSpeed: 'Speed',
    statImpact: 'Impact',

    // Slingshot: Direct Look & Hold-to-Charge
    slingDragTip: '🎯 Aim with Trackpad/Mouse • Hold to Charge • Release!',
    slingDragRelease: 'Release to launch!',
    slingDragCancel: '[Esc] Cancel',

    // Campaign Mode & Levels
    modeSandbox: '🏡 Sandbox (Endless)',
    modeCampaign: '🎯 Campaign',
    btnLevelSelect: '🎯 Level Select',
    btnSandbox: '🏡 Free Sandbox',
    levelSelectTitle: '🎯 CAMPAIGN LEVELS',
    levelSelectSubtitle: 'Pick a folding mission, complete the objective, and earn up to 3 stars!',
    levelSelectClose: 'Close',
    levelUnlockAllBtn: '🔓 Unlock All (Cheat)',
    levelResetProgressBtn: '🔄 Reset Progress',
    levelSheetsAmmoLabel: (rem, max) => `📄 Sheets: ${rem}/${max}`,
    levelObjectivePill: (curr, req) => `Goal: ${curr}/${req}`,
    levelResultVictory: '★ MISSION COMPLETE! ★',
    levelResultFailed: 'MISSION FAILED',
    levelResultFailedReason: 'Out of paper sheets!',
    btnNextLevel: 'Next Level ▶',
    btnRetryLevel: 'Try Again 🔄',
    btnReturnToSelect: 'Level Select 📋',
    btnBackToSandbox: 'To Sandbox 🏡',
    starEarnedTitle: (stars) => `${stars} of 3 Stars Earned!`,
    highScorePill: (score) => `Best: ${score.toLocaleString()} pts`,

    lvl1Title: 'Level 1: The Garden Fence',
    lvl1Subtitle: 'Origami Basics & Float Dynamics',
    lvl1Desc: 'Two curious city pigeons cruise low across the garden. Fold a gentle Glider to catch them!',
    lvl1Objective: 'Hit 2 pigeons with max 3 sheets.',
    lvl1Star1: '★ Level successfully completed',
    lvl1Star2: '★ Solved with max 2 sheets',
    lvl1Star3: '★ At least 1 perfect crease scored',

    lvl2Title: 'Level 2: High Pasture',
    lvl2Subtitle: 'Precision Dart Flight',
    lvl2Desc: 'Two Japanese origami cranes soar at 12m altitude. You need a razor-straight Dart!',
    lvl2Objective: 'Hit 2 cranes aloft with max 3 sheets.',
    lvl2Star1: '★ Both cranes nailed',
    lvl2Star2: '★ Solved with max 2 sheets',
    lvl2Star3: '★ At least 1 perfect crease scored',

    lvl3Title: 'Level 3: Car Alarm Chaos',
    lvl3Subtitle: 'Kinetic Shockwave',
    lvl3Desc: 'Neighbor’s car rests quietly in the driveway. Fold the sheet into a dense Comet (5+ folds) and trigger the alarm!',
    lvl3Objective: 'Blast a meteor crater (5+ folds) to blare the car alarm.',
    lvl3Star1: '★ Car alarm & fainting sheep triggered',
    lvl3Star2: '★ Nailed on the very first throw (1-shot)',
    lvl3Star3: '★ Perfect crease & comet mastered',

    lvl4Title: 'Level 4: Flight FL-404',
    lvl4Subtitle: 'Stratospheric Interception',
    lvl4Desc: 'Passenger airliner Faltality Airlines FL-404 cruises at 20m height with 7 m/s! Lead your shot carefully.',
    lvl4Objective: 'Take down jet FL-404 with max 4 sheets.',
    lvl4Star1: '★ Airliner FL-404 shot down',
    lvl4Star2: '★ Solved with max 2 sheets',
    lvl4Star3: '★ At least 1 perfect crease scored',

    lvl5Title: 'Level 5: Keynote Orbit',
    lvl5Subtitle: 'Final Boss: iPhone Duo',
    lvl5Desc: 'The gargantuan 14m titanium iPhone Duo hovers in orbit! Shatter the Ceramic Shield hinge!',
    lvl5Objective: 'Destroy the iPhone Duo (4 hits, max 6 sheets).',
    lvl5Star1: '★ iPhone Duo hinge pulverized',
    lvl5Star2: '★ Defeated with max 4 sheets',
    lvl5Star3: '★ At least 2 perfect creases scored'
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
