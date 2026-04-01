package ammpool

import (
	"errors"
	"math"
)

const (
	FeeTier = 0.01 // 1% fee
)

type PoolState struct {
	USDReserve   float64
	StockReserve float64
	FeeTier      float64
}

func NewPoolState(usdReserve, stockReserve float64) *PoolState {
	return &PoolState{
		USDReserve:   usdReserve,
		StockReserve: stockReserve,
		FeeTier:      FeeTier,
	}
}

func (p *PoolState) GetPrice() float64 {
	if p.StockReserve == 0 {
		return 0
	}
	return p.USDReserve / p.StockReserve
}

func (p *PoolState) CalculateSwapInput(amountIn float64, isUSDToStock bool) (float64, float64) {
	if amountIn <= 0 {
		return 0, 0
	}

	var outputAmount float64
	var fee float64

	if isUSDToStock {
		fee = amountIn * p.FeeTier
		amountInWithFee := amountIn - fee
		
		outputAmount = p.StockReserve - (p.USDReserve * p.StockReserve / (p.USDReserve + amountInWithFee))
		
		if outputAmount > p.StockReserve {
			outputAmount = p.StockReserve
		}
	} else {
		fee = amountIn * p.FeeTier
		amountInWithFee := amountIn - fee
		
		outputAmount = p.USDReserve - (p.StockReserve * p.USDReserve / (p.StockReserve + amountInWithFee))
		
		if outputAmount > p.USDReserve {
			outputAmount = p.USDReserve
		}
	}

	return outputAmount, fee
}

func (p *PoolState) CalculateSwapOutput(desiredOutput float64, isUSDToStock bool) (float64, float64) {
	if desiredOutput <= 0 {
		return 0, 0
	}

	if isUSDToStock {
		if desiredOutput > p.StockReserve {
			return 0, 0
		}
		
		newStockReserve := p.StockReserve - desiredOutput
		requiredUSD := (p.USDReserve * p.StockReserve / newStockReserve) - p.USDReserve
		
		fee := requiredUSD * (p.FeeTier / (1 - p.FeeTier))
		inputWithFee := requiredUSD + fee
		
		return inputWithFee, fee
	} else {
		if desiredOutput > p.USDReserve {
			return 0, 0
		}
		
		newUSDReserve := p.USDReserve - desiredOutput
		requiredStock := (p.StockReserve * p.USDReserve / newUSDReserve) - p.StockReserve
		
		fee := requiredStock * (p.FeeTier / (1 - p.FeeTier))
		inputWithFee := requiredStock + fee
		
		return inputWithFee, fee
	}
}

func (p *PoolState) AddLiquidity(usdAmount, stockAmount float64) (float64, float64) {
	if p.USDReserve == 0 || p.StockReserve == 0 {
		p.USDReserve += usdAmount
		p.StockReserve += stockAmount
		return usdAmount, stockAmount
	}

	usdRatio := usdAmount / p.USDReserve
	stockRatio := stockAmount / p.StockReserve

	if usdRatio < stockRatio {
		stockAmount = usdAmount * p.StockReserve / p.USDReserve
	} else {
		usdAmount = stockAmount * p.USDReserve / p.StockReserve
	}

	p.USDReserve += usdAmount
	p.StockReserve += stockAmount

	return usdAmount, stockAmount
}

func (p *PoolState) RemoveLiquidity(liquidityPercent float64) (float64, float64) {
	if liquidityPercent <= 0 || liquidityPercent > 100 {
		return 0, 0
	}

	factor := liquidityPercent / 100

	usdAmount := p.USDReserve * factor
	stockAmount := p.StockReserve * factor

	p.USDReserve -= usdAmount
	p.StockReserve -= stockAmount

	return usdAmount, stockAmount
}

func (p *PoolState) UpdatePrice(newPrice float64) error {
	if newPrice <= 0 {
		return errors.New("price must be positive")
	}
	
	p.StockReserve = math.Sqrt(p.USDReserve / newPrice) * p.StockReserve
	p.USDReserve = p.StockReserve * newPrice
	
	return nil
}