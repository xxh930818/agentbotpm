const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const email = '451418817@qq.com';
  const password = '178huI-23JcQ';
  const repoName = 'agentbotpm';

  console.log('Navigating to GitHub login...');
  await page.goto('https://github.com/login');
  await page.waitForLoadState('domcontentloaded');

  // Login
  console.log('Logging in...');
  await page.fill('#login_field', email);
  await page.waitForTimeout(500);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(1500);
  await page.fill('#password', password);
  await page.waitForTimeout(500);
  await page.click('input[type="submit"]');

  // Wait for login to complete
  console.log('Waiting for login...');
  await page.waitForTimeout(5000);
  console.log('Current URL:', page.url());

  // Navigate to create repository page
  console.log('Navigating to create repository page...');
  await page.goto('https://github.com/new');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());

  // Take screenshot
  await page.screenshot({ path: 'debug3.png', fullPage: true });

  // Find VISIBLE input elements that could be the repository name
  console.log('Finding visible inputs...');

  const allInputs = await page.$$('input');
  let repoInput = null;

  for (const input of allInputs) {
    const isVisible = await input.isVisible();
    if (isVisible) {
      const placeholder = await input.getAttribute('placeholder') || '';
      const ariaLabel = await input.getAttribute('aria-label') || '';
      const name = await input.getAttribute('name') || '';
      const id = await input.getAttribute('id') || '';
      const className = await input.getAttribute('class') || '';

      console.log(`Visible input: placeholder="${placeholder}", aria-label="${ariaLabel}", name="${name}", id="${id}", class="${className}"`);

      // Look for repository name input - check ID too
      if (id.toLowerCase().includes('repository') ||
          placeholder.toLowerCase().includes('repository') ||
          placeholder.toLowerCase().includes('name') ||
          ariaLabel.toLowerCase().includes('repository') ||
          ariaLabel.toLowerCase().includes('name')) {
        repoInput = input;
        break;
      }
    }
  }

  if (!repoInput) {
    console.log('Repository name input not found, trying alternative selectors...');

    // Try CSS selectors
    const selectors = [
      '#repository_name',
      '#repository\\[name\\]',
      'input[name="repository[name]"]',
      'input[name="repository_name"]',
      'input[data-testid="repository-name-input"]',
      'input[aria-label*="Repository"]',
      'input[placeholder*="Repository"]'
    ];

    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          console.log(`Found input with selector: ${selector}`);
          repoInput = element;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  if (repoInput) {
    console.log('Filling repository name...');
    await repoInput.fill(repoName);
    await page.waitForTimeout(1000);
  } else {
    console.log('ERROR: Could not find repository name input!');
    await page.waitForTimeout(10000);
    await browser.close();
    return;
  }

  // Select private
  console.log('Selecting private...');
  try {
    // Try clicking the private radio button
    await page.click('input[value="private"]', { timeout: 2000 });
    await page.waitForTimeout(500);
  } catch {
    try {
      await page.click('label:has-text("Private")', { timeout: 2000 });
      await page.waitForTimeout(500);
    } catch {
      console.log('Could not select private option');
    }
  }

  // Click create button
  console.log('Clicking create button...');
  try {
    // Look for visible create/submit button
    const buttons = await page.$$('button[type="submit"]');
    for (const btn of buttons) {
      if (await btn.isVisible()) {
        const text = await btn.textContent();
        console.log(`Found button with text: "${text}"`);
        if (text && text.toLowerCase().includes('create')) {
          await btn.click();
          console.log('Clicked create button!');
          break;
        }
      }
    }
  } catch (e) {
    console.log('Error clicking button:', e.message);
  }

  // Wait and show result
  await page.waitForTimeout(5000);
  console.log('Final URL:', page.url());

  // Keep browser open to see result
  console.log('Waiting 10 seconds before closing...');
  await page.waitForTimeout(10000);

  await browser.close();
})();
