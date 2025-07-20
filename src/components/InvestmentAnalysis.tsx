
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertTriangle, TrendingUp, Shield, Target, TrendingDown, DollarSign, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StockData } from "@/types/StockData";
import {
  calculateBuffettScoreScaled,
  calculateGrahamScoreScaled,
  calculateLynchScoreScaled,
  calculateGreenblattScoreScaled,
  calculateTempletonScoreScaled,
  calculateMarksScoreScaled,
  getRecommendationFromScore
} from "@/utils/investmentStrategies";

interface InvestmentAnalysisProps {
  data: StockData;
}

export const InvestmentAnalysis = ({ data }: InvestmentAnalysisProps) => {
  const { t } = useLanguage();

  const buffettScore = calculateBuffettScoreScaled(data);
  const grahamScore = calculateGrahamScoreScaled(data);
  const lynchScore = calculateLynchScoreScaled(data);
  const greenblattScore = calculateGreenblattScoreScaled(data);
  const templetonScore = calculateTempletonScoreScaled(data);
  const marksScore = calculateMarksScoreScaled(data);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const strategies = [
    {
      name: "Warren Buffett",
      icon: <DollarSign className="h-5 w-5" />,
      score: buffettScore,
      strategy: t('strategy.buffett')
    },
    {
      name: "Benjamin Graham",
      icon: <Shield className="h-5 w-5" />,
      score: grahamScore,
      strategy: t('strategy.graham')
    },
    {
      name: "Peter Lynch",
      icon: <TrendingUp className="h-5 w-5" />,
      score: lynchScore,
      strategy: t('strategy.lynch')
    },
    {
      name: "Joel Greenblatt",
      icon: <Target className="h-5 w-5" />,
      score: greenblattScore,
      strategy: t('strategy.greenblatt')
    },
    {
      name: "John Templeton",
      icon: <Zap className="h-5 w-5" />,
      score: templetonScore,
      strategy: t('strategy.templeton')
    },
    {
      name: "Howard Marks",
      icon: <Shield className="h-5 w-5" />,
      score: marksScore,
      strategy: t('strategy.marks')
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              {t('analysis.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategies.map((strategy) => (
                <div key={strategy.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {strategy.icon}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-semibold cursor-help hover:text-primary transition-colors">
                            {strategy.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm">{strategy.strategy}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {getScoreIcon(strategy.score)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('analysis.score')}</span>
                      <span className={`font-bold ${getScoreColor(strategy.score)}`}>
                        {strategy.score}/100
                      </span>
                    </div>
                    <Progress value={strategy.score} className="h-2" />
                    <Badge variant={getRecommendationFromScore(strategy.score) === 'buy' ? "default" : getRecommendationFromScore(strategy.score) === 'hold' ? "secondary" : "destructive"}>
                      {getRecommendationFromScore(strategy.score) === 'buy' ? t('analysis.strongBuy') : getRecommendationFromScore(strategy.score) === 'hold' ? t('analysis.hold') : t('analysis.avoid')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analysis.summary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {strategies.filter(s => getRecommendationFromScore(s.score) === 'buy').length}
                </div>
                <div className="text-sm text-muted-foreground">{t('analysis.strongBuy')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {strategies.filter(s => getRecommendationFromScore(s.score) === 'hold').length}
                </div>
                <div className="text-sm text-muted-foreground">{t('analysis.hold')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {strategies.filter(s => getRecommendationFromScore(s.score) === 'sell').length}
                </div>
                <div className="text-sm text-muted-foreground">{t('analysis.avoid')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(strategies.reduce((sum, s) => sum + s.score, 0) / strategies.length)}
                </div>
                <div className="text-sm text-muted-foreground">{t('analysis.avgScore')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
