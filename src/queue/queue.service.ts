import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('prices')
    private readonly queue: Queue,
  ) {}

  getJobCounts(): Promise<any> {
    return this.queue.getJobCounts();
  }

  pause(): Promise<void> {
    return this.queue.pause();
  }

  resume(): Promise<void> {
    return this.queue.resume();
  }

  isPaused(): Promise<boolean> {
    return this.queue.isPaused();
  }
}
