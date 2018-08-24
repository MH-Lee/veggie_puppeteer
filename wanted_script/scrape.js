const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const format = require('string-format');

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

const today = todayDate();
const words = fs.readFileSync(format('./wanted_script/logs/{}.txt', `${today}`), 'utf8');
const arr = words.split(',');
const contentURL = 'http://45.76.213.33:3000/gobble/api/v1/contents/wanted_job_contents/';

// post data
const postData = async (contentData) => {
  const res = await axios.post(contentURL, contentData);
  return res;
};

const scrapeData = async (page, url) => {
  await page.goto(url);

  const companyJobTitleSelector = '#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h3';
  const companyNameSelector = '#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h4 > span:nth-child(1)';
  const companyLocation = '#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h4 > span:nth-child(3) > span:nth-child(2)';
  const companyContent = '#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div:nth-child(3) > h4';

  await page.waitForSelector(companyJobTitleSelector);
  await page.waitForSelector(companyNameSelector);
  await page.waitForSelector(companyLocation);
  await page.waitForSelector(companyContent);

  const data = await page.evaluate(() => {
    const companyJobTitle = document.querySelectorAll('#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h3');
    const companyName = document.querySelectorAll('#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h4 > span:nth-child(1)');
    const companyLocation = document.querySelectorAll('#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h4 > span:nth-child(3) > span:nth-child(2)');
    const companyContent = document.querySelectorAll('#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div:nth-child(3) > h4');
    const title = companyJobTitle[0].innerText;
    const company = companyName[0].innerText;
    const location = companyLocation[0].innerText;
    const content = companyContent[0].innerText;
    const contentData = {
      title,
      company,
      location,
      content,
    };
    console.log(title, company, location);
    return contentData;
  })
    .catch(() => {
      console.log('error: skipping...');
    });
  data.url = url;
  const res = await postData(data)
    .catch(() => {
      console.log(`${url} skipping ...`);
    });
  return res;
};

console.log('main');
const main = async () => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
    const contentData = await scrapeData(page, arr[i]);
    console.log(contentData);
  }

  await browser.close();
};

main();
