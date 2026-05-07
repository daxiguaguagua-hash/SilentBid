# SilentBid 2-Minute Demo Script

## Target

Record a short human-presented demo that proves three things:

| Proof | What to show |
|---|---|
| Real problem | Public bids are unfair in normal on-chain auctions |
| Zama value | Bids are encrypted before reaching the contract |
| Working demo | Sepolia transaction succeeds and `Bids` increments |

## Timeline

| Time | Scene | Script |
|---:|---|---|
| 0:00-0:15 | Face camera | Hi, this is SilentBid, a privacy-preserving sealed-bid auction built on Zama FHEVM. |
| 0:15-0:35 | Face camera or slide | In normal blockchain auctions, every bid is public. Later bidders can inspect the chain and outbid others by a tiny amount. |
| 0:35-0:55 | App overview | SilentBid solves this by encrypting the bid in the browser before it is sent to the smart contract. |
| 0:55-1:25 | Screen recording | I connect MetaMask on Sepolia, enter 100 BID Credits, and click Place Private Bid. The Zama SDK creates encrypted input and MetaMask confirms the transaction. |
| 1:25-1:45 | Screen recording | After confirmation, the app receives the transaction and the bid count increases. The contract processed the encrypted bid without revealing the bid amount on-chain. |
| 1:45-2:00 | Face camera | This demonstrates how FHE enables private but verifiable on-chain applications. Thank you for watching. |

## Full English Script

Hi, this is SilentBid, a privacy-preserving sealed-bid auction built on Zama FHEVM.

In a normal blockchain auction, every bid is public. That creates an unfair experience, because later bidders can inspect existing bids on-chain and outbid others by a tiny amount.

SilentBid solves this by encrypting each bid in the browser before it is submitted to the smart contract. The contract receives encrypted data and uses Zama FHEVM primitives to compare bids while they remain encrypted.

In the demo, I connect MetaMask on Sepolia, enter 100 BID Credits, and click Place Private Bid. The Zama relayer SDK initializes in the browser, creates encrypted input, and sends the transaction through MetaMask.

After the transaction is confirmed, the app refreshes the contract state and the bid count increases. The important point is that the bid was accepted and processed without exposing the plaintext bid value.

SilentBid shows how FHE can bring real privacy to blockchain applications while keeping the logic programmable, verifiable, and on-chain. Thank you for watching.

## Screen Recording Checklist

| Step | Expected visual |
|---|---|
| Open app | `SilentBid`, Sepolia account, `FHEVM ready` |
| Show bid input | `Bid amount (BID Credits): 100` |
| Click Place Private Bid | MetaMask transaction request |
| Confirm | Network fee on Sepolia |
| Return to app | `Encrypted bid submitted: ...` |
| Final proof | `Bids` count increased |

## Avoid Saying

| Avoid | Better |
|---|---|
| "The bid is hidden by the frontend" | "The bid is encrypted before it reaches the contract" |
| "The contract decrypts the bid" | "The contract computes on encrypted values" |
| "100 ETH" | "100 BID Credits" |
| "Localhost relayer" | "Zama Sepolia relayer" |

