package events

import "github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/route"

type RouteCreatedEvent struct {
	EventName  string             `json:"event"`
	RouteID    string             `json:"id"`
	Distance   int                `json:"distance"`
	Directions []route.Directions `json:"directions"`
}

func NewRouteCreatedEvent(routeId string, distance int, directions []route.Directions) *RouteCreatedEvent {
	return &RouteCreatedEvent{
		EventName:  "RouteCreated",
		RouteID:    routeId,
		Distance:   distance,
		Directions: directions,
	}
}

type FreightCalculatedEvent struct {
	EventName string  `json:"event"`
	RouteID   string  `json:"route_id"`
	Amount    float64 `json:"amount"`
}

func NewFreightCalculatedEvent(routeId string, amount float64) *FreightCalculatedEvent {
	return &FreightCalculatedEvent{
		EventName: "FreightCalculated",
		RouteID:   routeId,
		Amount:    amount,
	}
}

type DeliveryStartedEvent struct {
	EventName string `json:"event"`
	RouteID   string `json:"route_id"`
}

func NewDeliveryStartedEvent(routeId string) *DeliveryStartedEvent {
	return &DeliveryStartedEvent{
		EventName: "DeliveryStarted",
		RouteID:   routeId,
	}
}

type DriverMovedEvent struct {
	EventName string  `json:"event"`
	RouteID   string  `json:"route_id"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
}

func NewDriverMovedEvent(routeId string, lat, lng float64) *DriverMovedEvent {
	return &DriverMovedEvent{
		EventName: "DriverMoved",
		RouteID:   routeId,
		Lat:       lat,
		Lng:       lng,
	}
}
