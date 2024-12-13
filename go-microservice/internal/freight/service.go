package freight

import "math"

type FreightService struct{}

func NewFreightService() *FreightService {
	return &FreightService{}
}
func (fs *FreightService) Calculate(distance int) float64 {
	return math.Floor((float64(distance)*0.15+0.3)*100) / 100
}
