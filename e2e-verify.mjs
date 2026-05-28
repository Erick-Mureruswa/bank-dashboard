import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'e2e-screenshots');
try { mkdirSync(SCREENSHOTS_DIR, { recursive: true }); } catch {}

const BASE_URL = 'http://localhost:3000';
const results = [];
const consoleErrors = [];

function log(msg) {
  console.log(`[E2E] ${msg}`);
  results.push(msg);
}

async function screenshot(page, name, description) {
  const filePath = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  log(`SCREENSHOT: ${name}.png — ${description}`);
  return filePath;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(`[pageerror] ${err.message}`);
  });

  // ─── STEP 1: Login page ────────────────────────────────────────────────────
  log('\n=== STEP 1: Navigate to /login ===');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  const loginTitle = await page.title();
  log(`Page title: ${loginTitle}`);

  const loginBg = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  log(`Login page body background: ${loginBg}`);

  // Check for email/password inputs
  const emailCount = await page.locator('input[type="email"]').count();
  const passwordCount = await page.locator('input[type="password"]').count();
  log(`Email inputs: ${emailCount}, Password inputs: ${passwordCount}`);

  // Demo credentials box
  const demoText = await page.locator('text=Demo access').count();
  log(`Demo credentials box visible: ${demoText > 0}`);

  // Font detection
  const fontFamily = await page.evaluate(() =>
    window.getComputedStyle(document.body).fontFamily
  );
  log(`Font family: ${fontFamily}`);

  // Check for Geist font in stylesheets
  const hasGeist = await page.evaluate(() => {
    const sheets = [...document.styleSheets];
    try {
      for (const sheet of sheets) {
        const rules = [...(sheet.cssRules || [])];
        for (const rule of rules) {
          if (rule.cssText && rule.cssText.toLowerCase().includes('geist')) return true;
        }
      }
    } catch {}
    return document.documentElement.innerHTML.toLowerCase().includes('geist');
  });
  log(`Geist font referenced: ${hasGeist}`);

  // Check for OLED black / dark background
  const isOledDark = await page.evaluate(() => {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    // rgb(9, 9, 11) or rgb(0,0,0) or very dark
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return (r + g + b) < 60;
    }
    return false;
  });
  log(`OLED dark background (very dark bg): ${isOledDark}`);

  // Check for electric blue accent
  const hasBlueAccent = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('button, a, [class*="accent"], [style*="gradient"]')];
    for (const el of allEls) {
      const style = window.getComputedStyle(el);
      const inlineStyle = el.getAttribute('style') || '';
      if (inlineStyle.includes('#4361ee') || inlineStyle.includes('#5b7af0') ||
          inlineStyle.includes('4361ee') || style.backgroundColor.includes('67, 97')) {
        return true;
      }
    }
    // Check inline styles on entire document
    return document.body.innerHTML.includes('4361ee') || document.body.innerHTML.includes('5b7af0');
  });
  log(`Electric blue accent detected: ${hasBlueAccent}`);

  await screenshot(page, '01-login-page', 'Login page initial load');

  // ─── STEP 2: Fill login form ───────────────────────────────────────────────
  log('\n=== STEP 2: Fill in login form ===');

  // Use React-compatible fill — Playwright fill() triggers React onChange
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.click();
  await emailInput.fill('user@nexabank.com');
  log(`Email field value after fill: ${await emailInput.inputValue()}`);

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.click();
  await passwordInput.fill('Demo@1234');
  log(`Password field value after fill: ${await passwordInput.inputValue()}`);

  await screenshot(page, '02-login-filled', 'Login form filled with credentials');

  // Submit
  const submitBtn = page.locator('button[type="submit"]').first();
  const submitText = await submitBtn.textContent();
  log(`Submit button text: "${submitText?.trim()}"`);

  // Wait for response after clicking
  const [response] = await Promise.all([
    page.waitForResponse(res => res.url().includes('/api/auth/login'), { timeout: 10000 }),
    submitBtn.click(),
  ]);
  log(`Login API response status: ${response.status()}`);
  const responseBody = await response.json().catch(() => ({}));
  log(`Login API response body: ${JSON.stringify(responseBody)}`);

  // Wait for navigation to dashboard
  try {
    await page.waitForURL(`${BASE_URL}/dashboard**`, { timeout: 10000 });
    log('SUCCESS: Redirected to /dashboard');
  } catch {
    const currentUrl = page.url();
    log(`WARNING: Expected /dashboard but current URL is: ${currentUrl}`);

    // Check for error messages on the page
    const errorMsg = await page.locator('[class*="error"], [class*="danger"], [role="alert"]').first().textContent().catch(() => null);
    if (errorMsg) log(`Error message on page: "${errorMsg}"`);
  }

  // ─── STEP 3: Dashboard ────────────────────────────────────────────────────
  log('\n=== STEP 3: Dashboard ===');
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  const dashUrl = page.url();
  log(`Current URL: ${dashUrl}`);

  // If still on login, force navigate (testing in case of cookie issue)
  if (dashUrl.includes('/login')) {
    log('Still on login page — attempting direct navigation to /dashboard');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    log(`After direct nav URL: ${page.url()}`);
  }

  const dashBg = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  log(`Dashboard body background: ${dashBg}`);

  await screenshot(page, '03-dashboard-full', 'Full dashboard page');

  // ─── STEP 4: Verify dashboard components ──────────────────────────────────
  log('\n=== STEP 4: Verify dashboard components ===');
  const currentDashUrl = page.url();
  log(`Verifying on: ${currentDashUrl}`);

  // Sidebar — look for nav or aside
  const sidebarCount = await page.locator('aside, nav').count();
  log(`Sidebar/nav elements: ${sidebarCount}`);

  // Check for specific sidebar content (icon navigation)
  const navLinks = await page.locator('nav a, aside a').count();
  log(`Nav/sidebar links: ${navLinks}`);

  // Balance card
  const balanceEl = await page.locator('text=/balance/i').count();
  log(`Balance text found: ${balanceEl}`);

  // Dollar amounts
  const dollarAmounts = await page.locator('text=/\\$[0-9]/').count();
  log(`Dollar amount elements: ${dollarAmounts}`);

  // Chart elements (recharts uses SVG)
  const svgCharts = await page.locator('svg').count();
  log(`SVG elements (charts): ${svgCharts}`);

  const rechartsEl = await page.locator('[class*="recharts"]').count();
  log(`Recharts elements: ${rechartsEl}`);

  // Transactions
  const transEl = await page.locator('text=/transaction/i').count();
  log(`Transaction mentions: ${transEl}`);

  // Financial health score
  const healthEl = await page.locator('text=/health|score/i').count();
  log(`Health/Score mentions: ${healthEl}`);

  // Quick actions
  const qaEl = await page.locator('text=/quick action|send|transfer/i').count();
  log(`Quick actions mentions: ${qaEl}`);

  // AI insights
  const aiEl = await page.locator('text=/ai|insight|recommendation/i').count();
  log(`AI/Insight mentions: ${aiEl}`);

  // Glass card effect
  const hasGlass = await page.evaluate(() => {
    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      const style = window.getComputedStyle(el);
      if (style.backdropFilter && style.backdropFilter !== 'none' && style.backdropFilter !== '') {
        return `backdrop-filter: ${style.backdropFilter}`;
      }
    }
    return false;
  });
  log(`Glass card effect: ${hasGlass}`);

  // Check for dark theme throughout
  const isDarkTheme = await page.evaluate(() => {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const brightness = parseInt(match[1]) + parseInt(match[2]) + parseInt(match[3]);
      return brightness < 100;
    }
    return false;
  });
  log(`Dark theme maintained on dashboard: ${isDarkTheme}`);

  // Check page content
  const pageText = await page.locator('body').textContent();
  const hasKeyComponents = {
    balance: pageText.toLowerCase().includes('balance'),
    transactions: pageText.toLowerCase().includes('transaction'),
    savings: pageText.toLowerCase().includes('saving'),
    dashboard: pageText.toLowerCase().includes('dashboard'),
    health: pageText.toLowerCase().includes('health') || pageText.toLowerCase().includes('score'),
  };
  log(`Page content checks: ${JSON.stringify(hasKeyComponents)}`);

  // ─── STEP 5: Sidebar screenshot ───────────────────────────────────────────
  log('\n=== STEP 5: Sidebar screenshot ===');

  const sidebarEl = page.locator('aside, nav').first();
  const sidebarVisible = await sidebarEl.isVisible().catch(() => false);
  log(`Sidebar element visible: ${sidebarVisible}`);

  if (sidebarVisible) {
    const box = await sidebarEl.boundingBox();
    log(`Sidebar bounding box: ${JSON.stringify(box)}`);
    if (box) {
      await page.screenshot({
        path: join(SCREENSHOTS_DIR, '04-sidebar.png'),
        clip: { x: box.x, y: box.y, width: Math.min(box.width + 40, 320), height: Math.min(box.height, 900) }
      });
      log('SCREENSHOT: 04-sidebar.png — Sidebar cropped');

      const sidebarBg = await sidebarEl.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      log(`Sidebar background: ${sidebarBg}`);

      const sidebarText = await sidebarEl.textContent();
      log(`Sidebar nav items: "${sidebarText?.replace(/\s+/g, ' ').trim().substring(0, 200)}"`);
    }
  } else {
    await screenshot(page, '04-sidebar', 'Full dashboard (sidebar embedded)');
  }

  // ─── STEP 6: Transactions ─────────────────────────────────────────────────
  log('\n=== STEP 6: Navigate to /transactions ===');

  // Use direct navigation to ensure reliable URL change in headless mode
  await page.goto(`${BASE_URL}/transactions`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  log('Navigated to /transactions');

  const transUrl = page.url();
  log(`Transactions page URL: ${transUrl}`);

  const transBg = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  log(`Transactions page background: ${transBg}`);

  // Check for page content
  const transPageText = await page.locator('body').textContent();
  log(`Has "transaction" text: ${transPageText.toLowerCase().includes('transaction')}`);
  log(`Has search/filter UI: ${transPageText.toLowerCase().includes('search') || transPageText.toLowerCase().includes('filter')}`);
  const transRows = await page.locator('tr, [class*="transaction"], tbody tr').count();
  log(`Transaction rows/items: ${transRows}`);

  // Check for any sidebar nav links on transactions page
  const transNavLinks = await page.locator('a[href*="transactions"]').count();
  log(`Sidebar nav links to transactions: ${transNavLinks}`);

  await screenshot(page, '05-transactions', 'Transactions page');

  // ─── STEP 7: Savings ──────────────────────────────────────────────────────
  log('\n=== STEP 7: Navigate to /savings ===');

  await page.goto(`${BASE_URL}/savings`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  log('Navigated to /savings');

  const savingsUrl = page.url();
  log(`Savings page URL: ${savingsUrl}`);

  const savingsBg = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  log(`Savings page background: ${savingsBg}`);

  const savingsPageText = await page.locator('body').textContent();
  log(`Has "saving" text: ${savingsPageText.toLowerCase().includes('saving')}`);
  log(`Has goals/progress: ${savingsPageText.toLowerCase().includes('goal') || savingsPageText.toLowerCase().includes('progress')}`);

  await screenshot(page, '06-savings', 'Savings page');

  // ─── STEP 8: Back to dashboard ─────────────────────────────────────────────
  log('\n=== STEP 8: Navigate back to /dashboard ===');

  // Try sidebar link first (now confirmed visible)
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  log('Navigated back to /dashboard');

  const finalUrl = page.url();
  log(`Final URL: ${finalUrl}`);

  await screenshot(page, '07-dashboard-return', 'Dashboard after returning from savings');

  // ─── Console errors ────────────────────────────────────────────────────────
  log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    log('No console errors detected');
  } else {
    consoleErrors.forEach(e => log(`  ${e}`));
  }

  await browser.close();
  writeFileSync(join(SCREENSHOTS_DIR, 'results.txt'), results.join('\n'));
  console.log('\nScreenshots saved to:', SCREENSHOTS_DIR);
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
