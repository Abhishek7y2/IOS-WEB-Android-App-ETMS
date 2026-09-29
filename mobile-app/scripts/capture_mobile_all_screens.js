const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:8081';

const TARGET_DIRS = [
  path.join(__dirname, '../../Screenshots/MOBILE APP'),
  path.join(__dirname, '../../MOBILE APP'),
  path.join(__dirname, '../../Screenshots/IOS APP/Mobile App (React Native)'),
  '/Users/ankur/.gemini/antigravity-ide/brain/12e46e5b-1a79-4f95-b94b-dfd3f36ea6ba/Screenshots/MOBILE APP'
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

async function tapText(page, text) {
  const rect = await page.evaluate((targetText) => {
    const all = Array.from(document.querySelectorAll('div, span, button, a'));
    const el = all.find(e => e.innerText && e.innerText.trim() === targetText);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, text);
  if (rect) {
    await page.touchscreen.tap(rect.x, rect.y);
    return true;
  }
  return false;
}

async function run() {
  console.log('Launching browser for full Mobile App screen tour...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // 1. Initial Welcome Screen
  console.log('1. Welcome Screen...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '01_Mobile_Welcome_Screen.png');

  // 2. Register Screen
  console.log('2. Register Screen...');
  await tapText(page, 'Create Account');
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '02_Mobile_Register_Screen.png');

  // 3. Continue with Phone
  console.log('3. Phone Login Screen...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await tapText(page, 'Continue with Phone');
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '03_Mobile_Login_Phone_Screen.png');

  // 4. Continue with Email
  console.log('4. Email Login Screen...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await tapText(page, 'Continue with Email');
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '04_Mobile_Login_Email_Screen.png');

  // 5. Forgot Password Screen
  console.log('5. Forgot Password Screen...');
  await tapText(page, 'Forgot Password?');
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '05_Mobile_Forgot_Password_Screen.png');

  // 6. Perform Login
  console.log('6. Authenticating to access Main Tabs...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await tapText(page, 'Continue with Email');
  await new Promise(r => setTimeout(r, 1000));

  await page.type('input[placeholder="name@company.com"]', 'abhishek7y2@gmail.com');
  await page.type('input[placeholder="••••••••"]', '@Abhi2419');
  await new Promise(r => setTimeout(r, 500));

  const signRect = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('div')).find(e => e.innerText && e.innerText.trim() === 'Sign In');
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.touchscreen.tap(signRect.x, signRect.y);
  await new Promise(r => setTimeout(r, 4000));

  // 6. Dashboard / Home Tab
  console.log('6. Dashboard Screen...');
  await saveScreenshot(page, '06_Mobile_Dashboard_Screen.png');

  // Bottom Tabs (y = 815, width per tab = 39)
  const bottomTabs = [
    { name: '07_Mobile_Tasks_Screen.png', label: 'Tasks', x: 58.5 },
    { name: '08_Mobile_Calendar_Screen.png', label: 'Calendar', x: 97.5 },
    { name: '09_Mobile_Docs_RAG_Screen.png', label: 'Docs RAG', x: 136.5 },
    { name: '10_Mobile_Communication_Screen.png', label: 'Comm', x: 175.5 },
    { name: '11_Mobile_Attendance_Screen.png', label: 'Attendance', x: 214.5 },
    { name: '12_Mobile_Leave_Screen.png', label: 'Leave', x: 253.5 },
    { name: '13_Mobile_Team_Screen.png', label: 'Team', x: 292.5 },
    { name: '14_Mobile_Chatbot_AI_Screen.png', label: 'AI Bot', x: 331.5 },
    { name: '15_Mobile_Profile_Settings_Screen.png', label: 'Profile', x: 370.5 },
  ];

  for (const tab of bottomTabs) {
    console.log(`Tapping tab: ${tab.label} at (${tab.x}, 815)...`);
    await page.touchscreen.tap(tab.x, 815);
    await new Promise(r => setTimeout(r, 2500));
    await saveScreenshot(page, tab.name);
  }

  // 16. Dark Mode version of Dashboard
  console.log('16. Tapping Dark Mode toggle and Home...');
  await page.touchscreen.tap(19.5, 815); // Return to Home
  await new Promise(r => setTimeout(r, 1500));
  
  const moonRect = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('div'));
    const moon = all.find(e => {
      const r = e.getBoundingClientRect();
      return r.top < 60 && r.left > 240 && r.left < 310 && r.width > 20 && r.height > 20;
    });
    if (moon) {
      const r = moon.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }
    return null;
  });

  if (moonRect) {
    console.log('Tapping Moon toggle at', moonRect);
    await page.touchscreen.tap(moonRect.x, moonRect.y);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '16_Mobile_Dashboard_Dark_Mode.png');
  }

  console.log('All 16 Mobile App screens captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during full mobile capture:', err);
  process.exit(1);
});
