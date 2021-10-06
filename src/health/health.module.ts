import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { RabbitMQWrapperModule } from '../rabbitmq-wrapper/rabbitmq-wrapper.module';

@Module({
  imports: [TerminusModule, RabbitMQWrapperModule],
  providers: [RabbitMQHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
