const puppeteer = require('puppeteer');

const URL = 'https://thevc.kr/';
const searchBarSelector = 'body > header > div.header-left_side > div > input';
const companySelector = 'body > header > div.header-left_side > div > div > div.r_container_company > ul > li:nth-child(1) > a';
const investedSelector = '#content > div.content_body > div > div:nth-child(2) > div.graph_container.invest_info > div:nth-child(1) > div.num > p.sum_invest';

const main = async (companyName) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['—no-sandbox', '—disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  // THE VC 페이지로 이동
  await page.goto(URL);

  await page.click(searchBarSelector);
  await page.type(searchBarSelector, companyName);
  await page.waitFor(5000)
    .then(() => {
      page.waitForSelector(companySelector).then().catch();
    });
  await page.click(companySelector);

  const invested = await page.evaluate((investedSelector) => {
    const investedAmount = document.querySelectorAll(investedSelector);
    console.log(investedAmount[0]);
  });
};

main('kakao');
