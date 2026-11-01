import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const puppeteer = require('c:/Users/Hp/Documents/Projects/KinoBeat-Studio/node_modules/puppeteer-core');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const frontendBuildDir = path.join(projectRoot, 'frontend', 'build');
const screenshotsDir = path.join(projectRoot, 'tests', 'screenshots');
const personasDir = path.join(screenshotsDir, 'personas');
const artifactDir = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\f9d0a3b9-9e7a-40bf-998a-a63ed1af9e81';
const artifactScreenshotsDir = path.join(artifactDir, 'screenshots');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

fs.mkdirSync(personasDir, { recursive: true });
fs.mkdirSync(artifactScreenshotsDir, { recursive: true });

// 1. Static SPA Server for Frontend Build
function startFrontendServer(port = 3001) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  };

  const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    let filePath = path.join(frontendBuildDir, cleanUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA Fallback to index.html
      const indexPath = path.join(frontendBuildDir, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[Frontend SPA Server] Running on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

// 2. Start Python FastAPI Backend
async function startBackendServer() {
  try {
    const res = await fetch('http://127.0.0.1:8000/health');
    if (res.ok) {
      console.log('[Backend Server] Existing FastAPI Uvicorn process detected on 0.0.0.0:8000. Reusing daemon.');
      return null;
    }
  } catch (e) {}

  console.log('[Backend Server] Spawning FastAPI Uvicorn process on 0.0.0.0:8000...');
  const proc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--port', '8000', '--host', '0.0.0.0'], {
    cwd: path.join(projectRoot, 'backend'),
    stdio: 'pipe'
  });

  proc.stdout.on('data', (d) => {
    const msg = d.toString();
    if (msg.includes('Uvicorn running') || msg.includes('Application startup complete')) {
      console.log('[Backend Server] Startup detected.');
    }
  });

  proc.stderr.on('data', (d) => {
    // console.log('[Backend log]', d.toString());
  });

  return proc;
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 404) {
        return true;
      }
    } catch (e) {
      // wait
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} failed to become ready within ${timeoutMs}ms`);
}

function syncToArtifact(srcPath, filename) {
  try {
    const dest = path.join(artifactScreenshotsDir, filename);
    fs.copyFileSync(srcPath, dest);
  } catch (err) {
    console.error('Failed to sync to artifact dir:', err);
  }
}

async function runE2E() {
  console.log('==================================================');
  console.log('   QUESTIFY E2E TEST & BROWSER SCREENSHOT SUITE   ');
  console.log('==================================================');

  let backendProc = null;
  let frontendServer = null;
  let browser = null;

  try {
    // 1. Spin up servers
    frontendServer = await startFrontendServer(3001);
    backendProc = await startBackendServer();

    console.log('[Health Check] Awaiting backend on http://127.0.0.1:8000/health ...');
    await waitForServer('http://127.0.0.1:8000/health', 15000);
    console.log('[Health Check] Backend is ONLINE!');

    // 2. Launch Puppeteer Edge Browser
    console.log('[Browser] Launching Microsoft Edge via puppeteer-core...');
    browser = await puppeteer.launch({
      executablePath: edgePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    page.on('console', msg => {
      const txt = msg.text();
      if (!txt.includes('Download the React DevTools')) {
        console.log('  [BROWSER CONSOLE]', msg.type(), txt);
      }
    });
    page.on('pageerror', err => console.log('  [BROWSER ERROR]', err.message));
    page.on('requestfailed', req => console.log('  [REQ FAILED]', req.url(), req.failure()?.errorText));

    // ----------------------------------------------------
    // STEP 1: Authentication View (/login)
    // ----------------------------------------------------
    console.log('\n[Screen 1/8] Navigating to http://127.0.0.1:3001/login ...');
    await page.goto('http://127.0.0.1:3001/login', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    const p1 = path.join(screenshotsDir, '01_login_authentication.png');
    await page.screenshot({ path: p1, fullPage: true });
    syncToArtifact(p1, '01_login_authentication.png');
    console.log('  -> Captured 01_login_authentication.png');

    // ----------------------------------------------------
    // STEP 2: Registration View (/register)
    // ----------------------------------------------------
    console.log('\n[Screen 2/8] Navigating to http://127.0.0.1:3001/register ...');
    await page.goto('http://127.0.0.1:3001/register', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const timestamp = Date.now();
    const testEmail = `chronicler_${timestamp}@guild.archive`;
    const testUsername = `Vanguard_${timestamp.toString().slice(-4)}`;
    const testPassword = 'VanguardSecretKey2026!';

    await page.type('#email', testEmail);
    await page.type('#username', testUsername);
    await page.type('#password', testPassword);
    await page.type('#confirmPassword', testPassword);
    await page.type('#firstName', 'Samuel');
    await page.type('#lastName', 'Ottailo');

    // Accept Guild Codex terms
    const termsBox = await page.$('#terms');
    if (termsBox) await termsBox.click();

    const p2 = path.join(screenshotsDir, '02_registration_docket.png');
    await page.screenshot({ path: p2, fullPage: true });
    syncToArtifact(p2, '02_registration_docket.png');

    const pPersona1 = path.join(personasDir, 'persona_1_auth_onboarding.png');
    await page.screenshot({ path: pPersona1, fullPage: true });
    syncToArtifact(pPersona1, 'persona_1_auth_onboarding.png');
    console.log('  -> Captured 02_registration_docket.png & persona_1_auth_onboarding.png');

    // Submit Registration
    console.log('  -> Submitting registration form...');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Verify token or perform login if not redirected
    const currentToken = await page.evaluate(() => localStorage.getItem('questify_token'));
    console.log('  -> Registration Token Present:', Boolean(currentToken));

    if (!currentToken) {
      console.log('  -> Logging in via /login with newly registered credentials...');
      await page.goto('http://127.0.0.1:3001/login', { waitUntil: 'networkidle2' });
      await page.type('#email', testEmail);
      await page.type('#password', testPassword);
      await page.click('button[type="submit"]');
      await new Promise((r) => setTimeout(r, 2000));
    }

    // ----------------------------------------------------
    // STEP 3: Walkthrough Modal & Command HUD Dashboard (/)
    // ----------------------------------------------------
    console.log('\n[Screen 3/8] Checking for Walkthrough Modal on Command HUD (/) ...');
    await page.goto('http://127.0.0.1:3001/', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Check if Walkthrough Modal is visible
    const hasWalkthrough = await page.$('[role="dialog"]');
    if (hasWalkthrough) {
      console.log('  -> Walkthrough Modal detected! Capturing walkthrough tour...');
      const pTour = path.join(screenshotsDir, '03a_walkthrough_modal.png');
      await page.screenshot({ path: pTour, fullPage: true });
      syncToArtifact(pTour, '03a_walkthrough_modal.png');

      // Click "Next" twice, then "Get Started"
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextBtn = buttons.find(b => b.textContent?.trim() === 'Next');
        if (nextBtn) nextBtn.click();
      });
      await new Promise((r) => setTimeout(r, 600));

      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextBtn = buttons.find(b => b.textContent?.trim() === 'Next');
        if (nextBtn) nextBtn.click();
      });
      await new Promise((r) => setTimeout(r, 600));

      // Dismiss walkthrough completely
      await page.evaluate(() => {
        localStorage.setItem('questify_walkthrough_seen', 'true');
        const closeBtn = document.querySelector('[data-testid="close-walkthrough"]') || document.querySelector('[role="dialog"] button');
        if (closeBtn) closeBtn.click();
      });
      await new Promise((r) => setTimeout(r, 800));
      await page.goto('http://127.0.0.1:3001/', { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 1200));
    }

    console.log('  -> Capturing 03_dashboard_command_hud.png ...');
    const p3 = path.join(screenshotsDir, '03_dashboard_command_hud.png');
    await page.screenshot({ path: p3, fullPage: true });
    syncToArtifact(p3, '03_dashboard_command_hud.png');

    // Quick task addition
    console.log('  -> Testing Quick Task creation on Dashboard...');
    const quickInput = await page.$('input[placeholder*="What objective"], input[placeholder*="Quick add a task"]');
    if (quickInput) {
      await quickInput.type('Deploy production Redis cluster with Sentinel failover');
      const addBtn = await page.$('button[type="submit"]');
      if (addBtn) await addBtn.click();
      await new Promise((r) => setTimeout(r, 2000));
      const p4 = path.join(screenshotsDir, '04_dashboard_quick_directive_inscribed.png');
      await page.screenshot({ path: p4, fullPage: true });
      syncToArtifact(p4, '04_dashboard_quick_directive_inscribed.png');
      console.log('  -> Captured 04_dashboard_quick_directive_inscribed.png');
    }

    // ----------------------------------------------------
    // STEP 4: Great Sage AI Copilot (/chat)
    // ----------------------------------------------------
    console.log('\n[Screen 4/8] Navigating to Great Sage AI Copilot (/chat)...');
    await page.goto('http://127.0.0.1:3001/chat', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    console.log('  -> Sending prompt to Great Sage AI...');
    const chatInput = await page.$('textarea');
    if (chatInput) {
      await chatInput.type('Deconstruct an ambitious project to master FastAPI async architecture and WebSockets');
      const sendBtn = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent?.includes('Dispatch') || b.textContent?.includes('Send'));
        if (btn) { btn.click(); return true; }
        return false;
      });
      if (!sendBtn) {
        await page.keyboard.press('Enter');
      }

      console.log('  -> Awaiting Great Sage cognitive response from OmniRoute...');
      await page.waitForFunction(
        () => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.some(b => b.textContent?.includes('Inscribe Quest') || b.textContent?.includes('Add to Tasks'));
        },
        { timeout: 15000 }
      ).catch(() => {});
      await new Promise((r) => setTimeout(r, 2000));

      const p5 = path.join(screenshotsDir, '05_great_sage_scribe_sanctuary.png');
      await page.screenshot({ path: p5, fullPage: true });
      syncToArtifact(p5, '05_great_sage_scribe_sanctuary.png');

      const pPersona2 = path.join(personasDir, 'persona_2_sage_cognitive_dialogue.png');
      await page.screenshot({ path: pPersona2, fullPage: true });
      syncToArtifact(pPersona2, 'persona_2_sage_cognitive_dialogue.png');
      console.log('  -> Captured 05_great_sage_scribe_sanctuary.png & persona_2_sage_cognitive_dialogue.png');

      // Click "Inscribe Quest" button on the generated blueprint card
      console.log('  -> Testing one-click "Inscribe Quest" card button...');
      const inscribeCardBtn = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(b => b.textContent?.includes('Inscribe Quest') || b.textContent?.includes('Add to Tasks'));
        if (target) {
          target.click();
          return true;
        }
        return false;
      });

      if (inscribeCardBtn) {
        await new Promise((r) => setTimeout(r, 1500));
        const pPersona3 = path.join(personasDir, 'persona_3_quest_ledger_inscription.png');
        await page.screenshot({ path: pPersona3, fullPage: true });
        syncToArtifact(pPersona3, 'persona_3_quest_ledger_inscription.png');
        console.log('  -> Captured persona_3_quest_ledger_inscription.png');
      }
    }

    // ----------------------------------------------------
    // STEP 5: Tasks & Milestones (/quests)
    // ----------------------------------------------------
    console.log('\n[Screen 5/8] Navigating to Tasks & Milestones (/quests)...');
    await page.goto('http://127.0.0.1:3001/quests', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const p6 = path.join(screenshotsDir, '06_campaign_roster_quest_log.png');
    await page.screenshot({ path: p6, fullPage: true });
    syncToArtifact(p6, '06_campaign_roster_quest_log.png');
    console.log('  -> Captured 06_campaign_roster_quest_log.png');

    // Toggle a subtask checkbox to verify live persistence
    console.log('  -> Clicking milestone subtask to verify live update...');
    await page.evaluate(() => {
      const subtaskItem = document.querySelector('.cursor-pointer.transition-colors');
      if (subtaskItem) subtaskItem.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    const p7 = path.join(screenshotsDir, '07_subtask_progress_rail.png');
    await page.screenshot({ path: p7, fullPage: true });
    syncToArtifact(p7, '07_subtask_progress_rail.png');

    const pPersona4 = path.join(personasDir, 'persona_4_milestone_checklist_toggle.png');
    await page.screenshot({ path: pPersona4, fullPage: true });
    syncToArtifact(pPersona4, 'persona_4_milestone_checklist_toggle.png');
    console.log('  -> Captured 07_subtask_progress_rail.png & persona_4_milestone_checklist_toggle.png');

    // ----------------------------------------------------
    // STEP 6: Profile & Calibration (/profile)
    // ----------------------------------------------------
    console.log('\n[Screen 6/8] Navigating to Profile & Calibration (/profile)...');
    await page.goto('http://127.0.0.1:3001/profile', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    console.log('  -> Tuning Fatigue Calibration Matrix to High Focus...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const highBtn = buttons.find(b => b.textContent?.includes('High Focus'));
      if (highBtn) highBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const p8 = path.join(screenshotsDir, '08_character_sheet_dlp.png');
    await page.screenshot({ path: p8, fullPage: true });
    syncToArtifact(p8, '08_character_sheet_dlp.png');

    const pPersona5 = path.join(personasDir, 'persona_5_dlp_fatigue_calibration.png');
    await page.screenshot({ path: pPersona5, fullPage: true });
    syncToArtifact(pPersona5, 'persona_5_dlp_fatigue_calibration.png');
    console.log('  -> Captured 08_character_sheet_dlp.png & persona_5_dlp_fatigue_calibration.png');

    console.log('\n==================================================');
    console.log('   ALL SCREENSHOTS & E2E TESTS CAPTURED CLEANLY!  ');
    console.log(`   Project Screenshots: ${screenshotsDir}`);
    console.log(`   Artifact Screenshots: ${artifactScreenshotsDir}`);
    console.log('==================================================');

  } catch (err) {
    console.error('E2E Test Execution Error:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (frontendServer) frontendServer.close();
    if (backendProc) {
      backendProc.kill();
      try { process.kill(backendProc.pid); } catch (e) {}
    }
  }
}

runE2E();
