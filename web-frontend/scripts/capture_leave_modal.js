const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'abhishek7y2@gmail.com', password: '@Abhi2419' })
  });
  const loginJson = await loginRes.json();
  const authUser = loginJson.data?.user || loginJson.user;
  const authToken = loginJson.data?.token || loginJson.token;
  const adminUser = { ...authUser, role: 'admin' };
  await page.setCookie({ name: 'token', value: authToken, domain: 'localhost', path: '/' });
  await page.goto('http://localhost:3000/leave', { waitUntil: 'networkidle2' });
  await page.evaluate(u => window.localStorage.setItem('auth_user', JSON.stringify(u)), adminUser);
  await page.goto('http://localhost:3000/leave', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const applyBtn = await page.$('[data-testid="apply-leave-button"]');
  if (applyBtn) {
    await applyBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    const dests = [
      path.join(__dirname, '../../Screenshots/WEB APP/12_Web_Leave_Apply_Modal.png'),
      path.join(__dirname, '../../WEB APP/12_Web_Leave_Apply_Modal.png'),
      '/Users/ankur/.gemini/antigravity-ide/brain/12e46e5b-1a79-4f95-b94b-dfd3f36ea6ba/Screenshots/WEB APP/12_Web_Leave_Apply_Modal.png'
    ];
    for (const d of dests) {
      await page.screenshot({ path: d, fullPage: false });
      console.log('Saved 12_Web_Leave_Apply_Modal.png to', d);
    }
  } else {
    console.log('applyBtn not found');
  }
  await browser.close();
})();
