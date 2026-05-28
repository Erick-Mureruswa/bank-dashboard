// Final screenshot pass — takes proper screenshots with adequate wait times
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, 'e2e-screenshots');
try { mkdirSync(DIR, { recursive: true }); } catch {}

const BASE = 'http://localhost:3000';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  // --- Login page ---
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(DIR, 'final-01-login.png'), fullPage: true });
  console.log('Screenshot: final-01-login.png');

  // --- Fill and submit ---
  await page.locator('input[type="email"]').fill('user@nexabank.com');
  await page.locator('input[type="password"]').fill('Demo@1234');
  await page.screenshot({ path: join(DIR, 'final-02-login-filled.png'), fullPage: true });

  const [res] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/auth/login')),
    page.locator('button[type="submit"]').click(),
  ]);
  console.log('Login status:', res.status());

  await page.waitForURL(`${BASE}/dashboard**`, { timeout: 10000 });
  console.log('Redirected to:', page.url());

  // Wait for charts to render
  await page.waitForSelector('[class*="recharts"]', { timeout: 10000 }).catch(() => console.log('recharts not found'));
  await page.waitForTimeout(1500); // let GSAP/animations complete

  await page.screenshot({ path: join(DIR, 'final-03-dashboard.png'), fullPage: true });
  console.log('Screenshot: final-03-dashboard.png');

  // --- Sidebar closeup ---
  const sidebar = page.locator('aside').first();
  const box = await sidebar.boundingBox().catch(() => null);
  if (box) {
    await page.screenshot({
      path: join(DIR, 'final-04-sidebar.png'),
      clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
    console.log('Screenshot: final-04-sidebar.png');
  }

  // --- Transactions ---
  await page.goto(`${BASE}/transactions`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(DIR, 'final-05-transactions.png'), fullPage: true });
  console.log('Screenshot: final-05-transactions.png — URL:', page.url());

  // --- Savings ---
  await page.goto(`${BASE}/savings`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(DIR, 'final-06-savings.png'), fullPage: true });
  console.log('Screenshot: final-06-savings.png — URL:', page.url());

  // --- Back to dashboard ---
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('[class*="recharts"]', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(DIR, 'final-07-dashboard-return.png'), fullPage: true });
  console.log('Screenshot: final-07-dashboard-return.png — URL:', page.url());

  if (errors.length > 0) {
    console.log('\nConsole errors collected:');
    errors.forEach(e => console.log(' ', e));
  } else {
    console.log('\nNo console errors detected.');
  }

  await browser.close();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
