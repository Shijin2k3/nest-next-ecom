import { GetUser, JwtAuthGuard, RoleGuard } from '@common';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentResponse } from './dto/payment-response.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({
    summary: 'Create payment intent',
    description: 'Create payment intent for a payment',
  })
  @ApiCreatedResponse({
    description: 'Payment intent created successfully',
    type: CreatePaymentIntentResponse,
  })
  @ApiBadRequestResponse({
    description: 'invalid data or order not found',
  })
  createPaymentIntent(
    @Body() paymentIntentDto: CreatePaymentIntentDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.createPaymentIntent(userId, paymentIntentDto);
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm payment',
    description: 'Confirm payment for a payment',
  })
  @ApiCreatedResponse({
    description: 'Payment confirmed successfully',
    type: CreatePaymentIntentResponse,
  })
  @ApiBadRequestResponse({
    description: 'invalid data or order not found',
  })
  confirmPayment(
    @Body() confirmPaymentDto: ConfirmPaymentDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.confirmPayment(userId, confirmPaymentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all payments',
    description: 'Get all payments for current user',
  })
  @ApiOkResponse({
    description: 'Payment details fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'invalid data',
  })
  findAll(@GetUser('id') userId: string) {
    return this.paymentsService.findAll(userId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'Payment id',
    required: true,
  })
  @ApiOkResponse({
    description: 'Payment details fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'invalid data',
  })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.paymentsService.findOne(id, userId);
  }

  @Get('order/:orderId')
  @ApiParam({
    name: 'orderId',
    description: 'Order id',
    example: 'order-123',
  })
  @ApiOperation({
    summary: 'Get payment by order id',
    description: 'Get payment by order id',
  })
  @ApiOkResponse({
    description: 'Payment details fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'invalid data',
  })
  findByOrderId(
    @Param('orderId') orderId: string,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.findByOrderId(orderId, userId);
  }
}
