import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useWallet } from "@/contexts/WalletContext";
import { Currency } from "@/types/marketplace";
import { ExternalLink, HelpCircle, Star, Zap } from "lucide-react";

const Help = () => {
  const { wallet } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  const faqs = [
    {
      question: "What is Stellar NFT Marketplace?",
      answer: "Stellar NFT Marketplace is a decentralized platform built on the Stellar network where you can mint, buy, sell, and auction NFTs using both XLM and KALE tokens."
    },
    {
      question: "What is KALE?",
      answer: "KALE is a proof-of-teamwork meme token on Stellar where participants stake, complete work, and harvest rewards. Unlike traditional farming, rewards are distributed to all contributors based on their work - it's not winner-takes-all! The community provides open-source miners (web-based and GPU-enabled) so anyone can participate, even from mobile devices."
    },
    {
      question: "What is Reflector?",
      answer: "Reflector is a push-based Stellar native oracle that provides real-time price feeds for classic assets, FX rates, and CEX/DEX prices. It operates as a DAO governed by its token and node operators, making it essential for integrating live pricing data in Stellar applications like our NFT marketplace."
    },
    {
      question: "How do I connect my wallet?",
      answer: "Click the 'Connect Wallet' button in the header and choose from supported wallets like Freighter, xBull, or Albedo. Make sure your wallet is set to the Stellar testnet for demo purposes."
    },
    {
      question: "How do auctions work?",
      answer: "Auctions run for a set time period. You can place bids in the same asset as the listing (XLM or KALE). The highest bidder wins when the auction ends. You can set minimum bid increments."
    },
    {
      question: "What are royalties?",
      answer: "Royalties are a percentage of future sales that creators earn when their NFTs are resold. You can set royalties up to 50% when minting your NFT."
    },
    {
      question: "How do I get KALE tokens?",
      answer: "You can get KALE tokens by participating in the proof-of-teamwork system through various miners available on the KALE testnet farm. The community has open-sourced different mining tools, from web-based to GPU-enabled, making it accessible to everyone."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onSearch={handleSearch}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-stellar rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Help & About
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Stellar NFT Marketplace
            </p>
          </div>

          {/* About Section */}
          <Card className="p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">About Stellar</h2>
                <p className="text-muted-foreground mb-4">
                  Stellar is a fast, open, and secure blockchain network designed for storing and transferring value.
                  It's perfect for NFTs because of its low fees, high speed, and built-in asset support.
                </p>
                <Button variant="outline" className="mb-4">
                  Learn More About Stellar
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">About KALE</h2>
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-primary mr-2" />
                  <span className="font-semibold">Proof-of-Teamwork Token</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  KALE is a proof-of-teamwork meme token where participants stake, complete work, and harvest rewards. 
                  Unlike traditional farming contracts, rewards are distributed to all working farmers based on their contributions - it's not winner-takes-all!
                </p>
                <p className="text-muted-foreground mb-4">
                  The community has open-sourced different miners, from web-based to GPU-enabled, so anyone can participate, even from your phone!
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    kaleonstellar.com
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Telegram
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Testnet Farm
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    GitHub
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">About Reflector</h2>
                <div className="flex items-center mb-4">
                  <Zap className="h-5 w-5 text-primary mr-2" />
                  <span className="font-semibold">Stellar Native Oracle</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Reflector is a push-based Stellar native oracle featuring price feeds for classic assets, FX rates, and CEXs/DEXs. 
                  It operates as a DAO with decisions governed by its token and node operators.
                </p>
                <p className="text-muted-foreground mb-4">
                  Due to Stellar's smart contract architecture, oracles like Reflector are essential for integrating real-time pricing data.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    reflector.network
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Discord
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Docs
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    GitHub
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fast Transactions</h3>
              <p className="text-muted-foreground text-sm">
                Stellar's network processes transactions in seconds with minimal fees
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-Asset Support</h3>
              <p className="text-muted-foreground text-sm">
                Buy and sell NFTs using both XLM and KALE tokens
              </p>
            </Card>

            <Card className="p-6 text-center">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Creator Royalties</h3>
              <p className="text-muted-foreground text-sm">
                Earn ongoing royalties from secondary sales of your NFTs
              </p>
            </Card>

            <Card className="p-6 text-center">
              <ExternalLink className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Price Feeds</h3>
              <p className="text-muted-foreground text-sm">
                Real-time pricing powered by Reflector oracle
              </p>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {/* Getting Started */}
          <Card className="p-8 mt-8">
            <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">For Buyers</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Connect your Stellar wallet</li>
                  <li>Browse the marketplace</li>
                  <li>Buy NFTs or place bids in auctions</li>
                  <li>Manage your collection in your profile</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">For Creators</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Connect your wallet</li>
                  <li>Click "Create NFT" to mint</li>
                  <li>Upload artwork and set details</li>
                  <li>Choose XLM or KALE for pricing</li>
                  <li>Set royalties and list for sale</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
