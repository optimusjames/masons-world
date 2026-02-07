import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/2026-02-06-terminator/index.html', {
    waitUntil: 'networkidle0'
  });
  
  // Wait for animation to settle
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await page.screenshot({ 
    path: '2026-02-06-terminator/screenshots/uppercase-balanced-lines.png',
    fullPage: false
  });
  
  await browser.close();
  console.log('Screenshot saved!');
})();
