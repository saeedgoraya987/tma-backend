import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import HttpConfigService from './config/http-config.service';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpInterceptor } from './common/http.interceptor';
import { ReferralModule } from './referral/referral.module';
import { RankingModule } from './ranking/ranking.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    TelegramModule,
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
    ReferralModule,
    RankingModule,
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: HttpInterceptor }],
})
export class AppModule {}
