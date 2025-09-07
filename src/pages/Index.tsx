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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Header 
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onSearch={handleSearch}
      />

      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-3/4 right-1/2 w-64 h-64 bg-primary/5 rounded-full blur-xl" />
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Status Badge */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <Badge className="px-6 py-2 text-sm font-medium bg-primary/10 border-primary/20 text-primary hover:bg-primary/15 transition-colors">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" />
                Live on Stellar Network
              </Badge>
            </div>

            {/* Hero Content */}
            <div className="text-center space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                <span className="block text-foreground mb-4">
                  Discover & Collect
                </span>
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Stellar NFTs
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground leading-relaxed">
                The premier marketplace for digital art on Stellar blockchain. 
                Trade with confidence using real-time pricing and seamless wallet integration.
              </p>

              {/* Hero Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2 group-hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          type="text"
                          placeholder="Search NFTs, artists, or collections..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 pr-4 py-4 text-lg bg-transparent border-0 focus:ring-0"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      <Button
                        size="lg"
                        className="px-6 font-semibold"
                        onClick={() => document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        <Search className="h-5 w-5 mr-2" />
                        Explore
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold min-w-[200px] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                  onClick={() => document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Sparkles className="h-6 w-6 mr-3" />
                  Browse Marketplace
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold min-w-[200px] border-2 hover:bg-accent/5 hover:border-accent transition-all duration-300"
                  onClick={() => navigate('/mint')}
                >
                  <Zap className="h-6 w-6 mr-3" />
                  Create NFT
                </Button>

                {!wallet.connected && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold min-w-[200px] hover:bg-secondary/80 transition-all duration-300"
                    onClick={() => (document.querySelector('[data-wallet-trigger]') as HTMLElement)?.click()}
                  >
                    <Wallet className="h-6 w-6 mr-3" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-20 animate-fade-in">
              {[
                { label: 'Total NFTs', value: stats.totalNFTs.toLocaleString(), icon: '🎨' },
                { label: 'Total Volume', value: `${stats.totalVolume.toFixed(0)} XLM`, icon: '💎' },
                { label: 'Live Auctions', value: stats.activeAuctions.toString(), icon: '⚡' },
                { label: 'Artists', value: stats.uniqueArtists.toString(), icon: '👨‍🎨' }
              ].map((stat, index) => (
                <div key={stat.label} className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:bg-card/50 transition-colors group">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Indicator */}
            <div className="flex justify-center mt-16">
              <div className="animate-bounce">
                <ChevronDown className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Marketplace Section */}
      <section id="marketplace-section" className="py-24 bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Marketplace</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover unique digital artworks and collectibles from talented creators worldwide
            </p>
          </div>

          {/* Enhanced Filters & Controls */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-foreground">Collections</h3>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {filteredNFTs.length} items
                  </Badge>
                </div>
                {debouncedSearchQuery && (
                  <Badge variant="outline" className="text-sm border-primary/50 text-primary bg-primary/5">
                    🔍 "{debouncedSearchQuery}"
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                {/* Enhanced Filters Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-border/50 hover:bg-accent/5 hover:border-accent/50 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </Button>

                {/* Sort Options */}
                <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                  <SelectTrigger className="w-48 border-border/50 hover:border-accent/50 transition-colors">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">🆕 Newest First</SelectItem>
                    <SelectItem value="price">💰 Price: High to Low</SelectItem>
                    <SelectItem value="ending-soon">⏰ Ending Soon</SelectItem>
                    <SelectItem value="most-liked">❤️ Most Liked</SelectItem>
                    <SelectItem value="trending">🔥 Trending</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-border/50 rounded-lg overflow-hidden bg-card/50">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none hover:bg-primary/10"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none hover:bg-primary/10"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Filters Panel */}
            {showFilters && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Status Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Availability</label>
                    <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                      <SelectTrigger className="border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🌟 All Items</SelectItem>
                        <SelectItem value="sale">🛒 Buy Now</SelectItem>
                        <SelectItem value="auction">⚡ Live Auctions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Badge
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            selectedCategories.includes(category)
                              ? 'bg-primary text-primary-foreground shadow-lg'
                              : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
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
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Price Range: {priceRange[0]} - {priceRange[1]} XLM
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full accent-primary"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full accent-primary"
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
                    className="border-border/50 hover:bg-destructive/5 hover:border-destructive/50 hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Loading State */}
          {isLoading ? (
            <div className={`grid gap-8 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-gradient-to-r from-primary/10 to-accent/10"></div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-6 bg-muted/50 rounded"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-muted/50 rounded-full"></div>
                        <div className="h-4 bg-muted/50 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-muted/50 rounded w-16"></div>
                        <div className="h-6 bg-muted/50 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-muted/50 rounded w-24"></div>
                    </div>
                    <div className="h-12 bg-muted/50 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNFTs.length === 0 ? (
            /* Enhanced Empty State */
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 mx-auto mb-8 bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl flex items-center justify-center group hover:scale-105 transition-transform">
                  <Sparkles className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {debouncedSearchQuery ? `No NFTs found for "${debouncedSearchQuery}"` : 'No NFTs found'}
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  {filterStatus === "all" 
                    ? "Be the first to mint an NFT on Stellar!" 
                    : `No ${filterStatus === "auction" ? "auctions" : "NFTs for sale"} found.`
                  }
                </p>
                <div className="flex gap-6 justify-center">
                  <Button 
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    onClick={() => navigate('/mint')}
                  >
                    <Sparkles className="h-5 w-5 mr-3" />
                    Create First NFT
                  </Button>
                  {(filterStatus !== "all" || selectedCategories.length > 0 || debouncedSearchQuery) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterStatus("all");
                        setSelectedCategories([]);
                        setSearchQuery("");
                      }}
                      className="border-border/50 hover:bg-card/50"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced NFT Grid */
            <div className={`grid gap-8 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {filteredNFTs.map((nft, index) => (
                <div
                  key={nft.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <NFTCard 
                    nft={nft}
                    onSelect={(selectedNft) => console.log("Selected NFT:", selectedNft)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {!isLoading && filteredNFTs.length > 0 && filteredNFTs.length >= 12 && (
            <div className="text-center mt-16">
              <Button 
                size="lg"
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={() => {
                  // Implement load more functionality
                  console.log("Load more NFTs");
                }}
              >
                <TrendingUp className="h-5 w-5 mr-3" />
                Load More NFTs
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
