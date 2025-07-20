import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Target, DollarSign } from 'lucide-react';
import { StockData } from '@/types/StockData';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  calculateBuffettFairValue,
  calculateGrahamFairValue,
  calculateLynchFairValue,
  calculateGreenblattFairValue,
  calculateTempletonFairValue,
  calculateMarksFairValue,
  calculateUpside,
  getValuationSignal,
  calculateAverageFairValue
} from '@/utils/investmentStrategies';

interface PriceAnalysisProps {
  data: StockData;
}

export const PriceAnalysis: React.FC<PriceAnalysisProps> = ({ data }) => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Analyst Price Targets',
      currentPrice: 'Current Price',
      fairValue: 'Fair Value',
      upside: 'Upside',
      downside: 'Downside',
      averageTarget: 'Average Target',
      consensus: 'Consensus',
      buy: 'Strong Buy',
      hold: 'Hold',
      sell: 'Avoid',
      analystTooltips: {
        buffett: 'Quality companies with strong competitive moats and excellent management',
        graham: 'Deep value approach focusing on assets and conservative valuations',
        lynch: 'Growth at reasonable price with focus on earnings growth potential',
        greenblatt: 'Magic formula combining high returns on capital with attractive valuations',
        templeton: 'Contrarian value investing in fundamentally sound but unloved stocks',
        marks: 'Risk-adjusted returns with emphasis on margin of safety'
      }
    },
    de: {
      title: 'Analyst-Kursziele',
      currentPrice: 'Aktueller Kurs',
      fairValue: 'Fairer Wert',
      upside: 'Aufwärtspotential',
      downside: 'Abwärtsrisiko',
      averageTarget: 'Durchschnittsziel',
      consensus: 'Konsensus',
      buy: 'Kauf',
      hold: 'Halten',
      sell: 'Meiden',
      analystTooltips: {
        buffett: 'Qualitätsunternehmen mit starken Wettbewerbsvorteilen und exzellentem Management',
        graham: 'Value-Ansatz mit Fokus auf Vermögenswerte und konservative Bewertungen',
        lynch: 'Wachstum zu angemessenem Preis mit Fokus auf Gewinnwachstumspotential',
        greenblatt: 'Magische Formel kombiniert hohe Kapitalrenditen mit attraktiven Bewertungen',
        templeton: 'Contrarian Value-Investing in fundamental solide aber unbeliebte Aktien',
        marks: 'Risikoadjustierte Renditen mit Schwerpunkt auf Sicherheitsmarge'
      }
    }
  };

  const t = translations[language];

  const analysts = [
    {
      name: 'Warren Buffett',
      fairValue: calculateBuffettFairValue(data),
      icon: Target,
      tooltip: t.analystTooltips.buffett
    },
    {
      name: 'Benjamin Graham',
      fairValue: calculateGrahamFairValue(data),
      icon: Target,
      tooltip: t.analystTooltips.graham
    },
    {
      name: 'Peter Lynch',
      fairValue: calculateLynchFairValue(data),
      icon: Target,
      tooltip: t.analystTooltips.lynch
    },
    {
      name: 'Joel Greenblatt',
      fairValue: calculateGreenblattFairValue(data),
      icon: Target,
      tooltip: t.analystTooltips.greenblatt
    },
    {
      name: 'John Templeton',
      fairValue: calculateTempletonFairValue(data),
      icon: Target,
      tooltip: t.analystTooltips.templeton
    },
    {
      name: 'Howard Marks',
      fairValue: calculateMarksFairValue(data),
      icon: Target,
      tooltip: t.analystTooltips.marks
    }
  ];

  const averageFairValue = calculateAverageFairValue(data);
  const averageUpside = calculateUpside(data.price, averageFairValue);

  const getUpsideColor = (upside: number) => {
    if (upside > 20) return 'text-green-600';
    if (upside < -20) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSignalBadge = (upside: number) => {
    const signal = getValuationSignal(upside);
    if (signal === 'buy') return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">{t.buy}</Badge>;
    if (signal === 'sell') return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">{t.sell}</Badge>;
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{t.hold}</Badge>;
  };

  const getUpsideIcon = (upside: number) => {
    if (upside > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (upside < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  const bullishCount = analysts.filter(a => getValuationSignal(calculateUpside(data.price, a.fairValue)) === 'buy').length;
  const bearishCount = analysts.filter(a => getValuationSignal(calculateUpside(data.price, a.fairValue)) === 'sell').length;
  const neutralCount = analysts.filter(a => getValuationSignal(calculateUpside(data.price, a.fairValue)) === 'hold').length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with current price and average target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t.currentPrice}</p>
                <p className="text-2xl font-bold">${data.price.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t.averageTarget}</p>
                <p className="text-2xl font-bold">${averageFairValue.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {averageUpside > 0 ? t.upside : t.downside}
                </p>
                <p className={`text-2xl font-bold ${getUpsideColor(averageUpside)}`}>
                  {averageUpside > 0 ? '+' : ''}{averageUpside.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t.consensus}</p>
                <div className="flex justify-center mt-1">
                  {getSignalBadge(averageUpside)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual analyst targets */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {analysts.map((analyst) => {
                const upside = calculateUpside(data.price, analyst.fairValue);
                const signal = getValuationSignal(upside);
                
                return (
                  <Tooltip key={analyst.name}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-help">
                        <div className="flex items-center gap-3">
                          <analyst.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{analyst.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t.fairValue}: ${analyst.fairValue.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              {getUpsideIcon(upside)}
                              <span className={`font-medium ${getUpsideColor(upside)}`}>
                                {upside > 0 ? '+' : ''}{upside.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          
                          {getSignalBadge(upside)}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>{analyst.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{bullishCount}</p>
                <p className="text-sm text-muted-foreground">{t.buy}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{neutralCount}</p>
                <p className="text-sm text-muted-foreground">{t.hold}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{bearishCount}</p>
                <p className="text-sm text-muted-foreground">{t.sell}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};