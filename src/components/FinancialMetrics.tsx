
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, PieChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StockData } from "@/types/StockData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface FinancialMetricsProps {
  data: StockData;
}

export const FinancialMetrics = ({ data }: FinancialMetricsProps) => {
  const { t } = useLanguage();
  
  const formatBillions = (value: number | null) => value === null ? "N/A" : `$${value.toFixed(1)}B`;
  const formatPercent = (value: number | null) => value === null ? "N/A" : `${value.toFixed(1)}%`;
  const formatRatio = (value: number | null) => value === null ? "N/A" : value.toFixed(2);

  const getTooltipContent = (metricType: string, metricName: string) => {
    const tooltips: Record<string, string> = {
      'peRatio': 'Price-to-Earnings ratio. Lower values may indicate undervalued stocks. Ideal range: 10-20.',
      'pbRatio': 'Price-to-Book ratio. Compares market value to book value. Lower is generally better.',
      'pegRatio': 'Price/Earnings to Growth ratio. Values under 1.0 may indicate undervalued growth stocks.',
      'priceToSales': 'Price-to-Sales ratio. Lower values may indicate better value.',
      'evToEbitda': 'Enterprise Value to EBITDA. Measures company value relative to earnings.',
      'marketCap': 'Total market value of all outstanding shares.',
      'revenue': 'Total income generated from business operations.',
      'revenueGrowth': 'Year-over-year revenue growth percentage. Higher is better.',
      'netIncome': 'Company\'s total profit after all expenses and taxes.',
      'netIncomeGrowth': 'Year-over-year net income growth percentage.',
      'ebitda': 'Earnings Before Interest, Taxes, Depreciation, and Amortization.',
      'freeCashFlow': 'Cash generated after capital expenditures. Higher indicates better financial health.',
      'roe': 'Return on Equity. Measures profitability relative to shareholders\' equity. Higher is better.',
      'roa': 'Return on Assets. Measures how efficiently assets generate profit.',
      'roic': 'Return on Invested Capital. Measures efficiency of capital allocation.',
      'nopat': 'Net Operating Profit After Tax. Operating profit after removing tax effects.',
      'grossMargin': 'Gross profit as percentage of revenue. Higher indicates better cost control.',
      'operatingMargin': 'Operating income as percentage of revenue.',
      'netMargin': 'Net income as percentage of revenue. Higher indicates better profitability.',
      'currentRatio': 'Current assets divided by current liabilities. Above 1.5 is generally good.',
      'quickRatio': 'Quick assets divided by current liabilities. Above 1.0 is good.',
      'debtToEquity': 'Total debt divided by shareholders\' equity. Lower is generally better.',
      'debtToAssets': 'Total debt as percentage of total assets. Lower indicates less financial risk.',
      'interestCoverage': 'Ability to pay interest on debt. Higher values indicate better financial health.',
      'workingCapital': 'Current assets minus current liabilities. Indicates short-term financial health.',
      'dividendYield': 'Annual dividends per share divided by stock price. Higher provides more income.',
      'dividendGrowth': 'Year-over-year dividend growth percentage.',
      'payoutRatio': 'Percentage of earnings paid as dividends. 30-60% is typically sustainable.',
      'earningsGrowth5Y': 'Average annual earnings growth over 5 years.',
      'revenueGrowth5Y': 'Average annual revenue growth over 5 years.',
      'beta': 'Measures stock volatility relative to market. 1.0 = market volatility.',
      'bookValuePerShare': 'Company\'s book value divided by shares outstanding. Higher indicates more asset backing.',
      'tangibleBookValue': 'Book value minus intangible assets. Represents real, physical asset value.',
      'cashPerShare': 'Total cash and short-term investments divided by shares outstanding.'
    };
    
    return tooltips[metricName] || `${metricName} metric information`;
  };

  const MetricItem = ({ label, value, icon: Icon, metricKey }: { label: string; value: string; icon: any; metricKey: string }) => (
    <TooltipProvider>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium cursor-help hover:text-primary transition-colors flex items-center gap-1">
                {label}
                <Info className="h-3 w-3 opacity-50" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{getTooltipContent('metric', metricKey)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-sm font-bold">{value}</span>
      </div>
    </TooltipProvider>
  );

  const metrics = [
    {
      title: t('metrics.valuation'),
      items: [
        { label: t('metrics.peRatio'), value: formatRatio(data.peRatio), icon: Percent, key: 'peRatio' },
        { label: t('metrics.pbRatio'), value: formatRatio(data.pbRatio), icon: Percent, key: 'pbRatio' },
        { label: "PEG Ratio", value: formatRatio(data.pegRatio), icon: Percent, key: 'pegRatio' },
        { label: "Price/Sales", value: formatRatio(data.priceToSales), icon: Percent, key: 'priceToSales' },
        { label: "EV/EBITDA", value: formatRatio(data.evToEbitda), icon: Percent, key: 'evToEbitda' },
        { label: t('metrics.marketCap'), value: formatBillions(data.marketCap), icon: DollarSign, key: 'marketCap' },
      ]
    },
    {
      title: t('metrics.performance'),
      items: [
        { label: t('metrics.revenue'), value: formatBillions(data.revenue), icon: TrendingUp, key: 'revenue' },
        { label: "Revenue Growth", value: formatPercent(data.revenueGrowth), icon: data.revenueGrowth && data.revenueGrowth > 0 ? TrendingUp : TrendingDown, key: 'revenueGrowth' },
        { label: t('metrics.netIncome'), value: formatBillions(data.netIncome), icon: DollarSign, key: 'netIncome' },
        { label: "Earnings Growth", value: formatPercent(data.netIncomeGrowth), icon: data.netIncomeGrowth && data.netIncomeGrowth > 0 ? TrendingUp : TrendingDown, key: 'netIncomeGrowth' },
        { label: "EBITDA", value: formatBillions(data.ebitda), icon: TrendingUp, key: 'ebitda' },
        { label: t('metrics.freeCashFlow'), value: formatBillions(data.freeCashFlow), icon: TrendingUp, key: 'freeCashFlow' },
      ]
    },
    {
      title: t('metrics.profitability'),
      items: [
        { label: t('metrics.roe'), value: formatPercent(data.roe), icon: TrendingUp, key: 'roe' },
        { label: t('metrics.roa'), value: formatPercent(data.roa), icon: TrendingUp, key: 'roa' },
        { label: "ROIC", value: formatPercent(data.roic), icon: TrendingUp, key: 'roic' },
        { label: "NOPAT", value: formatBillions(data.nopat), icon: DollarSign, key: 'nopat' },
        { label: "Gross Margin", value: formatPercent(data.grossMargin), icon: BarChart3, key: 'grossMargin' },
        { label: "Operating Margin", value: formatPercent(data.operatingMargin), icon: BarChart3, key: 'operatingMargin' },
        { label: "Net Margin", value: formatPercent(data.netMargin), icon: BarChart3, key: 'netMargin' },
      ]
    },
    {
      title: t('metrics.health'),
      items: [
        { label: t('metrics.currentRatio'), value: formatRatio(data.currentRatio), icon: data.currentRatio && data.currentRatio > 1.5 ? TrendingUp : TrendingDown, key: 'currentRatio' },
        { label: "Quick Ratio", value: formatRatio(data.quickRatio), icon: data.quickRatio && data.quickRatio > 1 ? TrendingUp : TrendingDown, key: 'quickRatio' },
        { label: t('metrics.debtToEquity'), value: formatRatio(data.debtToEquity), icon: data.debtToEquity && data.debtToEquity < 0.5 ? TrendingUp : TrendingDown, key: 'debtToEquity' },
        { label: "Debt/Assets", value: data.debtToAssets ? formatPercent(data.debtToAssets * 100) : "N/A", icon: data.debtToAssets && data.debtToAssets < 0.3 ? TrendingUp : TrendingDown, key: 'debtToAssets' },
        { label: "Interest Coverage", value: formatRatio(data.interestCoverage), icon: data.interestCoverage && data.interestCoverage > 5 ? TrendingUp : TrendingDown, key: 'interestCoverage' },
        { label: "Working Capital", value: formatBillions(data.workingCapital), icon: DollarSign, key: 'workingCapital' },
      ]
    },
    {
      title: "Book Value & Cash",
      items: [
        { label: "Book Value/Share", value: formatRatio(data.bookValuePerShare), icon: DollarSign, key: 'bookValuePerShare' },
        { label: "Tangible Book Value", value: formatBillions(data.tangibleBookValue), icon: DollarSign, key: 'tangibleBookValue' },
        { label: "Cash per Share", value: formatRatio(data.cashPerShare), icon: DollarSign, key: 'cashPerShare' },
      ]
    },
    {
      title: "Growth & Dividends",
      items: [
        { label: t('metrics.dividendYield'), value: formatPercent(data.dividendYield), icon: Percent, key: 'dividendYield' },
        { label: "Dividend Growth", value: formatPercent(data.dividendGrowthRate), icon: data.dividendGrowthRate && data.dividendGrowthRate > 0 ? TrendingUp : TrendingDown, key: 'dividendGrowth' },
        { label: "Payout Ratio", value: formatPercent(data.payoutRatio), icon: Percent, key: 'payoutRatio' },
        { label: "5Y Earnings Growth", value: formatPercent(data.earningsGrowth5Y), icon: data.earningsGrowth5Y && data.earningsGrowth5Y > 0 ? TrendingUp : TrendingDown, key: 'earningsGrowth5Y' },
        { label: "5Y Revenue Growth", value: formatPercent(data.revenueGrowth5Y), icon: data.revenueGrowth5Y && data.revenueGrowth5Y > 0 ? TrendingUp : TrendingDown, key: 'revenueGrowth5Y' },
        { label: "Beta", value: formatRatio(data.beta), icon: PieChart, key: 'beta' },
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {metrics.map((section, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <MetricItem 
                  key={itemIndex}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  metricKey={item.key}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
