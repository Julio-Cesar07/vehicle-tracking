import { Inject, Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DirectionsService } from 'src/maps/directions/directions.service';
import * as KafkaLib from '@confluentinc/kafka-javascript';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly directionsService: DirectionsService,
    @Inject('KAFKA_PRODUCER')
    private readonly kafkaProducer: KafkaLib.KafkaJS.Producer,
  ) {}

  async create(createRouteDto: CreateRouteDto) {
    const { available_travel_modes, geocoded_waypoints, routes, request } =
      await this.directionsService.getDirections(
        createRouteDto.source_id,
        createRouteDto.destination_id,
      );

    const legs = routes[0].legs[0];

    const route = await this.prisma.route.create({
      data: {
        name: createRouteDto.name,
        distance: legs.distance.value,
        duration: legs.duration.value,
        directions: JSON.parse(
          JSON.stringify({
            available_travel_modes,
            geocoded_waypoints,
            routes,
            request,
          }),
        ),
        source: {
          name: legs.start_address,
          location: {
            lat: legs.start_location.lat,
            lng: legs.start_location.lng,
          },
        },
        destination: {
          name: legs.start_address,
          location: {
            lat: legs.end_location.lat,
            lng: legs.end_location.lng,
          },
        },
      },
    });

    await this.kafkaProducer.send({
      topic: 'route',
      messages: [
        {
          value: JSON.stringify({
            event: 'RouteCreated',
            id: route.id,
            distance: legs.distance.value,
            directions: legs.steps.reduce((acc, step) => {
              acc.push({
                lat: step.start_location.lat,
                lng: step.start_location.lng,
              });

              acc.push({
                lat: step.end_location.lat,
                lng: step.end_location.lng,
              });

              return acc;
            }, []),
          }),
        },
      ],
    });

    return route;
  }

  async startRoute(id: string) {
    await this.prisma.route.findUniqueOrThrow({
      where: { id },
    });

    await this.kafkaProducer.send({
      topic: 'route',
      messages: [
        {
          value: JSON.stringify({
            event: 'DeliveryStarted',
            route_id: id,
          }),
        },
      ],
    });
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    return this.prisma.route.update({
      where: { id },
      data: updateRouteDto,
    });
  }

  findAll() {
    return this.prisma.route.findMany();
  }

  findOne(id: string) {
    return this.prisma.route.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }
}
