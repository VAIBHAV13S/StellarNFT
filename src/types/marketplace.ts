export interface NFT {
  id: string;
  title: string;
  description: string;
  image: string;
  artist: {
    name: string;
    avatar?: string;
    address: string;
  };
  price: {
    xlm: number;
    kale?: number;
    usd: number;
    eur?: number;
    inr?: number;
  };
  asset: 'XLM' | 'KALE';
  status: 'sale' | 'auction' | 'sold';
  mintedAt: Date;
  transactionHash?: string;
  likes?: number;
  views?: number;
  metadata: {
    category: string;
    traits?: { trait_type: string; value: string }[];
  };
}

export interface Auction extends NFT {
  status: 'auction';
  auction: {
    endTime: Date;
    highestBid: number;
    bidders: number;
    minBidIncrement: number;
    asset: 'XLM' | 'KALE';
  };
}

export interface Bid {
  id: string;
  amount: number;
  bidder: string;
  timestamp: Date;
  nftId: string;
}

export interface WalletState {
  connected: boolean;
  address?: string;
  balance?: {
    xlm: number;
    kale: number;
  };
  network?: 'testnet' | 'mainnet';
  hasKaleTrustline?: boolean;
}

export interface User {
  address: string;
  profile?: {
    name?: string;
    bio?: string;
    avatar?: string;
    socialLinks?: {
      twitter?: string;
      website?: string;
    };
  };
}

export type Currency = 'XLM' | 'KALE' | 'USD' | 'EUR' | 'INR';
export type SortBy = 'price' | 'newest' | 'ending-soon' | 'most-liked' | 'trending';
export type FilterStatus = 'all' | 'sale' | 'auction';