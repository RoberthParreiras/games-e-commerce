import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Create a animal", () => {
  test("log in successfully and create animal", async ({ page }) => {
    await page.goto("http://localhost:3000/signin");

    await page.fill('input[name="email"]', "roberth@mail.com");
    await page.fill('input[name="password"]', "test123");

    await page.click('button[type="submit"]');

    await page.waitForURL("http://localhost:3000/admin");
    await page.goto("http://localhost:3000/admin/adicionar");

    const newGameName = `Test Game ${Date.now()}`;
    const imagePath1 = path.resolve(__dirname, "fixtures/image1.png");
    const imagePath2 = path.resolve(__dirname, "fixtures/image2.png");

    await page.getByLabel("Name").fill(newGameName);
    await page
      .getByLabel("Description")
      .fill("This is a test description for a new game.");
    await page.locator('input[name="price"]').fill("49,99");

    await page.locator('input[type="file"]').first().setInputFiles(imagePath1);
    const modal1 = page.locator("div").filter({ hasText: "Zoom" });
    await modal1.getByRole("button", { name: "Save" }).click();

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath2);
    const modal2 = page.locator("div").filter({ hasText: "Zoom" });
    await modal2.getByRole("button", { name: "Save" }).click();

    await page.getByRole("button", { name: "Save" }).click();

    await page.waitForURL("http://localhost:3000/admin");
    expect(page.url()).toContain("http://localhost:3000/admin");

    await expect(page.getByText(newGameName)).toBeVisible();
  });
});
