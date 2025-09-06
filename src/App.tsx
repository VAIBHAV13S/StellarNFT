import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NFTProvider } from "@/contexts/NFTContext";
import { PriceProvider } from "@/contexts/PriceContext";
import { WalletProvider } from "@/contexts/WalletContext";
import Index from "./pages/Index";
import NFTDetail from "./pages/NFTDetail";
import MintNFT from "./pages/MintNFT";
import Auction from "./pages/Auction";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <PriceProvider>
        <NFTProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auction" element={<Auction />} />
                <Route path="/nft/:id" element={<NFTDetail />} />
                <Route path="/mint" element={<MintNFT />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/help" element={<Help />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NFTProvider>
      </PriceProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
