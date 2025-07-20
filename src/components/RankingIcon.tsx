
import { Trophy, Award, Star, TrendingUp } from "lucide-react";

interface RankingIconProps {
  index: number;
}

export const RankingIcon = ({ index }: RankingIconProps) => {
  if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (index === 1) return <Award className="h-5 w-5 text-gray-400" />;
  if (index === 2) return <Star className="h-5 w-5 text-amber-600" />;
  return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
};
