import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { PrismaService } from '@prisma';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}
