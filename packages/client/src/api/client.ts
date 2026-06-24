import type {
  ApiResponse,
  AdventureState,
  AdventureNode,
  CreateSkillRequest,
  CreateSkillResponse,
  SelectSkillRequest,
  ProceedRequest,
  CombatActionRequest,
  CombatResult,
  Settlement,
  EnemyTemplate,
  CombatAction,
  SkillVariant,
} from '@mindsea/shared';

const apiBase = '';

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${apiBase}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorBody || response.statusText}`,
      };
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '网络请求失败',
    };
  }
}

/** 开始新冒险 */
export function startAdventure(): Promise<ApiResponse<{ adventureId: string; state: AdventureState }>> {
  return request<{ adventureId: string; state: AdventureState }>('/api/adventure/start', { method: 'POST' });
}

/** 推进到指定节点 */
export function proceedToNode(adventureId: string, nodeIndex: number): Promise<ApiResponse<{ node: AdventureNode; state: AdventureState }>> {
  const body = { adventureId, nodeIndex };
  return request<{ node: AdventureNode; state: AdventureState }>('/api/adventure/proceed', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 解析节点选择 */
export function resolveNode(adventureId: string, choiceId: string): Promise<ApiResponse<{ rewards: { exp: number; fragments: number; timeCost: number }; leveledUp: boolean; newExp: number; newLevel: number; state: AdventureState }>> {
  const body = { adventureId, choiceId };
  return request('/api/adventure/resolve', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 创建技能（铸造） */
export function generateSkill(
  adventureId: string,
  fragmentInput: CreateSkillRequest['fragmentInput'],
  description: string,
  constraints?: string[],
): Promise<ApiResponse<CreateSkillResponse>> {
  const body: CreateSkillRequest = { adventureId, fragmentInput, description, constraints };
  return request<CreateSkillResponse>('/api/skill/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 选择技能变体 */
export function selectSkill(
  adventureId: string,
  variantIndex: number,
  selectedVariant: SkillVariant,
  timeCost: number,
): Promise<ApiResponse<{ skill: SkillVariant & { slotIndex: number; createdAt: number }; state: AdventureState }>> {
  const body: SelectSkillRequest = { adventureId, variantIndex, selectedVariant, timeCost };
  return request('/api/skill/select', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 重试铸造 */
export function retrySkill(
  adventureId: string,
  fragmentInput: CreateSkillRequest['fragmentInput'],
  description?: string,
  constraints?: string[],
): Promise<ApiResponse<CreateSkillResponse>> {
  const body = { adventureId, fragmentInput, description: description || 'retry', constraints };
  return request<CreateSkillResponse>('/api/skill/retry', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 开始战斗 */
export function startCombat(adventureId: string, enemyLevel?: number): Promise<ApiResponse<{ id: string; adventureId: string; player: { name: string; hp: number; maxHp: number; mp: number; maxMp: number; attack: number; defense: number; skills: SkillVariant[] }; enemy: { name: string; hp: number; maxHp: number; attack: number; defense: number; skills: { name: string; description: string; power: number; type: string }[] }; turn: number; log: { turn: number; actor: string; action: string; value: number; description: string }[]; status: string }>> {
  return request('/api/combat/start', {
    method: 'POST',
    body: JSON.stringify({ adventureId, enemyLevel }),
  });
}

/** 执行战斗行动 */
export function combatAction(
  combatId: string,
  action: CombatAction,
): Promise<ApiResponse<{ id: string; adventureId: string; player: { name: string; hp: number; maxHp: number; mp: number; maxMp: number; attack: number; defense: number; skills: SkillVariant[] }; enemy: { name: string; hp: number; maxHp: number; attack: number; defense: number; skills: { name: string; description: string; power: number; type: string }[] }; turn: number; log: { turn: number; actor: string; action: string; value: number; description: string }[]; status: string }>> {
  const body = { combatId, action };
  return request('/api/combat/action', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 战斗结算 */
export function resolveCombat(combatId: string): Promise<ApiResponse<{ won: boolean; expGained: number; fragmentsGained: string[] }>> {
  return request('/api/combat/resolve', {
    method: 'POST',
    body: JSON.stringify({ combatId }),
  });
}

/** 获取冒险状态 */
export function getAdventure(adventureId: string): Promise<ApiResponse<AdventureState>> {
  return request<AdventureState>(`/api/adventure/${adventureId}`);
}
