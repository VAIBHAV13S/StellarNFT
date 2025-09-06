import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletState } from '@/types/marketplace';
import { createWalletConnection, WalletConnection, WalletType, StellarWalletConnection, WalletNetwork } from '@/lib/wallet';

interface WalletContextType {
  wallet: WalletState;
  walletConnection: WalletConnection | null;
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (xdr: string) => Promise<string>;
  isWalletAvailable: (walletType: WalletType) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    network: 'testnet',
  });
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);

  // Check if wallet was previously connected
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        // Check if any wallets are available first
        const freighterAvailable = await isWalletAvailable(WalletType.FREIGHTER);
        const xbullAvailable = await isWalletAvailable(WalletType.XBULL);

        if (!freighterAvailable && !xbullAvailable) {
          console.log('No Stellar wallets detected, skipping auto-connection');
          return;
        }

        // Try to restore previous connection only if wallets are available
        const savedWalletType = localStorage.getItem('wallet_type') as WalletType;
        if (savedWalletType) {
          const connection = createWalletConnection('stellar');
          await connection.connect();
          setWalletConnection(connection);
          setWallet({
            connected: true,
            address: connection.address || undefined,
            network: connection.network === WalletNetwork.TESTNET ? 'testnet' : 'mainnet',
          });
        }
      } catch (error) {
        console.error('Failed to restore wallet connection:', error);
        // Clear invalid saved data
        localStorage.removeItem('wallet_type');
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initializeWallet, 100);
    return () => clearTimeout(timer);
  }, []);

  const connectWallet = async (walletType?: WalletType) => {
    try {
      // Check if any wallets are available
      const freighterAvailable = await isWalletAvailable(WalletType.FREIGHTER);
      const xbullAvailable = await isWalletAvailable(WalletType.XBULL);

      if (!freighterAvailable && !xbullAvailable) {
        throw new Error('No Stellar wallets detected. Please install Freighter or xBull extension.');
      }

      // Create production wallet connection
      const connection = createWalletConnection('stellar');
      await connection.connect();

      setWalletConnection(connection);
      setWallet({
        connected: true,
        address: connection.address || undefined,
        network: connection.network === WalletNetwork.TESTNET ? 'testnet' : 'mainnet',
      });

      // Save wallet type for restoration
      if (walletType) {
        localStorage.setItem('wallet_type', walletType);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      if (walletConnection) {
        await walletConnection.disconnect();
        setWalletConnection(null);
      }

      setWallet({
        connected: false,
        network: 'testnet',
      });

      localStorage.removeItem('wallet_type');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    if (!walletConnection) {
      throw new Error('No wallet connected');
    }
    return await walletConnection.signTransaction(xdr);
  };

  const isWalletAvailable = async (walletType: WalletType): Promise<boolean> => {
    return await StellarWalletConnection.isWalletAvailable(walletType);
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      walletConnection,
      connectWallet,
      disconnectWallet,
      signTransaction,
      isWalletAvailable
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
