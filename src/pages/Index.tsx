import { useState, useEffect } from "react";
import { CompanySearch } from "@/components/CompanySearch";
import { StockDashboard } from "@/components/StockDashboard";
import { RankingDashboard } from "@/components/RankingDashboard";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [showRankings, setShowRankings] = useState(false);
  const [rankingsKey, setRankingsKey] = useState(0); // For forcing re-render
  const { t } = useLanguage();

  // Listen for changes in localStorage to auto-show top 10
  useEffect(() => {
    const handleStorageChange = () => {
      setRankingsKey(prev => prev + 1); // Force re-render
      setShowRankings(true); // Auto-show after analysis
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when localStorage is updated from same window
    window.addEventListener('topTenUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('topTenUpdated', handleStorageChange);
    };
  }, []);

  const handleShowRankings = () => {
    setShowRankings(!showRankings);
  };

  const handleStockAnalyzed = () => {
    // This will be called when a stock analysis is complete
    setRankingsKey(prev => prev + 1);
    setShowRankings(true);
  };

  const handleBatchAnalysisComplete = () => {
    // This will be called when batch analysis is complete
    setRankingsKey(prev => prev + 1);
    setShowRankings(true);
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t('app.title')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                {t('app.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Company Search */}
        <Card className="mb-4 sm:mb-6 md:mb-8 mx-auto max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">{t('search.title')}</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {t('search.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanySearch 
              onStockSelect={setSelectedStock} 
              onShowTopTen={handleShowRankings}
              onBatchAnalysisComplete={handleBatchAnalysisComplete}
            />
          </CardContent>
        </Card>

        {/* Rankings Dashboard - Auto-shown after analysis */}
        <RankingDashboard key={rankingsKey} visible={showRankings} />

        {/* Stock Dashboard */}
        {selectedStock && (
          <StockDashboard 
            symbol={selectedStock} 
            onAnalysisComplete={handleStockAnalyzed}
            onClose={() => setSelectedStock(null)}
          />
        )}

        {/* Welcome Message */}
        {!selectedStock && !showRankings && (
          <Card className="mx-auto max-w-4xl">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center py-6 sm:py-8 md:py-12">
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">{t('welcome.title')}</h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base px-4">
                  {t('welcome.description')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">{t('welcome.buffett')}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('welcome.buffettDesc')}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">{t('welcome.visualization')}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('welcome.visualizationDesc')}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg sm:col-span-2 md:col-span-1">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">{t('welcome.strategies')}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('welcome.strategiesDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
