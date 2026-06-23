import { Router, Request, Response, NextFunction } from 'express';
import type {
  ProceedRequest,
  CreateSkillRequest,
  SelectSkillRequest,
  CombatActionRequest,
  ApiResponse,
  AdventureState,
  AdventureNode,
  SkillVariant,
  CombatAction,
} from '@mindsea/shared';

export const apiRouter = Router();

// ---- Adventure ----

apiRouter.post('/adventure/start', (_req: Request, res: Response) => {
  const mockAdventure: AdventureState = {
    timeRemaining: 100,
    skillPoints: 10,
    level: 1,
    exp: 0,
    attributes: { str: 1, agi: 1, int: 1, vit: 1, mnd: 1, per: 1 },
    attrExp: { str: 0, agi: 0, int: 0, vit: 0, mnd: 0, per: 0 },
    skills: [],
    skillSlotLimit: 3,
    currentNode: 0,
    nodes: [],
    completedNodes: [],
    storyLog: [],
    status: 'active',
    materials: [],
    fragmentInventory: [],
  };
  const response: ApiResponse<AdventureState> = { success: true, data: mockAdventure };
  res.json(response);
});

apiRouter.post('/adventure/proceed', (req: Request, res: Response) => {
  const body = req.body as ProceedRequest;
  const mockNode: AdventureNode = {
    id: 'node_mock_001',
    type: 'event',
    title: '遭遇',
    description: '你在迷雾中发现了一个古老的遗迹...',
    choices: [
      { id: 'choice_1', text: '探索遗迹', nodeType: 'treasure' },
      { id: 'choice_2', text: '继续前行', nodeType: 'event' },
    ],
  };
  const response: ApiResponse<{ node: AdventureNode }> = {
    success: true,
    data: { node: mockNode },
  };
  res.json(response);
});

apiRouter.get('/adventure/:id', (req: Request, res: Response) => {
  const mockAdventure: AdventureState = {
    timeRemaining: 100,
    skillPoints: 10,
    level: 1,
    exp: 0,
    attributes: { str: 1, agi: 1, int: 1, vit: 1, mnd: 1, per: 1 },
    attrExp: { str: 0, agi: 0, int: 0, vit: 0, mnd: 0, per: 0 },
    skills: [],
    skillSlotLimit: 3,
    currentNode: 0,
    nodes: [],
    completedNodes: [],
    storyLog: [],
    status: 'active',
    materials: [],
    fragmentInventory: [],
  };
  const response: ApiResponse<AdventureState> = { success: true, data: mockAdventure };
  res.json(response);
});

// ---- Skill ----

apiRouter.post('/skill/create', (req: Request, res: Response) => {
  const body = req.body as CreateSkillRequest;
  const mockVariants: SkillVariant[] = [
    {
      id: 'skill_mock_001',
      name: '烈焰斩',
      description: '凝聚火焰之力斩向敌人',
      evaluation: { power: 7, scope: 3, duration: 2, flexibility: 4, uniqueness: 5, synergy: 3 },
      usageCount: 3,
      basePower: 24,
      perUsePower: 16,
      totalOutput: 48,
      mpPerUse: 10,
      naturalLanguageBonus: 1.0,
    },
    {
      id: 'skill_mock_002',
      name: '冰霜新星',
      description: '爆发寒冰能量冻结周围敌人',
      evaluation: { power: 5, scope: 7, duration: 4, flexibility: 3, uniqueness: 6, synergy: 4 },
      usageCount: 5,
      basePower: 24,
      perUsePower: 13,
      totalOutput: 65,
      mpPerUse: 8,
      naturalLanguageBonus: 1.0,
    },
    {
      id: 'skill_mock_003',
      name: '暗影步',
      description: '潜入阴影之中发动突袭',
      evaluation: { power: 4, scope: 2, duration: 6, flexibility: 8, uniqueness: 7, synergy: 5 },
      usageCount: 8,
      basePower: 24,
      perUsePower: 11,
      totalOutput: 88,
      mpPerUse: 7,
      naturalLanguageBonus: 1.0,
    },
  ];
  const response: ApiResponse<{ variants: SkillVariant[]; timeCost: number; spCost: number }> = {
    success: true,
    data: { variants: mockVariants, timeCost: 16, spCost: 6 },
  };
  res.json(response);
});

apiRouter.post('/skill/select', (req: Request, res: Response) => {
  const body = req.body as SelectSkillRequest;
  const response: ApiResponse<{ selected: boolean; slotIndex: number }> = {
    success: true,
    data: { selected: true, slotIndex: body.variantIndex },
  };
  res.json(response);
});

apiRouter.post('/skill/retry', (_req: Request, res: Response) => {
  const mockVariants: SkillVariant[] = [
    {
      id: 'skill_mock_retry_001',
      name: '雷霆一击',
      description: '召唤雷电之力劈向敌人',
      evaluation: { power: 8, scope: 4, duration: 2, flexibility: 3, uniqueness: 6, synergy: 4 },
      usageCount: 2,
      basePower: 24,
      perUsePower: 18,
      totalOutput: 36,
      mpPerUse: 11,
      naturalLanguageBonus: 1.0,
    },
    {
      id: 'skill_mock_retry_002',
      name: '风暴之眼',
      description: '在自身周围制造风暴领域',
      evaluation: { power: 6, scope: 6, duration: 5, flexibility: 2, uniqueness: 7, synergy: 5 },
      usageCount: 4,
      basePower: 24,
      perUsePower: 14,
      totalOutput: 56,
      mpPerUse: 9,
      naturalLanguageBonus: 1.0,
    },
    {
      id: 'skill_mock_retry_003',
      name: '时间扭曲',
      description: '扭曲时间流速获得先机',
      evaluation: { power: 3, scope: 5, duration: 7, flexibility: 7, uniqueness: 9, synergy: 6 },
      usageCount: 7,
      basePower: 24,
      perUsePower: 12,
      totalOutput: 84,
      mpPerUse: 8,
      naturalLanguageBonus: 1.0,
    },
  ];
  const response: ApiResponse<{ variants: SkillVariant[]; timeCost: number; spCost: number }> = {
    success: true,
    data: { variants: mockVariants, timeCost: 13, spCost: 7 },
  };
  res.json(response);
});

// ---- Combat ----

apiRouter.post('/combat/action', (req: Request, res: Response) => {
  const body = req.body as CombatActionRequest;
  const response: ApiResponse<{ turnResult: string; enemyHp: number; playerHp: number }> = {
    success: true,
    data: { turnResult: `玩家执行了 ${body.action.type} 行动`, enemyHp: 80, playerHp: 90 },
  };
  res.json(response);
});

apiRouter.post('/combat/start', (_req: Request, res: Response) => {
  const response: ApiResponse<{ combatId: string; enemyName: string; enemyHp: number; playerHp: number }> = {
    success: true,
    data: { combatId: 'combat_mock_001', enemyName: '影狼', enemyHp: 100, playerHp: 100 },
  };
  res.json(response);
});