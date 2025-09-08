#!/usr/bin/env node

import pkg from '@stellar/stellar-sdk';
const { Keypair, rpc, TransactionBuilder, Networks, BASE_FEE, Contract, nativeToScVal } = pkg;
const { Server } = rpc;

// Configuration
const CONFIG = {
  secretKey: 'SDBWQP3QMP4B4L7WBMO4X7SU2GFPXS3JS3VDREBHAJSBABC5O2U4QV4R',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  nftContractId: 'CB4SL4NTLXWBJWF7X74NQTOXR6GQCUDFBAXLMMAVSI4LCF4ZVHO7373A'
};

async function testContract() {
  console.log('🔍 Testing NFT Contract');
  console.log('========================');

  try {
    const server = new Server(CONFIG.rpcUrl);
    const keypair = Keypair.fromSecret(CONFIG.secretKey);
    
    console.log(`📦 Contract ID: ${CONFIG.nftContractId}`);
    console.log(`🔑 Public key: ${keypair.publicKey()}`);

    // Check if the contract exists by trying to get its code
    console.log('🔍 Checking contract existence...');
    
    try {
      // Try to get the contract's WASM code
      const contractData = await server.getContractData(CONFIG.nftContractId, 'CONTRACT_DATA_STELLAR_ASSET', 'persistent');
      console.log('✅ Contract exists and has data');
    } catch (error) {
      console.log('⚠️ Could not retrieve contract data:', error.message);
    }

    // Test a simple read operation by simulating
    console.log('🧪 Testing contract simulation...');
    
    // Get account for simulation
    const account = await server.getAccount(keypair.publicKey());
    
    // Try to simulate the initialize call to see what happens
    const contract = new Contract(CONFIG.nftContractId);
    
    const initOperation = contract.call('initialize',
      nativeToScVal(keypair.publicKey(), { type: 'address' })
    );

    const initTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase
    })
      .addOperation(initOperation)
      .setTimeout(300)
      .build();

    console.log('🔍 Simulating initialize call...');
    const initSimResult = await server.simulateTransaction(initTx);
    
    if ('error' in initSimResult) {
      console.log('❌ Initialize simulation failed:', initSimResult.error);
      
      // If initialize fails, the contract might already be initialized
      // Let's try a mint simulation instead
      console.log('🧪 Trying mint simulation (contract might already be initialized)...');
      
      const mintOperation = contract.call('mint',
        nativeToScVal(keypair.publicKey(), { type: 'address' }),
        nativeToScVal('Test NFT', { type: 'string' }),
        nativeToScVal('A test NFT', { type: 'string' }),
        nativeToScVal('https://example.com/image.jpg', { type: 'string' }),
        nativeToScVal([], { type: 'vec' }), // Empty attributes for test
        nativeToScVal(5, { type: 'u32' })
      );

      const mintTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: CONFIG.networkPassphrase
      })
        .addOperation(mintOperation)
        .setTimeout(300)
        .build();

      const mintSimResult = await server.simulateTransaction(mintTx);
      
      if ('error' in mintSimResult) {
        console.log('❌ Mint simulation also failed:', mintSimResult.error);
        console.log('🔍 This suggests the contract has fundamental issues');
      } else {
        console.log('✅ Mint simulation succeeded! Contract is working but already initialized');
        console.log('Simulation result:', mintSimResult);
      }
    } else {
      console.log('✅ Initialize simulation succeeded!');
      console.log('Simulation result:', initSimResult);
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testContract();
