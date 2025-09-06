#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import pkg from '@stellar/stellar-sdk';
const { Contract, SorobanRpc, TransactionBuilder, Networks, BASE_FEE, xdr, Keypair, Operation } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const CONTRACTS_DIR = path.join(__dirname, '..');
const NFT_WASM_FILE = path.join(CONTRACTS_DIR, '..', 'stellar-nft.wasm');
const AUCTION_WASM_FILE = path.join(CONTRACTS_DIR, '..', 'stellar-auction.wasm');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deployContract(wasmFilePath, network = 'testnet') {
  const contractName = path.basename(wasmFilePath, '.wasm');
  log(`🚀 Deploying ${contractName} to ${network}...`, 'blue');

  try {
    const server = new SorobanRpc.Server(process.env.RPC_URL);
    const keypair = Keypair.fromSecret(process.env.SECRET_KEY);
    const wasm = fs.readFileSync(wasmFilePath);
    const sourceAccount = await server.getAccount(keypair.publicKey());

    // Upload WASM
    const uploadTx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: process.env.NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.uploadContractWasm({ wasm }))
      .setTimeout(120)
      .build();

    uploadTx.sign(keypair);
    const uploadResponse = await server.sendTransaction(uploadTx);

    if (uploadResponse.errorResult) {
      throw new Error(`WASM upload failed: ${JSON.stringify(uploadResponse.errorResult)}`);
    }

    // Wait for confirmation
    let wasmHash;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const txResponse = await server.getTransaction(uploadResponse.hash);
        if (txResponse.status === 'SUCCESS') {
          const meta = xdr.TransactionMeta.fromXDR(txResponse.resultMetaXdr, 'base64');
          wasmHash = meta.v3().sorobanMeta().returnValue().vec()[0].val().wasmHash();
          break;
        }
      } catch (e) {}
    }

    if (!wasmHash) {
      throw new Error('Failed to get WASM hash');
    }

    log(`✅ WASM uploaded! Hash: ${wasmHash.toString('hex')}`, 'green');

    // Create contract instance
    const salt = crypto.randomBytes(32);
    const createTx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: process.env.NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.createContract({
        wasmHash: wasmHash,
        salt: salt,
        source: keypair.publicKey()
      }))
      .setTimeout(120)
      .build();

    createTx.sign(keypair);
    const createResponse = await server.sendTransaction(createTx);

    if (createResponse.errorResult) {
      throw new Error(`Contract creation failed: ${JSON.stringify(createResponse.errorResult)}`);
    }

    // Wait for confirmation
    let contractId;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const txResponse = await server.getTransaction(createResponse.hash);
        if (txResponse.status === 'SUCCESS') {
          const meta = xdr.TransactionMeta.fromXDR(txResponse.resultMetaXdr, 'base64');
          contractId = meta.v3().sorobanMeta().returnValue().address().contractId().toString('hex');
          break;
        }
      } catch (e) {}
    }

    if (!contractId) {
      throw new Error('Failed to get contract ID');
    }

    const fullContractId = `C${contractId.toUpperCase()}`;
    log(`✅ ${contractName} deployed with ID: ${fullContractId}`, 'green');
    return { contractId: fullContractId, wasmHash: wasmHash.toString('hex') };

  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  try {
    log('🚀 Starting Stellar NFT Marketplace Contract Deployment', 'cyan');
    log('==================================================', 'cyan');

    // Check if WASM files exist
    if (!fs.existsSync(NFT_WASM_FILE)) {
      throw new Error(`NFT WASM file not found: ${NFT_WASM_FILE}`);
    }
    if (!fs.existsSync(AUCTION_WASM_FILE)) {
      throw new Error(`Auction WASM file not found: ${AUCTION_WASM_FILE}`);
    }

    log('📦 Found WASM files:', 'green');
    log(`  - ${path.basename(NFT_WASM_FILE)}`, 'yellow');
    log(`  - ${path.basename(AUCTION_WASM_FILE)}`, 'yellow');

    // Deploy contracts
    const nftResult = await deployContract(NFT_WASM_FILE);
    const auctionResult = await deployContract(AUCTION_WASM_FILE);

    // Generate contract configuration
    const config = {
      network: 'testnet',
      contracts: {
        nft: {
          contractId: nftResult.contractId,
          wasmHash: nftResult.wasmHash,
          deployedAt: new Date().toISOString()
        },
        auction: {
          contractId: auctionResult.contractId,
          wasmHash: auctionResult.wasmHash,
          deployedAt: new Date().toISOString()
        }
      }
    };

    // Save configuration
    const configPath = path.join(CONTRACTS_DIR, '..', 'src', 'config', 'contracts.json');
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    log('📝 Contract configuration saved', 'green');
    log('\n🎉 Deployment completed successfully!', 'green');
    log(`\nNFT Contract ID: ${nftResult.contractId}`, 'yellow');
    log(`Auction Contract ID: ${auctionResult.contractId}`, 'yellow');

    log('\n📋 Next Steps:', 'cyan');
    log('1. Update your React app to use the deployed contract IDs', 'white');
    log('2. Test contract interactions on testnet', 'white');
    log('3. Use Soroban CLI for advanced operations:', 'white');
    log('   soroban contract invoke --id <contract_id> --fn <function_name>', 'white');

  } catch (error) {
    log(`\n💥 Deployment failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { deployContract };
