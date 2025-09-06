use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTMetadata {
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub attributes: Vec<NFTAttribute>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTAttribute {
    pub trait_type: String,
    pub value: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFT {
    pub id: u64,
    pub owner: Address,
    pub creator: Address,
    pub metadata: NFTMetadata,
    pub royalty_percentage: u32,
    pub minted_at: u64,
}

#[contract]
pub struct StellarNFT;

#[contractimpl]
impl StellarNFT {
    // Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "next_token_id"), &1u64);
    }

    // Mint a new NFT
    pub fn mint(
        env: Env,
        to: Address,
        name: String,
        description: String,
        image_url: String,
        attributes: Vec<NFTAttribute>,
        royalty_percentage: u32,
    ) -> u64 {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();

        let mut next_id: u64 = env.storage().instance().get(&Symbol::new(&env, "next_token_id")).unwrap_or(1);
        let token_id = next_id;
        next_id += 1;
        env.storage().instance().set(&Symbol::new(&env, "next_token_id"), &next_id);

        let metadata = NFTMetadata {
            name,
            description,
            image_url,
            attributes,
        };

        let nft = NFT {
            id: token_id,
            owner: to.clone(),
            creator: admin,
            metadata,
            royalty_percentage,
            minted_at: env.ledger().timestamp(),
        };

        // Store NFT data
        env.storage().persistent().set(&token_id, &nft);

        // Update owner's token list
        let mut owner_tokens: Vec<u64> = env.storage().persistent()
            .get(&(&to, Symbol::new(&env, "tokens")))
            .unwrap_or(Vec::new(&env));
        owner_tokens.push_back(token_id);
        env.storage().persistent().set(&(&to, Symbol::new(&env, "tokens")), &owner_tokens);

        // Emit mint event
        env.events().publish(
            (Symbol::new(&env, "mint"),),
            (token_id, to)
        );

        token_id
    }

    // Transfer NFT ownership
    pub fn transfer(env: Env, from: Address, to: Address, token_id: u64) {
        from.require_auth();

        let mut nft: NFT = env.storage().persistent().get(&token_id)
            .unwrap_or_else(|| panic!("Token does not exist"));

        if nft.owner != from {
            panic!("Not the owner");
        }

        // Update ownership
        nft.owner = to.clone();
        env.storage().persistent().set(&token_id, &nft);

        // Update token lists
        let mut from_tokens: Vec<u64> = env.storage().persistent()
            .get(&(&from, Symbol::new(&env, "tokens")))
            .unwrap_or(Vec::new(&env));
        let mut to_tokens: Vec<u64> = env.storage().persistent()
            .get(&(&to, Symbol::new(&env, "tokens")))
            .unwrap_or(Vec::new(&env));

        // Remove from sender
        if let Some(index) = from_tokens.iter().position(|&id| id == token_id) {
            from_tokens.remove(index);
        }

        // Add to receiver
        to_tokens.push_back(token_id);

        env.storage().persistent().set(&(&from, Symbol::new(&env, "tokens")), &from_tokens);
        env.storage().persistent().set(&(&to, Symbol::new(&env, "tokens")), &to_tokens);

        // Emit transfer event
        env.events().publish(
            (Symbol::new(&env, "transfer"),),
            (token_id, from, to)
        );
    }

    // Get NFT by ID
    pub fn get_nft(env: Env, token_id: u64) -> NFT {
        env.storage().persistent().get(&token_id)
            .unwrap_or_else(|| panic!("Token does not exist"))
    }

    // Get owner's tokens
    pub fn get_owner_tokens(env: Env, owner: Address) -> Vec<u64> {
        env.storage().persistent()
            .get(&(&owner, Symbol::new(&env, "tokens")))
            .unwrap_or(Vec::new(&env))
    }

    // Check if address owns token
    pub fn owner_of(env: Env, token_id: u64) -> Address {
        let nft: NFT = env.storage().persistent().get(&token_id)
            .unwrap_or_else(|| panic!("Token does not exist"));
        nft.owner
    }

    // Get total supply
    pub fn total_supply(env: Env) -> u64 {
        env.storage().instance().get(&Symbol::new(&env, "next_token_id")).unwrap_or(1) - 1
    }
}
