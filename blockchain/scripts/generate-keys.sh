#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== StockLedger Blockchain Key Generator ==="
echo ""

for i in 1 2 3 4; do
    VAL_DIR="$BLOCKCHAIN_DIR/validators/validator$i"
    mkdir -p "$VAL_DIR/keystore"
    
    echo "Generating keys for validator $i..."
    
    echo "password$i" > "$VAL_DIR/password.txt"
    
    geth --datadir "$VAL_DIR" account new \
        --password "$VAL_DIR/password.txt" \
        2>/dev/null || true
    
    echo "Validator $i keys generated"
    echo ""
done

echo "Generating bootnode key..."
mkdir -p "$BLOCKCHAIN_DIR/data/bootnode"
bootnode -genkey "$BLOCKCHAIN_DIR/data/bootnode/bootnode.key"
echo "Bootnode key generated"
echo ""

echo "=== Key Generation Complete ==="
echo ""
echo "Validator addresses:"
for i in 1 2 3 4; do
    VAL_DIR="$BLOCKCHAIN_DIR/validators/validator$i"
    if [ -d "$VAL_DIR/keystore" ]; then
        ADDRESS=$(cat "$VAL_DIR/keystore/"*.json 2>/dev/null | grep -o '"address":"[^"]*"' | cut -d'"' -f4 | head -1)
        echo "  Validator $i: 0x$ADDRESS"
    fi
done
