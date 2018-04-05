const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

let firstMsg = false;
let scrape = async (doctor) => {
  try {
    async function getDoctors() {
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.goto('http://dp45.medzveno.ru/shedule/');
      await page.click('.select_table_sp_2');
      const doctorLink = await page.evaluate((doctor) => {
        const tbody = document.querySelector('body > div > div.content.about_page > div > div > b > u > div > table > tbody');
        let link = "";
        const text = "test;"
        let info = [];
        for (let i = 2; i < tbody.children.length; i++) {
          const name = document.querySelector(`body > div > div.content.about_page > div > div > b > u > div > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > b`);
          if (name.innerText === doctor) {
            info.push({
              link: `body > div > div.content.about_page > div > div > b > u > div > table > tbody > tr:nth-child(${i}) > td:nth-child(8) > form:nth-child(1) > input:nth-child(8)`,
              name: document.querySelector(`body > div > div.content.about_page > div > div > b > u > div > table > tbody > tr:nth-child(${i}) > td:nth-child(2)`).innerText.replace(/\\n/g, " ")
            })
          }
        }
        return info;
      }, doctor)
      browser.close();
      return doctorLink
    }
    const docs = await getDoctors();
    let found = { name: '', text: '' };

    checkData();
    function checkData() {
      if (found.text.length) {
        return found;
      } else {
        getData(docs);
      }
    }
    async function getData(docArray) {
      console.log("getting data");
      const res = await Promise.all(docArray.map(async el => {
        try {
          if (!found.text.length) {
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            await page.goto('http://dp45.medzveno.ru/shedule/');
            await page.click('.select_table_sp_2');
            await page.waitFor(200);
            await page.click(el.link);
            await page.waitFor(4000);
            const results = await page.evaluate((el) => {
              let foundNumber = { doctor: el.name, text: "" };
              const tables = document.querySelectorAll('table');
              const arr = Array.from(tables[tables.length - 1].children[0].children);
              arr.reverse().forEach((child) => {
                (child.children[0].children[0].className === "SM_ACTIV") && (foundNumber.text = child.children[0].children[0].innerText
                )
              })
              return foundNumber
            }, el);
            found = results;

            browser.close();
            return results
          }
        } catch (err) {
          err => console.log(err);
        }
      }))
      console.log(res);

      if (res.some(el => el && el.text.length > 0)) {
        sendData(res);
      } else {
        console.log('no data!');
        !firstMsg && sendData();
        checkData();
      }
    }


    function sendData(results) {
      // TELEGRAM API
      !results ? firstMsg = true : firstMsg;
      const bugleev = "422846457";
      const nadya = "525190639";
      const text = results ? `${results[0].doctor}: ${results[0].text} http://dp45.medzveno.ru/shedule/` : `${doctor}: Номерков нет, буду ждать`;
      const telegramUrl = encodeURI(`https://api.telegram.org/bot453191212:AAHFhvZVDwT1daxUTGwnsH0BmkG65cOm9Tc/sendMessage?chat_id=${bugleev}&text=${text}`);
      fetchAsync(telegramUrl);
      console.log(results);
      async function fetchAsync(url) {
        try {
          let response = await fetch(url);
          let data = await response.json();
          return data;
        }
        catch (err) {
          err => err;
        }
      }
    }

  } catch (error) {
    console.log(error);
  };
}
module.exports = scrape;
