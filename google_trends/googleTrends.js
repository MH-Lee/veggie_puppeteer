const axios = require('axios');
const googleTrends = require('google-trends-api');

// google trends 기간을 수정하기 위해서 필요한 함수
const Datecalc = (ago) => {
  const x = new Date();
  const y = (x.getFullYear() - ago).toString();
  let m = (x.getMonth() + 1).toString();
  let d = x.getDate().toString();
  (d.length === 1) && (d = `0${d}`);
  (m.length === 1) && (m = `0${m}`);
  const yyyymmdd = `${y}-${m}-${d}`;
  return yyyymmdd;
};

const contentURL = 'http://45.76.213.33:3000/gobble/api/v1/wanted_page_data';
const googleTrendsURL = 'http://45.76.213.33:3000/gobble/api/v1/contents/google_trends_contents/';

const getData = async () => {
  const res = await axios.get(contentURL);
  const data = JSON.parse(res.data.WANTED_GOOGLE_TRENDS_TECH_LIST_DATA);
  console.log(data);
  console.log(data.length);
  return data;
};

const dataSend = async (array) => {
  for (let i = 0; i < array.length; i++) {
    await axios.post(googleTrendsURL, array[i]);
    console.log('Data Send Success!');
  }
};

const googleTrendsDataSend = async (nation) => {
  const dataArray = [];
  const start = Datecalc(3);
  const end = Datecalc(0);
  const TechData = await getData();
  const geography = nation;
  let keyTech = '';
  for (const tech of TechData) {
    if (geography === 'KR' && tech === 'Machine Learning') {
      keyTech = '기계학습';
    } else if (geography === 'KR' && tech === 'AI') {
      keyTech = '인공지능';
    } else if (geography === 'KR' && tech === 'Deep Learning') {
      keyTech = '딥러닝';
    } else {
      keyTech = tech;
    }
    const keyword = tech;
    const starting_date = start;
    const end_date = end;
    const geo = geography;
    await googleTrends.interestOverTime({
      keyword: `${keyTech}`, startTime: new Date(Datecalc(3)), endTime: new Date(Datecalc(0)), geo: `${geo}`, category: 31,
    })
      .then(async (results) => {
        const data = JSON.stringify(results);
        const googleObject = {
          keyword,
          starting_date,
          end_date,
          geo,
          data,
        };
        await dataArray.push(googleObject);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  console.log(dataArray);
  await dataSend(dataArray);
  return dataArray;
};

// googleTrendsDataSend('US');
googleTrendsDataSend('KR');
