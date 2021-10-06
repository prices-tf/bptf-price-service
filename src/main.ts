import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Config } from './common/config/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService<Config> = app.get(ConfigService);

  app.enableShutdownHooks();

  await app.listen(configService.get<number>('port'));
}
bootstrap();
