import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard, RoleGuard, Roles } from '@common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateProductDto, QueryProductDto, UpdateProductDto } from './dto';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden -Admin Role Required' })
  @ApiResponse({ status: 409, description: 'Sku already exists' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'get all products with optional filters',
    description: 'Get list of all products with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products with Pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Product' },
        },
        meta: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
            },
            limit: {
              type: 'number',
            },
            total: {
              type: 'number',
            },
            totalPages: {
              type: 'number',
            },
          },
        },
      },
    },
  })
  findAll(@Query() dto: QueryProductDto) {
    return this.productsService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Product by Id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'update Products',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'conflict - Sku already exists',
  })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update Product stock adminOnly',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'Stock adjustment',
          example: 10,
        },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product stock updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden -Admin Role Required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'In sufficient stock' })
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'delete product',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
