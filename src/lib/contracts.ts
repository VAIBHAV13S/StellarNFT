import { Contract, Soroban, TransactionBuilder, Networks, BASE_FEE, xdr, Address, nativeToScVal, rpc, Keypair } from '@stellar/stellar-sdk';
import { WalletConnection } from './wallet';

// NFT Attribute type
interface NFTAttribute {
  trait_type: string;
  value: string;
}

// Contract configuration
interface ContractConfig {
  network: 'testnet' | 'mainnet';
  contracts: {
    nft: {
      contractId: string;
      wasmHash: string;
      deployedAt: string;
    };
    auction: {
      contractId: string;
      wasmHash: string;
      deployedAt: string;
    };
  };
}

// Real contract IDs for Stellar testnet (these would be deployed contracts)
const CONTRACTS = {
  testnet: {
    nft: 'CCC7XLVONMDZDUCHDHYPMLXCIDY635PAIA7DHGAYW6JAVP6H2XRDLNGF', // Deployed NFT contract
    auction: 'CB4SL4NTLXWBJWF7X74NQTOXR6GQCUDFBAXLMMAVSI4LCF4ZVHO7373A' // Deployed auction contract
  },
  mainnet: {
    nft: 'C...', // Mainnet contract ID
    auction: 'C...' // Mainnet contract ID
  }
};

export class ContractService {
  private server: rpc.Server;
  private network: 'testnet' | 'mainnet';
  private contractConfig: ContractConfig | null = null;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    this.server = new rpc.Server(
      network === 'testnet'
        ? 'https://soroban-testnet.stellar.org'
        : 'https://soroban.stellar.org'
    );
    this.loadContractConfig();
  }

  private loadContractConfig() {
    try {
      // Try to load from config file
      // Note: Dynamic imports would be better here, but for now we'll use a fallback approach
      console.warn('Contract config loading not implemented - using fallback IDs');
    } catch (error) {
      console.warn('Could not load contract config, using fallback IDs');
    }
  }

  private getContractId(type: 'nft' | 'auction'): string {
    if (this.contractConfig) {
      return this.contractConfig.contracts[type].contractId;
    }
    return CONTRACTS[this.network][type];
  }

  private async buildTransaction(
    contractId: string,
    method: string,
    args: xdr.ScVal[],
    walletAddress: string
  ): Promise<string> {
    // Get account info
    const account = await this.server.getAccount(walletAddress);

    // Build contract call
    const contract = new Contract(contractId);
    const contractCall = contract.call(method, ...args);

    // Build transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
    })
      .addOperation(contractCall)
      .setTimeout(30)
      .build();

    return transaction.toXDR();
  }

  private async submitTransaction(signedXdr: string): Promise<rpc.Api.GetTransactionResponse> {
    const transaction = TransactionBuilder.fromXDR(signedXdr, this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC);

    const result = await this.server.sendTransaction(transaction);

    if (result.status !== 'PENDING') {
      throw new Error(`Transaction failed: ${result.status}`);
    }

    // Wait for confirmation
    let response = await this.server.getTransaction(result.hash);
    let attempts = 0;
    while (response.status === 'NOT_FOUND' && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      response = await this.server.getTransaction(result.hash);
      attempts++;
    }

    if (response.status !== 'SUCCESS') {
      throw new Error(`Transaction failed: ${response.status}`);
    }

    return response;
  }

  // NFT Contract Methods
  async mintNFT(
    walletAddress: string,
    name: string,
    description: string,
    imageUrl: string,
    attributes: NFTAttribute[],
    royaltyPercentage: number
  ) {
    try {
      const contractId = this.getContractId('nft');

      // Get account info for transaction building
      const account = await this.server.getAccount(walletAddress);

      // Convert attributes to ScVal format
      const attributesScVal = xdr.ScVal.scvVec(
        attributes.map(attr =>
          xdr.ScVal.scvMap([
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvString('trait_type'),
              val: xdr.ScVal.scvString(attr.trait_type)
            }),
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvString('value'),
              val: xdr.ScVal.scvString(attr.value)
            })
          ])
        )
      );

      // Build contract call
      const contract = new Contract(contractId);
      const contractCall = contract.call('mint',
        xdr.ScVal.scvAddress(new Address(walletAddress).toScAddress()), // to
        xdr.ScVal.scvString(name),
        xdr.ScVal.scvString(description),
        xdr.ScVal.scvString(imageUrl),
        attributesScVal,
        xdr.ScVal.scvU32(royaltyPercentage)
      );

      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();

      const xdrString = transaction.toXDR();

      return {
        success: true,
        tokenId: Date.now(), // Will be returned from contract
        transactionHash: `pending_${Date.now()}`,
        signedXdr: xdrString
      };
    } catch (error) {
      console.error('Mint NFT failed:', error);
      throw error;
    }
  }

  async transferNFT(fromAddress: string, toAddress: string, tokenId: number) {
    try {
      const contractId = this.getContractId('nft');

      // Get account info
      const account = await this.server.getAccount(fromAddress);

      // Build contract call
      const contract = new Contract(contractId);
      const contractCall = contract.call('transfer',
        xdr.ScVal.scvAddress(new Address(fromAddress).toScAddress()), // from
        xdr.ScVal.scvAddress(new Address(toAddress).toScAddress()), // to
        xdr.ScVal.scvU64(new xdr.Uint64(tokenId)) // token_id
      );

      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();

      const xdrString = transaction.toXDR();

      return {
        success: true,
        transactionHash: `pending_${Date.now()}`,
        signedXdr: xdrString
      };
    } catch (error) {
      console.error('Transfer NFT failed:', error);
      throw error;
    }
  }

  async getNFT(tokenId: number) {
    try {
      const contractId = this.getContractId('nft');

      // Build contract call to get NFT data
      const contract = new Contract(contractId);
      const contractCall = contract.call('get_nft', xdr.ScVal.scvU64(new xdr.Uint64(tokenId)));

      // Simulate contract read (in a real implementation, you'd use simulateTransaction)
      // For now, we'll return structured data that matches what the contract would return
      const mockNFTData = {
        id: tokenId,
        owner: 'GA...',
        creator: 'GA...',
        metadata: {
          name: 'Mock NFT',
          description: 'Mock description',
          image_url: '/src/assets/nft-cosmic-dreams.jpg',
          attributes: []
        },
        royalty_percentage: 5,
        minted_at: Date.now(),
        contractId
      };

      return mockNFTData;
    } catch (error) {
      console.error('Get NFT failed:', error);
      throw error;
    }
  }

  // Auction Contract Methods
  async createAuction(
    sellerAddress: string,
    nftContractId: string,
    nftTokenId: number,
    startingPrice: number,
    minBidIncrement: number,
    durationHours: number,
    asset: 'XLM' | 'KALE'
  ) {
    try {
      const contractId = this.getContractId('auction');

      // Get account info
      const account = await this.server.getAccount(sellerAddress);

      // Build contract call
      const contract = new Contract(contractId);
      const contractCall = contract.call('create_auction',
        xdr.ScVal.scvString(nftContractId), // nft_contract_id
        xdr.ScVal.scvU64(new xdr.Uint64(nftTokenId)), // nft_token_id
        xdr.ScVal.scvU64(new xdr.Uint64(startingPrice * 10000000)), // starting_price (in stroops)
        xdr.ScVal.scvU64(new xdr.Uint64(minBidIncrement * 10000000)), // min_bid_increment (in stroops)
        xdr.ScVal.scvU64(new xdr.Uint64(durationHours * 3600)) // duration (in seconds)
      );

      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();

      const xdrString = transaction.toXDR();

      return {
        success: true,
        auctionId: Date.now(),
        transactionHash: `pending_${Date.now()}`,
        signedXdr: xdrString
      };
    } catch (error) {
      console.error('Create auction failed:', error);
      throw error;
    }
  }

  async placeBid(bidderAddress: string, auctionId: number, bidAmount: number) {
    try {
      const contractId = this.getContractId('auction');

      // Get account info
      const account = await this.server.getAccount(bidderAddress);

      // Build contract call
      const contract = new Contract(contractId);
      const contractCall = contract.call('place_bid',
        xdr.ScVal.scvU64(new xdr.Uint64(auctionId)), // auction_id
        xdr.ScVal.scvU64(new xdr.Uint64(bidAmount * 10000000)) // bid_amount (in stroops)
      );

      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();

      const xdrString = transaction.toXDR();

      return {
        success: true,
        transactionHash: `pending_${Date.now()}`,
        signedXdr: xdrString
      };
    } catch (error) {
      console.error('Place bid failed:', error);
      throw error;
    }
  }

  async submitSignedTransaction(signedXdr: string): Promise<{ success: boolean; transactionHash?: string; result?: unknown; error?: string }> {
    try {
      const result = await this.submitTransaction(signedXdr);
      return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transactionHash: (result as any).id || (result as any).hash,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: (result as any).returnValue
      };
    } catch (error) {
      console.error('Transaction submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();
