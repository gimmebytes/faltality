import { FaltalityGame } from './game';
import { sound } from './sound';
import type { BirdData } from './models/birds';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-canvas')!;
  const game = new FaltalityGame(container);

  // UI DOM Elements
  const scoreVal = document.getElementById('score-val')!;
  const birdsHitVal = document.getElementById('birds-hit-val')!;
  const comboVal = document.getElementById('combo-val')!;
  const sheetNum = document.getElementById('sheet-num')!;
  const modeBadge = document.getElementById('mode-badge')!;
  const foldName = document.getElementById('fold-name')!;
  const thicknessVal = document.getElementById('thickness-val')!;
  const foldProgress = document.getElementById('fold-progress')!;
  const layersVal = document.getElementById('layers-val')!;
  const rangeVal = document.getElementById('range-val')!;
  const comparisonVal = document.getElementById('comparison-val')!;

  const foldBtn = document.getElementById('fold-btn')!;
  const foldMainText = document.getElementById('fold-main-text')!;
  const foldSubtext = document.getElementById('fold-subtext')!;

  const actionBtn = document.getElementById('action-btn')!;
  const actionBtnIcon = document.getElementById('action-btn-icon')!;
  const actionMainText = document.getElementById('action-main-text')!;
  const actionSubtext = document.getElementById('action-subtext')!;

  const newSheetBtn = document.getElementById('new-sheet-btn')!;
  const soundBtn = document.getElementById('sound-btn')!;
  const helpBtn = document.getElementById('help-btn')!;
  const helpModal = document.getElementById('help-modal')!;
  const modalCloseBtn = document.getElementById('modal-close-btn')!;
  const modalStartBtn = document.getElementById('modal-start-btn')!;

  const keymapBtn = document.getElementById('keymap-btn')!;
  const keymapModal = document.getElementById('keymap-modal')!;
  const keymapCloseBtn = document.getElementById('keymap-close-btn')!;
  const keymapOkBtn = document.getElementById('keymap-ok-btn')!;

  const skyBirdsInfo = document.getElementById('sky-birds-info')!;
  const aimToggleBtn = document.getElementById('aim-toggle-btn')!;
  const aimSliders = document.getElementById('aim-sliders')!;
  const pitchSlider = document.getElementById('pitch-slider') as HTMLInputElement;
  const pitchVal = document.getElementById('pitch-val')!;
  const powerSlider = document.getElementById('power-slider') as HTMLInputElement;
  const powerVal = document.getElementById('power-val')!;

  // Faltality Banner
  const faltalityBanner = document.getElementById('faltality-banner')!;
  const faltalitySubtitle = document.getElementById('faltality-subtitle')!;
  const faltalityPoints = document.getElementById('faltality-points')!;

  let bannerTimeout: number | null = null;

  // Toggle Keymap Modal
  const toggleKeymap = (force?: boolean) => {
    if (force !== undefined) {
      if (force) keymapModal.classList.remove('hidden');
      else keymapModal.classList.add('hidden');
    } else {
      keymapModal.classList.toggle('hidden');
    }
  };

  keymapBtn.addEventListener('click', () => toggleKeymap());
  keymapCloseBtn.addEventListener('click', () => toggleKeymap(false));
  keymapOkBtn.addEventListener('click', () => toggleKeymap(false));

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

    // Sky birds count
    const livingBirds = game.birdManager.birds.filter((b: BirdData) => b.alive);
    const geese = livingBirds.filter((b: BirdData) => b.type === 'goose').length;
    const pigeons = livingBirds.filter((b: BirdData) => b.type === 'pigeon').length;
    const seagulls = livingBirds.filter((b: BirdData) => b.type === 'seagull').length;
    const drones = livingBirds.filter((b: BirdData) => b.type === 'drone').length;
    skyBirdsInfo.textContent = `${geese} Gänse, ${pigeons} Tauben, ${seagulls} Möwen${drones > 0 ? ', 1 Drohne' : ''}`;

    foldName.textContent = stats.foldName;
    thicknessVal.textContent = stats.thicknessMm >= 1000 
      ? (stats.thicknessMm / 1000).toFixed(2) + ' m'
      : (stats.thicknessMm >= 10 ? (stats.thicknessMm / 10).toFixed(1) + ' cm' : stats.thicknessMm.toFixed(1));

    const pct = Math.min(100, (stats.folds / 10) * 100);
    foldProgress.style.width = `${pct}%`;

    layersVal.textContent = stats.layers.toLocaleString();
    rangeVal.textContent = `~${stats.maxDistanceM} m`;
    comparisonVal.textContent = stats.comparison;

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

    faltalitySubtitle.textContent = `${bird.title} mit ${folds} Faltungen erwischt!`;
    faltalityPoints.textContent = `+${scoreAward} PUNKTE!`;
    faltalityBanner.classList.remove('hidden');

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 2400);
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

  pitchSlider.addEventListener('input', (e) => {
    game.pitchDeg = parseFloat((e.target as HTMLInputElement).value);
    pitchVal.textContent = Math.round(game.pitchDeg).toString();
    game.paper.updateTrajectory(game.pitchDeg, game.yawDeg, game.powerPercent, game.targetedBird !== null);
  });

  powerSlider.addEventListener('input', (e) => {
    game.powerPercent = parseFloat((e.target as HTMLInputElement).value);
    powerVal.textContent = Math.round(game.powerPercent).toString();
    game.paper.updateTrajectory(game.pitchDeg, game.yawDeg, game.powerPercent, game.targetedBird !== null);
  });

  soundBtn.addEventListener('click', () => {
    sound.enabled = !sound.enabled;
    soundBtn.textContent = sound.enabled ? '🔊' : '🔇';
  });

  helpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
  });
  modalCloseBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
  });
  modalStartBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
  });

  // Track Arrow keys down / up for smooth continuous camera aiming
  window.addEventListener('keydown', (e) => {
    game.keysPressed[e.key] = true;

    // Prevent default scroll on arrow keys & space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.repeat) return;
    const key = e.key.toLowerCase();

    if (key === 'f') {
      if (game.phase === 'aiming') {
        game.enterFoldingMode();
      } else {
        game.foldPaper();
      }
    } else if (key === ' ' || key === 'spacebar') {
      if (game.phase === 'folding') {
        game.enterAimingMode();
      } else if (game.phase === 'aiming') {
        game.launchPaper();
      }
    } else if (key === 'k') {
      toggleKeymap();
    } else if (key === 'a') {
      toggleAim();
    } else if (key === 'r') {
      if (game.phase !== 'flying') {
        game.state.paperCount++;
        game.paper.resetNewSheet();
        game.enterFoldingMode();
        updateUI();
      }
    } else if (key === 'escape') {
      helpModal.classList.add('hidden');
      keymapModal.classList.add('hidden');
    }
  });

  window.addEventListener('keyup', (e) => {
    game.keysPressed[e.key] = false;
  });

  updateUI();
});
