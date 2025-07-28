import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchExchangeSymbols, EODHDCompany } from "@/services/eodhd";
import { SearchInput } from "./SearchInput";
import { CompanyDropdown } from "./CompanyDropdown";
import { BatchAnalysisControls } from "./BatchAnalysisControls";

import { LoadingSkeleton } from "./LoadingSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

interface Company {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry?: string;
}

interface CompanySearchProps {
  onStockSelect: (symbol: string) => void;
  onShowTopTen: () => void;
  onBatchAnalysisComplete?: () => void;
}

export const CompanySearch = ({ onStockSelect, onShowTopTen, onBatchAnalysisComplete }: CompanySearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Exchanges to load from (based on your code)
  const exchanges = [
    { code: "US", label: "New York Stock Exchange" },
    { code: "LSE", label: "London Stock Exchange" },
    { code: "SHG", label: "Shanghai Stock Exchange" },
    { code: "SHE", label: "Shenzhen Stock Exchange" },
    { code: "NSE", label: "Indian Stock Exchange" },
  ];

  // Excluded keywords (from your filtering logic)
  const excludedKeywords = [
    "ETF", "FUND", "ASSETS", "PORTFOLIO", "STRATEGIC", "HOLDINGS", "HOLDING",
    "AMADEUS", "SOLARPARKEN", "ADVISORS", "HEDGED", "21SHARES", "BITCOIN",
    "ISHARES", "LEVERAGE", "GROWTH", "HEDGE", "ETC", "ENHANCED", "SHARES",
    "STRATEGY", "CUMULATIVE", "CLASS", "MSCI", "SMALL CAP", "BLOCKCHAIN",
  ];

  // Load tickers from a single exchange
  const loadTickersFromExchange = async (exchangeCode: string, exchangeLabel: string) => {
    try {
      const data = await fetchExchangeSymbols(exchangeCode);
      
      return data
        .filter((ticker: EODHDCompany) => {
          // Safe null checks before accessing properties
          if (!ticker?.Name || !ticker?.Code) return false;
          
          const name = (ticker.Name || "").toUpperCase();
          const code = (ticker.Code || "").toUpperCase();

          // Filter out codes with numbers (your logic)
          const containsNumbers = /[0-9]/.test(code);

          // Filter out excluded keywords
          const hasExcludedKeyword = excludedKeywords.some((keyword) =>
            name.includes(keyword)
          );
          
          // Filter out where name equals code
          const isSameAsCode = name === code;

          return !containsNumbers && !hasExcludedKeyword && !isSameAsCode;
        })
        .map((ticker: EODHDCompany) => ({
          ...ticker,
          exchangeLabel
        }));
    } catch (error) {
      // console.error(`Error loading tickers for ${exchangeLabel}:`, error);
      return [];
    }
  };

  // Load from all 5 exchanges (no filtering here - just load the list)
  const loadAllTickers = async () => {
    try {
      
      const allTickers = [];
      
      for (const exchange of exchanges) {
        const tickers = await loadTickersFromExchange(exchange.code, exchange.label);
        allTickers.push(...tickers);
      }
      
      // Sort by name for better search experience
      allTickers.sort((a, b) => (a.Name ?? "").localeCompare(b.Name ?? ""));
      
      
      return allTickers;
    } catch (error) {
      // console.error('Error loading tickers:', error);
      return [];
    }
  };

  // Fetch companies using your improved logic
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        
        const allTickers = await loadAllTickers();
        
        
        
        // Convert to our Company format
        const convertedCompanies: Company[] = allTickers.map((ticker: any) => ({
          symbol: ticker.Code || "N/A",
          name: ticker.Name || "Unknown Company",
          exchange: ticker.exchangeLabel || "US",
          sector: "Various",
          industry: "Various"
        }));

        if (convertedCompanies.length === 0) {
          // Fallback companies if nothing loads
          const fallbackCompanies: Company[] = [
            { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology", industry: "Consumer Electronics" },
            { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Technology", industry: "Software" },
            { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Technology", industry: "Internet Services" },
            { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary", industry: "E-commerce" },
            { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary", industry: "Electric Vehicles" },
          ];
          setCompanies(fallbackCompanies);
          toast({
            title: "Using Sample Companies",
            description: "Loaded sample companies for testing",
          });
        } else {
          setCompanies(convertedCompanies);
          toast({
            title: "Companies Loaded",
            description: `Loaded ${convertedCompanies.length} companies successfully`,
          });
        }
      } catch (error) {
        // console.error('Error loading companies:', error);
        toast({
          title: "Error Loading Companies",
          description: "Failed to load company list. Using fallback data.",
          variant: "destructive"
        });
        
        // Fallback companies
        const fallbackCompanies: Company[] = [
          { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology", industry: "Consumer Electronics" },
          { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Technology", industry: "Software" },
          { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Technology", industry: "Internet Services" },
          { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary", industry: "E-commerce" },
          { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary", industry: "Electric Vehicles" },
        ];
        setCompanies(fallbackCompanies);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [toast]);

  useEffect(() => {
    if (debouncedSearchTerm.length > 1) {
      const filtered = companies.filter(company => {
        const name = (company.name || "").toLowerCase();
        const symbol = (company.symbol || "").toLowerCase();
        const searchLower = (debouncedSearchTerm || "").toLowerCase().trim();
        
        return name.includes(searchLower) || symbol.includes(searchLower);
      }).slice(0, 50); // Limit to 50 results for performance
      
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies.slice(0, 50));
    }
  }, [debouncedSearchTerm, companies]);

  const handleCompanySelect = (company: Company) => {
    setSearchTerm(`${company.symbol} - ${company.name}`);
    setShowDropdown(false);
    onStockSelect(company.symbol);
  };

  const handleAnalyzeAll = async () => {
    if (companies.length === 0) {
      toast({
        title: "Keine Unternehmen verfügbar",
        description: "Es sind keine Unternehmen zum Analysieren verfügbar",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingAll(true);
    
    toast({
      title: "Vollständige Analyse gestartet",
      description: `Analysiere alle ${companies.length} Unternehmen...`,
    });

    try {
      const { processBatchAnalysis } = await import("@/utils/batchAnalysisService");
      
      await processBatchAnalysis(companies, (progress) => {
        
      });

      toast({
        title: "Vollständige Analyse abgeschlossen",
        description: `Erfolgreich alle ${companies.length} Unternehmen analysiert`,
      });

      if (onBatchAnalysisComplete) {
        onBatchAnalysisComplete();
      }

    } catch (error) {
      // console.error('Vollständige Analyse fehlgeschlagen:', error);
      toast({
        title: "Analyse fehlgeschlagen",
        description: "Einige Unternehmen konnten nicht analysiert werden. Details in der Konsole.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  const handleShowTopTen = () => {
    onShowTopTen();
    toast({
      title: t('topFifty.showTopResults'),
      description: t('topFifty.showTopResultsDesc'),
    });
  };

  if (isLoadingCompanies) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="search" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-full sm:max-w-md mx-auto">
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          companies={companies}
          onCompanySelect={handleCompanySelect}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          onShowTopTen={handleShowTopTen}
          onAnalyzeAll={handleAnalyzeAll}
          isAnalyzingAll={isAnalyzingAll}
        />

        <CompanyDropdown
          showDropdown={showDropdown}
          companies={companies}
          filteredCompanies={filteredCompanies}
          searchTerm={searchTerm}
          onCompanySelect={handleCompanySelect}
        />
      </div>

      <BatchAnalysisControls
        companies={companies}
        onBatchAnalysisComplete={onBatchAnalysisComplete}
      />
    </div>
  );
};
