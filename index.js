const fs = require('fs');
const puppeteer = require('puppeteer');
// const puppeteerInfiniteScroll = require('puppeteer-infinite-scroll');

const wantedUrl = 'https://www.wanted.co.kr/wdlist/518';

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
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  // Navigate to the demo page.
  await page.goto(wantedUrl);

  // Scroll and extract items from the page.
  const items = await scrapeInfiniteScrollItems(page, extractItems, 10000);

  // Save extracted items to a file.
  fs.writeFileSync('./items.txt', `${items}`);

  // Close the browser.
  await browser.close();
})();


// const pageScraper = async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     args: ['--no-sandbox', '--disable-setuid-sandbox'],
//   });
//
//   const page = await browser.newPage();
//   page.setViewport({ width: 1280, height: 926 });
//
//   await page.goto(wantedUrl);
//   await page.evaluate(() => {
//     window.scrollBy(0, window.innerHeight);
//   });
// };
//
// pageScraper()
// (async () => {
//   try {
//     const browser = new puppeteerInfiniteScroll();
//     await browser.start();
//     await browser.open({
//       url: 'https://www.wanted.co.kr/wdlist/518',
//       endpoint: 'https://www.wanted.co.kr/wdlist/518',
//       loadImages: false,
//       onResponse: (res) => {
//         // console.log(res);
//       },
//       onScroll: () => {
//         console.log(`onScroll ${browser.scrollCount}`);
//       },
//     });
//   } catch (e) {
//     console.error(e);
//   }
// })();
