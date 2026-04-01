package models

import (
	"time"
)

type TransactionType string

const (
	TransactionTypeDeposit     TransactionType = "DEPOSIT"
	TransactionTypeWithdraw    TransactionType = "WITHDRAW"
	TransactionTypeSwapIn      TransactionType = "SWAP_IN"
	TransactionTypeSwapOut     TransactionType = "SWAP_OUT"
	TransactionTypeLiquidityAdd TransactionType = "LIQUIDITY_ADD"
	TransactionTypeLiquidityRemove TransactionType = "LIQUIDITY_REMOVE"
	TransactionTypeFeeCollect  TransactionType = "FEE_COLLECT"
)

type Transaction struct {
	ID        uint            `gorm:"primaryKey" json:"id"`
	UserID    uint            `gorm:"index;not null" json:"user_id"`
	Type     TransactionType `gorm:"not null" json:"type"`
	Token    string          `gorm:"not null" json:"token"`
	Amount   float64         `gorm:"not null" json:"amount"`
	Price    float64         `json:"price"`
	Fee      float64         `json:"fee"`
	PoolID   *uint           `json:"pool_id"`
	TxHash   string          `json:"tx_hash"`
	CreatedAt time.Time      `json:"created_at"`
}

func (Transaction) TableName() string {
	return "transactions"
}