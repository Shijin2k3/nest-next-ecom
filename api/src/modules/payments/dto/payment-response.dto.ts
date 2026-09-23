import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    example: 'pay_23',
  })
  id: string;

  @ApiProperty({
    example: 1000,
  })
  amount: number;

  @ApiProperty({
    example: 'order_23',
  })
  orderId: string;

  @ApiProperty({
    example: 'user_23',
  })
  userId: string;

  @ApiProperty({
    example: 'usd',
  })
  currency: string;

  @ApiProperty({
    example: 'COMPLETED',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
  })
  status: string;

  @ApiProperty({
    example: 'card',
  })
  paymentMethod: string | null;

  @ApiProperty({
    example: 'txn_3243',
  })
  transactionId: string | null;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CreatePaymentIntentResponse {
  @ApiProperty({
    example: 'pi_3243',
  })
  clientSecret: string;

  @ApiProperty()
  paymentId: string;
}

export class CreatePaymentIntentApiResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({
    type: CreatePaymentIntentResponse,
  })
  data: CreatePaymentIntentResponse;

  @ApiProperty({
    example: 'Payment intent created successfully',
  })
  message?: string;
}
