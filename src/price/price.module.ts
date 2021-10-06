import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { RabbitMQWrapperModule } from '../rabbitmq-wrapper/rabbitmq-wrapper.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from './entities/price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price]), RabbitMQWrapperModule],
  providers: [PriceService],
  controllers: [PriceController],
})
export class PriceModule {}
