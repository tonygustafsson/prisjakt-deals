import puppeteer from "puppeteer";
import { baseUrl, pageSize, pagesToScrape } from "./constants";
import { normalizeProduct } from "./utils/normalizeProduct";
import { readJsonFromFile, saveJsonToFile } from "./utils/file";
import type { Product, ScrapeResult } from "./@types/prisjakt-types";

const scrape = async (url: string) => {
  console.log(`Scraping ${url}...`);

  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await page.goto(url);

  // Map through all the products on the current page
  const productCards = await page.$$eval(
    "li[data-test='ProductGridCard']",
    (cards: Element[]) => cards.map((card) => normalizeProduct(card))
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
  const previousData = readJsonFromFile();

  // Get products that were not there last time script ran, or if the price is changed
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

  saveJsonToFile(json);
})();
