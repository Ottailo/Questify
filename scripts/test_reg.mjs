import puppeteer from 'c:/Users/Hp/Documents/Projects/KinoBeat-Studio/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('ERR:', err.message));
  page.on('requestfailed', req => console.log('FAILED:', req.url(), req.failure()?.errorText));

  page.on('response', async res => {
    if (res.url().includes('/api/v1/')) {
      console.log('API RESPONSE:', res.status(), res.url());
      try {
        const text = await res.text();
        console.log('API BODY:', text);
      } catch (e) {}
    }
  });

  await page.goto('http://127.0.0.1:3001/register', { waitUntil: 'networkidle2' });
  const ts = Date.now();
  await page.type('#email', 'test_' + ts + '@guild.archive');
  await page.type('#username', 'User' + ts.toString().slice(-4));
  await page.type('#password', 'TestPassword123!');
  await page.type('#confirmPassword', 'TestPassword123!');
  await page.type('#firstName', 'Test');
  await page.type('#lastName', 'User');

  console.log('Clicking submit...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 4000));

  const url = page.url();
  console.log('Current URL:', url);
  const token = await page.evaluate(() => localStorage.getItem('questify_token'));
  console.log('Token:', token ? 'Found' : 'Missing');

  await browser.close();
})();
