
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Company {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry?: string;
}

interface BatchAnalysisControlsProps {
  companies: Company[];
  onBatchAnalysisComplete?: () => void;
}

export const BatchAnalysisControls = ({
  companies,
  onBatchAnalysisComplete,
}: BatchAnalysisControlsProps) => {
  const [letterFilter, setLetterFilter] = useState("");
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleBatchAnalysis = async () => {
    if (!letterFilter.trim()) {
      toast({
        title: "Buchstabe erforderlich",
        description: "Bitte geben Sie einen Buchstaben ein, um Unternehmen zu filtern (A-Z)",
        variant: "destructive",
      });
      return;
    }

    const letter = letterFilter.toUpperCase().trim();
    if (letter.length !== 1 || !/[A-Z]/.test(letter)) {
      toast({
        title: "Ungültiger Buchstabe",
        description: "Bitte geben Sie einen einzelnen Buchstaben ein (A-Z)",
        variant: "destructive",
      });
      return;
    }

    const companiesWithLetter = companies.filter(company => 
      company.symbol.startsWith(letter)
    );

    if (companiesWithLetter.length === 0) {
      toast({
        title: "Keine Unternehmen gefunden",
        description: `Keine Unternehmen gefunden, die mit dem Buchstaben "${letter}" beginnen`,
        variant: "destructive",
      });
      return;
    }

    setIsBatchAnalyzing(true);
    
    toast({
      title: "Stapelanalyse gestartet",
      description: `Analysiere ${companiesWithLetter.length} Unternehmen, die mit "${letter}" beginnen...`,
    });

    try {
      const { processBatchAnalysis } = await import("@/utils/batchAnalysisService");
      
      await processBatchAnalysis(companiesWithLetter, (progress) => {
        
      });

      toast({
        title: "Stapelanalyse abgeschlossen",
        description: `Erfolgreich ${companiesWithLetter.length} Unternehmen analysiert, die mit "${letter}" beginnen`,
      });

      if (onBatchAnalysisComplete) {
        onBatchAnalysisComplete();
      }

    } catch (error) {
      console.error('Stapelanalyse fehlgeschlagen:', error);
      toast({
        title: "Analyse fehlgeschlagen",
        description: "Einige Unternehmen konnten nicht analysiert werden. Details in der Konsole.",
        variant: "destructive",
      });
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  return (
    <div className="flex gap-2 max-w-md">
      <Input
        type="text"
        placeholder="Buchstabe (A-Z)"
        value={letterFilter}
        onChange={(e) => setLetterFilter(e.target.value.toUpperCase().slice(0, 1))}
        className="w-24"
        maxLength={1}
      />
      <Button 
        onClick={handleBatchAnalysis} 
        disabled={isBatchAnalyzing || !letterFilter.trim()}
        className="flex-1"
        variant="outline"
        title="Unternehmen mit diesem Buchstaben analysieren"
      >
        {isBatchAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Analysiere...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Buchstabe analysieren
          </>
        )}
      </Button>
    </div>
  );
};
