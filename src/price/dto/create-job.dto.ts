import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

class BaseJobDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(Number.MAX_SAFE_INTEGER)
  priority?: number;
}

export class CreateJobDto extends BaseJobDto {
  @IsOptional()
  @IsBoolean()
  replace?: boolean;
}

export class CreateRepeatingJobDto extends BaseJobDto {
  @IsDefined()
  @IsInt()
  @IsPositive()
  @Min(60000)
  @Type(() => Number)
  readonly interval: number;
}
