import { config } from './config';

// Initialize Pinata client
let pinataClient: { jwt: string } | null = null;

// Initialize client based on available API key
if (config.ipfs.pinataJwt) {
  pinataClient = {
    jwt: config.ipfs.pinataJwt
  };
}

class IPFSService {
  /**
   * Upload a file to IPFS using Pinata
   * @param file - The file to upload
   * @returns Promise<string> - IPFS URL of the uploaded file
   */
  async uploadFile(file: File): Promise<string> {
    if (config.ipfs.demoMode) {
      console.warn('IPFS: Running in demo mode. Configure VITE_PINATA_JWT for production uploads.');
      return `https://ipfs.io/ipfs/QmDemoCID${Date.now()}`;
    }

    if (!pinataClient) {
      throw new Error('Pinata client not configured. Please set VITE_PINATA_JWT');
    }

    try {
      console.log('Uploading file to IPFS via Pinata...', file.name);

      const pinataFormData = new FormData();
      pinataFormData.append('file', file);
      pinataFormData.append('pinataOptions', JSON.stringify({
        cidVersion: 1
      }));

      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataClient.jwt}`,
        },
        body: pinataFormData,
      });

      if (!pinataResponse.ok) {
        const errorText = await pinataResponse.text();
        console.error('Pinata upload error:', errorText);
        throw new Error(`Pinata upload failed: ${pinataResponse.status}`);
      }

      const pinataResult = await pinataResponse.json();
      const cid = pinataResult.IpfsHash;
      const url = `https://ipfs.io/ipfs/${cid}`;
      console.log('File uploaded successfully:', url);
      return url;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error('Failed to upload file to IPFS. Please try again.');
    }
  }

  /**
   * Upload NFT metadata to IPFS using Pinata
   * @param metadata - NFT metadata object
   * @returns Promise<string> - IPFS URL of the metadata
   */
  async uploadMetadata(metadata: {
    name: string;
    description: string;
    image: string;
    attributes?: Array<{ trait_type: string; value: string }>;
    external_url?: string;
  }): Promise<string> {
    if (config.ipfs.demoMode) {
      console.warn('IPFS: Running in demo mode. Configure VITE_PINATA_JWT for production uploads.');
      return `https://ipfs.io/ipfs/QmDemoMetadataCID${Date.now()}`;
    }

    if (!pinataClient) {
      throw new Error('Pinata client not configured. Please set VITE_PINATA_JWT');
    }

    try {
      console.log('Uploading metadata to IPFS via Pinata...', metadata.name);

      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pinataClient.jwt}`,
        },
        body: JSON.stringify(metadata),
      });

      if (!pinataResponse.ok) {
        const errorText = await pinataResponse.text();
        console.error('Pinata metadata upload error:', errorText);
        throw new Error(`Pinata metadata upload failed: ${pinataResponse.status}`);
      }

      const pinataResult = await pinataResponse.json();
      const cid = pinataResult.IpfsHash;
      const url = `https://ipfs.io/ipfs/${cid}`;
      console.log('Metadata uploaded successfully:', url);
      return url;
    } catch (error) {
      console.error('IPFS metadata upload failed:', error);
      throw new Error('Failed to upload metadata to IPFS. Please try again.');
    }
  }

  /**
   * Create and upload complete NFT metadata
   * @param params - NFT creation parameters
   * @returns Promise<{metadataUrl: string, imageUrl: string}> - URLs for metadata and image
   */
  async createNFTMetadata(params: {
    name: string;
    description: string;
    file: File;
    attributes?: Array<{ trait_type: string; value: string }>;
    external_url?: string;
  }): Promise<{ metadataUrl: string; imageUrl: string }> {
    try {
      console.log('Starting NFT creation process...');
      const imageUrl = await this.uploadFile(params.file);

      const metadata = {
        name: params.name,
        description: params.description,
        image: imageUrl,
        attributes: params.attributes || [],
        external_url: params.external_url
      };

      const metadataUrl = await this.uploadMetadata(metadata);

      console.log('NFT metadata created successfully!');
      return { metadataUrl, imageUrl };
    } catch (error) {
      console.error('Error creating NFT metadata:', error);
      throw error;
    }
  }

  /**
   * Check if IPFS service is available
   * @returns boolean
   */
  isAvailable(): boolean {
    return pinataClient !== null;
  }

  /**
   * Get current IPFS provider name
   * @returns string
   */
  getProviderName(): string {
    return pinataClient ? 'PINATA' : 'none';
  }

  /**
   * Get IPFS gateway URL for a CID
   * @param cid - IPFS content identifier
   * @returns string - Gateway URL
   */
  getGatewayUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`;
  }

  /**
   * Extract CID from IPFS URL
   * @param url - IPFS URL
   * @returns string - CID
   */
  extractCID(url: string): string {
    const match = url.match(/ipfs\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();
export default ipfsService;
