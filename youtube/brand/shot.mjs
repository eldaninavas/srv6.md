import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--use-angle=metal', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
p.on('pageerror', e => console.error(e)); p.on('console', m => console.log(m.text()));
await p.goto('file://' + process.argv[2]); await p.waitForFunction(() => window.done, null, { timeout: 30000 });
await p.screenshot({ path: process.argv[3] }); await b.close();
