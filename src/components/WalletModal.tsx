import { useState, useEffect } from "react";
import { X, ExternalLink, Wallet, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { WalletType } from "@/lib/wallet";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<{ type: WalletType; available: boolean }[]>([]);
  const { connectWallet, isWalletAvailable } = useWallet();
  const { toast } = useToast();

  const checkWallets = async () => {
    const wallets = [
      { type: WalletType.FREIGHTER, name: 'Freighter' },
      { type: WalletType.XBULL, name: 'xBull' },
    ];

    const checkedWallets = await Promise.all(
      wallets.map(async (wallet) => {
        const available = await isWalletAvailable(wallet.type);
        console.log(`${wallet.name} available:`, available);
        return {
          type: wallet.type,
          available,
        };
      })
    );

    setAvailableWallets(checkedWallets);
  };

  useEffect(() => {
    if (open) {
      // Debug: Check what wallet APIs are available on window
      console.log('Wallet APIs available on window:');
      const windowWithWallets = window as unknown as Record<string, unknown>;
      console.log('Freighter:', !!(windowWithWallets.freighter));
      console.log('xBull:', !!(windowWithWallets.xBull));
      console.log('xbull:', !!(windowWithWallets.xbull));
      console.log('xBullSDK:', !!(windowWithWallets.xBullSDK));
      console.log('stellar.xBull:', !!(windowWithWallets.stellar as Record<string, unknown>)?.xBull);

      // Log the actual window properties for debugging
      const walletProps = Object.keys(windowWithWallets).filter(key =>
        key.toLowerCase().includes('bull') ||
        key.toLowerCase().includes('freighter') ||
        key.toLowerCase().includes('stellar')
      );
      console.log('Wallet-related window properties:', walletProps);

      // Also log the full xBull object if it exists
      if (windowWithWallets.xBull) {
        console.log('xBull object:', windowWithWallets.xBull);
      }
      if (windowWithWallets.xbull) {
        console.log('xbull object:', windowWithWallets.xbull);
      }

      checkWallets();
    }
  }, [open, isWalletAvailable]);

  const handleConnect = async (walletType: WalletType) => {
    try {
      setConnecting(walletType);
      await connectWallet(walletType);
      onClose();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      });
    } catch (error) {
      console.error(`Connection failed for ${walletType}:`, error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDemoConnect = async () => {
    try {
      setConnecting('demo');
      // Use demo wallet for development
      const demoConnection = (await import('@/lib/wallet')).createWalletConnection('demo');
      await demoConnection.connect();
      onClose();
      toast({
        title: "Demo Wallet Connected",
        description: "Demo wallet connected for testing purposes.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect demo wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleManualFreighterConnect = async () => {
    try {
      setConnecting('freighter-manual');
      console.log('Attempting manual Freighter connection...');

      // Try to access Freighter extension directly
      const globalWindow = window as unknown as Record<string, unknown>;
      const freighterAPI = globalWindow.freighter;

      if (!freighterAPI) {
        throw new Error('Freighter API not found on window object. Please check if the extension is properly installed.');
      }

      console.log('Found Freighter API:', freighterAPI);
      console.log('Available methods:', Object.keys(freighterAPI as Record<string, unknown>));

      const freighterObj = freighterAPI as Record<string, unknown>;
      let address: string;

      // Check if already connected
      if (typeof freighterObj.isConnected === 'function') {
        const isConnected = await (freighterObj.isConnected as () => Promise<boolean>)();
        console.log('Freighter isConnected:', isConnected);
        if (!isConnected) {
          console.log('Requesting Freighter connection...');
          await (freighterObj.connect as () => Promise<void>)();
          console.log('Freighter connection established');
        }
      }

      // Get the public key
      if (typeof freighterObj.getPublicKey === 'function') {
        console.log('Requesting Freighter public key...');
        address = await (freighterObj.getPublicKey as () => Promise<string>)();
        console.log('Freighter connected successfully with address:', address);
      } else {
        throw new Error('Freighter getPublicKey method not available');
      }

      // Update wallet context manually
      const walletConnection = (await import('@/lib/wallet')).createWalletConnection('stellar');
      walletConnection['_address'] = address;
      walletConnection['_isConnected'] = true;

      onClose();
      toast({
        title: "Freighter Connected",
        description: `Connected with address: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      // Refresh the page to update wallet state
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error('Manual Freighter connection failed:', error);
      toast({
        title: "Manual Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect manually. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleManualXBullConnect = async () => {
    try {
      setConnecting('xbull-manual');
      console.log('Attempting manual xBull connection...');

      // Try to access xBull extension directly
      const globalWindow = window as unknown as Record<string, unknown>;
      const xBullAPI = globalWindow.xBull || globalWindow.xbull || globalWindow.xBullSDK || (globalWindow.stellar as Record<string, unknown>)?.xBull;

      if (!xBullAPI) {
        throw new Error('xBull API not found on window object. Please check if the extension is properly installed.');
      }

      console.log('Found xBull API:', xBullAPI);
      console.log('Available methods:', Object.keys(xBullAPI as Record<string, unknown>));

      const xBullObj = xBullAPI as Record<string, unknown>;
      let address: string;

      // Step 1: Request permissions first (required by xBull)
      if (typeof xBullObj.connect === 'function') {
        console.log('Requesting xBull permissions...');
        try {
          const permissions = await (xBullObj.connect as (options: { canRequestPublicKey: boolean; canRequestSign: boolean }) => Promise<unknown>)({
            canRequestPublicKey: true,
            canRequestSign: true
          });
          console.log('xBull permissions granted:', permissions);
        } catch (permError) {
          console.warn('xBull permission request failed:', permError);
          // Continue anyway, some versions might not require explicit permissions
        }
      }

      // Step 2: Now try to get the public key
      const methods = ['getPublicKey', 'getAddress'];
      for (const method of methods) {
        if (typeof xBullObj[method] === 'function') {
          console.log(`Trying xBull.${method}()...`);
          try {
            const result = await (xBullObj[method] as () => Promise<unknown>)();
            if (typeof result === 'string') {
              address = result;
              console.log(`xBull connected successfully with address via ${method}:`, address);
              break;
            } else if (result && typeof result === 'object' && 'address' in result) {
              address = (result as { address: string }).address;
              console.log(`xBull connected successfully with address via ${method}:`, address);
              break;
            } else if (result && typeof result === 'object' && 'publicKey' in result) {
              address = (result as { publicKey: string }).publicKey;
              console.log(`xBull connected successfully with address via ${method}:`, address);
              break;
            }
          } catch (error) {
            console.warn(`${method} failed:`, error);
          }
        }
      }

      if (!address) {
        throw new Error('Could not retrieve address from xBull');
      }

      // Update wallet context manually
      const walletConnection = (await import('@/lib/wallet')).createWalletConnection('stellar');
      walletConnection['_address'] = address;
      walletConnection['_isConnected'] = true;

      onClose();
      toast({
        title: "xBull Connected",
        description: `Connected with address: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      // Refresh the page to update wallet state
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error('Manual xBull connection failed:', error);
      toast({
        title: "Manual Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect manually. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect your Stellar wallet to start buying, selling, and bidding on NFTs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button
              onClick={checkWallets}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🔄 Refresh Wallets
            </Button>
          </div>

          {/* Production Wallets */}
          {availableWallets.map(({ type, available }) => (
            <div key={type}>
              <div
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  available
                    ? 'border-border bg-card/50 hover:bg-card/80 cursor-pointer'
                    : 'border-border/50 bg-muted/20 cursor-not-allowed'
                }`}
                onClick={available ? () => handleConnect(type) : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      {type === WalletType.FREIGHTER ? 'Freighter' : 'xBull'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {available ? 'Available' : type === WalletType.XBULL ? 'Check if extension is enabled' : 'Not installed'}
                    </p>
                  </div>
                </div>
                {connecting === type ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : available ? (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">Install</span>
                )}
              </div>

              {/* Manual connection options */}
              {type === WalletType.FREIGHTER && !available && (
                <div className="mt-2 ml-4">
                  <Button
                    onClick={handleManualFreighterConnect}
                    disabled={connecting === 'freighter-manual'}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {connecting === 'freighter-manual' ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      'Try Manual Connect'
                    )}
                  </Button>
                </div>
              )}

              {/* Manual xBull connection option */}
              {type === WalletType.XBULL && !available && (
                <div className="mt-2 ml-4">
                  <Button
                    onClick={handleManualXBullConnect}
                    disabled={connecting === 'xbull-manual'}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {connecting === 'xbull-manual' ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      'Try Manual Connect'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Demo Wallet */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 cursor-pointer"
            onClick={handleDemoConnect}
          >
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium text-foreground">Demo Wallet</p>
                <p className="text-sm text-muted-foreground">For testing purposes</p>
              </div>
            </div>
            {connecting === 'demo' ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Production Wallets:</strong> Freighter and xBull provide secure connections to the Stellar network.
            <br />
            <strong>Demo Wallet:</strong> Creates a test wallet for demonstration and development.
            <br />
            <br />
            <em>Note: If wallets aren't detected, try refreshing the page or clicking "Refresh Wallets".</em>
          </p>
          
          {/* Show installation links when no wallets are available */}
          {availableWallets.every(wallet => !wallet.available) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-3">Don't have a wallet yet?</p>
              <div className="flex flex-col gap-2">
                <a 
                  href="https://www.freighter.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm underline"
                >
                  📥 Install Freighter Wallet
                </a>
                <a 
                  href="https://xbull.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm underline"
                >
                  📥 Install xBull Wallet
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}