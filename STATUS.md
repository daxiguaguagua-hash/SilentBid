# STATUS

## 2026-05-07 09:40 Codex review + Claude Code fixes
- Fixed HIGH: `allowBidDecryption` / `allowWinnerDecryption` now require `ended == true` before granting decryption ACL. Previously anyone could decrypt mid-auction.
- Synced button wording: docs referenced "Bid encrypted" but UI says "Place Private Bid". Updated README, DEMO_SCRIPT, WORKFLOW.
- Updated SUBMISSION.md checklist with current status.
- Verified: root `npm test` 10 passing; frontend `npm run test` typecheck/build/7 passing.
- Remaining: Chrome smoke, video, GitHub repo creation, Google Form.

## 2026-05-06 21:40 Codex docs/planning
- Added `WORKFLOW.md` with agent responsibilities, Chrome/MetaMask smoke flow, verification commands, known pitfalls, context rules, and definition of done.
- Added `ROADMAP.md` with submission blockers, quality improvements, stretch ideas, demo narrative, and final release checklist.
- Updated README testing count from 5 to 7 frontend tests and clarified that encrypted browser demo relies on Sepolia/Zama relayer, not local Hardhat RPC.
- Added `DEMO_SCRIPT.md` with a 2-minute English narration, screen recording checklist, and phrasing guardrails.
- Added `SUBMISSION.md` with copy-ready project description, contract/tx evidence, reviewer commands, and final submission checklist.
- Rewrote `README.md` as the judge-facing entrypoint with project value, verified tx evidence, quick start, tests, demo flow, and document map.
- Verified after docs pass: root `npm test` still 10 passing; frontend `npm run test` still typecheck/build/7 tests passing.

## 2026-05-06 23:20 Codex UI polish
- Reworked frontend into a sealed-auction console: status metrics, private bid panel, sealed-auction rules, on-chain evidence, and developer test controls.
- Promoted encrypted flow to primary CTA: `Place Private Bid`.
- Moved `Debug Plain Bid` and owner-only `End Auction` into a lower developer controls area.
- Verified in Chrome: Sepolia wallet connected, `Auction: Active`, `Sealed bids: 7`, `FHEVM: Ready`.
- Verified: root `npm test` 10 passing; frontend `npm run test` typecheck/build/7 tests passing.

## 2026-05-06 20:00 Hermes fixes
- Bid auto-refresh: added useWaitForTransactionReceipt + invalidateQueries after tx confirms
- Relayer: switched Sepolia to V2 endpoint (https://relayer.testnet.zama.org/v2)
- Frontend unit tests: 5/5 passing (vitest + React Testing Library)
- README.md written
- Remaining: E2E tests, video, form submission

## 2026-05-06 21:25 Codex review/fix
- Review finding: TODO marked encrypted bid relayer fix as done, but browser still showed `__wbindgen_malloc` during FHEVM public key fetch.
- Fix: call `initSDK()` before `createInstance()` in the browser FHEVM init path.
- Fix: reuse SDK `SepoliaConfigV2` instead of duplicating Sepolia contract/relayer constants in the app.
- Fix: removed the bogus local Hardhat `http://localhost:8545` relayer config from browser FHEVM initialization.
- Fix: transaction confirmation now explicitly refetches `bidCount`, `ended`, `owner`, and `isActive` instead of relying on a broad query-key invalidation.
- Guardrail: bid amount must be a whole uint32 amount from `1` to `4294967295` BID Credits.
- Verified: `https://relayer.testnet.zama.org/v2/keyurl` returns public key/CRS JSON.
- Verified: frontend `npm run test` passes typecheck, production build, and 7 vitest tests.
- Verified: root `npm test` passes 10 Hardhat tests.
- Browser fix: converted SDK `Uint8Array` encrypted handles/input proof to `0x...` hex before passing them to wagmi/viem.
- Verified in Chrome + MetaMask: encrypted bid confirmed on Sepolia, tx `0xfc54da826c251e17fc6ac6...`.
- Verified UI refresh: `Bids` updated from `1` to `2` after encrypted bid confirmation.

## 2026-05-06 20:10 Sepolia browser smoke
- Chrome `http://localhost:5173/` 已连 MetaMask 测试账号 `0x6826...24ad`
- Sepolia 合约读取正常：页面显示 `Active`、`Owner`、`Bids: 0`
- `Bid (trivial)` 已手动确认上链，MetaMask 扣 gas 后余额约 `4.049 SepoliaETH`
- 页面收到交易哈希 `0x6ebbe500dac2e408da2d0c...` 和 `BidSubmitted` 事件
- 注意：页面 `Bids` 仍显示 `0`，疑似 wagmi read 未刷新或读/写合约地址不一致，需要补 e2e 复核
- `Bid (encrypted)` 未通：FHEVM SDK 仍报 relayer/public key 初始化错误
- 已新增 `TESTING.md` 测试矩阵；前端新增 `npm test` = typecheck + build

## 2026-05-06 19:30 INIT
- 合约编译通过，10 tests 全绿，Sepolia 已部署
- 前端完整（React + wagmi + FHEVM SDK）
- AI 环境：aipm stack.yaml + .claude/agents.json
- 剩余：README.md、2分钟视频、提交
