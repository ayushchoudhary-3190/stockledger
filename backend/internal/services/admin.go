package services

import (
	"errors"

	"stockledger/internal/ammpool"
	"stockledger/internal/models"
	"stockledger/internal/repository"
)

type AdminService struct {
	priceRepo *repository.AdminPriceRepository
	poolRepo  *repository.PoolRepository
	userRepo  *repository.UserRepository
	txRepo    *repository.TransactionRepository
}

func NewAdminService(
	priceRepo *repository.AdminPriceRepository,
	poolRepo *repository.PoolRepository,
	userRepo *repository.UserRepository,
	txRepo *repository.TransactionRepository,
) *AdminService {
	return &AdminService{
		priceRepo: priceRepo,
		poolRepo:  poolRepo,
		userRepo:  userRepo,
		txRepo:    txRepo,
	}
}

type UpdatePriceInput struct {
	Symbol string  `json:"symbol" binding:"required"`
	Price  float64 `json:"price" binding:"required,gt=0"`
}

type AdminStats struct {
	TotalUsers        int        `json:"total_users"`
	TotalTransactions int        `json:"total_transactions"`
	TotalLiquidity    float64    `json:"total_liquidity"`
	Pools             []PoolInfo `json:"pools"`
	AlertThreshold    float64    `json:"alert_threshold"`
}

type PoolInfo struct {
	Symbol       string  `json:"symbol"`
	USDReserve   float64 `json:"usd_reserve"`
	StockReserve float64 `json:"stock_reserve"`
	Price        float64 `json:"price"`
	FeeTier      float64 `json:"fee_tier"`
}

func (s *AdminService) UpdatePrice(input *UpdatePriceInput) (*models.AdminPrice, error) {
	validSymbols := map[string]bool{"AAPL": true, "TSLA": true, "MSFT": true}
	if !validSymbols[input.Symbol] {
		return nil, errors.New("invalid stock symbol")
	}

	if err := s.priceRepo.Upsert(input.Symbol, input.Price); err != nil {
		return nil, err
	}

	pool, err := s.poolRepo.FindBySymbol(input.Symbol)
	if err == nil && pool != nil {
		poolState := ammpool.NewPoolState(pool.USDReserve, pool.StockReserve)
		poolState.FeeTier = pool.FeeTier

		oldPrice := pool.Price
		poolState.UpdatePrice(input.Price)
		pool.Price = input.Price
		pool.StockReserve = poolState.StockReserve
		pool.USDReserve = poolState.USDReserve

		s.poolRepo.Update(pool)

		threshold := 0.10 // 10% change
		changePercent := (input.Price - oldPrice) / oldPrice
		if changePercent > threshold {
			// Alert would be triggered here
			go s.triggerPriceAlert(input.Symbol, oldPrice, input.Price)
		}
	}

	return s.priceRepo.FindBySymbol(input.Symbol)
}

func (s *AdminService) triggerPriceAlert(symbol string, oldPrice, newPrice float64) {
	// In production, this would send notification
	// For now, just log
	println("ALERT: Price change detected!")
	println("Symbol:", symbol)
	println("Old Price:", oldPrice)
	println("New Price:", newPrice)
	println("Change %:", ((newPrice-oldPrice)/oldPrice)*100)
}

func (s *AdminService) GetPrices() ([]models.AdminPrice, error) {
	return s.priceRepo.List()
}

func (s *AdminService) GetPrice(symbol string) (*models.AdminPrice, error) {
	return s.priceRepo.FindBySymbol(symbol)
}

func (s *AdminService) GetStats() (*AdminStats, error) {
	users, err := s.userRepo.List()
	if err != nil {
		return nil, err
	}

	txs, err := s.txRepo.List()
	if err != nil {
		return nil, err
	}

	pools, err := s.poolRepo.List()
	if err != nil {
		return nil, err
	}

	var totalLiquidity float64
	poolInfos := make([]PoolInfo, 0, len(pools))
	for _, pool := range pools {
		totalLiquidity += pool.USDReserve
		poolInfos = append(poolInfos, PoolInfo{
			Symbol:       pool.Symbol,
			USDReserve:   pool.USDReserve,
			StockReserve: pool.StockReserve,
			Price:        pool.Price,
			FeeTier:      pool.FeeTier,
		})
	}

	return &AdminStats{
		TotalUsers:        len(users),
		TotalTransactions: len(txs),
		TotalLiquidity:    totalLiquidity,
		Pools:             poolInfos,
		AlertThreshold:    0.10,
	}, nil
}

func (s *AdminService) InitializePools() error {
	pools := []models.Pool{
		{Symbol: "AAPL", USDReserve: 150000, StockReserve: 857.14, Price: 175, FeeTier: 0.01},
		{Symbol: "TSLA", USDReserve: 150000, StockReserve: 600, Price: 250, FeeTier: 0.01},
		{Symbol: "MSFT", USDReserve: 150000, StockReserve: 428.57, Price: 350, FeeTier: 0.01},
	}

	for _, pool := range pools {
		existing, _ := s.poolRepo.FindBySymbol(pool.Symbol)
		if existing != nil {
			continue
		}
		if err := s.poolRepo.Create(&pool); err != nil {
			return err
		}

		s.priceRepo.Upsert(pool.Symbol, pool.Price)
	}

	return nil
}
