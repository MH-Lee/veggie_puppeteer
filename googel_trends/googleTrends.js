const googleTrends = require('google-trends-api');

const now = Date.now();
console.log(now);
const pastYear = now.getFullYear();
now.setFullYear(pastYear);
console.log(now);

// googleTrends.interestOverTime({ keyword: 'AWS', startTime: new Date(now.setFullYear(now.getFullYear() - 1)) }, (err, results) => {
//   if (err) console.log('oh no error!', err);
//   else console.log(results);
// });
