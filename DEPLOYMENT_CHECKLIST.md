# 🚀 Stellar NFT Marketplace - Deployment Checklist

## Pre-Deployment Tasks
- [ ] Update contract IDs in `.env` with production contracts
- [ ] Configure IPFS service (Pinata/Web3.Storage)
- [ ] Test build locally: `npm run build`
- [ ] Test preview: `npm run preview`
- [ ] Commit all changes to Git
- [ ] Push to GitHub repository

## Vercel Setup
- [ ] Create Vercel account at vercel.com
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Connect GitHub repository

## Environment Variables (Vercel Dashboard)
- [ ] `VITE_PINATA_JWT` - Your Pinata JWT token
- [ ] `VITE_STELLAR_NETWORK` - testnet or mainnet
- [ ] `VITE_REFLECTOR_API_URL` - https://api.reflector.network
- [ ] `VITE_KALE_CONTRACT_ID` - Your KALE contract ID
- [ ] `VITE_AUCTION_CONTRACT_ID` - Your auction contract ID

## Deployment
- [ ] Run: `npm run deploy`
- [ ] Or manually: `npm run build && vercel --prod`
- [ ] Verify deployment at your Vercel URL

## Post-Deployment Testing
- [ ] Test wallet connections (Freighter, xBull)
- [ ] Test NFT minting with real contracts
- [ ] Test auction creation
- [ ] Verify IPFS uploads work
- [ ] Test responsive design on mobile

## Production Contract IDs
- NFT Contract: CCC7XLVONMDZDUCHDHYPMLXCIDY635PAIA7DHGAYW6JAVP6H2XRDLNGF
- Auction Contract: CB4SL4NTLXWBJWF7X74NQTOXR6GQCUDFBAXLMMAVSI4LCF4ZVHO7373A

## Useful Links
- [Stellar Explorer](https://stellar.expert/explorer/testnet/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Pinata Dashboard](https://app.pinata.cloud/)
- [Reflector Network](https://reflector.network)

---
✅ **Your NFT marketplace is ready for deployment!**
