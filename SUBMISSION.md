# SilentBid Submission Pack

## Core Links

| Item | Value |
|---|---|
| Project name | SilentBid |
| One-liner | Privacy-preserving sealed-bid auction on Zama FHEVM |
| Official bounty | https://openbuild.xyz/learn/challenges/2095330503 |
| Submission deadline | May 10, 2026 23:59 AOE |
| Submission form | https://forms.gle/h2vdBaZ9zwmLVzeu5 |
| Sepolia contract | `0x616239Fd271BD7A4FAc343ABDD90e51244077b47` |
| Explorer | https://sepolia.etherscan.io/address/0x616239Fd271BD7A4FAc343ABDD90e51244077b47 |
| Verified encrypted bid tx | `0x8c9f75df6496aee9b4692329b318e4226374b380b537a76ace5d9f494adb65b1` |
| Verified end auction tx | `0x31c716111c226f4801e96ba9caf4d2fee2b8bfff193f676cac4934bb2e48190a` |
| Verified trivial bid tx | `0x6ebbe500dac2e408da2d0c...` |
| Local demo URL | `http://localhost:5173/` |

## Most Important Proof: Bid Amount Is Not Public

Use this proof first in the README, demo, and judge walkthrough.

| Step | Evidence |
|---|---|
| Query transaction | `eth_getTransactionByHash` on Ethereum Sepolia |
| Transaction hash | `0x8c9f75df6496aee9b4692329b318e4226374b380b537a76ace5d9f494adb65b1` |
| Sender | `from: 0x68269ebf49b17232a806e4caf126b340064d24ad` |
| Contract | `to: 0xab06cb9cddc96b4c8725f3298548e56cbc10994d` |
| ETH value | `value: 0x0` |
| Transaction input | Long calldata beginning with `0x38263e82...` |
| Privacy conclusion | The chain sees encrypted calldata and proof data, not the plaintext bid amount |
| Success proof | `eth_getTransactionReceipt` returns `status: 0x1` for the same tx |

```mermaid
flowchart TD
  A["Chrome + MetaMask submits bid"] --> B["Zama SDK encrypted input"]
  B --> C["Sepolia tx 0x8c9f75..."]
  C --> D["input is encrypted calldata"]
  D --> E["No plaintext bid amount on-chain"]
  C --> F["receipt status 0x1"]
  F --> G["Bid transaction succeeded"]
```

Copy-ready proof statement:

> On Sepolia, the encrypted bid transaction `0x8c9f75df...65b1` calls the SilentBid contract with `value: 0x0` and a long encrypted calldata payload beginning with `0x38263e82...`. The plaintext bid amount is not visible in the transaction input or logs, while the receipt confirms success with `status: 0x1`.

## Short Description

SilentBid is a sealed-bid auction dApp where users submit encrypted bids from the browser. The smart contract uses Zama FHEVM primitives to compare encrypted bids without revealing the plaintext bid amounts. This prevents public bid sniping while preserving on-chain verifiability.

## Copy-Ready Form Answers

| Field | Draft |
|---|---|
| Project name | SilentBid |
| Tagline | Privacy-preserving sealed-bid auction on Zama FHEVM |
| Short summary | SilentBid lets users submit encrypted bids from the browser. The Sepolia smart contract processes encrypted bid inputs using Zama FHEVM, so bids can affect auction state without exposing plaintext amounts. |
| Problem | Public on-chain auctions reveal every bid, which lets later bidders copy or slightly outbid earlier participants. |
| Solution | Encrypt each bid client-side with the Zama relayer SDK, submit the encrypted input to the contract, and update auction state using FHE-compatible logic. |
| Zama usage | The app uses Zama FHEVM contracts and `@zama-fhe/relayer-sdk` to create encrypted inputs in the browser and submit them to Sepolia. |
| Demo proof | In Chrome with MetaMask on Sepolia, an encrypted bid transaction was confirmed and the UI bid count updated from 1 to 2. |

## Longer Description

SilentBid demonstrates a practical use case for fully homomorphic encryption in blockchain applications. In normal on-chain auctions, every bid is public, so later bidders can inspect existing bids and slightly outbid competitors. SilentBid changes this flow: the frontend encrypts a user's bid with the Zama relayer SDK, submits the encrypted input to a Sepolia smart contract, and the contract updates auction state using FHE operations.

The working demo proves the full path: Zama SDK initialization, encrypted input creation, MetaMask confirmation, Sepolia transaction submission, event observation, and UI state refresh.

## Technical Highlights

| Area | Detail |
|---|---|
| FHE primitive | Encrypted bid comparison with Zama FHEVM |
| Frontend encryption | `@zama-fhe/relayer-sdk` in React |
| Wallet | MetaMask on Sepolia |
| Contract framework | Hardhat |
| Frontend stack | React, wagmi, viem, Vite |
| Test coverage | 10 contract tests, 10 frontend tests |

## Official Requirement Mapping

| OpenBuild requirement | Status | Evidence |
|---|---|---|
| Functioning dApp demo using Zama Protocol | Ready | Local frontend + Sepolia contract |
| Real-world FHE use case | Ready | Confidential sealed-bid auction |
| Smart contract implementation | Ready | `contracts/SilentBid.sol` |
| Frontend implementation | Ready | `frontend/` React app |
| Clear project documentation | Ready | README, TESTING, WORKFLOW, ROADMAP, SUBMISSION |
| 2-minute human-presented demo video | Pending | Must record with real person on camera |


## Compliance-Aware Privacy Model

SilentBid demonstrates a compliance-friendly privacy architecture: the auction lifecycle is publicly auditable (when bids were submitted, how many, by whom), while the bid amounts remain encrypted throughout competition. This is selective privacy, not opacity — regulators and auditors can verify that the auction was fair, but competitors cannot see each other's bids.

| Layer | Public | Encrypted |
|---|---|---|
| Bid submission event | bidder address, timestamp, tx hash | bid amount |
| Auction status | active/ended, bid count, owner address | current highest bid |
| Winner identity | encrypted during auction | revealed only after end via ACL |
| Highest bid | encrypted during auction | revealed only after end via ACL |

This pattern directly addresses the tension between blockchain transparency and financial privacy — a key concern for institutional adoption of on-chain finance.

## Judging Criteria Positioning

| Criterion | Talking point |
|---|---|
| Innovation | SilentBid turns sealed bidding into a programmable on-chain workflow without public bid leakage. |
| Compliance awareness | The design separates public audit data from confidential bid values, enabling selective privacy rather than opacity. |
| Real-world potential | Applicable to RWA auctions, DAO procurement, grant allocation, private tenders, and confidential trading. |
| Technical implementation | Uses FHE.select (encrypted conditional) for branchless highest-bid tracking, euint32 for bid amounts, and ACL-based selective decryption. The contract never branches on plaintext bid values. |
| Production readiness | Contract, frontend, and E2E smoke tests are documented and passing. |
| Usability | The demo has a concise reviewer flow and a 2-minute script. |

## Evidence

| Evidence | Status |
|---|---|
| Contract tests | Passing |
| Frontend typecheck/build/tests | Passing |
| Sepolia browser smoke | Passing |
| Encrypted bid tx | `0x8c9f75df6496aee9b4692329b318e4226374b380b537a76ace5d9f494adb65b1` confirmed through MetaMask |
| Encrypted bid calldata privacy | Verified via Alchemy Sandbox `eth_getTransactionByHash` |
| Encrypted bid receipt | Verified via Alchemy Sandbox `eth_getTransactionReceipt`, `status: 0x1` |
| Bid count refresh | Verified from `1` to `2` |

## Manual Chrome / MetaMask Boundary

Wallet-dependent flows cannot be validated in the in-app browser because it cannot install MetaMask.

| Flow | Test location |
|---|---|
| Page load, disconnected state, routing, console errors | In-app browser |
| MetaMask connect, chain switch, signatures, bid transactions, end auction | Local desktop Chrome with MetaMask |
| Final submission smoke | Local desktop Chrome with MetaMask |

## Closed Auction Follow-Up

After the owner closes the auction, the demo should show or explain:

| Step | Expected proof |
|---|---|
| Confirm closed state | UI shows Closed/Ended or contract `ended == true` |
| Confirm bid count | `bidCount` remains public and auditable |
| Explain privacy boundary | Losing bid values remain private |
| Explain result model | Winner/highest bid handles are only decryptable after auction end via contract ACL |
| Record final clip | Show closed state and explain selective reveal |

## Commands For Reviewers

```bash
npm install
npm test

cd frontend
npm install
npm run test
npm run dev
```

Create `frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=0x616239Fd271BD7A4FAc343ABDD90e51244077b47
```

## Final Submission Checklist

| Item | Status |
|---|---|
| GitHub repository link | Needs repo creation |
| Contract explorer link | Ready |
| 2-minute video link | Pending recording |
| README updated | Ready |
| Tests passing | Verified 2026-05-07 (10 contract + 10 frontend + 12 E2E) |
| Decryption gate fix | Done (require ended) |
| Official bounty mapping | Ready |
| Chrome + MetaMask wallet smoke | Pending final manual pass |
| Final Chrome smoke before submit | Pending |
| Google Form submitted | Pending |
