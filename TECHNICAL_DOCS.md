# StockLedger - Technical Documentation

**Last Updated:** Phase 5 Complete  
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

#### 3. scripts/generate-keys.sh
**Purpose:** Generate Ethereum account keys for each validator and bootnode.

**Process:**
```bash
for i in 1 2 3 4:
    1. Create directory: validators/validator$i/keystore
    2. Create password file: validators/validator$i/password.txt
    3. Run: geth --datadir <dir> account new --password <pwd>
    4. Extract address from keystore JSON
```

#### 4. scripts/entrypoint.sh
**Purpose:** Docker container entry point script.

**Logic:**
```bash
#!/bin/bash
if [ ! -f /data/genesis.json ] && [ -f /app/genesis.json ]; then
    cp /app/genesis.json /data/genesis.json
fi
exec geth "$@"
```

#### 5. scripts/init.sh
**Purpose:** Initialize each validator's data directory with the genesis block.

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

#### 3. hardhat.config.js
**Purpose:** Hardhat development framework configuration.

---

## Phase 3: Go Backend

### Purpose
Build the server-side API for user management, trading, and pool operations.

### Architecture
```
backend/
├── cmd/server/main.go          # Entry point
├── internal/
│   ├── api/
│   │   ├── handlers.go         # HTTP handlers
│   │   └── routes.go          # API routes
│   ├── config/
│   │   └── config.go          # JSON config loader
│   ├── database/
│   │   └── mysql.go           # GORM connection + migrations
│   ├── models/
│   │   ├── user.go            # User with USD + stock balances
│   │   ├── transaction.go     # Transaction types
│   │   ├── pool.go            # Pool state
│   │   └── admin_price.go     # Admin price control
│   ├── repository/
│   │   ├── user_repo.go
│   │   ├── transaction_repo.go
│   │   ├── pool_repo.go
│   │   └── admin_price_repo.go
│   ├── services/
│   │   ├── wallet.go          # Register, Deposit, Withdraw
│   │   ├── swap.go            # ExecuteSwap, InitializePools
│   │   └── admin.go           # Admin price management
│   ├── ammpool/
│   │   └── engine.go          # Constant product AMM logic
│   └── blockchain/
│       └── client.go          # Ethereum client wrapper
└── config.json                 # Configuration file
```

### Key Features

#### User Registration (Mints 10k USD)
```go
func (s *WalletService) RegisterUser(walletAddress string) (*models.User, error) {
    user := &models.User{
        WalletAddress: walletAddress,
        USDBalance:    10000.0, // Initial USD
    }
    // Create user and record transaction
}
```

#### AMM Engine (1% Fee)
```go
func (p *PoolState) CalculateSwapInput(amountIn float64, isUSDToStock bool) (float64, float64) {
    fee := amountIn * 0.01 // 1% fee
    amountInWithFee := amountIn - fee
    // Constant product formula: x * y = k
    outputAmount = p.StockReserve - (p.USDReserve * p.StockReserve / (p.USDReserve + amountInWithFee))
    return outputAmount, fee
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user (mints 10k USD) |
| GET | `/api/wallet/:address` | Get balance |
| GET | `/api/wallet/:address/transactions` | Get transactions |
| POST | `/api/swap` | Execute swap |
| GET | `/api/pools` | List all pools |
| GET | `/api/pools/:symbol` | Get pool details |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/price` | Update stock price |
| GET | `/api/admin/stats` | System statistics |

### Database Schema (GORM AutoMigrate)

**users table:**
| Column | Type | Description |
|--------|------|-------------|
| id | uint (PK) | Auto-increment |
| wallet_address | string | Ethereum address (unique) |
| usd_balance | float64 | USD balance |
| aapl_balance | float64 | AAPL stock balance |
| tsla_balance | float64 | TSLA stock balance |
| msft_balance | float64 | MSFT stock balance |
| created_at | timestamp | Registration time |
| updated_at | timestamp | Last update |

**transactions table:**
| Column | Type | Description |
|--------|------|-------------|
| id | uint (PK) | Auto-increment |
| user_id | uint | User reference |
| type | string | DEPOSIT, WITHDRAW, SWAP_IN, SWAP_OUT |
| token | string | Token symbol |
| amount | float64 | Transaction amount |
| price | float64 | Price at time of tx |
| fee | float64 | Fee paid |
| pool_id | uint | Pool reference |
| tx_hash | string | Blockchain tx hash |

**pools table:**
| Column | Type | Description |
|--------|------|-------------|
| id | uint (PK) | Auto-increment |
| symbol | string | AAPL, TSLA, MSFT |
| usd_reserve | float64 | USD in pool |
| stock_reserve | float64 | Stock tokens in pool |
| price | float64 | Current price |
| fee_tier | float64 | 0.01 (1%) |
| total_liquidity | float64 | Total liquidity |

---

## Phase 4: Next.js Frontend

### Purpose
Build the user interface for trading, portfolio management, and pool viewing.

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, features, CTA |
| Auth | `/auth` | Register/Login (10k USD) |
| Dashboard | `/dashboard` | Portfolio, balances |
| Trading | `/trading` | Swap USD ↔ Stocks |
| Pools | `/pools` | View liquidity pools |
| Admin | `/admin` | Admin panel |

### Components

| Component | Description |
|-----------|-------------|
| Navbar.tsx | Navigation with wallet address display |
| Wallet.tsx | Balance display (USD, AAPL, TSLA, MSFT) |
| SwapForm.tsx | Swap interface with token selection |
| PoolCard.tsx | Pool display with stats |

### API Integration
```typescript
// lib/api.ts
export const api = {
  register: (data) => fetchAPI('/api/auth/register', { method: 'POST', body: ... }),
  getBalance: (address) => fetchAPI(`/api/wallet/${address}`),
  swap: (data) => fetchAPI('/api/swap', { method: 'POST', body: ... }),
  getPools: () => fetchAPI('/api/pools'),
  // ... more endpoints
};
```

---

## Phase 5: Admin Panel

### Purpose
Allow admins to manage synthetic stock prices and monitor system.

### Features

| Feature | Description |
|---------|-------------|
| Login | Simple password (admin123) |
| System Stats | Total users, transactions, liquidity |
| Pool Status | View all pool reserves |
| Price Update | Change AAPL/TSLA/MSFT prices |
| Price Alerts | Triggers when price changes > 10% |

### Alert Logic
```go
func (s *AdminService) UpdatePrice(input *UpdatePriceInput) (*models.AdminPrice, error) {
    // ... update price ...
    
    threshold := 0.10 // 10% change
    changePercent := (input.Price - oldPrice) / oldPrice
    if changePercent > threshold {
        // Trigger alert
        go s.triggerPriceAlert(input.Symbol, oldPrice, input.Price)
    }
}

func (s *AdminService) triggerPriceAlert(symbol string, oldPrice, newPrice float64) {
    println("ALERT: Price change detected!")
    println("Symbol:", symbol)
    println("Old Price:", oldPrice)
    println("New Price:", newPrice)
    println("Change %:", ((newPrice-oldPrice)/oldPrice)*100)
}
```

---

## Mathematical Formulas

### 1. Token Supply Calculation
```
Initial Token Supply = Pool_Liquidity / Token_Price

Example (AAPL at $175):
  150,000 / 175 = 857.142857... tokens
```

### 2. AMM Constant Product Formula
```
x × y = k (constant product)

For swap (USD → Stock):
  outputAmount = stockReserve - (usdReserve × stockReserve / (usdReserve + inputWithFee))

Where:
  inputWithFee = input × (1 - feeTier)
  feeTier = 0.01 (1%)
```

### 3. Decimal Conversion (On-Chain Math)
```
Human Readable → On-Chain:
  amount_on_chain = amount_human × 10^decimals

Example (1000 USD with 18 decimals):
  1000 × 10^18 = 1000000000000000000 wei
```

### 4. Block Time Calculation (Clique PoA)
```
Block_Time = clique.period = 1 second
```

---

## Project Structure (Complete)

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
│       ├── generate-keys.sh
│       ├── init.sh
│       └── entrypoint.sh
│
├── contracts/                   # Phase 2: Smart Contracts
│   ├── Token.sol               # ERC-20 base contract
│   ├── hardhat.config.js       # Hardhat config
│   ├── package.json            # Dependencies
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   └── .env.example            # Environment template
│
├── backend/                     # Phase 3: Go Backend
│   ├── cmd/server/main.go      # Entry point
│   ├── config.json             # Configuration
│   ├── go.mod                  # Go module
│   └── internal/
│       ├── api/                # Handlers & routes
│       ├── ammpool/            # AMM engine
│       ├── blockchain/          # Ethereum client
│       ├── config/             # Config loader
│       ├── database/           # MySQL connection
│       ├── models/             # DB models
│       ├── repository/         # Database operations
│       └── services/           # Business logic
│
├── frontend/                    # Phase 4: Next.js Frontend
│   ├── package.json            # Dependencies
│   ├── next.config.js          # Next.js config
│   ├── tsconfig.json           # TypeScript config
│   ├── app/
│   │   ├── page.tsx            # Landing
│   │   ├── layout.tsx          # Root layout
│   │   ├── auth/page.tsx       # Register
│   │   ├── dashboard/page.tsx  # Portfolio
│   │   ├── trading/page.tsx    # Swap
│   │   ├── pools/page.tsx      # Pool info
│   │   └── admin/page.tsx      # Admin panel
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Wallet.tsx
│   │   ├── SwapForm.tsx
│   │   └── PoolCard.tsx
│   └── lib/
│       └── api.ts             # API client
│
├── database/                    # Database migrations (future)
│   └── migrations/
│
└── TECHNICAL_DOCS.md           # This documentation
```

---

## Setup Commands

### Phase 1: Start Blockchain
```bash
cd blockchain
chmod +x scripts/*.sh
./scripts/generate-keys.sh
./scripts/init.sh
docker-compose up -d
```

### Phase 2: Deploy Contracts
```bash
cd contracts
npm install
npm run deploy:local
```

### Phase 3: Run Backend
```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

### Phase 4: Run Frontend
```bash
cd frontend
npm install
npm run dev
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
| **ERC-20** | Ethereum Request for Comments #20 - Token standard |
| **AMM** | Automated Market Maker - decentralized exchange algorithm |
| **GORM** | Go ORM - Object-Relational Mapping for Go |
| **Gin** | Go web framework |
| **Synthetic** | Artificially created (not real stock) |

---

## References

- [Go-Ethereum Clique PoA](https://geth.ethereum.org/docs/fundamentals/clique)
- [ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [GORM Documentation](https://gorm.io/)
- [Next.js Documentation](https://nextjs.org/docs)