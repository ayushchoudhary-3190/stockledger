# StockLedger Smart Contracts

ERC-20 tokens for StockLedger DEX deployed on custom PoA blockchain.

## Tokens

| Token | Symbol | Description |
|-------|--------|-------------|
| USD Stablecoin | USD | Stablecoin for trading (1:1 USD) |
| Apple Stock | AAPL | Synthetic Apple stock token |
| Tesla Stock | TSLA | Synthetic Tesla stock token |
| Microsoft Stock | MSFT | Synthetic Microsoft stock token |

## Initial Configuration

- **Decimals**: 18
- **Fee Tier**: 1%
- **Pool Liquidity**: 150,000 USD per stock pool

## Setup

```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your configuration
```

## Compile Contracts

```bash
npm run compile
```

## Deploy to Local Blockchain

```bash
npm run deploy:local
```

## Deployment Addresses

After deployment, addresses are saved in:
```
deployments/<network>-deployment.json
```

## Token Supply

| Token | Initial Pool Liquidity |
|-------|----------------------|
| USD | 450,000 (3 pools × 150k) |
| AAPL | ~857.14 tokens (150k ÷ $175) |
| TSLA | ~600 tokens (150k ÷ $250) |
| MSFT | ~428.57 tokens (150k ÷ $350) |
