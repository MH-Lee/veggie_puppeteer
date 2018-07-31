const fs = require('fs');

require.extensions['.txt'] = (module, filename) => {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const words = require('./wanted_url.txt');

const arr = words.split(',');

console.log(arr[0]);

// console.log(words); // string
