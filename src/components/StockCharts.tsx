
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  revenue: number;
  netIncome: number;
  totalDebt: number;
  totalEquity: number;
  freeCashFlow: number;
  dividendYield: number;
  roe: number;
  roa: number;
  currentRatio: number;
  debtToEquity: number;
}

interface StockChartsProps {
  symbol: string;
  data: StockData;
}

export const StockCharts = ({ symbol, data }: StockChartsProps) => {
  const { t } = useLanguage();

  // Mock historical data for charts
  const revenueData = Array.from({ length: 5 }, (_, i) => ({
    year: `Year ${i + 1}`,
    revenue: data.revenue * (0.8 + i * 0.15) + Math.random() * 10,
    netIncome: data.netIncome * (0.7 + i * 0.2) + Math.random() * 5,
  }));

  const financialHealthData = [
    { name: t('charts.totalEquity'), value: data.totalEquity, color: "hsl(142, 76%, 36%)" }, // Green
    { name: t('charts.totalDebt'), value: data.totalDebt, color: "hsl(346, 87%, 43%)" }, // Red
  ];

  const profitabilityData = Array.from({ length: 5 }, (_, i) => ({
    year: `Year ${i + 1}`,
    roe: data.roe * (0.8 + i * 0.1) + Math.random() * 3,
    roa: data.roa * (0.9 + i * 0.05) + Math.random() * 2,
  }));

  const chartConfig = {
    revenue: {
      label: t('metrics.revenue'),
      color: "hsl(var(--primary))",
    },
    netIncome: {
      label: t('metrics.netIncome'), 
      color: "hsl(142, 76%, 36%)", // Green
    },
    roe: {
      label: t('metrics.roe'),
      color: "hsl(var(--primary))",
    },
    roa: {
      label: t('metrics.roa'),
      color: "hsl(142, 76%, 36%)", // Green
    },
  };

  const ChartWithTooltip = ({ title, children, tooltipText }: { title: string; children: React.ReactNode; tooltipText: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Revenue and Income Trends */}
      <ChartWithTooltip 
        title={t('charts.revenueIncome')}
        tooltipText="This chart shows the company's revenue and net income trends over the past 5 years, helping identify growth patterns and profitability evolution."
      >
        <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[350px]">
          <BarChart data={revenueData}>
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" name={`${t('metrics.revenue')} ($B)`} />
            <Bar dataKey="netIncome" fill="var(--color-netIncome)" name={`${t('metrics.netIncome')} ($B)`} />
          </BarChart>
        </ChartContainer>
      </ChartWithTooltip>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Financial Health */}
        <ChartWithTooltip
          title={t('charts.financialStructure')}
          tooltipText="This pie chart displays the company's capital structure, showing the proportion of debt versus equity financing. A balanced structure indicates financial stability."
        >
          <div className="h-[200px] sm:h-[250px] lg:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {financialHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
                      return (
                        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                          <p className="font-medium">{payload[0].name}</p>
                          <p className="text-primary">${numericValue.toFixed(1)}B</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTooltip>

        {/* Profitability Trends */}
        <ChartWithTooltip
          title={t('charts.profitabilityTrends')}
          tooltipText="This line chart tracks Return on Equity (ROE) and Return on Assets (ROA) over time, key indicators of management efficiency and profitability."
        >
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[280px]">
            <LineChart data={profitabilityData}>
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="roe" 
                stroke="var(--color-roe)" 
                strokeWidth={2}
                name={`${t('metrics.roe')} (%)`}
              />
              <Line 
                type="monotone" 
                dataKey="roa" 
                stroke="var(--color-roa)" 
                strokeWidth={2}
                name={`${t('metrics.roa')} (%)`}
              />
            </LineChart>
          </ChartContainer>
        </ChartWithTooltip>
      </div>
    </div>
  );
};
