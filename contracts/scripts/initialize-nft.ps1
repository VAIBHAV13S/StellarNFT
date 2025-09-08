#!/usr/bin/env pwsh

# NFT Contract Initialization Script following deploy.sh pattern
# Based on the successful KALE deployment script

Write-Host "🔧 Initializing NFT Contract" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Configuration
$NETWORK = "testnet"
$DEPLOYER = "admin"  # Use admin account like in deploy.sh
$NFT_CONTRACT_ID = "CB4SL4NTLXWBJWF7X74NQTOXR6GQCUDFBAXLMMAVSI4LCF4ZVHO7373A"

# Check if stellar CLI is available
try {
    $stellarVersion = stellar --version
    Write-Host "✓ Stellar CLI found: $stellarVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: stellar CLI not installed" -ForegroundColor Red
    Write-Host "Install from: https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup" -ForegroundColor Yellow
    exit 1
}

# Get admin address
try {
    $ADMIN_ADDRESS = stellar keys address $DEPLOYER
    Write-Host "✓ Admin address: $ADMIN_ADDRESS" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Could not get admin address for '$DEPLOYER'" -ForegroundColor Red
    Write-Host "Create admin account with: stellar keys generate --global $DEPLOYER --network $NETWORK" -ForegroundColor Yellow
    exit 1
}

# Initialize NFT Contract
Write-Host "⚙️ Initializing NFT Contract..." -ForegroundColor Yellow
Write-Host "Contract ID: $NFT_CONTRACT_ID" -ForegroundColor Cyan
Write-Host "Admin: $ADMIN_ADDRESS" -ForegroundColor Cyan

try {
    stellar contract invoke `
        --id $NFT_CONTRACT_ID `
        --network $NETWORK `
        --source-account $DEPLOYER `
        -- initialize `
        --admin "$ADMIN_ADDRESS"
    
    Write-Host "✅ NFT Contract initialized successfully!" -ForegroundColor Green
    
    # Test the initialization by checking next token ID
    Write-Host "🧪 Testing initialization..." -ForegroundColor Yellow
    
    $result = stellar contract invoke `
        --id $NFT_CONTRACT_ID `
        --network $NETWORK `
        --source-account $DEPLOYER `
        -- get_next_token_id
    
    Write-Host "✅ Next token ID: $result" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Initialization failed: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*already*initialized*") {
        Write-Host "ℹ️ Contract may already be initialized" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*not found*") {
        Write-Host "🔴 Contract not found - may need to be deployed first" -ForegroundColor Red
    } else {
        Write-Host "💡 Try checking if the admin account exists and is funded" -ForegroundColor Yellow
    }
}

Write-Host "🏁 Initialization process complete" -ForegroundColor Green
