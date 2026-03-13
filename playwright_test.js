import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/login');

    console.log('Filling login form...');
    await page.fill('input[type="email"]', 'admin@gurgil.com');
    await page.fill('input[type="password"]', '123456');

    console.log('Clicking login button...');
    await page.click('button[type="submit"]');

    console.log('Waiting for navigation to dashboard...');
    await page.waitForURL('http://localhost:5173/');

    console.log('Navigating to tickets page directly...');
    await page.goto('http://localhost:5173/tickets');

    console.log('Waiting for tickets page to load...');
    await page.waitForTimeout(3000); // Wait for dynamic content to load

    console.log('Taking screenshot...');
    await page.screenshot({ path: '/home/jules/verification/tickets_page.png', fullPage: true });
    console.log('Screenshot saved to /home/jules/verification/tickets_page.png');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
})();
