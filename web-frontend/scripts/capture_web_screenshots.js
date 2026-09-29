const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

const DEST_DIRS = [
  path.join(__dirname, '../../Screenshots/WEB APP'),
  path.join(__dirname, '../../WEB APP'),
  '/Users/ankur/.gemini/antigravity-ide/brain/12e46e5b-1a79-4f95-b94b-dfd3f36ea6ba/Screenshots/WEB APP'
];

DEST_DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function saveScreenshot(page, filename) {
  for (const dir of DEST_DIRS) {
    const fullPath = path.join(dir, filename);
    await page.screenshot({ path: fullPath, fullPage: false });
    console.log(`Saved screenshot: ${filename} to ${dir}`);
  }
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Login Screen
  console.log('Capturing Login Screen...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '01_Web_Login_Screen.png');

  // 2. Register Screen
  console.log('Capturing Register Screen...');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '02_Web_Register_Screen.png');

  // 3. Forgot Password Screen
  console.log('Capturing Forgot Password Screen...');
  await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '03_Web_Forgot_Password_Screen.png');

  // 4. Reset Password Screen
  console.log('Capturing Reset Password Screen...');
  await page.goto(`${BASE_URL}/reset-password`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '04_Web_Reset_Password_Screen.png');

  // 5. Verify Account Screen
  console.log('Capturing Verify Account Screen...');
  await page.goto(`${BASE_URL}/verify-account`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '05_Web_Verify_Account_Screen.png');

  // Perform Login to access protected screens
  console.log('Authenticating via API...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'abhishek7y2@gmail.com', password: '@Abhi2419' })
  });
  const loginJson = await loginRes.json();
  const authUser = loginJson.data?.user || loginJson.user;
  const authToken = loginJson.data?.token || loginJson.token;

  // Set cookie
  await page.setCookie({
    name: 'token',
    value: authToken,
    domain: 'localhost',
    path: '/'
  });

  // Navigate to /login to establish origin, then set localStorage
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate((u) => {
    window.localStorage.setItem('auth_user', JSON.stringify(u));
  }, authUser);


  // 6. Dashboard / Home Screen
  console.log('Capturing Dashboard Screen...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '06_Web_Dashboard_Screen.png');

  // 7. Tasks Screen
  console.log('Capturing Tasks Screen...');
  await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '07_Web_Tasks_Screen.png');

  // 8. Attendance Screen
  console.log('Capturing Attendance Screen...');
  await page.goto(`${BASE_URL}/attendance`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '08_Web_Attendance_Screen.png');

  // 9. Leave Management Screen
  console.log('Capturing Leave Screen...');
  await page.goto(`${BASE_URL}/leave`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '09_Web_Leave_Management_Screen.png');

  // 10. Employees Screen
  console.log('Capturing Employees Directory Screen...');
  await page.goto(`${BASE_URL}/employees`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '10_Web_Employees_Directory_Screen.png');

  // 11. Communication / Chat Screen
  console.log('Capturing Communication Screen...');
  await page.goto(`${BASE_URL}/communication`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '11_Web_Communication_Chat_Screen.png');

  // 12. Calendar Screen
  console.log('Capturing Calendar Screen...');
  await page.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '12_Web_Calendar_Schedule_Screen.png');

  // 13. Profile Screen
  console.log('Capturing Profile Screen...');
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '13_Web_Profile_Screen.png');

  // 14. Settings Screen
  console.log('Capturing Settings Screen...');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '14_Web_Settings_Screen.png');

  // 15. Archive Screen
  console.log('Capturing Archive Screen...');
  await page.goto(`${BASE_URL}/archive`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '15_Web_Archive_Screen.png');

  console.log('All Web App screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during web screenshot capture:', err);
  process.exit(1);
});
