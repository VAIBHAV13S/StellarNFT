import { Contract, StrKey } from '@stellar/stellar-sdk';
import { Server as SorobanRpcServer } from '@stellar/stellar-sdk/rpc';

// Contract IDs from deployment
export const CONTRACT_IDS = {
  NFT: import.meta.env.VITE_KALE_CONTRACT_ID || 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  AUCTION: import.meta.env.VITE_AUCTION_CONTRACT_ID || 'CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
};

// Network configuration
export const NETWORK_CONFIG = {
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org',
  networkPassphrase: import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
};

// Initialize Soroban RPC server
export const server = new SorobanRpcServer(NETWORK_CONFIG.rpcUrl);

// Contract instances - initialize safely
let nftContractInstance: Contract | null = null;
let auctionContractInstance: Contract | null = null;

try {
  // Try to create contract instances with proper validation
  if (StrKey.isValidContract(CONTRACT_IDS.NFT)) {
    nftContractInstance = new Contract(CONTRACT_IDS.NFT);
  } else {
    console.warn('Invalid NFT contract ID format:', CONTRACT_IDS.NFT);
  }

  if (StrKey.isValidContract(CONTRACT_IDS.AUCTION)) {
    auctionContractInstance = new Contract(CONTRACT_IDS.AUCTION);
  } else {
    console.warn('Invalid Auction contract ID format:', CONTRACT_IDS.AUCTION);
  }
} catch (error) {
  console.error('Error creating contract instances:', error);
}

export const nftContract = nftContractInstance;
export const auctionContract = auctionContractInstance;
