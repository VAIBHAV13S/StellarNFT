// Environment configuration for IPFS and other services
export const config = {
  // IPFS Configuration - Pinata only
  ipfs: {
    // Pinata Configuration
    pinataJwt: import.meta.env.VITE_PINATA_JWT || null,

    // Gateway URLs
    gateway: "https://ipfs.io/ipfs/",
    pinataGateway: "https://gateway.pinata.cloud/ipfs/",

    // Demo mode when no API keys are configured
    demoMode: !import.meta.env.VITE_PINATA_JWT,
  },

  // Stellar Network Configuration
  stellar: {
    network: import.meta.env.VITE_STELLAR_NETWORK || "testnet",
    horizonUrl: import.meta.env.VITE_STELLAR_NETWORK === "mainnet"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org",
  },

  // Feature Flags
  features: {
    ipfsStorage: true,
    kaleIntegration: true,
    reflectorOracle: true,
    multiWallet: true,
  },
};
