import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RepeatableJob } from '../price/entities/repeatable-job.entity';
import { GetRepeatableJobsDto } from './dto/get-repeatable-jobs.dto';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('/repeatable')
  private getRepeatable(
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    query: GetRepeatableJobsDto,
  ): Promise<Pagination<RepeatableJob>> {
    return this.queueService.getRepeatableJobs({
      page: query.page ?? 1,
      limit: query.limit ?? 100,
      countQueries: false,
    });
  }

  @Get()
  private getJobCounts(): Promise<any> {
    return this.queueService.getJobCounts();
  }

  @Get('paused')
  private async paused(): Promise<{
    paused: boolean;
  }> {
    const paused = await this.queueService.isPaused();
    return {
      paused,
    };
  }

  @Post('pause')
  @HttpCode(200)
  private pause(): Promise<void> {
    return this.queueService.pause();
  }

  @Post('resume')
  @HttpCode(200)
  private resume(): Promise<void> {
    return this.queueService.resume();
  }
}
