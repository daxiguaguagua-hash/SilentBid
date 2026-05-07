---
name: i18n-plan
description: Codex+Claude i18n plan — lightweight self-built t() + Context, zh-CN support, no switching UI, default en for test stability
type: project
---

# i18n 国际化方案 (2026-05-07)

**Why:** 用户要求新增中文简体支持。Codex 审阅后推荐轻量自建方案。

**How to apply:** 按 3 步实施。默认 en 保测试，VITE_LOCALE 切中文。

## 技术选型

| 项目 | 选择 |
|---|---|
| 方案 | 自建 `t()` + React Context |
| 默认语言 | `en`（保护现有 22 个测试） |
| 新增语言 | `zh-CN` 简体中文 |
| 切换方式 | `VITE_LOCALE=zh-CN` 环境变量，不做 UI 切换 |
| Provider 位置 | WagmiProvider > QueryClientProvider > I18nProvider > App > BrowserRouter |

## 文件结构

```
frontend/src/i18n/
  index.tsx          # I18nProvider + useI18n() hook
  locales/en.ts      # 基准英文
  locales/zh-CN.ts   # 简体中文
```

## 翻译 Key 策略

扁平 key：`页面/组件.区域.元素`

- `nav.*` — Navbar
- `home.*` — Home page
- `lobby.*` — Lobby page
- `auction.*` — AuctionDetail page
- `dashboard.*` — Dashboard page
- `footer.*` — Footer
- `status.*` — 动态状态消息（useSilentBid 返回的 status 文本）

## 改动范围

| 文件 | 改动 |
|---|---|
| 新增 `src/i18n/` | locales/en.ts, zh-CN.ts, index.tsx |
| `main.tsx` | 挂 I18nProvider |
| `Navbar.tsx` | 替换静态文案 |
| `Footer.tsx` | 替换静态文案 |
| `Home.tsx` | hero, metrics, CTA |
| `Lobby.tsx` | card, 按钮 |
| `AuctionDetail.tsx` | 标题, 表单, 状态, 按钮, 开发者工具 |
| `Dashboard.tsx` | 标题, 按钮 |
| `useSilentBid.ts` | status 消息改为 key，UI 层翻译 |

## 不改动

- contracts/*, hooks 核心逻辑, lib/bids.ts, 路由路径

## 实施步骤

1. 建 i18n 基础设施 + en.ts 英文文案
2. 迁移所有组件/页面静态文案到 t()
3. 补齐 zh-CN.ts 翻译
4. 新增 key 完整性测试
5. 跑全量测试确认 22 个测试仍通过
