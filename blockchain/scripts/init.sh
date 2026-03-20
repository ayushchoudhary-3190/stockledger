#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== StockLedger Blockchain Initialization ==="
echo ""

GENESIS_FILE="$BLOCKCHAIN_DIR/genesis.json"

if [ ! -f "$GENESIS_FILE" ]; then
    echo "Error: genesis.json not found at $GENESIS_FILE"
    exit 1
fi

for i in 1 2 3 4; do
    VAL_DIR="$BLOCKCHAIN_DIR/validators/validator$i"
    
    if [ ! -d "$VAL_DIR/keystore" ]; then
        echo "Error: Validator $i keys not found. Run generate-keys.sh first."
        exit 1
    fi
    
    echo "Initializing validator $i..."
    geth --datadir "$VAL_DIR" init "$GENESIS_FILE"
    echo "Validator $i initialized"
    echo ""
done

echo "Initializing bootnode data directory..."
mkdir -p "$BLOCKCHAIN_DIR/data/bootnode"
echo ""

echo "=== Initialization Complete ==="
echo ""
echo "Next steps:"
echo "  1. Update genesis.json with validator addresses"
echo "  2. Run: docker-compose up -d"
echo "  3. Check logs: docker-compose logs -f"
