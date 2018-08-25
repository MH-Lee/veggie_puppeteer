const todayDate = (ago) => {
  const x = new Date();
  const y = (x.getFullYear()-ago).toString();
  let m = (x.getMonth()+1).toString();
  let d = x.getDate().toString();
  (d.length === 1) && (d = `0${d}`);
  (m.length === 1) && (m = `0${m}`);
  const yyyymmdd = y + '-' + m + '-' + d;
  return yyyymmdd;
};

today = todayDate(0)
console.log(today);
// module.exports = {
//   todayDate,
// };
