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
  const statusLabel = endedValue ? "Closed" : isActiveValue ? "Active" : "Expired";
  const fhevmLabel = instance ? "Ready" : "Loading";
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const shortContract = CONTRACT_ADDRESS ? `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}` : "Not configured";

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
    <main style={pageStyle}>
      <section style={shellStyle}>
        <header style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>Zama FHEVM sealed auction</div>
            <h1 style={titleStyle}>SilentBid</h1>
            <p style={subtitleStyle}>Private bids. Public settlement. No plaintext bid amounts on-chain.</p>
          </div>
          <div style={headerActionsStyle}>
            <span style={networkPillStyle}>Sepolia</span>
            {isConnected ? (
              <button onClick={() => disconnect()} style={secondaryButtonStyle}>
                {shortAddress}
              </button>
            ) : (
              <button onClick={() => connect({ connector: injected() })} style={primaryButtonStyle}>
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        <section style={metricsGridStyle}>
          <div style={metricPanelStyle}>
            <span style={metricLabelStyle}>Auction</span>
            <strong style={metricValueStyle}>{statusLabel}</strong>
          </div>
          <div style={metricPanelStyle}>
            <span style={metricLabelStyle}>Sealed bids</span>
            <strong style={metricValueStyle}>{bidCountLabel}</strong>
          </div>
          <div style={metricPanelStyle}>
            <span style={metricLabelStyle}>FHEVM</span>
            <strong style={metricValueStyle}>{fhevmLabel}</strong>
          </div>
        </section>

        {!isConnected ? (
          <section style={emptyPanelStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Connect to enter the auction</h2>
              <p style={mutedTextStyle}>Use a Sepolia wallet to place a private bid in BID Credits.</p>
            </div>
            <button onClick={() => connect({ connector: injected() })} style={primaryButtonStyle}>
              Connect Wallet
            </button>
          </section>
        ) : (
          <section style={mainGridStyle}>
            <section style={bidPanelStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <span style={eyebrowStyle}>Private bid</span>
                  <h2 style={sectionTitleStyle}>Place a sealed bid</h2>
                </div>
                {isOwner && <span style={ownerBadgeStyle}>Owner</span>}
              </div>

              <label style={inputLabelStyle} htmlFor="bid-amount">
                Bid amount
                <span style={unitStyle}>BID Credits</span>
              </label>
              <input
                id="bid-amount"
                type="number"
                min="1"
                max={UINT32_MAX}
                step="1"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                style={amountInputStyle}
              />
              {!isBidAmountValid && (
                <div style={errorTextStyle}>Use a whole number from 1 to {UINT32_MAX} BID Credits.</div>
              )}

              <button
                onClick={handleBid}
                disabled={isPending || !instance || !isBidAmountValid || endedValue || !isActiveValue}
                style={{
                  ...primaryButtonStyle,
                  ...wideButtonStyle,
                  ...((isPending || !instance || !isBidAmountValid || endedValue || !isActiveValue) ? disabledButtonStyle : {}),
                }}
              >
                Place Private Bid
              </button>

              <p style={statusTextStyle}>{status || "Ready for a private Sepolia bid."}</p>
            </section>

            <aside style={sidePanelStyle}>
              <section style={plainPanelStyle}>
                <h2 style={sectionTitleStyle}>Sealed auction rules</h2>
                <div style={ruleGridStyle}>
                  <div>
                    <span style={ruleLabelStyle}>Visible</span>
                    <p style={mutedTextStyle}>Bid count, wallet transaction, contract address.</p>
                  </div>
                  <div>
                    <span style={ruleLabelStyle}>Hidden</span>
                    <p style={mutedTextStyle}>Plaintext bid amounts and losing bid values.</p>
                  </div>
                </div>
              </section>

              <section style={plainPanelStyle}>
                <h2 style={sectionTitleStyle}>On-chain evidence</h2>
                <dl style={evidenceListStyle}>
                  <div style={evidenceRowStyle}>
                    <dt>Contract</dt>
                    <dd>{shortContract}</dd>
                  </div>
                  <div style={evidenceRowStyle}>
                    <dt>Network</dt>
                    <dd>Sepolia</dd>
                  </div>
                  {txHash && (
                    <div style={evidenceRowStyle}>
                      <dt>Latest tx</dt>
                      <dd>{txHash.slice(0, 18)}...</dd>
                    </div>
                  )}
                </dl>
              </section>

              {events.length > 0 && (
                <section style={plainPanelStyle}>
                  <h2 style={sectionTitleStyle}>Recent activity</h2>
                  <div style={eventListStyle}>
                    {events.map((event, index) => <div key={index}>{event}</div>)}
                  </div>
                </section>
              )}
            </aside>
          </section>
        )}

        {isConnected && (
          <section style={developerPanelStyle}>
            <div>
              <h2 style={developerTitleStyle}>Developer test controls</h2>
              <p style={mutedTextStyle}>Plain bids are only for debugging state refresh and contract wiring.</p>
            </div>
            <div style={developerActionsStyle}>
              <button onClick={handleBidTrivial} disabled={isPending || !isBidAmountValid} style={smallButtonStyle}>
                Debug Plain Bid
              </button>
              {isOwner && !endedValue && (
                <button onClick={handleEndAuction} disabled={isPending} style={dangerButtonStyle}>
                  End Auction
                </button>
              )}
            </div>
          </section>
        )}

        {!CONTRACT_ADDRESS && (
          <p style={errorTextStyle}>Set VITE_CONTRACT_ADDRESS env var.</p>
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f0e8",
  color: "#1d2527",
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  padding: "32px 20px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 24,
  marginBottom: 24,
};

const headerActionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const eyebrowStyle: React.CSSProperties = {
  color: "#3d6f63",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  margin: "6px 0 8px",
  fontSize: 46,
  lineHeight: 1,
  letterSpacing: 0,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#586466",
  fontSize: 17,
  maxWidth: 620,
};

const networkPillStyle: React.CSSProperties = {
  border: "1px solid #bdd7ce",
  background: "#e7f1ed",
  color: "#244b43",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 700,
  fontSize: 13,
};

const metricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 16,
};

const metricPanelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #ded8ce",
  borderRadius: 8,
  padding: 18,
  boxShadow: "0 14px 40px rgba(52, 45, 33, 0.08)",
};

const metricLabelStyle: React.CSSProperties = {
  display: "block",
  color: "#6c7475",
  fontSize: 13,
  marginBottom: 8,
};

const metricValueStyle: React.CSSProperties = {
  fontSize: 28,
  lineHeight: 1,
};

const mainGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(320px, 1.05fr) minmax(300px, 0.95fr)",
  gap: 16,
  alignItems: "start",
};

const bidPanelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d9d0c3",
  borderRadius: 8,
  padding: 24,
  boxShadow: "0 18px 48px rgba(52, 45, 33, 0.1)",
};

const sidePanelStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const plainPanelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #ded8ce",
  borderRadius: 8,
  padding: 18,
};

const emptyPanelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #ded8ce",
  borderRadius: 8,
  padding: 24,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 18,
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 20,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  lineHeight: 1.2,
  letterSpacing: 0,
};

const ownerBadgeStyle: React.CSSProperties = {
  background: "#f1e4c3",
  color: "#66501c",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 700,
};

const inputLabelStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  color: "#3a4547",
  fontWeight: 700,
  marginBottom: 8,
};

const unitStyle: React.CSSProperties = {
  color: "#6c7475",
  fontSize: 13,
  fontWeight: 600,
};

const amountInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cfc7ba",
  borderRadius: 8,
  padding: "14px 16px",
  fontSize: 28,
  fontWeight: 750,
  color: "#182123",
  background: "#fbfaf7",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  background: "#246b5d",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 800,
  padding: "12px 16px",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #cfc7ba",
  borderRadius: 8,
  background: "#ffffff",
  color: "#263436",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
  padding: "10px 14px",
};

const wideButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 16,
  padding: "15px 18px",
};

const disabledButtonStyle: React.CSSProperties = {
  background: "#94aaa5",
  cursor: "not-allowed",
};

const smallButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  fontSize: 13,
  padding: "9px 12px",
};

const dangerButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  background: "#a13d3d",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 800,
  padding: "10px 12px",
};

const statusTextStyle: React.CSSProperties = {
  color: "#586466",
  fontSize: 13,
  margin: "12px 0 0",
  minHeight: 18,
};

const mutedTextStyle: React.CSSProperties = {
  color: "#667173",
  fontSize: 14,
  lineHeight: 1.55,
  margin: "6px 0 0",
};

const errorTextStyle: React.CSSProperties = {
  color: "#a13d3d",
  fontSize: 13,
  marginTop: 8,
};

const ruleGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 14,
};

const ruleLabelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 800,
  color: "#263436",
};

const evidenceListStyle: React.CSSProperties = {
  margin: "14px 0 0",
  display: "grid",
  gap: 10,
};

const evidenceRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#334143",
  fontSize: 14,
  fontVariantNumeric: "tabular-nums",
};

const eventListStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 12,
  color: "#3d4a4c",
  fontSize: 13,
};

const developerPanelStyle: React.CSSProperties = {
  marginTop: 16,
  background: "#eee7db",
  border: "1px solid #d8cbb9",
  borderRadius: 8,
  padding: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const developerTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
};

const developerActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};
