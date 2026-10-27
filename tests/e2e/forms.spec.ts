import { expect, test } from "@playwright/test";

// 1x1 PNG, to exercise the photo upload path.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

test("resident submits a report from a QR link and opens the status page", async ({ page }) => {
  await page.goto("/report?p=demo-community&u=205");
  await expect(page.getByLabel("Community")).toHaveValue("demo-community");
  await expect(page.getByLabel("Building and unit")).toHaveValue("Unit 205");

  await page.getByLabel("Your name").fill("E2E Resident");
  await page.getByLabel("Phone or email").fill("e2e-resident@example.com");
  await page.getByRole("radio", { name: "Trash in hallway" }).check();
  await page.locator('input[type="file"]').setInputFiles({ name: "hallway.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByRole("img", { name: "Photo 1" })).toBeVisible();
  await page.getByLabel("Tell us more").fill("Two bags left by the stairs.");
  await page.getByRole("button", { name: "Submit report" }).click();

  const heading = page.getByRole("heading", { name: /We got your report #\d+/ });
  await expect(heading).toBeVisible();
  const refNo = (await heading.textContent())!.match(/#(\d+)/)![1];

  await page.getByRole("link", { name: "Check your report status" }).click();
  await expect(page).toHaveURL(/\/report\/[0-9a-f]{36}$/);
  await expect(page.getByText(`Report #${refNo}`)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Received" })).toBeVisible();
  await expect(page.getByText("Demo Community")).toBeVisible();
  await expect(page.getByText("Trash in hallway")).toBeVisible();
  await expect(page.getByText("e2e-resident@example.com")).toHaveCount(0);
});

test("report form shows inline errors instead of submitting an empty form", async ({ page }) => {
  await page.goto("/report");
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByText("Choose your community")).toBeVisible();
  await expect(page.getByText("Enter your building and unit")).toBeVisible();
});

test("an unknown status link explains what to do", async ({ page }) => {
  await page.goto(`/report/${"0".repeat(36)}`);
  await expect(page.getByRole("heading", { name: "We couldn't find that report" })).toBeVisible();
});

test("property manager starts a quote on the home page and finishes it on the quote form", async ({ page }) => {
  await page.goto("/");
  const starter = page.getByRole("form", { name: "Start a quote" });
  await starter.getByLabel("Name", { exact: true }).fill("E2E Manager");
  await starter.getByLabel("Community name").fill("Maple Ridge");
  await starter.getByLabel("Email").fill("e2e-manager@example.com");
  await starter.getByLabel("Number of units").fill("240");
  await starter.getByRole("button", { name: "Request a Quote" }).click();

  await expect(page).toHaveURL(/\/quote#quote-form$/);
  const form = page.getByRole("form", { name: "Request a quote" });
  await expect(form.getByLabel("Full name")).toHaveValue("E2E Manager");
  await form.getByLabel("Phone").fill("(404) 555-0100");
  await form.getByLabel("Property type").selectOption("garden");
  await form.getByRole("checkbox", { name: "Bulk trash removal" }).check();
  await form.getByRole("button", { name: "Request my quote" }).click();

  await expect(page.getByText("Nick or Nigel will reach out within 24 hours.")).toBeVisible();
});

test("contact form sends a message", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("E2E Contact");
  await page.getByLabel("Email").fill("e2e-contact@example.com");
  await page.getByLabel("Message").fill("Do you service Henry County?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("heading", { name: "We got your message." })).toBeVisible();
});
