import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  type RequestWithUser,
  RoleGuard,
  Roles,
} from 'src/common';
import { ChangePasswordDto, UpdateUserDto } from './dto';

@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('myProfile')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({ status: 200, description: 'Get current user profile' })
  getMyProfile(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.userService.getMyProfile(userId);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Get all users' })
  @ApiResponse({ status: 400, description: 'User does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Get user by id' })
  @ApiResponse({ status: 400, description: 'User does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserById(@Param('userId') userId: string) {
    return this.userService.findOne(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  @ApiResponse({ status: 400, description: 'User does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  updateMyProfile(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateMyProfile(userId, updateUserDto);
  }

  @Patch('me/password/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update my password' })
  @ApiResponse({ status: 200, description: 'Updated password Successfully' })
  @ApiResponse({ status: 400, description: 'User does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  changePassword(
    @Param('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, dto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete my profile' })
  @ApiResponse({ status: 200, description: 'Deleted user profile' })
  @ApiResponse({ status: 400, description: 'User does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  deleteMyProfile(@Param('userId') userId: string) {
    return this.userService.delete(userId);
  }

  @Delete('admin/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({ status: 200, description: 'Deleted user profile' })
  @ApiResponse({ status: 400, description: 'User does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  delete(@Param('userId') userId: string) {
    return this.userService.delete(userId);
  }
}
