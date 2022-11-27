export const baseUrl =
  "https://www.prisjakt.nu/tema/dagens-deals?sort=price.diff_percentage%7Cdesc";
export const pageSize = 24;
export const pagesToScrape = 5;
export const categoriesToIgnore = [
  "PC-spel",
  "Xbox One-spel",
  "Nintendo Switch-spel",
  "PlayStation 4-spel",
  "PlayStation 5-spel",
];
export const dataFolder = "./data";
export const dataFile = `${dataFolder}/database.json`;
