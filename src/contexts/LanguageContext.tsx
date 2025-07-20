import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  de: {
    'app.title': 'Market Filter Tool',
    'app.subtitle': 'Analysieren Sie Aktien mit bewährten Investitionsstrategien',
    'search.title': 'Unternehmen Suche',
    'search.description': 'Suchen Sie nach Unternehmen zur Analyse oder verwenden Sie die Stapelanalyse-Funktionen',
    'search.placeholder': 'Unternehmen suchen (z.B. AAPL, Apple, Microsoft...)',
    'search.notFound': 'Unternehmen nicht gefunden',
    'search.selectFromDropdown': 'Bitte wählen Sie ein Unternehmen aus den Dropdown-Vorschlägen',
    'search.letterRequired': 'Buchstabe erforderlich',
    'search.letterRequiredDesc': 'Bitte geben Sie einen Buchstaben ein, um Unternehmen zu filtern (A-Z)',
    'search.invalidLetter': 'Ungültiger Buchstabe',
    'search.invalidLetterDesc': 'Bitte geben Sie einen einzelnen Buchstaben ein (A-Z)',
    'search.noCompaniesFound': 'Keine Unternehmen gefunden',
    'search.noCompaniesFoundDesc': 'Keine Unternehmen gefunden, die mit dem Buchstaben "{letter}" beginnen',
    'search.batchAnalysisStarted': 'Stapelanalyse gestartet',
    'search.batchAnalysisStartedDesc': 'Analysiere {count} Unternehmen, die mit "{letter}" beginnen...',
    'search.batchAnalysisComplete': 'Stapelanalyse abgeschlossen',
    'search.batchAnalysisCompleteDesc': 'Erfolgreich {count} Unternehmen analysiert, die mit "{letter}" beginnen',
    'search.analysisComplete': 'Vollständige Analyse abgeschlossen',
    'search.analysisCompleteDesc': 'Erfolgreich alle {count} Unternehmen analysiert',
    'search.analysisFailed': 'Analyse fehlgeschlagen',
    'search.analysisFailedDesc': 'Einige Unternehmen konnten nicht analysiert werden. Details in der Konsole.',
    'welcome.title': 'Willkommen zum Investment Analyzer',
    'welcome.description': 'Analysieren Sie Aktien mit bewährten Investment-Strategien von Warren Buffett, Benjamin Graham und anderen legendären Investoren.',
    'welcome.buffett': 'Warren Buffett Strategie',
    'welcome.buffettDesc': 'Bewerten Sie Unternehmen basierend auf Buffetts Value-Investment-Prinzipien',
    'welcome.visualization': 'Detaillierte Visualisierung',
    'welcome.visualizationDesc': 'Interaktive Charts und Grafiken für bessere Datenanalyse',
    'welcome.strategies': 'Multiple Strategien',
    'welcome.strategiesDesc': 'Vergleichen Sie verschiedene Investment-Ansätze in einer Plattform',
    'topFifty.title': 'Top 300 Investment-Möglichkeiten',
    'topFifty.loading': 'Lade Top 300 Ergebnisse...',
    'topFifty.noResults': 'Noch keine analysierten Unternehmen verfügbar. Beginnen Sie mit der Analyse einiger Unternehmen.',
    'topFifty.bestStrategy': 'Beste Strategie',
    'topFifty.rankingNote': 'Ranking basiert auf Gesamtbewertung aller Investment-Strategien',
    'topFifty.showTopResults': 'Top 300 Ergebnisse anzeigen',
    'topFifty.showTopResultsDesc': 'Zeigt die besten Investment-Möglichkeiten der analysierten Unternehmen',
    'badge.strong': 'Stark',
    'badge.good': 'Gut',
    'badge.weak': 'Schwach',
    'toast.dataLoaded': 'Daten geladen',
    'toast.dataLoadedDesc': 'Finanzdaten für {symbol} erfolgreich geladen',
    'loading.financialData': 'Lade Finanzdaten...',
    'error.failedToLoad': 'Fehler beim Laden der Daten',
    'tabs.metrics': 'Kennzahlen',
    'tabs.charts': 'Charts',
    'tabs.analysis': 'Analyse',
    'metrics.marketCap': 'Marktkapitalisierung',
    'metrics.valuation': 'Bewertung',
    'metrics.performance': 'Leistung',
    'metrics.profitability': 'Rentabilität',
    'metrics.health': 'Finanzielle Gesundheit',
    'metrics.peRatio': 'KGV',
    'metrics.pbRatio': 'KBV',
    'metrics.revenue': 'Umsatz',
    'metrics.netIncome': 'Nettogewinn',
    'metrics.freeCashFlow': 'Freier Cashflow',
    'metrics.roe': 'Eigenkapitalrendite',
    'metrics.roa': 'Gesamtkapitalrendite',
    'metrics.currentRatio': 'Liquiditätsgrad',
    'metrics.debtToEquity': 'Verschuldungsgrad',
    'metrics.dividendYield': 'Dividendenrendite',
    'charts.revenueIncome': 'Umsatz & Gewinn Entwicklung',
    'charts.financialStructure': 'Finanzstruktur',
    'charts.profitabilityTrends': 'Rentabilitätstrends',
    'charts.totalEquity': 'Eigenkapital',
    'charts.totalDebt': 'Gesamtverschuldung',
    'analysis.title': 'Investment Strategien Analyse',
    'analysis.score': 'Bewertung',
    'analysis.strongBuy': 'Starker Kauf',
    'analysis.hold': 'Halten',
    'analysis.avoid': 'Vermeiden',
    'analysis.summary': 'Zusammenfassung',
    'analysis.avgScore': 'Durchschnitt',
    'strategy.buffett': 'Fokus auf langfristige Wertschöpfung und qualitativ hochwertige Unternehmen',
    'strategy.graham': 'Value Investing mit Fokus auf unterbewertete Aktien',
    'strategy.lynch': 'Growth at a reasonable price (GARP) Strategie',
    'strategy.greenblatt': 'Magic Formula basierend auf Earnings Yield und ROIC',
    'strategy.templeton': 'Contrarian Investing mit globaler Diversifikation',
    'strategy.marks': 'Risk-adjusted returns und Marktzyklen-Bewusstsein'
  },
  en: {
    'app.title': 'Market Filter Tool', 
    'app.subtitle': 'Analyze stocks using proven investment strategies',
    'search.title': 'Company Search',
    'search.description': 'Search for companies to analyze or use batch analysis features',
    'search.placeholder': 'Search companies (e.g. AAPL, Apple, Microsoft...)',
    'search.notFound': 'Company not found',
    'search.selectFromDropdown': 'Please select a company from the dropdown suggestions',
    'search.letterRequired': 'Letter required',
    'search.letterRequiredDesc': 'Please enter a letter to filter companies (A-Z)',
    'search.invalidLetter': 'Invalid letter',
    'search.invalidLetterDesc': 'Please enter a single letter (A-Z)',
    'search.noCompaniesFound': 'No companies found',
    'search.noCompaniesFoundDesc': 'No companies found starting with letter "{letter}"',
    'search.batchAnalysisStarted': 'Batch analysis started',
    'search.batchAnalysisStartedDesc': 'Analyzing {count} companies starting with "{letter}"...',
    'search.batchAnalysisComplete': 'Batch analysis complete',
    'search.batchAnalysisCompleteDesc': 'Successfully analyzed {count} companies starting with "{letter}"',
    'search.analysisComplete': 'Complete analysis finished',
    'search.analysisCompleteDesc': 'Successfully analyzed all {count} companies',
    'search.analysisFailed': 'Analysis failed',
    'search.analysisFailedDesc': 'Some companies could not be analyzed. Check console for details.',
    'welcome.title': 'Welcome to Investment Analyzer',
    'welcome.description': 'Analyze stocks using proven investment strategies from Warren Buffett, Benjamin Graham, and other legendary investors.',
    'welcome.buffett': 'Warren Buffett Strategy',
    'welcome.buffettDesc': 'Evaluate companies based on Buffett\'s value investing principles',
    'welcome.visualization': 'Detailed Visualization',
    'welcome.visualizationDesc': 'Interactive charts and graphs for better data analysis',
    'welcome.strategies': 'Multiple Strategies',
    'welcome.strategiesDesc': 'Compare different investment approaches in one platform',
    'topFifty.title': 'Top 300 Investment Opportunities',
    'topFifty.loading': 'Loading Top 300 results...',
    'topFifty.noResults': 'No analyzed companies available yet. Start by analyzing some companies.',
    'topFifty.bestStrategy': 'Best Strategy',
    'topFifty.rankingNote': 'Ranking based on overall score from all investment strategies',
    'topFifty.showTopResults': 'Show Top 300 Results',
    'topFifty.showTopResultsDesc': 'Shows the best investment opportunities from analyzed companies',
    'badge.strong': 'Strong',
    'badge.good': 'Good',
    'badge.weak': 'Weak',
    'toast.dataLoaded': 'Data Loaded',
    'toast.dataLoadedDesc': 'Financial data for {symbol} loaded successfully',
    'loading.financialData': 'Loading financial data...',
    'error.failedToLoad': 'Failed to load data',
    'tabs.metrics': 'Metrics',
    'tabs.charts': 'Charts',
    'tabs.analysis': 'Analysis',
    'metrics.marketCap': 'Market Cap',
    'metrics.valuation': 'Valuation',
    'metrics.performance': 'Performance',
    'metrics.profitability': 'Profitability',
    'metrics.health': 'Financial Health',
    'metrics.peRatio': 'P/E Ratio',
    'metrics.pbRatio': 'P/B Ratio',
    'metrics.revenue': 'Revenue',
    'metrics.netIncome': 'Net Income',
    'metrics.freeCashFlow': 'Free Cash Flow',
    'metrics.roe': 'ROE',
    'metrics.roa': 'ROA',
    'metrics.currentRatio': 'Current Ratio',
    'metrics.debtToEquity': 'Debt/Equity',
    'metrics.dividendYield': 'Dividend Yield',
    'charts.revenueIncome': 'Revenue & Income Trends',
    'charts.financialStructure': 'Financial Structure',
    'charts.profitabilityTrends': 'Profitability Trends',
    'charts.totalEquity': 'Total Equity',
    'charts.totalDebt': 'Total Debt',
    'analysis.title': 'Investment Strategy Analysis',
    'analysis.score': 'Score',
    'analysis.strongBuy': 'Strong Buy',
    'analysis.hold': 'Hold',
    'analysis.avoid': 'Avoid',
    'analysis.summary': 'Summary',
    'analysis.avgScore': 'Avg Score',
    'strategy.buffett': 'Focus on long-term value creation and high-quality companies',
    'strategy.graham': 'Value investing with focus on undervalued stocks',
    'strategy.lynch': 'Growth at a reasonable price (GARP) strategy',
    'strategy.greenblatt': 'Magic Formula based on Earnings Yield and ROIC',
    'strategy.templeton': 'Contrarian investing with global diversification',
    'strategy.marks': 'Risk-adjusted returns and market cycle awareness'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
