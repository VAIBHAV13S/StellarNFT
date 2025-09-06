# Stellar NFT Marketplace - Soroban Contracts

This directory contains the Soroban smart contracts for the Stellar NFT Marketplace.

## 📁 Structure

```
contracts/
├── nft/                    # NFT smart contract
│   ├── src/lib.rs         # Contract implementation
│   └── Cargo.toml         # Dependencies
├── auction/               # Auction smart contract
│   ├── src/lib.rs         # Contract implementation
│   └── Cargo.toml         # Dependencies
├── scripts/               # Deployment scripts
│   ├── deploy.js         # Main deployment script
│   ├── deploy-sdk.js     # SDK-based deployment
│   ├── deploy-to-testnet.sh  # Linux/Mac deployment guide
│   └── deploy-to-testnet.bat # Windows deployment guide
└── package.json           # Build scripts
```

## 🚀 Deployment Options

### Option 1: Soroban CLI (Recommended)

1. **Install Soroban CLI:**
   ```bash
   # Download from: https://soroban.stellar.org/docs/getting-started/setup
   ```

2. **Run the deployment guide:**
   ```bash
   # Linux/Mac
   ./scripts/deploy-to-testnet.sh

   # Windows
   scripts\deploy-to-testnet.bat
   ```

### Option 2: Stellar SDK (Node.js)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy using SDK:**
   ```bash
   npm run deploy:sdk SCRE...YOUR_SECRET_KEY
   ```

## 🔧 Contract Features

### NFT Contract
- ✅ Mint NFTs with metadata
- ✅ Transfer ownership
- ✅ Royalty management
- ✅ Token tracking

### Auction Contract
- ✅ Create auctions
- ✅ Place bids
- ✅ End auctions
- ✅ Bid history

## 🧪 Testing

```bash
# Build contracts
npm run build

# Run tests
npm test
```

## 📋 Manual Deployment Steps

1. **Create testnet account:**
   ```bash
   soroban keys generate deployer --network testnet
   ```

2. **Fund account:**
   ```bash
   curl "https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY"
   ```

3. **Deploy NFT contract:**
   ```bash
   soroban contract deploy --wasm stellar-nft.wasm --source deployer --network testnet
   ```

4. **Deploy Auction contract:**
   ```bash
   soroban contract deploy --wasm stellar-auction.wasm --source deployer --network testnet
   ```

5. **Update configuration:**
   - Edit `src/config/contracts.json` with real contract IDs
   - Restart your development server

## 🎯 Next Steps

- [ ] Deploy to testnet
- [ ] Test contract interactions
- [ ] Implement transaction signing in frontend
- [ ] Add auction UI components
- [ ] Deploy to mainnet

## 📚 Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Testnet](https://testnet.stellar.org)
- [Friendbot](https://friendbot.stellar.org)
