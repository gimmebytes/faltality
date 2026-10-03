import type { BirdType } from './models/birds';
import type { OrigamiArchetype } from './models/paper';
import { safeLocalStorage } from './i18n';

export const isLocalEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Test seam: E2E tests force WIP gating on by setting this to false, since the
  // Playwright dev server would otherwise always count as local (DEV + 127.0.0.1).
  const override = (window as unknown as { __faltality_forceLocal?: boolean }).__faltality_forceLocal;
  if (typeof override === 'boolean') return override;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local') || Boolean((import.meta as any).env?.DEV);
};

export interface LevelSpawnConfig {
  type: BirdType;
  altitude: number;
  x: number;
  z: number;
  speed?: number;
}

export type TargetActionType = 'hit_birds' | 'trigger_crater' | 'defeat_boss';

export interface LevelStarCriteria {
  star1DescKey: string;
  star2DescKey: string;
  star3DescKey: string;
  checkStars: (stats: {
    objectiveMet: boolean;
    sheetsUsed: number;
    maxSheets: number;
    perfectCreases: number;
    score: number;
    maxFoldsUsed: number;
  }) => number; // returns 1, 2, or 3
}

export interface CampaignLevel {
  id: number;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  objectiveKey: string;
  maxSheets: number;
  recommendedArchetype: OrigamiArchetype;
  targetAction: TargetActionType;
  requiredTargetCount: number;
  targetBirdTypes: BirdType[];
  spawns: LevelSpawnConfig[];
  stars: LevelStarCriteria;
  isWip?: boolean;
}

export interface LevelProgress {
  stars: number; // 0 to 3
  highscore: number;
  unlocked: boolean;
}

export const CAMPAIGN_STORAGE_KEY = 'faltality_campaign_progress_v1';

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  {
    id: 1,
    titleKey: 'lvl1Title',
    subtitleKey: 'lvl1Subtitle',
    descKey: 'lvl1Desc',
    objectiveKey: 'lvl1Objective',
    maxSheets: 4,
    recommendedArchetype: 'glider',
    targetAction: 'hit_birds',
    requiredTargetCount: 2,
    targetBirdTypes: ['pigeon'],
    spawns: [
      { type: 'pigeon', altitude: 4.2, x: -8, z: -10, speed: 3.2 },
      { type: 'pigeon', altitude: 5.8, x: 10, z: -13, speed: 3.6 }
    ],
    stars: {
      star1DescKey: 'lvl1Star1',
      star2DescKey: 'lvl1Star2',
      star3DescKey: 'lvl1Star3',
      checkStars: ({ objectiveMet, sheetsUsed, perfectCreases }) => {
        if (!objectiveMet) return 0;
        let stars = 1;
        if (sheetsUsed <= 3) stars++; // 3 or fewer sheets
        if (perfectCreases >= 1) stars++;
        return Math.min(3, stars);
      }
    }
  },
  {
    id: 2,
    isWip: true,
    titleKey: 'lvl2Title',
    subtitleKey: 'lvl2Subtitle',
    descKey: 'lvl2Desc',
    objectiveKey: 'lvl2Objective',
    maxSheets: 3,
    recommendedArchetype: 'dart',
    targetAction: 'hit_birds',
    requiredTargetCount: 2,
    targetBirdTypes: ['goose'],
    spawns: [
      { type: 'goose', altitude: 10.5, x: -14, z: -16, speed: 4.8 },
      { type: 'goose', altitude: 12.8, x: 14, z: -18, speed: 5.2 }
    ],
    stars: {
      star1DescKey: 'lvl2Star1',
      star2DescKey: 'lvl2Star2',
      star3DescKey: 'lvl2Star3',
      checkStars: ({ objectiveMet, sheetsUsed, maxSheets, perfectCreases }) => {
        if (!objectiveMet) return 0;
        let stars = 1;
        if (sheetsUsed <= maxSheets - 1) stars++;
        if (perfectCreases >= 1) stars++;
        return Math.min(3, stars);
      }
    }
  },
  {
    id: 3,
    titleKey: 'lvl3Title',
    subtitleKey: 'lvl3Subtitle',
    descKey: 'lvl3Desc',
    objectiveKey: 'lvl3Objective',
    maxSheets: 2,
    recommendedArchetype: 'comet',
    targetAction: 'trigger_crater',
    requiredTargetCount: 1,
    targetBirdTypes: [],
    spawns: [
      { type: 'pigeon', altitude: 6.0, x: 0, z: -12, speed: 3.5 }
    ],
    stars: {
      star1DescKey: 'lvl3Star1',
      star2DescKey: 'lvl3Star2',
      star3DescKey: 'lvl3Star3',
      checkStars: ({ objectiveMet, sheetsUsed, perfectCreases, maxFoldsUsed }) => {
        if (!objectiveMet) return 0;
        let stars = 1;
        if (sheetsUsed === 1) stars++; // 1-shot wonder!
        if (maxFoldsUsed >= 6 || perfectCreases >= 1) stars++;
        return Math.min(3, stars);
      }
    }
  },
  {
    id: 4,
    titleKey: 'lvl4Title',
    subtitleKey: 'lvl4Subtitle',
    descKey: 'lvl4Desc',
    objectiveKey: 'lvl4Objective',
    maxSheets: 4,
    recommendedArchetype: 'dart',
    targetAction: 'hit_birds',
    requiredTargetCount: 1,
    targetBirdTypes: ['airplane'],
    spawns: [
      { type: 'airplane', altitude: 19.5, x: -16, z: -20, speed: 7.2 }
    ],
    stars: {
      star1DescKey: 'lvl4Star1',
      star2DescKey: 'lvl4Star2',
      star3DescKey: 'lvl4Star3',
      checkStars: ({ objectiveMet, sheetsUsed, maxSheets, perfectCreases }) => {
        if (!objectiveMet) return 0;
        let stars = 1;
        if (sheetsUsed <= maxSheets - 2) stars++; // 2 or fewer sheets
        if (perfectCreases >= 1) stars++;
        return Math.min(3, stars);
      }
    }
  },
  {
    id: 5,
    titleKey: 'lvl5Title',
    subtitleKey: 'lvl5Subtitle',
    descKey: 'lvl5Desc',
    objectiveKey: 'lvl5Objective',
    maxSheets: 6,
    recommendedArchetype: 'comet',
    targetAction: 'defeat_boss',
    requiredTargetCount: 1,
    targetBirdTypes: ['iphone_duo'],
    spawns: [
      { type: 'iphone_duo', altitude: 18.0, x: 0, z: -16.0, speed: 4.5 }
    ],
    stars: {
      star1DescKey: 'lvl5Star1',
      star2DescKey: 'lvl5Star2',
      star3DescKey: 'lvl5Star3',
      checkStars: ({ objectiveMet, sheetsUsed, maxSheets, perfectCreases }) => {
        if (!objectiveMet) return 0;
        let stars = 1;
        if (sheetsUsed <= maxSheets - 2) stars++; // 4 or fewer sheets
        if (perfectCreases >= 2) stars++;
        return Math.min(3, stars);
      }
    }
  }
];

export class CampaignProgressManager {
  private static progressCache: Record<number, LevelProgress> | null = null;

  public static loadProgress(): Record<number, LevelProgress> {
    if (this.progressCache) return this.progressCache;

    const initial: Record<number, LevelProgress> = {};
    for (const lvl of CAMPAIGN_LEVELS) {
      initial[lvl.id] = {
        stars: 0,
        highscore: 0,
        unlocked: lvl.id === 1 // First level unlocked by default
      };
    }

    const isLocal = isLocalEnvironment();
    const stored = safeLocalStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        for (const lvl of CAMPAIGN_LEVELS) {
          if (parsed[lvl.id]) {
            const shouldUnlock = lvl.id === 1 || Boolean(parsed[lvl.id].unlocked);
            initial[lvl.id] = {
              stars: parsed[lvl.id].stars || 0,
              highscore: parsed[lvl.id].highscore || 0,
              unlocked: lvl.isWip && !isLocal ? false : shouldUnlock
            };
          }
        }
      } catch {}
    }

    this.progressCache = initial;
    return this.progressCache;
  }

  public static saveLevelCompletion(
    levelId: number,
    earnedStars: number,
    score: number
  ): { isNewRecord: boolean; newlyUnlockedLevel?: number } {
    const progress = this.loadProgress();
    const current = progress[levelId] || { stars: 0, highscore: 0, unlocked: true };

    const isNewRecord = score > current.highscore || earnedStars > current.stars;
    current.stars = Math.max(current.stars, earnedStars);
    current.highscore = Math.max(current.highscore, score);
    progress[levelId] = current;

    // Unlock the next *reachable* level if stars >= 1. Once WIP gating is active
    // (!isLocal), skip WIP levels so the campaign stays completable: e.g. Level 1
    // unlocks Level 3 because Level 2 (Coast) is isWip. On isLocal nothing is
    // filtered, so the next level is simply levelId + 1 as before.
    let newlyUnlockedLevel: number | undefined;
    const isLocal = isLocalEnvironment();
    const nextLvl = CAMPAIGN_LEVELS
      .filter(l => l.id > levelId && (isLocal || !l.isWip))
      .sort((a, b) => a.id - b.id)[0];
    if (
      earnedStars >= 1 &&
      nextLvl &&
      progress[nextLvl.id] &&
      !progress[nextLvl.id].unlocked
    ) {
      progress[nextLvl.id].unlocked = true;
      newlyUnlockedLevel = nextLvl.id;
    }

    safeLocalStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress));

    return { isNewRecord, newlyUnlockedLevel };
  }

  public static unlockAll(): void {
    const progress = this.loadProgress();
    const isLocal = isLocalEnvironment();
    for (const lvl of CAMPAIGN_LEVELS) {
      if (progress[lvl.id]) {
        if (!lvl.isWip || isLocal) {
          progress[lvl.id].unlocked = true;
        }
      }
    }
    safeLocalStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress));
  }

  public static resetProgress(): void {
    this.progressCache = null;
    safeLocalStorage.removeItem(CAMPAIGN_STORAGE_KEY);
    this.loadProgress();
  }
}
