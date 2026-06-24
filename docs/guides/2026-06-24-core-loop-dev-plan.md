# 核心闭环开发计划 (MVP v0.1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建可运行的游戏核心闭环 — 玩家可以开始冒险、探索节点、战斗、创作技能、结算，形成完整循环。

**Architecture:** 后端 Express + 游戏引擎层，前端 React 调用真实 API。Mock AI 驱动内容生成。全内存存储（MVP 阶段）。

**Tech Stack:** TypeScript, Express, React 19, Vite, TailwindCSS, uuid

---

## 任务清单

### Task 1: 完善服务层 - 引擎实例化与 API 接入

**Files:**
- Modify: `packages/server/src/index.ts`
- Create: `packages/server/src/services/game-service.ts`
- Modify: `packages/server/src/api/routes.ts`

**目标:** 让 API 路由不再返回硬编码 mock，而是调用真实的游戏引擎。

- [ ] **Step 1: 创建 GameService 单例**

```typescript
// packages/server/src/services/game-service.ts
import { AdventureEngine } from '../engines/adventure/adventure-engine';
import { CombatEngine } from '../engines/combat/combat-engine';
import { CreationEngine } from '../engines/creation/creation-engine';
import { MockAIClient } from '../ai/mock-client';
import { config } from '../config';

export class GameService {
  private static instance: GameService;
  public adventureEngine: AdventureEngine;
  public combatEngine: CombatEngine;
  public creationEngine: CreationEngine;
  public aiClient: MockAIClient;

  private constructor() {
    this.aiClient = new MockAIClient();
    this.adventureEngine = new AdventureEngine();
    this.combatEngine = new CombatEngine();
    this.creationEngine = new CreationEngine(this.aiClient);
  }

  static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }
}
```

- [ ] **Step 2: 修改 routes.ts 接入真实引擎**

将 `/adventure/start` 改为调用 `gameService.adventureEngine.startAdventure()`，返回真实的 AdventureState。
将 `/adventure/proceed` 改为调用 `gameService.adventureEngine.proceedToNode()`。
将 `/adventure/:id` 改为调用 `gameService.adventureEngine.getAdventure()`。

- [ ] **Step 3: 验证构建**
```bash
cd mindsea && npm run build
```
Expected: build success, no type errors

- [ ] **Step 4: Commit**
```bash
git add packages/server/src
git commit -m "feat(server): integrate real game engines into API routes"
```

---

### Task 2: 完善冒险引擎 - 节点解析与奖励系统

**Files:**
- Modify: `packages/server/src/engines/adventure/adventure-engine.ts`
- Modify: `packages/shared/src/types/adventure.ts`
- Modify: `packages/shared/src/types/player.ts`

**目标:** 玩家选择节点后能获得对应奖励（经验、碎片、技能点），升级时属性成长。

- [ ] **Step 1: 在 shared types 中定义 NodeRewards**

```typescript
// packages/shared/src/types/adventure.ts
export interface NodeRewards {
  exp: number;
  skillPoints: number;
  fragments: string[];
  gold?: number;
}
```

- [ ] **Step 2: 在 AdventureEngine 中添加 resolveNode 方法**

```typescript
resolveNode(adventureId: string, choiceId: string): {
  node: AdventureNode;
  rewards: NodeRewards;
  leveledUp: boolean;
} {
  // 1. 获取状态
  // 2. 根据节点类型计算奖励
  //    - combat: exp=20, fragments=1
  //    - elite: exp=50, fragments=2, skillPoints=1
  //    - boss: exp=100, fragments=3, skillPoints=2
  //    - event: exp=10, 随机
  //    - treasure: fragments=2
  //    - rest: 恢复 HP/MP
  //    - forge: 无奖励，跳转到创作
  // 3. 应用奖励到状态
  // 4. 检查升级，升级时增加属性和技能槽
}
```

- [ ] **Step 3: 升级系统**

使用 `calculateLevelUpExp(level)` 计算升级所需经验。升级时：
- `level++`
- `skillSlotLimit = calculateSlotLimit(level)`
- 所有属性 +1

- [ ] **Step 4: 验证构建**
```bash
cd mindsea && npm run build
```
Expected: build success

- [ ] **Step 5: Commit**
```bash
git add packages/
git commit -m "feat(engine): add node resolution, rewards, and level-up system"
```

---

### Task 3: 完善创作引擎 - 碎片系统与 3 选 1 流程

**Files:**
- Modify: `packages/server/src/engines/creation/creation-engine.ts`
- Modify: `packages/shared/src/types/fragment.ts`
- Modify: `packages/shared/src/constants/fragments.ts`

**目标:** 创作流程完整可用 — 玩家用碎片 + 描述生成 3 个技能变体，选择后消耗碎片并加入技能栏。

- [ ] **Step 1: 完善碎片类型定义**

确保 `FRAGMENTS` 常量包含：
- 元素碎片 (火、冰、雷、暗影、神圣、自然)
- 形态碎片 (单体、范围、穿透、连锁、持续、爆发)
- 机制碎片 (吸血、反弹、护盾、净化、召唤)
- 品质碎片 (凡铁/iron_word, 精钢/steel_word, 秘银/silver_sentence, 源质/source_chapter, 神骸/divine_codex)

- [ ] **Step 2: CreationEngine 添加 selectSkill 方法**

```typescript
selectSkill(
  adventureState: AdventureState,
  variants: SkillVariant[],
  variantIndex: number,
): { skill: Skill; newState: AdventureState } {
  // 1. 验证 variantIndex 有效
  // 2. 检查技能槽是否已满
  // 3. 消耗碎片 (从 fragmentInventory 中移除投入的碎片)
  // 4. 消耗时间 (使用 calculateTimeCost)
  // 5. 将技能加入 skills 数组，分配 slotIndex
  // 6. 返回新技能和更新后的状态
}
```

- [ ] **Step 3: 初始碎片分配**

在 `AdventureEngine.startAdventure()` 中给玩家初始碎片：
- 凡铁碎片 ×1
- 火焰碎片 ×1
- 单体碎片 ×1

- [ ] **Step 4: 验证构建**
```bash
cd mindsea && npm run build
```
Expected: build success

- [ ] **Step 5: Commit**
```bash
git add packages/
git commit -m "feat(creation): complete fragment system and skill selection flow"
```

---

### Task 4: 完善战斗引擎 - 技能使用与敌人技能

**Files:**
- Modify: `packages/server/src/engines/combat/combat-engine.ts`
- Modify: `packages/shared/src/types/combat.ts`

**目标:** 战斗中可以使用已创作的技能，敌人有自己的技能，伤害计算基于技能属性。

- [ ] **Step 1: CombatState 添加技能和 MP**

在 combat-engine.ts 的 CombatState 中添加：
```typescript
player: {
  // ... existing fields
  mp: number;
  maxMp: number;
  skills: Skill[];  // 玩家已有的技能
};
enemy: {
  // ... existing fields
  skills: EnemySkill[];
};
```

- [ ] **Step 2: startCombat 从冒险状态构建**

```typescript
startCombat(adventureState: AdventureState, enemyTemplate: EnemyTemplate): CombatState {
  // 从冒险状态获取玩家 HP/MP/技能/属性
  // 属性转攻击/防御：str→attack, vit→defense
}
```

- [ ] **Step 3: processAction 支持技能使用**

当 `action.type === 'skill'` 且 `action.skillId` 存在时：
- 找到对应技能
- 检查 MP 是否足够 (mpPerUse)
- 检查使用次数是否已用完
- 计算伤害 = perUsePower × (1 + int×0.05) - enemyDefense
- 消耗 MP
- 减少使用次数

- [ ] **Step 4: 敌人回合使用技能**

敌人回合从 `enemy.skills` 中随机选一个技能使用，伤害计算类似。

- [ ] **Step 5: 战斗结算 - 碎片掉落**

战斗胜利后，根据敌人类型掉落碎片：
- 普通：1 个元素/形态碎片
- 精英：1 个机制碎片 + 1 个品质碎片
- BOSS：2 个品质碎片 + 1 个核心碎片

- [ ] **Step 6: 验证构建**
```bash
cd mindsea && npm run build
```
Expected: build success

- [ ] **Step 7: Commit**
```bash
git add packages/
git commit -m "feat(combat): add skill usage, enemy skills, and combat rewards"
```

---

### Task 5: API 路由完善 - 创作和战斗接口

**Files:**
- Modify: `packages/server/src/api/routes.ts`

**目标:** 所有 API 接口接入真实引擎，支持完整游戏流程。

- [ ] **Step 1: 完善冒险相关接口**
  - `POST /adventure/start` — 调用引擎，返回真实状态
  - `POST /adventure/proceed` — 推进节点，返回节点 + 奖励
  - `POST /adventure/resolve` — 解析节点选择，应用奖励
  - `GET /adventure/:id` — 获取当前冒险状态

- [ ] **Step 2: 完善创作相关接口**
  - `POST /skill/generate` — 生成 3 个技能变体
  - `POST /skill/select` — 选择技能，消耗碎片和时间
  - `POST /skill/retry` — 重新生成，额外消耗时间

- [ ] **Step 3: 完善战斗相关接口**
  - `POST /combat/start` — 开始战斗
  - `POST /combat/action` — 执行战斗行动
  - `POST /combat/resolve` — 战斗结算，获得奖励

- [ ] **Step 4: 验证构建**
```bash
cd mindsea && npm run build
```
Expected: build success

- [ ] **Step 5: Commit**
```bash
git add packages/server/src/api/routes.ts
git commit -m "feat(api): complete all API routes with real engine integration"
```

---

### Task 6: 前端联调 - 冒险页面

**Files:**
- Modify: `packages/client/src/hooks/useApi.ts`
- Modify: `packages/client/src/hooks/useGame.ts`
- Modify: `packages/client/src/pages/Adventure.tsx`
- Modify: `packages/client/src/context/GameContext.tsx`

**目标:** 前端冒险页面调用真实 API，状态与后端同步。

- [ ] **Step 1: 完善 useApi hook**

封装所有 API 调用，使用 fetch：
```typescript
// useApi.ts 导出
const api = {
  startAdventure: () => Promise<AdventureState>,
  proceedAdventure: (nodeIndex: number) => Promise<{ node: AdventureNode }>,
  resolveNode: (choiceId: string) => Promise<{ rewards: NodeRewards; leveledUp: boolean }>,
  getAdventure: (id: string) => Promise<AdventureState>,
  generateSkill: (request: CreateSkillRequest) => Promise<CreationResult>,
  selectSkill: (request: SelectSkillRequest) => Promise<{ skill: Skill }>,
  startCombat: () => Promise<any>,
  combatAction: (action: CombatAction) => Promise<any>,
};
```

- [ ] **Step 2: 完善 GameContext**

在 GameContext 中添加 `startAdventure`、`proceedToNode`、`resolveChoice` 等方法，内部调用 useApi 并更新 gameState。

- [ ] **Step 3: Adventure 页面接入真实数据**

- 开始冒险按钮 → 调用 startAdventure
- 节点选择 → 调用 resolveChoice，更新状态
- 状态栏显示真实数据

- [ ] **Step 4: 验证构建**
```bash
cd mindsea && npm run build
```
Expected: build success

- [ ] **Step 5: Commit**
```bash
git add packages/client/src
git commit -m "feat(client): integrate adventure page with real API"
```

---

### Task 7: 前端联调 - 创作和战斗页面

**Files:**
- Modify: `packages/client/src/pages/Creation.tsx`
- Modify: `packages/client/src/pages/Combat.tsx`

**目标:** 创作和战斗页面也接入真实 API。

- [ ] **Step 1: Creation 页面**
- 显示玩家碎片库存
- 碎片拖放/点击放入熔炉
- 描述输入框
- 生成按钮 → 调用 generateSkill API
- 3 选 1 展示
- 选择 → 调用 selectSkill API
- 成功后返回冒险页面

- [ ] **Step 2: Combat 页面**
- 显示敌我 HP/MP 条
- 显示玩家技能列表（带剩余次数）
- 点击技能 → 调用 combatAction API
- 战斗日志展示
- 胜利/失败后跳转到对应页面

- [ ] **Step 3: 验证构建**
```bash
cd mindsea && npm run build
```
Expected: build success

- [ ] **Step 4: Commit**
```bash
git add packages/client/src/pages
git commit -m "feat(client): integrate creation and combat pages with real API"
```

---

### Task 8: 序章和结算页面

**Files:**
- Create/Modify: `packages/client/src/pages/Prologue.tsx`
- Create/Modify: `packages/client/src/pages/Settlement.tsx`

**目标:** 完整游戏闭环 — 序章 → 冒险 → 战斗/创作 → 结算 → 重开。

- [ ] **Step 1: 序章页面**
- 显示游戏标题和简介
- "开始冒险" 按钮
- 点击后调用 startAdventure API
- 跳转到冒险页面

- [ ] **Step 2: 结算页面**
- 显示本次冒险得分
- 显示获得的经验和碎片
- "再次启航" 按钮 → 重置并开始新冒险

- [ ] **Step 3: 验证构建**
```bash
cd mindsea && npm run build
```
Expected: build success

- [ ] **Step 4: Commit**
```bash
git add packages/client/src/pages
git commit -m "feat(client): complete prologue and settlement pages"
```

---

### Task 9: 端到端验证

**Files:** N/A (testing)

**目标:** 验证完整游戏流程可运行。

- [ ] **Step 1: 启动开发服务器**
```bash
cd mindsea && npm run dev
```
Expected: server starts on port 3001, client on 5173

- [ ] **Step 2: 手动测试流程**
1. 打开 http://localhost:5173
2. 点击开始冒险 → 进入冒险页面
3. 选择前进 → 进入战斗节点
4. 战斗 → 胜利 → 获得奖励
5. 进入创作页面 → 用碎片+描述生成技能
6. 选择技能 → 加入技能栏
7. 继续冒险 → 经历多个节点
8. 到达 BOSS → 战斗 → 结算

- [ ] **Step 3: 修复发现的问题**
- [ ] **Step 4: 最终构建验证**
```bash
cd mindsea && npm run build
```

- [ ] **Step 5: Commit (如有修复)**
```bash
git add .
git commit -m "fix: resolve e2e test issues"
```

---

## 计划完成后

核心闭环完成后，下一步可以开发：
- 古代提示词系统 (Notebook)
- 真实 AI 接入 (OpenAI)
- 数据库持久化
- 玩家账号系统
