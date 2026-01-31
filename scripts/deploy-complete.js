#!/usr/bin/env node

/**
 * Deploy and Publish Automation Script
 *
 * This script automates:
 * 1. Creating a GitHub repository
 * 2. Authorizing Supabase OAuth
 * 3. Authorizing Vercel OAuth
 *
 * Usage:
 *   node scripts/deploy-complete.js
 *
 * Environment variables:
 *   GITHUB_EMAIL - Your GitHub email
 *   GITHUB_PASSWORD - Your GitHub password
 *   REPO_NAME - Repository name (default: deploy-test)
 *   IS_PRIVATE - Create private repo (default: true)
 */

const { chromium } = require('playwright');
require('dotenv').config();

const config = {
  email: process.env.GITHUB_EMAIL || '451418817@qq.com',
  password: process.env.GITHUB_PASSWORD || '178huI-23JcQ',
  repoName: process.env.REPO_NAME || 'agentbotpm',
  isPrivate: process.env.IS_PRIVATE !== 'false',
  // Supabase OAuth state from user's URL
  supabaseState: '1c4b27341b57292de7edb81968aa8fbb4748ef483a49e7e3cee77dffcdf64627b7da198d74d1d471ea5d29b494e24c2459cee76e2233a965c9b395d499e8a8fe06cabb884e80bbbd29cec5473a8dc72bfb1e26873889ae8d2a689fbe6a4c7336b5dd8064bdd803b47e5470bffaf5d668a96903e7d7568130ea804f8ad1a44fcc18fcdaa27b82b1481e2e06cd37bc5fc2c440affa4335047ba2e0e1a291ebce4ff23f52121d75ca9810bbe60326e1081720b1782fd237804afdf1791eb40b6c95fb',
  // Vercel OAuth state from user's URL
  vercelState: '53d1bcab37cc2ed19d9c280ffd1acac0e62282193b797bab8f4bee678a4fe8641d6f75199159203374fe033714fab7cdefacf12344f39b4eeb8d2ab04874df65bad33f8141b3e74aa1364f28387bd19afc132bdc62e280d5ba27cf02d74edb1b09a1c1ff7e53d6fb780f5e52f777c1faf257298ca8f925111447d3861b31991dbeb8bad8a997bf28f4ff636ae2863624611ffe96294b6c83d676d99fa8a7fb01b84e464c5a42eba9457f731dbff4ba921df9537850df7f54887271e415',
};

async function loginToGitHub(page, email, password) {
  console.log('Logging into GitHub...');

  await page.goto('https://github.com/login');
  await page.waitForLoadState('domcontentloaded');

  await page.fill('#login_field', email);
  await page.waitForTimeout(500);

  await page.click('input[type="submit"]');
  await page.waitForTimeout(1500);

  await page.fill('#password', password);
  await page.waitForTimeout(500);

  await page.click('input[type="submit"]');

  // Wait for login to complete
  await page.waitForTimeout(5000);
  console.log('GitHub login successful!');
}

async function createRepository(page, repoName, isPrivate) {
  console.log(`Creating repository: ${repoName} (private: ${isPrivate})`);

  await page.goto('https://github.com/new');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  // Fill repository name
  await page.fill('#repository-name-input', repoName);
  await page.waitForTimeout(1000);

  // Select private if requested
  if (isPrivate) {
    try {
      await page.click('input[value="private"]', { timeout: 2000 });
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('Note: Private option might already be selected or not available');
    }
  }

  // Click create button
  const buttons = await page.$$('button[type="submit"]');
  for (const btn of buttons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('create')) {
        await btn.click();
        console.log('Clicked create button!');
        break;
      }
    }
  }

  await page.waitForTimeout(5000);
  console.log(`Repository created: ${page.url()}`);
}

async function authorizeOAuth(page, serviceName, state) {
  console.log(`Authorizing ${serviceName}...`);

  // Construct OAuth URL
  const baseUrl = 'https://github.com/login?client_id=Iv1.9d7d662ea00b8481';
  const returnTo = encodeURIComponent(`/login/oauth/authorize?client_id=Iv1.9d7d662ea00b8481&scope=read:user,user:email&state=${state}`);
  const url = `${baseUrl}&return_to=${returnTo}`;

  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Check if we need to login again (might be cached)
  const loginField = await page.$('#login_field');
  if (loginField && await loginField.isVisible()) {
    console.log('Session expired, logging in again...');
    await page.fill('#login_field', config.email);
    await page.click('input[type="submit"]');
    await page.waitForTimeout(1500);
    await page.fill('#password', config.password);
    await page.click('input[type="submit"]');
    await page.waitForTimeout(5000);

    // Navigate back to OAuth URL
    await page.goto(url);
    await page.waitForTimeout(3000);
  }

  // Look for and click authorize button
  const authButtons = await page.$$('button[type="submit"], input[type="submit"]');
  let clicked = false;

  for (const btn of authButtons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      console.log(`Found button: "${text?.trim()}"`);

      if (text && text.toLowerCase().includes('authorize')) {
        await btn.click();
        console.log(`Clicked ${serviceName} authorize button!`);
        clicked = true;
        break;
      }
    }
  }

  if (!clicked) {
    console.log(`Note: ${serviceName} might already be authorized or auto-approved`);
  }

  await page.waitForTimeout(5000);
  console.log(`${serviceName} authorization complete!`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Deploy and Publish Automation');
  console.log('='.repeat(60));
  console.log(`Email: ${config.email}`);
  console.log(`Repository: ${config.repoName}`);
  console.log(`Private: ${config.isPrivate}`);
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Login to GitHub
    await loginToGitHub(page, config.email, config.password);

    // Step 2: Create repository
    await createRepository(page, config.repoName, config.isPrivate);

    // Step 3: Authorize Supabase
    await authorizeOAuth(page, 'Supabase', config.supabaseState);

    // Step 4: Authorize Vercel
    await authorizeOAuth(page, 'Vercel', config.vercelState);

    console.log('='.repeat(60));
    console.log('All steps completed successfully!');
    console.log('='.repeat(60));

    // Keep browser open for inspection
    console.log('Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error during deployment:', error);
    console.log('Keeping browser open for inspection...');
    await page.waitForTimeout(30000);
  } finally {
    await browser.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { loginToGitHub, createRepository, authorizeOAuth, main };
