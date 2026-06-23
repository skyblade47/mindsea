export const ABSOLUTE_RULES = {
  DIMENSIONS: ['power', 'scope', 'duration', 'flexibility', 'uniqueness', 'synergy'] as const,
  DIMENSION_MIN: 1,
  DIMENSION_MAX: 10,
  USAGE_MIN: 1,
  USAGE_MAX: 10,
  USAGE_ALPHA: 0.4,
  ADVENTURE_TIME_MAX: 100,
  SKILL_SLOT_BASE: 3,
  SKILL_SLOT_PER_LEVEL: 2,
  CREATION_BASE_TIME: 8,
  RETRY_TIME_COST: 5,
  MP_COST_RATIO: 0.6,
  LEVEL_UP_EXP_BASE: 100,
  LEVEL_UP_EXP_SCALE: 1.5,
} as const;

export function calculateSlotLimit(level: number): number {
  return level * 2 + 3;
}

export function calculateBasePower(
  capacity: number,
  elem: number,
  form: number,
  mech: number,
): number {
  return Math.min(capacity * 5 + (elem + form + mech) * 3, capacity * 10);
}

export function calculatePerUsePower(
  basePower: number,
  usageCount: number,
): number {
  return Math.round(
    basePower * Math.pow(usageCount, -ABSOLUTE_RULES.USAGE_ALPHA),
  );
}

export function calculateTotalOutput(
  basePower: number,
  usageCount: number,
): number {
  return Math.round(
    basePower * Math.pow(usageCount, 1 - ABSOLUTE_RULES.USAGE_ALPHA),
  );
}

export function calculateMPPerUse(perUsePower: number): number {
  return Math.max(5, Math.round(perUsePower * ABSOLUTE_RULES.MP_COST_RATIO));
}

export function calculateSPCost(evaluation: number[]): number {
  const avg = evaluation.reduce((a, b) => a + b, 0) / evaluation.length;
  let cost = 3 + avg * 2;
  const maxScore = Math.max(...evaluation);
  if (maxScore >= 9) cost += 4;
  else if (maxScore >= 7) cost += 2;
  const minScore = Math.min(...evaluation);
  if (minScore <= 2) cost -= 2;
  return Math.max(1, Math.round(cost));
}

export function calculateTimeCost(
  spCost: number,
  descLen: number,
  constraintCount: number,
): number {
  return (
    ABSOLUTE_RULES.CREATION_BASE_TIME +
    Math.round(spCost * 1.5) +
    Math.round(descLen / 50) +
    constraintCount * 2
  );
}

export function calculateNaturalLanguageBonus(
  descCharCount: number,
  fragmentCharCount: number,
): number {
  const ratio =
    descCharCount / Math.max(1, descCharCount + fragmentCharCount);
  if (ratio >= 0.8) return 1.5;
  if (ratio >= 0.6) return 1.3;
  if (ratio >= 0.4) return 1.15;
  if (ratio >= 0.2) return 1.05;
  return 1.0;
}

export function determineUsageTier(usageCount: number): string {
  if (usageCount <= 2) return '终言型';
  if (usageCount <= 4) return '强击型';
  if (usageCount <= 6) return '主力型';
  if (usageCount <= 8) return '持续型';
  return '低语型';
}

export function calculateLevelUpExp(level: number): number {
  return Math.round(100 * Math.pow(1.5, level - 1));
}

export const FRAGMENT_CARRY_CAPACITY: Record<string, number> = {
  iron_word: 3,
  steel_word: 5,
  silver_sentence: 8,
  source_chapter: 12,
  divine_codex: 20,
};