import { useState, useEffect } from "react";
import {
  useAccount, useConnect, useDisconnect,
  useWriteContract, useReadContract, useWatchContractEvent,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { createInstance, type FhevmInstance } from "@zama-fhe/relayer-sdk/web";
import { parseAbiItem } from "viem";
import ABI from "./SilentBid.abi.json";

const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "") as `0x${string}`;

// Zama FHEVM contract addresses by network
const FHEVM_CONFIG = {
  31337: { // Hardhat local
    aclContractAddress: "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
    kmsContractAddress: "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
    inputVerifierContractAddress: "0xe3a9105a3a932253A70F126eb1E3b589C643dD24",
    verifyingContractAddressDecryption: "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
    verifyingContractAddressInputVerification: "0xe3a9105a3a932253A70F126eb1E3b589C643dD24",
    relayerUrl: "http://localhost:8545",
    gatewayChainId: 31337,
  },
  11155111: { // Sepolia
    aclContractAddress: "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D",
    kmsContractAddress: "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A",
    inputVerifierContractAddress: "0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0",
    verifyingContractAddressDecryption: "0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478",
    verifyingContractAddressInputVerification: "0x483b9dE06E4E4C7D35CCf5837A1668487406D955",
    relayerUrl: "https://relayer.testnet.zama.org",
    gatewayChainId: 10901,
  },
};

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: txHash, isPending } = useWriteContract();

  const [bidAmount, setBidAmount] = useState("100");
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [status, setStatus] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  // Read contract state
  const { data: bidCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "bidCount",
  });
  const { data: ended } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "ended",
  });
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "owner",
  });
  const { data: isActive } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "isActive",
  });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

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
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const numericChainId = parseInt(chainId, 16);
        const cfg = FHEVM_CONFIG[numericChainId as keyof typeof FHEVM_CONFIG];
        if (!cfg) { setStatus(`Unsupported chain ${numericChainId}`); return; }

        const inst = await createInstance({
          chainId: numericChainId,
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
    if (!instance || !address) return;
    try {
      setStatus("Encrypting bid...");
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add32(Number(bidAmount));
      const { handles, inputProof } = await input.encrypt();

      setStatus("Submitting bid...");
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "bid",
        args: [handles[0], inputProof],
      });
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // Trivial bid (local testing)
  const handleBidTrivial = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "bidTrivial",
      args: [Number(bidAmount)],
    });
    setStatus("Trivial bid submitted");
  };

  // End auction
  const handleEndAuction = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "endAuction",
    });
    setStatus("Ending auction...");
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
            <div>Status: {ended ? "🔒 Ended" : isActive ? "🔵 Active" : "⏳ Expired"}</div>
            <div>Bids: {String(bidCount ?? 0)}</div>
            {instance ? "🔧 FHEVM SDK loaded" : "⏳ Loading FHEVM..."}
          </div>

          <p style={{ color: "#888", fontSize: 12 }}>{status}</p>

          {/* Bid controls */}
          {!ended && isActive && (
            <div style={{ margin: "16px 0" }}>
              <label>
                Bid amount:{" "}
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  style={{ width: 100, padding: 6 }}
                />
              </label>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button onClick={handleBidTrivial} disabled={isPending} style={btnStyle}>
                  Bid (trivial)
                </button>
                <button onClick={handleBid} disabled={isPending || !instance} style={btnStyle}>
                  Bid (encrypted)
                </button>
              </div>
            </div>
          )}

          {/* Owner controls */}
          {isOwner && !ended && (
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
