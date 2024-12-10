import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoutesDriverService {
  constructor(private readonly prisma: PrismaService) {}

  processRoute({
    lat,
    lng,
    route_id,
  }: {
    route_id: string;
    lat: number;
    lng: number;
  }) {
    return this.prisma.routeDriver.upsert({
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
  }
}
