// Record live srv6.md pages (animated React Flow diagrams) as video scenes.
//   node youtube/tools/record.mjs records.json
// records.json: [{ url, selector, click, clickAt, seconds, width, height, out }]
// The page is cleaned up (header, tabs, sidebars hidden), the element is
// centred and zoomed to fill the frame, then recorded for `seconds`. When
// `click` is set, the button whose text contains it is clicked after
// `clickAt` seconds (e.g. "Fail" for a failure scenario).
import { mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const jobs = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
for (const job of jobs) {
  const dir = mkdtempSync(join(tmpdir(), 'srv6rec-'));
  const context = await browser.newContext({
    viewport: { width: job.width, height: job.height },
    recordVideo: { dir, size: { width: job.width, height: job.height } },
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  const t0 = Date.now(); // video starts with the page; everything before `start` is trimmed
  await page.goto(job.url, { waitUntil: 'load', timeout: 60000 });
  await page.addStyleTag({ content: `
    .md-header,.md-tabs,.md-banner,.md-sidebar,.md-footer,.md-source-file,.md-content__button,.md-top{display:none!important}
    .md-main__inner{margin:0!important} body{overflow:hidden!important}` });
  const sel = job.selector || '.srv6-flow';
  const el = await page.waitForSelector(sel);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500); // let React Flow mount and the packets start
  await page.evaluate(({ sel, W, H }) => {
    // Show only the element: pin it to the centre of the frame and scale it up
    const e = document.querySelector(sel);
    const r = e.getBoundingClientRect();
    const scale = Math.min((W * 0.9) / r.width, (H * 0.86) / r.height, 2.6);
    const style = document.createElement('style');
    style.textContent = `body *{visibility:hidden!important} ${sel},${sel} *{visibility:visible!important}`;
    document.head.appendChild(style);
    Object.assign(e.style, {
      position: 'fixed', margin: '0', width: r.width + 'px', height: r.height + 'px',
      left: (W - r.width) / 2 + 'px', top: (H - r.height) / 2 + 'px',
      transform: `scale(${scale})`, transformOrigin: 'center center', zIndex: '9999',
    });
  }, { sel, W: job.width, H: job.height });
  await page.waitForTimeout(800); // re-layout after the zoom
  const start = Date.now();
  if (job.click) {
    await page.waitForTimeout((job.clickAt || 0) * 1000);
    await page.evaluate((text) => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes(text));
      if (b) b.click();
    }, job.click);
  }
  await page.waitForTimeout(Math.max(0, job.seconds * 1000 - (Date.now() - start)));
  const video = page.video();
  await context.close();
  renameSync(await video.path(), job.out);
  writeFileSync(job.out + '.json', JSON.stringify({ skip: (start - t0) / 1000 + 0.4 }));
  rmSync(dir, { recursive: true, force: true });
  console.error(`recorded ${job.out}`);
}
await browser.close();
