import type { AttributeStats } from './adventure';

export type SkillDimension =
  | 'power'
  | 'scope'
  | 'duration'
  | 'flexibility'
  | 'uniqueness'
  | 'synergy';

export type SkillEvaluation = Record<SkillDimension, number>;

export type UsageTier =
  | '终言型'
  | '强击型'
  | '主力型'
  | '持续型'
  | '低语型';

export interface SkillVariant {
  id: string;
  name: string;
  description: string;
  evaluation: SkillEvaluation;
  usageCount: number;
  type: 'physical' | 'magical';
  basePower: number;
  perUsePower: number;
  totalOutput: number;
  mpPerUse: number;
  naturalLanguageBonus: number;
}

export interface Skill extends SkillVariant {
  slotIndex: number;
  createdAt: number;
}

export interface CreationResult {
  variants: SkillVariant[];
  timeCost: number;
  spCost: number;
}