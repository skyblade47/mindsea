import type { FragmentInput, SkillVariant, EnemyTemplate, SkillEvaluation } from '@mindsea/shared';

export interface IAIClient {
  generateSkillVariants(
    description: string,
    constraints: string[],
    fragmentInput: FragmentInput,
  ): Promise<Omit<SkillVariant, 'perUsePower' | 'totalOutput' | 'mpPerUse' | 'basePower'>[]>;

  generateNarrative(context: string): Promise<string>;

  generateEnemy(level: number, seed: string): Promise<EnemyTemplate>;

  evaluateSkill(description: string): Promise<{ evaluation: SkillEvaluation; usageCount: number }>;
}