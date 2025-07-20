import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, TrendingUp, DollarSign, TrendingDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadAllSectors } from "@/utils/firebaseService";
import { RankingsList } from "./RankingsList";

interface RankingDashboardProps {
  visible: boolean;
}

export const RankingDashboard = ({ visible }: RankingDashboardProps) => {
  const [activeTab, setActiveTab] = useState("top300");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (visible && activeTab === "sectors") {
      loadSectors();
    }
  }, [visible, activeTab]);

  const loadSectors = async () => {
    try {
      const sectors = await loadAllSectors();
      setAvailableSectors(sectors);
      if (sectors.length > 0 && !selectedSector) {
        setSelectedSector(sectors[0]);
      }
    } catch (error) {
      console.error('Failed to load sectors:', error);
    }
  };

  if (!visible) {
    return null;
  }

  const formatSectorName = (sectorKey: string) => {
    return sectorKey
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <Card className="mb-4 sm:mb-6 md:mb-8 mx-auto max-w-7xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
          Investment Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="top300" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Top 300</span>
              <span className="sm:hidden">Top 300</span>
            </TabsTrigger>
            <TabsTrigger value="sectors" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sectors</span>
              <span className="sm:hidden">Sectors</span>
            </TabsTrigger>
            <TabsTrigger value="dividends" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dividends</span>
              <span className="sm:hidden">Dividends</span>
            </TabsTrigger>
            <TabsTrigger value="upside" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Upside</span>
              <span className="sm:hidden">Upside</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top300" className="mt-6">
            <RankingsList 
              listType="top300" 
              title="Top 300 Investment Opportunities"
              description="Best investment opportunities ranked by overall score"
            />
          </TabsContent>

          <TabsContent value="sectors" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Select Sector:</label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Choose a sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {formatSectorName(sector)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSector && (
                <RankingsList 
                  listType={`sector-${selectedSector}`} 
                  title={`Top 30 ${formatSectorName(selectedSector)} Companies`}
                  description={`Best investment opportunities in ${formatSectorName(selectedSector)} sector`}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="dividends" className="mt-6">
            <RankingsList 
              listType="dividends" 
              title="Top 300 Dividend Champions"
              description="Highest dividend yielding stocks ranked by dividend yield"
            />
          </TabsContent>

          <TabsContent value="upside" className="mt-6">
            <RankingsList 
              listType="upside" 
              title="Top 300 Highest Upside"
              description="Companies with highest upside potential ranked by target price upside"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};