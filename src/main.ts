import './style.css';
import { FaltalityGame } from './game';
import type { BirdData } from './models/birds';
import { translations, detectLanguage } from './i18n';
import type { SupportedLang } from './i18n';

window.addEventListener('DOMContentLoaded', () => {
  // Current active language: default detected from domain/localstorage/browser
  let currentLang: SupportedLang = detectLanguage();

  // 3D Canvas Container
  const container = document.getElementById('game-canvas') || document.getElementById('canvas-container');
  if (!container) {
    console.error('Canvas container not found!');
    return;
  }
  const game = new FaltalityGame(container);

  // UI Element References
  const metaPageTitle = document.getElementById('meta-page-title');
  const logoTitle = document.getElementById('logo-title')!;
  const logoBadge = document.getElementById('logo-badge')!;

  const trackerLabel = document.getElementById('tracker-label')!;
  const skyBirdsInfo = document.getElementById('sky-birds-info')!;

  const labelScore = document.getElementById('label-score')!;
  const scoreVal = document.getElementById('score-val')!;
  const labelBirdsHit = document.getElementById('label-birds-hit')!;
  const birdsHitVal = document.getElementById('birds-hit-val')!;
  const labelCombo = document.getElementById('label-combo')!;
  const comboVal = document.getElementById('combo-val')!;

  const langBtn = document.getElementById('lang-btn');
  const aimToggleBtn = document.getElementById('aim-toggle-btn')!;
  const cycleTargetBtn = document.getElementById('cycle-target-btn');
  const keymapBtn = document.getElementById('keymap-btn');
  const soundBtn = document.getElementById('sound-btn');
  const helpBtn = document.getElementById('help-btn');

  // Left Fold Tower
  const towerTag = document.getElementById('tower-tag')!;
  const towerFoldsVal = document.getElementById('tower-folds-val');
  const towerUnit = document.getElementById('tower-unit')!;
  const towerLayersVal = document.getElementById('tower-layers-val');
  const towerThicknessVal = document.getElementById('tower-thickness-val');

  const tierSingularity = document.getElementById('tier-singularity');
  const tierSingularityName = document.getElementById('tier-singularity-name')!;
  const tierSingularityDesc = document.getElementById('tier-singularity-desc')!;

  const tierAirliner = document.getElementById('tier-airliner');
  const tierAirlinerName = document.getElementById('tier-airliner-name')!;
  const tierAirlinerDesc = document.getElementById('tier-airliner-desc')!;

  const tierLimit = document.getElementById('tier-limit');
  const tierLimitName = document.getElementById('tier-limit-name')!;
  const tierLimitDesc = document.getElementById('tier-limit-desc')!;

  const tierCrater = document.getElementById('tier-crater');
  const tierCraterName = document.getElementById('tier-crater-name')!;
  const tierCraterDesc = document.getElementById('tier-crater-desc')!;

  const tierCrane = document.getElementById('tier-crane');
  const tierCraneName = document.getElementById('tier-crane-name')!;
  const tierCraneDesc = document.getElementById('tier-crane-desc')!;

  const tierPigeon = document.getElementById('tier-pigeon');
  const tierPigeonName = document.getElementById('tier-pigeon-name')!;
  const tierPigeonDesc = document.getElementById('tier-pigeon-desc')!;

  const tierSheet = document.getElementById('tier-sheet');
  const tierSheetName = document.getElementById('tier-sheet-name')!;
  const tierSheetDesc = document.getElementById('tier-sheet-desc')!;

  // Bottom Dashboard
  const sheetTagPrefix = document.getElementById('sheet-tag-prefix')!;
  const sheetNum = document.getElementById('sheet-num')!;
  const modeBadge = document.getElementById('mode-badge')!;
  const foldName = document.getElementById('fold-name')!;
  const thicknessVal = document.getElementById('thickness-val')!;
  const thicknessUnit = document.getElementById('thickness-unit')!;
  const foldProgress = document.getElementById('fold-progress')!;
  const limitMarker = document.getElementById('limit-marker')!;

  const labelLayers = document.getElementById('label-layers')!;
  const layersVal = document.getElementById('layers-val')!;
  const labelRange = document.getElementById('label-range')!;
  const rangeVal = document.getElementById('range-val')!;
  const labelComparison = document.getElementById('label-comparison')!;
  const comparisonVal = document.getElementById('comparison-val')!;

  // Escalation Card
  const escalationCard = document.getElementById('escalation-card')!;
  const escalationIcon = document.getElementById('escalation-icon')!;
  const escalationStatus = document.getElementById('escalation-status')!;
  const escalationNow = document.getElementById('escalation-now')!;
  const escalationNext = document.getElementById('escalation-next')!;

  // Actions Panel
  const aimSliders = document.getElementById('aim-sliders')!;
  const labelPitch = document.getElementById('label-pitch')!;
  const pitchSlider = document.getElementById('pitch-slider') as HTMLInputElement;
  const pitchVal = document.getElementById('pitch-val')!;
  const labelPower = document.getElementById('label-power')!;
  const powerSlider = document.getElementById('power-slider') as HTMLInputElement;
  const powerVal = document.getElementById('power-val')!;

  const foldBtn = document.getElementById('fold-btn')!;
  const foldMainText = document.getElementById('fold-main-text')!;
  const foldSubtext = document.getElementById('fold-subtext')!;
  const actionBtn = document.getElementById('action-btn')!;
  const actionBtnIcon = document.getElementById('action-btn-icon')!;
  const actionMainText = document.getElementById('action-main-text')!;
  const actionSubtext = document.getElementById('action-subtext')!;
  const newSheetBtn = document.getElementById('new-sheet-btn')!;
  const newSheetText = document.getElementById('new-sheet-text')!;

  // Banners & Overlays
  const faltalityBanner = document.getElementById('faltality-banner')!;
  const faltalityTitle = document.getElementById('faltality-title') || document.querySelector('.faltality-title')!;
  const faltalitySubtitle = document.getElementById('faltality-subtitle')!;
  const faltalityPoints = document.getElementById('faltality-points')!;
  const lootShowerContainer = document.getElementById('loot-shower-container');
  let bannerTimeout: number | null = null;
  let lastFoldsCount = -1;

  // Key Map Modal Elements
  const keymapModal = document.getElementById('keymap-modal');
  const keymapCloseBtn = document.getElementById('keymap-close-btn');
  const keymapOkBtn = document.getElementById('keymap-ok-btn');
  const keymapModalTitle = document.getElementById('keymap-modal-title');
  const keymapDescF = document.getElementById('keymap-desc-f');
  const keymapDescSpace = document.getElementById('keymap-desc-space');
  const keymapDescT = document.getElementById('keymap-desc-t');
  const keymapDescPitch = document.getElementById('keymap-desc-pitch');
  const keymapDescYaw = document.getElementById('keymap-desc-yaw');
  const keymapDescA = document.getElementById('keymap-desc-a');
  const keymapDescK = document.getElementById('keymap-desc-k');
  const keymapDescR = document.getElementById('keymap-desc-r');
  const keymapDescEsc = document.getElementById('keymap-desc-esc');

  const setLanguage = (newLang: SupportedLang) => {
    currentLang = newLang;
    localStorage.setItem('faltality_lang', newLang);
    document.documentElement.lang = newLang;
    updateUI();
  };

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      setLanguage(currentLang === 'de' ? 'en' : 'de');
    });
  }

  const toggleKeymap = (show?: boolean) => {
    if (!keymapModal) return;
    const isVisible = !keymapModal.classList.contains('hidden');
    const shouldShow = show !== undefined ? show : !isVisible;
    if (shouldShow) {
      keymapModal.classList.remove('hidden');
    } else {
      keymapModal.classList.add('hidden');
    }
  };

  if (keymapBtn) keymapBtn.addEventListener('click', () => toggleKeymap());
  if (helpBtn) helpBtn.addEventListener('click', () => toggleKeymap(true));
  if (keymapCloseBtn) keymapCloseBtn.addEventListener('click', () => toggleKeymap(false));
  if (keymapOkBtn) keymapOkBtn.addEventListener('click', () => toggleKeymap(false));

  // Toggle Auto-Aim
  const toggleAim = () => {
    const active = game.toggleAutoAim();
    const t = translations[currentLang];
    if (active) {
      aimToggleBtn.classList.add('active');
      aimToggleBtn.textContent = t.iAimOn;
    } else {
      aimToggleBtn.classList.remove('active');
      aimToggleBtn.textContent = t.iAimOff;
    }
  };

  aimToggleBtn.addEventListener('click', toggleAim);

  // Cycle Target Button & Keyboard listener
  const cycleTarget = () => {
    game.cycleTarget();
  };
  if (cycleTargetBtn) cycleTargetBtn.addEventListener('click', cycleTarget);
  skyBirdsInfo.parentElement?.addEventListener('click', cycleTarget);

  // Trigger Fun Apple Keynote Loot Rain Overlay
  const triggerAppleKeynoteLootShower = () => {
    if (!lootShowerContainer) return;

    const items = [
      { icon: '🎧', label: 'AirPods Pro Case', price: '$249' },
      { icon: '📱', label: 'iPhone 16 Pro (Titanium)', price: '$1,199' },
      { icon: '🧣', label: 'Apple Polishing Cloth', price: '$19' },
      { icon: '💸', label: '$19.00 USD', price: '' },
      { icon: '🍏', label: 'One More Thing', price: 'Priceless' }
    ];

    const count = 28;
    for (let i = 0; i < count; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const el = document.createElement('div');
      el.className = 'apple-loot-item';
      el.innerHTML = `<span class="loot-icon">${item.icon}</span> <span>${item.label}</span> <span class="loot-price">${item.price}</span>`;

      const leftPercent = Math.random() * 85 + 5;
      const duration = 2.8 + Math.random() * 2.2;
      const delay = Math.random() * 1.5;

      el.style.left = `${leftPercent}%`;
      el.style.animationDuration = `${duration}s`;
      el.style.animationDelay = `${delay}s`;

      lootShowerContainer.appendChild(el);

      setTimeout(() => {
        el.remove();
      }, (duration + delay) * 1000);
    }
  };

  // Update UI Stats & State with current language translations
  const updateUI = () => {
    const t = translations[currentLang];
    const stats = game.paper.getStats(currentLang);

    // Dynamic Title and Flag Indicator
    if (metaPageTitle) metaPageTitle.textContent = t.metaTitle;
    logoTitle.textContent = t.gameTitle;
    logoBadge.textContent = t.gameSubtitle;
    if (langBtn) {
      langBtn.textContent = currentLang === 'de' ? '🇩🇪 DE' : '🇬🇧 EN';
      langBtn.title = currentLang === 'de' ? 'Switch to English (Foldtality)' : 'Auf Deutsch umschalten (Faltality)';
    }

    // Top Header
    trackerLabel.textContent = t.skyActive;
    labelScore.textContent = t.score;
    labelBirdsHit.textContent = t.birdsHit;
    labelCombo.textContent = t.combo;

    scoreVal.textContent = game.state.score.toLocaleString();
    birdsHitVal.textContent = game.state.birdsHitCount.toString();
    comboVal.textContent = `x${game.state.currentCombo}`;
    sheetTagPrefix.textContent = `${t.sheetTag(game.state.paperCount).split('#')[0]}#`;
    sheetNum.textContent = game.state.paperCount.toString();

    aimToggleBtn.textContent = game.autoAim ? t.iAimOn : t.iAimOff;

    // Sky birds & aircraft count
    const livingBirds = game.birdManager.birds.filter((b: BirdData) => b.alive);
    const geese = livingBirds.filter((b: BirdData) => b.type === 'goose').length;
    const pigeons = livingBirds.filter((b: BirdData) => b.type === 'pigeon').length;
    const seagulls = livingBirds.filter((b: BirdData) => b.type === 'seagull').length;
    const drones = livingBirds.filter((b: BirdData) => b.type === 'drone').length;
    const airliners = livingBirds.filter((b: BirdData) => b.type === 'airplane').length;
    const satellites = livingBirds.filter((b: BirdData) => b.type === 'satellite').length;

    // Show current targeted bird on HUD if aiming
    if (game.phase === 'aiming' && game.targetedBird) {
      const targetPrefix = game.targetedBird.type === 'satellite' ? '🛰️' : (game.targetedBird.type === 'airplane' ? '✈️' : '🎯');
      skyBirdsInfo.textContent = `${targetPrefix} ${t.skyLocked(game.targetedBird.title)}`;
      if (cycleTargetBtn) {
        cycleTargetBtn.textContent = t.cycleTargetShort(game.targetedBird.title.split(' ')[0]);
      }
    } else {
      if (currentLang === 'en') {
        skyBirdsInfo.textContent = `${geese} Cranes, ${pigeons} Pigeons, ${seagulls} Seagulls${drones > 0 ? ', 1 Stealth Dart' : ''}${airliners > 0 ? `, ✈️ ${airliners} Airliner` : ''}${satellites > 0 ? `, 🛰️ ${satellites} Tim Cook Satellite` : ''}`;
      } else {
        skyBirdsInfo.textContent = `${geese} Kraniche, ${pigeons} Tauben, ${seagulls} Möwen${drones > 0 ? ', 1 Stealth Dart' : ''}${airliners > 0 ? `, ✈️ ${airliners} Airliner` : ''}${satellites > 0 ? `, 🛰️ ${satellites} Tim Cook Satellit` : ''}`;
      }
      if (cycleTargetBtn) {
        cycleTargetBtn.textContent = t.cycleTarget;
      }
    }

    foldName.textContent = stats.foldName;
    const formattedThickness = stats.thicknessMm >= 1000 
      ? (stats.thicknessMm / 1000).toFixed(2) + ' m'
      : (stats.thicknessMm >= 10 ? (stats.thicknessMm / 10).toFixed(1) + ' cm' : stats.thicknessMm.toFixed(1) + ' mm');
    thicknessVal.textContent = stats.thicknessMm >= 1000 
      ? (stats.thicknessMm / 1000).toFixed(2) + ' m'
      : (stats.thicknessMm >= 10 ? (stats.thicknessMm / 10).toFixed(1) + ' cm' : stats.thicknessMm.toFixed(1));
    thicknessUnit.textContent = `${stats.thicknessMm >= 1000 ? '' : (stats.thicknessMm >= 10 ? '' : 'mm ')}${t.thicknessUnit}`;

    const pct = Math.min(100, (stats.folds / 10) * 100);
    foldProgress.style.width = `${pct}%`;
    limitMarker.textContent = t.limitMarker;

    labelLayers.textContent = t.layersLabel;
    layersVal.textContent = stats.layers.toLocaleString();
    labelRange.textContent = t.rangeLabel;
    rangeVal.textContent = `~${stats.maxDistanceM} m`;
    labelComparison.textContent = t.comparisonLabel;
    comparisonVal.textContent = stats.comparison;

    // UPDATE LARGE FOLD TOWER INDICATOR (Left HUD)
    towerTag.textContent = t.foldTowerTag;
    towerUnit.textContent = t.foldsUnit;
    if (towerFoldsVal) {
      towerFoldsVal.textContent = stats.folds.toString();
      if (stats.folds > lastFoldsCount && lastFoldsCount !== -1) {
        towerFoldsVal.classList.add('pulse');
        setTimeout(() => towerFoldsVal.classList.remove('pulse'), 250);
      }
      lastFoldsCount = stats.folds;
    }
    if (towerLayersVal) {
      towerLayersVal.textContent = t.layerPill(stats.layers);
    }
    if (towerThicknessVal) {
      towerThicknessVal.textContent = formattedThickness;
    }

    // Tier segment names and descriptions
    tierSingularityName.textContent = t.tierSingularity.name;
    tierSingularityDesc.textContent = t.tierSingularity.desc;
    tierAirlinerName.textContent = t.tierAirliner.name;
    tierAirlinerDesc.textContent = t.tierAirliner.desc;
    tierLimitName.textContent = t.tierLimit.name;
    tierLimitDesc.textContent = t.tierLimit.desc;
    tierCraterName.textContent = t.tierCrater.name;
    tierCraterDesc.textContent = t.tierCrater.desc;
    tierCraneName.textContent = t.tierCrane.name;
    tierCraneDesc.textContent = t.tierCrane.desc;
    tierPigeonName.textContent = t.tierPigeon.name;
    tierPigeonDesc.textContent = t.tierPigeon.desc;
    tierSheetName.textContent = t.tierSheet.name;
    tierSheetDesc.textContent = t.tierSheet.desc;

    // Update active tier badge in Fold Tower
    const tiers = [
      { el: tierSheet, active: stats.folds === 0 },
      { el: tierPigeon, active: stats.folds >= 1 && stats.folds <= 2 },
      { el: tierCrane, active: stats.folds >= 3 && stats.folds <= 4 },
      { el: tierCrater, active: stats.folds >= 5 && stats.folds <= 6 },
      { el: tierLimit, active: stats.folds >= 7 && stats.folds <= 8 },
      { el: tierAirliner, active: stats.folds >= 9 && stats.folds <= 10 },
      { el: tierSingularity, active: stats.folds >= 11 }
    ];
    for (const seg of tiers) {
      if (!seg.el) continue;
      if (seg.active) {
        seg.el.classList.add('active');
      } else {
        seg.el.classList.remove('active');
      }
    }

    // Feature Escalation Preview in stats panel
    escalationCard.className = 'escalation-card';
    if (stats.folds === 0) {
      escalationIcon.textContent = '📄';
      escalationStatus.textContent = t.escalationReady;
      escalationNow.innerHTML = t.esc0Now;
      escalationNext.innerHTML = t.esc0Next;
    } else if (stats.folds <= 2) {
      escalationIcon.textContent = '🕊️';
      escalationStatus.textContent = t.escalationActiveLow;
      escalationNow.innerHTML = t.esc1Now;
      escalationNext.innerHTML = t.esc1Next;
    } else if (stats.folds <= 4) {
      escalationIcon.textContent = '🦢';
      escalationStatus.textContent = t.escalationActiveMid;
      escalationNow.innerHTML = t.esc3Now;
      escalationNext.innerHTML = t.esc3Next;
    } else if (stats.folds <= 6) {
      escalationCard.classList.add('crater-stage');
      escalationIcon.textContent = '💥';
      escalationStatus.textContent = t.escalationCraterTitle;
      escalationNow.innerHTML = t.esc5Now;
      escalationNext.innerHTML = t.esc5Next;
    } else if (stats.folds <= 8) {
      escalationCard.classList.add('crater-stage');
      escalationIcon.textContent = '🛸';
      escalationStatus.textContent = t.escalationLimitTitle;
      escalationNow.innerHTML = t.esc7Now;
      escalationNext.innerHTML = t.esc7Next;
    } else if (stats.folds <= 10) {
      escalationCard.classList.add('plane-stage');
      escalationIcon.textContent = '✈️';
      escalationStatus.textContent = t.escalationPlaneTitle;
      escalationNow.innerHTML = t.esc9Now;
      escalationNext.innerHTML = t.esc9Next;
    } else {
      escalationCard.classList.add('singularity-stage');
      escalationIcon.textContent = '🛰️';
      escalationStatus.textContent = t.escalationOrbitTitle;
      escalationNow.innerHTML = t.esc11Now;
      escalationNext.innerHTML = t.esc11Next;
    }

    labelPitch.textContent = t.pitchLabel;
    labelPower.textContent = t.powerLabel;
    newSheetText.textContent = t.btnReset;

    pitchSlider.value = Math.round(game.pitchDeg).toString();
    pitchVal.textContent = Math.round(game.pitchDeg).toString();
    powerSlider.value = Math.round(game.powerPercent).toString();
    powerVal.textContent = Math.round(game.powerPercent).toString();

    // Keymap Modal Translations
    if (keymapModalTitle) keymapModalTitle.textContent = t.keymapModalHeader;
    if (keymapDescF) keymapDescF.innerHTML = t.keymapF;
    if (keymapDescSpace) keymapDescSpace.innerHTML = t.keymapSpace;
    if (keymapDescT) keymapDescT.innerHTML = t.keymapT;
    if (keymapDescPitch) keymapDescPitch.innerHTML = t.keymapArrowsPitch;
    if (keymapDescYaw) keymapDescYaw.innerHTML = t.keymapArrowsYaw;
    if (keymapDescA) keymapDescA.innerHTML = t.keymapA;
    if (keymapDescK) keymapDescK.innerHTML = t.keymapK;
    if (keymapDescR) keymapDescR.innerHTML = t.keymapR;
    if (keymapDescEsc) keymapDescEsc.innerHTML = t.keymapEsc;
    if (keymapOkBtn) keymapOkBtn.textContent = t.keymapOk;

    // 2-Phase Dynamic Button Text & State
    if (game.phase === 'flying') {
      foldBtn.setAttribute('disabled', 'true');
      actionBtn.setAttribute('disabled', 'true');
      foldMainText.textContent = t.btnFoldMain;
      foldSubtext.textContent = t.btnFoldFlyingSub;
      actionMainText.textContent = t.btnFlyingMain;
      actionSubtext.textContent = t.btnFlyingSub;
      modeBadge.textContent = t.modeFlying;
      modeBadge.classList.add('aiming');
      aimSliders.classList.add('hidden');
    } else if (game.phase === 'aiming') {
      foldBtn.removeAttribute('disabled');
      actionBtn.removeAttribute('disabled');
      actionBtn.classList.add('aiming-mode');

      foldMainText.textContent = currentLang === 'de' ? 'TISCH' : 'TABLE';
      foldSubtext.textContent = t.btnFoldAimingSub;

      actionBtnIcon.textContent = '🚀';
      actionMainText.textContent = t.btnLaunchMain;
      actionSubtext.textContent = t.btnLaunchSub;

      modeBadge.textContent = t.modeAiming;
      modeBadge.classList.add('aiming');
      aimSliders.classList.remove('hidden');
    } else {
      // Folding mode
      foldBtn.removeAttribute('disabled');
      actionBtn.removeAttribute('disabled');
      actionBtn.classList.remove('aiming-mode');

      const nextThickness = stats.thicknessMm * 2;
      const nextStr = nextThickness >= 10 ? (nextThickness / 10).toFixed(1) + ' cm' : nextThickness.toFixed(1) + ' mm';
      foldMainText.textContent = t.btnFoldMain;
      foldSubtext.textContent = t.btnFoldSub(nextStr);

      actionBtnIcon.textContent = '🎯';
      actionMainText.textContent = t.btnAimMain;
      actionSubtext.textContent = t.btnAimSub;

      modeBadge.textContent = t.modeFolding;
      modeBadge.classList.remove('aiming');
      aimSliders.classList.add('hidden');
    }
  };

  game.onStatsChanged = updateUI;
  game.onPhaseChange = () => updateUI();

  game.onFaltality = (bird: BirdData, folds: number, scoreAward: number) => {
    updateUI();
    const t = translations[currentLang];

    if (bird.type === 'satellite') {
      faltalityTitle.textContent = t.bannerOneMoreThing;
      faltalitySubtitle.innerHTML = t.subSatellite;
      faltalityPoints.textContent = t.pointsSatellite(scoreAward);
      triggerAppleKeynoteLootShower();
    } else if (bird.type === 'airplane') {
      faltalityTitle.textContent = t.bannerFaltality;
      faltalitySubtitle.innerHTML = t.subPlane;
      faltalityPoints.textContent = t.pointsPlane(scoreAward);
    } else {
      faltalityTitle.textContent = t.bannerFaltality;
      faltalitySubtitle.innerHTML = t.subNormal(bird.title, folds);
      faltalityPoints.textContent = t.pointsNormal(scoreAward);
    }

    faltalityBanner.classList.remove('hidden');

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 4200);
  };

  game.onOverkillCrater = (folds: number) => {
    updateUI();
    const t = translations[currentLang];
    faltalityTitle.textContent = t.bannerOverkill;
    faltalitySubtitle.innerHTML = t.subCrater;
    faltalityPoints.textContent = t.pointsCrater(folds);
    faltalityBanner.classList.remove('hidden');

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 3200);
  };

  game.onFlightEnd = () => {
    updateUI();
  };

  // Button Listeners
  foldBtn.addEventListener('click', () => {
    if (game.phase === 'aiming') {
      game.enterFoldingMode();
    } else {
      game.foldPaper();
    }
  });

  actionBtn.addEventListener('click', () => {
    if (game.phase === 'folding') {
      game.enterAimingMode();
    } else if (game.phase === 'aiming') {
      game.launchPaper();
    }
  });

  newSheetBtn.addEventListener('click', () => {
    if (game.phase !== 'flying') {
      game.resetNewSheet();
      updateUI();
    }
  });

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isMuted = soundBtn.textContent?.includes('🔇');
      if (isMuted) {
        soundBtn.textContent = '🔊';
      } else {
        soundBtn.textContent = '🔇';
      }
    });
  }

  // Slider Listeners
  pitchSlider.addEventListener('input', () => {
    game.pitchDeg = parseFloat(pitchSlider.value);
    pitchVal.textContent = Math.round(game.pitchDeg).toString();
    game.paper.updateTrajectory(game.pitchDeg, game.yawDeg, game.powerPercent, game.targetedBird !== null);
  });

  powerSlider.addEventListener('input', () => {
    game.powerPercent = parseFloat(powerSlider.value);
    powerVal.textContent = Math.round(game.powerPercent).toString();
    game.paper.updateTrajectory(game.pitchDeg, game.yawDeg, game.powerPercent, game.targetedBird !== null);
  });

  // Keyboard Shortcuts:
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
      game.keysPressed[e.code] = true;
      return;
    }

    if (e.code === 'KeyK') {
      toggleKeymap();
      return;
    }

    if (e.code === 'KeyT') {
      e.preventDefault();
      cycleTarget();
      return;
    }

    if (e.code === 'Escape') {
      toggleKeymap(false);
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (game.phase === 'folding') {
        game.enterAimingMode();
      } else if (game.phase === 'aiming') {
        game.launchPaper();
      }
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      if (game.phase === 'aiming') {
        game.enterFoldingMode();
      } else {
        game.foldPaper();
      }
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      if (game.phase !== 'flying') {
        game.resetNewSheet();
        updateUI();
      }
    } else if (e.code === 'KeyA') {
      e.preventDefault();
      toggleAim();
    }
  });

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      game.keysPressed[e.code] = false;
    }
  });

  updateUI();
});
