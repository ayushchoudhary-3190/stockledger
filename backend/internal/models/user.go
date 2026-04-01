package models

import (
	"time"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	WalletAddress string   `gorm:"uniqueIndex;not null" json:"wallet_address"`
	USD balance    float64  `gorm:"default:0" json:"usd_balance"`
	AAPLBalance   float64  `gorm:"default:0" json:"aapl_balance"`
	TSLABalance   float64  `gorm:"default:0" json:"tsla_balance"`
	MSFTBalance   float64  `gorm:"default:0" json:"msft_balance"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}