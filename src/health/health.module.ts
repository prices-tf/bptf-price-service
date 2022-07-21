import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { RabbitMQWrapperModule } from '../rabbitmq-wrapper/rabbitmq-wrapper.module';
import { BullModule } from '@nestjs/bullmq';
import { BullHealthIndicator } from './bull.health';

@Module({
  imports: [
    TerminusModule,
    BullModule.registerQueue({
      name: 'prices',
    }),
    RabbitMQWrapperModule,
  ],
  providers: [BullHealthIndicator, RabbitMQHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
