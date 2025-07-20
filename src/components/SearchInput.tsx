
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp, Trophy, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Company {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry?: string;
}

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  companies: Company[];
  onCompanySelect: (company: Company) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  onShowTopTen: () => void;
  onAnalyzeAll: () => void;
  isAnalyzingAll: boolean;
}

export const SearchInput = ({
  searchTerm,
  setSearchTerm,
  companies,
  onCompanySelect,
  showDropdown,
  setShowDropdown,
  onShowTopTen,
  onAnalyzeAll,
  isAnalyzingAll,
}: SearchInputProps) => {
  const { toast } = useToast();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const exactMatch = companies.find(
        company => company.symbol.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (exactMatch) {
        onCompanySelect(exactMatch);
      } else {
        toast({
          title: "Unternehmen nicht gefunden",
          description: "Bitte wählen Sie ein Unternehmen aus den Dropdown-Vorschlägen",
          variant: "destructive",
        });
      }
    }
  };

  const toggleDropdown = () => {
    if (companies.length > 0) {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search companies (e.g. AAPL, Apple, Microsoft...)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length > 1) {
              setShowDropdown(true);
            }
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => {
            if (searchTerm.length > 1) {
              setShowDropdown(true);
            }
          }}
          className="pl-10 pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleDropdown}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          title="Dropdown anzeigen/verbergen"
        >
          {showDropdown ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Button onClick={onShowTopTen} title="Show Top Rankings">
        <Trophy className="h-4 w-4 mr-2" />
        Rankings
      </Button>
      <Button 
        onClick={onAnalyzeAll} 
        disabled={isAnalyzingAll || companies.length === 0}
        title="Alle Unternehmen analysieren"
        variant="outline"
      >
        {isAnalyzingAll ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Analysiere...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
