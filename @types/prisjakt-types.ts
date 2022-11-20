export type Product = {
  id: string;
  title: string;
  category: string;
  percentageOff: string;
  price: string;
  url: string;
};

export type ScrapeResult = Record<Product["id"], Product>;
