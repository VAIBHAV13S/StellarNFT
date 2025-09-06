import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, Grid, List, Trophy, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";
import { NFTCard } from "@/components/NFTCard";
import { KaleFarm } from "@/components/KaleFarm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { Currency, NFT, Auction } from "@/types/marketplace";
import { useNFTs } from "@/contexts/NFTContext";

const Profile = () => {
  const navigate = useNavigate();
  const { getAllNFTs } = useNFTs();
  const { wallet } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get NFTs from context
  const userNFTs = getAllNFTs();
  const transactions = []; // Empty for now, will be populated from real data

  const handleConnectWallet = () => {
    // Already connected
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  const totalValue = userNFTs.reduce((sum, nft) => {
    const price = nft.status === 'auction' && 'auction' in nft
      ? nft.auction.highestBid
      : nft.price.xlm;
    return sum + price;
  }, 0);

  const totalRoyalties = 0; // Will be calculated from actual transaction data
  const auctionsWon = 3;
  const auctionsLost = 1;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onSearch={handleSearch}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-stellar rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">StarArtist</h1>
                <p className="text-muted-foreground">
                  {wallet.address?.slice(0, 8)}...{wallet.address?.slice(-6)}
                </p>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{totalValue.toFixed(1)} XLM</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Royalties Earned</p>
                <p className="text-2xl font-bold">{totalRoyalties} XLM</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Auctions Won</p>
                <p className="text-2xl font-bold">{auctionsWon}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">KALE Farmed</p>
                <p className="text-2xl font-bold">2.4 KALE</p>
              </div>
            </div>
          </Card>
        </div>

        {/* KALE Farm Section */}
        <KaleFarm className="mb-8" />

        {/* Main Content */}
        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collection">My Collection</TabsTrigger>
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="bidding">Bidding</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My NFTs ({userNFTs.length})</h2>
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

            <div className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}>
              {userNFTs.map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="created" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">NFTs Created (2)</h2>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userNFTs.slice(0, 2).map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bidding" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Active Bids (1)</h2>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userNFTs.length > 0 && (
                <NFTCard
                  key={userNFTs[0].id}
                  nft={userNFTs[0]}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Transaction History</h2>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center space-x-3">
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                        {tx.type}
                      </Badge>
                      <div>
                        <p className="font-medium">{tx.amount} {tx.asset}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'won' ? 'destructive' : 'secondary'}>
                      {tx.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
