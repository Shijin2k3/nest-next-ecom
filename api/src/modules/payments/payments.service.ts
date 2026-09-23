import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import Stripe from 'stripe';
import { OrderStatus, Payment, PaymentStatus } from '@prisma/client';
import { ConfirmPaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET!, {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  async createPaymentIntent(
    userId: string,
    paymentIntentDto: CreatePaymentIntentDto,
  ) {
    const { amount, currency = 'usd', orderId } = paymentIntentDto;

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order does not exist');
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId },
    });
    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Payment already exists for this order. Try to check status instead?',
      );
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        orderId,
        userId,
      },
    });

    const payment = await this.prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        userId,
        amount: Math.round(amount * 100),
        currency,
        status: PaymentStatus.PENDING,
        paymentMethod: 'STRIPE',
        transactionId: paymentIntent.id,
      },
      update: {
        amount: Math.round(amount * 100),
        currency,
        transactionId: paymentIntent.id,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      },
      message: 'Payment Intent Created Sucessfully',
    };
  }

  async confirmPayment(userId: string, confirmPaymentDto: ConfirmPaymentDto) {
    const { paymentIntentId, orderId } = confirmPaymentDto;

    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        userId,
        transactionId: paymentIntentId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already completed');
    }

    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not succeeded');
    }

    const [updatedPayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PROCESSING,
        },
      }),
    ]);
    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
    });

    if (order?.cartId) {
      await this.prisma.cart.update({
        where: { id: order.cartId },
        data: { checkedOut: true },
      });
    }

    return {
      success: true,
      data: this.mapToPaymentResponse(updatedPayment),
      message: 'Payment Confirmed Sucessfully',
    };
  }

  async findAll(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      data: payments.map((payment) => this.mapToPaymentResponse(payment)),
      message: 'Payments fetched successfully',
    };
  }

  async findOne(id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, userId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return {
      success: true,
      data: this.mapToPaymentResponse(payment),
    };
  }

  async findByOrderId(orderId: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId, userId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return {
      success: true,
      data: this.mapToPaymentResponse(payment),
    };
  }

  private mapToPaymentResponse(payment: Payment) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount.toNumber(),
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
