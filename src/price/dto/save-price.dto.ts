import { Type } from 'class-transformer';
import { IsDate, IsInt, IsString, Min, ValidateIf } from 'class-validator';

export class SavePriceDto {
  @IsString()
  readonly sku: string;

  @IsInt()
  @Min(0)
  readonly buyHalfScrap: number;

  @IsInt()
  @Min(0)
  readonly buyKeys: number;

  @IsInt()
  @Min(1)
  @ValidateIf((o) => o.sku !== '5021;6')
  readonly buyKeyHalfScrap: number;

  @IsInt()
  @Min(0)
  readonly sellHalfScrap: number;

  @IsInt()
  @Min(0)
  readonly sellKeys: number;

  @IsInt()
  @Min(1)
  @ValidateIf((o) => o.sku !== '5021;6')
  readonly sellKeyHalfScrap: number;

  @IsDate()
  @Type(() => Date)
  readonly updatedAt: Date;
}
