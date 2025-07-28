import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import '../App.css'; // Pfad anpassen


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
        title: "Letter required",
        description: "Please enter a letter to filter companies (A-Z)",
        variant: "destructive",
      });
      return;
    }

    const letter = letterFilter.toUpperCase().trim();
    if (letter.length !== 1 || !/[A-Z]/.test(letter)) {
      toast({
        title: "Invalid letter",
        description: "Please enter a single letter (A-Z)",
        variant: "destructive",
      });
      return;
    }

    const companiesWithLetter = companies.filter((company) =>
      company.symbol.startsWith(letter)
    );

    if (companiesWithLetter.length === 0) {
      toast({
        title: "No companies found",
        description: `No companies found starting with the letter "${letter}"`,
        variant: "destructive",
      });
      return;
    }

    setIsBatchAnalyzing(true);

    toast({
      title: "Batch analysis started",
      description: `Analyzing ${companiesWithLetter.length} companies starting with "${letter}"...`,
    });

    try {
      const { processBatchAnalysis } = await import(
        "@/utils/batchAnalysisService"
      );

      await processBatchAnalysis(companiesWithLetter, (progress) => {});

      toast({
        title: "Batch analysis completed",
        description: `Successfully analyzed ${companiesWithLetter.length} companies starting with "${letter}"`,
      });

      if (onBatchAnalysisComplete) {
        onBatchAnalysisComplete();
      }
    } catch (error) {
      // console.error("Batch analysis failed:", error);
      toast({
        title: "Analysis failed",
        description:
          "Some companies could not be analyzed. See console for details.",
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
        placeholder="Letter (A-Z)"
        value={letterFilter}
        onChange={(e) =>
          setLetterFilter(e.target.value.toUpperCase().slice(0, 1))
        }
        className="w-24 disappear"
        maxLength={1}
      />
      <Button
        onClick={handleBatchAnalysis}
        disabled={isBatchAnalyzing || !letterFilter.trim()}
        className="flex-1 disappear"
        variant="outline"
        title="Analyze companies with this letter"
      >
        {isBatchAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Analyze Letter
          </>
        )}
      </Button>
    </div>
  );
};
