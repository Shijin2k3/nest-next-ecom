import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma';
import { hashPassword, verifyPassword } from '@helper';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { password, ...rest } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { emailId: dto?.emailId },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hashPassword(password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { ...rest, password: hashedPassword },
      select: {
        userId: true,
        emailId: true,
        firstName: true,
        lastName: true,
        role: true,
        password: false,
      },
    });

    const tokens = await this.generateTokens(user?.emailId, user?.userId);
    await this.updateRefreshToken(user?.userId, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        emailId: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const tokens = await this.generateTokens(user?.emailId, user?.userId);
    await this.updateRefreshToken(user?.userId, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  async logout(userId: string) {
    await this.validateUser(userId);
    await this.prisma.user.update({
      where: { userId },
      data: { refreshToken: null },
    });

    return { message: 'Successfully Logged Out' };
  }

  private async generateTokens(emailId: string, userId: string) {
    const payload = { sub: userId, emailId };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync({ payload, refreshId }, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      this.SALT_ROUNDS,
    );
    await this.prisma.user.update({
      where: { userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { emailId: dto.emailId },
    });

    const isPasswordValid = await verifyPassword(dto.password, user?.password!);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const tokens = await this.generateTokens(user?.emailId, user?.userId);
    await this.updateRefreshToken(user?.userId, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user?.userId,
        emailId: user?.emailId,
        firstName: user?.firstName,
        lastName: user?.lastName,
        role: user?.role,
      },
    };
  }

  private async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        userId,
      },
    });

    if (!userId) {
      throw new BadRequestException('User does not exist');
    }
  }
}
