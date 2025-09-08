#!/usr/bin/env node

import pkg from '@stellar/stellar-sdk';
const { Keypair, rpc, TransactionBuilder, Networks, BASE_FEE, Contract, nativeToScVal } = pkg;
const { Server } = rpc;

// Configuration
const CONFIG = {
  secretKey: 'SDBWQP3QMP4B4L7WBMO4X7SU2GFPXS3JS3VDREBHAJSBABC5O2U4QV4R', // Admin account from .env
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  nftContractId: 'CB4SL4NTLXWBJWF7X74NQTOXR6GQCUDFBAXLMMAVSI4LCF4ZVHO7373A'
};

async function initializeContract() {
  console.log('🔧 Initializing NFT Contract');
  console.log('===============================');

  try {
    const server = new Server(CONFIG.rpcUrl);
    const keypair = Keypair.fromSecret(CONFIG.secretKey);
    
    console.log(`🔑 Admin public key: ${keypair.publicKey()}`);
    console.log(`📦 Contract ID: ${CONFIG.nftContractId}`);

    // Get account
    console.log('📡 Getting account information...');
    const account = await server.getAccount(keypair.publicKey());
    console.log(`✅ Account loaded. Sequence: ${account.sequenceNumber()}`);
    
    // Check balances
    const xlmBalance = account.balances?.find(b => b.asset_type === 'native');
    if (xlmBalance) {
      console.log(`💰 XLM Balance: ${xlmBalance.balance}`);
    }

    // Build initialization transaction with proper Soroban preparation
    console.log('🏗️ Building initialization transaction...');
    const contract = new Contract(CONFIG.nftContractId);
    
    const operation = contract.call('initialize',
      nativeToScVal(keypair.publicKey(), { type: 'address' })
    );

    // Build initial transaction
    const transaction = new TransactionBuilder(account, {
      fee: (parseInt(BASE_FEE) * 1000).toString(), // High initial fee
      networkPassphrase: CONFIG.networkPassphrase
    })
      .addOperation(operation)
      .setTimeout(300)
      .build();

    // Prepare the transaction for Soroban (this handles fees and resource requirements)
    console.log('� Preparing transaction for Soroban...');
    const preparedTransaction = await server.prepareTransaction(transaction);
    console.log('✅ Transaction prepared with proper Soroban settings');

    // Sign transaction
    preparedTransaction.sign(keypair);
    console.log('✅ Transaction signed');

    // Submit transaction
    console.log('📤 Submitting initialization transaction...');
    const result = await server.sendTransaction(preparedTransaction);
    
    if (result.status !== 'PENDING') {
      throw new Error(`Transaction failed: ${result.status}`);
    }

    console.log(`✅ Transaction submitted: ${result.hash}`);
    console.log('⏳ Waiting for confirmation...');

    // Wait for confirmation
    let response = await server.getTransaction(result.hash);
    let attempts = 0;
    
    while (response.status === 'NOT_FOUND' && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      response = await server.getTransaction(result.hash);
      attempts++;
    }

    if (response.status === 'SUCCESS') {
      console.log('🎉 Contract initialized successfully!');
      console.log(`🔍 Transaction: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    } else {
      console.error(`❌ Initialization failed: ${response.status}`);
    }

  } catch (error) {
    console.error('💥 Initialization failed:', error.message);
    
    if (error.message.includes('already been initialized')) {
      console.log('ℹ️ Contract may already be initialized');
    }
  }
}

initializeContract();
