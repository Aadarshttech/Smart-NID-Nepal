const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.join(__dirname, 'store_screenshots_real');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  console.log("Starting browser...");
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 }
  });
  
  const page = await browser.newPage();

  console.log("Capturing Dashboard...");
  try {
    await page.goto('https://smartnid.aadarshapandit.com.np/', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(outDir, '1_dashboard.png') });
  } catch (e) {
    console.log("Could not load dashboard. Is localhost:5173 running?", e.message);
  }

  console.log("Capturing Extension Popup...");
  const popupPath = 'file:///' + path.join(__dirname, 'extension', 'popup.html').replace(/\\/g, '/');
  
  await page.evaluateOnNewDocument(() => {
    // Mock chrome extension API so it renders without crashing
    window.chrome = {
      storage: {
        local: {
          get: (keys, cb) => cb({ savedProfiles: [] })
        }
      },
      runtime: {
        getManifest: () => ({ version: "1.1.0" })
      }
    };
  });
  
  await page.goto(popupPath, { waitUntil: 'networkidle0' });
  
  // Style it to look like a beautiful promotional screenshot centered on a gradient background
  await page.evaluate(() => {
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.display = 'flex';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
    document.body.style.height = '100vh';
    document.body.style.background = 'linear-gradient(135deg, #003893 0%, #1a5fc7 50%, #dc143c 100%)';
    
    const wrapper = document.createElement('div');
    wrapper.style.background = 'white';
    wrapper.style.padding = '0';
    wrapper.style.borderRadius = '16px';
    wrapper.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
    wrapper.style.transform = 'scale(1.5)';
    wrapper.style.overflow = 'hidden';
    wrapper.style.width = '350px';
    wrapper.style.height = '600px';
    wrapper.innerHTML = originalContent;
    
    document.body.appendChild(wrapper);
  });
  
  // Wait a moment for styles to apply
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '2_extension_popup.png') });

  await browser.close();
  console.log("Success! Authentic screenshots saved to 'store_screenshots_real' folder.");
})();
