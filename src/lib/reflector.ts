import { Currency } from '@/types/marketplace';

export interface PriceData {
  XLM: number;
  KALE: number;
  USD: number;
  EUR: number;
  INR: number;
}

export interface ReflectorConfig {
  enabled: boolean;
  updateInterval: number; // in milliseconds
  fallbackPrices: PriceData;
  apiEndpoints: {
    stellarPrice: string;
    fiatRates: string;
  };
}

export class ReflectorService {
  private config: ReflectorConfig;
  private updateInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private currentPrices: PriceData;
  private subscribers: Array<(prices: PriceData) => void> = [];

  constructor(config?: Partial<ReflectorConfig>) {
    this.config = {
      enabled: true,
      updateInterval: 30000, // 30 seconds
      fallbackPrices: {
        XLM: 0.3,
        KALE: 1.0,
        USD: 1.0,
        EUR: 0.85,
        INR: 83.0,
      },
      apiEndpoints: {
        stellarPrice: 'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
        fiatRates: 'https://api.exchangerate-api.com/v4/latest/USD',
      },
      ...config,
    };

    this.currentPrices = { ...this.config.fallbackPrices };
  }

  /**
   * Initialize the reflector service
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('Reflector: Service disabled');
      return;
    }

    try {
      console.log('Reflector: Initializing price feed...');
      await this.updatePrices();
      this.startPeriodicUpdates();
      this.isConnected = true;
      console.log('Reflector: Price feed active');
    } catch (error) {
      console.error('Reflector: Failed to initialize:', error);
      this.isConnected = false;
    }
  }

  /**
   * Start periodic price updates
   */
  private startPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        await this.updatePrices();
      } catch (error) {
        console.error('Reflector: Price update failed:', error);
      }
    }, this.config.updateInterval);
  }

  /**
   * Stop periodic updates
   */
  stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Fetch current prices from external APIs
   */
  private async updatePrices(): Promise<void> {
    try {
      const [stellarPrice, fiatRates] = await Promise.allSettled([
        this.fetchStellarPrice(),
        this.fetchFiatRates(),
      ]);

      const newPrices = {
        ...this.currentPrices,
        // Update XLM price
        ...(stellarPrice.status === 'fulfilled' && stellarPrice.value && { XLM: stellarPrice.value }),
        // Update fiat rates
        ...(fiatRates.status === 'fulfilled' && fiatRates.value && {
          EUR: fiatRates.value.EUR || this.currentPrices.EUR,
          INR: fiatRates.value.INR || this.currentPrices.INR,
        }),
        // Add some realistic volatility to KALE (since it's a demo token)
        KALE: this.currentPrices.KALE + (Math.random() - 0.5) * 0.02,
      };

      this.currentPrices = newPrices;
      this.notifySubscribers();
    } catch (error) {
      console.error('Reflector: Price update error:', error);
      throw error;
    }
  }

  /**
   * Fetch Stellar (XLM) price from CoinGecko
   */
  private async fetchStellarPrice(): Promise<number> {
    try {
      const response = await fetch(this.config.apiEndpoints.stellarPrice);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.stellar?.usd || this.config.fallbackPrices.XLM;
    } catch (error) {
      console.warn('Reflector: Failed to fetch Stellar price, using fallback');
      return this.config.fallbackPrices.XLM;
    }
  }

  /**
   * Fetch fiat exchange rates
   */
  private async fetchFiatRates(): Promise<{ EUR: number; INR: number }> {
    try {
      const response = await fetch(this.config.apiEndpoints.fiatRates);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        EUR: data.rates?.EUR || this.config.fallbackPrices.EUR,
        INR: data.rates?.INR || this.config.fallbackPrices.INR,
      };
    } catch (error) {
      console.warn('Reflector: Failed to fetch fiat rates, using fallback');
      return {
        EUR: this.config.fallbackPrices.EUR,
        INR: this.config.fallbackPrices.INR,
      };
    }
  }

  /**
   * Get current prices
   */
  getPrices(): PriceData {
    return { ...this.currentPrices };
  }

  /**
   * Check if reflector is connected
   */
  isReflectorConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Convert currency using current prices
   */
  convertCurrency(amount: number, from: Currency, to: Currency): number {
    if (amount <= 0) return 0;

    // Convert to USD first
    let usdValue: number;
    switch (from) {
      case 'XLM':
        usdValue = amount * this.currentPrices.XLM;
        break;
      case 'KALE':
        usdValue = amount * this.currentPrices.KALE;
        break;
      case 'USD':
        usdValue = amount;
        break;
      case 'EUR':
        usdValue = amount / this.currentPrices.EUR;
        break;
      case 'INR':
        usdValue = amount / this.currentPrices.INR;
        break;
      default:
        return 0;
    }

    // Convert from USD to target currency
    switch (to) {
      case 'XLM':
        return usdValue / this.currentPrices.XLM;
      case 'KALE':
        return usdValue / this.currentPrices.KALE;
      case 'USD':
        return usdValue;
      case 'EUR':
        return usdValue * this.currentPrices.EUR;
      case 'INR':
        return usdValue * this.currentPrices.INR;
      default:
        return 0;
    }
  }

  /**
   * Subscribe to price updates
   */
  subscribe(callback: (prices: PriceData) => void): () => void {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of price updates
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.getPrices());
      } catch (error) {
        console.error('Reflector: Subscriber callback error:', error);
      }
    });
  }

  /**
   * Force refresh prices
   */
  async refreshPrices(): Promise<void> {
    await this.updatePrices();
  }

  /**
   * Get reflector status information
   */
  getStatus(): {
    connected: boolean;
    lastUpdate: Date;
    prices: PriceData;
    subscriberCount: number;
  } {
    return {
      connected: this.isConnected,
      lastUpdate: new Date(),
      prices: this.getPrices(),
      subscriberCount: this.subscribers.length,
    };
  }
}

// Export singleton instance
export const reflector = new ReflectorService();

// Auto-initialize if enabled (commented out to prevent startup issues)
// if (reflector['config'].enabled) {
//   reflector.initialize().catch(console.error);
// }
