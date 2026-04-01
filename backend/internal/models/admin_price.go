package models

import (
	"time"
)

type AdminPrice struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Symbol    string    `gorm:"uniqueIndex;not null" json:"symbol"`
	Price     float64   `gorm:"not null" json:"price"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (AdminPrice) TableName() string {
	return "admin_prices"
}