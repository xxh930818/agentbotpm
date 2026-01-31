# Deploy and Publish Workflow

You are the **Deploy and Publish Agent**. Your mission is to help users deploy their projects to production using GitHub, Supabase, and Vercel.

## Overview

This skill automates the complete deployment workflow:
1. **Create GitHub Repository** - Create a new private/public repository on GitHub
2. **Authorize Supabase** - Complete OAuth authorization for Supabase
3. **Authorize Vercel** - Complete OAuth authorization for Vercel

## Prerequisites

- Node.js installed
- Playwright installed (`npm install playwright`)
- GitHub credentials (email and password)

## Step 1: Create GitHub Repository

### Using Playwright Script

Use the Playwright automation script to create a GitHub repository:

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  // Login to GitHub
  await page.goto('https://github.com/login');
  await page.fill('#login_field', email);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(1500);
  await page.fill('#password', password);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(5000);

  // Create repository
  await page.goto('https://github.com/new');
  await page.waitForTimeout(5000);

  // Fill repository name - use selector: #repository-name-input
  await page.fill('#repository-name-input', repoName);

  // Select private (if needed)
  await page.click('input[value="private"]');

  // Click create button
  const buttons = await page.$$('button[type="submit"]');
  for (const btn of buttons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('create')) {
        await btn.click();
        break;
      }
    }
  }

  await page.waitForTimeout(5000);
  console.log('Repository created:', page.url());

  await browser.close();
})();
```

### Key Selectors for GitHub

| Element | Selector |
|---------|----------|
| Email field | `#login_field` |
| Password field | `#password` |
| Submit button | `input[type="submit"]` |
| Repository name input | `#repository-name-input` |
| Private radio | `input[value="private"]` |
| Create button | `button[type="submit"]` (visible one with "Create" text) |

## Step 2: Authorize Supabase

### OAuth Authorization URL

```
https://github.com/login?client_id=Iv1.9d7d662ea00b8481&return_to=%2Flogin%2Foauth%2Fauthorize%3Fclient_id%3DIv1.9d7d662ea00b8481%26scope%3Dread%253Auser%252Cuser%253Aemail%26state%3D[STATE]
```

### Using Playwright for Supabase Authorization

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  // Navigate to Supabase OAuth
  const supabaseUrl = 'https://github.com/login?client_id=Iv1.9d7d662ea00b8481&return_to=%2Flogin%2Foauth%2Fauthorize%3Fclient_id%3DIv1.9d7d662ea00b8481%26scope%3Dread%253Auser%252Cuser%253Aemail%26state%3D[YOUR_STATE]';

  await page.goto(supabaseUrl);

  // Login if prompted (same credentials as GitHub)
  const loginField = await page.$('#login_field');
  if (loginField && await loginField.isVisible()) {
    await page.fill('#login_field', email);
    await page.click('input[type="submit"]');
    await page.waitForTimeout(1500);
    await page.fill('#password', password);
    await page.click('input[type="submit"]');
  }

  // Wait for authorization page and click "Authorize"
  await page.waitForTimeout(3000);

  // Look for authorize button
  const authButtons = await page.$$('button[type="submit"], input[type="submit"]');
  for (const btn of authButtons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('authorize')) {
        await btn.click();
        break;
      }
    }
  }

  // Wait for redirect back to Supabase
  await page.waitForURL(/supabase\.com/, { timeout: 30000 });
  console.log('Supabase authorization complete!');

  await page.waitForTimeout(3000);
  await browser.close();
})();
```

## Step 3: Authorize Vercel

### OAuth Authorization URL

```
https://github.com/login?client_id=Iv1.9d7d662ea00b8481&return_to=%2Flogin%2Foauth%2Fauthorize%3Fclient_id%3DIv1.9d7d662ea00b8481%26scope%3Dread%253Auser%252Cuser%253Aemail%26state%3D[STATE]
```

### Using Playwright for Vercel Authorization

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  // Navigate to Vercel OAuth
  const vercelUrl = 'https://github.com/login?client_id=Iv1.9d7d662ea00b8481&return_to=%2Flogin%2Foauth%2Fauthorize%3Fclient_id%3DIv1.9d7d662ea00b8481%26scope%3Dread%253Auser%252Cuser%253Aemail%26state%3D[YOUR_STATE]';

  await page.goto(vercelUrl);

  // Login if prompted (same credentials as GitHub)
  const loginField = await page.$('#login_field');
  if (loginField && await loginField.isVisible()) {
    await page.fill('#login_field', email);
    await page.click('input[type="submit"]');
    await page.waitForTimeout(1500);
    await page.fill('#password', password);
    await page.click('input[type="submit"]');
  }

  // Wait for authorization page
  await page.waitForTimeout(3000);

  // Look for authorize button
  const authButtons = await page.$$('button[type="submit"], input[type="submit"]');
  for (const btn of authButtons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('authorize')) {
        await btn.click();
        break;
      }
    }
  }

  // Wait for redirect back to Vercel
  await page.waitForURL(/vercel\.com/, { timeout: 30000 });
  console.log('Vercel authorization complete!');

  await page.waitForTimeout(3000);
  await browser.close();
})();
```

## Complete Workflow Script

Here's a complete script that handles all three steps:

```javascript
const { chromium } = require('playwright');

async function deployAndPublish({ email, password, repoName, isPrivate = true, supabaseState, vercelState }) {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  // ===== STEP 1: Create GitHub Repository =====
  console.log('Step 1: Creating GitHub repository...');

  await page.goto('https://github.com/login');
  await page.fill('#login_field', email);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(1500);
  await page.fill('#password', password);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(5000);

  await page.goto('https://github.com/new');
  await page.waitForTimeout(5000);

  await page.fill('#repository-name-input', repoName);

  if (isPrivate) {
    await page.click('input[value="private"]');
  }

  const buttons = await page.$$('button[type="submit"]');
  for (const btn of buttons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('create')) {
        await btn.click();
        break;
      }
    }
  }

  await page.waitForTimeout(5000);
  console.log(`Repository created: ${page.url()}`);

  // ===== STEP 2: Authorize Supabase =====
  console.log('Step 2: Authorizing Supabase...');

  const supabaseUrl = `https://github.com/login?client_id=Iv1.9d7d662ea00b8481&return_to=%2Flogin%2Foauth%2Fauthorize%3Fclient_id%3DIv1.9d7d662ea00b8481%26scope%3Dread%253Auser%252Cuser%253Aemail%26state%3D${supabaseState}`;

  await page.goto(supabaseUrl);
  await page.waitForTimeout(3000);

  // Check if we need to authorize
  const authButtons = await page.$$('button[type="submit"], input[type="submit"]');
  for (const btn of authButtons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('authorize')) {
        await btn.click();
        break;
      }
    }
  }

  await page.waitForTimeout(5000);
  console.log('Supabase authorization complete!');

  // ===== STEP 3: Authorize Vercel =====
  console.log('Step 3: Authorizing Vercel...');

  const vercelUrl = `https://github.com/login?client_id=Iv1.9d7d662ea00b8481&return_to=%2Flogin%2Foauth%2Fauthorize%3Fclient_id%3DIv1.9d7d662ea00b8481%26scope%3Dread%253Auser%252Cuser%253Aemail%26state%3D${vercelState}`;

  await page.goto(vercelUrl);
  await page.waitForTimeout(3000);

  // Check if we need to authorize
  const vercelAuthButtons = await page.$$('button[type="submit"], input[type="submit"]');
  for (const btn of vercelAuthButtons) {
    if (await btn.isVisible()) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('authorize')) {
        await btn.click();
        break;
      }
    }
  }

  await page.waitForTimeout(5000);
  console.log('Vercel authorization complete!');

  await browser.close();
  console.log('Deployment workflow complete!');
}

// Usage
deployAndPublish({
  email: 'your-email@example.com',
  password: 'your-password',
  repoName: 'my-new-repo',
  isPrivate: true,
  supabaseState: 'random-state-string-1',
  vercelState: 'random-state-string-2'
});
```

## Security Notes

1. **Never hardcode credentials** in production code
2. Use environment variables for sensitive data:
   ```bash
   export GITHUB_EMAIL="your-email@example.com"
   export GITHUB_PASSWORD="your-password"
   ```
3. Consider using GitHub Personal Access Tokens (PAT) instead of password
4. Store OAuth states securely and generate unique values for each request

## Troubleshooting

### GitHub Login Issues

- If 2FA is enabled, you'll need to handle the 2FA input
- GitHub may show additional verification screens
- Use `headless: false` to observe the login process

### OAuth Authorization Issues

- Ensure the OAuth state parameter matches what was sent
- Check if the app is already authorized (may skip auth screen)
- Some OAuth flows require additional permissions scopes

### Timeout Issues

- Increase `waitForTimeout()` values on slow connections
- Use `waitForSelector()` instead of fixed timeouts for more reliability
- Check for CAPTCHA or additional verification steps

## Usage Example

```bash
# Install dependencies
npm install playwright

# Run the deployment script
node scripts/deploy.js
```

## Environment Variables

Create a `.env` file:

```
GITHUB_EMAIL=451418817@qq.com
GITHUB_PASSWORD=your-password
REPO_NAME=agentbotpm
IS_PRIVATE=true
```

Load in your script:

```javascript
require('dotenv').config();

const email = process.env.GITHUB_EMAIL;
const password = process.env.GITHUB_PASSWORD;
const repoName = process.env.REPO_NAME || 'my-new-repo';
const isPrivate = process.env.IS_PRIVATE === 'true';
```
