package repository

import (
	"stockledger/internal/models"

	"gorm.io/gorm"
)

type TransactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) Create(tx *models.Transaction) error {
	return r.db.Create(tx).Error
}

func (r *TransactionRepository) FindByUserID(userID uint) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&transactions).Error
	return transactions, err
}

func (r *TransactionRepository) FindByHash(txHash string) (*models.Transaction, error) {
	var tx models.Transaction
	err := r.db.Where("tx_hash = ?", txHash).First(&tx).Error
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

func (r *TransactionRepository) List() ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Order("created_at DESC").Find(&transactions).Error
	return transactions, err
}

func (r *TransactionRepository) Delete(id uint) error {
	return r.db.Delete(&models.Transaction{}, id).Error
}