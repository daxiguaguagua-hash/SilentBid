import { test, expect } from "@playwright/test";

test.describe("SilentBid — E2E smoke", () => {
  test("page loads with heading, metrics, and connect button", async ({ page }) => {
    await page.goto("/");

    // Heading and description
    await expect(page.getByRole("heading", { name: "SilentBid" })).toBeVisible();
    await expect(page.getByText("Private bids. Public settlement.")).toBeVisible();
    await expect(page.getByText("Zama FHEVM sealed auction")).toBeVisible();

    // Metrics panel (use exact match to avoid "auction" in other text)
    await expect(page.getByText("Auction", { exact: true })).toBeVisible();
    await expect(page.getByText("Sealed bids", { exact: true })).toBeVisible();
    await expect(page.getByText("FHEVM", { exact: true })).toBeVisible();

    // Connect Wallet buttons (header + center CTA — both visible when disconnected)
    const connectButtons = page.getByRole("button", { name: "Connect Wallet" });
    await expect(connectButtons.first()).toBeVisible();
    await expect(connectButtons).toHaveCount(2);

    // Disconnected-state message
    await expect(page.getByText("Connect to enter the auction")).toBeVisible();
  });

  test("disconnected state hides bid panel and developer controls", async ({ page }) => {
    await page.goto("/");

    // Bid panel should NOT be visible when disconnected
    await expect(page.getByRole("button", { name: "Place Private Bid" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Debug Plain Bid" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "End Auction" })).not.toBeVisible();
  });

  test("Sepolia network pill is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sepolia", { exact: true })).toBeVisible();
  });

  test("sealed auction rules section is visible when disconnected", async ({ page }) => {
    await page.goto("/");
    // The rules are shown in the "Connect to enter the auction" empty state
    await expect(page.getByText("Use a Sepolia wallet to place a private bid")).toBeVisible();
  });

  test("screenshot evidence", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "e2e/screenshots/silentbid-disconnected.png", fullPage: true });
  });
});
