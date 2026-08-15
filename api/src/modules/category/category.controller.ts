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
import { CategoryService } from './category.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, RoleGuard, Roles } from '@common';
import { Role } from '@prisma/client';
import { CreateCategoryDto, QueryCategoryDto, UpdateCategoryDto } from './dto';

@ApiTags('Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new  category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid Input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized ' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Category' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized ' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() queryDto: QueryCategoryDto) {
    return this.categoryService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully',
    schema: {
      $ref: '#/components/schemas/Category',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized ' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a category by slug' })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully',
    schema: {
      $ref: '#/components/schemas/Category',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized ' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOneBySlug(@Param('slug') slug: string) {
    return this.categoryService.findOneBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a category by id' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid Input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized ' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a category by id' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized ' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
