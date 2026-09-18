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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  GetUser,
  JwtAuthGuard,
  ModerateThrottle,
  RoleGuard,
  Roles,
} from '@common';
import { CreateOrderDto, QueryOrderDto, UpdateOrderDto } from './dto';
import { Role } from '@prisma/client';

@Controller('orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Create a new order ',
  })
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or inSufficient stocks',
  })
  @ApiNotFoundResponse({
    description: 'Cart not found  or empty8',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many request - rate limit exceeded',
  })
  async create(@Body() dto: CreateOrderDto, @GetUser('id') userId: string) {
    return this.orderService.create(userId, dto);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  //@RelaxedThrottle()
  @ApiOperation({
    summary: '[ADMIN] Fetch all orders',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'filter orders by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Orders fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Orders' },
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
  findAllForAdmin(@Query() queryOrderDto: QueryOrderDto) {
    return this.orderService.findAllForAdmin(queryOrderDto);
  }

  @Get()
  //@RelaxThrottle()
  @ApiOperation({
    summary: 'Fetch orders for user  ',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'filter orders by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Orders fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Orders' },
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
  findAllForUser(
    @Query() queryOrderDto: QueryOrderDto,
    @GetUser('id') userId: string,
  ) {
    return this.orderService.findAllForUser(userId, queryOrderDto);
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Fetch order by id ',
  })
  @ApiResponse({
    status: 200,
    description: 'Order fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Orders' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized ' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Fetch order by id ',
  })
  @ApiResponse({
    status: 200,
    description: 'Order fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Orders' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized ' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  findOneForUser(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.orderService.findOne(id, userId);
  }

  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[ADMIN]update  order status',
  })
  @ApiResponse({
    status: 200,
    description: 'order updated successfully',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update order',
  })
  @ApiResponse({
    status: 200,
    description: 'order updated successfully',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  updateForUser(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return this.orderService.update(id, dto, userId);
  }

  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[ADMIN]Delete order',
  })
  @ApiResponse({
    status: 200,
    description: 'order deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '[user]Delete order',
  })
  @ApiResponse({
    status: 200,
    description: 'order deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  cancelByUser(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.orderService.cancel(id, userId);
  }
}
