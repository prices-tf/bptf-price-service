import { Type } from 'class-transformer';
import { IsDate, IsInt, IsString, Min, Max, ValidateIf } from 'class-validator';

export class SavePriceDto {
  @IsString()
  readonly sku: string;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  readonly buyHalfScrap: number;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  readonly buyKeys: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  @ValidateIf((o) => o.sku !== '5021;6')
  readonly buyKeyHalfScrap: number;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  readonly sellHalfScrap: number;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  readonly sellKeys: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  @ValidateIf((o) => o.sku !== '5021;6')
  readonly sellKeyHalfScrap: number;

  @IsDate()
  @Type(() => Date)
  readonly updatedAt: Date;
}
