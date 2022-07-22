import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
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
