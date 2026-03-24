import { test, expect } from '@playwright/test';

test('Mathematics JAMB session renders LaTeX correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click on "JAMB" Exam Card
  await page.click('text="JAMB"');

  // Click on "Science" Department
  await page.click('text="Science"');

  // Click on "Mathematics" Subject
  await page.click('text="Mathematics"');

  // Find all buttons
  const downloadButtons = page.getByRole('button', { name: 'DOWNLOAD' });
  const startButtons = page.getByRole('button', { name: 'START' });

  if (await downloadButtons.count() > 0) {
      await downloadButtons.first().click();
      // Wait for "START" button to appear in the same row
      await expect(startButtons.first()).toBeVisible({ timeout: 20000 });
  }

  // Click START for the first one
  await startButtons.first().click();

  // Wait for the session to load and check for KaTeX elements
  await expect(page.locator('.katex').first()).toBeVisible({ timeout: 15000 });

  // Take a screenshot
  await page.screenshot({ path: 'tests/math_rendering.png', fullPage: true });
});
