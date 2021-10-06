import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  constructor(private readonly amqpConnection: AmqpConnection) {
    super();
  }

  isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.amqpConnection.managedConnection) {
      // This should not be possible / highly unlikely
      throw new HealthCheckError(
        'RabbitMQ check failed',
        this.getStatus(key, false, { message: 'Not yet connected' }),
      );
    }

    if (this.amqpConnection.managedConnection.isConnected()) {
      return Promise.resolve(this.getStatus(key, true));
    } else {
      throw new HealthCheckError(
        'RabbitMQ check failed',
        this.getStatus(key, false, { message: 'Not connected' }),
      );
    }
  }
}
