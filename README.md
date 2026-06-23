# Mindsea - 心智界：潜意识海

AI 驱动的肉鸽文字冒险游戏。玩家航行于心智界潜意识海，收集文明结晶碎片，通过自然语言描述将碎片铸造为力量，在 100 心智时的限制下面对默渊。

## 技术栈

- **前端**: React 19 + TypeScript + Vite + TailwindCSS
- **后端**: Express + TypeScript
- **Monorepo**: npm workspaces
- **AI**: OpenAI GPT-4o（支持 Mock 模式开发）

## 项目结构

```
mindsea/
├── packages/
│   ├── client/          # 前端应用
│   ├── server/          # 后端服务
│   └── shared/          # 共享类型和常量
├── docs/                # 项目文档
│   ├── specs/           # 设计规格文档
│   ├── designs/         # 界面/功能设计
│   └── guides/          # 开发指南
├── CONTRIBUTING.md      # 开发工作规则
└── package.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（同时运行 server + client）
npm run dev

# 分别启动
npm run dev:server  # 后端 (http://localhost:3001)
npm run dev:client  # 前端 (http://localhost:5173)

# 构建生产版本
npm run build
```

## 游戏系统

### 创作系统 (v3.0)
- **碎片素材**: 元素/形态/机制/品质 四类碎片决定技能强度上限
- **自然语言加成**: 描述字数比例影响技能效果
- **古代提示词**: 探索收集碎片，拼凑完整预设技能

### 核心引擎
- `CreationEngine` - 技能生成与验证
- `AdventureEngine` - 冒险剧情节点
- `CombatEngine` - 回合制战斗
- `RuleEngine` - 业务规则计算

## 开发规范

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

- Git 流程: GitHub Flow
- Commit 规范: Conventional Commits
- 代码检查: ESLint + Prettier (pre-commit hooks)

## 文档

- [项目规划](docs/specs/2026-06-23-project-planning-spec.md)
- [全局架构](docs/specs/2026-06-23-global-architecture-spec.md)
- [统一创作架构 v3.0](docs/specs/2026-06-23-unified-creation-v3-spec.md)
- [实现计划](docs/guides/2026-06-23-implementation-plan-guide.md)

## License

MIT
