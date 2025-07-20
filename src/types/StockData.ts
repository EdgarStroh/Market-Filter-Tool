
export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  price: number;
  
  // Valuation Metrics
  marketCap: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  pegRatio: number | null;
  priceToSales: number | null;
  enterpriseValue: number | null;
  evToEbitda: number | null;
  
  // Financial Performance
  revenue: number | null;
  revenueGrowth: number | null;
  netIncome: number | null;
  netIncomeGrowth: number | null;
  operatingIncome: number | null;
  ebitda: number | null;
  freeCashFlow: number | null;
  freeCashFlowGrowth: number | null;
  
  // Profitability
  roe: number | null;
  roa: number | null;
  roic: number | null;
  nopat: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  
  // Financial Health
  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;
  debtToAssets: number | null;
  interestCoverage: number | null;
  totalDebt: number | null;
  totalEquity: number | null;
  totalAssets: number | null;
  workingCapital: number | null;
  
  // Dividends & Returns
  dividendYield: number | null;
  dividendGrowthRate: number | null;
  payoutRatio: number | null;
  
  // Market Data
  beta: number | null;
  bookValuePerShare: number | null;
  tangibleBookValue: number | null;
  cashPerShare: number | null;
  earningsPerShare: number | null;
  sharesOutstanding: number | null;
  
  // Growth Metrics
  earningsGrowth5Y: number | null;
  revenueGrowth5Y: number | null;
  
  // Additional Balance Sheet Data
  currentAssets: number | null;
  currentLiabilities: number | null;
  inventory: number | null;
  
  // Additional Income Statement Data
  costOfGoodsSold: number | null;
  
  // Additional Dividend Data
  dividendsPerShare: number | null;
}
