package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
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
	mongoURI := getEnv("MONGO_URI", "mongodb://admin:admin@localhost:27017/routes?authSource=admin")
	kafkaBroker := getEnv("KAFKA_BROKER", "kafka:9092")
	kafkaRouteTopic := getEnv("KAFKA_ROUTE_TOPIC", "route")
	kafkaFreightTopic := getEnv("KAFKA_FREIGHT_TOPIC", "freight")
	kafkaSimulationTopic := getEnv("KAFKA_SIMULATION_TOPIC", "simulation")
	kafkaGroupID := getEnv("KAFKA_GROUP_ID", "route-group")

	mongoConn, err := mongo.Connect(context.Background(), options.Client().ApplyURI(mongoURI))
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

	freightWriter := &kafka.Writer{
		Addr:     kafka.TCP(kafkaBroker),
		Topic:    kafkaFreightTopic,
		Balancer: &kafka.LeastBytes{},
	}

	simulatorWriter := &kafka.Writer{
		Addr:     kafka.TCP(kafkaBroker),
		Topic:    kafkaSimulationTopic,
		Balancer: &kafka.LeastBytes{},
	}

	routeReader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{kafkaBroker},
		Topic:   kafkaRouteTopic,
		GroupID: kafkaGroupID,
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

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
