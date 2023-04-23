import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateJobDto, CreateRepeatingJobDto } from './dto/create-job.dto';
import { GetPricesDto } from './dto/get-prices.dto';
import { SavePriceDto } from './dto/save-price.dto';
import { Price } from './entities/price.entity';
import { PriceService } from './price.service';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get()
  private paginate(
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    query: GetPricesDto,
  ): Promise<Pagination<Price>> {
    return this.priceService.paginate(
      {
        page: query.page ?? 1,
        limit: query.limit ?? 100,
      },
      query.order,
      query.orderBy,
    );
  }

  @Get('/sku/:sku')
  private async getBySKU(@Param('sku') sku: string): Promise<Price> {
    const price = await this.priceService.getBySKU(sku);
    if (!price) {
      throw new NotFoundException('This item is not priced');
    }

    return price;
  }

  @Post('/sku/:sku/check')
  private async enqueueJob(
    @Param('sku') sku: string,
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    body: CreateJobDto,
  ): Promise<{
    enqueued: boolean;
    state: string;
  }> {
    const result = await this.priceService.createJob(
      sku,
      body.priority,
      body.replace,
    );

    return {
      enqueued: result.enqueued,
      state: result.state,
    };
  }

  @Post('/sku/:sku/repeat')
  private async enqueueRepeatingJob(
    @Param('sku') sku: string,
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    body: CreateRepeatingJobDto,
  ): Promise<void> {
    await this.priceService.createRepeatingJob(
      sku,
      body.interval,
      body.priority,
    );
  }

  @Delete('/sku/:sku/repeat')
  private async removeRepeatingJob(@Param('sku') sku: string): Promise<{
    removed: boolean;
  }> {
    const removed = await this.priceService.removeRepeatingJob(sku);

    return {
      removed,
    };
  }

  @Post()
  private async savePrice(
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    body: SavePriceDto,
  ): Promise<void> {
    await this.priceService.savePrice(body);
  }
}
