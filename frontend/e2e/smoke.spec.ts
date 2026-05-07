import { test, expect } from "@playwright/test";

test.describe("SilentBid — Home page", () => {
  test("page loads with heading, metrics, and connect button", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("nav").getByText("SilentBid.")).toBeVisible();
    await expect(page.getByText("Private bids. Public settlement.")).toBeVisible();
    await expect(page.getByText("Zama FHEVM sealed auction")).toBeVisible();

    await expect(page.getByText("Auction", { exact: true })).toBeVisible();
    await expect(page.getByText("Sealed bids", { exact: true })).toBeVisible();
    await expect(page.getByText("FHEVM", { exact: true })).toBeVisible();

    const connectButtons = page.getByRole("button", { name: "Connect Wallet" });
    await expect(connectButtons.first()).toBeVisible();
    await expect(connectButtons).toHaveCount(2);
  });

  test("disconnected state hides bid panel and developer controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Place Private Bid" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Debug Plain Bid" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "End Auction" })).not.toBeVisible();
  });

  test("Sepolia network is referenced in footer section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sepolia / Zama FHEVM")).toBeVisible();
  });
});

test.describe("SilentBid — Route navigation", () => {
  test("navigates to Lobby from Navbar", async ({ page }) => {
    await page.goto("/");
    await page.locator("nav").getByText("Archive").click();
    await expect(page).toHaveURL("/lobby");
    await expect(page.getByText("Archive.")).toBeVisible();
  });

  test("navigates to Dashboard from Navbar", async ({ page }) => {
    await page.goto("/");
    await page.locator("nav").getByText("Dashboard").click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("AuctionDetail shows connect prompt when disconnected", async ({ page }) => {
    await page.goto("/auction/live");
    await expect(page.getByText("Connect to enter the auction")).toBeVisible();
    await expect(page.getByText("Use a Sepolia wallet to place a private bid")).toBeVisible();
  });

  test("all routes render without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

    const routes = ["/", "/lobby", "/dashboard", "/auction/live"];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("load");
    }
    const real = errors.filter(e => !e.includes("favicon") && !e.includes("extension"));
    expect(real).toEqual([]);
  });
});

test.describe("SilentBid — i18n", () => {
  test("language switcher toggles between EN and 中文", async ({ page }) => {
    await page.goto("/");

    // Default English subtitle
    await expect(page.getByText("Private bids. Public settlement.")).toBeVisible();

    // Switch to Chinese — click "中文" button in LanguageSwitcher
    await page.locator("button", { hasText: "中文" }).click();
    // Wait for re-render, then check Chinese subtitle
    await expect(page.getByText("私密出价，公开结算。链上不出价明文。")).toBeVisible();

    // Switch back to English
    await page.locator("button", { hasText: "EN" }).click();
    await expect(page.getByText("Private bids. Public settlement.")).toBeVisible();
  });
});

test.describe("SilentBid — Layout", () => {
  test("Home page Sepolia footer renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sepolia / Zama FHEVM")).toBeVisible();
  });

});

test.describe("SilentBid — Evidence", () => {
  test("screenshot — Home disconnected", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.screenshot({ path: "e2e/screenshots/silentbid-disconnected.png", fullPage: true });
  });

  test("screenshot — Auction disconnected", async ({ page }) => {
    await page.goto("/auction/live");
    await page.waitForLoadState("load");
    await page.screenshot({ path: "e2e/screenshots/silentbid-auction-disconnected.png", fullPage: true });
  });

  test("screenshot — Dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("load");
    await page.screenshot({ path: "e2e/screenshots/silentbid-dashboard.png", fullPage: true });
  });
});
