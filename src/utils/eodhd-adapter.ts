
import { StockData } from "@/types/StockData";
import { EODHDFundamentals } from "@/services/eodhd";

// Helper functions for safe parsing
const parse = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Helper function to get the latest entry from yearly data
const getLatestEntry = (data: Record<string, any>) => {
  if (!data) return null;
  const years = Object.keys(data).sort().reverse();
  return years.length > 0 ? data[years[0]] : null;
};

// Helper function to get the latest quarterly value
const getLatestQuarterlyValue = (data: any, field: string): number | null => {
  if (!data?.quarterly) return null;
  const quarters = Object.keys(data.quarterly).sort().reverse();
  if (quarters.length === 0) return null;
  const latestQuarter = data.quarterly[quarters[0]];
  return parse(latestQuarter[field]);
};

// Calculate Tangible Book Value
const calculateTangibleBookValue = (fundamentals: EODHDFundamentals): number | null => {
  const balanceSheet = fundamentals.Financials?.Balance_Sheet?.yearly;
  const latestBS = getLatestEntry(balanceSheet);
  if (!latestBS) return null;

  const totalEquity = parse(latestBS.totalStockholderEquity) || parse(latestBS.commonStockTotalEquity);
  const goodwill = parse(latestBS.goodWill) || 0;
  const intangibles = parse(latestBS.intangibleAssets) || 0;
  
  if (!totalEquity) return null;
  return (totalEquity - goodwill - intangibles) / 1000000000; // Convert to billions
};

// Calculate Cash per Share
const calculateCashPerShare = (fundamentals: EODHDFundamentals): number | null => {
  const balanceSheet = fundamentals.Financials?.Balance_Sheet?.yearly;
  const latestBS = getLatestEntry(balanceSheet);
  if (!latestBS) return null;

  // Cash calculation (including short-term investments)
  const cash = parse(latestBS.cash) || parse(latestBS.cashAndEquivalents) || 0;
  const shortTermInvestments = parse(latestBS.shortTermInvestments) || 0;
  const totalCash = cash + shortTermInvestments;

  // Shares Outstanding from balance sheet
  let sharesOutstanding = parse(latestBS.commonStockSharesOutstanding) || 0;

  // Convert if given in millions (common for older data)
  if (sharesOutstanding > 0 && sharesOutstanding < 1000) {
    sharesOutstanding *= 1000000;
  }

  if (!sharesOutstanding || !totalCash) return null;
  return totalCash / sharesOutstanding;
};

const calculateCAGR = (data: Record<string, any>, key: string, period: number = 10): number | null => {
  const entries = Object.entries(data);
  if (entries.length < 2) return null;

  const sorted = entries.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
  const startIndex = Math.max(0, sorted.length - period);
  const startEntry = sorted[startIndex];
  const endEntry = sorted[sorted.length - 1];
  
  const startValue = parse(startEntry[1][key]);
  const endValue = parse(endEntry[1][key]);
  
  if (!startValue || startValue <= 0 || !endValue) return null;
  
  const startYear = new Date(startEntry[0]).getFullYear();
  const endYear = new Date(endEntry[0]).getFullYear();
  const years = endYear - startYear;
  
  if (years <= 0) return null;
  
  const cagr = (Math.pow(endValue / startValue, 1/years) - 1) * 100;
  return cagr;
};

// Calculate EPS CAGR for PEG ratio calculations
const calculateEPSCAGR = (fundamentals: EODHDFundamentals, period: number = 5): number | null => {
  const incomeStatement = fundamentals.Financials?.Income_Statement?.yearly;
  if (!incomeStatement) return null;

  return calculateCAGR(incomeStatement, 'eps', period);
};

// Get the best available earnings growth rate for PEG calculation
const getBestEarningsGrowth = (fundamentals: EODHDFundamentals): number | null => {
  const highlights = fundamentals.Highlights || {};
  
  // Priority 1: Forward looking EPS estimates (annualized growth from current to next year)
  const currentYearEPS = parse(highlights.EPSEstimateCurrentYear);
  const nextYearEPS = parse(highlights.EPSEstimateNextYear);
  if (currentYearEPS && nextYearEPS && currentYearEPS !== 0) {
    const forwardGrowth = ((nextYearEPS - currentYearEPS) / Math.abs(currentYearEPS)) * 100;
    // Allow negative growth but cap extreme values
    if (forwardGrowth >= -100 && forwardGrowth <= 100) {
      
      return forwardGrowth;
    }
  }
  
  // Priority 2: Quarterly earnings growth YoY (convert if needed)
  const quarterlyGrowth = parse(highlights.QuarterlyEarningsGrowthYOY);
  if (quarterlyGrowth !== null && quarterlyGrowth >= -1 && quarterlyGrowth <= 1) {
    const annualizedGrowth = quarterlyGrowth * 100; // Convert decimal to percentage
    
    return annualizedGrowth;
  }
  
  // Priority 3: EPS CAGR (5-year)
  const epsCAGR = calculateEPSCAGR(fundamentals, 5);
  if (epsCAGR !== null && epsCAGR >= -100 && epsCAGR <= 100) {
    
    return epsCAGR;
  }
  
  // Priority 4: EPS CAGR (3-year)
  const epsCAGR3Y = calculateEPSCAGR(fundamentals, 3);
  if (epsCAGR3Y !== null && epsCAGR3Y >= -100 && epsCAGR3Y <= 100) {
    
    return epsCAGR3Y;
  }
  
  
  return null;
};

export const convertEODHDToStockData = (symbol: string, fundamentals: EODHDFundamentals, price?: number): StockData => {
  // Basic company information
  const general = fundamentals.General || {};
  const highlights = fundamentals.Highlights || {};
  const valuation = fundamentals.Valuation || {};
  
  // Financial data
  const financials = fundamentals.Financials || {};
  const balanceSheet = financials.Balance_Sheet || {};
  const incomeStatement = financials.Income_Statement || {};
  const cashFlow = financials.Cash_Flow || {};
  
  // Use yearly data, fallback to quarterly if yearly not available
  const bsYearly = balanceSheet.yearly || balanceSheet.quarterly || {};
  const fYearly = incomeStatement.yearly || incomeStatement.quarterly || {};
  const cfYearly = cashFlow.yearly || cashFlow.quarterly || {};
  
  // Latest financial statements - with null safety
  const latestBS = getLatestEntry(bsYearly) || {};
  const latestIncome = getLatestEntry(fYearly) || {};
  const latestCF = getLatestEntry(cfYearly) || {};
  
  // Balance sheet items - all with null safety
  const totalEquity = parse(latestBS?.totalStockholderEquity) || parse(latestBS?.commonStockTotalEquity);
  const totalAssets = parse(latestBS?.totalAssets);
  const totalCurrentAssets = parse(latestBS?.totalCurrentAssets);
  const totalCurrentLiabilities = parse(latestBS?.totalCurrentLiabilities);
  const shortTermDebt = parse(latestBS?.shortTermDebt) || parse(latestBS?.shortLongTermDebt);
  const longTermDebt = parse(latestBS?.longTermDebt) || parse(latestBS?.longTermDebtTotal);
  const cash = parse(latestBS?.cash) || parse(latestBS?.cashAndEquivalents);
  const shortTermInvestments = parse(latestBS?.shortTermInvestments) || parse(latestBS?.cashAndShortTermInvestments);
  
  // Income statement items - all with null safety
  const netIncome = parse(latestIncome?.netIncome) || parse(latestIncome?.netIncomeFromContinuingOperations);
  const revenue = parse(latestIncome?.totalRevenue);
  const grossProfit = parse(latestIncome?.grossProfit);
  const operatingIncome = parse(latestIncome?.operatingIncome);
  const ebit = parse(latestIncome?.ebit) || operatingIncome;
  const interestExpense = parse(latestIncome?.interestExpense);
  
  // Cash flow items - with null safety
  const operatingCashFlow = parse(latestCF?.operatingCashFlow) || 
                           parse(latestCF?.cashFlowFromOperations) || 
                           parse(latestCF?.totalCashFromOperatingActivities);
  const capex = parse(latestCF?.capitalExpenditures) || parse(latestCF?.capitalExpenditure);
  
  // Calculated values
  const totalDebt = (shortTermDebt || 0) + (longTermDebt || 0);
  const totalCash = (cash || 0) + (shortTermInvestments || 0);
  const workingCapital = totalCurrentAssets && totalCurrentLiabilities ? 
                        (totalCurrentAssets - totalCurrentLiabilities) / 1000000000 : null;
  
  // Free Cash Flow calculation
  const freeCashFlow = operatingCashFlow && capex ? 
                      operatingCashFlow - Math.abs(capex) : null;
  
  // Market data from API
  const marketCap = parse(highlights.MarketCapitalization) || parse(general.MarketCapitalization);
  const currentPrice = price || parse(highlights.EarningsShare) || 0;
  
  // Growth calculations
  const netIncomeCAGR = calculateCAGR(fYearly, 'netIncome', 10);
  const revenueCAGR = calculateCAGR(fYearly, 'totalRevenue', 10);
  
  // ROIC calculation using your improved logic
  let roicCalculated = null;
  let nopatCalculated = null;
  let investedCapital = null;
  let avgInvestedCapital = null;
  
  try {
    // Get goodwill and intangibles with null safety
    const goodwill = parse(latestBS?.goodWill) || 0;
    const intangibles = parse(latestBS?.intangibleAssets) || 0;
    const netWorkingCapital = workingCapital ? workingCapital * 1000000000 : 0; // Convert back to original units
    
    // 1. Current year invested capital
    const nonOpCash = totalCash * 0.7; // 70% rule
    investedCapital = totalEquity + totalDebt - nonOpCash + goodwill + intangibles + netWorkingCapital;
    
    // 2. Get previous year data
    const getPreviousYearEntry = (data: Record<string, any>) => {
      const entries = Object.entries(data);
      if (entries.length < 2) return null;
      const sorted = entries.sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
      return sorted[1][1]; // Second most recent
    };
    
    const prevBS = getPreviousYearEntry(bsYearly);
    if (prevBS) {
      // 3. Previous year components (identical logic) - with null safety
      const prevTotalEquity = parse(prevBS?.totalStockholderEquity) || parse(prevBS?.commonStockTotalEquity) || 0;
      const prevShortTermDebt = parse(prevBS?.shortTermDebt) || parse(prevBS?.shortLongTermDebt) || 0;
      const prevLongTermDebt = parse(prevBS?.longTermDebt) || parse(prevBS?.longTermDebtTotal) || 0;
      const prevTotalDebt = prevShortTermDebt + prevLongTermDebt;
      const prevCash = parse(prevBS?.cash) || parse(prevBS?.cashAndEquivalents) || 0;
      const prevShortTermInvestments = parse(prevBS?.shortTermInvestments) || parse(prevBS?.cashAndShortTermInvestments) || 0;
      const prevTotalCash = prevCash + prevShortTermInvestments;
      const prevNonOpCash = prevTotalCash * 0.7; // 70% rule
      const prevCurrentAssets = parse(prevBS?.totalCurrentAssets) || 0;
      const prevCurrentLiabilities = parse(prevBS?.totalCurrentLiabilities) || 0;
      const prevNetWorkingCapital = prevCurrentAssets - prevCurrentLiabilities;
      const prevGoodwill = parse(prevBS?.goodWill) || 0;
      const prevIntangibles = parse(prevBS?.intangibleAssets) || 0;
      
      // 4. Previous year invested capital
      const prevInvestedCapital = prevTotalEquity + prevTotalDebt - prevNonOpCash + prevGoodwill + prevIntangibles + prevNetWorkingCapital;
      
      // 5. Average invested capital
      avgInvestedCapital = (investedCapital + prevInvestedCapital) / 2;
    } else {
      avgInvestedCapital = investedCapital;
    }
    
    // 6. NOPAT calculation using effective tax rate
    const effectiveTaxRate = 0.21; // Standard 21% corporate tax rate
    nopatCalculated = ebit ? ebit * (1 - effectiveTaxRate) : null;
    
    // 7. ROIC = NOPAT / Average Invested Capital
    if (nopatCalculated && avgInvestedCapital && avgInvestedCapital > 0) {
      roicCalculated = (nopatCalculated / avgInvestedCapital) * 100;
    }
  } catch (error) {
    roicCalculated = null;
    nopatCalculated = null;
  }

  // Beta from Technicals section
  const technicals = fundamentals.Technicals || {};
  const beta = parse(technicals.Beta);

  // PEG Ratio calculation with improved growth rate selection
  const peRatio = parse(highlights.PERatio) || parse(valuation.TrailingPE);
  const bestEarningsGrowth = getBestEarningsGrowth(fundamentals);
  
  let pegRatioCalculated = null;
  if (peRatio && peRatio > 0 && bestEarningsGrowth !== null) {
    // Allow calculation even with negative growth
    if (bestEarningsGrowth !== 0) {
      pegRatioCalculated = peRatio / bestEarningsGrowth;
      
      
      // Cap extreme values but allow negative PEG
      if (pegRatioCalculated > 50) {
        pegRatioCalculated = 50;
      } else if (pegRatioCalculated < -50) {
        pegRatioCalculated = -50;
      }
    }
  } else {
    // Fallback to API PEG ratio only if our calculation isn't possible
    pegRatioCalculated = parse(highlights.PEGRatio);
    // Still validate and cap the API value if it's unrealistic
    if (pegRatioCalculated && (pegRatioCalculated > 50 || pegRatioCalculated < -50)) {
      pegRatioCalculated = pegRatioCalculated > 50 ? 50 : (pegRatioCalculated < -50 ? -50 : pegRatioCalculated);
    }
  }

  // Ratios and margins - only calculate if we have the required data
  const roe = netIncome && totalEquity ? (netIncome / totalEquity) * 100 : null;
  const roa = netIncome && totalAssets ? (netIncome / totalAssets) * 100 : null;
  const grossMargin = grossProfit && revenue ? (grossProfit / revenue) * 100 : null;
  const netMargin = netIncome && revenue ? (netIncome / revenue) * 100 : null;
  const currentRatio = totalCurrentAssets && totalCurrentLiabilities ? 
                      totalCurrentAssets / totalCurrentLiabilities : null;
  const quickRatio = currentRatio; // Simplified - would need more detailed calculation
  const debtToEquity = totalDebt && totalEquity ? totalDebt / totalEquity : null;
  const debtToAssets = totalDebt && totalAssets ? totalDebt / totalAssets : null;
  const interestCoverage = ebit && interestExpense && interestExpense > 0 ? 
                          ebit / interestExpense : null;
  
  // Dividend calculations
  const dividendPerShare = parse(highlights.DividendShare);
  const earningsPerShare = parse(highlights.EarningsShare);
  const payoutRatio = dividendPerShare && earningsPerShare && earningsPerShare > 0 ? 
                     (dividendPerShare / earningsPerShare) * 100 : null;

  return {
    symbol: general.Code || symbol,
    name: general.Name || `${symbol} Company`,
    sector: general.Sector || "Unknown",
    industry: general.Industry,
    isin: general.ISIN,
    price: currentPrice,
    
    // Valuation Metrics
    marketCap: marketCap ? marketCap / 1000000000 : null,
    peRatio: peRatio,
    pbRatio: parse(valuation.PriceBookMRQ),
    pegRatio: pegRatioCalculated,
    priceToSales: parse(valuation.PriceSalesTTM),
    enterpriseValue: parse(valuation.EnterpriseValue) ? parse(valuation.EnterpriseValue)! / 1000000000 : null,
    evToEbitda: parse(valuation.EnterpriseValueEbitda),
    
    // Financial Performance
    revenue: revenue ? revenue / 1000000000 : null,
    revenueGrowth: parse(highlights.QuarterlyRevenueGrowthYOY) ? 
                   parse(highlights.QuarterlyRevenueGrowthYOY)! * 100 : null,
    netIncome: netIncome ? netIncome / 1000000000 : null,
    netIncomeGrowth: parse(highlights.QuarterlyEarningsGrowthYOY) ? 
                     parse(highlights.QuarterlyEarningsGrowthYOY)! * 100 : null,
    operatingIncome: operatingIncome ? operatingIncome / 1000000000 : null,
    ebitda: parse(highlights.EBITDA) ? parse(highlights.EBITDA)! / 1000000000 : null,
    freeCashFlow: freeCashFlow ? freeCashFlow / 1000000000 : null,
    freeCashFlowGrowth: null, // Would need historical FCF data
    
    // Profitability
    roe: roe,
    roa: roa,
    roic: roicCalculated,
    nopat: nopatCalculated ? nopatCalculated / 1000000000 : null, // Convert to billions
    grossMargin: grossMargin,
    operatingMargin: parse(highlights.OperatingMarginTTM) ? 
                    parse(highlights.OperatingMarginTTM)! * 100 : null,
    netMargin: parse(highlights.ProfitMargin) ? 
              parse(highlights.ProfitMargin)! * 100 : netMargin,
    
    // Financial Health
    currentRatio: currentRatio,
    quickRatio: quickRatio,
    debtToEquity: debtToEquity,
    debtToAssets: debtToAssets,
    interestCoverage: interestCoverage,
    totalDebt: totalDebt ? totalDebt / 1000000000 : null,
    totalEquity: totalEquity ? totalEquity / 1000000000 : null,
    totalAssets: totalAssets ? totalAssets / 1000000000 : null,
    workingCapital: workingCapital,
    
    // Dividends & Returns
    dividendYield: parse(fundamentals.SplitsDividends?.ForwardAnnualDividendYield) ? 
                  parse(fundamentals.SplitsDividends?.ForwardAnnualDividendYield)! * 100 : 
                  (parse(highlights.DividendYield) ? parse(highlights.DividendYield)! * 100 : 0),
    dividendGrowthRate: null, // Would need historical dividend data
    payoutRatio: payoutRatio,
    
    // Market Data  
    beta: beta,
    bookValuePerShare: parse(highlights.BookValue),
    tangibleBookValue: calculateTangibleBookValue(fundamentals),
    cashPerShare: calculateCashPerShare(fundamentals),
    earningsPerShare: earningsPerShare,
    
    // Growth Metrics
    earningsGrowth5Y: netIncomeCAGR,
    revenueGrowth5Y: revenueCAGR,
    
    // Additional Balance Sheet Data
    currentAssets: totalCurrentAssets ? totalCurrentAssets / 1000000000 : null,
    currentLiabilities: totalCurrentLiabilities ? totalCurrentLiabilities / 1000000000 : null,
    inventory: getLatestQuarterlyValue(fundamentals.Financials?.Balance_Sheet, 'inventory') 
      ? getLatestQuarterlyValue(fundamentals.Financials?.Balance_Sheet, 'inventory')! / 1000000000 
      : null,
    sharesOutstanding: parse(fundamentals.SharesStats?.SharesOutstanding) || parse(fundamentals.General?.SharesOutstanding) || null,
    
    // Additional Income Statement Data
    costOfGoodsSold: getLatestQuarterlyValue(fundamentals.Financials?.Income_Statement, 'costOfRevenue') 
      ? getLatestQuarterlyValue(fundamentals.Financials?.Income_Statement, 'costOfRevenue')! / 1000000000 
      : null,
    
    // Additional Dividend Data
    dividendsPerShare: parse(fundamentals.SplitsDividends?.ForwardAnnualDividendRate) || null,
  };
};
