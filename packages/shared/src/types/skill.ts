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

export type OpCode = 'set' | 'add' | 'mul' | 'clamp' | 'log' | 'if' | 'random';

export type TargetType = 'self' | 'enemy';

export type Comparator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte';

export type CondType = 'compare' | 'has_status' | 'no_status' | 'hp_pct' | 'mp_pct' | 'and' | 'or';

export interface IfCondition {
  type: CondType;
  target?: TargetType;
  path?: string;
  comparator?: Comparator;
  value?: number | string;
  left?: IfCondition;
  right?: IfCondition;
  percent?: number;
  status?: string;
}

export interface SkillOp {
  op: OpCode;
  target?: TargetType;
  path?: string;
  value?: number | string;
  min?: number;
  max?: number;
  text?: string;
  cond?: IfCondition;
  then?: SkillOp[];
  else?: SkillOp[];
  assignTo?: string;
}

export interface ActiveModifier {
  id: string;
  path: string;
  duration: number;
  maxDuration: number;
  value: number;
  revertType: 'add' | 'mul' | 'set';
  revertValue: number;
  source: 'player' | 'enemy';
}

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
  ops: SkillOp[];
  onCast?: SkillOp[];
  onHit?: SkillOp[];
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
