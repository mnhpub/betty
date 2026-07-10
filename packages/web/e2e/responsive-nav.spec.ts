import { test, expect } from "@playwright/test";

function uniqueUser() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: "Playwright User",
    email: `playwright+${id}@example.com`,
    password: "playwright123",
  };
}

test.use({ viewport: { width: 375, height: 812 } });

test("mobile nav starts collapsed and toggles via the hamburger button", async ({ page }) => {
  const user = uniqueUser();

  await page.goto("/en/signup");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("textbox", { name: "Password" }).fill(user.password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  const sideNav = page.getByLabel("Side navigation");
  await expect(sideNav).not.toHaveClass(/cds--side-nav--expanded/);

  // The collapsed nav must not sit on top of page content and intercept clicks.
  await page.getByRole("button", { name: "Log out" }).click({ timeout: 5000 });
  await expect(page).toHaveURL(/\/login/);

  // Log back in and confirm the toggle actually opens/closes the nav.
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("textbox", { name: "Password" }).fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  await toggle.click();
  await expect(sideNav).toHaveClass(/cds--side-nav--expanded/);

  await sideNav.getByRole("link", { name: "Groups" }).click();
  await expect(page).toHaveURL(/\/groups/);
});
