import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "e2e-report" }]],
  use: {
    baseURL: "http://localhost:5174",
    headless: true,
    screenshot: "on",
    video: "off",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "VITE_CONTRACT_ADDRESS=0xAB06CB9cddC96B4c8725F3298548e56CbC10994d npx vite --port 5174 --strictPort",
    cwd: ".",
    port: 5174,
    reuseExistingServer: true,
    timeout: 15000,
  },
});
