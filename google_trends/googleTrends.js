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


const now = Datecalc(0);
const threeY = Datecalc(3);
const contentURL = 'http://45.76.213.33:3000/gobble/api/v1/wanted_page_data';

const getData = async () => {
  const res = await axios.get(contentURL);
  const data = JSON.parse(res.data.WANTED_GOOGLE_TRENDS_TECH_LIST_DATA);
  console.log(data);
  console.log(data.length);
  return data;
};

const googleTrendsData = getData();
console.log(googleTrendsData);

// googleTrends.interestOverTime({
//   keyword: 'AWS', startTime: new Date('2017-02-01'), endTime: new Date('2017-02-06'), geo: 'KR',
// }, (err, results) => {
//   if (err) console.log('oh no error!', err);
//   else console.log(results);
// });
