import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@prisma/prisma.service';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; emailId: string }) {
    console.log('refresh token strategy. validate called');
    console.log('payload', { sub: payload.sub, emailId: payload.emailId });
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization found in header');
      throw new UnauthorizedException('Refresh Token not provided');
    }
    const refreshToken = authHeader.replace('Bearer ', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token Empty After Extraction');
    }

    const user = await this.prisma.user.findUnique({
      where: { userId: payload.sub },
      select: {
        userId: true,
        emailId: true,
        firstName: true,
        lastName: true,
        role: true,
        refreshToken: true,
      },
    });

    if (!user || !user?.refreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
  }
}
