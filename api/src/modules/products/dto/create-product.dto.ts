import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty()
  price!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty()
  stock!: number;

  @ApiProperty({ description: 'Stock keeping unit' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
