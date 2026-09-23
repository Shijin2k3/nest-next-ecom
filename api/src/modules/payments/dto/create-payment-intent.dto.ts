import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    example: 'order_23',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'usd',
  })
  @IsOptional()
  @IsString()
  currency: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
