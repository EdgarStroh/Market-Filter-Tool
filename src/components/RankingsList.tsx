import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { loadFromFirebase, CompanyResult } from "@/utils/firebaseService";
import { CompanyRankingCard } from "./CompanyRankingCard";

interface RankingsListProps {
  listType: string;
  title: string;
  description: string;
}

export const RankingsList = ({ listType, title, description }: RankingsListProps) => {
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadResults();
  }, [listType]);

  // Listen for updates from analysis
  useEffect(() => {
    const handleUpdate = () => {
      
      loadResults();
    };

    window.addEventListener('topTenUpdated', handleUpdate);
    return () => window.removeEventListener('topTenUpdated', handleUpdate);
  }, [listType]);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const data = await loadFromFirebase(listType);
      
      
      // Additional filtering and validation
      const validResults = data.filter((result): result is CompanyResult => {
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
      
      
      setResults(validResults);
    } catch (error) {
      console.error(`Failed to load results for ${listType}:`, error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading rankings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No results available yet. Start analyzing companies to see rankings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
       <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-clip">
          {results.map((company, index) => (
            <div key={`${company.symbol}-${company.analysisDate}`} className="flex items-center gap-1 sm:gap-3">
              <div className="flex-shrink-0 w-4 sm:w-8 text-center">
                <span className="text-sm font-semibold text-muted-foreground">
                  {index + 1}.
                </span>
              </div>
              <div className="flex-1 overflow-x-auto">
                <CompanyRankingCard
                  company={company}
                  rank={index}
                />
              </div>
            </div>
          ))}
        </div>
        {results.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Rankings updated in real-time based on analysis results
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};