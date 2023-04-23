import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

enum OrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

enum OrderByEnum {
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export class GetPricesDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  readonly page: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  readonly limit: number;

  @IsOptional()
  @IsEnum(OrderEnum)
  readonly order: OrderEnum;

  @IsOptional()
  @IsEnum(OrderByEnum)
  readonly orderBy: OrderByEnum = OrderByEnum.updatedAt;
}
