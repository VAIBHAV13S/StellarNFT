import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Grid, List, Sparkles, TrendingUp, Users, Zap, Wallet, Search, X, ChevronDown, Star, Heart, Clock, Eye } from "lucide-react";
import { Header } from "@/components/Header";
import { NFTCard } from "@/components/NFTCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NFT, Auction, WalletState, Currency, SortBy, FilterStatus } from "@/types/marketplace";
import { useNFTs } from "@/contexts/NFTContext";
import { useWallet } from "@/contexts/WalletContext";

const Index = () => {
  const navigate = useNavigate();
  const { getAllNFTs } = useNFTs();
  const { wallet } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("XLM");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  
  const allNFTs = getAllNFTs();

  // Enhanced search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const toggleFavorite = useCallback((nftId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(nftId)) {
        newFavorites.delete(nftId);
      } else {
        newFavorites.add(nftId);
      }
      return newFavorites;
    });
  }, []);

  // Enhanced filtering and sorting with search
  const filteredNFTs = useMemo(() => {
    let filtered = allNFTs.filter(nft => {
      // Status filter
      if (filterStatus === "all") return true;
      return nft.status === filterStatus;
    });

    // Search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(nft =>
        nft.title.toLowerCase().includes(query) ||
        nft.artist.name.toLowerCase().includes(query) ||
        nft.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(nft =>
        selectedCategories.some(category =>
          nft.metadata?.category?.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Price range filter
    filtered = filtered.filter(nft => {
      const price = nft.asset === 'XLM' ? nft.price.xlm : (nft.price.kale || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort NFTs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime();
        case "price": {
          const aPrice = a.asset === 'XLM' ? a.price.xlm : (a.price.kale || 0);
          const bPrice = b.asset === 'XLM' ? b.price.xlm : (b.price.kale || 0);
          return bPrice - aPrice;
        }
        case "ending-soon": {
          const aIsAuction = a.status === 'auction' && 'auction' in a;
          const bIsAuction = b.status === 'auction' && 'auction' in b;
          if (aIsAuction && bIsAuction) {
            return new Date((a as Auction).auction.endTime).getTime() - new Date((b as Auction).auction.endTime).getTime();
          }
          return 0;
        }
        case "most-liked":
          return (b.likes || 0) - (a.likes || 0);
        case "trending":
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allNFTs, filterStatus, sortBy, debouncedSearchQuery, selectedCategories, priceRange]);

  // Enhanced marketplace stats
  const stats = useMemo(() => {
    const totalVolume = allNFTs.reduce((sum, nft) => sum + nft.price.xlm, 0);
    const activeAuctions = allNFTs.filter(nft => nft.status === 'auction').length;
    const uniqueArtists = new Set(allNFTs.map(nft => nft.artist.address)).size;
    const totalLikes = allNFTs.reduce((sum, nft) => sum + (nft.likes || 0), 0);
    const totalViews = allNFTs.reduce((sum, nft) => sum + (nft.views || 0), 0);
    const floorPrice = Math.min(...allNFTs.map(nft => nft.price.xlm));
    const avgPrice = totalVolume / allNFTs.length;

    return {
      totalNFTs: allNFTs.length,
      totalVolume,
      activeAuctions,
      uniqueArtists,
      totalLikes,
      totalViews,
      floorPrice: isFinite(floorPrice) ? floorPrice : 0,
      avgPrice: isFinite(avgPrice) ? avgPrice : 0
    };
  }, [allNFTs]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allNFTs.map(nft => nft.metadata?.category).filter(Boolean));
    return Array.from(cats);
  }, [allNFTs]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header 
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onSearch={handleSearch}
      />

      {/* Enhanced Hero Section with Search */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Enhanced Cosmic Background */}
        <div className="absolute inset-0 bg-gradient-cosmic opacity-50" />
        <div className="absolute inset-0">
          {/* Primary cosmic orbs with professional colors */}
          <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-primary/25 rounded-full blur-3xl animate-float shadow-stellar" />
          <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-accent/20 rounded-full blur-3xl animate-float shadow-glow" style={{ animationDelay: '1s' }} />

          {/* Secondary floating elements with muted colors */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-primary/15 to-accent/15 rounded-full blur-2xl animate-float opacity-20" />
          <div className="absolute top-1/6 right-1/3 w-64 h-64 bg-secondary/25 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />

          {/* Additional cosmic particles with professional colors */}
          <div className="absolute top-1/3 right-1/6 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-1/3 left-1/6 w-40 h-40 bg-accent/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />

          {/* Professional star field */}
          <div className="absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Professional overlay with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />

        {/* Interactive mouse follower with enhanced effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-0 hover:opacity-100 transition-opacity duration-1000 animate-float"
               style={{
                 top: '50%',
                 left: '50%',
                 transform: 'translate(-50%, -50%)',
                 animationDelay: '5s'
               }} />
          {/* Additional floating particles */}
          <div className="absolute w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-particle opacity-50"
               style={{
                 top: '20%',
                 left: '80%',
                 animationDelay: '2s'
               }} />
          <div className="absolute w-24 h-24 bg-success/10 rounded-full blur-xl animate-particle opacity-30"
               style={{
                 top: '80%',
                 left: '20%',
                 animationDelay: '4s'
               }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Enhanced Badge with pulse effect */}
            <div className="mb-12 animate-fade-in">
              <Badge variant="secondary" className="mb-8 px-8 py-4 text-lg font-semibold bg-white/10 backdrop-blur-md border-white/30 text-white shadow-2xl hover:shadow-glow transition-all duration-300 group">
                <Sparkles className="h-6 w-6 mr-4 animate-spin group-hover:animate-pulse" />
                Live on Stellar Network
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
              </Badge>
            </div>

            {/* Enhanced Main Heading with Advanced Typography */}
            <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black mb-12 leading-none tracking-tighter relative">
              <span className="block bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent animate-fade-in drop-shadow-2xl animate-liquid">
                Discover
              </span>
              <span className="relative block mt-6">
                <span className="bg-gradient-rainbow bg-clip-text text-transparent drop-shadow-2xl animate-shimmer" style={{ animationDelay: '0.2s' }}>
                  Stellar NFTs
                </span>
                {/* Enhanced underline with multiple layers and animations */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 h-4 bg-gradient-rainbow rounded-full animate-pulse-stellar blur-md animate-liquid" />
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-gradient-rainbow rounded-full animate-pulse-stellar animate-morph" />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-shimmer" />
              </span>
              
              {/* Floating accent elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/30 rounded-full animate-float animate-magnetic" />
              <div className="absolute -bottom-8 -left-8 w-6 h-6 bg-accent/30 rounded-full animate-float animate-particle" style={{ animationDelay: '1s' }} />
            </h1>

            {/* Enhanced Description with better spacing */}
            <p className="text-2xl md:text-3xl text-white/95 mb-16 max-w-4xl mx-auto leading-relaxed animate-fade-in font-light tracking-wide" style={{ animationDelay: '0.4s' }}>
              Explore the <span className="text-primary font-semibold">universe</span> of digital art on Stellar.
              Buy, sell, and auction unique NFTs with <span className="text-accent font-semibold">real-time</span> fiat pricing and seamless wallet integration.
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative glass-card p-2 rounded-2xl border-2 border-white/20 group-hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-6 w-6" />
                      <Input
                        type="text"
                        placeholder="Search NFTs, artists, collections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 py-4 text-lg bg-transparent border-0 text-white placeholder-white/60 focus:ring-0 focus:outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <Button
                      className="btn-gradient px-8 py-4 text-lg font-semibold group/btn"
                      onClick={() => document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <Search className="h-5 w-5 mr-2 group-hover/btn:animate-pulse" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons with Advanced Effects */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center animate-fade-in mb-20" style={{ animationDelay: '0.6s' }}>
              <Button
                className="btn-gradient text-2xl px-12 py-6 group shadow-2xl hover:shadow-glow transform hover:scale-110 transition-all duration-300 relative overflow-hidden animate-magnetic"
                onClick={() => document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="absolute inset-0 bg-gradient-rainbow animate-shimmer opacity-50" />
                <Sparkles className="h-8 w-8 mr-4 group-hover:animate-spin transition-transform relative z-10" />
                <span className="relative z-10 font-bold">Browse NFTs</span>
                <div className="absolute inset-0 bg-gradient-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
                
                {/* Magnetic field effect */}
                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-lg transition-all duration-300 animate-liquid" />
              </Button>

              <Button
                variant="outline"
                className="text-2xl px-12 py-6 border-3 border-white/40 hover:border-accent/80 text-white hover:bg-accent/10 backdrop-blur-md group shadow-2xl hover:shadow-glow transform hover:scale-110 transition-all duration-300 relative overflow-hidden animate-magnetic"
                onClick={() => navigate('/mint')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity animate-liquid" />
                <Zap className="h-8 w-8 mr-4 group-hover:animate-bounce transition-transform relative z-10" />
                <span className="relative z-10 font-bold">Create NFT</span>
                
                {/* Pulsing indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse-glow" />
              </Button>

              {!wallet.connected && (
                <Button
                  variant="secondary"
                  className="text-2xl px-12 py-6 group shadow-2xl hover:shadow-glow transform hover:scale-110 transition-all duration-300 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 relative overflow-hidden animate-magnetic"
                  onClick={() => (document.querySelector('[data-wallet-trigger]') as HTMLElement)?.click()}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity animate-liquid" />
                  <Wallet className="h-8 w-8 mr-4 group-hover:animate-pulse transition-transform relative z-10" />
                  <span className="relative z-10 font-bold">Connect Wallet</span>
                  
                  {/* Connection indicator */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </Button>
              )}
            </div>

            {/* Enhanced Stats Preview with glassmorphism */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="glass-card p-8 text-center group hover:scale-110 transition-all duration-300 hover:shadow-stellar cursor-pointer">
                <div className="text-5xl font-black bg-gradient-to-r from-white to-primary bg-clip-text text-transparent mb-3 group-hover:animate-glow">
                  {stats.totalNFTs.toLocaleString()}
                </div>
                <div className="text-white/90 text-sm uppercase tracking-widest font-semibold">Total NFTs</div>
                <div className="mt-4 w-16 h-1 bg-gradient-primary rounded-full mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="glass-card p-8 text-center group hover:scale-110 transition-all duration-300 hover:shadow-glow cursor-pointer">
                <div className="text-5xl font-black bg-gradient-to-r from-white to-accent bg-clip-text text-transparent mb-3 group-hover:animate-glow">
                  {stats.totalVolume.toFixed(0)} XLM
                </div>
                <div className="text-white/90 text-sm uppercase tracking-widest font-semibold">Total Volume</div>
                <div className="mt-4 w-16 h-1 bg-gradient-cosmic rounded-full mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="glass-card p-8 text-center group hover:scale-110 transition-all duration-300 hover:shadow-stellar cursor-pointer">
                <div className="text-5xl font-black bg-gradient-to-r from-white to-success bg-clip-text text-transparent mb-3 group-hover:animate-glow">
                  {stats.activeAuctions}
                </div>
                <div className="text-white/90 text-sm uppercase tracking-widest font-semibold">Live Auctions</div>
                <div className="mt-4 w-16 h-1 bg-gradient-neon rounded-full mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="glass-card p-8 text-center group hover:scale-110 transition-all duration-300 hover:shadow-glow cursor-pointer">
                <div className="text-5xl font-black bg-gradient-to-r from-white to-warning bg-clip-text text-transparent mb-3 group-hover:animate-glow">
                  {stats.uniqueArtists}
                </div>
                <div className="text-white/90 text-sm uppercase tracking-widest font-semibold">Artists</div>
                <div className="mt-4 w-16 h-1 bg-gradient-primary rounded-full mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stats.floorPrice.toFixed(1)} XLM
                </div>
                <div className="text-white/70 text-xs uppercase tracking-wider">Floor Price</div>
              </div>

              <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                  {stats.avgPrice.toFixed(1)} XLM
                </div>
                <div className="text-white/70 text-xs uppercase tracking-wider">Avg Price</div>
              </div>

              <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-2xl font-bold bg-gradient-to-r from-success to-accent bg-clip-text text-transparent mb-2">
                  {stats.totalLikes.toLocaleString()}
                </div>
                <div className="text-white/70 text-xs uppercase tracking-wider">Total Likes</div>
              </div>

              <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-2xl font-bold bg-gradient-to-r from-warning to-success bg-clip-text text-transparent mb-2">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-white/70 text-xs uppercase tracking-wider">Total Views</div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-8 h-14 border-2 border-white/40 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="glass-card p-6 text-center group hover:scale-105 transition-spring animate-fade-in">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2 group-hover:animate-glow">
                {stats.totalNFTs.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total NFTs</div>
              <div className="mt-2 w-12 h-1 bg-gradient-primary rounded-full mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="glass-card p-6 text-center group hover:scale-105 transition-spring animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent mb-2 group-hover:animate-glow">
                {stats.totalVolume.toFixed(0)} XLM
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total Volume</div>
              <div className="mt-2 w-12 h-1 bg-gradient-cosmic rounded-full mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="glass-card p-6 text-center group hover:scale-105 transition-spring animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent mb-2 group-hover:animate-glow">
                {stats.activeAuctions}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Live Auctions</div>
              <div className="mt-2 w-12 h-1 bg-gradient-neon rounded-full mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="glass-card p-6 text-center group hover:scale-105 transition-spring animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold bg-gradient-to-r from-warning to-accent bg-clip-text text-transparent mb-2 group-hover:animate-glow">
                {stats.uniqueArtists}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Artists</div>
              <div className="mt-2 w-12 h-1 bg-gradient-primary rounded-full mx-auto opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Marketplace Section */}
      <section id="marketplace-section" className="py-16">
        <div className="container mx-auto px-4">
          {/* Enhanced Filters & Controls */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent animate-shimmer">Marketplace</h2>
                <Badge variant="secondary" className="text-sm bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  {filteredNFTs.length} items
                </Badge>
                {debouncedSearchQuery && (
                  <Badge variant="outline" className="text-sm border-primary/50 text-primary">
                    Search: "{debouncedSearchQuery}"
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Advanced Filters Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="glass-card border-white/20 hover:bg-white/10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                  <SelectTrigger className="w-40 glass-card border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price">Price: High to Low</SelectItem>
                    <SelectItem value="ending-soon">Ending Soon</SelectItem>
                    <SelectItem value="most-liked">Most Liked</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border border-white/20 rounded-lg glass-card">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none hover:bg-primary/20"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none hover:bg-primary/20"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="glass-card p-6 mb-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">Status</label>
                    <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                      <SelectTrigger className="glass-card border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All NFTs</SelectItem>
                        <SelectItem value="sale">Buy Now</SelectItem>
                        <SelectItem value="auction">Auctions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Badge
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            selectedCategories.includes(category)
                              ? 'bg-primary text-white'
                              : 'border-white/20 text-white/70 hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setSelectedCategories(prev =>
                              prev.includes(category)
                                ? prev.filter(c => c !== category)
                                : [...prev, category]
                            );
                          }}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      Price Range: {priceRange[0]} - {priceRange[1]} XLM
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterStatus("all");
                      setSelectedCategories([]);
                      setPriceRange([0, 10000]);
                      setSearchQuery("");
                    }}
                    className="glass-card border-white/20 hover:bg-white/10"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Loading State with Advanced Skeleton */}
          {isLoading ? (
            <div className={`grid gap-8 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="nft-card animate-pulse relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-mesh animate-shimmer opacity-50" />
                  
                  <div className="relative z-10">
                    {/* Image Skeleton with Morphing Effect */}
                    <div className="w-full h-64 rounded-t-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-morph relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {/* Title Skeleton */}
                      <div className="space-y-2">
                        <div className="h-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded animate-liquid" />
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-rainbow rounded-full animate-spin" />
                          <div className="h-4 bg-muted/50 rounded w-20 animate-pulse" />
                        </div>
                      </div>
                      
                      {/* Price Skeleton */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 bg-muted/50 rounded w-16 animate-pulse" />
                          <div className="h-6 bg-gradient-to-r from-primary/30 to-accent/30 rounded w-20 animate-liquid" />
                        </div>
                        <div className="h-4 bg-muted/50 rounded w-24 animate-pulse" />
                      </div>
                      
                      {/* Button Skeleton */}
                      <div className="h-12 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-lg animate-shimmer" />
                      
                      {/* Stats Skeleton */}
                      <div className="flex justify-between">
                        <div className="flex space-x-3">
                          <div className="h-3 bg-muted/50 rounded w-8 animate-pulse" />
                          <div className="h-3 bg-muted/50 rounded w-8 animate-pulse" />
                        </div>
                        <div className="h-3 bg-muted/50 rounded w-12 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNFTs.length === 0 ? (
            /* Enhanced Empty State with Interactive Elements */
            <div className="text-center py-20 relative">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-mesh opacity-30 animate-shimmer" />
              
              <div className="max-w-md mx-auto relative z-10">
                <div className="w-32 h-32 mx-auto mb-8 glass-card flex items-center justify-center group hover:scale-110 transition-spring animate-morph relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-rainbow animate-shimmer opacity-50" />
                  <Sparkles className="h-16 w-16 text-primary animate-pulse-glow relative z-10" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 animate-liquid">
                  {debouncedSearchQuery ? `No NFTs found for "${debouncedSearchQuery}"` : 'No NFTs found'}
                </h3>
                <p className="text-muted-foreground mb-8 text-lg animate-fade-in">
                  {filterStatus === "all" 
                    ? "Be the first to mint an NFT on Stellar!" 
                    : `No ${filterStatus === "auction" ? "auctions" : "NFTs for sale"} found.`
                  }
                </p>
                <div className="flex gap-6 justify-center">
                  <Button 
                    className="btn-gradient group animate-magnetic relative overflow-hidden"
                    onClick={() => navigate('/mint')}
                  >
                    <div className="absolute inset-0 bg-gradient-rainbow animate-shimmer opacity-50" />
                    <Sparkles className="h-5 w-5 mr-3 group-hover:animate-spin transition-transform relative z-10" />
                    <span className="relative z-10">Create First NFT</span>
                    <div className="absolute inset-0 bg-gradient-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
                  </Button>
                  {(filterStatus !== "all" || selectedCategories.length > 0 || debouncedSearchQuery) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterStatus("all");
                        setSelectedCategories([]);
                        setSearchQuery("");
                      }}
                      className="glass-card border-white/20 hover:bg-white/10 animate-liquid"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                
                {/* Interactive Hint */}
                <div className="mt-8 text-sm text-muted-foreground animate-bounce-gentle">
                  💡 Try adjusting your search or filters to discover more NFTs
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced NFT Grid/List */
            <div className={`grid gap-8 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {filteredNFTs.map((nft, index) => (
                <div
                  key={nft.id}
                  className="glass-card group hover:scale-105 transition-spring animate-fade-in relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(nft.id);
                    }}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <Heart 
                      className={`h-4 w-4 transition-colors ${
                        favorites.has(nft.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'
                      }`} 
                    />
                  </button>

                  <NFTCard 
                    nft={nft}
                    onSelect={(selectedNft) => console.log("Selected NFT:", selectedNft)}
                  />

                  {/* Quick Stats Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center space-x-4 text-xs text-white/80">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{nft.views || Math.floor(Math.random() * 1000)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{nft.likes || Math.floor(Math.random() * 100)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-black/50 border-white/20">
                      {nft.metadata?.category || 'Art'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Load More */}
          {!isLoading && filteredNFTs.length > 0 && filteredNFTs.length >= 12 && (
            <div className="text-center mt-16">
              <Button 
                className="btn-primary group relative overflow-hidden"
                onClick={() => {
                  // Implement load more functionality
                  console.log("Load more NFTs");
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
                <TrendingUp className="h-5 w-5 mr-3 group-hover:animate-bounce transition-transform" />
                <span className="relative z-10">Load More NFTs</span>
                <div className="absolute inset-0 bg-gradient-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
