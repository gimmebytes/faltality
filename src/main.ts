import './style.css';
import { FaltalityGame } from './game';
import type { BirdData } from './models/birds';
import { translations, detectLanguage } from './i18n';
import type { SupportedLang } from './i18n';
import { sound } from './sound';

window.addEventListener('DOMContentLoaded', () => {
  // Current active language: default detected from domain/localstorage/browser
  let currentLang: SupportedLang = detectLanguage();
  let introActive = true;

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

  // Top Header Scoreboard
  const labelScore = document.getElementById('label-score')!;
  const scoreVal = document.getElementById('score-val')!;
  const labelBirdsHit = document.getElementById('label-birds-hit')!;
  const birdsHitVal = document.getElementById('birds-hit-val')!;
  const labelCombo = document.getElementById('label-combo')!;
  const comboVal = document.getElementById('combo-val')!;

  // Hamburger Menu & Drawer
  const menuToggleBtn = document.getElementById('menu-toggle-btn')!;
  const menuDrawerBackdrop = document.getElementById('menu-drawer-backdrop')!;
  const menuCloseBtn = document.getElementById('menu-close-btn')!;
  const menuTitle = document.getElementById('menu-title')!;
  const menuLangLabel = document.getElementById('menu-lang-label')!;
  const langBtnDe = document.getElementById('lang-btn-de')!;
  const langBtnEn = document.getElementById('lang-btn-en')!;
  const drawerPediaBtn = document.getElementById('drawer-pedia-btn')!;
  const menuPediaLabel = document.getElementById('menu-pedia-label')!;
  const menuAimLabel = document.getElementById('menu-aim-label')!;
  const menuIaimBtn = document.getElementById('menu-iaim-btn')!;
  const menuCycleTargetBtn = document.getElementById('menu-cycle-target-btn')!;
  const menuSkyLabel = document.getElementById('menu-sky-label')!;
  const menuSkyText = document.getElementById('menu-sky-text')!;
  const menuSoundBtn = document.getElementById('menu-sound-btn')!;
  const menuKeymapBtn = document.getElementById('menu-keymap-btn')!;
  const menuReplayIntroBtn = document.getElementById('menu-replay-intro-btn')!;

  // Retro 80s/90s Intro Screen
  const introScreen = document.getElementById('intro-screen')!;
  const introTitle = document.getElementById('intro-title')!;
  const introSubtitle = document.getElementById('intro-subtitle')!;
  const introLangBtn = document.getElementById('intro-lang-btn')!;
  const introLangLabel = document.getElementById('intro-lang-label')!;
  const introStartBtn = document.getElementById('intro-start-btn')!;
  const introPressEnter = document.getElementById('intro-press-enter')!;
  const introHintF = document.getElementById('intro-hint-f')!;
  const introHintSpace = document.getElementById('intro-hint-space')!;
  const introHintT = document.getElementById('intro-hint-t')!;
  const introHintArrows = document.getElementById('intro-hint-arrows')!;

  // Left Fold Tower (FALT-O-METER)
  const towerTag = document.getElementById('tower-tag')!;
  const towerFoldsVal = document.getElementById('tower-folds-val');
  const towerUnit = document.getElementById('tower-unit')!;
  const towerLayersVal = document.getElementById('tower-layers-val');
  const towerThicknessVal = document.getElementById('tower-thickness-val');
  const openPediaPillBtn = document.getElementById('open-pedia-pill-btn');
  const openPediaPillText = document.getElementById('open-pedia-pill-text');

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

  // Bottom Dashboard & Controls
  const foldBtn = document.getElementById('fold-btn')!;
  const foldMainText = document.getElementById('fold-main-text')!;
  const foldSubtext = document.getElementById('fold-subtext')!;
  const actionBtn = document.getElementById('action-btn')!;
  const actionBtnIcon = document.getElementById('action-btn-icon')!;
  const actionMainText = document.getElementById('action-main-text')!;
  const actionSubtext = document.getElementById('action-subtext')!;
  const newSheetBtn = document.getElementById('new-sheet-btn')!;
  const newSheetText = document.getElementById('new-sheet-text')!;

  // Aiming Sliders
  const aimSliders = document.getElementById('aim-sliders')!;
  const pitchSlider = document.getElementById('pitch-slider') as HTMLInputElement;
  const pitchVal = document.getElementById('pitch-val')!;
  const powerSlider = document.getElementById('power-slider') as HTMLInputElement;
  const powerVal = document.getElementById('power-val')!;
  const labelPitch = document.getElementById('label-pitch')!;
  const labelPower = document.getElementById('label-power')!;

  // FALT-PEDIA Modal
  const pediaModal = document.getElementById('pedia-modal')!;
  const pediaModalTitle = document.getElementById('pedia-modal-title')!;
  const pediaModalSubtitle = document.getElementById('pedia-modal-subtitle')!;
  const pediaCloseBtn = document.getElementById('pedia-close-btn')!;
  const pediaOkBtn = document.getElementById('pedia-ok-btn')!;
  const pediaTierList = document.getElementById('pedia-tier-list')!;

  // Keyboard Shortcuts Modal [Key K]
  const keymapModal = document.getElementById('keymap-modal');
  const keymapModalTitle = document.getElementById('keymap-modal-title');
  const keymapCloseBtn = document.getElementById('keymap-close-btn');
  const keymapOkBtn = document.getElementById('keymap-ok-btn');
  const keymapDescF = document.getElementById('keymap-desc-f');
  const keymapDescSpace = document.getElementById('keymap-desc-space');
  const keymapDescT = document.getElementById('keymap-desc-t');
  const keymapDescPitch = document.getElementById('keymap-desc-pitch');
  const keymapDescYaw = document.getElementById('keymap-desc-yaw');
  const keymapDescA = document.getElementById('keymap-desc-a');
  const keymapDescK = document.getElementById('keymap-desc-k');
  const keymapDescR = document.getElementById('keymap-desc-r');
  const keymapDescEsc = document.getElementById('keymap-desc-esc');

  // Banners & Loot
  const faltalityBanner = document.getElementById('faltality-banner')!;
  const faltalityTitle = document.getElementById('faltality-title')!;
  const faltalitySubtitle = document.getElementById('faltality-subtitle')!;
  const faltalityPoints = document.getElementById('faltality-points')!;
  const lootShowerContainer = document.getElementById('loot-shower-container');

  let bannerTimeout: number | null = null;
  let lastFoldsCount = -1;

  // ===================================================
  // 🎬 START GAME & RETRO INTRO HANDLING
  // ===================================================
  const startGame = () => {
    if (!introActive) return;
    introActive = false;
    sound.playRetroStart();
    introScreen.classList.add('hidden');
  };

  const replayIntro = () => {
    introActive = true;
    introScreen.classList.remove('hidden');
    closeMenu();
  };

  introStartBtn.addEventListener('click', startGame);

  // ===================================================
  // 🌐 LANGUAGE MANAGEMENT (DE / EN)
  // ===================================================
  const setLanguage = (lang: SupportedLang) => {
    currentLang = lang;
    localStorage.setItem('faltality_lang', lang);
    updateUI();
  };

  introLangBtn.addEventListener('click', () => {
    setLanguage(currentLang === 'de' ? 'en' : 'de');
  });

  langBtnDe.addEventListener('click', () => setLanguage('de'));
  langBtnEn.addEventListener('click', () => setLanguage('en'));

  // ===================================================
  // 🍔 HAMBURGER DRAWER MANAGEMENT
  // ===================================================
  const toggleMenu = (open?: boolean) => {
    const isClosed = menuDrawerBackdrop.classList.contains('hidden');
    const shouldOpen = open !== undefined ? open : isClosed;
    if (shouldOpen) {
      menuDrawerBackdrop.classList.remove('hidden');
      menuToggleBtn.classList.add('active');
    } else {
      menuDrawerBackdrop.classList.add('hidden');
      menuToggleBtn.classList.remove('active');
    }
  };

  const closeMenu = () => toggleMenu(false);

  menuToggleBtn.addEventListener('click', () => toggleMenu());
  menuCloseBtn.addEventListener('click', closeMenu);
  menuDrawerBackdrop.addEventListener('click', (e) => {
    if (e.target === menuDrawerBackdrop) closeMenu();
  });

  menuReplayIntroBtn.addEventListener('click', replayIntro);

  // ===================================================
  // 📖 FALT-PEDIA MODAL
  // ===================================================
  const toggleFaltPedia = (show?: boolean) => {
    const isClosed = pediaModal.classList.contains('hidden');
    const shouldShow = show !== undefined ? show : isClosed;
    if (shouldShow) {
      closeMenu();
      renderFaltPedia();
      pediaModal.classList.remove('hidden');
    } else {
      pediaModal.classList.add('hidden');
    }
  };

  const renderFaltPedia = () => {
    const t = translations[currentLang];
    pediaModalTitle.textContent = t.pediaTitle;
    pediaModalSubtitle.textContent = t.pediaSubtitle;
    pediaOkBtn.textContent = t.pediaCloseBtn;

    pediaTierList.innerHTML = t.pediaTiers.map((tier) => `
      <div class="pedia-tier-item" id="${tier.id}">
        <div class="pedia-tier-icon">${tier.icon}</div>
        <div class="pedia-tier-body">
          <div class="pedia-tier-header">
            <span class="pedia-tier-title">${tier.name}</span>
            <span class="pedia-tier-folds">${tier.folds}</span>
          </div>
          <div class="pedia-tier-specs">
            <span>📏 ${tier.range}</span>
            <span>📐 ${tier.thickness}</span>
          </div>
          <div class="pedia-tier-effect">${tier.effect}</div>
          <div class="pedia-tier-target">🎯 <em>${tier.target}</em></div>
        </div>
      </div>
    `).join('');
  };

  drawerPediaBtn.addEventListener('click', () => toggleFaltPedia(true));
  if (openPediaPillBtn) openPediaPillBtn.addEventListener('click', () => toggleFaltPedia(true));
  pediaCloseBtn.addEventListener('click', () => toggleFaltPedia(false));
  pediaOkBtn.addEventListener('click', () => toggleFaltPedia(false));

  // ===================================================
  // ⌨️ KEYMAP MODAL
  // ===================================================
  const toggleKeymap = (show?: boolean) => {
    if (!keymapModal) return;
    const isVisible = !keymapModal.classList.contains('hidden');
    const shouldShow = show !== undefined ? show : !isVisible;
    if (shouldShow) {
      closeMenu();
      keymapModal.classList.remove('hidden');
    } else {
      keymapModal.classList.add('hidden');
    }
  };

  menuKeymapBtn.addEventListener('click', () => toggleKeymap(true));
  if (keymapCloseBtn) keymapCloseBtn.addEventListener('click', () => toggleKeymap(false));
  if (keymapOkBtn) keymapOkBtn.addEventListener('click', () => toggleKeymap(false));

  // ===================================================
  // 🎯 TARGETING & SOUND ACTIONS
  // ===================================================
  const toggleAim = () => {
    const active = game.toggleAutoAim();
    const t = translations[currentLang];
    menuIaimBtn.textContent = active ? t.iAimOn : t.iAimOff;
  };

  menuIaimBtn.addEventListener('click', toggleAim);

  const cycleTarget = () => {
    game.cycleTarget();
    updateUI();
  };

  menuCycleTargetBtn.addEventListener('click', cycleTarget);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    const t = translations[currentLang];
    menuSoundBtn.textContent = sound.enabled ? t.menuSoundOn : t.menuSoundOff;
  };

  menuSoundBtn.addEventListener('click', toggleSound);

  // Trigger Fun Apple Keynote Loot Rain Overlay
  const triggerAppleKeynoteLootShower = () => {
    if (!lootShowerContainer) return;

    const items = [
      { icon: '🎧', label: 'AirPods Pro Case', price: '$249' },
      { icon: '📱', label: 'iPhone 16 Pro (Titanium)', price: '$1,199' },
      { icon: '🧣', label: 'Apple Polishing Cloth', price: '$19' },
      { icon: '💵', label: '$19.00 USD', price: '' },
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

  // ===================================================
  // 🔄 MAIN UI UPDATE LOOP
  // ===================================================
  const updateUI = () => {
    const t = translations[currentLang];
    const stats = game.paper.getStats(currentLang);

    // Meta Title and Header
    if (metaPageTitle) metaPageTitle.textContent = t.metaTitle;
    logoTitle.textContent = t.gameTitle;
    logoBadge.textContent = t.gameSubtitle;

    // Header Scoreboard
    labelScore.textContent = t.score;
    labelBirdsHit.textContent = t.birdsHit;
    labelCombo.textContent = t.combo;
    scoreVal.textContent = game.state.score.toLocaleString();
    birdsHitVal.textContent = game.state.birdsHitCount.toString();
    comboVal.textContent = `x${game.state.currentCombo}`;

    // Intro Screen Translations
    introTitle.textContent = t.gameTitle;
    introSubtitle.textContent = t.introSubtitle;
    introLangLabel.textContent = currentLang === 'de' ? 'Sprache: 🇩🇪 Deutsch' : 'Language: 🇬🇧 English';
    introStartBtn.textContent = t.introStartBtn;
    introPressEnter.textContent = t.introPressEnter;
    introHintF.innerHTML = t.introHintF;
    introHintSpace.innerHTML = t.introHintSpace;
    introHintT.innerHTML = t.introHintT;
    introHintArrows.innerHTML = t.introHintArrows;

    // Hamburger Menu Translations & State
    menuTitle.textContent = t.menuTitle;
    menuLangLabel.textContent = t.menuLangLabel;
    langBtnDe.classList.toggle('active', currentLang === 'de');
    langBtnEn.classList.toggle('active', currentLang === 'en');
    menuPediaLabel.textContent = t.menuFaltpediaBtn;
    menuAimLabel.textContent = t.menuAimLabel;
    menuIaimBtn.textContent = game.autoAim ? t.iAimOn : t.iAimOff;
    menuCycleTargetBtn.textContent = game.targetedBird ? `🎯 ${game.targetedBird.title} [T]` : t.menuCycleTargetBtn;
    menuSoundBtn.textContent = sound.enabled ? t.menuSoundOn : t.menuSoundOff;
    menuKeymapBtn.textContent = t.menuKeymapBtn;
    menuReplayIntroBtn.textContent = t.menuReplayIntroBtn;
    menuSkyLabel.textContent = t.menuSkyStatusLabel;

    // Sky Status inside Menu
    const livingBirds = game.birdManager.birds.filter((b: BirdData) => b.alive);
    const geese = livingBirds.filter((b: BirdData) => b.type === 'goose').length;
    const pigeons = livingBirds.filter((b: BirdData) => b.type === 'pigeon').length;
    const seagulls = livingBirds.filter((b: BirdData) => b.type === 'seagull').length;
    const drones = livingBirds.filter((b: BirdData) => b.type === 'drone').length;
    const airliners = livingBirds.filter((b: BirdData) => b.type === 'airplane').length;
    const satellites = livingBirds.filter((b: BirdData) => b.type === 'satellite').length;

    if (currentLang === 'en') {
      menuSkyText.textContent = `${geese} Cranes, ${pigeons} Pigeons, ${seagulls} Seagulls${drones > 0 ? ', 1 Stealth Dart' : ''}${airliners > 0 ? `, ✈️ ${airliners} Airliner` : ''}${satellites > 0 ? `, 🛰️ ${satellites} Tim Cook Satellite` : ''}`;
    } else {
      menuSkyText.textContent = `${geese} Kraniche, ${pigeons} Tauben, ${seagulls} Möwen${drones > 0 ? ', 1 Stealth Dart' : ''}${airliners > 0 ? `, ✈️ ${airliners} Airliner` : ''}${satellites > 0 ? `, 🛰️ ${satellites} Tim Cook Satellit` : ''}`;
    }

    // UPDATE LARGE FOLD TOWER (Left HUD)
    towerTag.textContent = t.foldTowerTag;
    towerUnit.textContent = t.foldsUnit;
    if (openPediaPillText) openPediaPillText.textContent = t.openFaltpediaPill;

    const formattedThickness = stats.thicknessMm >= 1000 
      ? (stats.thicknessMm / 1000).toFixed(2) + ' m'
      : (stats.thicknessMm >= 10 ? (stats.thicknessMm / 10).toFixed(1) + ' cm' : stats.thicknessMm.toFixed(1) + ' mm');

    if (towerFoldsVal) {
      towerFoldsVal.textContent = stats.folds.toString();
      if (stats.folds > lastFoldsCount && lastFoldsCount !== -1) {
        towerFoldsVal.classList.add('pulse');
        setTimeout(() => towerFoldsVal?.classList.remove('pulse'), 250);
      }
      lastFoldsCount = stats.folds;
    }
    if (towerLayersVal) {
      towerLayersVal.textContent = t.layerPill(stats.layers);
    }
    if (towerThicknessVal) {
      towerThicknessVal.textContent = formattedThickness;
    }

    // Tier segment names and descriptions in Fold Tower
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

    // Sliders
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

    // Action Buttons State
    if (game.phase === 'flying') {
      foldBtn.setAttribute('disabled', 'true');
      actionBtn.setAttribute('disabled', 'true');
      foldMainText.textContent = t.btnFoldMain;
      foldSubtext.textContent = t.btnFoldFlyingSub;
      actionMainText.textContent = t.btnFlyingMain;
      actionSubtext.textContent = t.btnFlyingSub;
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

    // Intro Screen starts on Enter or Space
    if (introActive) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        startGame();
        return;
      }
    }

    if (e.code === 'KeyM') {
      e.preventDefault();
      toggleMenu();
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
      closeMenu();
      toggleKeymap(false);
      toggleFaltPedia(false);
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
