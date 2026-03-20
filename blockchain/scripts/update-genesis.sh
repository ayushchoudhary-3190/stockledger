#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(dirname "$SCRIPT_DIR")"
GENESIS_FILE="$BLOCKCHAIN_DIR/genesis.json"

echo "=== Updating Genesis Block with Validator Addresses ==="
echo ""

VALIDATORS=()

for i in 1 2 3 4; do
    VAL_DIR="$BLOCKCHAIN_DIR/validators/validator$i"
    KEYSTORE_FILE=$(find "$VAL_DIR/keystore" -name "*.json" 2>/dev/null | head -1)
    
    if [ -z "$KEYSTORE_FILE" ]; then
        echo "Error: No keystore found for validator $i"
        exit 1
    fi
    
    ADDRESS=$(cat "$KEYSTORE_FILE" | grep -o '"address":"[^"]*"' | cut -d'"' -f4)
    FULL_ADDRESS="0x000000000000000000000000$ADDRESS"
    VALIDATORS+=("$FULL_ADDRESS")
    echo "Validator $i: $FULL_ADDRESS"
done

echo ""
echo "Creating extradata with validator signatures..."
EXTRA_DATA="0x"
for addr in "${VALIDATORS[@]}"; do
    EXTRA_DATA="${EXTRA_DATA}${addr:2}"
done
PADDING="0".padstart(130, '0')
SIGNATURES="0".padstart(130, '0')
EXTRA_DATA="${EXTRA_DATA}${PADDING}${SIGNATURES}"

echo "Updated extradata: ${EXTRA_DATA:0:50}..."
