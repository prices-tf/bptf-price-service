import { Type } from 'class-transformer';
import { IsDefined, IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateRepeatingJobDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  readonly priority?: number;

  @IsDefined()
  @IsInt()
  @IsPositive()
  @Min(60000)
  @Type(() => Number)
  readonly interval: number;
}
