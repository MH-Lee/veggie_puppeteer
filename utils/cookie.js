const setCookie = (key, value) => {
  console.log(key);
  console.log(value);
  document.cookie += `${key}=${value}`;
};

const getCookie = (key) => {
  const name = `${key}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

module.exports = {
  setCookie,
  getCookie,
};
