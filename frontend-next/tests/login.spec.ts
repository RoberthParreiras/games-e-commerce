import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("should allow a user to log in successfully", async ({ page }) => {
    await page.goto("http://localhost:3000/signin");

    await page.fill('input[name="email"]', "roberth@mail.com");
    await page.fill('input[name="password"]', "test123");

    await page.click('button[type="submit"]');

    await page.waitForURL("http://localhost:3000/admin");
    expect(page.url()).toBe("http://localhost:3000/admin");

    await expect(page.getByRole("button", { name: "Add game" })).toBeVisible();
  });

  test("should show an error message with invalid credentials", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/signin");

    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/auth/callback/credentials") &&
        resp.status() !== 200,
    );

    await page.fill('input[name="email"]', "wronguser@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    await responsePromise;

    await expect(page.getByText("Invalid email or password")).toBeVisible();

    // Assert that the URL has not changed
    expect(page.url()).toContain("/signin");
  });
});
