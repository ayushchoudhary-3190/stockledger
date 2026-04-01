package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"stockledger/internal/repository"
	"stockledger/internal/services"
)

type Handler struct {
	db            *gorm.DB
	walletService *services.WalletService
	swapService   *services.SwapService
	adminService  *services.AdminService
}

func NewHandler(db *gorm.DB) *Handler {
	userRepo := repository.NewUserRepository(db)
	txRepo := repository.NewTransactionRepository(db)
	poolRepo := repository.NewPoolRepository(db)
	priceRepo := repository.NewAdminPriceRepository(db)

	walletService := services.NewWalletService(userRepo, txRepo)
	swapService := services.NewSwapService(userRepo, poolRepo, txRepo)
	adminService := services.NewAdminService(priceRepo, poolRepo, userRepo, txRepo)

	return &Handler{
		db:            db,
		walletService: walletService,
		swapService:   swapService,
		adminService:  adminService,
	}
}

type RegisterRequest struct {
	WalletAddress string `json:"wallet_address" binding:"required"`
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.walletService.RegisterUser(req.WalletAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (h *Handler) GetBalance(c *gin.Context) {
	walletAddress := c.Param("address")
	if walletAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address required"})
		return
	}

	user, err := h.walletService.GetBalance(walletAddress)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type SwapRequest struct {
	WalletAddress string  `json:"wallet_address" binding:"required"`
	FromToken     string  `json:"from_token" binding:"required"`
	ToToken       string  `json:"to_token" binding:"required"`
	Amount        float64 `json:"amount" binding:"required,gt=0"`
}

func (h *Handler) Swap(c *gin.Context) {
	var req SwapRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := &services.SwapInput{
		WalletAddress: req.WalletAddress,
		FromToken:     req.FromToken,
		ToToken:       req.ToToken,
		Amount:        req.Amount,
	}

	result, err := h.swapService.ExecuteSwap(input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) GetPools(c *gin.Context) {
	pools, err := h.swapService.GetAllPools()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pools)
}

func (h *Handler) GetPool(c *gin.Context) {
	symbol := c.Param("symbol")
	if symbol == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "symbol required"})
		return
	}

	pool, err := h.swapService.GetPool(symbol)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "pool not found"})
		return
	}

	c.JSON(http.StatusOK, pool)
}

func (h *Handler) GetTransactions(c *gin.Context) {
	walletAddress := c.Param("address")
	if walletAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address required"})
		return
	}

	txs, err := h.walletService.GetTransactions(walletAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, txs)
}

func (h *Handler) InitializePools(c *gin.Context) {
	if err := h.adminService.InitializePools(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "pools initialized"})
}

// Admin Handlers

type AdminLoginRequest struct {
	Password string `json:"password" binding:"required"`
}

func (h *Handler) AdminLogin(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Simple password check - in production use proper auth
	if req.Password != "admin123" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": "admin-token", "message": "logged in"})
}

type UpdatePriceRequest struct {
	Symbol string  `json:"symbol" binding:"required"`
	Price  float64 `json:"price" binding:"required,gt=0"`
}

func (h *Handler) UpdatePrice(c *gin.Context) {
	var req UpdatePriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := &services.UpdatePriceInput{
		Symbol: req.Symbol,
		Price:  req.Price,
	}

	result, err := h.adminService.UpdatePrice(input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) GetPrices(c *gin.Context) {
	prices, err := h.adminService.GetPrices()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, prices)
}

func (h *Handler) GetAdminStats(c *gin.Context) {
	stats, err := h.adminService.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
