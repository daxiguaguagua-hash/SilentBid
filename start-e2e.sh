#!/bin/bash
set -e

echo "=== SilentBid Day 1 E2E Launcher ==="

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 1. Start Hardhat node in background
echo "[1/3] Starting Hardhat FHEVM node..."
npx hardhat node &
HARDHAT_PID=$!
sleep 3

# 2. Deploy contract
echo "[2/3] Deploying EncryptedCounter..."
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.ts --network localhost 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract contract address
CONTRACT_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -o '0x[a-fA-F0-9]\{40\}' | tail -1)
echo "Contract address: $CONTRACT_ADDR"

# Save to frontend env
echo "VITE_CONTRACT_ADDRESS=$CONTRACT_ADDR" > frontend/.env

# Save to deploy.json
cat > frontend/src/deploy.json << EOF
{
  "contractName": "EncryptedCounter",
  "address": "$CONTRACT_ADDR"
}
EOF

# 3. Start frontend
echo "[3/3] Starting frontend..."
cd frontend
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "=== All services running ==="
echo "Hardhat node:  http://localhost:8545 (PID $HARDHAT_PID)"
echo "Frontend:      http://localhost:5173 (PID $FRONTEND_PID)"
echo "Contract:      $CONTRACT_ADDR"
echo ""
echo "Press Ctrl+C to stop all"

# Trap to clean up
trap "kill $HARDHAT_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
