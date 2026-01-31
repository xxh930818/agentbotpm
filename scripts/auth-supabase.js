#!/usr/bin/env node

/**
 * Supabase OAuth Authorization Script
 *
 * Usage:
 *   node scripts/auth-supabase.js
 */

const { chromium } = require('playwright');
require('dotenv').config();

const email = process.env.GITHUB_EMAIL || '451418817@qq.com';
const password = process.env.GITHUB_PASSWORD || '178huI-23JcQ';

// Supabase OAuth state
const state = '1c4b27341b57292de7edb81968aa8fbb4748ef483a49e7e3cee77dffcdf64627b7da198d74d1d471ea5d29b494e24c2459cee76e2233a965c9b395d499e8a8fe06cabb884e80bbbd29cec5473a8dc72bfb1e26873889ae8d2a689fbe6a4c7336b5dd8064bdd803b47e5470bffaf5d668a96903e7d7568130ea804f8ad1a44fcc18fcdaa27b82b1481e2e06cd37bc5fc2c440affa4335047ba2e0e1a291ebce4ff23f52121d75ca9810bbe60326e1081720b1782fd237804afdf1791eb40b6c95fb';

async function authorizeSupabase(page, email, password) {
  // Construct OAuth URL
  const baseUrl = 'https://github.com/login?client_id=Iv1.9d7d662ea00b8481';
  const returnTo = encodeURIComponent(`/login/oauth/authorize?client_id=Iv1.9d7d662ea00b8481&scope=read:user,user:email&state=${state}`);
  const url = `${baseUrl}&return_to=${returnTo}`;

  console.log('Navigating to Supabase OAuth...');
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
    console.log('Note: Supabase might already be authorized');
  }

  await page.waitForTimeout(5000);
  console.log('Supabase authorization complete!');
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('='.repeat(50));
  console.log('Supabase OAuth Authorization');
  console.log('='.repeat(50));

  await authorizeSupabase(page, email, password);

  console.log('='.repeat(50));
  console.log('Current URL:', page.url());
  console.log('='.repeat(50));

  await page.waitForTimeout(5000);
  await browser.close();
})();
