import { test, expect } from "@playwright/test";
test("offline school journey, restart persistence, JEE personalization and missing content", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("What are you preparing for?")).toBeVisible();
  await page.getByRole("button", { name: "School", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Class 10", exact: true }).click();
  await page.getByRole("button", { name: "CBSE", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Mathematics", exact: true }).click();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await expect(page.getByText("Your subjects", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Mathematics", exact: true }).click();
  await page
    .getByRole("button", { name: "Introduction to Trigonometry", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Pythagorean trigonometric identity",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Quick Formula", exact: true })
    .click();
  await expect(page.getByText("Worked example", { exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Learn Mode", exact: true }).click();
  await expect(page.getByText("Worked example", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove bookmark", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mark for revision", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove from revision", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await page.goBack();
  await page.goBack();
  await expect(page.getByText("Quick revision", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Search" }).click();
  await page
    .getByRole("textbox", { name: "Search, e.g. sin or Ohm" })
    .fill("sin");
  await expect(
    page.getByRole("button", {
      name: "Pythagorean trigonometric identity",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "short note", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Using the Pythagorean identity",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Using the Pythagorean identity",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Revision points", { exact: true }),
  ).toBeVisible();
  await page.goBack();
  await page
    .getByRole("button", { name: "My study plan", exact: true })
    .click();
  await page.getByRole("tab", { name: "Practice" }).click();
  await page
    .getByRole("button", { name: "Generate offline test", exact: true })
    .click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: /^A\./ }).click();
    await expect(page.getByText(/^(Correct!|Not quite\.)$/)).toBeVisible();
    await page
      .getByRole("button", {
        name: i === 4 ? "Finish & view result" : "Next question",
        exact: true,
      })
      .click();
  }
  await expect(page.getByText(/% accuracy$/)).toBeVisible();
  await page
    .getByRole("button", { name: "Back to Library", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Pythagorean trigonometric identity",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Revision", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Pythagorean trigonometric identity",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  const persisted = await page.evaluate(() =>
    localStorage.getItem("formula-learner-preferences-v1"),
  );
  expect(JSON.parse(persisted!).state.theme).toBe("dark");
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByText("Make it yours", { exact: true })).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByText("A little revision, every day", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Library" }).click();
  await expect(
    page.getByRole("button", {
      name: "Pythagorean trigonometric identity",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Revision", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Pythagorean trigonometric identity",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Recent", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Using the Pythagorean identity",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Change study plan", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Competitive Exam", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "JEE Main", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Mathematics", exact: true }).click();
  await page.getByRole("button", { name: "Physics", exact: true }).click();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Physics", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mathematics", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Search" }).click();
  await page
    .getByRole("textbox", { name: "Search, e.g. sin or Ohm" })
    .fill("Ohm");
  await expect(
    page.getByRole("button", { name: "Ohm’s Law", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Home" }).click();
  await page.screenshot({
    path: "docs/screenshots/home-dark.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Physics", exact: true }).click();
  await page
    .getByRole("button", { name: "Current Electricity", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Ohm’s Law", exact: true }),
  ).toBeVisible();
  await page.goto("/formula/not-a-real-id");
  await expect(
    page.getByText("Content not found", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
