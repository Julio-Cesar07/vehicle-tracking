import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoutesDriverGateway } from './routes-driver.gateway';

@Injectable()
export class RoutesDriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly routesGateway: RoutesDriverGateway,
  ) {}

  async processRoute({
    lat,
    lng,
    route_id,
  }: {
    route_id: string;
    lat: number;
    lng: number;
  }) {
    const routeDriver = await this.prisma.routeDriver.upsert({
      include: {
        route: true,
      },
      where: {
        route_id,
      },
      create: {
        route_id,
        points: {
          set: {
            location: {
              lat,
              lng,
            },
          },
        },
      },
      update: {
        points: {
          push: {
            location: {
              lat,
              lng,
            },
          },
        },
      },
    });

    this.routesGateway.emitNewPoints({
      route_id,
      lat,
      lng,
    });

    return routeDriver;
  }
}
