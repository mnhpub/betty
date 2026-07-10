import { test, expect } from "@playwright/test";

function uniqueUser() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: "Playwright User",
    email: `playwright+${id}@example.com`,
    password: "playwright123",
  };
}

test("root path redirects to the default locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("heading", { name: "Betty" })).toBeVisible();
});

test("language switcher swaps locale and persists across reload", async ({ page }) => {
  const user = uniqueUser();

  await page.goto("/en/signup");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("textbox", { name: "Password" }).fill(user.password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("button", { name: "Change language" }).click();
  await page.getByText("Español").click();
  await expect(page).toHaveURL(/\/es\/dashboard/);
  await expect(page.getByRole("heading", { level: 3 })).toHaveText("Crecimiento de membresía");

  // Cookie set by the switcher should drive the default-locale redirect too
  // (lands on /es/dashboard since the session is still active).
  await page.goto("/");
  await expect(page).toHaveURL(/\/es(\/|$)/);
});
