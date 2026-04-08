📈 StockLedger

A decentralized stock exchange built on a blockchain using an AMM (Automated Market Maker) with the constant product formula `x·y=k`. No order book, no central authority — trades execute directly against liquidity pools.

## How it works

```
User wants to swap AAPL → MSFT

Step 1:  User sends AAPL into AAPL/USD pool
         Pool gives back USD (internal, never minted)

Step 2:  That USD goes into MSFT/USD pool
         Pool gives out MSFT to user

x · y = k maintained in both pools throughout
```

## Architecture

```
                    User / Trader
                         │
                         ▼
                      Router
               (path + slippage check)
                    │         │
                    ▼         ▼
             Pool AAPL    Pool MSFT       ← one per stock
             Pool TSLA    Pool NVDA       ← identical contract, different state
                    │
                    ▼
            Stock Tokens (ERC-20)
            LP Share Tokens
                    │
                    ▼
            On-chain State + Event Log    ← source of truth
```

## Key Components

### AMM Pool (`x·y=k`)
Each stock has its own pool paired against an internal USD routing token.
```
price        = reserveUSD / reserveStock
amount_out   = reserveUSD - (k / (reserveStock + amount_in × 0.997))
fee          = 0.3% per swap, stays in pool
```

### Router
Single entry point for all trades. Chains two pool calls, enforces slippage tolerance, reverts atomically if output is below `minOut`.

### Factory
Deploys new Pool contracts when stocks are listed. Maintains a registry for the router to look up pools by symbol.

### Event Indexer (off-chain)
Consumes on-chain `Swap`, `Deposit`, `Withdraw` events via Kafka. Fans out to portfolio, analytics, and notification services with `txHash`-keyed idempotency.

## Liquidity Providers

LPs deposit both sides of a pool (stock + USD) and earn 0.3% of every swap.

```
deposit(500 AAPL + $75,000 USD)  →  receive LP-AAPL shares
withdraw(LP-AAPL shares)         →  receive pool share + fees earned
```

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity |
| Backend | Golang |
| Frontend | Next.js |
| Database | PostgreSQL |
| Event Queue | Kafka |
| Blockchain | Custom chain |

## Finance Concepts

| Term | Meaning |
|---|---|
| AMM | Prices set by pool ratio, not order book |
| Liquidity | Total value of tokens in a pool |
| Slippage | Price movement caused by your own trade |
| Impermanent loss | LP value loss when price diverges from deposit price |
| Arbitrage | Bots that keep pool prices in sync with real market |

## Getting Started

```bash
git clone https://github.com/ayushchoudhary-3190/stockledger
cd stockledger
go mod tidy
docker-compose up --build
```




# StockLedger

A blockchain-based decentralized exchange (DEX) for trading synthetic stock tokens using AMM (Automated Market Maker) architecture inspired by Uniswap V3.

---

## Overview

StockLedger allows users to:
- **Register** with a wallet address and receive **10,000 USD** free
- **Buy/Sell** synthetic stocks (AAPL, TSLA, MSFT) using USD
- **Provide liquidity** to earn swap fees
- **Admin** manages stock prices and system configuration

The platform is built with a **custom PoA blockchain**, **Go backend**, and **Next.js frontend**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                    │
│   /auth  /dashboard  /trading  /pools  /admin                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API (Go)                        │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  │
│   │  Auth   │  │ Wallet  │  │  Swap   │  │    Admin     │  │
│   │ Service │  │ Service │  │ Service │  │   Service    │  │
│   └─────────┘  └─────────┘  └─────────┘  └──────────────┘  │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              AMM Engine (Off-chain)                 │   │
│   │    Constant Product (x × y = k)  |  1% Fee         │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│         MySQL          │    │   Custom Blockchain     │
│  ┌─────────────────┐   │    │   (Go-Ethereum PoA)     │
│  │     Users       │   │    │   4 Validators          │
│  │  Transactions  │   │    │                         │
│  │     Pools      │   │    │  ┌────┐┌────┐┌────┐┌────┐│
│  └─────────────────┘   │    │  │ V1 ││ V2 ││ V3 ││ V4 ││
└─────────────────────────┘    │  └────┘└────┘└────┘└────┘│
                                 └─────────────────────────┘
                                           │
                                           ▼
                                 ┌─────────────────────────┐
                                 │     ERC-20 Tokens      │
                                 │  USD │ AAPL │ TSLA │ MSFT
                                 └─────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Blockchain** | Go-Ethereum (Clique PoA) | Custom private chain |
| **Backend** | Go + Gin + GORM | REST API, business logic |
| **Frontend** | Next.js 14 + TypeScript | User interface |
| **Database** | MySQL | Data persistence |
| **Smart Contracts** | Solidity + Hardhat | ERC-20 tokens |

---

## Features

### User Features
- **Wallet Registration** - Get 10,000 USD free on signup
- **Buy Stocks** - Swap USD for AAPL, TSLA, or MSFT
- **Sell Stocks** - Swap stocks back to USD
- **View Portfolio** - See all token balances
- **Transaction History** - Track all swaps and transfers

### AMM Features
- **Constant Product Formula** - x × y = k
- **1% Swap Fee** - Fee goes to liquidity providers
- **Off-chain Calculation** - Fast trades without on-chain execution

### Admin Features
- **Price Management** - Update synthetic stock prices
- **System Statistics** - View users, transactions, liquidity
- **Price Alerts** - Notification when price changes > 10%
- **Pool Initialization** - Initialize liquidity pools

### Blockchain Features
- **4 Validator Nodes** - PoA consensus
- **1 Second Block Time** - Fast transaction finality
- **Custom Chain ID** - 1337

---

## How It Works

### 1. User Registration
```
User → POST /api/auth/register → Backend
                              ↓
                    Create User with 10,000 USD
                              ↓
                    Record DEPOSIT transaction
```

### 2. Trading (Swap)
```
User → POST /api/swap
              ↓
    ┌─────────┴─────────┐
    │                    │
    │ Validate balance   │
    │ Calculate output   │  ← AMM Engine
    │ using x × y = k    │     output = y - (k / (x + input×0.99))
    │                    │
    │ Deduct input       │
    │ Add output         │
    │ Update pool state │
    │ Record transaction │
    └─────────┴─────────┘
              ↓
    Return: { outputAmount, fee, newPrice }
```

### 3. Pool State
```
Pool: USD ↔ AAPL
Initial: 150,000 USD + 857.14 AAPL = Price $175

After swap (100 USD → AAPL):
  - USD Reserve: 150,099 (input - fee)
  - Stock Reserve: ~809.44
  - New Price: ~$185.52
```

---

## Project Structure

```
stockledger/
├── blockchain/              # Phase 1: Custom PoA Blockchain
│   ├── genesis.json        # PoA genesis config
│   ├── docker-compose.yml  # 4 validators + bootnode
│   ├── Dockerfile
│   └── scripts/
│
├── contracts/              # Phase 2: ERC-20 Smart Contracts
│   ├── Token.sol           # Base ERC-20
│   ├── hardhat.config.js
│   └── scripts/deploy.js
│
├── backend/                # Phase 3: Go Backend API
│   ├── cmd/server/main.go  # Entry point
│   ├── config.json          # Configuration
│   ├── go.mod
│   └── internal/
│       ├── api/             # Handlers & routes
│       ├── ammpool/        # Swap engine
│       ├── models/          # DB models
│       ├── repository/      # Database ops
│       └── services/        # Business logic
│
├── frontend/               # Phase 4: Next.js UI
│   ├── app/                # Pages
│   ├── components/         # UI components
│   └── lib/api.ts          # API client
│
└── TECHNICAL_DOCS.md       # Detailed documentation
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Go | 1.21+ | Backend |
| Node.js | 18+ | Frontend |
| MySQL | 8.0+ | Database |
| Docker | 20.10+ | Blockchain (optional) |
| geth | 1.17+ | Blockchain (optional) |

---

## Setup & Running

### Option 1: Full Stack (All Components)

#### 1. Database (MySQL)
```bash
# Install MySQL
mysql -u root -p

# Create database
CREATE DATABASE stockledger;

# Update backend/config.json with your credentials
```

#### 2. Backend
```bash
cd backend
go mod tidy
go run cmd/server/main.go
# Server runs on http://localhost:8080
```

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

#### 4. Blockchain (Optional - for on-chain features)
```bash
cd blockchain
chmod +x scripts/*.sh
./scripts/generate-keys.sh
./scripts/init.sh
docker-compose up -d
```

---

### Option 2: Backend Only (API Testing)

```bash
# Update config.json with MySQL credentials
# {
#   "server": { "port": "8080" },
#   "database": {
#     "host": "localhost",
#     "port": 3306,
#     "user": "root",
#     "password": "your_password",
#     "dbname": "stockledger"
#   }
# }

cd backend
go mod tidy
go run cmd/server/main.go
```

Test with curl:
```bash
# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "0x1234567890123456789012345678901234567890"}'

# Get balance
curl http://localhost:8080/api/wallet/0x1234567890123456789012345678901234567890

# Initialize pools
curl -X POST http://localhost:8080/api/admin/initialize-pools

# Get pools
curl http://localhost:8080/api/pools
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with wallet, get 10k USD |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/:address` | Get user balance |
| GET | `/api/wallet/:address/transactions` | Get transaction history |

### Trading
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/swap` | Execute swap (USD ↔ Stock) |

### Pools
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pools` | List all pools |
| GET | `/api/pools/:symbol` | Get pool details |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login (password: admin123) |
| POST | `/api/admin/price` | Update stock price |
| GET | `/api/admin/prices` | Get all prices |
| GET | `/api/admin/stats` | System statistics |
| POST | `/api/admin/initialize-pools` | Initialize pools |

---

## Configuration

### Backend (config.json)
```json
{
  "server": {
    "port": "8080",
    "host": "0.0.0.0"
  },
  "database": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",
    "dbname": "stockledger"
  },
  "blockchain": {
    "rpc_url": "http://localhost:8545",
    "chain_id": 1337
  }
}
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Initial Configuration

| Parameter | Value |
|-----------|-------|
| New User USD | 10,000 |
| Pool Liquidity (per stock) | 150,000 USD |
| Swap Fee | 1% |
| AAPL Initial Price | $175 |
| TSLA Initial Price | $250 |
| MSFT Initial Price | $350 |
| Admin Password | admin123 |

---

## Development Notes

- **Backend** uses GORM for database ORM with auto-migrations
- **Frontend** uses Next.js 14 App Router with client components
- **AMM** is implemented off-chain for speed (not on smart contracts yet)
- **Price alerts** trigger when price changes exceed 10%

---

## License

MIT

---

## Support

For issues or questions, refer to:
- [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md) - Detailed technical documentation
- [opencode.md](./opencode.md) - Project rules and guidelines
