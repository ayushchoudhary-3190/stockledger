package repository

import (
	"stockledger/internal/models"

	"gorm.io/gorm"
)

type PoolRepository struct {
	db *gorm.DB
}

func NewPoolRepository(db *gorm.DB) *PoolRepository {
	return &PoolRepository{db: db}
}

func (r *PoolRepository) Create(pool *models.Pool) error {
	return r.db.Create(pool).Error
}

func (r *PoolRepository) FindBySymbol(symbol string) (*models.Pool, error) {
	var pool models.Pool
	err := r.db.Where("symbol = ?", symbol).First(&pool).Error
	if err != nil {
		return nil, err
	}
	return &pool, nil
}

func (r *PoolRepository) FindByID(id uint) (*models.Pool, error) {
	var pool models.Pool
	err := r.db.First(&pool, id).Error
	if err != nil {
		return nil, err
	}
	return &pool, nil
}

func (r *PoolRepository) Update(pool *models.Pool) error {
	return r.db.Save(pool).Error
}

func (r *PoolRepository) List() ([]models.Pool, error) {
	var pools []models.Pool
	err := r.db.Find(&pools).Error
	return pools, err
}

func (r *PoolRepository) Delete(id uint) error {
	return r.db.Delete(&models.Pool{}, id).Error
}