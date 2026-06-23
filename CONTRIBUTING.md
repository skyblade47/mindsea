# Mindsea 开发工作规则

> AI 肉鸽文字冒险游戏 — 心智界：潜意识海

---

## 一、Git 工作流

### 分支策略：GitHub Flow

```
main (稳定版本)
 └── 直接提交 PR 合并
```

**规则：**
- `main` 是唯一长期分支，始终保持可发布状态
- 所有更改通过 Pull Request 引入
- 发布时打标签（`v1.0.0` 格式）

### Commit 规范：Conventional Commits

```
<type>(<scope>): <subject>

feat(creation): 添加自然语言加成系统
fix(combat): 修复战斗结算显示错误
docs(readme): 更新项目说明
style(ui): 调整按钮样式
refactor(engine): 重构技能生成逻辑
test(creation): 添加创作引擎单元测试
chore(deps): 升级依赖版本
```

**Type 类型：**
| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更改 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构（不影响功能） |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖更新 |

---

## 二、本地开发环境

### 快速启动

```bash
# 安装依赖
npm install

# 启动开发服务器（同时运行 server + client）
npm run dev
```

### 单独运行

```bash
npm run dev:server  # 仅后端
npm run dev:client  # 仅前端
```

### 构建生产版本

```bash
npm run build
```

---

## 三、代码规范

### Pre-commit Hooks

提交前自动执行检查：

- **ESLint** — TypeScript 代码检查
- **Prettier** — 代码格式化

### Lint 检查（手动）

```bash
# 检查代码
npm run lint

# 自动修复格式问题
npm run lint:fix
```

---

## 四、项目结构

```
mindsea/
├── docs/                    # 项目文档
│   ├── specs/              # 设计规格文档
│   ├── designs/            # 界面/功能设计
│   └── guides/             # 开发指南
├── packages/
│   ├── client/             # 前端 (React + Vite)
│   ├── server/             # 后端 (Express)
│   └── shared/             # 共享类型和常量
├── CONTRIBUTING.md         # 本文件
├── README.md               # 项目说明
└── package.json
```

---

## 五、模块职责

### packages/client

- 技术栈：React + TypeScript + Vite + TailwindCSS
- 页面：Prologue / Adventure / Creation / Combat / Settlement / Notebook
- 状态管理：React Context

### packages/server

- 技术栈：Express + TypeScript
- 游戏引擎：CreationEngine / AdventureEngine / CombatEngine / RuleEngine
- AI 集成：支持 Mock 模式和 OpenAI API

### packages/shared

- 共享类型定义
- 业务规则常量
- 碎片/技能等数据结构

---

## 六、文档规范

### 文档位置

- **设计文档** → `docs/specs/`
- **界面设计** → `docs/designs/`
- **开发指南** → `docs/guides/`
- **变更记录** → `CHANGELOG.md`

### 命名格式

```
YYYY-MM-DD-<主题>-<类型>.md

示例：
2026-06-23-unified-creation-v3-spec.md
2026-06-23-creation-ui-design.md
```

---

## 七、发布流程

1. 更新 `CHANGELOG.md`
2. 提交更改：`git add . && git commit -m "chore: prepare v1.0.0"`
3. 创建标签：`git tag v1.0.0`
4. 推送：`git push && git push --tags`

---

## 八、问题与反馈

- Issue：使用 GitHub Issues
- 讨论：使用 GitHub Discussions

---

*最后更新：2026-06-23*
