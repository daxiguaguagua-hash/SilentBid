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

# 项目

SilentBid — Zama FHEVM 密封竞价拍卖。Deadline: 5月10日 23:59 AOE。
Agent 配置见 .claude/agents.json（由 aipm 从 stack.yaml 生成）。