package repository

import (
	"stockledger/internal/models"

	"gorm.io/gorm"
)

type AdminPriceRepository struct {
	db *gorm.DB
}

func NewAdminPriceRepository(db *gorm.DB) *AdminPriceRepository {
	return &AdminPriceRepository{db: db}
}

func (r *AdminPriceRepository) Create(price *models.AdminPrice) error {
	return r.db.Create(price).Error
}

func (r *AdminPriceRepository) FindBySymbol(symbol string) (*models.AdminPrice, error) {
	var price models.AdminPrice
	err := r.db.Where("symbol = ?", symbol).First(&price).Error
	if err != nil {
		return nil, err
	}
	return &price, nil
}

func (r *AdminPriceRepository) Update(price *models.AdminPrice) error {
	return r.db.Save(price).Error
}

func (r *AdminPriceRepository) List() ([]models.AdminPrice, error) {
	var prices []models.AdminPrice
	err := r.db.Find(&prices).Error
	return prices, err
}

func (r *AdminPriceRepository) Upsert(symbol string, price float64) error {
	var existing models.AdminPrice
	err := r.db.Where("symbol = ?", symbol).First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		return r.db.Create(&models.AdminPrice{
			Symbol: symbol,
			Price:  price,
		}).Error
	}

	if err != nil {
		return err
	}

	existing.Price = price
	return r.db.Save(&existing).Error
}
