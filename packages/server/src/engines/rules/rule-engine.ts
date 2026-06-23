import {
  ABSOLUTE_RULES,
  calculateSlotLimit,
  calculateSPCost,
  calculateTimeCost,
} from '@mindsea/shared';
import type { Skill } from '@mindsea/shared';

// Re-export for convenience
export { ABSOLUTE_RULES, calculateSlotLimit, calculateSPCost, calculateTimeCost };

export function checkSkillSlotLimit(level: number, currentSkills: Skill[]): { allowed: boolean; limit: number } {
  const limit = calculateSlotLimit(level);
  return {
    allowed: currentSkills.length < limit,
    limit,
  };
}

export function calculateCreationCost(
  fragmentInput: { quality: string },
  description: string,
  constraints: string[],
): { spCost: number; timeCost: number } {
  const dims = [5, 5, 5, 5, 5, 5]; // placeholder evaluation values
  const spCost = calculateSPCost(dims);
  const timeCost = calculateTimeCost(spCost, description.length, constraints.length);

  return { spCost, timeCost };
}

export function validateAdventureAction(
  state: { timeRemaining: number; status: string },
  _action: string,
): { allowed: boolean; reason?: string } {
  if (state.status !== 'active') {
    return { allowed: false, reason: `冒险已结束，状态: ${state.status}` };
  }

  if (state.timeRemaining <= 0) {
    return { allowed: false, reason: '冒险时间已耗尽' };
  }

  return { allowed: true };
}