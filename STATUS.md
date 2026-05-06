# STATUS

## 2026-05-06 20:00 Hermes fixes
- Bid auto-refresh: added useWaitForTransactionReceipt + invalidateQueries after tx confirms
- Relayer: switched Sepolia to V2 endpoint (https://relayer.testnet.zama.org/v2)
- Frontend unit tests: 5/5 passing (vitest + React Testing Library)
- README.md written
- Remaining: E2E tests, video, form submission

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
