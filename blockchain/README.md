# StockLedger Blockchain Setup

Custom PoA (Proof of Authority) blockchain using Go-Ethereum.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Go-Ethereum (geth) installed locally (for key generation)

## Quick Start

### 1. Generate Validator Keys

```bash
cd blockchain
chmod +x scripts/*.sh
./scripts/generate-keys.sh
```

### 2. Initialize Blockchain

```bash
./scripts/init.sh
```

### 3. Start the Network

```bash
docker-compose up -d
```

### 4. Verify Block Production

```bash
docker logs -f stockledger-validator1
```

## Network Configuration

| Service | RPC Port | P2P Port | WS Port |
|---------|----------|----------|---------|
| validator1 | 8545 | 30303 | 8546 |
| validator2 | 8547 | 30304 | 8548 |
| validator3 | 8549 | 30305 | 8550 |
| validator4 | 8551 | 30306 | 8552 |
| bootnode | - | 30301 | - |

## Connect to Network

```bash
# Attach to validator1
docker exec -it stockledger-validator1 geth attach http://localhost:8545

# Check block number
eth.blockNumber

# Check peer count
net.peerCount
```

## Default RPC Endpoints

- Validator 1: http://localhost:8545
- Validator 2: http://localhost:8547
- Validator 3: http://localhost:8549
- Validator 4: http://localhost:8551

## Stop Network

```bash
docker-compose down
```

## Reset Network

```bash
docker-compose down -v
rm -rf validators/*/geth
rm -rf data
./scripts/generate-keys.sh
./scripts/init.sh
docker-compose up -d
```

## Chain Info

- Chain ID: 1337
- Consensus: Clique (PoA)
- Block Time: 1 second
- Gas Limit: 8,000,000
