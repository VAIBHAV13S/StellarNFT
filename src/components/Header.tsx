import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Wallet, Menu, X, AlertCircle, Sparkles, Bell, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WalletModal } from "@/components/WalletModal";
import { WalletState, Currency } from "@/types/marketplace";
import { useWallet } from "@/contexts/WalletContext";
import { usePrices } from "@/contexts/PriceContext";
import { formatCurrency } from "@/lib/utils";

interface HeaderProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onSearch: (query: string) => void;
}

export function Header({ 
  selectedCurrency, 
  onCurrencyChange, 
  onSearch 
}: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Welcome to Stellar NFT Marketplace!', read: false },
    { id: 2, type: 'info', message: 'New NFT collection just dropped!', read: false },
    { id: 3, type: 'warning', message: 'Complete your profile to unlock features', read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const { wallet, connectWallet } = useWallet();
  const { prices, isConnected: priceConnected, convertToFiat } = usePrices();

  // Enhanced search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery.trim()) {
        onSearch(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  }, [searchQuery, onSearch]);

  const handleWalletConnect = () => {
    connectWallet();
    setShowWalletModal(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  const xlmInFiat = wallet.balance ? convertToFiat(wallet.balance.xlm, 'XLM', selectedCurrency) : 0;
  const kaleInFiat = wallet.balance ? convertToFiat(wallet.balance.kale, 'KALE', selectedCurrency) : 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-gradient-stellar rounded-lg flex items-center justify-center group-hover:animate-pulse-stellar transition-all">
                <span className="text-white font-bold text-lg">⋆</span>
              </div>
              <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                Stellar<span className="text-primary">NFT</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/auction')}
                className="text-muted-foreground hover:text-primary transition-stellar relative group"
              >
                Live Auctions
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => navigate('/mint')}
                className="text-muted-foreground hover:text-primary transition-stellar relative group"
              >
                Create
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="text-muted-foreground hover:text-primary transition-stellar relative group"
              >
                Profile
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => navigate('/help')}
                className="text-muted-foreground hover:text-primary transition-stellar relative group"
              >
                Help
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </button>
            </nav>

            {/* Desktop Search & Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Demo Mode Indicator */}
              <Badge variant="outline" className="text-xs px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative">
              <div className={`relative transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search NFTs, artists..."
                  className="pl-10 pr-10 transition-all border-white/20 bg-white/5 backdrop-blur-sm focus:bg-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-white/10" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 glass-card border border-white/20 shadow-2xl animate-fade-in z-50">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setNotifications(prev =>
                          prev.map(n =>
                            n.id === notification.id ? { ...n, read: true } : n
                          )
                        );
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-400' :
                          notification.type === 'warning' ? 'bg-yellow-400' :
                          'bg-blue-400'
                        } ${!notification.read ? 'animate-pulse' : ''}`} />
                        <div className="flex-1">
                          <p className="text-sm text-white">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setNotifications([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}

              {/* Currency Selector */}
              <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XLM">XLM</SelectItem>
                  <SelectItem value="KALE">KALE</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>

              {/* Wallet Connection */}
              {wallet.connected ? (
                <div className="flex items-center space-x-4">
                  {/* Enhanced Balance Display */}
                  <div className="text-right text-sm hidden md:block">
                    <div className="font-semibold text-foreground flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
                      {wallet.balance?.xlm.toFixed(2)} XLM
                      <span className="text-muted-foreground text-xs ml-2">
                        ({formatCurrency(xlmInFiat, selectedCurrency)})
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs flex items-center">
                      {wallet.balance?.kale.toFixed(2)} KALE
                      {!wallet.hasKaleTrustline && (
                        <span title="KALE trustline not established">
                          <AlertCircle className="h-3 w-3 ml-1 text-yellow-500" />
                        </span>
                      )}
                      <span className="ml-1">
                        ({formatCurrency(kaleInFiat, selectedCurrency)})
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </div>
                    {!priceConnected && (
                      <div className="text-yellow-500 text-xs flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Price feed offline
                      </div>
                    )}
                    {priceConnected && (
                      <div className="text-green-500 text-xs flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Reflector Active
                      </div>
                    )}
                  </div>
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="hover:bg-primary/10 border-white/20">
                      <User className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-primary/10 border-white/20">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowWalletModal(true)}
                  className="btn-stellar"
                  data-wallet-trigger
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {/* Mobile Menu Button (when no desktop actions) */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-6 space-y-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search NFTs..."
                  className="pl-10 border-white/20 bg-white/5 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => navigate('/auction')}
                  className="flex items-center px-3 py-3 text-muted-foreground hover:text-primary hover:bg-white/10 rounded-lg transition-colors"
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  Live Auctions
                </button>
                <button
                  onClick={() => navigate('/mint')}
                  className="flex items-center px-3 py-3 text-muted-foreground hover:text-primary hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  Create NFT
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center px-3 py-3 text-muted-foreground hover:text-primary hover:bg-white/10 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => navigate('/help')}
                  className="flex items-center px-3 py-3 text-muted-foreground hover:text-primary hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Help
                </button>
              </nav>

              {/* Mobile Currency Selector */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-muted-foreground">Currency:</span>
                <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
                  <SelectTrigger className="w-24 border-white/20 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XLM">XLM</SelectItem>
                    <SelectItem value="KALE">KALE</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Wallet Status */}
              {wallet.connected ? (
                <div className="p-4 bg-white/5 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Balance</span>
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>XLM:</span>
                      <span className="font-medium">{wallet.balance?.xlm.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>KALE:</span>
                      <span className="font-medium">{wallet.balance?.kale.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-white/10">
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowWalletModal(true)}
                  className="w-full btn-stellar"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      <WalletModal 
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}