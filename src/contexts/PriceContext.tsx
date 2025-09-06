import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '@/types/marketplace';
import { reflector, PriceData } from '@/lib/reflector';

interface PriceContextType {
  prices: PriceData;
  isConnected: boolean;
  convertToFiat: (amount: number, fromCurrency: string, toCurrency: Currency) => number;
  refreshPrices: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<PriceData>(reflector.getPrices());
  const [isConnected, setIsConnected] = useState(reflector.isReflectorConnected());

  // Initialize reflector and subscribe to price updates
  useEffect(() => {
    const initializeReflector = async () => {
      try {
        await reflector.initialize();
        setIsConnected(reflector.isReflectorConnected());
      } catch (error) {
        console.error('Failed to initialize price reflector:', error);
      }
    };

    // Initialize if not already connected
    if (!reflector.isReflectorConnected()) {
      initializeReflector();
    }

    const unsubscribe = reflector.subscribe((newPrices) => {
      setPrices(newPrices);
      setIsConnected(reflector.isReflectorConnected());
    });

    // Initial status check
    setIsConnected(reflector.isReflectorConnected());

    return unsubscribe;
  }, []);

  const convertToFiat = (amount: number, fromCurrency: string, toCurrency: Currency): number => {
    if (!amount || !prices[fromCurrency as keyof PriceData]) return 0;

    return reflector.convertCurrency(amount, fromCurrency as Currency, toCurrency);
  };

  const refreshPrices = async () => {
    try {
      await reflector.refreshPrices();
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    }
  };

  return (
    <PriceContext.Provider value={{
      prices,
      isConnected,
      convertToFiat,
      refreshPrices,
    }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrices() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  return context;
}
