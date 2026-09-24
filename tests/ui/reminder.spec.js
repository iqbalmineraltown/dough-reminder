import { test, expect } from '@playwright/test';

test('advancing a bake persists the next deadline and reset clears progress', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-12T09:00:00') });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start autolyse' }).click();
  await expect(page.locator('#countdown')).toHaveText('30:00');
  await page.clock.fastForward('30:00');
  await expect(page.locator('#countdown')).toHaveText('Time to act');
  await page.getByRole('button', { name: 'Done: Finish autolyse' }).click();
  await expect(page.locator('#next-title')).toHaveText('Stretch & fold 1');
  await expect(page.locator('#countdown')).toHaveText('30:00');
  await page.reload();
  await expect(page.locator('#next-title')).toHaveText('Stretch & fold 1');
  await expect(page.locator('#countdown')).toHaveText('30:00');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reset bake' }).click();
  await expect(page.locator('#next-title')).toHaveText('Start a bake');
  await page.reload();
  await expect(page.locator('#next-title')).toHaveText('Start a bake');
});

test('an overdue action shows one local notification and does not re-notify after reload', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.clock.install({ time: new Date('2026-01-12T09:00:00') });
  await page.getByRole('button', { name: 'Start autolyse' }).click();
  await page.clock.fastForward('30:00');
  await expect(page.locator('#countdown')).toHaveText('Time to act');
  await expect.poll(async () => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return (await registration.getNotifications()).map(notification => notification.title);
  })).toEqual(['Time to finish autolyse']);
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('dough-reminder-bake-v1')).notified)).toBe(true);
  await page.reload();
  await expect(page.locator('#countdown')).toHaveText('Time to act');
  await expect.poll(async () => page.evaluate(async () => (await (await navigator.serviceWorker.getRegistration()).getNotifications()).length)).toBe(1);
});
