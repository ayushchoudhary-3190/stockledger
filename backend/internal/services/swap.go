package services

import (
	"errors"
	"fmt"

	"stockledger/internal/ammpool"
	"stockledger/internal/models"
	"stockledger/internal/repository"
)

type SwapService struct {
	userRepo        *repository.UserRepository
	poolRepo        *repository.PoolRepository
	transactionRepo *repository.TransactionRepository
}

func NewSwapService(userRepo *repository.UserRepository, poolRepo *repository.PoolRepository, txRepo *repository.TransactionRepository) *SwapService {
	return &SwapService{
		userRepo:        userRepo,
		poolRepo:        poolRepo,
		transactionRepo: txRepo,
	}
}

type SwapInput struct {
	WalletAddress string
	FromToken     string
	ToToken       string
	Amount        float64
}

type SwapOutput struct {
	OutputAmount float64
	Fee           float64
	NewPrice      float64
}

func (s *SwapService) ExecuteSwap(input *SwapInput) (*SwapOutput, error) {
	if input.Amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	user, err := s.userRepo.FindByWalletAddress(input.WalletAddress)
	if err != nil {
		return nil, err
	}

	poolSymbol := input.ToToken
	pool, err := s.poolRepo.FindBySymbol(poolSymbol)
	if err != nil {
		return nil, errors.New("pool not found")
	}

	poolState := ammpool.NewPoolState(pool.USDReserve, pool.StockReserve)
	poolState.FeeTier = pool.FeeTier

	var outputAmount float64
	var fee float64

	isUSDToStock := input.FromToken == "USD" && (input.ToToken == "AAPL" || input.ToToken == "TSLA" || input.ToToken == "MSFT")
	isStockToUSD := (input.FromToken == "AAPL" || input.FromToken == "TSLA" || input.FromToken == "MSFT") && input.ToToken == "USD"

	if isUSDToStock {
		if user.USDBalance < input.Amount {
			return nil, errors.New("insufficient USD balance")
		}

		outputAmount, fee = poolState.CalculateSwapInput(input.Amount, true)

		user.USDBalance -= input.Amount
		switch input.ToToken {
		case "AAPL":
			user.AAPLBalance += outputAmount
		case "TSLA":
			user.TSLABalance += outputAmount
		case "MSFT":
			user.MSFTBalance += outputAmount
		}

		pool.USDReserve += input.Amount - fee
		pool.StockReserve -= outputAmount
		pool.Price = poolState.GetPrice()

		tx := &models.Transaction{
			UserID: user.ID,
			Type:   models.TransactionTypeSwapIn,
			Token:  input.ToToken,
			Amount: outputAmount,
			Price:  pool.Price,
			Fee:    fee,
			PoolID: &pool.ID,
		}
		s.transactionRepo.Create(tx)

	} else if isStockToUSD {
		var stockBalance float64
		switch input.FromToken {
		case "AAPL":
			stockBalance = user.AAPLBalance
		case "TSLA":
			stockBalance = user.TSLABalance
		case "MSFT":
			stockBalance = user.MSFTBalance
		}

		if stockBalance < input.Amount {
			return nil, errors.New("insufficient stock balance")
		}

		outputAmount, fee = poolState.CalculateSwapInput(input.Amount, false)

		switch input.FromToken {
		case "AAPL":
			user.AAPLBalance -= input.Amount
		case "TSLA":
			user.TSLABalance -= input.Amount
		case "MSFT":
			user.MSFTBalance -= input.Amount
		}
		user.USDBalance += outputAmount

		pool.StockReserve += input.Amount - fee
		pool.USDReserve -= outputAmount
		pool.Price = poolState.GetPrice()

		tx := &models.Transaction{
			UserID: user.ID,
			Type:   models.TransactionTypeSwapOut,
			Token:  input.FromToken,
			Amount: input.Amount,
			Price:  pool.Price,
			Fee:    fee,
			PoolID: &pool.ID,
		}
		s.transactionRepo.Create(tx)

	} else {
		return nil, errors.New("invalid token pair")
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	if err := s.poolRepo.Update(pool); err != nil {
		return nil, err
	}

	return &SwapOutput{
		OutputAmount: outputAmount,
		Fee:           fee,
		NewPrice:      pool.Price,
	}, nil
}

func (s *SwapService) GetPool(symbol string) (*models.Pool, error) {
	pool, err := s.poolRepo.FindBySymbol(symbol)
	if err != nil {
		return nil, fmt.Errorf("pool not found: %w", err)
	}
	return pool, nil
}

func (s *SwapService) GetAllPools() ([]models.Pool, error) {
	return s.poolRepo.List()
}

func (s *SwapService) InitializePools() error {
	pools := []models.Pool{
		{Symbol: "AAPL", USDReserve: 150000, StockReserve: 857.14, Price: 175, FeeTier: 1},
		{Symbol: "TSLA", USDReserve: 150000, StockReserve: 600, Price: 250, FeeTier: 1},
		{Symbol: "MSFT", USDReserve: 150000, StockReserve: 428.57, Price: 350, FeeTier: 1},
	}

	for _, pool := range pools {
		existing, _ := s.poolRepo.FindBySymbol(pool.Symbol)
		if existing != nil {
			continue
		}
		if err := s.poolRepo.Create(&pool); err != nil {
			return err
		}
	}

	return nil
}