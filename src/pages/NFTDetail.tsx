import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Heart, Share2, User, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NFT, Auction, WalletState, Currency, Bid } from "@/types/marketplace";
import { formatCurrency } from "@/lib/utils";
import { useNFTs } from "@/contexts/NFTContext";
import { usePrices } from "@/contexts/PriceContext";
import { useWallet } from "@/contexts/WalletContext";

// Import NFT images for initial display
import cosmicDreamsImg from "@/assets/nft-cosmic-dreams.jpg";
import nebulaGenesisImg from "@/assets/nft-nebula-genesis.jpg";
import stellarVoyageImg from "@/assets/nft-stellar-voyage.jpg";
import digitalConstellationImg from "@/assets/nft-digital-constellation.jpg";

const NFTDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNFTById } = useNFTs();
  const { convertToFiat } = usePrices();
  const { wallet } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [bidAmount, setBidAmount] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  // Find the NFT based on the ID parameter
  const nft = getNFTById(id || "");

  // If no NFT found, show placeholder with first available image
  const displayNFT = nft || {
    id: "placeholder",
    title: "NFT Not Found",
    description: "This NFT is not available in the marketplace at the moment.",
    image: cosmicDreamsImg,
    artist: { name: "Unknown Artist", address: "" },
    price: { xlm: 0, kale: 0, usd: 0, eur: 0, inr: 0 },
    asset: "XLM" as const,
    status: "sale" as const,
    mintedAt: new Date(),
    metadata: {
      category: "Unknown",
      traits: []
    },
    auction: undefined
  } as NFT & { auction?: Auction['auction'] };

  // Mock bids for demonstration (empty for now)
  const currentBids: Bid[] = [];

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  const formatTimeLeft = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleBid = () => {
    if (!bidAmount || !wallet.connected) return;
    console.log("Placing bid:", bidAmount);
    // In real app, submit bid to blockchain
  };

  const handleBuy = () => {
    if (!wallet.connected) return;
    console.log("Buying NFT");
    // In real app, execute purchase transaction
  };

  const currentPrice = (displayNFT as NFT & { auction?: Auction['auction'] }).auction ? (displayNFT as NFT & { auction?: Auction['auction'] }).auction!.highestBid : displayNFT.price.xlm;
  const fiatPrice = convertToFiat(currentPrice, displayNFT.asset, selectedCurrency);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onSearch={handleSearch}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NFT Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={displayNFT.image}
                alt={displayNFT.title}
                className="w-full h-auto object-cover"
              />
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setIsLiked(!isLiked)}
                className="flex-1"
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-6">
            {/* Title and Artist */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {displayNFT.title}
              </h1>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>by {displayNFT.artist.name}</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>

            {/* Status and Price */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant={displayNFT.status === 'auction' ? 'destructive' : 'secondary'} className="mb-2">
                    {displayNFT.status === 'auction' ? 'Live Auction' : 'Buy Now'}
                  </Badge>
                  {(displayNFT as NFT & { auction?: Auction['auction'] }).auction && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Ends in {formatTimeLeft((displayNFT as NFT & { auction?: Auction['auction'] }).auction!.endTime)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(currentPrice, displayNFT.asset)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(fiatPrice, selectedCurrency)}
                  </div>
                </div>
              </div>

              {/* Auction Stats */}
              {(displayNFT as NFT & { auction?: Auction['auction'] }).auction && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="font-semibold">{(displayNFT as NFT & { auction?: Auction['auction'] }).auction!.bidders}</div>
                    <div className="text-sm text-muted-foreground">Bids</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{(displayNFT as NFT & { auction?: Auction['auction'] }).auction!.minBidIncrement}</div>
                    <div className="text-sm text-muted-foreground">Min Increment</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{(displayNFT as NFT & { auction?: Auction['auction'] }).auction!.asset}</div>
                    <div className="text-sm text-muted-foreground">Asset</div>
                  </div>
                </div>
              )}

              {/* Bid/Buy Section */}
              {displayNFT.status === 'auction' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bid">Your Bid ({displayNFT.asset})</Label>
                    <Input
                      id="bid"
                      type="number"
                      placeholder={`Min: ${((displayNFT as NFT & { auction?: Auction['auction'] }).auction?.highestBid || 0) + ((displayNFT as NFT & { auction?: Auction['auction'] }).auction?.minBidIncrement || 0)}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleBid}
                    disabled={!wallet.connected || !bidAmount}
                    className="w-full btn-stellar"
                  >
                    {wallet.connected ? 'Place Bid' : 'Connect Wallet to Bid'}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleBuy}
                  disabled={!wallet.connected}
                  className="w-full btn-stellar"
                >
                  {wallet.connected ? 'Buy Now' : 'Connect Wallet to Buy'}
                </Button>
              )}
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="bids">Bids</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground mb-4">{displayNFT.description}</p>

                  <Separator className="my-4" />

                  <h3 className="font-semibold mb-2">Traits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {displayNFT.metadata.traits?.map((trait, index) => (
                      <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">{trait.trait_type}</div>
                        <div className="font-medium">{trait.value}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="bids" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Bid History</h3>
                  <div className="space-y-3">
                    {currentBids.map((bid) => (
                      <div key={bid.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <div className="font-medium">{bid.amount} {displayNFT.asset}</div>
                          <div className="text-sm text-muted-foreground">{bid.bidder}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bid.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {currentBids.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No bids yet
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Transaction History</h3>
                  <div className="text-center text-muted-foreground py-8">
                    No transaction history available
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;
