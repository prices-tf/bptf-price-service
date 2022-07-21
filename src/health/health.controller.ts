import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { BullHealthIndicator } from './bull.health';
import { RabbitMQHealthIndicator } from './rabbitmq.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private rabbitmqHealthIndicator: RabbitMQHealthIndicator,
    private bullHealthIndicator: BullHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.rabbitmqHealthIndicator.isHealthy('rabbitmq'),
      () => this.bullHealthIndicator.isHealthy('queue'),
    ]);
  }
}
