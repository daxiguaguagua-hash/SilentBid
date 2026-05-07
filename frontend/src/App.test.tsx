import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App, { parseBidAmount } from "./App";
import { I18nProvider } from "./i18n";
import en from "./i18n/locales/en";
import zhCN from "./i18n/locales/zh-CN";

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
        <I18nProvider locale="en">
          <App />
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

beforeEach(() => queryClient.clear());

describe("App — disconnected state", () => {
  it("shows SilentBid branding", () => {
    renderApp();
    expect(screen.getByText("SilentBid.")).toBeInTheDocument();
  });

  it("shows description", () => {
    renderApp();
    expect(screen.getByText(/Private bids/)).toBeInTheDocument();
  });

  it("shows Connect Wallet button", () => {
    renderApp();
    expect(screen.getAllByText("Connect Wallet").length).toBeGreaterThan(0);
  });

  it("does not show bid input when disconnected", () => {
    renderApp();
    expect(screen.queryByLabelText("Bid amount")).not.toBeInTheDocument();
  });

  it("does not show End Auction button when disconnected", () => {
    renderApp();
    expect(screen.queryByText("End Auction")).not.toBeInTheDocument();
  });
});

describe("parseBidAmount", () => {
  it("accepts whole BID Credit amounts in uint32 range", () => {
    expect(parseBidAmount("100")).toBe(100);
    expect(parseBidAmount("4294967295")).toBe(4294967295);
  });

  it("rejects empty, fractional, negative, zero, and overflowing values", () => {
    expect(parseBidAmount("")).toBeNull();
    expect(parseBidAmount("1.5")).toBeNull();
    expect(parseBidAmount("-1")).toBeNull();
    expect(parseBidAmount("0")).toBeNull();
    expect(parseBidAmount("4294967296")).toBeNull();
  });
});

describe("i18n", () => {
  it("zh-CN has all en keys", () => {
    const enKeys = collectKeys(en);
    const zhKeys = collectKeys(zhCN);
    const missing = enKeys.filter((k) => !zhKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it("zh-CN has no extra keys", () => {
    const enKeys = collectKeys(en);
    const zhKeys = collectKeys(zhCN);
    const extra = zhKeys.filter((k) => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it("renders Chinese home text with zh-CN locale", () => {
    render(
      <WagmiProvider config={createConfig({
        chains: [hardhat],
        transports: { [hardhat.id]: http("http://localhost:8545") },
      })}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <I18nProvider locale="zh-CN">
            <App />
          </I18nProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("沉默的");
    expect(heading.textContent).toContain("出价");
  });
});

function collectKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "string") {
      keys.push(full);
    } else {
      keys.push(...collectKeys(obj[key], full));
    }
  }
  return keys;
}
