
import { StockData } from "@/types/StockData";

// Warren Buffett Strategy: Focus on quality companies with strong moats
export const calculateBuffettScore = (data: StockData): number => {
  let score = 0;
  
  // High ROE (above 15% is excellent)
  if (data.roe > 20) score += 25;
  else if (data.roe > 15) score += 20;
  else if (data.roe > 10) score += 10;
  
  // Low debt-to-equity (financial stability)
  if (data.debtToEquity < 0.3) score += 20;
  else if (data.debtToEquity < 0.6) score += 15;
  else if (data.debtToEquity < 1) score += 10;
  
  // Consistent earnings growth
  if (data.earningsGrowth5Y > 10) score += 15;
  else if (data.earningsGrowth5Y > 5) score += 10;
  
  // Strong margins
  if (data.netMargin > 15) score += 15;
  else if (data.netMargin > 10) score += 10;
  
  // Reasonable valuation
  if (data.peRatio < 20) score += 15;
  else if (data.peRatio < 25) score += 10;
  else if (data.peRatio < 30) score += 5;
  
  // Strong free cash flow
  if (data.freeCashFlow > data.netIncome * 0.8) score += 10;
  
  return Math.min(score, 100);
};

// Benjamin Graham Strategy: Deep value investing with margin of safety
export const calculateGrahamScore = (data: StockData): number => {
  let score = 0;
  
  // Low P/E ratio
  if (data.peRatio && data.peRatio < 10) score += 15;
  else if (data.peRatio && data.peRatio < 15) score += 12;
  else if (data.peRatio && data.peRatio < 20) score += 8;
  
  // Low P/B ratio (trading below book value is ideal)
  if (data.pbRatio && data.pbRatio < 1) score += 15;
  else if (data.pbRatio && data.pbRatio < 1.5) score += 12;
  else if (data.pbRatio && data.pbRatio < 2.5) score += 8;
  
  // Strong current ratio (liquidity)
  if (data.currentRatio && data.currentRatio > 2) score += 12;
  else if (data.currentRatio && data.currentRatio > 1.5) score += 10;
  else if (data.currentRatio && data.currentRatio > 1.2) score += 6;
  
  // Low debt-to-assets
  if (data.debtToAssets && data.debtToAssets < 0.3) score += 8;
  else if (data.debtToAssets && data.debtToAssets < 0.5) score += 6;
  
  // Cash per Share (Graham liked cash-rich companies)
  if (data.cashPerShare && data.cashPerShare > data.price * 0.1) score += 12;
  else if (data.cashPerShare && data.cashPerShare > data.price * 0.05) score += 8;
  
  // Book Value per Share (Net-Net Working Capital approach)
  if (data.bookValuePerShare && data.bookValuePerShare > data.price) score += 10;
  else if (data.bookValuePerShare && data.bookValuePerShare > data.price * 0.8) score += 6;
  
  // Graham Number calculation: √(22.5 × EPS × Book Value per Share)
  if (data.earningsPerShare && data.bookValuePerShare && data.earningsPerShare > 0 && data.bookValuePerShare > 0) {
    const grahamNumber = Math.sqrt(22.5 * data.earningsPerShare * data.bookValuePerShare);
    if (data.price && data.price <= grahamNumber) {
      score += 20; // Trading below Graham Number is ideal
    } else if (data.price && data.price <= grahamNumber * 1.2) {
      score += 12;
    } else if (data.price && data.price <= grahamNumber * 1.5) {
      score += 6;
    }
  }
  
  // Positive earnings growth
  if (data.earningsGrowth5Y && data.earningsGrowth5Y > 0) score += 8;
  
  return Math.min(score, 100);
};

// Peter Lynch Strategy: Growth at reasonable price (GARP)
export const calculateLynchScore = (data: StockData): number => {
  let score = 0;
  
  // PEG ratio (PE to growth ratio)
  if (data.pegRatio) {
    if (data.pegRatio < 0.5) score += 25;
    else if (data.pegRatio < 1) score += 20;
    else if (data.pegRatio < 1.5) score += 12;
    else if (data.pegRatio < 2) score += 8;
  }
  
  // Strong earnings growth
  if (data.earningsGrowth5Y && data.earningsGrowth5Y > 20) score += 20;
  else if (data.earningsGrowth5Y && data.earningsGrowth5Y > 15) score += 16;
  else if (data.earningsGrowth5Y && data.earningsGrowth5Y > 10) score += 12;
  
  // Strong ROE
  if (data.roe && data.roe > 20) score += 16;
  else if (data.roe && data.roe > 15) score += 12;
  else if (data.roe && data.roe > 10) score += 8;
  
  // Reasonable debt levels
  if (data.debtToEquity && data.debtToEquity < 0.5) score += 12;
  else if (data.debtToEquity && data.debtToEquity < 1) score += 8;
  
  // Strong revenue growth
  if (data.revenueGrowth5Y && data.revenueGrowth5Y > 10) score += 8;
  
  // Inventory Turnover = Cost of Goods Sold / Average Inventory
  if (data.costOfGoodsSold && data.inventory && data.inventory > 0) {
    const inventoryTurnover = data.costOfGoodsSold / data.inventory;
    if (inventoryTurnover >= 12) score += 15; // Monthly turnover - excellent
    else if (inventoryTurnover >= 6) score += 12; // Bi-monthly - good
    else if (inventoryTurnover >= 4) score += 8; // Quarterly - adequate
    else if (inventoryTurnover >= 2) score += 4; // Semi-annual - poor
  }
  
  return Math.min(score, 100);
};

// Joel Greenblatt Magic Formula: High ROIC + High Earnings Yield
export const calculateGreenblattScore = (data: StockData): number => {
  let score = 0;
  
  // High ROIC (Return on Invested Capital)
  if (data.roic > 25) score += 35;
  else if (data.roic > 20) score += 30;
  else if (data.roic > 15) score += 25;
  else if (data.roic > 10) score += 15;
  
  // High Earnings Yield (inverse of P/E)
  const earningsYield = (1 / data.peRatio) * 100;
  if (earningsYield > 15) score += 35;
  else if (earningsYield > 10) score += 30;
  else if (earningsYield > 7) score += 25;
  else if (earningsYield > 5) score += 15;
  
  // Low EV/EBITDA
  if (data.evToEbitda < 8) score += 20;
  else if (data.evToEbitda < 12) score += 15;
  else if (data.evToEbitda < 15) score += 10;
  
  // Positive free cash flow
  if (data.freeCashFlow > 0) score += 10;
  
  return Math.min(score, 100);
};

// John Templeton Strategy: Contrarian value investing in depressed markets
export const calculateTempletonScore = (data: StockData): number => {
  let score = 0;
  
  // Very low P/E (contrarian approach)
  if (data.peRatio && data.peRatio < 8) score += 20;
  else if (data.peRatio && data.peRatio < 12) score += 16;
  else if (data.peRatio && data.peRatio < 15) score += 10;
  
  // Low P/B ratio
  if (data.pbRatio && data.pbRatio < 0.8) score += 16;
  else if (data.pbRatio && data.pbRatio < 1.2) score += 12;
  else if (data.pbRatio && data.pbRatio < 1.8) score += 8;
  
  // High dividend yield (income focus)
  if (data.dividendYield && data.dividendYield > 4) score += 16;
  else if (data.dividendYield && data.dividendYield > 3) score += 12;
  else if (data.dividendYield && data.dividendYield > 2) score += 8;
  
  // Dividend Coverage Ratio = Earnings per Share / Dividends per Share
  if (data.earningsPerShare && data.dividendsPerShare && data.dividendsPerShare > 0) {
    const dividendCoverage = data.earningsPerShare / data.dividendsPerShare;
    if (dividendCoverage >= 3) score += 16; // Very safe
    else if (dividendCoverage >= 2) score += 12; // Safe
    else if (dividendCoverage >= 1.5) score += 8; // Adequate
    else if (dividendCoverage >= 1) score += 4; // Risky
  }
  
  // Cash per Share (Templeton liked financially strong companies)
  if (data.cashPerShare && data.cashPerShare > data.price * 0.15) score += 10;
  else if (data.cashPerShare && data.cashPerShare > data.price * 0.1) score += 6;
  
  // Tangible Book Value (real asset backing)
  if (data.tangibleBookValue && data.tangibleBookValue > 0) score += 6;
  
  // Financial stability
  if (data.currentRatio && data.debtToEquity && data.currentRatio > 1.5 && data.debtToEquity < 0.6) score += 8;
  else if (data.currentRatio && data.debtToEquity && data.currentRatio > 1.2 && data.debtToEquity < 1) score += 6;
  
  // Strong operating margins despite low valuation
  if (data.operatingMargin && data.operatingMargin > 10) score += 4;
  
  return Math.min(score, 100);
};

// Howard Marks Strategy: Risk-adjusted returns with margin of safety
export const calculateMarksScore = (data: StockData): number => {
  let score = 0;
  
  // Low risk profile (debt management)
  if (data.debtToEquity < 0.2) score += 25;
  else if (data.debtToEquity < 0.4) score += 20;
  else if (data.debtToEquity < 0.7) score += 15;
  
  // High interest coverage (ability to service debt)
  if (data.interestCoverage > 10) score += 20;
  else if (data.interestCoverage > 5) score += 15;
  else if (data.interestCoverage > 3) score += 10;
  
  // Quality metrics (ROE and ROA)
  if (data.roe > 15 && data.roa > 8) score += 25;
  else if (data.roe > 12 && data.roa > 6) score += 20;
  else if (data.roe > 10 && data.roa > 4) score += 15;
  
  // Reasonable valuation with quality
  if (data.peRatio < 18 && data.pbRatio < 2.5) score += 20;
  else if (data.peRatio < 22 && data.pbRatio < 3) score += 15;
  
  // Strong cash generation
  if (data.freeCashFlow > data.netIncome * 0.9) score += 10;
  
  return Math.min(score, 100);
};

// =====================================
// FUNDAMENTAL HEALTH CHECK
// =====================================

// Determine if a company is fundamentally healthy
const isFundamentallyHealthy = (data: StockData): boolean => {
  // A company is healthy if ANY of these conditions are met:
  // 1. Positive net income
  // 2. Positive free cash flow  
  // 3. Operating margin better than -10% (some growth companies have temporary losses)
  
  const hasPositiveNetIncome = data.netIncome !== null && data.netIncome > 0;
  const hasPositiveFreeCashFlow = data.freeCashFlow !== null && data.freeCashFlow > 0;
  const hasReasonableOperatingMargin = data.operatingMargin !== null && data.operatingMargin > -10;
  
  return hasPositiveNetIncome || hasPositiveFreeCashFlow || hasReasonableOperatingMargin;
};

// =====================================
// PRICE-BASED FAIR VALUE CALCULATIONS
// =====================================

// Conservative maximum upside calculation for unhealthy companies
const calculateDynamicMaxUpside = (data: StockData): number => {
  const isHealthy = isFundamentallyHealthy(data);
  
  // Unhealthy companies get severely limited upside potential
  if (!isHealthy) {
    return 2.0; // Maximum 200% upside (3x current price) for loss-making companies
  }
  
  // Healthy companies get normal dynamic calculations
  let maxUpsidePercent = 1000; // Base 1000% (10x) for standard companies
  
  // Market Cap tiers (higher risk/reward for smaller companies)
  const marketCapB = data.marketCap || 0.1; // Default to small if missing
  if (marketCapB < 0.05) maxUpsidePercent = 2000; // <$50M: 2000% (20x) - reduced from 5000%
  else if (marketCapB < 0.5) maxUpsidePercent = 1500; // $50M-$500M: 1500% (15x) - reduced from 3000%
  else if (marketCapB < 5) maxUpsidePercent = 1200; // $500M-$5B: 1200% (12x) - reduced from 2000%
  else maxUpsidePercent = 1000; // >$5B: 1000% (10x)
  
  // P/E Ratio adjustments (only for healthy, profitable companies)
  if (data.peRatio && data.peRatio > 0 && data.netIncome && data.netIncome > 0) {
    if (data.peRatio < 5.0) maxUpsidePercent += 300; // +300% bonus for very low P/E on profitable companies
    else if (data.peRatio < 10.0) maxUpsidePercent += 150; // +150% bonus for low P/E
    else if (data.peRatio > 30.0) maxUpsidePercent *= 0.7; // -30% reduction for high P/E
  }
  
  // Beta adjustments (reduced impact)
  if (data.beta !== undefined && data.beta !== null) {
    if (Math.abs(data.beta) > 2.0) maxUpsidePercent += 200; // +200% for high volatility (reduced from 500%)
    else if (Math.abs(data.beta) < 0.5) maxUpsidePercent *= 0.9; // -10% for low volatility (reduced from -25%)
  }
  
  // Cap at reasonable maximum (25x = 2400%)
  maxUpsidePercent = Math.min(maxUpsidePercent, 2400);
  
  return maxUpsidePercent / 100; // Convert to multiplier
};

// Helper function to apply sanity checks to fair values with dynamic limits
const applySanityChecks = (fairValue: number, currentPrice: number, data: StockData): number => {
  // Dynamic maximum upside based on company health and characteristics
  const maxMultiplier = calculateDynamicMaxUpside(data);
  const maxFairValue = currentPrice * maxMultiplier;
  
  // Minimum fair value (companies can lose significant value)
  const minFairValue = currentPrice * 0.1;
  
  return Math.max(minFairValue, Math.min(maxFairValue, fairValue));
};

// Helper function to validate EPS data with profitability check
const validateEPS = (data: StockData): number | null => {
  const eps = data.earningsPerShare;
  
  if (!eps || eps <= 0.01) return null; // Minimum threshold of $0.01
  if (eps > 1000) return null; // Maximum threshold to catch data errors
  
  // Additional check: EPS should be consistent with net income positivity
  // If EPS is positive but net income is deeply negative, something is wrong
  if (data.netIncome !== null && data.netIncome < -100000000 && eps > 0) {
    return null; // Inconsistent data - positive EPS but huge losses
  }
  
  return eps;
};

// Price-based valuations (Fair Value per Share)
export const calculateBuffettFairValue = (data: StockData): number => {
  const isHealthy = isFundamentallyHealthy(data);
  
  // Unhealthy companies get discounted to current price
  if (!isHealthy) {
    return applySanityChecks(data.price * 0.8, data.price, data); // 20% discount for unhealthy companies
  }
  
  const validEPS = validateEPS(data);
  
  // Fallback to book value approach for companies without valid EPS
  if (!validEPS) {
    if (data.bookValuePerShare && data.bookValuePerShare > 0) {
      return applySanityChecks(data.bookValuePerShare * 1.2, data.price, data); // 20% premium to book
    }
    return data.price; // Neutral valuation if no valid metrics
  }
  
  // Buffett's approach: Quality companies at reasonable prices
  const baseEPS = validEPS;
  
  // Conservative P/E based on quality metrics (capped at 30x for healthy companies)
  let fairPE = 15; // Base conservative multiple
  
  // Quality adjustments
  if (data.roe && data.roe > 20) fairPE += 3; // High ROE
  if (data.netMargin && data.netMargin > 15) fairPE += 2; // Strong margins  
  if (data.debtToEquity && data.debtToEquity < 0.5) fairPE += 2; // Low debt
  if (data.freeCashFlow && data.netIncome && data.freeCashFlow > data.netIncome * 0.8) fairPE += 2; // Strong FCF
  
  // Growth adjustment (modest)
  if (data.earningsGrowth5Y && data.earningsGrowth5Y > 10) fairPE += 3;
  else if (data.earningsGrowth5Y && data.earningsGrowth5Y > 5) fairPE += 1;
  
  // Cap at reasonable levels (maximum 30x P/E for healthy companies)
  fairPE = Math.min(30, fairPE);
  
  const fairValue = baseEPS * fairPE;
  return applySanityChecks(fairValue, data.price, data);
};

export const calculateGrahamFairValue = (data: StockData): number => {
  const isHealthy = isFundamentallyHealthy(data);
  
  // Unhealthy companies get discounted to current price
  if (!isHealthy) {
    return applySanityChecks(data.price * 0.7, data.price, data); // 30% discount for unhealthy companies
  }
  
  const validEPS = validateEPS(data);
  
  if (!data.bookValuePerShare || !validEPS) {
    // Fallback: Use tangible book value or book value with discount
    if (data.tangibleBookValue && data.tangibleBookValue > 0) {
      return applySanityChecks(data.tangibleBookValue * 0.8, data.price, data);
    }
    if (data.bookValuePerShare && data.bookValuePerShare > 0) {
      return applySanityChecks(data.bookValuePerShare * 0.7, data.price, data);
    }
    return data.price; // Neutral if no valid metrics
  }
  
  // Graham's formula: √(22.5 × EPS × Book Value)
  const eps = validEPS;
  const bvps = data.bookValuePerShare;
  
  if (bvps <= 0) return applySanityChecks(data.price * 0.7, data.price, data);
  
  const fairValue = Math.sqrt(22.5 * eps * bvps);
  return applySanityChecks(fairValue, data.price, data);
};

export const calculateLynchFairValue = (data: StockData): number => {
  const isHealthy = isFundamentallyHealthy(data);
  
  // Unhealthy companies get discounted to current price
  if (!isHealthy) {
    return applySanityChecks(data.price * 0.8, data.price, data); // 20% discount for unhealthy companies
  }
  
  const validEPS = validateEPS(data);
  
  if (!validEPS) {
    // Fallback for growth companies: Use Price/Sales if available
    if (data.priceToSales && data.priceToSales > 0 && data.priceToSales < 10) {
      const fairPS = Math.min(5, data.priceToSales * 1.2); // Conservative growth multiple
      const fairValue = (data.revenue || 0) * fairPS / (data.sharesOutstanding || 1);
      return applySanityChecks(fairValue, data.price, data);
    }
    return data.price; // Neutral if no valid metrics
  }
  
  // Lynch's PEG approach: More generous for growth companies
  const growthRate = Math.abs(data.earningsGrowth5Y || 8); // Default 8% if missing
  const adjustedGrowth = Math.min(30, Math.max(8, growthRate)); // 8-30% range
  
  // Lynch accepted PEG up to 2.0 for great companies, preferred around 1.0-1.5
  let targetPEG = 1.3; // More realistic base
  if (data.roe && data.roe > 25) targetPEG = 1.6; // Exceptional companies
  else if (data.roe && data.roe > 20) targetPEG = 1.4; // High quality companies
  
  const fairPE = Math.min(50, adjustedGrowth * targetPEG); // Cap at 50x P/E for healthy companies
  const fairValue = validEPS * fairPE;
  
  return applySanityChecks(fairValue, data.price, data);
};

export const calculateGreenblattFairValue = (data: StockData): number => {
  const isHealthy = isFundamentallyHealthy(data);
  
  // Unhealthy companies get discounted to current price
  if (!isHealthy) {
    return applySanityChecks(data.price * 0.75, data.price, data); // 25% discount for unhealthy companies
  }
  
  const validEPS = validateEPS(data);
  
  if (!validEPS) {
    // Fallback: Use EV/EBITDA approach if EBITDA is positive
    if (data.ebitda && data.ebitda > 0 && data.evToEbitda && data.evToEbitda > 0) {
      const fairEVEbitda = Math.min(15, data.evToEbitda); // Cap at 15x
      const fairValue = data.price * (fairEVEbitda / data.evToEbitda);
      return applySanityChecks(fairValue, data.price, data);
    }
    return data.price; // Neutral if no valid metrics
  }
  
  // Greenblatt's Magic Formula: Focus on ROIC and Earnings Yield
  const roic = Math.max(5, Math.min(50, data.roic || 15)); // Cap ROIC between 5-50%
  const earningsYield = data.peRatio ? (1 / data.peRatio) * 100 : 6; // Current earnings yield
  
  // Target earnings yield of 7-8% (P/E of 12.5-14.3)
  const targetEarningsYield = Math.max(6, 8 - (roic - 15) * 0.1); // Higher ROIC allows lower yield
  const targetPE = Math.min(25, 100 / targetEarningsYield); // Cap at 25x P/E for healthy companies
  
  // Adjust for quality: Great ROIC companies deserve premium
  let qualityAdjustment = 1.0;
  if (roic > 25) qualityAdjustment = 1.2; // Reduced from 1.3
  else if (roic > 20) qualityAdjustment = 1.15; // Reduced from 1.2
  else if (roic > 15) qualityAdjustment = 1.05; // Reduced from 1.1
  
  const fairValue = validEPS * targetPE * qualityAdjustment;
  return applySanityChecks(fairValue, data.price, data);
};

export const calculateTempletonFairValue = (data: StockData): number => {
  const isHealthy = isFundamentallyHealthy(data);
  
  // Unhealthy companies get heavily discounted - Templeton would avoid them
  if (!isHealthy) {
    return applySanityChecks(data.price * 0.6, data.price, data); // 40% discount for unhealthy companies
  }
  
  const validEPS = validateEPS(data);
  
  if (!validEPS) {
    // Templeton's asset-based approach for companies without valid EPS
    if (data.bookValuePerShare && data.bookValuePerShare > 0) {
      return applySanityChecks(data.bookValuePerShare * 0.6, data.price, data); // Deep discount to book
    }
    if (data.tangibleBookValue && data.tangibleBookValue > 0) {
      return applySanityChecks(data.tangibleBookValue * 0.5, data.price, data); // Even deeper discount
    }
    return applySanityChecks(data.price * 0.7, data.price, data); // Conservative discount
  }
  
  // Templeton's ultra-contrarian approach: Extreme value only
  const baseEPS = validEPS;
  
  // Templeton's iron discipline: P/E 6-8 max, preferably under 6
  let targetPE = 6; // Ultra-conservative base
  
  // Very limited adjustments only for exceptional value situations
  if (data.debtToEquity && data.debtToEquity < 0.1) targetPE = 7; // Virtually debt-free
  if (data.dividendYield && data.dividendYield > 5) targetPE += 0.5; // Very high dividend
  if (data.pbRatio && data.pbRatio < 0.8) targetPE += 0.5; // Trading below book
  
  // Absolute ceiling at P/E 8 (Templeton's absolute maximum)
  targetPE = Math.min(8, targetPE);
  
  const fairValue = baseEPS * targetPE;
  return applySanityChecks(fairValue, data.price, data);
};

export const calculateMarksFairValue = (data: StockData): number => {
  const isHealthy = isFundamentallyHealthy(data);
  
  // Unhealthy companies get discounted - Marks is very risk-conscious
  if (!isHealthy) {
    return applySanityChecks(data.price * 0.7, data.price, data); // 30% discount for unhealthy companies
  }
  
  const validEPS = validateEPS(data);
  
  if (!validEPS) {
    // Marks' asset-based approach with heavy risk discount
    if (data.tangibleBookValue && data.tangibleBookValue > 0) {
      return applySanityChecks(data.tangibleBookValue * 0.7, data.price, data); // Conservative tangible book
    }
    if (data.bookValuePerShare && data.bookValuePerShare > 0) {
      return applySanityChecks(data.bookValuePerShare * 0.6, data.price, data); // Heavy discount to book
    }
    return applySanityChecks(data.price * 0.8, data.price, data); // Conservative discount
  }
  
  // Marks' conservative, risk-first approach
  const baseEPS = validEPS;
  let baseMultiple = 14; // Conservative starting point
  
  // Significant risk adjustments (debt is major concern)  
  const debtRatio = data.debtToEquity || 0;
  if (debtRatio > 2.0) baseMultiple *= 0.6; // Very high debt = major discount
  else if (debtRatio > 1.5) baseMultiple *= 0.75; // High debt
  else if (debtRatio > 1.0) baseMultiple *= 0.85; // Moderate debt
  else if (debtRatio < 0.5) baseMultiple *= 1.05; // Low debt small premium
  
  // Conservative quality adjustments
  if (data.roe && data.roe > 25) baseMultiple *= 1.1; // Exceptional ROE
  else if (data.roe && data.roe > 20) baseMultiple *= 1.05; // High ROE  
  else if (data.roe && data.roe < 12) baseMultiple *= 0.9;
  
  if (data.netMargin && data.netMargin > 20) baseMultiple *= 1.08; // Exceptional margins
  else if (data.netMargin && data.netMargin < 8) baseMultiple *= 0.9;
  
  // Cyclical risk discount (Marks is very cycle-aware)
  if (data.peRatio && data.peRatio > 25) baseMultiple *= 0.9; // High multiple = cycle risk
  
  // Cap at reasonable P/E (max 20x for Marks - reduced from 30x)
  baseMultiple = Math.min(20, baseMultiple);
  
  const fairValue = baseEPS * baseMultiple;
  return applySanityChecks(fairValue, data.price, data);
};

// Utility functions for price analysis
export const calculateUpside = (currentPrice: number, fairValue: number): number => {
  return ((fairValue - currentPrice) / currentPrice) * 100;
};

// Unified recommendation system
export const getRecommendationFromScore = (score: number): 'buy' | 'hold' | 'sell' => {
  if (score >= 80) return 'buy';
  if (score >= 60) return 'hold';
  return 'sell';
};

export const getRecommendationFromUpside = (upside: number): 'buy' | 'hold' | 'sell' => {
  // Convert upside to score-like scale for consistency
  // Upside > 50% = Strong Buy (equivalent to 80+ score)
  // Upside 0-50% = Hold (equivalent to 60-79 score)  
  // Upside < 0% = Avoid (equivalent to <60 score)
  if (upside > 50) return 'buy';
  if (upside >= 0) return 'hold';
  return 'sell';
};

export const getValuationSignal = (upside: number): 'buy' | 'hold' | 'sell' => {
  return getRecommendationFromUpside(upside);
};

export const calculateAverageFairValue = (data: StockData): number => {
  const fairValues = [
    calculateBuffettFairValue(data),
    calculateGrahamFairValue(data),
    calculateLynchFairValue(data),
    calculateGreenblattFairValue(data),
    calculateTempletonFairValue(data),
    calculateMarksFairValue(data)
  ];
  
  return fairValues.reduce((sum, value) => sum + value, 0) / fairValues.length;
};

// Legacy scaled functions (kept for backward compatibility)
const MAX_SCORES = {
  buffett: 100,
  graham: 100,
  lynch: 96,
  greenblatt: 100,
  templeton: 96,
  marks: 100
};

export const calculateBuffettScoreScaled = (data: StockData): number => {
  const rawScore = calculateBuffettScore(data);
  return Math.round((rawScore / MAX_SCORES.buffett) * 100);
};

export const calculateGrahamScoreScaled = (data: StockData): number => {
  const rawScore = calculateGrahamScore(data);
  return Math.round((rawScore / MAX_SCORES.graham) * 100);
};

export const calculateLynchScoreScaled = (data: StockData): number => {
  const rawScore = calculateLynchScore(data);
  return Math.round((rawScore / MAX_SCORES.lynch) * 100);
};

export const calculateGreenblattScoreScaled = (data: StockData): number => {
  const rawScore = calculateGreenblattScore(data);
  return Math.round((rawScore / MAX_SCORES.greenblatt) * 100);
};

export const calculateTempletonScoreScaled = (data: StockData): number => {
  const rawScore = calculateTempletonScore(data);
  return Math.round((rawScore / MAX_SCORES.templeton) * 100);
};

export const calculateMarksScoreScaled = (data: StockData): number => {
  const rawScore = calculateMarksScore(data);
  return Math.round((rawScore / MAX_SCORES.marks) * 100);
};
