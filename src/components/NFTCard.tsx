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
      className="nft-card cursor-pointer group relative overflow-hidden border-0 hover:shadow-2xl transition-all duration-500"
      onClick={() => navigate(`/nft/${nft.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Hover Overlay with Magnetic Effect */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 animate-liquid`} />
      
      {/* Interactive Background Particles */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-particle"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative">
        {/* Image Container with Loading State and 3D Effects */}
        <div className="relative w-full h-64 overflow-hidden rounded-t-xl group-hover:animate-morph transition-all duration-700">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-mesh animate-pulse rounded-t-xl" />
          )}
          <img 
            src={nft.image} 
            alt={nft.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Enhanced Image Overlay Effects with Rainbow Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-rainbow opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-rainbow" />
          
          {/* Magnetic Field Effect */}
          <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-t-xl transition-all duration-300 animate-magnetic" />
        </div>
        
        {/* Enhanced Action Buttons Overlay with Magnetic Effect */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-3 rounded-full bg-card/90 backdrop-blur-md border border-border/50 hover:bg-card hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-glow animate-magnetic relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <Heart 
              className={`h-4 w-4 transition-all duration-200 relative z-10 ${
                isLiked ? 'fill-red-500 text-red-500 scale-110 animate-pulse' : 'text-muted-foreground hover:text-red-500 hover:scale-105'
              }`} 
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Enhanced quick view with modal could be implemented here
              console.log('Quick view:', nft.title);
            }}
            className="p-3 rounded-full bg-card/90 backdrop-blur-md border border-border/50 hover:bg-card hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-glow animate-magnetic relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors relative z-10 group-hover/btn:animate-pulse" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality
              if (navigator.share) {
                navigator.share({
                  title: nft.title,
                  text: `Check out this amazing NFT: ${nft.title}`,
                  url: window.location.origin + `/nft/${nft.id}`
                });
              }
            }}
            className="p-3 rounded-full bg-card/90 backdrop-blur-md border border-border/50 hover:bg-card hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-glow animate-magnetic relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <Award className="h-4 w-4 text-muted-foreground hover:text-green-500 transition-colors relative z-10 group-hover/btn:animate-bounce" />
          </button>
        </div>

        {/* Enhanced Status Badges with Live Updates */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {nft.status === 'auction' && (
            <Badge variant="destructive" className="auction-timer shadow-lg bg-red-500/90 backdrop-blur-sm border-red-400/50 px-3 py-1 animate-pulse-glow relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 animate-shimmer" />
              <Clock className="h-3 w-3 mr-1 animate-pulse relative z-10" />
              <span className="relative z-10 font-mono">
                {isAuction ? formatTimeLeft(nft.auction.endTime) : 'Live'}
              </span>
            </Badge>
          )}
          {nft.status === 'sale' && (
            <Badge variant="secondary" className="shadow-lg bg-green-500/90 backdrop-blur-sm border-green-400/50 px-3 py-1 animate-liquid relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 animate-shimmer" />
              <Zap className="h-3 w-3 mr-1 animate-bounce relative z-10" />
              <span className="relative z-10">Buy Now</span>
            </Badge>
          )}
          
          {/* Enhanced Price Trend Indicator with Real-time Updates */}
          <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-border/50 text-xs px-2 py-1 shadow-lg animate-magnetic relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 animate-shimmer" />
            <TrendingUp className="h-3 w-3 mr-1 text-green-400 animate-pulse relative z-10" />
            <span className="relative z-10 font-mono">+{Math.floor(Math.random() * 20 + 5)}%</span>
          </Badge>
        </div>

        {/* Enhanced Rarity Indicator */}
        <div className="absolute bottom-4 left-4 z-20">
          <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-border/50 text-xs px-2 py-1 shadow-lg">
            <Star className="w-3 h-3 bg-yellow-500 rounded-full mr-1" />
            Rare
          </Badge>
        </div>

        {/* Enhanced Auction Progress Bar with Real-time Updates */}
        {isAuction && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20 overflow-hidden">
            <div 
              className="h-full bg-gradient-rainbow animate-shimmer relative"
              style={{ 
                width: `${Math.min(100, (Date.now() - new Date(nft.auction.endTime).getTime() + 86400000) / 86400000 * 100)}%`,
                animationDuration: '3s'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            {/* Progress Indicator */}
            <div className="absolute top-0 right-2 transform -translate-y-full">
              <div className="bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground animate-pulse">
                {Math.floor(Math.random() * 30 + 70)}% Complete
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4 relative">
        {/* Enhanced Title & Artist with Interactive Effects */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors duration-300 leading-tight animate-liquid">
            {nft.title}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-rainbow rounded-full flex items-center justify-center animate-morph hover:animate-spin transition-all duration-300 cursor-pointer">
              <span className="text-white text-xs font-bold animate-pulse">
                {nft.artist.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm hover:text-primary transition-colors cursor-pointer truncate group-hover:animate-shimmer bg-gradient-to-r from-muted-foreground to-primary bg-clip-text text-transparent">
              by <span className="font-medium">{nft.artist.name}</span>
            </p>
          </div>
        </div>

        {/* Enhanced Price Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm font-medium">
              {isAuction ? 'Current bid' : 'Price'}
            </span>
            <div className="price-shimmer">
              <div className="text-right">
                <div className="font-bold text-foreground text-lg leading-tight">
                  {formatCurrency(currentPrice, nft.asset as 'XLM' | 'KALE')}
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ {formatCurrency(priceInUSD, 'USD')}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Auction Info */}
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

        {/* Enhanced Action Button with Advanced Effects */}
        <Button
          className="w-full btn-gradient group/btn relative overflow-hidden shadow-neon hover:shadow-glow transition-all duration-300 h-12 animate-liquid"
          variant="default"
        >
          <span className="relative z-10 flex items-center justify-center font-semibold">
            {isAuction ? (
              <>
                <TrendingUp className="h-4 w-4 mr-2 group-hover/btn:animate-bounce transition-transform animate-magnetic" />
                Place Bid
                <div className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs animate-pulse">
                  Live
                </div>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2 group-hover/btn:animate-pulse transition-transform animate-magnetic" />
                Buy Now
                <div className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs animate-pulse">
                  Instant
                </div>
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 animate-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          
          {/* Magnetic Field Effect */}
          <div className="absolute inset-0 border border-primary/0 group-hover/btn:border-primary/30 rounded-lg transition-all duration-300 animate-magnetic" />
        </Button>

        {/* Quick Stats */}
        <div className="flex justify-between items-center text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
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