import type { Product } from "../@types/prisjakt-types";

export const normalizeProduct = (product: any) => {
  const title = product.querySelector("[data-test='ProductName']")?.textContent;
  const percentageOff = product.querySelector(
    "[class^='DiffPercentage']"
  )?.textContent;
  const url = product
    .querySelector("[class^='InternalLink']")
    ?.getAttribute("href");
  const price = product.querySelector("[class*='BaseButton']")?.textContent;
  const category = product.querySelector(
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
};
