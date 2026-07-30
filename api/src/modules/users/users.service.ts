import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { ChangePasswordDto } from './dto';
import { hashPassword, verifyPassword } from '@helper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        emailId: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return user;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        userId: true,
        emailId: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!users) {
      throw new BadRequestException('User does not exist');
    }
    return users;
  }

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        emailId: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return user;
  }

  async updateMyProfile(userId: string, updateUserDto: any) {
    const existingUser = await this.validateUser(userId);

    if (
      updateUserDto.emailId &&
      updateUserDto.emailId !== existingUser.emailId
    ) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { emailId: updateUserDto.emailId },
      });
      if (existingEmail) {
        throw new BadRequestException('User with this Email already exists');
      }
    }
    const updatedUser = await this.prisma.user.update({
      where: { userId },
      data: updateUserDto,
      select: {
        userId: true,
        emailId: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updatedUser;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const existingUser = await this.validateUser(userId);

    const isPasswordValid = await verifyPassword(
      dto.currentPassword,
      existingUser?.password!,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current Password is incorrect');
    }

    const isSamePassword = await verifyPassword(
      dto.newPassword,
      existingUser?.password!,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New Password cannot be same as current password',
      );
    }

    const hashedPassword = await hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { userId },
      data: { password: hashedPassword },
      select: {
        userId: true,
        emailId: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { message: 'Password changed successfully' };
  }

  async delete(userId: string) {
    await this.validateUser(userId);
    await this.prisma.user.delete({ where: { userId } });
    return { message: 'User deleted successfully' };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    return user;
  }
}
