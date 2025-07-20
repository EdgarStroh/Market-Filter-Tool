import { useToast } from "@/hooks/use-toast";

interface Company {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry?: string;
}

interface CompanyDropdownProps {
  showDropdown: boolean;
  companies: Company[];
  filteredCompanies: Company[];
  searchTerm: string;
  onCompanySelect: (company: Company) => void;
}

export const CompanyDropdown = ({
  showDropdown,
  companies,
  filteredCompanies,
  searchTerm,
  onCompanySelect,
}: CompanyDropdownProps) => {
  const { toast } = useToast();

  const handleCompanySelect = (company: Company) => {
    onCompanySelect(company);
    toast({
      title: "Unternehmen ausgewählt",
      description: `Lade Daten für ${company.name} (${company.symbol})`,
    });
  };

  if (!showDropdown) {
    return null;
  }

  // FIX: Show filtered companies, or first 100 companies if no search term
  const displayCompanies =
    searchTerm.length > 0 ? filteredCompanies : companies.slice(0, 100);

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border bg-secondary/50">
        {searchTerm.length > 0
          ? `${filteredCompanies.length} filtered results out of ${companies.length} companies`
          : `Showing first 100 of ${companies.length} companies`}
      </div>
      {displayCompanies.map((company, index) => (
        <button
          key={`${company.symbol}-${company.exchange}-${company.name}-${index}`}
          onClick={() => handleCompanySelect(company)}
          className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium">{company.symbol}</div>
              <div className="text-sm text-muted-foreground">
                {company.name}
              </div>
            </div>
            <div className="text-xs text-muted-foreground ml-2">
              {company.exchange}
            </div>
          </div>
        </button>
      ))}
      {searchTerm.length > 0 && filteredCompanies.length === 0 && (
        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
          No companies found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};
