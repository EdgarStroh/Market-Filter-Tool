// Alpha Vantage API service for financial data when EODHD is not available
const API_KEY = 'demo'; // Using demo key for now - limited requests

export interface AlphaVantageOverview {
  Symbol: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  "52WeekHigh": string;
  "52WeekLow": string;
  "50DayMovingAverage": string;
  "200DayMovingAverage": string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
}

export interface AlphaVantageCashFlow {
  symbol: string;
  annualReports: Array<{
    fiscalDateEnding: string;
    reportedCurrency: string;
    operatingCashflow: string;
    paymentsForOperatingActivities: string;
    proceedsFromOperatingActivities: string;
    changeInOperatingLiabilities: string;
    changeInOperatingAssets: string;
    depreciationDepletionAndAmortization: string;
    capitalExpenditures: string;
    changeInReceivables: string;
    changeInInventory: string;
    profitLoss: string;
    cashflowFromInvestment: string;
    cashflowFromFinancing: string;
    proceedsFromRepaymentsOfShortTermDebt: string;
    paymentsForRepurchaseOfCommonStock: string;
    paymentsForRepurchaseOfEquity: string;
    paymentsForRepurchaseOfPreferredStock: string;
    dividendPayout: string;
    dividendPayoutCommonStock: string;
    dividendPayoutPreferredStock: string;
    proceedsFromIssuanceOfCommonStock: string;
    proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: string;
    proceedsFromIssuanceOfPreferredStock: string;
    proceedsFromRepurchaseOfEquity: string;
    proceedsFromSaleOfTreasuryStock: string;
    changeInCashAndCashEquivalents: string;
    changeInExchangeRate: string;
    netIncome: string;
  }>;
  quarterlyReports: Array<{
    fiscalDateEnding: string;
    reportedCurrency: string;
    operatingCashflow: string;
    paymentsForOperatingActivities: string;
    proceedsFromOperatingActivities: string;
    changeInOperatingLiabilities: string;
    changeInOperatingAssets: string;
    depreciationDepletionAndAmortization: string;
    capitalExpenditures: string;
    changeInReceivables: string;
    changeInInventory: string;
    profitLoss: string;
    cashflowFromInvestment: string;
    cashflowFromFinancing: string;
    proceedsFromRepaymentsOfShortTermDebt: string;
    paymentsForRepurchaseOfCommonStock: string;
    paymentsForRepurchaseOfEquity: string;
    paymentsForRepurchaseOfPreferredStock: string;
    dividendPayout: string;
    dividendPayoutCommonStock: string;
    dividendPayoutPreferredStock: string;
    proceedsFromIssuanceOfCommonStock: string;
    proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: string;
    proceedsFromIssuanceOfPreferredStock: string;
    proceedsFromRepurchaseOfEquity: string;
    proceedsFromSaleOfTreasuryStock: string;
    changeInCashAndCashEquivalents: string;
    changeInExchangeRate: string;
    netIncome: string;
  }>;
}

// Fetch company overview data
export const fetchAlphaVantageOverview = async (symbol: string): Promise<AlphaVantageOverview | null> => {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API limit or error responses
    if (data.Note || data.Information || !data.Symbol) {
      console.warn(`Alpha Vantage API issue for ${symbol}:`, data);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching Alpha Vantage overview for ${symbol}:`, error);
    return null;
  }
};

// Fetch cash flow data
export const fetchAlphaVantageCashFlow = async (symbol: string): Promise<AlphaVantageCashFlow | null> => {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API limit or error responses
    if (data.Note || data.Information || !data.symbol) {
      console.warn(`Alpha Vantage cash flow API issue for ${symbol}:`, data);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching Alpha Vantage cash flow for ${symbol}:`, error);
    return null;
  }
};

// Parse string to number, handling null/undefined and 'None'
const parseValue = (value: string | null | undefined): number | null => {
  if (!value || value === 'None' || value === '-' || value === 'null') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Calculate Free Cash Flow CAGR using Alpha Vantage data
export const calculateFreeCashFlowCAGRFromAV = (cashFlowData: AlphaVantageCashFlow): number | null => {
  const annualReports = cashFlowData.annualReports;
  if (!annualReports || annualReports.length < 2) return null;

  // Sort by date (most recent first)
  const sortedReports = [...annualReports].sort((a, b) => 
    new Date(b.fiscalDateEnding).getTime() - new Date(a.fiscalDateEnding).getTime()
  );

  // Calculate Free Cash Flow = Operating Cash Flow - Capital Expenditures
  const cashFlowsWithFCF = sortedReports.map(report => {
    const operatingCF = parseValue(report.operatingCashflow);
    const capex = parseValue(report.capitalExpenditures);
    
    if (operatingCF === null || capex === null) return null;
    
    return {
      date: report.fiscalDateEnding,
      freeCashFlow: operatingCF - Math.abs(capex) // capex is usually negative, so we subtract absolute value
    };
  }).filter(item => item !== null);

  if (cashFlowsWithFCF.length < 2) return null;

  // Get earliest and latest entries
  const latestEntry = cashFlowsWithFCF[0]; // Most recent
  const earliestEntry = cashFlowsWithFCF[cashFlowsWithFCF.length - 1]; // Oldest

  const startValue = earliestEntry!.freeCashFlow;
  const endValue = latestEntry!.freeCashFlow;

  if (startValue <= 0 || endValue <= 0) return null;

  const startYear = new Date(earliestEntry!.date).getFullYear();
  const endYear = new Date(latestEntry!.date).getFullYear();
  const years = endYear - startYear;

  if (years <= 0) return null;

  // User's CAGR formula: (end_value / start_value) ** (1 / years) - 1
  const cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  return cagr;
};