import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { DataSource } from 'typeorm';
import { RepeatableJob } from '../price/entities/repeatable-job.entity';

@Injectable()
export class QueueService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectQueue('prices')
    private readonly queue: Queue,
  ) {}

  getRepeatableJobs(
    options: IPaginationOptions,
  ): Promise<Pagination<RepeatableJob>> {
    return paginate<RepeatableJob>(
      this.dataSource.getRepository(RepeatableJob),
      options,
    );
  }

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
