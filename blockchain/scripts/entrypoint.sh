#!/bin/bash

set -e

if [ ! -f /data/genesis.json ] && [ -f /app/genesis.json ]; then
    cp /app/genesis.json /data/genesis.json
fi

exec geth "$@"
