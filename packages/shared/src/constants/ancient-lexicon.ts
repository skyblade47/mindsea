export interface AncientLexiconEntry {
  id: string;
  name: string;
  source: string;
  fragment: string;
  requiredPieces: string[];
  pieceCount: number;
  effect: string;
  skillName: string;
  skillDescription: string;
  evaluation: Record<string, number>;
  usageCount: number;
}

export const ANCIENT_LEXICON: AncientLexiconEntry[] = [
  {
    id: 'endless_river',
    name: '川流不息',
    source: '《论语》',
    fragment: '逝者如斯夫，不舍昼夜。',
    requiredPieces: ['川', '流', '不', '息', '昼夜'],
    pieceCount: 5,
    effect: '无消耗铸造，每回合自动恢复少量MP',
    skillName: '川流不息',
    skillDescription: '如河水般源源不断的力量，每回合自动恢复少量精力。',
    evaluation: {
      power: 2,
      scope: 3,
      duration: 10,
      flexibility: 7,
      uniqueness: 5,
      synergy: 6,
    },
    usageCount: 10,
  },
  {
    id: 'thousand_miles',
    name: '跬步之至',
    source: '《道德经》',
    fragment: '千里之行，始于足下。',
    requiredPieces: ['千里', '行', '始于', '足下'],
    pieceCount: 4,
    effect: '无消耗铸造，每次使用叠加伤害',
    skillName: '跬步之至',
    skillDescription:
      '每一次攻击都比上一次更强——千里之行，始于足下。',
    evaluation: {
      power: 4,
      scope: 3,
      duration: 9,
      flexibility: 5,
      uniqueness: 7,
      synergy: 4,
    },
    usageCount: 8,
  },
];