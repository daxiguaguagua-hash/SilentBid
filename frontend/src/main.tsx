import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import App from "./App";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http("http://localhost:8545"),
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC || "https://eth-sepolia.g.alchemy.com/v2/yUWc_wLg_TSq_8f09jOLg"),
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
