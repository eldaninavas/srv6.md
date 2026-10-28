// Screenshot HTML jobs with Chromium (Playwright). Usage:
//   node youtube/tools/shoot.mjs jobs.json
// jobs.json: [{ "html": "<path or inline html>", "out": "file.png", "width": 1920, "height": 1080, "transparent": false }]
// Chromium comes from CHROME_PATH (same convention as tools/diagrams/browser.mjs).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const jobs = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: job.width, height: job.height }, deviceScaleFactor: 1 });
  const html = existsSync(job.html) ? readFileSync(job.html, 'utf8') : job.html;
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  writeFileSync(job.out, await page.screenshot({ omitBackground: !!job.transparent }));
  await page.close();
  console.error(`shot ${job.out}`);
}
await browser.close();
