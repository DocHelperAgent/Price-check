
export interface PriceResult {
  title: string;
  price: number;
  currency: string;
  source: string;
  url: string;
  isCheapest?: boolean;
}

export interface ProductDetails {
  name: string;
  description: string;
  image: string;
  prices: PriceResult[];
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  SEARCHING = 'SEARCHING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
