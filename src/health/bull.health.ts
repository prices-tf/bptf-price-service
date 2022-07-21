import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { Queue } from 'bullmq';

@Injectable()
export class BullHealthIndicator extends HealthIndicator {
  constructor(
    @InjectQueue('prices')
    private readonly queue: Queue,
  ) {
    super();
  }

  isHealthy(key: string): Promise<HealthIndicatorResult> {
    return this.queue.client
      .then((redis) => {
        return redis.ping();
      })
      .then(() => {
        return this.getStatus(key, true);
      })
      .catch((err) => {
        throw new HealthCheckError(
          'Bull check failed',
          this.getStatus(key, false, { message: err.message }),
        );
      });
  }
}
