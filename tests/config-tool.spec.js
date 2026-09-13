const { test, expect } = require('@playwright/test');

test('GNSS trace playback can play, pause, and scrub loaded fixes', async ({ page }) => {
  await page.goto('/loko-config-tool/?map3d=0');
  await page.getByRole('tab', { name: 'GNSS Trace' }).click();

  await page.evaluate(() => {
    window.setGnssTraceRecordsBuffer([
      { recordNumber: 1, date: '26/09/13', time: '10:00:00', latitude: 40.40, longitude: 49.86, alt: 10, speedMps: 1, hdop: 1, batteryMv: 3800 },
      { recordNumber: 2, date: '26/09/13', time: '10:00:01', latitude: 40.41, longitude: 49.87, alt: 11, speedMps: 1, hdop: 1, batteryMv: 3790 },
      { recordNumber: 3, date: '26/09/13', time: '10:00:02', latitude: 40.42, longitude: 49.88, alt: 12, speedMps: 1, hdop: 1, batteryMv: 3780 },
    ]);
  });

  const play = page.getByRole('button', { name: 'Play GNSS trace' });
  const slider = page.getByRole('slider', { name: 'GNSS trace position' });
  await expect(play).toBeEnabled();
  await expect(slider).toHaveAttribute('max', '2');
  await expect(page.locator('#gnssTracePlaybackPosition')).toHaveText('1 / 3');

  await slider.fill('2');
  await slider.dispatchEvent('input');
  await expect(page.locator('#gnssTracePlaybackPosition')).toHaveText('3 / 3');

  await play.click();
  await expect(page.getByRole('button', { name: 'Pause GNSS trace' })).toBeVisible();
  await expect(page.locator('#gnssTracePlaybackPosition')).toHaveText('1 / 3');
  await expect(page.locator('#gnssTracePlaybackPosition')).toHaveText('2 / 3', { timeout: 1_500 });
  await page.getByRole('button', { name: 'Pause GNSS trace' }).click();
  await expect(play).toBeVisible();
});
