const parseCookies = (req, res, next) => {
  // console.log('test');
  // console.log(arguments);
  // console.log(req);
  let cookieString = req.headers.cookie;
  let cookieSplit = cookieString.split('; ');
  req.cookie = cookieSplit.reduce((acc, val) => {
    const [key, value] = val.split('=');
    acc[key] = value;
    return acc;
  }, {});
  next();
};

module.exports = parseCookies;