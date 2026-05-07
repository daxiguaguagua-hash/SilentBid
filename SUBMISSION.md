# SilentBid Submission Pack

## Core Links

| Item | Value |
|---|---|
| Project name | SilentBid |
| One-liner | Privacy-preserving sealed-bid auction on Zama FHEVM |
| Sepolia contract | `0xAB06CB9cddC96B4c8725F3298548e56CbC10994d` |
| Explorer | https://sepolia.etherscan.io/address/0xAB06CB9cddC96B4c8725F3298548e56CbC10994d |
| Verified encrypted bid tx | `0xfc54da826c251e17fc6ac6...` |
| Verified trivial bid tx | `0x6ebbe500dac2e408da2d0c...` |
| Local demo URL | `http://localhost:5173/` |

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
| Test coverage | 10 contract tests, 7 frontend checks/tests |

## Evidence

| Evidence | Status |
|---|---|
| Contract tests | Passing |
| Frontend typecheck/build/tests | Passing |
| Sepolia browser smoke | Passing |
| Encrypted bid tx | Confirmed through MetaMask |
| Bid count refresh | Verified from `1` to `2` |

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
VITE_CONTRACT_ADDRESS=0xAB06CB9cddC96B4c8725F3298548e56CbC10994d
```

## Final Submission Checklist

| Item | Status |
|---|---|
| GitHub repository link | Needs repo creation |
| Contract explorer link | Ready |
| 2-minute video link | Pending recording |
| README updated | Ready |
| Tests passing | Verified 2026-05-07 (10 contract + 7 frontend) |
| Decryption gate fix | Done (require ended) |
| Final Chrome smoke before submit | Pending |
| Google Form submitted | Pending |
