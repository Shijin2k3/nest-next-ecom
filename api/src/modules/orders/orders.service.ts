import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma';
import { CreateOrderDto, QueryOrderDto, UpdateOrderDto } from './dto';
import {
  Order,
  OrderItem,
  OrderStatus,
  Prisma,
  Product,
  Role,
} from '@prisma/client';

type OrderUser = {
  userId?: string;
  firstName?: string | null;
  lastName?: string | null;
  emailId?: string;
  role?: Role;
};

type OrderWithDetails = Order & {
  orderItems: (OrderItem & { product: Product })[];
  user?: OrderUser | null;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const { items, shippingAddress } = dto;

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient Stock for product:${product.name} 
          Available Stock: ${product.stock} 
          Requested: ${item.quantity}`,
        );
      }
    }

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const latestCart = await this.prisma.cart.findFirst({
      where: { userId, checkedOut: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!latestCart) {
      throw new NotFoundException('No active cart found');
    }
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount: total,
          shippingAddress: shippingAddress,
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item?.quantity,
              price: item?.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      for (const item of items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });
    return this.wrap(order);
  }

  async findAllForAdmin(query: QueryOrderDto) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    if (search)
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { orderNumber: { contains: search, mode: 'insensitive' } },
      ];

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              emailId: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      data: orders.map((order) => this.map(order)),

      page,
      limit,
      total,
    };
  }

  async findAllForUser(userId: string, query: QueryOrderDto) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    if (search)
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { orderNumber: { contains: search, mode: 'insensitive' } },
      ];

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              emailId: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      data: orders.map((order) => this.map(order)),

      page,
      limit,
      total,
    };
  }

  async findOne(id: string, userId?: string) {
    const where: Prisma.OrderWhereUniqueInput = { id };
    if (userId) {
      where.userId = userId;
    }
    const order = await this.prisma.order.findUnique({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            emailId: true,
            role: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.wrap(order);
  }
  async update(id: string, dto: UpdateOrderDto, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    const existing = await this.prisma.order.findFirst({
      where,
    });
    if (!existing) {
      throw new NotFoundException('order not found');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: dto,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            emailId: true,
            role: true,
          },
        },
      },
    });

    return this.wrap(updated);
  }

  async cancel(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    const existing = await this.prisma.order.findFirst({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('order not found');
    }
    if (existing.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be canceled');
    }

    const cancel = await this.prisma.$transaction(async (tx) => {
      for (const item of existing.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELED },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              emailId: true,
              role: true,
            },
          },
        },
      });
    });
    return this.wrap(cancel);
  }

  private wrap(order: OrderWithDetails) {
    return {
      success: true,
      message: 'Order retreived successfully',
      data: this.map(order),
    };
  }

  private map(order: OrderWithDetails) {
    return {
      id: order?.id,
      status: order?.status,
      total: Number(order.totalAmount),
      shippingAddress: order?.shippingAddress ?? '',
      items: order.orderItems.map((item) => ({
        id: item?.id,
        productId: item?.productId,
        productName: item?.product?.name,
        quantity: item?.quantity,
        price: Number(item?.price),
        subTotal: item?.quantity * Number(item?.price),
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
      })),
      createdAt: order?.createdAt,
      updatedAt: order?.updatedAt,
      userId: order?.userId,
      ...(order.user && {
        userEmail: order.user?.emailId,
        userName:
          `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
        userRole: order.user?.role,
      }),
    };
  }
}
