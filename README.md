# SilentBid

Privacy-preserving sealed-bid auction on Zama FHEVM.

> Built for the Zama Bounty Hackathon — deadline May 10, 2025 23:59 AOE.

## Problem

On a normal blockchain, all bids are public. Later bidders can see existing bids and outbid others by 1 wei. SilentBid solves this: every bid is encrypted before it reaches the contract, and the contract compares bids *while they remain encrypted*.

## How it works

```
Bidder → encrypts bid in browser (Zama SDK) → submits to contract
Contract → FHE.gt(encryptedBid, highestBid) → FHE.select updates winner
Auction ends → relayer decrypts → only the winner is revealed
```

The core logic uses Zama's FHEVM primitives:

- `FHE.gt(a, b)` — compare two encrypted uint32 values, returns an encrypted boolean
- `FHE.select(condition, ifTrue, ifFalse)` — encrypted conditional assignment, no plaintext branches

This means the contract **never sees the actual bid values** — it only ever handles ciphertexts.

## Tech stack

| Layer | Choice |
|---|---|
| Smart contract | Solidity 0.8.24 + Zama FHEVM |
| Dev framework | Hardhat + @fhevm/hardhat-plugin |
| Frontend | React + wagmi + @zama-fhe/relayer-sdk |
| Network | Sepolia testnet (Zama FHEVM) |

## Contract address (Sepolia)

`0xAB06CB9cddC96B4c8725F3298548e56CbC10994d`

[View on Sepolia Explorer](https://sepolia.etherscan.io/address/0xAB06CB9cddC96B4c8725F3298548e56CbC10994d)

## Quick start

### Prerequisites

- Node.js >= 20
- MetaMask with Sepolia ETH

### Install & deploy

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Copy and fill in environment variables
cp .env.example .env
# Edit .env: add PRIVATE_KEY and SEPOLIA_RPC_URL

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Start frontend
cd frontend
echo "VITE_CONTRACT_ADDRESS=<deployed-address>" > .env
npm run dev
```

### Local development

```bash
# Terminal 1: local FHEVM node
npx hardhat node

# Terminal 2: deploy
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 3: frontend
cd frontend && npm run dev
```

## Testing

```bash
# Contract tests (10 passing)
npx hardhat test

# Frontend tests (5 passing)
cd frontend && npm test
```

## Demo flow

1. Connect MetaMask (Sepolia network)
2. Enter a bid amount in BID Credits
3. Click **Bid (encrypted)** — the SDK encrypts your bid client-side
4. MetaMask confirms the transaction
5. The contract processes your encrypted bid without decrypting it
6. After the auction ends, only the winning bidder is revealed

## Why this matters

Fully Homomorphic Encryption (FHE) allows computation on encrypted data. SilentBid demonstrates this in a real-world scenario: a fair auction where bids stay private, yet the smart contract can still determine the winner — all on-chain, all verifiable.

## Built with

- [Zama FHEVM](https://github.com/zama-ai/fhevm)
- [@zama-fhe/relayer-sdk](https://www.npmjs.com/package/@zama-fhe/relayer-sdk)
- [wagmi](https://wagmi.sh)
