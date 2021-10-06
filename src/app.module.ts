import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { DatabaseConfig } from './common/config/configuration';
import { validation } from './common/config/validation';
import { HealthModule } from './health/health.module';
import { RabbitMQWrapperModule } from './rabbitmq-wrapper/rabbitmq-wrapper.module';
import { PriceModule } from './price/price.module';
import { Price } from './price/entities/price.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: process.env.NODE_ENV === 'test' ? '.test.env' : '.env',
      load: [configuration],
      validationSchema: validation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseConfig = configService.get<DatabaseConfig>('database');

        return {
          type: 'postgres',
          host: databaseConfig.host,
          port: databaseConfig.port,
          username: databaseConfig.username,
          password: databaseConfig.password,
          database: databaseConfig.database,
          entities: [Price],
          autoLoadModels: true,
          synchronize: process.env.TYPEORM_SYNCRONIZE === 'true',
          keepConnectionAlive: true,
        };
      },
    }),
    RabbitMQWrapperModule,
    HealthModule,
    PriceModule,
  ],
})
export class AppModule {}
