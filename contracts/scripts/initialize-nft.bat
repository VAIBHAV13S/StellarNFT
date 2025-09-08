@echo off
echo 🔧 Initializing NFT Contract
echo ===============================

set NETWORK=testnet
set DEPLOYER=admin
set NFT_CONTRACT_ID=CB4SL4NTLXWBJWF7X74NQTOXR6GQCUDFBAXLMMAVSI4LCF4ZVHO7373A

echo ⚙️ Initializing NFT Contract...
echo Contract ID: %NFT_CONTRACT_ID%

REM Get admin address
for /f %%i in ('stellar keys address %DEPLOYER%') do set ADMIN_ADDRESS=%%i
echo Admin: %ADMIN_ADDRESS%

REM Initialize the contract
stellar contract invoke ^
    --id %NFT_CONTRACT_ID% ^
    --network %NETWORK% ^
    --source-account %DEPLOYER% ^
    -- initialize ^
    --admin "%ADMIN_ADDRESS%"

if %ERRORLEVEL% equ 0 (
    echo ✅ NFT Contract initialized successfully!
    
    echo 🧪 Testing initialization...
    stellar contract invoke ^
        --id %NFT_CONTRACT_ID% ^
        --network %NETWORK% ^
        --source-account %DEPLOYER% ^
        -- get_next_token_id
        
    if %ERRORLEVEL% equ 0 (
        echo ✅ Initialization test passed!
    ) else (
        echo ⚠️ Initialization test failed
    )
) else (
    echo ❌ Initialization failed
    echo Contract may already be initialized or admin account issue
)

echo 🏁 Initialization process complete
