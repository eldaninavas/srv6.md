import { chromium } from 'playwright-core';
const OUT = process.argv[2];
const pages = (process.argv[3] || '').split(',');
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
for (const spec of pages) {
  const [path, idx = '0'] = spec.split('#');
  await p.goto(`http://localhost:8802/${path}/`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.md-header,.md-tabs{display:none!important}' });
  const l = p.locator('.srv6-flow').nth(Number(idx)); await l.scrollIntoViewIfNeeded();
  await p.waitForSelector('.srv6-flow__edge', { state: 'attached' }); await p.waitForTimeout(1500);
  for (const s of ['default', 'slate']) {
    await p.evaluate((s) => document.body.setAttribute('data-md-color-scheme', s), s); await p.waitForTimeout(250);
    await l.screenshot({ path: `${OUT}/${path.replace(/\//g, '_')}-${idx}-${s}.png` });
  }
}
console.log('errors', errors);
await b.close();
