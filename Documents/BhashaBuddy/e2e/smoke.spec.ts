import { test, expect } from "@playwright/test";

test.describe("BhashaBuddy Smoke Test", () => {
  test("should load landing page correctly", async ({ page }) => {
    await page.goto("/");
    
    // Check main title
    await expect(page.locator("h1")).toContainText("Decode complex public documents");
    
    // Check upload box elements
    await expect(page.locator("text=Upload document to decode")).toBeVisible();
    
    // Check demo documents cards
    await expect(page.locator("text=Pragati Scholarship Scheme 2026")).toBeVisible();
    await expect(page.locator("text=VNRVJIET Fee Circular")).toBeVisible();
    await expect(page.locator("text=PM-KISAN Samman Nidhi e-KYC")).toBeVisible();
    await expect(page.locator("text=SBI PAN & KYC Compliance Notice")).toBeVisible();
  });
});
