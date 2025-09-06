import { NFT, Auction } from "@/types/marketplace";

// Mock data for demonstration
export const mockNFTs: (NFT | Auction)[] = [
  {
    id: "1",
    title: "Cosmic Dreams #001",
    description: "A mesmerizing piece exploring the depths of space. This unique digital artwork captures the essence of cosmic wonder through vibrant colors and intricate patterns that seem to pulse with the rhythm of the universe itself.",
    image: "/src/assets/nft-cosmic-dreams.jpg",
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
    description: "Birth of stars captured in digital art. A spectacular representation of stellar nurseries where new stars are born from cosmic dust and gas clouds.",
    image: "/src/assets/nft-nebula-genesis.jpg",
    artist: { name: "CosmicCreator", address: "GDEF1234567890ABCDEFGHJKLMNOPQRSTUVWXYZ" },
    price: { xlm: 89, kale: 8.9, usd: 9.34, eur: 8.60, inr: 780 },
    asset: "KALE",
    status: "sale",
    mintedAt: new Date("2024-01-20"),
    metadata: {
      category: "Abstract",
      traits: [
        { trait_type: "Style", value: "Impressionist" },
        { trait_type: "Theme", value: "Creation" },
        { trait_type: "Rarity", value: "Uncommon" }
      ]
    }
  },
  {
    id: "3",
    title: "Stellar Voyage #42",
    description: "Journey through the stellar highway. An epic visualization of interstellar travel through wormholes and across vast cosmic distances.",
    image: "/src/assets/nft-stellar-voyage.jpg",
    artist: { name: "VoyagerArt", address: "GHIJ1234567890ABCDEFGHJKLMNOPQRSTUVWXYZ" },
    price: { xlm: 220, kale: 22, usd: 23.10, eur: 21.25, inr: 1920 },
    asset: "XLM",
    status: "auction",
    mintedAt: new Date("2024-01-18"),
    metadata: {
      category: "Space Art",
      traits: [
        { trait_type: "Style", value: "Surreal" },
        { trait_type: "Theme", value: "Exploration" },
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
    description: "Stars reimagined in the digital realm. A modern interpretation of ancient star patterns using cutting-edge digital techniques.",
    image: "/src/assets/nft-digital-constellation.jpg",
    artist: { name: "PixelStar", address: "GKLM1234567890ABCDEFGHJKLMNOPQRSTUVWXYZ" },
    price: { xlm: 75, kale: 7.5, usd: 7.87, eur: 7.25, inr: 655 },
    asset: "KALE",
    status: "sale",
    mintedAt: new Date("2024-01-22"),
    metadata: {
      category: "Digital Art",
      traits: [
        { trait_type: "Style", value: "Pixel Art" },
        { trait_type: "Theme", value: "Constellation" },
        { trait_type: "Rarity", value: "Common" }
      ]
    }
  }
];

export const mockBids = [
  { id: "1", amount: 150, bidder: "GDEF123...", timestamp: new Date(Date.now() - 1000 * 60 * 30), nftId: "1" },
  { id: "2", amount: 145, bidder: "GHIJ456...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), nftId: "1" },
  { id: "3", amount: 140, bidder: "GKLM789...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), nftId: "1" },
  { id: "4", amount: 220, bidder: "GABC987...", timestamp: new Date(Date.now() - 1000 * 60 * 15), nftId: "3" },
  { id: "5", amount: 210, bidder: "GXYZ654...", timestamp: new Date(Date.now() - 1000 * 60 * 45), nftId: "3" },
];
