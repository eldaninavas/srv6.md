// Render a 3D reel: drives youtube/tools/reel3d.html frame by frame and pipes
// the frames into ffmpeg together with the narration. Usage:
//   node youtube/tools/reel3d.mjs timeline.json audio.wav out.mp4 [--frames T1,T2 a.png,b.png]
// Chromium comes from CHROME_PATH (same convention as shoot.mjs).
import { readFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const [tlPath, audio, out, flag, frameTs, framePngs] = process.argv.slice(2);
const tl = JSON.parse(readFileSync(tlPath, 'utf8'));
const FPS = 30;
const html = fileURLToPath(new URL('./reel3d.html', import.meta.url));

const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'],
});
const wide = tl.format === 'wide';
const page = await browser.newPage({ viewport: wide ? { width: 1920, height: 1080 } : { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(pathToFileURL(html).href + (wide ? '?format=wide' : ''), { waitUntil: 'load' });
await page.waitForFunction(() => window.ready && window.setup);
await page.evaluate(() => window.ready);
await page.evaluate(tl => window.setup(tl), tl);

if (flag === '--frames') {
  const pngs = framePngs.split(',');
  for (const [i, t] of frameTs.split(',').entries()) {
    await page.evaluate(t => window.renderAt(t), Number(t));
    writeFileSync(pngs[i], await page.screenshot({ type: 'png' }));
  }
} else {
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', audio,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
    '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.ceil(tl.total * FPS);
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.renderAt(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.error(`frame ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error(`ffmpeg ${c}`)) : res())));
}
await browser.close();
