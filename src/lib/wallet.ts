import { Keypair, TransactionBuilder, Networks } from '@stellar/stellar-sdk';
import {
  Wallet,
  StellarConfiguration,
  ApplicationConfiguration,
  DefaultSigner
} from '@stellar/typescript-wallet-sdk';
import { xBullModule, XBULL_ID } from '@creit.tech/stellar-wallets-kit';

// Define our own network enum since SDK doesn't export WalletNetwork
export enum WalletNetwork {
  TESTNET = 'testnet',
  MAINNET = 'mainnet'
}

// Define wallet types manually since they're not exported
export enum WalletType {
  FREIGHTER = 'freighter',
  XBULL = 'xbull',
  WALLET_CONNECT = 'wallet-connect'
}

// Define wallet option interface
interface WalletOption {
  id: string;
  name: string;
}

// Define global window extensions for wallets
interface FreighterAPI {
  isConnected(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getPublicKey(): Promise<string>;
}

interface XBULLAPI {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
}

interface WindowWithWallets extends Window {
  freighter?: FreighterAPI;
  xBull?: XBULLAPI;
}

export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  network: WalletNetwork;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction(xdr: string): Promise<string>;
  getPublicKey(): string | null;
  getNetwork(): WalletNetwork;
}

export class StellarWalletConnection implements WalletConnection {
  private wallet: Wallet;
  private _isConnected: boolean = false;
  private _address: string | null = null;
  private _network: WalletNetwork;
  private selectedWalletType: WalletType | null = null;

  constructor(network: WalletNetwork = WalletNetwork.TESTNET) {
    this._network = network;

    // Create wallet instance with official SDK
    if (network === WalletNetwork.TESTNET) {
      this.wallet = Wallet.TestNet();
    } else {
      this.wallet = new Wallet({
        stellarConfiguration: StellarConfiguration.MainNet(),
      });
    }
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  get address(): string | null {
    return this._address;
  }

  get network(): WalletNetwork {
    return this._network;
  }

  async connect(): Promise<void> {
    try {
      // For now, keep the existing manual wallet detection
      // The official SDK doesn't provide modal-based wallet selection
      // We'll enhance this with SEP support later
      const availableWallets = await this.getAvailableWallets();

      if (availableWallets.length === 0) {
        throw new Error('No Stellar wallets detected. Please install Freighter or xBull.');
      }

      // For simplicity, connect to the first available wallet
      // In a real app, you'd show a selection modal
      const selectedWallet = availableWallets[0];
      this.selectedWalletType = this.mapWalletOptionToType(selectedWallet);
      const { address } = await this.connectToWallet(selectedWallet);
      this._address = address;
      this._isConnected = true;
      console.log(`Connected to ${this.selectedWalletType} wallet:`, address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.selectedWalletType && this._address) {
        await this.disconnectFromWallet();
      }
      this._isConnected = false;
      this._address = null;
      this.selectedWalletType = null;
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      throw error;
    }
  }

  async signTransaction(xdr: string): Promise<string> {
    if (!this._isConnected || !this._address || !this.selectedWalletType) {
      throw new Error('Wallet not connected');
    }

    try {
      // For now, use the existing manual signing approach
      // The official SDK provides better signing through wallet extensions
      // We'll enhance this with proper SEP support later
      const globalWindow = window as unknown as Record<string, unknown>;

      switch (this.selectedWalletType) {
        case WalletType.FREIGHTER:
          if (globalWindow.freighter && typeof (globalWindow.freighter as Record<string, unknown>).signTransaction === 'function') {
            const result = await ((globalWindow.freighter as Record<string, unknown>).signTransaction as (xdr: string, options: { networkPassphrase: string }) => Promise<{ signedTxXdr: string } | string>)(xdr, {
              networkPassphrase: this._network === WalletNetwork.TESTNET ? Networks.TESTNET : Networks.PUBLIC,
            });
            return typeof result === 'string' ? result : result.signedTxXdr;
          }
          break;
        case WalletType.XBULL: {
          // xBull signing implementation with manual API
          const globalWindow = window as unknown as Record<string, unknown>;
          const xBullAPI = globalWindow.xBull || globalWindow.xbull || globalWindow.xBullSDK || (globalWindow.stellar as Record<string, unknown>)?.xBull;

          if (xBullAPI && typeof (xBullAPI as Record<string, unknown>).signTransaction === 'function') {
            const result = await ((xBullAPI as Record<string, unknown>).signTransaction as (xdr: string) => Promise<{ signedTxXdr: string } | string>)(xdr);
            return typeof result === 'string' ? result : result.signedTxXdr;
          }
          break;
        }
      }

      throw new Error('Transaction signing not supported for this wallet type');
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw error;
    }
  }

  getPublicKey(): string | null {
    return this._address;
  }

  getNetwork(): WalletNetwork {
    return this._network;
  }

  // Get available wallets based on browser extensions
  private async getAvailableWallets(): Promise<WalletOption[]> {
    const wallets: WalletOption[] = [];

    if (await StellarWalletConnection.isWalletAvailable(WalletType.FREIGHTER)) {
      wallets.push({ id: WalletType.FREIGHTER, name: 'Freighter' });
    }
    if (await StellarWalletConnection.isWalletAvailable(WalletType.XBULL)) {
      wallets.push({ id: WalletType.XBULL, name: 'xBull' });
    }

    return wallets;
  }

  // Map wallet option to our WalletType enum
  private mapWalletOptionToType(option: WalletOption): WalletType {
    if (option.id === WalletType.FREIGHTER || option.name?.toLowerCase().includes('freighter')) {
      return WalletType.FREIGHTER;
    } else if (option.id === WalletType.XBULL || option.name?.toLowerCase().includes('xbull')) {
      return WalletType.XBULL;
    }
    throw new Error(`Unsupported wallet type: ${option.id || option.name}`);
  }

  // Connect to specific wallet
  private async connectToWallet(option: WalletOption): Promise<{ address: string }> {
    switch (this.selectedWalletType) {
      case WalletType.FREIGHTER:
        return await this.connectFreighter();
      case WalletType.XBULL:
        return await this.connectXBull();
      default:
        throw new Error(`Connection not implemented for wallet type: ${this.selectedWalletType}`);
    }
  }

  // Disconnect from specific wallet
  private async disconnectFromWallet(): Promise<void> {
    switch (this.selectedWalletType) {
      case WalletType.FREIGHTER:
        await this.disconnectFreighter();
        break;
      case WalletType.XBULL:
        await this.disconnectXBull();
        break;
      default:
        // Generic disconnect
        break;
    }
  }

  // Freighter wallet connection
  private async connectFreighter(): Promise<{ address: string }> {
    const globalWindow = window as WindowWithWallets;
    if (!globalWindow.freighter) {
      throw new Error('Freighter wallet not found');
    }

    try {
      console.log('Attempting Freighter connection...');

      const isConnected = await globalWindow.freighter.isConnected();
      console.log('Freighter isConnected:', isConnected);

      if (!isConnected) {
        console.log('Requesting Freighter connection...');
        await globalWindow.freighter.connect();
        console.log('Freighter connection established');
      }

      console.log('Requesting Freighter public key...');
      const address = await globalWindow.freighter.getPublicKey();
      console.log('Freighter connected successfully with address:', address);

      return { address };
    } catch (error) {
      console.error('Freighter connection error:', error);
      throw new Error(`Freighter connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // xBull wallet connection
  private async connectXBull(): Promise<{ address: string }> {
    try {
      console.log('Attempting xBull connection with manual API detection...');

      // Try to access xBull extension directly
      const globalWindow = window as unknown as Record<string, unknown>;
      const xBullAPI = globalWindow.xBull || globalWindow.xbull || globalWindow.xBullSDK || (globalWindow.stellar as Record<string, unknown>)?.xBull;

      if (!xBullAPI) {
        throw new Error('xBull wallet not found. Please make sure the xBull extension is installed and enabled.');
      }

      console.log('xBull API found:', xBullAPI);
      console.log('Available methods:', Object.keys(xBullAPI as Record<string, unknown>));

      const xBullObj = xBullAPI as Record<string, unknown>;

      // Step 1: Request permissions first (required by xBull)
      if (typeof xBullObj.connect === 'function') {
        console.log('Requesting xBull permissions...');
        try {
          const permissions = await (xBullObj.connect as (options: { canRequestPublicKey: boolean; canRequestSign: boolean }) => Promise<unknown>)({
            canRequestPublicKey: true,
            canRequestSign: true
          });
          console.log('xBull permissions granted:', permissions);
        } catch (permError) {
          console.warn('xBull permission request failed:', permError);
          // Continue anyway, some versions might not require explicit permissions
        }
      }

      // Step 2: Now try to get the public key
      let address: string;

      if (typeof xBullObj.getPublicKey === 'function') {
        console.log('Requesting xBull public key...');
        try {
          address = await (xBullObj.getPublicKey as () => Promise<string>)();
          console.log('xBull connected successfully with address:', address);
          return { address };
        } catch (keyError) {
          console.warn('getPublicKey failed:', keyError);
        }
      }

      if (typeof xBullObj.getAddress === 'function') {
        console.log('Trying xBull.getAddress()...');
        try {
          address = await (xBullObj.getAddress as () => Promise<string>)();
          console.log('xBull connected successfully with address:', address);
          return { address };
        } catch (error) {
          console.warn('getAddress failed:', error);
        }
      }

      if (typeof xBullObj.connect === 'function') {
        console.log('Trying xBull.connect()...');
        try {
          const result = await (xBullObj.connect as () => Promise<unknown>)();
          if (typeof result === 'string') {
            address = result;
          } else if (result && typeof result === 'object' && 'address' in result) {
            address = (result as { address: string }).address;
          } else if (result && typeof result === 'object' && 'publicKey' in result) {
            address = (result as { publicKey: string }).publicKey;
          }
          console.log('xBull connected successfully with address:', address);
          return { address };
        } catch (error) {
          console.warn('connect failed:', error);
        }
      }

      // If all methods fail, try to inspect the API further
      console.log('xBull API inspection:', xBullObj);

      // Try calling methods that might exist
      const methods = ['getPublicKey', 'getAddress', 'connect', 'isConnected'];
      for (const method of methods) {
        if (typeof xBullObj[method] === 'function') {
          console.log(`Trying xBull.${method}()...`);
          try {
            const result = await (xBullObj[method] as () => Promise<unknown>)();
            if (typeof result === 'string') {
              address = result;
              console.log(`xBull connected successfully with address via ${method}:`, address);
              return { address };
            }
          } catch (error) {
            console.warn(`${method} failed:`, error);
          }
        }
      }

      throw new Error('xBull API does not have a supported connection method');

    } catch (error) {
      console.error('xBull connection error:', error);
      throw new Error(`xBull connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Freighter wallet disconnection
  private async disconnectFreighter(): Promise<void> {
    const globalWindow = window as WindowWithWallets;
    if (globalWindow.freighter?.disconnect) {
      await globalWindow.freighter.disconnect();
    }
  }

  // xBull wallet disconnection
  private async disconnectXBull(): Promise<void> {
    // xBull module doesn't have a disconnect method, just log
    console.log('xBull disconnected');
  }

  // Utility method to check if a wallet is available
  static async isWalletAvailable(walletType: WalletType): Promise<boolean> {
    try {
      const globalWindow = window as unknown as Record<string, unknown>;
      switch (walletType) {
        case WalletType.FREIGHTER:
          return !!(globalWindow.freighter && typeof (globalWindow.freighter as Record<string, unknown>).getPublicKey === 'function');
        case WalletType.XBULL:
          // Check if xBull extension is available
          return !!(globalWindow.xBull || globalWindow.xbull || globalWindow.xBullSDK || (globalWindow.stellar as Record<string, unknown>)?.xBull);
        default:
          return false;
      }
    } catch (error) {
      console.warn(`Error checking wallet availability for ${walletType}:`, error);
      return false;
    }
  }
}

// Demo wallet for development (similar to current WalletContext)
export class DemoWalletConnection implements WalletConnection {
  private _isConnected: boolean = false;
  private _address: string | null = null;
  private _network: WalletNetwork;
  private keypair: Keypair | null = null;

  constructor(network: WalletNetwork = WalletNetwork.TESTNET) {
    this._network = network;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  get address(): string | null {
    return this._address;
  }

  get network(): WalletNetwork {
    return this._network;
  }

  async connect(): Promise<void> {
    try {
      // Create a demo keypair
      this.keypair = Keypair.random();
      this._address = this.keypair.publicKey();
      this._isConnected = true;

      // Store in localStorage for persistence (demo only!)
      localStorage.setItem('demo_wallet_address', this._address);
      localStorage.setItem('demo_wallet_secret', this.keypair.secret());
    } catch (error) {
      console.error('Demo wallet connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this._isConnected = false;
    this._address = null;
    this.keypair = null;
    localStorage.removeItem('demo_wallet_address');
    localStorage.removeItem('demo_wallet_secret');
  }

  async signTransaction(xdr: string): Promise<string> {
    if (!this.keypair) {
      throw new Error('Demo wallet not connected');
    }

    try {
      const transaction = TransactionBuilder.fromXDR(xdr, this._network === WalletNetwork.TESTNET ? Networks.TESTNET : Networks.PUBLIC);
      transaction.sign(this.keypair);
      return transaction.toXDR();
    } catch (error) {
      console.error('Demo transaction signing failed:', error);
      throw error;
    }
  }

  getPublicKey(): string | null {
    return this._address;
  }

  getNetwork(): WalletNetwork {
    return this._network;
  }
}

// Factory function to create wallet connections
export function createWalletConnection(
  type: 'stellar' | 'demo' = 'demo',
  network: WalletNetwork = WalletNetwork.TESTNET
): WalletConnection {
  switch (type) {
    case 'stellar':
      return new StellarWalletConnection(network);
    case 'demo':
    default:
      return new DemoWalletConnection(network);
  }
}

// Export default demo wallet instance for backward compatibility
export const walletConnection = createWalletConnection('demo');

// Helper function to fund testnet accounts
export async function fundTestnetAccount(address: string): Promise<boolean> {
  if (!address) return false;
  
  try {
    console.log(`Funding testnet account: ${address}`);
    
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
    
    if (response.ok) {
      console.log(`✅ Account ${address} funded successfully!`);
      return true;
    } else {
      console.error(`❌ Failed to fund account: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error funding testnet account:', error);
    return false;
  }
}

// Helper function to check if account exists
export async function checkAccountExists(address: string, network: WalletNetwork = WalletNetwork.TESTNET): Promise<boolean> {
  if (!address) return false;
  
  try {
    const horizonUrl = network === WalletNetwork.TESTNET 
      ? 'https://horizon-testnet.stellar.org'
      : 'https://horizon.stellar.org';
      
    const response = await fetch(`${horizonUrl}/accounts/${address}`);
    return response.ok;
  } catch (error) {
    console.error('Error checking account existence:', error);
    return false;
  }
}

// Enhanced wallet connection helper that auto-funds testnet accounts
export async function connectAndEnsureFunded(
  walletConnection: WalletConnection,
  autoFund: boolean = true
): Promise<{ success: boolean; address: string | null; funded?: boolean }> {
  try {
    // First, connect the wallet
    await walletConnection.connect();
    
    if (!walletConnection.isConnected || !walletConnection.address) {
      return { success: false, address: null };
    }
    
    const address = walletConnection.address;
    
    // Check if this is testnet and auto-funding is enabled
    if (autoFund && walletConnection.network === WalletNetwork.TESTNET) {
      console.log('🔍 Checking if testnet account exists...');
      
      const accountExists = await checkAccountExists(address, WalletNetwork.TESTNET);
      
      if (!accountExists) {
        console.log('💰 Account not found on testnet, funding automatically...');
        const funded = await fundTestnetAccount(address);
        
        if (funded) {
          console.log('✅ Testnet account funded successfully!');
          // Wait a moment for the account to be available
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { success: true, address, funded: true };
        } else {
          console.warn('⚠️ Failed to fund testnet account automatically');
          return { success: true, address, funded: false };
        }
      } else {
        console.log('✅ Testnet account already exists');
      }
    }
    
    return { success: true, address };
  } catch (error) {
    console.error('Error in connectAndEnsureFunded:', error);
    return { success: false, address: null };
  }
}
