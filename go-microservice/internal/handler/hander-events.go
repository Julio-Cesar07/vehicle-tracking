package handler

import (
	"time"

	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/events"
	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/route"
)

func RouteCreatedHandler(event *events.RouteCreatedEvent, rr *route.RouteRepository) (*events.FreightCalculatedEvent, error) {
	route := route.NewRoute(event.RouteID, event.Distance, event.Directions)
	routeCreated, err := rr.CreateRoute(route)

	if err != nil {
		return nil, err
	}

	freightCalculated := events.NewFreightCalculatedEvent(routeCreated.ID, route.FreightPrice)
	return freightCalculated, nil
}

func DeliveryStartedHandler(event *events.DeliveryStartedEvent, rr *route.RouteRepository, ch chan *events.DriverMovedEvent) error {
	route, err := rr.GetRoute(event.RouteID)

	if err != nil {
		return err
	}

	go func() {
		for _, direction := range route.Directions {
			dme := events.NewDriverMovedEvent(route.ID, direction.Lat, direction.Lng)
			ch <- dme
			time.Sleep(time.Second)
		}
	}()

	return nil
}
