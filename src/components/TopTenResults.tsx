
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadFromFirebase, CompanyResult } from "@/utils/firebaseService";
import { CompanyRankingCard } from "./CompanyRankingCard";

interface TopTenResultsProps {
  visible: boolean;
}

export const TopTenResults = ({ visible }: TopTenResultsProps) => {
  const [topResults, setTopResults] = useState<CompanyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (visible) {
      loadTopResults();
    }
  }, [visible]);

  // Listen for updates from analysis
  useEffect(() => {
    const handleTopTenUpdate = () => {
      if (visible) {
        
        loadTopResults();
      }
    };

    window.addEventListener('topTenUpdated', handleTopTenUpdate);
    return () => window.removeEventListener('topTenUpdated', handleTopTenUpdate);
  }, [visible]);

  const loadTopResults = async () => {
    setIsLoading(true);
    try {
      const results = await loadFromFirebase();
      
      
      // Additional filtering and validation
      const validResults = results.filter((result): result is CompanyResult => {
        const isValid = result !== null && 
          result !== undefined && 
          typeof result === 'object' &&
          typeof result.symbol === 'string' &&
          typeof result.name === 'string' &&
          typeof result.sector === 'string' &&
          typeof result.overallScore === 'number' &&
          typeof result.topStrategy === 'string' &&
          typeof result.analysisDate === 'string' &&
          (result.dividendYield === null || typeof result.dividendYield === 'number') &&
          result.symbol.trim() !== '' &&
          result.name.trim() !== '';
        
        if (!isValid) {
          // Invalid result filtered out
        }
        return isValid;
      });
      
      
      setTopResults(validResults);
    } catch (error) {
      
      // Fallback to localStorage if Firebase fails
      try {
        const stored = localStorage.getItem('topTenResults');
        if (stored) {
          const results = JSON.parse(stored);
          const validResults = Array.isArray(results) ? results.filter((result): result is CompanyResult => 
            result !== null && 
            result !== undefined && 
            typeof result === 'object' &&
            typeof result.symbol === 'string' &&
            typeof result.name === 'string' &&
            typeof result.sector === 'string' &&
            typeof result.overallScore === 'number' &&
            typeof result.topStrategy === 'string' &&
            typeof result.analysisDate === 'string'
          ) : [];
          setTopResults(validResults);
        }
      } catch (localStorageError) {
        
        setTopResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            {t('topFifty.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('topFifty.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topResults.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            {t('topFifty.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t('topFifty.noResults')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          {t('topFifty.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {topResults.map((company, index) => (
            <div key={`${company.symbol}-${company.analysisDate}`} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-sm font-semibold text-muted-foreground">
                  {index + 1}.
                </span>
              </div>
              <div className="flex-1">
                <CompanyRankingCard
                  company={company}
                  rank={index}
                />
              </div>
            </div>
          ))}
        </div>
        {topResults.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              {t('topFifty.rankingNote')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
