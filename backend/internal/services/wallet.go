package services

import (
	"errors"

	"stockledger/internal/models"
	"stockledger/internal/repository"
)

const InitialUSD = 10000.0

type WalletService struct {
	userRepo         *repository.UserRepository
	transactionRepo  *repository.TransactionRepository
}

func NewWalletService(userRepo *repository.UserRepository, txRepo *repository.TransactionRepository) *WalletService {
	return &WalletService{
		userRepo:        userRepo,
		transactionRepo: txRepo,
	}
}

func (s *WalletService) RegisterUser(walletAddress string) (*models.User, error) {
	existingUser, err := s.userRepo.FindByWalletAddress(walletAddress)
	if err == nil && existingUser != nil {
		return existingUser, nil
	}

	user := &models.User{
		WalletAddress: walletAddress,
		USDBalance:    InitialUSD,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	tx := &models.Transaction{
		UserID: user.ID,
		Type:   models.TransactionTypeDeposit,
		Token:  "USD",
		Amount: InitialUSD,
		Price:  1.0,
	}
	s.transactionRepo.Create(tx)

	return user, nil
}

func (s *WalletService) GetBalance(walletAddress string) (*models.User, error) {
	return s.userRepo.FindByWalletAddress(walletAddress)
}

func (s *WalletService) Deposit(walletAddress string, amount float64, token string) (*models.User, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	user, err := s.userRepo.FindByWalletAddress(walletAddress)
	if err != nil {
		return nil, err
	}

	switch token {
	case "USD":
		user.USDBalance += amount
	case "AAPL":
		user.AAPLBalance += amount
	case "TSLA":
		user.TSLABalance += amount
	case "MSFT":
		user.MSFTBalance += amount
	default:
		return nil, errors.New("invalid token")
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	tx := &models.Transaction{
		UserID: user.ID,
		Type:   models.TransactionTypeDeposit,
		Token:  token,
		Amount: amount,
		Price:  1.0,
	}
	s.transactionRepo.Create(tx)

	return user, nil
}

func (s *WalletService) Withdraw(walletAddress string, amount float64, token string) (*models.User, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	user, err := s.userRepo.FindByWalletAddress(walletAddress)
	if err != nil {
		return nil, err
	}

	switch token {
	case "USD":
		if user.USDBalance < amount {
			return nil, errors.New("insufficient balance")
		}
		user.USDBalance -= amount
	case "AAPL":
		if user.AAPLBalance < amount {
			return nil, errors.New("insufficient balance")
		}
		user.AAPLBalance -= amount
	case "TSLA":
		if user.TSLABalance < amount {
			return nil, errors.New("insufficient balance")
		}
		user.TSLABalance -= amount
	case "MSFT":
		if user.MSFTBalance < amount {
			return nil, errors.New("insufficient balance")
		}
		user.MSFTBalance -= amount
	default:
		return nil, errors.New("invalid token")
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	tx := &models.Transaction{
		UserID: user.ID,
		Type:   models.TransactionTypeWithdraw,
		Token:  token,
		Amount: amount,
	}
	s.transactionRepo.Create(tx)

	return user, nil
}

func (s *WalletService) GetTransactions(walletAddress string) ([]models.Transaction, error) {
	user, err := s.userRepo.FindByWalletAddress(walletAddress)
	if err != nil {
		return nil, err
	}
	return s.transactionRepo.FindByUserID(user.ID)
}