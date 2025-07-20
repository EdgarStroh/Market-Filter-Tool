
import { fetchCompanyFundamentals, fetchRealTimePrice } from "@/services/eodhd";
import { convertEODHDToStockData } from "@/utils/eodhd-adapter";
import { saveToFirebase } from "@/utils/firebaseService";
import {
  calculateBuffettScore,
  calculateGrahamScore,
  calculateLynchScore,
  calculateGreenblattScore,
  calculateTempletonScore,
  calculateMarksScore,
  calculateAverageFairValue
} from "@/utils/investmentStrategies";

interface Company {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry?: string;
}

interface ProgressCallback {
  completed: number;
  total: number;
  currentSymbol: string;
}

const calculateAllScores = (data: any) => {
  const strategies = [
    { name: "Warren Buffett", score: calculateBuffettScore(data) },
    { name: "Benjamin Graham", score: calculateGrahamScore(data) },
    { name: "Peter Lynch", score: calculateLynchScore(data) },
    { name: "Joel Greenblatt", score: calculateGreenblattScore(data) },
    { name: "John Templeton", score: calculateTempletonScore(data) },
    { name: "Howard Marks", score: calculateMarksScore(data) }
  ];

  const overallScore = Math.round(strategies.reduce((sum, s) => sum + s.score, 0) / strategies.length);
  const topStrategy = strategies.reduce((best, current) => 
    current.score > best.score ? current : best
  ).name;

  return { overallScore, topStrategy, strategies };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Safe formatting utility function
const safeFormatPrice = (value: any): string => {
  // Handle complex objects like { "_type": "Number", "value": "NaN" }
  if (value && typeof value === 'object' && value.value !== undefined) {
    value = value.value;
  }
  
  // Convert to number if it's a string
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return '0.00';
    value = parsed;
  }
  
  // Check if it's a valid number
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return '0.00';
  }
  
  return value.toFixed(2);
};

// Helper function to normalize company names for deduplication
const normalizeCompanyName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+(ltd\.?|limited|inc\.?|corp\.?|corporation|co\.?|company)$/i, '')
    .replace(/[^\w\s]/g, '')
    .trim();
};

// Deduplicate companies by normalized name, keeping the first occurrence
const deduplicateCompanies = (companies: Company[]): Company[] => {
  const seen = new Set<string>();
  const unique: Company[] = [];
  
  for (const company of companies) {
    const normalizedName = normalizeCompanyName(company.name);
    if (!seen.has(normalizedName)) {
      seen.add(normalizedName);
      unique.push(company);
    } else {
      
    }
  }
  
  return unique;
};

export const processBatchAnalysis = async (
  companies: Company[], 
  onProgress?: (progress: ProgressCallback) => void
): Promise<void> => {
  // Remove duplicates before processing
  const uniqueCompanies = deduplicateCompanies(companies);
  
  
  const batchSize = 5; // Smaller batch size for API calls
  const delayBetweenBatches = 2000; // Increased delay to respect rate limits
  const delayBetweenCompanies = 500; // Increased delay between individual calls

  let completed = 0;
  const total = uniqueCompanies.length;

  for (let i = 0; i < uniqueCompanies.length; i += batchSize) {
    const batch = uniqueCompanies.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (company, batchIndex) => {
      try {
        await delay(batchIndex * delayBetweenCompanies);
        
        if (onProgress) {
          onProgress({
            completed,
            total,
            currentSymbol: company.symbol
          });
        }

        

        // Fetch real data from EODHD
        const [fundamentals, price] = await Promise.all([
          fetchCompanyFundamentals(company.symbol),
          fetchRealTimePrice(company.symbol)
        ]);

        if (!fundamentals) {
          
          completed++;
          return;
        }

        const stockData = convertEODHDToStockData(company.symbol, fundamentals, price || undefined);
        const { overallScore, topStrategy } = calculateAllScores(stockData);
        
        // Calculate price targets (same logic as StockDashboard.tsx)
        const averageTarget = calculateAverageFairValue(stockData);
        const currentPrice = stockData.price || 0;
        
        // SKIP COMPANIES WITH PRICE UNDER $1
        if (currentPrice < 1.0) {
          
          completed++;
          return;
        }
        
        const upside = currentPrice > 0 ? ((averageTarget - currentPrice) / currentPrice) * 100 : 0;
        
        
        // Explicit dividendYield handling with fallbacks
        let finalDividendYield: number | null = null;
        
        if (stockData.dividendYield !== null && stockData.dividendYield !== undefined) {
          if (typeof stockData.dividendYield === 'string') {
            const parsed = parseFloat(stockData.dividendYield);
            finalDividendYield = isNaN(parsed) ? null : parsed;
          } else if (typeof stockData.dividendYield === 'number' && !isNaN(stockData.dividendYield)) {
            finalDividendYield = stockData.dividendYield;
          }
        }
        
        
        const result = {
          symbol: company.symbol,
          name: stockData.name || company.name,
          sector: stockData.sector || company.sector,
          industry: stockData.industry || company.industry,
          overallScore,
          topStrategy,
          analysisDate: new Date().toISOString(),
          dividendYield: finalDividendYield,
          currentPrice,
          averageTarget,
          upside
        };
        

        try {
          await saveToFirebase(result);
        } catch (saveError) {
        }

        completed++;
        
        if (onProgress) {
          onProgress({
            completed,
            total,
            currentSymbol: company.symbol
          });
        }

      } catch (error) {
        completed++;
      }
    });

    await Promise.allSettled(batchPromises);
    
    if (i + batchSize < uniqueCompanies.length) {
      await delay(delayBetweenBatches);
    }
  }

  window.dispatchEvent(new CustomEvent('topTenUpdated'));
  
};
