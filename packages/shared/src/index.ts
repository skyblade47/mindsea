// Types
export type {
  AttributeStats,
  AdventureNodeType,
  NodeRewards,
  Choice,
  AdventureNode,
  StoryEntry,
  AdventureStatus,
} from './types/adventure';

export type {
  SkillDimension,
  SkillEvaluation,
  UsageTier,
  SkillVariant,
  Skill,
  CreationResult,
  SkillOp,
  OpCode,
  TargetType,
  IfCondition,
  ActiveModifier,
  Comparator,
  CondType,
} from './types/skill';

export type {
  FragmentQuality,
  FragmentElement,
  FragmentForm,
  FragmentMechanism,
  Fragment,
  FragmentInput,
} from './types/fragment';

export type {
  CombatStatus,
  Combatant,
  EnemySkill,
  EnemyPhase,
  EnemyTemplate,
  CombatLogEntry,
  CombatAction,
  CombatResult,
} from './types/combat';

export type {
  PlayerProfile,
  AdventureState,
  Settlement,
} from './types/player';

export type {
  ApiResponse,
  CreateSkillRequest,
  CreateSkillResponse,
  SelectSkillRequest,
  ProceedRequest,
  CombatActionRequest,
} from './types/api';

// Constants
export {
  ABSOLUTE_RULES,
  calculateSlotLimit,
  calculateBasePower,
  calculatePerUsePower,
  calculateTotalOutput,
  calculateMPPerUse,
  calculateSPCost,
  calculateTimeCost,
  calculateNaturalLanguageBonus,
  determineUsageTier,
  calculateLevelUpExp,
  FRAGMENT_CARRY_CAPACITY,
} from './constants/rules';

export type { FragmentEntry } from './constants/fragments';
export { FRAGMENTS } from './constants/fragments';

export type { AncientLexiconEntry } from './constants/ancient-lexicon';
export { ANCIENT_LEXICON } from './constants/ancient-lexicon';