import './style.css';
import { FaltalityGame } from './game';
import type { BirdData } from './models/birds';

window.addEventListener('DOMContentLoaded', () => {
  // 3D Canvas Container
  const container = document.getElementById('game-canvas') || document.getElementById('canvas-container');
  if (!container) {
    console.error('Canvas container not found!');
    return;
  }
  const game = new FaltalityGame(container);

  // UI Element References
  const scoreVal = document.getElementById('score-val')!;
  const birdsHitVal = document.getElementById('birds-hit-val')!;
  const comboVal = document.getElementById('combo-val')!;
  const sheetNum = document.getElementById('sheet-num')!;
  const skyBirdsInfo = document.getElementById('sky-birds-info')!;

  const foldName = document.getElementById('fold-name')!;
  const thicknessVal = document.getElementById('thickness-val')!;
  const foldProgress = document.getElementById('fold-progress')!;
  const layersVal = document.getElementById('layers-val')!;
  const rangeVal = document.getElementById('range-val')!;
  const comparisonVal = document.getElementById('comparison-val')!;

  // Feature Preview / Escalation Card
  const escalationCard = document.getElementById('escalation-card')!;
  const escalationIcon = document.getElementById('escalation-icon')!;
  const escalationStatus = document.getElementById('escalation-status')!;
  const escalationNow = document.getElementById('escalation-now')!;
  const escalationNext = document.getElementById('escalation-next')!;

  // Fold Tower Indicator References (Left Sidebar)
  const towerFoldsVal = document.getElementById('tower-folds-val');
  const towerLayersVal = document.getElementById('tower-layers-val');
  const towerThicknessVal = document.getElementById('tower-thickness-val');
  const tierSheet = document.getElementById('tier-sheet');
  const tierPigeon = document.getElementById('tier-pigeon');
  const tierCrane = document.getElementById('tier-crane');
  const tierCrater = document.getElementById('tier-crater');
  const tierLimit = document.getElementById('tier-limit');
  const tierAirliner = document.getElementById('tier-airliner');
  const tierSingularity = document.getElementById('tier-singularity');

  const foldBtn = document.getElementById('fold-btn')!;
  const foldMainText = document.getElementById('fold-main-text')!;
  const foldSubtext = document.getElementById('fold-subtext')!;

  const actionBtn = document.getElementById('action-btn')!;
  const actionBtnIcon = document.getElementById('action-btn-icon')!;
  const actionMainText = document.getElementById('action-main-text')!;
  const actionSubtext = document.getElementById('action-subtext')!;
  const modeBadge = document.getElementById('mode-badge')!;

  const aimSliders = document.getElementById('aim-sliders')!;
  const pitchSlider = document.getElementById('pitch-slider') as HTMLInputElement;
  const pitchVal = document.getElementById('pitch-val')!;
  const powerSlider = document.getElementById('power-slider') as HTMLInputElement;
  const powerVal = document.getElementById('power-val')!;

  const aimToggleBtn = document.getElementById('aim-toggle-btn')!;
  const newSheetBtn = document.getElementById('new-sheet-btn')!;
  const soundBtn = document.getElementById('sound-btn');
  const keymapBtn = document.getElementById('keymap-btn');

  const faltalityBanner = document.getElementById('faltality-banner')!;
  const faltalitySubtitle = document.getElementById('faltality-subtitle')!;
  const faltalityPoints = document.getElementById('faltality-points')!;
  let bannerTimeout: number | null = null;
  let lastFoldsCount = -1;

  // Key Map Modal Elements
  const keymapModal = document.getElementById('keymap-modal');
  const keymapCloseBtn = document.getElementById('keymap-close-btn');
  const keymapOkBtn = document.getElementById('keymap-ok-btn');

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
  if (keymapCloseBtn) keymapCloseBtn.addEventListener('click', () => toggleKeymap(false));
  if (keymapOkBtn) keymapOkBtn.addEventListener('click', () => toggleKeymap(false));

  // Toggle Auto-Aim
  const toggleAim = () => {
    const active = game.toggleAutoAim();
    if (active) {
      aimToggleBtn.classList.add('active');
      aimToggleBtn.textContent = '🎯 iAim: AN';
    } else {
      aimToggleBtn.classList.remove('active');
      aimToggleBtn.textContent = '🎯 iAim: AUS';
    }
  };

  aimToggleBtn.addEventListener('click', toggleAim);

  // Update UI Stats & State
  const updateUI = () => {
    const stats = game.paper.getStats();

    scoreVal.textContent = game.state.score.toLocaleString();
    birdsHitVal.textContent = game.state.birdsHitCount.toString();
    comboVal.textContent = `x${game.state.currentCombo}`;
    sheetNum.textContent = game.state.paperCount.toString();

    // Sky birds & aircraft count
    const livingBirds = game.birdManager.birds.filter((b: BirdData) => b.alive);
    const geese = livingBirds.filter((b: BirdData) => b.type === 'goose').length;
    const pigeons = livingBirds.filter((b: BirdData) => b.type === 'pigeon').length;
    const seagulls = livingBirds.filter((b: BirdData) => b.type === 'seagull').length;
    const drones = livingBirds.filter((b: BirdData) => b.type === 'drone').length;
    const airliners = livingBirds.filter((b: BirdData) => b.type === 'airplane').length;
    skyBirdsInfo.textContent = `${geese} Kraniche, ${pigeons} Tauben, ${seagulls} Möwen${drones > 0 ? ', 1 Stealth Dart' : ''}${airliners > 0 ? `, ✈️ ${airliners} Airliner` : ''}`;

    foldName.textContent = stats.foldName;
    const formattedThickness = stats.thicknessMm >= 1000 
      ? (stats.thicknessMm / 1000).toFixed(2) + ' m'
      : (stats.thicknessMm >= 10 ? (stats.thicknessMm / 10).toFixed(1) + ' cm' : stats.thicknessMm.toFixed(1) + ' mm');
    thicknessVal.textContent = stats.thicknessMm >= 1000 
      ? (stats.thicknessMm / 1000).toFixed(2) + ' m'
      : (stats.thicknessMm >= 10 ? (stats.thicknessMm / 10).toFixed(1) + ' cm' : stats.thicknessMm.toFixed(1));

    const pct = Math.min(100, (stats.folds / 10) * 100);
    foldProgress.style.width = `${pct}%`;

    layersVal.textContent = stats.layers.toLocaleString();
    rangeVal.textContent = `~${stats.maxDistanceM} m`;
    comparisonVal.textContent = stats.comparison;

    // UPDATE LARGE FOLD TOWER INDICATOR (Left HUD)
    if (towerFoldsVal) {
      towerFoldsVal.textContent = stats.folds.toString();
      if (stats.folds > lastFoldsCount && lastFoldsCount !== -1) {
        towerFoldsVal.classList.add('pulse');
        setTimeout(() => towerFoldsVal.classList.remove('pulse'), 250);
      }
      lastFoldsCount = stats.folds;
    }
    if (towerLayersVal) {
      towerLayersVal.textContent = `${stats.layers.toLocaleString()} ${stats.layers === 1 ? 'Lage' : 'Lagen'}`;
    }
    if (towerThicknessVal) {
      towerThicknessVal.textContent = formattedThickness;
    }

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
    for (const t of tiers) {
      if (!t.el) continue;
      if (t.active) {
        t.el.classList.add('active');
      } else {
        t.el.classList.remove('active');
      }
    }

    // Feature Escalation Preview in stats panel
    escalationCard.className = 'escalation-card';
    if (stats.folds === 0) {
      escalationIcon.textContent = '📄';
      escalationStatus.textContent = 'BEREIT ZUM START:';
      escalationNow.innerHTML = '<strong>Flatterndes Blatt</strong>: Fliegt nur ~2 m und trudelt harmlos ins Gras.';
      escalationNext.innerHTML = '⏩ <em>Falte auf 1:</em> Verdoppelt Reichweite auf ~4 m für tiefe Origami-Tauben!';
    } else if (stats.folds <= 2) {
      escalationIcon.textContent = '🕊️';
      escalationStatus.textContent = 'AKTIV: TIEFFLIEGER-JAGD';
      escalationNow.innerHTML = '<strong>Aerodynamischer Flachgleiter</strong>: Perfekte Höhe für tiefe Origami-Tauben.';
      escalationNext.innerHTML = '⏩ <em>Falte auf 3:</em> Ausreichend Steigflug für japanische Origami-Kraniche!';
    } else if (stats.folds <= 4) {
      escalationIcon.textContent = '🦢';
      escalationStatus.textContent = 'AKTIV: KRANICH- & MÖWEN-REICHWEITE';
      escalationNow.innerHTML = '<strong>Stabiler Weitstreckengleiter</strong>: Zieht hoch über den Garten zu Kranichen & Möwen.';
      escalationNext.innerHTML = '⏩ <em>Ab Faltung 5:</em> 💥 <strong>Meteoriten-Krater & Autoalarm</strong> bei Fehlschüssen!';
    } else if (stats.folds <= 6) {
      escalationCard.classList.add('crater-stage');
      escalationIcon.textContent = '💥';
      escalationStatus.textContent = 'NEU: METEORITEN-KRATER AKTIV!';
      escalationNow.innerHTML = '<strong>Kinetische Masse</strong>: Fehlwürfe erzeugen Erdbeben, Krater & Autoalarm!';
      escalationNext.innerHTML = '⏩ <em>Ab Faltung 7:</em> Menschl. Limit überschritten & Tisch beginnt zu zittern!';
    } else if (stats.folds <= 8) {
      escalationCard.classList.add('crater-stage');
      escalationIcon.textContent = '🛸';
      escalationStatus.textContent = 'NEU: TISCH-VIBRATION AKTIV!';
      escalationNow.innerHTML = '<strong>Hyperschall-Geschoss</strong>: Tisch bebt. Reichweite reicht für die iFold Stealth Dart!';
      escalationNext.innerHTML = '⏩ <em>Ab Faltung 9:</em> ✈️ <strong>Faltality Airlines FL-404</strong> in den Wolken abschießen!';
    } else if (stats.folds <= 10) {
      escalationCard.classList.add('plane-stage');
      escalationIcon.textContent = '✈️';
      escalationStatus.textContent = 'NEU: AIRLINER-JAGD BEREIT!';
      escalationNow.innerHTML = '<strong>Stratosphären-Punch</strong>: Kann Passagierflugzeug FL-404 treffen (Koffer-Regen)!';
      escalationNext.innerHTML = '⏩ <em>Ab Faltung 11:</em> 🕳️ <strong>Zellulose-Singularität</strong> droht!';
    } else {
      escalationCard.classList.add('singularity-stage');
      escalationIcon.textContent = '🕳️';
      escalationStatus.textContent = 'WARNUNG: CHANDRASEKHAR-LIMIT!';
      escalationNow.innerHTML = '<strong>Papier-Singularität</strong>: Dichte nähert sich schwarzem Loch! Tisch vibriert extrem!';
      escalationNext.innerHTML = '⏩ Kosmische Zerstörungskraft beim nächsten Wurf!';
    }

    pitchSlider.value = Math.round(game.pitchDeg).toString();
    pitchVal.textContent = Math.round(game.pitchDeg).toString();
    powerSlider.value = Math.round(game.powerPercent).toString();
    powerVal.textContent = Math.round(game.powerPercent).toString();

    // 2-Phase Dynamic Button Text & State
    if (game.phase === 'flying') {
      foldBtn.setAttribute('disabled', 'true');
      actionBtn.setAttribute('disabled', 'true');
      foldMainText.textContent = 'FALTEN';
      foldSubtext.textContent = 'Im Flug...';
      actionMainText.textContent = 'FLUG...';
      actionSubtext.textContent = 'Tracking';
      modeBadge.textContent = 'Im Flug';
      modeBadge.classList.add('aiming');
      aimSliders.classList.add('hidden');
    } else if (game.phase === 'aiming') {
      foldBtn.removeAttribute('disabled');
      actionBtn.removeAttribute('disabled');
      actionBtn.classList.add('aiming-mode');

      foldMainText.textContent = 'TISCH';
      foldSubtext.textContent = '[Taste F] Weitersitzen & falten';

      actionBtnIcon.textContent = '🚀';
      actionMainText.textContent = 'ABSCHIESSEN';
      actionSubtext.textContent = '[Leertaste] Feuer frei!';

      modeBadge.textContent = 'Zielmodus';
      modeBadge.classList.add('aiming');
      aimSliders.classList.remove('hidden');
    } else {
      // Folding mode
      foldBtn.removeAttribute('disabled');
      actionBtn.removeAttribute('disabled');
      actionBtn.classList.remove('aiming-mode');

      const nextThickness = (stats.thicknessMm * 2);
      const nextStr = nextThickness >= 10 ? (nextThickness / 10).toFixed(1) + ' cm' : nextThickness.toFixed(1) + ' mm';
      foldMainText.textContent = 'FALTEN';
      foldSubtext.textContent = `[Taste F] Verdoppeln auf ${nextStr}`;

      actionBtnIcon.textContent = '🎯';
      actionMainText.textContent = 'ZIELEN';
      actionSubtext.textContent = '[Leertaste] Kamera hoch';

      modeBadge.textContent = 'Faltmodus';
      modeBadge.classList.remove('aiming');
      aimSliders.classList.add('hidden');
    }
  };

  game.onStatsChanged = updateUI;
  game.onPhaseChange = () => updateUI();

  game.onFaltality = (bird: BirdData, folds: number, scoreAward: number) => {
    updateUI();

    if (bird.type === 'airplane') {
      faltalitySubtitle.textContent = '🚨 FLUGVERSPÄTUNG DES TODES! Koffer & Duty-Free regnen herab!';
      faltalityPoints.textContent = `✈️ +${scoreAward.toLocaleString()} PUNKTE!`;
    } else {
      faltalitySubtitle.textContent = `${bird.title} mit ${folds} Faltungen erwischt!`;
      faltalityPoints.textContent = `+${scoreAward.toLocaleString()} PUNKTE!`;
    }

    faltalityBanner.classList.remove('hidden');

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 2800);
  };

  game.onOverkillCrater = (folds: number) => {
    updateUI();
    faltalitySubtitle.textContent = `💥 BUMM! Gartenzaun des Nachbarn vaporisiert! Autoalarm heult!`;
    faltalityPoints.textContent = `OVERKILL MIT ${folds} FALTUNGEN!`;
    faltalityBanner.classList.remove('hidden');

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 3000);
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
      game.state.paperCount++;
      game.paper.resetNewSheet();
      game.enterFoldingMode();
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
        game.state.paperCount++;
        game.paper.resetNewSheet();
        game.enterFoldingMode();
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
