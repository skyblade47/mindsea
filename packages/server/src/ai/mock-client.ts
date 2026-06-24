import { v4 as uuidv4 } from 'uuid';
import type { IAIClient } from './client';
import type {
  FragmentInput,
  SkillVariant,
  SkillEvaluation,
  EnemyTemplate,
  SkillOp,
} from '@mindsea/shared';
import {
  calculateBasePower,
  calculatePerUsePower,
  calculateTotalOutput,
  calculateMPPerUse,
  calculateNaturalLanguageBonus,
} from '@mindsea/shared';

const DIMENSION_KEYS = ['power', 'scope', 'duration', 'flexibility', 'uniqueness', 'synergy'] as const;

function makeEvaluation(values: number[]): SkillEvaluation {
  const ev: Partial<SkillEvaluation> = {};
  DIMENSION_KEYS.forEach((key, i) => {
    ev[key] = values[i];
  });
  return ev as SkillEvaluation;
}

function buildVariant(
  name: string,
  description: string,
  evaluationValues: number[],
  usageCount: number,
  fragmentInput: FragmentInput,
  naturalLanguageBonus: number,
  ops: SkillOp[],
  extra: Partial<SkillVariant> = {},
): SkillVariant {
  const evaluation = makeEvaluation(evaluationValues);
  const qualityMap: Record<string, number> = {
    iron_word: 1,
    steel_word: 2,
    silver_sentence: 3,
    source_chapter: 4,
    divine_codex: 5,
  };
  const capacity = qualityMap[fragmentInput.quality] ?? 1;
  const elemScore = capacity;
  const formScore = capacity;
  const mechScore = capacity;
  const basePower = calculateBasePower(capacity, elemScore, formScore, mechScore);
  const perUsePower = calculatePerUsePower(basePower, usageCount);
  const totalOutput = calculateTotalOutput(basePower, usageCount);
  const mpPerUse = calculateMPPerUse(perUsePower);

  return {
    id: uuidv4(),
    name,
    description,
    evaluation,
    usageCount,
    type: extra.type ?? 'physical',
    basePower: Math.round(basePower * naturalLanguageBonus),
    perUsePower: Math.round(perUsePower * naturalLanguageBonus),
    totalOutput: Math.round(totalOutput * naturalLanguageBonus),
    mpPerUse: Math.round(mpPerUse * naturalLanguageBonus),
    naturalLanguageBonus,
    ops,
    ...extra,
  };
}

export class MockAIClient implements IAIClient {
  async generateSkillVariants(
    description: string,
    _constraints: string[],
    fragmentInput: FragmentInput,
  ): Promise<Omit<SkillVariant, 'perUsePower' | 'totalOutput' | 'mpPerUse' | 'basePower'>[]> {
    const descLen = description.length;
    const fragLen = 20;
    const natBonus = calculateNaturalLanguageBonus(descLen, fragLen);

    const qualityMap: Record<string, number> = {
      iron_word: 1,
      steel_word: 2,
      silver_sentence: 3,
      source_chapter: 4,
      divine_codex: 5,
    };
    const capacity = qualityMap[fragmentInput.quality] ?? 1;
    const elemScore = capacity;
    const formScore = capacity;
    const mechScore = capacity;
    const basePower = calculateBasePower(capacity, elemScore, formScore, mechScore);

    const scaledDamage = Math.round(basePower * natBonus);
    const mpCost = Math.round(calculateMPPerUse(calculatePerUsePower(basePower, 3)) * natBonus);

    const rawVariants: Omit<SkillVariant, 'perUsePower' | 'totalOutput' | 'mpPerUse' | 'basePower'>[] = [
      {
        id: uuidv4(),
        name: '炎爆术',
        description: '凝聚火焰元素释放爆炸性能量，灼烧敌人造成持续伤害',
        evaluation: makeEvaluation([8, 5, 2, 3, 4, 3]),
        usageCount: 2,
        type: 'magical',
        naturalLanguageBonus: natBonus,
        ops: [
          { op: 'add', target: 'enemy', path: 'hp', value: -scaledDamage },
          { op: 'set', target: 'enemy', path: 'dot.burn.value', value: Math.round(scaledDamage * 0.25) },
          { op: 'set', target: 'enemy', path: 'dot.burn.duration', value: 2 },
          { op: 'log', text: '火焰在敌人身上燃烧起来！' },
        ],
      },
      {
        id: uuidv4(),
        name: '冰霜护甲',
        description: '用寒冰之力包裹全身形成护盾，同时强化防御力',
        evaluation: makeEvaluation([3, 4, 7, 4, 5, 6]),
        usageCount: 3,
        type: 'magical',
        naturalLanguageBonus: natBonus,
        ops: [
          { op: 'add', target: 'self', path: 'shield', value: Math.round(scaledDamage * 0.9) },
          { op: 'add', target: 'self', path: 'defense', value: Math.round(capacity * 4) },
          { op: 'log', text: '寒冰覆盖全身，防御力提升！' },
        ],
      },
      {
        id: uuidv4(),
        name: '雷霆一击',
        description: '召唤闪电打击敌人，有几率使其麻痹',
        evaluation: makeEvaluation([7, 3, 2, 5, 6, 4]),
        usageCount: 4,
        type: 'magical',
        naturalLanguageBonus: natBonus,
        ops: [
          { op: 'add', target: 'enemy', path: 'hp', value: -Math.round(scaledDamage * 0.9) },
          {
            op: 'random',
            min: 1,
            max: 100,
            assignTo: 'stun_roll',
            then: [
              {
                op: 'if',
                cond: { type: 'compare', path: 'stun_roll', comparator: 'lte', value: 35 },
                then: [
                  { op: 'add', target: 'enemy', path: 'stun', value: 1 },
                  { op: 'log', text: '敌人被闪电麻痹，无法行动！' },
                ],
              },
            ],
          },
        ],
      },
    ];

    return rawVariants;
  }

  async generateNarrative(_context: string): Promise<string> {
    return '迷雾渐渐散去，你看到前方有一座古老的石碑，上面刻满了难以辨认的文字。空气中弥漫着神秘的气息，仿佛有什么力量在呼唤着你。';
  }

  async generateEnemy(_level: number, _seed: string): Promise<EnemyTemplate> {
    return {
      id: uuidv4(),
      name: '影狼',
      description: '从阴影中诞生的魔狼，行动迅捷如风',
      hp: 80,
      attack: 12,
      defense: 5,
      speed: 15,
      skills: [
        { name: '影爪', description: '用暗影凝聚的利爪攻击', power: 10, type: 'physical' },
        { name: '暗影突袭', description: '潜入阴影发动突袭', power: 15, type: 'special' },
      ],
    };
  }

  async evaluateSkill(_description: string): Promise<{ evaluation: SkillEvaluation; usageCount: number }> {
    return {
      evaluation: makeEvaluation([5, 5, 5, 5, 5, 5]),
      usageCount: 4,
    };
  }
}