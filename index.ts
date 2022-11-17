import puppeteer from "puppeteer";
import fs from "fs";

// Settings
const baseUrl =
  "https://www.prisjakt.nu/tema/dagens-deals?sort=price.diff_percentage%7Cdesc";
const pageSize = 24;
const pagesToScrape = 3;
const dataFolder = "./data";
const dataFile = `${dataFolder}/database.json`;

type Product = {
  id: string;
  title: string;
  category: string;
  percentageOff: string;
  price: string;
  url: string;
};

type ScrapeResult = Record<Product["id"], Product>;

const scrape = async (url: string) => {
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
        )?.textContent;
        const percentageOff = card.querySelector(
          "[class^='DiffPercentage']"
        )?.textContent;
        const url = card
          .querySelector("[class^='InternalLink']")
          ?.getAttribute("href");
        const price = card.querySelector("[class*='BaseButton']")?.textContent;
        const category = card.querySelector(
          "[class^='CardContent'] > span:nth-child(2)"
        )?.textContent;
        const id = url?.split("=")[1] || "0";

        return {
          id,
          title,
          category,
          percentageOff,
          price,
          url,
        } as Product;
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

  // Convert the page arrays to a single object where the id is key and body is the value
  const data = productCards
    .flat()
    .reduce(
      (acc, product) => ({ ...acc, [product.id]: product }),
      {}
    ) as ScrapeResult;
  const json = JSON.stringify(data);
  let previousData = {} as ScrapeResult;

  if (fs.existsSync(dataFile)) {
    const database = fs.readFileSync(dataFile).toString();
    previousData = JSON.parse(database);
  }

  const newProducts = Object.keys(data).reduce((acc, id) => {
    if (!previousData[id] || previousData[id].price !== data[id].price) {
      return [...acc, data[id]];
    }

    return acc;
  }, [] as Product[]);

  if (!newProducts.length) {
    console.log("No new products");
  } else {
    console.log(newProducts);
  }

  // Be sure that the data folder exists
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
  }

  // Save data to file
  fs.writeFileSync(dataFile, json);
})();
