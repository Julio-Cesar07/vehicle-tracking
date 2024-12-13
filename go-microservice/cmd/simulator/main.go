package main

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/events"
	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/freight"
	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/hub"
	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/route"
	"github.com/segmentio/kafka-go"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	mongoStr := "mongodb://admin:admin@localhost:27017/routes?authSource=admin"
	mongoConn, err := mongo.Connect(context.Background(), options.Client().ApplyURI(mongoStr))
	if err != nil {
		panic(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := mongoConn.Ping(ctx, nil); err != nil {
		panic(err)
	}

	freightService := freight.NewFreightService()
	routeRepository := route.NewRouteRepository(mongoConn, freightService)

	chDriverMoved := make(chan *events.DriverMovedEvent)
	kafkaBroker := "localhost:9092"

	freightWriter := &kafka.Writer{
		Addr:     kafka.TCP(kafkaBroker),
		Topic:    "freight",
		Balancer: &kafka.LeastBytes{},
	}

	simulatorWriter := &kafka.Writer{
		Addr:     kafka.TCP(kafkaBroker),
		Topic:    "simulator",
		Balancer: &kafka.LeastBytes{},
	}

	routeReader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{kafkaBroker},
		Topic:   "route",
		GroupID: "simulator",
	})

	hub := hub.NewEventHub(routeRepository, mongoConn, chDriverMoved, freightWriter, simulatorWriter)

	fmt.Println("Starting simulator")
	for {
		m, err := routeReader.ReadMessage(context.Background())
		if err != nil {
			slog.Error("failed to read message kafka", "error", err)
			continue
		}

		go func(msg []byte) {
			err = hub.HandleEvent(msg)
			if err != nil {
				slog.Error("failed to hadling event", "error", err)
			}
		}(m.Value)
	}
}
