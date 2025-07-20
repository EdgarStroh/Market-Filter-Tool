interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class DataCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  // Default cache duration: 5 minutes
  private defaultTTL = 5 * 60 * 1000;

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    };
    
    this.cache.set(key, item);
    
    // Schedule cleanup
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  keys(): string[] {
    // Clean expired items first
    this.cleanExpired();
    return Array.from(this.cache.keys());
  }

  size(): number {
    this.cleanExpired();
    return this.cache.size;
  }

  private cleanExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiresIn) {
        this.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    this.cleanExpired();
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemoryEstimate: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): string {
    const jsonString = JSON.stringify(Array.from(this.cache.entries()));
    const bytes = new TextEncoder().encode(jsonString).length;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// Create singleton instance
export const dataCache = new DataCache();

// Cache key generators
export const cacheKeys = {
  stockData: (symbol: string) => `stock_data_${symbol}`,
  companyFundamentals: (symbol: string) => `fundamentals_${symbol}`,
  realTimePrice: (symbol: string) => `price_${symbol}`,
  exchangeSymbols: (exchange: string) => `exchange_${exchange}`,
  sectorData: (sector: string) => `sector_${sector}`,
  rankings: (type: string) => `rankings_${type}`
};

// Wrapper function for caching API calls
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = dataCache.get<T>(key);
  if (cached !== null) {
    
    return cached;
  }

  
  
  try {
    const data = await fetchFn();
    dataCache.set(key, data, ttl);
    return data;
  } catch (error) {
    
    throw error;
  }
}