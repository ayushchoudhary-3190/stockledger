package api

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB, cfg interface{}) *gin.Engine {
	router := gin.Default()
	handler := NewHandler(db)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth routes
	router.POST("/api/auth/register", handler.Register)

	// Wallet routes
	router.GET("/api/wallet/:address", handler.GetBalance)
	router.GET("/api/wallet/:address/transactions", handler.GetTransactions)

	// Swap routes
	router.POST("/api/swap", handler.Swap)

	// Pool routes
	router.GET("/api/pools", handler.GetPools)
	router.GET("/api/pools/:symbol", handler.GetPool)

	// Admin routes
	router.POST("/api/admin/login", handler.AdminLogin)
	router.POST("/api/admin/price", handler.UpdatePrice)
	router.GET("/api/admin/prices", handler.GetPrices)
	router.GET("/api/admin/stats", handler.GetAdminStats)
	router.POST("/api/admin/initialize-pools", handler.InitializePools)

	return router
}
