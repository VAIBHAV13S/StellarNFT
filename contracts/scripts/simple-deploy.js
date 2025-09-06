#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from '@stellar/stellar-sdk';
const { Keypair, rpc, TransactionBuilder, Networks, BASE_FEE, xdr, Operation } = pkg;
const { Server } = rpc;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  secretKey: 'SDBWQP3QMP4B4L7WBMO4X7SU2GFPXS3JS3VDREBHAJSBABC5O2U4QV4R',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  nftWasmPath: join(__dirname, '..', '..', 'stellar-nft.wasm'),
  auctionWasmPath: join(__dirname, '..', '..', 'stellar-auction.wasm')
};

async function deployContract(wasmPath, contractName) {
  console.log(`🚀 Deploying ${contractName} contract...`);

  try {
    const server = new Server(CONFIG.rpcUrl);
    const keypair = Keypair.fromSecret(CONFIG.secretKey);
    const wasm = readFileSync(wasmPath);

    console.log(`📦 WASM file size: ${wasm.length} bytes`);
    console.log(`🔑 Deployer public key: ${keypair.publicKey()}`);

    // Get account
    console.log('📡 Getting account information...');
    const sourceAccount = await server.getAccount(keypair.publicKey());
    console.log('✅ Account loaded successfully');

    // Upload WASM
    console.log('📤 Uploading WASM to network...');
    const uploadTx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase,
    })
      .addOperation(Operation.uploadContractWasm({ wasm }))
      .setTimeout(120)
      .build();

    uploadTx.sign(keypair);
    console.log('📝 Sending upload transaction...');
    const uploadResponse = await server.sendTransaction(uploadTx);

    if (uploadResponse.errorResult) {
      throw new Error(`WASM upload failed: ${JSON.stringify(uploadResponse.errorResult)}`);
    }

    console.log(`✅ Upload transaction sent: ${uploadResponse.hash}`);

    // Wait for confirmation and get WASM hash
    console.log('⏳ Waiting for upload confirmation...');
    let wasmHash;
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const txResponse = await server.getTransaction(uploadResponse.hash);
        if (txResponse.status === 'SUCCESS') {
          const meta = xdr.TransactionMeta.fromXDR(txResponse.resultMetaXdr, 'base64');
          wasmHash = meta.v3().sorobanMeta().returnValue().vec()[0].val().wasmHash();
          console.log(`✅ WASM uploaded! Hash: ${wasmHash.toString('hex')}`);
          break;
        } else if (txResponse.status === 'FAILED') {
          throw new Error(`Upload transaction failed: ${JSON.stringify(txResponse.resultXdr)}`);
        }
      } catch (e) {
        console.log(`⏳ Still waiting... (${i + 1}/30)`);
      }
    }

    if (!wasmHash) {
      throw new Error('Failed to get WASM hash after 30 attempts');
    }

    // Create contract instance
    console.log('🏗️ Creating contract instance...');
    const salt = crypto.randomBytes(32);
    const createTx = new TransactionBuilder(await server.getAccount(keypair.publicKey()), {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase,
    })
      .addOperation(Operation.createContract({
        wasmHash: wasmHash,
        salt: salt,
        source: keypair.publicKey()
      }))
      .setTimeout(120)
      .build();

    createTx.sign(keypair);
    console.log('📝 Sending create contract transaction...');
    const createResponse = await server.sendTransaction(createTx);

    if (createResponse.errorResult) {
      throw new Error(`Contract creation failed: ${JSON.stringify(createResponse.errorResult)}`);
    }

    console.log(`✅ Create transaction sent: ${createResponse.hash}`);

    // Wait for confirmation and get contract ID
    console.log('⏳ Waiting for contract creation confirmation...');
    let contractId;
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const txResponse = await server.getTransaction(createResponse.hash);
        if (txResponse.status === 'SUCCESS') {
          const meta = xdr.TransactionMeta.fromXDR(txResponse.resultMetaXdr, 'base64');
          contractId = meta.v3().sorobanMeta().returnValue().address().contractId().toString('hex');
          const fullContractId = `C${contractId.toUpperCase()}`;
          console.log(`🎉 ${contractName} deployed successfully!`);
          console.log(`📋 Contract ID: ${fullContractId}`);
          return { contractId: fullContractId, wasmHash: wasmHash.toString('hex') };
        } else if (txResponse.status === 'FAILED') {
          throw new Error(`Create contract transaction failed: ${JSON.stringify(txResponse.resultXdr)}`);
        }
      } catch (e) {
        console.log(`⏳ Still waiting... (${i + 1}/30)`);
      }
    }

    throw new Error('Failed to get contract ID after 30 attempts');

  } catch (error) {
    console.error(`❌ ${contractName} deployment failed:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Stellar NFT Marketplace Contract Deployment');
    console.log('==================================================');

    // Check WASM files
    console.log('📦 Checking WASM files...');
    const fs = await import('fs');
    const crypto = await import('crypto');

    if (!fs.existsSync(CONFIG.nftWasmPath)) {
      throw new Error(`NFT WASM file not found: ${CONFIG.nftWasmPath}`);
    }
    if (!fs.existsSync(CONFIG.auctionWasmPath)) {
      throw new Error(`Auction WASM file not found: ${CONFIG.auctionWasmPath}`);
    }

    console.log('✅ WASM files found');

    // Deploy contracts
    const nftResult = await deployContract(CONFIG.nftWasmPath, 'NFT');
    console.log('');
    const auctionResult = await deployContract(CONFIG.auctionWasmPath, 'Auction');

    // Save configuration
    console.log('\n📝 Saving contract configuration...');
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

    const configPath = join(__dirname, '..', '..', 'src', 'contracts', 'deployed-contracts.json');
    fs.mkdirSync(dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log('✅ Configuration saved');

    console.log('\n🎉 Deployment completed successfully!');
    console.log(`\n📋 Contract IDs:`);
    console.log(`NFT: ${nftResult.contractId}`);
    console.log(`Auction: ${auctionResult.contractId}`);

    console.log('\n📋 Next Steps:');
    console.log('1. Update your .env file with these contract IDs');
    console.log('2. Restart your development server');
    console.log('3. Test the NFT marketplace with real contracts!');

  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
