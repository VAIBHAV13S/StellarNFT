import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NFT, Auction } from '@/types/marketplace';
import { contractService } from '@/lib/contracts';

// Import NFT images for initial display
import cosmicDreamsImg from "@/assets/nft-cosmic-dreams.jpg";
import nebulaGenesisImg from "@/assets/nft-nebula-genesis.jpg";
import stellarVoyageImg from "@/assets/nft-stellar-voyage.jpg";
import digitalConstellationImg from "@/assets/nft-digital-constellation.jpg";

interface NFTContextType {
  nfts: (NFT | Auction)[];
  loading: boolean;
  error: string | null;
  addNFT: (nft: NFT | Auction) => void;
  getNFTById: (id: string) => NFT | Auction | undefined;
  getAllNFTs: () => (NFT | Auction)[];
  refreshNFTs: () => Promise<void>;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export function NFTProvider({ children }: { children: ReactNode }) {
  // Sample NFTs using available image assets
  const sampleNFTs: (NFT | Auction)[] = [
    {
      id: "1",
      title: "Cosmic Dreams #001",
      description: "A mesmerizing piece exploring the depths of space. This unique digital artwork captures the essence of cosmic wonder through vibrant colors and intricate patterns.",
      image: cosmicDreamsImg,
      artist: { name: "StarArtist", address: "GABC1234567890DEFGHIJKLMNOPQRSTUVWXYZ" },
      price: { xlm: 150, kale: 15, usd: 15.75, eur: 14.50, inr: 1300 },
      asset: "XLM",
      status: "auction",
      mintedAt: new Date("2024-01-15"),
      metadata: {
        category: "Space Art",
        traits: [
          { trait_type: "Style", value: "Abstract" },
          { trait_type: "Theme", value: "Cosmic" },
          { trait_type: "Rarity", value: "Rare" }
        ]
      },
      auction: {
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        highestBid: 150,
        bidders: 12,
        minBidIncrement: 5,
        asset: "XLM"
      }
    },
    {
      id: "2",
      title: "Nebula Genesis",
      description: "Birth of stars captured in digital art. A stunning representation of stellar formation in the vast cosmic nursery.",
      image: nebulaGenesisImg,
      artist: { name: "CosmicCreator", address: "GDEF1234567890ABCDEFGHIJK" },
      price: { xlm: 89, kale: 8.9, usd: 9.34, eur: 8.60, inr: 780 },
      asset: "KALE",
      status: "sale",
      mintedAt: new Date("2024-01-20"),
      metadata: {
        category: "Abstract",
        traits: [
          { trait_type: "Style", value: "Digital" },
          { trait_type: "Theme", value: "Nebula" },
          { trait_type: "Rarity", value: "Common" }
        ]
      }
    },
    {
      id: "3",
      title: "Stellar Voyage #42",
      description: "Journey through the stellar highway. An epic visualization of interstellar travel through wormholes and star systems.",
      image: stellarVoyageImg,
      artist: { name: "VoyagerArt", address: "GHIJ1234567890ABCDEFGHIJK" },
      price: { xlm: 220, kale: 22, usd: 23.10, eur: 21.25, inr: 1920 },
      asset: "XLM",
      status: "auction",
      mintedAt: new Date("2024-01-18"),
      metadata: {
        category: "Space Art",
        traits: [
          { trait_type: "Style", value: "Sci-Fi" },
          { trait_type: "Theme", value: "Voyage" },
          { trait_type: "Rarity", value: "Epic" }
        ]
      },
      auction: {
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        highestBid: 220,
        bidders: 8,
        minBidIncrement: 10,
        asset: "XLM"
      }
    },
    {
      id: "4",
      title: "Digital Constellation",
      description: "Stars reimagined in the digital realm. A modern interpretation of ancient star patterns with contemporary digital aesthetics.",
      image: digitalConstellationImg,
      artist: { name: "PixelStar", address: "GKLM1234567890ABCDEFGHIJK" },
      price: { xlm: 75, kale: 7.5, usd: 7.87, eur: 7.25, inr: 655 },
      asset: "KALE",
      status: "sale",
      mintedAt: new Date("2024-01-22"),
      metadata: {
        category: "Digital Art",
        traits: [
          { trait_type: "Style", value: "Pixel Art" },
          { trait_type: "Theme", value: "Constellation" },
          { trait_type: "Rarity", value: "Uncommon" }
        ]
      }
    }
  ];

  const [nfts, setNfts] = useState<(NFT | Auction)[]>(sampleNFTs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load NFTs from contracts on mount
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual contract call
        // const contractNFTs = await ContractService.getAllNFTs();
        // setNfts([...sampleNFTs, ...contractNFTs]);
      } catch (err) {
        setError('Failed to load NFTs from contract');
        console.error('Error loading NFTs:', err);
      } finally {
        setLoading(false);
      }
    };

    // Delay initialization to ensure context is ready
    const timer = setTimeout(loadNFTs, 50);
    return () => clearTimeout(timer);
  }, []);

  const loadNFTsFromContract = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll keep the sample NFTs but add real contract integration
      // In a full implementation, you'd query the contract for all NFTs
      const contractNFTs: (NFT | Auction)[] = [];

      // Example of how to fetch real NFTs (when contracts are fully deployed)
      // for (let i = 1; i <= 10; i++) {
      //   try {
      //     const nftData = await contractService.getNFT(i);
      //     if (nftData) {
      //       contractNFTs.push({
      //         id: nftData.id.toString(),
      //         title: nftData.metadata.name,
      //         description: nftData.metadata.description,
      //         image: nftData.metadata.image_url,
      //         artist: { name: 'Unknown', address: nftData.creator },
      //         price: { xlm: 100, kale: 10, usd: 10.50, eur: 9.65, inr: 875 },
      //         asset: 'XLM',
      //         status: 'sale',
      //         mintedAt: new Date(nftData.minted_at),
      //         metadata: {
      //           category: 'Digital Art',
      //           traits: nftData.metadata.attributes
      //         }
      //       });
      //     }
      //   } catch (err) {
      //     // NFT doesn't exist, continue
      //     continue;
      //   }
      // }

      setNfts([...sampleNFTs, ...contractNFTs]);
    } catch (err) {
      setError('Failed to load NFTs from contract');
      console.error('Error loading NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshNFTs = async () => {
    await loadNFTsFromContract();
  };

  const addNFT = (nft: NFT | Auction) => {
    setNfts(prev => [...prev, nft]);
  };

  const getNFTById = (id: string) => {
    return nfts.find(nft => nft.id === id);
  };

  const getAllNFTs = () => {
    return nfts;
  };

  return (
    <NFTContext.Provider value={{
      nfts,
      loading,
      error,
      addNFT,
      getNFTById,
      getAllNFTs,
      refreshNFTs
    }}>
      {children}
    </NFTContext.Provider>
  );
}

export function useNFTs() {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error('useNFTs must be used within an NFTProvider');
  }
  return context;
}
