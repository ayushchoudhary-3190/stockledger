package models

import (
	"time"
)

type Pool struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Symbol      string    `gorm:"uniqueIndex;not null" json:"symbol"`
	TokenAddress string   `json:"token_address"`
	USDReserve  float64   `gorm:"default:0" json:"usd_reserve"`
	StockReserve float64  `gorm:"default:0" json:"stock_reserve"`
	Price       float64   `gorm:"default:0" json:"price"`
	FeeTier     float64   `gorm:"default:1" json:"fee_tier"`
	TotalLiquidity float64 `gorm:"default:0" json:"total_liquidity"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Pool) TableName() string {
	return "pools"
}