import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { RoutesDriverService } from './routes-driver/routes-driver.service';

@Controller('routes')
export class RoutesController {
  constructor(
    private readonly routesService: RoutesService,
    private readonly routesDriverService: RoutesDriverService,
  ) {}

  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Post(':id/process-route')
  processRoute(
    @Param('id') id: string,
    @Body() { lat, lng }: { lat: number; lng: number },
  ) {
    return this.routesDriverService.processRoute({
      route_id: id,
      lat,
      lng,
    });
  }

  @Post(':id/start')
  startRoute(@Param('id') id: string) {
    return this.routesService.startRoute(id);
  }

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }
}
