import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import HttpConfigService from './config/http-config.service';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpInterceptor } from './common/http.interceptor';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    TelegramModule,
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: HttpInterceptor }],
})
export class AppModule {}
