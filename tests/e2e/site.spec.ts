import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/services", "/about", "/residents", "/report", "/quote", "/faq", "/contact", "/privacy", "/terms"];

for (const path of PAGES) {
  test(`${path} has a title, description, one h1, no horizontal scroll and no serious axe issues`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/CB Environment Solutions/);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length).toBeGreaterThan(50);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("mobile shows the menu button and the fixed Get a Quote / Report an Issue bar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  const bar = page.locator("div.fixed.bottom-0");
  await expect(bar.getByRole("link", { name: "Get a Quote" })).toBeVisible();
  await expect(bar.getByRole("link", { name: "Report an Issue" })).toBeVisible();

  const menuButton = page.getByRole("button", { name: "Open menu" });
  await menuButton.click();
  const menu = page.getByRole("navigation", { name: "Mobile" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Services" }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(menu).toBeHidden();
});

test("How It Works link scrolls to the steps on the home page", async ({ page, isMobile }) => {
  await page.goto("/services");
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "How It Works" }).first().click();
  await expect(page).toHaveURL(/\/#how$/);
  await expect(page.getByRole("heading", { name: "Out by 8 PM. Gone by morning. Reported by Monday." })).toBeInViewport();
});

test("unknown pages show a 404 with useful links", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
});

test("residents page sends people to the separate report page instead of embedding the form", async ({ page }) => {
  await page.goto("/residents");
  await expect(page.getByRole("button", { name: "Submit report" })).toHaveCount(0);
  await page.getByRole("main").getByRole("link", { name: "Book a bulk pickup" }).click();
  await expect(page).toHaveURL(/\/report\?type=bulk_pickup_request$/);
  await expect(page.getByRole("heading", { level: 1, name: "Report an Issue" })).toBeVisible();
  await expect(page.getByRole("radio", { name: /bulk pickup/i })).toBeChecked();
});
