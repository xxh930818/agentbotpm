#!/usr/bin/env node

/**
 * Create GitHub Repository Script
 *
 * Usage:
 *   node scripts/create-repo.js
 *   REPO_NAME=my-repo IS_PRIVATE=false node scripts/create-repo.js
 */

const { chromium } = require('playwright');
require('dotenv').config();

const email = process.env.GITHUB_EMAIL || '451418817@qq.com';
const password = process.env.GITHUB_PASSWORD || '178huI-23JcQ';
const repoName = process.env.REPO_NAME || 'agentbotpm';
const isPrivate = process.env.IS_PRIVATE !== 'false';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('='.repeat(50));
  console.log('Creating GitHub Repository');
  console.log('='.repeat(50));
  console.log(`Email: ${email}`);
  console.log(`Repository: ${repoName}`);
  console.log(`Private: ${isPrivate}`);
  console.log('='.repeat(50));

  // Login to GitHub
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
  await page.waitForTimeout(5000);
  console.log('Login successful!');

  // Navigate to create repository page
  console.log('Navigating to create repository...');
  await page.goto('https://github.com/new');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  // Fill repository name
  console.log(`Filling repository name: ${repoName}`);
  await page.fill('#repository-name-input', repoName);
  await page.waitForTimeout(1000);

  // Select private if requested
  if (isPrivate) {
    try {
      await page.click('input[value="private"]', { timeout: 2000 });
      console.log('Selected: Private');
    } catch (e) {
      console.log('Note: Private might already be selected');
    }
  }

  // Click create button
  console.log('Clicking create button...');
  const buttons = await page.$$('button[type="submit"]');
  for (const btn of buttons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('create')) {
        await btn.click();
        console.log('Create button clicked!');
        break;
      }
    }
  }

  await page.waitForTimeout(5000);
  console.log('='.repeat(50));
  console.log(`Repository created: ${page.url()}`);
  console.log('='.repeat(50));

  await page.waitForTimeout(5000);
  await browser.close();
})();
