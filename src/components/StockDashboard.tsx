
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { StockCharts } from "@/components/StockCharts";
import { InvestmentAnalysis } from "@/components/InvestmentAnalysis";
import { PriceAnalysis } from "@/components/PriceAnalysis";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { StockData } from "@/types/StockData";
import { fetchCompanyFundamentals, fetchRealTimePrice } from "@/services/eodhd";
import { convertEODHDToStockData } from "@/utils/eodhd-adapter";
import { saveToFirebase } from "@/utils/firebaseService";
import { withCache, cacheKeys } from "@/utils/dataCache";
import {
  calculateBuffettScoreScaled,
  calculateGrahamScoreScaled,
  calculateLynchScoreScaled,
  calculateGreenblattScoreScaled,
  calculateTempletonScoreScaled,
  calculateMarksScoreScaled,
  calculateAverageFairValue
} from "@/utils/investmentStrategies";

interface StockDashboardProps {
  symbol: string;
  onAnalysisComplete?: () => void;
  onClose?: () => void;
}

export const StockDashboard = ({ symbol, onAnalysisComplete, onClose }: StockDashboardProps) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { t } = useLanguage();

  const calculateAllScores = (data: StockData) => {
    const strategies = [
      { name: "Warren Buffett", score: calculateBuffettScoreScaled(data) },
      { name: "Benjamin Graham", score: calculateGrahamScoreScaled(data) },
      { name: "Peter Lynch", score: calculateLynchScoreScaled(data) },
      { name: "Joel Greenblatt", score: calculateGreenblattScoreScaled(data) },
      { name: "John Templeton", score: calculateTempletonScoreScaled(data) },
      { name: "Howard Marks", score: calculateMarksScoreScaled(data) }
    ];

    const overallScore = Math.round(strategies.reduce((sum, s) => sum + s.score, 0) / strategies.length);
    const topStrategy = strategies.reduce((best, current) => 
      current.score > best.score ? current : best
    ).name;

    return { overallScore, topStrategy, strategies };
  };

  const saveToDatabase = async (data: StockData) => {
    const { overallScore, topStrategy } = calculateAllScores(data);
    const averageTarget = calculateAverageFairValue(data);
    const currentPrice = data.price || 0;
    const upside = currentPrice > 0 ? ((averageTarget - currentPrice) / currentPrice) * 100 : 0;
    
    
    const result = {
      symbol: data.symbol,
      name: data.name,
      sector: data.sector,
      industry: data.industry || "Software",
      overallScore,
      topStrategy,
      analysisDate: new Date().toISOString(),
      dividendYield: data.dividendYield || null,
      currentPrice,
      averageTarget,
      upside
    };
    

    try {
      await saveToFirebase(result);
      
      const existing = JSON.parse(localStorage.getItem('topTenResults') || '[]');
      const filtered = existing.filter((item: any) => item.symbol !== data.symbol);
      const updated = [...filtered, result].sort((a, b) => b.overallScore - a.overallScore).slice(0, 50);
      localStorage.setItem('topTenResults', JSON.stringify(updated));
      
      window.dispatchEvent(new CustomEvent('topTenUpdated'));
      
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }

      setShowCharts(true);

      toast({
        title: "Analysis Saved",
        description: `${symbol} analysis saved to database successfully.`,
      });
    } catch (error) {
      toast({
        title: "Save Warning",
        description: "Analysis saved locally but failed to sync with database.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      setShowCharts(false);
      
      try {
        
        
        // Fetch fundamentals and price in parallel with caching
        const [fundamentals, price] = await Promise.all([
          withCache(
            cacheKeys.companyFundamentals(symbol),
            () => fetchCompanyFundamentals(symbol),
            300000 // 5 minutes cache
          ),
          withCache(
            cacheKeys.realTimePrice(symbol),
            () => fetchRealTimePrice(symbol),
            60000 // 1 minute cache for real-time data
          )
        ]);

        if (!fundamentals) {
          
          setError(`No fundamental data available for ${symbol}. This company may not be available on US exchanges.`);
          setIsLoading(false);
          return;
        }

        const stockData = convertEODHDToStockData(symbol, fundamentals, price || undefined);
        
        setStockData(stockData);
        await saveToDatabase(stockData);
        
        
        toast({
          title: t('toast.dataLoaded'),
          description: t('toast.dataLoadedDesc', { symbol }),
        });

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load stock data');
        toast({
          title: "Error Loading Data",
          description: `Failed to load data for ${symbol}. Please try another symbol.`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [symbol, toast, t]);


  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:relative md:inset-auto md:z-auto md:bg-transparent md:backdrop-blur-none">
        <div className="absolute inset-4 md:relative md:inset-auto overflow-auto">
          <Card className="h-full md:h-auto">
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 z-10 md:hidden"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <LoadingSkeleton variant="dashboard" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:relative md:inset-auto md:z-auto md:bg-transparent md:backdrop-blur-none">
        <div className="absolute inset-4 md:relative md:inset-auto overflow-auto">
          <Card className="h-full md:h-auto">
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 z-10 md:hidden"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">{error || t('error.failedToLoad')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:relative md:inset-auto md:z-auto md:bg-transparent md:backdrop-blur-none">
      <div className="absolute inset-4 md:relative md:inset-auto overflow-auto">
        <div className="space-y-6 h-full md:h-auto">
          {/* Mobile Close Button */}
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="fixed right-6 top-6 z-10 md:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Stock Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl md:text-2xl font-bold">{stockData.symbol}</span>
                    <span className="text-sm md:text-lg text-muted-foreground truncate">{stockData.name}</span>
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1 flex flex-col md:flex-row md:gap-2">
                    <span>Sector: {stockData.sector}</span>
                    {stockData.industry && <span className="md:before:content-['|'] md:before:mr-2">Industry: {stockData.industry}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg md:text-2xl font-bold">
                      ${stockData.price !== null ? stockData.price.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      {t('metrics.marketCap')}: {stockData.marketCap !== null ? `$${stockData.marketCap.toFixed(1)}B` : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Tabs for different views */}
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="metrics" className="text-xs md:text-sm">{t('tabs.metrics')}</TabsTrigger>
              <TabsTrigger value="charts" disabled={!showCharts} className="text-xs md:text-sm">{t('tabs.charts')}</TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs md:text-sm">Scores</TabsTrigger>
              <TabsTrigger value="price-targets" className="text-xs md:text-sm">Price Targets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="metrics">
              <FinancialMetrics data={stockData} />
            </TabsContent>
            
            <TabsContent value="charts">
              {showCharts ? (
                <StockCharts symbol={symbol} data={stockData} />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Charts will be available after analysis is complete.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="analysis">
              <InvestmentAnalysis data={stockData} />
            </TabsContent>
            
            <TabsContent value="price-targets">
              <PriceAnalysis data={stockData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
