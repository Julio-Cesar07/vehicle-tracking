package hub

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/events"
	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/handler"
	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/route"
	"github.com/segmentio/kafka-go"
	"go.mongodb.org/mongo-driver/mongo"
)

type EventHub struct {
	rr              *route.RouteRepository
	mong            *mongo.Client
	chDriverMoved   chan *events.DriverMovedEvent
	freightWriter   *kafka.Writer
	simulatorWriter *kafka.Writer
}

func NewEventHub(
	rr *route.RouteRepository,
	mong *mongo.Client,
	chDriverMoved chan *events.DriverMovedEvent,
	freightWriter *kafka.Writer,
	simulatorWriter *kafka.Writer,
) *EventHub {
	return &EventHub{
		rr:              rr,
		mong:            mong,
		chDriverMoved:   chDriverMoved,
		freightWriter:   freightWriter,
		simulatorWriter: simulatorWriter,
	}
}

func (eh *EventHub) HandleEvent(msg []byte) error {
	var baseEvent struct {
		EventName string `json:"event"`
	}

	if err := json.Unmarshal(msg, &baseEvent); err != nil {
		return fmt.Errorf("error unmarshlling event: %w", err)
	}

	switch baseEvent.EventName {
	case "RouteCreated":
		var event events.RouteCreatedEvent

		if err := json.Unmarshal(msg, &event); err != nil {
			return fmt.Errorf("error unmarshlling event: %w", err)
		}

		return eh.handleRouteCreated(event)

	case "DeliveryStarted":
		var event events.DeliveryStartedEvent

		if err := json.Unmarshal(msg, &event); err != nil {
			return fmt.Errorf("error unmarshlling event: %w", err)
		}

		return eh.handleDeliveryStarted(event)
	default:
		return errors.New("unknown event")
	}
}

func (eh *EventHub) handleRouteCreated(event events.RouteCreatedEvent) error {
	freightCalculatedEvent, err := handler.RouteCreatedHandler(&event, eh.rr)

	if err != nil {
		return err
	}

	value, err := json.Marshal(freightCalculatedEvent)

	if err != nil {
		return fmt.Errorf("error unmarshlling event: %w", err)
	}

	err = eh.freightWriter.WriteMessages(context.Background(), kafka.Message{
		Key:   []byte(freightCalculatedEvent.RouteID),
		Value: value,
	})

	if err != nil {
		return fmt.Errorf("error writing message: %w", err)
	}

	return nil
}

func (eh *EventHub) handleDeliveryStarted(event events.DeliveryStartedEvent) error {
	err := handler.DeliveryStartedHandler(&event, eh.rr, eh.chDriverMoved)

	if err != nil {
		return err
	}

	go eh.sendDirections()

	return nil
}

func (eh *EventHub) sendDirections() {
	for {
		select {
		case movedEvent := <-eh.chDriverMoved:
			value, err := json.Marshal(movedEvent)

			if err != nil {
				return
			}

			err = eh.simulatorWriter.WriteMessages(context.Background(), kafka.Message{
				Key:   []byte(movedEvent.RouteID),
				Value: value,
			})

			if err != nil {
				return
			}

		case <-time.After(500 * time.Millisecond):
			return
		}
	}
}
