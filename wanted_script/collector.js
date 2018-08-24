const fs = require('fs');
const puppeteer = require('puppeteer');
const format = require('string-format');

const wantedUrl = 'https://www.wanted.co.kr/wdlist/518';
const todayDate = () => {
  const x = new Date();
  const y = x.getFullYear().toString();
  let m = (x.getMonth() + 1).toString();
  let d = x.getDate().toString();
  (d.length === 1) && (d = `0${d}`);
  (m.length === 1) && (m = `0${m}`);
  const yyyymmdd = y + m + d;
  return yyyymmdd;
};

const extractItems = () => {
  const extractedElements = document.querySelectorAll('#job > div.container > div > div > ul > li');
  const items = [];
  for (const element of extractedElements) {
    const aTag = element.querySelectorAll('div > a');
    items.push(`\n${aTag[0].href}`);
  }
  return items;
};
async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  itemTargetCount,
  scrollDelay = 1000,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitFor(scrollDelay);
    }
  } catch (e) { console.log(e); }
  return items;
}

(async () => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    timeout: 999999,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  // Navigate to the demo page.
  await page.goto(wantedUrl);

  // Scroll and extract items from the page.
  const items = await scrapeInfiniteScrollItems(page, extractItems, 10000);
  const today = todayDate();
  // Save extracted items to a file.
  fs.writeFileSync(format('./wanted_url/{}.txt', `${today}`), `${items}`);

  // Close the browser.
  await browser.close();
})();
