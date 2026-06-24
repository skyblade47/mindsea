import type { FragmentInput } from './fragment';
import type { SkillVariant } from './skill';
import type { CombatAction } from './combat';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateSkillRequest {
  adventureId: string;
  fragmentInput: FragmentInput;
  description: string;
  constraints?: string[];
}

export interface CreateSkillResponse {
  variants: SkillVariant[];
  timeCost: number;
  spCost: number;
}

export interface SelectSkillRequest {
  adventureId: string;
  variantIndex: number;
  selectedVariant: SkillVariant;
  timeCost: number;
}

export interface ProceedRequest {
  adventureId: string;
  nodeIndex: number;
}

export interface CombatActionRequest {
  combatId: string;
  action: CombatAction;
}
