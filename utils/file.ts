import fs from "fs";
import { dataFile, dataFolder } from "../constants";
import type { ScrapeResult } from "../@types/prisjakt-types";

export const readJsonFromFile = () => {
  if (fs.existsSync(dataFile)) {
    const database = fs.readFileSync(dataFile).toString();
    return JSON.parse(database) as ScrapeResult;
  }

  return {} as ScrapeResult;
};

export const saveJsonToFile = (data: string) => {
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
  }

  // Save data to file
  fs.writeFileSync(dataFile, data.toString());
};
