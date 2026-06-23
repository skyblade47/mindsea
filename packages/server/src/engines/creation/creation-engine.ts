import type { FragmentInput, SkillVariant, AdventureState } from '@mindsea/shared';
import type { IAIClient } from '../../ai/client';
import {
  ABSOLUTE_RULES,
  calculateBasePower,
  calculatePerUsePower,
  calculateTotalOutput,
  calculateMPPerUse,
  calculateSPCost,
  calculateTimeCost,
  calculateNaturalLanguageBonus,
} from '@mindsea/shared';

export class CreationEngine {
  private aiClient: IAIClient;

  constructor(aiClient: IAIClient) {
    this.aiClient = aiClient;
  }

  async generateSkillVariants(
    fragmentInput: FragmentInput,
    description: string,
    constraints: string[],
    adventureState: AdventureState,
  ): Promise<SkillVariant[]> {
    const natBonus = calculateNaturalLanguageBonus(
      description.length,
      fragmentInput.elements.length * 10 +
        fragmentInput.forms.length * 10 +
        fragmentInput.mechanisms.length * 10,
    );

    const rawVariants = await this.aiClient.generateSkillVariants(description, constraints, fragmentInput);

    const qualityMap: Record<string, number> = {
      iron_word: 1,
      steel_word: 2,
      silver_sentence: 3,
      source_chapter: 4,
      divine_codex: 5,
    };
    const capacity = qualityMap[fragmentInput.quality] ?? 1;

    const variants: SkillVariant[] = rawVariants.map((raw) => {
      const dims = Object.values(raw.evaluation) as number[];
      const elemScore = capacity;
      const formScore = capacity;
      const mechScore = capacity;
      const basePower = calculateBasePower(capacity, elemScore, formScore, mechScore);
      const perUsePower = calculatePerUsePower(basePower, raw.usageCount);
      const totalOutput = calculateTotalOutput(basePower, raw.usageCount);
      const mpPerUse = calculateMPPerUse(perUsePower);

      return {
        ...raw,
        basePower: Math.round(basePower * natBonus),
        perUsePower: Math.round(perUsePower * natBonus),
        totalOutput: Math.round(totalOutput * natBonus),
        mpPerUse: Math.round(mpPerUse * natBonus),
        naturalLanguageBonus: natBonus,
      };
    });

    return variants;
  }

  validateSkill(variant: SkillVariant): { valid: boolean; reason?: string } {
    const dims = Object.values(variant.evaluation) as number[];

    for (const d of dims) {
      if (d < ABSOLUTE_RULES.DIMENSION_MIN || d > ABSOLUTE_RULES.DIMENSION_MAX) {
        return {
          valid: false,
          reason: `评分 ${d} 超出范围 [${ABSOLUTE_RULES.DIMENSION_MIN}, ${ABSOLUTE_RULES.DIMENSION_MAX}]`,
        };
      }
    }

    if (variant.usageCount < ABSOLUTE_RULES.USAGE_MIN || variant.usageCount > ABSOLUTE_RULES.USAGE_MAX) {
      return {
        valid: false,
        reason: `使用次数 ${variant.usageCount} 超出范围 [${ABSOLUTE_RULES.USAGE_MIN}, ${ABSOLUTE_RULES.USAGE_MAX}]`,
      };
    }

    return { valid: true };
  }
}