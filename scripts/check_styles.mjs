import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('c:/Users/Hp/Documents/Projects/KinoBeat-Studio/node_modules/puppeteer-core');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });
  const styles = await page.evaluate(() => {
    const root = document.querySelector('div.min-h-screen');
    const card = document.querySelector('.max-w-lg');
    const input = document.querySelector('#email');
    const btn = document.querySelector('button[type="submit"]');
    const sheets = Array.from(document.styleSheets).map(s => {
      try { return s.cssRules ? s.cssRules.length : 'cross-origin'; } catch (e) { return 'blocked'; }
    });
    return {
      rootDisplay: root ? window.getComputedStyle(root).display : 'null',
      rootJustify: root ? window.getComputedStyle(root).justifyContent : 'null',
      cardMaxW: card ? window.getComputedStyle(card).maxWidth : 'null',
      cardDisplay: card ? window.getComputedStyle(card).display : 'null',
      inputBg: input ? window.getComputedStyle(input).backgroundColor : 'null',
      inputBorder: input ? window.getComputedStyle(input).border : 'null',
      btnBg: btn ? window.getComputedStyle(btn).backgroundColor : 'null',
      sheets
    };
  });
  console.log('COMPUTED STYLES:', JSON.stringify(styles, null, 2));
  await browser.close();
})();
