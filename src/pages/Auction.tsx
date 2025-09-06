import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Filter, Grid, List } from "lucide-react";
import { Header } from "@/components/Header";
import { NFTCard } from "@/components/NFTCard";
import { WalletModal } from "@/components/WalletModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Auction as AuctionType, WalletState, Currency, SortBy } from "@/types/marketplace";
import { useWallet } from "@/contexts/WalletContext";
import { useNFTs } from "@/contexts/NFTContext";

const Auction = () => {
  const navigate = useNavigate();
  const { getAllNFTs } = useNFTs();
  const { wallet } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("XLM");
  const [sortBy, setSortBy] = useState<SortBy>("ending-soon");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get all NFTs and filter for auctions
  const allNFTs = getAllNFTs();
  const auctions = allNFTs.filter(nft => nft.status === 'auction') as AuctionType[];

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  // Sort auctions based on selected criteria
  const sortedAuctions = [...auctions].sort((a, b) => {
    switch (sortBy) {
      case "ending-soon":
        return a.auction.endTime.getTime() - b.auction.endTime.getTime();
      case "newest":
        return b.mintedAt.getTime() - a.mintedAt.getTime();
      case "price":
        return b.auction.highestBid - a.auction.highestBid;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onSearch={handleSearch}
      />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cosmic opacity-10" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-stellar bg-clip-text text-transparent">
              Live Auctions
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Bid on exclusive NFTs in real-time auctions. Compete for the most coveted digital art pieces with live bidding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-stellar text-lg px-8 py-4">
                Start Bidding
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4 border-primary/30 hover:border-primary" onClick={() => navigate('/')}>
                View All NFTs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auctions Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filters & Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-foreground">Active Auctions</h2>
              <Badge variant="destructive" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {sortedAuctions.length} Live
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price">Highest Bid</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border border-border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Auction Grid */}
          <div className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}>
            {sortedAuctions.map((auction) => (
              <NFTCard
                key={auction.id}
                nft={auction}
                onSelect={(selectedNft) => console.log("Selected Auction NFT:", selectedNft)}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" className="px-8 py-3">
              Load More Auctions
            </Button>
          </div>
        </div>
      </section>

      <WalletModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
};

export default Auction;
