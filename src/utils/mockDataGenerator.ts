import { StockData } from "@/types/StockData";

// Simple hash function to generate consistent random numbers based on symbol
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Generate consistent random number between min and max based on seed
const seededRandom = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return min + random * (max - min);
};

export const generateMockData = (symbol: string): StockData => {
  const hash = hashCode(symbol);
  
  // Get realistic base values for major companies
  const companyData = getRealisticCompanyData(symbol);
  
  // Generate base metrics with more realistic scaling
  const marketCap = companyData.marketCap;
  const price = companyData.price;
  const revenue = marketCap * seededRandom(hash + 1, 0.3, 1.2); // Revenue as percentage of market cap
  const netIncome = revenue * seededRandom(hash + 2, 0.05, 0.25);
  const totalAssets = revenue * seededRandom(hash + 3, 1.5, 4);
  const totalEquity = totalAssets * seededRandom(hash + 4, 0.3, 0.7);
  const totalDebt = totalAssets - totalEquity - seededRandom(hash + 5, totalAssets * 0.1, totalAssets * 0.3);
  
  return {
    symbol,
    name: companyData.name,
    sector: companyData.sector, // Always English
    price,
    
    // Valuation Metrics
    marketCap,
    peRatio: seededRandom(hash + 8, 8, 35),
    pbRatio: seededRandom(hash + 9, 0.8, 4),
    pegRatio: seededRandom(hash + 10, 0.5, 3),
    priceToSales: seededRandom(hash + 11, 1, 8),
    enterpriseValue: marketCap + totalDebt,
    evToEbitda: seededRandom(hash + 12, 5, 20),
    
    // Financial Performance
    revenue,
    revenueGrowth: seededRandom(hash + 13, -5, 25),
    netIncome,
    netIncomeGrowth: seededRandom(hash + 14, -10, 30),
    operatingIncome: seededRandom(hash + 15, netIncome * 0.8, netIncome * 1.5),
    ebitda: seededRandom(hash + 16, netIncome * 1.2, netIncome * 2),
    freeCashFlow: seededRandom(hash + 17, netIncome * 0.7, netIncome * 1.3),
    freeCashFlowGrowth: seededRandom(hash + 18, -15, 25),
    
    // Profitability
    roe: (netIncome / totalEquity) * 100,
    roa: (netIncome / totalAssets) * 100,
    roic: seededRandom(hash + 19, 5, 25),
    nopat: seededRandom(hash + 34, netIncome * 0.8, netIncome * 1.1),
    grossMargin: seededRandom(hash + 20, 20, 60),
    operatingMargin: seededRandom(hash + 21, 5, 30),
    netMargin: (netIncome / revenue) * 100,
    
    // Financial Health
    currentRatio: seededRandom(hash + 22, 0.8, 3.5),
    quickRatio: seededRandom(hash + 23, 0.5, 2.5),
    debtToEquity: totalDebt / totalEquity,
    debtToAssets: totalDebt / totalAssets,
    interestCoverage: seededRandom(hash + 24, 2, 15),
    totalDebt,
    totalEquity,
    totalAssets,
    workingCapital: seededRandom(hash + 25, totalAssets * 0.1, totalAssets * 0.3),
    
    // Dividends & Returns
    dividendYield: seededRandom(hash + 26, 0, 5),
    dividendGrowthRate: seededRandom(hash + 27, -5, 15),
    payoutRatio: seededRandom(hash + 28, 0, 80),
    
    // Market Data
    beta: seededRandom(hash + 29, 0.5, 2),
    bookValuePerShare: totalEquity / seededRandom(hash + 30, 100, 1000),
    tangibleBookValue: seededRandom(hash + 35, totalEquity * 0.7, totalEquity * 0.95),
    cashPerShare: seededRandom(hash + 36, price * 0.05, price * 0.3),
    earningsPerShare: netIncome / seededRandom(hash + 31, 100, 1000),
    
    // Growth Metrics
    earningsGrowth5Y: seededRandom(hash + 32, -5, 20),
    revenueGrowth5Y: seededRandom(hash + 33, 0, 15),
    
    // Additional Balance Sheet Data
    currentAssets: seededRandom(hash + 37, totalAssets * 0.3, totalAssets * 0.6),
    currentLiabilities: seededRandom(hash + 38, totalAssets * 0.1, totalAssets * 0.3),
    inventory: seededRandom(hash + 39, totalAssets * 0.05, totalAssets * 0.2),
    sharesOutstanding: seededRandom(hash + 40, 100, 10000), // in millions
    
    // Additional Income Statement Data
    costOfGoodsSold: seededRandom(hash + 41, revenue * 0.4, revenue * 0.8),
    
    // Additional Dividend Data
    dividendsPerShare: seededRandom(hash + 42, 0, price * 0.1),
       lastYearDividendPayments: Math.round(seededRandom(hash + 43, 0, 12)),
    avg5YDividendPayments: seededRandom(hash + 44, 0, 12),
  };
};

export const getRealisticCompanyData = (symbol: string) => {
  // All sectors and industries in English
  const companyData: { [key: string]: { name: string; sector: string; industry: string; marketCap: number; price: number } } = {
    AAPL: { name: "Apple Inc.", sector: "Technology", industry: "Consumer Electronics", marketCap: 3000, price: 185 },
    MSFT: { name: "Microsoft Corporation", sector: "Technology", industry: "Software", marketCap: 2800, price: 375 },
    GOOGL: { name: "Alphabet Inc.", sector: "Technology", industry: "Internet Services", marketCap: 1700, price: 135 },
    AMZN: { name: "Amazon.com Inc.", sector: "Consumer Discretionary", industry: "E-commerce", marketCap: 1500, price: 145 },
    TSLA: { name: "Tesla Inc.", sector: "Consumer Discretionary", industry: "Electric Vehicles", marketCap: 800, price: 250 },
    META: { name: "Meta Platforms Inc.", sector: "Technology", industry: "Social Media", marketCap: 900, price: 350 },
    NVDA: { name: "NVIDIA Corporation", sector: "Technology", industry: "Semiconductors", marketCap: 1800, price: 450 },
    JPM: { name: "JPMorgan Chase & Co.", sector: "Financial Services", industry: "Banking", marketCap: 500, price: 170 },
    JNJ: { name: "Johnson & Johnson", sector: "Healthcare", industry: "Pharmaceuticals", marketCap: 450, price: 160 },
    V: { name: "Visa Inc.", sector: "Financial Services", industry: "Payment Processing", marketCap: 520, price: 250 },
    PG: { name: "Procter & Gamble Co.", sector: "Consumer Staples", industry: "Consumer Products", marketCap: 380, price: 155 },
    HD: { name: "The Home Depot Inc.", sector: "Consumer Discretionary", industry: "Home Improvement", marketCap: 400, price: 380 },
    UNH: { name: "UnitedHealth Group Inc.", sector: "Healthcare", industry: "Health Insurance", marketCap: 480, price: 510 },
    DIS: { name: "The Walt Disney Company", sector: "Communication Services", industry: "Entertainment", marketCap: 180, price: 100 },
    MA: { name: "Mastercard Inc.", sector: "Financial Services", industry: "Payment Processing", marketCap: 420, price: 420 },
    AMD: { name: "Advanced Micro Devices Inc.", sector: "Technology", industry: "Semiconductors", marketCap: 220, price: 140 },
    ADBE: { name: "Adobe Inc.", sector: "Technology", industry: "Software", marketCap: 240, price: 520 },
    AXP: { name: "American Express Co.", sector: "Financial Services", industry: "Credit Services", marketCap: 160, price: 210 },
    BA: { name: "Boeing Co.", sector: "Industrials", industry: "Aerospace & Defense", marketCap: 120, price: 200 },
    BAC: { name: "Bank of America Corp.", sector: "Financial Services", industry: "Banking", marketCap: 320, price: 40 },
    BABA: { name: "Alibaba Group Holding Ltd.", sector: "Consumer Discretionary", industry: "E-commerce", marketCap: 200, price: 80 },
    CRM: { name: "Salesforce Inc.", sector: "Technology", industry: "Software", marketCap: 260, price: 270 },
    CSCO: { name: "Cisco Systems Inc.", sector: "Technology", industry: "Networking Equipment", marketCap: 200, price: 50 },
    CAT: { name: "Caterpillar Inc.", sector: "Industrials", industry: "Construction Equipment", marketCap: 160, price: 300 }
  };
  
  return companyData[symbol] || { 
    name: `${symbol} Company`, 
    sector: "Technology", // Default English sector
    industry: "Software", // Default English industry
    marketCap: 100, 
    price: 100 
  };
};

const getCompanyName = (sym: string) => {
  return getRealisticCompanyData(sym).name;
};

const getSector = (sym: string) => {
  return getRealisticCompanyData(sym).sector;
};

export const getCompanyIndustry = (sym: string) => {
  return getRealisticCompanyData(sym).industry;
};
