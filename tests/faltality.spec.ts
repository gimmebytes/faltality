import { test, expect } from '@playwright/test';

test.describe('Faltality - Core Gameplay & Vivaldi Compatibility', () => {
  test('starts cleanly without unhandled errors or console exceptions', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');

    // Intro overlay should be visible
    const introScreen = page.locator('#intro-screen');
    await expect(introScreen).toBeVisible();

    const title = page.locator('#intro-title');
    await expect(title).toHaveText(/FOLDTALITY|FALTALITY/i);

    // No unhandled page errors
    expect(errors).toEqual([]);
  });

  test('handles restricted/blocked localStorage (Vivaldi private window / web panel mode)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Simulate Vivaldi / private mode where localStorage throws DOMException
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new DOMException('Access is denied for this document', 'SecurityError');
        },
      });
    });

    await page.goto('/');

    // Page must still render cleanly without throwing uncaught exceptions
    const introScreen = page.locator('#intro-screen');
    await expect(introScreen).toBeVisible();
    await expect(page.locator('#intro-start-btn')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('can start the game and enter Level 1 (Garden)', async ({ page }) => {
    await page.goto('/');

    const startBtn = page.locator('#intro-start-btn');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Intro screen should fade/hide
    const introScreen = page.locator('#intro-screen');
    await expect(introScreen).toHaveClass(/hidden/);

    // Mode indicator should show Level 1: Garten
    const modePill = page.locator('#mode-indicator-btn');
    await expect(modePill).toBeVisible();
    await expect(modePill).toContainText(/Level 1/i);

    // Canvas must be rendered
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('supports T target cycling including special targets (cat, car, sheep, grill)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-start-btn').click();

    // Verify all targets include special targets in Level 1
    const allTargets = await page.evaluate(() => {
      const g = (window as any).__faltality_game;
      return g ? g.getAllTargets().map((t: any) => ({ id: t.id, name: t.name, kind: t.kind })) : [];
    });

    const targetIds = allTargets.map((t: any) => t.id);
    expect(targetIds).toContain('special-cat');
    expect(targetIds).toContain('special-car');
    expect(targetIds).toContain('special-sheep');
    expect(targetIds).toContain('special-grill');

    // Press F to fold at least once so we can switch to aim mode
    await page.keyboard.press('KeyF');
    await page.waitForTimeout(400);

    // Switch to aiming mode by pressing Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    // Press T multiple times and verify targets cycle (Tab binding removed)
    const cycledTargetNames: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('KeyT');
      await page.waitForTimeout(100);

      const targetName = await page.evaluate(() => {
        const g = (window as any).__faltality_game;
        return g ? g.getTargetName() : '';
      });
      if (targetName && !cycledTargetNames.includes(targetName)) {
        cycledTargetNames.push(targetName);
      }
    }

    // Should have cycled through multiple targets
    expect(cycledTargetNames.length).toBeGreaterThanOrEqual(2);
  });

  test('campaign unlock skips WIP levels when gating is active (Level 1 -> Level 3)', async ({ page }) => {
    // Force WIP gating ON (as on the live site). Must run before the module loads
    // so isLocalEnvironment() picks it up.
    await page.addInitScript(() => {
      (window as any).__faltality_forceLocal = false;
    });
    await page.goto('/');
    await page.locator('#intro-start-btn').click();

    const result = await page.evaluate(() => {
      const CPM = (window as any).__faltality_progress;
      CPM.resetProgress();
      // Complete Level 1 with 1 star.
      const { newlyUnlockedLevel } = CPM.saveLevelCompletion(1, 1, 1000);
      const progress = CPM.loadProgress();
      return {
        newlyUnlockedLevel,
        level2Unlocked: progress[2].unlocked,
        level3Unlocked: progress[3].unlocked,
      };
    });

    // Level 2 (Coast) is isWip -> skipped. Level 3 unlocks instead.
    expect(result.newlyUnlockedLevel).toBe(3);
    expect(result.level2Unlocked).toBe(false);
    expect(result.level3Unlocked).toBe(true);
  });

  test('campaign unlock on local keeps sequential +1 (Level 1 -> Level 2)', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__faltality_forceLocal = true;
    });
    await page.goto('/');
    await page.locator('#intro-start-btn').click();

    const result = await page.evaluate(() => {
      const CPM = (window as any).__faltality_progress;
      CPM.resetProgress();
      const { newlyUnlockedLevel } = CPM.saveLevelCompletion(1, 1, 1000);
      const progress = CPM.loadProgress();
      return {
        newlyUnlockedLevel,
        level2Unlocked: progress[2].unlocked,
      };
    });

    // Local: nothing filtered, next level is simply Level 2.
    expect(result.newlyUnlockedLevel).toBe(2);
    expect(result.level2Unlocked).toBe(true);
  });

  test('trajectory aim line and beads are disabled for 90s arcade style', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-start-btn').click();

    // Fold and aim
    await page.keyboard.press('KeyF');
    await page.waitForTimeout(300);
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Verify trajectory line and beads are not visible
    const trajectoryVisible = await page.evaluate(() => {
      const g = (window as any).__faltality_game;
      return {
        line: g.paper.trajectoryLine.visible,
        beads: g.paper.trajectoryBeads.visible,
      };
    });

    expect(trajectoryVisible.line).toBe(false);
    expect(trajectoryVisible.beads).toBe(false);
  });

  test('level select displays Campaign Levels and local WIP status for Level 2', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-start-btn').click();

    // Open level select via mode indicator pill
    await page.locator('#mode-indicator-btn').click();

    const levelModal = page.locator('#level-select-modal');
    await expect(levelModal).toBeVisible();

    // Verify level cards exist
    const cards = page.locator('.level-card');
    await expect(cards).toHaveCount(5);

    // Level 2 should be marked with WIP
    const level2Card = cards.nth(1);
    await expect(level2Card).toContainText(/WIP/i);
  });

  test('paper folding mechanics work (key F)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-start-btn').click();

    const foldsValue = page.locator('#tower-folds-val');
    await expect(foldsValue).toHaveText('0');

    // Press F to fold
    await page.keyboard.press('KeyF');
    await page.waitForTimeout(400);

    // Folds should now be 1
    await expect(foldsValue).toHaveText('1');
  });

  test('campaign HUD displays level objective, star bonus criteria, and special target hint', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-start-btn').click();

    const campaignHud = page.locator('#campaign-hud');
    await expect(campaignHud).toBeVisible();

    const missionName = page.locator('#campaign-mission-name');
    await expect(missionName).toContainText(/Level 1/i);

    const starsHint = page.locator('#campaign-stars-hint');
    await expect(starsHint).toBeVisible();
    await expect(starsHint).toContainText(/Bonus/i);

    const bonusTargetsHint = page.locator('#campaign-bonus-targets-hint');
    await expect(bonusTargetsHint).toBeVisible();
    await expect(bonusTargetsHint).toContainText(/\+1 (Blatt|sheet)/i);

    // Apple Activity Ring verification
    const ringWrap = page.locator('#activity-ring-wrap');
    await expect(ringWrap).toBeVisible();

    const ringIcon = page.locator('#activity-ring-icon');
    await expect(ringIcon).toHaveText('🕊️');

    const ringPercent = page.locator('#activity-ring-percent');
    await expect(ringPercent).toHaveText('0%');

    // Simulate 1 target hit to verify ring progression
    await page.evaluate(() => {
      const g = (window as any).__faltality_game;
      g.levelTargetsHit = 1;
      if (g.onStatsChanged) g.onStatsChanged();
    });

    await expect(ringPercent).toHaveText('50%');
  });

  test('iPhone Duo boss has 3 critical hit phases with Ceramic Shield deflection and BSOD/panic modes', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-start-btn').click();

    const bossData = await page.evaluate(() => {
      const g = (window as any).__faltality_game;
      const boss = g.summonBoss();
      const initialHp = boss.health;
      const initialPhase = boss.bossPhase;
      const initialScreenMode = boss.iphoneDuoModel?.screenMode;

      // 1. Non-critical hit (damage = 1): should be deflected, 0 HP lost
      const nonCritDestroyed = g.birdManager.hitBird(boss, { x: 0, y: 0, z: -10 }, 1);
      const hpAfterNonCrit = boss.health;

      // 2. Critical hit 1 (damage = 2): should transition to unfolded / BSOD
      const crit1Destroyed = g.birdManager.hitBird(boss, { x: 0, y: 0, z: -10 }, 2);
      const hpAfterCrit1 = boss.health;
      const phaseAfterCrit1 = boss.bossPhase;
      const screenAfterCrit1 = boss.iphoneDuoModel?.screenMode;
      const foldAngleAfterCrit1 = boss.iphoneDuoModel?.targetFoldAngle;

      // 3. Critical hit 2 (damage = 2): should transition to frantic zig-zag / panic
      const crit2Destroyed = g.birdManager.hitBird(boss, { x: 0, y: 0, z: -10 }, 2);
      const hpAfterCrit2 = boss.health;
      const phaseAfterCrit2 = boss.bossPhase;
      const screenAfterCrit2 = boss.iphoneDuoModel?.screenMode;
      const foldAngleAfterCrit2 = boss.iphoneDuoModel?.targetFoldAngle;

      // 4. Critical hit 3 (damage = 2): should destroy boss
      const crit3Destroyed = g.birdManager.hitBird(boss, { x: 0, y: 0, z: -10 }, 2);
      const hpAfterCrit3 = boss.health;
      const phaseAfterCrit3 = boss.bossPhase;
      const foldAngleAfterCrit3 = boss.iphoneDuoModel?.targetFoldAngle;

      return {
        initialHp,
        initialPhase,
        initialScreenMode,
        nonCritDestroyed,
        hpAfterNonCrit,
        crit1Destroyed,
        hpAfterCrit1,
        phaseAfterCrit1,
        screenAfterCrit1,
        foldAngleAfterCrit1,
        crit2Destroyed,
        hpAfterCrit2,
        phaseAfterCrit2,
        screenAfterCrit2,
        foldAngleAfterCrit2,
        crit3Destroyed,
        hpAfterCrit3,
        phaseAfterCrit3,
        foldAngleAfterCrit3,
      };
    });

    expect(bossData.initialHp).toBe(3);
    expect(bossData.initialPhase).toBe('closed');
    expect(bossData.initialScreenMode).toBe('normal');

    // Non-critical deflected:
    expect(bossData.nonCritDestroyed).toBe(false);
    expect(bossData.hpAfterNonCrit).toBe(3);

    // Critical Hit 1 (Triggers Unfold Mode!):
    expect(bossData.crit1Destroyed).toBe(false);
    expect(bossData.hpAfterCrit1).toBe(2);
    expect(bossData.phaseAfterCrit1).toBe('unfolded');
    expect(bossData.foldAngleAfterCrit1).toBe(0);
    expect(bossData.screenAfterCrit1).toBe('bsod');

    // Critical Hit 2 (Triggers Frantic Zig-Zag & Tim Cook call):
    expect(bossData.crit2Destroyed).toBe(false);
    expect(bossData.hpAfterCrit2).toBe(1);
    expect(bossData.phaseAfterCrit2).toBe('unfolded');
    expect(bossData.foldAngleAfterCrit2).toBe(0);
    expect(bossData.screenAfterCrit2).toBe('panic');

    // Critical Hit 3:
    expect(bossData.crit3Destroyed).toBe(true);
    expect(bossData.hpAfterCrit3).toBe(0);
    expect(bossData.phaseAfterCrit3).toBe('defeated');
    expect(bossData.foldAngleAfterCrit3).toBeLessThan(0);
  });
});
