import type { IAIClient } from './client';
import type { FragmentInput, SkillVariant, EnemyTemplate, SkillEvaluation } from '@mindsea/shared';

export class OpenAIClient implements IAIClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateSkillVariants(
    _description: string,
    _constraints: string[],
    _fragmentInput: FragmentInput,
  ): Promise<Omit<SkillVariant, 'perUsePower' | 'totalOutput' | 'mpPerUse' | 'basePower'>[]> {
    throw new Error('未实现：请设置环境变量 AI_MOCK=false 以使用真实AI');
  }

  async generateNarrative(_context: string): Promise<string> {
    throw new Error('未实现：请设置环境变量 AI_MOCK=false 以使用真实AI');
  }

  async generateEnemy(_level: number, _seed: string): Promise<EnemyTemplate> {
    throw new Error('未实现：请设置环境变量 AI_MOCK=false 以使用真实AI');
  }

  async evaluateSkill(_description: string): Promise<{ evaluation: SkillEvaluation; usageCount: number }> {
    throw new Error('未实现：请设置环境变量 AI_MOCK=false 以使用真实AI');
  }
}