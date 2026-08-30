import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma';
import { CreateProductDto, QueryProductDto, UpdateProductDto } from './dto';
import { category, Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: dto?.sku },
    });
    if (existingSku) {
      throw new ConflictException('Product with this sku already exists');
    }

    const { category, ...rest } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(dto.price),
        isActive:
          dto?.isActive === undefined ? undefined : dto?.isActive.valueOf(),
        categoryId: category!,
      },
      include: { category: true },
    });

    return this.formatProduct(product);
  }

  async findAll(dto: QueryProductDto) {
    const { category, isActive, search, page = 1, limit = 10 } = dto;
    const where: Prisma.ProductWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const total = await this.prisma.product.count({ where });
    const products = await this.prisma.product.findMany({
      where,
      skip: page - 1,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    });

    return {
      data: products.map((product) => this.formatProduct(product)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: id },
      include: { category: true },
    });
    if (!product) throw new BadRequestException('Product not found');
    return this.formatProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id: id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (dto?.sku && dto?.sku !== existingProduct.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: dto?.sku },
      });

      if (existingSku) {
        throw new ConflictException('Product with this sku already exists');
      }
    }

    const updateData: any = { ...dto };

    if (dto?.price !== undefined) {
      updateData.price = new Prisma.Decimal(dto.price);
    }

    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive.valueOf();
    }

    if (dto.category !== undefined) {
      updateData.category = dto.category;
    }

    const updateProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return this.formatProduct(updateProduct);
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }
    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
      include: {
        category: true,
      },
    });
    return this.formatProduct(updatedProduct);
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        cartItems: true,
      },
    });

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }

    if (product?.orderItems?.length > 0 || product?.cartItems?.length > 0) {
      throw new BadRequestException('Product is associated with order or cart');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }

  private formatProduct(product: Product & { category: category }) {
    return {
      ...product,
      price: product.price ? Number(product.price) : 0,
      category: product?.category,
    };
  }
}
