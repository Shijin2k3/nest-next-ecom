import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@prisma';
import { CreateCategoryDto, QueryCategoryDto, UpdateCategoryDto } from './dto';
import { category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const { name, slug, isActive, ...rest } = dto;

    const categorySlug =
      slug ??
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        isActive: isActive === undefined ? undefined : isActive.valueOf(),
        slug: categorySlug,
        ...rest,
      },
    });
    return this.formatCategory(category, 0);
  }

  async findAll(dto: QueryCategoryDto) {
    const { isActive, search, page = 1, limit = 10 } = dto;
    const where: Prisma.categoryWhereInput = {};

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

    const total = await this.prisma.category.count({
      where,
    });

    const categories = await this.prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return {
      data: categories.map((category) =>
        this.formatCategory(category, category._count.products),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.formatCategory(category, category._count.products);
  }

  async findOneBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.formatCategory(category, category._count.products);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existingSlug = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        isActive:
          dto?.isActive === undefined ? undefined : dto?.isActive.valueOf(),
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return this.formatCategory(
      updatedCategory,
      updatedCategory._count.products,
    );
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        'Category cannot be deleted because it has products',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  private formatCategory(category: category, productCount: number) {
    return {
      id: category.id,
      name: category.name,
      description: category?.description ?? null,
      slug: category?.slug ?? null,
      isActive: category.isActive,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
