export interface CompanyResult {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  isin?: string;
  overallScore: number;
  topStrategy: string;
  analysisDate: string;
  dividendYield: number | null;
  currentPrice?: number;
  averageTarget?: number;
  upside?: number;
}

const FIREBASE_URL = 'https://market-filter-tool-default-rtdb.europe-west1.firebasedatabase.app';

export const saveToFirebase = async (result: CompanyResult): Promise<void> => {
  try {
    // console.log('Saving to Firebase:', result);
    
    // Save to multiple lists: top300, sector-specific top30, dividend top100, and upside top100
    await Promise.all([
      saveToTop300(result),
      saveToSectorRanking(result),
      saveToDividendRanking(result),
      saveToUpsideRanking(result)
    ]);

    // console.log('Data saved to all Firebase lists successfully');
  } catch (error) {
    // console.error('Error saving to Firebase:', error);
    throw error;
  }
};

const saveToTop300 = async (result: CompanyResult): Promise<void> => {
  const response = await fetch(`${FIREBASE_URL}/top300.json`, {
    method: 'GET',
  });
  
  let existingData: CompanyResult[] = [];
  if (response.ok) {
    const data = await response.json();
    if (Array.isArray(data)) {
      existingData = data;
    } else if (data && typeof data === 'object') {
      existingData = Object.values(data);
    }
  }

  // Remove duplicates and add new result
  const filtered = existingData.filter((item: CompanyResult) => 
    item && item.symbol && item.symbol.toUpperCase() !== result.symbol.toUpperCase()
  );
  
  const withNewResult = [...filtered, result];
  const deduplicated = deduplicateResults(withNewResult);

  // Sort by score and keep top 300
  const updated = deduplicated
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 300);

  await fetch(`${FIREBASE_URL}/top300.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
};

const saveToSectorRanking = async (result: CompanyResult): Promise<void> => {
  const sectorKey = result.sector.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const response = await fetch(`${FIREBASE_URL}/sectors/${sectorKey}.json`, {
    method: 'GET',
  });
  
  let existingData: CompanyResult[] = [];
  if (response.ok) {
    const data = await response.json();
    if (Array.isArray(data)) {
      existingData = data;
    } else if (data && typeof data === 'object') {
      existingData = Object.values(data);
    }
  }

  // Remove duplicates and add new result
  const filtered = existingData.filter((item: CompanyResult) => 
    item && item.symbol && item.symbol.toUpperCase() !== result.symbol.toUpperCase()
  );
  
  const withNewResult = [...filtered, result];
  const deduplicated = deduplicateResults(withNewResult);

  // Sort by score and keep top 30
  const updated = deduplicated
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 30);

  await fetch(`${FIREBASE_URL}/sectors/${sectorKey}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
};

const saveToDividendRanking = async (result: CompanyResult): Promise<void> => {
  // console.log(`Checking dividend data for ${result.symbol}:`, {
  //   dividendYield: result.dividendYield,
  //   willSave: result.dividendYield && result.dividendYield > 0
  // });
  
  // Only save companies with dividend yield > 0
  if (!result.dividendYield || result.dividendYield <= 0) {
    // console.log(`Skipping ${result.symbol} for dividend ranking - no dividend (${result.dividendYield})`);
    return;
  }

  // console.log(`Saving ${result.symbol} to dividend ranking with yield: ${result.dividendYield}%`);
  
  const response = await fetch(`${FIREBASE_URL}/dividends.json`, {
    method: 'GET',
  });
  
  let existingData: CompanyResult[] = [];
  if (response.ok) {
    const data = await response.json();
    if (Array.isArray(data)) {
      existingData = data;
    } else if (data && typeof data === 'object') {
      existingData = Object.values(data);
    }
  }

  // Remove duplicates and add new result
  const filtered = existingData.filter((item: CompanyResult) => 
    item && item.symbol && item.symbol.toUpperCase() !== result.symbol.toUpperCase()
  );
  
  const withNewResult = [...filtered, result];
  const deduplicated = deduplicateResults(withNewResult);

  // Sort by dividend yield (highest first) and keep top 300
  // Filter out unrealistic dividend yields (>25%)
  const updated = deduplicated
    .filter(item => item.dividendYield && item.dividendYield > 0 && item.dividendYield <= 25)
    .sort((a, b) => (b.dividendYield || 0) - (a.dividendYield || 0))
    .slice(0, 300);

  // console.log(`Updated dividend ranking will contain ${updated.length} companies`);
  // console.log('Top 5 dividend companies:', updated.slice(0, 5).map(c => ({
  //   symbol: c.symbol,
  //   name: c.name,
  //   dividendYield: c.dividendYield
  // })));

  await fetch(`${FIREBASE_URL}/dividends.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
};

const saveToUpsideRanking = async (result: CompanyResult): Promise<void> => {
  // console.log(`Checking upside data for ${result.symbol}:`, {
  //   upside: result.upside,
  //   willSave: result.upside !== undefined && result.upside !== null
  // });
  
  // Only save companies with upside data
  if (result.upside === undefined || result.upside === null) {
    // console.log(`Skipping ${result.symbol} for upside ranking - no upside data`);
    return;
  }

  // console.log(`Saving ${result.symbol} to upside ranking with upside: ${result.upside}%`);
  
  const response = await fetch(`${FIREBASE_URL}/upside.json`, {
    method: 'GET',
  });
  
  let existingData: CompanyResult[] = [];
  if (response.ok) {
    const data = await response.json();
    if (Array.isArray(data)) {
      existingData = data;
    } else if (data && typeof data === 'object') {
      existingData = Object.values(data);
    }
  }

  // Remove duplicates and add new result
  const filtered = existingData.filter((item: CompanyResult) => 
    item && item.symbol && item.symbol.toUpperCase() !== result.symbol.toUpperCase()
  );
  
  const withNewResult = [...filtered, result];
  const deduplicated = deduplicateResults(withNewResult);

  // Sort by upside (highest first) and keep top 300
  const updated = deduplicated
    .filter(item => item.upside !== undefined && item.upside !== null)
    .sort((a, b) => (b.upside || 0) - (a.upside || 0))
    .slice(0, 300);

  // console.log(`Updated upside ranking will contain ${updated.length} companies`);
  // console.log('Top 5 upside companies:', updated.slice(0, 5).map(c => ({
  //   symbol: c.symbol,
  //   name: c.name,
  //   upside: c.upside
  // })));

  await fetch(`${FIREBASE_URL}/upside.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
};

const deduplicateResults = (results: CompanyResult[]): CompanyResult[] => {
  const normalizeCompanyName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+(ltd\.?|limited|inc\.?|corp\.?|corporation|co\.?|company)$/i, '')
      .replace(/[^\w\s]/g, '')
      .trim();
  };
  
  const seen = new Set<string>();
  return results.filter(item => {
    const normalizedName = normalizeCompanyName(item.name);
    if (seen.has(normalizedName)) {
      // console.log(`Removing duplicate from results: ${item.symbol} (${item.name})`);
      return false;
    }
    seen.add(normalizedName);
    return true;
  });
};

export const loadFromFirebase = async (listType: 'top300' | 'dividends' | 'upside' | string = 'top300'): Promise<CompanyResult[]> => {
  try {
    let url = `${FIREBASE_URL}/top300.json`;
    
    if (listType === 'dividends') {
      url = `${FIREBASE_URL}/dividends.json`;
    } else if (listType === 'upside') {
      url = `${FIREBASE_URL}/upside.json`;
    } else if (listType.startsWith('sector-')) {
      const sectorKey = listType.replace('sector-', '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      url = `${FIREBASE_URL}/sectors/${sectorKey}.json`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from Firebase');
    }
    
    const data = await response.json();
    let results: any[] = [];
    
    if (Array.isArray(data)) {
      results = data;
    } else if (data && typeof data === 'object') {
      results = Object.values(data);
    }
    
    // Ensure data is properly sorted when loaded with proper type checking
    const sortedResults = results
      .filter((item): item is CompanyResult => 
        item !== null && 
        item !== undefined && 
        typeof item === 'object' &&
        'symbol' in item &&
        'name' in item &&
        'sector' in item &&
        'overallScore' in item &&
        'topStrategy' in item &&
        'analysisDate' in item &&
        typeof item.symbol === 'string' &&
        typeof item.name === 'string' &&
        typeof item.sector === 'string' &&
        typeof item.overallScore === 'number' &&
        typeof item.topStrategy === 'string' &&
        typeof item.analysisDate === 'string'
      )
      .sort((a, b) => {
        if (listType === 'dividends') {
          return (b.dividendYield || 0) - (a.dividendYield || 0);
        } else if (listType === 'upside') {
          return (b.upside || 0) - (a.upside || 0);
        }
        return b.overallScore - a.overallScore;
      });
    
    // console.log(`Loaded and sorted data from Firebase (${listType}):`, sortedResults);
    return sortedResults;
  } catch (error) {
    // console.error('Error loading from Firebase:', error);
    throw error;
  }
};

export const loadAllSectors = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${FIREBASE_URL}/sectors.json`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data ? Object.keys(data) : [];
  } catch (error) {
    // console.error('Error loading sectors from Firebase:', error);
    return [];
  }
};
