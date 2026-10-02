import { test, expect } from "@playwright/test";
test("Class 12 sheets, unfinished quiz resume and unsupported class state", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Class 12", exact: true }).click();
  await page.getByRole("button", { name: "CBSE", exact: true }).click();
  await page.getByRole("button", { name: "Science", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Physics", exact: true }).click();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Physics", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Class 12 Current Electricity Sheet",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Ohm’s Law", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Bookmark sheet", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove sheet bookmark", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await page.getByRole("tab", { name: "Practice" }).click();
  await page
    .getByRole("button", { name: "Generate offline test", exact: true })
    .click();
  await page.waitForURL("**/test/**");
  const testUrl = page.url();
  await page.getByRole("button", { name: /^A\./ }).click();
  await expect(
    page.getByRole("button", { name: "Next question", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Question 2 of 5", { exact: true }),
  ).toBeVisible();
  expect(page.url()).toBe(testUrl);
  await page.getByRole("button", { name: /^B\./ }).click();
  await expect(
    page.getByRole("button", { name: "Next question", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Change study plan", exact: true })
    .click();
  await page.getByRole("button", { name: "School", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Class 6", exact: true }).click();
  await page.getByRole("button", { name: "ICSE", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page
      .getByText("Content coming soon", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await expect(
    page
      .getByText("Content coming soon", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Practice" }).click();
  await page
    .getByRole("button", { name: "Generate offline test", exact: true })
    .click();
  await expect(
    page.getByText("Try another configuration", { exact: true }),
  ).toBeVisible();
});
