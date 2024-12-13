package route

import (
	"context"

	"github.com/Julio-Cesar07/vehicle-tracking/simulator/internal/freight"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type RouteRepository struct {
	mong           *mongo.Client
	freightService *freight.FreightService
}

func NewRouteRepository(mong *mongo.Client, fs *freight.FreightService) *RouteRepository {
	return &RouteRepository{
		mong:           mong,
		freightService: fs,
	}
}

func (rr *RouteRepository) CreateRoute(route *Route) (*Route, error) {
	route.FreightPrice = rr.freightService.Calculate(route.Distance)

	update := bson.M{
		"$set": bson.M{
			"distance":      route.Distance,
			"directions":    route.Directions,
			"freight_price": route.FreightPrice,
		},
	}

	filter := bson.M{"_id": route.ID}
	opts := options.Update().SetUpsert(true)

	_, err := rr.mong.Database("routes").Collection("routes").UpdateOne(context.TODO(), filter, update, opts)
	return route, err
}

func (rr *RouteRepository) GetRoute(id string) (Route, error) {
	var route Route

	filter := bson.M{"_id": id}

	err := rr.mong.Database("routes").Collection("routes").FindOne(context.TODO(), filter).Decode(&route)

	if err != nil {
		return route, err
	}

	return route, nil
}
