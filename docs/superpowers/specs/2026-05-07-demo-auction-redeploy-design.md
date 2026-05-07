# Demo Auction Redeploy

**Date:** 2026-05-07
**Status:** approved

## Problem

Live demo at `http://3.21.154.136/` points to Sepolia contract `0xAB06CB9cddC96B4c8725F3298548e56CbC10994d` which is ended (`bidCount=8`, `ended=true`). Visitors see a dead auction.

## Solution

Deploy a new SilentBid contract (7-day duration) and update all address references across the project.

## Steps

1. **Deploy** — Hardhat deploy script to Sepolia with `duration = 7 days`
2. **Update addresses** — `frontend/.env`, `.github/workflows/deploy.yml`, `frontend/src/deploy.json`, `README.md`, `README.en.md`
3. **Verify** — `npm test` + frontend build → push main → GitHub Actions deploy → Chrome smoke at `http://3.21.154.136/auction/live`

## Files affected

| File | Change |
|------|--------|
| `frontend/.env` | `VITE_CONTRACT_ADDRESS=<new>` |
| `.github/workflows/deploy.yml` | `VITE_CONTRACT_ADDRESS: "<new>"` |
| `frontend/src/deploy.json` | `address` field |
| `README.md` | contract table, etherscan link, quick start |
| `README.en.md` | same as README.md |

## Verification

- `npm test` — 10 Hardhat passing
- `cd frontend && npm run test` — typecheck + build + 10 vitest
- Chrome: `http://3.21.154.136/auction/live` shows active auction, can bid
