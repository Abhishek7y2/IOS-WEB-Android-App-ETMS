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

async function saveScreenshot(page, filename, fullPage = true) {
  for (const dir of DEST_DIRS) {
    const fullPath = path.join(dir, filename);
    await page.screenshot({ path: fullPath, fullPage });
    console.log(`Saved screenshot: ${filename} (fullPage: ${fullPage}) to ${dir}`);
  }
}

async function tapText(page, text) {
  const rect = await page.evaluate((targetText) => {
    const all = Array.from(document.querySelectorAll('button, a, div, span'));
    const el = all.find(e => e.innerText && e.innerText.trim() === targetText);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, text);
  if (rect) {
    await page.mouse.click(rect.x, rect.y);
    return true;
  }
  return false;
}

async function run() {
  console.log('Launching browser for comprehensive full-page web tour...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Unauthenticated Screens (Full-Page)
  console.log('1. Login Screen...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '01_Web_Login_Screen.png', true);

  console.log('2. Register Screen...');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '02_Web_Register_Screen.png', true);

  console.log('3. Forgot Password Screen...');
  await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '03_Web_Forgot_Password_Screen.png', true);

  console.log('4. Reset Password Screen...');
  await page.goto(`${BASE_URL}/reset-password`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '04_Web_Reset_Password_Screen.png', true);

  console.log('5. Verify Account Screen...');
  await page.goto(`${BASE_URL}/verify-account`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, '05_Web_Verify_Account_Screen.png', true);

  // Authenticate session
  console.log('Authenticating Super Admin API session...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'abhishek7y2@gmail.com', password: '@Abhi2419' })
  });
  const loginJson = await loginRes.json();
  const authUser = loginJson.data?.user || loginJson.user;
  const authToken = loginJson.data?.token || loginJson.token;

  await page.setCookie({ name: 'token', value: authToken, domain: 'localhost', path: '/' });
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(u => window.localStorage.setItem('auth_user', JSON.stringify(u)), authUser);

  // 6. Complete Dashboard (Full Page)
  console.log('6. Complete Dashboard (Full Page)...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '06_Web_Dashboard_Full_Screen.png', true);

  // 7. Complete Tasks Table (Full Page)
  console.log('7. Complete Tasks (Full Page)...');
  await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '07_Web_Tasks_Full_Screen.png', true);

  // 8. Tasks: Create Task Modal
  console.log('8. Tasks: Create Task Modal...');
  const createBtn = await page.$('[data-testid="create-task-button"]');
  if (createBtn) {
    await createBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '08_Web_Tasks_Create_Modal.png', false);
    // Close modal
    const closeBtn = await page.$('button[aria-label="Close modal"]');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // 9. Complete Attendance Page (Full Page)
  console.log('9. Attendance Tracker (Full Page)...');
  await page.goto(`${BASE_URL}/attendance`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '09_Web_Attendance_Full_Screen.png', true);

  // 10. Complete Leave Page (Full Page Table)
  console.log('10. Leave Management (Full Page Table)...');
  await page.goto(`${BASE_URL}/leave`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '10_Web_Leave_Table_Full_Screen.png', true);

  // 11. Leave Calendar View
  console.log('11. Leave Management (Calendar View)...');
  await tapText(page, 'Calendar');
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '11_Web_Leave_Calendar_Full_Screen.png', true);

  // 12. Leave Details Modal
  console.log('12. Leave Details Modal...');
  await tapText(page, 'Table');
  await new Promise(r => setTimeout(r, 1000));
  const viewLeaveBtn = await page.$('button[title="View Details"]');
  if (viewLeaveBtn) {
    await viewLeaveBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '12_Web_Leave_Details_Modal.png', false);
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }

  // 13. Complete Employees Directory (Full Page)
  console.log('13. Employees Directory (Full Page)...');
  await page.goto(`${BASE_URL}/employees`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '13_Web_Employees_Directory_Full_Screen.png', true);

  // 14. Employees: Add Member Modal
  console.log('14. Employees: Add Member Modal...');
  const addEmpBtn = await page.$('[data-testid="add-employee-button"]');
  if (addEmpBtn) {
    await addEmpBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '14_Web_Employees_Add_Member_Modal.png', false);
    // Close modal
    await page.evaluate(() => {
      const closeBtns = Array.from(document.querySelectorAll('button'));
      const cancelBtn = closeBtns.find(b => b.innerText && b.innerText.trim() === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
  }

  // 15. Complete Communication Hub (Inbox)
  console.log('15. Communication Hub (Inbox)...');
  await page.goto(`${BASE_URL}/communication`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '15_Web_Communication_Inbox_Screen.png', true);

  // 16. Communication: Announcements Tab
  console.log('16. Communication: Announcements Tab...');
  await tapText(page, 'Announcements');
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '16_Web_Communication_Announcements_Screen.png', true);

  // 17. Communication: Analytics Tab
  console.log('17. Communication: Analytics Tab...');
  await tapText(page, 'Analytics');
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '17_Web_Communication_Analytics_Screen.png', true);

  // 18. Complete Calendar Page (Full Page)
  console.log('18. Calendar Schedule (Full Page)...');
  await page.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '18_Web_Calendar_Schedule_Full_Screen.png', true);

  // 19. Calendar Notepad View
  console.log('19. Calendar Notepad View...');
  await tapText(page, 'Notepad');
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '19_Web_Calendar_Notepad_View.png', true);

  // 20. Calendar Add Holiday Modal
  console.log('20. Calendar Add Holiday Modal...');
  await tapText(page, 'Calendar');
  await new Promise(r => setTimeout(r, 1000));
  const addHolidayBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.innerText && b.innerText.includes('Add Holiday'));
  });
  if (addHolidayBtn && addHolidayBtn.asElement()) {
    await addHolidayBtn.asElement().click();
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '20_Web_Calendar_Add_Holiday_Modal.png', false);
    // Close modal
    await page.evaluate(() => {
      const closeBtns = Array.from(document.querySelectorAll('button'));
      const cancelBtn = closeBtns.find(b => b.innerText && b.innerText.trim() === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
  }

  // 21. Profile Screen (Full Page)
  console.log('21. Profile Screen (Full Page)...');
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '21_Web_Profile_Full_Screen.png', true);

  // 22. Settings: Profile Tab (Full Page)
  console.log('22. Settings: Profile Tab (Full Page)...');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '22_Web_Settings_Profile_Full_Screen.png', true);

  // 23. Settings: Security & Password Tab (Full Page)
  console.log('23. Settings: Security Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const sec = tabs.find(b => b.innerText && b.innerText.includes('Security'));
    if (sec) sec.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '23_Web_Settings_Security_Full_Screen.png', true);

  // 24. Settings: DPDP Data Download Tab (Full Page)
  console.log('24. Settings: Data Download Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const dl = tabs.find(b => b.innerText && b.innerText.includes('Download My Data'));
    if (dl) dl.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '24_Web_Settings_Data_Download_Screen.png', true);

  // 25. Complete Archive Screen (Full Page)
  console.log('25. Archive Screen (Full Page)...');
  await page.goto(`${BASE_URL}/archive`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await saveScreenshot(page, '25_Web_Archive_Full_Screen.png', true);

  console.log('All 25 Complete Web App screens and modals captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during complete web capture:', err);
  process.exit(1);
});
