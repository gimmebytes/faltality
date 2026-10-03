import './style.css';
import { FaltalityGame } from './game';
import type { BirdData } from './models/birds';
import { translations, detectLanguage, safeLocalStorage } from './i18n';
import type { SupportedLang } from './i18n';
import { sound } from './sound';
import { CAMPAIGN_LEVELS, CampaignProgressManager, isLocalEnvironment } from './levels';
import type { CampaignLevel } from './levels';

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
  let game: FaltalityGame;
  try {
    game = new FaltalityGame(container);
    (window as any).__faltality_game = game;
    // Exposed for E2E tests (campaign unlock coverage).
    (window as any).__faltality_progress = CampaignProgressManager;
  } catch (err) {
    console.error('Failed to initialize Three.js / WebGL:', err);
    const errorBanner = document.createElement('div');
    errorBanner.className = 'webgl-error-banner';
    errorBanner.innerHTML = `
      <div style="background: rgba(231, 76, 60, 0.95); color: white; padding: 22px 28px; border-radius: 12px; max-width: 520px; text-align: center; margin: 30px auto; border: 2px solid #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.5); font-family: system-ui, -apple-system, sans-serif;">
        <h2 style="margin-top: 0; font-size: 1.35rem; letter-spacing: 0.04em;">⚠️ 3D / WebGL nicht verfügbar</h2>
        <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 0;">Das Spiel benötigt WebGL-Hardwarebeschleunigung. Bitte aktiviere in den Browser-Einstellungen (z.&nbsp;B. Vivaldi &rarr; Einstellungen &rarr; System &rarr; „Hardwarebeschleunigung verwenden“) die Beschleunigung und lade die Seite neu.</p>
      </div>
    `;
    const introCard = document.querySelector('.intro-content') || document.body;
    introCard.prepend(errorBanner);
    return;
  }

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
  const menuCycleTargetBtn = document.getElementById('menu-cycle-target-btn')!;
  const menuSkyLabel = document.getElementById('menu-sky-label')!;
  const menuSkyText = document.getElementById('menu-sky-text')!;
  const menuSoundBtn = document.getElementById('menu-sound-btn')!;
  const menuKeymapBtn = document.getElementById('menu-keymap-btn')!;
  const menuReplayIntroBtn = document.getElementById('menu-replay-intro-btn')!;

  // 📱 Boss HUD Elements
  const bossHud = document.getElementById('boss-hud')!;
  const bossName = document.getElementById('boss-name')!;
  const bossPhaseBadge = document.getElementById('boss-phase-badge')!;
  const bossHpFill = document.getElementById('boss-hp-fill')!;

  // Retro 80s/90s Intro Screen
  const introScreen = document.getElementById('intro-screen')!;
  const introTitle = document.getElementById('intro-title')!;
  const introSubtitle = document.getElementById('intro-subtitle')!;
  const introLangBtn = document.getElementById('intro-lang-btn');
  const introLangLabel = document.getElementById('intro-lang-label');
  const introStartBtn = document.getElementById('intro-start-btn')!;
  const introPressEnter = document.getElementById('intro-press-enter')!;
  const introHintF = document.getElementById('intro-hint-f')!;
  const introHintSpace = document.getElementById('intro-hint-space')!;
  const introHintT = document.getElementById('intro-hint-t')!;
  const introHintArrows = document.getElementById('intro-hint-arrows')!;
  const introControlsTitle = document.getElementById('intro-controls-title');

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

  // Bottom Dashboard & Controls (Cupertino Minimal Pill Action Bar)
  const foldBtn = document.getElementById('fold-btn')!;
  const foldMainText = document.getElementById('fold-main-text')!;
  const foldKbd = document.getElementById('fold-kbd');
  const actionBtn = document.getElementById('action-btn')!;
  const actionBtnIcon = document.getElementById('action-btn-icon')!;
  const actionMainText = document.getElementById('action-main-text')!;
  const actionKbd = document.getElementById('action-kbd');
  const newSheetBtn = document.getElementById('new-sheet-btn')!;
  const newSheetText = document.getElementById('new-sheet-text')!;
  const camResetBtn = document.getElementById('cam-reset-btn');
  const camResetText = document.getElementById('cam-reset-text');
  const keymapDescC = document.getElementById('keymap-desc-c');
  const materialBtn = document.getElementById('material-btn');
  const materialIcon = document.getElementById('material-icon');
  const materialText = document.getElementById('material-text');
  const keymapDescU = document.getElementById('keymap-desc-u');

  // Active Crease HUD
  const activeCreaseHud = document.getElementById('active-crease-hud')!;
  const creaseTitle = document.getElementById('crease-title')!;
  const creaseHint = document.getElementById('crease-hint')!;
  const creaseSweetspot = document.getElementById('crease-sweetspot')!;
  const creaseNeedle = document.getElementById('crease-needle')!;
  const creaseRating = document.getElementById('crease-rating')!;

  // Origami Archetype Card in Fold Tower
  const archetypeBadge = document.getElementById('archetype-badge');
  const archetypeIcon = document.getElementById('archetype-icon');
  const archetypeBadgeLabel = document.getElementById('archetype-badge-label');
  const archetypeTitle = document.getElementById('archetype-title');
  const statGlideLabel = document.getElementById('stat-glide-label');
  const statGlideVal = document.getElementById('stat-glide-val');
  const statSpeedLabel = document.getElementById('stat-speed-label');
  const statSpeedVal = document.getElementById('stat-speed-val');
  const statImpactLabel = document.getElementById('stat-impact-label');
  const statImpactVal = document.getElementById('stat-impact-val');

  // Aiming Sliders & Slingshot
  const aimSliders = document.getElementById('aim-sliders')!;
  const pitchSlider = document.getElementById('pitch-slider') as HTMLInputElement;
  const pitchVal = document.getElementById('pitch-val')!;
  const powerSlider = document.getElementById('power-slider') as HTMLInputElement;
  const powerVal = document.getElementById('power-val')!;
  const labelPitch = document.getElementById('label-pitch')!;
  const labelPower = document.getElementById('label-power')!;
  const slingshotDragIndicator = document.getElementById('slingshot-drag-indicator');
  const slingTensionFill = document.getElementById('sling-tension-fill');
  const slingPowerVal = document.getElementById('sling-power-val');
  const slingInstructionHint = document.getElementById('sling-instruction-hint');
  const slingDragTipText = document.getElementById('sling-drag-tip-text');

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
  const keymapDescM = document.getElementById('keymap-desc-m');
  const keymapDescB = document.getElementById('keymap-desc-b');
  const keymapDescK = document.getElementById('keymap-desc-k');
  const keymapDescR = document.getElementById('keymap-desc-r');
  const keymapDescEsc = document.getElementById('keymap-desc-esc');

  // Banners & Loot
  const faltalityBanner = document.getElementById('faltality-banner')!;
  const faltalityTitle = document.getElementById('faltality-title')!;
  const faltalitySubtitle = document.getElementById('faltality-subtitle')!;
  const faltalityPoints = document.getElementById('faltality-points')!;
  const lootShowerContainer = document.getElementById('loot-shower-container');

  // Mode Indicator Pill (Top Header)
  const modeIndicatorBtn = document.getElementById('mode-indicator-btn');
  const modePillText = document.getElementById('mode-pill-text');
  const activityRingWrap = document.getElementById('activity-ring-wrap');
  const activityRingFill = document.getElementById('activity-ring-fill');
  const activityRingIcon = document.getElementById('activity-ring-icon');
  const activityRingPercent = document.getElementById('activity-ring-percent');
  const campaignRingWrap = document.getElementById('campaign-ring-wrap');
  const campaignRingFill = document.getElementById('campaign-ring-fill');
  const campaignRingIcon = document.getElementById('campaign-ring-icon');
  let lastReportedProgress: number = -1;

  // Drawer Menu Level Select button
  const drawerLevelSelectBtn = document.getElementById('drawer-level-select-btn');
  const menuLevelSelectLabel = document.getElementById('menu-level-select-label');

  // Campaign Objective HUD (Bottom Dashboard)
  const campaignHud = document.getElementById('campaign-hud')!;
  const campaignMissionName = document.getElementById('campaign-mission-name')!;
  const campaignMissionObjective = document.getElementById('campaign-mission-objective')!;
  const campaignAmmoIcons = document.getElementById('campaign-ammo-icons')!;
  const campaignStarsHint = document.getElementById('campaign-stars-hint');
  const campaignBonusTargetsHint = document.getElementById('campaign-bonus-targets-hint');

  // Level Select Modal
  const levelSelectModal = document.getElementById('level-select-modal')!;
  const levelSelectTitle = document.getElementById('level-select-title')!;
  const levelSelectSubtitle = document.getElementById('level-select-subtitle')!;
  const levelSelectCloseBtn = document.getElementById('level-select-close-btn')!;
  const levelCardsGrid = document.getElementById('level-cards-grid')!;
  const unlockAllCheatBtn = document.getElementById('unlock-all-cheat-btn');
  const resetCampaignProgressBtn = document.getElementById('reset-campaign-progress-btn');

  // Level Result Modal
  const levelResultModal = document.getElementById('level-result-modal')!;
  const resultIconBadge = document.getElementById('result-icon-badge')!;
  const resultTitle = document.getElementById('result-title')!;
  const resultSubtitle = document.getElementById('result-subtitle')!;
  const resultStar1 = document.getElementById('result-star-1')!;
  const resultStar2 = document.getElementById('result-star-2')!;
  const resultStar3 = document.getElementById('result-star-3')!;
  const resultScoreVal = document.getElementById('result-score-val')!;
  const resultSheetsVal = document.getElementById('result-sheets-val')!;
  const resultPerfectVal = document.getElementById('result-perfect-val')!;
  const resultNextBtn = document.getElementById('result-next-btn')!;
  const resultRetryBtn = document.getElementById('result-retry-btn')!;
  const resultSelectBtn = document.getElementById('result-select-btn')!;

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
    // Hide the in-game title bar (#logo-title + #logo-badge) during play; they stay
    // on the intro screen. CSS keys off body.in-game (design.md Req 5).
    document.body.classList.add('in-game');
  };

  const replayIntro = () => {
    introActive = true;
    introScreen.classList.remove('hidden');
    document.body.classList.remove('in-game');
    closeMenu();
  };

  introStartBtn.addEventListener('click', startGame);

  // ===================================================
  // 🌐 LANGUAGE MANAGEMENT (DE / EN)
  // ===================================================
  const setLanguage = (lang: SupportedLang) => {
    currentLang = lang;
    safeLocalStorage.setItem('faltality_lang', lang);
    updateUI();
  };

  if (introLangBtn) {
    introLangBtn.addEventListener('click', () => {
      setLanguage(currentLang === 'de' ? 'en' : 'de');
    });
  }

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
  const cycleTarget = (direction: number = 1) => {
    if (game.phase === 'folding') {
      game.enterAimingMode();
    }
    game.cycleTarget(direction);
    updateUI();
  };

  menuCycleTargetBtn.addEventListener('click', () => cycleTarget(1));

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
      { icon: '📱', label: 'iPhone Duo (Foldable)', price: '$1,999' },
      { icon: '🎧', label: 'AirPods Pro Case', price: '$249' },
      { icon: '📱', label: 'iPhone 16 Pro (Titanium)', price: '$1,199' },
      { icon: '🧣', label: 'Apple Polishing Cloth', price: '$19' },
      { icon: '🍎', label: 'Trade-In Voucher', price: '$800' },
      { icon: '💵', label: '$19.00 USD', price: '' },
      { icon: '🍎', label: 'One More Thing', price: 'Priceless' }
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
  // 🎯 CAMPAIGN LEVEL SELECT & LEVEL RESULT MODALS
  // ===================================================
  const renderLevelCards = () => {
    const t = translations[currentLang];
    levelCardsGrid.innerHTML = '';

    const progress = CampaignProgressManager.loadProgress();
    const isLocal = isLocalEnvironment();

    CAMPAIGN_LEVELS.forEach((lvl) => {
      const p = progress[lvl.id] || { stars: 0, highscore: 0, unlocked: lvl.id === 1 };
      const isWip = Boolean(lvl.isWip);
      const isWipLocked = isWip && !isLocal;
      const isPlayable = (p.unlocked || (isWip && isLocal)) && !isWipLocked;
      const card = document.createElement('div');
      card.className = `level-card ${isPlayable ? '' : 'locked'} ${game.currentLevel?.id === lvl.id ? 'active-level' : ''} ${isWip ? 'wip-level' : ''}`;

      const icon = lvl.id === 1 ? '🕊️' : (lvl.id === 2 ? '🦢' : (lvl.id === 3 ? '💥' : (lvl.id === 4 ? '✈️' : '📱')));
      const title = (t as any)[lvl.titleKey] || `Level ${lvl.id}`;
      const objective = (t as any)[lvl.objectiveKey] || '';
      const starsStr = '★'.repeat(p.stars) + '☆'.repeat(3 - p.stars);

      let badgeStr = '';
      if (isWip) {
        badgeStr = isLocal ? '🚧 WIP (Lokal)' : (currentLang === 'de' ? '🚧 In Arbeit' : '🚧 Coming Soon');
      } else if (isPlayable) {
        badgeStr = starsStr;
      } else {
        badgeStr = '🔒';
      }

      let statusDesc = '';
      if (isWipLocked) {
        statusDesc = currentLang === 'de' ? 'Level 2 befindet sich im Bau! Demnächst verfügbar.' : 'Level 2 is under construction! Coming soon.';
      } else if (isPlayable) {
        statusDesc = objective + (isWip ? (currentLang === 'de' ? ' (WIP - Testversion)' : ' (WIP - Preview)') : '');
      } else {
        statusDesc = currentLang === 'de' ? 'Gesperrt – Schließe vorherige Level ab!' : 'Locked – Complete previous levels!';
      }

      let btnLabel = '';
      if (isPlayable) {
        btnLabel = isWip ? (currentLang === 'de' ? 'WIP Testen ▶' : 'Test WIP ▶') : (currentLang === 'de' ? 'Starten ▶' : 'Play ▶');
      } else {
        btnLabel = isWipLocked ? 'WIP' : '🔒';
      }

      card.innerHTML = `
        <div class="level-card-header">
          <span class="level-icon">${isPlayable ? icon : (isWipLocked ? '🚧' : '🔒')}</span>
          <span class="level-stars">${badgeStr}</span>
        </div>
        <div class="level-card-title">${title}</div>
        <div class="level-card-desc">${statusDesc}</div>
        <div class="level-card-footer">
          <span class="level-highscore">${p.highscore > 0 ? t.highScorePill(p.highscore) : ''}</span>
          <button class="level-play-btn">${btnLabel}</button>
        </div>
      `;

      if (isPlayable) {
        card.addEventListener('click', () => {
          game.startCampaignLevel(lvl.id);
          closeLevelSelect();
          updateUI();
        });
      }

      levelCardsGrid.appendChild(card);
    });
  };

  const openLevelSelect = () => {
    closeMenu();
    renderLevelCards();
    levelSelectTitle.textContent = translations[currentLang].levelSelectTitle;
    levelSelectSubtitle.textContent = translations[currentLang].levelSelectSubtitle;
    if (unlockAllCheatBtn) unlockAllCheatBtn.textContent = translations[currentLang].levelUnlockAllBtn;
    if (resetCampaignProgressBtn) resetCampaignProgressBtn.textContent = translations[currentLang].levelResetProgressBtn;
    levelSelectModal.classList.remove('hidden');
  };

  const closeLevelSelect = () => {
    levelSelectModal.classList.add('hidden');
  };

  const openLevelResult = (
    level: CampaignLevel,
    stars: number,
    score: number,
    isVictory: boolean,
    _newlyUnlocked?: number
  ) => {
    const t = translations[currentLang];
    levelResultModal.classList.remove('hidden');

    resultIconBadge.textContent = isVictory ? '🏆' : '❌';
    resultTitle.textContent = isVictory ? t.levelResultVictory : t.levelResultFailed;
    resultSubtitle.textContent = isVictory
      ? t.starEarnedTitle(stars)
      : t.levelResultFailedReason;

    // Reset and trigger animated stars
    [resultStar1, resultStar2, resultStar3].forEach((el, idx) => {
      el.classList.remove('earned');
      if (isVictory && idx < stars) {
        setTimeout(() => {
          el.classList.add('earned');
          sound.playStarEarned(idx);
        }, (idx + 1) * 250);
      }
    });

    resultScoreVal.textContent = `+${score.toLocaleString()} Pkt.`;
    resultSheetsVal.textContent = `${level.maxSheets - game.levelSheetsRemaining} von ${level.maxSheets}`;
    resultPerfectVal.textContent = `★ ${game.paper.perfectCreaseCount}x`;

    resultNextBtn.textContent = t.btnNextLevel;
    resultRetryBtn.textContent = t.btnRetryLevel;
    resultSelectBtn.textContent = t.btnReturnToSelect;

    // Show/hide next level button
    const hasNextLevel = isVictory && Boolean(CAMPAIGN_LEVELS.find(l => l.id === level.id + 1));
    resultNextBtn.style.display = hasNextLevel ? 'block' : 'none';
  };

  const closeLevelResult = () => {
    levelResultModal.classList.add('hidden');
  };

  modeIndicatorBtn?.addEventListener('click', () => {
    openLevelSelect();
  });

  drawerLevelSelectBtn?.addEventListener('click', () => {
    openLevelSelect();
  });

  levelSelectCloseBtn.addEventListener('click', closeLevelSelect);

  unlockAllCheatBtn?.addEventListener('click', () => {
    CampaignProgressManager.unlockAll();
    game.level2Unlocked = true;
    renderLevelCards();
    updateUI();
  });

  resetCampaignProgressBtn?.addEventListener('click', () => {
    CampaignProgressManager.resetProgress();
    renderLevelCards();
    updateUI();
  });

  resultNextBtn.addEventListener('click', () => {
    closeLevelResult();
    game.nextLevel();
    updateUI();
  });

  resultRetryBtn.addEventListener('click', () => {
    closeLevelResult();
    game.retryCurrentLevel();
    updateUI();
  });

  resultSelectBtn.addEventListener('click', () => {
    closeLevelResult();
    openLevelSelect();
  });

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
    if (introLangLabel) {
      introLangLabel.textContent = currentLang === 'de' ? 'Sprache: 🇩🇪 Deutsch' : 'Language: 🇬🇧 English';
    }
    introStartBtn.textContent = t.introStartBtn;
    introPressEnter.textContent = t.introPressEnter;
    introHintF.innerHTML = t.introHintF;
    introHintSpace.innerHTML = t.introHintSpace;
    introHintT.innerHTML = t.introHintT;
    introHintArrows.innerHTML = t.introHintArrows;
    if (introControlsTitle) introControlsTitle.textContent = t.introControlsTitle;

    // Hamburger Menu Translations & State
    menuTitle.textContent = t.menuTitle;
    menuLangLabel.textContent = t.menuLangLabel;
    langBtnDe.classList.toggle('active', currentLang === 'de');
    langBtnEn.classList.toggle('active', currentLang === 'en');
    menuPediaLabel.textContent = t.menuFaltpediaBtn;
    menuAimLabel.textContent = t.menuAimLabel;
    const currentTargetName = game.getTargetName();
    menuCycleTargetBtn.textContent = currentTargetName ? `🎯 ${currentTargetName} [T]` : t.menuCycleTargetBtn;
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
    const bosses = livingBirds.filter((b: BirdData) => b.type === 'iphone_duo').length;

    if (currentLang === 'en') {
      menuSkyText.textContent = `${geese} Cranes, ${pigeons} Pigeons, ${seagulls} Seagulls${drones > 0 ? ', 1 Stealth Dart' : ''}${airliners > 0 ? `, ✈️ ${airliners} Airliner` : ''}${satellites > 0 ? `, 🛰️ ${satellites} Tim Cook Satellite` : ''}${bosses > 0 ? ', 📱 1 iPhone Duo' : ''}`;
    } else {
      menuSkyText.textContent = `${geese} Kraniche, ${pigeons} Tauben, ${seagulls} Möwen${drones > 0 ? ', 1 Stealth Dart' : ''}${airliners > 0 ? `, ✈️ ${airliners} Airliner` : ''}${satellites > 0 ? `, 🛰️ ${satellites} Tim Cook Satellit` : ''}${bosses > 0 ? ', 📱 1 iPhone Duo' : ''}`;
    }

    // Update Boss HUD if active
    const activeBoss = livingBirds.find((b: BirdData) => b.type === 'iphone_duo');
    if (activeBoss) {
      bossHud.classList.remove('hidden');
      bossName.textContent = t.bossName;
      if (activeBoss.health === 1) {
        bossPhaseBadge.textContent = t.bossPhaseOpen;
        bossPhaseBadge.style.color = '#ff375f';
      } else if (activeBoss.health === 2) {
        bossPhaseBadge.textContent = t.bossPhaseUnfolding;
        bossPhaseBadge.style.color = '#ffd60a';
      } else {
        bossPhaseBadge.textContent = t.bossPhaseClosed;
        bossPhaseBadge.style.color = '#ff9500';
      }
      const curHp = activeBoss.health ?? 3;
      const maxHp = activeBoss.maxHealth ?? 3;
      const pct = Math.max(0, Math.round((curHp / maxHp) * 100));
      bossHpFill.style.width = `${pct}%`;
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

    // Origami Flight Archetype Card in Fold Tower
    if (archetypeBadge) {
      archetypeBadge.className = `archetype-badge archetype-${stats.archetype}`;
      if (archetypeIcon) archetypeIcon.textContent = stats.archetypeIcon;
      if (archetypeBadgeLabel) archetypeBadgeLabel.textContent = t.archetypeBadgeLabel;

      let localizedArchetypeName = stats.archetypeName;
      if (stats.archetype === 'glider') localizedArchetypeName = t.archetypeGlider;
      else if (stats.archetype === 'dart') localizedArchetypeName = t.archetypeDart;
      else if (stats.archetype === 'comet') localizedArchetypeName = t.archetypeComet;
      else if (stats.archetype === 'sheet') localizedArchetypeName = t.archetypeSheet;

      const formatStars = (rating: number) => {
        const stars = Math.min(3, Math.max(1, Math.round((rating / 5) * 3)));
        return '★'.repeat(stars) + '☆'.repeat(3 - stars);
      };

      if (archetypeTitle) archetypeTitle.textContent = localizedArchetypeName;
      if (statGlideLabel) statGlideLabel.textContent = t.statGlide;
      if (statGlideVal) statGlideVal.textContent = formatStars(stats.liftRating);
      if (statSpeedLabel) statSpeedLabel.textContent = t.statSpeed;
      if (statSpeedVal) statSpeedVal.textContent = formatStars(stats.speedRating);
      if (statImpactLabel) statImpactLabel.textContent = t.statImpact;
      if (statImpactVal) statImpactVal.textContent = formatStars(stats.impactRating);
    }

    // Active Crease HUD static localized labels
    if (creaseTitle) creaseTitle.textContent = t.creaseTitle;
    if (creaseHint) creaseHint.textContent = t.creaseHint;

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

    // Sliders & Slingshot tip
    labelPitch.textContent = t.pitchLabel;
    labelPower.textContent = t.powerLabel;
    if (slingDragTipText) slingDragTipText.textContent = t.slingDragTip;
    if (slingInstructionHint) slingInstructionHint.textContent = t.slingDragRelease;
    newSheetText.textContent = game.gameMode === 'campaign' ? t.btnRetryLevel : t.btnReset;
    if (camResetText) camResetText.textContent = t.btnFocusPaper;
    if (camResetBtn) camResetBtn.title = t.btnFocusPaperTitle;
    if (keymapDescC) keymapDescC.innerHTML = t.keymapC;

    // Mode indicator in Top Header
    // Update Apple Activity Ring for Level Objective
    if (game.currentLevel) {
      const lvl = game.currentLevel;
      let cur = game.levelTargetsHit;
      let req = lvl.requiredTargetCount;

      if (lvl.targetAction === 'defeat_boss') {
        const activeBoss = game.birdManager.birds.find((b: BirdData) => b.type === 'iphone_duo');
        const hp = activeBoss ? (activeBoss.health ?? 3) : 3;
        cur = Math.max(0, 3 - hp);
        req = 3;
      }

      const progress = Math.min(1.0, req > 0 ? cur / req : 0);
      const percent = Math.round(progress * 100);

      // Determine target emoji icon
      let targetIcon = '🎯';
      if (lvl.id === 1) targetIcon = '🕊️';
      else if (lvl.id === 2) targetIcon = '🦤';
      else if (lvl.id === 3) targetIcon = '🚗';
      else if (lvl.id === 4) targetIcon = '✈️';
      else if (lvl.id === 5) targetIcon = '📱';

      if (activityRingIcon) activityRingIcon.textContent = targetIcon;
      if (campaignRingIcon) campaignRingIcon.textContent = targetIcon;

      // Update ring progress arcs
      // Header ring: r=13 -> circumference = 81.68
      if (activityRingFill) {
        const offset1 = Math.max(0, 81.68 - (81.68 * progress));
        activityRingFill.style.strokeDashoffset = `${offset1}px`;
        activityRingFill.style.stroke = progress >= 1.0 ? '#30d158' : (progress >= 0.5 ? '#ff2d55' : '#ff9500');
      }

      // Campaign HUD ring: r=15 -> circumference = 94.25
      if (campaignRingFill) {
        const offset2 = Math.max(0, 94.25 - (94.25 * progress));
        campaignRingFill.style.strokeDashoffset = `${offset2}px`;
        campaignRingFill.style.stroke = progress >= 1.0 ? '#30d158' : (progress >= 0.5 ? '#ff2d55' : '#ff9500');
      }

      if (activityRingPercent) {
        activityRingPercent.textContent = `${percent}%`;
        activityRingPercent.style.color = progress >= 1.0 ? '#30d158' : (progress >= 0.5 ? '#ff2d55' : '#ff5e3a');
      }

      if (activityRingWrap) {
        if (progress >= 1.0) {
          activityRingWrap.classList.add('ring-complete');
        } else {
          activityRingWrap.classList.remove('ring-complete');
        }
      }

      if (campaignRingWrap) {
        if (progress >= 1.0) {
          campaignRingWrap.classList.add('ring-complete');
        } else {
          campaignRingWrap.classList.remove('ring-complete');
        }
      }

      // Pulse animation when progress increases
      if (lastReportedProgress !== -1 && progress > lastReportedProgress) {
        activityRingWrap?.classList.remove('ring-pulse');
        campaignRingWrap?.classList.remove('ring-pulse');
        void activityRingWrap?.offsetWidth;
        activityRingWrap?.classList.add('ring-pulse');
        campaignRingWrap?.classList.add('ring-pulse');
      }
      lastReportedProgress = progress;

      // Update Mode Pill Header Text — kept slim as a level-select affordance only
      // ("Level N"); the full title + objective live in the bottom-right mission panel,
      // which is the single in-play level readout (design.md Req 5).
      if (modeIndicatorBtn && modePillText) {
        modePillText.textContent = `Level ${lvl.id}`;
        modeIndicatorBtn.classList.add('campaign-active');
      }
    }

    if (menuLevelSelectLabel) {
      menuLevelSelectLabel.textContent = t.btnLevelSelect;
    }

    // Campaign Mission & Ammo HUD (in actions-panel)
    if (campaignHud) {
      if (game.gameMode === 'campaign' && game.currentLevel) {
        campaignHud.classList.remove('hidden');
        if (campaignMissionName) {
          campaignMissionName.textContent = (t as any)[game.currentLevel.titleKey] || `Level ${game.currentLevel.id}`;
        }
        if (campaignMissionObjective) {
          if (game.currentLevel.targetAction === 'defeat_boss') {
            const activeBoss = game.birdManager.birds.find((b: BirdData) => b.type === 'iphone_duo');
            const hp = activeBoss?.health ?? 3;
            campaignMissionObjective.textContent = currentLang === 'de'
              ? `Boss: ${3 - hp}/3 kritische Treffer`
              : `Boss: ${3 - hp}/3 critical hits`;
          } else {
            campaignMissionObjective.textContent = t.levelObjectivePill(game.levelTargetsHit, game.currentLevel.requiredTargetCount);
          }
        }
        if (campaignAmmoIcons) {
          const rem = Math.max(0, game.levelSheetsRemaining);
          const used = Math.min(game.currentLevel.maxSheets, game.levelSheetsUsed);
          campaignAmmoIcons.textContent = '📄'.repeat(rem) + (rem === 0 && used > 0 ? '❌' : '');
          campaignAmmoIcons.title = t.levelSheetsAmmoLabel(rem, game.currentLevel.maxSheets);
        }
        if (campaignStarsHint && game.currentLevel.stars) {
          const s2 = ((t as any)[game.currentLevel.stars.star2DescKey] || '').replace(/^★\s*/, '');
          const s3 = ((t as any)[game.currentLevel.stars.star3DescKey] || '').replace(/^★\s*/, '');
          campaignStarsHint.textContent = `${t.levelStarsBonusPrefix} ${s2} · ${s3}`;
        }
        if (campaignBonusTargetsHint) {
          if (game.currentLevel.id === 1) {
            campaignBonusTargetsHint.textContent = t.levelSpecialTargetsBonus;
            campaignBonusTargetsHint.style.display = 'block';
          } else {
            campaignBonusTargetsHint.style.display = 'none';
          }
        }
      } else {
        campaignHud.classList.add('hidden');
      }
    }

    // Material state (Locked until score threshold)
    const foilUnlocked = game.isFoilUnlocked();
    if (!foilUnlocked) {
      materialBtn?.classList.remove("foil-active");
      materialBtn?.classList.add("foil-locked");
      if (materialIcon) materialIcon.textContent = "🔒";
      if (materialText) materialText.textContent = t.btnMaterialLocked;
      const ptsRemaining = Math.max(0, FaltalityGame.FOIL_UNLOCK_SCORE - game.state.score);
      if (materialBtn) materialBtn.title = t.btnMaterialLockedTitle(ptsRemaining);
    } else {
      materialBtn?.classList.remove("foil-locked");
      if (game.paper.materialType === "foil") {
        materialBtn?.classList.add("foil-active");
        if (materialIcon) materialIcon.textContent = "🌯";
        if (materialText) materialText.textContent = t.btnMaterialFoil;
        towerTag.textContent = t.foilActiveTag;
      } else {
        materialBtn?.classList.remove("foil-active");
        if (materialIcon) materialIcon.textContent = "📄";
        if (materialText) materialText.textContent = t.btnMaterialPaper;
        towerTag.textContent = t.paperActiveTag;
      }
      if (materialBtn) materialBtn.title = t.btnMaterialTitle;
    }
    if (keymapDescU) keymapDescU.innerHTML = t.keymapU;

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
    if (keymapDescM) keymapDescM.innerHTML = t.keymapM;
    if (keymapDescK) keymapDescK.innerHTML = t.keymapK;
    if (keymapDescC) keymapDescC.innerHTML = t.keymapC;
    if (keymapDescU) keymapDescU.innerHTML = t.keymapU;
    if (keymapDescB) keymapDescB.innerHTML = t.keymapB;
    if (keymapDescR) keymapDescR.innerHTML = t.keymapR;
    if (keymapDescEsc) keymapDescEsc.innerHTML = t.keymapEsc;
    if (keymapOkBtn) keymapOkBtn.textContent = t.keymapOk;

    // Action Buttons State (Minimal Cupertino Action Bar)
    if (game.phase === 'flying') {
      foldBtn.removeAttribute('disabled');
      actionBtn.removeAttribute('disabled');
      actionBtn.classList.add('aiming-mode');

      foldMainText.textContent = currentLang === 'de' ? 'Tisch' : 'Table';
      if (foldKbd) foldKbd.textContent = 'Esc';

      actionBtnIcon.textContent = '⏩';
      actionMainText.textContent = currentLang === 'de' ? 'Überspringen' : 'Skip';
      if (actionKbd) {
        actionKbd.classList.remove('hidden');
        actionKbd.textContent = currentLang === 'de' ? 'Leertaste' : 'Space';
      }
      aimSliders.classList.add('hidden');
    } else if (game.phase === 'aiming') {
      foldBtn.removeAttribute('disabled');
      actionBtn.removeAttribute('disabled');
      actionBtn.classList.add('aiming-mode');

      foldMainText.textContent = t.btnTable;
      if (foldKbd) foldKbd.textContent = 'Esc';

      actionBtnIcon.textContent = '🚀';
      actionMainText.textContent = t.btnLaunchMain;
      if (actionKbd) {
        actionKbd.classList.remove('hidden');
        actionKbd.textContent = currentLang === 'de' ? 'Leertaste' : 'Space';
      }

      aimSliders.classList.remove('hidden');
    } else {
      // Folding mode
      foldBtn.removeAttribute('disabled');
      actionBtn.removeAttribute('disabled');
      actionBtn.classList.remove('aiming-mode');

      foldMainText.textContent = t.btnFoldMain;
      if (foldKbd) foldKbd.textContent = 'F';

      actionBtnIcon.textContent = '🎯';
      actionMainText.textContent = t.btnAimMain;
      if (actionKbd) {
        actionKbd.classList.remove('hidden');
        actionKbd.textContent = currentLang === 'de' ? 'Leertaste' : 'Space';
      }

      aimSliders.classList.add('hidden');
    }
  };

  game.onStatsChanged = updateUI;
  game.onPhaseChange = () => updateUI();

  game.onFaltality = (bird: BirdData, folds: number, scoreAward: number) => {
    updateUI();
    const t = translations[currentLang];

    if (bird.type === 'iphone_duo') {
      faltalityTitle.textContent = t.bossDefeatBanner;
      faltalitySubtitle.innerHTML = t.bossDefeatSub;
      faltalityPoints.textContent = `+${scoreAward.toLocaleString()} PUNKTE!`;
      triggerAppleKeynoteLootShower();
    } else if (bird.type === 'satellite') {
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

  game.onBossSpawn = (_boss: BirdData) => {
    updateUI();
    const t = translations[currentLang];
    faltalityTitle.textContent = t.bossSpawnBanner;
    faltalitySubtitle.innerHTML = t.bossSpawnSub;
    faltalityPoints.textContent = 'BOSS EVENT';
    faltalityBanner.classList.remove('hidden');

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 4500);

    bossHud.classList.remove('hidden');
    bossHpFill.style.width = '100%';
    bossPhaseBadge.textContent = t.bossPhaseClosed;
    bossPhaseBadge.style.color = '#ff375f';
  };

  game.onBossDamage = (_boss: BirdData, hp: number, maxHp: number, isCritical?: boolean) => {
    updateUI();
    const t = translations[currentLang];
    const pct = Math.max(0, Math.round((hp / maxHp) * 100));
    bossHpFill.style.width = `${pct}%`;

    if (hp === 2) {
      bossPhaseBadge.textContent = t.bossPhaseUnfolding;
      bossPhaseBadge.style.color = '#ffd60a';
      faltalityTitle.textContent = currentLang === 'de' ? '💥 KRITISCHER HIT 1/3: UNFOLD!' : '💥 CRITICAL HIT 1/3: UNFOLD!';
      faltalitySubtitle.innerHTML = currentLang === 'de'
        ? 'Ceramic Shield geknackt! iPhone Duo entfaltet sich (BSOD Crash)!'
        : 'Ceramic Shield breached! iPhone Duo unfolds (BSOD Crash)!';
      faltalityPoints.textContent = 'STAGE 2: UNFOLDED DUAL-SCREEN';
    } else if (hp === 1) {
      bossPhaseBadge.textContent = t.bossPhaseOpen;
      bossPhaseBadge.style.color = '#ff375f';
      faltalityTitle.textContent = currentLang === 'de' ? '💥 KRITISCHER HIT 2/3: ZICK-ZACK!' : '💥 CRITICAL HIT 2/3: ZIG-ZAG!';
      faltalitySubtitle.innerHTML = currentLang === 'de'
        ? 'Tim Cook ruft an! Boss wechselt in Frantic-Fluchtmodus!'
        : 'Tim Cook calling! Boss enters Frantic Zig-Zag Mode!';
      faltalityPoints.textContent = 'STAGE 3: FRANTIC MODE (1% AKKU)';
    } else {
      faltalityTitle.textContent = isCritical ? '💥 KRITISCHER TREFFER!' : '⚡ DIREKT-TREFFER!';
      faltalitySubtitle.innerHTML = currentLang === 'de' ? 'Schaden verursacht!' : 'Damage dealt!';
      faltalityPoints.textContent = 'DIRECT HIT';
    }

    bossHud.classList.remove('hidden');
    bossHud.classList.add('shake');
    setTimeout(() => bossHud.classList.remove('shake'), 400);

    faltalityBanner.classList.remove('hidden');

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 2200);
  };

  game.onBossDefeat = (_boss: BirdData) => {
    updateUI();
    bossHpFill.style.width = '0%';
    setTimeout(() => {
      bossHud.classList.add('hidden');
    }, 3200);
    triggerAppleKeynoteLootShower();

    // Normal garden wildlife returns after victory
    setTimeout(() => {
      game.birdManager.initFlocks();
      updateUI();
    }, 4500);
  };

  game.onShieldDeflect = () => {
    updateUI();
    const t = translations[currentLang];
    faltalityTitle.textContent = "🛡️ BLOCKED!";
    faltalitySubtitle.innerHTML = t.bossShieldDeflect;
    faltalityPoints.textContent = "CERAMIC SHIELD";
    faltalityBanner.classList.remove('hidden');

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 3500);
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

  game.onFoilUnlocked = () => {
    sound.playFoilCrinkle(1);
    const t = translations[currentLang];
    faltalityTitle.textContent = "🌯 UNLOCKED!";
    faltalitySubtitle.innerHTML = t.foilUnlockNotification;
    faltalityPoints.textContent = "+2x MULTIPLIER";
    faltalityBanner.classList.remove('hidden');
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 4500);
    updateUI();
  };

  // Backyard Chaos Interactive Hits (Sneaky Cat, BBQ Grill, Neighbor Car)
  game.onCatHit = (points: number) => {
    updateUI();
    faltalityTitle.textContent = "🐱 SNEAKY CAT BONUS!";
    faltalitySubtitle.innerHTML = currentLang === 'de' 
      ? "Nachbarskatze erschreckt! (Keine Sorge, Katze ist wohlauf!)" 
      : "Startled the neighbor's cat! (Don't worry, cat is totally fine!)";
    faltalityPoints.textContent = `+${points} PTS`;
    faltalityBanner.classList.remove('hidden');
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 3200);
  };

  game.onGrillHit = (points: number) => {
    updateUI();
    faltalityTitle.textContent = "🔥 GRILL-VOLLEY!";
    faltalitySubtitle.innerHTML = currentLang === 'de' 
      ? "Volltreffer auf den Grill! Steak ist medium-rare!" 
      : "Direct hit on neighbor's BBQ! Steak is cooked medium-rare!";
    faltalityPoints.textContent = `+${points} PTS`;
    faltalityBanner.classList.remove('hidden');
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 3200);
  };

  game.onCarHit = (points: number) => {
    updateUI();
    faltalityTitle.textContent = "🚗 AUTOALARM!";
    faltalitySubtitle.innerHTML = currentLang === 'de' 
      ? "Nachbars Limousine getroffen! Alarm heult los!" 
      : "Hit the neighbor's sedan! Car alarm blaring!";
    faltalityPoints.textContent = `+${points} PTS`;
    faltalityBanner.classList.remove('hidden');
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 3200);
  };

  game.onBoatHit = (points: number) => {
    updateUI();
    faltalityTitle.textContent = "⚓ KRABBENKUTTER TREFFER!";
    faltalitySubtitle.innerHTML = currentLang === 'de'
      ? "Nebelhorn ertönt! Der Kutterkapitän grüßt mit frischem Fang!"
      : "Foghorn blares! The boat captain salutes with fresh catch!";
    faltalityPoints.textContent = `+${points} PTS`;
    faltalityBanner.classList.remove('hidden');
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 3200);
  };

  game.onLevelUnlocked = (_levelId: number) => {
    updateUI();
    faltalityTitle.textContent = "🏖️ LEVEL 2 FREIGESCHALTET!";
    faltalitySubtitle.innerHTML = currentLang === 'de'
      ? "3.000 Punkte erreicht! Klicke oben auf das <b>Level-Pill</b>, um an die <b>Ostsee-Küste 🏖️</b> zu reisen!"
      : "3,000 points reached! Click the top <b>Level Pill</b> to travel to the <b>Baltic Coast 🏖️</b>!";
    faltalityPoints.textContent = 'NEUES BIOM ENTSPERRT';
    faltalityBanner.classList.remove('hidden');
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
      faltalityBanner.classList.add('hidden');
    }, 5500);
  };

  // Active Crease Timing Minigame Callbacks
  let creaseResultTimer: number | null = null;

  game.onCreaseStart = (data) => {
    if (creaseResultTimer) {
      clearTimeout(creaseResultTimer);
      creaseResultTimer = null;
    }
    activeCreaseHud.classList.remove('hidden');
    creaseRating.classList.add('hidden');
    creaseRating.className = 'crease-rating hidden';

    // Position the sweetspot
    const leftPct = (data.sweetspotStart * 100).toFixed(1);
    const widthPct = ((data.sweetspotEnd - data.sweetspotStart) * 100).toFixed(1);
    creaseSweetspot.style.left = `${leftPct}%`;
    creaseSweetspot.style.width = `${widthPct}%`;

    // Reset needle
    creaseNeedle.style.left = '0%';
  };

  game.onCreaseProgress = (progress) => {
    const leftPct = (progress * 100).toFixed(1);
    creaseNeedle.style.left = `${leftPct}%`;
  };

  game.onCreaseResult = (quality, perfectCount) => {
    const t = translations[currentLang];
    creaseRating.classList.remove('hidden', 'rating-perfect', 'rating-good', 'rating-imperfect');

    if (quality === 'perfect') {
      creaseRating.classList.add('rating-perfect');
      creaseRating.textContent = `${t.creasePerfect} [x${perfectCount}]`;
    } else if (quality === 'good') {
      creaseRating.classList.add('rating-good');
      creaseRating.textContent = t.creaseGood;
    } else {
      creaseRating.classList.add('rating-imperfect');
      creaseRating.textContent = t.creaseImperfect;
    }

    if (creaseResultTimer) clearTimeout(creaseResultTimer);
    creaseResultTimer = window.setTimeout(() => {
      activeCreaseHud.classList.add('hidden');
    }, 700);
  };

  game.onLevelComplete = (level, stars, score, _isNewRecord, newlyUnlocked) => {
    openLevelResult(level, stars, score, true, newlyUnlocked);
  };

  game.onLevelFailed = (level, _reason) => {
    openLevelResult(level, 0, 0, false);
  };

  game.onGameModeChange = () => {
    updateUI();
  };

  game.onSlingshotDrag = (data) => {
    if (!slingshotDragIndicator) return;
    if (data.active) {
      slingshotDragIndicator.classList.remove('hidden');
      // Clamp to the viewport so the ring + "RELEASE TO LAUNCH!" hint never clip at the
      // edges (the indicator is centered via translate(-50%,-50%); design.md Req 5).
      const marginX = 90;  // half ring width + hint pill overhang
      const marginYTop = 60;
      const marginYBottom = 110; // extra room for the hint pill below the ring
      const clampedX = Math.max(marginX, Math.min(window.innerWidth - marginX, data.screenX));
      const clampedY = Math.max(marginYTop, Math.min(window.innerHeight - marginYBottom, data.screenY));
      slingshotDragIndicator.style.left = `${clampedX}px`;
      slingshotDragIndicator.style.top = `${clampedY}px`;
      if (slingTensionFill) {
        slingTensionFill.style.height = `${Math.round(data.tension * 100)}%`;
      }
      if (slingPowerVal) {
        slingPowerVal.textContent = `${data.power}%`;
      }
      if (slingInstructionHint) {
        if (data.tension < 0.25) {
          slingInstructionHint.textContent = currentLang === 'de' ? '⚡ Halten zum Laden...' : '⚡ Hold to Charge...';
          slingInstructionHint.style.background = 'rgba(0, 0, 0, 0.75)';
        } else {
          slingInstructionHint.textContent = currentLang === 'de' ? '🚀 LOSLASSEN ZUM WERFEN!' : '🚀 RELEASE TO LAUNCH!';
          slingInstructionHint.style.background = 'rgba(255, 59, 48, 0.88)';
        }
      }
      pitchSlider.value = Math.round(data.pitch).toString();
      pitchVal.textContent = Math.round(data.pitch).toString();
      powerSlider.value = Math.round(data.power).toString();
      powerVal.textContent = Math.round(data.power).toString();
    } else {
      slingshotDragIndicator.classList.add('hidden');
    }
  };

  // Direct Look & Hold-to-Charge Slingshot Pointer Controls
  const canvas = game.renderer.domElement;

  canvas.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (introActive) return;

    // Fast skip during flight on tap/click!
    if (game.phase === 'flying') {
      game.fastResetFlight();
      updateUI();
      return;
    }

    const isModalOpen = !menuDrawerBackdrop.classList.contains('hidden') ||
      (keymapModal && !keymapModal.classList.contains('hidden')) ||
      !pediaModal.classList.contains('hidden') ||
      !levelSelectModal.classList.contains('hidden') ||
      !levelResultModal.classList.contains('hidden');
    if (isModalOpen) return;

    if (game.phase === 'aiming' || game.phase === 'folding') {
      const started = game.startChargingShot(e.clientX, e.clientY);
      if (started) {
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {}
        updateUI();
      }
    }
  });

  const handlePointerUp = (e: PointerEvent) => {
    if (game.isCharging) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      game.releaseChargeShot();
      updateUI();
    }
  };

  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', (e: PointerEvent) => {
    if (game.isCharging) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      game.cancelChargingShot();
      updateUI();
    }
  });

  activeCreaseHud.addEventListener('click', () => {
    if (game.isCreasing) {
      game.commitCreaseMinigame();
    }
  });

  // Button Listeners
  foldBtn.addEventListener('click', () => {
    if (game.phase === 'flying') {
      game.fastResetFlight();
      updateUI();
      return;
    }
    if (game.phase === 'aiming') {
      game.enterFoldingMode();
      updateUI();
    } else {
      game.triggerFoldAction();
    }
  });

  actionBtn.addEventListener('click', () => {
    if (game.phase === 'flying') {
      game.fastResetFlight();
      updateUI();
      return;
    }
    if (game.phase === 'folding') {
      game.enterAimingMode();
    } else if (game.phase === 'aiming') {
      game.launchPaper();
    }
  });

  newSheetBtn.addEventListener('click', () => {
    if (game.phase === 'flying') {
      game.fastResetFlight();
      updateUI();
      return;
    }
    if (game.gameMode === 'campaign') {
      game.retryCurrentLevel();
    } else {
      game.resetNewSheet();
    }
    updateUI();
  });

  camResetBtn?.addEventListener('click', () => {
    game.resetCameraLook();
    updateUI();
  });

  materialBtn?.addEventListener('click', () => {
    if (!game.isFoilUnlocked()) {
      sound.playPaperNoise(0.08, 0.25);
      materialBtn.classList.add('shake');
      setTimeout(() => materialBtn.classList.remove('shake'), 400);
      return;
    }
    game.toggleMaterial();
    updateUI();
  });

  // Slider Listeners
  //
  // Secondary touch/assist control (kept by design — see design.md Req 4): on touch
  // devices without a mouse these sliders are the only fine-tuning path. They are NOT
  // a second source of truth — they only mirror and write back game.pitchDeg /
  // game.powerPercent (the same values the mouse Direct-Look/charge and the arrow keys
  // drive) and keep the trajectory preview in sync. Removing them would degrade mobile.
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

  // iAim gag flash: show "iAim: OFF" briefly, then snap back to "ON". A tongue-in-cheek
  // Apple-satire bit — iAim can never actually be turned off (game.toggleAutoAim is a no-op).
  let iAimGagTimer: number | undefined;
  const flashIAimGag = () => {
    let el = document.getElementById('iaim-gag-flash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'iaim-gag-flash';
      el.className = 'iaim-gag-flash';
      document.body.appendChild(el);
    }
    const t = translations[currentLang];
    el.textContent = t.iAimOff;
    el.classList.add('visible');
    if (iAimGagTimer !== undefined) window.clearTimeout(iAimGagTimer);
    iAimGagTimer = window.setTimeout(() => {
      el!.textContent = t.iAimOn;
      iAimGagTimer = window.setTimeout(() => {
        el!.classList.remove('visible');
        iAimGagTimer = undefined;
      }, 500);
    }, 600);
  };

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

    if (e.code === 'KeyC') {
      e.preventDefault();
      game.resetCameraLook();
      updateUI();
      return;
    }

    if (e.code === 'KeyU') {
      e.preventDefault();
      if (!game.isFoilUnlocked()) {
        sound.playPaperNoise(0.08, 0.25);
        materialBtn?.classList.add('shake');
        setTimeout(() => materialBtn?.classList.remove('shake'), 400);
        return;
      }
      game.toggleMaterial();
      updateUI();
      return;
    }

    if (e.code === 'KeyB') {
      e.preventDefault();
      game.summonBoss();
      updateUI();
      return;
    }

    if (e.code === 'KeyA') {
      e.preventDefault();
      if (introActive) return;
      // iAim gag: pretend to turn iAim off, then snap it right back to ON.
      // autoAim never actually changes (see FaltalityGame.toggleAutoAim).
      game.toggleAutoAim();
      flashIAimGag();
      return;
    }

    if (e.code === 'KeyT') {
      e.preventDefault();
      cycleTarget(1);
      return;
    }

    if (e.code === 'Escape') {
      if (game.phase === 'flying') {
        game.fastResetFlight();
        updateUI();
        return;
      }
      if (game.isCharging) {
        game.resetAimState();
        updateUI();
        return;
      }
      const hadModalOpen = !menuDrawerBackdrop.classList.contains('hidden') ||
        (keymapModal && !keymapModal.classList.contains('hidden')) ||
        !pediaModal.classList.contains('hidden') ||
        !levelSelectModal.classList.contains('hidden') ||
        !levelResultModal.classList.contains('hidden');
      closeMenu();
      toggleKeymap(false);
      toggleFaltPedia(false);
      closeLevelSelect();
      closeLevelResult();
      if (!hadModalOpen && game.phase === 'aiming') {
        game.enterFoldingMode();
        updateUI();
      }
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (game.phase === 'flying') {
        game.fastResetFlight();
        updateUI();
        return;
      }
      if (game.isCreasing) {
        game.commitCreaseMinigame();
        return;
      }
      if (game.phase === 'folding') {
        game.enterAimingMode();
        updateUI();
      } else if (game.phase === 'aiming') {
        if (!e.repeat) {
          game.launchPaper();
          updateUI();
        }
      }
      return;
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      if (game.phase === 'flying') {
        game.fastResetFlight();
        updateUI();
        return;
      }
      if (game.phase === 'aiming') {
        game.enterFoldingMode();
        updateUI();
      } else {
        game.triggerFoldAction();
      }
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      if (game.phase === 'flying') {
        game.fastResetFlight();
        updateUI();
        return;
      }
      if (game.gameMode === 'campaign') {
        game.retryCurrentLevel();
      } else {
        game.resetNewSheet();
      }
      updateUI();
    }
  });

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      game.keysPressed[e.code] = false;
    }
    if (e.code === 'Space' && game.isCharging) {
      e.preventDefault();
      game.releaseChargeShot();
      updateUI();
    }
  });

  updateUI();
});
