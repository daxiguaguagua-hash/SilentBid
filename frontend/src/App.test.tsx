import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const mockEthereum = {
  request: vi.fn().mockResolvedValue("0x7a69"),
  on: vi.fn(),
  removeListener: vi.fn(),
};
vi.stubGlobal("ethereum", mockEthereum);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const config = createConfig({
  chains: [hardhat],
  transports: { [hardhat.id]: http("http://localhost:8545") },
});

function renderApp() {
  return render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

beforeEach(() => queryClient.clear());

describe("App — disconnected state", () => {
  it("shows SilentBid heading", () => {
    renderApp();
    expect(screen.getByText("🤫 SilentBid")).toBeInTheDocument();
  });

  it("shows description", () => {
    renderApp();
    expect(screen.getByText(/Privacy-preserving/)).toBeInTheDocument();
  });

  it("shows Connect Wallet button", () => {
    renderApp();
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  it("does not show bid input when disconnected", () => {
    renderApp();
    expect(screen.queryByLabelText(/Bid amount/i)).not.toBeInTheDocument();
  });

  it("does not show End Auction button when disconnected", () => {
    renderApp();
    expect(screen.queryByText("End Auction")).not.toBeInTheDocument();
  });
});
