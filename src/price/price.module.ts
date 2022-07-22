import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { RabbitMQWrapperModule } from '../rabbitmq-wrapper/rabbitmq-wrapper.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from './entities/price.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Price]),
    BullModule.registerQueue({
      name: 'prices',
    }),
    RabbitMQWrapperModule,
  ],
  providers: [PriceService],
  controllers: [PriceController],
})
export class PriceModule {}
