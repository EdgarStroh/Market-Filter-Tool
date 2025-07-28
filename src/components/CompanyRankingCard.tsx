
import { Card, CardContent } from "@/components/ui/card";
import { RankingIcon } from "@/components/RankingIcon";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Percent } from "lucide-react";
import { CompanyResult } from "@/utils/firebaseService";

interface CompanyRankingCardProps {
  company: CompanyResult;
  rank: number;
}

// Safe formatting utility functions
const safeFormatNumber = (value: any, decimals: number = 2): string => {
  // Handle complex objects like { "_type": "Number", "value": "NaN" }
  if (value && typeof value === 'object' && value.value !== undefined) {
    value = value.value;
  }
  
  // Convert to number if it's a string
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return 'N/A';
    value = parsed;
  }
  
  // Check if it's a valid number
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return 'N/A';
  }
  
  return value.toFixed(decimals);
};

const safeFormatPrice = (value: any): string => {
  const formatted = safeFormatNumber(value, 2);
  return formatted === 'N/A' ? 'N/A' : `$${formatted}`;
};

const safeFormatPercentage = (value: any, decimals: number = 2): string => {
  const formatted = safeFormatNumber(value, decimals);
  return formatted === 'N/A' ? 'N/A' : `${formatted}%`;
};

export const CompanyRankingCard = ({ company, rank }: CompanyRankingCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <RankingIcon index={rank} />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">{company.symbol}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{company.name}</p>
              {company.isin && <p className="text-xs text-muted-foreground/80">ISIN: {company.isin}</p>}
            </div>
          </div>
          <ScoreBadge score={company.overallScore} />
        </div>
        
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sector:</span>
            <span className="text-right truncate ml-2">{company.sector}</span>
          </div>
          {company.industry && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Industry:</span>
              <span className="text-right truncate ml-2">{company.industry}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Percent className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Dividend Yield:</span>
              <span className="sm:hidden">Dividend:</span>
            </span>
            <span className="font-medium text-green-600">
              {company.dividendYield && company.dividendYield > 0 
                ? safeFormatPercentage(company.dividendYield)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Strategy:</span>
            <span className="font-medium text-right truncate ml-2">{company.topStrategy}</span>
          </div>
          {company.currentPrice && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">{safeFormatPrice(company.currentPrice)}</span>
            </div>
          )}
          {company.averageTarget && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target:</span>
              <span className="font-medium">{safeFormatPrice(company.averageTarget)}</span>
            </div>
          )}
          {company.upside !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upside:</span>
              <span className={`font-medium ${(typeof company.upside === 'number' ? company.upside : parseFloat(company.upside || '0')) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(() => {
                  const upsideValue = typeof company.upside === 'number' ? company.upside : parseFloat(company.upside || '0');
                  const formatted = safeFormatPercentage(upsideValue, 1);
                  if (formatted === 'N/A') return 'N/A';
                  return upsideValue > 0 ? `+${formatted}` : formatted;
                })()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Analyzed:</span>
            <span className="text-xs sm:text-sm">{new Date(company.analysisDate).toLocaleDateString('en-US')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
