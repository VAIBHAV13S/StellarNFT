#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Auction {
    pub id: u64,
    pub nft_contract: Address,
    pub nft_token_id: u64,
    pub seller: Address,
    pub highest_bidder: Address,
    pub highest_bid: i128,
    pub min_bid_increment: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub asset: Symbol, // "XLM" or "KALE"
    pub status: AuctionStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AuctionStatus {
    Active,
    Ended,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Bid {
    pub bidder: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contract]
pub struct StellarAuction;

#[contractimpl]
impl StellarAuction {
    // Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "next_auction_id"), &1u64);
    }

    // Create a new auction
    pub fn create_auction(
        env: Env,
        seller: Address,
        nft_contract: Address,
        nft_token_id: u64,
        starting_price: i128,
        min_bid_increment: i128,
        duration_hours: u32,
        asset: Symbol,
    ) -> u64 {
        seller.require_auth();

        let mut next_id: u64 = env.storage().instance().get(&Symbol::new(&env, "next_auction_id")).unwrap_or(1);
        let auction_id = next_id;
        next_id += 1;
        env.storage().instance().set(&Symbol::new(&env, "next_auction_id"), &next_id);

        let current_time = env.ledger().timestamp();
        let end_time = current_time + (duration_hours as u64 * 3600);

        let auction = Auction {
            id: auction_id,
            nft_contract: nft_contract.clone(),
            nft_token_id,
            seller: seller.clone(),
            highest_bidder: seller.clone(), // Initially set to seller
            highest_bid: starting_price,
            min_bid_increment,
            start_time: current_time,
            end_time,
            asset,
            status: AuctionStatus::Active,
        };

        // Store auction
        env.storage().persistent().set(&auction_id, &auction);

        // Store auction in seller's list
        let seller_key = Symbol::new(&env, "seller_auctions");
        let mut seller_auctions: Vec<u64> = env.storage().persistent()
            .get(&(seller.clone(), seller_key))
            .unwrap_or(Vec::new(&env));
        seller_auctions.push_back(auction_id);
        let seller_key2 = Symbol::new(&env, "seller_auctions");
        env.storage().persistent().set(&(seller.clone(), seller_key2), &seller_auctions);

        // Emit auction created event
        env.events().publish(
            (Symbol::new(&env, "auction_created"),),
            (auction_id, seller, nft_contract, nft_token_id)
        );

        auction_id
    }

    // Place a bid on an auction
    pub fn place_bid(env: Env, bidder: Address, auction_id: u64, bid_amount: i128) {
        bidder.require_auth();

        let mut auction: Auction = env.storage().persistent().get(&auction_id)
            .unwrap_or_else(|| panic!("Auction does not exist"));

        if auction.status != AuctionStatus::Active {
            panic!("Auction is not active");
        }

        let current_time = env.ledger().timestamp();
        if current_time >= auction.end_time {
            panic!("Auction has ended");
        }

        if bid_amount <= auction.highest_bid {
            panic!("Bid must be higher than current highest bid");
        }

        let min_required = auction.highest_bid + auction.min_bid_increment;
        if bid_amount < min_required {
            panic!("Bid must be at least the minimum increment");
        }

        // Update auction
        auction.highest_bidder = bidder.clone();
        auction.highest_bid = bid_amount;
        env.storage().persistent().set(&auction_id, &auction);

        // Store bid history
        let bid = Bid {
            bidder: bidder.clone(),
            amount: bid_amount,
            timestamp: current_time,
        };

        let mut bids: Vec<Bid> = env.storage().persistent()
            .get(&(auction_id, Symbol::new(&env, "bids")))
            .unwrap_or(Vec::new(&env));
        bids.push_back(bid);
        env.storage().persistent().set(&(auction_id, Symbol::new(&env, "bids")), &bids);

        // Emit bid event
        env.events().publish(
            (Symbol::new(&env, "bid_placed"),),
            (auction_id, bidder, bid_amount)
        );
    }

    // End an auction
    pub fn end_auction(env: Env, auction_id: u64) {
        let mut auction: Auction = env.storage().persistent().get(&auction_id)
            .unwrap_or_else(|| panic!("Auction does not exist"));

        let current_time = env.ledger().timestamp();

        // Only allow ending if auction has actually ended
        if current_time < auction.end_time && auction.status == AuctionStatus::Active {
            panic!("Auction is still active");
        }

        if auction.status != AuctionStatus::Active {
            panic!("Auction is not active");
        }

        auction.status = AuctionStatus::Ended;
        env.storage().persistent().set(&auction_id, &auction);

        // Emit auction ended event
        env.events().publish(
            (Symbol::new(&env, "auction_ended"),),
            (auction_id, auction.highest_bidder.clone(), auction.highest_bid)
        );
    }

    // Cancel an auction (only by seller before any bids)
    pub fn cancel_auction(env: Env, seller: Address, auction_id: u64) {
        seller.require_auth();

        let mut auction: Auction = env.storage().persistent().get(&auction_id)
            .unwrap_or_else(|| panic!("Auction does not exist"));

        if auction.seller != seller {
            panic!("Not the seller");
        }

        if auction.status != AuctionStatus::Active {
            panic!("Auction is not active");
        }

        // Check if there are any bids (besides the initial seller entry)
        let bids: Vec<Bid> = env.storage().persistent()
            .get(&(auction_id, Symbol::new(&env, "bids")))
            .unwrap_or(Vec::new(&env));

        if bids.len() > 0 {
            panic!("Cannot cancel auction with existing bids");
        }

        auction.status = AuctionStatus::Cancelled;
        env.storage().persistent().set(&auction_id, &auction);

        // Emit auction cancelled event
        env.events().publish(
            (Symbol::new(&env, "auction_cancelled"),),
            auction_id
        );
    }

    // Get auction details
    pub fn get_auction(env: Env, auction_id: u64) -> Auction {
        env.storage().persistent().get(&auction_id)
            .unwrap_or_else(|| panic!("Auction does not exist"))
    }

    // Get auction bids
    pub fn get_auction_bids(env: Env, auction_id: u64) -> Vec<Bid> {
        env.storage().persistent()
            .get(&(auction_id, Symbol::new(&env, "bids")))
            .unwrap_or(Vec::new(&env))
    }

    // Get seller's auctions
    pub fn get_seller_auctions(env: Env, seller: Address) -> Vec<u64> {
        env.storage().persistent()
            .get(&(seller, Symbol::new(&env, "seller_auctions")))
            .unwrap_or(Vec::new(&env))
    }

    // Get active auctions
    pub fn get_active_auctions(env: Env) -> Vec<u64> {
        let mut active_auctions = Vec::new(&env);
        let total_auctions: u64 = env.storage().instance().get(&Symbol::new(&env, "next_auction_id")).unwrap_or(1) - 1;

        for i in 1..=total_auctions {
            if let Some(auction) = env.storage().persistent().get::<u64, Auction>(&i) {
                if auction.status == AuctionStatus::Active {
                    active_auctions.push_back(i);
                }
            }
        }

        active_auctions
    }
}
