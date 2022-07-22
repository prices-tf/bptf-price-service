import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Queue, RepeatOptions } from 'bullmq';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { SavePriceDto } from './dto/save-price.dto';
import { Price } from './entities/price.entity';
import { JobsOptions } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueData } from './interfaces/queue.interface';
import { RepeatableJob } from './entities/repeatable-job.entity';

@Injectable()
export class PriceService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly dataSource: DataSource,
    @InjectQueue('prices')
    private readonly queue: Queue<QueueData>,
  ) {}

  getBySKU(sku: string): Promise<Price> {
    return this.dataSource.getRepository(Price).findOne({
      where: {
        sku,
      },
    });
  }

  paginate(
    options: IPaginationOptions,
    order?: 'ASC' | 'DESC',
  ): Promise<Pagination<Price>> {
    return paginate<Price>(this.dataSource.getRepository(Price), options, {
      order: {
        updatedAt: order,
      },
    });
  }

  async createRepeatingJob(
    sku: string,
    every: number,
    priority?: number,
  ): Promise<void> {
    const jobName = sku;

    const data: QueueData = {
      sku,
    };

    const repeatOptions: RepeatOptions = {
      every,
    };

    const options: JobsOptions = {
      priority,
      repeat: repeatOptions,
      removeOnComplete: true,
      removeOnFail: true,
    };

    await this.dataSource
      .getRepository(RepeatableJob)
      .insert({
        name: jobName,
        options: repeatOptions,
      })
      .catch((err) => {
        if (err.code == 23505) {
          throw new ConflictException('Job already exists');
        }

        throw err;
      });

    const job = await this.queue.add(jobName, data, options);

    await this.dataSource.getRepository(RepeatableJob).update(jobName, {
      jobId: job.id,
    });
  }

  async removeRepeatingJob(sku: string): Promise<boolean> {
    // Get job by sku
    const job = await this.getRepeatingJob(sku);

    if (!job) {
      // Job does not exist
      return false;
    }

    // Remove repeatable job
    const removed = this.queue.removeRepeatable(job.name, job.options);

    if (job.jobId !== null) {
      // Remove job created by repeatable job
      await this.queue.remove(job.jobId);
    }

    // Remove job from database
    await this.dataSource.getRepository(RepeatableJob).delete(job.name);

    return removed;
  }

  private getRepeatingJob(sku: string): Promise<RepeatableJob> {
    return this.dataSource.getRepository(RepeatableJob).findOne({
      where: {
        name: sku,
      },
    });
  }

  async savePrice(data: SavePriceDto): Promise<Price> {
    const buyValue =
      data.buyHalfScrap + data.buyKeys * (data.buyKeyHalfScrap ?? 0);
    const sellValue =
      data.sellHalfScrap + data.sellKeys * (data.sellKeyHalfScrap ?? 0);

    if (buyValue >= sellValue) {
      throw new BadRequestException(
        'Buy price is higher than or equal to the sell price',
      );
    }

    const price = this.dataSource.getRepository(Price).create({
      sku: data.sku,
      buyHalfScrap: data.buyHalfScrap,
      buyKeys: data.buyKeys,
      buyKeyHalfScrap: data.buyKeyHalfScrap ?? null,
      sellHalfScrap: data.sellHalfScrap,
      sellKeys: data.sellKeys,
      sellKeyHalfScrap: data.sellKeyHalfScrap ?? null,
      updatedAt: data.updatedAt,
      createdAt: data.updatedAt,
    });

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const match = await transactionalEntityManager.findOne(Price, {
        where: {
          sku: data.sku,
          updatedAt: MoreThanOrEqual(data.updatedAt),
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (match !== null) {
        throw new ConflictException(
          'The price has already been saved or a newer price exists',
        );
      }

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Price)
        .values(price)
        .orUpdate(
          [
            'buyHalfScrap',
            'buyKeys',
            'buyKeyHalfScrap',
            'sellHalfScrap',
            'sellKeys',
            'sellKeyHalfScrap',
            'updatedAt',
          ],
          ['sku'],
        )
        .execute();
    });

    await this.amqpConnection.publish('bptf-price.updated', '*', price);

    return price;
  }
}
