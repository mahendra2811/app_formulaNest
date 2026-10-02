import { test, expect } from "@playwright/test";
test("Commerce onboarding and structured supplied content persist", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Class 11", exact: true }).click();
  await page.getByRole("button", { name: "Commerce", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Accountancy", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Accountancy", exact: true }).click();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  for (const [id, content] of [
    ["entry_cash_purchase", "Purchases A/c Dr. To Cash A/c"],
    ["accounting_ratio_classification", "Short-term solvency"],
    ["history_gandhi_national_movement_timeline", "1942"],
    [
      "political_science_lok_sabha_rajya_sabha_comparison",
      "Represents the States and Union Territories",
    ],
    ["chemistry_aldol_condensation", "Aldol Condensation"],
  ]) {
    await page.goto(`/content/${id}`);
    await expect(
      page.getByText(content, { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Source information", { exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove bookmark", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove bookmark", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
