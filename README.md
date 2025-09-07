# � Stellar NFT Marketplace

> **The premier decentralized NFT marketplace on Stellar blockchain**

A modern, professional NFT marketplace built on the Stellar network, featuring multi-asset support with XLM and KALE, real-time fiat pricing via Reflector oracle, and a beautiful cosmic-themed user experience.

## 🚀 Live Demo

**🌐 Production Site**: [https://stellar-qd4j7ywud-vaibhav13s-projects.vercel.app](https://stellar-qd4j7ywud-vaibhav13s-projects.vercel.app)

Experience the full marketplace with:
- Complete NFT browsing and filtering
- Demo wallet integration
- Sample NFT collections
- Interactive auction system
- KALE farming simulation

## 🎨 Brand Identity

Our project features a custom-designed logo representing the cosmic nature of digital art and the stellar blockchain:
- **Primary Logo**: Stellar constellation design with geometric elements
- **Favicon**: Multi-size favicon set (16x16 to 512x512)
- **Theme Colors**: Deep space blues with stellar accents
- **Typography**: Modern, clean sans-serif fonts

## ✨ Features

### 🎯 Core Functionality
- **Multi-Asset Trading**: Buy and sell NFTs using both XLM and KALE tokens
- **Auction System**: Time-based auctions with live bidding
- **NFT Minting**: Create and mint NFTs with custom metadata and royalties
- **Real-Time Pricing**: Live fiat conversion using Reflector oracle
- **Wallet Integration**: Support for Freighter, xBull, and Albedo wallets
- **Demo Mode**: Full functionality without blockchain connection

### 🎨 Modern UI/UX
- **Professional Design**: Clean, modern interface with glassmorphism effects
- **Advanced Search**: Real-time search with category and price filters
- **Responsive Layout**: Mobile-first design that works on all devices
- **Loading States**: Beautiful skeleton loaders and smooth animations
- **Grid/List Views**: Multiple viewing options for the marketplace
- **Accessibility**: Full keyboard navigation and screen reader support

### 🥬 KALE Integration
- **Proof-of-Teamwork**: KALE farming with fair reward distribution
- **Community Mining**: Web-based and GPU-enabled miners
- **Team Collaboration**: Work together to harvest rewards
- **Mobile Support**: Participate from any device

### Technical Features
- **Stellar Network**: Built on fast, low-fee Stellar blockchain
- **Soroban Ready**: Prepared for smart contract integration
- **IPFS Storage**: Decentralized artwork storage via NFT.storage
- **Responsive Design**: Mobile-first cosmic UI
- **TypeScript**: Full type safety
- **Real-time Updates**: Live price feeds and auction timers

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Stellar SDK + Soroban
- **Wallets**: Freighter, xBull, Albedo
- **Oracle**: Reflector (reflector.network)
- **State Management**: TanStack Query
- **Routing**: React Router

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Stellar wallet (Freighter, xBull, or Albedo)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stellar-nft-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

### Build for Production
```bash
npm run build
npm run preview
```

## 🌟 KALE - Proof-of-Teamwork Token

KALE is a revolutionary proof-of-teamwork meme token on Stellar where:

- **Fair Distribution**: Rewards distributed to ALL contributors based on work
- **Community Mining**: Open-source miners (web + GPU) for everyone
- **Mobile Friendly**: Participate from any device
- **Team Collaboration**: Work together to maximize rewards

### Getting KALE Tokens
1. Visit [kaleonstellar.com](https://kaleonstellar.com/)
2. Join the community on [Telegram](https://t.me/kaleonstellar)
3. Try the testnet farm at [testnet.kalefarm.xyz](https://testnet.kalefarm.xyz/)
4. Check the source code at [GitHub](https://github.com/kalepail/KALE-sc)

## 📊 Reflector Oracle

Reflector provides essential price feeds for the Stellar ecosystem:

- **Real-Time Pricing**: Classic assets, FX rates, CEX/DEX prices
- **DAO Governance**: Community-driven decision making
- **Node Operators**: Decentralized oracle network
- **Smart Contract Integration**: Native Stellar compatibility

### Resources
- Website: [reflector.network](https://reflector.network)
- Discord: [discord.gg/2tWP5SX9dh](https://discord.gg/2tWP5SX9dh)
- Documentation: [reflector.network/docs](https://reflector.network/docs)
- Source Code: [github.com/reflector-network](https://github.com/reflector-network)

## 🎨 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation and wallet connection
│   ├── NFTCard.tsx     # NFT display component
│   ├── WalletModal.tsx # Wallet selection
│   ├── KaleFarm.tsx    # KALE farming interface
│   └── ui/             # shadcn/ui components
├── pages/              # Route components
│   ├── Index.tsx       # Marketplace homepage
│   ├── NFTDetail.tsx   # Individual NFT view
│   ├── MintNFT.tsx     # NFT creation
│   ├── Profile.tsx     # User dashboard
│   └── Help.tsx        # Information and FAQ
├── types/              # TypeScript definitions
├── lib/                # Utilities and helpers
└── assets/             # Images and media
```

## 🔧 Configuration

### IPFS Setup (Pinata - Free Decentralized Storage)
- **Free Tier**: 1GB storage + 10GB bandwidth per month
- **Setup**:
  1. Visit [pinata.cloud](https://pinata.cloud/)
  2. Create a free account
  3. Go to API Keys section
  4. Generate a new API Key with JWT
  5. Add to `.env`: `VITE_PINATA_JWT=your_jwt_token_here`

#### 🌟 **Web3.Storage** (Recommended - Most Generous Free Tier)
- **Free Tier**: 5GB storage + 5GB bandwidth per month
- **Setup**:
  1. Visit [web3.storage](https://web3.storage/)
  2. Sign up for a free account
  3. Create a new space and generate an API token
  4. Add to `.env`: `VITE_WEB3_STORAGE_TOKEN=your_token_here`



#### 🔧 **Infura** (Technical Option)
- **Free Tier**: Available with rate limits
- **Setup**:
  1. Visit [infura.io](https://infura.io/)
  2. Create a free account
  3. Get your Project ID and Secret
  4. Add to `.env`:
     ```
     VITE_INFURA_PROJECT_ID=your_project_id
     VITE_INFURA_PROJECT_SECRET=your_project_secret
     ```

### Environment Variables
Create a `.env` file for configuration:

```env
# IPFS Configuration (Pinata)
VITE_PINATA_JWT=your_pinata_jwt_here

# Stellar Network
VITE_STELLAR_NETWORK=testnet
VITE_REFLECTOR_API_URL=https://api.reflector.network
VITE_KALE_CONTRACT_ID=your-contract-id
```

### Wallet Setup
1. Install a Stellar wallet (Freighter recommended)
2. Switch to testnet for development
3. Fund your wallet with test XLM
4. Get KALE tokens from the testnet farm

## 🌌 Demo Features

The application includes comprehensive demo functionality:

- **4 Sample NFTs**: Mix of XLM and KALE listings with IPFS URLs
- **Active Auctions**: Live timers and bidding simulation
- **Mock Transactions**: Complete user flow without real funds
- **IPFS Integration**: Demo mode with placeholder URLs
- **KALE Farming**: Interactive farming simulation
- **Price Conversion**: Real-time fiat calculations
- **NFT Minting**: Full minting flow with IPFS upload simulation

## 🚀 Deployment

### Quick Deploy (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy with one command
npm run deploy
```

### Windows Users
```batch
# Run the deployment script
deploy.bat
```

### Manual Deployment
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Or use the deployment script**
   ```bash
   ./deploy.sh  # Linux/Mac
   deploy.bat   # Windows
   ```

### Manual Build & Deploy
```bash
# Build for production
npm run build

# Preview locally
npm run preview

# Deploy dist/ folder to any static hosting
```

### Environment Variables
Create a `.env` file for configuration:

```env
# IPFS Configuration (Pinata)
VITE_PINATA_JWT=your_pinata_jwt_here

# Stellar Network & Contracts
VITE_STELLAR_NETWORK=testnet
VITE_REFLECTOR_API_URL=https://api.reflector.network
VITE_KALE_CONTRACT_ID=CB4SL4NTLXWBJWF7X74NQTOXR6GQCUDFBAXLMMAVSI4LCF4ZVHO7373A
VITE_AUCTION_CONTRACT_ID=CCC7XLVONMDZDUCHDHYPMLXCIDY635PAIA7DHGAYW6JAVP6H2XRDLNGF
```