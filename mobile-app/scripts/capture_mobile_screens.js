const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:8081';

const TARGET_DIRS = [
  path.join(__dirname, '../../Screenshots/IOS APP/Mobile App (React Native)'),
  path.join(__dirname, '../../Screenshots/MOBILE APP'),
  path.join(__dirname, '../../MOBILE APP'),
  '/Users/ankur/.gemini/antigravity-ide/brain/12e46e5b-1a79-4f95-b94b-dfd3f36ea6ba/Screenshots/IOS APP/Mobile App (React Native)'
];

TARGET_DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function saveScreenshot(page, filename) {
  for (const dir of TARGET_DIRS) {
    const fullPath = path.join(dir, filename);
    await page.screenshot({ path: fullPath });
    console.log(`Saved: ${filename} to ${dir}`);
  }
}

async function run() {
  console.log('Launching browser for Mobile App capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });

  // 1. Initial Login Screen
  console.log('Navigating to Mobile Login...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '01_Mobile_Login_Mode_Select.png');

  // Click Continue with Email
  console.log('Clicking Continue with Email...');
  const emailClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Continue with Email'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (emailClicked) {
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '02_Mobile_Login_Credentials_Screen.png');

    // Fill in Email & Password
    console.log('Filling in credentials...');
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].type('abhishek7y2@gmail.com');
      await inputs[1].type('@Abhi2419');
      await new Promise(r => setTimeout(r, 500));
      await saveScreenshot(page, '03_Mobile_Login_Filled.png');

      // Click Sign In
      console.log('Clicking Sign In...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
        const btn = buttons.find(b => b.textContent && b.textContent.trim() === 'Sign In');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  // 04 Dashboard / Home Tab
  console.log('Capturing Mobile Dashboard...');
  await saveScreenshot(page, '04_Mobile_Dashboard_Screen.png');

  // List of bottom tab labels to click through
  const tabs = [
    { name: '05_Mobile_Tasks_Screen.png', label: 'Tasks' },
    { name: '06_Mobile_Calendar_Screen.png', label: 'Calendar' },
    { name: '07_Mobile_Docs_RAG_Screen.png', label: 'Docs RAG' },
    { name: '08_Mobile_Comm_Screen.png', label: 'Comm' },
    { name: '09_Mobile_Attendance_Screen.png', label: 'Attendance' },
    { name: '10_Mobile_Leave_Screen.png', label: 'Leave' },
    { name: '11_Mobile_Team_Screen.png', label: 'Team' },
    { name: '12_Mobile_AIBot_Screen.png', label: 'AI Bot' },
    { name: '13_Mobile_Profile_Screen.png', label: 'Profile' },
  ];

  for (const t of tabs) {
    console.log(`Clicking tab: ${t.label}...`);
    const clicked = await page.evaluate((label) => {
      const items = Array.from(document.querySelectorAll('div[role="button"], a, button'));
      const match = items.find(el => el.textContent && el.textContent.trim() === label);
      if (match) {
        match.click();
        return true;
      }
      return false;
    }, t.label);

    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot(page, t.name);
  }

  console.log('All Mobile App screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during mobile capture:', err);
  process.exit(1);
});
