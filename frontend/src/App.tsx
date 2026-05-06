import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { createInstance, type FhevmInstance } from "@zama-fhe/relayer-sdk/web";
import ABI from "./EncryptedCounter.abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
// Local Zama config addresses (chainId 31337)
const LOCAL_ACL = "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D";
const LOCAL_KMS = "0x901F8942346f7AB3a01F6D7613119Bca447Bb030";
const LOCAL_INPUT_VERIFIER = "0xe3a9105a3a932253A70F126eb1E3b589C643dD24";
const LOCAL_RELAYER_URL = "http://localhost:8545";

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: txHash, isPending } = useWriteContract();

  const [plainValue, setPlainValue] = useState("42");
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [status, setStatus] = useState("");
  const [decryptedValue, setDecryptedValue] = useState<number | null>(null);

  // Read current value
  const { data: handle } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ABI,
    functionName: "getValue",
  });

  // Initialize FHEVM instance
  useEffect(() => {
    if (!isConnected || !address) return;
    const init = async () => {
      try {
        const inst = await createInstance({
          chainId: 31337,
          network: window.ethereum,
          aclContractAddress: LOCAL_ACL,
          kmsContractAddress: LOCAL_KMS,
          inputVerifierContractAddress: LOCAL_INPUT_VERIFIER,
          verifyingContractAddressDecryption: LOCAL_KMS,
          verifyingContractAddressInputVerification: LOCAL_INPUT_VERIFIER,
          relayerUrl: LOCAL_RELAYER_URL,
          gatewayChainId: 31337,
        });
        setInstance(inst);
        setStatus("FHEVM instance ready");
      } catch (err: any) {
        setStatus(`FHEVM init failed: ${err.message}`);
      }
    };
    init();
  }, [isConnected, address]);

  // Submit encrypted value
  const handleSubmitEncrypted = async () => {
    if (!instance || !address || !CONTRACT_ADDRESS) return;
    try {
      setStatus("Encrypting...");

      // Step 1: Create encrypted input
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add32(Number(plainValue));

      // Step 2: Encrypt
      const { handles, inputProof } = await input.encrypt();
      setStatus("Encrypted. Submitting to contract...");

      // Step 3: Submit to contract
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: "setValue",
        args: [handles[0], inputProof],
      });

      setStatus("Transaction submitted!");
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // Submit trivial (for local test without relayer)
  const handleSubmitTrivial = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "setValueTrivial",
      args: [Number(plainValue)],
    });
    setStatus("Trivial encrypt tx submitted...");
  };

  // Allow decryption
  const handleAllowDecryption = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "allowValueDecryption",
    });
    setStatus("Allowing decryption...");
  };

  // Decrypt using relayer
  const handleDecrypt = async () => {
    if (!instance || !handle) return;
    try {
      setStatus("Decrypting via relayer...");
      const results = await instance.publicDecrypt([handle.toString()]);
      if (results && results.length > 0) {
        setDecryptedValue(Number(results[0]));
        setStatus("Decrypted!");
      }
    } catch (err: any) {
      setStatus(`Decrypt error: ${err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1>🔐 SilentBid — Day 1 E2E Spike</h1>
      <p>EncryptedCounter: browser → encrypt → contract → decrypt → display</p>

      {!isConnected ? (
        <button onClick={() => connect({ connector: injected() })}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>✅ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <p>Status: {status}</p>
          {instance && <p>🔧 FHEVM SDK loaded</p>}

          <div style={{ margin: "20px 0" }}>
            <label>
              Value to encrypt:{" "}
              <input
                type="number"
                value={plainValue}
                onChange={(e) => setPlainValue(e.target.value)}
                style={{ width: 100, padding: 4 }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={handleSubmitTrivial} disabled={isPending || !CONTRACT_ADDRESS}>
              Submit (trivial encrypt)
            </button>
            <button onClick={handleSubmitEncrypted} disabled={isPending || !instance || !CONTRACT_ADDRESS}>
              Submit (FHE encrypt)
            </button>
            <button onClick={handleAllowDecryption} disabled={isPending || !CONTRACT_ADDRESS}>
              Allow Decrypt
            </button>
            <button onClick={handleDecrypt} disabled={!instance || !handle}>
              Decrypt via Relayer
            </button>
          </div>

          {txHash && <p>TX: {txHash.slice(0, 20)}...</p>}
          {handle && <p>Handle: {handle.toString().slice(0, 20)}...</p>}
          {decryptedValue !== null && (
            <p style={{ fontSize: 24, fontWeight: "bold" }}>
              🔓 Decrypted value: {decryptedValue}
            </p>
          )}

          <hr />
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}

      {!CONTRACT_ADDRESS && (
        <p style={{ color: "orange" }}>
          ⚠️ Set VITE_CONTRACT_ADDRESS env var with deployed contract address
        </p>
      )}
    </div>
  );
}
