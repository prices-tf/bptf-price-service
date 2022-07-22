import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'prices',
    }),
  ],
  providers: [QueueService],
  controllers: [QueueController],
})
export class QueueModule {}
