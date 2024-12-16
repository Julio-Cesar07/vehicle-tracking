import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoutesService } from '../routes.service';
import { DirectionsResponseData } from '@googlemaps/google-maps-services-js';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoutesDriverGateway {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(RoutesDriverGateway.name);

  constructor(private readonly routesService: RoutesService) {}

  @SubscribeMessage('client:new-points')
  async handleMessage(client: Socket, payload: { route_id: string }) {
    const { route_id } = payload;

    if (typeof route_id !== 'string') return;

    const route = await this.routesService.findOne(route_id);
    const directions = route.directions.valueOf() as DirectionsResponseData;

    if (typeof directions !== 'object') return;

    const { steps } = directions.routes[0].legs[0];

    for (const step of steps) {
      const { lat, lng } = step.start_location;
      emitEvent({
        client,
        lat,
        lng,
        name: `server:new-points/${route_id}:list`,
        route_id,
        broadcast: false,
      });
      emitEvent({
        client,
        lat,
        lng,
        name: 'server:new-points:list',
        route_id,
        broadcast: true,
      });

      await sleep(2000);

      const { lat: lat2, lng: lng2 } = step.end_location;
      emitEvent({
        client,
        lat: lat2,
        lng: lng2,
        name: `server:new-points/${route_id}:list`,
        route_id,
        broadcast: false,
      });
      emitEvent({
        client,
        lat: lat2,
        lng: lng2,
        name: 'server:new-points:list',
        route_id,
        broadcast: true,
      });

      await sleep(2000);
    }
  }

  emitNewPoints(payload: { route_id: string; lat: number; lng: number }) {
    this.logger.log(
      `Emitting new points for route ${payload.route_id} - ${payload.lat}, ${payload.lng}`,
    );
    this.server.emit(`server:new-points/${payload.route_id}:list`, {
      route_id: payload.route_id,
      lat: payload.lat,
      lng: payload.lng,
    });
    this.server.emit('server:new-points:list', {
      route_id: payload.route_id,
      lat: payload.lat,
      lng: payload.lng,
    });
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface EmitEventProps {
  client: Socket;
  name: string;
  route_id: string;
  lat: number;
  lng: number;
  broadcast: boolean;
}

function emitEvent({
  client,
  lat,
  lng,
  name,
  route_id,
  broadcast = false,
}: EmitEventProps) {
  if (broadcast) {
    client.broadcast.emit(name, {
      route_id,
      lat,
      lng,
    });
    return;
  }

  client.emit(name, {
    route_id,
    lat,
    lng,
  });
}
