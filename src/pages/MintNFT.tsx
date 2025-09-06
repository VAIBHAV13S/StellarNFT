import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WalletState, Currency } from "@/types/marketplace";
import { formatCurrency } from "@/lib/utils";
import { ipfsService } from "@/lib/ipfs";
import { useToast } from "@/hooks/use-toast";
import { useNFTs } from "@/contexts/NFTContext";
import { usePrices } from "@/contexts/PriceContext";
import { useWallet } from "@/contexts/WalletContext";
import { contractService } from "@/lib/contracts";

const MintNFT = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNFT } = useNFTs();
  const { convertToFiat } = usePrices();
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [selectedAsset, setSelectedAsset] = useState<'XLM' | 'KALE'>('XLM');
  const [price, setPrice] = useState('');
  const [royalty, setRoyalty] = useState('5');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Your wallet is now connected and ready for minting",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleMint = async () => {
    if (!selectedFile || !title || !price || !wallet.connected) return;

    setIsMinting(true);
    setUploadProgress('Preparing upload...');

    try {
      // Check if IPFS service is available
      if (!ipfsService.isAvailable()) {
        toast({
          title: "IPFS Service Unavailable",
          description: "Please configure NFT.Storage API key for IPFS uploads",
          variant: "destructive",
        });
        return;
      }

      setUploadProgress('Uploading artwork to IPFS...');

      // Upload artwork to IPFS and create metadata
      const { metadataUrl, imageUrl } = await ipfsService.createNFTMetadata({
        name: title,
        description: description || 'No description provided',
        file: selectedFile,
        attributes: [
          { trait_type: 'Asset', value: selectedAsset },
          { trait_type: 'Royalty', value: `${royalty}%` },
          { trait_type: 'Price', value: `${price} ${selectedAsset}` }
        ],
        external_url: window.location.origin
      });

      setUploadProgress('Minting NFT on Stellar...');

      // Use the wallet context for minting
      if (!wallet.address) {
        throw new Error('Wallet address not available');
      }

      // Mint NFT using Soroban contract
      const mintResult = await contractService.mintNFT(
        wallet.address || '',
        title,
        description || 'No description provided',
        imageUrl,
        [
          { trait_type: 'Asset', value: selectedAsset },
          { trait_type: 'Royalty', value: `${royalty}%` },
          { trait_type: 'Price', value: `${price} ${selectedAsset}` }
        ],
        parseInt(royalty) || 5
      );

      console.log('Mint result:', mintResult);

      // Create new NFT object
      const newNFT = {
        id: Date.now().toString(), // Temporary ID until we get real token ID from contract
        title,
        description: description || 'No description provided',
        image: imageUrl,
        artist: { 
          name: "You", 
          address: wallet.address || "Unknown" 
        },
        price: { 
          xlm: selectedAsset === 'XLM' ? parseFloat(price) : parseFloat(price) * 10,
          kale: selectedAsset === 'KALE' ? parseFloat(price) : parseFloat(price) / 10,
          usd: convertToFiat(parseFloat(price), selectedAsset, 'USD'),
          eur: convertToFiat(parseFloat(price), selectedAsset, 'EUR'),
          inr: convertToFiat(parseFloat(price), selectedAsset, 'INR')
        },
        asset: selectedAsset,
        status: "sale" as const,
        mintedAt: new Date(),
        transactionHash: "pending", // Will be updated when contract integration is complete
        metadata: { 
          category: "Digital Art",
          traits: [
            { trait_type: 'Asset', value: selectedAsset },
            { trait_type: 'Royalty', value: `${royalty}%` }
          ]
        }
      };

      // Add to NFT context
      addNFT(newNFT);

      console.log("NFT Minted Successfully:", newNFT);

      toast({
        title: "NFT Minted Successfully! 🎉",
        description: `Your NFT "${title}" has been minted on Stellar blockchain`,
      });

      // Navigate to success page or show success message
      navigate('/');
    } catch (error) {
      console.error('Minting failed:', error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
      setUploadProgress('');
    }
  };

  const priceNum = parseFloat(price) || 0;
  const fiatPrice = convertToFiat(priceNum, selectedAsset, selectedCurrency);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onSearch={handleSearch}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Your NFT
            </h1>
            <p className="text-muted-foreground">
              Mint a unique digital asset on the Stellar network
            </p>
          </div>

          <div className="space-y-6">
            {/* File Upload */}
            <Card className="p-6">
              <Label className="text-base font-semibold mb-4 block">
                Upload Artwork
              </Label>

              {!selectedFile ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Drop your artwork here</p>
                    <p className="text-muted-foreground">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="btn-stellar mt-4 inline-block">
                    Choose File
                  </Label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>

            {/* NFT Details */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter NFT title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your NFT..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="asset">Asset</Label>
                    <Select value={selectedAsset} onValueChange={(value: 'XLM' | 'KALE') => setSelectedAsset(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XLM">XLM</SelectItem>
                        <SelectItem value="KALE">KALE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Price ({selectedAsset}) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {price && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Price in {selectedCurrency}
                    </div>
                    <div className="font-medium">
                      {formatCurrency(fiatPrice, selectedCurrency)}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="royalty">Royalty (%)</Label>
                  <Input
                    id="royalty"
                    type="number"
                    placeholder="5"
                    value={royalty}
                    onChange={(e) => setRoyalty(e.target.value)}
                    className="mt-1"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </Card>

            {/* Preview */}
            {selectedFile && title && price && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="space-y-2">
                    <h4 className="font-medium">{title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{selectedAsset}</Badge>
                      <span className="font-medium">
                        {formatCurrency(priceNum, selectedAsset)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Royalty: {royalty}%
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Mint Button */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={wallet.connected ? handleMint : handleConnectWallet}
                disabled={!selectedFile || !title || !price || isMinting}
                className="flex-1 btn-stellar"
              >
                {isMinting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>{uploadProgress || 'Minting...'}</span>
                  </div>
                ) : wallet.connected ? (
                  'Mint NFT'
                ) : (
                  'Connect Wallet to Mint'
                )}
              </Button>
            </div>

            {/* IPFS Info */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">IPFS</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-primary mb-1">Decentralized Storage</p>
                  <p className="text-muted-foreground">
                    Your artwork will be permanently stored on IPFS and minted as an NFT on the Stellar blockchain.
                    {ipfsService.isAvailable() ? (
                      <span className="text-green-600 ml-1">
                        Using {ipfsService.getProviderName().toUpperCase()} + Soroban Contracts
                      </span>
                    ) : (
                      <span className="text-orange-500 ml-1">
                        Demo mode - configure API keys for production
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintNFT;
