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

	router.POST("/api/auth/register", handler.Register)
	router.GET("/api/wallet/:address", handler.GetBalance)
	router.GET("/api/wallet/:address/transactions", handler.GetTransactions)

	router.POST("/api/swap", handler.Swap)

	router.GET("/api/pools", handler.GetPools)
	router.GET("/api/pools/:symbol", handler.GetPool)

	router.POST("/api/admin/initialize-pools", handler.InitializePools)

	return router
}