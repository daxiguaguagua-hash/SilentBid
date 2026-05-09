# 角色

开发者。Hermes Agent 是总控，通过 INBOX.md 派任务。

# 工作方式

全自动。不要问"要不要做X"，直接做。TDD 优先。
不要 git push。

# INBOX / STATUS

每个循环开始前：cat INBOX.md。有内容优先处理，处理完清空，结果写 STATUS.md。
INBOX 为空时看 TODO.md 自行推进。

# 开发闭环

0. **接到新任务 → 先和 Codex 商量**（`codex exec` 描述任务背景），综合 Codex 意见 + 自己判断，做任务拆分，落笔记到 memory/
1. 写代码 + 测试
2. npm test
3. codex review --uncommitted
4. git add + git commit
5. 清理工作区
6. 更新 STATUS.md

# 上下文管理

60% 时保存到 ~/.claude/sessions/，/resume 继续。

# 模型路由

使用 Agent 工具派发子任务时：
- 简单/机械任务（读文件、grep、find、查文档）→ `model: "haiku"` (DeepSeek V4 Flash)
- 复杂任务（写代码、架构设计、review、调试）→ `model: "sonnet"` (DeepSeek V4 Pro)
- 主对话不动

# 项目

SilentBid — Zama FHEVM 密封竞价拍卖。Deadline: 5月10日 23:59 AOE。
Agent 配置见 .claude/agents.json（由 aipm 从 stack.yaml 生成）。

## 代码探索路由

**按问题类型选工具，全部零 API 费用。**

| 问题类型 | 工具 | 说明 |
|---------|------|------|
| 找引用/定义/符号 | LSP | 最精准，findReferences/goToDefinition |
| 探索结构/模块关系 | graphify | query/path/explain |
| 冷启动了解全局 | GRAPH_REPORT.md | 首次进入读一次即可 |
| 模式搜索 + 改写 | ast-grep | `sg run -p 'pattern' -r 'fix'` |
| 兜底 | grep | 以上都查不到时 |
