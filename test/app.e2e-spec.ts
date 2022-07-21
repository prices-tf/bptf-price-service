import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    const amqpConnection = app.get(AmqpConnection);
    await amqpConnection.managedConnection.close();
    return app.close();
  });

  it('should be defined', () => {
    return expect(app).toBeDefined();
  });
});
