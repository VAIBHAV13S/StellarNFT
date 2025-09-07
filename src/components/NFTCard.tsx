import { Clock, Heart, Eye, TrendingUp, Star, Zap, Award, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NFT, Auction } from "@/types/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { usePrices } from "@/contexts/PriceContext";
import { formatCurrency } from "@/lib/utils";

interface NFTCardProps {
  nft: NFT | Auction;
  onSelect?: (nft: NFT | Auction) => void;
}

export function NFTCard({ nft, onSelect }: NFTCardProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { convertToFiat } = usePrices();
  const isAuction = nft.status === 'auction' && 'auction' in nft;

  const currentPrice = isAuction ? nft.auction.highestBid : nft.price.xlm;
  const priceInUSD = convertToFiat(currentPrice, nft.asset as 'XLM' | 'KALE', 'USD');

  const formatTimeLeft = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card
      className="nft-card cursor-pointer group relative overflow-hidden border-0 hover:shadow-2xl transition-all duration-300"
      onClick={() => navigate(`/nft/${nft.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Simple hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
      
      <div className="relative">
        {/* Clean image container */}
        <div className="relative w-full h-64 overflow-hidden rounded-t-xl">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted/50 to-muted/30 rounded-t-xl" />
          )}
          <img 
            src={nft.image} 
            alt={nft.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        {/* Clean action buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-3 rounded-full bg-card/90 backdrop-blur-md border border-border/50 hover:bg-card transition-all duration-200 shadow-lg"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`} 
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Quick view functionality
              console.log('Quick view:', nft.title);
            }}
            className="p-3 rounded-full bg-card/90 backdrop-blur-md border border-border/50 hover:bg-card transition-all duration-200 shadow-lg"
          >
            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Clean status badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {nft.status === 'auction' && (
            <Badge variant="destructive" className="shadow-lg bg-red-500/90 backdrop-blur-sm border-red-400/50 px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              <span className="font-mono">
                {isAuction ? formatTimeLeft(nft.auction.endTime) : 'Live'}
              </span>
            </Badge>
          )}
          {nft.status === 'sale' && (
            <Badge variant="secondary" className="shadow-lg bg-green-500/90 backdrop-blur-sm border-green-400/50 px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              <span>Buy Now</span>
            </Badge>
          )}
        </div>

        {/* Clean rarity indicator */}
        <div className="absolute bottom-4 left-4 z-20">
          <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-border/50 text-xs px-2 py-1 shadow-lg">
            <Star className="w-3 h-3 bg-yellow-500 rounded-full mr-1" />
            Rare
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4 relative">
        {/* Clean title and artist */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors duration-300">
            {nft.title}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {nft.artist.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              by <span className="font-medium hover:text-primary transition-colors cursor-pointer">{nft.artist.name}</span>
            </p>
          </div>
        </div>

        {/* Clean price section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm font-medium">
              {isAuction ? 'Current bid' : 'Price'}
            </span>
            <div className="text-right">
              <div className="font-bold text-foreground text-lg">
                {formatCurrency(currentPrice, nft.asset as 'XLM' | 'KALE')}
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ {formatCurrency(priceInUSD, 'USD')}
              </div>
            </div>
          </div>

          {/* Clean auction info */}
          {isAuction && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {nft.auction.bidders} bids
              </span>
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Min: +{nft.auction.minBidIncrement} {nft.auction.asset}
              </span>
            </div>
          )}
        </div>

        {/* Clean action button */}
        <Button
          className="w-full btn-gradient group relative overflow-hidden shadow-lg hover:shadow-glow transition-all duration-300 h-12"
          variant="default"
        >
          <span className="flex items-center justify-center font-semibold">
            {isAuction ? (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Place Bid
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Buy Now
              </>
            )}
          </span>
        </Button>

        {/* Clean stats */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {nft.views || Math.floor(Math.random() * 1000)}
            </span>
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {nft.likes || Math.floor(Math.random() * 100)}
            </span>
          </div>
          <Badge variant="outline" className="text-xs border-border/50">
            {nft.metadata?.category || 'Art'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}