
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const { t } = useLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getBadgeText = (score: number) => {
    if (score >= 80) return t('badge.strong');
    if (score >= 60) return t('badge.good');
    return t('badge.weak');
  };

  return (
    <div>
      <div className={`text-lg font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <Badge variant={getScoreBadge(score)} className="text-xs">
        {getBadgeText(score)}
      </Badge>
    </div>
  );
};
