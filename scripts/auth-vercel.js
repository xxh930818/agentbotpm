#!/usr/bin/env node

/**
 * Vercel OAuth Authorization Script
 *
 * Usage:
 *   node scripts/auth-vercel.js
 */

const { chromium } = require('playwright');
require('dotenv').config();

const email = process.env.GITHUB_EMAIL || '451418817@qq.com';
const password = process.env.GITHUB_PASSWORD || '178huI-23JcQ';

// Vercel OAuth state
const state = '53d1bcab37cc2ed19d9c280ffd1acac0e62282193b797bab8f4bee678a4fe8641d6f75199159203374fe033714fab7cdefacf12344f39b4eeb8d2ab04874df65bad33f8141b3e74aa1364f28387bd19afc132bdc62e280d5ba27cf02d74edb1b09a1c1ff7e53d6fb780f5e52f777c1faf257298ca8f925111447d3861b31991dbeb8bad8a997bf28f4ff636ae2863624611ffe96294b6c83d676d99fa8a7fb01b84e464c5a42eba9457f731dbff4ba921df9537850df7f54887271e415';

async function authorizeVercel(page, email, password) {
  // Construct OAuth URL
  const baseUrl = 'https://github.com/login?client_id=Iv1.9d7d662ea00b8481';
  const returnTo = encodeURIComponent(`/login/oauth/authorize?client_id=Iv1.9d7d662ea00b8481&scope=read:user,user:email&state=${state}`);
  const url = `${baseUrl}&return_to=${returnTo}`;

  console.log('Navigating to Vercel OAuth...');
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Check if login is required
  const loginField = await page.$('#login_field');
  if (loginField && await loginField.isVisible()) {
    console.log('Login required, logging in...');
    await page.fill('#login_field', email);
    await page.click('input[type="submit"]');
    await page.waitForTimeout(1500);
    await page.fill('#password', password);
    await page.click('input[type="submit"]');
    await page.waitForTimeout(5000);

    // Navigate back to OAuth URL
    await page.goto(url);
    await page.waitForTimeout(3000);
  }

  // Look for authorize button
  console.log('Looking for authorize button...');
  const authButtons = await page.$$('button[type="submit"], input[type="submit"]');
  let clicked = false;

  for (const btn of authButtons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      console.log(`Found button: "${text?.trim()}"`);

      if (text && text.toLowerCase().includes('authorize')) {
        await btn.click();
        console.log('Clicked authorize button!');
        clicked = true;
        break;
      }
    }
  }

  if (!clicked) {
    console.log('Note: Vercel might already be authorized');
  }

  await page.waitForTimeout(5000);
  console.log('Vercel authorization complete!');
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('='.repeat(50));
  console.log('Vercel OAuth Authorization');
  console.log('='.repeat(50));

  await authorizeVercel(page, email, password);

  console.log('='.repeat(50));
  console.log('Current URL:', page.url());
  console.log('='.repeat(50));

  await page.waitForTimeout(5000);
  await browser.close();
})();
