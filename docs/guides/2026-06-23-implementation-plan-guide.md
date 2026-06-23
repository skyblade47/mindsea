# 心智界：西西弗斯之石 — 实现计划 (MVP)

> **For agentic workers:** Use subagent-driven-development to implement task-by-task.

**Goal:** 构建纯文字AI肉鸽游戏MVP，玩家航行于心智界潜意识海，收集文明结晶碎片，通过自然语言描述将碎片铸造为力量，在100心智时的限制下面对默渊。

**Architecture:** 单体Node.js后端 + React前端。六个引擎模块，前后端REST API通信。AI调用通过抽象层隔离，MVP支持Mock和真实API双模式。

**Tech Stack:** Node.js 20+, TypeScript, Express, PostgreSQL, React 19, Vite, Tailwind CSS, OpenAI GPT-4o

---

## 项目结构

```
mindsea/
├── packages/
│   ├── server/
│   │   └── src/
│   │       ├── index.ts, config.ts
│   │       ├── api/         (adventure.ts, creation.ts, combat.ts, player.ts, router.ts)
│   │       ├── engines/
│   │       │   ├── rules/   (engine.ts, validator.ts)
│   │       │   ├── creation/(engine.ts, fragment-system.ts, prompt-analyzer.ts, natural-language-bonus.ts)
│   │       │   ├── combat/  (engine.ts, resolver.ts)
│   │       │   └── adventure/(engine.ts, map-generator.ts, settlement.ts)
│   │       ├── ai/          (client.ts, mock-client.ts, openai-client.ts, parser.ts, prompts/)
│   │       ├── state/       (serializer.ts)
│   │       └── middleware/  (auth.ts, error-handler.ts)
│   ├── client/
│   │   └── src/
│   │       ├── main.tsx, App.tsx
│   │       ├── pages/       (Prologue, Adventure, Creation, Combat, Notebook, Settlement)
│   │       ├── components/  (NarrativeText, FragmentSlot, SkillVariant, CombatLog, StatusBar, ChoiceButton)
│   │       ├── hooks/       (useAdventure, useCombat, useCreation)
│   │       ├── api/         (client.ts)
│   │       └── state/       (adventure-store.ts)
│   └── shared/
│       └── src/
│           ├── types/       (adventure, skill, combat, fragment, player, api)
│           ├── constants/   (rules, fragments, ancient-lexicon)
│           └── index.ts
└── docs/
```

---

## Phase 0: 项目初始化 (Tasks 0.1-0.2)

### Task 0.1: 创建项目结构与核心类型

**Files:**
- Create: `packages/shared/src/types/*.ts`（全部6个类型文件）
- Create: `packages/shared/src/constants/rules.ts`（L0绝对骨架 + 全部公式）
- Create: `packages/shared/src/constants/fragments.ts`（碎片定义表）
- Create: `packages/shared/src/index.ts`
- Create: 各 package.json, tsconfig.json, vite.config.ts

### Task 0.2: 服务器骨架 + 规则引擎 + Mock AI

**Files:**
- Create: `packages/server/src/index.ts`, `config.ts`
- Create: `packages/server/src/middleware/auth.ts`, `error-handler.ts`
- Create: `packages/server/src/engines/rules/engine.ts`, `validator.ts`
- Create: `packages/server/src/ai/client.ts`, `mock-client.ts`, `parser.ts`, `prompts/skill-creation.ts`

---

## Phase 1: 创作引擎 (Tasks 1.1-1.2)

### Task 1.1: 碎片系统 + 提示词分析器 + 加成计算

### Task 1.2: 创作引擎 + API端点

---

## Phase 2: 战斗引擎 + 冒险引擎 (Tasks 2.1-2.2)

### Task 2.1: 战斗引擎

**伤害公式（L0硬编码）：**
```
伤害 = 技能单次强度 × (1 + 属性加成) - 敌人防御
属性加成 = 物理型→力量×0.05, 魔法型→智力×0.05
暴击率 = 5% + 敏捷×0.5%
```

### Task 2.2: 冒险引擎 + 地图生成

---

## Phase 3: 古代提示词系统 (Task 3.1)

### Task 3.1: 记事本 + 收藏本

---

## Phase 4: 前端界面 (Tasks 4.1-4.4)

### Task 4.1: 基础框架 + 状态管理

### Task 4.2: 冒险主界面

### Task 4.3: 铸造界面

### Task 4.4: 战斗界面 + 记事本

---

## Phase 5: 真实AI接入 (Task 5.1)

### Task 5.1: OpenAI客户端 + 成本控制

---

## Phase 6: 完整游戏流程串联 (Tasks 6.1-6.3)

### Task 6.1: 序章实现

### Task 6.2: 结算 + 跨局循环

### Task 6.3: 数据库 + 持久化

---

## 验证检查点

在每个Phase完成后，进行以下手动验证：

| Phase | 验证内容 |
|-------|---------|
| 0 | TypeScript编译通过，共享类型无报错，npm install成功 |
| 1 | POST /api/skill/generate 返回3个变体（Mock模式），select成功扣碎片+返回CraftedSkill |
| 2 | 完整战斗流程：开始→使用技能→敌人行动→结算，属性成长正确 |
| 3 | 探索事件掉落古代碎片，记事本追踪进度，完整后铸造古典技能 |
| 4 | 前端页面渲染，状态栏实时更新，铸造界面交互正常 |
| 5 | 真实AI返回3变体JSON，规则验证通过，成本控制在预算内 |
| 6 | 序章→正篇→多次冒险→结算→重开 完整流程可运行 |

---

*文档版本：v1.0*
*创建日期：2026-06-23*
