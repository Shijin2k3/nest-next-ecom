import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
