
const EODHD_API_KEY = '6855637c111316.90524624';
const EODHD_BASE_URL = 'https://eodhd.com/api';

export interface EODHDCompany {
  Code: string;  // Changed from code to Code to match API
  Name: string;  // Changed from name to Name to match API
  Country: string;
  Exchange: string;
  Currency: string;
  Type: string;
  ISIN?: string;
}

export interface EODHDFundamentals {
  General?: {
    Code?: string;
    Name?: string;
    Exchange?: string;
    Currency?: string;
    Country?: string;
    Sector?: string;
    Industry?: string;
    MarketCapitalization?: number;
    SharesOutstanding?: number;
    ISIN?: string;
  };
  SharesStats?: {
    SharesOutstanding?: number;
  };
  SplitsDividends?: {
    ForwardAnnualDividendRate?: number;
    ForwardAnnualDividendYield?: number;
    PayoutRatio?: number;
  };
  Technicals?: {
    Beta?: number;
  };
  Highlights?: {
    MarketCapitalization?: number;
    EBITDA?: number;
    PERatio?: number;
    PEGRatio?: number;
    BookValue?: number;
    DividendShare?: number;
    DividendYield?: number;
    EarningsShare?: number;
    EPSEstimateCurrentYear?: number;
    EPSEstimateNextYear?: number;
    EPSEstimateNextQuarter?: number;
    EPSEstimateCurrentQuarter?: number;
    MostRecentQuarter?: string;
    ProfitMargin?: number;
    OperatingMarginTTM?: number;
    OperatingCashFlowTTM?: number;  // Added missing property
    GrossMargin?: number;  // Added missing property
    ReturnOnAssetsTTM?: number;
    ReturnOnEquityTTM?: number;
    RevenueTTM?: number;
    RevenuePerShareTTM?: number;
    QuarterlyRevenueGrowthYOY?: number;
    GrossProfitTTM?: number;
    DilutedEpsTTM?: number;
    QuarterlyEarningsGrowthYOY?: number;
  };
  Valuation?: {
    TrailingPE?: number;
    ForwardPE?: number;
    PriceSalesTTM?: number;
    PriceBookMRQ?: number;
    EnterpriseValue?: number;
    EnterpriseValueRevenue?: number;
    EnterpriseValueEbitda?: number;
  };
  Financials?: {
    Balance_Sheet?: {
      yearly?: Record<string, any>;
      quarterly?: Record<string, any>;
    };
    Cash_Flow?: {
      yearly?: Record<string, any>;
      quarterly?: Record<string, any>;
    };
    Income_Statement?: {
      yearly?: Record<string, any>;
      quarterly?: Record<string, any>;
    };
  };
}

export const fetchExchangeSymbols = async (exchange: string = 'US'): Promise<EODHDCompany[]> => {
  try {
    const response = await fetch(`${EODHD_BASE_URL}/exchange-symbol-list/${exchange}?api_token=${EODHD_API_KEY}&fmt=json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch symbols: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // console.error('Error fetching exchange symbols:', error);
    return [];
  }
};

export const fetchCompanyFundamentals = async (symbol: string): Promise<EODHDFundamentals | null> => {
  try {
    const response = await fetch(`${EODHD_BASE_URL}/fundamentals/${symbol}.US?api_token=${EODHD_API_KEY}&fmt=json`);
    if (!response.ok) {
      if (response.status === 404) {
        // Company not found, return null gracefully
        return null;
      }
      throw new Error(`Failed to fetch fundamentals: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('Error fetching company fundamentals:', error);
    return null;
  }
};

export const fetchRealTimePrice = async (symbol: string): Promise<number | null> => {
  try {
    const response = await fetch(`${EODHD_BASE_URL}/real-time/${symbol}.US?api_token=${EODHD_API_KEY}&fmt=json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch real-time price: ${response.status}`);
    }
    const data = await response.json();
    return data.close || data.previousClose || null;
  } catch (error) {
    // console.error('Error fetching real-time price:', error);
    return null;
  }
};
