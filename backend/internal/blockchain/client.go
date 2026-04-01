package blockchain

import (
	"context"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Client struct {
	client   *ethclient.Client
	chainID  *big.Int
}

func NewClient(rpcURL string, chainID int64) (*Client, error) {
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Ethereum client: %w", err)
	}

	networkID := big.NewInt(chainID)

	return &Client{
		client:  client,
		chainID: networkID,
	}, nil
}

func (c *Client) GetBalance(ctx context.Context, address common.Address) (*big.Int, error) {
	return c.client.BalanceAt(ctx, address, nil)
}

func (c *Client) GetNonce(ctx context.Context, address common.Address) (uint64, error) {
	return c.client.NonceAt(ctx, address, nil)
}

func (c *Client) GetChainID(ctx context.Context) (*big.Int, error) {
	return c.client.NetworkID(ctx)
}

func (c *Client) Close() error {
	return c.client.Close()
}

func (c *Client) GetTokenBalance(ctx context.Context, tokenAddress, walletAddress common.Address) (*big.Int, error) {
	return nil, fmt.Errorf("token balance reading not implemented - using off-chain DB")
}

func (c *Client) IsConnected() bool {
	ctx := context.Background()
	_, err := c.client.BlockNumber(ctx)
	return err == nil
}