import type {
  ApiResponse,
  AdventureState,
  CreateSkillRequest,
  CreateSkillResponse,
  SelectSkillRequest,
  ProceedRequest,
  CombatActionRequest,
  CombatResult,
  Settlement,
  EnemyTemplate,
  CombatAction,
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
export function startAdventure(): Promise<ApiResponse<AdventureState>> {
  return request<AdventureState>('/api/adventure/start', { method: 'POST' });
}

/** 推进到指定节点 */
export function proceedToNode(adventureId: string, nodeIndex: number): Promise<ApiResponse<AdventureState>> {
  const body: ProceedRequest = { adventureId, nodeIndex };
  return request<AdventureState>('/api/adventure/proceed', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 创建技能（铸造） */
export function createSkill(
  adventureId: string,
  fragmentInput: CreateSkillRequest['fragmentInput'],
  description: string,
  constraints?: string[],
): Promise<ApiResponse<CreateSkillResponse>> {
  const body: CreateSkillRequest = { adventureId, fragmentInput, description, constraints };
  return request<CreateSkillResponse>('/api/creation/create', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 选择技能变体 */
export function selectSkill(adventureId: string, variantIndex: number): Promise<ApiResponse<AdventureState>> {
  const body: SelectSkillRequest = { adventureId, variantIndex };
  return request<AdventureState>('/api/creation/select', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 重试铸造 */
export function retryCreate(
  adventureId: string,
  fragmentInput: CreateSkillRequest['fragmentInput'],
  description: string,
  constraints?: string[],
): Promise<ApiResponse<CreateSkillResponse>> {
  const body: CreateSkillRequest = { adventureId, fragmentInput, description, constraints };
  return request<CreateSkillResponse>('/api/creation/retry', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 开始战斗 */
export function startCombat(adventureId: string, enemyTemplate: EnemyTemplate): Promise<ApiResponse<CombatResult>> {
  return request<CombatResult>('/api/combat/start', {
    method: 'POST',
    body: JSON.stringify({ adventureId, enemyTemplate }),
  });
}

/** 执行战斗行动 */
export function combatAction(combatId: string, action: CombatAction): Promise<ApiResponse<CombatResult>> {
  const body: CombatActionRequest = { combatId, action };
  return request<CombatResult>('/api/combat/action', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 获取结算 */
export function getSettlement(adventureId: string): Promise<ApiResponse<Settlement>> {
  return request<Settlement>(`/api/adventure/settlement?adventureId=${encodeURIComponent(adventureId)}`);
}