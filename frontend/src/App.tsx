import { useState, useEffect } from "react";
import {
  useAccount, useConnect, useDisconnect,
  useWriteContract, useReadContract, useWatchContractEvent,
  useWaitForTransactionReceipt,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { toHex } from "viem";
import { createInstance, initSDK, SepoliaConfigV2, type FhevmInstance } from "@zama-fhe/relayer-sdk/web";
import ABI from "./SilentBid.abi.json";

const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "") as `0x${string}`;
const UINT32_MAX = 2 ** 32 - 1;

// Zama-hosted FHEVM relayer config by network.
const FHEVM_CONFIG = {
  11155111: SepoliaConfigV2,
};

export function parseBidAmount(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > UINT32_MAX) return null;
  return parsed;
}

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();

  // Refetch contract state after transaction confirms
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [bidAmount, setBidAmount] = useState("100");
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [status, setStatus] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  // Read contract state
  const { data: bidCount, refetch: refetchBidCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "bidCount",
  });
  const { data: ended, refetch: refetchEnded } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "ended",
  });
  const { data: owner, refetch: refetchOwner } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "owner",
  });
  const { data: isActive, refetch: refetchIsActive } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "isActive",
  });

  const bidCountLabel = String((bidCount as bigint | number | undefined) ?? 0);
  const endedValue = Boolean(ended);
  const isActiveValue = Boolean(isActive);
  const ownerAddress = typeof owner === "string" ? owner : undefined;
  const isOwner = Boolean(address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase());
  const parsedBidAmount = parseBidAmount(bidAmount);
  const isBidAmountValid = parsedBidAmount !== null;

  useEffect(() => {
    if (!txConfirmed) return;
    void Promise.all([
      refetchBidCount(),
      refetchEnded(),
      refetchOwner(),
      refetchIsActive(),
    ]);
  }, [txConfirmed, refetchBidCount, refetchEnded, refetchOwner, refetchIsActive]);

  // Watch BidSubmitted events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    eventName: "BidSubmitted",
    onLogs(logs) {
      for (const log of logs) {
        const bidder = (log as any).args?.bidder || "unknown";
        setEvents((prev) => [...prev, `Bid from ${bidder.slice(0, 8)}...`].slice(-10));
      }
    },
  });

  // Init FHEVM
  useEffect(() => {
    if (!isConnected || !address) return;
    (async () => {
      try {
        if (!window.ethereum) {
          setStatus("FHEVM: wallet provider unavailable");
          return;
        }

        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const numericChainId = parseInt(String(chainId), 16);
        const cfg = FHEVM_CONFIG[numericChainId as keyof typeof FHEVM_CONFIG];
        if (!cfg) { setStatus(`Unsupported chain ${numericChainId}`); return; }

        setStatus("Loading FHEVM SDK...");
        await initSDK();

        const inst = await createInstance({
          network: window.ethereum,
          ...cfg,
        });
        setInstance(inst);
        setStatus("FHEVM ready");
      } catch (err: any) {
        setStatus(`FHEVM: ${err.message}`);
      }
    })();
  }, [isConnected, address]);

  // Submit encrypted bid
  const handleBid = async () => {
    if (!instance || !address || parsedBidAmount === null) return;
    try {
      setStatus("Encrypting bid...");
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add32(parsedBidAmount);
      const { handles, inputProof } = await input.encrypt();
      const encryptedBidHandle = toHex(handles[0]);
      const inputProofHex = toHex(inputProof);

      setStatus("Waiting for wallet confirmation...");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "bid",
        args: [encryptedBidHandle, inputProofHex],
      });
      setStatus(`Encrypted bid submitted: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // Trivial bid (local testing)
  const handleBidTrivial = async () => {
    if (parsedBidAmount === null) return;
    try {
      setStatus("Waiting for wallet confirmation...");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "bidTrivial",
        args: [parsedBidAmount],
      });
      setStatus(`Trivial bid submitted: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // End auction
  const handleEndAuction = async () => {
    try {
      setStatus("Waiting for wallet confirmation...");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "endAuction",
      });
      setStatus(`End auction submitted: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", maxWidth: 650, margin: "30px auto", padding: 20 }}>
      <h1>🤫 SilentBid</h1>
      <p>Privacy-preserving sealed-bid auction on Zama FHEVM</p>

      {!isConnected ? (
        <button onClick={() => connect({ connector: injected() })} style={btnStyle}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>
            👤 {address?.slice(0, 6)}...{address?.slice(-4)}
            {isOwner && " (Owner)"}
          </p>

          {/* Auction state */}
          <div style={infoBox}>
            <div>Status: {endedValue ? "🔒 Ended" : isActiveValue ? "🔵 Active" : "⏳ Expired"}</div>
            <div>Bids: {bidCountLabel}</div>
            {instance ? "🔧 FHEVM SDK loaded" : "⏳ Loading FHEVM..."}
          </div>

          <p style={{ color: "#888", fontSize: 12 }}>{status}</p>

          {/* Bid controls */}
          {!endedValue && isActiveValue && (
            <div style={{ margin: "16px 0" }}>
              <label>
                Bid amount (BID Credits):{" "}
                <input
                  type="number"
                  min="1"
                  max={UINT32_MAX}
                  step="1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  style={{ width: 100, padding: 6 }}
                />
              </label>
              {!isBidAmountValid && (
                <div style={{ color: "#c44", fontSize: 12, marginTop: 6 }}>
                  Bid must be a whole number from 1 to {UINT32_MAX} BID Credits.
                </div>
              )}
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button onClick={handleBidTrivial} disabled={isPending || !isBidAmountValid} style={btnStyle}>
                  Bid (trivial)
                </button>
                <button onClick={handleBid} disabled={isPending || !instance || !isBidAmountValid} style={btnStyle}>
                  Bid (encrypted)
                </button>
              </div>
            </div>
          )}

          {/* Owner controls */}
          {isOwner && !endedValue && (
            <button onClick={handleEndAuction} disabled={isPending} style={{ ...btnStyle, background: "#c44" }}>
              End Auction
            </button>
          )}

          {/* TX feedback */}
          {txHash && <p style={{ fontSize: 11 }}>TX: {txHash.slice(0, 24)}...</p>}

          {/* Event log */}
          {events.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Events:</strong>
              {events.map((e, i) => <div key={i} style={{ fontSize: 12 }}>• {e}</div>)}
            </div>
          )}

          <hr />
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}

      {!CONTRACT_ADDRESS && (
        <p style={{ color: "orange" }}>⚠️ Set VITE_CONTRACT_ADDRESS env var</p>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "8px 16px", cursor: "pointer", fontSize: 14,
  background: "#4a6", color: "#fff", border: "none", borderRadius: 4,
};

const infoBox: React.CSSProperties = {
  background: "#1a1a2e", color: "#e0e0e0", padding: 12, borderRadius: 6,
  marginTop: 12, lineHeight: 1.8,
};
