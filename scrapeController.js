const scrape = require('./scrape'),
  puppeteer = require('puppeteer');

let text = "";

exports.homePage = (req, res) => {
  res.render("home", { text });
};

/*****************SCRAPE ROUTES*************/
exports.scrape = (req, res) => {
  console.log('Starting Scrape!');
  text = `Бот запущен! Ищет: ${req.body.doctor}`;
  res.render("home", { text });
  scrape(req.body.doctor).then((value) => {
  });
};
