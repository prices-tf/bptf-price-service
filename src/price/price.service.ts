import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Connection, MoreThanOrEqual, Repository } from 'typeorm';
import { SavePriceDto } from './dto/save-price.dto';
import { Price } from './entities/price.entity';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private readonly repository: Repository<Price>,
    private readonly amqpConnection: AmqpConnection,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  getBySKU(sku: string): Promise<Price> {
    return this.repository.findOne({
      where: {
        sku,
      },
    });
  }

  paginate(
    options: IPaginationOptions,
    order?: 'ASC' | 'DESC',
  ): Promise<Pagination<Price>> {
    return paginate<Price>(this.repository, options, {
      order: {
        updatedAt: order,
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

    const price = this.repository.create({
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

    await this.connection.transaction(async (transactionalEntityManager) => {
      const match = await transactionalEntityManager.findOne(Price, {
        where: {
          sku: data.sku,
          updatedAt: MoreThanOrEqual(data.updatedAt),
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (match !== undefined) {
        throw new ConflictException(
          'The price has already been saved or a newer price exists',
        );
      }

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Price)
        .values(price)
        .onConflict(
          `("sku") DO UPDATE SET
              "buyHalfScrap" = EXCLUDED."buyHalfScrap",
              "buyKeys" = EXCLUDED."buyKeys",
              "buyKeyHalfScrap" = EXCLUDED."buyKeyHalfScrap",
              "sellHalfScrap" = EXCLUDED."sellHalfScrap",
              "sellKeys" = EXCLUDED."sellKeys",
              "sellKeyHalfScrap" = EXCLUDED."sellKeyHalfScrap",
              "updatedAt" = EXCLUDED."updatedAt"
          `,
        )
        .execute();
    });

    await this.amqpConnection.publish('bptf-price.updated', '*', price);

    return price;
  }
}
