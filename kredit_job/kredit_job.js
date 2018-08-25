const axios = require('axios');
const fs = require('fs');
const puppeteer = require('puppeteer');
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
const english = /^[A-Za-z0-9]*$/;
const contentURL = 'http://45.76.213.33:3000/gobble/api/v1/contents/wanted_job_contents/?page={}';
const kreditAPI = 'http://45.76.213.33:3000/gobble/api/v1/contents/kredit_job_contents/';
const kreditJobUrl = 'https://kreditjob.com/';
const searchBarSelector = '#root > div > div.body-container > div.home-wrapper.row > div > div.home-search-box-container > div > div.search-box-query-box > div > input';
const firstlist = '#react-autowhatever-1--item-0';

const getData = async () => {
  let startpage = 0;
  const dataResult = [];
  const res = await axios.get(format(contentURL, 1));
  const page = Math.ceil(Number(res.data.count) / 100);
  do {
    startpage += 1;
    console.log(startpage);
    const res = await axios.get(format(contentURL, `${startpage}`));
    console.log(res.data.next);
    for (const dataObj of res.data.results) {
      const companyName = dataObj.company;
      dataResult.push(companyName);
    }
  } while (startpage < page);
  return dataResult;
};

const dataSend = async (array) => {
  for (let i = 0; i < array.length; i++) {
    await axios.post(kreditAPI, array[i]);
    console.log('Data Send Success!');
  }
};

const getCompanyList = async () => {
  const data = await getData();
  const companyList = [];
  const companySet = new Set(data);
  for (const setElement of companySet) {
    const tempElement = await setElement.replace('(주)');
    await fs.appendFile(format('./kredit_job/logs/{}.txt', `${today}`), `${tempElement}\n`, (err) => {
      if (err) throw err;
    });
    const splitElement = await setElement.split('(');
    if (splitElement.length === 1) {
      companyList.push(splitElement[0]);
    } else if (english.test(splitElement[0].replace(' ', ''))) {
      companyList.push(splitElement[1].replace(')', ''));
    } else if (splitElement[0] === '카카오페이지') {
      companyList.push('카카오');
    } else {
      companyList.push(splitElement[0].replace(' ', ''));
    }
  }
  console.log(companyList);
  return companyList;
};

// const company = getCompanyList();
// console.log(company);
// const companyList = fs.readFileSync(format('./kredit_job/logs/{}.txt', `${today}`), 'utf8');
// const arr = companyList.split(',');

console.log('main');
const main = async (url) => {
  const companyList = await getCompanyList();
  console.log(companyList);
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });
  const kreditjobData = [];
  for (let i = 0; i < companyList.length; i++) {
    await page.goto(url);
    await page.click(searchBarSelector);
    await page.type(searchBarSelector, companyList[i]);
    await page.waitFor(1000);
    await page.click(firstlist)
      .catch(() => { console.log('회사가 없습니다'); });
    const companyNameSelector = '#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-label-container > div.label-container > div.info-box > div.company-label > span';
    const locationSelector = '#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-label-container > div.label-container > div.company-label-info-cell > div.info-cell.first > span.cat_text';
    const industrySelector = '#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-label-container > div.label-container > div.company-label-info-cell > div:nth-child(2) > span.cat_text';
    const startIncomeSelector = '#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-salary-container > div:nth-child(2) > div:nth-child(1) > div > div > div.salary-label-right > span';
    const endIncomeSelector = '#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-salary-container > div:nth-child(2) > div:nth-child(2) > div > div > div.salary-label-right > span';
    try {
      await page.waitForSelector(companyNameSelector);
      await page.waitForSelector(locationSelector);
      await page.waitForSelector(industrySelector);
      await page.waitForSelector(startIncomeSelector);
      await page.waitForSelector(endIncomeSelector);
      const data = await page.evaluate(() => {
        const companyName = document.querySelectorAll('#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-label-container > div.label-container > div.info-box > div.company-label > span');
        const companyLocation = document.querySelectorAll('#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-label-container > div.label-container > div.company-label-info-cell > div.info-cell.first > span.cat_text');
        const companyIndustry = document.querySelectorAll('#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-label-container > div.label-container > div.company-label-info-cell > div:nth-child(2) > span.cat_text');
        const companyStartIncome = document.querySelectorAll('#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-salary-container > div:nth-child(2) > div:nth-child(1) > div > div > div.salary-label-right > span');
        const companyEndIncome = document.querySelectorAll('#root > div > div.body-container > div.company-container > div.company-wrapper > div.company-contents > section.company-salary-container > div:nth-child(2) > div:nth-child(2) > div > div > div.salary-label-right > span');
        const company = companyName[0].innerText;
        const industry = companyIndustry[0].innerText;
        const location = companyLocation[0].innerText;
        const starting_income = companyStartIncome[0].innerText;
        const average_income = companyEndIncome[0].innerText;
        const contentData = {
          company,
          industry,
          location,
          starting_income,
          average_income,
        };
        console.log(company, location, industry, starting_income, average_income);
        return contentData;
      });
      console.log('Data Crawler Success!');
      kreditjobData.push(data);
    } catch (e) {
      console.log('error', `${companyList[i]}`);
    }
  }
  await browser.close();
  console.log(kreditjobData);
  const res = await dataSend(kreditjobData);
  console.log(res);
};

const dataList = main(kreditJobUrl);
console.log(dataList);
