import { Keypair, TransactionBuilder, BASE_FEE, Networks, Contract, xdr, Address, nativeToScVal, scValToNative, Transaction } from '@stellar/stellar-sdk';
import { server, CONTRACT_IDS, NETWORK_CONFIG, nftContract, auctionContract } from './config';
import { NFT, Auction } from '@/types/marketplace';
import { WalletConnection } from '@/lib/wallet';

// Contract service for interacting with deployed Soroban contracts
export class ContractService {
  private static get nftContract(): Contract | null {
    return nftContract;
  }

  private static get auctionContract(): Contract | null {
    return auctionContract;
  }

  // Get all NFTs from the contract
  static async getAllNFTs(): Promise<(NFT | Auction)[]> {
    try {
      // For now, return mock data while we fix the contract integration
      // TODO: Implement proper contract calls once Soroban SDK is fully integrated
      return [
        {
          id: 'contract-1',
          title: 'Stellar Dream',
          description: 'A beautiful NFT from the cosmos',
          image: '/assets/nft-stellar-voyage.jpg',
          artist: {
            name: 'Cosmic Artist',
            address: 'GASTRODON',
          },
          price: {
            xlm: 100,
            usd: 30,
          },
          asset: 'XLM' as const,
          status: 'sale' as const,
          mintedAt: new Date(),
          metadata: {
            category: 'Digital Art',
          },
        },
        {
          id: 'contract-2',
          title: 'Digital Nebula',
          description: 'An ethereal digital artwork',
          image: '/assets/nft-digital-constellation.jpg',
          artist: {
            name: 'Nebula Creator',
            address: 'GASTRODON',
          },
          price: {
            xlm: 150,
            usd: 45,
          },
          asset: 'XLM' as const,
          status: 'sale' as const,
          mintedAt: new Date(),
          metadata: {
            category: 'Digital Art',
          },
        },
      ];
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return [];
    }
  }

  // Get NFT by ID
  static async getNFTById(id: string): Promise<NFT | Auction | null> {
    try {
      // TODO: Implement proper contract call
      const mockNFTs = await this.getAllNFTs();
      return mockNFTs.find(nft => nft.id === id) || null;
    } catch (error) {
      console.error('Error fetching NFT:', error);
      return null;
    }
  }

  // Mint new NFT
  static async mintNFT(
    minter: Keypair,
    name: string,
    description: string,
    imageUrl: string,
    price: number
  ) {
    if (!this.nftContract) {
      throw new Error('NFT contract not available - invalid contract ID');
    }

    try {
      const sourceAccount = await server.getAccount(minter.publicKey());

      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      })
      .addOperation(
        this.nftContract.call(
          'mint_nft',
          nativeToScVal(name, { type: 'string' }),
          nativeToScVal(description, { type: 'string' }),
          nativeToScVal(imageUrl, { type: 'string' }),
          nativeToScVal(price, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();

      tx.sign(minter);
      const result = await server.sendTransaction(tx);
      return result;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  // Mint new NFT with wallet connection (production ready)
  static async mintNFTWithWallet(
    walletConnection: WalletConnection,
    name: string,
    description: string,
    imageUrl: string,
    price: number
  ) {
    if (!this.nftContract) {
      throw new Error('NFT contract not available - invalid contract ID');
    }

    if (!walletConnection.isConnected || !walletConnection.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const sourceAccount = await server.getAccount(walletConnection.address);

      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      })
      .addOperation(
        this.nftContract.call(
          'mint_nft',
          nativeToScVal(name, { type: 'string' }),
          nativeToScVal(description, { type: 'string' }),
          nativeToScVal(imageUrl, { type: 'string' }),
          nativeToScVal(price, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();

      // Sign transaction with wallet
      const xdr = tx.toXDR();
      const signedXDR = await walletConnection.signTransaction(xdr);
      const signedTx = TransactionBuilder.fromXDR(signedXDR, NETWORK_CONFIG.networkPassphrase);
      const result = await server.sendTransaction(signedTx);
      return result;
    } catch (error) {
      console.error('Error minting NFT with wallet:', error);
      throw error;
    }
  }

  // Create auction
  static async createAuction(
    seller: Keypair,
    tokenId: string,
    startingPrice: number,
    duration: number
  ) {
    if (!this.auctionContract) {
      throw new Error('Auction contract not available - invalid contract ID');
    }

    try {
      const sourceAccount = await server.getAccount(seller.publicKey());
      
      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      })
      .addOperation(
        this.auctionContract.call(
          'create_auction',
          nativeToScVal(tokenId, { type: 'u32' }),
          nativeToScVal(startingPrice, { type: 'u64' }),
          nativeToScVal(duration, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();

      tx.sign(seller);
      const result = await server.sendTransaction(tx);
      return result;
    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    }
  }

  // Place bid
  static async placeBid(
    bidder: Keypair,
    auctionId: string,
    amount: number
  ) {
    if (!this.auctionContract) {
      throw new Error('Auction contract not available - invalid contract ID');
    }

    try {
      const sourceAccount = await server.getAccount(bidder.publicKey());
      
      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      })
      .addOperation(
        this.auctionContract.call(
          'place_bid',
          nativeToScVal(auctionId, { type: 'u32' }),
          nativeToScVal(amount, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();

      tx.sign(bidder);
      const result = await server.sendTransaction(tx);
      return result;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  }

  // Get user's NFTs
  static async getUserNFTs(address: string): Promise<(NFT | Auction)[]> {
    try {
      // TODO: Implement proper contract call
      const allNFTs = await this.getAllNFTs();
      return allNFTs.filter(nft => nft.artist.address === address);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  }

  // Helper to build transaction
  private static async buildTransaction(source: string, operations: xdr.Operation[]) {
    const sourceAccount = await server.getAccount(source);
    const txBuilder = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    });

    operations.forEach(op => txBuilder.addOperation(op));

    return txBuilder.setTimeout(30).build();
  }
}
