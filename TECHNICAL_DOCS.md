# StockLedger - Technical Documentation

**Last Updated:** Phase 2 Complete  
**Project:** Blockchain-based Stock Trading Platform

---

## Overview

StockLedger is a decentralized exchange (DEX) for synthetic stock tokens built on a custom PoA (Proof of Authority) blockchain. Users can invest USD and trade tokenized representations of stocks (AAPL, TSLA, MSFT) using an AMM (Automated Market Maker) architecture inspired by Uniswap V3.

---

## Phase 1: Custom PoA Blockchain

### Purpose
Create a private, permissioned blockchain network for recording all transactions. This gives us full control over the network without relying on Ethereum mainnet or testnets.

### Components Built

#### 1. genesis.json
**Purpose:** Configuration file for the first block of our blockchain (the "创世块").

**Key Configuration:**
```json
{
  "chainId": 1337,
  "clique": {
    "period": 1,
    "epoch": 30000
  },
  "gasLimit": "8000000"
}
```

| Parameter | Value | Reason |
|-----------|-------|--------|
| `chainId` | 1337 | Custom network identifier |
| `clique.period` | 1 | Block time in seconds (1s blocks) |
| `clique.epoch` | 30000 | Validator list refresh interval |
| `gasLimit` | 8,000,000 | Maximum gas per block |

**Logic:** Clique is the PoA consensus mechanism for Go-Ethereum. Validators take turns signing blocks in a round-robin fashion. The `period: 1` means a new block is created every 1 second.

#### 2. docker-compose.yml
**Purpose:** Orchestrate 5 Docker containers for the blockchain network.

**Services:**
| Service | Image | RPC Port | P2P Port | Purpose |
|---------|-------|----------|----------|---------|
| bootnode | ethereum/client-go:v1.13.0 | - | 30301 | Peer discovery |
| validator1 | custom geth | 8545 | 30303 | Block signer |
| validator2 | custom geth | 8547 | 30304 | Block signer |
| validator3 | custom geth | 8549 | 30305 | Block signer |
| validator4 | custom geth | 8551 | 30306 | Block signer |

**Network Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                  stockledger-net (bridge)               │
│                                                         │
│  ┌─────────────┐                                       │
│  │  bootnode   │◄── Discovery (30301)                 │
│  └──────┬──────┘                                       │
│         │                                               │
│    ┌────┴────┬────────┬────────┐                      │
│    ▼         ▼        ▼        ▼                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│ │  V1  │ │  V2  │ │  V3  │ │  V4  │                   │
│ │8545  │ │8547  │ │8549  │ │8551  │                   │
│ │30303 │ │30304 │ │30305 │ │30306 │                   │
│ └──────┘ └──────┘ └──────┘ └──────┘                   │
│   All validators connect to bootnode for peer discovery │
└─────────────────────────────────────────────────────────┘
```

**Key Geth Flags Explained:**
| Flag | Purpose |
|------|---------|
| `--datadir /data` | Blockchain data storage location |
| `--networkid 1337` | Network identifier |
| `--syncmode full` | Full node synchronization |
| `--http --http.port 8545` | HTTP RPC endpoint |
| `--ws --ws.port 8546` | WebSocket endpoint |
| `--unlock <address>` | Unlock wallet for signing |
| `--mine` | Enable block mining |
| `--miner.etherbase <address>` | Reward receiving address |
| `--bootnodes` | Bootstrap peer for discovery |
| `--allow-insecure-unlock` | Allow unlocking via HTTP (dev only) |

#### 3. scripts/generate-keys.sh
**Purpose:** Generate Ethereum account keys for each validator and bootnode.

**Process:**
```bash
for i in 1 2 3 4:
    1. Create directory: validators/validator$i/keystore
    2. Create password file: validators/validator$i/password.txt
    3. Run: geth --datadir <dir> account new --password <pwd>
    4. Extract address from keystore JSON

Generate bootnode key:
    bootnode -genkey data/bootnode/bootnode.key
```

**Output Files:**
```
validators/
├── validator1/
│   ├── keystore/
│   │   └── UTC--...--<address>.json  # Encrypted private key
│   └── password.txt                    # Wallet password
├── validator2/
│   └── ...
├── validator3/
│   └── ...
├── validator4/
│   └── ...
data/
└── bootnode/
    └── bootnode.key  # Bootnode peer ID key
```

#### 4. scripts/entrypoint.sh
**Purpose:** Docker container entry point script.

**Logic:**
```bash
#!/bin/bash
# If genesis.json not in data dir, copy from app dir
if [ ! -f /data/genesis.json ] && [ -f /app/genesis.json ]; then
    cp /app/genesis.json /data/genesis.json
fi

# Execute geth with all passed arguments
exec geth "$@"
```

**Why:** Ensures genesis block is available before geth starts.

#### 5. scripts/init.sh
**Purpose:** Initialize each validator's data directory with the genesis block.

```bash
for validator in 1 2 3 4:
    geth --datadir validators/validator$i init genesis.json
```

**Why:** Every validator needs the same genesis block to be on the same chain.

---

## Phase 2: ERC-20 Smart Contracts

### Purpose
Deploy token contracts on our custom blockchain for:
1. **USD Stablecoin** - Trading currency
2. **Stock Tokens** - Synthetic representations of real stocks

### Components Built

#### 1. Token.sol (Base ERC-20 Contract)

**Purpose:** Reusable ERC-20 token contract with minting/burning capabilities.

```solidity
contract Token is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(string name, string symbol, uint8 decimals_, uint256 initialSupply)
    
    function decimals() public view override returns (uint8)
    
    function mint(address to, uint256 amount) external onlyOwner
    
    function burn(address from, uint256 amount) external onlyOwner
}
```

**Inheritance Chain:**
```
Token
├── ERC20 (OpenZeppelin)
│   ├── IERC20
│   ├── Context
│   └── ERC20.sol (transfer, approve, balanceOf, etc.)
└── Ownable (OpenZeppelin)
    └── Access control (onlyOwner)
```

**Key Functions Explained:**

| Function | Visibility | Purpose |
|----------|------------|---------|
| `constructor` | - | Initialize token with name, symbol, decimals, initial supply |
| `decimals()` | public view | Return token decimal places (18 = wei precision) |
| `mint()` | external | Create new tokens (onlyOwner) |
| `burn()` | external | Destroy tokens (onlyOwner) |

**Why OpenZeppelin?** Battle-tested, audited, and provides standard interfaces.

#### 2. deploy.js (Hardhat Deployment Script)

**Purpose:** Deploy USD stablecoin and 3 stock tokens to the blockchain.

**Initial Token Configuration:**

| Token | Initial Supply | Decimals | Price |
|-------|---------------|----------|-------|
| USD | 1,000,000 | 18 | 1:1 USD |
| AAPL | ~857.14 | 18 | $175 |
| TSLA | ~600 | 18 | $250 |
| MSFT | ~428.57 | 18 | $350 |

**Supply Calculation:**
```
For stock tokens: Supply = Pool_Liquidity / Price
Example: AAPL = 150,000 USD / 175 = 857.14 tokens
```

**Deployment Flow:**
```
1. Get deployer signer
2. Deploy StableCoin (1M tokens)
3. For each stock (AAPL, TSLA, MSFT):
   - Calculate initial supply
   - Deploy Token contract
   - Store address
4. Save deployment addresses to JSON
```

**Output:**
```json
{
  "network": "localhost",
  "chainId": "1337",
  "tokens": {
    "USD": "0x...",
    "AAPL": "0x...",
    "TSLA": "0x...",
    "MSFT": "0x..."
  }
}
```

#### 3. hardhat.config.js

**Purpose:** Hardhat development framework configuration.

**Key Settings:**
```javascript
{
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
      chainId: 1337
    }
  }
}
```

**Why these settings:**
| Setting | Value | Reason |
|---------|-------|--------|
| Solidity version | 0.8.20 | Latest stable, built-in overflow checks |
| Optimizer | enabled | Reduce bytecode size |
| Optimizer runs | 200 | Good balance of size vs gas |

---

## Mathematical Formulas

### 1. Token Supply Calculation
```
Initial Token Supply = Pool_Liquidity / Token_Price

Where:
- Pool_Liquidity = 150,000 USD (per stock pool)
- Token_Price = Admin-set synthetic price

Example (AAPL at $175):
  150,000 / 175 = 857.142857... tokens
```

### 2. Decimal Conversion (On-Chain Math)
```
Human Readable → On-Chain:
  amount_on_chain = amount_human × 10^decimals

Example (1000 USD with 18 decimals):
  1000 × 10^18 = 1000000000000000000 wei

On-Chain → Human Readable:
  amount_human = amount_on_chain / 10^decimals
```

### 3. Block Time Calculation (Clique PoA)
```
Block_Time = clique.period = 1 second

Blocks_Per_Day = 86400 seconds / 1 = 86,400 blocks
```

---

## Future Integration Points

### Phase 3+: Backend Integration
The blockchain will be accessed via:
```go
// Go-Ethereum client connection
client, _ := ethclient.Dial("http://localhost:8545")

// Read token balance
balance, _ := token.BalanceOf(nil, walletAddress)
```

### Phase 5+: Uniswap V3 AMM
Stock tokens will be traded via AMM pools:
```
AMM Pool: USD ↔ AAPL
Formula: x × y = k (Constant Product)
Fee: 1% per swap
```

---

## Project Structure

```
stockledger/
├── blockchain/                    # Phase 1: Custom PoA Blockchain
│   ├── genesis.json             # Genesis block config
│   ├── docker-compose.yml       # 5 Docker services
│   ├── Dockerfile               # Custom Geth image
│   ├── validators/              # 4 validator keystores
│   │   └── validator{1-4}/
│   ├── data/                   # Bootnode data
│   └── scripts/
│       ├── generate-keys.sh     # Key generation
│       ├── init.sh             # Blockchain initialization
│       └── entrypoint.sh       # Docker entrypoint
│
├── contracts/                   # Phase 2: Smart Contracts
│   ├── Token.sol               # ERC-20 base contract
│   ├── hardhat.config.js       # Hardhat config
│   ├── package.json            # Dependencies
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   └── deployments/            # Deployment addresses
│
├── backend/                     # Phase 3+ (To be built)
│   ├── cmd/server/
│   └── internal/
│
├── frontend/                    # Phase 4+ (To be built)
│   ├── app/
│   └── components/
│
└── database/                    # Phase 3+ (To be built)
    └── migrations/
```

---

## Setup Commands

### Start Blockchain
```bash
cd blockchain
chmod +x scripts/*.sh
./scripts/generate-keys.sh   # Generate validator keys
./scripts/init.sh             # Initialize with genesis
docker-compose up -d          # Start 5 containers
```

### Deploy Contracts
```bash
cd contracts
npm install
npm run deploy:local          # Deploy to localhost
```

---

## Glossary

| Term | Definition |
|------|------------|
| **PoA** | Proof of Authority - Consensus where validators are pre-approved |
| **Clique** | Go-Ethereum's PoA consensus protocol |
| **Genesis Block** | The first block of a blockchain |
| **Bootnode** | Initial peer for node discovery |
| **Enode** | Ethereum node identifier (enode://pubkey@ip:port) |
| **Etherbase** | Address receiving block rewards |
| **ERC-20** | Ethereum Request for Comments #20 - Token standard |
| **Wei** | Smallest ETH unit (10^-18 ETH) |
| **Gwei** | Gas unit (10^-9 ETH) |

---

## References

- [Go-Ethereum Clique PoA](https://geth.ethereum.org/docs/fundamentals/clique)
- [ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
