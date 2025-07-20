import React, { createContext, useContext, useState, ReactNode } from "react";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations = {
  de: {
    "app.title": "Market Filter Tool",
    "app.subtitle": "Analyze stocks using proven investment strategies",
    "search.title": "Company Search",
    "search.description":
      "Search for companies to analyze or use the batch analysis features",
    "search.placeholder": "Search companies (e.g. AAPL, Apple, Microsoft...)",
    "search.notFound": "Company not found",
    "search.selectFromDropdown":
      "Please select a company from the dropdown suggestions",
    "search.letterRequired": "Letter required",
    "search.letterRequiredDesc":
      "Please enter a letter to filter companies (A-Z)",
    "search.invalidLetter": "Invalid letter",
    "search.invalidLetterDesc": "Please enter a single letter (A-Z)",
    "search.noCompaniesFound": "No companies found",
    "search.noCompaniesFoundDesc":
      'No companies found starting with the letter "{letter}"',
    "search.batchAnalysisStarted": "Batch analysis started",
    "search.batchAnalysisStartedDesc":
      'Analyzing {count} companies starting with "{letter}"...',
    "search.batchAnalysisComplete": "Batch analysis complete",
    "search.batchAnalysisCompleteDesc":
      'Successfully analyzed {count} companies starting with "{letter}"',
    "search.analysisComplete": "Complete analysis finished",
    "search.analysisCompleteDesc":
      "Successfully analyzed all {count} companies",
    "search.analysisFailed": "Analysis failed",
    "search.analysisFailedDesc":
      "Some companies could not be analyzed. See console for details.",
    "welcome.title": "Welcome to Investment Analyzer",
    "welcome.description":
      "Analyze stocks using proven investment strategies from Warren Buffett, Benjamin Graham, and other legendary investors.",
    "welcome.buffett": "Warren Buffett Strategy",
    "welcome.buffettDesc":
      "Evaluate companies based on Buffett's value investing principles",
    "welcome.visualization": "Detailed Visualization",
    "welcome.visualizationDesc":
      "Interactive charts and graphs for better data analysis",
    "welcome.strategies": "Multiple Strategies",
    "welcome.strategiesDesc":
      "Compare different investment approaches in a single platform",
    "topFifty.title": "Top 300 Investment Opportunities",
    "topFifty.loading": "Loading Top 300 results...",
    "topFifty.noResults":
      "No analyzed companies available yet. Start by analyzing some companies.",
    "topFifty.bestStrategy": "Best Strategy",
    "topFifty.rankingNote":
      "Ranking is based on the overall score of all investment strategies",
    "topFifty.showTopResults": "Show Top 300 Results",
    "topFifty.showTopResultsDesc":
      "Shows the best investment opportunities among the analyzed companies",
    "badge.strong": "Strong",
    "badge.good": "Good",
    "badge.weak": "Weak",
    "toast.dataLoaded": "Data loaded",
    "toast.dataLoadedDesc": "Financial data for {symbol} successfully loaded",
    "loading.financialData": "Loading financial data...",
    "error.failedToLoad": "Failed to load data",
    "tabs.metrics": "Metrics",
    "tabs.charts": "Charts",
    "tabs.analysis": "Analysis",
    "metrics.marketCap": "Market Capitalization",
    "metrics.valuation": "Valuation",
    "metrics.performance": "Performance",
    "metrics.profitability": "Profitability",
    "metrics.health": "Financial Health",
    "metrics.peRatio": "P/E Ratio",
    "metrics.pbRatio": "P/B Ratio",
    "metrics.revenue": "Revenue",
    "metrics.netIncome": "Net Income",
    "metrics.freeCashFlow": "Free Cash Flow",
    "metrics.roe": "Return on Equity",
    "metrics.roa": "Return on Assets",
    "metrics.currentRatio": "Current Ratio",
    "metrics.debtToEquity": "Debt to Equity Ratio",
    "metrics.dividendYield": "Dividend Yield",
    "charts.revenueIncome": "Revenue & Income Trends",
    "charts.financialStructure": "Financial Structure",
    "charts.profitabilityTrends": "Profitability Trends",
    "charts.totalEquity": "Total Equity",
    "charts.totalDebt": "Total Debt",
    "analysis.title": "Investment Strategy Analysis",
    "analysis.score": "Score",
    "analysis.strongBuy": "Strong Buy",
    "analysis.hold": "Hold",
    "analysis.avoid": "Avoid",
    "analysis.summary": "Summary",
    "analysis.avgScore": "Average Score",
    "strategy.buffett":
      "Focus on long-term value creation and high-quality companies",
    "strategy.graham": "Value investing with a focus on undervalued stocks",
    "strategy.lynch": "Growth at a reasonable price (GARP) strategy",
    "strategy.greenblatt": "Magic Formula based on earnings yield and ROIC",
    "strategy.templeton": "Contrarian investing with global diversification",
    "strategy.marks": "Risk-adjusted returns and market cycle awareness",
  },
  en: {
    "app.title": "Market Filter Tool",
    "app.subtitle": "Analyze stocks using proven investment strategies",
    "search.title": "Company Search",
    "search.description":
      "Search for companies to analyze or use batch analysis features",
    "search.placeholder": "Search companies (e.g. AAPL, Apple, Microsoft...)",
    "search.notFound": "Company not found",
    "search.selectFromDropdown":
      "Please select a company from the dropdown suggestions",
    "search.letterRequired": "Letter required",
    "search.letterRequiredDesc":
      "Please enter a letter to filter companies (A-Z)",
    "search.invalidLetter": "Invalid letter",
    "search.invalidLetterDesc": "Please enter a single letter (A-Z)",
    "search.noCompaniesFound": "No companies found",
    "search.noCompaniesFoundDesc":
      'No companies found starting with letter "{letter}"',
    "search.batchAnalysisStarted": "Batch analysis started",
    "search.batchAnalysisStartedDesc":
      'Analyzing {count} companies starting with "{letter}"...',
    "search.batchAnalysisComplete": "Batch analysis complete",
    "search.batchAnalysisCompleteDesc":
      'Successfully analyzed {count} companies starting with "{letter}"',
    "search.analysisComplete": "Complete analysis finished",
    "search.analysisCompleteDesc":
      "Successfully analyzed all {count} companies",
    "search.analysisFailed": "Analysis failed",
    "search.analysisFailedDesc":
      "Some companies could not be analyzed. Check console for details.",
    "welcome.title": "Welcome to Investment Analyzer",
    "welcome.description":
      "Analyze stocks using proven investment strategies from Warren Buffett, Benjamin Graham, and other legendary investors.",
    "welcome.buffett": "Warren Buffett Strategy",
    "welcome.buffettDesc":
      "Evaluate companies based on Buffett's value investing principles",
    "welcome.visualization": "Detailed Visualization",
    "welcome.visualizationDesc":
      "Interactive charts and graphs for better data analysis",
    "welcome.strategies": "Multiple Strategies",
    "welcome.strategiesDesc":
      "Compare different investment approaches in one platform",
    "topFifty.title": "Top 300 Investment Opportunities",
    "topFifty.loading": "Loading Top 300 results...",
    "topFifty.noResults":
      "No analyzed companies available yet. Start by analyzing some companies.",
    "topFifty.bestStrategy": "Best Strategy",
    "topFifty.rankingNote":
      "Ranking based on overall score from all investment strategies",
    "topFifty.showTopResults": "Show Top 300 Results",
    "topFifty.showTopResultsDesc":
      "Shows the best investment opportunities from analyzed companies",
    "badge.strong": "Strong",
    "badge.good": "Good",
    "badge.weak": "Weak",
    "toast.dataLoaded": "Data Loaded",
    "toast.dataLoadedDesc": "Financial data for {symbol} loaded successfully",
    "loading.financialData": "Loading financial data...",
    "error.failedToLoad": "Failed to load data",
    "tabs.metrics": "Metrics",
    "tabs.charts": "Charts",
    "tabs.analysis": "Analysis",
    "metrics.marketCap": "Market Cap",
    "metrics.valuation": "Valuation",
    "metrics.performance": "Performance",
    "metrics.profitability": "Profitability",
    "metrics.health": "Financial Health",
    "metrics.peRatio": "P/E Ratio",
    "metrics.pbRatio": "P/B Ratio",
    "metrics.revenue": "Revenue",
    "metrics.netIncome": "Net Income",
    "metrics.freeCashFlow": "Free Cash Flow",
    "metrics.roe": "ROE",
    "metrics.roa": "ROA",
    "metrics.currentRatio": "Current Ratio",
    "metrics.debtToEquity": "Debt/Equity",
    "metrics.dividendYield": "Dividend Yield",
    "charts.revenueIncome": "Revenue & Income Trends",
    "charts.financialStructure": "Financial Structure",
    "charts.profitabilityTrends": "Profitability Trends",
    "charts.totalEquity": "Total Equity",
    "charts.totalDebt": "Total Debt",
    "analysis.title": "Investment Strategy Analysis",
    "analysis.score": "Score",
    "analysis.strongBuy": "Strong Buy",
    "analysis.hold": "Hold",
    "analysis.avoid": "Avoid",
    "analysis.summary": "Summary",
    "analysis.avgScore": "Avg Score",
    "strategy.buffett":
      "Focus on long-term value creation and high-quality companies",
    "strategy.graham": "Value investing with focus on undervalued stocks",
    "strategy.lynch": "Growth at a reasonable price (GARP) strategy",
    "strategy.greenblatt": "Magic Formula based on Earnings Yield and ROIC",
    "strategy.templeton": "Contrarian investing with global diversification",
    "strategy.marks": "Risk-adjusted returns and market cycle awareness",
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<string>("en");

  const t = (key: string, params?: Record<string, string>): string => {
    const lang = language as keyof typeof translations;
    const translation = translations[lang]?.[key] || key;

    if (params) {
      return Object.entries(params).reduce(
        (acc, [key, value]) => acc.replace(`{${key}}`, value),
        translation
      );
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
