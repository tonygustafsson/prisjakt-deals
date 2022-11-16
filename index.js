const puppeteer = require("puppeteer");

const baseUrl =
  "https://www.prisjakt.nu/tema/dagens-deals?sort=price.diff_percentage%7Cdesc";
const pageSize = 24;
const pagesToScrape = 4;

const scrape = async (url) => {
  console.log(`Scraping ${url}...`);

  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await page.goto(url);

  // Map through all the products on the current page
  const productCards = await page.$$eval(
    "li[data-test='ProductGridCard']",
    (cards) =>
      cards.map((card) => {
        const title = card.querySelector(
          "[data-test='ProductName']"
        )?.innerText;
        const percentageOff = card.querySelector(
          "[class^='DiffPercentage']"
        )?.innerText;
        const url = card.querySelector("[class^='InternalLink']")?.href;
        const price = card.querySelector("[class*='BaseButton']")?.innerText;
        const category = card.querySelector(
          "[class^='CardContent'] > span:nth-child(2)"
        )?.innerText;

        return {
          title,
          category,
          percentageOff,
          price,
          url,
        };
      })
  );

  browser.close();

  return productCards;
};

(async () => {
  // Fetch x number of pages product cards
  const productCards = await Promise.all(
    Array.from({ length: pagesToScrape }, (_, i) =>
      scrape(`${baseUrl}&offset=${pageSize * i}`)
    )
  );

  console.log(productCards.flat());
})();
