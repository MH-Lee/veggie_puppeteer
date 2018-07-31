const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');

const words = fs.readFileSync('./wanted_url.txt', 'utf8');
const arr = words.split(',');

// url
const jwtURL = 'http://45.77.179.168:3000/api/v1/accounts/api-token-auth/';
const contentURL = 'http://45.77.179.168:3000/api/v1/contents/job_contents/';

// Authorization
const username = 'test';
const password = 'test123123123';

// post data
const postData = async (contentData) => {
  const jwtData = {
    username,
    password,
  };
  const jwtToken = await axios.post(jwtURL, jwtData);
  const token = jwtToken.data.token;
  // 쿠키를 가져와서 토큰을 사용한다
  const headerData = {
    Authorization: `JWT ${token}`,
  };
  const res = await axios.post(contentURL, contentData, { headers: headerData });
  return res;
};

const scrapeData = async (page, url) => {
  await page.goto(url);

  const data = await page.evaluate(() => {
    const companyJobtitle = document.querySelectorAll('#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h3');
    const companyName = document.querySelectorAll('#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h4 > span:nth-child(1)');
    const companylocation = document.querySelectorAll('#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div.Div-hTZHGu.fezPpG > div:nth-child(2) > h4 > span:nth-child(3) > span:nth-child(2)');
    const companyContent = document.querySelectorAll('#app > main > div:nth-child(1) > div:nth-child(2) > div.react-container > div.UserJobDetail-cCsxOA.kySZNS > div > div > div > div:nth-child(2) > div:nth-child(3) > h4');
    const title = companyJobtitle[0].innerText;
    const company = companyName[0].innerText;
    const location = companylocation[0].innerText;
    const content = companyContent[0].innerText;
    const contentData = {
      title,
      company,
      location,
      content,
    };
    console.log(title, company, location);
    return contentData;
  });
  const res = await postData(data);
  return res;
};


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
