import { useState, useEffect } from "react";
import {
  useConnection, useConnect, useDisconnect,
  useWriteContract, useReadContract, useWatchContractEvent,
  useWaitForTransactionReceipt,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { toHex } from "viem";
import { createInstance, initSDK, SepoliaConfigV2, type FhevmInstance } from "@zama-fhe/relayer-sdk/web";
import ABI from "../SilentBid.abi.json";
import { parseBidAmount } from "../lib/bids";

const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "") as `0x${string}`;

const ENABLE_TEST = import.meta.env.VITE_ENABLE_TEST_CONTROLS === "true";

const FHEVM_CONFIG = {
  11155111: SepoliaConfigV2,
};

export function useSilentBid() {
  const { address, isConnected } = useConnection();
  const { mutate: connect } = useConnect();
  const { mutate: disconnect } = useDisconnect();
  const { mutateAsync: writeContractAsync, data: txHash, isPending } = useWriteContract();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [bidAmount, setBidAmount] = useState("100");
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [status, setStatus] = useState("");
  const [events, setEvents] = useState<string[]>([]);

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

  const handleRestartAuction = async () => {
    try {
      const ONE_HOUR = 3600;
      setStatus("Waiting for wallet confirmation...");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "restartAuction",
        args: [ONE_HOUR],
      });
      setStatus(`Auction restarted: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return {
    // wallet
    address, isConnected, connect: () => connect({ connector: injected() }), disconnect,
    // FHEVM
    instance, fhevmLabel,
    // contract state
    bidCount: bidCountLabel, ended: endedValue, isActive: isActiveValue, owner: ownerAddress, isOwner,
    // bid
    bidAmount, setBidAmount, parsedBidAmount, isBidAmountValid,
    // derived
    statusLabel, status, shortAddress, shortContract, events,
    // actions
    handleBid, handleBidTrivial, handleEndAuction, handleRestartAuction,
    // tx
    ENABLE_TEST,
    txHash, isPending,
  };
}
