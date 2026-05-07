import { test, expect } from "@playwright/test";

test.describe("SilentBid — E2E smoke", () => {
  test("page loads with heading, metrics, and connect button", async ({ page }) => {
    await page.goto("/");

    // Branding and description
    await expect(page.locator("nav").getByText("SilentBid.")).toBeVisible();
    await expect(page.getByText("Private bids. Public settlement.")).toBeVisible();
    await expect(page.getByText("Zama FHEVM sealed auction")).toBeVisible();

    // Metrics panel on Home
    await expect(page.getByText("Auction", { exact: true })).toBeVisible();
    await expect(page.getByText("Sealed bids", { exact: true })).toBeVisible();
    await expect(page.getByText("FHEVM", { exact: true })).toBeVisible();

    // Connect Wallet buttons (Navbar + Home CTA)
    const connectButtons = page.getByRole("button", { name: "Connect Wallet" });
    await expect(connectButtons.first()).toBeVisible();
    await expect(connectButtons).toHaveCount(2);
  });

  test("disconnected state hides bid panel and developer controls", async ({ page }) => {
    await page.goto("/");

    // Bid panel should NOT be visible on Home page when disconnected
    await expect(page.getByRole("button", { name: "Place Private Bid" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Debug Plain Bid" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "End Auction" })).not.toBeVisible();
  });

  test("Sepolia network is referenced", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sepolia / Zama FHEVM")).toBeVisible();
  });

  test("auction detail page shows connect prompt when disconnected", async ({ page }) => {
    await page.goto("/auction/live");
    // AuctionDetail shows connect prompt when wallet not connected
    await expect(page.getByText("Connect to enter the auction")).toBeVisible();
    await expect(page.getByText("Use a Sepolia wallet to place a private bid")).toBeVisible();
  });

  test("screenshot evidence", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "e2e/screenshots/silentbid-disconnected.png", fullPage: true });
  });
});
